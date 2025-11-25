import './App.css';
import { Routes, Route,  Navigate} from "react-router-dom";
import Login from './components/Login'
import LeaveRequest from './components/LeaveRequest';
import Sidebar from './components/Sidebar';
import ChangePasswordPage from './components/ChangePassword';

function App() {
  return (
    <div className="App">
      <Routes>

        <Route path='/' element={<Sidebar/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/leaveRequest' element={<LeaveRequest/>}/>
        <Route path='/Sidebar' element={<Sidebar/>}/>
        <Route path="/change-password" element={<ChangePasswordPage/>} />

      </Routes>
     
    </div>
  );
}

export default App;


