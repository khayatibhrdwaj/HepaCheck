from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
RESULTS = ROOT / "validation" / "results"
OUTDIR = ROOT / "validation" / "figures" / "output"
OUTDIR.mkdir(parents=True, exist_ok=True)

FIB_APRI = RESULTS / "fib4_apri_validation.csv"
HOMA = RESULTS / "homa_validation.csv"
NFS = RESULTS / "nfs_validation.csv"

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

def nonnull_count(df: pd.DataFrame, candidates: list[str]) -> int:
    col = find_column(df, candidates)
    if col is None:
        return 0
    s = pd.to_numeric(df[col], errors="coerce")
    return int(s.notna().sum())

def main():
    d_fib = read_csv_safely(FIB_APRI)
    d_homa = read_csv_safely(HOMA)
    d_nfs = read_csv_safely(NFS)

    total = len(d_fib) + len(d_homa) + len(d_nfs)

    # Output columns (synonyms)
    FIB4_CALC = ["FIB4_calc", "fib4_calc", "Hepacheck FIB-4 score", "HepaCheck FIB-4 score", "FIB4"]
    APRI_CALC = ["APRI_calc", "apri_calc", "Hepacheck APRI", "HepaCheck APRI", "APRI"]
    HOMA_CALC = ["HOMA_calc", "homa_calc", "HOMA", "HOMA-IR", "HOMA_IR", "HOMAIR"]
    NFS_CALC  = ["NFS_calc", "nfs_calc", "NFS", "NAFLD Fibrosis Score", "NAFLD_Fibrosis_Score"]

    valid_fib4 = nonnull_count(d_fib, FIB4_CALC)
    valid_apri = nonnull_count(d_fib, APRI_CALC)
    valid_homa = nonnull_count(d_homa, HOMA_CALC)
    valid_nfs  = nonnull_count(d_nfs, NFS_CALC)

    # Conservative exclusions: rows with missing output in each file
    excluded_fib = len(d_fib) - max(valid_fib4, valid_apri)
    excluded_homa = len(d_homa) - valid_homa
    excluded_nfs = len(d_nfs) - valid_nfs
    excluded = excluded_fib + excluded_homa + excluded_nfs

    labels = ["Total", "Valid FIB-4", "Valid APRI", "Valid HOMA-IR", "Valid NFS", "Excluded"]
    values = [total, valid_fib4, valid_apri, valid_homa, valid_nfs, excluded]

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.bar(labels, values)
    ax.set_ylabel("Number of records")
    ax.set_title("Figure 4. Automated preprocessing and validation outcomes (validation/results)")
    ax.tick_params(axis="x", rotation=15)

    top = max(values) if max(values) > 0 else 1
    for i, v in enumerate(values):
        ax.text(i, v + 0.01*top, str(int(v)), ha="center", va="bottom", fontsize=10)

    fig.tight_layout()
    save(fig, "fig4_validation_outcomes")
    plt.close(fig)

    print("\n[FIG4] rows:", {"fib4_apri": len(d_fib), "homa": len(d_homa), "nfs": len(d_nfs)})
    print("[FIG4] valid:", {"fib4": valid_fib4, "apri": valid_apri, "homa": valid_homa, "nfs": valid_nfs})
    print("[FIG4] excluded:", excluded)

if __name__ == "__main__":
    main()
