# Node.js + React Mastery Labs

### Senior Fullstack / Backend Engineer - Top 10-15% Program

A structured lab program for backend engineers who need credible, production-level fullstack capability.
Not a tutorial series. Built for someone with real experience who needs to close specific gaps and articulate decisions under interview pressure.

Each lab includes:

- The lab itself (hands-on build)
- The exact interview questions it enables you to answer
- The answer framework (how to structure your response)

**Recommended pace:** 1 lab every 2-3 days. Total: ~8-10 weeks.  
**Stack:** Node.js (Fastify), PostgreSQL, Redis, React, TypeScript.

---

## PART ONE: NODE.JS - 15 LABS

### Lab 1: Event Loop Deep Dive

**Build:**

1. Script showing `setTimeout` vs `setImmediate` vs `process.nextTick` execution order.
2. Add a CPU-intensive sync operation. Show it blocking the loop.
3. Refactor using `setImmediate` to yield between iterations.
4. Write a 5-line explanation of all event loop phases.

**Success criteria:**

- Can explain why `process.nextTick` fires before `setImmediate`.
- Can describe what "blocking the event loop" means with a real production example.

**Stretch:** Profile with `--prof` flag. Identify where time is spent.

**Proof artifact:** Annotated script + 5-line event loop summary.

---

### Lab 2: Streams and Backpressure

**Build:**

1. Read a large file (>100MB) into memory naively. Measure memory.
2. Refactor with `fs.createReadStream` piped to `fs.createWriteStream`. Compare.
3. Build a transform stream that modifies data mid-pipe.
4. Simulate backpressure with a slow writable stream. Observe `drain` event.

**Success criteria:**

- Memory stays flat regardless of file size when streaming.
- Can explain backpressure in one sentence.

**Stretch:** Streaming HTTP endpoint that pipes a large file response without buffering.

**Proof artifact:** Memory comparison table. Transform stream with comments.

---

### Lab 3: Worker Threads for CPU-Intensive Tasks

**Build:**

1. Fibonacci calculator that blocks the event loop. Measure request latency.
2. Refactor with `worker_threads`. Measure latency again.
3. Build a simple worker pool that reuses threads.
4. Add error handling for worker crashes.

**Success criteria:**

- HTTP server stays responsive during CPU work.
- Can articulate worker threads vs child processes vs clustering.

**Stretch:** Compare `worker_threads` vs `cluster` module for CPU-bound workload.

**Proof artifact:** Latency comparison table. Worker pool implementation.

---

### Lab 4: HTTP Server Internals and Middleware Pipeline

**Build:**

1. Raw HTTP server using `node:http` - no frameworks. Manual routing.
2. Middleware pipeline: logging, auth check, JSON parsing - all from scratch.
3. Centralized error handler.
4. Compare your implementation to Express source code.

**Success criteria:**

- Can explain what `req` and `res` actually are at the Node.js level.
- Can describe the middleware pattern and why error middleware takes 4 arguments.

**Stretch:** Implement basic route parameter parsing without a framework.

**Proof artifact:** Raw HTTP server with middleware. Annotated comparison with Express.

---

### Lab 5: RESTful API Design with Fastify

**Build:**

1. Full CRUD API for `users` resource.
2. JSON Schema validation for all inputs.
3. Serialization schemas for response shape and performance.
4. Proper HTTP status codes, error shapes, global error handler.
5. Rate limiting and request logging.

**Success criteria:**

- Invalid requests return structured field-level errors.
- Can explain why Fastify's schema serialization is faster than `JSON.stringify`.

**Stretch:** API versioning with documented migration strategy.

**Proof artifact:** Fastify API with schema validation. Performance comparison vs Express.

---

### Lab 6: Authentication and Authorization Patterns

**Build:**

1. JWT auth: signup, login, token issuance.
2. Refresh token rotation with httpOnly cookies.
3. RBAC middleware.
4. Token replay attack simulation and protection.

**Success criteria:**

- Can explain auth vs authorization.
- Can articulate why refresh tokens rotate and live in httpOnly cookies.

**Stretch:** OAuth2 authorization code flow against GitHub or Google.

**Proof artifact:** Auth system with RBAC. Written token lifecycle explanation.

---

### Lab 7: Database Integration Patterns

**Build:**

1. `pg` directly - connection pool with documented sizing.
2. Parameterized queries. Show SQL injection without them.
3. Repository pattern separating data access from business logic.
4. Migration system with versioned SQL files.
5. Handle connection errors, timeouts, pool exhaustion.

