// server/routes/resumeRoutes.js
import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';
import path from 'path';
import aiService from '../services/aiService.js';

const router = express.Router();

// Temp upload location
const upload = multer({ dest: 'uploads/' });

// POST /api/resume/upload - Enhanced with AI
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    const extractedText = pdfData.text;
    
    console.log('📄 Resume uploaded, analyzing with AI...');
    
    // AI-powered analysis
    let aiAnalysis;
    try {
      aiAnalysis = await aiService.parseResume(extractedText);
      console.log('✅ AI analysis successful');
    } catch (aiError) {
      console.warn('⚠️ AI analysis failed, using fallback:', aiError.message);
      // Fallback to basic skill extraction
      const basicSkills = ['react', 'node.js', 'javascript', 'html', 'css', 'mongodb', 'express', 'tailwind', 'aws', 'git', 'rest api'];
      const matchedSkills = basicSkills.filter(skill => 
        extractedText.toLowerCase().includes(skill.toLowerCase())
      );
      
      aiAnalysis = {
        skills: {
          technical: matchedSkills,
          soft: [],
          languages: [],
          frameworks: [],
          tools: []
        },
        experience: [],
        education: [],
        summary: 'Basic analysis completed'
      };
    }

    // Flatten all skills for backward compatibility
    const allSkills = [
      ...aiAnalysis.skills.technical,
      ...aiAnalysis.skills.frameworks,
      ...aiAnalysis.skills.tools,
      ...aiAnalysis.skills.languages
    ].filter(Boolean);

    // Clean up file
    fs.unlinkSync(pdfPath);

    res.json({
      // Backward compatibility
      skills: allSkills,
      totalMatched: allSkills.length,
      // Enhanced AI data
      aiAnalysis: {
        skills: aiAnalysis.skills,
        experience: aiAnalysis.experience,
        education: aiAnalysis.education,
        summary: aiAnalysis.summary
      },
      extractedText: extractedText // For debugging
    });
  } catch (err) {
    console.error('❌ Resume upload error:', err);
    res.status(500).json({ message: 'Failed to extract resume skills.' });
  }
});

export default router;