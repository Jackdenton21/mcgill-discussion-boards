import React, { useState } from 'react';
import "../styles/SideBar.css";

const SideBar = ({ channels, onAddChannel, onSelectChannel }) => {
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState(null);

  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      onAddChannel(newChannelName);
      setNewChannelName('');
    }
  };

  const handleChannelClick = (channel) => {
    // Call the parent component's function to notify about the selected channel
    onSelectChannel(channel._id);
    setSelectedChannelId(channel._id); // Update the selected channel id
  };

  return (
    <div className="sidebar-container">
      <h2>Channels</h2>
      <div className="sidebar-list">
  {channels.map((channel) => (
    <div
      key={channel._id}
      onClick={() => handleChannelClick(channel)}
      className={
        selectedChannelId === channel._id ||
        (selectedChannelId === null && channel.name === 'General')
          ? 'selected-channel'
          : ''
      }    >
      # {channel.name}
    </div>
  ))}
</div>
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
