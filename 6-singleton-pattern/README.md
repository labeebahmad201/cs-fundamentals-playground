# Singleton Pattern (and safer alternatives)

Singleton means "one instance for the application lifetime."  
That lifetime choice can be valid. The common problem is **global static access** to that instance from everywhere.

## What to learn here

- Singleton lifetime is not automatically wrong.
- Global static access often hurts testability and coupling.
- Prefer "single instance created at composition root and injected."

## In this folder

- `bad.ts`: static global singleton access (`getInstance`) + hidden shared state.
- `good.ts`: same single-instance behavior, but explicit dependency injection.
- `singleton-pattern.test.ts`: compares both approaches.

## When singleton can be okay

- Truly app-wide, stateless utility with no hidden mutable state.
- Expensive resource that should be created once (still preferably wired in bootstrap).
- Infrastructure managed by framework DI singleton lifetime.

## Common risks with static singleton style

- Hidden dependencies (`SomeService` quietly reaches `ConfigSingleton.getInstance()`).
- Global mutable state leaking across tests.
- Hard to replace in tests without custom reset hooks.
- Tight coupling to one concrete implementation.

## What coupling issues arise in `bad.ts`?

`WelcomeServiceBad` appears dependency-free, but it is tightly coupled in several ways:

- **Concrete coupling:** `WelcomeServiceBad` directly calls `AppConfigSingleton.getInstance()`, so it is bound to that one class instead of a contract.
- **Hidden dependency coupling:** the dependency is not visible in constructor/API; readers and tests cannot see required collaborators from the type signature.
- **Global state coupling:** any call to `AppConfigSingleton.set(...)` affects all consumers; behavior depends on external call order.
- **Lifecycle coupling:** static singleton forces one global lifetime; moving to per-tenant/per-request config later requires broader rewrites.

In short: the class is coupled to **a specific global implementation and global lifecycle**.  
`good.ts` removes this by injecting `AppConfig` explicitly.

## Better default

1. Define a contract for what the service needs.
2. Create one instance in composition root / DI container.
3. Inject that dependency into consumers.

This gives singleton lifetime benefits without global access costs.

## Run

```bash
npm test -- 6-singleton-pattern/singleton-pattern.test.ts
```
