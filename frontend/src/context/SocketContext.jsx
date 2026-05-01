import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../utils/constants';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const auth = useAuth();
  const token = auth?.token;
  const userId = auth?.user?.id || auth?.user?._id;

  useEffect(() => {
    if (!token || !userId) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setConnectionState('disconnected');
      }
      return;
    }
    if (socketRef.current) return;

    setConnectionState('connecting');
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setConnectionState('connected');
    });

    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnecting... attempt ${attempt}`);
      setConnectionState('reconnecting');
    });

    newSocket.io.on('reconnect', () => {
      console.log('Socket reconnected');
      setIsConnected(true);
      setConnectionState('connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
      setConnectionState('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    newSocket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('notification:new', (notification) => {
      toast.custom((t) => (
        <div className={`bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-100 ${t.visible ? 'animate-slide-up' : ''}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 text-lg">
                {notification.type === 'chat_request' ? '💬' : '🔔'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{notification.title || 'New Notification'}</p>
              <p className="text-sm text-gray-600 truncate">{notification.message}</p>
            </div>
          </div>
        </div>
      ), { duration: 4000 });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [token, userId]);

  const joinChat = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:join', roomId);
    }
  }, []);

  const sendMessage = useCallback((roomId, content, recipientId = null) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        toast.error('Not connected. Trying to reconnect...');
        reject(new Error('Socket not connected'));
        return;
      }
      const timeout = setTimeout(() => {
        reject(new Error('Message timed out'));
      }, 10000);

      socketRef.current.emit('chat:message', { roomId, content, recipientId }, (response) => {
        clearTimeout(timeout);
        if (response?.error) {
          toast.error(response.error);
          reject(new Error(response.error));
        } else {
          resolve(response?.message);
        }
      });
    });
  }, []);

  const sendChatRequest = useCallback((recipientId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        toast.error('Not connected. Trying to reconnect...');
        reject(new Error('Socket not connected'));
        return;
      }
      socketRef.current.emit('chat:request', { recipientId }, (response) => {
        if (response?.error) {
          toast.error(response.error);
          reject(new Error(response.error));
        } else {
          resolve(response?.message);
        }
      });
    });
  }, []);

  const sendTyping = useCallback((roomId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:typing', { roomId, isTyping });
    }
  }, []);

  const joinMeeting = useCallback((meetingId) => {
    if (socketRef.current) {
      socketRef.current.emit('meeting:join', meetingId);
    }
  }, []);

  const sendMeetingSignal = useCallback((meetingId, signal, to) => {
    if (socketRef.current) {
      socketRef.current.emit('meeting:signal', { meetingId, signal, to });
    }
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      connectionState,
      onlineUsers,
      joinChat,
      sendMessage,
      sendChatRequest,
      sendTyping,
      joinMeeting,
      sendMeetingSignal
    }}>
      {children}
    </SocketContext.Provider>
  );
};