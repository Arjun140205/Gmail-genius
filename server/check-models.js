// check-models.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function checkModels() {
  console.log('🔍 Checking available models...\n');
  
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      }
    });
    
    console.log('✅ Models API working');
    const models = response.data.data;
    
    // Find free models
    const freeModels = models.filter(model => 
      model.pricing && 
      (model.pricing.prompt === "0" || model.pricing.prompt === 0)
    );
    
    console.log('\n🆓 Free models available:');
    freeModels.slice(0, 10).forEach(model => {
      console.log(`- ${model.id}`);
      console.log(`  Context: ${model.context_length}`);
      console.log(`  Pricing: prompt=$${model.pricing.prompt}, completion=$${model.pricing.completion}`);
      console.log('');
    });
    
    // Test a simple request with the first free model
    if (freeModels.length > 0) {
      const testModel = freeModels[0].id;
      console.log(`🧪 Testing model: ${testModel}`);
      
      try {
        const testResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: testModel,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello from AI" and nothing else.'
            }
          ],
          max_tokens: 10
        }, {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3500',
            'X-Title': 'GmailGenius'
          }
        });
        
        console.log('✅ Test successful!');
        console.log('Response:', testResponse.data.choices[0].message.content);
        console.log(`\n💡 Recommended model: ${testModel}`);
        
      } catch (error) {
        console.error('❌ Test failed:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Models API failed:', error.response?.status, error.response?.data);
  }
}

checkModels();
