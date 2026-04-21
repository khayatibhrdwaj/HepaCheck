"""
Liver-health scoring functions.
All inputs are expected as plain Python floats/ints/bools.
"""


def compute_fib4(age: float, ast: float, platelets: float, alt: float) -> float:
    """FIB-4 = (Age × AST) / (Platelets × √ALT)"""
    if platelets <= 0 or alt <= 0:
        return 0.0
    return round((age * ast) / (platelets * (alt ** 0.5)), 3)


def compute_apri(ast: float, platelets: float, uln_ast: float = 40.0) -> float:
    """APRI = (AST / ULN_AST) / Platelets × 100"""
    if platelets <= 0:
        return 0.0
    return round((ast / uln_ast) / platelets * 100, 3)


def compute_nfs(age: float, bmi: float, diabetes: bool,
                ast: float, alt: float, platelets: float, albumin: float) -> float:
    """NAFLD Fibrosis Score"""
    ast_alt = round(ast / alt, 3) if alt > 0 else 0.0
    dm = 1 if diabetes else 0
    return round(
        -1.675
        + (0.037 * age)
        + (0.094 * bmi)
        + (1.13 * dm)
        + (0.99 * ast_alt)
        - (0.013 * platelets)
        - (0.66 * albumin),
        3
    )


def compute_homa_ir(glucose: float, insulin: float) -> float:
    """HOMA-IR = (Glucose × Insulin) / 405"""
    return round((glucose * insulin) / 405, 3)


def classify_risk(fib4: float, apri: float) -> tuple[str, bool]:
    """
    Returns (risk_level, is_emergency).
    risk_level: "low" | "moderate" | "high"
    is_emergency: True if any critical threshold is breached
    """
    if fib4 >= 3.25 or apri >= 2.0:
        return "high", True
    if fib4 >= 1.45 or apri >= 0.5:
        return "moderate", False
    return "low", False


def score_entry(data: dict) -> dict:
    """
    Takes raw form values, computes all scores and risk, returns enriched dict.
    Expects keys: age, ast, alt, platelets, albumin, bmi, diabetes, glucose, insulin
    """
    age       = float(data.get("age", 0))
    ast       = float(data.get("ast", 0))
    alt       = float(data.get("alt", 0))
    platelets = float(data.get("platelets", 0))
    albumin   = float(data.get("albumin", 0))
    bmi       = float(data.get("bmi", 0))
    diabetes  = bool(data.get("diabetes", False))
    glucose   = float(data.get("glucose", 0))
    insulin   = float(data.get("insulin", 0))

    fib4    = compute_fib4(age, ast, platelets, alt)
    apri    = compute_apri(ast, platelets)
    nfs     = compute_nfs(age, bmi, diabetes, ast, alt, platelets, albumin)
    homa_ir = compute_homa_ir(glucose, insulin)

    risk_level, is_emergency = classify_risk(fib4, apri)

    return {
        "age": age, "ast": ast, "alt": alt, "platelets": platelets,
        "albumin": albumin, "bmi": bmi, "diabetes": diabetes,
        "glucose": glucose, "insulin": insulin,
        "fib4": fib4, "apri": apri, "nfs": nfs, "homa_ir": homa_ir,
        "risk_level": risk_level, "is_emergency": is_emergency,
    }
