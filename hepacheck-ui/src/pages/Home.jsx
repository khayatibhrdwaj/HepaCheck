// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loginBadge from "../assets/Login.png";

export default function Home() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("patient"); // patient | doctor
  const [err, setErr] = useState("");

  // If already logged in, bounce straight to the saved role
  useEffect(() => {
    const saved = localStorage.getItem("hc_role");
    if (saved === "patient" || saved === "doctor") {
      nav(`/${saved}`, { replace: true });
    }
  }, [nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // (Optional) very light validation
    if (!email || !pwd) {
      setErr("Please enter email and password.");
      return;
    }

    // --- If you have a backend, call it here and set role based on response ---
    // const res = await fetch("/api/login", { method:"POST", body:JSON.stringify({email, pwd}) });
    // const data = await res.json();
    // const roleFromServer = data.role; // "patient" | "doctor"

    // For now we do a purely front-end login:
    localStorage.setItem("hc_email", email);
    localStorage.setItem("hc_role", role);

    // Send the user to the correct area
    nav(`/${role}`, { replace: true });
  };

  return (
    <div className="main-shell">
      <div className="card login-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <img src={loginBadge} alt="Login" className="login-badge" draggable="false" />

        <form onSubmit={onSubmit} className="login-form" style={{ marginTop: 6 }}>
          <div style={{ marginBottom: 10 }}>
            <label className="label" style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label" style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
            />
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 12, display: "flex", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="role"
                value="patient"
                checked={role === "patient"}
                onChange={() => setRole("patient")}
              />
              Patient
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="role"
                value="doctor"
                checked={role === "doctor"}
                onChange={() => setRole("doctor")}
              />
              Doctor
            </label>
          </div>

          {err && (
            <div style={{ color: "#b22222", marginBottom: 10, fontWeight: 600 }}>
              {err}
            </div>
          )}

          <button type="submit" className="btn" style={{ width: "100%" }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
