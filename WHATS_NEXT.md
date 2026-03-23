# What needs to be built

This is the gap between what the README promises and what actually exists in the codebase right now. Audited against the real code, not vibes.

---

## What already works

These are real, not stubs. Don't touch them, just build on top.

- **Webhook delivery** — HMAC-SHA256 signing, 5-attempt retry with exponential backoff, event filtering, delivery history, test endpoint. Production-ready.
- **Retry engine** — exponential backoff, fixed, and linear strategies in both the webhook service and execution engine. Works.
- **JWT auth** — registration, login, token refresh, password hashing with scrypt. Works.
- **Basic cron scheduler** — polls every 5s, runs due jobs, built-in cleanup and health-check crons. Works for simple use cases.
- **Sequential workflow execution** — create a flow, define steps, execute, track status, persist results. Works end to end.
- **TypeScript/JavaScript SDK** — full HTTP client, workflow CRUD, execution management, Socket.IO event emitter. Works.
- **Billing tiers + usage tracking** — pricing tiers, plan limits, overage calculation, per-plan feature flags. The logic is real.

---

## What needs to be finished

These exist in the code but are broken, mocked, or incomplete.

### 1. Workflow branching and conditions
**File:** `backend/src/engine/ExecutionEngine.ts` line ~524

`evaluateCondition()` returns hardcoded `true`. The `step.condition` field exists and `FlowBuilder.when()` exists, but no condition is ever actually evaluated. Every workflow runs every step regardless of conditions.

**What to build:** A real condition evaluator that reads `step.condition`, evaluates it against the execution context (previous step results, payload), and skips steps when the condition is false.

---

### 2. Parallel workflow execution
**File:** `backend/src/engine/ExecutionEngine.ts` line ~137

The engine loops sequentially: `for (let i = startIndex; i < flow.steps.length; i++)`. There is no concept of parallel steps. The `StepType` enum has types that imply parallel patterns but the engine never runs two steps at once.

**What to build:** A step dependency graph so steps with no dependencies on each other can run concurrently via `Promise.all`. Requires a `dependsOn` field on `StepDefinition` and a topological sort before execution.

---

### 3. Real-time dashboard (WebSocket)
**Files:** `frontend/src/components/dashboard/LiveActivityFeed.tsx`, `packages/client/src/client.ts`

The frontend polls the API every 5 seconds. The TypeScript SDK has Socket.IO wired up (`client.ts` line 88) but the frontend never connects to it. The backend has `socket.io` installed and routes for it but the dashboard doesn't use it.

**What to build:** Connect the frontend to the existing Socket.IO server. Replace the polling `setInterval` in `LiveActivityFeed` with socket event listeners for `execution.started`, `execution.completed`, `execution.failed`. The infrastructure exists on both ends — they just need to be connected.

---

### 4. OAuth2 (GitHub + Google)
**File:** `backend/src/api/routes/auth.ts`

Config variables exist (`GITHUB_CLIENT_ID`, `GOOGLE_CLIENT_ID`) and callback route stubs are there, but there is no token exchange logic — no redirect to the provider, no code-for-token exchange, no user profile fetch.

**What to build:** Standard OAuth2 flow for both providers. Redirect user → provider login → callback with `code` → exchange for access token → fetch user profile → create/login user → issue JWT. No third-party library needed, just two HTTP calls per provider.

---

### 5. Stripe payment processing
**Files:** `backend/src/billing/PricingService.ts`, `backend/src/integrations/connectors/StripeConnector.ts`

The pricing logic is real (tiers, limits, overages). The Stripe connector exists. But `createCheckoutSession()` in `PricingService` returns a mock URL and no actual Stripe session is created. Webhook event handling for `invoice.paid`, `customer.subscription.updated` etc. is stubbed.

**What to build:** Wire `PricingService` to the real `StripeConnector`. Create actual Stripe checkout sessions. Handle the four essential webhook events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.

---

### 6. Cron timezone support
**File:** `backend/src/scheduler/Scheduler.ts`

The `node-cron` library used supports a `timezone` option out of the box. The scheduler never passes it. No timezone field exists on scheduled jobs. All crons run UTC.

**What to build:** Add a `timezone` field to the cron job schema and database table. Pass it to `node-cron` when scheduling. Expose it in the API so users can specify `"America/New_York"` etc. One hour of work.

---

### 7. Python SDK
**Location:** `packages/python/`

The package structure is correct (`setup.py`, `__init__.py`, version `2.1.0`). The actual module is six lines of imports pointing to classes that don't exist yet.

**What to build:** Port the TypeScript SDK to Python. Same surface area: workflow CRUD, execution management, event handling. The TypeScript SDK is the reference implementation — translate it.

---

### 8. Go SDK
**Location:** `packages/go/`

A `go.mod` and a README showing example usage. No actual Go code exists.

**What to build:** Start from scratch. HTTP client, workflow CRUD, execution management. The README in the package already documents the intended API — implement it.

---

## What to build in order

If you're picking this up, do it in this sequence. Each item unblocks the next.

1. **Cron timezones** — easiest, one field, one line of config passed to node-cron
2. **WebSocket dashboard** — infrastructure exists on both ends, just needs connecting
3. **Workflow conditions** — unblocks making real conditional workflows work
4. **OAuth2** — standard flow, no surprises, unblocks user growth
5. **Parallel execution** — requires step dependency graph, more architecture work
6. **Stripe** — needs real credentials to test, save for when auth is solid
7. **Python SDK** — reference the TypeScript SDK, straightforward port
8. **Go SDK** — build last, least urgent
