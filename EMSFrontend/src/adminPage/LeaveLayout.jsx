// adminfrontend/src/adminComponents/leave/LeaveLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function LeaveLayout() {
  const tabClass = ({ isActive }) =>
    `${isActive ? "bg-yellow-500 text-black" : "bg-[#213c93] text-white"}
     rounded-xl px-8 py-3 shadow-md hover:opacity-90`;
  const token = localStorage.getItem("adminToken");
  console.log("Admin Token in LeaveLayout:", token);
  return (
    <main className="flex-1 p-8">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Leave Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8">
        <NavLink to="settings" className={tabClass}>
          Leave Settings
        </NavLink>

        <NavLink to="history" className={tabClass}>
          Leave History
        </NavLink>

        <NavLink to="leaveType" className={tabClass}>
          leaveType
        </NavLink>

        
        
      </div>

      {/* Child Route Content */}
      <Outlet />
    </main>
  );
}
