// available-boards.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AvailableBoard.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Popup from '../components/directMessageCreate';
import GroupMessageCreate from '../components/groupMessageCreate'; // Import the GroupMessageCreate component

import { ROUTE } from '../globals';

function DiscussionBoard() {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [boardsDM, setBoardsDM] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false); // New state for group discussions popup
  const [searchInput, setSearchInput] = useState('');
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [filteredGroupBoards, setFilteredGroupBoards] = useState([]);
  const [filteredDMBoards, setFilteredDMBoards] = useState([]);

  const navigate = useNavigate();

  const handleBoardClick = (boardName, boardId) => {
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

  const handleSearchInputChange = (event) => {
    const input = event.target.value;
    setSearchInput(input);
    filterBoards(input);
  };

  const filterBoards = (input) => {
    const filteredDiscussionBoards = boards.filter(
      (board) =>
        board && board.name && board.name.toLowerCase().includes(input.toLowerCase())
    );
    const filteredDirectMessageBoards = boardsDM.filter(
      (board) =>
        board && board.name && board.name.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredGroupBoards(filteredDiscussionBoards);
    setFilteredDMBoards(filteredDirectMessageBoards);
  };

  return (
    <div className="Home">


      <Header />

      {/* Common Search Bar */}

      <form className="search-discussionboards">

        <input
          className="searchinput"
          type="text"
          placeholder="Search for a discussion board"
          value={searchInput}
          onChange={handleSearchInputChange}
        />
      </form>
      <div className="entireavailableboardspage">
        {/* Group Discussions Section */}

        <div>
          <div className="main-container">
            <div className="header-container">
              <h2 className="Subtitle">Group Discussions</h2>
              <button className="round-button" onClick={handleOpenGroupPopup}>+</button>
            </div>
          </div>
          <ul className="BoardList">
            {(searchInput === '' ? boards : filteredGroupBoards).map((board, index) => (
              <li
                key={index}
                className="Board"
                onClick={() => handleBoardClick(board.name, board.id)}
              >
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
            {(searchInput === '' ? boardsDM : filteredDMBoards).map((board, index) => (
              <li
                key={index}
                className="Board"
                onClick={() => handleBoardClick(board.name, board.id)}
              >
                {board.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <Popup
            onClose={handleClosePopup}
            onMessageAdded={handleMessageAdded}
            onBoardAdded={onBoardAdded}
          />
        </div>
      )}
      {isGroupPopupOpen && (
        <div className="popup-overlay">
          <GroupMessageCreate
            onClose={handleCloseGroupPopup}
            onBoardAdded={onGroupBoardAdded}
          />
        </div>
      )}
    </div>

  );
}

export default DiscussionBoard;