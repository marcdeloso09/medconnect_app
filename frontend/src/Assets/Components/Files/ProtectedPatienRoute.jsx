import { Navigate } from "react-router-dom";

export default function ProtectedPatientRoute({ children }) {
  const token = localStorage.getItem("patientToken");
  return token ? children : <Navigate to="/patient" />;
}
