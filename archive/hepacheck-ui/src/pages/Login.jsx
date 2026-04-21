import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    // mock login
    const role = (e.target.role.value || "patient").toLowerCase();
    localStorage.setItem("hc_role", role);
    nav(`/${role}`);
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "48px auto",
        padding: 24,
        border: "1px solid #000",
        borderRadius: 12,
      }}
    >
      {/* Changed this text to "Login" */}
      <h2 style={{ marginBottom: 12 }}>Login</h2>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #000",
              borderRadius: 8,
            }}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #000",
              borderRadius: 8,
            }}
          />
        </label>
        <label>
          Role
          <select
            name="role"
            defaultValue="patient"
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #000",
              borderRadius: 8,
            }}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            border: "1px solid #000",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
