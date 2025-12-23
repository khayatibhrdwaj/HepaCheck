import { useEffect, useState } from "react";

/** LocalStorage key for emergency contacts */
const LS_EMERGENCY = "hc_emergency_contacts";

const init = {
  contact1Name: "",
  contact1Phone: "",
  contact2Name: "",
  contact2Phone: "",
  doctorName: "",
  doctorPhone: "",
  ambulance: "108",
  hospitalER: "",
};

export default function EmergencyTab() {
  const [form, setForm] = useState(init);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_EMERGENCY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setForm({ ...init, ...data });
        setSaved(data);
      } catch {
        setSaved(null);
      }
    }
  }, []);

  const setVal = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSave = () => {
    localStorage.setItem(LS_EMERGENCY, JSON.stringify(form));
    setSaved(form);
  };

  const onReset = () => {
    setForm(init);
    localStorage.removeItem(LS_EMERGENCY);
    setSaved(null);
  };

  return (
    <div className="emergency-page main-shell">
      {/* Actions row (same fashion as Reports) */}
      <div className="emergency-actions">
        <button className="role-nav-btn btn-refresh" onClick={onSave}>
          Save
        </button>
        <button className="role-nav-btn btn-clear" onClick={onReset}>
          Reset
        </button>
      </div>

      <h2 className="section-title">Emergency Contacts</h2>

      {/* Contact pair */}
      <div className="card form-card" style={{ marginBottom: 12 }}>
        <div className="grid-2">
          <div>
            <LabeledInput
              label="Contact 1 Name"
              placeholder="e.g., Spouse / Parent / Friend"
              value={form.contact1Name}
              onChange={setVal("contact1Name")}
            />
            <LabeledInput
              label="Contact 1 Phone"
              placeholder="+91-XXXXXXXXXX"
              value={form.contact1Phone}
              onChange={setVal("contact1Phone")}
            />
          </div>

          <div>
            <LabeledInput
              label="Contact 2 Name"
              placeholder="e.g., Spouse / Parent / Friend"
              value={form.contact2Name}
              onChange={setVal("contact2Name")}
            />
            <LabeledInput
              label="Contact 2 Phone"
              placeholder="+91-XXXXXXXXXX"
              value={form.contact2Phone}
              onChange={setVal("contact2Phone")}
            />
          </div>
        </div>
      </div>

      {/* Doctor / Clinic */}
      <div className="card form-card" style={{ marginBottom: 12 }}>
        <LabeledInput
          label="Doctor / Clinic Name"
          placeholder="e.g., Dr. Mehta / City Clinic"
          value={form.doctorName}
          onChange={setVal("doctorName")}
        />
        <LabeledInput
          label="Doctor / Clinic Phone"
          placeholder="+91-XXXXXXXXXX"
          value={form.doctorPhone}
          onChange={setVal("doctorPhone")}
        />
      </div>

      {/* Emergency numbers */}
      <div className="card form-card" style={{ marginBottom: 12 }}>
        <LabeledInput
          label="Ambulance Number"
          placeholder="108"
          value={form.ambulance}
          onChange={setVal("ambulance")}
        />
        <LabeledInput
          label="Hospital ER Number"
          placeholder="+91-XXXXXXXXXX"
          value={form.hospitalER}
          onChange={setVal("hospitalER")}
        />
      </div>

      {/* Saved quick view (white) */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Saved Contacts</h3>
        {saved ? (
          <ul>
            {saved.ambulance && (
              <li>
                <strong>Ambulance:</strong> {saved.ambulance}
              </li>
            )}
            {saved.hospitalER && (
              <li>
                <strong>Hospital ER:</strong> {saved.hospitalER}
              </li>
            )}
            {saved.contact1Name && saved.contact1Phone && (
              <li>
                <strong>{saved.contact1Name}:</strong> {saved.contact1Phone}
              </li>
            )}
            {saved.contact2Name && saved.contact2Phone && (
              <li>
                <strong>{saved.contact2Name}:</strong> {saved.contact2Phone}
              </li>
            )}
            {saved.doctorName && saved.doctorPhone && (
              <li>
                <strong>{saved.doctorName}:</strong> {saved.doctorPhone}
              </li>
            )}
          </ul>
        ) : (
          <div>No contacts saved yet.</div>
        )}
      </div>
    </div>
  );
}

/** Small reusable input */
function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="label" style={{ display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        className="input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
