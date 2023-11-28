import React, { useState, useEffect, useRef } from 'react';
import '../styles/Header.css';
//import ContactPopup from './ContactPopup'; // Import the ContactPopup component
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import useAuth


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

  const handleToggleContactPopup = () => {
    setIsContactPopupOpen(prevState => !prevState);
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

  return (
    <header className="AppHeader">
      <h1>McGill Discussion Boards</h1>
      <button onClick={gotoDiscussionBoard}>Home</button>

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