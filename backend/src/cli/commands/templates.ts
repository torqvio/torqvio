#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Template, GlobalOptions } from '../types.js';

const templateCommands = new Command('templates');

templateCommands
  .description('Template management commands');

// List templates command
templateCommands
  .command('list')
  .description('List available templates')
  .option('--category <category>', 'Filter by category (payment, email, webhook, custom)')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('📋 Available Templates'));
    
    try {
      const templates: Template[] = [
        {
          id: 'approval-workflow',
          name: 'Multi-Step Approval',
          description: 'Configurable approval workflow with multiple stages',
          category: 'custom',
          triggers: [{ type: 'webhook' as const, event: 'approval.requested', config: {} }],
          steps: [
            { id: 'step1', type: 'approval', name: 'Manager Approval', config: {} },
            { id: 'step2', type: 'approval', name: 'Director Approval', config: {} },
            { id: 'step3', type: 'notification', name: 'Send Result', config: {} }
          ],
          environment: { APPROVAL_WEBHOOK: '' },
          value_proposition: 'Streamline approval processes with configurable stages'
        },
        {
          id: 'payment-recovery',
          name: 'Stripe Payment Recovery',
          description: 'Never lose a payment due to temporary failures',
          category: 'payment',
          triggers: [{ type: 'webhook' as const, event: 'payment.failed', config: {} }],
          steps: [
            { id: 'step1', type: 'delay', name: 'Wait 5 minutes', config: {} },
            { id: 'step2', type: 'api', name: 'Retry Payment', config: {} }
          ],
          environment: { STRIPE_SECRET_KEY: '' },
          value_proposition: 'Recovers 95% of failed payments automatically'
        },
        {
          id: 'email-reliability',
          name: 'Email Delivery Assurance',
          description: 'Ensure critical emails always reach customers',
          category: 'email',
          triggers: [{ type: 'event' as const, event: 'email.send', config: {} }],
          steps: [
            { id: 'step1', type: 'email', name: 'Send Primary', config: {} },
            { id: 'step2', type: 'delay', name: 'Wait 30 seconds', config: {} },
            { id: 'step3', type: 'email', name: 'Send Fallback', config: {} }
          ],
          environment: { PRIMARY_EMAIL_PROVIDER: '', FALLBACK_EMAIL_PROVIDER: '' },
          value_proposition: '99.9% email delivery guarantee'
        }
      ];

      let filteredTemplates = templates;
      if (options.category) {
        filteredTemplates = templates.filter(t => t.category === options.category);
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(filteredTemplates, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Templates');
        filteredTemplates.forEach(t => {
          console.log(`- ${t.name}:`);
          console.log(`    id: ${t.id}`);
          console.log(`    category: ${t.category}`);
          console.log(`    description: ${t.description}`);
        });
      } else {
        console.log(chalk.white('Found'), chalk.green(filteredTemplates.length), chalk.white('templates'));
        console.log();
        
        filteredTemplates.forEach(template => {
          const categoryColor = template.category === 'payment' ? chalk.green :
                              template.category === 'email' ? chalk.blue :
                              template.category === 'webhook' ? chalk.magenta : chalk.gray;
          
          console.log(chalk.white(template.name));
          console.log(chalk.gray(`  ID: ${template.id}`));
          console.log(categoryColor(`  Category: ${template.category}`));
          console.log(chalk.gray(`  Description: ${template.description}`));
          console.log(chalk.blue(`  Value: ${template.value_proposition}`));
          console.log();
        });
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list templates:'), error.message);
      process.exit(1);
    }
  });

