# TypeScript `TypeFlags`: Short Practical Guide

## AST -> Type Checker -> Flags

1. **AST (Abstract Syntax Tree)**  
   TypeScript parses source text into structured nodes (`Identifier`, `TSAsExpression`, etc.).

2. **Type Checker**  
   The checker reads AST + symbols and computes semantic types for nodes.

3. **`ts.Type` and `type.flags`**  
   When you call `getTypeAtLocation(node)`, you get a `ts.Type` object.  
   `type.flags` is metadata on that object.

```ts
const type = services.getTypeAtLocation(node);
```

## What `type.flags` means

- `type.flags` is a **bitmask number**.
- `ts.TypeFlags.*` are named bit constants (`Number`, `Union`, `EnumLike`, etc.).
- Check with bitwise `&`:

```ts
const isNumberLike = (type.flags & ts.TypeFlags.NumberLike) !== 0;
```

Why bitmasks? They are compact and fast for repeated category checks.

## Important clarity

- `type` is **not** text in your source file.
- It is a runtime object returned by the compiler API for a specific AST node.
- Different nodes -> different `ts.Type` objects -> different `flags`.

## Enum checks: `Enum` vs `EnumLiteral` vs `EnumLike`

Use based on strictness:

- `Enum`: narrow check (actual enum type forms only)
- `EnumLiteral`: enum member/literal forms
- `EnumLike`: broad enum-related check (usually best for rule branching)

For most ESLint rule conditions, prefer:

```ts
const isEnumish = (type.flags & ts.TypeFlags.EnumLike) !== 0;
```

If you need explicit control:

```ts
const isEnumOrLiteral =
  (type.flags & (ts.TypeFlags.Enum | ts.TypeFlags.EnumLiteral)) !== 0;
```

## Practical combo for debugging

Use strings for human readability, flags for logic:

```ts
console.log({
  text: checker.typeToString(type),
  flags: type.flags,
});
```
