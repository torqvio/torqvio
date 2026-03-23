import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';
import type { WorkflowEvent } from '../../../packages/client/src/types.js';
import { broadcastEvent as broadcastSSEEvent } from './events-stream.js';

export function initializeSocketEvents(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:7243",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const apiKey = socket.handshake.auth.apiKey;
      
      if (!apiKey) {
        return next(new Error('Authentication failed: API key required'));
      }

      // For now, accept any API key (in production, validate against database)
      socket.data.apiKey = apiKey;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected to events: ${socket.id}`);

    socket.on('subscribe:workflows', async (workflowId?: string) => {
      try {
        const room = workflowId ? `workflow:${workflowId}` : 'all-workflows';
        socket.join(room);
        
        logger.info(`Client ${socket.id} subscribed to ${room}`);
        socket.emit('subscribed', { room, message: `Subscribed to ${room}` });
      } catch (error) {
        logger.error('Error subscribing to workflows:', error);
        socket.emit('error', { message: 'Failed to subscribe to workflows' });
      }
    });

    socket.on('unsubscribe:workflows', async (workflowId?: string) => {
      try {
        const room = workflowId ? `workflow:${workflowId}` : 'all-workflows';
        socket.leave(room);
        
        logger.info(`Client ${socket.id} unsubscribed from ${room}`);
        socket.emit('unsubscribed', { room, message: `Unsubscribed from ${room}` });
      } catch (error) {
        logger.error('Error unsubscribing from workflows:', error);
        socket.emit('error', { message: 'Failed to unsubscribe from workflows' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from events: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}

// Event broadcasting functions
export class EventBroadcaster {
  constructor(private io: SocketIOServer, private db = createDatabaseConnection()) {}

  async broadcastWorkflowEvent(event: WorkflowEvent): Promise<void> {
    try {
      // Convert to SSE format and broadcast
      const sseEvent = {
        event: event.type,
        workflow_id: event.data.workflow_id,
        execution_id: event.data.execution_id,
        timestamp: event.timestamp,
        data: event.data
      };
      broadcastSSEEvent(sseEvent);

      // Broadcast to all workflow subscribers via Socket.IO
      this.io.to('all-workflows').emit('workflow.event', event);

      // Broadcast to specific workflow subscribers if workflow_id is present
      if (event.data.workflow_id) {
        this.io.to(`workflow:${event.data.workflow_id}`).emit('workflow.event', event);
      }

      logger.info(`Broadcasted workflow event: ${event.type}`, {
        eventId: event.id,
        workflowId: event.data.workflow_id,
        executionId: event.data.execution_id
      });
    } catch (error) {
      logger.error('Failed to broadcast workflow event:', error);
    }
  }

  async broadcastWorkflowStarted(workflowId: string, executionId: string): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateEventId(),
      type: 'workflow.started',
      data: {
        workflow_id: workflowId,
        execution_id: executionId,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    await this.broadcastWorkflowEvent(event);
  }

  async broadcastWorkflowCompleted(workflowId: string, executionId: string, results: any): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateEventId(),
      type: 'workflow.completed',
      data: {
        workflow_id: workflowId,
        execution_id: executionId,
        results,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    await this.broadcastWorkflowEvent(event);
  }

  async broadcastWorkflowFailed(workflowId: string, executionId: string, error: string): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateEventId(),
      type: 'workflow.failed',
      data: {
        workflow_id: workflowId,
        execution_id: executionId,
        error,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    await this.broadcastWorkflowEvent(event);
  }

  async broadcastStepStarted(workflowId: string, executionId: string, stepName: string): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateEventId(),
      type: 'workflow.step.started',
      data: {
        workflow_id: workflowId,
        execution_id: executionId,
        step_name: stepName,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    await this.broadcastWorkflowEvent(event);
  }

  async broadcastStepCompleted(workflowId: string, executionId: string, stepName: string, results: any): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateEventId(),
      type: 'workflow.step.completed',
      data: {
        workflow_id: workflowId,
        execution_id: executionId,
        step_name: stepName,
        results,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    await this.broadcastWorkflowEvent(event);
  }

  async broadcastStepFailed(workflowId: string, executionId: string, stepName: string, error: string): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateEventId(),
      type: 'workflow.step.failed',
      data: {
        workflow_id: workflowId,
        execution_id: executionId,
        step_name: stepName,
        error,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    await this.broadcastWorkflowEvent(event);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
