import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiUsers, HiVideoCamera, HiTrendingUp } from 'react-icons/hi';
import {
  FaTwitter, FaLinkedinIn, FaYoutube, FaInstagram,
} from 'react-icons/fa';



// Default fallback data
const defaultStats = [
  { icon: HiUsers, number: '5,000+', label: 'Active Creators', color: 'from-indigo-500 to-indigo-600', toast: '👥 Meet 5,000+ active creators!' },
  { icon: HiChat, number: '10,000+', label: 'Posts Shared', color: 'from-cyan-500 to-cyan-600', toast: '📝 10,000+ posts and counting!' },
  { icon: HiVideoCamera, number: '500+', label: 'Meetings Hosted', color: 'from-purple-500 to-purple-600', toast: '🎥 500+ collaborative sessions!' },
  { icon: HiTrendingUp, number: '100+', label: 'Niches Covered', color: 'from-green-500 to-green-600', toast: '🌐 100+ niches worldwide!' },
];


/* ─────────────────────────────────────────
   Toast component
───────────────────────────────────────── */
const Toast = ({ message, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-5 right-5 z-50 bg-white shadow-xl rounded-xl px-5 py-3 text-sm font-semibold text-gray-800 border-l-4 border-indigo-500 flex items-center gap-2"
      >
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────
   Scrolling Ticker
───────────────────────────────────────── */
const StatTicker = ({ stats, onStatClick }) => {
  // Duplicate 4× so the seamless loop holds even at very wide screens
  const items = [...stats, ...stats, ...stats, ...stats];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-indigo-600 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-indigo-600 to-transparent z-10" />

      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {items.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <button
              key={idx}
              onClick={() => onStatClick(stat.toast)}
              className="flex items-center gap-3 px-8 py-4 border-r border-white/20 cursor-pointer
                         transition-all duration-200 hover:bg-white/15 active:scale-95 active:bg-white/25
                         focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-white leading-none">{stat.number}</div>
                <div className="text-[11px] font-medium tracking-widest uppercase text-white/80 mt-0.5">
                  {stat.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Footer
───────────────────────────────────────── */
const Footer = () => {
  const cols = [
    {
      heading: 'Platform',
      links: [
        { label: 'Community Forum', to: '/forum' },
        { label: 'Real-time Chat',  to: '/chat' },
        { label: 'Video Meetings',  to: '/meetings' },
        { label: 'Channel Discovery', to: '/discovery' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Creator Guides', to: '/guides' },
        { label: 'Growth Tips',    to: '/tips' },
        { label: 'Case Studies',   to: '/cases' },
        { label: 'Help Center',    to: '/help' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us',       to: '/about' },
        { label: 'Careers',        to: '/careers' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
      ],
    },
  ];

  const socials = [
    { icon: FaTwitter,   href: 'https://twitter.com',   label: 'Twitter' },
    { icon: FaLinkedinIn,href: 'https://linkedin.com',  label: 'LinkedIn' },
    { icon: FaYoutube,   href: 'https://youtube.com',   label: 'YouTube' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-[#0f0e1a] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-14 border-b border-white/10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
              CreatorBridge
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-[220px]">
              The all-in-one community platform for content creators to connect, grow, and thrive together.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 mt-5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center
                             hover:bg-indigo-500/40 transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-indigo-400 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-gray-100 transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} CreatorBridge. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────
   Main Home Page
───────────────────────────────────────── */
const Home = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [stats, setStats] = useState(defaultStats);
  const toastTimer = useRef(null);

  const showToast = (message) => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        const data = response.data;
        
        const formatNumber = (num) => {
          if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
          return num.toString() + '+';
        };

        const realStats = [
          { icon: HiUsers, number: formatNumber(data.activeCreators || 5000), label: 'Active Creators', color: 'from-indigo-500 to-indigo-600', toast: `👥 Meet ${formatNumber(data.activeCreators || 5000)} active creators!` },
          { icon: HiChat, number: formatNumber(data.postsShared || 10000), label: 'Posts Shared', color: 'from-cyan-500 to-cyan-600', toast: `📝 ${formatNumber(data.postsShared || 10000)} posts and counting!` },
          { icon: HiVideoCamera, number: formatNumber(data.meetingsHosted || 500), label: 'Meetings Hosted', color: 'from-purple-500 to-purple-600', toast: `🎥 ${formatNumber(data.meetingsHosted || 500)} collaborative sessions!` },
          { icon: HiTrendingUp, number: formatNumber(data.nichesCovered || 100), label: 'Niches Covered', color: 'from-green-500 to-green-600', toast: `🌐 ${formatNumber(data.nichesCovered || 100)} niches worldwide!` },
        ];
        
        setStats(realStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const features = [
    { icon: HiUsers,       title: 'Community Forum',   description: 'Share struggles, get advice, and learn from peers', iconBg: 'bg-indigo-500', link: '/forum' },
    { icon: HiChat,        title: 'Real-time Chat',    description: 'Connect instantly with creators in your niche',     iconBg: 'bg-cyan-500',   link: '/chat' },
    { icon: HiVideoCamera, title: 'Video Meetings',    description: 'Host channel reviews and collab sessions',          iconBg: 'bg-purple-500', link: '/meetings' },
    { icon: HiTrendingUp,  title: 'Channel Discovery', description: 'Find and subscribe to growing channels',            iconBg: 'bg-green-500',  link: '/discovery' },
  ];

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />

      {/* ── Scrolling Stats Ticker (full-width, top of page) ── */}
      <StatTicker stats={stats} onStatClick={showToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome ,{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {user?.name}!
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your creator community awaits. Grow together, learn from peers, and break through the plateau.
          </p>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Link to={feature.link} className="h-full block">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className={`${feature.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Tips for Growth</h2>
          <div className="space-y-3">
            {[
              { color: 'bg-indigo-500', tip: 'Post consistently and engage with your community daily' },
              { color: 'bg-cyan-500',   tip: 'Collaborate with creators in similar niches for cross-promotion' },
              { color: 'bg-purple-500', tip: 'Join weekly creator circles to get real-time feedback on your content' },
            ].map(({ color, tip }) => (
              <div key={tip} className="flex items-start gap-3">
                <div className={`w-2 h-2 ${color} rounded-full mt-2 flex-shrink-0`} />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Home;