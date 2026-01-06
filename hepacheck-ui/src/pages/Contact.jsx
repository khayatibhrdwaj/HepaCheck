import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Frontend-only placeholder for future backend integration
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div
      style={{
        padding: "28px",
        maxWidth: "980px",
        margin: "0 auto",
      }}
    >
      <h2>Contact Us</h2>

      <p>
        For technical queries, clarification regarding HepaCheck scores, or
        feedback related to the platform, please contact the HepaCheck
        development team using the details below.
      </p>

      {/* Institutional Contact Information */}
      <div
        style={{
          marginTop: "18px",
          padding: "18px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Institutional Contact</h3>

        <p>
          <strong>Khayati Bhrdwaj</strong>
          <br />
          <a href="mailto:khayati.bhrdwaj@s.amity.edu">
            khayati.bhrdwaj@s.amity.edu
          </a>
        </p>

        <p>
          <strong>Dr. (Professor) Ritu Chauhan</strong>
          <br />
          <a href="mailto:rchauhan@amity.edu">rchauhan@amity.edu</a>
        </p>

        <p style={{ fontSize: "0.95rem", color: "#444", marginBottom: 0 }}>
          Artificial Intelligence and IoT Lab
          <br />
          Centre for Computational Biology and Bioinformatics
          <br />
          Amity University, Noida, India
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div style={{ marginTop: "16px" }}>
        <h4>Medical Disclaimer</h4>
        <p style={{ fontSize: "0.95rem", color: "#444" }}>
          HepaCheck is a research-oriented decision-support and awareness
          platform. It does not provide medical diagnoses or treatment
          recommendations. Users are advised to consult qualified healthcare
          professionals for medical decisions or emergencies.
        </p>
      </div>

      <hr style={{ margin: "28px 0" }} />

      {/* Contact Form */}
      <h3>Send us a message</h3>

      {sent && (
        <div
          style={{
            marginBottom: "14px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cfe9cf",
            backgroundColor: "#ecf8ec",
          }}
        >
          Thank you for contacting us. Your message has been received.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Message</label>
          <textarea
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#7bbf6a",
            color: "#ffffff",
            border: "none",
            padding: "10px 22px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contact;
