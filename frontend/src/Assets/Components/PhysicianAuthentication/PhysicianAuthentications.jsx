import "./PhysicianAuthentications.css";
import stethoscope from "../Files/stethoscope.png";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import api from "../../../api";

export default function PhysicianAuthentication() {
  const [isLogin, setIsLogin] = useState(false);
  const [selectedIllness, setSelectedIllness] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    specialty: "",
    mild_illness: "",
    symptoms: "",
    availability_date: "",
    availability_time: "",
    password: "",
    confirm_password: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = e => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        specialty: formData.specialty,
        mild_illness: selectedIllness,
        symptoms: selectedSymptom,
        availability_date: formData.availability_date ,
        availability_time: formData.availability_time.slice(0,5) ,
        password: formData.password,
        confirm_password: formData.confirm_password
      };

      const res = await api.post("doctors/register/", payload);
      if (res.status === 201 || res.status === 200) {
        alert("Doctor Registered Successfully");
        setIsLogin(true);
      } else {
        alert("Registration returned status: " + res.status);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);

      if (error.response && typeof error.response.data === "object") {
        const messages = Object.entries(error.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n");

        alert("Registration Failed:\n" + messages);
      } else {
        alert("Registration Failed:\n" + (error.response?.data || "Server error"));
      }
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("doctors/login/", {
      username: loginData.email,
      password: loginData.password
    });
    localStorage.setItem("doctorToken", res.data.access);
    navigate("/physician-dashboard");
    alert("Successfully Logged In")
  } catch {
    alert("Invalid Credentials");
  }
};


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

return (
    <div className="physician-wrapper">

      <div className="physician-header">
        <div className="logo-box">
          <img src={stethoscope} alt="Logo" className="logo-img" />
        </div>
        <div className="title-box">
          <h1>Med Connect</h1>
          <p>Doctor Authentication</p>
        </div>
      </div>

      <div className="auth-card">
        {isLogin ? (
          <form onSubmit={handleLogin} className="doctor-form">
            <h2>Doctor Login</h2>
            <input type="email" name="email" onChange={handleLoginChange} placeholder="Email" required />
            <input type="password" name="password" onChange={handleLoginChange} placeholder="Password" required />
            <button className="doctor-btn">Login</button>
            <p className="switch-auth">
              Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="doctor-form">
            <h2>Doctor Registration</h2>
             <p className="availability-title">Please fill the following:</p>
            <div className="form-row">
              <input name="first_name" onChange={handleChange} placeholder="First Name" required />
              <input name="last_name" onChange={handleChange} placeholder="Last Name" required />
            </div>

            <input type="email" name="email" onChange={handleChange} placeholder="Email" required />
            <input type="text" name="specialty" onChange={handleChange} placeholder="Specialty" required />

            <select onChange={e => setSelectedIllness(e.target.value)}>
              <option value="">Assess Mild Illness in</option>
              {mildIllness.map(item => <option key={item}>{item}</option>)}
            </select>

            <select onChange={e => setSelectedSymptom(e.target.value)} disabled={!selectedIllness}>
              <option value="">Select Symptom</option>
              {selectedIllness && symptomsByIllness[selectedIllness].map(s => <option key={s}>{s}</option>)}
            </select>
            <p className="availability-title">Availability Section: Date and Time</p>
            <div className="form-row">
              <input type="date" name="availability_date" onChange={handleChange} required />
              <input type="time" name="availability_time" onChange={handleChange} required />
            </div>
            <p className="availability-title">Password:</p>
            <div className="form-row">
              <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
              <input type="password" name="confirm_password" onChange={handleChange} placeholder="Confirm Password" required />
            </div>

            <button type="submit" className="doctor-btn">Create Account</button>
            <p className="switch-auth">
              Already have an account? <span onClick={() => setIsLogin(true)}>Login</span>
            </p>
          </form>
        )}
      </div>
      <Link to="/">
        <div className="home-btn">✕ Home</div>
      </Link>
    </div>
  );
}