import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';

export function createDemoCommand(): Command {
  const command = new Command('demo')
    .description('Run a live demo of Torqvio payment recovery')
    .option('--scenario <type>', 'Demo scenario to run', 'payment-failure')
    .action(async (options) => {
      console.log(chalk.blue.bold('🎬 Torqvio Demo - Payment Recovery Magic'));
      console.log(chalk.gray('This demo simulates a real payment failure and recovery.\n'));

      if (options.scenario === 'payment-failure') {
        await runPaymentFailureDemo();
      }
    });

  return command;
}

async function runPaymentFailureDemo(): Promise<void> {
  // Step 1: Simulate payment failure
  console.log(chalk.yellow('📱 Simulating payment failure...'));
  
  const failureData = {
    paymentIntentId: 'pi_demo_123456789',
    customerId: 'cus_demo_abc123',
    amount: 49.99,
    currency: 'EUR',
    failureReason: 'card_declined',
    timestamp: new Date().toISOString()
  };

  await sleep(2000);
  
  console.log(chalk.red(`❌ Payment failed: €${failureData.amount}`));
  console.log(chalk.gray(`Customer: ${failureData.customerId}`));
  console.log(chalk.gray(`Reason: ${failureData.failureReason}\n`));

  // Step 2: Show Torqvio detection
  console.log(chalk.blue('🔍 Torqvio detects payment failure...'));
  await sleep(1500);
  console.log(chalk.green('✅ Payment Recovery workflow triggered\n'));

  // Step 3: Show retry attempts with live counter
  console.log(chalk.magenta('🔄 Starting recovery sequence...'));
  
  let totalRecovered = 0;
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(chalk.yellow(`Attempt ${attempt}/3...`));
    
    // Simulate retry delay
    await sleep(1000 * attempt);
    
    // Final attempt succeeds
    if (attempt === 3) {
      totalRecovered += failureData.amount;
      
      displayRecoverySuccess({
        amount: failureData.amount,
        customerId: failureData.customerId,
        totalRecoveredToday: totalRecovered,
        retryAttempt: attempt
      });
      
      console.log(chalk.green.bold('\n🎉 Demo Complete!'));
      console.log(chalk.gray('Torqvio just saved you €49.99 that would have been lost.'));
      
      // Show cumulative effect
      await showCumulativeEffect();
      break;
    } else {
      console.log(chalk.red(`❌ Retry ${attempt} failed, trying again...`));
    }
  }

  // Step 4: Call to action
  console.log(chalk.blue.bold('\n🚀 Ready to protect your revenue?'));
  console.log(chalk.gray('Deploy Torqvio with: npx torqvio deploy payment-recovery'));
}

async function showCumulativeEffect(): Promise<void> {
  console.log(chalk.blue('\n📊 Scaling this effect:'));
  
  const scenarios = [
    { payments: 10, daily: 499.90, monthly: 14997 },
    { payments: 50, daily: 2499.50, monthly: 74985 },
    { payments: 100, daily: 4999.00, monthly: 149970 }
  ];

  scenarios.forEach(scenario => {
    console.log(chalk.gray(`${scenario.payments} failed payments/day → `) + 
               chalk.green.bold(`€${scenario.daily.toLocaleString()}/day → €${scenario.monthly.toLocaleString()}/month`));
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function displayRecoverySuccess(recoveryData: {
  amount: number;
  customerId: string;
  totalRecoveredToday: number;
  retryAttempt: number;
}): void {
  const message = `
${chalk.green('✔')} Payment recovered: ${chalk.bold(`€${recoveryData.amount}`)}
${chalk.blue('✔')} Customer retained: ${chalk.bold(recoveryData.customerId)}
${chalk.yellow('✔')} Total recovered today: ${chalk.bold(`€${recoveryData.totalRecoveredToday}`)}
${chalk.magenta('✔')} Recovery attempt: ${chalk.bold(`#${recoveryData.retryAttempt}`)}
  `.trim();

  console.log(boxen(message, {
    padding: 1,
    borderColor: 'green',
    borderStyle: 'round',
    title: '💰 PAYMENT RECOVERED',
    titleAlignment: 'center'
  }));
}

export function displayLiveCounter(amount: number): void {
  const message = `${chalk.green.bold('€' + amount.toLocaleString())} recovered so far`;
  
  // Clear line and display counter
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`💰 Live Recovery Counter: ${message}`);
}
