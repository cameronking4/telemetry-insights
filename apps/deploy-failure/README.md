# Deploy Failure Demo App

This Next.js app demonstrates a **deployment failure** scenario with a missing dependency bug.

## Bug

The `lib/utils.ts` file imports `lodash`, but `package.json` is missing the `lodash` dependency (or it was accidentally removed). This causes build failures with:

```
Module not found: Error: Can't resolve 'lodash' in '/var/task/src'
```

## API Endpoint

- `POST /api/data` - Processes data using lodash (will fail at build time)

## Running Locally

If you run `npm install`, it will install lodash and the app will work. But in a CI/CD environment where dependencies are installed fresh, the build will fail.

## Expected Behavior

When Devin triages this incident, it should:
1. Identify the missing `lodash` dependency in package.json
2. Suggest adding `lodash` to dependencies
3. Recommend checking for other missing dependencies

## To Reproduce Build Failure

1. Remove `lodash` from `package.json` dependencies
2. Run `npm run build`
3. Build will fail with module resolution error
