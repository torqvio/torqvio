# @torqvio/client

Official Torqvio client library for TypeScript/JavaScript applications.

## Installation

```bash
npm install @torqvio/client
# or
yarn add @torqvio/client
# or
pnpm add @torqvio/client
```

## Quick Start

### Using Environment Variables (Recommended)

The client automatically detects the appropriate API URL based on environment variables:

```javascript
import { TorqvioClient } from '@torqvio/client'

// Uses environment variables automatically
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY
})
```

### Manual Configuration

```javascript
import { TorqvioClient } from '@torqvio/client'

// Or with explicit configuration
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY,
  baseUrl: 'https://api.torqvio.com',
  timeout: 30000,
  retries: 3
})

// Create a workflow
const workflow = await client.workflows().create({
  name: 'Order Processing',
  description: 'Process customer orders',
  steps: [
    {
      name: 'validate-order',
      type: 'function',
      config: { functionName: 'validateOrder' }
    },
    {
      name: 'process-payment',
      type: 'webhook',
      config: { url: 'https://api.payment.com/process' }
    }
  ]
})

// Trigger a workflow
const execution = await client.workflows().trigger(workflow.id, {
  orderId: '12345',
  customerId: '67890',
  amount: 99.99
})

// Listen to events
client.events.on('workflow.completed', (event) => {
  console.log('Workflow completed:', event.data)
})

client.events.on('workflow.failed', (event) => {
  console.error('Workflow failed:', event.error)
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | - | Your API key |
| baseUrl | string | Auto-detected | API base URL (auto-detected from env) |
| timeout | number | 30000 | Request timeout in ms |
| retries | number | 3 | Number of retry attempts |
| enableEvents | boolean | true | Enable real-time events |

## Environment Variables

The client automatically detects the API URL from these environment variables:

- `API_URL` - Custom API URL (Node.js) - **Set this to `http://localhost:8459`**
- `NEXT_PUBLIC_API_URL` - Public API URL (Next.js/browser)

**Default behavior:**
- Development: Uses `API_URL=http://localhost:8459`
- Production: Uses `API_URL=https://api.torqvio.com`

### Example Environment Setup

```bash
# .env file
API_URL=http://localhost:8459
TORQVIO_API_KEY=your_api_key_here
```

### Example Usage

```javascript
// Uses environment variables automatically
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY
})

// Or override the URL
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY,
  baseUrl: 'https://my-custom-api.com'
})
```

## API Reference

### Workflow Management

```javascript
const workflows = await client.workflows()

// Create workflow
const workflow = await workflows.create({
  name: 'My Workflow',
  steps: [...]
})

// List workflows
const { workflows, count } = await workflows.list({ page: 1, limit: 10 })

// Get workflow
const workflow = await workflows.get('workflow-id')

// Update workflow
const updated = await workflows.update('workflow-id', { name: 'New Name' })

// Delete workflow
await workflows.delete('workflow-id')

// Trigger workflow
const execution = await workflows.trigger('workflow-id', { data: 'value' })
```

### Execution Management

```javascript
const executions = await client.executions()

// List executions
const { executions, count } = await executions.list()

// Get execution
const execution = await executions.get('execution-id')

// Get execution status
const status = await executions.getStatus('execution-id')

// Get execution logs
const logs = await executions.getLogs('execution-id')

// Cancel execution
await executions.cancel('execution-id')

// Retry execution
const retry = await executions.retry('execution-id')
```

### Event Handling

```javascript
// Workflow events
client.events.on('workflow.started', (event) => { ... })
client.events.on('workflow.completed', (event) => { ... })
client.events.on('workflow.failed', (event) => { ... })

// Step events
client.events.on('workflow.step.started', (event) => { ... })
client.events.on('workflow.step.completed', (event) => { ... })
client.events.on('workflow.step.failed', (event) => { ... })
```

## License

MIT © Torqvio Team
