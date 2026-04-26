# Composition Root Pattern

Composition root means: **one explicit place where your app assembles dependencies**.

Instead of creating DB/mailer/clock details inside business classes, create them once in a top-level wiring function (`main`, bootstrap, DI setup) and inject them into use cases.

## Why this pattern exists

- Keeps business policy independent from infrastructure details.
- Makes tests simple (inject fake repo/mailer/clock).
- Makes change easier (swap vendor/SDK in one wiring place).
- Reduces hidden globals and scattered `new SomeClient(...)`.

## In this folder

- `bad.ts` — a class that directly uses concrete globals/details.
- `good.ts` — contracts + adapters + a real composition root (`createApp`).
- `composition-root-pattern.test.ts` — shows testability and default app wiring.

## How to identify you need composition root

- Many classes instantiate concrete SDK clients directly.
- Constructors are empty but methods call globals (`Date.now`, singleton DB, static mail helpers).
- Swapping providers requires editing many business classes.
- Tests need heavy mocks of globals/framework internals.

## Minimal template

```ts
// contracts
interface Repo { /* ... */ }
interface Mailer { /* ... */ }

// policy
class UseCase {
  constructor(private repo: Repo, private mailer: Mailer) {}
}

// composition root
function createApp() {
  const repo = new SqlRepo(/*...*/);
  const mailer = new SmtpMailer(/*...*/);
  return { useCase: new UseCase(repo, mailer) };
}
```

## Cross-language mapping

- TypeScript: `createApp()` / bootstrap file
- C#: `Program.cs` / DI registrations
- Java: Spring configuration / bean wiring
- Go: `main()` wiring structs/interfaces

## Backing concepts

- Dependency Inversion Principle (high-level policy depends on abstractions).
- Clean/Hexagonal architecture dependency direction.

## Run this topic's tests

```bash
npm test -- 4-composition-root-pattern/composition-root-pattern.test.ts
```
