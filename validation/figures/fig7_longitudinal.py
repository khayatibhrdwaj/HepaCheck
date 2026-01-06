from pathlib import Path
import pandas as pd
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

def find_first_existing(df: pd.DataFrame, candidates: list[str]) -> str | None:
    cols = set(df.columns)
    for c in candidates:
        if c in cols:
            return c
    return None

def main():
    d = read_csv_safely(FIB_APRI)

    # ID column candidates (results may preserve original)
    ID_CANDS = ["ID number", "Patient No.", "Patient_ID", "Patient ID", "patient_id", "id"]
    id_col = find_first_existing(d, ID_CANDS)

    if not id_col:
        raise SystemExit(
            "Fig7 needs repeated patient IDs in fib4_apri_validation.csv.\n"
            "No ID column found. Add an ID column or export DB history with patient_id + timestamps."
        )

    # Score columns
    FIB_CANDS = ["FIB4_calc", "Hepacheck FIB-4 score", "HepaCheck FIB-4 score", "FIB4"]
    APR_CANDS = ["APRI_calc", "Hepacheck APRI", "HepaCheck APRI", "APRI"]

    fib_col = find_first_existing(d, FIB_CANDS)
    apr_col = find_first_existing(d, APR_CANDS)

    if not fib_col or not apr_col:
        raise SystemExit(f"Missing FIB/APRI calc columns. Found fib={fib_col}, apri={apr_col}")

    # Pick a patient with >= 3 rows
    counts = d[id_col].value_counts()
    candidates = counts[counts >= 3]
    if len(candidates) == 0:
        raise SystemExit(
            f"No patient has >=3 records in {FIB_APRI.name}.\n"
            "For Fig7, export longitudinal history from database (created_at, patient_id, fib4, nfs, homa_ir)."
        )

    pid = candidates.index[0]
    sub = d[d[id_col] == pid].copy().reset_index(drop=True)

    # Optional timestamp column
    TIME_CANDS = ["created_at", "CreatedAt", "timestamp", "date", "when"]
    tcol = find_first_existing(sub, TIME_CANDS)

    if tcol:
        sub[tcol] = pd.to_datetime(sub[tcol], errors="coerce")
        sub = sub.dropna(subset=[tcol]).sort_values(tcol)
        x = sub[tcol]
        xlabel = "Time"
    else:
        x = sub.index
        xlabel = "Visit index"

    sub[fib_col] = pd.to_numeric(sub[fib_col], errors="coerce")
    sub[apr_col] = pd.to_numeric(sub[apr_col], errors="coerce")

    fig, axes = plt.subplots(2, 1, figsize=(10, 7), sharex=True)

    axes[0].plot(x, sub[fib_col], marker="o")
    axes[0].set_ylabel("FIB-4")
    axes[0].grid(True, alpha=0.2)

    axes[1].plot(x, sub[apr_col], marker="o")
    axes[1].set_ylabel("APRI")
    axes[1].set_xlabel(xlabel)
    axes[1].grid(True, alpha=0.2)

    fig.suptitle(f"Figure 7. Longitudinal index trajectories (Patient {pid})", y=0.98)
    fig.tight_layout()
    save(fig, "fig7_longitudinal")
    plt.close(fig)

    print("\n[FIG7] Using columns:", {"id": id_col, "fib": fib_col, "apri": apr_col, "time": tcol})
    print("[FIG7] Patient chosen:", pid, "rows:", len(sub))

if __name__ == "__main__":
    main()
