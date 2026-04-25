import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart, HiChatAlt, HiTrendingUp, HiNewspaper } from 'react-icons/hi';
import postService from '../services/post.service';
import PostCard from '../components/forum/PostCard';
import PostForm from '../components/forum/PostForm';
import TagFilter from '../components/forum/TagFilter';
import Loader from '../components/common/Loader';

const Forum = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('-createdAt');
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery(
    ['posts', selectedTag, sortBy],
    () => postService.getPosts({ sort: sortBy, tag: selectedTag })
  );
  
  const createPostMutation = useMutation(
    (postData) => postService.createPost(postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        setShowForm(false);
      }
    }
  );
  
  const niches = ['All', 'Gaming', 'Cooking', 'Tech', 'Education', 'Vlogs', 'Music', 'Fitness', 'Art'];
  
  if (isLoading) return <Loader />;
  if (error) return <div className="text-center text-red-500">Error loading posts</div>;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
        <p className="text-gray-600 mt-2">Share your journey, ask questions, and grow together</p>
      </div>
      
      {/* Actions Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('-createdAt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              sortBy === '-createdAt' 
                ? 'bg-gradient-brand text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HiNewspaper /> Latest
          </button>
          <button
            onClick={() => setSortBy('-voteScore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              sortBy === '-voteScore' 
                ? 'bg-gradient-brand text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HiTrendingUp /> Trending
          </button>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary px-6 py-2 rounded-lg"
        >
          Create Post
        </button>
      </div>
      
      {/* Tag Filter */}
      <TagFilter selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      
      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {data?.posts?.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {data?.posts?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No posts yet. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
      
      {/* Create Post Modal */}
      {showForm && (
        <PostForm
          onSubmit={createPostMutation.mutate}
          onClose={() => setShowForm(false)}
          isLoading={createPostMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Forum;