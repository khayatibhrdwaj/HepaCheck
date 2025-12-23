import { useEffect, useState } from "react";

const LS_KEY = "hc_history";

export default function ReportsTab() {
  const [history, setHistory] = useState([]);

  const refresh = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  };

  const clearAll = () => {
    localStorage.removeItem(LS_KEY);
    setHistory([]);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="reports-page">
      {/* Actions row */}
      <div className="reports-actions">
        <button className="role-nav-btn btn-refresh" onClick={refresh}>
          Refresh
        </button>
        <button className="role-nav-btn btn-clear" onClick={clearAll}>
          Clear All
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>Date</th>
              <th>FIB-4</th>
              <th>Risk</th>
              <th>APRI</th>
              <th>NFS</th>
              <th>HOMA-IR</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                  No saved results yet
                </td>
              </tr>
            ) : (
              history.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.ts).toLocaleString()}</td>
                  <td>{fmt(h.fib4)}</td>
                  <td>{h.risk ?? "—"}</td>
                  <td>{fmt(h.apri)}</td>
                  <td>{fmt(h.nfs)}</td>
                  <td>{fmt(h.homa)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(v) {
  return v == null ? "—" : Number(v).toFixed(3);
}
