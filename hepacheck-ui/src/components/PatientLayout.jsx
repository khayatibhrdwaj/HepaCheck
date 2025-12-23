import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function PatientLayout() {
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
            <NavLink to="/patient/homeinfo" className="role-nav-btn">Home</NavLink>
            <NavLink to="/patient/score" className="role-nav-btn">Scores</NavLink>
            <NavLink to="/patient/reports" className="role-nav-btn">Reports</NavLink>
            <NavLink to="/patient/info" className="role-nav-btn">Info</NavLink>
            <NavLink to="/patient/community" className="role-nav-btn">Community</NavLink>
            <NavLink to="/patient/emergency" className="role-nav-btn">Emergency</NavLink>

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
