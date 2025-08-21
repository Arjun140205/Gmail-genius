// client/src/components/Pagination.jsx
import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalEmails, 
  emailsPerPage, 
  onPageChange, 
  hasMore, 
  loading 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startEmail = (currentPage - 1) * emailsPerPage + 1;
  const endEmail = Math.min(currentPage * emailsPerPage, totalEmails);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {startEmail}-{endEmail} of {totalEmails.toLocaleString()} emails
        </span>
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
        >
          ⏮️ First
        </button>
        
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          ⬅️ Previous
        </button>
        
        <div className="page-numbers">
          {currentPage > 3 && (
            <>
              <button 
                className="page-number"
                onClick={() => onPageChange(1)}
                disabled={loading}
              >
                1
              </button>
              {currentPage > 4 && <span className="ellipsis">...</span>}
            </>
          )}
          
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
            >
              {pageNum}
            </button>
          ))}
          
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="ellipsis">...</span>}
              <button 
                className="page-number"
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading || !hasMore}
        >
          Next ➡️
        </button>
        
        <button 
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
        >
          Last ⏭️
        </button>
      </div>
      
      <div className="pagination-jump">
        <span>Go to page:</span>
        <input 
          type="number" 
          min="1" 
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              onPageChange(page);
            }
          }}
          disabled={loading}
          className="page-input"
        />
        <span>of {totalPages}</span>
      </div>

      <style jsx="true">{`
        .pagination-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pagination-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          min-width: 80px;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .page-number {
          width: 40px;
          height: 40px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-number:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .page-number.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .page-number:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ellipsis {
          padding: 0 0.5rem;
          color: #6b7280;
        }

        .pagination-jump {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .page-input {
          width: 60px;
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          font-size: 0.875rem;
        }

        .page-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 768px) {
          .pagination-container {
            padding: 1rem;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .pagination-btn {
            min-width: 100px;
          }

          .page-numbers {
            order: 2;
          }

          .pagination-jump {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;
