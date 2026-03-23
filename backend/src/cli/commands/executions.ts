#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Execution, GlobalOptions } from '../types.js';

const executionCommands = new Command('executions');

executionCommands
  .description('Execution monitoring commands');

// List executions command
executionCommands
  .command('list')
  .description('List recent executions')
  .option('--limit <number>', 'Limit number of results', '20')
  .option('--offset <number>', 'Offset for pagination', '0')
  .option('--workflow-id <id>', 'Filter by workflow ID')
  .option('--status <status>', 'Filter by status (pending, running, completed, failed, cancelled)')
  .option('--from <date>', 'Filter by start date (YYYY-MM-DD)')
  .option('--to <date>', 'Filter by end date (YYYY-MM-DD)')
  .option('--sort <field>', 'Sort field (started_at, completed_at)', 'started_at')
  .option('--order <order>', 'Sort order (asc, desc)', 'desc')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('📋 Listing Executions'));
    
    try {
      // Simulate executions data
      const executions: Execution[] = [
        {
          id: 'exec_001',
          workflowId: 'wf_001',
          status: 'completed',
          startedAt: '2024-01-20T10:30:00Z',
          completedAt: '2024-01-20T10:32:15Z',
          input: { paymentId: 'pay_123', amount: 99.99 },
          output: { retryCount: 3, success: true },
          logs: [
            { timestamp: '2024-01-20T10:30:00Z', level: 'info', message: 'Execution started' },
            { timestamp: '2024-01-20T10:31:00Z', level: 'info', message: 'Payment retry attempt 1' },
            { timestamp: '2024-01-20T10:32:15Z', level: 'info', message: 'Execution completed successfully' }
          ]
        },
        {
          id: 'exec_002',
          workflowId: 'wf_001',
          status: 'running',
          startedAt: '2024-01-20T11:15:00Z',
          input: { paymentId: 'pay_124', amount: 149.99 },
          logs: [
            { timestamp: '2024-01-20T11:15:00Z', level: 'info', message: 'Execution started' },
            { timestamp: '2024-01-20T11:15:30Z', level: 'info', message: 'Processing payment retry' }
          ]
        },
        {
          id: 'exec_003',
          workflowId: 'wf_002',
          status: 'failed',
          startedAt: '2024-01-20T09:45:00Z',
          completedAt: '2024-01-20T09:47:22Z',
          input: { emailId: 'email_456', recipient: 'user@example.com' },
          error: 'SMTP server timeout',
          logs: [
            { timestamp: '2024-01-20T09:45:00Z', level: 'info', message: 'Execution started' },
            { timestamp: '2024-01-20T09:47:22Z', level: 'error', message: 'SMTP server timeout' }
          ]
        }
      ];

      // Apply filters
      let filteredExecutions = executions;
      
      if (options.workflowId) {
        filteredExecutions = filteredExecutions.filter(e => e.workflowId === options.workflowId);
      }
      
      if (options.status) {
        filteredExecutions = filteredExecutions.filter(e => e.status === options.status);
      }
      
      if (options.from || options.to) {
        filteredExecutions = filteredExecutions.filter(e => {
          const startDate = new Date(e.startedAt);
          const fromDate = options.from ? new Date(options.from) : new Date('1970-01-01');
          const toDate = options.to ? new Date(options.to + 'T23:59:59') : new Date();
          return startDate >= fromDate && startDate <= toDate;
        });
      }
      
      // Apply sorting
      const sortField = options.sort || 'started_at';
      const sortOrder = options.order || 'desc';
      
      filteredExecutions.sort((a, b) => {
        const aValue = sortField === 'started_at' ? new Date(a.startedAt).getTime() : 
                      a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bValue = sortField === 'started_at' ? new Date(b.startedAt).getTime() : 
                      b.completedAt ? new Date(b.completedAt).getTime() : 0;
        
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });

      // Apply pagination
      const limit = parseInt(options.limit);
      const offset = parseInt(options.offset);
      const paginatedExecutions = filteredExecutions.slice(offset, offset + limit);

      // Output results
      if (options.format === 'json') {
        console.log(JSON.stringify(paginatedExecutions, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Executions');
        paginatedExecutions.forEach(exec => {
          console.log(`- ${exec.id}:`);
          console.log(`    workflow: ${exec.workflowId}`);
          console.log(`    status: ${exec.status}`);
          console.log(`    started: ${exec.startedAt}`);
        });
      } else {
        // Table format
        console.log(chalk.white('Found'), chalk.green(paginatedExecutions.length), chalk.white('executions'));
        console.log();
        
        if (paginatedExecutions.length === 0) {
          console.log(chalk.yellow('No executions found'));
          return;
        }

        console.log(chalk.gray('ID'.padEnd(12)) + 
                   chalk.gray('Workflow'.padEnd(12)) + 
                   chalk.gray('Status'.padEnd(12)) + 
                   chalk.gray('Started'.padEnd(20)) + 
                   chalk.gray('Duration'));
        console.log(chalk.gray('-'.repeat(80)));
        
        paginatedExecutions.forEach(exec => {
          const statusColor = exec.status === 'completed' ? chalk.green : 
                            exec.status === 'running' ? chalk.blue : 
                            exec.status === 'failed' ? chalk.red : chalk.yellow;
          
          const startTime = new Date(exec.startedAt);
          const endTime = exec.completedAt ? new Date(exec.completedAt) : new Date();
          const duration = exec.completedAt ? 
            `${Math.round((endTime.getTime() - startTime.getTime()) / 1000)}s` : 
            'Running';
          
          console.log(
            exec.id.substring(0, 10).padEnd(12) +
            exec.workflowId.substring(0, 10).padEnd(12) +
            statusColor(exec.status.padEnd(12)) +
            startTime.toLocaleString().padEnd(20) +
            duration
          );
        });
        
        console.log();
        console.log(chalk.gray(`Showing ${offset + 1}-${Math.min(offset + limit, filteredExecutions.length)} of ${filteredExecutions.length} executions`));
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list executions:'), error.message);
      process.exit(1);
    }
  });

// Get execution details command
executionCommands
  .command('get <execution-id>')
  .description('Get execution details')
  .option('--logs', 'Show full logs')
  .option('--steps', 'Show step details')
  .option('--data', 'Show input/output data')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (executionId: string, options: any) => {
    console.log(chalk.blue.bold(`📄 Getting Execution: ${executionId}`));
    
    try {
      // Simulate execution lookup
      const execution: Execution = {
        id: executionId,
        workflowId: 'wf_001',
        status: 'completed',
        startedAt: '2024-01-20T10:30:00Z',
        completedAt: '2024-01-20T10:32:15Z',
        input: { paymentId: 'pay_123', amount: 99.99, currency: 'USD' },
        output: { retryCount: 3, success: true, finalAmount: 99.99 },
        logs: [
          { timestamp: '2024-01-20T10:30:00Z', level: 'info', message: 'Execution started' },
          { timestamp: '2024-01-20T10:30:15Z', level: 'info', message: 'Received payment failure event' },
          { timestamp: '2024-01-20T10:30:30Z', level: 'info', message: 'Initiating retry attempt 1' },
          { timestamp: '2024-01-20T10:31:00Z', level: 'warn', message: 'Retry attempt 1 failed, retrying...' },
          { timestamp: '2024-01-20T10:31:30Z', level: 'info', message: 'Initiating retry attempt 2' },
          { timestamp: '2024-01-20T10:32:00Z', level: 'info', message: 'Retry attempt 2 succeeded' },
          { timestamp: '2024-01-20T10:32:15Z', level: 'info', message: 'Execution completed successfully' }
        ]
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(execution, null, 2));
      } else if (options.format === 'yaml') {
        console.log(`# Execution ${execution.id}`);
        console.log(`workflow: ${execution.workflowId}`);
        console.log(`status: ${execution.status}`);
        console.log(`started: ${execution.startedAt}`);
        console.log(`completed: ${execution.completedAt}`);
        console.log(`input: ${JSON.stringify(execution.input)}`);
        console.log(`output: ${JSON.stringify(execution.output)}`);
      } else {
        // Table format
        console.log(chalk.white('Execution Details:'));
        console.log();
        console.log(chalk.gray('ID:'), chalk.white(execution.id));
        console.log(chalk.gray('Workflow ID:'), chalk.white(execution.workflowId));
        console.log(chalk.gray('Status:'), 
          execution.status === 'completed' ? chalk.green(execution.status) : 
          execution.status === 'running' ? chalk.blue(execution.status) : 
          execution.status === 'failed' ? chalk.red(execution.status) : chalk.yellow(execution.status));
        console.log(chalk.gray('Started:'), chalk.white(new Date(execution.startedAt).toLocaleString()));
        console.log(chalk.gray('Completed:'), chalk.white(execution.completedAt ? new Date(execution.completedAt).toLocaleString() : 'N/A'));
        
        if (execution.completedAt) {
          const duration = Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000);
          console.log(chalk.gray('Duration:'), chalk.white(`${duration} seconds`));
        }
        
        console.log();
        console.log(chalk.blue('Input:'));
        console.log(chalk.white(JSON.stringify(execution.input, null, 2)));
        
        if (execution.output) {
          console.log();
          console.log(chalk.blue('Output:'));
          console.log(chalk.white(JSON.stringify(execution.output, null, 2)));
        }
        
        if (execution.error) {
          console.log();
          console.log(chalk.red('Error:'));
          console.log(chalk.white(execution.error));
        }
        
        // Show logs if requested
        if (options.logs && execution.logs) {
          console.log();
          console.log(chalk.blue('Execution Logs:'));
          execution.logs.forEach(log => {
            const levelColor = log.level === 'error' ? chalk.red : 
                            log.level === 'warn' ? chalk.yellow : 
                            log.level === 'info' ? chalk.blue : chalk.gray;
            console.log(
              chalk.gray(`[${log.timestamp}]`) +
              levelColor(` ${log.level.toUpperCase()}`) +
              chalk.white(`: ${log.message}`)
            );
          });
        }
        
        // Show steps if requested
        if (options.steps) {
          console.log();
          console.log(chalk.blue('Execution Steps:'));
          console.log(chalk.gray('Step 1: Receive payment event - completed'));
          console.log(chalk.gray('Step 2: Wait 5 minutes - completed'));
          console.log(chalk.gray('Step 3: Retry payment - completed'));
        }
        
        // Show data only if specifically requested
        if (options.data) {
          console.log();
          console.log(chalk.blue('Input Data:'));
          console.log(chalk.white(JSON.stringify(execution.input, null, 2)));
          
          if (execution.output) {
            console.log();
            console.log(chalk.blue('Output Data:'));
            console.log(chalk.white(JSON.stringify(execution.output, null, 2)));
          }
        } else if (!options.logs && !options.steps) {
          // Show basic input/output by default
          console.log();
          console.log(chalk.blue('Input:'));
          console.log(chalk.white(JSON.stringify(execution.input, null, 2)));
          
          if (execution.output) {
            console.log();
            console.log(chalk.blue('Output:'));
            console.log(chalk.white(JSON.stringify(execution.output, null, 2)));
          }
        }
        
        console.log();
        console.log(chalk.blue('Execution Logs:'));
        execution.logs.forEach((log, index) => {
          const levelColor = log.level === 'error' ? chalk.red : 
                           log.level === 'warn' ? chalk.yellow : 
                           log.level === 'info' ? chalk.blue : chalk.gray;
          
          console.log(
            chalk.gray(`[${new Date(log.timestamp).toLocaleTimeString()}]`) +
            levelColor(` [${log.level.toUpperCase()}]`) +
            chalk.white(` ${log.message}`)
          );
        });
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get execution:'), error.message);
      process.exit(1);
    }
  });

