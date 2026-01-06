from __future__ import annotations

import re
from pathlib import Path
import numpy as np
import pandas as pd


# ----------------------------
# Paths
# ----------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]  # hepacheck_starter
DATA_DIR = PROJECT_ROOT / "data"
OUT_DIR = PROJECT_ROOT / "validation" / "results"
OUT_DIR.mkdir(parents=True, exist_ok=True)


# ----------------------------
# Constants
# ----------------------------
AST_ULN = 40  # APRI American reference ULN
NA_VALUES = ["NA", "N/A", "na", "n/a", "no data", "No data", "NULL", "null", "None", "none", ""]


# ----------------------------
# Normalization & matching
# ----------------------------
def norm(s: str) -> str:
    s = str(s).strip().lower()
    s = s.replace("(", " ").replace(")", " ")
    s = re.sub(r"[%\-/_,]", " ", s)  # treat separators similarly
    s = re.sub(r"\s+", " ", s).strip()
    return s


def pick_col(df: pd.DataFrame, aliases: list[str], required: bool = True) -> str | None:
    cols = list(df.columns)
    cols_norm = {c: norm(c) for c in cols}
    alias_norm = [norm(a) for a in aliases]

    # exact normalized match
    for c in cols:
        if cols_norm[c] in alias_norm:
            return c

    # contains match
    for c in cols:
        if any(a in cols_norm[c] for a in alias_norm):
            return c

    if required:
        raise KeyError(
            f"Missing required column.\nTried aliases: {aliases}\nAvailable columns: {list(df.columns)}"
        )
    return None


def to_num(s: pd.Series) -> pd.Series:
    return pd.to_numeric(s, errors="coerce")


def diabetes_to_01(s: pd.Series) -> pd.Series:
    if s.dtype.kind in "biufc":
        x = pd.to_numeric(s, errors="coerce")
        return (x > 0).astype("float")  # keep float for NaNs
    txt = s.astype(str).str.strip().str.lower()
    mapping = {
        "1": 1, "yes": 1, "y": 1, "true": 1, "t": 1,
        "0": 0, "no": 0, "n": 0, "false": 0, "f": 0,
    }
    out = txt.map(mapping)
    return out.astype("float")


def mae(a: pd.Series, b: pd.Series) -> float:
    d = (a - b).dropna()
    if len(d) == 0:
        return float("nan")
    return float(np.mean(np.abs(d)))


# ----------------------------
# Robust CSV loader (fixes your ParserError)
# ----------------------------
def sniff_sep(path: Path) -> str | None:
    """
    Try to guess delimiter from first non-empty line.
    Returns one of [',',';','\\t'] or None.
    """
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for _ in range(20):
            line = f.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            # crude scoring
            scores = {
                ",": line.count(","),
                ";": line.count(";"),
                "\t": line.count("\t"),
            }
            # choose the separator with max count if it's meaningful
            sep, cnt = max(scores.items(), key=lambda x: x[1])
            return sep if cnt > 0 else None
    return None


def load_csv_robust(path: Path) -> pd.DataFrame:
    """
    Robust reader:
    - tries separator sniff
    - uses engine='python' (more forgiving)
    - skips bad lines instead of crashing
    - prints basic diagnostics
    """
    sep = sniff_sep(path)

    # Attempt 1: auto sep detection via pandas (python engine)
    try:
        df = pd.read_csv(
            path,
            sep=None,
            engine="python",
            na_values=NA_VALUES,
            keep_default_na=True,
            on_bad_lines="skip",
        )
        print(f"[load] {path.name}: sep=auto, rows={len(df)}, cols={len(df.columns)}")
        return df
    except Exception as e1:
        print(f"[load] auto-sep failed: {e1}")

    # Attempt 2: sniffed sep
    if sep is not None:
        try:
            df = pd.read_csv(
                path,
                sep=sep,
                engine="python",
                na_values=NA_VALUES,
                keep_default_na=True,
                on_bad_lines="skip",
            )
            print(f"[load] {path.name}: sep={repr(sep)}, rows={len(df)}, cols={len(df.columns)}")
            return df
        except Exception as e2:
            print(f"[load] sniffed-sep failed: {e2}")

    # Attempt 3: brute force common seps
    for trial_sep in [",", ";", "\t"]:
        try:
            df = pd.read_csv(
                path,
                sep=trial_sep,
                engine="python",
                na_values=NA_VALUES,
                keep_default_na=True,
                on_bad_lines="skip",
            )
            print(f"[load] {path.name}: sep={repr(trial_sep)}, rows={len(df)}, cols={len(df.columns)}")
            return df
        except Exception:
            pass

    raise RuntimeError(f"Could not read CSV reliably: {path}")


