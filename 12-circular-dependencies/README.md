# Circular Dependencies: Why They Hurt and How to Fix

Circular dependency means module A imports module B, while module B (directly or indirectly) imports module A.

This can cause:

- runtime initialization errors in ESM (`Cannot access 'x' before initialization`)
- fragile startup ordering
- hard-to-reason coupling between modules
- hidden architecture problems (feature code depending on each other both ways)

## Bad Example (cycle)

`bad/a.ts` imports `bad/b.ts`, and `bad/b.ts` imports `bad/a.ts`.
Both read imported values at module top level, so evaluation order can break.
Depending on bundler/runtime this can show up as `undefined` values or hard throws.
In this lesson we make the failure explicit with a guard throw.

## Good Example (cycle removed)

Move shared values into a third module (`good/shared.ts`).
Then `good/a.ts` and `good/b.ts` depend on `shared.ts`, not on each other.

That creates a one-way dependency graph:

`a -> shared <- b`

instead of:

`a <-> b`

## Practical refactor patterns

- Extract shared constants/types/interfaces to a third module.
- Depend on abstractions (`interface`) instead of concrete classes across boundaries.
- Move wiring to a composition root so feature modules do not import each other.
- Keep domain layer acyclic; UI/infrastructure can depend inward, not sideways.

## Run the example test

```bash
npm test -- 12-circular-dependencies/circular-dependencies.test.ts
```
