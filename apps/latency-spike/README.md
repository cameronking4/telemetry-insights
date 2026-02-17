# Latency Spike Demo App

This Next.js app demonstrates a **latency spike** scenario with a slow query bug in the OrderService.

## Bug

The `OrderService.getOrdersByUser()` method in `lib/OrderService.ts`:
1. Uses `SELECT *` without proper WHERE clause optimization
2. Filters orders in memory instead of using database WHERE clause
3. Simulates a slow query (2.3+ seconds) that causes request timeouts

## API Endpoint

- `GET /api/orders?userId=<id>` - Fetches orders for a user (will timeout)

## Running

```bash
npm install
npm run dev
```

## Expected Behavior

When Devin triages this incident, it should:
1. Identify the slow query pattern (SELECT * without proper WHERE)
2. Suggest adding database indexes and optimizing the WHERE clause
3. Recommend adding query performance telemetry/monitoring
