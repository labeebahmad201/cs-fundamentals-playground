# Namespaces and `declare` in TypeScript (and JSDoc)

You see **three** related ideas in large codebases: **JSDoc `@namespace`** in `.js` SDKs, the **`declare` keyword** in declaration files, and the **`namespace` keyword** in TypeScript. They all **organize names**; they are **not** the same feature.

## 1) JSDoc `@namespace` in JavaScript (Hiero / SDK style)

**Purpose:** group typedefs and give **qualified** names the editor understands, *without* a runtime import of types.

A block at the top of a file can look like this (pattern from Hiero’s JS sources):

```js
/**
 * @namespace proto
 * @typedef {import("@hiero-ledger/proto").proto.ITransferList} HieroProto.proto.ITransferList
 * @typedef {import("@hiero-ledger/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
```

- `@namespace proto` is a **documentation / tooling hook**; it does not create a runtime `proto` object by itself.
- The important part is the **right-hand side of `@typedef`**: you import a type from a package (`import("...")`) and you assign a **name** you will use in this file, e.g. `HieroProto.proto.ITransferList`.
- Later, `@param {HieroProto.proto.ITransferList} transfers` tells the type checker the shape of `transfers`.

**How it connects to the real package:** `@hiero-ledger/proto` exports a **`proto` object** at runtime (and types built from the same message tree). The JSDoc name `HieroProto` is a **convention** for the “module type scope” — it is not a reserved keyword. You could use another alias, as long as you are consistent in that file.

```js
 * @param {HieroProto.proto.IAccountID} id
```

So: **“namespace set up”** in this style = **`@namespace` + `@typedef` names that look like `Alias.segment.MessageType`**.

## 2) `declare` in TypeScript: types only, no implementation

`declare` means: **TypeScript can talk about a value or type, but you are not providing a runtime body** in *this* file. Common uses:

| Form | Meaning |
|------|--------|
| `declare const x: string` | There is a global (or module) `x`; no initializer here. |
| `declare function f(): void` | There is a function `f`; no body here. |
| `declare class C { }` | A class `C` for typing; no implementation in this file. |
| `declare module "pkg" { }` | Shape of the module you `import` from `"pkg"`. |
| `declare namespace N { }` | A **tree of type-only names** (very common in generated `.d.ts`). |

**`.d.ts` (declaration) files** use `declare` a lot, because the whole file is (usually) type-only. Example shape from a generated proto bundle:

```ts
// Simplified: real files are huge and nested
export = hashgraph;

declare namespace hashgraph {
  namespace proto {
    interface IAccountID { /* … */ }
    class AccountID /* … */ { }
  }
}
```

- **`export =`**: classic CommonScript interop; one default-ish export the consumer binds.
- **`declare namespace hashgraph`**: the types live under a **hierarchical** name, matching protobuf package names and nested messages.

**Why not write `class AccountID` with a body?** The implementation might live in JavaScript elsewhere; the `.d.ts` only **describes** the API for the type checker and your editor.

## 3) The TypeScript `namespace` keyword (runtime or merged)

**TypeScript** also has a **`namespace` keyword** (not the same as JSDoc’s `@namespace`):

```ts
namespace MathUtil {
  export const half = (n: number) => n / 2;
}
```

- This *can* emit a runtime object (depending on `module` settings and `export` usage).
- Modern app code more often uses **ES modules** (`import` / `export`) and **file scope**; `namespace` is used less in application code, but you still see it in:
  - older code,
  - generated **Declaration merging**,
  - some .d.ts **ambient** structure.

**Do not** confuse: **`declare namespace` (types, common in .d.ts)** vs **`namespace Foo { }` in .ts` (TypeScript’s own feature)**.

## 4) `declare global` and module scope (briefly)

In a file that is a **module** (has a top-level `import` or `export`), a global you want to add must be wrapped if you are augmenting globals on purpose:

```ts
export {};

declare global {
  interface Window {
    myApp?: { version: string };
  }
}
```

Use this when you *intend* to extend a global; otherwise prefer normal module exports.

## 5) Suggested order

1. Read this file top to bottom.
2. Open `11-namespaces-and-declare/namespace-basics.test.ts` and `ambient.d.ts` in this repo — a tiny `declare namespace` and a small runtime `namespace` in tests.
3. In Hiero, skim `@hiero-ledger/proto`’s `index.d.ts` and one generated `proto` entry point; then read a small `.js` file that uses `@namespace` and `HieroProto.proto.*` in JSDoc.

## See also

- [`10-long-and-jsdoc-typing/README.md`](../10-long-and-jsdoc-typing/README.md) — `import("...")` in JSDoc, `Long`, checkJs
- [TypeScript handbook: Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html)
- [TypeScript: Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) — `declare`, `.d.ts`, and ambient context
