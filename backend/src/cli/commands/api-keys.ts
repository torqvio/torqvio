#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { loadConfig } from './config.js';

const apiKeysCommands = new Command('api-keys');

apiKeysCommands.description('Manage API keys for programmatic access');

function getClient() {
  const { config } = loadConfig();
  const apiUrl = config.api?.url || process.env.BASE_URL || 'http://localhost:8459';
  const apiKey = config.auth?.api_key || process.env.TORQVIO_API_KEY;
  const token = config.auth?.token;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  else if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  return { client: axios.create({ baseURL: apiUrl, headers }), apiUrl };
}

// CREATE
apiKeysCommands
  .command('create')
  .description('Create a new API key')
  .requiredOption('--name <name>', 'Descriptive name for the API key')
  .option('--permissions <perms>', 'Comma-separated permissions: read,write,execute,admin', 'read')
  .option('--expires <duration>', 'Expiry duration, e.g. 30d, 12h, 60m')
  .action(async (options: { name: string; permissions: string; expires?: string }) => {
    console.log(chalk.blue.bold('🔑 Creating API Key'));

    try {
      const { client } = getClient();
      const permissions = options.permissions.split(',').map(p => p.trim());
      const body: any = { name: options.name, permissions };
      if (options.expires) body.expires = options.expires;

      const { data } = await client.post('/api/v1/api-keys', body);

      console.log(chalk.green('\n✅ API key created successfully'));
      console.log(chalk.yellow('\n⚠️  Save this key now — it will not be shown again:\n'));
      console.log(chalk.white.bold(`   ${data.key}`));
      console.log('');
      console.log(chalk.gray(`   ID:          ${data.id}`));
      console.log(chalk.gray(`   Name:        ${data.name}`));
      console.log(chalk.gray(`   Permissions: ${data.permissions.join(', ')}`));
      if (data.expires_at) {
        console.log(chalk.gray(`   Expires:     ${new Date(data.expires_at).toLocaleString()}`));
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      console.error(chalk.red('❌ Failed to create API key:'), msg);
      process.exit(1);
    }
  });

// LIST
apiKeysCommands
  .command('list')
  .description('List all API keys')
  .action(async () => {
    console.log(chalk.blue.bold('📋 API Keys'));

    try {
      const { client } = getClient();
      const { data } = await client.get('/api/v1/api-keys');
      const keys = data.api_keys;

      if (!keys.length) {
        console.log(chalk.gray('\nNo API keys found. Create one with: torqvio api-keys create --name "My Key"'));
        return;
      }

      console.log('');
      for (const key of keys) {
        const status = key.is_active ? chalk.green('active') : chalk.red('revoked');
        const expiry = key.expires_at
          ? chalk.yellow(new Date(key.expires_at).toLocaleDateString())
          : chalk.gray('never');
        const lastUsed = key.last_used_at
          ? new Date(key.last_used_at).toLocaleDateString()
          : chalk.gray('never');

        console.log(`  ${chalk.white.bold(key.name)}`);
        console.log(`    ${chalk.gray('ID:')}          ${key.id}`);
        console.log(`    ${chalk.gray('Prefix:')}      ${key.key_prefix}...`);
        console.log(`    ${chalk.gray('Permissions:')} ${key.permissions.join(', ')}`);
        console.log(`    ${chalk.gray('Status:')}      ${status}`);
        console.log(`    ${chalk.gray('Expires:')}     ${expiry}`);
        console.log(`    ${chalk.gray('Last used:')}   ${lastUsed}`);
        console.log('');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      console.error(chalk.red('❌ Failed to list API keys:'), msg);
      process.exit(1);
    }
  });

// ROTATE
apiKeysCommands
  .command('rotate <key-id>')
  .description('Rotate an API key, issuing a new value while keeping the same settings')
  .action(async (keyId: string) => {
    console.log(chalk.blue.bold('🔄 Rotating API Key'));

    try {
      const { client } = getClient();
      const { data } = await client.post(`/api/v1/api-keys/${keyId}/rotate`);

      console.log(chalk.green('\n✅ API key rotated successfully'));
      console.log(chalk.yellow('\n⚠️  Save the new key now — it will not be shown again:\n'));
      console.log(chalk.white.bold(`   ${data.key}`));
      console.log('');
      console.log(chalk.gray(`   Name:    ${data.name}`));
      console.log(chalk.gray(`   Prefix:  ${data.key_prefix}...`));
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      console.error(chalk.red('❌ Failed to rotate API key:'), msg);
      process.exit(1);
    }
  });

// DELETE / REVOKE
apiKeysCommands
  .command('delete <key-id>')
  .alias('revoke')
  .description('Revoke an API key')
  .action(async (keyId: string) => {
    console.log(chalk.blue.bold('🗑️  Revoking API Key'));

    try {
      const { client } = getClient();
      const { data } = await client.delete(`/api/v1/api-keys/${keyId}`);
      console.log(chalk.green(`✅ ${data.message}`));
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      console.error(chalk.red('❌ Failed to revoke API key:'), msg);
      process.exit(1);
    }
  });

export { apiKeysCommands };
