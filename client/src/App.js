import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to GmailGenius</h2>
        <p className="text-gray-600">
          Connect your Gmail account to get started with smart email management.
        </p>
      </div>
    </Layout>
  );
}

export default App;
