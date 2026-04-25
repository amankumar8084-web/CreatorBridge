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
  
  const isFollowing = profile.followers?.some(f => f._id === user?.id);
  
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
              <div className="text-center">
                <div className="font-bold text-gray-900">{profile.followers?.length || 0}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-medium text-green-800">{profile.youtubeChannel.channelName}</p>
            <p className="text-sm text-green-600 mt-1">
              {profile.youtubeChannel.subscriberCount?.toLocaleString()} subscribers
            </p>
            <p className="text-xs text-green-500 mt-2">
              Verified on {new Date(profile.youtubeChannel.lastSync).toLocaleDateString()}
            </p>
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
    </div>
  );
};

export default Profile;