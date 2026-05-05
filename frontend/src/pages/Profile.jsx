import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import userService from '../services/user.service';
import youtubeService from '../services/youtube.service';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiUserPlus, HiCheck, HiPencilSquare, HiUsers, HiVideoCamera, HiXMark } from 'react-icons/hi2';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', niche: '' });
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionsType, setConnectionsType] = useState('followers'); // 'followers' or 'following'
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const profileId = id || user?.id || user?._id;
  const isOwnProfile = profileId && (profileId === user?.id || profileId === user?._id);
  
  // Fetch profile
  const { data: profile, isLoading } = useQuery(
    ['profile', profileId],
    () => userService.getProfile(profileId),
    { enabled: !!profileId }
  );
  
  // Follow mutation
  const followMutation = useMutation(
    () => userService.followUser(profileId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', profileId]);
      }
    }
  );
  
  // Remove YouTube channel mutation
  const removeYoutubeMutation = useMutation(
    (channelId) => youtubeService.removeChannel(channelId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', profileId]);
        toast.success('Channel removed');
      },
      onError: () => {
        toast.error('Failed to remove channel');
      }
    }
  );
  
  // Avatar upload mutation
  const uploadAvatarMutation = useMutation(
    (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return userService.updateAvatar(formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', profileId]);
        refreshUser(); // Update globally in Navbar
        toast.success('Profile picture updated');
      },
      onError: () => {
        toast.error('Failed to update profile picture');
      }
    }
  );

  // Remove Avatar mutation
  const removeAvatarMutation = useMutation(
    () => userService.removeAvatar(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', profileId]);
        refreshUser();
        toast.success('Profile picture removed');
      },
      onError: () => {
        toast.error('Failed to remove profile picture');
      }
    }
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const verifyYouTube = async () => {
    setVerifying(true);
    try {
      await youtubeService.verifyChannel({ channelId: youtubeChannelId });
      queryClient.invalidateQueries(['profile', profileId]);
      setYoutubeChannelId('');
      toast.success('YouTube channel added successfully!');
    } catch (err) {
      toast.error('Failed to verify channel. Please check the channel ID.');
    } finally {
      setVerifying(false);
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(editForm);
    if (result.success) {
      setIsEditing(false);
      // Explicitly invalidate and refetch to ensure UI is in sync with DB
      queryClient.invalidateQueries(['profile', profileId]);
    }
  };
  
  if (isLoading) return <Loader />;
  if (!profile) return <div className="text-center py-8">User not found</div>;
  
  const currentUserId = user?.id || user?._id;
  const isFollowing = profile.followers?.some(f => (f._id || f) === currentUserId);
  
  const niches = ['Gaming', 'Cooking', 'Tech', 'Education', 'Vlogs', 'Music', 'Fitness', 'Art', 'Other'];
  
  const { onlineUsers = [] } = useSocket();
  const isOnline = onlineUsers?.includes(profileId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative group">
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md bg-gray-100" 
            />
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm z-10" />
            )}
            {isOwnProfile && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <label className="cursor-pointer flex flex-col items-center text-center p-1">
                  <HiVideoCamera className="text-white w-5 h-5" />
                  <span className="text-white text-[8px] font-bold">CHANGE</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                {profile.avatar && !profile.avatar.includes('ui-avatars.com') && (
                  <button 
                    onClick={() => removeAvatarMutation.mutate()}
                    className="text-white text-[8px] font-bold hover:text-red-400 mt-0.5"
                  >
                    REMOVE
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-indigo-600 mt-1">{profile.niche}</p>
              </div>
              
              {isOwnProfile ? (
                <button
                  onClick={() => {
                    setEditForm({
                      name: profile.name,
                      bio: profile.bio || '',
                      niche: profile.niche
                    });
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <HiPencilSquare /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => followMutation.mutate()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'btn-primary'
                    }`}
                  >
                    {isFollowing ? <HiCheck /> : <HiUserPlus />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={() => navigate('/chat', { state: { requestUser: profile } })}
                    className="btn-secondary px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mt-4">{profile.bio || 'No bio yet'}</p>
            
            <div className="flex gap-6 mt-4">
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition"
                onClick={() => { setConnectionsType('followers'); setShowConnectionsModal(true); }}
              >
                <div className="font-bold text-gray-900">{profile.followers?.length || 0}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition"
                onClick={() => { setConnectionsType('following'); setShowConnectionsModal(true); }}
              >
                <div className="font-bold text-gray-900">{profile.following?.length || 0}</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* YouTube Channels Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HiVideoCamera className="text-red-600" /> YouTube Channels
          </h2>
          {isOwnProfile && profile.youtubeChannels?.length > 0 && (
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
              {profile.youtubeChannels.length} Linked
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {profile.youtubeChannels && profile.youtubeChannels.length > 0 ? (
            profile.youtubeChannels.map((channel) => (
              <div key={channel.channelId} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${channel.channelName}&background=red&color=white`} 
                      alt={channel.channelName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${channel.channelName}&background=red&color=white`;
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{channel.channelName}</h3>
                        {channel.verified && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <HiCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {channel.subscriberCount?.toLocaleString()} Subscribers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwnProfile && (
                      <button
                        onClick={() => removeYoutubeMutation.mutate(channel.channelId)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove Channel"
                      >
                        <HiXMark className="w-5 h-5" />
                      </button>
                    )}
                    <a 
                      href={`https://youtube.com/channel/${channel.channelId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : !isOwnProfile && (
            <p className="text-center py-4 text-gray-400 text-sm italic">No YouTube channels linked</p>
          )}

          {isOwnProfile && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-700">
                  {profile.youtubeChannels?.length > 0 ? 'Add Another Channel' : 'Link Your YouTube Channel'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtubeChannelId}
                    onChange={(e) => setYoutubeChannelId(e.target.value)}
                    placeholder="Channel ID or URL"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  />
                  <button
                    onClick={verifyYouTube}
                    disabled={verifying || !youtubeChannelId.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    {verifying ? 'Verifying...' : (
                      <>
                        <HiVideoCamera className="w-4 h-4" />
                        Link Channel
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  Tip: You can add multiple channels. Enter your channel ID or URL.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Tell other creators about yourself"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Niche</label>
                <select
                  value={editForm.niche}
                  onChange={(e) => setEditForm({ ...editForm, niche: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary py-2 rounded-lg">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Connections Modal */}
      {showConnectionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConnectionsModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-sm w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold capitalize">{connectionsType}</h2>
              <button onClick={() => setShowConnectionsModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {profile[connectionsType]?.length > 0 ? (
                <ul className="space-y-2">
                  {profile[connectionsType].map(userConn => (
                    <li key={userConn._id}>
                      <button
                        onClick={() => {
                          navigate(`/profile/${userConn._id || userConn}`);
                          setShowConnectionsModal(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <img 
                          src={userConn.avatar || `https://ui-avatars.com/api/?name=${userConn.name}&background=4F46E5`} 
                          alt={userConn.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                        />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{userConn.name}</p>
                          <p className="text-xs text-gray-500">{userConn.niche}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 text-sm">No {connectionsType} found.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;