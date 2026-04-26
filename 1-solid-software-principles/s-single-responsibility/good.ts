/**
 * SRP “good” shape: same story as `bad.ts`, but each concern is a **separate module of behavior**
 * behind a **small interface**, and one class only **orchestrates** the flow.
 *
 * Mindset (repeatable):
 * 1) List the **different reasons to change** in the God method (valid rules, DB, email copy, …).
 * 2) For each, ask: “Could I name this job in one short phrase?” → that phrase is a candidate
 *    for its **own** type (interface + implementation).
 * 3) Cue: if you can describe a block as “**how we check input** / **where we keep users** / **how we
 *    notify**”, that block is a separate responsibility.
 * 4) What’s left in the “use case” class is only: **order of steps** and **wiring** — not the details.
 */
export type User = { email: string; name: string };

/** Cue: “is this string allowed?” is its own thing; if marketing changes email rules, you edit here only. */
export interface EmailValidator {
  isValid(email: string): boolean;
}

/**
 * Cue: “do we know this person already + persist a new one?” is **storage policy**, not validation
 * and not the welcome text. In `bad.ts` this was the `Set` + has/add mixed into `run`.
 */
export interface UserStore {
  has(email: string): boolean;
  save(user: User): void;
}

/** Cue: “we told the user we registered them” is a **side effect channel**; swap for SendGrid, logs, or fake in tests. */
export interface WelcomeEmail {
  send(user: User): void;
}

/**
 * `bad.ts` used an early return on *invalid*; here the **same** rule is a positive `isValid`.
 * If the `&&` / `||` flip confuses you, read `2-invalid-vs-valid-predicates/README.md` (De Morgan).
 */
export const simpleFormatValidator: EmailValidator = {
  isValid: (email) => email.trim() !== "" && email.includes("@"),
};

Why is it okay for controller to depend on the dto class but
classes should not depend on each other except through interface?


/**
 * Factory, not a raw `Set` in the orchestrator: the **set is an implementation detail** of “storage”.
 * You can swap for Prisma, Redis, in-memory, etc. without changing `UserRegistration`.
 * (A `class` implementing `UserStore` would be equally valid — we use a function + closure for a tiny in-memory double.)
 */
export function inMemoryUserStore(): UserStore {
  const emails = new Set<string>();
  return {
    has: (e) => emails.has(e),
    save: (u) => {
      emails.add(u.email);
    },
  };
}

/**
 * Replaces `console.log` inside one big `run`: same visible output, but the **orchestrator** no longer
 * “knows” that welcome == console. In tests you pass `{ send: vi.fn() }` instead of mocking `console`.
 *
 * This function is **not called from** `good.ts` on purpose: the **call site** is where you
 * wire dependencies, e.g. `run-all.ts` passing `consoleWelcome()` into `new UserRegistration(...)` (see that file
 * for the real invocation), or tests passing a mock `{ send: vi.fn() }` instead of calling this.
 */
export function consoleWelcome(): WelcomeEmail {
  return {
    send: (u) => {
      console.log(`[SRP good] [email] Welcome, ${u.name} <${u.email}>`);
    },
  };
}

/**
 * Only this type should read like the **story**: validate → if new, save → notify.
 * If that story changes (e.g. add audit log, idempotency), you add collaborators — you do not push
 * those details into the validator or the store.
 */
export class UserRegistration {
  constructor(
    private readonly validate: EmailValidator,
    private readonly store: UserStore,
    private readonly welcome: WelcomeEmail,
  ) {}

  tryRegister(user: User): boolean {
    if (!this.validate.isValid(user.email) || this.store.has(user.email)) {
      return false;
    }
    this.store.save(user);
    this.welcome.send(user);
    return true;
  }
}

// it's weird that docs of frameworks mostly have become devoid of principles and it's all syntax.
// which is akin to listing the tools but not the WHY & when to use them..


