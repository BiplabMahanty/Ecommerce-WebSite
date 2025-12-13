import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from './components/Login';
import ChangePasswordPage from './components/ChangePassword';
import Sidebar from './components/Sidebar';
import { EmployeeRoutes } from './routes/EmployeeRoutes';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/employee" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* EMPLOYEE PANEL */}
        <Route path="/employee" element={<Sidebar />}>
          {EmployeeRoutes}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
