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

## Quick start

- Prerequisite: Node 20+
- Run tests from repo root:

```bash
npm test -- 3-contracts-types-classes-composition/contracts-types-classes-composition.test.ts
npm test -- 4-composition-root-pattern/composition-root-pattern.test.ts
```
