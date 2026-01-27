import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PhysicianPage.css";
import api from "../../../api";
import { formatTime12h } from "../utils/time";
import { formatDateLong } from "../utils/time";
import LocationPicker from "../LocationPicker";

export default function PhysicianPage() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [sameSpecialtyDoctors, setSameSpecialtyDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  
  const loadSameSpecialtyDoctors = async () => {
    try {
      const token = localStorage.getItem("doctorToken");
      const res = await api.get("doctors/same-specialty/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSameSpecialtyDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors", err);
    }
  };

    useEffect(() => {
    const token = localStorage.getItem("doctorToken");

    api.get("doctors/appointments/doctor/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAppointments(res.data))
    .catch(err => console.error("Appointment load error:", err));

    }, []);

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
  profile_picture: null,
  latitude: "",
  longitude: "",
  clinic_address: ""
});


const handleAction = async (id, action) => {
  try {
    const token = localStorage.getItem("doctorToken");

    const res = await api.post(`doctors/appointments/action/${id}/`, { action }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAppointments(prev =>
      prev.map(appt =>
        appt.id === id
          ? { ...appt, status: res.data.status } 
          : appt
      )
    );

    alert(`Appointment ${action} and email sent to patient.`);
  } catch (error) {
    console.error(error);
    alert("Failed to respond.");
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
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  return (
    <div className="physician-dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">HC</div>
          <div className="brand-text">
            <h2>MedAppoint</h2>
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
                      formData.append("latitude", doctorProfile.latitude);
                      formData.append("longitude", doctorProfile.longitude);
                      formData.append("clinic_address", doctorProfile.clinic_address);

                      if (doctorProfile.profile_picture instanceof File) {
                        formData.append("profile_picture", doctorProfile.profile_picture);
                      }

                      const res = await api.put("doctors/doctor-profile/", formData, {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      });

                      setDoctorProfile(prev => ({
                        ...prev,
                        profile_picture: res.data.profile_picture
                      }));

                      alert("Profile updated successfully!");
                    } catch (err) {
                      console.error(err);
                      alert(" Update failed");
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
                <label>Clinic Address</label>
                <input
                  value={doctorProfile.clinic_address || ""}
                  onChange={e => setDoctorProfile({ ...doctorProfile, clinic_address: e.target.value })}
                />
                              <button
                type="button"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setDoctorProfile(prev => ({
                      ...prev,
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude
                    }));
                  });
                }}
              >
                Use My Current Location
              </button>


                <label>Latitude</label>
                <input
                  value={doctorProfile.latitude || ""}
                  onChange={e => setDoctorProfile({ ...doctorProfile, latitude: e.target.value })}
                />

                <label>Longitude</label>
                <input
                  value={doctorProfile.longitude || ""}
                  onChange={e => setDoctorProfile({ ...doctorProfile, longitude: e.target.value })}
                />
                <button type="submit" className="btn-save">
                    Save Changes
                </button>
                <LocationPicker
                  lat={doctorProfile.latitude}
                  lng={doctorProfile.longitude}
                  onChange={(pos) =>
                    setDoctorProfile({
                      ...doctorProfile,
                      latitude: pos.lat,
                      longitude: pos.lng
                    })
                  }
                />

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
                                  onClick={() => {
                                    setSelectedAppointment(appt);
                                    setSelectedDoctorId(""); 
                                    loadSameSpecialtyDoctors();
                                    setShowReferralModal(true);
                                  }}
                                >
                                  Referral
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
                    {showReferralModal && (
                    <div className="modal-overlay">
                      <div className="modal-box">
                        <h3>Refer Patient</h3>

                        <select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                        >
                          <option value="">Select a doctor</option>
                          {sameSpecialtyDoctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name}
                            </option>
                          ))}
                        </select>

                        <div className="modal-actions">
                          <button
                            onClick={async () => {
                              if (!selectedDoctorId) {
                                alert("Please select a doctor.");
                                return;
                              }

                              try {
                                const token = localStorage.getItem("doctorToken");

                                const res = await api.post(
                                        `doctors/appointments/action/${selectedAppointment.id}/`,
                                        {
                                          action: "referral",
                                          referred_doctor_id: selectedDoctorId
                                        },
                                        {
                                          headers: { Authorization: `Bearer ${token}` }
                                        }
                                      );
                                      
                                      setAppointments(prev =>
                                        prev.filter(a => a.id !== selectedAppointment.id)
                                      );

                                alert("Referral sent.");
                                setShowReferralModal(false);
                                setSelectedDoctorId("");
                              } catch (err) {
                                console.error(err);
                                alert("Referral failed");
                              }
                            }}
                          >
                            Send Referral
                          </button>

                          <button onClick={() => setShowReferralModal(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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







