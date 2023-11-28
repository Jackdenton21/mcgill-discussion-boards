import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../AuthContext'; // Import useAuth
import '../styles/Header.css';

function Header({ onContactAdded }) {
  const navigate = useNavigate();
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

  const handleDiscussionBoardsClick = () => {
    // Navigate to the "discussion-board" route when "Discussion Boards" is clicked
    navigate('/discussion-board');
  };

  return (
    <header className="AppHeader">
      {/* Add onClick handler to navigate to the "discussion-board" route */}
      <h1>McGill Chat</h1>
      <h2 onClick={handleDiscussionBoardsClick}>Discussion Boards</h2>

      <div className="HeaderUsername">
        <div className="UsernameButton" onClick={handleToggleDropdown}>
          {username}
        </div>
        {showDropdown && (
          <div className="DropdownMenu" ref={dropdownRef}>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
