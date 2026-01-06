# fig3_6_validation.py
# Generate Figure 3 (3.6): Workflow + Ref-vs-Calc scatter + MAE summary
# Uses: validation/results/fib4_apri_validation.csv, homa_validation.csv, nfs_validation.csv
# Output: validation/figures/output/*.png (300 dpi)

import os
import re
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

# -------------------------
# Paths (relative to validation/figures/)
# -------------------------
FIB4_APRI_CSV = "../results/fib4_apri_validation.csv"
HOMA_CSV      = "../results/homa_validation.csv"
NFS_CSV       = "../results/nfs_validation.csv"

OUTDIR = "output"
os.makedirs(OUTDIR, exist_ok=True)

# -------------------------
# Numeric cleaning (robust)
# -------------------------
def to_numeric_clean(series: pd.Series) -> pd.Series:
    """
    Convert a column to numeric robustly:
    - handles None/NaN, empty strings
    - strips quotes/spaces
    - converts decimal comma to decimal point
    - removes non-numeric junk safely
    """
    s = series.copy()

    # Make string, keep NaNs as NaN later
    s = s.astype(str).str.strip()

    # Common NA tokens
    na_tokens = {"", "nan", "none", "null", "na", "n/a"}
    s = s.apply(lambda x: np.nan if x.lower() in na_tokens else x)

    # Remove quotes
    s = s.astype(str).str.replace('"', '', regex=False).str.replace("'", "", regex=False).str.strip()

    # Replace comma decimal with dot (covers cases like 18,7)
    # Also handles values like "1,23" -> "1.23"
    s = s.str.replace(",", ".", regex=False)

    # Remove any characters except digits, dot, minus, exponent markers
    # (e.g., " 12.3 " ok, "12.3*" -> "12.3")
    s = s.str.replace(r"[^0-9eE\.\-\+]", "", regex=True)

    return pd.to_numeric(s, errors="coerce")

# -------------------------
# Metrics
# -------------------------
def mae(ref: pd.Series, calc: pd.Series) -> float:
    mask = ref.notna() & calc.notna()
    if int(mask.sum()) == 0:
        return float("nan")
    return float(np.mean(np.abs(calc[mask] - ref[mask])))

# -------------------------
# Plot helpers
# -------------------------
def save_fig(fig, filename: str):
    path = os.path.join(OUTDIR, filename)
    fig.savefig(path, dpi=300, bbox_inches="tight")

def scatter_ref_vs_calc(ax, ref: pd.Series, calc: pd.Series, title: str):
    mask = ref.notna() & calc.notna()
    x = ref[mask]
    y = calc[mask]

    ax.scatter(x, y, s=14)

    if len(x) > 0:
        lo = float(min(x.min(), y.min()))
        hi = float(max(x.max(), y.max()))
        ax.plot([lo, hi], [lo, hi], linewidth=1)  # y=x line
        ax.set_xlim(lo, hi)
        ax.set_ylim(lo, hi)

    ax.set_title(title)
    ax.set_xlabel("Reference")
    ax.set_ylabel("HepaCheck")

    # Add MAE text
    m = mae(ref, calc)
    mae_text = "MAE=NA" if np.isnan(m) else f"MAE={m:.6f}"
    ax.text(0.02, 0.98, mae_text, transform=ax.transAxes, ha="left", va="top", fontsize=9)

# -------------------------
# Figure 3A: Workflow diagram
# -------------------------
def make_workflow_diagram():
    fig, ax = plt.subplots(figsize=(7.2, 4.2))
    ax.set_axis_off()

    def box(x, y, w, h, text):
        b = FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.02,rounding_size=0.03",
            linewidth=1
        )
        ax.add_patch(b)
        ax.text(x + w/2, y + h/2, text, ha="center", va="center", fontsize=10)

    def arrow(x1, y1, x2, y2):
        a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="->",
                            mutation_scale=12, linewidth=1)
        ax.add_patch(a)

    w, h = 0.72, 0.12
    x = 0.14
    ys = [0.80, 0.62, 0.44, 0.26, 0.08]
    labels = [
        "Clinical datasets\n(de-identified records)",
        "Preprocessing & validation\n(missingness, plausibility, units)",
        "HepaCheck computation\n(FIB-4, APRI, NFS, HOMA-IR)",
        "Reference calculation\n(dataset reference / published equations)",
        "Benchmarking\n(MAE, reproducibility)"
    ]
    for y, lab in zip(ys, labels):
        box(x, y, w, h, lab)
    for i in range(len(ys) - 1):
        arrow(x + w/2, ys[i], x + w/2, ys[i+1] + h)

    ax.set_title("Figure 3A. Computational validation workflow", fontsize=12, pad=10)
    plt.tight_layout()
    save_fig(fig, "Fig3A_validation_workflow.png")
    return fig

