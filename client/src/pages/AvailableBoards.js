import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AvailableBoard.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Import the Header component
//import ContactPopup from '../components/Popup';
import Popup from '../components/Popup';

import { ROUTE } from '../globals';

function DiscussionBoard() {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [boardsDM, setBoardsDM] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
      const response = await axios.post(ROUTE+`/discussion-board`, { username: storedUsername });
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

  // Popup handling
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    console.log('closing');
  };

  const onBoardAdded = (boardName, boardId) => {
    // Navigate with both name and ID
    fetchBoards()
    navigate(`/board/${boardName}`, { state: { boardName, boardId } });
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
      
        <div>
          <div className="main-container">
              <div className="header-container">
              <h2 className="Subtitle">Group Discussions</h2>
              <button className="round-button">+</button>
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
              <button className="round-button" onClick={handleOpenPopup}>+</button>
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
      <Popup onClose={handleClosePopup} onMessageAdded={handleMessageAdded} onBoardAdded={onBoardAdded}/>
      </div>
    )}
    </div>

        
  );
}


export default DiscussionBoard;
