/**
 * Goal: show "what to use when" in a small, realistic slice.
 *
 * - Behavior contracts (ports): interface
 * - Data shapes (DTO/value): type (or interface, team convention)
 * - Concrete implementations: class/function/object literal
 * - Composition root: one place that wires concrete implementations
 */

/**
 * Data shape (definition):
 * A data shape is the structure of values passed between parts of the system.
 * It has fields and types, but no behavior of its own.
 *
 * `UserInputDto` is a data shape: plain payload used across validator/store/notifier calls.
 */
export type UserInputDto = {
  email: string;
  name: string;
};

/**
 * Behavioral contract / port (definition):
 * A "port" describes what the use case needs to do, without saying how it is done.
 * It is the boundary between business policy and implementation detail.
 *
 * Here, `EmailValidator` is a port: the use case needs "is this email acceptable?"
 * but does not care whether the check is regex, third-party service, or in-memory rule.
 */
export interface EmailValidator {
  isValid(email: string): boolean;
}

/** Behavioral contract / port: persistence capability needed by the use case. */
export interface UserStore {
  has(email: string): boolean;
  save(user: UserInputDto): void;
}

/** Behavioral contract / port: side-effect capability needed by the use case. */
export interface WelcomeNotifier {
  sendWelcome(user: UserInputDto): void;
}

/** Concrete implementation: class */
export class AtSignEmailValidator implements EmailValidator {
  isValid(email: string): boolean {
    return email.trim() !== "" && email.includes("@");
  }
}

/** Concrete implementation: function + closure */
export function createInMemoryUserStore(): UserStore {
  const emails = new Set<string>();
  return {
    has: (email) => emails.has(email),
    save: (user) => {
      emails.add(user.email);
    },
  };
}

/** Concrete implementation: object literal */
export const consoleWelcomeNotifier: WelcomeNotifier = {
  sendWelcome(user): void {
    console.log(`[welcome] ${user.name} <${user.email}>`);
  },
};

/**
 * Use case (definition):
 * A use case is one business action/end-to-end intent (here: "register a user").
 * It should coordinate domain steps in order, but avoid owning infrastructure details.
 *
 * In this example, the use case decides:
 * 1) validate input
 * 2) reject duplicates
 * 3) persist
 * 4) notify
 *
 * It depends on contracts (`EmailValidator`, `UserStore`, `WelcomeNotifier`), not SDKs.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly validator: EmailValidator,
    private readonly users: UserStore,
    private readonly notifier: WelcomeNotifier,
  ) {}

  run(input: UserInputDto): boolean {
    if (!this.validator.isValid(input.email) || this.users.has(input.email)) {
      return false;
    }
    this.users.save(input);
    this.notifier.sendWelcome(input);
    return true;
  }
}

/**
 * Composition root (definition):
 * The composition root is the single place where your app chooses concrete implementations
 * and assembles them into high-level use cases.
 *
 * Why this matters:
 * - Keep wiring separate from business policy.
 * - Make swapping implementations easy (in-memory vs DB, console vs email provider).
 * - Keep tests simple by constructing the same use case with fakes.
 *
 * Framework bootstraps usually do this once at startup.
 */
export function createRegistrationFlow(): RegisterUserUseCase {
  return new RegisterUserUseCase(
    new AtSignEmailValidator(),
    createInMemoryUserStore(),
    consoleWelcomeNotifier,
  );
}
