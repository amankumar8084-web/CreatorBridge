import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import chatService from '../services/chat.service';
import userService from '../services/user.service';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { HiPaperAirplane, HiUser, HiUsers, HiChatBubbleLeftRight, HiArrowLeft, HiInbox, HiCheck, HiXMark } from 'react-icons/hi2';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

// Helper: extract sender ID from a message (handles both populated and unpopulated sender)
const getSenderId = (msg) => {
  if (!msg?.sender) return null;
  if (typeof msg.sender === 'string') return msg.sender;
  return msg.sender._id || msg.sender.id;
};

const Chat = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;
  const { socket, joinChat, sendMessage, sendChatRequest, isConnected, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  
  // ---- Data Fetching ----
  
  // Fetch current user's profile to get connections
  const { data: profile, isLoading: profileLoading } = useQuery(
    ['profile', currentUserId],
    () => userService.getProfile(currentUserId),
    {
      enabled: !!currentUserId,
      staleTime: 30000
    }
  );

  // Use useMemo to derive unique connections from followers and following
  const connections = useMemo(() => {
    if (!profile) return [];
    const all = [...(profile.followers || []), ...(profile.following || [])];
    const seen = new Set();
    return all.filter(conn => {
      if (!conn) return false;
      const id = conn._id || conn.id || (typeof conn === 'string' ? conn : null);
      if (!id) return false;
      const idStr = id.toString();
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
  }, [profile]);

  const handleSelectConnection = useCallback(async (connection) => {
    try {
      const dmData = await chatService.createDMRoom(connection._id);
      setSelectedChat({
        _id: dmData.roomId,
        participants: [connection]
      });
    } catch (error) {
      console.error("Error creating DM room:", error);
      toast.error("Failed to open chat");
    }
  }, []);

  // Handle incoming requestUser from Profile page navigation
  useEffect(() => {
    if (location.state?.requestUser && connections.length > 0) {
      const reqUser = location.state.requestUser;
      const alreadyInList = connections.some(c => (c._id || c) === reqUser._id);
      handleSelectConnection(reqUser);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, connections.length, handleSelectConnection]);
  
  // Fetch pending chat requests
  const { data: chatRequests = [], refetch: refetchRequests } = useQuery(
    ['chatRequests'],
    () => chatService.getChatRequests(),
    { enabled: !!currentUserId, staleTime: 30000 }
  );
  
  // Fetch messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['messages', selectedChat?._id],
    () => chatService.getMessages(selectedChat._id),
    {
      enabled: !!selectedChat?._id,
      staleTime: 10000,
      refetchOnWindowFocus: false
    }
  );
  
  // Sync fetched messages into local state (only if chat matches)
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  useEffect(() => {
    setMessages([]);
  }, [selectedChat?._id]);
  
  // ---- Socket Events ----
  
  // Join the room when chat is selected
  useEffect(() => {
    if (selectedChat?._id) {
      joinChat(selectedChat._id);
    }
  }, [selectedChat?._id, joinChat]);
  
  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      if (!selectedChat || newMessage.room !== selectedChat._id) return;
      
      setMessages(prev => {
        // Deduplicate: skip if we already have this message (by _id)
        if (prev.some(m => m._id === newMessage._id)) return prev;
        // Also remove any temp optimistic message that this replaces
        const filtered = prev.filter(m => !m._id?.startsWith?.('temp_'));
        return [...filtered, newMessage];
      });
    };
    
    socket.on('chat:message', handleNewMessage);
    return () => socket.off('chat:message', handleNewMessage);
  }, [socket, selectedChat?._id]);



  // Listen for new chat requests
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => {
      refetchRequests();
    };

    socket.on('chat:request:new', handleNewRequest);
    return () => socket.off('chat:request:new', handleNewRequest);
  }, [socket, refetchRequests]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // ---- Handlers ----
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    
    const recipientId = selectedChat.participants[0]?._id;
    
    // Optimistic UI Update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      content: message.trim(),
      sender: currentUserId,
      createdAt: new Date().toISOString(),
      room: selectedChat._id,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    const msgToSend = message.trim();
    setMessage('');
    inputRef.current?.focus();
    

    
    try {
      const realMessage = await sendMessage(selectedChat._id, msgToSend, recipientId);
      // Replace temp message with real one from DB
      setMessages(prev => prev.map(m => m._id === tempId ? { ...realMessage, status: 'sent' } : m));
    } catch (error) {
      // Mark as failed
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
    }
  };

  // Message input handler
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };



  const handleRespondRequest = async (requestId, action) => {
    try {
      await chatService.respondChatRequest(requestId, action);
      toast.success(action === 'accept' ? 'Chat request accepted!' : 'Chat request declined.');
      refetchRequests();
      if (action === 'accept') {
        queryClient.invalidateQueries(['profile', currentUserId]);
      }
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };

  // Retry a failed message
  const handleRetry = async (failedMsg) => {
    const recipientId = selectedChat.participants[0]?._id;
    setMessages(prev => prev.map(m => m._id === failedMsg._id ? { ...m, status: 'sending' } : m));
    try {
      const realMessage = await sendMessage(selectedChat._id, failedMsg.content, recipientId);
      setMessages(prev => prev.map(m => m._id === failedMsg._id ? { ...realMessage, status: 'sent' } : m));
    } catch {
      setMessages(prev => prev.map(m => m._id === failedMsg._id ? { ...m, status: 'failed' } : m));
    }
  };
  
  // ---- Render ----

  if (profileLoading) return <Loader />;

  // Check if recipient is a connection (memoized)
  const recipient = selectedChat?.participants?.[0];
  const recipientId = recipient?._id || recipient?.id || (typeof recipient === 'string' ? recipient : null);
  const isRecipientConnection = profile?.followers?.some(f => (f?._id || f?.id || f) === recipientId) ||
                                 profile?.following?.some(f => (f?._id || f?.id || f) === recipientId);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 h-[calc(100vh-5rem)]">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex shadow-sm">
        
        {/* ========== SIDEBAR ========== */}
        <div className={`w-full md:w-80 border-r border-gray-200 flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <HiUsers className="text-indigo-600" /> Connections
              </h2>
              {/* Chat Requests Badge */}
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="relative p-2 rounded-full hover:bg-gray-200 transition"
                title="Chat Requests"
              >
                <HiInbox className="w-5 h-5 text-gray-600" />
                {chatRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {chatRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Chat Requests Panel */}
          <AnimatePresence>
            {showRequests && chatRequests.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 bg-amber-50 overflow-hidden"
              >
                <div className="p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Pending Requests</p>
                  {chatRequests.map((req) => (
                    <div key={req._id} className="flex items-center gap-2 py-2">
                      <img
                        src={req.from?.avatar || `https://ui-avatars.com/api/?name=${req.from?.name}&background=4F46E5`}
                        alt={req.from?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">{req.from?.name}</span>
                      <button
                        onClick={() => handleRespondRequest(req._id, 'accept')}
                        className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                        title="Accept"
                      >
                        <HiCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req._id, 'decline')}
                        className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                        title="Decline"
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Connections List */}
          <div className="flex-1 overflow-y-auto">
            {connections.length > 0 ? (
              connections.map((conn) => {
                const isSelected = selectedChat?._id && selectedChat.participants?.some(p => (p?._id || p?.id || p) === conn?._id);
                const isOnline = Array.isArray(onlineUsers) && onlineUsers.some(id => id?.toString() === conn._id?.toString());
                return (
                  <div
                    key={conn._id}
                    onClick={() => handleSelectConnection(conn)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
                      isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={conn.avatar || `https://ui-avatars.com/api/?name=${conn.name}&background=4F46E5`}
                          alt={conn.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{conn.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{conn.niche}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                <HiUsers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No connections yet. Follow other creators to start chatting!
              </div>
            )}
          </div>
        </div>
        
        {/* ========== CHAT AREA ========== */}
        <div className={`flex-1 flex-col bg-gray-50 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                      <HiUser className="text-indigo-600 w-5 h-5" />
                    </div>
                    {Array.isArray(onlineUsers) && onlineUsers.some(id => id?.toString() === selectedChat.participants[0]?._id?.toString()) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {selectedChat.participants[0]?.name}
                    </h3>
                    <p className="text-xs">
                      {Array.isArray(onlineUsers) && onlineUsers.some(id => id?.toString() === selectedChat.participants[0]?._id?.toString()) ? (
                        <span className="text-green-500 font-medium">Online</span>
                      ) : (
                        <span className="text-gray-400">Offline</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <HiChatBubbleLeftRight className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (Array.isArray(messages) && messages.length > 0) ? (
                  <>
                    {messages.map((msg) => {
                      if (!msg) return null;
                      const senderId = getSenderId(msg);
                      const isMine = senderId === currentUserId;
                      
                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-br-md'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {msg.status === 'sending' && <span className="italic">Sending...</span>}
                              {msg.status === 'failed' && (
                                <button
                                  onClick={() => handleRetry(msg)}
                                  className="text-red-300 hover:text-red-100 font-bold underline cursor-pointer"
                                >
                                  Failed · Retry
                                </button>
                              )}
                              {msg.status === 'sent' && <span>✓</span>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : null}
              </div>
              
              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <HiPaperAirplane className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <HiChatBubbleLeftRight className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a creator to start chatting</p>
              <p className="text-sm mt-1">Your connections appear on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;