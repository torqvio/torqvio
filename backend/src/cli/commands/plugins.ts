#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadConfig, saveConfig, setNestedProperty, getNestedProperty } from './config.js';

const pluginCommands = new Command('plugins');

pluginCommands
  .description('Plugin management commands');

// List plugins command
pluginCommands
  .command('list')
  .description('List installed plugins')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🔌 Installed Plugins'));
    
    try {
      const { config } = loadConfig();
      
      // Get plugins from configuration or use defaults
      const plugins = config.plugins?.plugins || {
        'slack-notifications': {
          enabled: true,
          webhook_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
          version: '1.2.0',
          description: 'Send Slack notifications for workflow events',
          author: 'Torqvio Team'
        },
        'email-templates': {
          enabled: true,
          version: '2.0.1',
          description: 'Professional email templates for workflows',
          author: 'Community'
        },
        'data-validation': {
          enabled: false,
          version: '0.9.5',
          description: 'Advanced data validation rules',
          author: 'Third Party'
        }
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(plugins, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Plugins');
        Object.entries(plugins).forEach(([name, config]) => {
          console.log(`- ${name}:`);
          console.log(`    enabled: ${config.enabled}`);
          if (config.version) console.log(`    version: ${config.version}`);
          if (config.description) console.log(`    description: ${config.description}`);
          if (config.webhook_url) console.log(`    webhook_url: ${config.webhook_url}`);
        });
      } else {
        const pluginList = Object.entries(plugins).map(([name, config]) => ({
          name,
          enabled: config.enabled || false,
          version: (config as any).version,
          description: (config as any).description,
          author: (config as any).author
        }));
        
        console.log(chalk.white('Found'), chalk.green(pluginList.length), chalk.white('plugins'));
        console.log();
        
        pluginList.forEach(plugin => {
          const statusColor = plugin.enabled ? chalk.green : chalk.gray;
          const version = plugin.version ? chalk.gray(`@${plugin.version}`) : '';
          console.log(chalk.white(plugin.name) + version + 
                     statusColor(` (${plugin.enabled ? 'enabled' : 'disabled'})`));
          if (plugin.description) {
            console.log(chalk.gray(`  ${plugin.description}`));
          }
          if (plugin.author) {
            console.log(chalk.gray(`  Author: ${plugin.author}`));
          }
          console.log();
        });
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list plugins:'), error.message);
      process.exit(1);
    }
  });

// Install plugin command
pluginCommands
  .command('install <plugin-name>')
  .description('Install a plugin')
  .option('--version <version>', 'Specific version to install')
  .option('--force', 'Force install even if already exists')
  .action(async (pluginName: string, options: any) => {
    console.log(chalk.blue.bold(`📦 Installing Plugin: ${pluginName}`));
    
    try {
      const { config } = loadConfig();
      
      // Initialize plugins configuration if it doesn't exist
      if (!config.plugins) {
        setNestedProperty(config, 'plugins', {
          enabled: true,
          directory: '~/.torqvio/plugins',
          plugins: {}
        });
        // Reload config to get the updated structure
        const { config: updatedConfig } = loadConfig();
        config.plugins = updatedConfig.plugins;
      }
      
      if (!config.plugins!.plugins) {
        config.plugins!.plugins = {};
      }
      
      // Check if plugin already exists
      if (config.plugins!.plugins[pluginName] && !options.force) {
        console.log(chalk.yellow(`⚠️ Plugin ${pluginName} is already installed. Use --force to reinstall.`));
        return;
      }
      
      console.log(chalk.gray('Downloading plugin...'));
      
      // Simulate installation process
      setTimeout(() => {
        // Add plugin to configuration
        const pluginConfig: any = {
          enabled: true,
          version: options.version || 'latest',
          description: `Plugin ${pluginName} - Auto-generated description`,
          author: 'External',
          installed_at: new Date().toISOString()
        };
        
        // Add specific configuration based on plugin type
        if (pluginName.includes('slack')) {
          pluginConfig.webhook_url = 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';
        }
        if (pluginName.includes('github')) {
          pluginConfig.token = 'github_pat_your_token_here';
        }
        if (pluginName.includes('datadog')) {
          pluginConfig.api_key = 'your_datadog_api_key_here';
        }
        
        setNestedProperty(config, `plugins.plugins.${pluginName}`, pluginConfig);
        saveConfig(config);
        
        console.log(chalk.green('✅ Plugin installed successfully'));
        console.log(chalk.gray(`Plugin: ${pluginName}`));
        if (options.version) {
          console.log(chalk.gray(`Version: ${options.version}`));
        }
        console.log(chalk.gray('Status: enabled'));
        console.log();
        console.log(chalk.blue('Run "torqvio plugins list" to see all plugins'));
      }, 1000);
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to install plugin:'), error.message);
      process.exit(1);
    }
  });

