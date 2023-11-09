import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', { username, password });
      // Check if response.data exists before accessing properties
      if (response.data) {
        console.log('Registration successful:', response.data);
        // Handle successful registration, e.g., show a success message
      } else {
        console.error('Registration error: Unexpected response format');
      }
    } catch (error) {
      // Handle registration error
      console.error('Registration error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <form onSubmit={handleRegistration}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm;
