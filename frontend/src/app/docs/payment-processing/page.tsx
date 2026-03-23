'use client'

import { motion } from 'framer-motion'
import { CreditCard, Shield, CheckCircle, ArrowRight, Copy, Play, Terminal, AlertCircle, Zap, Clock, Settings, Globe, Key, Link2, Server, Database, RefreshCw, Eye, EyeOff, Lock, Unlock, Send, Receive, FileText, GitBranch, Activity, Bell, Plug, Cpu, DollarSign, Receipt, Banknote, Building, PiggyBank, TrendingUp, AlertTriangle, FileCheck, Wallet } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Payment Processing

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Payment processing in Torqvio enables you to build reliable, scalable financial workflows that handle transactions, subscriptions, refunds, and compliance with enterprise-grade security and durability.

## Architecture Overview

### Payment Flow
\`\`\`
Customer → Payment Gateway → Torqvio → Your Application
    ↓              ↓              ↓              ↓
Initiate → Process Payment → Update State → Fulfill Order
\`\`\`

### Core Components
1. **Payment Gateway Integration** - Connect with Stripe, PayPal, and other providers
2. **Transaction Management** - Track and manage payment states
3. **Compliance Engine** - Handle PCI DSS, GDPR, and financial regulations
4. **Reconciliation System** - Match transactions with external records

## Supported Payment Providers

### Stripe Integration
\`\`\`javascript
const stripe = require('stripe')('sk_test_...')

// Create payment intent
async function createPaymentIntent(amount, currency = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency,
      metadata: {
        workflow_id: 'wf_payment_processing',
        customer_id: 'cust_123456'
      }
    })
    
    // Trigger Torqvio workflow
    await triggerWorkflow('payment-processing', {
      payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: currency,
      status: 'requires_payment_method'
    })
    
    return paymentIntent
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    throw error
  }
}
\`\`\`

### PayPal Integration
\`\`\`javascript
const paypal = require('@paypal/checkout-server-sdk')

// Create PayPal order
async function createPayPalOrder(amount, currency = 'USD') {
  const request = new paypal.orders.OrdersCreateRequest()
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toString()
      },
      custom_id: 'workflow_payment_processing'
    }]
  })
  
  try {
    const order = await paypalClient.execute(request)
    
    // Trigger Torqvio workflow
    await triggerWorkflow('paypal-payment-processing', {
      order_id: order.result.id,
      amount: amount,
      currency: currency,
      status: 'CREATED'
    })
    
    return order.result
  } catch (error) {
    console.error('PayPal order creation failed:', error)
    throw error
  }
}
\`\`\`

## Payment Workflows

### One-Time Payment Workflow
\`\`\`json
{
  "name": "One-Time Payment Processing",
  "description": "Handle single payment transactions with retry logic",
  "steps": [
    {
      "id": "validate_payment",
      "name": "Validate Payment Details",
      "type": "validation",
      "config": {
        "required_fields": ["amount", "currency", "payment_method"],
        "amount_limits": {
          "min": 0.50,
          "max": 10000.00
        }
      }
    },
    {
      "id": "process_payment",
      "name": "Process Payment",
      "type": "payment_gateway",
      "config": {
        "provider": "stripe",
        "retry_count": 3,
        "retry_delay": 1000
      }
    },
    {
      "id": "update_database",
      "name": "Update Transaction Record",
      "type": "database",
      "config": {
        "table": "transactions",
        "operation": "insert"
      }
    },
    {
      "id": "send_confirmation",
      "name": "Send Payment Confirmation",
      "type": "notification",
      "config": {
        "channels": ["email", "sms"],
        "template": "payment_confirmation"
      }
    }
  ]
}
\`\`\`

### Subscription Workflow
\`\`\`json
{
  "name": "Subscription Management",
  "description": "Handle recurring billing and subscription lifecycle",
  "steps": [
    {
      "id": "validate_subscription",
      "name": "Validate Subscription Details",
      "type": "validation",
      "config": {
        "required_fields": ["plan_id", "customer_id", "payment_method"],
        "trial_period_days": 14
      }
    },
    {
      "id": "create_subscription",
      "name": "Create Subscription",
      "type": "payment_gateway",
      "config": {
        "provider": "stripe",
        "operation": "create_subscription"
      }
    },
    {
      "id": "schedule_renewal",
      "name": "Schedule Next Renewal",
      "type": "scheduler",
      "config": {
        "next_run": "next_billing_cycle",
        "workflow": "subscription_renewal"
      }
    },
    {
      "id": "update_user_status",
      "name": "Update User Subscription Status",
      "type": "database",
      "config": {
        "table": "users",
        "operation": "update"
      }
    }
  ]
}
\`\`\`

## Security and Compliance

### PCI DSS Compliance
\`\`\`javascript
// Secure payment tokenization
async function tokenizePaymentMethod(cardDetails) {
  // Never store raw card details
  const { number, cvv, expiry } = cardDetails
  
  try {
    // Use payment gateway tokenization
    const token = await stripe.tokens.create({
      card: {
        number: number,
        exp_month: expiry.split('/')[0],
        exp_year: expiry.split('/')[1],
        cvc: cvv
      }
    })
    
    // Store only the token
    await savePaymentToken(token.id, {
      last4: token.card.last4,
      brand: token.card.brand,
      exp_month: token.card.exp_month,
      exp_year: token.card.exp_year
    })
    
    return token.id
  } catch (error) {
    console.error('Tokenization failed:', error)
    throw new Error('Payment method tokenization failed')
  }
}
\`\`\`

### Fraud Detection
\`\`\`javascript
// Fraud detection workflow step
async function detectFraud(transaction) {
  const riskFactors = []
  
  // Check velocity limits
  const recentTransactions = await getRecentTransactions(transaction.customer_id, '1h')
  if (recentTransactions.length > 5) {
    riskFactors.push('high_velocity')
  }
  
  // Check geographic anomalies
  const customerLocation = await getCustomerLocation(transaction.customer_id)
  if (isGeographicAnomaly(transaction.ip_address, customerLocation)) {
    riskFactors.push('geographic_anomaly')
  }
  
  // Check amount anomalies
  const avgAmount = await getAverageTransactionAmount(transaction.customer_id)
  if (transaction.amount > avgAmount * 3) {
    riskFactors.push('amount_anomaly')
  }
  
  // Calculate risk score
  const riskScore = calculateRiskScore(riskFactors)
  
  if (riskScore > 0.7) {
    // Flag for manual review
    await flagForManualReview(transaction.id, riskFactors)
    return { status: 'flagged', riskScore, riskFactors }
  }
  
  return { status: 'approved', riskScore }
}
\`\`\`

## Error Handling and Recovery

### Payment Failure Handling
\`\`\`javascript
// Retry logic with exponential backoff
async function processPaymentWithRetry(paymentData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await processPayment(paymentData)
      
      // Log successful payment
      await logPaymentEvent({
        event: 'payment_success',
        payment_id: result.id,
        attempt: attempt,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (error) {
      const isRetryable = isRetryableError(error)
      
      if (!isRetryable || attempt === maxRetries) {
        // Log final failure
        await logPaymentEvent({
          event: 'payment_failed',
          payment_data: paymentData,
          error: error.message,
          attempts: attempt,
          timestamp: new Date().toISOString()
        })
        
        // Notify customer
        await notifyPaymentFailure(paymentData.customer_id, error)
        
        throw error
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Log retry attempt
      await logPaymentEvent({
        event: 'payment_retry',
        payment_data: paymentData,
        attempt: attempt,
        delay: delay,
        timestamp: new Date().toISOString()
      })
    }
  }
}

function isRetryableError(error) {
  const retryableErrors = [
    'network_error',
    'timeout',
    'rate_limit_exceeded',
    'temporary_glitch'
  ]
  
  return retryableErrors.some(errorType => 
    error.message.toLowerCase().includes(errorType)
  )
}
\`\`\`

## Webhook Handling

### Payment Gateway Webhooks
\`\`\`javascript
// Stripe webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature']
  const payload = req.body
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handleSubscriptionFailure(event.data.object)
        break
        
      default:
        console.log(\`Unhandled event type: \${event.type}\`)
    }
    
    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    res.status(400).json({ error: 'Invalid signature' })
  }
})

async function handlePaymentSuccess(paymentIntent) {
  // Update transaction status
  await updateTransactionStatus(paymentIntent.id, 'succeeded')
  
  // Trigger fulfillment workflow
  await triggerWorkflow('order_fulfillment', {
    payment_intent_id: paymentIntent.id,
    customer_id: paymentIntent.metadata.customer_id,
    amount: paymentIntent.amount / 100
  })
  
  // Send confirmation
  await sendPaymentConfirmation(paymentIntent.metadata.customer_id, paymentIntent)
}
\`\`\`

## Reporting and Analytics

### Transaction Reporting
\`\`\`javascript
// Generate daily transaction report
async function generateDailyReport(date = new Date()) {
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)
  
  const transactions = await getTransactionsByDateRange(startDate, endDate)
  
  const report = {
    date: date.toISOString().split('T')[0],
    summary: {
      total_transactions: transactions.length,
      successful_transactions: transactions.filter(t => t.status === 'succeeded').length,
      failed_transactions: transactions.filter(t => t.status === 'failed').length,
      total_volume: transactions.reduce((sum, t) => sum + t.amount, 0),
      average_transaction_value: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
    },
    by_payment_method: groupTransactionsByPaymentMethod(transactions),
    by_currency: groupTransactionsByCurrency(transactions),
    top_errors: getTopErrors(transactions.filter(t => t.status === 'failed'))
  }
  
  // Save report
  await saveReport('daily_transactions', report)
  
  // Send to stakeholders
  await emailReport(report, ['finance@company.com', 'ops@company.com'])
  
  return report
}
\`\`\`

## Testing and Development

### Test Payment Flows
\`\`\`javascript
// Test payment processing with Stripe test mode
async function testPaymentProcessing() {
  const testData = {
    amount: 10.00,
    currency: 'usd',
    payment_method: 'pm_card_visa', // Stripe test card
    customer_id: 'cus_test_123456'
  }
  
  try {
    // Create test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: testData.amount * 100,
      currency: testData.currency,
      payment_method: testData.payment_method,
      customer: testData.customer_id,
      confirm: true,
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      }
    })
    
    console.log('Test payment created:', paymentIntent.id)
    
    // Simulate webhook events
    await simulateWebhookEvent('payment_intent.succeeded', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    })
    
    return paymentIntent
  } catch (error) {
    console.error('Test payment failed:', error)
    throw error
  }
}
\`\`\`

## Best Practices

### Performance Optimization
- Use connection pooling for database operations
- Implement caching for frequently accessed payment methods
- Batch process multiple transactions when possible
- Monitor and optimize database queries

### Security Recommendations
- Never store raw payment card details
- Use end-to-end encryption for sensitive data
- Implement proper access controls and audit logs
- Regularly rotate API keys and secrets
- Monitor for suspicious activity patterns

### Monitoring and Alerting
\`\`\`javascript
// Payment system health check
async function healthCheck() {
  const checks = await Promise.allSettled([
    checkStripeConnectivity(),
    checkPayPalConnectivity(),
    checkDatabaseHealth(),
    checkRedisConnectivity()
  ])
  
  const results = {
    stripe: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    paypal: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    database: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    redis: checks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy'
  }
  
  const isHealthy = Object.values(results).every(status => status === 'healthy')
  
  if (!isHealthy) {
    await sendAlert({
      type: 'payment_system_health',
      severity: 'critical',
      message: 'Payment system health check failed',
      details: results
    })
  }
  
  return { healthy: isHealthy, ...results }
}
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function PaymentProcessingPage() {
  return (
    <DocsPageWrapper copyForAIContent={MARKDOWN_CONTENT}>
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-white">Payment Processing</span>
          </li>
        </ol>
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Payment Processing
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                advanced
              </span>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">20 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Build reliable, scalable payment workflows with enterprise-grade security, compliance, and durability for financial transactions.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Architecture Overview */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Building className="w-6 h-6 text-green-400" />
              Architecture Overview
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment Flow</h3>
                <p className="text-gray-400">Understanding how payments flow through your system.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Flow</span>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Payment Flow Diagram</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`Customer → Payment Gateway → Torqvio → Your Application
    ↓              ↓              ↓              ↓
