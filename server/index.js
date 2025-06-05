import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',  // your frontend origin if needed
  credentials: true,
}));
app.use(express.json());

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // set true if using https
  sameSite: 'lax' 
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('GmailGenius backend is running!');
});

// MongoDB connection
mongoose.set('strictQuery', false);
mongoose.connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
mongoose.connection.on('error', (err) => console.log('❌ MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

const PORT = process.env.PORT || 3500;
const MONGO_URI = process.env.MONGO_URI;

try {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} catch (error) {
  console.log('❌ Server startup error:', error.message);
}
