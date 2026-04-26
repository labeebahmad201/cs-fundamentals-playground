import { describe, expect, it, vi } from "vitest";
import { RegisterUserDirect } from "./bad.js";
import {
  RegisterUserUseCase,
  type UserInputDto,
  type EmailValidator,
  type UserStore,
  type WelcomeNotifier,
  createRegistrationFlow,
} from "./good.js";

describe("good: contracts + composition", () => {
  it("accepts swappable fakes because use case depends on contracts", () => {
    const sent = vi.fn();
    const validator: EmailValidator = { isValid: () => true };
    const store: UserStore = {
      has: () => false,
      save: vi.fn(),
    };
    const notifier: WelcomeNotifier = { sendWelcome: sent };

    const uc = new RegisterUserUseCase(validator, store, notifier);
    const input: UserInputDto = { email: "a@b.com", name: "Ada" };
    expect(uc.run(input)).toBe(true);
    expect(sent).toHaveBeenCalledWith(input);
  });

  it("composition root creates a runnable default flow", () => {
    const uc = createRegistrationFlow();
    expect(uc.run({ email: "a@b.com", name: "Ada" })).toBe(true);
    expect(uc.run({ email: "a@b.com", name: "Ada Again" })).toBe(false);
  });
});

describe("bad: concrete coupling still works but is less swappable", () => {
  it("registers user with direct dependencies", () => {
    const direct = new RegisterUserDirect();
    expect(direct.run("a@b.com", "Ada")).toBe(true);
    expect(direct.run("a@b.com", "Ada")).toBe(false);
  });
});
