import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Login.css';
import { ROUTE } from '../globals';

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  
  const handleRegistration = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      const response = await axios.post(ROUTE+'/register', { username, password, email });
      if (response.data) {
        console.log('Registration successful:', response.data);
        navigate('/');
      } else {
        console.error('Registration error: Unexpected response format');
      }
    } catch (error) {
      setError("Username or Email already exist")
      console.error('Registration error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="register-container">
    <h1 className='register-title'>McGill Discussions</h1>

    <form className="registration-form" onSubmit={handleRegistration}>
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

      <button className="login-button" type="submit">Register</button>
      {error && <p className="error">{error}</p>}

    </form>
    </div>
  );
};

export default RegistrationForm;
