import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Header.css';

function Header({ onContactAdded }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const storedUsername = localStorage.getItem('registeredUsername');
    setUsername(storedUsername || 'User');

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setShowDropdown(prevState => !prevState);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/');
  };

  const gotoDiscussionBoard = () => {
    navigate('/discussion-board');
  }

  const isDiscussionBoardPage = location.pathname === '/discussion-board';
  const showHomeButton = !isDiscussionBoardPage;

  return (
    <header className="AppHeader">
      <img src={`${process.env.PUBLIC_URL}/mcgill.png`} alt="Logo" className="header-logo" />
      <h1>McGill Discussion Boards</h1>
      {showHomeButton && <button onClick={gotoDiscussionBoard} className="home-button">View All Boards</button>}
      <div className="HeaderUsername">
        <p>{username}</p>
        <button onClick={handleLogout} className="logoutButton">Logout</button>
      </div>
    </header>
  );
}

export default Header;