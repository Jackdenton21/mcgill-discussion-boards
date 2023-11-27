import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
//import '../styles.css'; // Adjust the path as necessary
import { useAuth } from '../AuthContext'; // Import useAuth



const LoginForm = () => {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate hook
  const { login } = useAuth(); // Use the login function from context


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    try {
      const response = await axios.post('http://localhost:3001/login', { userOrEmail, password });

      if (response.status === 200 && response.data.user && response.data.token) {
        console.log('Login successful:', response.data);
        login(response.data.token, response.data.user.username); 
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
        Username or Email:
        <input type="text" value={userOrEmail} onChange={(e) => setUserOrEmail(e.target.value)} />
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
