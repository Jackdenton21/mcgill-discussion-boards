import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/Login.css'; // Import the CSS file

function Login() {
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <div className="login-container"> 
            <h1>McGill Slack clone!</h1>
            <LoginForm />
            <p>Need an account? <button onClick={handleRegisterClick} className="App-link">Register here</button></p>
        </div>
    );
}

export default Login;
