import SavedEmail from '../models/savedEmail.model.js';

// Save an email
export const saveEmail = async (req, res) => {
  try {
    const { emailId, subject, snippet } = req.body;
    const userId = req.user.id || req.user._json.sub; // Get ID from either passport or Google OAuth

    const savedEmail = new SavedEmail({
      userId,
      emailId,
      subject,
      snippet
    });

    await savedEmail.save();
    res.status(201).json({ message: 'Email saved successfully', savedEmail });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already saved' });
    }
    res.status(500).json({ message: 'Error saving email', error: error.message });
  }
};

// Unsave/remove an email
export const unsaveEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    const userId = req.user.id || req.user._json.sub;

    const result = await SavedEmail.findOneAndDelete({ userId, emailId });
    if (!result) {
      return res.status(404).json({ message: 'Saved email not found' });
    }
    res.json({ message: 'Email removed from saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing saved email', error: error.message });
  }
};

// Get all saved emails for a user
export const getSavedEmails = async (req, res) => {
  try {
    const userId = req.user.id || req.user._json.sub;
    const savedEmails = await SavedEmail.find({ userId })
      .sort({ savedAt: -1 }); // Most recently saved first

    res.json(savedEmails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved emails', error: error.message });
  }
};

// Check if an email is saved
export const isEmailSaved = async (req, res) => {
  try {
    const { emailId } = req.params;
    const userId = req.user.id;

    const savedEmail = await SavedEmail.findOne({ userId, emailId });
    res.json({ isSaved: !!savedEmail });
  } catch (error) {
    res.status(500).json({ message: 'Error checking saved status', error: error.message });
  }
};
