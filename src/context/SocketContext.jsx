import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useCookies } from 'react-cookie';
import { HOST } from '../utils/constants';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [cookies] = useCookies();

  useEffect(() => {
    if (cookies.jwt) {
      // Initialize socket connection
      const newSocket = io(HOST, {
        auth: {
          token: cookies.jwt
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSocket server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected to WebSocket server after ${attemptNumber} attempts`);
        setConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ WebSocket reconnection error:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('❌ WebSocket reconnection failed');
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup function
      return () => {
        newSocket.close();
      };
    } else {
      // No JWT token, disconnect if socket exists
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [cookies.jwt]);

  // Join order room
  const joinOrderRoom = (orderId) => {
    if (socket && connected) {
      socket.emit('join_order', orderId);
    }
  };

  // Leave order room
  const leaveOrderRoom = (orderId) => {
    if (socket && connected) {
      socket.emit('leave_order', orderId);
    }
  };

  // Join job room
  const joinJobRoom = (jobId) => {
    if (socket && connected) {
      socket.emit('join_job', jobId);
    }
  };

  // Leave job room
  const leaveJobRoom = (jobId) => {
    if (socket && connected) {
      socket.emit('leave_job', jobId);
    }
  };

  // Listen for order updates
  const onOrderUpdate = (callback) => {
    if (socket) {
      socket.on('order_update', callback);
      return () => socket.off('order_update', callback);
    }
    return () => {};
  };

  // Listen for order status changes
  const onOrderStatusChange = (callback) => {
    if (socket) {
      socket.on('order_status_change', callback);
      return () => socket.off('order_status_change', callback);
    }
    return () => {};
  };

  // Listen for job updates
  const onJobUpdate = (callback) => {
    if (socket) {
      socket.on('job_update', callback);
      return () => socket.off('job_update', callback);
    }
    return () => {};
  };

  // Listen for job status changes
  const onJobStatusChange = (callback) => {
    if (socket) {
      socket.on('job_status_change', callback);
      return () => socket.off('job_status_change', callback);
    }
    return () => {};
  };

  // Listen for application status changes
  const onApplicationStatusChange = (callback) => {
    if (socket) {
      socket.on('application_status_change', callback);
      return () => socket.off('application_status_change', callback);
    }
    return () => {};
  };

  // Listen for new messages
  const onNewMessage = (callback) => {
    if (socket) {
      socket.on('new_message', callback);
      return () => socket.off('new_message', callback);
    }
    return () => {};
  };

  // Listen for job messages
  const onNewJobMessage = (callback) => {
    if (socket) {
      socket.on('new_job_message', callback);
      return () => socket.off('new_job_message', callback);
    }
    return () => {};
  };

  // Listen for milestone updates
  const onMilestoneUpdate = (callback) => {
    if (socket) {
      socket.on('milestone_update', callback);
      return () => socket.off('milestone_update', callback);
    }
    return () => {};
  };

  // Listen for job milestone updates
  const onJobMilestoneUpdate = (callback) => {
    if (socket) {
      socket.on('job_milestone_update', callback);
      return () => socket.off('job_milestone_update', callback);
    }
    return () => {};
  };

  // Generic event listener
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  // Generic event emitter
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    joinOrderRoom,
    leaveOrderRoom,
    joinJobRoom,
    leaveJobRoom,
    onOrderUpdate,
    onOrderStatusChange,
    onJobUpdate,
    onJobStatusChange,
    onApplicationStatusChange,
    onNewMessage,
    onNewJobMessage,
    onMilestoneUpdate,
    onJobMilestoneUpdate,
    on,
    emit
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
