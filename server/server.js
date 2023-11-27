const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const socketIoJwt = require('socketio-jwt'); // Ensure this package is installed
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware for parsing JSON in requests
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000', // or '*' to allow all origins
  credentials: true, // to allow cookies (if using)
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const slackDB = mongoose.connection.useDb('slack0');
// Passport initialization
app.use(passport.initialize());

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  Did: {
    type: Array,
    default: [],
  },
  contacts: {
    type: Array,
    default: [],
  },
});
const User = slackDB.model('User', userSchema);

const chatMessageSchema = new mongoose.Schema({
  discussionID: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const ChatMessage = slackDB.model('ChatMessage', chatMessageSchema);

const discussionSchema = new mongoose.Schema({
  discussionID: Number,
  usernames: Array,
  discussionName: String,
  code: Number,
  admin: String,
});
discussionSchema.index({ discussionID: 1 });
const Discussion = slackDB.model('discussionboards', discussionSchema);

// LocalStrategy for username/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'userOrEmail',  // Match the name used in your login form
    passwordField: 'password',
  },
  async (userOrEmail, password, done) => {
    try {
      // Check both username and email fields
      const user = await User.findOne({ $or: [{ username: userOrEmail }, { email: userOrEmail }] });

      if (!user) {
        return done(null, false, { message: 'Incorrect username or email.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));


// Registration route using mongoose
app.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    const existingEmail = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const newUser = new User({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
      email: req.body.email,
    });

    await newUser.save();

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Login route using local strategy
app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET || 'your-secret-key');
  res.cookie('jwt', token, { httpOnly: true });
  res.status(200).json({ user: req.user, token });
});

// Example protected route using JWT strategy
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({ message: 'Protected route accessed.' });
});

// Default route
app.get('/', (req, res) => {
  res.send('Hello, Node.js server!');
});


// New route for discussion board
app.post('/discussion-board', async (req, res) => {
  try {
    // Step 1: Retrieve discussionIDs based on the logged-in user
    const userDiscussion = await User.findOne({ username: req.body.username });

    if (!userDiscussion) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const discussionIDs = userDiscussion.Did || [];
    //console.log('discussionIDs:', discussionIDs);

    // Step 2: Retrieve discussionNames based on the retrieved discussionIDs
    const discussionCollection = await Discussion.find({
      discussionID: { $in: discussionIDs },
      usernames: { $not: { $size: 2 } }, // Only return discussions without exactly two usernames (not direct Messages)
    });

    const discussionCollectionDM = await Discussion.find({
      discussionID: { $in: discussionIDs },
      usernames: { $size: 2 },
    });

    //console.log('discussionCollection:', discussionCollection);

    const discussions = discussionCollection.map(doc => {
      return { name: doc.discussionName, id: doc._id };
    });    
    //console.log('discussions:', discussions);

    const discussionsDM = discussionCollectionDM.map(doc => {
      return { name: doc.discussionName, id: doc._id };
    });    
    //console.log('discussions:', discussionsDM);

    res.status(200).json({ discussions,discussionsDM });

  } catch (error) {
    console.error('Error in /discussion-board:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get messages for a discussion
app.get('/messages/:discussionID', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ discussionID: req.params.discussionID });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/start-discussion-username', async (req, res) => {
  const { currentUser, newUsername } = req.body;

  try {
      // Ensure both users exist
      const currentUserObj = await User.findOne({ username: currentUser });
      const newUserObj = await User.findOne({ username: newUsername });

      if (!currentUserObj || !newUserObj) {
          return res.status(404).json({ error: 'One or more usernames not found.' });
      }

      // Check if a discussion between the two users already exists
      const existingDiscussion = await Discussion.findOne({
          usernames: { $all: [currentUser, newUsername], $size: 2}
      });

      if (existingDiscussion) {
          // Return existing discussion ID if it exists
          return res.status(203).json({ boardName: existingDiscussion.discussionName,boardId:existingDiscussion._id });
      }

      // If no existing discussion, create a new one
      const discussionCount = await Discussion.countDocuments();
      const newDiscussionID = discussionCount + 1;

      const newDiscussion = new Discussion({
          discussionID: newDiscussionID,
          usernames: [currentUser, newUsername],
          discussionName: newUsername, // or currentUser, based on preference
      });

      const savedDiscussion = await newDiscussion.save();

      // Update both users' Did arrays
      currentUserObj.Did.push(newDiscussionID);
      newUserObj.Did.push(newDiscussionID);
      await currentUserObj.save();
      await newUserObj.save();
      res.status(203).json({ boardName: savedDiscussion.discussionName,boardId:savedDiscussion._id });
  } catch (error) {
      console.error('Error in creating new discussion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to find a user by email and return the username
app.post('/find-user-by-email', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(404).json({ error: 'Email not found.' });
      }
      res.status(200).json({ username: user.username });
      
  } catch (error) {
      console.error('Error in /find-user-by-email:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/start-discussion', async (req, res) => {
  const { discussionName, code, username } = req.body;
  console.log('Received data:', { discussionName, code, username });

  try {
    const discussionCount = await Discussion.countDocuments();
    const newDiscussionID = discussionCount + 1;

    const newDiscussion = new Discussion({
      discussionID: newDiscussionID,
      usernames: [username],
      discussionName: discussionName,
      code: code,
      admin: username,
    });

    const savedDiscussion = await newDiscussion.save();

    const currentUser = await User.findOne({ username });
    currentUser.Did.push(newDiscussionID);
    await currentUser.save();

    res.status(201).json({ boardName: savedDiscussion.discussionName, boardId: savedDiscussion._id });
  } catch (error) {
    //console.error('Error in creating new discussion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/join-discussion', async (req, res) => {
  const { discussionCode, username } = req.body;

  try {
    // Step 1: Find the discussion board with the given code
    const discussion = await Discussion.findOne({ code: discussionCode });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found with the given code.' });
    }

    // Step 2: Check if the user is already part of the discussion
    if (discussion.usernames.includes(username)) {
      return res.status(400).json({ error: 'User is already part of the discussion.' });
    }

    // Step 3: Add the user to the discussion
    discussion.usernames.push(username);
    await discussion.save();

    // Step 4: Update the user's Did array with the discussionID
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.Did.push(discussion.discussionID);
    await user.save();

    res.status(200).json({ boardName: discussion.discussionName, boardId: discussion._id });
  } catch (error) {
    console.error('Error in joining discussion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Socket.IO setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Authenticate Socket.IO connections
io.use(socketIoJwt.authorize({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  handshake: true
}));

io.on('connection', (socket) => {
  //console.log('Authenticated client connected');

  socket.on('joinDiscussion', ({ discussionID }) => {
    socket.join(discussionID);
    //console.log(`Joined discussion ${discussionID}`);
  });

  socket.on('sendMessage', async ({ discussionID, sender, message }) => {
    try {
      const newMessage = new ChatMessage({ discussionID, sender, message });
      const savedMessage = await newMessage.save();
      io.to(discussionID).emit('message', savedMessage);
    } catch (error) {
      //console.error('Error saving message:', error);
    }
  });


  socket.on('disconnect', () => {
    //console.log('Client disconnected');
  });
});

// Start the HTTP server instead of the Express app
server.listen(port, () => {
  //console.log(`Server is running on port ${port}`);
});

