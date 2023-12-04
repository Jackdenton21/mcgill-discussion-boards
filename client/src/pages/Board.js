import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { redirect, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import "../styles/Board.css";
import axios from 'axios';
import Header from '../components/Header';
import { ROUTE } from '../globals';
import SideBar from '../components/SideBar';
import ManageChannels from '../components/manageChannels';

function Board() {
  const location = useLocation();
  const { boardName, boardId } = location.state || {};
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [channels, setChannels] = useState([]); // State for storing channels
  const [selectedChannel, setSelectedChannel] = useState(null); // State to store selected channel
  const [isChannelPopupOpen, setIsChannelPopupOpen] = useState(false);
  const messageListRef = useRef(null);

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

  useEffect(() => {
    fetchMessages(); // Fetch messages when selectedChannel changes
  }, [selectedChannel]);

  const fetchMessages = async () => {
    try {
      // Pass both discussionID and selectedChannel to the API endpoint
      const response = await axios.get(ROUTE + `/messages/${boardId}`, {
        params: { discussionID: boardId, channelID: selectedChannel },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Handle errors appropriately
    }
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('sendMessage', {
        discussionID: boardId,
        sender: username,
        message: newMessage,
        channelID: selectedChannel
      });
      setNewMessage('');
    }
  };

  const handleAddChannel = async (channelName) => {
    console.log("Adding channel from board.js:", channelName);
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

  const handleDeleteDiscussionBoard = async () => {
    console.log("Correct function called");
    try {
      const response = await axios.delete(ROUTE+`/removediscussionboard`, {
        data: {
          username: username,
          boardId: boardId,
        },
      });
      if (response.status === 200) {
        navigate('/discussion-board');
      } else {
        console.error('Error removing user:', response.data.error);
      }
    }
    catch (error) {
        console.error('Error removing discussionboard', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="main-board-container">
        <div className="sidebar-container">
        <SideBar channels={channels} onAddChannel={handleAddChannel} onSelectChannel={handleChannelSelect} onDeleteDiscussionBoard ={handleDeleteDiscussionBoard} selectedChannel={selectedChannel} />
        </div>
        <div className="board-container">
          <h1>{boardName}</h1>
          
          <div className="message-list" ref={messageListRef}>
            {messages.map((msg, index) => {
              const isSameSenderAsPrevious = index > 0 && messages[index - 1].sender === msg.sender;
              const messageClass = isSameSenderAsPrevious ? "message-no-top-border" : "";
              const senderClass = msg.sender === username ? "message-sent" : "message-received";

              return (
                <div key={index} className={`${senderClass} ${messageClass}`}>
                {!isSameSenderAsPrevious && <><strong>{msg.sender}</strong><br /></>}
                {msg.message}
                </div>
              );
            })}
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
