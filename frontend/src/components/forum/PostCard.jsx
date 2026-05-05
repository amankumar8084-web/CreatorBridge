import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import postService from '../../services/post.service';
import { HiHeart, HiChatAlt, HiUserCircle, HiDotsVertical, HiPencil, HiTrash } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PostCard = ({ post, onEdit }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const currentUserId = user?.id || user?._id;
  const isAuthor = post.author?._id === currentUserId;

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const upvoteMutation = useMutation(
    () => postService.upvotePost(post._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
      }
    }
  );

  const deleteMutation = useMutation(
    () => postService.deletePost(post._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        toast.success('Post deleted');
      },
      onError: () => {
        toast.error('Failed to delete post');
      }
    }
  );

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit?.(post);
  };

  const isUpvoted = post.upvotes?.includes(currentUserId);
  const voteScore = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-3">
            <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2.5 min-w-0">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-9 h-9 rounded-full flex-shrink-0" />
              ) : (
                <HiUserCircle className="w-9 h-9 text-gray-400 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">{post.author.name}</p>
                  {isAuthor && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">
                      Author
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </Link>
          </div>

          {/* Post Title */}
          <Link to={`/forum/post/${post._id}`}>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-indigo-600 transition mb-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Preview Content */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{post.content}</p>

          {/* Attachment */}
          {post.attachment && (
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
              <img 
                src={post.attachment} 
                alt="Post attachment" 
                className="w-full max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Three-dot menu for author */}
        {isAuthor && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-1.5 rounded-lg transition-all ${
                menuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <HiDotsVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full transition"
                >
                  <HiPencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full transition"
                >
                  <HiTrash className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 mt-4 border-t border-gray-100">
        <button
          onClick={() => upvoteMutation.mutate()}
          className={`flex items-center gap-1.5 text-sm transition ${
            isUpvoted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <HiHeart className={`w-5 h-5 ${isUpvoted ? 'fill-current' : ''}`} />
          <span className="font-medium">{voteScore}</span>
        </button>

        <Link to={`/forum/post/${post._id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition">
          <HiChatAlt className="w-5 h-5" />
          <span>{post.commentCount || 0} comments</span>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;