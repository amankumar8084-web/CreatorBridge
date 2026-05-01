import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiUsers, HiVideoCamera, HiTrendingUp } from 'react-icons/hi';
import {
  FaTwitter, FaLinkedinIn, FaYoutube, FaInstagram,
} from 'react-icons/fa';
import logo from '../assets/logo.png'; // ← drop your logo file here (PNG with transparent bg recommended)

/* ─────────────────────────────────────────
   Default fallback stats
───────────────────────────────────────── */
const defaultStats = [
  {
    icon: HiUsers,
    number: '5,000+',
    label: 'Active Creators',
    toast: '👥 Meet 5,000+ active creators!',
    iconColor: '#818cf8',
    iconBg: 'rgba(79,70,229,0.18)',
  },
  {
    icon: HiChat,
    number: '10,000+',
    label: 'Posts Shared',
    toast: '📝 10,000+ posts and counting!',
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.15)',
  },
  {
    icon: HiVideoCamera,
    number: '500+',
    label: 'Meetings Hosted',
    toast: '🎥 500+ collaborative sessions!',
    iconColor: '#a78bfa',
    iconBg: 'rgba(167,139,250,0.15)',
  },
  {
    icon: HiTrendingUp,
    number: '100+',
    label: 'Niches Covered',
    toast: '🌐 100+ niches worldwide!',
    iconColor: '#38bdf8',
    iconBg: 'rgba(56,189,248,0.15)',
  },
];

