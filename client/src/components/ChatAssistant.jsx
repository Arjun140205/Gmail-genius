import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { detectSkillGaps } from '../utils/skillGapUtils';

function ChatAssistant({ email, skills = [], initialSuggestions = [], onAnalysisComplete }) {
  const [messages, setMessages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState({ emailContent: '', skills: [] });

  // Memoize email content to prevent unnecessary recalculations
  const emailContent = useMemo(
    () => email ? `${email.subject || ''} ${email.snippet || ''}` : '',
    [email]
  );

  // Memoize whether we need to reanalyze
  const shouldReanalyze = useMemo(() => {
    return emailContent !== lastAnalysis.emailContent || 
           JSON.stringify(skills) !== JSON.stringify(lastAnalysis.skills);
  }, [emailContent, skills, lastAnalysis]);

  const getNextSteps = useCallback((analysis) => {
    if (!analysis) return [];
    
    const steps = [];
    const totalSkills = analysis.matches.length + analysis.gaps.length;
    const hasGoodMatch = totalSkills > 0 && 
      (analysis.matches.length / totalSkills) > 0.7;

    if (hasGoodMatch) {
      steps.push("✨ You're a strong candidate - consider applying!");
      steps.push("📝 Customize your resume to highlight matching skills");
    } else if (analysis.gaps.length > 0) {
      steps.push("📚 Consider upskilling in the missing areas");
      steps.push("💪 Focus on the required skills first");
    }

    return steps;
  }, []);

  const buildMessages = useCallback((skillGapAnalysis) => {
    const newMessages = [];

    // Only add messages if we have content to analyze
    if (!emailContent) {
      return newMessages;
    }

    newMessages.push({
      type: 'assistant',
      content: "👋 Let me analyze this opportunity for you..."
    });

    // Add initial suggestions if available
    if (initialSuggestions?.length > 0) {
      newMessages.push({
        type: 'assistant',
        content: "First, here's what I noticed about this opportunity:"
      });
      
      for (const suggestion of initialSuggestions) {
        newMessages.push({
          type: 'assistant',
          content: suggestion
        });
      }
    }

    // Handle case where no skills are provided
    if (!skills?.length) {
      newMessages.push({
        type: 'assistant',
        content: "📝 Upload your resume or add your skills to get personalized match analysis!"
      });
      return newMessages;
    }

    // Only proceed with skill analysis if we have both email content and skills
    if (skillGapAnalysis) {
      if (skillGapAnalysis.matches.length > 0) {
        const totalSkills = skillGapAnalysis.matches.length + skillGapAnalysis.gaps.length;
        const matchPercentage = totalSkills > 0 
          ? Math.round((skillGapAnalysis.matches.length / totalSkills) * 100)
          : 0;
          
        newMessages.push({
          type: 'assistant',
          content: `📊 You have a ${matchPercentage}% match with this opportunity.`
        });

        if (skillGapAnalysis.matches.length > 0) {
          newMessages.push({
            type: 'assistant',
            content: `✅ Your strengths: ${skillGapAnalysis.matches.map(m => m.displayName).join(', ')}`
          });
        }
      }

      if (skillGapAnalysis.gaps.length > 0) {
        const requiredGaps = skillGapAnalysis.gaps.filter(g => g.requirementLevel === 'required');
        if (requiredGaps.length > 0) {
          newMessages.push({
            type: 'assistant',
            content: `❗ Important skills to focus on: ${requiredGaps.map(g => g.displayName).join(', ')}`
          });
        }
      }

      const nextSteps = getNextSteps(skillGapAnalysis);
      if (nextSteps.length > 0) {
        newMessages.push({
          type: 'assistant',
          content: "Next steps:\n" + nextSteps.join('\n')
        });
      }
    }

    return newMessages;
  }, [emailContent, skills, initialSuggestions, getNextSteps]);

  useEffect(() => {
    let isMounted = true;

    const analyze = async () => {
      if (!shouldReanalyze) {
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);

      try {
        if (!emailContent || !skills?.length) {
          if (isMounted) {
            setMessages([]);
            setAnalysis(null);
          }
          return;
        }

        const skillGapAnalysis = detectSkillGaps(emailContent, skills);
        
        if (!isMounted) return;

        const newMessages = buildMessages(skillGapAnalysis);

        setAnalysis(skillGapAnalysis);
        setMessages(newMessages);
        setLastAnalysis({ emailContent, skills: [...skills] });

        if (onAnalysisComplete) {
          onAnalysisComplete(skillGapAnalysis);
        }
      } catch (error) {
        console.error('Error analyzing email:', error);
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    analyze();

    return () => {
      isMounted = false;
    };
  }, [emailContent, skills, shouldReanalyze, buildMessages, onAnalysisComplete]);

  return (
    <div className="chat-assistant">
      {isProcessing ? (
        <div className="processing">
          <div className="loading-spinner"></div>
          <p>Analyzing email content...</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <div key={i} className="message-line">{line}</div>
              ))}
            </div>
          </div>
        ))
      )}

      <style jsx="true">{`
        .chat-assistant {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 200px;
          position: relative;
        }

        .processing {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .message {
          display: flex;
          margin-bottom: 0.75rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          max-width: 90%;
          line-height: 1.5;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
        }

        .message-line {
          margin: 0.25rem 0;
        }

        .message-line:first-child {
          margin-top: 0;
        }

        .message-line:last-child {
          margin-bottom: 0;
        }

        .assistant .message-content {
          background: #f8fafc;
          color: #1f2937;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .user .message-content {
          background: #4f46e5;
          color: white;
          box-shadow: 0 1px 2px rgba(79, 70, 229, 0.1);
        }
      `}</style>
    </div>
  );
}

ChatAssistant.displayName = 'ChatAssistant';

export default React.memo(ChatAssistant);
