# The `long` package and JSDoc typing in JavaScript

This note ties together two things you often see together in **production JavaScript SDKs** (for example, Hiero / protobuf-generated clients): **64-bit integer values** and **type information in comments** for editors and `tsc --checkJs`.

**Wording:** In this file, **“type the number”** can mean (a) **write TypeScript/JSDoc** around a value — *not* required to use `Long` — or (b) **write a numeric literal as a JS `number`** — *often* something to avoid for true int64 values; prefer **string + `Long.fromString`** or the `Long` you get from the decoder.

## Part A: Why `Long` exists

JavaScript `number` is an IEEE-754 **double**. It can only represent **integers safely** up to `Number.MAX_SAFE_INTEGER` (`2^53 - 1`). Many wire formats and chain APIs use **int64** amounts, counters, and timestamps. For those values, codebases use the [`long`](https://www.npmjs.com/package/long) library: a small **signed 64-bit integer** type with explicit operations.

- **When you see `Long` in a test or SDK:** treat it as *“this value is int64 on the wire, not a JS float.”*
- **Common operations:** `Long.fromValue`, `fromString`, `fromNumber`, `add`, `sub`, `toString`, comparisons.

### Range (this library: **signed** int64)

The [`long`](https://www.npmjs.com/package/long) package models a **signed** 64-bit integer (same as Java’s `long`, C++ `int64_t` in the signed case). The representable **integer** range is **−2^63** through **2^63 − 1** inclusive.

| | Value |
|---|--------|
| **Minimum** | −9,223,372,036,854,775,808 (= −2^63) |
| **Maximum** | 9,223,372,036,854,775,807 (= 2^63 − 1) |

In code, use the library constants: **`Long.MIN_VALUE`** and **`Long.MAX_VALUE`**. Operations that overflow this range use **two’s-complement wraparound** (like fixed-width hardware `int64`), not silent rounding to `number`.

For comparison, JavaScript **`number`** is only *exact* for **integers** in **[−(2^53 − 1), 2^53 − 1]`** (see `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER`).

**Protobuf note:** Wire types such as **`uint64`** and **`sint64`** are different encodings. Decoders may still hand you a **`Long`**; how unsigned values are represented in JS is defined by the generator and may use the same 64 bits with different invariants. When in doubt, use **`Long.fromString`** and your SDK’s documentation.

### You do not need to “type” anything to use `Long`

Here **“type”** means **TypeScript (or JSDoc) type annotations** — not keyboard input.

- **`long` is a normal JavaScript library.** You `import` it, call `Long.fromString(...)`, `.add`, `.toString`, and so on. The runtime does not need types.
- **JSDoc and `// @ts-check` are optional.** They only help the editor and `tsc` catch mistakes; your code runs the same without them. Many tests and apps use `Long` with no annotations at all.
- **You often should not write huge values as `number` literals in source** — a literal like `9007199254740993` in JS is already a rounded float if you use `number`. For int64 work, use **`Long.fromString("9007199254740993")`** (or the `Long` / `string` you get from protobuf or JSON) so the value is exact. You are not “typing the number” into `number` first; you keep it as **string or `Long`** at the boundary.

### When is `Long` used?

| Situation | Why not plain `number`? |
|----------|-------------------------|
| **Protobuf / gRPC** in JS | `int64`, `uint64`, `sint64`, `fixed64`, etc. are 64-bit on the wire. Decoders (e.g. protobufjs) often surface **`Long`** in JavaScript for those fields. |
| **Hiero / Hedera–style SDKs** | **Tinybar** amounts, fees, and other node responses are int64-scoped; tests and mappers use **`Long`** (or string in JSON) to stay exact. |
| **Blockchains and ledgers** | Native token **amounts**, **nonces** / **sequence** numbers, or any API that documents int64. |
| **APIs and JSON** | Some backends send big integers as **strings** in JSON to avoid double rounding in clients; you may **`Long.fromString(s)`** when you need to add or compare. |
| **Time and counters (sometimes)** | Very large **nanosecond** timestamps or monotonic **counters** may exceed the safe integer range. |

If every value you touch fits in **`[-2^53 + 1, 2^53 - 1]`** and the API guarantees that, a plain `number` can be enough. **`Long` is for when the domain is really int64** (or you want to match protobuf / the wire format exactly).

### Examples (`long`)

```ts
import Long from "long";

// From a number (only safe if it fits safe integer range)
const a = Long.fromNumber(100);

// Often amounts arrive as string or Long-like from protobuf
const b = Long.fromString("9007199254740992"); // past MAX_SAFE_INTEGER

// Arithmetic keeps int64 semantics (with overflow at 64 bits, like fixed-width integers)
const sum = a.add(b);

// wire / logging: toString() (commonly decimal; some code uses hex for specific fields)
console.log(sum.toString());
```

### Interop gotcha

If you mix with plain `number`, only do so when you know the value stays in the safe range, or you accept rounding. For boundary testing, keep everything as `Long` until the UI layer.

---

## Part B: JSDoc for types in `.js` files

TypeScript can **typecheck JavaScript** if you add structured comments (`// @ts-check` at top of file, or project-level `checkJs`). SDKs also use JSDoc so that **VS Code and other editors** show correct autocomplete without converting the whole tree to `.ts` immediately.

**Common tags:**

| Tag | Role |
|-----|------|
| `@typedef` | Name a object shape or import a type alias |
| `@param` / `@returns` | Document and type function I/O |
| `@template` | Generics (like `<T>`) for functions or classes |
| `import("module").Name` | Reference a type that lives in another file or a `.d.ts` |

### Example: local typedef

```js
// @ts-check

/**
 * @typedef {{ name: string; count: number }} CounterEvent
 */

/**
 * @param {CounterEvent} event
 * @returns {string}
 */
function formatEvent(event) {
  return `${event.name}: ${event.count}`;
}
```

### Example: generic-style documentation (`@template`)

Matches how generic collections are often documented in class-style JS:

```js
// @ts-check

/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => string} toKey
 * @returns {Map<string, T>}
 */
function keyBy(items, toKey) {
  const m = new Map();
  for (const item of items) {
    m.set(toKey(item), item);
  }
  return m;
}
```

### Example: reusing a type from another module

Same pattern you see in SDKs that depend on generated protobuf types:

```js
// @ts-check

/**
 * @param {import("@hiero-ledger/proto").proto.IAccountID} account
 * @returns {string}
 */
function shardKey(account) {
  return [account.shardNum, account.realmNum, account.accountNum].join(".");
}
```

Use `import("...")` in JSDoc when the **value** is not imported at runtime but you need the **type** for tooling.

---

## Part C: JSDoc + `Long` together

Protobuf fields that are `int64` / `uint64` often show up in code as `Long` (or `string` in some generators). In JSDoc you can point at the class from the package (default export), for example `import("long").default`:

```js
// @ts-check

/**
 * @param {import("long").default} tinybars
 * @returns {string}
 */
function formatTinybars(tinybars) {
  return tinybars.toString();
}
```

Sometimes you cast at a boundary where the type checker is unsure (SDKs do this at protobuf boundaries):

```js
// @ts-check

/**
 * @param {unknown} raw
 * @returns {import("long").default}
 */
function asLong(raw) {
  return /** @type {import("long").default} */ (raw);
}
```

Prefer a real runtime check in production; the cast is only a learning example of what you might *see* in large codebases.

---

## Suggested order

1. Run the small `long` tests in this folder (see root `README.md` quick start) so `Long` is not abstract.
2. Open a real `.js` file from a JS SDK, enable `// @ts-check` locally, and trace `@typedef` / `import("...")` to see how the types connect.

## See also

- [`9-typescript-typeflags-bitmasks/README.md`](../9-typescript-typeflags-bitmasks/README.md) — type flags and bitmasks inside the TypeScript compiler
- [`11-namespaces-and-declare/README.md`](../11-namespaces-and-declare/README.md) — JSDoc `@namespace`, `declare` / `declare namespace`, and how generated `.d.ts` is structured
- [JSDoc reference (TypeScript handbook)](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