# ----------------------------
# Calculations
# ----------------------------
def calc_fib4(age, ast, alt, plt):
    return (age * ast) / (plt * np.sqrt(alt))


def calc_apri(ast, plt, uln=AST_ULN):
    return (ast / uln) / plt * 100.0


def detect_glucose_unit(glucose: pd.Series) -> str:
    g = glucose.dropna()
    if len(g) == 0:
        return "mg/dL"
    med = float(np.median(g))
    return "mg/dL" if med > 30 else "mmol/L"


def calc_homa(glucose, insulin, unit: str):
    if unit.lower() == "mmol/l":
        return (glucose * insulin) / 22.5
    return (glucose * insulin) / 405.0


def calc_nfs(age, bmi, dm, ast, alt, plt, alb):
    return (
        -1.675
        + 0.037 * age
        + 0.094 * bmi
        + 1.13 * dm
        + 0.99 * (ast / alt)
        - 0.013 * plt
        - 0.66 * alb
    )


# ----------------------------
# Validation runners
# ----------------------------
def run_fib4_apri(path: Path) -> None:
    print(f"\n=== FIB-4 & APRI validation ===\nFile: {path.name}")
    df = load_csv_robust(path)

    # show columns once for debugging
    print("[cols]", list(df.columns)[:30])

    c_age = pick_col(df, ["Age", "Age (years)", "Age years"])
    c_ast = pick_col(df, ["AST", "AST (SGOT)", "AST SGOT"])
    c_alt = pick_col(df, ["ALT", "ALT (SGPT)", "ALT SGPT"])
    c_plt = pick_col(df, ["Platelet count", "Platelets", "PLT"])

    age = to_num(df[c_age])
    ast = to_num(df[c_ast])
    alt = to_num(df[c_alt])
    plt = to_num(df[c_plt])

    valid_fib4 = age.notna() & ast.notna() & alt.notna() & plt.notna() & (alt > 0) & (plt > 0)
    df["FIB4_calc"] = np.where(valid_fib4, calc_fib4(age, ast, alt, plt), np.nan)

    valid_apri = ast.notna() & plt.notna() & (plt > 0)
    df["APRI_calc"] = np.where(valid_apri, calc_apri(ast, plt, AST_ULN), np.nan)

    ref_fib4 = pick_col(df, ["FIB-4 score", "FIB4", "FIB4 score"], required=False)
    if ref_fib4:
        df["FIB4_ref"] = to_num(df[ref_fib4])
        df["FIB4_diff"] = df["FIB4_calc"] - df["FIB4_ref"]
        print("FIB-4 MAE:", mae(df["FIB4_calc"], df["FIB4_ref"]))
    else:
        print("FIB-4 reference column not found (computed only).")

    ref_apri = pick_col(df, ["APRI (American reference)", "APRI American", "APRI"], required=False)
    if ref_apri:
        df["APRI_ref"] = to_num(df[ref_apri])
        df["APRI_diff"] = df["APRI_calc"] - df["APRI_ref"]
        print("APRI MAE:", mae(df["APRI_calc"], df["APRI_ref"]))
    else:
        print("APRI reference column not found (computed only).")

    out = OUT_DIR / "fib4_apri_validation.csv"
    df.to_csv(out, index=False)
    print(f"Saved → {out}")


