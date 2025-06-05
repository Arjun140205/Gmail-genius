import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
