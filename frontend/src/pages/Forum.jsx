import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTrendingUp, HiNewspaper, HiPlusCircle } from 'react-icons/hi';
import postService from '../services/post.service';
import PostCard from '../components/forum/PostCard';
import PostForm from '../components/forum/PostForm';
import TagFilter from '../components/forum/TagFilter';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Forum = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // null = create, object = edit
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('-createdAt');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['posts', selectedTag, sortBy],
    () => postService.getPosts({ sort: sortBy, tag: selectedTag })
  );

  // Create
  const createPostMutation = useMutation(
    (postData) => postService.createPost(postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        setShowForm(false);
        toast.success('Post created!');
      },
      onError: (err) => {
        const message = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to create post';
        toast.error(message);
      }
    }
  );

  // Update
  const updatePostMutation = useMutation(
    (postData) => postService.updatePost(editingPost._id, postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        setEditingPost(null);
        setShowForm(false);
        toast.success('Post updated!');
      },
      onError: (err) => {
        const message = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to update post';
        toast.error(message);
      }
    }
  );

  const handleOpenCreate = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleFormSubmit = (postData) => {
    if (editingPost) {
      updatePostMutation.mutate(postData);
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="text-center text-red-500 py-12">Error loading posts</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Forum</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Share your journey, ask questions, and grow together</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('-createdAt')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              sortBy === '-createdAt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HiNewspaper className="w-4 h-4" /> Latest
          </button>
          <button
            onClick={() => setSortBy('-voteScore')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              sortBy === '-voteScore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HiTrendingUp className="w-4 h-4" /> Trending
          </button>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <HiPlusCircle className="w-4 h-4" /> Create Post
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
              transition={{ delay: index * 0.04 }}
            >
              <PostCard post={post} onEdit={handleOpenEdit} />
            </motion.div>
          ))}
        </AnimatePresence>

        {data?.posts?.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-400 text-sm">No posts yet. Be the first to start a discussion!</p>
          </div>
        )}
      </div>

      {/* Create / Edit Post Modal */}
      {showForm && (
        <PostForm
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          isLoading={editingPost ? updatePostMutation.isLoading : createPostMutation.isLoading}
          initialData={editingPost}
        />
      )}
    </div>
  );
};

export default Forum;