import React from 'react';
import { getAllTagCategories } from '../utils/tagUtils';

const TagFilter = ({ selectedTags, onTagSelect }) => {
  const allTags = getAllTagCategories();

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagSelect(selectedTags.filter(id => id !== tagId));
    } else {
      onTagSelect([...selectedTags, tagId]);
    }
  };

  return (
    <div className="tag-filter">
      <h3 className="filter-title">Filter by Tags</h3>
      
      <div className="tags-grid">
        {allTags.map(tag => (
          <button
            key={tag.id}
            className={`filter-tag ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
            onClick={() => toggleTag(tag.id)}
            style={{
              '--tag-color': tag.color,
              '--tag-bg-color': `${tag.color}15`
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {selectedTags.length > 0 && (
        <button
          className="clear-filters"
          onClick={() => onTagSelect([])}
        >
          Clear Filters
        </button>
      )}

      <style jsx="true">{`
        .tag-filter {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .filter-title {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .tags-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .filter-tag {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .filter-tag:hover {
          border-color: var(--tag-color);
          background: var(--tag-bg-color);
          color: var(--tag-color);
        }

        .filter-tag.selected {
          background: var(--tag-color);
          border-color: var(--tag-color);
          color: white;
        }

        .clear-filters {
          width: 100%;
          padding: 0.5rem;
          margin-top: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          color: #4B5563;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }
      `}</style>
    </div>
  );
};

export default TagFilter;
