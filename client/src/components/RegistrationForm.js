import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory



const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate hook



  const handleRegistration = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    try {
      const response = await axios.post('http://localhost:3001/register', { username, password });
      // Check if response.data exists before accessing properties
      if (response.data) {
        console.log('Registration successful:', response.data);
        navigate('/');
      } else {
        console.error('Registration error: Unexpected response format');
      }
    } catch (error) {
      // Handle registration error
      setError("Username already exist")
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
      {error && <p className="error">{error}</p>}

    </form>
  );
};

export default RegistrationForm;
