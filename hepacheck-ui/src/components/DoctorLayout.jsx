import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function DoctorLayout() {
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
            {/* Home → Scores → Patients → Emergency Flag → Appointments → Contact */}
            <NavLink to="/doctor/homeinfo" className={linkClass}>
              Home
            </NavLink>

            <NavLink to="/doctor/scores" className={linkClass}>
              Scores
            </NavLink>

            <NavLink to="/doctor/patients" className={linkClass}>
              Patients
            </NavLink>

            <NavLink to="/doctor/emergency-flag" className={linkClass}>
              Emergency Flag
            </NavLink>

            <NavLink to="/doctor/appointments" className={linkClass}>
              Appointments
            </NavLink>

            {/* ✅ NEW */}
            <NavLink to="/doctor/contact" className={linkClass}>
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
