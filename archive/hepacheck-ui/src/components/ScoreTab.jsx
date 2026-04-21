import { useEffect, useMemo, useRef, useState } from "react";
import { API_COMPUTE, API_SAVE, API_HISTORY, http } from "../lib/api.js";

// Charts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ===================== helpers ===================== */

function numOrU(v) {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function roundOrNull(v, dp = 3) {
  return typeof v === "number" && Number.isFinite(v)
    ? Number(v.toFixed(dp))
    : null;
}

function showNum(v, dp = 3) {
  return typeof v === "number" && Number.isFinite(v) ? v.toFixed(dp) : "—";
}

function safeDateLabel(x) {
  const d = new Date(x);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "—";
}

function riskColor(r) {
  const v = String(r || "").toLowerCase();
  if (v.includes("high")) return "#ef4444";
  if (v.includes("mod")) return "#f59e0b";
  if (v.includes("low")) return "#22c55e";
  return "#64748b";
}

/* ===================== styles ===================== */

const labelStyle = { fontSize: 14, color: "#d1d5db" };

const inputStyle = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
};

const noteStyle = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0a1020",
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.4,
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const btnSecondary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#1f2937",
  color: "white",
  cursor: "pointer",
};

const errorBox = {
  marginTop: 16,
  padding: 12,
  background: "#7f1d1d",
  border: "1px solid #ef4444",
  borderRadius: 8,
  color: "#fee2e2",
};

/* ===================== component ===================== */

export default function ScoreTab() {
  console.log("### SCORETAB LOADED – FASTING VERSION ###");

  const [form, setForm] = useState({
    age: "",
    ast: "",
    alt: "",
    platelets: "",
    albumin: "",
    bmi: "",
    diabetes: false,
    fasting_glucose: "",
    fasting_insulin: "",
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const reportRef = useRef(null);

  /* 🔑 Explicit fasting payload → backend expects glucose / insulin */
  const payload = useMemo(
    () => ({
      age: numOrU(form.age),
      ast: numOrU(form.ast),
      alt: numOrU(form.alt),
      platelets: numOrU(form.platelets),
      albumin: numOrU(form.albumin),
      bmi: numOrU(form.bmi),
      diabetes: Boolean(form.diabetes),
      glucose: numOrU(form.fasting_glucose),
      insulin: numOrU(form.fasting_insulin),
    }),
    [form]
  );

  const onChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await http.post(API_COMPUTE, payload);
      setResult(data);
    } catch (ex) {
      setErr(ex?.message || "Failed to compute scores.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshHistory() {
    try {
      const rows = await http.get(API_HISTORY);
      setHistory(
        (rows || []).reverse().map((r) => ({
          when: safeDateLabel(r.created_at),
          fib4: roundOrNull(r.fib4),
        }))
      );
    } catch {}
  }

  useEffect(() => {
    refreshHistory();
  }, []);

  return (
    <div>
      <form
        onSubmit={submit}
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
      >
        {[
          ["age", "Age (years)"],
          ["ast", "AST (IU/L)"],
          ["alt", "ALT (IU/L)"],
          ["platelets", "Platelets (×10⁹/L)"],
          ["albumin", "Albumin (g/dL)"],
          ["bmi", "BMI (kg/m²)"],
          ["fasting_glucose", "Fasting Plasma Glucose (mg/dL)"],
          ["fasting_insulin", "Fasting Serum Insulin (µU/mL)"],
        ].map(([k, lab]) => (
          <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6, ...labelStyle }}>
            {lab}
            <input
              type="number"
              step="any"
              placeholder={k.includes("fasting") ? "≥ 8 hours fasting" : ""}
              value={form[k]}
              onChange={onChange(k)}
              style={inputStyle}
            />
          </label>
        ))}

        <label style={{ alignSelf: "end", display: "flex", gap: 8, ...labelStyle }}>
          <input type="checkbox" checked={form.diabetes} onChange={onChange("diabetes")} />
          Diabetes / IFG
        </label>

        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Computing…" : "Compute Scores"}
        </button>

        {/* 🔔 FASTING NOTE */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={noteStyle}>
            <strong>Note:</strong> Fasting plasma glucose and fasting serum insulin
            values (≥ 8 hours fasting) are required for accurate HOMA-IR computation.
          </div>
        </div>
      </form>

      {err && <div style={errorBox}>{err}</div>}
    </div>
  );
}
