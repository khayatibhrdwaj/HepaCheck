// src/components/Header.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";

export default function Header() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  // Which section are we in?
  const inPatient = pathname.startsWith("/patient");
  const inDoctor  = pathname.startsWith("/doctor");

  // Button style (larger click targets)
  const navBtn = (active) => ({
    padding: "12px 20px",
    fontSize: "16px",
    border: "1px solid #000",
    borderRadius: 8,
    background: active ? "#f0f0f0" : "#fff",
    cursor: "pointer",
    fontWeight: 500,
    lineHeight: 1.1,
  });

  const logout = () => {
    localStorage.removeItem("hc_role");
    nav("/", { replace: true });
  };

  // Build the role-specific nav set
  const navButtons = useMemo(() => {
    if (inPatient) {
      return [
        { label: "Home",        path: "/patient/homeinfo",     active: pathname.endsWith("/homeinfo") },
        { label: "Scores",      path: "/patient/score",        active: pathname.endsWith("/score") },
        { label: "Reports",     path: "/patient/reports",      active: pathname.endsWith("/reports") },
        { label: "Information", path: "/patient/info",         active: pathname.endsWith("/info") },
        { label: "Community",   path: "/patient/community",    active: pathname.endsWith("/community") },
        { label: "Emergency",   path: "/patient/emergency",    active: pathname.endsWith("/emergency") },
      ];
    }
    if (inDoctor) {
      // EXACT labels/order per your spec
      return [
        { label: "Home",           path: "/doctor/homeinfo",      active: pathname.endsWith("/homeinfo") },
        { label: "Patients",       path: "/doctor/patients",      active: pathname.endsWith("/patients") },
        { label: "Emergency Flag", path: "/doctor/emergency-flag",active: pathname.endsWith("/emergency-flag") },
        { label: "Appointments",   path: "/doctor/appointments",  active: pathname.endsWith("/appointments") },
      ];
    }
    return [];
  }, [inPatient, inDoctor, pathname]);

  return (
    <header>
      {/* Title (match IEDB scale): big, bold, spaced */}
      <div
        style={{
          borderBottom: "1px solid #000",
          background: "#fff",
          textAlign: "center",
          padding: "14px 16px",
          fontSize: 44,       // ~IEDB title size
          fontWeight: 900,
          letterSpacing: "1px",
          lineHeight: 1.1,
        }}
      >
        HepaCheck
      </div>

      {/* Byline (smaller than Title & Welcome) */}
      <div
        style={{
          borderBottom: "1px solid #000",
          background: "#fff",
          textAlign: "center",
          padding: "8px 16px",
          fontSize: 18,       // below Welcome size, above body
          fontStyle: "italic",
          lineHeight: 1.2,
        }}
      >
        Your Personal Liver Buddy
      </div>

      {/* Navigation ribbon: buttons centered, Logout on right */}
      {(inPatient || inDoctor) && (
        <div
          style={{
            position: "relative",
            borderBottom: "1px solid #000",
            background: "#fff",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "center", // center the button group
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Centered nav group */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {navButtons.map((b) => (
              <button
                key={b.label}
                style={navBtn(b.active)}
                onClick={() => nav(b.path)}
                aria-current={b.active ? "page" : undefined}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Logout pinned right */}
          <button
            onClick={logout}
            style={{
              position: "absolute",
              right: 16,
              padding: "10px 18px",
              fontSize: "16px",
              border: "none",
              borderRadius: 8,
              background: "red",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
            aria-label="Logout"
            title="Logout"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
