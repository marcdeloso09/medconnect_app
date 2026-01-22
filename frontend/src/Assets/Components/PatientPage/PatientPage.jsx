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
  const [selectedNotif, setSelectedNotif] = useState(null);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [patientName, setPatientName] = useState("Patient");
  const email = localStorage.getItem("patientEmail");
  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    localStorage.removeItem("patientName");
    localStorage.removeItem("patientEmail");
    navigate("/");
  };
  useEffect(() => {
    const name =
      localStorage.getItem("patientName") ||
      localStorage.getItem("patientEmail") ||
      "Patient";
    setPatientName(name);
  }, []);

  useEffect(() => {
  if (activeTab !== "notifications") return;

  const token = localStorage.getItem("patientToken");
  if (!token) return;

  api.get("patients/notifications/")
    .then(res => setNotifications(res.data))
    .catch(err => console.error("Notification fetch failed:", err));
}, [activeTab]);

  useEffect(() => {
    if (selectedNotif) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedNotif]);

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
              notifications.map((n, i) => {
                const type =
                  n.title.toLowerCase().includes("accepted") ? "accepted" :
                  n.title.toLowerCase().includes("referred") ? "referred" :
                  "info";

                return (
                  <div
                    key={i}
                    className={`notif-card clickable ${type}`}
                    onClick={() => setSelectedNotif(n)}
                  >
                    <div className="notif-header-row">
                      <span className={`notif-type ${type}`}>
                        {type.toUpperCase()}
                      </span>
                      <small>{new Date(n.created_at).toLocaleString()}</small>
                    </div>

                    <h4>{n.title}</h4>
                    <p className="notif-preview">
                      {n.message.slice(0, 80)}...
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedNotif && (
        <div className="notif-modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div className="notif-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedNotif.title}</h3>
            <p style={{ whiteSpace: "pre-line" }}>{selectedNotif.message}</p>
            <small>{new Date(selectedNotif.created_at).toLocaleString()}</small>

            {selectedNotif.message.includes("I will be at") && (
              <div style={{ height: "250px", marginTop: "15px", borderRadius: "10px", overflow: "hidden" }}>
                <MapFromMessage
                  lat={selectedNotif.latitude}
                  lng={selectedNotif.longitude}
                  address={selectedNotif.clinic_address}
                />
              </div>
            )}
            <button className="close-btn" onClick={() => setSelectedNotif(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
