import './RegistrationSuccess.css';
import React, { useEffect, useState } from 'react';


function RegistrationSuccess() {

  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem('registeredUsername');
    setUsername(storedUsername || 'User');
  }, []);

  return (
    <div className="Home">
      <Sidebar />
      <Chat username={username} />
    </div>
  );
}

function Sidebar() {
  // Placeholder channels
  const channels = ['general', 'help', 'react', 'random'];

  return (
    <div className="Sidebar">
      <div className="Sidebar-header">Slack Clone</div>
      <div className="Channels">
        <div className="Channels-title">Channels</div>
        {channels.map((channel) => (
          <div key={channel} className="Channel">
            #{channel}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chat({ username }) {
  return (
    <div className="Chat">
      <div className="Chat-header">
        <div className="Chat-header-title">#general</div>
        <div className="Chat-header-details">Details</div>
      </div>
      <div className="Chat-messages">
        {/* This would be replaced by the actual messages */}
        <div className="Message">Welcome to #general, {username}!</div>
      </div>
      <div className="Chat-input">
        <input type="text" placeholder="Type a message here..." />
      </div>
    </div>
  );
}

export default RegistrationSuccess;