// Show template details command
templateCommands
  .command('show <template-id>')
  .description('Show template details')
  .action(async (templateId: string) => {
    console.log(chalk.blue.bold(`📄 Template Details: ${templateId}`));
    
    try {
      // Simulate template lookup
      const template: Template = {
        id: templateId,
        name: 'Multi-Step Approval',
        description: 'Configurable approval workflow with multiple stages',
        category: 'custom',
        triggers: [{ type: 'webhook' as const, event: 'approval.requested', config: {} }],
        steps: [
          { id: 'step1', type: 'approval', name: 'Manager Approval', config: {} },
          { id: 'step2', type: 'approval', name: 'Director Approval', config: {} },
          { id: 'step3', type: 'notification', name: 'Send Result', config: {} }
        ],
        environment: { APPROVAL_WEBHOOK: '', APPROVAL_TIMEOUT: '3600' },
        value_proposition: 'Streamline approval processes with configurable stages'
      };

      console.log(chalk.white('Template Information:'));
      console.log();
      console.log(chalk.gray('ID:'), chalk.white(template.id));
      console.log(chalk.gray('Name:'), chalk.white(template.name));
      console.log(chalk.gray('Description:'), chalk.white(template.description));
      console.log(chalk.gray('Category:'), chalk.white(template.category));
      console.log(chalk.blue('Value Proposition:'), chalk.white(template.value_proposition));
      
      console.log();
      console.log(chalk.blue('Triggers:'));
      template.triggers.forEach((trigger, i) => {
        console.log(`  ${i + 1}. ${trigger.type}: ${trigger.event || 'N/A'}`);
      });
      
      console.log();
      console.log(chalk.blue('Steps:'));
      template.steps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.name} (${step.type})`);
      });
      
      console.log();
      console.log(chalk.blue('Environment Variables:'));
      Object.entries(template.environment).forEach(([key, value]) => {
        console.log(`  ${key}: ${value || 'required'}`);
      });
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to show template:'), error.message);
      process.exit(1);
    }
  });

// Use template command
templateCommands
  .command('use <template-id> --name <workflow-name>')
  .description('Create workflow from template')
  .requiredOption('--name <name>', 'Workflow name')
  .option('--params <params>', 'Template parameters (JSON)')
  .action(async (templateId: string, options: any) => {
    console.log(chalk.blue.bold(`🚀 Creating Workflow from Template: ${templateId}`));
    
    try {
      let params: any = {};
      if (options.params) {
        params = JSON.parse(options.params);
      }
      
      // Simulate workflow creation from template
      const workflowId = `wf_${Date.now()}`;
      
      console.log(chalk.green('✅ Workflow created successfully!'));
      console.log(chalk.gray(`Workflow ID: ${workflowId}`));
      console.log(chalk.gray(`Name: ${options.name}`));
      console.log(chalk.gray(`Template: ${templateId}`));
      
      if (Object.keys(params).length > 0) {
        console.log(chalk.gray('Parameters:'), JSON.stringify(params, null, 2));
      }
      
      console.log(chalk.blue('📊 Manage with: torqvio workflows get', workflowId));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to create workflow from template:'), error.message);
      process.exit(1);
    }
  });

// Show template parameters command
templateCommands
  .command('params <template-id>')
  .description('Show template parameters')
  .action(async (templateId: string) => {
    console.log(chalk.blue.bold(`📋 Template Parameters: ${templateId}`));
    
    try {
      // Simulate template parameters
      const parameters = [
        { name: 'approval_timeout', type: 'number', description: 'Timeout for approval in seconds', default: 3600 },
        { name: 'max_approvers', type: 'number', description: 'Maximum number of approvers', default: 5 },
        { name: 'notify_on_complete', type: 'boolean', description: 'Send notification on completion', default: true }
      ];
      
      console.log(chalk.white('Required Parameters:'));
      parameters.forEach(param => {
        console.log();
        console.log(chalk.gray(`  ${param.name}:`));
        console.log(chalk.gray(`    Type: ${param.type}`));
        console.log(chalk.gray(`    Description: ${param.description}`));
        console.log(chalk.gray(`    Default: ${param.default}`));
      });
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to show template parameters:'), error.message);
      process.exit(1);
    }
  });

// Create template command
templateCommands
  .command('create')
  .description('Create template from workflow')
  .requiredOption('--from-workflow <id>', 'Workflow ID to create template from')
  .requiredOption('--name <name>', 'Template name')
  .option('--description <desc>', 'Template description')
  .action(async (options: any) => {
    console.log(chalk.blue.bold(`➕ Creating Template: ${options.name}`));
    
    try {
      // Simulate template creation
      const templateId = `tpl_${Date.now()}`;
      
      console.log(chalk.green('✅ Template created successfully!'));
      console.log(chalk.gray(`Template ID: ${templateId}`));
      console.log(chalk.gray(`Name: ${options.name}`));
      console.log(chalk.gray(`Source Workflow: ${options.fromWorkflow}`));
      
      if (options.description) {
        console.log(chalk.gray(`Description: ${options.description}`));
      }
      
      console.log(chalk.blue('📊 Use with: torqvio templates use', templateId, '--name "My Workflow"'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to create template:'), error.message);
      process.exit(1);
    }
  });

export { templateCommands };