// Watch execution command
executionCommands
  .command('watch <execution-id>')
  .description('Watch execution in real-time')
  .option('--logs', 'Show live logs')
  .option('--refresh <seconds>', 'Refresh interval in seconds', '2')
  .action(async (executionId: string, options: any) => {
    console.log(chalk.blue.bold(`👀 Watching Execution: ${executionId}`));
    
    try {
      console.log(chalk.blue('Starting real-time monitoring...'));
      console.log(chalk.gray(`Refresh interval: ${options.refresh} seconds`));
      console.log(chalk.gray('Press Ctrl+C to stop watching'));
      console.log();
      
      let watchCount = 0;
      const maxWatches = 10; // Limit for demo purposes
      
      const watchInterval = setInterval(async () => {
        watchCount++;
        
        // Simulate execution status updates
        const statuses = ['running', 'running', 'running', 'completed'];
        const currentStatus = statuses[Math.min(watchCount - 1, statuses.length - 1)];
        
        const statusColor = currentStatus === 'completed' ? chalk.green : chalk.blue;
        console.log(chalk.gray(`[${new Date().toLocaleTimeString()}]`) + 
                   statusColor(` Status: ${currentStatus}`));
        
        if (options.logs) {
          // Simulate log entries
          const logMessages = [
            'Processing payment retry...',
            'Contacting payment gateway...',
            'Payment gateway response received',
            'Retry attempt successful',
            'Execution completed'
          ];
          
          if (watchCount <= logMessages.length) {
            console.log(chalk.gray(`[${new Date().toLocaleTimeString()}]`) + 
                       chalk.blue(` [INFO] ${logMessages[watchCount - 1]}`));
          }
        }
        
        if (currentStatus === 'completed' || watchCount >= maxWatches) {
          clearInterval(watchInterval);
          console.log();
          console.log(chalk.green('✅ Execution completed or watch limit reached'));
          console.log(chalk.gray('Watching stopped'));
        }
      }, parseInt(options.refresh) * 1000);
      
      // Handle Ctrl+C
      process.on('SIGINT', () => {
        clearInterval(watchInterval);
        console.log();
        console.log(chalk.yellow('⚠️  Watching stopped by user'));
        process.exit(0);
      });
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to watch execution:'), error.message);
      process.exit(1);
    }
  });

