import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiHome, HiChatBubbleLeftRight, HiUsers, HiCalendarDays, HiUser, HiArrowRightOnRectangle } from 'react-icons/hi2';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!isAuthenticated) return null;
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-lg"></div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              CreatorBridge
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
              <HiHome className="w-5 h-5" /> Home
            </Link>
            <Link to="/forum" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
              <HiUsers className="w-5 h-5" /> Forum
            </Link>
            <Link to="/discovery" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
              <HiUser className="w-5 h-5" /> Discover
            </Link>
            <Link to="/chat" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
              <HiChatBubbleLeftRight className="w-5 h-5" /> Chat
            </Link>
            <Link to="/meetings" className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
              <HiCalendarDays className="w-5 h-5" /> Meetings
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to={`/profile/${user?.id || user?._id}`} className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff`}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700 hidden md:inline">{user?.name}</span>
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition">
              <HiArrowRightOnRectangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;