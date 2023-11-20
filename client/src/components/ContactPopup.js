// ContactPopup.js
import React, { useState } from 'react';
import axios from 'axios';

function ContactPopup({ onClose, onContactAdded }) {
    const [contactUsername, setContactUsername] = useState('');

    const handleAddContact = async () => {
        try {
            // Send a request to the backend to add the contact
            const response = await axios.post('http://localhost:3001/add-contact', {
                username: contactUsername,
            });

            // Assuming the backend returns the updated list of contacts
            const updatedContacts = response.data.contacts || [];

            // Notify the parent component about the contact addition
            onContactAdded(updatedContacts);

            // Close the pop-up
            onClose();
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    return (
        <div className="ContactPopup">
            <h2>Add Contact</h2>
            <label>
                Username:
                <input
                    type="text"
                    value={contactUsername}
                    onChange={(e) => setContactUsername(e.target.value)}
                />
            </label>
            <button onClick={handleAddContact}>Add Contact</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
}

export default ContactPopup;
