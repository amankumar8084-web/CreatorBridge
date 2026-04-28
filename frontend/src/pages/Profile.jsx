import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import userService from '../services/user.service';
import youtubeService from '../services/youtube.service';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiUserPlus, HiCheck, HiPencilSquare, HiUsers, HiVideoCamera } from 'react-icons/hi2';
import Loader from '../components/common/Loader';

const Profile = () => {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', niche: '' });
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionsType, setConnectionsType] = useState('followers'); // 'followers' or 'following'
  const queryClient = useQueryClient();
  
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
  
  // Verify YouTube channel
  const verifyYouTube = async () => {
    setVerifying(true);
    try {
      await youtubeService.verifyChannel({ channelId: youtubeChannelId });
      queryClient.invalidateQueries(['profile', profileId]);
      alert('YouTube channel verified successfully!');
    } catch (err) {
      alert('Failed to verify channel. Please check the channel ID.');
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
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=120&background=4F46E5`}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          
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
              <div className="text-center">
                <div className="font-bold text-gray-900">{profile.reputation || 0}</div>
                <div className="text-xs text-gray-500">Reputation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* YouTube Channel Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiVideoCamera /> YouTube Channel
        </h2>
        
        {profile.youtubeChannel?.verified ? (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
    {/* Header with verification badge */}
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        {/* YouTube icon */}
        <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </div>
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-lg">
              {profile.youtubeChannel.channelName}
            </h3>
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Verified
            </span>
          </div>
        </div>
      </div>
      
      {/* Last sync badge */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-green-100">
        <p className="text-xs text-gray-500">Last synced</p>
        <p className="text-xs font-medium text-gray-700">
          {new Date(profile.youtubeChannel.lastSync).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
    
    {/* Stats grid */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-green-200/50">
      {/* Subscribers */}
      <div className="flex items-center gap-3">
        <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Subscribers</p>
          <p className="text-xl font-bold text-gray-900">
            {profile.youtubeChannel.subscriberCount?.toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Total Views (if available) */}
      {profile.youtubeChannel.viewCount && (
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Views</p>
            <p className="text-xl font-bold text-gray-900">
              {profile.youtubeChannel.viewCount?.toLocaleString()}
            </p>
          </div>
        </div>
      )}
      
      {/* Video Count (if available) */}
      {profile.youtubeChannel.videoCount && (
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Videos</p>
            <p className="text-xl font-bold text-gray-900">
              {profile.youtubeChannel.videoCount?.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
    
    {/* Optional: Engagement metrics */}
    {profile.youtubeChannel.engagementRate && (
      <div className="mt-4 pt-3 border-t border-green-200/30">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Engagement Rate</span>
          <span className="font-semibold text-green-700">{profile.youtubeChannel.engagementRate}%</span>
        </div>
        <div className="w-full bg-green-200 rounded-full h-1.5 mt-1">
          <div 
            className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(profile.youtubeChannel.engagementRate, 100)}%` }}
          />
        </div>
      </div>
    )}
  </div>

 ) : isOwnProfile ? (
          <div>
            <input
              type="text"
              value={youtubeChannelId}
              onChange={(e) => setYoutubeChannelId(e.target.value)}
              placeholder="Enter your YouTube Channel ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <button
              onClick={verifyYouTube}
              disabled={verifying || !youtubeChannelId}
              className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify YouTube Channel'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Find your channel ID in YouTube Studio → Settings → Channel
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No YouTube channel linked</p>
        )}
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
                <ul className="space-y-4">
                  {profile[connectionsType].map(userConn => (
                    <li key={userConn._id} className="flex items-center gap-3">
                      <img 
                        src={userConn.avatar || `https://ui-avatars.com/api/?name=${userConn.name}&background=4F46E5`} 
                        alt={userConn.name}
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div>
                        <p className="font-medium text-gray-900">{userConn.name}</p>
                        <p className="text-xs text-gray-500">{userConn.niche}</p>
                      </div>
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