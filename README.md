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

- [`12-design-principles-and-patterns/`](12-design-principles-and-patterns/)
  - foundational notes for design patterns
  - includes Strategy Pattern and why it is behavioral
  - Start with [`12-design-principles-and-patterns/README.md`](12-design-principles-and-patterns/README.md)

- [`13-inheritance-vs-composition-article/`](13-inheritance-vs-composition-article/)
  - long-form article draft: inheritance is not for code reuse
  - includes examples, trade-offs, and decision guide
  - Start with [`13-inheritance-vs-composition-article/README.md`](13-inheritance-vs-composition-article/README.md)

## 4) Security fundamentals

- [`security/xss/`](security/xss/)
  - cross-site scripting (XSS): untrusted input rendered as executable markup
  - bad direct injection vs good context-appropriate output encoding
  - Start with [`security/xss/README.md`](security/xss/README.md)

- [`security/broken-access-control/`](security/broken-access-control/)
  - authorization failures that expose data/actions to the wrong user
  - endpoint-level + object-level + tenant-level authorization checks
  - Start with [`security/broken-access-control/README.md`](security/broken-access-control/README.md)

## 5) Data systems scaling

- [`9-database-scaling-replication-and-sharding/`](9-database-scaling-replication-and-sharding/)
  - scaling path: read replicas first, then sharding at larger data/traffic scale
  - shard model with replicas and reduced failure blast radius
  - Start with [`9-database-scaling-replication-and-sharding/README.md`](9-database-scaling-replication-and-sharding/README.md)

- [`11-postgresql-performance-drills/`](11-postgresql-performance-drills/)
  - practical PostgreSQL performance track (7 recurring topics)
  - Day 1 includes index drills with runnable setup + explain-analyze practice
  - Start with [`11-postgresql-performance-drills/README.md`](11-postgresql-performance-drills/README.md)

## 6) Fullstack mastery track

- [`14-nodejs-react-mastery-labs/`](14-nodejs-react-mastery-labs/)
  - 25-lab Node.js + React senior-level progression with interview framing
  - includes skill matrix, pacing, and weekly integration plan
  - Start with [`14-nodejs-react-mastery-labs/README.md`](14-nodejs-react-mastery-labs/README.md)

npm test -- 7-coupling-and-cohesion/coupling-and-cohesion.test.ts
npm test -- 8-use-case-orchestration-and-concerns/use-case-orchestration-and-concerns.test.ts
```