#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import { loadConfig } from './config.js';
import { GlobalOptions } from '../types.js';

const webhookCommands = new Command('webhooks');

webhookCommands
  .description('Webhook management commands for Torqvio');

// Add webhook command
webhookCommands
  .command('add')
  .description('Add a new webhook endpoint')
  .option('--name <name>', 'Webhook name for identification')
  .option('--url <url>', 'Webhook endpoint URL')
  .option('--secret <secret>', 'Webhook secret for signature verification')
  .option('--events <events>', 'Comma-separated list of events to subscribe to', 'workflow.started,workflow.completed,workflow.failed')
  .option('--active <active>', 'Whether webhook is active', 'true')
  .action(async (options: {
    name?: string;
    url?: string;
    secret?: string;
    events?: string;
    active?: string;
  }) => {
    console.log(chalk.blue.bold('🪝 Adding Webhook'));
    
    try {
      const { config } = loadConfig();
      
      // Interactive prompts for missing options
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Webhook name:',
          when: !options.name,
          validate: (input) => input.trim() !== '' || 'Name is required'
        },
        {
          type: 'input',
          name: 'url',
          message: 'Webhook URL:',
          when: !options.url,
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        },
        {
          type: 'password',
          name: 'secret',
          message: 'Webhook secret (leave empty to auto-generate):',
          when: !options.secret
        },
        {
          type: 'checkbox',
          name: 'events',
          message: 'Select events to subscribe to:',
          when: !options.events,
          choices: [
            { name: 'Workflow Started', value: 'workflow.started' },
            { name: 'Workflow Completed', value: 'workflow.completed' },
            { name: 'Workflow Failed', value: 'workflow.failed' },
            { name: 'System Maintenance', value: 'system.maintenance' },
            { name: 'Resource Alerts', value: 'system.resource_alert' }
          ]
        },
        {
          type: 'confirm',
          name: 'active',
          message: 'Activate webhook?',
          when: !options.active,
          default: true
        }
      ]);

      const webhookData = {
        name: options.name || answers.name,
        url: options.url || answers.url,
        secret: options.secret || answers.secret,
        events: options.events ? options.events.split(',').map((e: string) => e.trim()) : answers.events,
        active: options.active ? options.active === 'true' : answers.active
      };

      console.log(chalk.gray('Creating webhook...'));

      // Call API to create webhook
      const response = await axios.post(`${config.api.url}/api/v1/webhooks`, webhookData, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.webhook) {
        const webhook = response.data.webhook;
        console.log(chalk.green('✅ Webhook created successfully!'));
        console.log(chalk.white('Webhook Details:'));
        console.log(chalk.gray(`  ID: ${webhook.id}`));
        console.log(chalk.gray(`  Name: ${webhookData.name}`));
        console.log(chalk.gray(`  URL: ${webhook.url}`));
        console.log(chalk.gray(`  Events: ${webhook.events.join(', ')}`));
        console.log(chalk.gray(`  Active: ${webhook.active}`));
        if (webhook.secret) {
          console.log(chalk.yellow(`  Secret: ${webhook.secret} (save this securely!)`));
        }
      }

    } catch (error: any) {
      console.error(chalk.red('❌ Failed to add webhook:'), error.response?.data?.message || error.message);
      process.exit(1);
    }
  });

