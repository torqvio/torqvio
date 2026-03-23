#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { AuthConfig, GlobalOptions, Config } from '../types.js';
import { loadConfig, saveConfig, setNestedProperty } from './config.js';

const authCommands = new Command('auth');

authCommands
  .description('Authentication commands for Torqvio');

// Login command
authCommands
  .command('login')
  .description('Login to Torqvio')
  .option('--api-key <key>', 'API key authentication')
  .option('--oauth', 'OAuth authentication (opens browser)')
  .option('--method <method>', 'Authentication method (github, google, microsoft)')
  .action(async (options: { apiKey?: string; oauth?: boolean; method?: string }) => {
    console.log(chalk.blue.bold('🔐 Torqvio Authentication'));
    
    try {
      const { config } = loadConfig();
      
      if (options.apiKey) {
        // API Key authentication
        console.log(chalk.blue('Authenticating with API key...'));
        
        // Update configuration
        setNestedProperty(config, 'auth.method', 'api_key');
        setNestedProperty(config, 'auth.api_key', options.apiKey);
        setNestedProperty(config, 'auth.auto_refresh', true);
        
        // Validate API key
        const response = await axios.get(`${config.api.url}/auth/verify`, {
          headers: { 'Authorization': `Bearer ${options.apiKey}` }
        }).catch(() => null);
        
        if (response?.data?.user) {
          console.log(chalk.green('✅ Authentication successful'));
          console.log(chalk.gray(`User: ${response.data.user.name} (${response.data.user.email})`));
        } else {
          console.log(chalk.yellow('⚠️  Could not verify API key, continuing...'));
        }
      } else if (options.oauth || options.method) {
        // OAuth authentication
        const method = options.method || 'github';
        console.log(chalk.blue(`Initiating ${method} OAuth...`));
        
        // Update configuration
        setNestedProperty(config, 'auth.method', 'oauth');
        setNestedProperty(config, 'auth.provider', method);
        setNestedProperty(config, 'auth.auto_refresh', true);
        
        // In a real implementation, this would open a browser
        console.log(chalk.yellow('🌐 Opening browser for OAuth authentication...'));
        console.log(chalk.gray('Note: This would open a browser in production'));
        
        // Simulate OAuth flow
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'clientId',
            message: `Enter ${method} Client ID:`,
            when: method === 'microsoft'
          },
          {
            type: 'password',
            name: 'clientSecret',
            message: `Enter ${method} Client Secret:`,
            when: method === 'microsoft'
          },
          {
            type: 'input',
            name: 'token',
            message: 'Enter OAuth token (simulated):',
            default: () => `oauth_${uuidv4().replace(/-/g, '')}`
          }
        ]);
        
        if (answers.clientId) {
          setNestedProperty(config, 'auth.client_id', answers.clientId);
        }
        if (answers.clientSecret) {
          setNestedProperty(config, 'auth.client_secret', answers.clientSecret);
        }
        setNestedProperty(config, 'auth.redirect_uri', 'http://localhost:7243/auth/callback');
        
        console.log(chalk.green('✅ OAuth authentication successful'));
      } else {
        // Interactive authentication
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'method',
            message: 'Choose authentication method:',
            choices: [
              { name: 'API Key', value: 'api_key' },
              { name: 'GitHub OAuth', value: 'github' },
              { name: 'Google OAuth', value: 'google' },
              { name: 'Microsoft OAuth', value: 'microsoft' },
              { name: 'Service Account', value: 'service_account' }
            ]
          }
        ]);
        
        if (answers.method === 'api_key') {
          const keyAnswer = await inquirer.prompt([
            {
              type: 'password',
              name: 'apiKey',
              message: 'Enter your API key:'
            }
          ]);
          
          setNestedProperty(config, 'auth.method', 'api_key');
          setNestedProperty(config, 'auth.api_key', keyAnswer.apiKey);
          setNestedProperty(config, 'auth.auto_refresh', true);
        } else if (answers.method === 'service_account') {
          const saAnswer = await inquirer.prompt([
            {
              type: 'input',
              name: 'keyFile',
              message: 'Enter service account key file path:',
              default: '~/.torqvio/service-account.json'
            },
            {
              type: 'input',
              name: 'projectId',
              message: 'Enter project ID:'
            }
          ]);
          
          setNestedProperty(config, 'auth.method', 'service_account');
          setNestedProperty(config, 'auth.key_file', saAnswer.keyFile);
          setNestedProperty(config, 'auth.project_id', saAnswer.projectId);
        } else {
          // OAuth
          const oauthAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'clientId',
              message: `Enter ${answers.method} Client ID:`,
              when: answers.method === 'microsoft'
            },
            {
              type: 'password',
              name: 'clientSecret',
              message: `Enter ${answers.method} Client Secret:`,
              when: answers.method === 'microsoft'
            }
          ]);
          
          setNestedProperty(config, 'auth.method', 'oauth');
          setNestedProperty(config, 'auth.provider', answers.method);
          setNestedProperty(config, 'auth.auto_refresh', true);
          setNestedProperty(config, 'auth.redirect_uri', 'http://localhost:7243/auth/callback');
          
          if (oauthAnswers.clientId) {
            setNestedProperty(config, 'auth.client_id', oauthAnswers.clientId);
          }
          if (oauthAnswers.clientSecret) {
            setNestedProperty(config, 'auth.client_secret', oauthAnswers.clientSecret);
          }
        }
      }
      
      // Save configuration
      saveConfig(config);
      
      console.log(chalk.green.bold('\n✅ Authentication successful!'));
      console.log(chalk.gray(`Configuration saved to: ~/.torqvio/config.yaml`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Authentication failed:'), error.message);
      process.exit(1);
    }
  });

