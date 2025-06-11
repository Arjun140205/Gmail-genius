// src/components/EmailCard.jsx
import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: #fafafa;
  border: 1px solid #e5e5e5;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border-color: #d4d4d4;
    background: #ffffff;
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
  font-size: 1.25rem;
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Details = styled.div`
  flex: 1;
`;

const Subject = styled.h4`
  font-weight: 600;
  font-size: 1.1rem;
  color: #262626;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const Snippet = styled.p`
  color: #525252;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DateText = styled.p`
  color: #737373;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:before {
    content: '•';
    font-size: 1.2em;
    line-height: 0;
    color: #a3a3a3;
  }
`;

const StyledMark = styled.mark`
  background-color: #fef9c3;
  color: #854d0e;
  padding: 0.1em 0.2em;
  border-radius: 2px;
`;

function highlight(text, keyword) {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <StyledMark key={i}>{part}</StyledMark>
    ) : (
      part
    )
  );
}

const EmailCard = ({ email, searchTerm, onClick }) => {
  const { subject, snippet, internalDate } = email;

  const formattedDate = internalDate
    ? new Date(Number(internalDate)).toLocaleString()
    : '';

  return (
    <Card onClick={onClick}>
      <Content>
        <IconWrapper>
          <span>📧</span>
        </IconWrapper>
        <Details>
          <Subject>
            {highlight(subject || '(No Subject)', searchTerm)}
          </Subject>
          <Snippet>{highlight(snippet || '', searchTerm)}</Snippet>
          <DateText>{formattedDate}</DateText>
        </Details>
      </Content>
    </Card>
  );
};

export default EmailCard;
