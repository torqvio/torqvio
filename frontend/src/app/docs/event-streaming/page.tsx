'use client'

import { motion } from 'framer-motion'
import { Globe, Code, CheckCircle, ArrowRight, Copy, Play, Terminal, Shield, AlertCircle, Zap, Clock, Settings, Activity, Database, Wifi, Server } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

const MARKDOWN_CONTENT = `# Event Streaming

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Event streaming provides real-time access to workflow events using Server-Sent Events (SSE). Unlike webhooks, event streaming uses a persistent connection to push events to your client as they happen.

## Base URL

### Development
\`\`\`
${API_URL}
\`\`\`

## Connection Endpoint
Connect to the event stream using the SSE endpoint:

\`\`\`
GET ${API_URL}/api/v1/events/stream
\`\`\`

## Authentication
Event streaming requires JWT authentication:

\`\`\`
Authorization: Bearer your_jwt_token_here
\`\`\`

## Client Examples

### JavaScript (Browser)
\`\`\`javascript
const eventSource = new EventSource(
  '${API_URL}/api/v1/events/stream',
  {
    headers: {
      'Authorization': 'Bearer your_jwt_token_here'
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data);
  handleWorkflowEvent(data);
};

eventSource.onerror = (error) => {
  console.error('Event stream error:', error);
  // Implement reconnection logic
};

// Handle specific event types
eventSource.addEventListener('workflow.started', (event) => {
  const data = JSON.parse(event.data);
  console.log('Workflow started:', data);
});

eventSource.addEventListener('workflow.completed', (event) => {
  const data = JSON.parse(event.data);
  console.log('Workflow completed:', data);
});
\`\`\`

### Node.js
\`\`\`javascript
const EventSource = require('eventsource');

const eventSource = new EventSource(
  '${API_URL}/api/v1/events/stream',
  {
    headers: {
      'Authorization': 'Bearer your_jwt_token_here'
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
};

eventSource.addEventListener('workflow.started', (event) => {
  const data = JSON.parse(event.data);
  console.log('Workflow started:', data.workflow_id);
});
\`\`\`

### Python
\`\`\`python
import requests
import json

def connect_to_event_stream(jwt_token):
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
    }
    
    response = requests.get(
        f'{API_URL}/api/v1/events/stream',
        headers=headers,
        stream=True
    )
    
    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                event_data = json.loads(line[6:])
                print('Event:', event_data)
                handle_event(event_data)

def handle_event(event):
    event_type = event.get('event')
    if event_type == 'workflow.started':
        print(f"Workflow {event['data']['workflow_id']} started")
    elif event_type == 'workflow.completed':
        print(f"Workflow {event['data']['workflow_id']} completed")
\`\`\`

## Event Types

### Workflow Started
\`\`\`json
{
  "event": "workflow.started",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "input_payload": { "orderId": "12345" }
  }
}
\`\`\`

### Step Started
\`\`\`json
{
  "event": "step.started",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "step_id": "step_789",
  "timestamp": "2024-01-15T10:35:30Z",
  "data": {
    "step_name": "validate-order",
    "step_type": "validation",
    "input_data": { "orderId": "12345" }
  }
}
\`\`\`

### Step Completed
\`\`\`json
{
  "event": "step.completed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "step_id": "step_789",
  "timestamp": "2024-01-15T10:36:00Z",
  "data": {
    "step_name": "validate-order",
    "step_type": "validation",
    "result": { "valid": true, "orderId": "12345" },
    "execution_time": 30
  }
}
\`\`\`

### Workflow Completed
\`\`\`json
{
  "event": "workflow.completed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "result": { "status": "processed", "orderId": "12345" },
    "execution_time": 120
  }
}
\`\`\`

### Workflow Failed
\`\`\`json
{
  "event": "workflow.failed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "error": {
      "message": "Invalid order data",
      "code": "VALIDATION_ERROR",
      "step": "validate-order"
    },
    "execution_time": 45
  }
}
\`\`\`

## Filtering Events
You can filter events by workflow ID or event type:

\`\`\`javascript
const eventSource = new EventSource(
  '${API_URL}/api/v1/events/stream?workflow_id=wf_123&event_types=workflow.started,workflow.completed',
  {
    headers: {
      'Authorization': 'Bearer your_jwt_token_here'
    }
  }
);
\`\`\`

### Query Parameters
- \`workflow_id\` - Filter events for a specific workflow
- \`event_types\` - Comma-separated list of event types to receive
- \`step_id\` - Filter events for a specific step

## Connection Management

### Automatic Reconnection
Implement exponential backoff for reconnections:

\`\`\`javascript
class EventStreamManager {
  constructor(jwtToken) {
    this.jwtToken = jwtToken;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  connect() {
    this.eventSource = new EventSource(
      '${API_URL}/api/v1/events/stream',
      {
        headers: {
          'Authorization': \`Bearer \${this.jwtToken}\`
        }
      }
    );

    this.eventSource.onopen = () => {
      console.log('Event stream connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.eventSource.onerror = () => {
      console.log('Event stream disconnected');
      this.scheduleReconnect();
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      console.log(\`Reconnection attempt \${this.reconnectAttempts}\`);
      this.connect();
    }, this.reconnectDelay);
  }

  handleEvent(event) {
    // Process events
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
\`\`\`

### Heartbeat
The server sends heartbeat events every 30 seconds to keep the connection alive:

\`\`\`json
{
  "event": "heartbeat",
  "timestamp": "2024-01-15T10:35:00Z"
}
\`\`\`

## Rate Limits
Event streaming has the following limits:
- **Connections**: 10 concurrent connections per user
- **Events**: 1000 events per minute per connection
- **Message Size**: 64KB maximum per event

## Best Practices

- Use connection pooling for multiple clients
- Implement proper error handling and reconnection logic
- Filter events to reduce bandwidth usage
- Handle heartbeat events to detect connection issues
- Use exponential backoff for reconnections
- Monitor connection health and log disconnections

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function EventStreamingPage() {
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
            <span className="text-white">Event Streaming</span>
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
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
            <Wifi className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Event Streaming
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                Stable
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">15 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 1 week ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Event streaming provides real-time access to workflow events using Server-Sent Events (SSE). Unlike webhooks, event streaming uses a persistent connection to push events to your client as they happen.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Base URL */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Base URL</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">Development</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-purple-400">{API_URL}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Connection Endpoint */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Connection Endpoint</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">SSE Endpoint</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-green-400">GET</code> <code className="text-purple-400">{API_URL}/api/v1/events/stream</code>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Authentication</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">HTTP Header</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-gray-300">Authorization: Bearer your_jwt_token_here</code>
              </div>
            </div>
          </div>
        </section>

        {/* Client Examples */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Code className="w-6 h-6 text-purple-400" />
              Client Examples
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* JavaScript Example */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">JavaScript (Browser)</h3>
                  <p className="text-gray-400">Connect to event stream in a browser application.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">JS</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">EventSource Connection</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`const eventSource = new EventSource(
  '${API_URL}/api/v1/events/stream',
  {
    headers: {
      'Authorization': 'Bearer your_jwt_token_here'
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data);
  handleWorkflowEvent(data);
};

eventSource.onerror = (error) => {
  console.error('Event stream error:', error);
  // Implement reconnection logic
};`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Node.js Example */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Node.js</h3>
                  <p className="text-gray-400">Connect to event stream in a Node.js application.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Node.js</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">EventSource Package</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`const EventSource = require('eventsource');

const eventSource = new EventSource(
  '${API_URL}/api/v1/events/stream',
  {
    headers: {
      'Authorization': 'Bearer your_jwt_token_here'
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
};`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Python Example */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Python</h3>
                  <p className="text-gray-400">Connect to event stream in a Python application.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Python</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Requests Library</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`import requests
import json

def connect_to_event_stream(jwt_token):
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
    }
    
    response = requests.get(
        f'{API_URL}/api/v1/events/stream',
        headers=headers,
        stream=True
    )
    
    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                event_data = json.loads(line[6:])
                print('Event:', event_data)`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Activity className="w-6 h-6 text-purple-400" />
              Event Types
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Workflow Started */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Started</h3>
                  <p className="text-gray-400">Sent when a workflow execution begins.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">workflow.started</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Payload</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "event": "workflow.started",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "input_payload": { "orderId": "12345" }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Step Started */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Step Started</h3>
                  <p className="text-gray-400">Sent when an individual step begins execution.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">step.started</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Payload</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "event": "step.started",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "step_id": "step_789",
  "timestamp": "2024-01-15T10:35:30Z",
  "data": {
    "step_name": "validate-order",
    "step_type": "validation",
    "input_data": { "orderId": "12345" }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Workflow Completed */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Completed</h3>
                  <p className="text-gray-400">Sent when a workflow finishes successfully.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">workflow.completed</span>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Payload</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "event": "workflow.completed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "result": { "status": "processed", "orderId": "12345" },
    "execution_time": 120
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filtering Events */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Filtering Events</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Query Parameters</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`const eventSource = new EventSource(
  '${API_URL}/api/v1/events/stream?workflow_id=wf_123&event_types=workflow.started,workflow.completed',
  {
    headers: {
      'Authorization': 'Bearer your_jwt_token_here'
    }
  }
);`}</code>
                </pre>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">workflow_id</h4>
                <p className="text-gray-400 text-sm">Filter events for a specific workflow</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">event_types</h4>
                <p className="text-gray-400 text-sm">Comma-separated list of event types</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">step_id</h4>
                <p className="text-gray-400 text-sm">Filter events for a specific step</p>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Rate Limits</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Connections</span>
              <span className="text-purple-400 font-mono">10 per user</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Events</span>
              <span className="text-purple-400 font-mono">1000/min per connection</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Message Size</span>
              <span className="text-purple-400 font-mono">64KB max</span>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Best Practices</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Use connection pooling for multiple clients</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Implement proper error handling and reconnection logic</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Filter events to reduce bandwidth usage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Handle heartbeat events to detect connection issues</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Use exponential backoff for reconnections</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Monitor connection health and log disconnections</p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Continue Learning</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/webhooks"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Webhooks
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about webhook-based event delivery for server-side integrations.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View Webhook Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  REST API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore our REST API for workflow management and control.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Support */}
        <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                If you need assistance with event streaming, we're here to help.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  Check Examples
                </Link>
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  Join Discord
                </Link>
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  GitHub Issues
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-zinc-600/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-zinc-300 text-sm">
                &copy; {new Date().getFullYear()} Torqvio. Built with durability in mind.
              </div>
              <div className="flex items-center gap-8 text-sm">
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                  GitHub
                </Link>
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                  Discord
                </Link>
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                  Twitter
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </DocsPageWrapper>
  )
}
