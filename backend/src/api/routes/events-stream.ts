import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger.js';
import { createDatabaseConnection } from '../../database/connection.js';

const router: Router = Router();
const db = createDatabaseConnection();

// JWT verification function
function verifyJWT(token: string): { userId: string; email: string; role: string } | null {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  try {
    const decoded = jwt.verify(token, jwtSecret, { 
      issuer: 'torqvio',
      audience: 'torqvio-client'
    });
    
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded as { userId: string; email: string; role: string };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Active SSE connections store
const activeConnections = new Map<string, {
  response: Response;
  workflowId?: string;
  eventTypes?: string[];
  lastHeartbeat: number;
}>();

// Heartbeat interval
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Clean up closed connections
function cleanupConnection(connectionId: string) {
  const connection = activeConnections.get(connectionId);
  if (connection) {
    try {
      connection.response.end();
    } catch (error) {
      // Connection already closed
    }
    activeConnections.delete(connectionId);
    logger.info(`SSE connection cleaned up: ${connectionId}`);
  }
}

// Send heartbeat to all connections
function sendHeartbeats(): void {
  const now = Date.now();
  activeConnections.forEach((connection, connectionId) => {
    try {
      // Check if connection is still alive
      if (now - connection.lastHeartbeat > HEARTBEAT_INTERVAL * 2) {
        cleanupConnection(connectionId);
        return;
      }

      // Send heartbeat
      connection.response.write(`data: ${JSON.stringify({
        event: 'heartbeat',
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      logger.error(`Failed to send heartbeat to ${connectionId}:`, error);
      cleanupConnection(connectionId);
    }
  });
}

// Start heartbeat interval
setInterval(sendHeartbeats, HEARTBEAT_INTERVAL);

// Broadcast event to relevant connections
export function broadcastEvent(event: any): void {
  activeConnections.forEach((connection, connectionId) => {
    try {
      // Filter by workflow_id if specified
      if (connection.workflowId && event.workflow_id !== connection.workflowId) {
        return;
      }

      // Filter by event_types if specified
      if (connection.eventTypes && !connection.eventTypes.includes(event.event)) {
        return;
      }

      // Send event
      connection.response.write(`data: ${JSON.stringify(event)}\n\n`);
      connection.lastHeartbeat = Date.now();
    } catch (error) {
      logger.error(`Failed to broadcast event to ${connectionId}:`, error);
      cleanupConnection(connectionId);
    }
  });
}

/**
 * GET /api/v1/events/stream
 * Server-Sent Events endpoint for real-time workflow events
 */
router.get('/events/stream', async (req: Request, res: Response) => {
  try {
    // Verify JWT authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid JWT token in the Authorization header'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided JWT token is invalid or expired'
      });
    }

    // Check connection limits (10 per user)
    const userConnections = Array.from(activeConnections.values())
      .filter(conn => conn.response.locals.userId === decoded.userId);
    
    if (userConnections.length >= 10) {
      return res.status(429).json({
        error: 'Connection limit exceeded',
        message: 'Maximum 10 concurrent SSE connections allowed per user'
      });
    }

    // Parse query parameters
    const { workflow_id, event_types, step_id } = req.query;
    
    let eventTypesArray: string[] | undefined;
    if (event_types && typeof event_types === 'string') {
      eventTypesArray = event_types.split(',').map(type => type.trim());
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Store user ID for connection tracking
    res.locals.userId = decoded.userId;

    // Generate connection ID
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store connection
    const connectionData: {
      response: Response;
      workflowId?: string;
      eventTypes?: string[];
      lastHeartbeat: number;
    } = {
      response: res,
      lastHeartbeat: Date.now()
    };
    
    if (workflow_id && typeof workflow_id === 'string') {
      connectionData.workflowId = workflow_id;
    }
    
    if (eventTypesArray) {
      connectionData.eventTypes = eventTypesArray;
    }
    
    activeConnections.set(connectionId, connectionData);

    logger.info(`SSE connection established: ${connectionId} for user: ${decoded.userId}`);

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      event: 'connection.established',
      connection_id: connectionId,
      timestamp: new Date().toISOString(),
      filters: {
        workflow_id: workflow_id || null,
        event_types: eventTypesArray || null,
        step_id: step_id || null
      }
    })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
      cleanupConnection(connectionId);
    });

    req.on('aborted', () => {
      cleanupConnection(connectionId);
    });

  } catch (error) {
    logger.error('Error establishing SSE connection:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to establish event stream connection'
    });
  }
});

export default router;
