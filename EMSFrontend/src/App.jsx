import './App.css'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from './adminVerificationPage/Login'
import EmployeeLogin from './employeeComponents/Login'
import Sidebar from './adminComponents/Sidebar'
import EmpSidebar from './employeeComponents/Sidebar'
import LandingPage from './LandingPage'
import { AdminRoutes } from './routes/AdminRoutes'
import { EmployeeRoutes } from './routes/EmployeeRoutes'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />

        <Route path="/admin" element={<Sidebar />}>
          {AdminRoutes}
        </Route>

        <Route path="/employee" element={<EmpSidebar />}>
          {EmployeeRoutes}
        </Route>
      </Routes>
    </div>
  )
}

export default App
