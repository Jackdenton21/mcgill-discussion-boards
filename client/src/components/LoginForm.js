import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../AuthContext'; 
import { ROUTE } from '../globals';



const LoginForm = () => {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  const { login } = useAuth(); 


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      const response = await axios.post(ROUTE+'/login', { userOrEmail, password });

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
    <form className='login-form' onSubmit={handleLogin}>
      <label>
        Username or Email:
        <input type="text" value={userOrEmail} onChange={(e) => setUserOrEmail(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className='login-button' type="submit">Login</button>
      {error && <p className="error">{error}</p>}

    </form>
  );
};

export default LoginForm;