**Success criteria:**

- Can explain pool sizing tied to Postgres `max_connections`.
- Can explain repository pattern and testability benefit.

**Stretch:** Optimistic locking with a `version` column.

**Proof artifact:** Repository implementation. Pool config with reasoning.

---

### Lab 8: Message Queues and Async Processing

**Build:**

1. BullMQ (Redis-backed) added to Fastify API.
2. Slow operation moved to background job.
3. Retries with exponential backoff.
4. Dead letter queue for max-retry failures.
5. Job status polling endpoint.

**Success criteria:**

- API response time drops after offloading.
- Can explain at-least-once delivery and why idempotency matters.

**Stretch:** Job prioritization and queue rate limiting.

**Proof artifact:** BullMQ integration with retry logic. Latency comparison.

---

### Lab 9: Caching Strategies with Redis

**Build:**

1. Redis via `ioredis`. Cache-aside pattern for expensive query.
2. TTL-based expiration. Show stale data scenario.
3. Cache invalidation on writes.
4. Cache stampede protection with lock/single-flight pattern.

**Success criteria:**

- Can explain cache-aside vs write-through vs write-behind.
- Can explain the cache invalidation problem in plain language.

**Stretch:** Redis pub/sub to invalidate cache across multiple instances.

**Proof artifact:** Cache with stampede protection. Written tradeoff analysis.

---

### Lab 10: Testing - Unit, Integration, Contract

**Build:**

1. Unit tests for business logic - Vitest, no I/O.
2. Integration tests for API routes via Fastify inject.
3. Database integration tests against real test DB (Docker).
4. Contract test validating response shape.

**Success criteria:**

- Tests run under 30 seconds.
- Can explain unit vs integration vs e2e and when each is appropriate.

**Stretch:** Coverage report with meaningful threshold.

**Proof artifact:** Test suite with all three layers. Coverage report.

---

### Lab 11: Observability - Logging, Metrics, Tracing

**Build:**

1. Structured JSON logging with Pino. No `console.log`.
2. Correlation IDs across log lines.
3. `/metrics` endpoint with `prom-client`.
4. Custom metrics: request duration histogram, error counter, active connections.
5. Basic distributed tracing with OpenTelemetry.

**Success criteria:**

- Can find a slow request using correlation ID alone.
- Can explain the difference between logs, metrics, and traces.

**Stretch:** Prometheus metrics connected to local Grafana dashboard.

**Proof artifact:** Instrumented service with structured logs and metrics endpoint.

---

### Lab 12: Graceful Shutdown and Production Readiness

**Build:**

1. Handle `SIGTERM` and `SIGINT`.
2. Stop accepting new connections on signal.
3. Wait for in-flight requests with timeout.
4. Close DB pool and Redis cleanly.
5. `/healthz` (liveness) and `/readyz` (readiness) endpoints.

**Success criteria:**

- Zero requests dropped during simulated rolling restart.
- Can explain liveness vs readiness probes.

**Stretch:** Startup probe that waits for DB before accepting traffic.

**Proof artifact:** Graceful shutdown implementation. Health endpoints with documented semantics.

---

### Lab 13: Security Hardening

**Build:**

1. Helmet.js for HTTP security headers - understand each one.
2. Input sanitization - show XSS attempt blocked.
3. CORS configuration - not `*` in production.
4. `npm audit` dependency scanning.
5. Document parameterized query protection from Lab 7.

**Success criteria:**

- Can explain OWASP Top 10 at a high level.
- Can explain why wildcard CORS is dangerous.

**Stretch:** Content Security Policy headers tested in browser dev tools.

**Proof artifact:** Security checklist with implementation evidence.

---

### Lab 14: Performance Profiling and Optimization

**Build:**

1. Load test with `autocannon`. Establish baseline.
2. Profile under load with `clinic.js`. Identify hotspot.
3. Fix the bottleneck.
4. Re-run load test. Document improvement.

**Success criteria:**

- Throughput improvement measurable and documented.
- Can explain why profiling before optimizing matters.

**Stretch:** Heap snapshot to identify a memory leak.

**Proof artifact:** Before/after load test results. Annotated profile output.

---

### Lab 15: Live System Design Drill

**Scenario:** Design a URL shortener (bit.ly) handling 10,000 requests/second.

