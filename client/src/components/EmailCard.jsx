// src/components/EmailCard.jsx
import React from 'react';
import styled from 'styled-components';
import { calculateMatchScore } from '../utils/scoreUtils';
import MatchScore from './MatchScore';
import EmailTags from './EmailTags';

const Card = styled.div`
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

  ${props => props.isSelected && `
    background: #ffffff;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  `}
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

const EmailCard = ({ 
  subject = 'No Subject', 
  snippet = 'No preview available', 
  onClick,
  isSelected,
  skills = []
}) => {
  const emailContent = `${subject} ${snippet}`;
  const { score } = calculateMatchScore(emailContent, skills);

  return (
    <Card onClick={onClick} isSelected={isSelected}>
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
