# High Error Rate Demo App

This Next.js app demonstrates a **high error rate** scenario with a null pointer bug in the PaymentService.

## Bug

The `PaymentService.validate()` method in `lib/PaymentService.ts` doesn't check if the `payment` parameter is null/undefined before accessing `payment.amount`, causing a `NullPointerException` when the API route receives a request with `body.payment` as null.

## API Endpoint

- `POST /api/payments` - Processes payment validation (will error with null payment)

## Running

```bash
npm install
npm run dev
```

## Expected Behavior

When Devin triages this incident, it should:
1. Identify the null pointer bug in PaymentService.validate()
2. Suggest adding null checks before accessing payment properties
3. Recommend adding error counters/telemetry for payment validation failures
