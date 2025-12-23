// src/pages/DoctorHomeInfo.jsx
export default function DoctorHomeInfo() {
  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: 20 }}>
      <h2>Welcome, Doctor 👩‍⚕️👨‍⚕️</h2>
      <p>
        This is your home screen. Use the navigation menu above to quickly access:
      </p>
      <ul>
        <li><strong>Dashboard</strong> — View patient summaries, trends, and alerts.</li>
        <li><strong>Reports</strong> — Generate and review PDF reports.</li>
        <li><strong>Patients</strong> — Search and manage patient records.</li>
        <li><strong>Emergency</strong> — Find important contacts and on-call info.</li>
        <li><strong>Settings</strong> — Update your profile and clinic preferences.</li>
      </ul>
      <p>
        The top menu is always available so you can navigate seamlessly.
      </p>
    </div>
  );
}
