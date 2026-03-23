#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadConfig, saveConfig, setNestedProperty, getNestedProperty } from './config.js';

const aliasCommands = new Command('alias');

aliasCommands
  .description('Alias management commands');

// List aliases command
aliasCommands
  .command('list')
  .description('List all aliases')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🏷️ Command Aliases'));
    
    try {
      const { config } = loadConfig();
      
      // Get aliases from configuration or use defaults
      const aliases = config.aliases || {
        'ls': 'workflows list',
        'run': 'workflows run',
        'list': 'workflows list',
        'status': 'executions list',
        'logs': 'executions list --status running',
        'cfg': 'config',
        'env': 'env current',
        'wf': 'workflows',
        'ex': 'executions',
        'h': 'help'
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(aliases, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Aliases');
        Object.entries(aliases).forEach(([name, command]) => {
          console.log(`${name}: ${command}`);
        });
      } else {
        console.log(chalk.white('Found'), chalk.green(Object.keys(aliases).length), chalk.white('aliases'));
        console.log();
        
        Object.entries(aliases).forEach(([name, command]) => {
          console.log(chalk.white(name.padEnd(15)) + chalk.gray(`→ ${command}`));
        });
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list aliases:'), error.message);
      process.exit(1);
    }
  });

// Create alias command
aliasCommands
  .command('create <alias-name> <command>')
  .description('Create a new alias')
  .option('--overwrite', 'Overwrite existing alias')
  .action(async (aliasName: string, command: string, options: any) => {
    console.log(chalk.blue.bold(`➕ Creating Alias: ${aliasName}`));
    
    try {
      const { config } = loadConfig();
      
      // Initialize aliases configuration if it doesn't exist
      if (!config.aliases) {
        setNestedProperty(config, 'aliases', {});
      }
      
      if (config.aliases![aliasName] && !options.overwrite) {
        console.error(chalk.red(`❌ Alias '${aliasName}' already exists. Use --overwrite to replace.`));
        process.exit(1);
      }
      
      // Add the alias
      setNestedProperty(config, `aliases.${aliasName}`, command);
      
      // Save configuration
      saveConfig(config);
      
      console.log(chalk.green(`✅ Alias '${aliasName}' created successfully`));
      console.log(chalk.gray(`Command: torqvio ${command}`));
      console.log(chalk.gray(`Usage: torqvio ${aliasName}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to create alias:'), error.message);
      process.exit(1);
    }
  });

// Remove alias command
aliasCommands
  .command('remove <alias-name>')
  .description('Remove an alias')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (aliasName: string, options: any) => {
    console.log(chalk.blue.bold(`🗑️ Removing Alias: ${aliasName}`));
    
    try {
      const { config } = loadConfig();
      
      if (!config.aliases || !config.aliases[aliasName]) {
        console.log(chalk.yellow(`⚠️  Alias '${aliasName}' not found`));
        return;
      }
      
      if (!options.confirm) {
        const inquirer = await import('inquirer');
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to remove alias '${aliasName}'?`,
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log(chalk.yellow('❌ Removal cancelled'));
          return;
        }
      }
      
      // Remove the alias
      delete config.aliases[aliasName];
      
      // Save configuration
      saveConfig(config);
      
      console.log(chalk.green(`✅ Alias '${aliasName}' removed successfully`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to remove alias:'), error.message);
      process.exit(1);
    }
  });

// Show alias command
aliasCommands
  .command('show <alias-name>')
  .description('Show details of an alias')
  .action(async (aliasName: string) => {
    console.log(chalk.blue.bold(`🔍 Alias Details: ${aliasName}`));
    
    try {
      const { config } = loadConfig();
      
      if (!config.aliases || !config.aliases[aliasName]) {
        console.log(chalk.yellow(`⚠️  Alias '${aliasName}' not found`));
        return;
      }
      
      console.log(chalk.white('Name:'), chalk.green(aliasName));
      console.log(chalk.white('Command:'), chalk.gray(`torqvio ${config.aliases[aliasName]}`));
      console.log(chalk.white('Usage:'), chalk.gray(`torqvio ${aliasName}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to show alias:'), error.message);
      process.exit(1);
    }
  });

export { aliasCommands };
