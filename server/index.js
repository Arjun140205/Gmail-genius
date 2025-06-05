// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';

const app = express();
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('GmailGenius backend is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection with error handling
mongoose.set('strictQuery', false);
mongoose.connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
mongoose.connection.on('error', (err) => console.log('❌ MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3500;
const MONGO_URI = process.env.MONGO_URI;

try {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} catch (error) {
  console.log('❌ Server startup error:', error.message);
}