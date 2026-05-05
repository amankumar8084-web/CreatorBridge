import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import userService from '../../services/user.service';
import { HiUserPlus, HiCheck, HiChatBubbleLeftRight } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChannelCard = ({ creator }) => {
  const { user } = useAuth();
  const { onlineUsers = [] } = useSocket();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(
    creator.followers?.includes(user?.id || user?._id)
  );

  const isOnline = onlineUsers?.includes(creator._id || creator.id);

  const followMutation = useMutation(
    () => userService.followUser(creator._id),
    {
      onSuccess: () => {
        setIsFollowing(!isFollowing);
        queryClient.invalidateQueries('discovery');
      }
    }
  );

  const mainYoutube = creator.youtubeChannels?.[0] || creator.youtubeChannel;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group flex flex-col h-full">
      <div className="flex items-center gap-4 mb-5">
        <Link to={`/profile/${creator._id}`} className="relative flex-shrink-0">
          <img
            src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.name}&background=4F46E5&color=fff`}
            alt={creator.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-50 group-hover:ring-indigo-100 transition-all"
          />
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${creator._id}`}>
            <h3 className="font-bold text-gray-900 truncate hover:text-indigo-600 transition-colors">
              {creator.name}
            </h3>
          </Link>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mt-1">
            {creator.niche}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {mainYoutube && (
          <div className="bg-gray-50 rounded-2xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500 font-medium uppercase tracking-tight">Main Channel</span>
              {mainYoutube.verified && (
                <span className="text-green-600 font-bold flex items-center gap-0.5">
                  <HiCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`https://youtube.com/channel/${mainYoutube.channelId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-800 text-sm truncate hover:text-red-600 transition-colors"
              >
                {mainYoutube.channelName}
              </a>
              <span className="text-gray-400">•</span>
              <span className="text-indigo-600 font-bold">{mainYoutube.subscriberCount?.toLocaleString() || 0} subs</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{creator.followers?.length || 0}</span>
            <span>Followers</span>
          </div>
          <div className="w-px h-6 bg-gray-100" />
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{creator.youtubeChannels?.length || (creator.youtubeChannel ? 1 : 0)}</span>
            <span>Channels</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
        <button
          onClick={() => followMutation.mutate()}
          disabled={creator._id === (user?.id || user?._id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isFollowing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
          } disabled:opacity-50`}
        >
          {isFollowing ? <HiCheck className="w-4 h-4" /> : <HiUserPlus className="w-4 h-4" />}
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        
        <button
          onClick={() => navigate('/chat', { state: { requestUser: creator } })}
          disabled={creator._id === (user?.id || user?._id)}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all disabled:opacity-50"
          title="Message Creator"
        >
          <HiChatBubbleLeftRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChannelCard;