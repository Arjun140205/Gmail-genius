// debug-openrouter.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function debugOpenRouter() {
  console.log('🔍 Debugging OpenRouter API...\n');
  
  console.log('API Key:', OPENROUTER_API_KEY ? 'Present' : 'Missing');
  console.log('API Key length:', OPENROUTER_API_KEY?.length || 0);
  
  // Test 1: Check models endpoint
  console.log('\n1️⃣ Testing models endpoint...');
  try {
    const modelsResponse = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      timeout: 10000
    });
    console.log('✅ Models endpoint working');
    console.log('Available models count:', modelsResponse.data.data?.length || 0);
  } catch (error) {
    console.error('❌ Models endpoint failed:', error.response?.status, error.response?.statusText);
    console.error('Error details:', error.response?.data);
  }
  
  // Test 2: Test chat completions with simple request
  console.log('\n2️⃣ Testing chat completions...');
  try {
    const chatResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello World" and nothing else.'
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
      timeout: 15000
    });
    
    console.log('✅ Chat completions working');
    console.log('Response:', chatResponse.data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Chat completions failed:', error.response?.status, error.response?.statusText);
    console.error('Error details:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

debugOpenRouter();
