import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import postService from '../../services/post.service';
import { HiHeart, HiChatAlt, HiUserCircle } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const upvoteMutation = useMutation(
    () => postService.upvotePost(post._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
      }
    }
  );
  
  const isUpvoted = post.upvotes?.includes(user?.id);
  const voteScore = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Author Info */}
          <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2 mb-3">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
            ) : (
              <HiUserCircle className="w-8 h-8 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          
          {/* Post Title */}
          <Link to={`/forum/post/${post._id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition mb-2">
              {post.title}
            </h3>
          </Link>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          
          {/* Preview Content */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {post.content}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => upvoteMutation.mutate()}
          className={`flex items-center gap-2 transition ${
            isUpvoted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <HiHeart className="w-5 h-5" />
          <span>{voteScore}</span>
        </button>
        
        <Link to={`/forum/post/${post._id}`} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition">
          <HiChatAlt className="w-5 h-5" />
          <span>{post.commentCount || 0} comments</span>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;