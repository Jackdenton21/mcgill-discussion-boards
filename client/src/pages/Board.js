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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [usernames, setUsernames] = useState([]);


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

    const checkAdminStatus = async () => {
      try {
        const un = localStorage.getItem('registeredUsername');
        const response = await axios.get(ROUTE + `/admin?discussionID=${boardId}&username=${un}`);
        console.log(`response: ${response.data.isAdmin}`);
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();

    const fetchUsernames = async () => {
      try {
        const response = await axios.get(ROUTE + `/usernames?boardId=${boardId}`);
        setUsernames(response.data.usernames);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
    
    fetchUsernames();

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

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    // Call the function to fetch messages based on the search term
    fetchFilteredMessages(newSearchTerm);
  };

  const fetchFilteredMessages = async (searchTerm) => {
    try {
      // If the search term is empty, fetch all messages
      if (!searchTerm) {
        fetchMessages();
        return;
      }

      // Otherwise, fetch messages based on the search term
      const response = await axios.get(ROUTE + `/messages/${boardId}`, {
        params: { discussionID: boardId, channelID: selectedChannel },
      });

      // Filter messages based on the search term
      const filteredMessages = response.data.filter((msg) =>
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Update state with filtered messages
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching filtered messages:', error);
      // Handle errors appropriately
    }
  };

  const handleDeleteDiscussionBoard = async () => {
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

  const handleAddUser = async (username) => {
    try {
        const bid = boardId;
        const response = await axios.post(ROUTE + `/add-user`, {
            boardId: boardId, 
            username: username,
        });
    } catch (error) {
        console.error('Error adding user', error);
    }
};

  const handleDeleteUser = async (username) => {
    try {
      const bid = boardId;
      console.log(`attempting to remove user ${username} from discussion ${bid}`);
      const response = await axios.post(ROUTE + `/remove-from-discussion`, {
          boardId: boardId, 
          username: username,
      });
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="main-board-container">
        <div className="sidebar-container">
        <SideBar channels={channels} 
        onAddChannel={handleAddChannel} 
        onSelectChannel={handleChannelSelect} 
        onDeleteDiscussionBoard ={handleDeleteDiscussionBoard} 
        selectedChannel={selectedChannel} isAdmin={isAdmin} 
        users={usernames} 
        onAddUser={handleAddUser} 
        onDeleteUser={handleDeleteUser} />
        </div>
        <div className="board-container">
          <h1>{boardName}</h1>
          <div className='searchmessagesbar'>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search messages..."
              className="search-bar"
            />
          </div>
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
