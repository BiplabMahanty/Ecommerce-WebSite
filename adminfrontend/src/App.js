import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import AddRockstarShift from './components/AddRockstarShift';
import Sidebar from './components/Sidebar';
import Login from './verificationPage/Login';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>

        <Route path='/' element={<Navigate to='/Sidebar' />} />

        <Route path='/login' element={<Login />} />

        <Route path='/Sidebar' element={<Sidebar />} />

        <Route path='/AddRockstarShift' element={<AddRockstarShift />} />

      </Routes>
    </div>
  );
}

export default App;
