from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ---------------- paths ----------------
ROOT = Path(__file__).resolve().parents[2]  # hepacheck_starter/
RESULTS = ROOT / "validation" / "results"
OUTDIR = ROOT / "validation" / "figures" / "output"
OUTDIR.mkdir(parents=True, exist_ok=True)

FIB_APRI = RESULTS / "fib4_apri_validation.csv"
HOMA = RESULTS / "homa_validation.csv"
NFS = RESULTS / "nfs_validation.csv"

# ---------------- helpers ----------------
def save(fig, name: str):
    fig.savefig(OUTDIR / f"{name}.png", dpi=300, bbox_inches="tight")
    fig.savefig(OUTDIR / f"{name}.pdf", bbox_inches="tight")
    print("Saved:", OUTDIR / f"{name}.png")
    print("Saved:", OUTDIR / f"{name}.pdf")

def read_csv_safely(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    df = pd.read_csv(path)
    if not isinstance(df, pd.DataFrame) or df.empty:
        print(f"Warning: {path.name} loaded but is empty.")
    return df

def find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """Return the first column name that exists in df."""
    cols = set(df.columns)
    for c in candidates:
        if c in cols:
            return c
    return None

def series_from_any(df: pd.DataFrame, candidates: list[str]) -> pd.Series:
    """Return numeric Series from first matching column, else empty numeric Series."""
    col = find_column(df, candidates)
    if col is None:
        return pd.Series(dtype="float64")
    return pd.to_numeric(df[col], errors="coerce")

def concat_nonempty(series_list: list[pd.Series]) -> pd.Series:
    """Concat only if there is at least one non-empty series."""
    cleaned = [s for s in series_list if isinstance(s, pd.Series) and len(s) > 0]
    if not cleaned:
        return pd.Series(dtype="float64")
    return pd.concat(cleaned, ignore_index=True)

# ---------------- main ----------------
def main():
    d_fib = read_csv_safely(FIB_APRI)
    d_homa = read_csv_safely(HOMA)
    d_nfs = read_csv_safely(NFS)

    # Synonyms: covers your old datasets + any renamed results columns
    AGE_CANDS = ["Age", "Age (years)", "age", "Patient Age"]
    AST_CANDS = ["AST", "AST (U/L)", "AST (IU/L)", "ast"]
    PLT_CANDS = ["Platelets", "Platelet count", "Platelets (10^9/L)", "platelets"]
    BMI_CANDS = ["BMI", "BMI (kg/m²)", "BMI (kg/m2)", "bmi"]

    # Build combined distributions
    age = concat_nonempty([
        series_from_any(d_fib, AGE_CANDS),
        series_from_any(d_homa, AGE_CANDS),
        series_from_any(d_nfs, AGE_CANDS),
    ]).dropna()

    ast = concat_nonempty([
        series_from_any(d_fib, AST_CANDS),
        series_from_any(d_homa, AST_CANDS),
        series_from_any(d_nfs, AST_CANDS),
    ]).dropna()

    platelets = concat_nonempty([
        series_from_any(d_fib, PLT_CANDS),
        series_from_any(d_nfs, PLT_CANDS),
    ]).dropna()

    bmi = concat_nonempty([
        series_from_any(d_homa, BMI_CANDS),
        series_from_any(d_nfs, BMI_CANDS),
    ]).dropna()

    # Hard stop if EVERYTHING is empty (means your column names are totally different)
    if len(age) == 0 and len(ast) == 0 and len(platelets) == 0 and len(bmi) == 0:
        raise SystemExit(
            "No matching columns found for Age/AST/Platelets/BMI in the results CSVs.\n"
            "Open the CSV headers and update the candidate lists in this script."
        )

    # Plot: 2x2 (2 hist + 2 violin)
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))

    ax = axes[0, 0]
    if len(age) > 0:
        ax.hist(age, bins=20)
        ax.set_title(f"(A) Age distribution (n={len(age)})")
        ax.set_xlabel("Age")
        ax.set_ylabel("Frequency")
    else:
        ax.text(0.5, 0.5, "Age column not found", ha="center", va="center", transform=ax.transAxes)
        ax.set_axis_off()

    ax = axes[0, 1]
    if len(ast) > 0:
        ax.hist(ast, bins=20)
        ax.set_title(f"(B) AST distribution (n={len(ast)})")
        ax.set_xlabel("AST")
        ax.set_ylabel("Frequency")
    else:
        ax.text(0.5, 0.5, "AST column not found", ha="center", va="center", transform=ax.transAxes)
        ax.set_axis_off()

    ax = axes[1, 0]
    if len(platelets) > 0:
        ax.violinplot([platelets], showmeans=True, showmedians=True, widths=0.7)
        ax.set_title(f"(C) Platelets distribution (n={len(platelets)})")
        ax.set_xticks([1])
        ax.set_xticklabels(["Platelets"])
        ax.set_ylabel("Platelets")
    else:
        ax.text(0.5, 0.5, "Platelets column not found", ha="center", va="center", transform=ax.transAxes)
        ax.set_axis_off()

    ax = axes[1, 1]
    if len(bmi) > 0:
        ax.violinplot([bmi], showmeans=True, showmedians=True, widths=0.7)
        ax.set_title(f"(D) BMI distribution (n={len(bmi)})")
        ax.set_xticks([1])
        ax.set_xticklabels(["BMI"])
        ax.set_ylabel("BMI")
    else:
        ax.text(0.5, 0.5, "BMI column not found", ha="center", va="center", transform=ax.transAxes)
        ax.set_axis_off()

    fig.suptitle("Figure 3. Distribution of validation cohort variables (derived from validation/results)", y=1.02)
    fig.tight_layout()

    save(fig, "fig3_distributions")
    plt.close(fig)

    # Print quick verification
    print("\nLoaded:")
    print(" -", FIB_APRI.name, "cols =", len(d_fib.columns))
    print(" -", HOMA.name, "cols =", len(d_homa.columns))
    print(" -", NFS.name, "cols =", len(d_nfs.columns))
    print("\nCounts used:")
    print(" Age:", len(age))
    print(" AST:", len(ast))
    print(" Platelets:", len(platelets))
    print(" BMI:", len(bmi))

if __name__ == "__main__":
    main()
