import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AvailableBoard.css';

function DiscussionBoard() {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [boardsDM, setBoardsDM] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      setIsLoading(true);
      try {
        const storedUsername = localStorage.getItem('registeredUsername');
        setUsername(storedUsername || 'User');
        const response = await axios.post(`http://localhost:3001/discussion-board`, { username: storedUsername });
        setBoards(response.data.discussionNames || []); // Expecting an array of board names for groups
        setBoardsDM(response.data.discussionNamesDM || []); // Expecting an array of board names for direct messages
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
      setIsLoading(false);
    };

    fetchBoards();
  }, []);



  if (isLoading) {
    return <div className="Loading">Loading...</div>;
  }

  return (
    <div className="Home">
      {/* Discussion Boards */}
      {boards.length > 0 ? (
        <div>
          <h2 className="Subtitle">Group Discussions</h2>
          <ul className="BoardList">
            {boards.map((board, index) => (
              <li key={index} className="Board">
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
          <h2 className="Subtitle">Direct Messages</h2>
          <ul className="BoardList">
            {boardsDM.map((board, index) => (
              <li key={index} className="Board">
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
    </div>
  );
}

export default DiscussionBoard;
