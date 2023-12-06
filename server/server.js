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
const port = process.env.PORT || 3001;

// Middleware for parsing JSON in requests
app.use(express.json());

const corsOptions = {
  origin: 'https://mcgill-discussion-boards.vercel.app',
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
  channelID: String,
  timestamp: { type: Date, default: Date.now }
});
const ChatMessage = slackDB.model('ChatMessage', chatMessageSchema);

// Define the 'Channel' model and schema
const channelSchema = new mongoose.Schema({
  name: String,
});

const Channel = slackDB.model('Channel', channelSchema);

// Define the 'Discussion' model and schema
const discussionSchema = new mongoose.Schema({
  discussionID: Number,
  usernames: Array,
  discussionName: String,
  code: Number,
  admin: String,
  channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
  ],
});

discussionSchema.pre('save', async function (next) {
  if (!this.channels || this.channels.length === 0) {
    // Create a new 'General' channel document and add its ObjectId to the 'channels' array
    const generalChannel = new Channel({ name: 'General' });
    await generalChannel.save();
    this.channels.push(generalChannel._id);
  }
  next();
});

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

    // Step 2: Retrieve discussionNames based on the retrieved discussionIDs
    const discussionCollection = await Discussion.find({
      discussionID: { $in: discussionIDs },
      usernames: { $not: { $size: 2 } }, // Only return discussions without exactly two usernames (not direct Messages)
    });

    const discussionCollectionDM = await Discussion.find({
      discussionID: { $in: discussionIDs },
      usernames: { $size: 2 },
    });

    const discussions = discussionCollection.map(doc => {
      return { name: doc.discussionName, id: doc._id };
    });

    // For DM discussions, return the username of the other participant
    const discussionsDM = discussionCollectionDM.map(doc => {
      const otherUsername = doc.usernames.find(name => name !== req.body.username);
      return { name: otherUsername, id: doc._id };
    });

    res.status(200).json({ discussions, discussionsDM });

  } catch (error) {
    console.error('Error in /discussion-board:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/channels/:discussionID', async (req, res) => {
  try {
    const discussionID = req.params.discussionID;

    // Find the discussion board by ID
    const discussion = await Discussion.findOne({ _id: discussionID });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion board not found.' });
    }

    // Retrieve the channels associated with the discussion
    const channels = await Channel.find({ _id: { $in: discussion.channels } });

    res.status(200).json({ channels });
  } catch (error) {
    console.error('Error in /channels/:discussionID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint to get messages for a discussion and channel
app.get('/messages/:discussionID', async (req, res) => {
  try {
    const { discussionID, channelID } = req.query;

    // Modify the query to filter by both discussionID and channelID
    const messages = await ChatMessage.find({ discussionID, channelID });
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
  }
});

app.post('/add-user', async (req, res) => {
  const { boardId, username } = req.body;
  console.log("attempting to add user: "+username+" for this board: "+boardId);
  try {
    // Step 1: Find the discussion board with the given code
    const discussion = await Discussion.findById(boardId);

    if (!discussion) {
      console.log("it's this one");
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
      console.log("its the user one");
      return res.status(404).json({ error: 'User not found.' });
    }

    user.Did.push(discussion.discussionID);
    await user.save();

    res.status(200).json({ boardName: discussion.discussionName, boardId: discussion._id });
  } catch (error) {
    console.error('Error in joining discussion:', error);
  }
});

app.post('/remove-from-discussion', async (req, res) => {
  const { username, boardId } = req.body;
  try {
    // Find the discussion board by ID
    const discussion = await Discussion.findById(boardId);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion board not found.' });
    }

    // Check if the user is part of the discussion
    if (!discussion.usernames.includes(username)) {
      return res.status(400).json({ error: 'User is not part of the discussion.' });
    }

    // Remove the user from the discussion
    discussion.usernames = discussion.usernames.filter((name) => name !== username);
    await discussion.save();

    // Update the user's Did array to remove the discussionID
    const user = await User.findOne({ username });

    if (!user) {
      console.error(`User ${username} not found.`);
      return res.status(404).json({ error: 'User not found.' });
    }

    user.Did = user.Did.filter((discussionID) => discussionID !== discussion.discussionID);
    await user.save();

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error removing user from discussion board:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add this route to create a new channel
app.post('/channels', async (req, res) => {
  try {
    const { discussionID, channelName } = req.body;

    // Create a new channel document and save it to the database
    const newChannel = new Channel({ name: channelName });
    await newChannel.save();

    // Add the new channel's ObjectId to the discussion's channels array
    const discussion = await Discussion.findById(discussionID);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    discussion.channels.push(newChannel._id);
    await discussion.save();

    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error('Error creating a new channel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/admin', async (req, res) => {
  try {
    const { discussionID, username } = req.query;
    const discussion = await Discussion.findById(discussionID);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }
    if (!discussion.admin || discussion.admin !== username) {
      return res.status(200).json({ isAdmin: false });
    }
    return res.status(200).json({ isAdmin: true });
  } catch (error) {
    console.error('Error finding admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/removediscussionboard', async (req, res) => {
  try {
    const { username, boardId } = req.body;

    // Find the discussion board by ID
    const discussion = await Discussion.findById(boardId);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion board not found.' });
    }

    // Check if the user is part of the discussion
    if (!discussion.usernames.includes(username)) {
      return res.status(400).json({ error: 'User is not part of the discussion.' });
    }

    // Remove the user from the discussion
    discussion.usernames = discussion.usernames.filter((name) => name !== username);
    await discussion.save();

    // Update the user's Did array to remove the discussionID
    const user = await User.findOne({ username });

    if (!user) {
      console.error(`User ${username} not found.`);
      return res.status(404).json({ error: 'User not found.' });
    }

    user.Did = user.Did.filter((discussionID) => discussionID !== discussion.discussionID);
    await user.save();

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error removing user from discussion board:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/usernames', async (req, res) => {
  try {
    const { boardId } = req.query;
    // Find the discussion board by ID
    const discussion = await Discussion.findById(boardId);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion board not found.' });
    }

    // Return the list of usernames in the discussion
    return res.status(200).json({ usernames: discussion.usernames });
  } catch (error) {
    console.error('Error in /usernames:', error);
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

  socket.on('sendMessage', async ({ discussionID, sender, message, channelID }) => {
    try {
      const newMessage = new ChatMessage({ discussionID, sender, message, channelID });
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

