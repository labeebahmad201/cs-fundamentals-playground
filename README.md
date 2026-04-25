# CS fundamentals playground

This repo is organized by topic groups so related ideas are learned together.

## 1) Architecture foundations

- [`3-contracts-types-classes-composition/`](3-contracts-types-classes-composition/)
  - framework-agnostic 4-layer model (Intent -> Contracts -> Details -> Composition)
  - `interface` vs `type`, concrete implementations, composition root
  - Start with [`3-contracts-types-classes-composition/README.md`](3-contracts-types-classes-composition/README.md)

## 2) Wiring and lifecycle patterns

- [`4-composition-root-pattern/`](4-composition-root-pattern/)
  - composition root pattern and wiring in one place
  - bad vs good examples with tests
  - Start with [`4-composition-root-pattern/README.md`](4-composition-root-pattern/README.md)

- [`6-singleton-pattern/`](6-singleton-pattern/)
  - singleton trade-offs and safer alternative via composition root injection
  - static-global vs explicit dependency style
  - Start with [`6-singleton-pattern/README.md`](6-singleton-pattern/README.md)

## 3) Design quality (module-level)

- [`7-coupling-and-cohesion/`](7-coupling-and-cohesion/)
  - low/high coupling and low/high cohesion
  - refactor cues and bad/good examples
  - Start with [`7-coupling-and-cohesion/README.md`](7-coupling-and-cohesion/README.md)

- [`8-use-case-orchestration-and-concerns/`](8-use-case-orchestration-and-concerns/)
  - concern = reason to change
  - what is allowed in use-case orchestration vs what should be delegated
  - Start with [`8-use-case-orchestration-and-concerns/README.md`](8-use-case-orchestration-and-concerns/README.md)

- [`12-circular-dependencies/`](12-circular-dependencies/)
  - what circular dependencies are and why module init order breaks
  - bad `a <-> b` cycle vs good refactor through `shared`
  - Start with [`12-circular-dependencies/README.md`](12-circular-dependencies/README.md)

## 4) Type system internals

- [`9-typescript-typeflags-bitmasks/`](9-typescript-typeflags-bitmasks/)
  - `ts.Type`, `TypeFlags`, and bitmask checks (`|`, `&`)
  - practical patterns for compiler API and ESLint rule logic
  - Start with [`9-typescript-typeflags-bitmasks/README.md`](9-typescript-typeflags-bitmasks/README.md)

- [`10-long-and-jsdoc-typing/`](10-long-and-jsdoc-typing/)
  - the `long` package: int64 in JavaScript, safe integers vs `Number`, protobuf-style amounts
  - JSDoc: `@typedef`, `@param`, `@template`, and `import("...")` types in `.js` (SDK-style)
  - Start with [`10-long-and-jsdoc-typing/README.md`](10-long-and-jsdoc-typing/README.md)

- [`11-namespaces-and-declare/`](11-namespaces-and-declare/)
  - JSDoc `@namespace` + `HieroProto.proto.*` typedefs (JS SDKs)
  - `declare` / `declare namespace` / `declare module` in `.d.ts` (e.g. generated protobuf)
  - TypeScript `namespace` vs runtime ES modules; link to `declare global`
  - Start with [`11-namespaces-and-declare/README.md`](11-namespaces-and-declare/README.md)

## Quick start

- Prerequisite: Node 20+
- Run tests from repo root:

```bash
npm test -- 3-contracts-types-classes-composition/contracts-types-classes-composition.test.ts
npm test -- 4-composition-root-pattern/composition-root-pattern.test.ts
npm test -- 6-singleton-pattern/singleton-pattern.test.ts
npm test -- 7-coupling-and-cohesion/coupling-and-cohesion.test.ts
npm test -- 8-use-case-orchestration-and-concerns/use-case-orchestration-and-concerns.test.ts
npm test -- 10-long-and-jsdoc-typing/long-basics.test.ts
npm test -- 11-namespaces-and-declare/namespace-basics.test.ts
npm test -- 12-circular-dependencies/circular-dependencies.test.ts
```
