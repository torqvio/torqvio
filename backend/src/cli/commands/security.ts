#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadConfig, saveConfig, setNestedProperty, getNestedProperty } from './config.js';

const securityCommands = new Command('security');

securityCommands
  .description('Security configuration commands');

// List security settings command
securityCommands
  .command('list')
  .description('List all security settings')
  .option('--format <format>', 'Output format (json, table, yaml)', 'table')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🔒 Security Configuration'));
    
    try {
      const { config } = loadConfig();
      
      // Get security settings from configuration or use defaults
      const security = {
        ssl: config.ssl || {
          enabled: false,
          verify_certificates: true
        },
        encryption: config.encryption || {
          algorithm: 'AES-256-GCM',
          key_derivation: 'PBKDF2'
        },
        access_control: config.access_control || {
          ip_whitelist: [],
          ip_blacklist: [],
          rate_limiting: {
            enabled: false,
            requests_per_minute: 60
          }
        }
      };

      if (options.format === 'json') {
        console.log(JSON.stringify(security, null, 2));
      } else if (options.format === 'yaml') {
        console.log('# Security Configuration');
        console.log('ssl:');
        console.log(`  enabled: ${security.ssl.enabled}`);
        console.log(`  verify_certificates: ${security.ssl.verify_certificates}`);
        if (security.ssl.ca_file) console.log(`  ca_file: ${security.ssl.ca_file}`);
        console.log('encryption:');
        console.log(`  algorithm: ${security.encryption.algorithm}`);
        console.log(`  key_derivation: ${security.encryption.key_derivation}`);
        console.log('access_control:');
        console.log(`  ip_whitelist: [${security.access_control?.ip_whitelist?.join(', ') || ''}]`);
        console.log(`  ip_blacklist: [${security.access_control?.ip_blacklist?.join(', ') || ''}]`);
        console.log('  rate_limiting:');
        console.log(`    enabled: ${security.access_control?.rate_limiting?.enabled ?? false}`);
        console.log(`    requests_per_minute: ${security.access_control?.rate_limiting?.requests_per_minute ?? 60}`);
      } else {
        console.log(chalk.white('SSL/TLS Settings:'));
        console.log(chalk.gray(`  Enabled: ${security.ssl.enabled ? 'Yes' : 'No'}`));
        console.log(chalk.gray(`  Verify Certificates: ${security.ssl.verify_certificates ? 'Yes' : 'No'}`));
        if (security.ssl.ca_file) console.log(chalk.gray(`  CA File: ${security.ssl.ca_file}`));
        if (security.ssl.client_cert?.enabled) {
          console.log(chalk.gray(`  Client Cert: Enabled`));
          console.log(chalk.gray(`    Cert File: ${security.ssl.client_cert.cert_file}`));
          console.log(chalk.gray(`    Key File: ${security.ssl.client_cert.key_file}`));
        }
        console.log();
        
        console.log(chalk.white('Encryption Settings:'));
        console.log(chalk.gray(`  Algorithm: ${security.encryption.algorithm}`));
        console.log(chalk.gray(`  Key Derivation: ${security.encryption.key_derivation}`));
        if (security.encryption.secrets) {
          console.log(chalk.gray(`  Key Rotation: ${security.encryption.secrets.key_rotation_days || 'Not set'} days`));
        }
        if (security.encryption.at_rest) {
          console.log(chalk.gray(`  At Rest: ${security.encryption.at_rest.enabled ? 'Enabled' : 'Disabled'}`));
        }
        console.log();
        
        console.log(chalk.white('Access Control:'));
        console.log(chalk.gray(`  IP Whitelist: ${security.access_control?.ip_whitelist?.length || 0} entries`));
        if (security.access_control?.ip_whitelist?.length) {
          security.access_control.ip_whitelist.forEach(ip => {
            console.log(chalk.gray(`    - ${ip}`));
          });
        }
        console.log(chalk.gray(`  IP Blacklist: ${security.access_control?.ip_blacklist?.length || 0} entries`));
        if (security.access_control?.ip_blacklist?.length) {
          security.access_control.ip_blacklist.forEach(ip => {
            console.log(chalk.gray(`    - ${ip}`));
          });
        }
        console.log(chalk.gray(`  Rate Limiting: ${security.access_control?.rate_limiting?.enabled ? 'Enabled' : 'Disabled'}`));
        if (security.access_control?.rate_limiting?.enabled) {
          console.log(chalk.gray(`    Requests/min: ${security.access_control.rate_limiting.requests_per_minute}`));
        }
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to list security settings:'), error.message);
      process.exit(1);
    }
  });

