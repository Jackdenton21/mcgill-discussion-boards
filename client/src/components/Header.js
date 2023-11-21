// Header.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/Header.css';
//import ContactPopup from './ContactPopup'; // Import the ContactPopup component
import { useNavigate } from 'react-router-dom';

function Header({ onContactAdded }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleToggleContactPopup = () => {
    setIsContactPopupOpen(prevState => !prevState);
  };

  const handleLogout = () => {
    // Logout logic here
    
    console.log('Logging out...');
    navigate('/');
    localStorage.removeItem('registeredUsername');
    // Clear localStorage or handle logout logic
    // Redirect to login page or update state as needed
  };

  return (
    <header className="AppHeader">
      <h1>Slack clone</h1>
      <h2>Discussion Board</h2>

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
