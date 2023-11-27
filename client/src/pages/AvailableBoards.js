// available-boards.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AvailableBoard.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Popup from '../components/directMessageCreate';
import GroupMessageCreate from '../components/groupMessageCreate'; // Import the GroupMessageCreate component
import { ROUTE } from '../constants';

function DiscussionBoard() {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [boardsDM, setBoardsDM] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false); // New state for group discussions popup

  const navigate = useNavigate();

  const handleBoardClick = (boardName, boardId) => {
    // Navigate with both name and ID
    navigate(`/board/${boardName}`, { state: { boardName, boardId } });
  };

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const storedUsername = localStorage.getItem('registeredUsername');
      setUsername(storedUsername || 'User');

      const response = await axios.post(ROUTE + `/discussion-board`, { username: storedUsername });
      setBoards(response.data.discussions || []); // Expecting an array of board names for groups
      setBoardsDM(response.data.discussionsDM || []); // Expecting an array of board names for direct messages
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    console.log('closing');
  };

  const onBoardAdded = (boardName, boardId) => {
    fetchBoards();
    navigate(`/board/${boardName}`, { state: { boardName, boardId } });
  };

  const handleMessageAdded = (updatedContacts) => {
    console.log('Contact added. Updated contacts:', updatedContacts);
  };

  // New functions and state for group discussions popup
  const handleOpenGroupPopup = () => {
    setIsGroupPopupOpen(true);
  };

  const handleCloseGroupPopup = () => {
    setIsGroupPopupOpen(false);
  };

  const onGroupBoardAdded = (boardName, boardId) => {
    fetchBoards();
    navigate(`/board/${boardName}`, { state: { boardName, boardId } });
  };

  if (isLoading) {
    return <div className="Loading">Loading...</div>;
  }

  return (
    <div className="Home">
      <Header />
      <br />
      <br />
      <br />
      <br />

      {/* Group Discussions */}
      <div>
        <div className="main-container">
          <div className="header-container">
            <h2 className="Subtitle">Group Discussions</h2>
            <button className="round-button" onClick={handleOpenGroupPopup}>
              +
            </button>
          </div>
        </div>

        <ul className="BoardList">
          {boards.map((board, index) => (
            <li key={index} className="Board" onClick={() => handleBoardClick(board.name, board.id)}>
              {board.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Direct Message Boards */}

      <div>
        <div className="main-container">
          <div className="header-container">
            <h2 className="Subtitle">Direct Messages</h2>
            <button className="round-button" onClick={handleOpenPopup}>
              +
            </button>
          </div>
        </div>

        <ul className="BoardList">
          {boardsDM.map((board, index) => (
            <li key={index} className="Board" onClick={() => handleBoardClick(board.name, board.id)}>
              {board.name}
            </li>
          ))}
        </ul>
      </div>


      {/* Contact Popup */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <Popup onClose={handleClosePopup} onMessageAdded={handleMessageAdded} onBoardAdded={onBoardAdded} />
        </div>
      )}

      {/* Group Discussion Popup */}
      {isGroupPopupOpen && (
        <div className="popup-overlay">
          <GroupMessageCreate onClose={handleCloseGroupPopup} onBoardAdded={onGroupBoardAdded} />
        </div>
      )}
    </div>
  );
}

export default DiscussionBoard;
