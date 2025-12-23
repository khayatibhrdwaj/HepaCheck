export default function DoctorDashboard() {
  return (
    <div className="section">
      <h1>Doctor Dashboard</h1>
      <p>Your workspace for patient monitoring and score evaluations.</p>

      {/* Patients Overview */}
      <div className="card">
        <h2>Patients</h2>
        <p>View, add, or manage patient records.</p>
        <div className="btn-row">
          <button className="btn">Add Patient</button>
          <button className="btn btn-outline">Import CSV</button>
          <button className="btn btn-outline">Refresh List</button>
        </div>
      </div>

      {/* Scores */}
      <div className="card">
        <h2>Scores</h2>
        <p>Access and review your patients’ risk assessment scores.</p>
        <div className="btn-row">
          <button className="btn">View All Scores</button>
          <button className="btn btn-outline">Export Summary</button>
        </div>
      </div>

      {/* Analytics */}
      <div className="card">
        <h2>Analytics</h2>
        <p>Explore aggregated trends and diagnostic distributions.</p>
        <div className="btn-row">
          <button className="btn btn-outline">Load Data</button>
          <button className="btn">View Charts</button>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h2>History</h2>
        <p>Track past consultations and reports.</p>
        <div className="btn-row">
          <button className="btn btn-outline">Show Recent</button>
          <button className="btn">Export Log</button>
        </div>
      </div>

      {/* Graph */}
      <div className="card">
        <h2>Graph</h2>
        <p>Visualize longitudinal patient progress or test metrics.</p>
        <div className="btn-row">
          <button className="btn btn-outline">Load Demo Chart</button>
          <button className="btn">Export PNG</button>
        </div>
      </div>
    </div>
  );
}