def run_homa(path: Path) -> None:
    print(f"\n=== HOMA-IR validation ===\nFile: {path.name}")
    df = load_csv_robust(path)
    print("[cols]", list(df.columns)[:30])

    c_glu = pick_col(df, ["Glucose", "Fasting Blood sugar", "Fasting blood sugar", "FBG", "Fasting glucose"])
    c_ins = pick_col(df, ["Insulin", "Fasting insulin"])

    glu = to_num(df[c_glu])
    ins = to_num(df[c_ins])

    unit = detect_glucose_unit(glu)
    print(f"Detected glucose unit: {unit}")

    valid = glu.notna() & ins.notna()
    df["HOMA_calc"] = np.where(valid, calc_homa(glu, ins, unit), np.nan)

    ref_homa = pick_col(df, ["HOMA", "HOMA-IR", "HOMA IR"], required=False)
    if ref_homa:
        df["HOMA_ref"] = to_num(df[ref_homa])
        df["HOMA_diff"] = df["HOMA_calc"] - df["HOMA_ref"]
        print("HOMA-IR MAE:", mae(df["HOMA_calc"], df["HOMA_ref"]))
    else:
        print("HOMA reference column not found (computed only).")

    out = OUT_DIR / "homa_validation.csv"
    df.to_csv(out, index=False)
    print(f"Saved → {out}")


def run_nfs(path: Path) -> None:
    print(f"\n=== NFS validation ===\nFile: {path.name}")
    df = load_csv_robust(path)
    print("[cols]", list(df.columns)[:30])

    c_age = pick_col(df, ["Age", "Age (years)", "Age years"])
    c_bmi = pick_col(df, ["BMI", "Body mass index"])
    c_dm = pick_col(df, ["Diabetes", "Diabetes Mellitus", "DM", "DM.IFG", "DM IFG"])
    c_ast = pick_col(df, ["AST", "AST (SGOT)", "AST SGOT"])
    c_alt = pick_col(df, ["ALT", "ALT (SGPT)", "ALT SGPT"])
    c_plt = pick_col(df, ["Platelets", "Platelet count", "PLT"])
    c_alb = pick_col(df, ["Albumin", "ALB"])

    age = to_num(df[c_age])
    bmi = to_num(df[c_bmi])
    dm = diabetes_to_01(df[c_dm])
    ast = to_num(df[c_ast])
    alt = to_num(df[c_alt])
    plt = to_num(df[c_plt])
    alb = to_num(df[c_alb])

    valid = (
        age.notna() & bmi.notna() & dm.notna() &
        ast.notna() & alt.notna() & plt.notna() & alb.notna() &
        (alt > 0) & (plt > 0)
    )

    df["NFS_calc"] = np.where(valid, calc_nfs(age, bmi, dm, ast, alt, plt, alb), np.nan)

    ref_nfs = pick_col(df, ["NFS", "NAFLD fibrosis score", "NAFLD Fibrosis Score"], required=False)
    if ref_nfs:
        df["NFS_ref"] = to_num(df[ref_nfs])
        df["NFS_diff"] = df["NFS_calc"] - df["NFS_ref"]
        print("NFS MAE:", mae(df["NFS_calc"], df["NFS_ref"]))
    else:
        print("NFS reference column not found (computed only).")

    out = OUT_DIR / "nfs_validation.csv"
    df.to_csv(out, index=False)
    print(f"Saved → {out}")


# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    # Use your filenames exactly as in your VS Code explorer
    fib_apri_path = DATA_DIR / "data1-fib,apri.csv"
    nfs_path = DATA_DIR / "data2-nfs.csv"
    homa_path = DATA_DIR / "data3-homa.csv"

    if not fib_apri_path.exists():
        raise FileNotFoundError(f"Missing: {fib_apri_path}")
    if not nfs_path.exists():
        raise FileNotFoundError(f"Missing: {nfs_path}")
    if not homa_path.exists():
        raise FileNotFoundError(f"Missing: {homa_path}")

    run_fib4_apri(fib_apri_path)
    run_nfs(nfs_path)
    run_homa(homa_path)

    print("\n✅ All validations completed. Outputs saved in validation/results/")
