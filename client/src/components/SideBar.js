import React, { useState } from 'react';
import "../styles/SideBar.css";
import ManageChannels from './manageChannels';

const SideBar = ({ channels, onAddChannel, onSelectChannel, onDeleteDiscussionBoard}) => {
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [isManageChannelsPopupOpen, setIsManageChannelsPopupOpen] = useState(false);


  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      console.log("Adding channel from sidebar:", newChannelName);
      onAddChannel(newChannelName);
      setNewChannelName('');
    }
  };

  const handleChannelClick = (channel) => {
    // Call the parent component's function to notify about the selected channel
    onSelectChannel(channel._id);
    setSelectedChannelId(channel._id); // Update the selected channel id
  };

  const handleOpenManageChannelsPopup = () => {
    setIsManageChannelsPopupOpen(true);
  };

  const handleCloseManageChannelsPopup = () => {
    setIsManageChannelsPopupOpen(false);
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
        <button onClick={handleOpenManageChannelsPopup} className="manage-channels-button">
          Board Settings
        </button>
      </div>
      {isManageChannelsPopupOpen && (
        <ManageChannels
          existingchannels={channels}
          onDeleteDiscussionBoard={onDeleteDiscussionBoard}
          onClose={handleCloseManageChannelsPopup}
          onAddChannel={onAddChannel}
        />
      )}
    </div>
  );
};

export default SideBar;
