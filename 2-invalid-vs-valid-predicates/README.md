# Invalid vs valid: early `return` vs a positive `isValid` (De Morgan’s law)

This section is for **clarity and code quality** (when to use `isValid` vs a guard, and how `!` and `||` / `&&` line up). There is no separate “demo” script; use the README, the small pair of functions in `email-early-exit-vs-valid.ts`, and the tests to verify the equivalence.

**Why this confuses people:** the same real-world rule is written in two *equivalent* boolean shapes. In one you ask “**should I abort?**” in the other you ask “**is it OK?**” Negating a compound condition (with `||`) **does not** mean “stick `!` in front and leave the inside unchanged”—the **`||` turns into `&&`**, and each part flips in a way that *matches* the meaning of “not.”

This folder documents that for the **email registration** check used in [`1-solid-software-principles/s-single-responsibility/`](../1-solid-software-principles/s-single-responsibility/README.md) (`bad.ts` early exit vs `good.ts`’s `isValid` on `EmailValidator`).

## Two shapes of the *same* rule

**1) “Invalid” — the condition you put in the `if` before a `return` (reject / exit early).**

`bad.ts` (conceptually):

```ts
if (email.trim() === "" || !email.includes("@")) {
  return;
}
// “not invalid” → we continue
```

Name that condition:

- **A** = `email.trim() === ""`  (treat as “empty / unusable”)
- **B** = `!email.includes("@")`  (treat as “no @ so not our toy format”)

**Invalid** = `A || B`  
(Same as: *empty after trim* **or** *missing `@`*.)

**2) “Valid” — a positive `isValid` used by `if (!isValid) return` or a validator interface:**

```ts
isValid: (email) => email.trim() !== "" && email.includes("@"),
```

Here:

- not **A** → `email.trim() !== ""`
- not **B** → not (`!email.includes("@")`) → `email.includes("@")`

**Valid** = `(not A) && (not B)`.

## Why `!` on the *whole* thing rewrites the inside (De Morgan)

In words: **not (A or B)** is the same as **(not A) and (not B)**.

So: **if invalid** = `A || B`, then **valid** = `! (A || B)` = `(!A) && (!B)`.

- The outer `!` (invalid → valid) is **not** “put `!` in front and keep `||`.”
- The **`||` becomes `&&`** so that the middle ground (“only one of the two problems”) still fails—both sides must be OK to call it valid for this toy rule.

If you *only* flipped `===` to `!==` and left `||`, you would *not* get a predicate equivalent to the original early-exit. The **combinator** (`||` / `&&`) and the **literals** must move together in a way that **matches** the algebra.

## Cues you can repeat

- If you have **`if (bad) return;`**, then **`good`** in the same sense is **`!bad`**. If `bad` is a big `A || B || C`, use De Morgan: rewrite as **ands of the negated pieces** (or build `bad` in one function and return `!bad()` in `isValid`).
- Prefer **one source of truth**: either one `isInvalid` and `isValid = (x) => !isInvalid(x)` or the opposite—avoid duplicating two long expressions that *look* different but *should* match.
- In interviews, being able to say *“I negated the disjunction, so the conditions combine with and”* is exactly this idea.

## Code in this folder

| File | Role |
|------|------|
| [`email-early-exit-vs-valid.ts`](email-early-exit-vs-valid.ts) | `isEmailInvalidForRegistration` and `isEmailValidForRegistration` in one place | 
| [`email-early-exit-vs-valid.test.ts`](email-early-exit-vs-valid.test.ts) | Proves `valid === !invalid` for a small matrix of strings |

**Check** (from the repository root of `cs-fundamentals-playground`):

```bash
npm test -- 2-invalid-vs-valid-predicates/email-early-exit-vs-valid.test.ts
```

Or run the full test suite: `npm test`
