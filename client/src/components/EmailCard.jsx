// src/components/EmailCard.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { savedEmailsApi } from '../utils/api';
import { calculateMatchScore } from '../utils/scoreUtils';
import MatchScore from './MatchScore';
import EmailTags from './EmailTags';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const Card = styled.div.attrs(props => ({
  className: props.isSelected ? 'selected' : ''
}))`
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

const CardActions = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const SaveButton = styled.button.attrs(props => ({
  'data-saved': props.isSaved ? 'true' : 'false'
}))`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props['data-saved'] === 'true' ? '#fbbf24' : '#9ca3af'};
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 9999px;

  &:hover {
    color: ${props => props['data-saved'] === 'true' ? '#f59e0b' : '#6b7280'};
    background: rgba(0, 0, 0, 0.05);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const EmailCard = ({ 
  id,
  subject = 'No Subject', 
  snippet = 'No preview available', 
  onClick,
  isSelected,
  skills = [],
  onSave,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSavedStatus();
  }, [id]);

  const checkSavedStatus = async () => {
    try {
      const response = await savedEmailsApi.checkSavedStatus(id);
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation(); // Prevent card selection when clicking save
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await savedEmailsApi.unsaveEmail(id);
        setIsSaved(false);
      } else {
        await savedEmailsApi.saveEmail({
          emailId: id,
          subject,
          snippet
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const emailContent = `${subject} ${snippet}`;
  const { score } = calculateMatchScore(emailContent, skills);

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
    </Card>
  );
};

export default EmailCard;