// List webhooks command
webhookCommands
  .command('list')
  .description('List all webhooks')
  .option('--format <format>', 'Output format (table, json)', 'table')
  .action(async (options: { format?: string }) => {
    console.log(chalk.blue.bold('📋 Webhooks List'));
    
    try {
      const { config } = loadConfig();
      
      const response = await axios.get(`${config.api.url}/api/v1/webhooks`, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`
        }
      });

      const webhooks = response.data.webhooks || [];

      if (webhooks.length === 0) {
        console.log(chalk.yellow('⚠️  No webhooks found'));
        return;
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(webhooks, null, 2));
      } else {
        console.log(chalk.white(`Found ${webhooks.length} webhook(s):\n`));
        
        webhooks.forEach((webhook: any, index: number) => {
          console.log(chalk.cyan(`${index + 1}. ${webhook.id}`));
          console.log(chalk.gray(`   URL: ${webhook.url}`));
          console.log(chalk.gray(`   Events: ${webhook.events?.join(', ') || 'N/A'}`));
          console.log(chalk.gray(`   Active: ${webhook.active ? '✅' : '❌'}`));
          console.log(chalk.gray(`   Created: ${new Date(webhook.created_at).toLocaleDateString()}`));
          console.log('');
        });
      }

    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list webhooks:'), error.response?.data?.message || error.message);
      process.exit(1);
    }
  });

// Test webhook command
webhookCommands
  .command('test')
  .description('Test a webhook endpoint')
  .option('--name <name>', 'Webhook name or ID to test')
  .option('--event <event>', 'Event type to test', 'workflow.started')
  .option('--data <data>', 'Custom test data (JSON string)')
  .action(async (options: {
    name?: string;
    event?: string;
    data?: string;
  }) => {
    console.log(chalk.blue.bold('🧪 Testing Webhook'));
    
    try {
      const { config } = loadConfig();
      
      let webhookId = options.name;
      
      // If no webhook specified, let user choose
      if (!webhookId) {
        const response = await axios.get(`${config.api.url}/api/v1/webhooks`, {
          headers: {
            'Authorization': `Bearer ${config.auth?.api_key}`
          }
        });

        const webhooks = response.data.webhooks || [];
        
        if (webhooks.length === 0) {
          console.log(chalk.yellow('⚠️  No webhooks found to test'));
          return;
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'webhookId',
            message: 'Select webhook to test:',
            choices: webhooks.map((w: any) => ({
              name: `${w.url} (${w.events?.join(', ')})`,
              value: w.id
            }))
          }
        ]);
        
        webhookId = answer.webhookId;
      }

      console.log(chalk.gray(`Testing webhook: ${webhookId}`));

      // Call API to test webhook
      const response = await axios.post(`${config.api.url}/api/v1/webhooks/${webhookId}/test`, {
        event: options.event,
        data: options.data ? JSON.parse(options.data) : null
      }, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;
      
      console.log(chalk.green('✅ Test webhook sent!'));
      console.log(chalk.white('Test Event:'));
      console.log(chalk.gray(`  Event: ${result.test_event.event}`));
      console.log(chalk.gray(`  Workflow ID: ${result.test_event.workflow_id}`));
      console.log(chalk.gray(`  Timestamp: ${result.test_event.timestamp}`));
      
      console.log(chalk.white('\nDelivery Result:'));
      if (result.delivery_result.success) {
        console.log(chalk.green(`  ✅ Success - HTTP ${result.delivery_result.status_code}`));
      } else {
        console.log(chalk.red(`  ❌ Failed: ${result.delivery_result.error}`));
      }

    } catch (error: any) {
      console.error(chalk.red('❌ Failed to test webhook:'), error.response?.data?.message || error.message);
      process.exit(1);
    }
  });

// Update webhook command
webhookCommands
  .command('update')
  .description('Update an existing webhook')
  .option('--name <name>', 'Webhook name or ID to update')
  .option('--url <url>', 'New webhook URL')
  .option('--secret <secret>', 'New webhook secret')
  .option('--events <events>', 'Comma-separated list of events')
  .option('--active <active>', 'Activate/deactivate webhook')
  .action(async (options: {
    name?: string;
    url?: string;
    secret?: string;
    events?: string;
    active?: string;
  }) => {
    console.log(chalk.blue.bold('🔄 Updating Webhook'));
    
    try {
      const { config } = loadConfig();
      
      let webhookId = options.name;
      
      // If no webhook specified, let user choose
      if (!webhookId) {
        const response = await axios.get(`${config.api.url}/api/v1/webhooks`, {
          headers: {
            'Authorization': `Bearer ${config.auth?.api_key}`
          }
        });

        const webhooks = response.data.webhooks || [];
        
        if (webhooks.length === 0) {
          console.log(chalk.yellow('⚠️  No webhooks found to update'));
          return;
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'webhookId',
            message: 'Select webhook to update:',
            choices: webhooks.map((w: any) => ({
              name: `${w.url} (${w.events?.join(', ')})`,
              value: w.id
            }))
          }
        ]);
        
        webhookId = answer.webhookId;
      }

      // Build update payload
      const updateData: any = {};
      
      if (options.url) updateData.url = options.url;
      if (options.secret) updateData.secret = options.secret;
      if (options.events) updateData.events = options.events.split(',').map((e: string) => e.trim());
      if (options.active !== undefined) updateData.active = options.active === 'true';

      // Interactive prompts for missing critical info
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'New webhook URL (leave empty to keep current):',
          when: !options.url,
          validate: (input) => {
            if (!input.trim()) return true; // Optional
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        },
        {
          type: 'password',
          name: 'secret',
          message: 'New webhook secret (leave empty to keep current):',
          when: !options.secret
        },
        {
          type: 'checkbox',
          name: 'events',
          message: 'Select events (leave empty to keep current):',
          when: !options.events,
          choices: [
            { name: 'Workflow Started', value: 'workflow.started' },
            { name: 'Workflow Completed', value: 'workflow.completed' },
            { name: 'Workflow Failed', value: 'workflow.failed' },
            { name: 'System Maintenance', value: 'system.maintenance' },
            { name: 'Resource Alerts', value: 'system.resource_alert' }
          ]
        },
        {
          type: 'confirm',
          name: 'active',
          message: 'Activate webhook?',
          when: options.active === undefined,
          default: true
        }
      ]);

      // Add interactive answers to update data
      if (answers.url) updateData.url = answers.url;
      if (answers.secret !== undefined) updateData.secret = answers.secret;
      if (answers.events && answers.events.length > 0) updateData.events = answers.events;
      if (answers.active !== undefined) updateData.active = answers.active;

      if (Object.keys(updateData).length === 0) {
        console.log(chalk.yellow('⚠️  No changes specified'));
        return;
      }

      console.log(chalk.gray('Updating webhook...'));

      // Call API to update webhook
      const response = await axios.patch(`${config.api.url}/api/v1/webhooks/${webhookId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.webhook) {
        const webhook = response.data.webhook;
        console.log(chalk.green('✅ Webhook updated successfully!'));
        console.log(chalk.white('Updated Details:'));
        console.log(chalk.gray(`  ID: ${webhook.id}`));
        console.log(chalk.gray(`  URL: ${webhook.url}`));
        console.log(chalk.gray(`  Events: ${webhook.events?.join(', ') || 'N/A'}`));
        console.log(chalk.gray(`  Active: ${webhook.active}`));
        if (response.data.secret) {
          console.log(chalk.yellow(`  New Secret: ${response.data.secret} (save this securely!)`));
        }
      }

    } catch (error: any) {
      console.error(chalk.red('❌ Failed to update webhook:'), error.response?.data?.message || error.message);
      process.exit(1);
    }
  });

// Delete webhook command
webhookCommands
  .command('delete')
  .description('Delete a webhook')
  .option('--name <name>', 'Webhook name or ID to delete')
  .option('--force', 'Force delete without confirmation')
  .action(async (options: { name?: string; force?: boolean }) => {
    console.log(chalk.blue.bold('🗑️  Deleting Webhook'));
    
    try {
      const { config } = loadConfig();
      
      let webhookId = options.name;
      
      // If no webhook specified, let user choose
      if (!webhookId) {
        const response = await axios.get(`${config.api.url}/api/v1/webhooks`, {
          headers: {
            'Authorization': `Bearer ${config.auth?.api_key}`
          }
        });

        const webhooks = response.data.webhooks || [];
        
        if (webhooks.length === 0) {
          console.log(chalk.yellow('⚠️  No webhooks found to delete'));
          return;
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'webhookId',
            message: 'Select webhook to delete:',
            choices: webhooks.map((w: any) => ({
              name: `${w.url} (${w.events?.join(', ')})`,
              value: w.id
            }))
          }
        ]);
        
        webhookId = answer.webhookId;
      }

      // Get webhook details for confirmation
      const webhookResponse = await axios.get(`${config.api.url}/api/v1/webhooks/${webhookId}`, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`
        }
      });

      const webhook = webhookResponse.data;

      // Confirmation prompt
      if (!options.force) {
        const confirm = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: `Are you sure you want to delete webhook "${webhook.url}"?`,
            default: false
          }
        ]);

        if (!confirm.confirmed) {
          console.log(chalk.yellow('❌ Delete cancelled'));
          return;
        }
      }

      console.log(chalk.gray('Deleting webhook...'));

      // Call API to delete webhook
      await axios.delete(`${config.api.url}/api/v1/webhooks/${webhookId}`, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`
        }
      });

      console.log(chalk.green('✅ Webhook deleted successfully!'));

    } catch (error: any) {
      console.error(chalk.red('❌ Failed to delete webhook:'), error.response?.data?.message || error.message);
      process.exit(1);
    }
  });