**Build (60 minutes):**

1. `POST /shorten` - creates short URL.
2. `GET /:code` - redirects to original URL.
3. Address: caching, DB choice, collision handling, analytics.
4. Narrate every decision out loud.
5. Write one-page architecture note after.

**Success criteria:**

- Can defend every technology choice with a tradeoff.
- Handles happy path and at least two edge cases.

**Stretch:** Add rate limiting layer. Explain where in the stack it lives.

**Proof artifact:** Architecture note with decision log.

---

## PART TWO: REACT - 10 LABS

### Lab 1: React Mental Model - Rendering and Reconciliation

**Build:**

1. 3-level component tree. `console.log` every render. Observe re-renders.
2. Trigger unnecessary re-render with new object reference as prop. Fix with `useMemo`.
3. Wrap child in `React.memo`. Show when it helps and when it doesn't.
4. React DevTools Profiler - find the most expensive render.

**Success criteria:**

- Can explain virtual DOM and reconciliation in plain language.
- Can identify an unnecessary re-render and explain two ways to fix it.

**Stretch:** Render 1000 items. Optimize with windowing (`react-window`).

**Proof artifact:** Before/after render counts. Annotated DevTools screenshot.

---

### Lab 2: State Management Decisions

**Build:**

1. `useState` vs `useReducer` - identify where reducer is cleaner.
2. `useContext` for theme/auth. Show the re-render problem.
3. Fix with context splitting or `useMemo`.
4. Add Zustand for global state. Compare to Redux.

**Success criteria:**

- Can articulate: local vs shared vs server vs URL state.
- Can defend a state management choice in a code review.

**Stretch:** Migrate one Zustand store to use `immer`.

**Proof artifact:** State architecture decision log with tradeoffs.

---

### Lab 3: Data Fetching with React Query

**Build:**

1. Replace `useEffect` + `fetch` with `useQuery`.
2. Optimistic updates for a mutation.
3. Background refetching and stale-while-revalidate.
4. Loading and error states with skeleton loaders.

**Success criteria:**

- Can explain why `useEffect` for data fetching is problematic.
- Can explain stale-while-revalidate in plain language.

**Stretch:** Infinite scrolling with `useInfiniteQuery`.

**Proof artifact:** Before/after code. Notes on cache behavior.

---

### Lab 4: Forms and Validation

**Build:**

1. Complex form with React Hook Form - uncontrolled inputs.
2. Zod schema validation shared with backend.
3. Field-level errors, dirty state, submission state.
4. Async validation (check if username is taken).

**Success criteria:**

- Form re-renders only changed fields.
- Can explain why uncontrolled inputs are faster.

**Stretch:** Multi-step form wizard with per-step validation.

**Proof artifact:** Form with shared Zod schema. Re-render comparison.

---

### Lab 5: Component Architecture and Reusability

**Build:**

1. `Button` - naive -> compound -> render props -> polymorphic.
2. Generic `DataTable` component.
3. Modal system with portal and context.
4. Storybook stories or isolated test renders.

**Success criteria:**

- Can explain compound component pattern and when it beats prop drilling.
- Components are usable without reading implementation.

**Stretch:** TypeScript generics on DataTable with inferred column types.

**Proof artifact:** Component library with three patterns. Usage examples.

---

### Lab 6: Performance Optimization

**Build:**

1. Deliberately slow app - large list, expensive calculations.
2. Profile with React DevTools. Identify top 3 bottlenecks.
3. Fix with right tool: `useMemo`, `useCallback`, `React.memo`, lazy loading.
4. `React.lazy` + `Suspense` for route-level code splitting.

**Success criteria:**

- Initial bundle size reduced measurably.
- Can explain difference between `useMemo` and `useCallback`.

**Stretch:** Web Vitals measurement. Improve LCP and CLS.

**Proof artifact:** Before/after bundle analysis. Flame graph comparison.

---

### Lab 7: TypeScript in React

**Build:**

1. Convert JS to TypeScript - event handlers, refs, children, generics.
2. Type API response with Zod. Infer TypeScript type from it.
3. Custom hook with proper TypeScript generics.
4. Strict TypeScript config - fix all errors.

**Success criteria:**

- No `any` types in codebase.
- Can explain `type` vs `interface`.

**Stretch:** Branded types for IDs to prevent mixing `userId` and `orderId`.

**Proof artifact:** Fully typed component and hook. Zod schema with inferred types.

