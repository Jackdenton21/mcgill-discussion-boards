import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import RegistrationSuccess from './RegistrationSuccess';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={
              <>
                <p>Welcome to the Login Page!</p>
                <LoginForm />
                <hr />
                <p>Need an account? <Link to="/register">Register here</Link></p>
              </>
            } />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
