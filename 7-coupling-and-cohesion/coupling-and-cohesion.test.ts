import { describe, expect, it, vi } from "vitest";
import { UserModuleGod } from "./bad.js";
import {
  RegisterUserUseCase,
  type UserRepo,
  type PasswordPolicy,
  type Notifier,
  type AuditLog,
  basicEmailPolicy,
  createRegistrationModule,
} from "./good.js";

describe("coupling and cohesion", () => {
  it("bad: god module works but mixes concerns", () => {
    const god = new UserModuleGod();
    expect(god.register("a@b.com", "Ada", "password1")).toBe(true);
    expect(god.resetPassword("a@b.com", "newpass22")).toBe(true);
  });

  it("good: focused use case supports explicit outcomes and fakes", async () => {
    const users: UserRepo = {
      exists: vi.fn(async () => false),
      save: vi.fn(async () => {}),
    };
    const passwords: PasswordPolicy = { isStrong: vi.fn(() => true) };
    const notifier: Notifier = { sendWelcome: vi.fn(async () => {}) };
    const audit: AuditLog = { write: vi.fn(async () => {}) };

    const uc = new RegisterUserUseCase(users, passwords, notifier, audit, basicEmailPolicy);
    const out = await uc.run({ email: "a@b.com", name: "Ada", password: "password1" });

    expect(out).toBe("created");
    expect(users.save).toHaveBeenCalledTimes(1);
    expect(notifier.sendWelcome).toHaveBeenCalledTimes(1);
    expect(audit.write).toHaveBeenCalledTimes(1);
  });

  it("good: composition root still gives a runnable module", async () => {
    const uc = createRegistrationModule();
    expect(await uc.run({ email: "x@y.com", name: "X", password: "strongpw" })).toBe("created");
    expect(await uc.run({ email: "x@y.com", name: "X2", password: "strongpw" })).toBe("duplicate");
  });
});
