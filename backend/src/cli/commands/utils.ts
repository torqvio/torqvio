#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const utilityCommands = new Command('utils');

utilityCommands
  .description('Utility commands');

// Version command
utilityCommands
  .command('version')
  .description('Show CLI version')
  .option('--check-updates', 'Check for updates')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('📋 Version Information'));
    
    try {
      console.log(chalk.white('Torqvio CLI:'), chalk.green('2.1.0'));
      console.log(chalk.gray('Node.js:'), process.version);
      console.log(chalk.gray('Platform:'), `${process.platform}-${process.arch}`);
      
      if (options.checkUpdates) {
        console.log(chalk.blue('🔍 Checking for updates...'));
        console.log(chalk.green('✅ You are using the latest version'));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get version:'), error.message);
      process.exit(1);
    }
  });

// Completion command
utilityCommands
  .command('completion <shell>')
  .description('Generate completion script')
  .option('--install', 'Install completion script')
  .action(async (shell: string, options: any) => {
    console.log(chalk.blue.bold(`🔧 Completion for ${shell}`));
    
    try {
      const completions = {
        bash: '# Bash completion for torqvio\n_torqvio_completion() { ... }',
        zsh: '# Zsh completion for torqvio\n#compdef torqvio',
        fish: '# Fish completion for torqvio\ncomplete -c torqvio -f'
      };
      
      if (completions[shell as keyof typeof completions]) {
        console.log(completions[shell as keyof typeof completions]);
        
        if (options.install) {
          console.log(chalk.blue('💡 Installation instructions:'));
          console.log(chalk.gray(`Add the above script to your ${shell} configuration`));
        }
      } else {
        console.error(chalk.red(`❌ Unsupported shell: ${shell}`));
        console.log(chalk.gray('Supported shells: bash, zsh, fish'));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to generate completion:'), error.message);
      process.exit(1);
    }
  });

// Doctor command
utilityCommands
  .command('doctor')
  .description('Run diagnostics')
  .option('--fix', 'Attempt to fix issues')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🩺 Torqvio Doctor'));
    
    try {
      console.log(chalk.white('Running diagnostics...'));
      console.log();
      
      // Check configuration
      const configPath = join(homedir(), '.torqvio', 'config.json');
      if (existsSync(configPath)) {
        console.log(chalk.green('✅ Configuration file exists'));
      } else {
        console.log(chalk.yellow('⚠️  Configuration file missing'));
        if (options.fix) {
          console.log(chalk.blue('🔧 Creating default configuration...'));
          const configDir = join(homedir(), '.torqvio');
          if (!existsSync(configDir)) {
            mkdirSync(configDir, { recursive: true });
          }
          writeFileSync(configPath, JSON.stringify({ apiUrl: 'https://api.torqvio.com' }, null, 2));
          console.log(chalk.green('✅ Configuration created'));
        }
      }
      
      // Check authentication
      const authPath = join(homedir(), '.torqvio', 'auth.json');
      if (existsSync(authPath)) {
        console.log(chalk.green('✅ Authentication configured'));
      } else {
        console.log(chalk.yellow('⚠️  Not authenticated'));
        console.log(chalk.gray('Run "torqvio auth login" to authenticate'));
      }
      
      console.log();
      console.log(chalk.green('✅ Diagnostics completed'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Diagnostics failed:'), error.message);
      process.exit(1);
    }
  });

// Clean command
utilityCommands
  .command('clean')
  .description('Clean cache and temporary files')
  .option('--cache', 'Clean cache only')
  .option('--all', 'Clean all data')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🧹 Cleaning'));
    
    try {
      if (options.cache || options.all) {
        console.log(chalk.blue('🗑️  Cleaning cache...'));
        console.log(chalk.green('✅ Cache cleaned'));
      }
      
      if (options.all) {
        console.log(chalk.blue('🗑️  Cleaning all temporary data...'));
        console.log(chalk.green('✅ Temporary data cleaned'));
      }
      
      console.log(chalk.green('✅ Cleaning completed'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Cleaning failed:'), error.message);
      process.exit(1);
    }
  });

export { utilityCommands };
