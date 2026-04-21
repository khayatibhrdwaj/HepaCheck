import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ---------------- Utilities ---------------- */

const num = (v) => (v === "" || v === null || isNaN(Number(v)) ? null : Number(v));

function calcFIB4({ age, ast, alt, platelets }) {
  if ([age, ast, alt, platelets].some((x) => x == null || x <= 0)) return null;
  return (age * ast) / (platelets * Math.sqrt(alt));
}

function calcAPRI({ ast, platelets, ulnAst = 40 }) {
  if ([ast, platelets].some((x) => x == null || x <= 0)) return null;
  return ((ast / ulnAst) * 100) / platelets; // platelets in 10^9/L
}

function calcNFS({ age, bmi, ifgOrDm, ast, alt, platelets, albumin }) {
  if (
    [age, bmi, ast, alt, platelets, albumin].some((x) => x == null || x <= 0) ||
    ifgOrDm == null
  )
    return null;

  return (
    -1.675 +
    0.037 * age +
    0.094 * bmi +
    1.13 * (ifgOrDm ? 1 : 0) +
    0.99 * (ast / alt) -
    0.013 * platelets -
    0.66 * albumin
  );
}

/**
 * HOMA-IR (mg/dL variant):
 * HOMA-IR = (Fasting glucose [mg/dL] × Fasting insulin [µU/mL]) / 405
 */
function calcHOMAIR({ fasting_glucose_mgdl, fasting_insulin }) {
  if ([fasting_glucose_mgdl, fasting_insulin].some((x) => x == null || x <= 0)) return null;
  return (fasting_glucose_mgdl * fasting_insulin) / 405;
}

/* Risk: Low / Medium / High per your request */
function fib4Risk(f) {
  if (f == null) return "—";
  if (f < 1.3) return "Low";
  if (f <= 2.67) return "Medium";
  return "High";
}

/* Map risk string to CSS class for the colored badge */
function riskClass(r) {
  if (!r) return "";
  const v = String(r).toLowerCase();
  if (v.startsWith("high")) return "risk-high";
  if (v.startsWith("medium") || v.startsWith("indet")) return "risk-medium";
  if (v.startsWith("low")) return "risk-low";
  return "";
}

function fmt(v, d = 3) {
  return v == null ? "—" : Number(v).toFixed(d);
}

const LS_KEY = "hc_history";

/* ---------------- Component ---------------- */

