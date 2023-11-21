import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import '../styles/Login.css'; // Import the CSS file
import { ROUTE } from '../constants';


const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate hook



  const handleRegistration = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    try {
      const response = await axios.post(ROUTE+'/register', { username, password, email });
      // Check if response.data exists before accessing properties
      if (response.data) {
        console.log('Registration successful:', response.data);
        navigate('/');
      } else {
        console.error('Registration error: Unexpected response format');
      }
    } catch (error) {
      // Handle registration error
      setError("Username or Email already exist")
      console.error('Registration error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="register-container">
    <h1>McGill Slack clone!</h1>

    <form onSubmit={handleRegistration}>
      <label>
        Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
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
    </div>
  );
};

export default RegistrationForm;
