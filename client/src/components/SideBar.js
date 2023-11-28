import React, { useState } from 'react';
import "../styles/SideBar.css";

const SideBar = ({ channels, onAddChannel }) => {
  const [newChannelName, setNewChannelName] = useState('');

  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      onAddChannel(newChannelName); // Call the parent component's function to add the channel
      setNewChannelName('');
    }
  };

  return (
    <div className="sidebar-container">
      <h2>Channels</h2>
      <ul className="sidebar-list">
        {channels.map((channel) => (
          <li key={channel._id}>#{channel.name}</li>
        ))}
      </ul>
      <div className="add-channel-container">
        <input
          type="text"
          placeholder="New Channel Name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
        />
        <button onClick={handleAddChannel} className="add-channel-button">
          Add Channel
        </button>
      </div>
    </div>
  );
};

export default SideBar;
