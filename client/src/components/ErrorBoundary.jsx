// client/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="reload-btn"
              >
                🔄 Reload Page
              </button>
              
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="retry-btn"
              >
                🔁 Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>

          <style jsx="true">{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f8fafc;
              padding: 2rem;
            }

            .error-container {
              background: white;
              border-radius: 12px;
              padding: 3rem;
              max-width: 600px;
              text-align: center;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }

            .error-container h2 {
              color: #dc2626;
              margin-bottom: 1rem;
              font-size: 1.75rem;
            }

            .error-container p {
              color: #6b7280;
              margin-bottom: 2rem;
              font-size: 1.1rem;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
            }

            .reload-btn, .retry-btn {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              border: none;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 1rem;
            }

            .reload-btn {
              background: #3b82f6;
              color: white;
            }

            .reload-btn:hover {
              background: #2563eb;
              transform: translateY(-1px);
            }

            .retry-btn {
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
            }

            .retry-btn:hover {
              background: #e5e7eb;
              transform: translateY(-1px);
            }

            .error-details {
              text-align: left;
              margin-top: 2rem;
              padding: 1rem;
              background: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #374151;
              margin-bottom: 1rem;
            }

            .error-stack h4 {
              color: #374151;
              margin: 1rem 0 0.5rem 0;
              font-size: 1rem;
            }

            .error-stack pre {
              background: #1f2937;
              color: #f9fafb;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
              font-size: 0.875rem;
              line-height: 1.4;
              margin: 0.5rem 0;
            }

            @media (max-width: 768px) {
              .error-boundary {
                padding: 1rem;
              }

              .error-container {
                padding: 2rem 1.5rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .reload-btn, .retry-btn {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
