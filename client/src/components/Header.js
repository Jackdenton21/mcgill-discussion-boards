import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../AuthContext'; // Import useAuth
import '../styles/Header.css';

function Header({ onContactAdded }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth(); // Use the logout function from context

  useEffect(() => {
    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem('registeredUsername');
    setUsername(storedUsername || 'User');

    // Event listener to close dropdown when clicking outside
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
    // Logout logic here
    console.log('Logging out...');
    logout(); // Call logout from context
    navigate('/');
  };


  const gotoDiscussionBoard = () => {
    navigate('/discussion-board')
  }

  // Conditionally render "Home" button based on current location
  const isDiscussionBoardPage = location.pathname === '/discussion-board';
  const showHomeButton = !isDiscussionBoardPage;

  return (
    <header className="AppHeader">
      <h1>McGill Discussion Boards</h1>

      {showHomeButton && <button onClick={gotoDiscussionBoard}>Home</button>}
      <div className="HeaderUsername">
        <p>{username}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Header;