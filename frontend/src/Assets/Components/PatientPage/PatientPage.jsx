import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientRequest from "../PatientRequest/PatientRequest";
import "./PatientPage.css";

export default function PatientPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ai");
  const [showMenu, setShowMenu] = useState(false);

  const patientName = localStorage.getItem("patientName") || "Patient";

  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientName");
    navigate("/");
  };

  return (
    <div className="patient-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Med Connect</h2>

        <div className="profile-section">
          <span onClick={() => setShowMenu(!showMenu)} className="profile-name">
            {patientName} ⌄
          </span>

          {showMenu && (
            <div className="profile-dropdown">
              <button>Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "ai" ? "active" : ""}
          onClick={() => setActiveTab("ai")}
        >
          AI Appointment
        </button>

        <button
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === "ai" && <PatientRequest />}
        {activeTab === "notifications" && (
          <div className="notifications-panel">
            <h3>No notifications yet</h3>
          </div>
        )}
      </div>
    </div>
  );
}
