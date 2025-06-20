// Common word boundaries to avoid partial matches
const wordBoundaries = [' ', ',', '.', ':', ';', '(', ')', '[', ']', '{', '}', '\n', '\t', '-', '/', '\\', '&', '+'];

// Skill confidence thresholds
const CONFIDENCE = {
  REQUIRED: 2,
  PREFERRED: 1.5,
  MENTIONED: 1,
  CONTEXT: 0.5
};

// Job context categories
const JOB_CONTEXTS = {
  FRONTEND: ['frontend', 'ui', 'web development', 'interface', 'user experience', 'client-side'],
  BACKEND: ['backend', 'server', 'api', 'database', 'infrastructure', 'server-side'],
  FULLSTACK: ['full stack', 'full-stack', 'end-to-end', 'frontend', 'backend'],
  DEVOPS: ['devops', 'infrastructure', 'cloud', 'deployment', 'ci/cd'],
  DATA: ['data science', 'machine learning', 'ai', 'analytics', 'big data']
};

// Skill requirement indicators
const REQUIREMENT_INDICATORS = {
  required: ['required', 'must have', 'must-have', 'essential', 'necessary'],
  preferred: ['preferred', 'nice to have', 'nice-to-have', 'desirable', 'plus']
};

// Create a word boundary pattern for regex
const createWordBoundaryPattern = (keyword) => {
  // Handle special characters in regex
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Handle compound words with spaces or hyphens
  const pattern = escaped.replace(/\\s+/g, '[\\s-]+');
  return new RegExp(`(?:^|[\\s,;.()]|^-)${pattern}(?=[\\s,.;())]|$|-|\\d)`, 'i');
};

// Tech stack categories and their related keywords with display names
const techStackKeywords = {
  frontend: {
    react: {
      display: 'React',
      keywords: ['react', 'react.js', 'reactjs', 'react native', 'hooks', 'jsx', 'redux'],
      context: ['frontend', 'ui', 'interface', 'component']
    },
    nextjs: {
      display: 'Next.js',
      keywords: ['next.js', 'nextjs', 'next js', 'server-side rendering', 'ssr'],
      context: ['react', 'framework', 'frontend']
    },
    vue: {
      display: 'Vue.js',
      keywords: ['vue', 'vue.js', 'vuejs', 'vuex', 'nuxt'],
      context: ['frontend', 'ui', 'interface']
    },
    angular: {
      display: 'Angular',
      keywords: ['angular', 'angularjs', 'ng'],
      context: ['frontend', 'typescript', 'google']
    },
    typescript: {
      display: 'TypeScript',
      keywords: ['typescript', 'ts', 'type safety', 'types'],
      context: ['javascript', 'development', 'microsoft']
    },
    javascript: {
      display: 'JavaScript',
      keywords: ['javascript', 'js', 'es6', 'es2015', 'ecmascript'],
      context: ['frontend', 'web', 'development']
    },
    css: {
      display: 'CSS & Styling',
      keywords: ['css', 'css3', 'sass', 'scss', 'less', 'styled-components', 'tailwind'],
      context: ['style', 'design', 'frontend']
    },
  },
  backend: {
    node: {
      display: 'Node.js',
      keywords: ['node', 'node.js', 'nodejs', 'express', 'nestjs', 'nest'],
      context: ['backend', 'server', 'javascript']
    },
    python: {
      display: 'Python',
      keywords: ['python', 'django', 'flask', 'fastapi', 'pytorch'],
      context: ['backend', 'data science', 'ml']
    },
    java: {
      display: 'Java',
      keywords: ['java', 'spring', 'spring boot', 'hibernate', 'j2ee'],
      context: ['backend', 'enterprise']
    },
    dotnet: {
      display: '.NET',
      keywords: ['.net', 'c#', 'asp.net', 'entity framework'],
      context: ['microsoft', 'backend']
    },
    databases: {
      display: 'Databases',
      keywords: ['sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'redis'],
      context: ['data', 'storage', 'backend']
    },
  },
  devops: {
    cloud: {
      display: 'Cloud Computing',
      keywords: ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda'],
      context: ['infrastructure', 'deployment']
    },
    containerization: {
      display: 'Containerization',
      keywords: ['docker', 'kubernetes', 'k8s', 'container'],
      context: ['devops', 'deployment']
    },
    ci_cd: {
      display: 'CI/CD',
      keywords: ['jenkins', 'gitlab ci', 'github actions', 'ci/cd', 'continuous integration'],
      context: ['automation', 'deployment']
    },
  },
  tools: {
    version_control: {
      display: 'Version Control',
      keywords: ['git', 'github', 'gitlab', 'bitbucket'],
      context: ['collaboration', 'code']
    },
    testing: {
      display: 'Testing',
      keywords: ['jest', 'cypress', 'selenium', 'unit testing', 'e2e'],
      context: ['quality', 'automation']
    },
    agile: {
      display: 'Agile',
      keywords: ['agile', 'scrum', 'jira', 'kanban'],
      context: ['methodology', 'project management']
    },
  }
};

// Helper functions for skill detection
const isWordMatch = (text, keyword) => {
  const pattern = createWordBoundaryPattern(keyword);
  return pattern.test(text);
};

const hasContextMatch = (text, contextWords) => {
  return contextWords.some(word => {
    const pattern = createWordBoundaryPattern(word);
    return pattern.test(text);
  });
};

const getSkillRequirementLevel = (text, skillKeyword) => {
  // Look for requirement indicators near the skill mention
  const surroundingText = text.slice(
    Math.max(0, text.toLowerCase().indexOf(skillKeyword.toLowerCase()) - 50),
    Math.min(text.length, text.toLowerCase().indexOf(skillKeyword.toLowerCase()) + 50)
  );

  if (REQUIREMENT_INDICATORS.required.some(ind => surroundingText.toLowerCase().includes(ind))) {
    return 'required';
  }
  if (REQUIREMENT_INDICATORS.preferred.some(ind => surroundingText.toLowerCase().includes(ind))) {
    return 'preferred';
  }
  return 'mentioned';
};

const detectJobContext = (text) => {
  const contexts = new Set();
  Object.entries(JOB_CONTEXTS).forEach(([context, keywords]) => {
    if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
      contexts.add(context);
    }
  });
  return Array.from(contexts);
};

