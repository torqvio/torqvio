import config from './config.js';
import { logger } from '../utils/logger.js';

export type TorqvioConfig = typeof config;

export function loadConfig(): TorqvioConfig {
  try {
    // Validate required config
    if (!config.database.url) {
      throw new Error('DATABASE_URL is required');
    }
    
    if (!config.server.port) {
      throw new Error('Server port is required');
    }
    
    logger.info('✅ Configuration loaded successfully');
    return config;
  } catch (error) {
    logger.error('❌ Failed to load configuration:', error);
    throw error;
  }
}

export const appConfig = loadConfig();
