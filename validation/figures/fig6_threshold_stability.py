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

def lims(x, y):
    mn = float(np.nanmin([np.nanmin(x), np.nanmin(y)]))
    mx = float(np.nanmax([np.nanmax(x), np.nanmax(y)]))
    pad = 0.05 * (mx - mn if mx > mn else 1.0)
    return mn - pad, mx + pad

WINDOW = 0.3
T1, T2 = 1.3, 2.67

def main():
    d = read_csv_safely(FIB_APRI)

    FIB_REF = ["FIB4_ref", "FIB4 score", "FIB-4 score", "Reference FIB-4", "FIB4_reference"]
    FIB_CAL = ["FIB4_calc", "Hepacheck FIB-4 score", "HepaCheck FIB-4 score", "FIB4"]

    c_ref = find_column(d, FIB_REF)
    c_cal = find_column(d, FIB_CAL)

    if not c_ref or not c_cal:
        raise SystemExit(f"Missing FIB-4 ref/calc columns for Fig6. Found ref={c_ref}, calc={c_cal}")

    ref = to_num(d[c_ref])
    calc = to_num(d[c_cal])

    dd = pd.DataFrame({"ref": ref, "calc": calc}).dropna()

    near = dd[
        dd["ref"].between(T1 - WINDOW, T1 + WINDOW) |
        dd["ref"].between(T2 - WINDOW, T2 + WINDOW)
    ]

    if len(near) == 0:
        raise SystemExit("No points found near thresholds. Increase WINDOW or inspect reference values.")

    fig, ax = plt.subplots(figsize=(8, 6))
    ax.scatter(near["ref"], near["calc"], s=15)

    lo, hi = lims(near["ref"].to_numpy(), near["calc"].to_numpy())
    ax.plot([lo, hi], [lo, hi], linestyle="--")
    ax.axvline(T1, linestyle="--")
    ax.axvline(T2, linestyle="--")

    ax.set_xlim(lo, hi); ax.set_ylim(lo, hi)
    ax.set_xlabel("Reference FIB-4")
    ax.set_ylabel("HepaCheck FIB-4")
    ax.set_title("Figure 6. Threshold stability near guideline cut-offs")
    ax.text(0.05, 0.95, f"Window ±{WINDOW}\n(n={len(near)})",
            transform=ax.transAxes, va="top")

    fig.tight_layout()
    save(fig, "fig6_threshold_stability")
    plt.close(fig)

    print("\n[FIG6] Using columns:", {"fib_ref": c_ref, "fib_calc": c_cal})

if __name__ == "__main__":
    main()
