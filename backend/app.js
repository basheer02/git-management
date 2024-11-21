const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const app = express();

require('dotenv').config();

const sessionSecret = process.env.SESSION_SECRET;

// Middleware for session management
/*app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 }
}));*/


// Enable CORS (allow requests from your frontend)
const corsOptions = {
    origin: 'http://localhost:5173',  // Allow your frontend's origin
    methods: ['GET', 'POST'],        // Allow only GET and POST methods
    credentials: true,               // Allow cookies to be sent with requests
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());
  
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false }
  }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
