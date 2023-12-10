import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import Login from './pages/Login';
import DiscussionBoard from './pages/AvailableBoards';
import Board from './pages/Board';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './AuthContext';

import './styles.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<RegistrationForm/>} />
              <Route path="/discussion-board" element={<ProtectedRoute><DiscussionBoard/></ProtectedRoute>} />
              <Route path="/board/:boardId" element={<ProtectedRoute><Board/></ProtectedRoute>} />
            </Routes>
          </header>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;