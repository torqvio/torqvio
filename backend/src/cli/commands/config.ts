#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { Config, GlobalOptions, ConfigSource } from '../types.js';
import * as yaml from 'js-yaml';

// Default configuration
const DEFAULT_CONFIG: Config = {
  api: {
    url: 'https://api.torqvio.com',
    timeout: 30,
    retries: 3
  },
  auth: {
    method: 'oauth'
  },
  workspace: {},
  cli: {
    output_format: 'table',
    log_level: 'info',
    auto_confirm: false,
    pager: true,
    color: true,
    unicode: true
  }
};

// Helper function to get config paths in order of precedence
function getConfigPaths(): { path: string; type: 'yaml' | 'json'; source: ConfigSource }[] {
  const homeDir = homedir();
  const cwd = process.cwd();
  
  return [
    { path: join(homeDir, '.torqvio', 'config.yaml'), type: 'yaml' as const, source: { type: 'file', path: join(homeDir, '.torqvio', 'config.yaml'), priority: 1 } },
    { path: join(cwd, '.torqvio', 'config.yaml'), type: 'yaml' as const, source: { type: 'file', path: join(cwd, '.torqvio', 'config.yaml'), priority: 2 } },
    { path: join(cwd, '.torqvio.yaml'), type: 'yaml' as const, source: { type: 'file', path: join(cwd, '.torqvio.yaml'), priority: 3 } },
    { path: join(homeDir, '.torqvio', 'config.json'), type: 'json' as const, source: { type: 'file', path: join(homeDir, '.torqvio', 'config.json'), priority: 4 } } // Legacy support
  ];
}

// Helper function to load configuration from all sources
function loadConfig(): { config: Config; sources: ConfigSource[] } {
  const sources: ConfigSource[] = [];
  let config = { ...DEFAULT_CONFIG };
  
  // Load from files in order of precedence
  const configPaths = getConfigPaths();
  for (const { path, type } of configPaths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, 'utf8');
        let fileConfig: Partial<Config>;
        
        if (type === 'yaml') {
          fileConfig = yaml.load(content) as Partial<Config>;
        } else {
          fileConfig = JSON.parse(content);
        }
        
        // Merge configuration
        config = mergeDeep(config, fileConfig);
        sources.push({ type: 'file', path, priority: sources.length + 1 });
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not load config from ${path}:`, error));
      }
    }
  }
  
  // Load from environment variables
  const envConfig = loadFromEnv();
  if (Object.keys(envConfig).length > 0) {
    config = mergeDeep(config, envConfig);
    sources.push({ type: 'env', priority: sources.length + 1 });
  }
  
  sources.push({ type: 'default', priority: sources.length + 1 });
  
  return { config, sources };
}

// Helper function to load configuration from environment variables
function loadFromEnv(): Partial<Config> {
  const env: Partial<Config> = {};
  
  if (process.env.TORQVIO_API_URL) {
    env.api = { url: process.env.TORQVIO_API_URL };
  }
  
  if (process.env.TORQVIO_API_KEY) {
    env.auth = { method: 'api_key', api_key: process.env.TORQVIO_API_KEY };
  }
  
  if (process.env.TORQVIO_WORKSPACE) {
    env.workspace = { default: process.env.TORQVIO_WORKSPACE };
  }
  
  if (process.env.TORQVIO_LOG_LEVEL) {
    env.cli = { log_level: process.env.TORQVIO_LOG_LEVEL as any };
  }
  
  return env;
}

// Helper function to deep merge objects
function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Helper function to set nested property
function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Helper function to get nested property
function getNestedProperty(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

// Helper function to delete nested property
function deleteNestedProperty(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isObject(current[key])) {
      return false;
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

// Helper function to save configuration
function saveConfig(config: Config, format: 'yaml' | 'json' = 'yaml'): void {
  const configPath = join(homedir(), '.torqvio', `config.${format}`);
  const configDir = join(homedir(), '.torqvio');
  
  if (!existsSync(configDir)) {
    const fs = require('fs');
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  let content: string;
  if (format === 'yaml') {
    content = yaml.dump(config, { indent: 2 });
  } else {
    content = JSON.stringify(config, null, 2);
  }
  
  writeFileSync(configPath, content, 'utf8');
}

const configCommands = new Command('config');

configCommands
  .description('Configuration management commands');

// List configuration command
configCommands
  .command('list')
  .alias('show')
  .description('List all configuration')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .option('--effective', 'Show effective configuration (merged from all sources)')
  .option('--sources', 'Show configuration sources')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('⚙️ Configuration'));
    
    try {
      const { config, sources } = loadConfig();
      
      if (options.sources) {
        console.log(chalk.white('Configuration Sources:'));
        sources.forEach((source) => {
          const priority = chalk.gray(`#${source.priority}`);
          const type = chalk.cyan(source.type.toUpperCase());
          const path = source.path ? chalk.gray(source.path) : '';
          console.log(`  ${priority} ${type} ${path}`);
        });
        return;
      }
      
      if (options.format === 'json') {
        console.log(JSON.stringify(config, null, 2));
      } else if (options.format === 'yaml') {
        console.log(yaml.dump(config, { indent: 2 }));
      } else {
        console.log(chalk.white('Current Configuration:'));
        console.log();
        console.log(chalk.gray('API URL:'), chalk.white(config.api.url));
        console.log(chalk.gray('Timeout:'), chalk.white(`${config.api.timeout}s`));
        console.log(chalk.gray('Retries:'), chalk.white(config.api.retries));
        console.log(chalk.gray('Auth Method:'), chalk.white(config.auth.method));
        if (config.workspace.default) console.log(chalk.gray('Workspace:'), chalk.white(config.workspace.default));
        console.log(chalk.gray('Log Level:'), chalk.white(config.cli.log_level));
        console.log(chalk.gray('Output Format:'), chalk.white(config.cli.output_format));
        
        if (config.workspace.environments) {
          console.log();
          console.log(chalk.blue('Environments:'));
          Object.entries(config.workspace.environments).forEach(([name, env]) => {
            console.log(chalk.white(`  ${name}:`));
            if (env.api_url) console.log(chalk.gray(`    API URL: ${env.api_url}`));
            if (env.database_url) console.log(chalk.gray(`    Database URL: ${env.database_url}`));
            if (env.redis_url) console.log(chalk.gray(`    Redis URL: ${env.redis_url}`));
            if (env.variables) {
              console.log(chalk.gray('    Variables:'));
              Object.entries(env.variables).forEach(([key, value]) => {
                console.log(chalk.gray(`      ${key}: ${value}`));
              });
            }
          });
        }
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list configuration:'), error.message);
      process.exit(1);
    }
  });