/* ─────────────────────────────────────────
   Toast
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
   Scrolling Ticker  (seamless left → right loop)
   Requires Tailwind custom animation below ↓
   Add to tailwind.config.js:
     theme: {
       extend: {
         animation: { ticker: 'ticker 30s linear infinite' },
         keyframes: { ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } },
       },
     }
───────────────────────────────────────── */
const StatTicker = ({ stats, onStatClick }) => {
  const items = [...stats, ...stats, ...stats, ...stats];

  return (
    <div className="relative w-full overflow-hidden border-t border-b border-white/10"
      style={{ background: 'linear-gradient(90deg,#1e1b4b 0%,#1a1740 50%,#1e1b4b 100%)' }}
    >
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
        style={{ background: 'linear-gradient(to right,#1e1b4b,transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
        style={{ background: 'linear-gradient(to left,#1e1b4b,transparent)' }} />

      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {items.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <button
              key={idx}
              onClick={() => onStatClick(stat.toast)}
              className="flex items-center gap-3 px-7 py-4 border-r border-white/[0.07]
                         bg-transparent cursor-pointer
                         hover:bg-white/5 transition-colors duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: stat.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.iconColor }} />
              </div>
              <div className="text-left">
                <div className="text-[17px] font-bold text-white leading-none">
                  {stat.number}
                </div>
                <div className="text-[10px] font-medium tracking-widest uppercase mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.42)' }}>
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
   Footer  (original structure, unchanged)
───────────────────────────────────────── */
const Footer = () => {
  const cols = [
    {
      heading: 'Platform',
      links: [
        { label: 'Community Forum', to: '/forum' },
        { label: 'Real-time Chat', to: '/chat' },
        { label: 'Video Meetings', to: '/meetings' },
        { label: 'Channel Discovery', to: '/discovery' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Creator Guides', to: '/guides' },
        { label: 'Growth Tips', to: '/tips' },
        { label: 'Case Studies', to: '/cases' },
        { label: 'Help Center', to: '/help' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Careers', to: '/careers' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
      ],
    },
  ];

  const socials = [
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-[#0f0e1a] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-14 border-b border-white/10">
          {/* brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
              CreatorBridge
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-[220px]">
              The all-in-one community platform for content creators to connect, grow, and thrive together.
            </p>
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

          {/* link columns */}
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

        {/* bottom bar */}
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

  /* ── toast helper ── */
  const showToast = (message) => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2800,
    );
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ── fetch real stats ── */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k+' : n + '+');

        setStats([
          {
            icon: HiUsers,
            number: fmt(data.activeCreators || 5000),
            label: 'Active Creators',
            toast: `👥 Meet ${fmt(data.activeCreators || 5000)} active creators!`,
            iconColor: '#818cf8',
            iconBg: 'rgba(79,70,229,0.18)',
          },
          {
            icon: HiChat,
            number: fmt(data.postsShared || 10000),
            label: 'Posts Shared',
            toast: `📝 ${fmt(data.postsShared || 10000)} posts and counting!`,
            iconColor: '#34d399',
            iconBg: 'rgba(52,211,153,0.15)',
          },
          {
            icon: HiVideoCamera,
            number: fmt(data.meetingsHosted || 500),
            label: 'Meetings Hosted',
            toast: `🎥 ${fmt(data.meetingsHosted || 500)} collaborative sessions!`,
            iconColor: '#a78bfa',
            iconBg: 'rgba(167,139,250,0.15)',
          },
          {
            icon: HiTrendingUp,
            number: fmt(data.nichesCovered || 100),
            label: 'Niches Covered',
            toast: `🌐 ${fmt(data.nichesCovered || 100)} niches worldwide!`,
            iconColor: '#38bdf8',
            iconBg: 'rgba(56,189,248,0.15)',
          },
        ]);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  /* ── feature cards ── */
  const features = [
    {
      icon: HiUsers,
      title: 'Community Forum',
      description: 'Share struggles, get advice, and learn from peers',
      iconBg: '#eef2ff',
      iconColor: '#4f46e5',
      link: '/forum',
    },
    {
      icon: HiChat,
      title: 'Real-time Chat',
      description: 'Connect instantly with creators in your niche',
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      link: '/chat',
    },
    {
      icon: HiVideoCamera,
      title: 'Video Meetings',
      description: 'Host channel reviews and collab sessions',
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed',
      link: '/meetings',
    },
    {
      icon: HiTrendingUp,
      title: 'Channel Discovery',
      description: 'Find and subscribe to growing channels',
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      link: '/discovery',
    },
  ];

  const tips = [
    {
      color: '#4f46e5',
      tip: 'Post consistently and engage with your community daily — algorithms reward creators who show up.',
    },
    {
      color: '#059669',
      tip: 'Collaborate with creators in similar niches for cross-promotion that actually converts.',
    },
    {
      color: '#7c3aed',
      tip: 'Join weekly creator circles to get real-time feedback on your content before you publish.',
    },
  ];

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />

      {/* ──────────────────────────────────────────
          Hero Section — full viewport height
      ────────────────────────────────────────── */}
      <section
        className="bg-[#0f0e1a] overflow-hidden relative flex flex-col"
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        {/* Hero content — justify-center keeps logo+text grouped on mobile */}
        <div className="flex-1 flex flex-col justify-center md:flex-row md:items-stretch max-w-7xl mx-auto w-full">

          {/* — Logo — */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center justify-end
                       md:w-[42%] px-8 sm:px-10 md:px-12
                       md:py-0 flex-shrink-0"
          >
            <img
              src={logo}
              alt="CreatorBridge"
              className="w-full max-w-[130px] sm:max-w-[180px] md:max-w-[clamp(200px,28vw,340px)] h-auto object-contain block"
            />
          </motion.div>

          {/* — Thin divider (desktop only) — */}
          <div
            className="hidden md:block self-stretch flex-shrink-0"
            style={{
              width: 1,
              background:
                'linear-gradient(to bottom,transparent 5%,rgba(255,255,255,0.1) 30%,rgba(255,255,255,0.1) 70%,transparent 95%)',
            }}
          />

          {/* — Text content — */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col justify-center items-center md:items-start
                       px-8 sm:px-10 md:px-12 lg:px-16
                       py-10 sm:py-10 md:py-12
                       text-center md:text-left"
          >
            {/* eyebrow */}
            <div
              className="inline-flex self-center md:self-start items-center
                         text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] uppercase
                         rounded px-3 py-[5px] mb-4 sm:mb-5"
              style={{
                color: '#a8a4e8',
                background: 'rgba(83,74,183,0.14)',
                border: '0.5px solid rgba(83,74,183,0.35)',
              }}
            >
              A bridge between the small creators
            </div>

            <h1
              className="font-bold text-white leading-[1.12] mb-3 sm:mb-5"
              style={{
                fontSize: 'clamp(24px, 5.5vw, 52px)',
                letterSpacing: '-0.02em',
              }}
            >
              Stop growing{' '}
              <span style={{ color: '#818cf8' }}>alone.</span>
              <br />
              The{' '}
              <span style={{ color: '#34d399' }}>bridge</span> is here.
            </h1>

            <p
              className="leading-relaxed mb-5 sm:mb-8 mx-auto md:mx-0 text-[13px] sm:text-[15px]"
              style={{
                color: 'rgba(255,255,255,0.48)',
                maxWidth: 500,
              }}
            >
              Find your niche community, get real feedback on your content,
              and build the collaborations that actually move the needle.
              No more growing in isolation.
            </p>

            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <Link
                to="/forum"
                className="font-semibold text-white rounded-md
                           transition-colors duration-200 hover:bg-indigo-700
                           text-[13px] sm:text-sm py-2.5 px-5 sm:py-[11px] sm:px-[26px]"
                style={{ background: '#4f46e5' }}
              >
                Explore the community
              </Link>
              <Link
                to="/meetings"
                className="font-medium rounded-md transition-colors duration-200 hover:bg-white/10
                           text-[13px] sm:text-sm py-2.5 px-5 sm:py-[11px] sm:px-[26px]"
                style={{
                  color: 'rgba(255,255,255,0.65)',
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                }}
              >
                How it works
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Scrolling Stats Ticker — pinned to hero bottom */}
        <StatTicker stats={stats} onStatClick={showToast} />
      </section>

      {/* ──────────────────────────────────────────
          Feature Cards + Tips
      ────────────────────────────────────────── */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* section label */}
          <p className="text-[11px] font-semibold tracking-widest uppercase text-indigo-900 mb-5">
            Platform Features
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="h-full"
                >
                  <Link to={feature.link} className="h-full block group">
                    <div
                      className="bg-white border border-gray-200 rounded-xl p-6 h-full
                                 group-hover:border-indigo-400 transition-colors duration-200"
                    >
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                        style={{ background: feature.iconBg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: feature.iconColor }} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Tips */}
          <p className="text-[11px] font-semibold tracking-widest uppercase text-indigo-900 mb-5">
            Quick Tips for Growth
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {tips.map(({ color, tip }, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 last:pb-0 first:pt-0"
              >
                <div
                  className="rounded-full flex-shrink-0 mt-[7px]"
                  style={{ width: 7, height: 7, background: color }}
                />
                <p className="text-gray-600 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </>
  );
};

export default Home;