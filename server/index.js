import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passportConfig.js';
import { handleAuthError } from './config/passportConfig.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gmailRoutes from './routes/gmailRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import savedEmailRoutes from './routes/savedEmailRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

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
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
  name: 'gmail-genius-session'
}));

// ✅ Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Add debug route
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'API is working',
    session: req.session,
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/saved-emails', savedEmailRoutes);
app.use('/api/ai', aiRoutes);

// ✅ Auth error handler
app.use(handleAuthError);

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
