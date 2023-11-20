import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
//import '../styles.css'; // Adjust the path as necessary


const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate hook


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });

      if (response.status === 200 && response.data.user && response.data.token) {
        console.log('Login successful:', response.data);
        localStorage.setItem('registeredUsername', username);
        navigate('/discussion-board');

      } else {
        setError('Login failed: Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError('Login failed: Invalid username or password');
    }
  };


  return (
    <form onSubmit={handleLogin}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Login</button>
      {error && <p className="error">{error}</p>}

    </form>
  );
};

export default LoginForm;
