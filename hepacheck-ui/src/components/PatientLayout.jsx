import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function PatientLayout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("hc_role");
    nav("/", { replace: true });
  };

  // This keeps NavLink active styling consistent with your CSS
  const linkClass = ({ isActive }) =>
    isActive ? "role-nav-btn active" : "role-nav-btn";

  return (
    <>
      <nav className="role-navbar">
        <div className="nav-inner">
          <div className="role-nav-center">
            {/* Home → Scores → Reports → Info → Community → Emergency → Contact */}
            <NavLink to="/patient/homeinfo" className={linkClass}>
              Home
            </NavLink>

            <NavLink to="/patient/score" className={linkClass}>
              Scores
            </NavLink>

            <NavLink to="/patient/reports" className={linkClass}>
              Reports
            </NavLink>

            <NavLink to="/patient/info" className={linkClass}>
              Info
            </NavLink>

            <NavLink to="/patient/community" className={linkClass}>
              Community
            </NavLink>

            <NavLink to="/patient/emergency" className={linkClass}>
              Emergency
            </NavLink>

            {/* ✅ NEW */}
            <NavLink to="/patient/contact" className={linkClass}>
              Contact
            </NavLink>

            <span className="nav-sep" aria-hidden="true" />
            <button className="role-nav-btn logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-shell">
        <Outlet />
      </main>
    </>
  );
}
