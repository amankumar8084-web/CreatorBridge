import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import chatService from '../services/chat.service';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiPaperAirplane, HiUser, HiUsers, HiChatBubbleLeftRight } from 'react-icons/hi2';
import Loader from '../components/common/Loader';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();
  const { socket, joinChat, sendMessage, isConnected } = useSocket();
  const queryClient = useQueryClient();
  
  // Fetch chats
  const { data: chatsData, isLoading: chatsLoading } = useQuery(
    'chats',
    () => chatService.getChats(),
    {
      onSuccess: (data) => setChats(data)
    }
  );
  
  // Fetch messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['messages', selectedChat?._id],
    () => chatService.getMessages(selectedChat._id),
    {
      enabled: !!selectedChat,
    }
  );
  
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);
  
  useEffect(() => {
    if (selectedChat) {
      joinChat(selectedChat._id);
    }
  }, [selectedChat, joinChat]);
  
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      if (selectedChat && newMessage.chatId === selectedChat._id) {
        setMessages(prev => [...prev, newMessage]);
      }
      // Update chats list with latest message
      queryClient.invalidateQueries('chats');
    };
    
    socket.on('chat:message', handleNewMessage);
    return () => socket.off('chat:message');
  }, [socket, selectedChat, queryClient]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    
    sendMessage(selectedChat._id, message);
    setMessage('');
  };
  
  if (chatsLoading) return <Loader />;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)]">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <HiUsers className="text-indigo-600" /> Messages
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chats?.map((chat) => {
              const otherUser = chat.participants.find(p => p._id !== user?.id);
              return (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedChat?._id === chat._id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=4F46E5`}
                      alt={otherUser?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{otherUser?.name}</h4>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage?.content || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-gray-50">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <HiUser className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {selectedChat.participants.find(p => p._id !== user?.id)?.name}
                    </h3>
                    <p className="text-xs text-green-500">{isConnected ? 'Connected' : 'Connecting...'}</p>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.sender === user?.id
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    <HiPaperAirplane className="w-5 h-5 rotate-90" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <HiChatBubbleLeftRight className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a creator to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;