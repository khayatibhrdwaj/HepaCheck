
import math

AST_ULN_DEFAULT = 40.0

class ScoreError(ValueError):
    pass

def require_positive(name: str, v: float):
    if v is None or v <= 0:
        raise ScoreError(f"{name} must be > 0")

def fib4(age: float, ast: float, alt: float, platelets: float) -> float:
    require_positive("age", age)
    require_positive("ast", ast)
    require_positive("alt", alt)
    require_positive("platelets", platelets)
    return (age * ast) / (platelets * math.sqrt(alt))

def apri(ast: float, platelets: float, ast_uln: float = AST_ULN_DEFAULT) -> float:
    require_positive("ast", ast)
    require_positive("platelets", platelets)
    require_positive("ast_uln", ast_uln)
    return ((ast / ast_uln) * 100.0) / platelets

def nfs(age: float, bmi: float, diabetes_or_ifg: bool, ast: float, alt: float, platelets: float, albumin: float) -> float:
    require_positive("age", age)
    require_positive("bmi", bmi)
    require_positive("ast", ast)
    require_positive("alt", alt)
    require_positive("platelets", platelets)
    require_positive("albumin", albumin)
    return (
        -1.675 + 0.037*age + 0.094*bmi + 1.13*(1 if diabetes_or_ifg else 0)
        + 0.99*(ast/alt) - 0.013*platelets - 0.66*albumin
    )

def homa_ir(glucose_mgdl: float, insulin_uUml: float) -> float:
    require_positive("glucose_mgdl", glucose_mgdl)
    require_positive("insulin_uUml", insulin_uUml)
    return (insulin_uUml * glucose_mgdl) / 405.0

def risk_bucket_fib4(score: float, age: float) -> str:
    # Simple cutoffs: < 1.3 low, 1.3–2.67 moderate, > 2.67 high
    if score < 1.3:
        return "Low"
    if score <= 2.67:
        return "Moderate"
    return "High"
