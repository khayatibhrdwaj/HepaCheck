from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
RESULTS = ROOT / "validation" / "results"
OUTDIR = ROOT / "validation" / "figures" / "output"
OUTDIR.mkdir(parents=True, exist_ok=True)

FIB_APRI = RESULTS / "fib4_apri_validation.csv"

def save(fig, name: str):
    fig.savefig(OUTDIR / f"{name}.png", dpi=300, bbox_inches="tight")
    fig.savefig(OUTDIR / f"{name}.pdf", bbox_inches="tight")
    print("Saved:", OUTDIR / f"{name}.png")
    print("Saved:", OUTDIR / f"{name}.pdf")

def read_csv_safely(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    return pd.read_csv(path)

def find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    cols = set(df.columns)
    for c in candidates:
        if c in cols:
            return c
    return None

def to_num(s):
    return pd.to_numeric(s, errors="coerce")

def mae(a, b):
    return float(np.mean(np.abs(a - b))) if len(a) else float("nan")

def maxe(a, b):
    return float(np.max(np.abs(a - b))) if len(a) else float("nan")

def lims(x, y):
    mn = float(np.nanmin([np.nanmin(x), np.nanmin(y)]))
    mx = float(np.nanmax([np.nanmax(x), np.nanmax(y)]))
    pad = 0.05 * (mx - mn if mx > mn else 1.0)
    return mn - pad, mx + pad

def main():
    d = read_csv_safely(FIB_APRI)

    FIB_REF = ["FIB4_ref", "FIB4 score", "FIB-4 score", "Reference FIB-4", "FIB4_reference"]
    FIB_CAL = ["FIB4_calc", "Hepacheck FIB-4 score", "HepaCheck FIB-4 score", "FIB4"]
    APR_REF = ["APRI_ref", "APRI (American reference)", "Reference APRI", "APRI_reference"]
    APR_CAL = ["APRI_calc", "Hepacheck APRI", "HepaCheck APRI", "APRI"]

    c_fib_ref = find_column(d, FIB_REF)
    c_fib_cal = find_column(d, FIB_CAL)
    c_apr_ref = find_column(d, APR_REF)
    c_apr_cal = find_column(d, APR_CAL)

    if not all([c_fib_ref, c_fib_cal, c_apr_ref, c_apr_cal]):
        raise SystemExit(
            "Missing required columns for Fig5. Found:\n"
            f"fib_ref={c_fib_ref}, fib_calc={c_fib_cal}, apri_ref={c_apr_ref}, apri_calc={c_apr_cal}\n"
            "Open fib4_apri_validation.csv header and update candidate lists."
        )

    fib = pd.DataFrame({"ref": to_num(d[c_fib_ref]), "calc": to_num(d[c_fib_cal])}).dropna()
    apr = pd.DataFrame({"ref": to_num(d[c_apr_ref]), "calc": to_num(d[c_apr_cal])}).dropna()

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # FIB-4
    ax = axes[0]
    ax.scatter(fib["ref"], fib["calc"], s=12)
    lo, hi = lims(fib["ref"].to_numpy(), fib["calc"].to_numpy())
    ax.plot([lo, hi], [lo, hi], linestyle="--")
    ax.set_xlim(lo, hi); ax.set_ylim(lo, hi)
    ax.set_xlabel("Reference FIB-4")
    ax.set_ylabel("HepaCheck FIB-4")
    ax.set_title("Panel A: FIB-4 agreement")
    ax.text(0.05, 0.95,
            f"MAE={mae(fib['ref'].to_numpy(), fib['calc'].to_numpy()):.6f}\n"
            f"Max|err|={maxe(fib['ref'].to_numpy(), fib['calc'].to_numpy()):.6f}\n"
            f"(n={len(fib)})",
            transform=ax.transAxes, va="top")

    # APRI
    ax = axes[1]
    ax.scatter(apr["ref"], apr["calc"], s=12)
    lo, hi = lims(apr["ref"].to_numpy(), apr["calc"].to_numpy())
    ax.plot([lo, hi], [lo, hi], linestyle="--")
    ax.set_xlim(lo, hi); ax.set_ylim(lo, hi)
    ax.set_xlabel("Reference APRI")
    ax.set_ylabel("HepaCheck APRI")
    ax.set_title("Panel B: APRI agreement")
    ax.text(0.05, 0.95,
            f"MAE={mae(apr['ref'].to_numpy(), apr['calc'].to_numpy()):.6f}\n"
            f"Max|err|={maxe(apr['ref'].to_numpy(), apr['calc'].to_numpy()):.6f}\n"
            f"(n={len(apr)})",
            transform=ax.transAxes, va="top")

    fig.suptitle("Figure 5. Numerical fidelity of HepaCheck outputs against reference values", y=1.02)
    fig.tight_layout()
    save(fig, "fig5_fidelity")
    plt.close(fig)

    print("\n[FIG5] Using columns:",
          {"fib_ref": c_fib_ref, "fib_calc": c_fib_cal, "apri_ref": c_apr_ref, "apri_calc": c_apr_cal})

if __name__ == "__main__":
    main()
