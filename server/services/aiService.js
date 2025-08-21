// services/aiService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Available models - you can change this based on your needs
const FALLBACK_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'huggingfaceh4/zephyr-7b-beta:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/wizardlm-2-8x22b'
];
const DEFAULT_MODEL = FALLBACK_MODELS[0];
// const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet'; // Premium model

class AIService {
  constructor() {
    if (!OPENROUTER_API_KEY) {
      console.warn('⚠️ OpenRouter API key not found. AI features will use fallback parsing.');
    }
    
    this.client = axios.create({
      baseURL: OPENROUTER_BASE_URL,
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3500',
        'X-Title': 'GmailGenius'
      },
      timeout: 30000 // 30 second timeout
    });
    
    this.workingModel = null; // Cache for working model
  }

  /**
   * Find a working model from the fallback list
   */
  async findWorkingModel() {
    if (this.workingModel) {
      return this.workingModel;
    }

    console.log('🔍 Testing available models...');
    
    for (const model of FALLBACK_MODELS) {
      try {
        const response = await this.client.post('/chat/completions', {
          model: model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        });
        
        if (response.data.choices && response.data.choices[0]) {
          console.log(`✅ Found working model: ${model}`);
          this.workingModel = model;
          return model;
        }
      } catch (error) {
        console.log(`❌ Model ${model} failed:`, error.response?.status);
      }
    }
    
    throw new Error('No working models found');
  }

  /**
   * Make a chat completion request with error handling
   */
  async makeRequest(messages, maxTokens = 2000, retries = 2) {
    if (!OPENROUTER_API_KEY) {
      console.log('⚠️ OpenRouter API key not configured, using fallback mode');
      throw new Error('OpenRouter API key not configured');
    }

    // For now, skip API calls due to exposed/disabled API key
    console.log('⚠️ OpenRouter API temporarily disabled due to security concerns, using fallback mode');
    throw new Error('OpenRouter API temporarily disabled - please generate new API key');

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        console.log(`🤖 Making AI request to OpenRouter... (attempt ${attempt})`);
        
        // Try to find a working model if we don't have one
        const model = this.workingModel || await this.findWorkingModel();
        
        const response = await this.client.post('/chat/completions', {
          model: model,
          messages,
          temperature: 0.1,
          max_tokens: maxTokens
        });

        console.log('✅ AI request successful');
        return response.data.choices[0].message.content;
      } catch (error) {
        console.error(`❌ OpenRouter API Error (attempt ${attempt}):`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Specific error handling
        if (error.response?.status === 404) {
          // Reset working model and try again with a different one
          this.workingModel = null;
          if (attempt < retries + 1) {
            console.log('🔄 Model not found, trying different model...');
            continue;
          }
          throw new Error(`Model not found. Will try a different model next time.`);
        } else if (error.response?.status === 401) {
          throw new Error('Invalid API key or unauthorized access');
        } else if (error.response?.status === 429) {
          if (attempt < retries + 1) {
            console.log('🔄 Rate limited, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Progressive delay
            continue;
          }
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 408 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          if (attempt < retries + 1) {
            console.log('🔄 Request timeout, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Progressive delay
            continue;
          }
          throw new Error('Request timeout. OpenRouter API is slow or unreachable.');
        }
        
        // For other errors, don't retry
        throw error;
      }
    }
  }

  /**
   * Parse resume text into structured skills and experience
   */
  async parseResume(resumeText) {
    const prompt = `
You are an expert resume parser. Analyze the following resume text and extract structured information.

Resume Text:
"""
${resumeText}
"""

Please respond with a JSON object containing:
{
  "skills": {
    "technical": ["skill1", "skill2", ...],
    "soft": ["skill1", "skill2", ...],
    "languages": ["language1", "language2", ...],
    "frameworks": ["framework1", "framework2", ...],
    "tools": ["tool1", "tool2", ...]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "2020-2023",
      "description": "Brief description",
      "keyAchievements": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "2020",
      "field": "Field of Study"
    }
  ],
  "summary": "A brief professional summary extracted from the resume"
}

Focus on extracting actual skills mentioned in the resume. Be precise and avoid hallucinating skills that aren't explicitly mentioned.
`;

    try {
      const content = await this.makeRequest([
        {
          role: 'user',
          content: prompt
        }
      ], 2000);
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI JSON response:', parseError);
      }

      // Fallback to basic parsing if JSON parsing fails
      return this.fallbackResumeParser(resumeText);
    } catch (error) {
      console.error('AI resume parsing failed:', error.message);
      return this.fallbackResumeParser(resumeText);
    }
  }

  /**
   * Parse email content into structured job requirements
   */
  async parseJobEmail(emailSubject, emailBody) {
    const prompt = `
You are an expert at analyzing job-related emails. Analyze the following email and extract structured job requirements.

Email Subject: ${emailSubject}
Email Content:
"""
${emailBody}
"""

Please respond with a JSON object containing:
{
  "jobType": "internship|job|freelance|competition|other",
  "title": "Extracted job title or opportunity name",
  "company": "Company name if mentioned",
  "requirements": {
    "required": ["skill1", "skill2", ...],
    "preferred": ["skill1", "skill2", ...],
    "experience": "Required experience level",
    "education": "Education requirements"
  },
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "benefits": ["benefit1", "benefit2", ...],
  "location": "Location if mentioned",
  "salary": "Salary range if mentioned",
  "deadline": "Application deadline if mentioned",
  "isRelevant": true/false,
  "relevanceScore": 0-100,
  "summary": "Brief summary of the opportunity"
}

Only extract information that is explicitly mentioned in the email. Set isRelevant to false if this doesn't appear to be a job/internship/opportunity email.
`;

    try {
      const content = await this.makeRequest([
        {
          role: 'user',
          content: prompt
        }
      ], 1500);
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI JSON response:', parseError);
      }

      // Fallback to basic parsing if JSON parsing fails
      return this.fallbackEmailParser(emailSubject, emailBody);
    } catch (error) {
      console.error('AI email parsing failed:', error.message);
      return this.fallbackEmailParser(emailSubject, emailBody);
    }
  }

  /**
   * Compare resume and job requirements to generate match analysis
   */
  async compareAndAnalyze(resumeData, jobData) {
    const prompt = `
You are an expert career counselor. Compare the following resume data with job requirements and provide a comprehensive analysis.

Resume Data:
"""
${JSON.stringify(resumeData, null, 2)}
"""

Job Requirements:
"""
${JSON.stringify(jobData, null, 2)}
"""

Please respond with a JSON object containing:
{
  "matchPercentage": 85,
  "matchedSkills": [
    {
      "skill": "React",
      "level": "intermediate",
      "relevance": "high"
    }
  ],
  "missingSkills": [
    {
      "skill": "Node.js", 
      "priority": "high|medium|low",
      "category": "required|preferred"
    }
  ],
  "experienceMatch": {
    "hasRelevantExperience": true,
    "experienceGap": "2 years junior level experience needed",
    "relevantProjects": ["project1", "project2"]
  },
  "recommendations": [
    "Focus on learning Node.js for backend development",
    "Highlight your React experience in your application"
  ],
  "strengthsToHighlight": [
    "Strong frontend skills with React",
    "Good understanding of UI/UX principles"
  ],
  "applicationTips": [
    "Customize your resume to emphasize React experience",
    "Consider taking a Node.js course before applying"
  ],
  "summary": "You have a strong foundation for this role with 85% skill match. Focus on backend development skills to become a perfect candidate.",
  "shouldApply": true,
  "confidenceLevel": "high|medium|low"
}

Be honest about the match and provide actionable recommendations.
`;

    try {
      const content = await this.makeRequest([
        {
          role: 'user',
          content: prompt
        }
      ], 2000);
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI JSON response:', parseError);
      }

      // Fallback analysis
      return this.fallbackAnalysis(resumeData, jobData);
    } catch (error) {
      console.error('AI analysis failed:', error.message);
      return this.fallbackAnalysis(resumeData, jobData);
    }
  }

  /**
   * Fallback resume parser (rule-based)
   */
  fallbackResumeParser(resumeText) {
    const skills = {
      technical: [],
      soft: [],
      languages: [],
      frameworks: [],
      tools: []
    };

    // Basic skill extraction using keywords
    const technicalKeywords = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css'];
    const frameworkKeywords = ['react', 'angular', 'vue', 'express', 'django', 'flask'];
    const toolKeywords = ['git', 'docker', 'kubernetes', 'aws', 'jenkins'];

    const lowerText = resumeText.toLowerCase();

    technicalKeywords.forEach(skill => {
      if (lowerText.includes(skill)) {
        skills.technical.push(skill);
      }
    });

    return {
      skills,
      experience: [],
      education: [],
      summary: "Resume parsed using fallback method"
    };
  }

  /**
   * Fallback email parser (rule-based)
   */
  fallbackEmailParser(subject, body) {
    // Handle undefined/null values safely
    const safeSubject = subject || '';
    const safeBody = body || '';
    const lowerSubject = safeSubject.toLowerCase();
    const lowerBody = safeBody.toLowerCase();
    const fullText = (safeSubject + ' ' + safeBody).toLowerCase();
    
    // Determine job type
    let jobType = 'other';
    if (lowerSubject.includes('internship') || lowerBody.includes('internship')) {
      jobType = 'internship';
    } else if (lowerSubject.includes('job') || lowerBody.includes('position') || lowerBody.includes('developer') || lowerBody.includes('engineer')) {
      jobType = 'job';
    }

    // Extract company name (simple patterns)
    let company = "Unknown";
    const atMatch = safeSubject.match(/at\s+([A-Z][a-zA-Z\s&.]+?)(?:\s+and|\s+in|\s*$)/);
    if (atMatch) {
      company = atMatch[1].trim();
    }

    // Extract common tech skills from email content
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue',
      'typescript', 'html', 'css', 'mongodb', 'sql', 'mysql', 'postgresql',
      'aws', 'docker', 'kubernetes', 'git', 'linux', 'express', 'nestjs',
      'spring', 'django', 'flask', '.net', 'c#', 'c++', 'php', 'ruby',
      'golang', 'rust', 'scala', 'kotlin', 'swift', 'flutter', 'android',
      'ios', 'react native', 'redux', 'graphql', 'rest api', 'microservices',
      'devops', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'redis',
      'elasticsearch', 'kafka', 'rabbitmq', 'firebase', 'stripe', 'apis'
    ];

    const foundSkills = techSkills.filter(skill => 
      fullText.includes(skill.toLowerCase()) || 
      fullText.includes(skill.replace(' ', ''))
    );

    // Extract experience level
    let experience = "Not specified";
    if (fullText.includes('fresh') || fullText.includes('entry') || fullText.includes('0-1') || fullText.includes('0 year')) {
      experience = "Entry level";
    } else if (fullText.includes('2-3') || fullText.includes('2-4') || fullText.includes('junior')) {
      experience = "2-3 years";
    } else if (fullText.includes('3-5') || fullText.includes('4-6') || fullText.includes('mid') || fullText.includes('senior')) {
      experience = "3-5 years";
    } else if (fullText.includes('5+') || fullText.includes('6+') || fullText.includes('lead') || fullText.includes('senior')) {
      experience = "5+ years";
    }

    return {
      jobType,
      title: safeSubject || "Unknown Position",
      company: company,
      requirements: {
        required: foundSkills.slice(0, Math.ceil(foundSkills.length * 0.7)), // 70% as required
        preferred: foundSkills.slice(Math.ceil(foundSkills.length * 0.7)), // 30% as preferred
        experience: experience,
        education: fullText.includes('degree') || fullText.includes('bachelor') || fullText.includes('master') ? 
                  "Bachelor's degree preferred" : "Not specified"
      },
      responsibilities: [],
      benefits: [],
      location: this.extractLocation(fullText),
      salary: this.extractSalary(fullText),
      deadline: "Not specified",
      isRelevant: jobType !== 'other' || foundSkills.length > 0,
      relevanceScore: jobType !== 'other' ? Math.min(70 + foundSkills.length * 5, 95) : Math.min(20 + foundSkills.length * 10, 60),
      summary: `Email parsed using fallback method. Found ${foundSkills.length} technical skills.`
    };
  }

  /**
   * Extract location from text
   */
  extractLocation(text) {
    const locationPatterns = [
      /in\s+(bangalore|mumbai|delhi|hyderabad|pune|chennai|kolkata|ahmedabad|gurugram|noida|remote)/i,
      /location[:\s]+([\w\s,]+)/i,
      /(bangalore|mumbai|delhi|hyderabad|pune|chennai|kolkata|ahmedabad|gurugram|noida|remote)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return "Not specified";
  }

  /**
   * Extract salary from text
   */
  extractSalary(text) {
    const salaryPatterns = [
      /(\d+[\s-]+to[\s-]+\d+)[\s]*(?:lpa|lakhs?|per annum)/i,
      /(\d+[\s-]*lakhs?)[\s]*(?:per annum|lpa)?/i,
      /salary[:\s]*(\d+[\s-]*(?:to[\s-]*\d+)?[\s]*(?:lpa|lakhs?))/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return "Not specified";
  }

  /**
   * Fallback analysis (rule-based)
   */
  fallbackAnalysis(resumeData, jobData) {
    // Extract skills from resume
    const resumeSkills = [];
    if (resumeData.skills) {
      resumeSkills.push(...resumeData.skills);
    }
    if (resumeData.technicalSkills) {
      resumeSkills.push(...resumeData.technicalSkills);
    }
    if (resumeData.languages) {
      resumeSkills.push(...resumeData.languages);
    }
    
    // Normalize resume skills to lowercase
    const normalizedResumeSkills = resumeSkills.map(skill => 
      typeof skill === 'string' ? skill.toLowerCase() : String(skill).toLowerCase()
    );

    // Get job requirements
    const requiredSkills = jobData.requirements?.required || [];
    const preferredSkills = jobData.requirements?.preferred || [];
    const allJobSkills = [...requiredSkills, ...preferredSkills];

    // Find matching skills
    const matchedSkills = allJobSkills.filter(jobSkill => 
      normalizedResumeSkills.some(resumeSkill => 
        resumeSkill.includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(resumeSkill) ||
        this.areSkillsSimilar(resumeSkill, jobSkill.toLowerCase())
      )
    );

    // Find missing required skills
    const missingSkills = requiredSkills.filter(reqSkill => 
      !normalizedResumeSkills.some(resumeSkill => 
        resumeSkill.includes(reqSkill.toLowerCase()) || 
        reqSkill.toLowerCase().includes(resumeSkill) ||
        this.areSkillsSimilar(resumeSkill, reqSkill.toLowerCase())
      )
    );

    // Calculate match percentage
    const totalRequiredSkills = requiredSkills.length || 1;
    const matchedRequiredSkills = requiredSkills.length - missingSkills.length;
    const baseMatchPercentage = (matchedRequiredSkills / totalRequiredSkills) * 100;
    
    // Bonus for preferred skills
    const preferredBonus = preferredSkills.length > 0 ? 
      (matchedSkills.filter(skill => preferredSkills.includes(skill)).length / preferredSkills.length) * 20 : 0;
    
    const finalMatchPercentage = Math.min(Math.round(baseMatchPercentage + preferredBonus), 100);

    // Determine confidence level
    let confidenceLevel = "low";
    if (matchedSkills.length >= 3 && missingSkills.length <= 2) {
      confidenceLevel = "high";
    } else if (matchedSkills.length >= 2 && missingSkills.length <= 3) {
      confidenceLevel = "medium";
    }

    // Generate recommendations
    const recommendations = [];
    if (missingSkills.length > 0) {
      recommendations.push(`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    if (matchedSkills.length > 0) {
      recommendations.push(`Highlight your experience with: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    if (finalMatchPercentage < 60) {
      recommendations.push("This role may require additional skill development");
    }

    return {
      matchPercentage: finalMatchPercentage,
      matchedSkills: matchedSkills,
      missingSkills: missingSkills,
      summary: `Found ${matchedSkills.length} matching skills out of ${allJobSkills.length} required/preferred skills. ${missingSkills.length} skills missing.`,
      shouldApply: finalMatchPercentage >= 40 && missingSkills.length <= 5,
      confidenceLevel: confidenceLevel,
      recommendations: recommendations,
      strengthsToHighlight: matchedSkills.slice(0, 5),
      applicationTips: [
        "Tailor your application to highlight matching skills",
        "Address any skill gaps in your cover letter",
        "Show examples of projects using the required technologies"
      ]
    };
  }

  /**
   * Check if two skills are similar (handle variations)
   */
  areSkillsSimilar(skill1, skill2) {
    const skillMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'reactjs': 'react',
      'nodejs': 'node',
      'node.js': 'node',
      'mongodb': 'mongo',
      'postgresql': 'postgres',
      'mysql': 'sql'
    };

    const normalized1 = skillMap[skill1] || skill1;
    const normalized2 = skillMap[skill2] || skill2;

    return normalized1 === normalized2 || 
           normalized1.includes(normalized2) || 
           normalized2.includes(normalized1);
  }
}

export default new AIService();
