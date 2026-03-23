#!/usr/bin/env node

import { config } from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';

// Load environment variables from .env file
config();

import { initCommand } from './commands/init.js';
import { deployCommand, statusCommand } from './commands/deploy.js';
import { authCommands } from './commands/auth.js';
import { workflowCommands } from './commands/workflows.js';
import { executionCommands } from './commands/executions.js';
import { configCommands } from './commands/config.js';
import { templateCommands } from './commands/templates.js';
import { bulkCommands } from './commands/bulk.js';
import { envCommands } from './commands/env.js';
import { monitoringCommands } from './commands/monitoring.js';
import { utilityCommands } from './commands/utils.js';
import { createDemoCommand } from './commands/demo.js';
import { pluginCommands } from './commands/plugins.js';
import { hookCommands } from './commands/hooks.js';
import { aliasCommands } from './commands/alias.js';
import { webhookCommands } from './commands/webhooks.js';
import { securityCommands } from './commands/security.js';
import { apiKeysCommands } from './commands/api-keys.js';
import { GlobalOptions } from './types.js';

const program = new Command();

// Global configuration
program
  .name('torqvio')
  .description('Torqvio CLI - Instant workflow deployment')
  .version('2.1.0');

// Global options
program
  .option('--debug', 'Enable debug mode for detailed logging')
  .option('--verbose', 'Enable verbose output')
  .option('--config <path>', 'Specify configuration file path', '~/.torqvio.yaml')
  .option('--api-url <url>', 'Specify API URL', process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:8459')
  .option('--workspace <name>', 'Specify workspace name')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts() as GlobalOptions;
    if (options.debug) {
      console.log(chalk.blue('[DEBUG] Command:'), thisCommand.name());
      console.log(chalk.blue('[DEBUG] Options:'), JSON.stringify(options, null, 2));
    }
  });

// Add existing commands
program.addCommand(initCommand);
program.addCommand(deployCommand);
program.addCommand(statusCommand);
program.addCommand(createDemoCommand());

// Add new command groups
program.addCommand(authCommands);
program.addCommand(workflowCommands);
program.addCommand(executionCommands);
program.addCommand(configCommands);
program.addCommand(templateCommands);
program.addCommand(bulkCommands);
program.addCommand(envCommands);
program.addCommand(monitoringCommands);
program.addCommand(utilityCommands);
program.addCommand(pluginCommands);
program.addCommand(hookCommands);
program.addCommand(aliasCommands);
program.addCommand(webhookCommands);
program.addCommand(securityCommands);
program.addCommand(apiKeysCommands);

// Parse and execute
program.parse();
