'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealTimeUpdate {
  id: string;
  type: 'recovery' | 'trust_score' | 'milestone' | 'alert';
  amount?: number;
  data?: Record<string, unknown>;
  timestamp: Date;
  source: string;
  message: string;
}

interface TrustFactor {
  id: string;
  name: string;
  value: number;
  description?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt: Date;
  reward?: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UseRealTimeUpdatesOptions {
  autoConnect?: boolean;
  projectId?: string;
  onRecovery?: (update: RealTimeUpdate) => void;
  onTrustScoreUpdate?: (score: number, factors: TrustFactor[]) => void;
  onMilestone?: (milestone: Milestone) => void;
  onAlert?: (alert: Alert) => void;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    autoConnect = true,
    projectId,
    onRecovery,
    onTrustScoreUpdate,
    onMilestone,
    onAlert,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealTimeUpdate | null>(null);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!autoConnect || !projectId) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket', 'polling'],
      auth: {
        projectId,
      },
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError('Failed to connect to real-time updates');
      setIsConnected(false);
    });

    // Real-time update events
    socket.on('recovery:update', (data) => {
      const update: RealTimeUpdate = {
        id: data.id || Date.now().toString(),
        type: 'recovery',
        amount: data.amount,
        timestamp: new Date(data.timestamp),
        source: data.source || 'Unknown',
        message: data.message || `Recovered $${data.amount}`,
        data: data,
      };

      setLastUpdate(update);
      setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
      onRecovery?.(update);
    });

    socket.on('trust_score:update', (data) => {
      const update: RealTimeUpdate = {
        id: data.id || Date.now().toString(),
        type: 'trust_score',
        timestamp: new Date(data.timestamp),
        source: 'system',
        message: data.message || 'Trust score updated',
        data: data,
      };

      setLastUpdate(update);
      onTrustScoreUpdate?.(data.score, data.factors);
    });

    socket.on('milestone:achieved', (data) => {
      const update: RealTimeUpdate = {
        id: data.id || Date.now().toString(),
        type: 'milestone',
        timestamp: new Date(data.timestamp),
        source: 'system',
        message: data.message || 'Milestone achieved',
        data: data,
      };

      setLastUpdate(update);
      onMilestone?.(data);
    });

    socket.on('alert:triggered', (data) => {
      const update: RealTimeUpdate = {
        id: data.id || Date.now().toString(),
        type: 'alert',
        timestamp: new Date(data.timestamp),
        source: data.source || 'system',
        message: data.message || 'Alert triggered',
        data: data,
      };

      setLastUpdate(update);
      onAlert?.(data);
    });

    // Join project-specific room
    socket.emit('join:project', { projectId });

    return () => {
      socket.emit('leave:project', { projectId });
      socket.disconnect();
    };
  }, [autoConnect, projectId, onRecovery, onTrustScoreUpdate, onMilestone, onAlert]);

  // Manual connection control
  const connect = () => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
    }
  };

  // Subscribe to specific events
  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Unsubscribe from specific events
  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  // Send events to server
  const emit = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  };

  // Get connection status
  const getConnectionStatus = () => {
    if (!socketRef.current) return 'disconnected';
    if (socketRef.current.connected) return 'connected';
    return 'connecting';
  };

  return {
    isConnected,
    lastUpdate,
    updates,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    emit,
    getConnectionStatus,
  };
}

// Hook for real-time recovery updates specifically
export function useRealTimeRecovery(projectId?: string) {
  const [totalRecovered, setTotalRecovered] = useState(0);
  const [todayRecovered, setTodayRecovered] = useState(0);
  const [recentRecoveries, setRecentRecoveries] = useState<RealTimeUpdate[]>([]);

  const { isConnected, lastUpdate, error } = useRealTimeUpdates({
    projectId,
    autoConnect: !!projectId,
    onRecovery: (update) => {
      if (update.amount) {
        setTotalRecovered(prev => prev + update.amount);
        
        // Check if recovery happened today
        const today = new Date();
        const updateDate = new Date(update.timestamp);
        if (updateDate.toDateString() === today.toDateString()) {
          setTodayRecovered(prev => prev + update.amount);
        }
        
        setRecentRecoveries(prev => [update, ...prev.slice(0, 9)]);
      }
    },
  });

  return {
    totalRecovered,
    todayRecovered,
    recentRecoveries,
    isConnected,
    lastUpdate,
    error,
  };
}

// Hook for real-time trust score updates
export function useRealTimeTrustScore(projectId?: string) {
  const [trustScore, setTrustScore] = useState(0);
  const [factors, setFactors] = useState<TrustFactor[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { isConnected, error } = useRealTimeUpdates({
    projectId,
    autoConnect: !!projectId,
    onTrustScoreUpdate: (score, newFactors) => {
      setTrustScore(score);
      setFactors(newFactors);
      setLastUpdate(new Date());
    },
  });

  return {
    trustScore,
    factors,
    lastUpdate,
    isConnected,
    error,
  };
}

// Hook for real-time milestone tracking
export function useRealTimeMilestones(projectId?: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [unlockedMilestone, setUnlockedMilestone] = useState<Milestone | null>(null);

  const { isConnected, error } = useRealTimeUpdates({
    projectId,
    autoConnect: !!projectId,
    onMilestone: (milestone) => {
      setMilestones(prev => [...prev, milestone]);
      setUnlockedMilestone(milestone);
      
      // Clear the unlocked milestone after 5 seconds
      setTimeout(() => setUnlockedMilestone(null), 5000);
    },
  });

  return {
    milestones,
    unlockedMilestone,
    isConnected,
    error,
  };
}
