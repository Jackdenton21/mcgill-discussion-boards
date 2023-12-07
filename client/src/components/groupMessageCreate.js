import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ROUTE } from '../globals'
import '../styles/CreateDiscussion.css';


function GroupMessageCreate({ onClose, onBoardAdded, username }) {
  const [createDiscussion, setCreateDiscussion] = useState(true);
  const [discussionCode, setDiscussionCode] = useState('');
  const [discussionName, setDiscussionName] = useState('');
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    setGeneratedCode(generateRandomCode());
  }, []);

  const handleCreateDiscussion = async () => {
    try {
      const response = await axios.post(ROUTE + '/start-discussion', {
        discussionName,
        code: generatedCode,
        username: localStorage.getItem('registeredUsername'),  
      });

      const { boardName, boardId } = response.data;
      onBoardAdded(boardName, boardId);
      onClose();
    } catch (error) {
      console.error('Error creating discussion:', error);
      setError('Error creating discussion. Please try again.');
    }
  };

  const handleJoinDiscussion = async () => {
    try {
      const response = await axios.post(ROUTE + '/join-discussion', {
        discussionCode,
        username: localStorage.getItem('registeredUsername'),
      });

      const { boardName, boardId } = response.data;
      onBoardAdded(boardName, boardId);
      onClose();
    } catch (error) {
      console.error('Error joining discussion:', error);
      setError('Error joining discussion. Please check the code and try again.');
    }
  };

  const handleToggleCreateDiscussion = () => {
    setCreateDiscussion(!createDiscussion);
    setError('');
  };

  const generateRandomCode = () => {
    const codeLength = 10;
    const characters = '0123456789';
    let code = '';

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  };

  return (
    <div className="Popup">
      <div className="popup-inner">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="red-text">{createDiscussion ? 'Create Discussion' : 'Join Discussion'}</h2>
        {<h2 className="red-text">createDiscussion</h2> && (
          <div>
            <label>Discussion Name:</label>
            <input
              type="text"
              value={discussionName}
              onChange={(e) => setDiscussionName(e.target.value)}
            />
            <p className="red-text">Generated Code (Remember This): {generatedCode}</p>
          </div>
        )}
        {!createDiscussion && (
          <div>
            <label className="red-text">Discussion Code:</label>
            <input
              type="text"
              value={discussionCode}
              onChange={(e) => setDiscussionCode(e.target.value)}
            />
          </div>
        )}
        {error && <div className="error">{error}</div>}
        <button  button className="create-discussion-button" onClick={createDiscussion ? handleCreateDiscussion : handleJoinDiscussion}>
          {createDiscussion ? 'Create Discussion' : 'Join Discussion'}
        </button>
        <p className="red-text" onClick={handleToggleCreateDiscussion}>
          {createDiscussion
            ? "Already have a code? Join a discussion."
            : "Don't have a code? Create a discussion."}
        </p>
      </div>
    </div>
  );
}

export default GroupMessageCreate;