# -------------------------
# Main
# -------------------------
def main():
    # Load datasets
    df_fib = pd.read_csv(FIB4_APRI_CSV)
    df_homa = pd.read_csv(HOMA_CSV)
    df_nfs = pd.read_csv(NFS_CSV)

    # Extract and clean columns based on YOUR headers
    # FIB-4/APRI
    fib4_ref  = to_numeric_clean(df_fib["FIB4_ref"])
    fib4_calc = to_numeric_clean(df_fib["FIB4_calc"])
    apri_ref  = to_numeric_clean(df_fib["APRI_ref"])
    apri_calc = to_numeric_clean(df_fib["APRI_calc"])

    # HOMA
    homa_ref  = to_numeric_clean(df_homa["HOMA_ref"])
    homa_calc = to_numeric_clean(df_homa["HOMA_calc"])

    # NFS
    nfs_ref   = to_numeric_clean(df_nfs["NFS_ref"])
    nfs_calc  = to_numeric_clean(df_nfs["NFS_calc"])

    # Compute MAEs
    mae_rows = [
        ("FIB-4",   mae(fib4_ref, fib4_calc)),
        ("APRI",    mae(apri_ref, apri_calc)),
        ("HOMA-IR", mae(homa_ref, homa_calc)),
        ("NFS",     mae(nfs_ref, nfs_calc)),
    ]
    mae_df = pd.DataFrame(mae_rows, columns=["Index", "MAE"])

    print("\nMAE summary:")
    print(mae_df.to_string(index=False))

    # ---- Figure 3B: 2x2 scatter
    fig_scatter, axes = plt.subplots(2, 2, figsize=(10, 10))
    axes = axes.ravel()

    scatter_ref_vs_calc(axes[0], fib4_ref, fib4_calc, "FIB-4: Reference vs HepaCheck")
    scatter_ref_vs_calc(axes[1], apri_ref, apri_calc, "APRI: Reference vs HepaCheck")
    scatter_ref_vs_calc(axes[2], homa_ref, homa_calc, "HOMA-IR: Reference vs HepaCheck")
    scatter_ref_vs_calc(axes[3], nfs_ref,  nfs_calc,  "NFS: Reference vs HepaCheck")

    plt.tight_layout()
    save_fig(fig_scatter, "Fig3B_ref_vs_hepacheck_scatter.png")

    # ---- Figure 3C: MAE bar chart
    fig_mae, ax = plt.subplots(figsize=(6.5, 4))
    ax.bar(mae_df["Index"], mae_df["MAE"])
    ax.set_ylabel("Mean Absolute Error (MAE)")
    ax.set_title("Figure 3C. MAE across implemented indices")
    plt.tight_layout()
    save_fig(fig_mae, "Fig3C_MAE_barchart.png")

    # ---- Figure 3C: MAE table (safe formatting)
    fig_tbl, ax_tbl = plt.subplots(figsize=(5.2, 1.8))
    ax_tbl.axis("off")

    table_df = mae_df.copy()
    table_df["MAE"] = table_df["MAE"].apply(lambda v: "NA" if pd.isna(v) else f"{v:.6f}")

    tbl = ax_tbl.table(
        cellText=table_df.values,
        colLabels=table_df.columns,
        loc="center"
    )
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(10)
    tbl.scale(1, 1.3)
    ax_tbl.set_title("Figure 3C (table). MAE summary", pad=10)
    plt.tight_layout()
    save_fig(fig_tbl, "Fig3C_MAE_table.png")

    # ---- Figure 3A: Workflow
    make_workflow_diagram()

    print(f"\nSaved figures in: validation/figures/{OUTDIR}/")
    plt.show()

if __name__ == "__main__":
    main()
