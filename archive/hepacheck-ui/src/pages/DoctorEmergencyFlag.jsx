import { useEffect, useMemo, useState } from "react";

/** LocalStorage key for emergency flags */
const LS_FLAGS = "hc_emergency_flags";

const defaultFlag = {
  date: "",
  time: "",
  patient: "",
  severity: "High",
  category: "Acute deterioration",
  notes: "",
  resolved: false,
};

export default function DoctorEmergencyFlag() {
  const [form, setForm] = useState(defaultFlag);
  const [flags, setFlags] = useState([]);
  const [tab, setTab] = useState("open"); // 'open' | 'resolved'
  const [q, setQ] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_FLAGS);
    if (raw) {
      try { setFlags(JSON.parse(raw)); } catch { setFlags([]); }
    }
  }, []);

  const refresh = () => {
    const raw = localStorage.getItem(LS_FLAGS);
    setFlags(raw ? JSON.parse(raw) : []);
  };

  const clearAll = () => {
    localStorage.removeItem(LS_FLAGS);
    setFlags([]);
  };

  const setVal = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addFlag = () => {
    if (!form.date || !form.time || !form.patient) return;
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const entry = { id, ...form, createdAt: new Date().toISOString() };
    const next = [entry, ...flags];
    setFlags(next);
    localStorage.setItem(LS_FLAGS, JSON.stringify(next));
    setForm(defaultFlag);
  };

  const remove = (id) => {
    const next = flags.filter((f) => f.id !== id);
    setFlags(next);
    localStorage.setItem(LS_FLAGS, JSON.stringify(next));
  };

  const toggleResolved = (id) => {
    const next = flags.map((f) => (f.id === id ? { ...f, resolved: !f.resolved } : f));
    setFlags(next);
    localStorage.setItem(LS_FLAGS, JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const match = (f) =>
      (f.patient + " " + f.notes + " " + f.category + " " + f.severity)
        .toLowerCase()
        .includes(text);

    const arr = flags.filter((f) => match(f));
    return {
      open: arr.filter((f) => !f.resolved).sort(sortByDateTimeDesc),
      resolved: arr.filter((f) => f.resolved).sort(sortByDateTimeDesc),
    };
  }, [flags, q]);

  const list = tab === "open" ? filtered.open : filtered.resolved;

  return (
    <div className="doctor-emergency-flag main-shell">
      {/* Top actions (unchanged colors as before) */}
      <div className="emergency-actions">
        <button className="role-nav-btn btn-refresh" onClick={refresh}>Refresh</button>
        <button className="role-nav-btn btn-clear" onClick={clearAll}>Clear All</button>
      </div>

      <h2 className="section-title">Emergency Flag</h2>

      {/* Create form (green block, white inputs, buttons now refresh color via .form-card rule) */}
      <div className="card form-card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Create a new flag</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(120px, 1fr))",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Date</label>
            <input className="input" type="date" value={form.date} onChange={setVal("date")} />
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Time</label>
            <input className="input" type="time" value={form.time} onChange={setVal("time")} />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Patient</label>
            <input
              className="input"
              type="text"
              value={form.patient}
              onChange={setVal("patient")}
              placeholder="Name / ID"
            />
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Severity</label>
            <select className="input" value={form.severity} onChange={setVal("severity")}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Category</label>
            <select className="input" value={form.category} onChange={setVal("category")}>
              <option>Acute deterioration</option>
              <option>Abnormal labs</option>
              <option>Severe symptoms</option>
              <option>Medication issue</option>
              <option>Other</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              className="input"
              rows={3}
              value={form.notes}
              onChange={setVal("notes")}
              placeholder=""
            />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={addFlag}>Add flag</button>
        </div>
      </div>

      {/* Filters & search (Open / Resolved now use refresh color via .filter-tab) */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className={`btn filter-tab ${tab === "open" ? "is-active" : ""}`}
            onClick={() => setTab("open")}
          >
            Open
          </button>
          <button
            className={`btn filter-tab ${tab === "resolved" ? "is-active" : ""}`}
            onClick={() => setTab("resolved")}
          >
            Resolved
          </button>

          <input
            className="input"
            style={{ marginLeft: "auto", maxWidth: 320 }}
            placeholder="Search patient, notes, category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div style={{ opacity: 0.8 }}>{list.length} result(s)</div>
        </div>
      </div>

      {/* Flags list */}
      <div className="card">
        {list.length === 0 ? (
          <div>No flags.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Date</th>
                <th style={{ width: 90 }}>Time</th>
                <th>Patient</th>
                <th style={{ width: 110 }}>Severity</th>
                <th style={{ width: 180 }}>Category</th>
                <th>Notes</th>
                <th style={{ width: 150 }}>Status</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((f) => (
                <tr key={f.id}>
                  <td>{f.date}</td>
                  <td>{f.time}</td>
                  <td>{f.patient}</td>
                  <td>{f.severity}</td>
                  <td>{f.category}</td>
                  <td>{f.notes || "—"}</td>
                  <td>{f.resolved ? "Resolved" : "Open"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn" onClick={() => toggleResolved(f.id)}>
                        {f.resolved ? "Mark Open" : "Resolve"}
                      </button>
                      <button className="btn" onClick={() => remove(f.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function sortByDateTimeDesc(a, b) {
  const ad = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
  const bd = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
  return bd - ad;
}
