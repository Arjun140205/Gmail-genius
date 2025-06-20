import React from 'react';
import styled from 'styled-components';

const SkillGapContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GapsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SkillTag = styled.span`
  display: inline-flex;
  align-items: center;
  background: ${props => props.type === 'gap' ? '#fee2e2' : props.type === 'match' ? '#dcfce7' : '#f3f4f6'};
  color: ${props => props.type === 'gap' ? '#991b1b' : props.type === 'match' ? '#166534' : '#374151'};
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  
  &:before {
    content: "${props => props.type === 'gap' ? '❌' : props.type === 'match' ? '✅' : 'ℹ️'}";
    margin-right: 0.25rem;
  }
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.5rem 0;
`;

const Summary = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
`;

const SkillGapAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const { gaps, matches, relatedSkills, summary } = analysis;

  // Add debug logging to see what we're receiving
  console.log('Skill Gap Analysis:', { gaps, matches, relatedSkills, summary });

  return (
    <SkillGapContainer>
      <Title>
        🎯 Skill Gap Analysis
        {summary?.overallMatch && (
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280',
            marginLeft: 'auto' 
          }}>
            Match: {summary.overallMatch}%
          </span>
        )}
      </Title>
      
      {gaps && gaps.length > 0 && (
        <Section>
          <SectionTitle>
            Missing Skills 
            {gaps.some(g => g.severity === 'high') && (
              <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                (Some skills are highly required)
              </span>
            )}
          </SectionTitle>
          <GapsList>
            {gaps.map((gap, index) => (
              <SkillTag 
                key={index} 
                type="gap"
                style={{
                  background: gap.severity === 'high' ? '#fee2e2' : '#fef3c7',
                  color: gap.severity === 'high' ? '#991b1b' : '#92400e'
                }}
                title={`Confidence: ${gap.confidence.toFixed(1)}`}
              >
                {gap.displayName}
              </SkillTag>
            ))}
          </GapsList>
        </Section>
      )}

      {matches && matches.length > 0 && (
        <Section>
          <SectionTitle>Matching Skills</SectionTitle>
          <GapsList>
            {matches.map((match, index) => (
              <SkillTag 
                key={index} 
                type="match"
                title={`Confidence: ${match.confidence.toFixed(1)}`}
              >
                {match.displayName}
              </SkillTag>
            ))}
          </GapsList>
        </Section>
      )}

      {relatedSkills && relatedSkills.length > 0 && (
        <Section>
          <SectionTitle>Related Skills to Consider</SectionTitle>
          <GapsList>
            {relatedSkills.map((skill, index) => (
              <SkillTag 
                key={index} 
                type="related"
                title={skill.relation}
              >
                {skill.displayName}
              </SkillTag>
            ))}
          </GapsList>
        </Section>
      )}

      <Summary>
        {!gaps || gaps.length === 0 ? (
          "✨ Great match! Your skills align well with the requirements."
        ) : summary.criticalGaps > 0 ? (
          `⚠️ Found ${summary.criticalGaps} critical skill ${
            summary.criticalGaps === 1 ? 'gap' : 'gaps'
          } that might affect your application. Consider focusing on these skills first.`
        ) : (
          `📊 Found ${gaps.length} skill ${
            gaps.length === 1 ? 'gap' : 'gaps'
          } and ${matches.length} matching ${
            matches.length === 1 ? 'skill' : 'skills'
          }. Consider learning the missing skills to improve your match.`
        )}
      </Summary>
    </SkillGapContainer>
  );
};

export default SkillGapAnalysis;
