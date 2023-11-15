import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './discussionBoard.css';

function DiscussionBoard() {
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      setIsLoading(true);
      try {
        const storedUsername = localStorage.getItem('registeredUsername');
        setUsername(storedUsername || 'User');
        const response = await axios.post(`http://localhost:3001/discussion-board`, { username: storedUsername });
        setBoards(response.data.discussionNames || []); // Expecting an array of board names
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
      <h1 className="Title">{username}'s Discussion Boards</h1>
      {boards.length > 0 ? (
        boards.map((board, index) => (
          <div key={index} className="Board">
            {board}
          </div>
        ))
      ) : (
        <div>
          It seems like you haven't joined any boards.
          <a href="/join-boards">Sign up here</a> to join a discussion board.
        </div>
      )}
    </div>
  );
}

export default DiscussionBoard;
