import { describe, expect, it, vi } from "vitest";
import {
  CreateUserUseCase,
  type UserRepo,
  type WelcomeMailer,
  type Clock,
  createApp,
} from "./good.js";
import { CreateUserDirect } from "./bad.js";

describe("composition root pattern", () => {
  it("good: use case is easy to test with injected fakes", async () => {
    const repo: UserRepo = {
      exists: vi.fn(async () => false),
      save: vi.fn(async () => {}),
    };
    const mailer: WelcomeMailer = { send: vi.fn(async () => {}) };
    const clock: Clock = { nowIso: () => "2026-01-01T00:00:00.000Z" };

    const uc = new CreateUserUseCase(repo, mailer, clock);
    const r = await uc.run({ email: "a@b.com", name: "Ada" });

    expect(r).toBe("created");
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(mailer.send).toHaveBeenCalledTimes(1);
  });

  it("good: composition root gives runnable defaults", async () => {
    const app = createApp();
    expect(await app.createUser.run({ email: "x@y.com", name: "X" })).toBe("created");
    expect(await app.createUser.run({ email: "x@y.com", name: "X2" })).toBe("duplicate");
  });

  it("bad: direct class works but is tightly coupled", async () => {
    const direct = new CreateUserDirect();
    expect(await direct.run("b@c.com", "Bob")).toBe(true);
    expect(await direct.run("b@c.com", "Bob2")).toBe(false);
  });
});
