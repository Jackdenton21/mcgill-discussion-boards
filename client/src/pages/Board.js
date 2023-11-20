import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import "../styles/Board.css";
import axios from 'axios';

function Board() {
  const { boardId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {

    const storedUsername = localStorage.getItem('registeredUsername');
    setUsername(storedUsername || 'User');
    const token = localStorage.getItem('jwt');
    const newSocket = io('http://localhost:3001', {
      query: { token }
    });

    const fetchMessages = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/messages/${boardId}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
          // Handle errors appropriately
        }
      };
    
      fetchMessages();

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO');
      newSocket.emit('joinDiscussion', { discussionID: boardId });
    });

    newSocket.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [boardId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('sendMessage', {
        discussionID: boardId,
        sender: username, 
        message: newMessage
      });
      setNewMessage('');
    }
  };

  return (
    <div className="board-container">
      <h1>{boardId}</h1>
      <div className="message-list">
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender}</strong>: {msg.message}</p>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-message-button">Send</button>
      </form>
    </div>
  );
}

export default Board;
