import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiChat, HiUsers, HiVideoCamera, HiTrendingUp } from 'react-icons/hi';

const Home = () => {
  const { user } = useAuth();
  
  const features = [
    { icon: HiUsers, title: 'Community Forum', description: 'Share struggles, get advice, and learn from peers', color: 'bg-indigo-500', link: '/forum' },
    { icon: HiChat, title: 'Real-time Chat', description: 'Connect instantly with creators in your niche', color: 'bg-cyan-500', link: '/chat' },
    { icon: HiVideoCamera, title: 'Video Meetings', description: 'Host channel reviews and collab sessions', color: 'bg-purple-500', link: '/meetings' },
    { icon: HiTrendingUp, title: 'Channel Discovery', description: 'Find and subscribe to growing channels', color: 'bg-green-500', link: '/discovery' },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome back, <span className="text-gradient-primary">{user?.name}!</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your creator community awaits. Grow together, learn from peers, and break through the plateau.
        </p>
      </motion.div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">5,000+</div>
          <div className="text-sm opacity-90">Active Creators</div>
        </div>
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">10,000+</div>
          <div className="text-sm opacity-90">Posts Shared</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">500+</div>
          <div className="text-sm opacity-90">Meetings Hosted</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-2xl font-bold">100+</div>
          <div className="text-sm opacity-90">Niches Covered</div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={feature.link}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Tips for Growth</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
            <p className="text-gray-700">Post consistently and engage with your community daily</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
            <p className="text-gray-700">Collaborate with creators in similar niches for cross-promotion</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <p className="text-gray-700">Join weekly creator circles to get real-time feedback on your content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;