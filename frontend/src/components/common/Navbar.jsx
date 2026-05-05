import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiHome, HiChatBubbleLeftRight, HiUsers, HiUser, HiArrowRightOnRectangle, HiEllipsisVertical } from 'react-icons/hi2';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/logoCB.jpeg"
              alt="CREATOR BRIDGE - CONNECT.LEARN.GROW"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links */}
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
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Profile avatar */}
            <Link to={`/profile/${user?.id || user?._id}`} className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff`}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700 hidden md:inline">{user?.name}</span>
            </Link>

            {/* Desktop logout */}
            <button onClick={handleLogout} className="hidden md:block text-gray-500 hover:text-red-600 transition">
              <HiArrowRightOnRectangle className="w-5 h-5" />
            </button>

            {/* Mobile three-dot menu */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <HiEllipsisVertical className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <HiHome className="w-4 h-4" /> Home
                  </Link>
                  <Link to="/forum" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <HiUsers className="w-4 h-4" /> Forum
                  </Link>
                  <Link to="/discovery" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <HiUser className="w-4 h-4" /> Discover
                  </Link>
                  <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <HiChatBubbleLeftRight className="w-4 h-4" /> Chat
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;