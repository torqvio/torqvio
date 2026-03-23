#!/usr/bin/env node

import { config } from 'dotenv';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env file
config();

interface ProjectConfig {
  projectId: string;
  apiKey: string;
  name: string;
  createdAt: string;
}

const initCommand = new Command('init');

initCommand
  .description('Initialize a new Torqvio project')
  .option('-n, --name <name>', 'Project name')
  .option('-k, --api-key <key>', 'API key (auto-generated if not provided)')
  .action(async (options: { name?: string; apiKey?: string }) => {
    console.log(chalk.blue.bold('🚀 Welcome to Torqvio'));
    console.log(chalk.gray('Initializing your project...\n'));

    try {
      // Check if already in an Torqvio project
      if (existsSync(join(process.cwd(), 'torqvio.config.json'))) {
        console.log(chalk.yellow('⚠️  This directory is already an Torqvio project'));
        return;
      }

      // Get project details
      let projectName = options.name;
      if (!projectName) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            default: () => {
              const cwd = process.cwd();
              return cwd.split('\\').pop() || cwd.split('/').pop() || 'my-torqvio-project';
            }
          }
        ]);
        projectName = answers.name;
      }

      // Generate or use provided API key
      let apiKey = options.apiKey;
      let projectId: string;
      
      if (!apiKey) {
        console.log(chalk.blue('🔑 Generating API key...'));
        
        try {
          const response = await axios.post(`${process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:8459'}/cli/auth/register`, {
            projectName,
            framework: 'cli'
          });
          
          apiKey = response.data.apiKey;
          projectId = response.data.projectId;
          console.log(chalk.green('✅ API key generated successfully'));
        } catch (error: any) {
          // Fallback: generate local key if server is not available
          apiKey = `af_${uuidv4().replace(/-/g, '')}`;
          projectId = uuidv4();
          console.log(chalk.yellow('⚠️  Server unavailable, generated local API key'));
        }
      } else {
        projectId = uuidv4();
      }

      // Create project configuration
      const config: ProjectConfig = {
        projectId: projectId!,
        apiKey: apiKey!,
        name: projectName!,
        createdAt: new Date().toISOString()
      };

      // Create local config file
      const configPath = join(process.cwd(), 'torqvio.config.json');
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Create .torqvio directory for local state
      const torqvioDir = join(process.cwd(), '.torqvio');
      if (!existsSync(torqvioDir)) {
        mkdirSync(torqvioDir, { recursive: true });
      }

      // Store global config
      const globalConfigPath = join(homedir(), '.torqvio', 'config.json');
      if (!existsSync(join(homedir(), '.torqvio'))) {
        mkdirSync(join(homedir(), '.torqvio'), { recursive: true });
      }
      
      let globalConfig: Record<string, ProjectConfig> = {};
      if (existsSync(globalConfigPath)) {
        const fs = await import('fs');
        globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));
      }
      
      globalConfig[config.projectId] = config;
      writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2));

      console.log(chalk.green.bold('\n✅ Project initialized successfully!'));
      console.log(chalk.gray(`Project ID: ${config.projectId}`));
      console.log(chalk.gray(`API Key: ${config.apiKey.substring(0, 12)}...`));
      console.log(chalk.gray(`Config file: ${configPath}`));
      
      console.log(chalk.blue('\n🎯 Next steps:'));
      console.log(chalk.white('  npx torqvio deploy payment-recovery'));
      console.log(chalk.white('  npx torqvio deploy email-reliability'));
      console.log(chalk.white('  npx torqvio deploy webhook-ingestion'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
      process.exit(1);
    }
  });

// CLI authentication helper
export async function getAuthConfig(): Promise<ProjectConfig | null> {
  const configPath = join(process.cwd(), 'torqvio.config.json');
  
  if (!existsSync(configPath)) {
    console.error(chalk.red('❌ Not an Torqvio project. Run "npx torqvio init" first.'));
    return null;
  }
  
  try {
    const fs = await import('fs');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error: any) {
    console.error(chalk.red('❌ Invalid project configuration.'));
    return null;
  }
}

export { initCommand };
export default initCommand;