Initiate → Process Payment → Update State → Fulfill Order`}</code>
                  </pre>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Core Components</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Payment Gateway Integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Transaction Management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Compliance Engine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Reconciliation System</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>PCI DSS compliant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Multi-provider support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Automatic retry logic</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Real-time fraud detection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Payment Providers */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Supported Payment Providers</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Stripe Integration</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`const stripe = require('stripe')('sk_test_...')

async function createPaymentIntent(amount, currency = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: currency,
    metadata: {
      workflow_id: 'wf_payment_processing',
      customer_id: 'cust_123456'
    }
  })
  
  await triggerWorkflow('payment-processing', {
    payment_intent_id: paymentIntent.id,
    amount: amount,
    currency: currency,
    status: 'requires_payment_method'
  })
  
  return paymentIntent
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Workflows */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <GitBranch className="w-6 h-6 text-green-400" />
              Payment Workflows
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* One-Time Payment */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">One-Time Payment Workflow</h3>
                  <p className="text-gray-400">Handle single payment transactions with retry logic.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Payment</span>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Workflow Steps</h4>
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                    <code>{`{
  "name": "One-Time Payment Processing",
  "steps": [
    {
      "id": "validate_payment",
      "name": "Validate Payment Details",
      "type": "validation"
    },
    {
      "id": "process_payment",
      "name": "Process Payment", 
      "type": "payment_gateway"
    },
    {
      "id": "update_database",
      "name": "Update Transaction Record",
      "type": "database"
    }
  ]
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Subscription Workflow */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Subscription Workflow</h3>
                  <p className="text-gray-400">Handle recurring billing and subscription lifecycle.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Subscription</span>
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Subscription Management</h4>
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                    <code>{`{
  "name": "Subscription Management",
  "steps": [
    {
      "id": "validate_subscription",
      "name": "Validate Subscription Details",
      "type": "validation"
    },
    {
      "id": "create_subscription",
      "name": "Create Subscription",
      "type": "payment_gateway"
    },
    {
      "id": "schedule_renewal",
      "name": "Schedule Next Renewal",
      "type": "scheduler"
    }
  ]
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security and Compliance */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Security and Compliance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">PCI DSS Compliance</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Never store raw card details, use tokenization.</p>
              <div className="text-xs text-green-400">Tokenization, Encryption, Access Controls</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Fraud Detection</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Real-time risk assessment and anomaly detection.</p>
              <div className="text-xs text-orange-400">Velocity Checks, Geographic Analysis, Risk Scoring</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Regulatory Compliance</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">GDPR, SOX, and financial regulations support.</p>
              <div className="text-xs text-blue-400">Data Protection, Audit Trails, Reporting</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Monitoring</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Real-time monitoring and alerting for payment systems.</p>
              <div className="text-xs text-purple-400">Health Checks, Performance Metrics, Alerts</div>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Error Handling and Recovery</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">Retry Logic with Exponential Backoff</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-gray-300">
                <code>{`async function processPaymentWithRetry(paymentData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await processPayment(paymentData)
      return result
    } catch (error) {
      const isRetryable = isRetryableError(error)
      
      if (!isRetryable || attempt === maxRetries) {
        await notifyPaymentFailure(paymentData.customer_id, error)
        throw error
      }
      
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Webhook Handling */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Webhook Handling</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Payment Gateway Webhooks</h4>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code>{`// Stripe webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(
    req.body, signature, process.env.STRIPE_WEBHOOK_SECRET
  )
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
  }
})`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Reporting and Analytics */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Reporting and Analytics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Receipt className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Transaction Reports</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Daily, weekly, and monthly transaction summaries.</p>
              <div className="text-xs text-purple-400">Volume, Success Rate, Average Value</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <PiggyBank className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Revenue Analytics</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Revenue trends and forecasting metrics.</p>
              <div className="text-xs text-green-400">MRR, ARR, Churn Rate, LTV</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Reconciliation</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Match transactions with external records.</p>
              <div className="text-xs text-blue-400">Bank Statements, Provider Reports</div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Best Practices</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Performance</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Use connection pooling</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Implement caching</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Batch processing</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Security</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Never store raw cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Regular key rotation</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Monitoring</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Health checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Real-time alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Performance metrics</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