const calculateSkillConfidence = (text, skill, jobContexts) => {
  let confidence = 0;
  const mentions = new Map();
  
  // Check for exact keyword matches and count mentions
  skill.keywords.forEach(keyword => {
    const pattern = createWordBoundaryPattern(keyword);
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      const count = matches.length;
      mentions.set(keyword, count);
      confidence += Math.min(count, 3) * 0.5; // Cap frequency boost at 3 mentions
    }
  });

  // Check for context matches
  skill.context.forEach(context => {
    if (text.toLowerCase().includes(context.toLowerCase())) {
      confidence += CONFIDENCE.CONTEXT;
    }
  });

  // Boost confidence if skill aligns with job context
  const skillContext = skill.context[0] || '';
  if (jobContexts.some(context => JOB_CONTEXTS[context].some(kw => 
    skillContext.toLowerCase().includes(kw.toLowerCase())
  ))) {
    confidence += CONFIDENCE.CONTEXT;
  }

  // Check requirement level
  if (mentions.size > 0) {
    const firstKeyword = Array.from(mentions.keys())[0];
    const requirementLevel = getSkillRequirementLevel(text, firstKeyword);
    if (requirementLevel === 'required') {
      confidence += CONFIDENCE.REQUIRED;
    } else if (requirementLevel === 'preferred') {
      confidence += CONFIDENCE.PREFERRED;
    } else {
      confidence += CONFIDENCE.MENTIONED;
    }
  }

  return {
    confidence,
    mentions: Object.fromEntries(mentions),
    requirementLevel: mentions.size > 0 ? 
      getSkillRequirementLevel(text, Array.from(mentions.keys())[0]) : 'none'
  };
};

