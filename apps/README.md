# Demo Apps Monorepo

This `apps/` folder contains 3 Next.js demo applications, each with a root cause bug that matches one of the incident triage demo scenarios.

## Apps

### 1. `high-error-rate` - PaymentService Null Pointer Bug

**Bug:** `PaymentService.validate()` doesn't check if `payment` is null/undefined before accessing `payment.amount`, causing `NullPointerException`.

**Matches:** `high-error-rate` demo scenario

**Files:**
- `lib/PaymentService.ts` - Contains the null pointer bug
- `app/api/payments/route.ts` - API endpoint that triggers the bug

### 2. `latency-spike` - OrderService Slow Query Bug

**Bug:** `OrderService.getOrdersByUser()` uses inefficient query patterns (SELECT * without proper WHERE clause optimization) and filters in memory, causing slow queries that timeout.

**Matches:** `latency-spike` demo scenario

**Files:**
- `lib/OrderService.ts` - Contains the slow query bug
- `app/api/orders/route.ts` - API endpoint that triggers timeouts

### 3. `deploy-failure` - Missing Lodash Dependency

**Bug:** `lib/utils.ts` imports `lodash`, but `package.json` is missing the dependency, causing build failures with "Module not found: Error: Can't resolve 'lodash'".

**Matches:** `deploy-failure` demo scenario

**Files:**
- `lib/utils.ts` - Imports lodash without dependency
- `app/api/data/route.ts` - API endpoint that uses lodash

## Usage

Each app can be run independently:

```bash
cd apps/high-error-rate
npm install
npm run dev
```

## Purpose

These apps serve as real codebases for Devin to triage when running incident-triage demos. Each app contains the actual root cause bug that matches the fixture logs and signals, allowing Devin to:

1. Identify the bug from the evidence bundle
2. Create a fix PR
3. Suggest telemetry improvements

## Integration with Incident Triage

When running `incident-triage run --demo <scenario>`, the triage process will:

1. Load the corresponding fixture (signals + logs)
2. If a repo is configured, fetch commits from the matching app
3. Devin analyzes the evidence and can open PRs to fix the bug in the app
