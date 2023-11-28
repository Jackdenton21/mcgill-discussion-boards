import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import "../styles/Board.css";
import axios from 'axios';
import Header from '../components/Header';
import { ROUTE } from '../globals';
import SideBar from '../components/SideBar';

function Board() {
  const location = useLocation();
  const { boardName, boardId } = location.state || {};
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [channels, setChannels] = useState([]); // State for storing channels
  const [selectedChannel, setSelectedChannel] = useState(null); // State to store selected channel


  const messageListRef = useRef(null);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel); 
  };
  

  const scrollToBottom = () => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('registeredUsername');
    setUsername(storedUsername || 'User');
    const token = localStorage.getItem('jwt');

    if (!boardName || !boardId || !token) {
      // Redirect to your desired route if boardName, boardId, or token is missing
      navigate('/discussion-board'); // Use navigate to redirect
      return;
    }

    // Fetch channels when the component mounts
    const fetchChannels = async () => {
      try {
        const response = await axios.get(ROUTE + `/channels/${boardId}`);
        setChannels(response.data.channels);
  
        // Find the "General" channel and set it as the selected channel
        const generalChannel = response.data.channels.find(
          (channel) => channel.name === 'General'
        );
        if (generalChannel) {
          setSelectedChannel(generalChannel._id);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        // Handle errors appropriately
      }
    };

    fetchChannels();

    const newSocket = io(ROUTE, {
      query: { token }
    });

    const fetchMessages = async () => {
      try {
        const response = await axios.get(ROUTE + `/messages/${boardId}`);
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

  }, [boardName, boardId, navigate]);

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

  const handleAddChannel = async (channelName) => {
    try {
      const response = await axios.post(ROUTE + '/channels', {
        discussionID: boardId,
        channelName: channelName,
      });

      // Update the channels state with the new channel
      setChannels((prevChannels) => [...prevChannels, response.data.channel]);
    } catch (error) {
      console.error('Error creating a new channel:', error);
      // Handle errors appropriately
    }
  };

  return (
    <div>
      <Header />
      <div className="main-board-container">
        <div className="sidebar-container">
        <SideBar channels={channels} onAddChannel={handleAddChannel} onSelectChannel={handleChannelSelect} selectedChannel={selectedChannel} />
        </div>
        <div className="board-container">
          <h1>{boardName}</h1>
          <div className="message-list" ref={messageListRef}>
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
      </div>
    </div>
  );
}

export default Board;
