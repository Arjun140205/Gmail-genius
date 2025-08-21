// simple-api-test.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function testAPI() {
  console.log('🧪 Testing OpenRouter API Connection...\n');
  
  console.log('API Key:', OPENROUTER_API_KEY ? 'Present' : 'Missing');
  console.log('API Key length:', OPENROUTER_API_KEY?.length || 0);
  console.log('API Key starts with:', OPENROUTER_API_KEY?.substring(0, 15) + '...\n');
  
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'user',
          content: 'Hello, can you respond with just "API Working"?'
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3500',
        'X-Title': 'GmailGenius'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ API Response received');
    console.log('Response:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ API Error:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

testAPI();
