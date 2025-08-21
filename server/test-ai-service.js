// test-ai-service.js
import dotenv from 'dotenv';
import aiService from './services/aiService.js';

dotenv.config();

async function testAIService() {
  console.log('🧪 Testing AI Service...\n');
  
  // Check API key
  console.log('1️⃣ Checking API Key...');
  console.log('API Key exists:', !!process.env.OPENROUTER_API_KEY);
  console.log('API Key starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...\n');
  
  // Test 1: Resume parsing
  console.log('2️⃣ Testing Resume Parsing...');
  const testResume = `
    John Doe
    Software Engineer
    Email: john@example.com
    
    Skills: JavaScript, React, Node.js, Python, MongoDB, Express.js
    
    Experience:
    - Frontend Developer at Tech Corp (2022-2024)
    - Developed React applications with modern JavaScript
    - Built REST APIs using Node.js and Express
    
    Education:
    - Bachelor of Computer Science, University of Technology (2022)
  `;
  
  try {
    const resumeResult = await aiService.parseResume(testResume);
    console.log('✅ Resume parsing successful');
    console.log('Skills found:', resumeResult.skills?.technical?.length || 0);
    console.log('Experience entries:', resumeResult.experience?.length || 0);
  } catch (error) {
    console.error('❌ Resume parsing failed:', error.message);
  }
  
  console.log('\n3️⃣ Testing Email Parsing...');
  const testSubject = 'Software Engineer Internship at Google';
  const testBody = `
    We are looking for a talented Software Engineer intern to join our team.
    
    Requirements:
    - Proficiency in JavaScript and React
    - Experience with Node.js
    - Knowledge of databases
    
    This is a paid internship position for Summer 2024.
    Location: Mountain View, CA
    Apply by: March 1, 2024
  `;
  
  try {
    const emailResult = await aiService.parseJobEmail(testSubject, testBody);
    console.log('✅ Email parsing successful');
    console.log('Job Type:', emailResult.jobType);
    console.log('Is Relevant:', emailResult.isRelevant);
    console.log('Relevance Score:', emailResult.relevanceScore);
  } catch (error) {
    console.error('❌ Email parsing failed:', error.message);
  }
  
  console.log('\n🎉 AI Service test completed!');
}

testAIService().catch(console.error);
