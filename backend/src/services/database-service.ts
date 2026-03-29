import { DatabaseConnection } from '../database/connection.js';

export interface QueryResult {
  rows: any[];
  rowCount: number;
  command: string;
}

export class DatabaseService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const result = await this.db.query(text, params);
    return {
      rows: result,
      rowCount: result.length,
      command: text.split(' ')[0]?.toUpperCase() || 'UNKNOWN'
    };
  }

  async transaction<T>(callback: (client: DatabaseService) => Promise<T>): Promise<T> {
    // Simple transaction implementation
    // In production, would use proper transaction handling
    return callback(this);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.db.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async close(): Promise<void> {
    // Close connection if needed
  }
}
