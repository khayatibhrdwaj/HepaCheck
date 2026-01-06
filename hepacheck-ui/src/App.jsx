import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

/* Layouts */
import DoctorLayout from "./components/DoctorLayout.jsx";
import PatientLayout from "./components/PatientLayout.jsx";

/* Opening/Login */
import Home from "./pages/Home.jsx";

/* Patient pages/tabs */
import PatientHomeInfo from "./pages/PatientHomeInfo.jsx";   // Home
import PatientDashboard from "./pages/PatientDashboard.jsx"; // Scores
import ReportsTab from "./components/ReportsTab.jsx";
import InfoTab from "./components/InfoTab.jsx";
import CommunityTab from "./components/CommunityTab.jsx";
import EmergencyTab from "./components/EmergencyTab.jsx";

/* Doctor pages/tabs */
import DoctorHomeInfo from "./pages/DoctorHomeInfo.jsx";     // Home
import DoctorPatients from "./pages/DoctorPatients.jsx";
import DoctorEmergencyFlag from "./pages/DoctorEmergencyFlag.jsx";
import DoctorAppointments from "./pages/DoctorAppointments.jsx";
import DoctorScores from "./pages/DoctorScores.jsx";

/* ✅ Contact */
import Contact from "./pages/Contact.jsx";

/* Fallback */
import ErrorBoundary from "./pages/ErrorBoundary.jsx";

/* Assets */
import logo from "./assets/logo.png";
import patientBadge from "./assets/Patient.png";
import doctorBadge from "./assets/Doctor.png";

import "./App.css";

/* Header with logo and a role badge that appears on /patient/* or /doctor/* */
function AppHeader() {
  const { pathname } = useLocation();
  const isPatient = pathname.startsWith("/patient");
  const isDoctor = pathname.startsWith("/doctor");
  const badgeSrc = isPatient ? patientBadge : isDoctor ? doctorBadge : null;

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" style={{ lineHeight: 0 }}>
          <img src={logo} alt="HepaCheck Logo" className="app-logo" />
        </Link>

        {badgeSrc && (
          <img
            src={badgeSrc}
            alt={isPatient ? "Patient" : "Doctor"}
            className="role-badge"
            draggable="false"
          />
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <AppHeader />

      <Routes>
        {/* Opening page (login) */}
        <Route path="/" element={<Home />} />

        {/* Doctor area (nested) */}
        <Route path="/doctor" element={<DoctorLayout />}>
          {/* Redirect /doctor to /doctor/homeinfo */}
          <Route index element={<Navigate to="/doctor/homeinfo" replace />} />

          <Route path="homeinfo" element={<DoctorHomeInfo />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="emergency-flag" element={<DoctorEmergencyFlag />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="scores" element={<DoctorScores />} />

          {/* ✅ Doctor Contact */}
          <Route path="contact" element={<Contact role="Doctor" />} />

          {/* Doctor fallback */}
          <Route path="*" element={<Navigate to="/doctor/homeinfo" replace />} />
        </Route>

        {/* Patient area (nested) */}
        <Route path="/patient" element={<PatientLayout />}>
          {/* Redirect /patient to /patient/homeinfo */}
          <Route index element={<Navigate to="/patient/homeinfo" replace />} />

          <Route path="homeinfo" element={<PatientHomeInfo />} />
          <Route path="score" element={<PatientDashboard />} />
          <Route path="reports" element={<ReportsTab />} />
          <Route path="info" element={<InfoTab />} />
          <Route path="community" element={<CommunityTab />} />
          <Route path="emergency" element={<EmergencyTab />} />

          {/* ✅ Patient Contact */}
          <Route path="contact" element={<Contact role="Patient" />} />

          {/* Patient fallback */}
          <Route path="*" element={<Navigate to="/patient/homeinfo" replace />} />
        </Route>

        {/* App-level fallback */}
        <Route path="*" element={<ErrorBoundary />} />
      </Routes>
    </>
  );
}
