import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import Login from './pages/Login';
import DiscussionBoard from './pages/AvailableBoards';
import Board from './pages/Board';

import './styles.css'; // Adjust the path as necessary


function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/discussion-board" element={<DiscussionBoard />} />
            <Route path="/board/:boardId" element={<Board />} />

          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;