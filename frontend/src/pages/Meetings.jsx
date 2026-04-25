import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import meetingService from '../services/meeting.service';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiVideoCamera, HiPlus, HiUsers, HiClock } from 'react-icons/hi';
import Loader from '../components/common/Loader';

// SimplePeer for WebRTC
import Peer from 'simple-peer';

const Meetings = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const videoRef = useRef();
  
  const { user } = useAuth();
  const { socket, joinMeeting, sendMeetingSignal } = useSocket();
  const queryClient = useQueryClient();
  
  // Fetch meetings
  const { data: meetingsData, isLoading } = useQuery(
    'meetings',
    () => meetingService.getMeetings()
  );
  
  // Create meeting mutation
  const createMeetingMutation = useMutation(
    (meetingData) => meetingService.createMeeting(meetingData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('meetings');
        setShowCreateModal(false);
      }
    }
  );
  
  // Join meeting mutation
  const joinMeetingMutation = useMutation(
    (meetingId) => meetingService.joinMeeting(meetingId),
    {
      onSuccess: (data, meetingId) => {
        if (data.status !== 'pending') {
          startCall(meetingId);
        }
      }
    }
  );
  
  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      setStream(null);
    }
    // Clean up peers
    Object.values(peers).forEach(({ peer }) => {
      peer.destroy();
    });
    setPeers({});
  };

  const startCall = async (meetingId) => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      setActiveMeeting(meetingId);
      joinMeeting(meetingId);
    } catch (err) {
      console.error('Failed to get media devices:', err);
      alert('Could not access camera or microphone. Please check permissions.');
    }
  };

  // Socket event handlers for WebRTC
  useEffect(() => {
    if (!socket || !activeMeeting) return;
    
    const handleUserJoined = ({ userId, name }) => {
      if (userId !== user?.id && stream) {
        console.log(`User joined: ${name}, initiating peer connection`);
        const peer = new Peer({ initiator: true, trickle: false, stream });
        
        peer.on('signal', signal => {
          sendMeetingSignal(activeMeeting, signal, userId);
        });
        
        peer.on('stream', remoteStream => {
          setPeers(prev => ({ ...prev, [userId]: { peer, stream: remoteStream, name } }));
        });

        peer.on('error', err => console.error('Peer error:', err));
        peer.on('close', () => {
          setPeers(prev => {
            const newPeers = { ...prev };
            delete newPeers[userId];
            return newPeers;
          });
        });
        
        setPeers(prev => ({ ...prev, [userId]: { peer, stream: null, name } }));
      }
    };
    
    const handleSignal = ({ signal, from, name }) => {
      if (peers[from]?.peer) {
        peers[from].peer.signal(signal);
      } else if (stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        
        peer.on('signal', signal => {
          sendMeetingSignal(activeMeeting, signal, from);
        });
        
        peer.on('stream', remoteStream => {
          setPeers(prev => ({ ...prev, [from]: { peer, stream: remoteStream, name } }));
        });

        peer.on('error', err => console.error('Peer error:', err));
        peer.on('close', () => {
          setPeers(prev => {
            const newPeers = { ...prev };
            delete newPeers[from];
            return newPeers;
          });
        });
        
        peer.signal(signal);
        setPeers(prev => ({ ...prev, [from]: { peer, stream: null, name } }));
      }
    };
    
    socket.on('meeting:user-joined', handleUserJoined);
    socket.on('meeting:signal', handleSignal);
    
    return () => {
      socket.off('meeting:user-joined', handleUserJoined);
      socket.off('meeting:signal', handleSignal);
    };
  }, [socket, stream, activeMeeting, user?.id, peers]);

  // Handle stream cleanup on unmount or meeting leave
  useEffect(() => {
    const handleUnload = () => {
      stopMediaStream();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      stopMediaStream();
    };
  }, [stream]); // Re-run when stream changes to have correct reference in closure
  
  const CreateMeetingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create Meeting Room</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          createMeetingMutation.mutate({
            name: formData.get('name'),
            description: formData.get('description'),
            maxParticipants: parseInt(formData.get('maxParticipants')),
            isPrivate: formData.get('isPrivate') === 'true'
          });
        }}>
          <input
            name="name"
            placeholder="Meeting name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
          />
          <input
            name="maxParticipants"
            type="number"
            placeholder="Max participants (2-50)"
            defaultValue="8"
            min="2"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
          />
          <select
            name="isPrivate"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
          >
            <option value="false">Public (Anyone can join)</option>
            <option value="true">Private (Approval required)</option>
          </select>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 btn-primary py-2 rounded-lg">
              Create
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  if (isLoading) return <Loader />;
  
  if (activeMeeting) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-[calc(100%-5rem)]">
          {/* Local video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              You (Local)
            </div>
          </div>
          
          {/* Remote videos */}
          {Object.entries(peers).map(([userId, { stream: remoteStream, name }]) => (
            <div key={userId} className="bg-gray-800 rounded-lg overflow-hidden relative">
              {remoteStream ? (
                <video
                  ref={ref => ref && (ref.srcObject = remoteStream)}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <HiUsers className="w-8 h-8" />
                    </div>
                    <p>Connecting...</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {name}
              </div>
            </div>
          ))}
        </div>
        
        <div className="h-20 bg-gray-800 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setActiveMeeting(null);
              stopMediaStream();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition"
          >
            Leave Meeting
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Meetings</h1>
          <p className="text-gray-600 mt-2">Host channel reviews, collab sessions, and creator circles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <HiPlus /> Create Meeting
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetingsData?.meetings?.map((meeting, index) => (
          <motion.div
            key={meeting._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <HiVideoCamera className="w-5 h-5 text-indigo-600" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                meeting.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {meeting.isActive ? 'Live' : 'Scheduled'}
              </span>
            </div>
            
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{meeting.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <HiUsers className="w-4 h-4" />
                <span>{meeting.participants?.length || 1} / {meeting.maxParticipants} participants</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <HiClock className="w-4 h-4" />
                <span>Hosted by {meeting.host?.name}</span>
              </div>
            </div>
            
            <button
              onClick={() => joinMeetingMutation.mutate(meeting._id)}
              disabled={meeting.participants?.length >= meeting.maxParticipants}
              className={`w-full py-2 rounded-lg transition ${
                meeting.participants?.length >= meeting.maxParticipants
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {meeting.participants?.length >= meeting.maxParticipants ? 'Meeting Full' : 'Join Meeting'}
            </button>
          </motion.div>
        ))}
      </div>
      
      {showCreateModal && <CreateMeetingModal />}
    </div>
  );
};

export default Meetings;