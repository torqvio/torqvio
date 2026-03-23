<p align="center">
  <img src="frontend/public/favicon-purple.svg" width="72" alt="Torqvio" />
</p>

<h1 align="center">Torqvio</h1>

<p align="center"><strong>Never lose a workflow again.</strong></p>

Serverless crons. Serverless webhooks. Serverless workflows. All durable. All observable. All running on our managed cloud infrastructure.

Open source core. Managed SaaS. No credit card required.

---

## The problem

You have three things that need to run reliably in the background:

A cron that fires every night and processes data. A webhook endpoint that third parties hit when something happens. A multi-step workflow that sends emails, updates records, and charges a card in sequence.

All three can fail silently. The cron gets killed mid-run on deploy. The webhook fires but your server was restarting. The workflow gets halfway through and crashes — now you don't know what ran and what didn't.

Torqvio makes all three durable. They survive crashes, retries on failure, resume from where they stopped, and show you exactly what happened.

---

## What it does

**Serverless crons** — schedule jobs with cron syntax and timezone support. They don't just fire and forget. They run inside the execution engine, so every run is tracked, every failure is caught, and every retry is automatic.

**Serverless webhooks** — receive, queue, and process webhooks reliably. Guaranteed delivery, automatic retries, HMAC-SHA256 signing, and full delivery history. If your server was down when it arrived, it gets redelivered.

**Serverless workflows** — define multi-step workflows as code. Each step is tracked. If the workflow fails at step 3, it retries from step 3, not from the start. Branching, conditionals, parallel execution, and sleep/delay support built in.

**Real-time observability** — live dashboard showing every execution, every step, every failure. Structured logs, automated failure detection, execution metrics with 24h/7d/30d filters.

**Intelligent retries** — exponential backoff, circuit breakers, configurable retry policies per workflow. Built in, not bolted on.

---

## Run it

```bash
# Sign up for free
npm create torqvio@latest my-workflow
cd my-workflow

# Configure with your API key
echo "TORQVIO_API_KEY=your_key_here" > .env

# Deploy to Torqvio Cloud
torqvio deploy
```

Dashboard: `https://app.torqvio.com`
API: `https://api.torqvio.com`
Docs: `https://docs.torqvio.com`

---

## The API

```bash
# Create a workflow
curl -X POST https://api.torqvio.com/api/v1/flows \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{ "name": "my-workflow", "steps": [...] }'

# Trigger an execution
curl -X POST https://api.torqvio.com/api/workflows/execute \
  -H "Authorization: Bearer your-api-key" \
  -d '{ "workflowId": "my-workflow", "input": { "userId": "123" } }'

# Register a webhook
curl -X POST https://api.torqvio.com/api/v1/webhooks \
  -H "Authorization: Bearer your-api-key" \
  -d '{ "url": "https://yourapp.com/hook", "events": ["workflow.completed"] }'

# List executions
curl https://api.torqvio.com/api/v1/executions \
  -H "Authorization: Bearer your-api-key"
```

SDKs available for TypeScript, Python, and Go in `/packages`.

---

## Pricing

| | Free | Pro | Enterprise |
|---|---|---|---|
| Workflows | Limited | Expanded | Custom |
| Executions/month | Limited | Higher | Unlimited |
| Log retention | Short | Extended | Custom |
| Retries | Basic | Full policies | Full policies |
| Support | Community | Email | Dedicated + SLA |
| Price | $0 | Paid | Contact us |

No credit card to start. SOC 2 compliant. 99.9% uptime SLA on Pro and Enterprise.

---

## Get Started

```bash
# Create your free account
curl -X POST https://api.torqvio.com/signup \
  -H "Content-Type: application/json" \
  -d '{ "email": "your@email.com", "password": "secure-password" }'

# Get your API key
curl -X POST https://api.torqvio.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "your@email.com", "password": "secure-password" }'
```

Dashboard: `https://app.torqvio.com`
API: `https://api.torqvio.com`
Docs: `https://docs.torqvio.com`

---

## Stack

Node.js 18, Express 5, TypeScript, PostgreSQL 15, Redis 7, Next.js 16, Socket.IO, Stripe, JWT + OAuth2.

```
backend/    API, execution engine, scheduler, webhook processor, auth
frontend/   Dashboard, live execution tracking, workflow builder
infrastructure/ Cloud deployment, monitoring, scaling
packages/   TypeScript, Python, Go client SDKs
```

---

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md). Open an issue before writing code for anything non-trivial.

[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — [SECURITY.md](SECURITY.md) — [LICENSE](./LICENSE)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Backend CI](https://github.com/YOUR_ORG/torqvio/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/YOUR_ORG/torqvio/actions)
[![Frontend CI](https://github.com/YOUR_ORG/torqvio/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/YOUR_ORG/torqvio/actions)
