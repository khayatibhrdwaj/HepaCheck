
# HepaCheck Starter (Backend)

This folder contains a minimal FastAPI backend that can:
- return `/health`
- compute liver risk scores at `/scores/compute`

## 1) Install Python & Git (once)
- Windows: install Python 3.11+ from python.org. During setup, **check "Add Python to PATH"**.
- Install Git from git-scm.com.

## 2) Create a virtual environment
Open PowerShell in this folder (Shift+Right-Click → "Open PowerShell here") and run:
```
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
```

## 3) Run the API
```
uvicorn backend.app:app --reload
```
Open http://127.0.0.1:8000/docs to test.

## 4) Try the calculator
From a second PowerShell tab:
```
curl -X POST http://127.0.0.1:8000/scores/compute   -H "Content-Type: application/json"   -d "{\"age\":55,\"ast\":50,\"alt\":45,\"platelets\":200,\"albumin\":4.2,\"bmi\":29,\"diabetes\":true,\"glucose\":100,\"insulin\":12}"
```

You should see a JSON with `fib4`, `fib4_risk`, `apri`, `nfs`, `homa_ir` (some may be missing if inputs omitted).

## 5) Run tests (optional)
```
pytest -q
```

## Troubleshooting
- If `uvicorn` not found: ensure the virtual env is activated (you should see `(.venv)` in the prompt).
- If port busy: try `uvicorn backend.app:app --host 0.0.0.0 --port 8001`.
