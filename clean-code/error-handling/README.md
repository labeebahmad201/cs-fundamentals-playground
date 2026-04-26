# Error handling: bad vs good

## Why the bad version hurts

- **Swallowed errors:** A `try/catch` that only `console.log`s and returns a default (like `0`) means callers **cannot tell failure from a valid value**. In APIs this often shows up as `200 OK` with missing data, or bad writes to the database.
- **Weak logging:** `console.log(e)` is not structured; you lose request IDs, user context, and severity, so production support cannot correlate incidents.
- **No error taxonomy:** One-off strings make it hard for HTTP layers to return correct status codes (400 vs 422 vs 500) or for clients to branch on a stable `code` field.
- **Silent `return` after failure:** A function that returns without throwing when required work failed is a **logic bug factory**: the rest of the pipeline assumes success.

## How the good version fixes it

- **Custom error types** (`AppError`, `ValidationError`) carry a **stable `code`** for APIs and tests.
- **No fake success:** Invalid input **throws** (or you return a `Result` type); empty order IDs are not "saved."
- **Logging with context** before rethrow: operations team gets structured fields; **rethrowing** leaves global error middleware in charge of the response.
- **`toHttpStatus` (or equivalent)** is a small single place to map types to 4xx/5xx, which matches how Express/Fastify/ASP.NET Core problem details work in practice.

## In production, also consider

- A global `unhandledRejection` and `uncaughtException` policy (log, then controlled shutdown in cluster modes).
- External logging (`pino`, `winston`) with JSON, request IDs, and no secrets in messages.

## Run

```bash
npm run demo:error-handling
```

Related files: `bad.ts`, `good.ts`, `error-handling.test.ts`.
