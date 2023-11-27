import React from 'react';
import "../styles/SideBar.css";

const SideBar = () => {
  return (
    <div className="sidebar-container">
      <h2>Channels</h2>
      <ul className="sidebar-list">
        {/* Add your dummy channel items here */}
        <li>#channel1 </li>
        <li>#channel2</li>
        <li>#channel3</li>
      </ul>
      <button className="add-channel-button">Add Channel</button>
    </div>
  );
};

export default SideBar;