// Find missing skills by comparing email requirements with resume skills
export const detectSkillGaps = (emailContent, resumeSkills) => {
  const emailLower = emailContent.toLowerCase();
  const resumeLower = resumeSkills.join(' ').toLowerCase();
  const gaps = [];
  const matches = [];
  const jobContexts = detectJobContext(emailContent);

  // Helper function to check if any keyword from a skill is present in the text
  const hasSkill = (text, skill) => {
    const keywordMatch = skill.keywords.some(keyword => isWordMatch(text, keyword));
    const contextMatch = hasContextMatch(text, skill.context);
    return keywordMatch || (keywordMatch && contextMatch); // More lenient for resume matches
  };

  // Go through each category and technology
  Object.entries(techStackKeywords).forEach(([category, technologies]) => {
    Object.entries(technologies).forEach(([tech, skillInfo]) => {
      const { confidence, mentions, requirementLevel } = calculateSkillConfidence(emailLower, skillInfo, jobContexts);
      
      // Only consider skills mentioned with sufficient confidence
      if (confidence >= CONFIDENCE.MENTIONED) {
        const foundInResume = hasSkill(resumeLower, skillInfo);
        const matchData = {
          category,
          technology: tech,
          displayName: skillInfo.display,
          confidence,
          requirementLevel,
          mentions,
          keywords: skillInfo.keywords.filter(k => isWordMatch(emailLower, k)),
          context: skillInfo.context.filter(c => emailLower.includes(c.toLowerCase()))
        };

        if (!foundInResume) {
          gaps.push({
            ...matchData,
            severity: requirementLevel === 'required' ? 'high' : 
                     requirementLevel === 'preferred' ? 'medium' : 'low'
          });
        } else {
          matches.push(matchData);
        }
      }
    });
  });

  const relatedSkills = new Set();
  
  // Find related skills that might be relevant
  gaps.forEach(gap => {
    Object.entries(techStackKeywords).forEach(([category, technologies]) => {
      Object.entries(technologies).forEach(([tech, skillInfo]) => {
        // Skip if it's already in gaps or matches
        if (tech === gap.technology) return;
        if (gaps.some(g => g.technology === tech)) return;
        if (matches.some(m => m.technology === tech)) return;

        // Add related technologies based on shared context or category
        const hasSharedContext = skillInfo.context.some(context => 
          gap.context.includes(context.toLowerCase())
        );

        if (hasSharedContext || category === gap.category) {
          relatedSkills.add({
            category,
            technology: tech,
            displayName: skillInfo.display,
            relation: hasSharedContext 
              ? `Related to ${gap.displayName} (${gap.context[0]})`
              : `Same category as ${gap.displayName}`,
            priority: hasSharedContext ? 'high' : 'medium'
          });
        }
      });
    });
  });

  // Sort gaps by severity and confidence
  const sortedGaps = [...gaps].sort((a, b) => {
    if (a.severity === b.severity) {
      return b.confidence - a.confidence;
    }
    return a.severity === 'high' ? -1 : 1;
  });

  return {
    gaps: sortedGaps,
    matches,
    relatedSkills: Array.from(relatedSkills).sort((a, b) => 
      a.priority === 'high' ? -1 : 1
    ),
    summary: {
      totalGaps: gaps.length,
      criticalGaps: gaps.filter(g => g.severity === 'high').length,
      matchedSkills: matches.length,
      relatedSkillsCount: relatedSkills.size,
      overallMatch: Math.round((matches.length / (matches.length + gaps.length)) * 100) || 0
    }
  };
};

// Get a text summary of skill gaps
export const getSkillGapSummary = (analysis) => {
  const { gaps, matches, relatedSkills } = analysis;
  
  if (!gaps.length) {
    const matchCount = matches.length;
    if (matchCount > 5) {
      return "Excellent match! Your skills align perfectly with all key requirements.";
    }
    return "Your skills match well with the job requirements!";
  }

  const requiredGaps = gaps.filter(g => g.requirementLevel === 'required');
  const preferredGaps = gaps.filter(g => g.requirementLevel === 'preferred');
  const otherGaps = gaps.filter(g => g.requirementLevel === 'mentioned');

  let summaryText = '';

  if (requiredGaps.length > 0) {
    summaryText += `Required skills to focus on: ${requiredGaps
      .map(g => g.displayName)
      .join(', ')}.\n`;
  }

  if (preferredGaps.length > 0) {
    summaryText += `Preferred skills that would help: ${preferredGaps
      .map(g => g.displayName)
      .join(', ')}.\n`;
  }

  if (otherGaps.length > 0) {
    summaryText += `Other mentioned skills: ${otherGaps
      .map(g => g.displayName)
      .join(', ')}.\n`;
  }

  const topRelated = Array.from(relatedSkills)
    .filter(skill => skill.priority === 'high')
    .slice(0, 3);

  if (topRelated.length > 0) {
    summaryText += `\nTop related skills to consider: ${
      topRelated
        .map(skill => `${skill.displayName} (${skill.relation})`)
        .join(', ')
    }`;
  }

  // Add match percentage and positive reinforcement
  const matchPercentage = Math.round((matches.length / (matches.length + gaps.length)) * 100);
  if (matchPercentage > 70) {
    summaryText += `\n\nOverall, you're a ${matchPercentage}% match for this role. Focus on the gaps above to become an even stronger candidate!`;
  } else if (matchPercentage > 40) {
    summaryText += `\n\nYou match ${matchPercentage}% of the requirements. Consider upskilling in the required areas to improve your chances.`;
  } else {
    summaryText += `\n\nThis role might be a stretch with a ${matchPercentage}% match, but you can bridge the gap by focusing on the required skills first.`;
  }

  return summaryText;
};

// Get a confidence score for a skill match
export const getMatchConfidence = (match) => {
  const { confidence, requirementLevel } = match;
  if (requirementLevel === 'required' && confidence >= CONFIDENCE.REQUIRED) {
    return 'Excellent';
  } else if (requirementLevel === 'preferred' && confidence >= CONFIDENCE.PREFERRED) {
    return 'Strong';
  } else if (confidence >= CONFIDENCE.MENTIONED) {
    return 'Good';
  }
  return 'Fair';
};
