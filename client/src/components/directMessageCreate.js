import React, { useState } from 'react';
import axios from 'axios';
import { ROUTE } from '../globals';
import '../styles/CreateDiscussion.css';

function Popup({ onClose, onContactAdded, onBoardAdded }) {
    const [contactInput, setContactInput] = useState('');
    const [contactType, setContactType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const input = e.target.value;
        setContactInput(input);
        setContactType(input.includes('@') ? 'Email' : 'Username');
    };

    const handleAddMessage = async () => {
        try {
            setErrorMessage('');
            let newUsername = contactInput;

            if (contactType === 'Email') {
                const userResponse = await axios.post(ROUTE+'/find-user-by-email', {
                    email: contactInput,
                });
                newUsername = userResponse.data.username;
            }

            const response = await axios.post(ROUTE+'/start-discussion-username', {
                currentUser: localStorage.getItem('registeredUsername'),
                newUsername: newUsername,
            });

            if (response.status === 203 || response.status === 200) {
                const newBoardId = response.data.boardId;
                const newBoardName = response.data.boardName;
                console.log(response.data)
                console.log("HERE")
                console.log(newBoardName)
                console.log(newBoardId)
                onBoardAdded(newBoardName,newBoardId);
            }

        } catch (error) {
            console.error('Failed to Start Direct Message:', error);
            setErrorMessage(error.response.data.error || 'Failed to Start Direct Message:');
        }
    };

    return (
        <div className="Popup">
            <h2 className="red-text">New Direct Message</h2>
            <label className="red-text">
                Enter Username or Email:
                <input
                    type="text"
                    value={contactInput}
                    onChange={handleChange} 
                />
            </label>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button className="create-discussion-button" onClick={handleAddMessage}>Message</button>
            <button className="create-discussion-button" onClick={onClose}>Cancel</button>
        </div>
    );
}

export default Popup;




