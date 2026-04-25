import React from 'react';

const TagFilter = ({ selectedTag, onSelectTag }) => {
  const tags = ['All', 'SEO', 'thumbnails', 'monetization', 'editing', 'analytics', 'growth', 'collab', 'general'];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag === 'All' ? null : tag)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            (tag === 'All' && !selectedTag) || selectedTag === tag
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;