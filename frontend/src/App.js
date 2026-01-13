import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Frontpage } from './Assets/Components/Frontpage/Frontpage';
import PatientAuthentication from './Assets/Components/PatientAuthenticationPage/PatientAuthenticationPage';
import PatientRequest from './Assets/Components/PatientRequest/PatientRequest';
import PhysicianAuthentications from './Assets/Components/PhysicianAuthentication/PhysicianAuthentications';
import PhysicianPage from './Assets/Components/PhysicianPage/PhysicianPage';
import PatientPage from "./Assets/Components/PatientPage/PatientPage";
import ProtectedPatientRoute from "./Assets/Components/Files/ProtectedPatientRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frontpage />} />

        {/* PATIENT FLOW */}
        <Route path="/patient" element={<PatientAuthentication />} />
        <Route path="/patient/request" element={<PatientRequest />} />
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedPatientRoute>
              <PatientPage />
            </ProtectedPatientRoute>
          }
        />
        {/* DOCTOR FLOW */}
        <Route path="/doctor" element={<PhysicianAuthentications />} />
        <Route path="/physician-dashboard" element={<PhysicianPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
