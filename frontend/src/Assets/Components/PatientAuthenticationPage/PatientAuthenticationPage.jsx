import "./PatientAuthenticationPage.css";
import stethoscope from "../Files/stethoscope.png";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import api from "../../../api";

export default function PatientAuthentication() {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
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
        password: formData.password,
        confirm_password: formData.confirm_password
      };

      const res = await api.post("patients/register/", payload);

      if (res.status === 201 || res.status === 200) {
        localStorage.setItem("patientName", `${formData.first_name} ${formData.last_name}`);
        alert("Patient Registered Successfully");
        setIsLogin(true);
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
      const res = await api.post("patients/login/", loginData);
        localStorage.setItem("patientToken", res.data.access);
        localStorage.setItem("patientName", res.data.full_name);
        localStorage.setItem("patientEmail", res.data.email);
        navigate("/patient-dashboard");
        alert("Successfully Logged In");
    } catch {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="patient-wrapper">

      <div className="patient-header">
        <div className="logo-box">
          <img src={stethoscope} alt="Logo" className="logo-img" />
        </div>
        <div className="title-box">
          <h1>Med Connect</h1>
          <p>Patient Authentication</p>
        </div>
      </div>

      <div className="auth-card">
        {isLogin ? (
          <form onSubmit={handleLogin} className="patient-form">
            <h2>Patient Login</h2>
            <input type="email" name="email" onChange={handleLoginChange} placeholder="Email" required />
            <input type="password" name="password" onChange={handleLoginChange} placeholder="Password" required />
            <button className="patient-btn">Login</button>
            <p className="switch-auth">
              Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="patient-form">
            <h2>Patient Registration</h2>

            <div className="form-row">
              <input name="first_name" onChange={handleChange} placeholder="First Name" required />
              <input name="last_name" onChange={handleChange} placeholder="Last Name" required />
            </div>

            <input type="email" name="email" onChange={handleChange} placeholder="Email" required />

            <div className="form-row">
              <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
              <input type="password" name="confirm_password" onChange={handleChange} placeholder="Confirm Password" required />
            </div>

            <button type="submit" className="patient-btn">Create Account</button>
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
