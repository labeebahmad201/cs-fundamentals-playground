# Contracts vs Types vs Classes vs Composition

This guide is a framework-agnostic way to structure code so the same thinking works in TypeScript, C#, Java, and Go.

Use this default:

- Intent (use case) defines business flow.
- Policy contracts (ports) define required capabilities.
- Details (adapters) implement those capabilities.
- Composition root wires details into intent.

## 4-layer thinking (TS, C#, Java, Go)

This model is language/framework agnostic. Only syntax changes across ecosystems.

### 1) Intent (Use Case)

**Question:** "What business action are we doing?"

Examples:

- Register user
- Authorize payment
- Create order

In this folder:

- `RegisterUserUseCase` in `good.ts` is the intent/policy layer.
- It coordinates steps, not infrastructure internals.

Tiny TS sketch:

```ts
class RegisterUserUseCase {
  run(input: UserInputDto): boolean { /* business flow */ }
}
```

### 2) Policy Contracts (Ports)

**Question:** "What capabilities does this intent need?"

Examples:

- `ValidateEmail`
- `SaveUser`
- `SendWelcome`

In this folder:

- `EmailValidator`, `UserStore`, `WelcomeNotifier` are ports (behavior contracts).

Tiny TS sketch:

```ts
interface EmailValidator { isValid(email: string): boolean; }
interface UserStore { has(email: string): boolean; save(user: UserInputDto): void; }
interface WelcomeNotifier { sendWelcome(user: UserInputDto): void; }
```

### 3) Details (Adapters / Implementations)

**Question:** "How is each capability done today?"

Examples:

- Regex/at-sign validator
- SQL repository
- SMTP sender

In this folder:

- `AtSignEmailValidator` (class), `createInMemoryUserStore` (function + closure), `consoleWelcomeNotifier` (object literal) are concrete details.

Tiny TS sketch:

```ts
class AtSignEmailValidator implements EmailValidator { /* ... */ }
function createInMemoryUserStore(): UserStore { /* ... */ }
const consoleWelcomeNotifier: WelcomeNotifier = { /* ... */ };
```

### 4) Composition (Wiring)

**Question:** "Where do we connect policy to details?"

Examples:

- Startup/bootstrap
- DI container registrations
- `main`
- controller factory

In this folder:

- `createRegistrationFlow()` is the composition root; it selects concrete implementations and injects them into `RegisterUserUseCase`.

Tiny TS sketch:

```ts
function createRegistrationFlow() {
  return new RegisterUserUseCase(
    new AtSignEmailValidator(),
    createInMemoryUserStore(),
    consoleWelcomeNotifier,
  );
}
```

### Cross-language mapping

| Layer | TypeScript | C# | Java | Go |
|---|---|---|---|---|
| Intent (Use Case) | `class RegisterUserUseCase` | application service/handler class | service/use-case class | use-case struct + method |
| Policy Contracts (Ports) | `interface` (or type contract) | `interface` | `interface` | small interface |
| Details (Adapters) | class/function/object | concrete class | concrete class | struct with methods |
| Composition (Wiring) | bootstrap factory | `Program.cs` / DI registration | Spring/Guice config | `main` wiring |

## Decision matrix

| Need | Use | Why |
|---|---|---|
| "Something must provide `save`, `send`, `isValid`" | `interface` behavior contract | Keeps high-level policy independent from concrete details |
| "Data has `email`, `name`" | `type` (or `interface`) data shape | Single source of shape; easy refactors |
| "How it really works" | class/function/object implementation | Swappable detail without changing use case |
| "Where app chooses concrete parts" | composition root (`create...` / bootstrap) | One place to wire infra + policy |

## Files in this folder

- `bad.ts`: concrete coupling in one class (works, but less swappable).
- `good.ts`: contracts + implementations + `createRegistrationFlow()` composition root.
- `contracts-types-classes-composition.test.ts`: proves swappability and default wiring.

## Authoritative backing (not invented here)

### Architecture principles

- Robert C. Martin, **Dependency Inversion Principle (DIP)** and SOLID foundations.
- Robert C. Martin, **Clean Architecture** (policy vs details, dependency direction).
- Alistair Cockburn, **Hexagonal Architecture (Ports and Adapters)**.

These sources align on one idea: keep core policy dependent on abstractions, push framework/DB/email details to edges.

### TypeScript language guidance

- TypeScript Handbook: [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- TypeScript Handbook: [Object Types / Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- TypeScript Handbook note on interface/type overlap: [Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)

TypeScript itself says both `type` and `interface` can model object shapes; use cases overlap. The key is consistent conventions and clear boundaries.

## Practical defaults for this repo

- **Behavior seams:** `interface` (`EmailValidator`, `UserStore`, `WelcomeNotifier`)
- **Data payloads:** `type` (`UserInputDto`)
- **Implementations:** class/function/object (`AtSignEmailValidator`, `createInMemoryUserStore`, `consoleWelcomeNotifier`)
- **Wiring:** composition root (`createRegistrationFlow`)

## Run tests for this topic

```bash
npm test -- 3-contracts-types-classes-composition/contracts-types-classes-composition.test.ts
```
