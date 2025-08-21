// simple-test.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function simpleTest() {
  console.log('🔧 Simple API Test...\n');
  
  console.log('API Key exists:', !!OPENROUTER_API_KEY);
  console.log('API Key length:', OPENROUTER_API_KEY?.length);
  
  if (!OPENROUTER_API_KEY) {
    console.error('❌ No API key found!');
    return;
  }
  
  // Test with a simpler free model
  const models = [
    'microsoft/wizardlm-2-8x22b',
    'meta-llama/llama-3.1-8b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'mistralai/mistral-7b-instruct:free'
  ];
  
  for (const model of models) {
    console.log(`\n🧪 Testing model: ${model}`);
    
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hello! Reply with just "Working" and nothing else.'
            }
          ],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3500',
            'X-Title': 'GmailGenius'
          },
          timeout: 30000
        }
      );
      
      console.log('✅ SUCCESS! Response:', response.data.choices[0].message.content);
      console.log(`💡 Working model found: ${model}`);
      break;
      
    } catch (error) {
      console.log('❌ Failed:', error.response?.status, error.response?.statusText);
      if (error.response?.data) {
        console.log('Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

simpleTest();
