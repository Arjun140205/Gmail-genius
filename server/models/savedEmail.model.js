import mongoose from 'mongoose';

const savedEmailSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  emailId: {
    type: String,
    required: true
  },
  subject: String,
  snippet: String,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can't save the same email twice
savedEmailSchema.index({ userId: 1, emailId: 1 }, { unique: true });

export default mongoose.model('SavedEmail', savedEmailSchema);
