/**
 * Better example: lower coupling + higher cohesion.
 * - RegisterUserUseCase has one focused reason to change.
 * - Dependencies are passed as contracts, not hard-coded concretes.
 */

export type NewUser = {
  email: string;
  name: string;
  password: string;
};

export interface UserRepo {
  exists(email: string): Promise<boolean>;
  save(user: NewUser): Promise<void>;
}

export interface PasswordPolicy {
  isStrong(password: string): boolean;
}

export interface Notifier {
  sendWelcome(email: string, name: string): Promise<void>;
}

export interface AuditLog {
  write(event: string): Promise<void>;
}

export interface EmailPolicy {
  isValid(email: string): boolean;
}

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepo,
    private readonly passwords: PasswordPolicy,
    private readonly notifier: Notifier,
    private readonly audit: AuditLog,
    private readonly emailPolicy: EmailPolicy,
  ) {}

  async run(input: NewUser): Promise<"created" | "invalid-email" | "weak-password" | "duplicate"> {
    if (!this.emailPolicy.isValid(input.email)) return "invalid-email";
    if (!this.passwords.isStrong(input.password)) return "weak-password";
    if (await this.users.exists(input.email)) return "duplicate";

    await this.users.save(input);
    await this.audit.write(`registered:${input.email}`);
    await this.notifier.sendWelcome(input.email, input.name);
    return "created";
  }
}

// Example adapters for this module
export function makeInMemoryUserRepo(): UserRepo {
  const users = new Map<string, NewUser>();
  return {
    async exists(email: string): Promise<boolean> {
      return users.has(email);
    },
    async save(user: NewUser): Promise<void> {
      users.set(user.email, user);
    },
  };
}

export const basicPasswordPolicy: PasswordPolicy = {
  isStrong: (pw) => pw.length >= 8,
};

export const basicEmailPolicy: EmailPolicy = {
  isValid: (email) => email.trim() !== "" && email.includes("@"),
};

export function makeConsoleNotifier(log: (m: string) => void = console.log): Notifier {
  return {
    async sendWelcome(email: string, name: string): Promise<void> {
      log(`[email] to=${email} body=Welcome ${name}`);
    },
  };
}

export function makeConsoleAudit(log: (m: string) => void = console.log): AuditLog {
  return {
    async write(event: string): Promise<void> {
      log(`[audit] ${event}`);
    },
  };
}

export function createRegistrationModule() {
  return new RegisterUserUseCase(
    makeInMemoryUserRepo(),
    basicPasswordPolicy,
    makeConsoleNotifier(),
    makeConsoleAudit(),
    basicEmailPolicy,
  );
}
