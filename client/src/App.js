import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import RegistrationSuccess from './pages/RegistrationSuccess';
import DiscussionBoard from './components/discussionBoard';

import './styles.css'; // Adjust the path as necessary


function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={
              <> 
                <p>McGill Slack clone!</p>
                <LoginForm />
                <p>Need an account? <Link to="/register" className="App-link">Register here</Link></p>
              </>
            } />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/discussion-board" element={<DiscussionBoard />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;