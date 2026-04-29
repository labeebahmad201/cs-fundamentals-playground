# Design Principles and Patterns

## What is a design pattern?

A design pattern is a reusable solution template for a recurring design problem in software.

Important: a pattern is not a full copy-paste implementation.  
It is a structured approach you adapt to your context.

Why patterns matter:

- give teams a shared vocabulary
- reduce trial-and-error for common architecture problems
- improve maintainability by using known, proven structures

---

## What is the Strategy Pattern?

Strategy Pattern defines a family of interchangeable algorithms/behaviors behind a common interface.

Instead of hardcoding one behavior with many `if/else` branches, you encapsulate each behavior as a separate strategy and choose one at runtime (or wiring time).

### Core pieces

1. **Strategy interface** (common contract)
2. **Concrete strategies** (different implementations)
3. **Context** (uses the strategy via the interface)

### Why use it?

- replace conditional-heavy logic with composable behavior objects
- add new behavior without changing existing context logic
- make unit testing easier by injecting mock/fake strategies

---

## Why is Strategy a behavioral pattern?

Patterns are often grouped as:

- Creational (object creation)
- Structural (object composition/relationships)
- Behavioral (object interaction and runtime behavior)

Strategy is behavioral because its main purpose is to define **how behavior is selected and executed** at runtime.

It focuses on:

- delegation of behavior from context to strategy object
- interchangeable runtime behavior
- communication through a shared contract

It is not primarily about object creation (creational) or class composition shape (structural).  
It is about behavior variation and behavior dispatch.
