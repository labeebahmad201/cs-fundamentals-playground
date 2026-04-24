/**
 * Same *business* rule, two *boolean shapes*:
 *
 * 1) **“Invalid”** (what the early-`return` in a God method is testing).
 * 2) **“Valid”** (what a named `isValid` predicate often returns after refactor).
 *
 * For every `email`, the relationship is: `isValid(x) === !isInvalid(x)`.
 * See `README.md` in this folder for the De Morgan step (why `||` becomes `&&` when you negate).
 */

/** Matches the **guard** in `1-solid-software-principles/.../bad.ts`: if true, reject / return early. */
export function isEmailInvalidForRegistration(email: string): boolean {
  return email.trim() === "" || !email.includes("@");
}

/** The usual **positive** predicate: “may we treat this as structurally present + has an @?”. */
export function isEmailValidForRegistration(email: string): boolean {
  return email.trim() !== "" && email.includes("@");
}
