import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { HiHeart, HiArrowLeft, HiTrash, HiCheckCircle } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import postService from '../services/post.service';
import Loader from '../components/common/Loader';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  
  // Fetch post details
  const { data: post, isLoading: postLoading } = useQuery(
    ['post', id],
    () => postService.getPost(id)
  );
  
  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery(
    ['comments', id],
    () => postService.getComments(id)
  );
  
  // Upvote mutation
  const upvoteMutation = useMutation(
    () => postService.upvotePost(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', id]);
      }
    }
  );
  
  // Add comment mutation
  const addCommentMutation = useMutation(
    () => postService.createComment({ content: comment, postId: id }),
    {
      onSuccess: () => {
        setComment('');
        queryClient.invalidateQueries(['comments', id]);
        queryClient.invalidateQueries(['post', id]);
      }
    }
  );
  
  // Mark as best answer mutation
  const markBestAnswerMutation = useMutation(
    async (commentId) => {
      // Assuming postService would have this or we add it
      const response = await postService.markAsBestAnswer(commentId);
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id]);
      }
    }
  );
  
  if (postLoading || commentsLoading) return <Loader />;
  if (!post) return <div className="text-center py-8">Post not found</div>;
  
  const isUpvoted = post.upvotes?.includes(user?.id);
  const voteScore = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
  const isAuthor = post.author?._id === user?.id;
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition"
      >
        <HiArrowLeft className="w-5 h-5" /> Back to Forum
      </button>
      
      {/* Post content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
              alt={post.author?.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{post.author?.name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isAuthor && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Author</span>}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="text-gray-700 whitespace-pre-wrap mb-6">
            {post.content}
          </div>
          
          <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => upvoteMutation.mutate()}
              className={`flex items-center gap-2 transition ${
                isUpvoted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <HiHeart className="w-5 h-5" />
              <span>{voteScore} upvotes</span>
            </button>
            <div className="text-gray-500">
              📊 {post.viewCount || 0} views
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Comments ({comments?.length || 0})
        </h2>
        
        {/* Add comment form */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts or advice..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => addCommentMutation.mutate()}
            disabled={!comment.trim() || addCommentMutation.isLoading}
            className="mt-3 btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
        
        {/* Comments list */}
        <div className="space-y-4">
          {comments?.map((comment, idx) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white border rounded-xl p-4 ${
                comment.isBestAnswer ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={comment.author?.avatar}
                    className="w-8 h-8 rounded-full"
                    alt=""
                  />
                  <div>
                    <p className="font-medium text-gray-900">{comment.author?.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {isAuthor && !comment.isBestAnswer && (
                  <button
                    onClick={() => markBestAnswerMutation.mutate(comment._id)}
                    className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                  >
                    <HiCheckCircle className="w-4 h-4" /> Mark as Best Answer
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 mt-2">{comment.content}</p>
              
              {comment.isBestAnswer && (
                <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                  <HiCheckCircle className="w-4 h-4" />
                  <span>Best Answer</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;