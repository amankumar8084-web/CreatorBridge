import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { motion } from 'framer-motion';
import ChannelCard from '../components/discovery/ChannelCard';
import Loader from '../components/common/Loader';
import { HiMagnifyingGlass } from 'react-icons/hi2';

const Discovery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery(
    ['discovery', debouncedQuery],
    async () => {
      const response = await api.get('/users/search', {
        params: { q: debouncedQuery }
      });
      return response.data;
    }
  );

  if (isLoading && !data) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Discover <span className="text-indigo-600">Creators</span>
            </h1>
            <p className="text-lg text-gray-600 mt-3 leading-relaxed">
              Connect with fellow content creators, find collaborators, and grow your network within the community.
            </p>
            
            <div className="mt-8 relative max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiMagnifyingGlass className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, niche, or email..."
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-900 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
             <div className="text-red-500 font-medium">Failed to load creators. Please try again.</div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Found {data?.data?.length || 0} creators
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-3xl mt-8">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900">No creators found</h3>
                <p className="text-gray-500 mt-1">Try searching for something else or clearing your query.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discovery;