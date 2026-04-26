# Use-Case Orchestration and Concerns

This topic answers a subtle question:

**If concerns are reasons to change, is it okay that use-case methods still contain lines for those concerns?**

Yes, in many cases it is okay.

## Key definition

- **Concern** = a distinct **reason to change**.
  - Persistence concern -> changes when storage behavior changes.
  - Audit concern -> changes when audit policy changes.
  - Notification concern -> changes when notification policy changes.

## What is allowed in good practice

A use case can and should contain **orchestration lines** across concerns, for example:

1. persist
2. audit
3. notify

That is part of business workflow ownership.

What should be avoided:

- inlined low-level details (SDK calls, global state mutations, direct infra logic) inside the use case.

## In this folder

- `bad.ts`: concern lines + inlined concrete details in the use case.
- `good.ts`: concern lines remain in `run`, but details are delegated to contracts.
- `use-case-orchestration-and-concerns.test.ts`: verifies both styles and shows the preferred pattern.

## Practical rule

- **Allowed:** orchestration of concerns in the use case.
- **Avoid:** implementation details of each concern in the use case.

This keeps intent readable while still separating responsibilities.

## Run

```bash
npm test -- 8-use-case-orchestration-and-concerns/use-case-orchestration-and-concerns.test.ts
```