// SSL configuration command
securityCommands
  .command('ssl')
  .description('Configure SSL/TLS settings')
  .option('--enable', 'Enable SSL/TLS')
  .option('--disable', 'Disable SSL/TLS')
  .option('--verify-certificates <bool>', 'Verify SSL certificates (true/false)', 'true')
  .option('--ca-file <path>', 'Path to CA certificate file')
  .option('--client-cert <path>', 'Path to client certificate file')
  .option('--client-key <path>', 'Path to client private key file')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🔐 SSL/TLS Configuration'));
    
    try {
      const { config } = loadConfig();
      
      // Initialize SSL configuration if it doesn't exist
      if (!config.ssl) {
        setNestedProperty(config, 'ssl', {});
      }
      
      // Apply SSL settings
      if (options.enable) {
        setNestedProperty(config, 'ssl.enabled', true);
        console.log(chalk.green('✅ SSL/TLS enabled'));
      } else if (options.disable) {
        setNestedProperty(config, 'ssl.enabled', false);
        console.log(chalk.yellow('⚠️ SSL/TLS disabled'));
      }
      
      if (options.verifyCertificates !== undefined) {
        const verify = options.verifyCertificates === 'true';
        setNestedProperty(config, 'ssl.verify_certificates', verify);
        console.log(chalk.gray(`Certificate verification: ${verify ? 'Enabled' : 'Disabled'}`));
      }
      
      if (options.caFile) {
        setNestedProperty(config, 'ssl.ca_file', options.caFile);
        console.log(chalk.gray(`CA file: ${options.caFile}`));
      }
      
      if (options.clientCert || options.clientKey) {
        if (!options.clientCert || !options.clientKey) {
          console.error(chalk.red('❌ Both --client-cert and --client-key must be provided'));
          process.exit(1);
        }
        setNestedProperty(config, 'ssl.client_cert', {
          enabled: true,
          cert_file: options.clientCert,
          key_file: options.clientKey
        });
        console.log(chalk.green('✅ Client certificate configured'));
      }
      
      // Save configuration
      saveConfig(config);
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to configure SSL/TLS:'), error.message);
      process.exit(1);
    }
  });

// Encryption configuration command
securityCommands
  .command('encryption')
  .description('Configure encryption settings')
  .option('--algorithm <algo>', 'Encryption algorithm', 'AES-256-GCM')
  .option('--key-derivation <method>', 'Key derivation method', 'PBKDF2')
  .option('--rotation-days <days>', 'Key rotation interval in days')
  .option('--at-rest <bool>', 'Enable at-rest encryption (true/false)', 'false')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🔐 Encryption Configuration'));
    
    try {
      const { config } = loadConfig();
      
      // Initialize encryption configuration if it doesn't exist
      if (!config.encryption) {
        setNestedProperty(config, 'encryption', {});
      }
      
      // Apply encryption settings
      setNestedProperty(config, 'encryption.algorithm', options.algorithm);
      console.log(chalk.gray(`Algorithm: ${options.algorithm}`));
      
      setNestedProperty(config, 'encryption.key_derivation', options.keyDerivation);
      console.log(chalk.gray(`Key derivation: ${options.keyDerivation}`));
      
      if (options.rotationDays) {
        const days = parseInt(options.rotationDays);
        if (!config.encryption?.secrets) {
          setNestedProperty(config, 'encryption.secrets', {});
        }
        setNestedProperty(config, 'encryption.secrets.key_rotation_days', days);
        console.log(chalk.gray(`Key rotation: ${days} days`));
      }
      
      const atRest = options.atRest === 'true';
      if (!config.encryption?.at_rest) {
        setNestedProperty(config, 'encryption.at_rest', {});
      }
      setNestedProperty(config, 'encryption.at_rest.enabled', atRest);
      setNestedProperty(config, 'encryption.at_rest.algorithm', options.algorithm);
      console.log(chalk.gray(`At-rest encryption: ${atRest ? 'Enabled' : 'Disabled'}`));
      
      // Save configuration
      saveConfig(config);
      console.log(chalk.green('✅ Encryption configuration updated'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to configure encryption:'), error.message);
      process.exit(1);
    }
  });

