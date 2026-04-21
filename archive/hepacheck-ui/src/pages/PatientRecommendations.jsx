import React from "react";

export default function PatientRecommendations() {
  return (
    <div className="page-container">
      <h2>Management Recommendations</h2>

      <div className="info-card">
        <h3>Lifestyle Management</h3>
        <p>
          Maintain a healthy diet, reduce sugar and saturated fat intake,
          and aim for gradual weight loss if overweight.
        </p>
      </div>

      <div className="info-card">
        <h3>Physical Activity</h3>
        <p>
          Perform at least 150 minutes of moderate exercise per week,
          such as brisk walking, cycling, or swimming.
        </p>
      </div>

      <div className="info-card">
        <h3>Medical Follow-up</h3>
        <p>
          Regular monitoring of liver function and fibrosis-related scores
          is recommended based on risk level.
        </p>
      </div>

      <div className="info-card">
        <h3>Warning Signs</h3>
        <p>
          Seek medical help if you develop jaundice, abdominal swelling,
          severe fatigue, confusion, or persistent abdominal pain.
        </p>
      </div>
    </div>
  );
}