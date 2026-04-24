# Coupling and Cohesion

Two core design forces:

- **Coupling** = how strongly one module depends on others.
- **Cohesion** = how focused a module is around one clear responsibility.

Good systems tend toward **lower coupling** and **higher cohesion**.

## Quick definitions

- **High coupling**: changing one part forces many other parts to change.
- **Low coupling**: modules interact through small contracts and are easier to swap/test.
- **Low cohesion**: one module does many unrelated jobs.
- **High cohesion**: a module does one coherent job well.

## In this folder

- `bad.ts`:
  - `UserModuleGod` handles validation, persistence, auditing, email, and password resets.
  - hard-coded concrete dependencies (`new EmailClient()`, `new AuditStore()`).
  - example of high coupling + low cohesion.
- `good.ts`:
  - `RegisterUserUseCase` focuses on one intent: user registration.
  - dependencies are contracts (`UserRepo`, `Notifier`, `AuditLog`, policies).
  - composition root (`createRegistrationModule`) wires adapters.
- `coupling-and-cohesion.test.ts`: compares behavior and testability.

## Refactor cues

If you see these, coupling/cohesion may be off:

- One class name is broad (`Manager`, `Module`, `God`, `Util`) and has many methods.
- Constructor has many concrete `new` calls.
- A method mixes domain rules with I/O and side effects.
- Changes in one business rule require touching unrelated infrastructure code.

## Practical rule

1. Split by **reason to change** (cohesion).
2. Depend on **contracts** for external capabilities (coupling).
3. Wire concrete details in one place (composition root).

## Run

```bash
npm test -- 7-coupling-and-cohesion/coupling-and-cohesion.test.ts
```
