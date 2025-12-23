import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function DoctorLayout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("hc_role");
    nav("/", { replace: true });
  };

  return (
    <>
      <nav className="role-navbar">
        <div className="nav-inner">
          <div className="role-nav-center">
            {/* ✅ Updated order: Home → Scores → Patients → Emergency Flag → Appointments */}
            <NavLink to="/doctor/homeinfo" className="role-nav-btn">Home</NavLink>
            <NavLink to="/doctor/scores" className="role-nav-btn">Scores</NavLink>
            <NavLink to="/doctor/patients" className="role-nav-btn">Patients</NavLink>
            <NavLink to="/doctor/emergency-flag" className="role-nav-btn">Emergency Flag</NavLink>
            <NavLink to="/doctor/appointments" className="role-nav-btn">Appointments</NavLink>

            <span className="nav-sep" aria-hidden="true" />
            <button className="role-nav-btn logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="main-shell">
        <Outlet />
      </main>
    </>
  );
}

