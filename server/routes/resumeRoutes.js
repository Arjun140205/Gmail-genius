// server/routes/resumeRoutes.js
import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Temp upload location
const upload = multer({ dest: 'uploads/' });

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    const extractedText = pdfData.text.toLowerCase();
    const predefinedSkills = ['react', 'node.js', 'javascript', 'html', 'css', 'mongodb', 'express', 'tailwind', 'aws', 'git', 'rest api'];

    const matchedSkills = predefinedSkills.filter(skill => extractedText.includes(skill));
    
    // Clean up file
    fs.unlinkSync(pdfPath);

    res.json({
      skills: matchedSkills,
      totalMatched: matchedSkills.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to extract resume skills.' });
  }
});

export default router;