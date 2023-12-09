# COMP307 Final Project - McGill University

This project is the final submission for COMP307: Web Development at McGill University. It's a slack-clone built using React, Node.js, Express, and MongoDB, and is hosted on Heroku.

Live Demo: [McGill Discussions](https://mcgill-discussions-146b67784000.herokuapp.com)

## Testing

To test the application:

- You can either create new accounts or log in using existing ones:
  - Username: `Bob123` Password: `123`
  - Username: `John123` Password: `123`
- Note: Local storage is used for user authentication status. For live messaging between users on the same device, use different browsers (e.g., Bob123 on Safari and John123 on Chrome).

## Running Locally 
    1. Checkout dev branch 
    2. cd to client directory
        -run npm i in the command line
        -npm start in the command line
    3. cd to server directory
        -run npm i in the command line
        -run node server.js in the command line
    4. Access the project at [localhost:3000](https://localhost:3000).


## Team Members & Contributions

**Talia Cooper (260967144):**
- Database design
- Join & Create Private discussions
- Styling

**Jack Denton (260948222):**
- Login/Registration
- Messaging functionality (web sockets for real-time broadcasting)
- Security & route protection
- Styling
- Deployment

**Rex Hamilton (260950882):**
- Manage users
- Discussion board settings & leave board
- Manage channels
- Search messages

**Jacob Lerner (260958030):**
- Join & Create Group discussions
- Search discussion boards / messages
- Database design