export default function PatientDashboard() {
  // Form state
  const [age, setAge] = useState("");
  const [ast, setAST] = useState("");
  const [alt, setALT] = useState("");
  const [platelets, setPlatelets] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [bmi, setBMI] = useState("");

  // ✅ fasting fields (UI labels must say fasting)
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [fastingInsulin, setFastingInsulin] = useState("");

  const [ifgDm, setIfgDm] = useState(false);

  // Results
  const [results, setResults] = useState({
    fib4: null,
    apri: null,
    nfs: null,
    homa: null,
    risk: "—",
  });

  // History
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const computeScores = () => {
    const input = {
      age: num(age),
      ast: num(ast),
      alt: num(alt),
      platelets: num(platelets),
      albumin: num(albumin),
      bmi: num(bmi),

      // ✅ fasting payload
      fasting_glucose_mgdl: num(fastingGlucose),
      fasting_insulin: num(fastingInsulin),

      ifgOrDm: ifgDm,
    };

    const fib4 = calcFIB4(input);
    const apri = calcAPRI(input);
    const nfs = calcNFS(input);
    const homa = calcHOMAIR(input);
    const risk = fib4Risk(fib4);

    setResults({ fib4, apri, nfs, homa, risk });
  };

  const saveToHistory = () => {
    if (
      !results ||
      (results.fib4 == null &&
        results.apri == null &&
        results.nfs == null &&
        results.homa == null)
    )
      return;

    const entry = { ts: new Date().toISOString(), ...results };
    const next = [entry, ...history].slice(0, 200);
    setHistory(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const refreshHistory = () => {
    const raw = localStorage.getItem(LS_KEY);
    setHistory(raw ? JSON.parse(raw) : []);
  };

  const clearHistory = () => {
    localStorage.removeItem(LS_KEY);
    setHistory([]);
  };

  // Trend data (FIB-4 over time)
  const fib4Series = useMemo(
    () =>
      history
        .slice()
        .reverse()
        .map((h, i) => ({
          idx: i + 1,
          fib4: h.fib4 == null ? null : Number(h.fib4.toFixed(3)),
          label: new Date(h.ts).toLocaleString(),
        })),
    [history]
  );

  return (
    <div className="patient-dashboard main-shell">

      {/* ---------- Form (green block) ---------- */}
      <div className="card form-card" style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <LabeledInput label="Age" value={age} onChange={setAge} suffix="years" />
          <LabeledInput label="AST (U/L)" value={ast} onChange={setAST} />
          <LabeledInput label="ALT (U/L)" value={alt} onChange={setALT} />

          <LabeledInput
            label="Platelets (×10^9/L)"
            value={platelets}
            onChange={setPlatelets}
          />
          <LabeledInput label="Albumin (g/dL)" value={albumin} onChange={setAlbumin} />
          <LabeledInput label="BMI (kg/m²)" value={bmi} onChange={setBMI} />

          {/* ✅ fasting labels + placeholder */}
          <LabeledInput
            label="Fasting Glucose (mg/dL)"
            value={fastingGlucose}
            onChange={setFastingGlucose}
            placeholder="≥ 8 hours fasting"
          />
          <LabeledInput
            label="Fasting Insulin (µU/mL)"
            value={fastingInsulin}
            onChange={setFastingInsulin}
            placeholder="≥ 8 hours fasting"
          />

          <div style={{ display: "flex", alignItems: "end" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={ifgDm}
                onChange={(e) => setIfgDm(e.target.checked)}
              />
              <span>Diabetes / IFG</span>
            </label>
          </div>
        </div>

        {/* ---------- Actions ---------- */}
        <div className="score-actions">
          <button className="btn btn-1" onClick={computeScores}>
            Compute Scores
          </button>
          <button className="btn btn-2" onClick={saveToHistory}>
            Save to History
          </button>
          <button className="btn btn-3" onClick={refreshHistory}>
            Refresh History
          </button>
        </div>

        {/* ✅ Note at the bottom of the form */}
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.7)",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <strong>Note:</strong> Fasting plasma glucose and fasting serum insulin values (≥ 8
          hours fasting) are required for accurate HOMA-IR computation.
        </div>
      </div>

      {/* ---------- Results summary ---------- */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Risk Profile</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          <Metric label="FIB-4" value={results.fib4} digits={3} />
          <Metric label="APRI" value={results.apri} digits={3} />
          <Metric label="NFS" value={results.nfs} digits={3} />
          <Metric label="HOMA-IR" value={results.homa} digits={3} />
        </div>

        {/* Prominent Overall Risk line with badge */}
        <div className="risk-line">
          <span className="risk-label">Overall Risk (by FIB-4):</span>
          <span className={`risk-badge ${riskClass(results.risk)}`}>
            {results.risk ?? "—"}
          </span>
        </div>
      </div>

      {/* ---------- Trend chart ---------- */}
      <div className="chart-card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>FIB-4 Trend (Saved history)</h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fib4Series} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#eaeaea" />
              <XAxis dataKey="idx" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => (v == null ? "—" : Number(v).toFixed(3))}
                labelFormatter={(l, p) => p?.[0]?.payload?.label ?? `Point ${l}`}
              />
              <Line
                type="monotone"
                dataKey="fib4"
                stroke="#222"
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="btn" onClick={refreshHistory}>
            Refresh
          </button>
          <button className="btn" onClick={clearHistory}>
            Clear All
          </button>
        </div>
      </div>

      {/* ---------- History table ---------- */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>Date</th>
              <th>FIB-4</th>
              <th>Risk</th>
              <th>APRI</th>
              <th>NFS</th>
              <th>HOMA-IR</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                  No saved results yet
                </td>
              </tr>
            ) : (
              history.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.ts).toLocaleString()}</td>
                  <td>{fmt(h.fib4)}</td>
                  <td>{h.risk ?? "—"}</td>
                  <td>{fmt(h.apri)}</td>
                  <td>{fmt(h.nfs)}</td>
                  <td>{fmt(h.homa)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Small UI pieces ---------------- */

function LabeledInput({ label, value, onChange, suffix, placeholder = "" }) {
  return (
    <div>
      <label className="label" style={{ display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        className="input"
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {suffix && <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{suffix}</div>}
    </div>
  );
}

function Metric({ label, value, digits = 2 }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontSize: 13, color: "#444", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "Merriweather, serif", fontSize: 20 }}>
        {value == null ? "—" : Number(value).toFixed(digits)}
      </div>
    </div>
  );
}
