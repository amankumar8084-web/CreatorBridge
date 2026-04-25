import { useState, useRef, useEffect } from 'react';
import Peer from 'simple-peer';

export const useWebRTC = () => {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState({});
  const localVideoRef = useRef();
  
  const initializeStream = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(userStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userStream;
      }
      return userStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };
  
  const createPeer = (userId, stream, initiator = true) => {
    const peer = new Peer({ initiator, trickle: false, stream });
    
    return peer;
  };
  
  const addPeer = (userId, peer) => {
    setPeers(prev => ({ ...prev, [userId]: { peer, stream: null } }));
  };
  
  const removePeer = (userId) => {
    if (peers[userId]?.peer) {
      peers[userId].peer.destroy();
    }
    setPeers(prev => {
      const newPeers = { ...prev };
      delete newPeers[userId];
      return newPeers;
    });
  };
  
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  useEffect(() => {
    return () => {
      stopStream();
      Object.values(peers).forEach(({ peer }) => {
        if (peer) peer.destroy();
      });
    };
  }, []);
  
  return {
    stream,
    peers,
    localVideoRef,
    initializeStream,
    createPeer,
    addPeer,
    removePeer,
    stopStream
  };
};