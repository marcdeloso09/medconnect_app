import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PhysicianPage.css";
import api from "../../../api";
import { formatTime12h } from "../utils/time";
import { formatDateLong } from "../utils/time";

export default function PhysicianPage() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("overview");
  const [appointments, setAppointments] = useState([]);

    useEffect(() => {
    const token = localStorage.getItem("doctorToken");

    api.get("doctors/appointments/doctor/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAppointments(res.data))
    .catch(err => console.error("Appointment load error:", err));

    }, []);

  // keep your stats exactly as before
  const [stats, setStats] = useState({
  today: 0,
  patients: 0,
  pending: 0,
  total: 0
})
 const [doctorProfile, setDoctorProfile] = useState({
  first_name: "",
  last_name: "",
  email: "",
  specialty: "",
  mild_illness: "",
  symptoms: "",
  availability_date: "",
  availability_time: "",
  profile_picture: null
});

const handleAction = async (id, action) => {
  try {
    const token = localStorage.getItem("doctorToken");

    const res = await api.post(`doctors/appointments/action/${id}/`, { action }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ✅ Update the appointment in React state immediately
    setAppointments(prev =>
      prev.map(appt =>
        appt.id === id
          ? { ...appt, status: res.data.status } // update status dynamically
          : appt
      )
    );

    alert(`✅ Appointment ${action} and email sent to patient.`);
  } catch (error) {
    console.error(error);
    alert("❌ Failed to respond.");
  }
};


useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("doctorToken");

      const res = await api.get("doctors/doctor-stats/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(res.data);
    } catch (error) {
      console.error("Failed to load doctor stats:", error.response?.data || error.message);
    }

  const fetchDoctorProfile = async () => {
    try {
        const token = localStorage.getItem("doctorToken");
        const res = await api.get("doctors/doctor-profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctorProfile({
          ...res.data,
          profile_picture: res.data.profile_picture || null
        });
    } catch (err) {
        console.error("Profile load error", err);
    }
    };

    fetchDoctorProfile();

  };
  

  fetchStats();

  // auto-refresh every 30 seconds (real-time feel)
  const interval = setInterval(fetchStats, 30000);
  
  return () => clearInterval(interval);
}, []);