// Access control configuration command
securityCommands
  .command('access-control')
  .description('Configure access control settings')
  .option('--whitelist-add <ip>', 'Add IP to whitelist')
  .option('--whitelist-remove <ip>', 'Remove IP from whitelist')
  .option('--blacklist-add <ip>', 'Add IP to blacklist')
  .option('--blacklist-remove <ip>', 'Remove IP from blacklist')
  .option('--rate-limit <count>', 'Rate limit requests per minute')
  .option('--enable-rate-limit', 'Enable rate limiting')
  .option('--disable-rate-limit', 'Disable rate limiting')
  .action(async (options: any) => {
    console.log(chalk.blue.bold('🛡️ Access Control Configuration'));
    
    try {
      const { config } = loadConfig();
      
      // Initialize access control configuration if it doesn't exist
      if (!config.access_control) {
        setNestedProperty(config, 'access_control', {
          ip_whitelist: [],
          ip_blacklist: [],
          rate_limiting: {
            enabled: false,
            requests_per_minute: 60
          }
        });
      }
      
      // Initialize rate limiting if it doesn't exist
      if (!config.access_control?.rate_limiting) {
        setNestedProperty(config, 'access_control.rate_limiting', {
          enabled: false,
          requests_per_minute: 60
        });
      }
      
      // Manage IP whitelist
      if (options.whitelistAdd) {
        const accessControl = config.access_control;
        if (!accessControl?.ip_whitelist) {
          setNestedProperty(config, 'access_control.ip_whitelist', []);
        }
        (config.access_control as any).ip_whitelist.push(options.whitelistAdd);
        console.log(chalk.green(`✅ Added ${options.whitelistAdd} to whitelist`));
      }
      
      if (options.whitelistRemove) {
        const accessControl = config.access_control;
        if (accessControl?.ip_whitelist) {
          const index = accessControl.ip_whitelist.indexOf(options.whitelistRemove);
          if (index > -1) {
            accessControl.ip_whitelist.splice(index, 1);
            console.log(chalk.green(`✅ Removed ${options.whitelistRemove} from whitelist`));
          } else {
            console.log(chalk.yellow(`⚠️ IP ${options.whitelistRemove} not in whitelist`));
          }
        }
      }
      
      // Manage IP blacklist
      if (options.blacklistAdd) {
        const accessControl = config.access_control;
        if (!accessControl?.ip_blacklist) {
          setNestedProperty(config, 'access_control.ip_blacklist', []);
        }
        (config.access_control as any).ip_blacklist.push(options.blacklistAdd);
        console.log(chalk.green(`✅ Added ${options.blacklistAdd} to blacklist`));
      }
      
      if (options.blacklistRemove) {
        const accessControl = config.access_control;
        if (accessControl?.ip_blacklist) {
          const index = accessControl.ip_blacklist.indexOf(options.blacklistRemove);
          if (index > -1) {
            accessControl.ip_blacklist.splice(index, 1);
            console.log(chalk.green(`✅ Removed ${options.blacklistRemove} from blacklist`));
          } else {
            console.log(chalk.yellow(`⚠️ IP ${options.blacklistRemove} not in blacklist`));
          }
        }
      }
      
      // Manage rate limiting
      if (options.rateLimit) {
        const limit = parseInt(options.rateLimit);
        setNestedProperty(config, 'access_control.rate_limiting.requests_per_minute', limit);
        console.log(chalk.gray(`Rate limit: ${limit} requests/minute`));
      }
      
      if (options.enableRateLimit) {
        setNestedProperty(config, 'access_control.rate_limiting.enabled', true);
        console.log(chalk.green('✅ Rate limiting enabled'));
      }
      
      if (options.disableRateLimit) {
        setNestedProperty(config, 'access_control.rate_limiting.enabled', false);
        console.log(chalk.yellow('⚠️ Rate limiting disabled'));
      }
      
      // Save configuration
      saveConfig(config);
      
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to configure access control:'), error.message);
      process.exit(1);
    }
  });

export { securityCommands };
