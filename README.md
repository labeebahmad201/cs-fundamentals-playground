# CS fundamentals playground

This repo currently focuses on:

## Featured topic

- [`3-contracts-types-classes-composition/`](3-contracts-types-classes-composition/)
  - Source-backed, framework-agnostic guide for:
    - 4-layer thinking (Intent -> Contracts -> Details -> Composition)
    - when to use `interface` vs `type`
    - concrete implementations (class/function/object)
    - composition root wiring
  - Start with [`3-contracts-types-classes-composition/README.md`](3-contracts-types-classes-composition/README.md)

- [`4-composition-root-pattern/`](4-composition-root-pattern/)
  - Deep dive into composition root pattern:
    - what it is
    - why wiring in one place matters
    - bad vs good TypeScript examples
    - test-backed usage
  - Start with [`4-composition-root-pattern/README.md`](4-composition-root-pattern/README.md)

- [`6-singleton-pattern/`](6-singleton-pattern/)
  - Singleton pattern trade-offs and safer alternatives
  - Shows static-global anti-pattern vs composition-root-injected single instance
  - Start with [`6-singleton-pattern/README.md`](6-singleton-pattern/README.md)

- [`7-coupling-and-cohesion/`](7-coupling-and-cohesion/)
  - Core design topic: low/high coupling and low/high cohesion
  - Includes bad/good TypeScript examples and test-backed refactor cues
  - Start with [`7-coupling-and-cohesion/README.md`](7-coupling-and-cohesion/README.md)

- [`8-use-case-orchestration-and-concerns/`](8-use-case-orchestration-and-concerns/)
  - Defines concern as "reason to change" and clarifies what is allowed in use-case orchestration
  - Shows bad/good TypeScript examples for orchestration vs inlined details
  - Start with [`8-use-case-orchestration-and-concerns/README.md`](8-use-case-orchestration-and-concerns/README.md)

## Quick start

- Prerequisite: Node 20+
- Run tests from repo root:

```bash
npm test -- 3-contracts-types-classes-composition/contracts-types-classes-composition.test.ts
npm test -- 4-composition-root-pattern/composition-root-pattern.test.ts
npm test -- 6-singleton-pattern/singleton-pattern.test.ts
npm test -- 7-coupling-and-cohesion/coupling-and-cohesion.test.ts
npm test -- 8-use-case-orchestration-and-concerns/use-case-orchestration-and-concerns.test.ts
```
