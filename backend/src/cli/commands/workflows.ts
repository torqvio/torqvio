#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Workflow, GlobalOptions } from '../types.js';

const workflowCommands = new Command('workflows');

workflowCommands
  .description('Workflow management commands');

// List workflows command
workflowCommands
  .command('list')
  .description('List all workflows')
  .option('--limit <number>', 'Limit number of results', '20')
  .option('--offset <number>', 'Offset for pagination', '0')
  .option('--status <status>', 'Filter by status (active, inactive, archived)')
  .option('--search <term>', 'Search workflows')
  .option('--sort <field>', 'Sort field (created_at, updated_at, name)', 'created_at')
  .option('--order <order>', 'Sort order (asc, desc)', 'desc')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('📋 Listing Workflows'));
    
    try {
      // Simulate API call - in production this would hit the actual API
      const workflows: Workflow[] = [
        {
          id: 'wf_001',
          name: 'Payment Recovery',
          description: 'Automatic payment retry workflow',
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:22:00Z',
          tags: ['payment', 'critical', 'production'],
          definition: { steps: [], triggers: [] }
        },
        {
          id: 'wf_002',
          name: 'Email Delivery',
          description: 'Email delivery assurance workflow',
          status: 'active',
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-18T16:45:00Z',
          tags: ['email', 'communication'],
          definition: { steps: [], triggers: [] }
        },
        {
          id: 'wf_003',
          name: 'User Onboarding',
          description: 'New user onboarding sequence',
          status: 'inactive',
          createdAt: '2024-01-05T13:20:00Z',
          updatedAt: '2024-01-12T11:30:00Z',
          tags: ['user', 'onboarding', 'test'],
          definition: { steps: [], triggers: [] }
        }
      ];

      // Apply filters
      let filteredWorkflows = workflows;
      
      if (options.status) {
        filteredWorkflows = filteredWorkflows.filter(w => w.status === options.status);
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        filteredWorkflows = filteredWorkflows.filter(w => 
          w.name.toLowerCase().includes(searchTerm) ||
          w.description?.toLowerCase().includes(searchTerm) ||
          w.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply sorting
      filteredWorkflows.sort((a, b) => {
        const field = options.sort;
        const order = options.order;
        
        let aValue: any = a[field as keyof Workflow] || '';
        let bValue: any = b[field as keyof Workflow] || '';
        
        if (field.includes('_at')) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (order === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      // Apply pagination
      const limit = parseInt(options.limit);
      const offset = parseInt(options.offset);
      const paginatedWorkflows = filteredWorkflows.slice(offset, offset + limit);

      // Output results
      if (options.format === 'json') {
        console.log(JSON.stringify(paginatedWorkflows, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Workflows');
        paginatedWorkflows.forEach(wf => {
          console.log(`- ${wf.name}:`);
          console.log(`    id: ${wf.id}`);
          console.log(`    status: ${wf.status}`);
          console.log(`    created: ${wf.createdAt}`);
        });
      } else {
        // Table format
        console.log(chalk.white('Found'), chalk.green(paginatedWorkflows.length), chalk.white('workflows'));
        console.log();
        
        if (paginatedWorkflows.length === 0) {
          console.log(chalk.yellow('No workflows found'));
          return;
        }

        console.log(chalk.gray('ID'.padEnd(12)) + 
                   chalk.gray('Name'.padEnd(20)) + 
                   chalk.gray('Status'.padEnd(12)) + 
                   chalk.gray('Tags'.padEnd(20)) + 
                   chalk.gray('Updated'));
        console.log(chalk.gray('-'.repeat(80)));
        
        paginatedWorkflows.forEach(wf => {
          const statusColor = wf.status === 'active' ? chalk.green : 
                            wf.status === 'inactive' ? chalk.yellow : chalk.gray;
          
          console.log(
            wf.id.substring(0, 10).padEnd(12) +
            wf.name.padEnd(20) +
            statusColor(wf.status.padEnd(12)) +
            wf.tags.slice(0, 2).join(',').padEnd(20) +
            new Date(wf.updatedAt).toLocaleDateString()
          );
        });
        
        console.log();
        console.log(chalk.gray(`Showing ${offset + 1}-${Math.min(offset + limit, filteredWorkflows.length)} of ${filteredWorkflows.length} workflows`));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list workflows:'), error.message);
      process.exit(1);
    }
  });

// Get workflow details command
workflowCommands
  .command('get <workflow-id>')
  .description('Get workflow details')
  .option('--with-history', 'Include execution history')
  .option('--show-definition', 'Show workflow definition')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (workflowId: string, options: any) => {
    console.log(chalk.blue.bold(`📄 Getting Workflow: ${workflowId}`));
    
    try {
      // Simulate workflow lookup
      const workflow: Workflow = {
        id: workflowId,
        name: 'Payment Recovery',
        description: 'Automatic payment retry workflow with exponential backoff',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z',
        tags: ['payment', 'critical', 'production'],
        definition: {
          steps: [
            { id: 'step1', type: 'webhook', name: 'Receive payment event' },
            { id: 'step2', type: 'delay', name: 'Wait 5 minutes' },
            { id: 'step3', type: 'api', name: 'Retry payment' }
          ],
          triggers: [
            { type: 'webhook', event: 'payment.failed' }
          ]
        }
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(workflow, null, 2));
      } else if (options.format === 'yaml') {
        console.log(`# ${workflow.name}`);
        console.log(`id: ${workflow.id}`);
        console.log(`status: ${workflow.status}`);
        console.log(`description: ${workflow.description}`);
        console.log(`tags: [${workflow.tags.join(', ')}]`);
        console.log(`created: ${workflow.createdAt}`);
        console.log(`updated: ${workflow.updatedAt}`);
      } else {
        // Table format
        console.log(chalk.white('Workflow Details:'));
        console.log();
        console.log(chalk.gray('ID:'), chalk.white(workflow.id));
        console.log(chalk.gray('Name:'), chalk.white(workflow.name));
        console.log(chalk.gray('Description:'), chalk.white(workflow.description || 'N/A'));
        console.log(chalk.gray('Status:'), workflow.status === 'active' ? chalk.green(workflow.status) : chalk.yellow(workflow.status));
        console.log(chalk.gray('Tags:'), chalk.white(workflow.tags.join(', ')));
        console.log(chalk.gray('Created:'), chalk.white(new Date(workflow.createdAt).toLocaleString()));
        console.log(chalk.gray('Updated:'), chalk.white(new Date(workflow.updatedAt).toLocaleString()));
        
        if (options.showDefinition && workflow.definition) {
          console.log();
          console.log(chalk.blue('Definition:'));
          console.log(chalk.gray('Triggers:'));
          workflow.definition.triggers.forEach((trigger: any, i: number) => {
            console.log(`  ${i + 1}. ${trigger.type}: ${trigger.event || 'N/A'}`);
          });
          console.log(chalk.gray('Steps:'));
          workflow.definition.steps.forEach((step: any, i: number) => {
            console.log(`  ${i + 1}. ${step.name} (${step.type})`);
          });
        }
        
        if (options.withHistory) {
          console.log();
          console.log(chalk.blue('Recent Executions:'));
          console.log(chalk.gray('Recent executions would be shown here in production'));
        }
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get workflow:'), error.message);
      process.exit(1);
    }
  });

// Create workflow command
workflowCommands
  .command('create')
  .description('Create a new workflow')
  .option('--file <path>', 'Create from file')
  .option('--name <name>', 'Workflow name')
  .option('--description <desc>', 'Workflow description')
  .option('--template <template>', 'Create from template')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--workspace <workspace>', 'Target workspace')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('➕ Creating Workflow'));
    
    try {
      let workflowData: any = {};
      
      if (options.file) {
        if (!existsSync(options.file)) {
          console.error(chalk.red(`❌ File not found: ${options.file}`));
          process.exit(1);
        }
        
        const fileContent = readFileSync(options.file, 'utf8');
        workflowData = JSON.parse(fileContent);
      } else if (options.template) {
        console.log(chalk.blue(`Creating from template: ${options.template}`));
        workflowData = {
          name: options.name || `${options.template} Workflow`,
          description: options.description || `Workflow based on ${options.template} template`,
          template: options.template
        };
      } else {
        if (!options.name) {
          console.error(chalk.red('❌ Name is required when not using file or template'));
          process.exit(1);
        }
        
        workflowData = {
          name: options.name,
          description: options.description || '',
          definition: { steps: [], triggers: [] }
        };
      }
      
      // Add tags
      if (options.tags) {
        workflowData.tags = options.tags.split(',').map((tag: string) => tag.trim());
      }
      
      // Simulate API call
      const newWorkflow: Workflow = {
        id: `wf_${Date.now()}`,
        name: workflowData.name,
        description: workflowData.description,
        status: 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: workflowData.tags || [],
        definition: workflowData.definition || { steps: [], triggers: [] }
      };
      
      console.log(chalk.green('✅ Workflow created successfully!'));
      console.log(chalk.gray(`ID: ${newWorkflow.id}`));
      console.log(chalk.gray(`Name: ${newWorkflow.name}`));
      console.log(chalk.gray(`Status: ${newWorkflow.status}`));
      
      if (options.workspace) {
        console.log(chalk.gray(`Workspace: ${options.workspace}`));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to create workflow:'), error.message);
      process.exit(1);
    }
  });

// Update workflow command
workflowCommands
  .command('update <workflow-id>')
  .description('Update workflow')
  .option('--file <path>', 'Update from file')
  .option('--name <name>', 'Update name')
  .option('--description <desc>', 'Update description')
  .option('--add-tags <tags>', 'Add tags (comma-separated)')
  .option('--remove-tags <tags>', 'Remove tags (comma-separated)')
  .option('--enable', 'Enable workflow')
  .option('--disable', 'Disable workflow')
  .action(async (workflowId: string, options: any) => {
    console.log(chalk.blue.bold(`✏️ Updating Workflow: ${workflowId}`));
    
    try {
      const updates: any = {};
      
      if (options.file) {
        if (!existsSync(options.file)) {
          console.error(chalk.red(`❌ File not found: ${options.file}`));
          process.exit(1);
        }
        
        const fileContent = readFileSync(options.file, 'utf8');
        const fileData = JSON.parse(fileContent);
        Object.assign(updates, fileData);
      }
      
      if (options.name) updates.name = options.name;
      if (options.description) updates.description = options.description;
      if (options.enable) updates.status = 'active';
      if (options.disable) updates.status = 'inactive';
      
      // Simulate API call
      console.log(chalk.green('✅ Workflow updated successfully!'));
      
      if (updates.name) console.log(chalk.gray(`Name: ${updates.name}`));
      if (updates.description) console.log(chalk.gray(`Description: ${updates.description}`));
      if (updates.status) console.log(chalk.gray(`Status: ${updates.status}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to update workflow:'), error.message);
      process.exit(1);
    }
  });

// Delete workflow command
workflowCommands
  .command('delete <workflow-ids...>')
  .description('Delete workflow(s)')
  .option('--confirm', 'Skip confirmation prompt')
  .option('--force', 'Force delete without confirmation')
  .action(async (workflowIds: string[], options: any) => {
    console.log(chalk.blue.bold('🗑️ Deleting Workflows'));
    
    try {
      if (!options.confirm && !options.force) {
        const inquirer = await import('inquirer');
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete ${workflowIds.length} workflow(s)?`,
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log(chalk.yellow('❌ Deletion cancelled'));
          return;
        }
      }
      
      for (const workflowId of workflowIds) {
        // Simulate API call
        console.log(chalk.green(`✅ Deleted workflow: ${workflowId}`));
      }
      
      console.log(chalk.green(`Successfully deleted ${workflowIds.length} workflow(s)`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to delete workflows:'), error.message);
      process.exit(1);
    }
  });

// Run workflow command
workflowCommands
  .command('run <workflow-id>')
  .description('Execute workflow')
  .option('--data <json>', 'Input data as JSON')
  .option('--data-file <path>', 'Input data from file')
  .option('--environment <env>', 'Target environment')
  .option('--async', 'Run asynchronously')
  .option('--wait', 'Wait for completion')
  .option('--timeout <seconds>', 'Execution timeout')
  .action(async (workflowId: string, options: any) => {
    console.log(chalk.blue.bold(`🚀 Running Workflow: ${workflowId}`));
    
    try {
      let inputData: any = {};
      
      if (options.data) {
        inputData = JSON.parse(options.data);
      } else if (options.dataFile) {
        if (!existsSync(options.dataFile)) {
          console.error(chalk.red(`❌ File not found: ${options.dataFile}`));
          process.exit(1);
        }
        
        const fileContent = readFileSync(options.dataFile, 'utf8');
        inputData = JSON.parse(fileContent);
      }
      
      // Simulate workflow execution
      const executionId = `exec_${Date.now()}`;
      
      console.log(chalk.green('✅ Workflow execution started!'));
      console.log(chalk.gray(`Execution ID: ${executionId}`));
      console.log(chalk.gray(`Input: ${JSON.stringify(inputData)}`));
      
      if (options.environment) {
        console.log(chalk.gray(`Environment: ${options.environment}`));
      }
      
      if (options.wait) {
        console.log(chalk.blue('⏳ Waiting for completion...'));
        // Simulate waiting
        setTimeout(() => {
          console.log(chalk.green('✅ Execution completed successfully'));
        }, 2000);
      } else {
        console.log(chalk.blue('📊 Check status with: torqvio executions get', executionId));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to run workflow:'), error.message);
      process.exit(1);
    }
  });

export { workflowCommands };
