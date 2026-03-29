import { DatabaseConnection } from '../database/connection.js';
import { 
  FlowDefinition, 
  FlowExecution, 
  ExecutionStatus, 
  CreateFlowRequest, 
  UpdateFlowRequest,
  ListFlowsQuery,
  ListExecutionsQuery,
  ApiResponse,
  ResponseMeta
} from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Repository pattern for Flow database operations
 */
export class FlowRepository {
  private db = DatabaseConnection.getInstance();

  /**
   * Create a new flow
   */
  async create(flowData: CreateFlowRequest, projectId: string): Promise<FlowDefinition> {
    try {
      const result = await this.db.query(
        `INSERT INTO flows (name, definition, project_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [flowData.name, JSON.stringify(flowData), projectId]
      );

      const flow = this.mapRowToFlow(result[0]);
      logger.info(`Flow created: ${flow.name}`, { flowId: flow.id });
      return flow;
    } catch (error) {
      logger.error('Failed to create flow:', error);
      throw error;
    }
  }you

  /**
   * Get flow by ID
   */
  async findById(id: string, projectId?: string): Promise<FlowDefinition | null> {
    try {
      let query = 'SELECT id, name, definition, project_id, status, created_at, updated_at, tags, version FROM flows WHERE id = $1';
      const params = [id];

      if (projectId) {
        query += ' AND project_id = $2';
        params.push(projectId);
      }

      const result = await this.db.query(query, params);
      return result.length > 0 ? this.mapRowToFlow(result[0]) : null;
    } catch (error) {
      logger.error('Failed to find flow by ID:', error);
      throw error;
    }
  }

  /**
   * Get flow by name
   */
  async findByName(name: string, projectId?: string): Promise<FlowDefinition | null> {
    try {
      let query = 'SELECT id, name, definition, project_id, status, created_at, updated_at, tags, version FROM flows WHERE name = $1';
      const params = [name];

      if (projectId) {
        query += ' AND project_id = $2';
        params.push(projectId);
      }

      const result = await this.db.query(query, params);
      return result.length > 0 ? this.mapRowToFlow(result[0]) : null;
    } catch (error) {
      logger.error('Failed to find flow by name:', error);
      throw error;
    }
  }

  /**
   * List flows with filtering and pagination
   */
  async list(query: ListFlowsQuery, projectId?: string): Promise<{ flows: FlowDefinition[]; meta: ResponseMeta }> {
    try {
      let whereClause = '';
      const params: any[] = [];
      let paramIndex = 1;

      // Build WHERE clause
      const conditions: string[] = [];

      if (projectId) {
        conditions.push(`project_id = $${paramIndex++}`);
        params.push(projectId);
      }

      if (query.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(query.status);
      }

      if (query.search) {
        conditions.push(`(websearch_to_tsquery('simple', $${paramIndex++}) @@ definition || name ILIKE $${paramIndex++})`);
        params.push(query.search, `%${query.search}%`);
        paramIndex++;
      }

      if (query.tags && query.tags.length > 0) {
        conditions.push(`tags && $${paramIndex++}`);
        params.push(query.tags);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Build ORDER BY clause
      const orderBy = query.sort_by || 'created_at';
      const sortOrder = query.sort_order || 'desc';
      const orderClause = `ORDER BY ${orderBy} ${sortOrder.toUpperCase()}`;

      // Cursor-based pagination instead of OFFSET
      const limit = Math.min(query.limit || 50, 100); // Max 100
      let cursorClause = '';
      
      if (query.cursor) {
        if (sortOrder === 'desc') {
          cursorClause = ` AND ${orderBy} < $${paramIndex++}`;
        } else {
          cursorClause = ` AND ${orderBy} > $${paramIndex++}`;
        }
        params.push(query.cursor);
      }
      
      params.push(limit);

      // Get total count (can be cached in production)
      const countQuery = `SELECT COUNT(*) as total FROM flows ${whereClause}`;
      const countResult = await this.db.query(countQuery, params.slice(0, -1)); // Remove limit from count
      const total = parseInt(countResult[0].total);

      // Get flows with cursor-based pagination
      const flowsQuery = `SELECT id, name, definition, project_id, status, created_at, updated_at, tags, version FROM flows ${whereClause}${cursorClause} ${orderClause} LIMIT $${paramIndex}`;

      const result = await this.db.query(flowsQuery, params);
      const flows = result.map(row => this.mapRowToFlow(row));

      // Generate pagination metadata
      const hasMore = flows.length === limit;
      const nextCursor = hasMore && flows.length > 0 ? flows[flows.length - 1][orderBy] : null;
      const prevCursor = flows.length > 0 ? flows[0][orderBy] : null;

      const meta: ResponseMeta = {
        limit,
        total,
        count: flows.length,
        hasMore,
        nextCursor,
        prevCursor,
        cursor: query.cursor
      };

      return { flows, meta };
    } catch (error) {
      logger.error('Failed to list flows:', error);
      throw error;
    }
  }

  /**
   * Update a flow
   */
  async update(id: string, updateData: UpdateFlowRequest, projectId?: string): Promise<FlowDefinition> {
    try {
      const setClause: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updateData.name !== undefined) {
        setClause.push(`name = $${paramIndex++}`);
        params.push(updateData.name);
      }

      if (updateData.definition !== undefined) {
        setClause.push(`definition = $${paramIndex++}`);
        params.push(JSON.stringify(updateData.definition));
      }

      if (updateData.status !== undefined) {
        setClause.push(`status = $${paramIndex++}`);
        params.push(updateData.status);
      }

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      setClause.push(`updated_at = NOW()`);

      let query = `UPDATE flows SET ${setClause.join(', ')} WHERE id = $${paramIndex++}`;
      params.push(id);

      if (projectId) {
        query += ` AND project_id = $${paramIndex++}`;
        params.push(projectId);
      }

      query += ' RETURNING id, name, definition, project_id, status, created_at, updated_at, tags, version';

      const result = await this.db.query(query, params);

      if (result.length === 0) {
        throw new Error('Flow not found or access denied');
      }

      const flow = this.mapRowToFlow(result[0]);
      logger.info(`Flow updated: ${flow.id}`, { flowId: flow.id });
      return flow;
    } catch (error) {
      logger.error('Failed to update flow:', error);
      throw error;
    }
  }

  /**
   * Delete a flow
   */
  async delete(id: string, projectId?: string): Promise<void> {
    try {
      let query = 'DELETE FROM flows WHERE id = $1';
      const params = [id];

      if (projectId) {
        query += ' AND project_id = $2';
        params.push(projectId);
      }

      const result = await this.db.query(query, params);

      if (result.rowCount === 0) {
        throw new Error('Flow not found or access denied');
      }

      logger.info(`Flow deleted: ${id}`, { flowId: id });
    } catch (error) {
      logger.error('Failed to delete flow:', error);
      throw error;
    }
  }

  /**
   * Check if flow exists
   */
  async exists(id: string, projectId?: string): Promise<boolean> {
    try {
      let query = 'SELECT 1 FROM flows WHERE id = $1';
      const params = [id];

      if (projectId) {
        query += ' AND project_id = $2';
        params.push(projectId);
      }

      const result = await this.db.query(query, params);
      return result.length > 0;
    } catch (error) {
      logger.error('Failed to check flow existence:', error);
      throw error;
    }
  }

  /**
   * Map database row to Flow object
   */
  private mapRowToFlow(row: any): FlowDefinition {
    return {
      id: row.id,
      name: row.name,
      definition: typeof row.definition === 'string' ? this.parseJsonSafely(row.definition) : row.definition,
      project_id: row.project_id,
      status: row.status || 'active',
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags: row.tags || [],
      version: row.version || 1
    };
  }

  private parseJsonSafely(json: string | object): any {
    if (typeof json === 'object') return json;
    try {
      return JSON.parse(json);
    } catch (error) {
      logger.warn('Failed to parse JSON:', error);
      return {};
    }
  }
}

/**
 * Repository pattern for FlowExecution database operations
 */
export class FlowExecutionRepository {
  private db = DatabaseConnection.getInstance();

  /**
   * Create a new execution
   */
  async create(flowId: string, payload: Record<string, any> = {}): Promise<FlowExecution> {
    try {
      const result = await this.db.query(
        `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
         VALUES ($1, 'pending', $2, NOW(), NOW())
         RETURNING *`,
        [flowId, JSON.stringify(payload)]
      );

      const execution = this.mapRowToExecution(result[0]);
      logger.info(`Execution created: ${execution.id}`, { executionId: execution.id, flowId });
      return execution;
    } catch (error) {
      logger.error('Failed to create execution:', error);
      throw error;
    }
  }

  /**
   * Get execution by ID
   */
  async findById(id: string): Promise<FlowExecution | null> {
    try {
      const result = await this.db.query(
        'SELECT id, flow_id, status, payload, context, results, error, created_at, updated_at, started_at, completed_at, next_run_at, triggered_by, trigger_metadata FROM flow_executions WHERE id = $1',
        [id]
      );

      return result.length > 0 ? this.mapRowToExecution(result[0]) : null;
    } catch (error) {
      logger.error('Failed to find execution by ID:', error);
      throw error;
    }
  }

  /**
   * List executions with filtering and pagination
   */
  async list(query: ListExecutionsQuery): Promise<{ executions: FlowExecution[]; meta: ResponseMeta }> {
    try {
      let whereClause = '';
      const params: any[] = [];
      let paramIndex = 1;

      const conditions: string[] = [];

      if (query.flow_id) {
        conditions.push(`flow_id = $${paramIndex++}`);
        params.push(query.flow_id);
      }

      if (query.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(query.status);
      }

      if (query.started_after) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(query.started_after);
      }

      if (query.started_before) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(query.started_before);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM flow_executions ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = parseInt(countResult[0].total);

      // Cursor-based pagination instead of OFFSET
      const limit = Math.min(query.limit || 50, 100);
      let cursorClause = '';
      
      if (query.cursor) {
        cursorClause = ` AND created_at < $${paramIndex++}`;
        params.push(query.cursor);
      }
      
      params.push(limit);

      // Get executions with specific columns
      const executionsQuery = `
        SELECT id, flow_id, status, payload, context, results, error, created_at, updated_at, started_at, completed_at, next_run_at, triggered_by, trigger_metadata
        FROM flow_executions 
        ${whereClause}${cursorClause} 
        ORDER BY created_at DESC 
        LIMIT $${paramIndex}
      `;

      const result = await this.db.query(executionsQuery, params);
      const executions = result.map(row => this.mapRowToExecution(row));

      // Generate pagination metadata
      const hasMore = executions.length === limit;
      const nextCursor = hasMore && executions.length > 0 ? executions[executions.length - 1].created_at : null;

      const meta: ResponseMeta = {
        limit,
        total,
        count: executions.length,
        hasMore,
        nextCursor,
        cursor: query.cursor
      };

      return { executions, meta };
    } catch (error) {
      logger.error('Failed to list executions:', error);
      throw error;
    }
  }

  /**
   * Update execution status
   */
  async updateStatus(id: string, status: ExecutionStatus): Promise<void> {
    try {
      await this.db.query(
        'UPDATE flow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, id]
      );

      logger.debug(`Execution status updated: ${id} -> ${status}`, { executionId: id, status });
    } catch (error) {
      logger.error('Failed to update execution status:', error);
      throw error;
    }
  }

  /**
   * Update execution with results
   */
  async updateResults(id: string, results: Record<string, any>, status: ExecutionStatus): Promise<void> {
    try {
      await this.db.query(
        `UPDATE flow_executions 
         SET status = $1, results = $2, completed_at = NOW(), updated_at = NOW() 
         WHERE id = $3`,
        [status, JSON.stringify(results), id]
      );

      logger.info(`Execution results updated: ${id}`, { executionId: id, status });
    } catch (error) {
      logger.error('Failed to update execution results:', error);
      throw error;
    }
  }

  /**
   * Update execution with error
   */
  async updateError(id: string, error: Error, status: ExecutionStatus = 'failed'): Promise<void> {
    try {
      await this.db.query(
        `UPDATE flow_executions 
         SET status = $1, error = $2, completed_at = NOW(), updated_at = NOW() 
         WHERE id = $3`,
        [status, error.message, id]
      );

      logger.error(`Execution error updated: ${id}`, { executionId: id, error: error.message });
    } catch (error) {
      logger.error('Failed to update execution error:', error);
      throw error;
    }
  }

  /**
   * Get executions by flow ID
   */
  async findByFlowId(flowId: string, limit: number = 50): Promise<FlowExecution[]> {
    try {
      const limitedCount = Math.min(limit, 100); // Max 100 for safety
      const result = await this.db.query(
        'SELECT id, flow_id, status, payload, context, results, error, created_at, updated_at, started_at, completed_at, next_run_at, triggered_by, trigger_metadata FROM flow_executions WHERE flow_id = $1 ORDER BY created_at DESC LIMIT $2',
        [flowId, limitedCount]
      );

      return result.map(row => this.mapRowToExecution(row));
    } catch (error) {
      logger.error('Failed to find executions by flow ID:', error);
      throw error;
    }
  }

  /**
   * Map database row to FlowExecution object
   */
  private mapRowToExecution(row: any): FlowExecution {
    return {
      id: row.id,
      flowId: row.flow_id,
      status: row.status as ExecutionStatus,
      payload: this.parseJsonSafely(row.payload),
      context: this.parseJsonSafely(row.context),
      results: row.results ? this.parseJsonSafely(row.results) : undefined,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      nextRunAt: row.next_run_at
    };
  }

  private parseJsonSafely(json: string | object | null): any {
    if (!json) return {};
    if (typeof json === 'object') return json;
    try {
      return JSON.parse(json);
    } catch (error) {
      logger.warn('Failed to parse JSON in execution:', error);
      return {};
    }
  }
}
