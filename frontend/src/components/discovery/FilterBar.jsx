import React from 'react';

const FilterBar = ({ filters, onFilterChange }) => {
  const niches = ['all', 'Gaming', 'Cooking', 'Tech', 'Education', 'Vlogs', 'Music', 'Fitness', 'Art'];
  
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
          <select
            value={filters.niche}
            onChange={(e) => handleChange('niche', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {niches.map(niche => (
              <option key={niche} value={niche}>
                {niche.charAt(0).toUpperCase() + niche.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Subscribers</label>
          <input
            type="number"
            value={filters.minSubs}
            onChange={(e) => handleChange('minSubs', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Subscribers</label>
          <input
            type="number"
            value={filters.maxSubs}
            onChange={(e) => handleChange('maxSubs', parseInt(e.target.value) || 10000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="10000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="subscribers">Subscribers (High to Low)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;