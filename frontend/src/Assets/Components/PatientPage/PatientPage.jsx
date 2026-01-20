import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientRequest from "../PatientRequest/PatientRequest";
import "./PatientPage.css";
import { useEffect } from "react";
import api from "../../../api";
import MapFromMessage from "../MapFromMessage";

export default function PatientPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ai");
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const patientName = localStorage.getItem("patientName") || "Patient";
  const email = localStorage.getItem("patientEmail");
  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientName");
    navigate("/");
  };

  useEffect(() => {
  if (activeTab !== "notifications") return;

  const token = localStorage.getItem("patientToken");

  api.get(`patients/notifications/?email=${email}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => setNotifications(res.data));
}, [activeTab]);

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
          Notifications {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === "ai" && <PatientRequest />}
        {activeTab === "notifications" && (
          <div className="notifications-panel">
            {notifications.length === 0 ? (
              <h3>No notifications yet</h3>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="notif-card">
                  <h4>{n.title}</h4>
                  <p style={{ whiteSpace: "pre-line" }}>{n.message}</p>
                  <small>{new Date(n.created_at).toLocaleString()}</small>

                  {n.message.includes("I will be at") && (
                  <MapFromMessage
                    lat={n.latitude}
                    lng={n.longitude}
                    address={n.clinic_address}
                  />
                )}

                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
