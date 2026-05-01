import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { HiHeart, HiArrowLeft, HiTrash, HiCheckCircle, HiPencil } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import postService from '../services/post.service';
import Loader from '../components/common/Loader';
import PostForm from '../components/forum/PostForm';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  
  const currentUserId = user?.id || user?._id;

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
        toast.success('Comment posted!');
      },
      onError: () => toast.error('Failed to post comment')
    }
  );

  // Update post mutation
  const updatePostMutation = useMutation(
    (postData) => postService.updatePost(id, postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', id]);
        setShowEditModal(false);
        toast.success('Post updated!');
      },
      onError: () => toast.error('Failed to update post')
    }
  );

  // Delete post mutation
  const deletePostMutation = useMutation(
    () => postService.deletePost(id),
    {
      onSuccess: () => {
        toast.success('Post deleted');
        navigate('/forum');
      },
      onError: () => toast.error('Failed to delete post')
    }
  );

  // Delete comment mutation
  const deleteCommentMutation = useMutation(
    (commentId) => postService.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id]);
        toast.success('Comment deleted');
      },
      onError: () => toast.error('Failed to delete comment')
    }
  );
  
  // Mark as best answer mutation
  const markBestAnswerMutation = useMutation(
    async (commentId) => {
      const response = await postService.markAsBestAnswer(commentId);
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id]);
        toast.success('Marked as best answer');
      }
    }
  );

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate();
    }
  };
  
  if (postLoading || commentsLoading) return <Loader />;
  if (!post) return <div className="text-center py-12 text-gray-500">Post not found</div>;
  
  const isUpvoted = post.upvotes?.includes(currentUserId);
  const voteScore = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
  const isAuthor = post.author?._id === currentUserId;
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors font-medium text-sm"
      >
        <HiArrowLeft className="w-4 h-4" /> Back to Forum
      </button>
      
      {/* Post content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}&background=4F46E5&color=fff`}
                alt={post.author?.name}
                className="w-10 h-10 rounded-full border border-gray-100"
              />
              <div>
                <p className="font-semibold text-gray-900">{post.author?.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isAuthor && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  Author
                </span>
              )}
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Edit Post"
                >
                  <HiPencil className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeletePost}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Post"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-100">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="text-gray-700 whitespace-pre-wrap mb-8 leading-relaxed text-base sm:text-lg">
            {post.content}
          </div>
          
          <div className="flex items-center gap-6 pt-5 border-t border-gray-100">
            <button
              onClick={() => upvoteMutation.mutate()}
              className={`flex items-center gap-2 transition px-4 py-2 rounded-xl border ${
                isUpvoted 
                  ? 'bg-red-50 border-red-100 text-red-600' 
                  : 'bg-white border-gray-100 text-gray-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50'
              }`}
            >
              <HiHeart className={`w-5 h-5 ${isUpvoted ? 'fill-current' : ''}`} />
              <span className="font-semibold">{voteScore}</span>
            </button>
            <div className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
              <span className="text-gray-500">📊</span> {post.viewCount || 0} views
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Comments ({comments?.length || 0})
          </h2>
        </div>
        
        {/* Add comment form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts or advice..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => addCommentMutation.mutate()}
              disabled={!comment.trim() || addCommentMutation.isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
        
        {/* Comments list */}
        <div className="space-y-4">
          {comments?.map((comment, idx) => {
            const isCommentAuthor = comment.author?._id === currentUserId;
            return (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                  comment.isBestAnswer ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name}&background=4F46E5&color=fff`}
                      className="w-8 h-8 rounded-full border border-gray-100"
                      alt=""
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{comment.author?.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAuthor && !comment.isBestAnswer && (
                      <button
                        onClick={() => markBestAnswerMutation.mutate(comment._id)}
                        className="text-green-600 hover:bg-green-100 px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-transparent hover:border-green-200"
                      >
                        <HiCheckCircle className="w-4 h-4" /> Best Answer
                      </button>
                    )}
                    
                    {isCommentAuthor && (
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this comment?')) {
                            deleteCommentMutation.mutate(comment._id);
                          }
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Comment"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{comment.content}</p>
                
                {comment.isBestAnswer && (
                  <div className="mt-3 flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-100/50 w-fit px-2 py-1 rounded-full border border-green-200">
                    <HiCheckCircle className="w-4 h-4" />
                    <span>BEST ANSWER</span>
                  </div>
                )}
              </motion.div>
            );
          })}
          
          {comments?.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-100 border-dashed rounded-2xl">
              <p className="text-gray-400 text-sm">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <PostForm
          onSubmit={updatePostMutation.mutate}
          onClose={() => setShowEditModal(false)}
          isLoading={updatePostMutation.isLoading}
          initialData={post}
        />
      )}
    </div>
  );
};

export default PostDetail;