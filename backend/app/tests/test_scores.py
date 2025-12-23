
from backend.app.services.scores import fib4, homa_ir

def test_fib4_basic():
    assert round(fib4(55, 50, 45, 200), 2) > 0

def test_homa_ir():
    assert round(homa_ir(90, 10), 2) == 2.22
