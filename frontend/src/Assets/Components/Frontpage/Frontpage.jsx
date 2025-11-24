import React from "react";
import "./Frontpage.css";
import { Link } from "react-router-dom";
import stethoscope from "../Files/stethoscope.png";

export const Frontpage = () => {
  return (
   <div className="frontpage">
      <div className="header">
        <div className="logo-box">
          <img src={stethoscope} alt="Stethoscope Logo" className="logo-img" />
        </div>
        <div className="title-box">
          <h1>Med Connect</h1>
          <p>AI Medical Platform</p>
        </div>
      </div>

      <div className="role-card">
        <h2>Choose Your Role</h2>

        {/* PATIENT */}
        <Link to="patient" className="role-option patient">
          <div className="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
            </svg>
          </div>
          <div className="role-text">
            <h3>I am a Patient</h3>
            <span>Get AI assessment</span>
          </div>
        </Link>

        {/* DOCTOR */}
        <Link to="doctor" className="role-option doctor">
          <div className="icon-circle">
            <img src={stethoscope} alt="Doctor" className="logo-img" />
          </div>
          <div className="role-text">
            <h3>I am a Doctor</h3>
            <span>Access dashboard</span>
          </div>
        </Link>

      </div>
    </div>
  )
}
