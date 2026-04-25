import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../utils/constants';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const auth = useAuth();
  const token = auth?.token;
  const user = auth?.user;

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('notification:new', (notification) => {
      toast.custom((t) => (
        <div className={`bg-white rounded-lg shadow-lg p-4 max-w-sm ${t.visible ? 'animate-slide-up' : ''}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-lg">🔔</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{notification.title || 'New Notification'}</p>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
          </div>
        </div>
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, user]);

  const joinChat = (roomId) => {
    if (socket) {
      socket.emit('chat:join', roomId);
    }
  };

  const sendMessage = (roomId, content, recipientId = null) => {
    if (socket) {
      socket.emit('chat:message', { roomId, content, recipientId });
    }
  };

  const sendTyping = (roomId, isTyping) => {
    if (socket) {
      socket.emit('chat:typing', { roomId, isTyping });
    }
  };

  const joinMeeting = (meetingId) => {
    if (socket) {
      socket.emit('meeting:join', meetingId);
    }
  };

  const sendMeetingSignal = (meetingId, signal, to) => {
    if (socket) {
      socket.emit('meeting:signal', { meetingId, signal, to });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      joinChat,
      sendMessage,
      sendTyping,
      joinMeeting,
      sendMeetingSignal
    }}>
      {children}
    </SocketContext.Provider>
  );
};