// Popup.js
import React, { useState } from 'react';
import axios from 'axios';

function Popup({ onClose, onContactAdded, onBoardAdded }) {
    const [contactInput, setContactInput] = useState('');
    const [contactType, setContactType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Update contactType as soon as the input changes
    const handleChange = (e) => {
        const input = e.target.value;
        setContactInput(input);
        setContactType(input.includes('@') ? 'Email' : 'Username');
    };

    const handleAddMessage = async () => {
        try {
            setErrorMessage('');
            let newUsername = contactInput;

            // If the contact type is Email, find the corresponding username
            if (contactType === 'Email') {
                const userResponse = await axios.post('http://localhost:3001/find-user-by-email', {
                    email: contactInput,
                });
                newUsername = userResponse.data.username;
            }

            // Start discussion with the username
            const response = await axios.post('http://localhost:3001/start-discussion-username', {
                currentUser: localStorage.getItem('registeredUsername'),
                newUsername: newUsername,
            });

            if (response.status === 203) {
                onBoardAdded(); // Call the callback function
                onClose();
            }

            //onClose(); // Close the pop-up
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.response.data.error || 'Error');
        }
    };

    return (
        <div className="Popup">
            <h2>New Direct Message</h2>
            <label>
                Enter Username or Email:
                <input
                    type="text"
                    value={contactInput}
                    onChange={handleChange} // Use handleChange here
                />
            </label>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button onClick={handleAddMessage}>Message</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
}

export default Popup;



