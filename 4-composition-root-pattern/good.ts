/**
 * Composition Root Pattern (good):
 * Keep wiring in one place. Business classes receive dependencies via constructor.
 */

export type CreateUserInput = {
  email: string;
  name: string;
};

export interface Clock {
  nowIso(): string;
}

export interface UserRepo {
  exists(email: string): Promise<boolean>;
  save(input: CreateUserInput, createdAtIso: string): Promise<void>;
}

export interface WelcomeMailer {
  send(email: string, name: string): Promise<void>;
}

export class CreateUserUseCase {
  constructor(
    private readonly repo: UserRepo,
    private readonly mailer: WelcomeMailer,
    private readonly clock: Clock,
  ) {}

  async run(input: CreateUserInput): Promise<"created" | "duplicate"> {
    const dup = await this.repo.exists(input.email);
    if (dup) return "duplicate";

    await this.repo.save(input, this.clock.nowIso());
    await this.mailer.send(input.email, input.name);
    return "created";
  }
}

// Concrete details (adapters)
export class SystemClock implements Clock {
  nowIso(): string {
    return new Date().toISOString();
  }
}

export function makeInMemoryRepo(seed: string[] = []): UserRepo {
  const seen = new Set(seed);
  return {
    async exists(email: string): Promise<boolean> {
      return seen.has(email);
    },
    async save(input: CreateUserInput): Promise<void> {
      seen.add(input.email);
    },
  };
}

export function makeConsoleMailer(log: (s: string) => void = console.log): WelcomeMailer {
  return {
    async send(email: string, name: string): Promise<void> {
      log(`[mail] welcome ${name} <${email}>`);
    },
  };
}

/**
 * Composition root:
 * The single place where details are chosen and assembled into policy.
 */
export function createApp() {
  const repo = makeInMemoryRepo();
  const mailer = makeConsoleMailer();
  const clock = new SystemClock();

  return {
    createUser: new CreateUserUseCase(repo, mailer, clock),
  };
}
