import React from "react";
import "../componentsCss/LeaveTable.css";

const LeaveTable = ({ display }) => {
  if (!display || !display.data) return null;

  const { type, data } = display;

  return (
    <table className="leave-table">
      <thead>
        <tr>
          {type === "employees" && (
            <>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Position</th>
            </>
          )}

          {(type === "activeLeaves" ||
            type === "pendingRequests" ||
            type === "payrollAlerts") && (
            <>
              <th>Employee</th>
              <th>Type</th>
              <th>StartDate</th>
              <th>EndDate</th>
              <th>Days</th>
              <th>Status</th>
            </>
          )}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
              No data available
            </td>
          </tr>
        ) : (
          data.map((item, i) => (
            <tr key={i}>
              {type === "employees" && (
                <>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                  <td>{item.department}</td>
                  <td>{item.position}</td>
                </>
              )}

              {(type === "activeLeaves" ||
                type === "pendingRequests" ||
                type === "payrollAlerts") && (
                <>
                  <td>{item.employeeId?.name || "Unknown"}</td>
                  <td>{item.type}</td>
                  <td>{item.startDate}</td>
                  <td>{item.endDate}</td>
                  <td>{item.wantLeave}</td>
                  <td className={item.status}>{item.status}</td>
                </>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default LeaveTable;
