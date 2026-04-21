import { useEffect, useMemo, useState } from "react";

const LS_APPTS = "hc_appts";

const defaultForm = {
  date: "",
  time: "",
  patient: "",
  type: "Consult",
  location: "Clinic",
  notes: "",
};

export default function DoctorAppointments() {
  const [form, setForm] = useState(defaultForm);
  const [appts, setAppts] = useState([]);
  const [tab, setTab] = useState("upcoming"); // 'upcoming' | 'past'
  const [q, setQ] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_APPTS);
    if (raw) {
      try {
        setAppts(JSON.parse(raw));
      } catch {
        setAppts([]);
      }
    }
  }, []);

  const setVal = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = () => {
    if (!form.date || !form.time || !form.patient) return;
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const entry = { id, ...form };
    const next = [entry, ...appts];
    setAppts(next);
    localStorage.setItem(LS_APPTS, JSON.stringify(next));
    setForm(defaultForm);
  };

  const now = new Date();
  const data = useMemo(() => {
    const parsed = appts.map((a) => ({
      ...a,
      dt: new Date(`${a.date}T${a.time || "00:00"}`),
    }));
    const filtered = parsed.filter((a) =>
      (a.patient + " " + (a.notes || "") + " " + a.type + " " + a.location)
        .toLowerCase()
        .includes(q.toLowerCase())
    );
    return {
      upcoming: filtered.filter((a) => a.dt >= now).sort((a, b) => a.dt - b.dt),
      past: filtered.filter((a) => a.dt < now).sort((a, b) => b.dt - a.dt),
    };
  }, [appts, q]);

  const remove = (id) => {
    const next = appts.filter((a) => a.id !== id);
    setAppts(next);
    localStorage.setItem(LS_APPTS, JSON.stringify(next));
  };

  const list = tab === "upcoming" ? data.upcoming : data.past;

  return (
    <div className="main-shell">
      <h2 className="section-title">Appointments</h2>

      {/* Create form (green form-card, white inputs) */}
      <div className="card form-card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Create new appointment</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>
              Date
            </label>
            <input className="input" type="date" value={form.date} onChange={setVal("date")} />
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>
              Time
            </label>
            <input className="input" type="time" value={form.time} onChange={setVal("time")} />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>
              Patient
            </label>
            <input
              className="input"
              type="text"
              value={form.patient}
              onChange={setVal("patient")}
              placeholder="Name / ID"
            />
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>
              Type
            </label>
            <select className="input" value={form.type} onChange={setVal("type")}>
              <option>Consult</option>
              <option>Follow-up</option>
              <option>Procedure</option>
              <option>Telehealth</option>
            </select>
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>
              Location
            </label>
            <select className="input" value={form.location} onChange={setVal("location")}>
              <option>Clinic</option>
              <option>Hospital</option>
              <option>Online</option>
              <option>Home Visit</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label" style={{ display: "block", marginBottom: 6 }}>
              Notes
            </label>
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
          {/* Buttons inside .form-card inherit #fae1cf from global CSS */}
          <button className="btn" onClick={add}>Add appointment</button>
        </div>
      </div>

      {/* Filters + search (tabs now use .filter-tab: #fae1cf) */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className={`btn filter-tab ${tab === "upcoming" ? "is-active" : ""}`}
            onClick={() => setTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`btn filter-tab ${tab === "past" ? "is-active" : ""}`}
            onClick={() => setTab("past")}
          >
            Past
          </button>

          <input
            className="input"
            style={{ marginLeft: "auto", maxWidth: 300 }}
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div style={{ opacity: 0.8 }}>{list.length} result(s)</div>
        </div>
      </div>

      {/* List */}
      <div className="card">
        {list.length === 0 ? (
          <div>No appointments.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Date</th>
                <th style={{ width: 90 }}>Time</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Location</th>
                <th>Notes</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.patient}</td>
                  <td>{a.type}</td>
                  <td>{a.location}</td>
                  <td>{a.notes || "—"}</td>
                  <td>
                    <button className="btn" onClick={() => remove(a.id)}>Delete</button>
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