// Cancel execution command
executionCommands
  .command('cancel <execution-ids...>')
  .description('Cancel execution(s)')
  .option('--force', 'Force cancel without confirmation')
  .action(async (executionIds: string[], options: any) => {
    console.log(chalk.blue.bold('❌ Cancelling Executions'));
    
    try {
      if (!options.force) {
        const inquirer = await import('inquirer');
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to cancel ${executionIds.length} execution(s)?`,
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log(chalk.yellow('❌ Cancellation cancelled'));
          return;
        }
      }
      
      for (const executionId of executionIds) {
        // Simulate API call
        console.log(chalk.green(`✅ Cancelled execution: ${executionId}`));
      }
      
      console.log(chalk.green(`Successfully cancelled ${executionIds.length} execution(s)`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to cancel executions:'), error.message);
      process.exit(1);
    }
  });

// Retry execution command
executionCommands
  .command('retry <execution-id>')
  .description('Retry failed execution')
  .option('--with-new-data', 'Prompt for new input data')
  .action(async (executionId: string, options: any) => {
    console.log(chalk.blue.bold(`🔄 Retrying Execution: ${executionId}`));
    
    try {
      let newInputData: any = null;
      
      if (options.withNewData) {
        const inquirer = await import('inquirer');
        const { inputData } = await inquirer.default.prompt([
          {
            type: 'input',
            name: 'inputData',
            message: 'Enter new input data (JSON):',
            default: '{"retry": true}'
          }
        ]);
        
        try {
          newInputData = JSON.parse(inputData);
        } catch (e) {
          console.error(chalk.red('❌ Invalid JSON format'));
          process.exit(1);
        }
      }
      
      // Simulate retry
      const newExecutionId = `exec_${Date.now()}`;
      
      console.log(chalk.green('✅ Execution retry started!'));
      console.log(chalk.gray(`New Execution ID: ${newExecutionId}`));
      console.log(chalk.gray(`Original Execution: ${executionId}`));
      
      if (newInputData) {
        console.log(chalk.gray('New Input:'), JSON.stringify(newInputData));
      }
      
      console.log(chalk.blue('📊 Check status with: torqvio executions get', newExecutionId));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to retry execution:'), error.message);
      process.exit(1);
    }
  });

export { executionCommands };
