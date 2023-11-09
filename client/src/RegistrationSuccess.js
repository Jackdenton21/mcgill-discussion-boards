// RegistrationSuccess.js
import React, { useEffect, useState } from 'react';

const RegistrationSuccess = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem('registeredUsername');
    setUsername(storedUsername || 'User');
  }, []);

  

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Welcome, {username}!</h1>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