// Stats command
webhookCommands
  .command('stats')
  .description('Show webhook statistics')
  .action(async () => {
    console.log(chalk.blue.bold('📊 Webhook Statistics'));
    
    try {
      const { config } = loadConfig();
      
      const response = await axios.get(`${config.api.url}/api/v1/webhooks/stats`, {
        headers: {
          'Authorization': `Bearer ${config.auth?.api_key}`
        }
      });

      const stats = response.data;
      
      console.log(chalk.white('Overview:'));
      console.log(chalk.gray(`  Total Webhooks: ${stats.total_webhooks}`));
      console.log(chalk.green(`  Active Webhooks: ${stats.active_webhooks}`));
      console.log(chalk.red(`  Inactive Webhooks: ${stats.inactive_webhooks}`));
      console.log(chalk.blue(`  Created (24h): ${stats.created_last_24h}`));
      console.log(chalk.cyan(`  Created (7d): ${stats.created_last_7d}`));
      console.log(chalk.yellow(`  Test Webhooks: ${stats.test_webhooks}`));
      console.log(chalk.gray(`  Updated: ${new Date(stats.timestamp).toLocaleString()}`));

    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get webhook stats:'), error.response?.data?.message || error.message);
      process.exit(1);
    }
  });

export { webhookCommands };
