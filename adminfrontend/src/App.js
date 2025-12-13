// adminfrontend/src/App.js
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import Login from './verificationPage/Login';
import Sidebar from './components/Sidebar';
import { AdminRoutes } from './routes/AdminRoutes';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<Login />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin" element={<Sidebar />}>
          {AdminRoutes}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
