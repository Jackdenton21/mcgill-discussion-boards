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
        onClose();
    };

    const handleDeleteDiscussionBoard = () => {
        onDeleteDiscussionBoard();
        onClose();
    };

    
    return (
    <div className="popup-overlay">
      <div className="manage-channels-popup">
        <h2>Settings</h2>
        <br>
        </br>
        <h3>Add a Channel:</h3>
        <div className="add-channel-container">
            <input
            type="text"
            placeholder="New Channel Name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            />
            <button onClick={handleAddChannel} className="add-channel-button">Add Channel</button>
        </div>
        <br>
        </br>
        <button onClick={() => handleDeleteDiscussionBoard()}>Leave This Discussion Board</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ManageChannels;
