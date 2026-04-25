import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import userService from '../../services/user.service';
import { HiUserPlus, HiCheck, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const ChannelCard = ({ creator }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(
    creator.followers?.includes(user?.id)
  );

  const followMutation = useMutation(
    () => userService.followUser(creator._id),
    {
      onSuccess: () => {
        setIsFollowing(!isFollowing);
        queryClient.invalidateQueries('discovery');
      }
    }
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <img
          src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.name}&background=4F46E5`}
          alt={creator.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <Link to={`/profile/${creator._id}`}>
            <h3 className="font-semibold text-lg text-gray-900 hover:text-indigo-600">
              {creator.name}
            </h3>
          </Link>
          
          <p className="text-sm text-indigo-600 mt-1">{creator.niche}</p>
          
          {creator.youtubeChannel?.verified && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  🎥 {creator.youtubeChannel.channelName}
                </span>
                <span className="text-green-600 text-xs">
                  {creator.youtubeChannel.subscriberCount?.toLocaleString()} subs
                </span>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {creator.bio || 'No bio yet'}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-3">
              <button
                onClick={() => followMutation.mutate()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isFollowing ? <HiCheck /> : <HiUserPlus />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              
              {creator.youtubeChannel?.verified && (
                <a
                  href={`https://youtube.com/channel/${creator.youtubeChannel.channelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <HiArrowTopRightOnSquare /> YouTube
                </a>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              {creator.followers?.length || 0} followers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;