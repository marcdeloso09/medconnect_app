// PatientRequest.jsx
import React, { useState } from "react";
import "./PatientRequest.css";
import { Link } from "react-router-dom";
import stethoscope from "../Files/stethoscope.png";
import agent from "../Files/agents.png";
import api from "../../../api"; // ensure this points to your frontend api.js
import { formatTime12h } from "../utils/time";
import { formatDateLong } from "../utils/time";

export default function PatientRequest() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hello! I'm HealthConnect AI. Here to help you with your appointment" },
    { from: "ai", text: "What are you feeling right now?" }
  ]);

  const [step, setStep] = useState(0);
  const [illness, setIllness] = useState("");
  const [symptom, setSymptom] = useState("");
  const [showChoices, setShowChoices] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showBookButton, setShowBookButton] = useState(false);

  const [doctors, setDoctors] = useState([]);      // matched doctors
  const [showDoctors, setShowDoctors] = useState(false); // when true, chat is hidden and doctor list shown
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const chatEndRef = React.useRef(null);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [duration, setDuration] = useState("");
  const [appointmentData, setAppointmentData] = useState({
    full_name: localStorage.getItem("patientName") || "",
    email: localStorage.getItem("patientEmail") || "",
    date: "",
    time: ""
  });

  const addAIMessageWithTyping = (text, delay = 900) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "ai", text }]);
      setIsTyping(false);
    }, delay);
  };

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showBookButton, showDoctors, doctors]);

  React.useEffect(() => {
    if (showChat) {
      setShowChoices(false);
      const timer = setTimeout(() => setShowChoices(true), 800);
      return () => clearTimeout(timer);
    }
  }, [step, showChat]);

  React.useEffect(() => {
    if (step === 3) {
      setShowBookButton(false);
      const timer = setTimeout(() => setShowBookButton(true), 900);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const mildIllness = [
    "Common Cold",
    "Flu (Influenza)",
    "Headaches and Migraines",
    "Sore Throats and Earaches",
    "Hay Fever / Allergies",
    "Constipation",
    "Heartburn / Indigestion",
    "Skin and Minor Injuries"
  ];

  const symptomsByIllness = {
    "Headaches and Migraines": ["Nausea", "Light sensitivity", "Throbbing pain"],
    "Common Cold": ["Runny nose", "Sneezing", "Cough"],
    "Flu (Influenza)": ["Fever", "Fatigue", "Body pain"],
    "Sore Throats and Earaches": ["Throat pain", "Ear pressure"],
    "Hay Fever / Allergies": ["Itchy eyes", "Runny nose"],
    "Constipation": ["Bloating", "Hard stools"],
    "Heartburn / Indigestion": ["Burning chest", "Acid reflux"],
    "Skin and Minor Injuries": ["Acne", "Eczema", "Impetigo", "Minor Burns", "Sunburn", "Bruises", "Insect Bites"]
  };

  const durationOptions = [
    "Within 24 hours",
    "1-3 days",
    "4-7 days",
    "1-2 weeks",
    "More than 2 weeks"
  ];

  // fetch matched doctors from backend using current illness & symptom
  const fetchMatchedDoctors = async () => {
    try {
      const params = {
        mild_illness: illness,
        symptoms: symptom
        // optionally add availability_date/time
      };
      const res = await api.get("", { params });
      setDoctors(res.data || []);
      // Note: do not set showDoctors here — handled by caller
      setMessages(prev => [...prev, { from: "ai", text: `Found ${res.data?.length || 0} matching doctor(s).` }]);
    } catch (err) {
      console.error("Error fetching doctors:", err.response?.data || err.message);
      setMessages(prev => [...prev, { from: "ai", text: "Sorry — couldn't find doctors at the moment. Try again later." }]);
      setDoctors([]);
    }
  };

  // called when the Book Appointment Now is clicked
 const handleBookNow = async () => {
  setMessages(prev => [...prev, { from: "user", text: "Book Appointment Now" }]);

  setIsTyping(true);
  setIsLoadingDoctors(true);

  setTimeout(async () => {
    setMessages(prev => [
      ...prev,
      { from: "ai", text: "Checking available doctors that match your condition..." }
    ]);

    await fetchMatchedDoctors();

    setTimeout(() => {
      setIsTyping(false);
      setIsLoadingDoctors(false);
      setShowChat(false);
      setShowDoctors(true);
    }, 2000); // ⏳ delay before showing doctors

  }, 1000); // ⏳ delay before AI message
};


  return (
    <div className="patient-wrapper">

      <div className="patient-header">
        <div className="logo-box">
          <img src={stethoscope} alt="Stethoscope Logo" className="logo-img" />
        </div>
        <div className="title-box">
          <h1>Med Connect</h1>
          <p>AI Medical Platform</p>
        </div>
      </div>

      {!showChat && !showDoctors && (
        <div className="disclaimer-card">
          <div className="alert-icon">
            <div className="icon-circle-alert" style={{ fontSize: '25px' }}>⚠</div>
          </div>

          <h2 className="disclaimer-title" style={{textAlign: 'center'}}>Medical Disclaimer</h2>

          <div className="notice-box">
            <h4>Notice</h4>
            <ul>
              <li>Patient Appointment Helper only</li>
              <li>Not medical advice substitute</li>
              <li>Always consult professionals</li>
            </ul>
          </div>

          <div className="emergency-box">
            <h4>Emergency</h4>
            <p>Seek immediate care for:</p>
            <ul>
              <li>Chest pain / breathing difficulty</li>
              <li>Severe bleeding</li>
              <li>Stroke signs</li>
            </ul>
            <strong className="call-text">🚨 Call 911</strong>
          </div>
          <br />
          <button className="btn start" onClick={() => setShowChat(true)}>Start</button>
          <button className="btn back"><Link to={'/'}>Back</Link></button>
        </div>
      )}

      {/* CHATBOX: hidden when showDoctors=true */}
      {showChat && !showDoctors && (
        <div className="chatbox">

          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-circle">
                <img src={agent} className="chat-logo-img" alt="agent" />
              </div>
              <div>
                <strong>Med Connect</strong> <br />
                <span>AI Patient Appointment Helper</span>
              </div>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={msg.from === "ai" ? "bot-row" : "user-row"}>
                {msg.from === "ai" && (
                  <div className="chat-circle">
                    <img src={agent} className="chat-logo-img" alt="Agent"/>
                  </div>
                )}
                <div className="bot-message">{msg.text}</div>
              </div>
            ))}

            {isTyping && (
              <div className="bot-row">
                <div className="chat-circle">
                  <img src={agent} alt="AI typing" className="chat-logo-img" />
                </div>
                <div className="bot-message typing">Typing...</div>
              </div>
            )}

            {step === 0 && showChoices && (
              <div className="choice-boxes">
                {mildIllness.map(item => (
                  <button key={item} onClick={() => {
                    setIllness(item);
                    setMessages(prev => [...prev, { from: "user", text: item }]);
                    addAIMessageWithTyping("I'll ask follow-up questions to better understand your condition.", 1000);
                    addAIMessageWithTyping("Please tell me the symptoms you are experiencing.", 2000);
                    setStep(1);
                  }}>{item}</button>
                ))}
              </div>
            )}

            {step === 1 && showChoices && (
              <div className="choice-boxes">
                {symptomsByIllness[illness].map(item => (
                  <button key={item} onClick={() => {
                    setSymptom(item);
                    setMessages(prev => [...prev, { from: "user", text: item }]);
                    addAIMessageWithTyping("How long have you been experiencing this?", 1000);
                    setStep(2);
                  }}>{item}</button>
                ))}
              </div>
            )}

            {step === 2 && showChoices && (
              <div className="choice-boxes">
                {durationOptions.map(item => (
                  <button key={item} onClick={() => {
                    setDuration(item);
                    setMessages(prev => [...prev, { from: "user", text: item }]);
                    addAIMessageWithTyping(`You selected ${illness} with symptom ${symptom} for ${item}.`, 1200);
                    setStep(3);
                  }}>{item}</button>
                ))}
              </div>
            )}

            {step === 3 && showBookButton && (
              <button className="btn book" onClick={handleBookNow}> 🗓️ Book Appointment Now </button>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="chat-emergency">
            ⚠ Emergency: Call 911 for severe symptoms
          </div>
        </div>
      )}

      {/* DOCTOR RESULTS replaces the chatbox when showDoctors=true */}
     {showDoctors && (
      <div className="doctor-results-container">

        {isLoadingDoctors && (
          <div className="loading-doctors">
            <p>Finding available doctors...</p>
          </div>
        )}

        {!isLoadingDoctors && (
          <div className="doctor-results">
            <h3 className="doctor-results-title">Available Doctors</h3>

            {doctors.length === 0 && <p className="no-results">No matching doctors found.</p>}

            {doctors.map(doc => (
              <div key={doc.id} className="doctor-card">
                <div className="doctor-left">
                  <div className="doctor-avatar">
                  {doc.profile_picture ? (
                    <img src={doc.profile_picture} alt="Doctor" className="doctor-image" />
                  ) : (
                    <span>
                      {(doc.first_name && doc.last_name)
                        ? `${doc.first_name.charAt(0)}${doc.last_name.charAt(0)}`
                        : "D"}
                    </span>
                  )}
                </div>
                  <div className="doctor-meta">
                    <div className="doctor-name">Dr. {doc.first_name} {doc.last_name}</div>
                    <div className="doctor-specialty">{doc.specialty || 'General'}</div>
                  </div>
                </div>

                <div className="doctor-right">
                  <div className="doctor-availability">
                    <div className="avail-date">Available Date: {formatDateLong(doc.availability_date)}</div>
                    <div className="avail-time">Available time: {formatTime12h(doc.availability_time)}</div>
                  </div>
                  <button className="btn-small" onClick={() => {
                    setSelectedDoctor(doc);
                    setShowAppointmentForm(true);
                  }}>
                    Book
                  </button>
                </div>
              </div>
            ))}

            {showAppointmentForm && (
              <div className="appointment-form-container">
                <h3>Book Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</h3>

                <input
                  placeholder="Full Name"
                  value={appointmentData.full_name}
                  onChange={e => setAppointmentData({...appointmentData, full_name: e.target.value})}
                />

                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={appointmentData.email}
                  onChange={e => setAppointmentData({...appointmentData, email: e.target.value})}
                />

                <input disabled value={illness} />
                <input disabled value={symptom} />

                <input
                  type="date"
                  id="email"
                  value={appointmentData.date}
                  onChange={e => setAppointmentData({...appointmentData, date: e.target.value})}
                />

                <input
                  type="time"
                  id="email"
                  value={appointmentData.time}
                  onChange={e => setAppointmentData({...appointmentData, time: e.target.value})}
                />

                <button className="btn book" onClick={async () => {
                  try {
                    await api.post("doctors/appointments/create/", {
                      doctor: selectedDoctor.id,
                      patient_name: appointmentData.full_name,
                      patient_email: appointmentData.email,
                      mild_illness: illness,
                      symptoms: symptom,
                      appointment_date: appointmentData.date,
                      appointment_time: appointmentData.time
                    });

                    alert(" Appointment request sent!");
                    setShowAppointmentForm(false);
                  } catch (error) {
                    console.error(error);
                    alert(" Failed to book appointment");
                  }
                }}>
                 Book Dr. {selectedDoctor.first_name} Now
                </button>
              </div>
            )}

            <div className="back-to-chat">
              <button className="btn-ghost" onClick={() => { setShowDoctors(false); setShowChat(true); }}>Back to Chat</button>
            </div>
        </div>
    )}
  </div>
)}

      <Link to="/">
        <div className="home-btn">✕ Home</div>
      </Link>

    </div>
  );
}
