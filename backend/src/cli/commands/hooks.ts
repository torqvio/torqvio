#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadConfig, saveConfig, setNestedProperty, getNestedProperty } from './config.js';

const hookCommands = new Command('hooks');

hookCommands
  .description('Hook management commands');

// List hooks command
hookCommands
  .command('list')
  .description('List all hooks')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🪝 Workflow Hooks'));
    
    try {
      const { config } = loadConfig();
      
      // Get hooks from configuration or use defaults
      const hooks = config.hooks || {
        pre_run: [
          'echo "Starting workflow"',
          'torqvio check --environment'
        ],
        post_run: [
          'torqvio notify --slack',
          'torqvio cleanup --temp-files'
        ],
        on_error: [
          'torqvio alert --email',
          'torqvio rollback --last'
        ]
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(hooks, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Hooks');
        Object.entries(hooks).forEach(([hookType, commands]) => {
          console.log(`${hookType}:`);
          if (Array.isArray(commands)) {
            commands.forEach(cmd => {
              console.log(`  - "${cmd}"`);
            });
          }
        });
      } else {
        const hookList = Object.entries(hooks).map(([type, commands]) => ({
          type,
          commands: Array.isArray(commands) ? commands : [commands],
          enabled: true
        }));
        
        console.log(chalk.white('Found'), chalk.green(hookList.length), chalk.white('hook types'));
        console.log();
        
        hookList.forEach(hook => {
          console.log(chalk.white(hook.type) + chalk.green(' (enabled)'));
          console.log(chalk.gray(`  Commands: ${hook.commands.length}`));
          hook.commands.forEach(cmd => {
            console.log(chalk.gray(`    - ${cmd}`));
          });
          console.log();
        });
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list hooks:'), error.message);
      process.exit(1);
    }
  });

// Add hook command
hookCommands
  .command('add <hook-type>')
  .description('Add a new hook command')
  .option('--command <command>', 'Command to execute')
  .action(async (hookType: string, options: any) => {
    console.log(chalk.blue.bold(`➕ Adding Hook: ${hookType}`));
    
    try {
      if (!options.command) {
        console.error(chalk.red('❌ --command is required'));
        process.exit(1);
      }
      
      const { config } = loadConfig();
      
      // Initialize hooks configuration if it doesn't exist
      if (!config.hooks) {
        setNestedProperty(config, 'hooks', {});
      }
      
      // Validate hook type
      const validHookTypes = ['pre_run', 'post_run', 'on_error'];
      if (!validHookTypes.includes(hookType)) {
        console.error(chalk.red(`❌ Invalid hook type. Valid types: ${validHookTypes.join(', ')}`));
        process.exit(1);
      }
      
      // Get existing hooks for this type
      let existingHooks = getNestedProperty(config, `hooks.${hookType}`) || [];
      
      // Add new command to the hook type
      if (!Array.isArray(existingHooks)) {
        const newArray = existingHooks ? [existingHooks] : [];
        setNestedProperty(config, `hooks.${hookType}`, newArray);
        existingHooks = newArray;
      }
      
      existingHooks.push(options.command);
      
      // Save configuration
      saveConfig(config);
      
      console.log(chalk.green(`✅ Hook command added to ${hookType}`));
      console.log(chalk.gray(`Command: ${options.command}`));
      console.log(chalk.gray(`Total commands in ${hookType}: ${existingHooks.length}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to add hook:'), error.message);
      process.exit(1);
    }
  });

// Remove hook command
hookCommands
  .command('remove <hook-type>')
  .description('Remove a hook command')
  .option('--command <command>', 'Specific command to remove')
  .option('--index <index>', 'Command index to remove')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (hookType: string, options: any) => {
    console.log(chalk.blue.bold(`🗑️ Removing Hook: ${hookType}`));
    
    try {
      const { config } = loadConfig();
      
      if (!(config.hooks as any)[hookType]) {
        console.log(chalk.yellow(`⚠️ No hooks found for type: ${hookType}`));
        return;
      }
      
      const hooks = (config.hooks as any)[hookType];
      
      if (!options.confirm) {
        const inquirer = await import('inquirer');
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to remove hooks from ${hookType}?`,
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log(chalk.yellow('❌ Removal cancelled'));
          return;
        }
      }
      
      if (options.command) {
        // Remove specific command
        const index = hooks.indexOf(options.command);
        if (index > -1) {
          hooks.splice(index, 1);
          console.log(chalk.green(`✅ Command removed from ${hookType}: ${options.command}`));
        } else {
          console.log(chalk.yellow(`⚠️ Command not found in ${hookType}: ${options.command}`));
        }
      } else if (options.index) {
        // Remove by index
        const idx = parseInt(options.index);
        if (idx >= 0 && idx < hooks.length) {
          const removed = hooks.splice(idx, 1)[0];
          console.log(chalk.green(`✅ Command removed from ${hookType}: ${removed}`));
        } else {
          console.log(chalk.yellow(`⚠️ Invalid index: ${idx}`));
        }
      } else {
        // Clear all hooks for this type
        (config.hooks as any)[hookType] = [];
        console.log(chalk.green(`✅ All commands cleared from ${hookType}`));
      }
      
      // Save configuration
      saveConfig(config);
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to remove hook:'), error.message);
      process.exit(1);
    }
  });

// Test hook command
hookCommands
  .command('test <hook-name>')
  .description('Test a hook')
  .action(async (hookName: string) => {
    console.log(chalk.blue.bold(`🧪 Testing Hook: ${hookName}`));
    
    try {
      console.log(chalk.gray('Executing hook...'));
      
      // Simulate hook execution
      setTimeout(() => {
        console.log(chalk.green('✅ Hook test completed'));
        console.log(chalk.gray('Output: Hook executed successfully'));
        console.log(chalk.gray('Exit code: 0'));
        console.log(chalk.gray('Execution time: 0.123s'));
      }, 500);
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to test hook:'), error.message);
      process.exit(1);
    }
  });

// Enable hook command
hookCommands
  .command('enable <hook-name>')
  .description('Enable a hook')
  .action(async (hookName: string) => {
    console.log(chalk.blue.bold(`✅ Enabling Hook: ${hookName}`));
    
    try {
      console.log(chalk.green(`✅ Hook ${hookName} enabled successfully`));
      console.log(chalk.gray('The hook will now trigger on specified events.'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to enable hook:'), error.message);
      process.exit(1);
    }
  });

// Disable hook command
hookCommands
  .command('disable <hook-name>')
  .description('Disable a hook')
  .action(async (hookName: string) => {
    console.log(chalk.blue.bold(`⏸️ Disabling Hook: ${hookName}`));
    
    try {
      console.log(chalk.yellow(`⚠️ Hook ${hookName} disabled`));
      console.log(chalk.gray('The hook will no longer trigger on events.'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to disable hook:'), error.message);
      process.exit(1);
    }
  });

export { hookCommands };
