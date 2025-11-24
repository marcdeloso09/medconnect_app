
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Frontpage } from './Assets/Components/Frontpage/Frontpage';
import PatientRequest from './Assets/Components/PatientRequest/PatientRequest';
import PhysicianAuthentications from './Assets/Components/PhysicianAuthentication/PhysicianAuthentications';
import PhysicianPage from './Assets/Components/PhysicianPage/PhysicianPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frontpage />}/>
        <Route path="patient" element={<PatientRequest />} />
        <Route path="doctor" element={<PhysicianAuthentications />} />
        <Route path="/physician-dashboard" element={<PhysicianPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