// Uninstall plugin command
pluginCommands
  .command('uninstall <plugin-name>')
  .description('Uninstall a plugin')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (pluginName: string, options: any) => {
    console.log(chalk.blue.bold(`🗑️ Uninstalling Plugin: ${pluginName}`));
    
    try {
      const { config } = loadConfig();
      
      if (!config.plugins?.plugins || !config.plugins.plugins[pluginName]) {
        console.log(chalk.yellow(`⚠️ Plugin ${pluginName} is not installed.`));
        return;
      }
      
      if (!options.confirm) {
        const inquirer = await import('inquirer');
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to uninstall ${pluginName}?`,
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log(chalk.yellow('❌ Uninstallation cancelled'));
          return;
        }
      }
      
      console.log(chalk.gray('Removing plugin...'));
      
      // Remove plugin from configuration
      delete config.plugins.plugins[pluginName];
      saveConfig(config);
      
      // Simulate uninstallation process
      setTimeout(() => {
        console.log(chalk.green(`✅ Plugin ${pluginName} uninstalled successfully`));
      }, 500);
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to uninstall plugin:'), error.message);
      process.exit(1);
    }
  });

// Enable plugin command
pluginCommands
  .command('enable <plugin-name>')
  .description('Enable a plugin')
  .action(async (pluginName: string) => {
    console.log(chalk.blue.bold(`✅ Enabling Plugin: ${pluginName}`));
    
    try {
      const { config } = loadConfig();
      
      if (!config.plugins?.plugins || !config.plugins.plugins[pluginName]) {
        console.log(chalk.yellow(`⚠️ Plugin ${pluginName} is not installed.`));
        return;
      }
      
      // Enable plugin in configuration
      setNestedProperty(config, `plugins.plugins.${pluginName}.enabled`, true);
      saveConfig(config);
      
      console.log(chalk.green(`✅ Plugin ${pluginName} enabled successfully`));
      console.log(chalk.gray('The plugin will now be active for all workflows.'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to enable plugin:'), error.message);
      process.exit(1);
    }
  });

// Disable plugin command
pluginCommands
  .command('disable <plugin-name>')
  .description('Disable a plugin')
  .action(async (pluginName: string) => {
    console.log(chalk.blue.bold(`⏸️ Disabling Plugin: ${pluginName}`));
    
    try {
      const { config } = loadConfig();
      
      if (!config.plugins?.plugins || !config.plugins.plugins[pluginName]) {
        console.log(chalk.yellow(`⚠️ Plugin ${pluginName} is not installed.`));
        return;
      }
      
      // Disable plugin in configuration
      setNestedProperty(config, `plugins.plugins.${pluginName}.enabled`, false);
      saveConfig(config);
      
      console.log(chalk.yellow(`⚠️ Plugin ${pluginName} disabled`));
      console.log(chalk.gray('The plugin will no longer be active for new workflows.'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to disable plugin:'), error.message);
      process.exit(1);
    }
  });

export { pluginCommands };
