// src/components/EmailCard.jsx
import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { calculateMatchScore } from '../utils/scoreUtils';
import { detectSkillGaps } from '../utils/skillGapUtils';
import MatchScore from './MatchScore';
import EmailTags from './EmailTags';
import SkillGapAnalysis from './SkillGapAnalysis';
import ChatAssistant from './ChatAssistant';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

// Styled components...
const StyledCard = styled.div`
  background: #fafafa;
  border: 1px solid #e5e5e5;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border-color: #d4d4d4;
    background: #ffffff;
  }

  &.selected {
    background: #ffffff;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

const Card = React.memo(({ isSelected, ...props }) => (
  <StyledCard className={isSelected ? 'selected' : ''} {...props} />
));

const Content = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  background: #f5f5f5;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextContent = styled.div`
  flex: 1;
`;

const Subject = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1a1a1a;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
`;

const Snippet = styled.p`
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
`;

const StyledSaveButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 9999px;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const SaveButton = React.memo(({ isSaved, ...props }) => (
  <StyledSaveButton
    style={{
      color: isSaved ? '#fbbf24' : '#9ca3af',
    }}
    {...props}
  />
));

const ExpandedContent = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e5e5;
`;

const EmailCard = React.memo(({ 
  id,
  subject = 'No Subject', 
  snippet = 'No preview available', 
  onClick,
  isSelected,
  skills = [],
  isSaved,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToggle = useCallback(async (e) => {
    e.stopPropagation(); // Prevent card selection when clicking save
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onSave({
        id,
        subject,
        snippet
      });
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, subject, snippet, isLoading, onSave]);

  // Memoize computed values
  const emailContent = useMemo(() => `${subject} ${snippet}`, [subject, snippet]);
  const score = useMemo(() => calculateMatchScore(emailContent, skills).score, [emailContent, skills]);
  const skillAnalysis = useMemo(() => detectSkillGaps(emailContent, skills), [emailContent, skills]);

  // Memoize the analysis complete handler
  const handleAnalysisComplete = useCallback((analysis) => {
    console.log('Analysis complete:', analysis);
  }, []);

  return (
    <Card onClick={onClick} isSelected={isSelected}>
      <SaveButton
        isSaved={isSaved}
        onClick={handleSaveToggle}
        disabled={isLoading}
        title={isSaved ? "Remove from saved" : "Save for later"}
      >
        {isSaved ? (
          <StarSolid className="h-6 w-6" />
        ) : (
          <StarOutline className="h-6 w-6" />
        )}
      </SaveButton>
      <Content>
        <IconWrapper>
          <span role="img" aria-label="email">✉️</span>
        </IconWrapper>
        <TextContent>
          <Subject>{subject}</Subject>
          <Snippet>{snippet}</Snippet>
          <EmailTags email={{ subject, snippet }} />
          <MatchScore score={score} />
        </TextContent>
      </Content>
      {isSelected && (
        <ExpandedContent>
          <div className="expanded-sections">
            <div className="skill-analysis">
              <SkillGapAnalysis analysis={skillAnalysis} />
            </div>
            <div className="chat-analysis">
              <ChatAssistant 
                email={{ subject, snippet }} 
                skills={skills}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>

          <style jsx="true">{`
            .expanded-sections {
              display: grid;
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            @media (min-width: 1024px) {
              .expanded-sections {
                grid-template-columns: 1fr 1fr;
              }
            }

            .skill-analysis {
              background: #f9fafb;
              padding: 1rem;
              border-radius: 8px;
            }

            .chat-analysis {
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          `}</style>
        </ExpandedContent>
      )}
    </Card>
  );
});

EmailCard.displayName = 'EmailCard';

export default EmailCard;
