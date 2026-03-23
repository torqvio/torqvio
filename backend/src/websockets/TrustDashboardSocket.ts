import { Server, Socket } from 'socket.io';
import { RecoveryService } from '../services/RecoveryService';

export interface RecoveryEvent {
  id: string;
  amount: number;
  currency: string;
  timestamp: Date;
  workflowType: string;
  counterfactualDelta: number;
  projectId: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'recovery' | 'rate' | 'volume';
  achievedAt: Date;
  value: number;
}

export class TrustDashboardSocket {
  private io: Server;
  private projectRooms: Map<string, Set<string>> = new Map();

  constructor(server: any) {
    this.io = new Server(server, {
      cors: { 
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Join project-specific room
      socket.on('join_project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        
        if (!this.projectRooms.has(projectId)) {
          this.projectRooms.set(projectId, new Set());
        }
        this.projectRooms.get(projectId)!.add(socket.id);
        
        console.log(`Socket ${socket.id} joined project ${projectId}`);
      });

      socket.on('leave_project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        this.projectRooms.get(projectId)?.delete(socket.id);
        console.log(`Socket ${socket.id} left project ${projectId}`);
      });

      socket.on('disconnect', () => {
        // Clean up room memberships
        for (const [projectId, sockets] of this.projectRooms.entries()) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.projectRooms.delete(projectId);
          }
        }
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Push recovery events in real-time
  async pushRecoveryEvent(projectId: string, event: RecoveryEvent) {
    const room = `project:${projectId}`;
    const payload = {
      type: 'recovery_event',
      data: {
        id: event.id,
        amount: event.amount,
        currency: event.currency,
        timestamp: event.timestamp,
        workflowType: event.workflowType,
        counterfactualDelta: event.counterfactualDelta
      }
    };

    this.io.to(room).emit('recovery_update', payload);
    console.log(`Pushed recovery event to room ${room}:`, payload);
    
    // Update live counter
    await this.updateLiveCounter(projectId, event.amount);
  }

  // Push milestone achievements
  async pushMilestoneAchievement(projectId: string, milestone: Milestone) {
    const room = `project:${projectId}`;
    const payload = {
      type: 'milestone_achieved',
      data: milestone
    };

    this.io.to(room).emit('milestone_achievement', payload);
    console.log(`Pushed milestone to room ${room}:`, payload);
  }

  // Update live recovery counter
  private async updateLiveCounter(projectId: string, amount: number) {
    try {
      const analytics = await RecoveryService.getProjectAnalytics(projectId);
      const payload = {
        type: 'counter_update',
        data: {
          totalRecovered: analytics.totalRecovered,
          todayRecovered: analytics.todayRecovered,
          recoveryRate: analytics.recoveryRate,
          counterfactualProtected: analytics.counterfactualProtected
        }
      };

      this.io.to(`project:${projectId}`).emit('counter_update', payload);
      console.log(`Updated counter for project ${projectId}:`, payload);
    } catch (error) {
      console.error('Failed to update live counter:', error);
    }
  }

  // Get room statistics
  getRoomStats() {
    const stats: Record<string, number> = {};
    for (const [projectId, sockets] of this.projectRooms.entries()) {
      stats[projectId] = sockets.size;
    }
    return stats;
  }

  // Broadcast system-wide announcements
  async broadcastSystemAnnouncement(message: string, type: 'info' | 'warning' | 'success') {
    const payload = {
      type: 'system_announcement',
      data: {
        message,
        type,
        timestamp: new Date()
      }
    };

    this.io.emit('system_announcement', payload);
    console.log('Broadcast system announcement:', payload);
  }

  // Close the socket server
  close() {
    this.io.close();
  }
}
