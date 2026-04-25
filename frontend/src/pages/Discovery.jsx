import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { motion } from 'framer-motion';
import ChannelCard from '../components/discovery/ChannelCard';
import FilterBar from '../components/discovery/FilterBar';
import Loader from '../components/common/Loader';

const Discovery = () => {
  const [filters, setFilters] = useState({
    q: '',
    niche: 'all',
    minSubs: 0,
    maxSubs: 10000,
    sortBy: 'subscribers'
  });

  const { data, isLoading, error } = useQuery(
    ['discovery', filters],
    async () => {
      const response = await api.get('/users/search', {
        params: filters
      });
      return response.data;
    }
  );

  if (isLoading) return <Loader />;
  if (error) return <div className="text-center text-red-500 py-8">Failed to load channels</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Creators</h1>
        <p className="text-gray-600 mt-2">Find and connect with creators in your niche</p>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {data?.data?.map((creator, index) => (
          <motion.div
            key={creator._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ChannelCard creator={creator} />
          </motion.div>
        ))}
      </div>

      {data?.data?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl mt-8">
          <p className="text-gray-500">No creators found in this category</p>
        </div>
      )}
    </div>
  );
};

export default Discovery;