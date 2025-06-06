import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.routes.js';
import gmailRoutes from './routes/gmailRoutes.js'; // Gmail route

dotenv.config();

const app = express();

// ✅ CORS Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Body Parser
app.use(express.json());

// ✅ Session Middleware (must be above passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if using HTTPS
    sameSite: 'lax',
  },
}));

// ✅ Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gmail', gmailRoutes); // <-- ✅ Moved here after passport/session

// ✅ Root route
app.get('/', (req, res) => {
  res.send('📬 GmailGenius backend is running!');
});

// ✅ MongoDB Connection
mongoose.set('strictQuery', false);

mongoose.connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
mongoose.connection.on('error', (err) => console.log('❌ MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.log('ℹ️ MongoDB disconnected'));

const PORT = process.env.PORT || 3500;
const MONGO_URI = process.env.MONGO_URI;

try {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} catch (error) {
  console.error('❌ Server startup error:', error.message);
}