// Set configuration command
configCommands
  .command('set <key> <value>')
  .description('Set configuration value')
  .action(async (key: string, value: string) => {
    console.log(chalk.blue.bold(`⚙️ Setting Configuration: ${key}`));
    
    try {
      const { config } = loadConfig();
      
      // Convert value to appropriate type
      let parsedValue: any = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
      
      // Set the nested configuration value
      setNestedProperty(config, key, parsedValue);
      
      // Save configuration
      saveConfig(config);
      
      console.log(chalk.green(`✅ Configuration set: ${key} = ${parsedValue}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to set configuration:'), error.message);
      process.exit(1);
    }
  });

// Get configuration command
configCommands
  .command('get <key>')
  .description('Get configuration value')
  .action(async (key: string) => {
    try {
      const { config } = loadConfig();
      
      const value = getNestedProperty(config, key);
      
      if (value !== undefined) {
        console.log(chalk.white(`${key}:`), chalk.green(JSON.stringify(value)));
      } else {
        console.log(chalk.yellow(`${key}: not set`));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get configuration:'), error.message);
      process.exit(1);
    }
  });

// Reset configuration command
configCommands
  .command('reset [key]')
  .description('Reset configuration to defaults')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (key: string | undefined, options: any) => {
    console.log(chalk.blue.bold('🔄 Resetting Configuration'));
    
    try {
      if (key) {
        // Reset specific key
        console.log(chalk.blue(`Resetting key: ${key}`));
        const { config } = loadConfig();
        
        const success = deleteNestedProperty(config, key);
        if (!success) {
          console.error(chalk.red(`❌ Unknown configuration key: ${key}`));
          process.exit(1);
        }
        
        saveConfig(config);
        console.log(chalk.green(`✅ Reset ${key} to default`));
      } else {
        // Reset all configuration
        if (!options.confirm) {
          const inquirer = await import('inquirer');
          const { confirm } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Are you sure you want to reset all configuration to defaults?',
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('❌ Reset cancelled'));
            return;
          }
        }
        
        saveConfig(DEFAULT_CONFIG);
        
        console.log(chalk.green('✅ Configuration reset to defaults'));
        console.log(chalk.gray('API URL reset to: https://api.torqvio.com'));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to reset configuration:'), error.message);
      process.exit(1);
    }
  });

// Export configuration command
configCommands
  .command('export')
  .description('Export configuration to file')
  .option('--file <path>', 'Output file path', '~/.torqvio/config-export.yaml')
  .option('--format <format>', 'Export format (json, yaml)', 'yaml')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('📤 Exporting Configuration'));
    
    try {
      const { config } = loadConfig();
      const outputPath = options.file.replace('~', homedir());
      
      let content: string;
      if (options.format === 'json') {
        content = JSON.stringify(config, null, 2);
      } else {
        content = yaml.dump(config, { indent: 2 });
      }
      
      writeFileSync(outputPath, content, 'utf8');
      console.log(chalk.green(`✅ Configuration exported to: ${outputPath}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to export configuration:'), error.message);
      process.exit(1);
    }
  });

// Import configuration command
configCommands
  .command('import')
  .description('Import configuration from file')
  .option('--file <path>', 'Input file path', '~/.torqvio/config-export.yaml')
  .option('--validate', 'Validate configuration before importing')
  .option('--overwrite', 'Overwrite existing configuration')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('📥 Importing Configuration'));
    
    try {
      const inputPath = options.file.replace('~', homedir());
      
      if (!existsSync(inputPath)) {
        console.error(chalk.red(`❌ File not found: ${inputPath}`));
        process.exit(1);
      }
      
      const fileContent = readFileSync(inputPath, 'utf8');
      let importedConfig: Partial<Config>;
      
      if (inputPath.endsWith('.json')) {
        importedConfig = JSON.parse(fileContent);
      } else {
        importedConfig = yaml.load(fileContent) as Partial<Config>;
      }
      
      // Validate configuration
      if (options.validate) {
        console.log(chalk.blue('🔍 Validating configuration...'));
        
        if (!importedConfig.api?.url) {
          console.error(chalk.red('❌ API URL is required'));
          process.exit(1);
        }
        
        if (importedConfig.cli?.log_level && !['debug', 'info', 'warn', 'error'].includes(importedConfig.cli.log_level)) {
          console.error(chalk.red('❌ Invalid log level'));
          process.exit(1);
        }
        
        console.log(chalk.green('✅ Configuration is valid'));
      }
      
      // Load existing config and merge
      const { config: existingConfig } = loadConfig();
      const mergedConfig = options.overwrite ? 
        mergeDeep(DEFAULT_CONFIG, importedConfig) : 
        mergeDeep(existingConfig, importedConfig);
      
      // Save configuration
      saveConfig(mergedConfig as Config);
      console.log(chalk.green(`✅ Configuration imported from: ${inputPath}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to import configuration:'), error.message);
      process.exit(1);
    }
  });

// Validate configuration command
configCommands
  .command('validate')
  .description('Validate current configuration')
  .action(async () => {
    console.log(chalk.blue.bold('🔍 Validating Configuration'));
    
    try {
      const { config } = loadConfig();
      let isValid = true;
      
      // Validate required fields
      if (!config.api?.url) {
        console.error(chalk.red('❌ API URL is required'));
        isValid = false;
      } else if (!config.api.url.startsWith('http')) {
        console.error(chalk.red('❌ API URL must be a valid URL'));
        isValid = false;
      }
      
      // Validate optional fields
      if (config.cli?.log_level && !['debug', 'info', 'warn', 'error'].includes(config.cli.log_level)) {
        console.error(chalk.red('❌ Invalid log level. Use: debug, info, warn, error'));
        isValid = false;
      }
      
      if (config.api?.timeout && (config.api.timeout < 1 || config.api.timeout > 300)) {
        console.error(chalk.red('❌ Timeout must be between 1 and 300 seconds'));
        isValid = false;
      }
      
      if (isValid) {
        console.log(chalk.green('✅ Configuration is valid'));
        console.log(chalk.gray(`API URL: ${config.api.url}`));
        if (config.workspace.default) console.log(chalk.gray(`Workspace: ${config.workspace.default}`));
        if (config.cli.log_level) console.log(chalk.gray(`Log Level: ${config.cli.log_level}`));
      } else {
        console.log(chalk.red('❌ Configuration validation failed'));
        process.exit(1);
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to validate configuration:'), error.message);
      process.exit(1);
    }
  });

export { configCommands, loadConfig, saveConfig, setNestedProperty, getNestedProperty, mergeDeep };
