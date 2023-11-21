import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AvailableBoard.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Import the Header component
//import ContactPopup from '../components/Popup';
import Popup from '../components/Popup';


function DiscussionBoard() {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [boardsDM, setBoardsDM] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const navigate = useNavigate();

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  }

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const storedUsername = localStorage.getItem('registeredUsername');
      setUsername(storedUsername || 'User');
      const response = await axios.post(`http://localhost:3001/discussion-board`, { username: storedUsername });
      setBoards(response.data.discussionNames || []);
      setBoardsDM(response.data.discussionNamesDM || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // Popup handling
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    console.log('closing');
  };

  const onBoardAdded = (newBoardId) => {
    fetchBoards();
    navigate(`/board/${newBoardId}`); // Use backticks and ${} for template literals
};


    // Handle addition of a message
    const handleMessageAdded = (updatedContacts) => {
      // Update the state or perform actions with the updated contact list
      console.log('Contact added. Updated contacts:', updatedContacts);
    };

  if (isLoading) {
    return <div className="Loading">Loading...</div>;
  }

  return (
    <div className="Home">
            <Header />
            <br></br>
            <br></br>
            <br></br>
            <br></br>
      {/* Discussion Boards */}
      {boards.length > 0 ? (
        <div>
          <div className="main-container">
              <div className="header-container">
              <h2 className="Subtitle">Group Discussions</h2>
              <button className="round-button">+</button>
          </div>
        </div>

          
          <ul className="BoardList">
            {boards.map((board, index) => (
              <li key={index} className="Board" onClick={() => handleBoardClick(board)}>
                {board}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          It seems like you haven't joined any group boards.
          <a href="/join-boards">Sign up here</a> to join a discussion board.
        </div>
      )}

      {/* Direct Message Boards */}
      {boardsDM.length > 0 ? (
        <div>
          
          <div className="main-container">
              <div className="header-container">
              <h2 className="Subtitle">Direct Messages</h2>
              <button className="round-button" onClick={handleOpenPopup}>+</button>
          </div>
        </div>


          <ul className="BoardList">
            {boardsDM.map((board, index) => (
              <li key={index} className="DirectBoard" onClick={() => handleBoardClick(board)}>
                {board}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          It seems like you haven't joined any direct message boards.
          <a href="/join-dm">Start a direct message</a>.
        </div>
      )}
    {/* Contact Popup */}
    {isPopupOpen && (
      
      <div className="popup-overlay">
      <Popup onClose={handleClosePopup} onMessageAdded={handleMessageAdded} onBoardAdded={onBoardAdded}/>
      </div>
    )}
    </div>

        
  );
}
export default DiscussionBoard;
