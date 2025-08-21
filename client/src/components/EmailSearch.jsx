// client/src/components/EmailSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';

const EmailSearch = ({ onSearch, onFilterChange, totalEmails }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('INBOX');
  const [dateRange, setDateRange] = useState('all');
  const [isImportant, setIsImportant] = useState(false);
  const [isUnread, setIsUnread] = useState(false);

  const labels = [
    { value: 'INBOX', label: '📥 Inbox', description: 'All inbox emails' },
    { value: 'SENT', label: '📤 Sent', description: 'Sent emails' },
    { value: 'DRAFT', label: '📝 Drafts', description: 'Draft emails' },
    { value: 'SPAM', label: '🗑️ Spam', description: 'Spam emails' },
    { value: 'TRASH', label: '🗑️ Trash', description: 'Deleted emails' },
    { value: 'IMPORTANT', label: '⭐ Important', description: 'Important emails' },
    { value: 'STARRED', label: '⭐ Starred', description: 'Starred emails' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' }
  ];

  const buildSearchQuery = useCallback(() => {
    let query = '';
    
    if (searchQuery.trim()) {
      query += searchQuery.trim();
    }
    
    // Add date filters
    if (dateRange !== 'all') {
      switch (dateRange) {
        case 'today':
          query += ' newer_than:1d';
          break;
        case 'yesterday':
          query += ' newer_than:2d older_than:1d';
          break;
        case 'week':
          query += ' newer_than:7d';
          break;
        case 'month':
          query += ' newer_than:1m';
          break;
        case 'year':
          query += ' newer_than:1y';
          break;
        default:
          // No additional date filter for 'all' or unknown values
          break;
      }
    }
    
    // Add importance filter
    if (isImportant) {
      query += ' is:important';
    }
    
    // Add unread filter
    if (isUnread) {
      query += ' is:unread';
    }
    
    return query.trim();
  }, [searchQuery, dateRange, isImportant, isUnread]);

  const handleSearch = () => {
    const query = buildSearchQuery();
    onSearch(query, selectedLabel);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedLabel('INBOX');
    setDateRange('all');
    setIsImportant(false);
    setIsUnread(false);
    onSearch('', 'INBOX');
  };

  // Auto-search when filters change
  useEffect(() => {
    const query = buildSearchQuery();
    onFilterChange({
      query,
      label: selectedLabel,
      dateRange,
      isImportant,
      isUnread
    });
  }, [selectedLabel, dateRange, isImportant, isUnread, buildSearchQuery, onFilterChange]);

  return (
    <div className="email-search-container">
      <div className="search-header">
        <h3>🔍 Search & Filter Emails</h3>
        <span className="total-count">{totalEmails.toLocaleString()} emails found</span>
      </div>
      
      <div className="search-form">
        {/* Main Search Bar */}
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search emails (from, subject, content)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">
            🔍 Search
          </button>
        </div>
        
        {/* Quick Filters */}
        <div className="quick-filters">
          <div className="filter-group">
            <label>📂 Folder:</label>
            <select 
              value={selectedLabel} 
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="filter-select"
            >
              {labels.map(label => (
                <option key={label.value} value={label.value}>
                  {label.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>📅 Date:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="filter-checkbox"
              />
              ⭐ Important only
            </label>
          </div>
          
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isUnread}
                onChange={(e) => setIsUnread(e.target.checked)}
                className="filter-checkbox"
              />
              📬 Unread only
            </label>
          </div>
          
          <button onClick={handleReset} className="reset-btn">
            🔄 Reset
          </button>
        </div>
        
        {/* Search Suggestions */}
        <div className="search-suggestions">
          <span>Quick searches:</span>
          <button 
            className="suggestion-btn"
            onClick={() => {
              setSearchQuery('job OR internship OR career');
              onSearch('job OR internship OR career', selectedLabel);
            }}
          >
            💼 Job opportunities
          </button>
          <button 
            className="suggestion-btn"
            onClick={() => {
              setSearchQuery('interview OR application OR hiring');
              onSearch('interview OR application OR hiring', selectedLabel);
            }}
          >
            🎯 Interviews
          </button>
          <button 
            className="suggestion-btn"
            onClick={() => {
              setSearchQuery('offer OR congratulations OR welcome');
              onSearch('offer OR congratulations OR welcome', selectedLabel);
            }}
          >
            🎉 Job offers
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .email-search-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .search-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .total-count {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-input-group {
          display: flex;
          gap: 0.75rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-btn {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .search-btn:hover {
          background: #2563eb;
        }

        .quick-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
        }

        .filter-checkbox {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .reset-btn {
          padding: 0.5rem 1rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reset-btn:hover {
          background: #4b5563;
        }

        .search-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .search-suggestions span {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .suggestion-btn {
          padding: 0.375rem 0.75rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          font-size: 0.75rem;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .search-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .search-input-group {
            flex-direction: column;
          }

          .search-btn {
            width: 100%;
          }

          .quick-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .filter-group {
            width: 100%;
            justify-content: space-between;
          }

          .search-suggestions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailSearch;
