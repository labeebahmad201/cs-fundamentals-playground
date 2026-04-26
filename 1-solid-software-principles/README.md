# SOLID software principles (with working TypeScript examples)

These five principles help you **structure** object-oriented code so it is easier to **change**, **test**, and **reason about**. Each section below includes a **definition**, a **small anti-pattern** in this repo, and a **fix** you can open in the editor.

## Definitions

**S — Single Responsibility Principle (SRP).** A class or module should have **one, and only one, reason to change**—a single, coherent responsibility. If a type does unrelated jobs (e.g. validation, persistence, and email), changes to any one of those areas force you to re-edit the same class and make focused testing harder.

**O — Open/Closed Principle (OCP).** Software entities (classes, modules, functions) should be **open for extension** but **closed for modification**: you can add new behavior (new types, new strategy objects) without changing a stable, working core. You avoid piling new rules into a single `switch` or a growing `if` tree that every change has to re-touch.

**L — Liskov Substitution Principle (LSP).** **Subtypes must be substitutable** for their base type (or for the type they implement) **without breaking the expectations** of code that was written against the base. If callers assume “calling this method returns a usable value,” a subtype that throws, misbehaves, or returns nonsense under the same preconditions is not a valid substitute, even if it compiles.

**I — Interface Segregation Principle (ISP).** **No client** should be forced to depend on **methods it does not use**. Large “fat” interfaces that mix many roles force every implementer and every consumer to know about the whole surface; **split the contract** so each client depends on the smallest set of methods it needs.

**D — Dependency Inversion Principle (DIP).** **High-level** policy and **low-level** details should both depend on **abstractions** (e.g. interfaces, ports), not on each other. **Abstractions** should not depend on concrete file/DB/HTTP/mail code; the **infrastructure** and framework details are supplied at a **composition root** (wiring) so the core can be tested and reconfigured without rewrites.

---

Run everything in one shot (console output for each letter):

```bash
cd /Users/labeeb/Documents/projects/cs-fundamentals-playground
npm run demo:solid
```

Run the automated checks for the “good” paths:

```bash
npm test -- 1-solid-software-principles/solid.test.ts
```

| Letter | Principle | Bad (violation) | Good (direction) |
|--------|------------|-----------------|------------------|
| **S** | Single Responsibility | `s-single-responsibility/bad.ts` | `s-single-responsibility/good.ts` |
| **O** | Open/Closed | `o-open-closed/bad.ts` | `o-open-closed/good.ts` |
| **L** | Liskov Substitution | `l-liskov-substitution/bad.ts` | `l-liskov-substitution/good.ts` |
| **I** | Interface Segregation | `i-interface-segregation/bad.ts` | `i-interface-segregation/good.ts` |
| **D** | Dependency Inversion | `d-dependency-inversion/bad.ts` | `d-dependency-inversion/good.ts` |

---

## S — Single Responsibility Principle

**In this example:** A class or module should not mix **validation**, **persistence**, and **email**; see the definition of S above.

**Bad:** `RegisterUserGod` in `s-single-responsibility/bad.ts` stores users, checks email format, and prints a “welcome” line. You cannot test “only validation” in isolation without pulling in the rest.

**Fix:** Split **validators**, **stores**, and **notifiers** behind small interfaces; let `UserRegistration` in `s-single-responsibility/good.ts` **orchestrate** them. Each piece can be swapped or unit-tested on its own.

---

## O — Open/Closed Principle

**In this example:** New discount **rules** should be new types that plug into an engine, not new branches in one function. See the definition of O above.

**Bad:** `totalWithBranches` in `o-open-closed/bad.ts` adds rules with more `if` blocks. Every new marketing campaign reopens the same function.

**Fix:** Model each rule as `PriceRule` with an `apply` method; `PricingEngine` in `o-open-closed/good.ts` **chains** rules. Add `FreeShippingRule` or `CapAtZeroRule` as new classes without changing the engine’s loop.

---

## L — Liskov Substitution Principle

**In this example:** Two implementations of the same interface should both be safe to use where the interface is expected: one that **throws** on normal use breaks callers that work with a sibling type. See the definition of L above.

**Bad:** `ExplodingTextSource` in `l-liskov-substitution/bad.ts` implements `TextSource` but `readAllLines` throws. Code that only iterates over `InMemoryTextSource` will break if you pass an exploding implementation.

**Fix:** Keep implementations that share an interface **honest to the same contract** (see `InMemoryLines` and `PrefixedFileLines` in `l-liskov-substitution/good.ts`). If failure is normal, use a **narrower type** or return a `Result` / `Option` instead of throwing in one branch and not others.

---

## I — Interface Segregation Principle

**In this example:** A read-only feature should depend on a **read-only** slice of the API, not a “god” service interface that also lists writes and audits. See the definition of I above.

**Bad:** `FatProductService` in `i-interface-segregation/bad.ts` forces `ReadonlyDashboardBad` to be typed against the full surface, even if it only needs `allProductNames()`.

**Fix:** Split into **role interfaces**—`ProductQuery` for reads and `ProductCommand` for writes in `i-interface-segregation/good.ts`. `ReadonlyReport` only takes `ProductQuery`. One concrete `ProductService` can still implement both.

---

## D — Dependency Inversion Principle

**In this example:** A use case should take **injected** ports (e.g. `OrderRead`, `Notifier`) instead of calling static helpers for DB and SMTP. See the definition of D above.

**Bad:** `OrderNotifierDirect` in `d-dependency-inversion/bad.ts` calls `DirectInfra` directly. Unit tests are stuck with that shape unless you change production code.

**Fix:** `OrderPlacedUseCase` in `d-dependency-inversion/good.ts` takes `OrderRead` and `Notifier`. Tests inject `fakeOrderRead` and `captureNotifier()`; production wiring passes real DB and SMTP implementations.

---