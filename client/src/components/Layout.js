import React from 'react';

const Layout = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GmailGenius
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">{user.displayName}</span>
                  <img
                    src="/api/user/profile-image"
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#6B7280" text-anchor="middle" dy=".3em">
                            ${(user.displayName || 'U')[0]}
                          </text>
                        </svg>`
                      )}`;
                    }}
                  />
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