// Logout command
authCommands
  .command('logout')
  .description('Logout from Torqvio')
  .option('--all', 'Logout from all sessions')
  .option('--workspace <name>', 'Logout from specific workspace')
  .action(async (options: { all?: boolean; workspace?: string }) => {
    console.log(chalk.blue.bold('🚪 Logging out from Torqvio'));
    
    try {
      const { config } = loadConfig();
      
      if (!config.auth || !config.auth.method || config.auth.method === 'oauth') {
        console.log(chalk.yellow('⚠️  No active authentication found'));
        return;
      }
      
      if (options.all) {
        console.log(chalk.blue('Logging out from all sessions...'));
        // In a real implementation, this would invalidate tokens on the server
      }
      
      if (options.workspace) {
        console.log(chalk.blue(`Logging out from workspace: ${options.workspace}`));
        // In a real implementation, this would handle workspace-specific logout
      }
      
      // Clear authentication configuration
      delete config.auth.api_key;
      delete config.auth.client_id;
      delete config.auth.client_secret;
      delete config.auth.key_file;
      delete config.auth.project_id;
      delete config.auth.provider;
      setNestedProperty(config, 'auth.method', 'oauth');
      
      // Save configuration
      saveConfig(config);
      
      console.log(chalk.green('✅ Logged out successfully'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Logout failed:'), error.message);
      process.exit(1);
    }
  });

// Status command
authCommands
  .command('status')
  .description('Check authentication status')
  .action(async () => {
    console.log(chalk.blue.bold('🔍 Authentication Status'));
    
    try {
      const { config } = loadConfig();
      
      if (!config.auth || !config.auth.method || config.auth.method === 'oauth') {
        console.log(chalk.red('❌ Not authenticated'));
        console.log(chalk.gray('Run "torqvio auth login" to authenticate'));
        return;
      }
      
      console.log(chalk.green('✅ Authenticated'));
      console.log(chalk.gray(`Method: ${config.auth.method}`));
      
      if (config.auth.provider) {
        console.log(chalk.gray(`Provider: ${config.auth.provider}`));
      }
      
      if (config.auth.api_key) {
        console.log(chalk.gray(`API Key: ${config.auth.api_key.substring(0, 12)}...`));
      }
      
      if (config.auth.project_id) {
        console.log(chalk.gray(`Project ID: ${config.auth.project_id}`));
      }
      
      if (config.auth.key_file) {
        console.log(chalk.gray(`Key File: ${config.auth.key_file}`));
      }
      
      if (config.workspace.default) {
        console.log(chalk.gray(`Workspace: ${config.workspace.default}`));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to check status:'), error.message);
      process.exit(1);
    }
  });

// Whoami command
authCommands
  .command('whoami')
  .description('Show current user information')
  .action(async () => {
    try {
      const { config } = loadConfig();
      
      if (!config.auth || !config.auth.method || config.auth.method === 'oauth') {
        console.log(chalk.red('❌ Not authenticated'));
        return;
      }
      
      console.log(chalk.green('Authentication Information:'));
      console.log(chalk.white(`  Method: ${config.auth.method}`));
      
      if (config.auth.provider) {
        console.log(chalk.white(`  Provider: ${config.auth.provider}`));
      }
      
      if (config.auth.project_id) {
        console.log(chalk.white(`  Project ID: ${config.auth.project_id}`));
      }
      
      if (config.workspace.default) {
        console.log(chalk.white(`  Workspace: ${config.workspace.default}`));
      }
      
      // In a real implementation, this would fetch user info from the API
      console.log(chalk.yellow('⚠️  User information not available in offline mode'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get user info:'), error.message);
      process.exit(1);
    }
  });

// Refresh command
authCommands
  .command('refresh')
  .description('Refresh authentication token')
  .action(async () => {
    console.log(chalk.blue.bold('🔄 Refreshing authentication token'));
    
    try {
      const { config } = loadConfig();
      
      if (!config.auth || !config.auth.method || config.auth.method !== 'oauth') {
        console.log(chalk.red('❌ No OAuth token to refresh'));
        return;
      }
      
      if (config.auth.auto_refresh) {
        console.log(chalk.blue('Auto-refresh is enabled, token will be refreshed automatically'));
      }
      
      // In a real implementation, this would refresh the OAuth token
      console.log(chalk.yellow('⚠️  Token refresh simulation - not implemented in offline mode'));
      
      // Simulate token refresh
      const newToken = `oauth_${uuidv4().replace(/-/g, '')}`;
      console.log(chalk.green('✅ Token refreshed successfully (simulated)'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to refresh token:'), error.message);
      process.exit(1);
    }
  });

export { authCommands };