const statCards = [
  { label: "Today", value: stats.today },
  { label: "Patients", value: stats.patients },
  { label: "Appointments Pending", value: stats.pending },
  { label: "Total", value: stats.total }
];

  const logout = () => {
    // remove the token key you used when logging in
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  return (
    <div className="physician-dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">HC</div>
          <div className="brand-text">
            <h2>HealthConnect</h2>
            <small>Doctor Portal</small>
          </div>
        </div>

          <nav className="side-nav">
          <button 
            className={`side-link ${activePage === "overview" ? "active" : ""}`} 
            onClick={() => setActivePage("overview")}
          >
            Overview
          </button>

          <button 
            className={`side-link ${activePage === "appointments" ? "active" : ""}`} 
            onClick={() => setActivePage("appointments")}
          >
            Appointments
          </button>

          <button 
            className={`side-link ${activePage === "patients" ? "active" : ""}`}
            onClick={() => setActivePage("patients")}
          >
            Patients
          </button>

          <button 
            className={`side-link ${activePage === "settings" ? "active" : ""}`}  
            onClick={() => setActivePage("settings")}
          >
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <small>v1.0</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Doctor Dashboard</h1>
            <p className="page-sub">Welcome back — here's your overview</p>
          </div>

          <div className="topbar-right">
            <div className="notification-bell" title="Notifications">
              <span className="bell-emoji">🔔</span>
              <span className="notif-count">3</span>
            </div>

            <div className="doctor-info">
              <div className="avatar">D</div>
              <div className="doctor-meta">
                <div className="doc-name">
                     Dr. {doctorProfile.first_name} {doctorProfile.last_name}
                </div>
                <div className="doc-specialty">General Practitioner</div>
              </div>
            </div>

            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <section className="cards-grid" aria-label="Key statistics">
          {statCards.map((item, index) => (
            <div key={index} className="stat-card">
                <div className="card-icon">
                {item.label.charAt(0)}
                </div>

                <div className="card-body">
                <p className="stat-label">{item.label}</p>
                <h2 className="stat-number">{item.value}</h2>
                <span className="view-details">View details →</span>
                </div>
            </div>
            ))}
        </section>

        {activePage === "settings" && (
            <section className="settings-panel">
                <h2>Doctor Profile Settings</h2>

               <form
                  className="settings-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const token = localStorage.getItem("doctorToken");

                      const formData = new FormData();
                      formData.append("first_name", doctorProfile.first_name);
                      formData.append("last_name", doctorProfile.last_name);
                      formData.append("email", doctorProfile.email);
                      formData.append("mild_illness", doctorProfile.mild_illness);
                      formData.append("symptoms", doctorProfile.symptoms);
                      formData.append("availability_date", doctorProfile.availability_date);
                      formData.append("availability_time", doctorProfile.availability_time);

                      if (doctorProfile.profile_picture instanceof File) {
                        formData.append("profile_picture", doctorProfile.profile_picture);
                      }

                      const res = await api.put("doctors/doctor-profile/", formData, {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      });

                      // ✅ force refresh preview with Cloudinary URL
                      setDoctorProfile(prev => ({
                        ...prev,
                        profile_picture: res.data.profile_picture
                      }));

                      alert("✅ Profile updated successfully!");
                    } catch (err) {
                      console.error(err);
                      alert("❌ Update failed");
                    }
                  }}
                >

                <label>Profile Photo: (Half Body Required)</label>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                        const file = e.target.files[0];
                        setDoctorProfile(prev => ({ ...prev, profile_picture: file }));
                    }}
                    />

                    {doctorProfile.profile_picture && (
                    <img
                        src={
                        typeof doctorProfile.profile_picture === "string"
                            ? doctorProfile.profile_picture
                            : URL.createObjectURL(doctorProfile.profile_picture)
                        }
                        className="doctor-photo-preview"
                        alt="Preview"
                    />
                    )}
                <label>First Name</label>
                <input
                    value={doctorProfile.first_name}
                    onChange={e => setDoctorProfile({ ...doctorProfile, first_name: e.target.value })}
                />

                <label>Last Name</label>
                <input
                    value={doctorProfile.last_name}
                    onChange={e => setDoctorProfile({ ...doctorProfile, last_name: e.target.value })}
                />

                <label>Email</label>
                <input
                    value={doctorProfile.email}
                    onChange={e => setDoctorProfile({ ...doctorProfile, email: e.target.value })}
                />

                <label>Mild Illness</label>
                <input
                    value={doctorProfile.mild_illness}
                    onChange={e => setDoctorProfile({ ...doctorProfile, mild_illness: e.target.value })}
                />

                <label>Symptoms</label>
                <input
                    value={doctorProfile.symptoms}
                    onChange={e => setDoctorProfile({ ...doctorProfile, symptoms: e.target.value })}
                />

                <label>Availability Date</label>
                <input
                    type="date"
                    value={doctorProfile.availability_date || ""}
                    onChange={e => setDoctorProfile({ ...doctorProfile, availability_date: e.target.value })}
                />

                <label>Availability Time</label>
                <input
                    type="time"
                    value={doctorProfile.availability_time || ""}
                    onChange={e => setDoctorProfile({ ...doctorProfile, availability_time: e.target.value })}
                />

                <button type="submit" className="btn-save">
                    Save Changes
                </button>
                </form>
            </section>
            )}

            {activePage === "appointments" && (
                <section className="appointments-panel">
                    <h2>Appointment Requests</h2>

                    <table className="appointment-table">
                    <thead>
                        <tr>
                        <th>Patient</th>
                        <th>Condition</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {appointments.map(appt => (
                        <tr key={appt.id}>
                            <td>{appt.patient_name}</td>
                            <td>{appt.mild_illness} - {appt.symptoms}</td>
                            <td>{formatDateLong(appt.appointment_date)}</td>
                            <td>{formatTime12h(appt.appointment_time)}</td>
                            <td>
                            <span className={`status-badge ${appt.status}`}>
                                {appt.status}
                            </span>
                            </td>
                            <td>
                            {appt.status === "pending" ? (
                                <div className="action-buttons">
                                <button
                                    className="btn-accept"
                                    onClick={() => handleAction(appt.id, "accepted")}
                                >
                                    Accept
                                </button>

                                <button
                                    className="btn-reject"
                                    onClick={() => handleAction(appt.id, "rejected")}
                                >
                                    Reject
                                </button>
                                </div>
                            ) : (
                                <span className="action-done">✔ Completed</span>
                            )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </section>
                )}
            <section className="notification-panel" aria-live="polite">
          <div className="notif-header">
            <h3>Notifications</h3>
            <small className="notif-meta">2 new • last updated 10m ago</small>
          </div>
          <p className="notif-text">You have new appointment requests. Click a card to view patient details.</p>

          <div className="notif-actions">
            <button className="btn-small">View Requests</button>
            <button className="btn-ghost">Mark all read</button>
          </div>
        </section>
      </main>
    </div>
  );
}







