// ManageChannels.js
import React, { useEffect, useState, useRef } from 'react';
import '../styles/manageChannels.css';

function ManageChannels({existingchannels, onDeleteDiscussionBoard, onClose, onAddChannel}) {
    const [channels, setChannels] = useState([]); // State for storing channels
    const [newChannelName, setNewChannelName] = useState('');

    const handleAddChannel = () => {
        if (newChannelName.trim()) {
            console.log("Adding channel from manage channels:", newChannelName);
            onAddChannel(newChannelName);
            setNewChannelName('');
        }
    };

    const handleDeleteDiscussionBoard = () => {
        console.log("calling delete channel from manage channels");
        onDeleteDiscussionBoard();
        onClose();
    };

    
    return (
    <div className="popup-overlay">
      <div className="manage-channels-popup">
        <h2>Manage Channels</h2>
        <ul>
          {existingchannels.map((channel) => (
            <li key={channel._id}>
              {channel.name}
            </li>
          ))}
        </ul>
        <div className="add-channel-container">
            <input
            type="text"
            placeholder="New Channel Name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            />
            <button onClick={handleAddChannel} className="add-channel-button">Add Channel</button>
        </div>
        <button onClick={() => handleDeleteDiscussionBoard()}>Delete This Discussion Board</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ManageChannels;
