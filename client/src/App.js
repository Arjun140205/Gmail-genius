import React from 'react';
import styled from 'styled-components';
import Layout from './components/Layout';

const Container = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const Text = styled.p`
  color: #4a5568;
  line-height: 1.5;
`;

function App() {
  return (
    <Layout>
      <Container>
        <Title>Welcome to GmailGenius</Title>
        <Text>
          Connect your Gmail account to get started with smart email management.
        </Text>
      </Container>
    </Layout>
  );
}

export default App;
