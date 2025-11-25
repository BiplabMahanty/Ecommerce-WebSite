import React from "react";
import "../componentsCss/DashboardCard.css";

const DashboardCard = ({ title, count }) => {
  return (
    <div className="dash-card">
      <h3>{title}</h3>
      <p>{count}</p>
    </div>
  );
};

export default DashboardCard;
