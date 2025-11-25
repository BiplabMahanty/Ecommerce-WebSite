import React from "react";
import "../componentsCss/Topbar.css";

const Topbar = ({ searchText, setSearchText, setSelectedTable }) => {
  return (
    <div className="topbar">
      <h2>Employee Dashboard</h2>

      <input
        className="input"
        type="text"
        placeholder="Search here..."
        style={{ width: "260px" }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </div>
  );
};

export default Topbar;