---

### Lab 8: Authentication Flow in React

**Build:**

1. Login flow storing auth state in memory - not localStorage.
2. Route protection with `PrivateRoute`.
3. Silent refresh using refresh token before expiry.
4. Multi-tab edge case: logout in one tab, handle in others.

**Success criteria:**

- No tokens in localStorage.
- Expired sessions handled gracefully.

**Stretch:** "Remember me" with explained security implications.

**Proof artifact:** Auth flow implementation. Written token storage decision explanation.

---

### Lab 9: Testing React Components

**Build:**

1. Unit test custom hook with `renderHook`.
2. Integration test for form - test behavior, not implementation.
3. Mock API with `msw` - test loading and error states.
4. Accessibility test with `jest-axe`.

**Success criteria:**

- Tests describe user behavior, not internals.
- Can explain why testing implementation details is brittle.

**Stretch:** Visual regression testing with Playwright screenshots.

**Proof artifact:** Test suite with all four layers.

---

### Lab 10: Full Feature - End to End

**Scenario:** Task management - create, list, update, delete with real-time updates.

**Build:**

1. Backend: Fastify + PostgreSQL - full CRUD, validation, error handling.
2. Frontend: React + React Query + React Hook Form + TypeScript.
3. Real-time: WebSocket or Server-Sent Events for live updates.
4. Deployment: Docker Compose with both services.

**Success criteria:**

- Feature works end to end with no console errors.
- Can walk through every decision from schema to UI.
- Shared TypeScript types between backend and frontend.

**Stretch:** Optimistic updates so UI feels instant on slow connections.

**Proof artifact:** Full working feature on GitHub. Architecture decision log.

---

## Skill Matrix

| Area | Capable | Senior | Top 10-15% |
| --- | --- | --- | --- |
| Event loop | knows it's async | explains all phases | diagnoses blocking in production |
| Streams | uses them | handles backpressure | builds streaming pipelines |
| API design | builds CRUD | adds auth + validation | versioning, contracts, error design |
| Async patterns | callbacks/promises | queues + caching | distributed patterns at scale |
| Observability | adds logs | structured + metrics | traces requests across services |
| React rendering | uses hooks | explains reconciliation | profiles and optimizes render trees |
| State management | useState | context + reducers | right tool for right type of state |
| Data fetching | useEffect | React Query | caching strategy + optimistic updates |
| Fullstack typing | separate types | shared interfaces | Zod schemas inferred end to end |
| Testing | some unit tests | integration tests | all layers + accessibility |

**Aim for Top 10-15% in at least 6 of 10 areas.**

---

## Interview Question Coverage Summary

| Interview category | Labs that cover it |
| --- | --- |
| Event loop + concurrency | Node 1, 3 |
| Streaming + memory | Node 2 |
| API design + validation | Node 5 |
| Auth + security | Node 6, 13 |
| Database patterns | Node 7 |
| Async + queues | Node 8 |
| Caching | Node 9 |
| Testing philosophy | Node 10 |
| Observability | Node 11 |
| Production readiness | Node 12, 14 |
| System design | Node 15 |
| React rendering + performance | React 1, 6 |
| State management | React 2 |
| Data fetching | React 3 |
| Forms + validation | React 4 |
| Component design | React 5 |
| TypeScript end to end | React 7 |
| Frontend auth | React 8 |
| React testing | React 9 |
| Fullstack ownership | React 10 |

---

## Recommended Weekly Integration

| Week | Focus | Parallel |
| --- | --- | --- |
| 1-2 | Node Labs 1-4 (runtime fundamentals) | DB Labs 1-3 |
| 3-4 | Node Labs 5-8 (API + async) | DB Labs 4-6 |
| 5-6 | Node Labs 9-12 (production) | DB Labs 7-9 |
| 7 | Node Labs 13-15 (security + drill) | DB Labs 10-12 |
| 8-9 | React Labs 1-5 (mental model + patterns) | DB Labs 13-15 |
| 10 | React Labs 6-10 (performance + full feature) | Project integration |

**Storytelling block:** After each lab, spend 15 minutes explaining what you built and one key decision out loud. Feeds directly into interview answers.

**Anki cards:** After each lab, one card per interview question. Question on front, answer framework on back. 15 minutes every morning.

---

_The goal is not to memorize answers. The goal is to have done the thing so the answer comes from experience, not rehearsal. An interviewer can always tell the difference._
