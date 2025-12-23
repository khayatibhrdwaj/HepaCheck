// src/components/ScoreTab.jsx
import { useEffect, useRef, useState } from "react";
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

const riskColor = (r) => {
  if (r === "High") return "#ef4444";
  if (r === "Moderate") return "#f59e0b";
  return "#22c55e"; // Low / Unknown
};
const label = { fontSize: 14, color: "#d1d5db" };
const inputStyle = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#e5e7eb",
};

export default function ScoreTab() {
  const [form, setForm] = useState({
    age: "", ast: "", alt: "", platelets: "",
    albumin: "", bmi: "", diabetes: false,
    glucose: "", insulin: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [history, setHistory] = useState([]);

  const reportRef = useRef(null);

  const onChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const payloadFromForm = () => ({
    age: numOrU(form.age),
    ast: numOrU(form.ast),
    alt: numOrU(form.alt),
    platelets: numOrU(form.platelets),
    albumin: numOrU(form.albumin),
    bmi: numOrU(form.bmi),
    diabetes: Boolean(form.diabetes),
    glucose: numOrU(form.glucose),
    insulin: numOrU(form.insulin),
  });

  const submit = async (e) => {
    e?.preventDefault?.();
    setErr("");
    setResult(null);
    setLoading(true);
    try {
      const data = await http.post(API_COMPUTE, payloadFromForm());
      setResult(data);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setErr("");
    setLoading(true);
    try {
      await http.post(API_SAVE, payloadFromForm());
      await refreshHistory();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = async () => {
    try {
      const rows = await http.get(API_HISTORY);
      // map to chart-friendly
      const items = rows
        .slice()
        .reverse()
        .map((r) => ({
          id: r.id,
          when: new Date(r.created_at).toLocaleString(),
          fib4: roundOrNull(r.fib4),
          apri: roundOrNull(r.apri),
          nfs: roundOrNull(r.nfs),
          homa_ir: roundOrNull(r.homa_ir),
          fib4_risk: ["Low", "Moderate", "High"][r.fib4_risk ?? 0] || "—",
        }));
      setHistory(items);
    } catch (e) {
      setErr(e.message);
    }
  };

  const downloadPDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: window.devicePixelRatio || 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = 10;
    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save("HepaCheck_Report.pdf");
  };

  useEffect(() => {
    refreshHistory();
    // optional: auto-compute once on mount if you want default values
    // submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* Form */}
      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          ["age", "Age"],
          ["ast", "AST (IU/L)"],
          ["alt", "ALT (IU/L)"],
          ["platelets", "Platelets (10^9/L)"],
          ["albumin", "Albumin (g/dL)"],
          ["bmi", "BMI (kg/m²)"],
          ["glucose", "Glucose (mg/dL)"],
          ["insulin", "Insulin (µU/mL)"],
        ].map(([k, lab]) => (
          <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6, ...label }}>
            {lab}
            <input value={form[k]} onChange={onChange(k)} inputMode="decimal" style={inputStyle} />
          </label>
        ))}

        <label style={{ alignSelf: "end", display: "flex", gap: 8, ...label }}>
          <input type="checkbox" checked={form.diabetes} onChange={onChange("diabetes")} />
          Diabetes / IFG
        </label>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 6 }}>
          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? "Computing…" : "Compute Scores"}
          </button>
          <button type="button" onClick={save} disabled={!result || loading} style={btnSecondary}>
            Save to History
          </button>
          <button type="button" onClick={refreshHistory} style={btnSecondary}>
            Refresh History
          </button>
          <button type="button" onClick={downloadPDF} disabled={!result} style={btnGhost}>
            Download PDF
          </button>
        </div>
      </form>

      {err && (
        <div style={errorBox}>
          {String(err)}
        </div>
      )}

      {/* Results + Chart + JSON */}
      <div ref={reportRef} style={{ marginTop: 16, padding: 16, border: "1px solid #374151", borderRadius: 12, background: "#0b1220" }}>
        <h3 style={{ marginTop: 0 }}>Risk Profile</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {result && "fib4" in result && (
            <Metric title="FIB-4" value={result.fib4} badge={result.fib4_risk} />
          )}
          {result && "apri" in result && <Metric title="APRI" value={result.apri} />}
          {result && "nfs" in result && <Metric title="NFS" value={result.nfs} />}
          {result && "homa_ir" in result && <Metric title="HOMA-IR" value={result.homa_ir} />}
        </div>

        {/* FIB-4 Trend */}
        <div style={{ marginTop: 20 }}>
          <h4 style={{ margin: "0 0 8px 0" }}>FIB-4 Trend (Saved history)</h4>
          <div style={{ height: 280, background: "#0a1020", border: "1px solid #1f2937", borderRadius: 10, padding: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid stroke="#1f2937" />
                <XAxis dataKey="when" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", color: "#e5e7eb" }} />
                <Legend />
                <Line type="monotone" dataKey="fib4" stroke="#60a5fa" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Raw JSON */}
        {result && (
          <pre style={{ marginTop: 16, background: "#0a1020", padding: 12, borderRadius: 8, border: "1px solid #1f2937", color: "#cbd5e1" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ---------- small pieces ---------- */

function Metric({ title, value, badge }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, border: "1px solid #1f2937", minWidth: 200, background: "#0a1020" }}>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{showNum(value)}</div>
      {badge && (
        <span
          style={{
            marginTop: 6,
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 999,
            background: riskColor(badge),
            color: "white",
            fontSize: 12,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function numOrU(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function roundOrNull(v) {
  return typeof v === "number" ? Number(v.toFixed(3)) : null;
}

function showNum(v) {
  return typeof v === "number" ? v.toFixed(3) : "—";
}

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
const btnGhost = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "transparent",
  color: "#e5e7eb",
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
