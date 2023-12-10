import React, { useEffect, useState, useRef } from 'react';
import '../styles/manageUsers.css'

function ManageUsers({existingUsers, onDeleteDiscussionBoard, onClose, onAddUser, onDeleteUser}) {
    const [users, setUsers] = useState([]); 
    const [newUserName, setNewUserName] = useState('');

    const handleDeleteUser = (user) => {
        onDeleteUser(user);
        window.location.reload();
    };

    const handleAddUser = (newUserName) => {
        onAddUser(newUserName);
        window.location.reload();
    };

    return (
    <div className="popup-overlay">
      <div className="manage-users-popup">
        <h2>Manage Users</h2>
        <h3>Existing Users:</h3>
        <ul>
          {existingUsers.map((user) => (
            <li key={user}>
            {user}
            <button
              onClick={() => handleDeleteUser(user)}
              className="manage-button"
            >
              Delete
            </button>
          </li>
          ))}
        </ul>
        <h3>Add a User:</h3>
        <div className="add-user-container">
            <input
            type="text"
            placeholder="Username to add..."
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            />
            <button className="manage-button" onClick={() => handleAddUser(newUserName)}>Add User</button>
        </div>
        <br>
        </br>
        <button className="manage-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ManageUsers;