import { describe, expect, it, vi } from "vitest";
import {
  UserRegistration,
  inMemoryUserStore,
  simpleFormatValidator,
} from "./s-single-responsibility/good.js";
import { FixedDiscount, PricingEngine } from "./o-open-closed/good.js";
import { ExplodingTextSource, InMemoryTextSource, printAll } from "./l-liskov-substitution/bad.js";
import { InMemoryLines, printAllGood } from "./l-liskov-substitution/good.js";
import { MonolithProductService, ReadonlyDashboardBad } from "./i-interface-segregation/bad.js";
import { ProductService, ReadonlyReport } from "./i-interface-segregation/good.js";
import { OrderPlacedUseCase, captureNotifier, fakeOrderRead } from "./d-dependency-inversion/good.js";

describe("SOLID — good examples", () => {
  it("S: register splits concerns", () => {
    const welcome = { send: vi.fn() };
    const reg = new UserRegistration(
      simpleFormatValidator,
      inMemoryUserStore(),
      welcome,
    );
    expect(reg.tryRegister({ email: "a@b.com", name: "A" })).toBe(true);
    expect(welcome.send).toHaveBeenCalled();
  });

  it("O: new rule without changing PricingEngine", () => {
    const t = new PricingEngine([new FixedDiscount(3)]).calculateTotal({ listPrice: 10 });
    expect(t).toBe(7);
  });

  it("L: all LineSource impls are iterable for printAllGood", () => {
    expect(printAllGood(new InMemoryLines(["1"]), "p")).toEqual(["1"]);
  });

  it("I: ReadonlyReport only needs query methods", () => {
    const svc = new ProductService();
    const r = new ReadonlyReport(svc);
    expect(r.showNames()).toContain("alpha");
  });

  it("D: can test use case with in-memory doubles", async () => {
    const c = captureNotifier();
    const uc = new OrderPlacedUseCase(
      fakeOrderRead(new Map([[5, "x@y.z"]])),
      c.notifier,
    );
    await uc.run(5);
    expect(c.sent[0]?.to).toBe("x@y.z");
  });
});

describe("SOLID — contrast", () => {
  it("L: exploding source breaks same function as in-memory (bad for substitution)", () => {
    expect(printAll(new InMemoryTextSource(), "a")).toEqual(["in-memory line"]);
    expect(() => printAll(new ExplodingTextSource(), "a")).toThrow();
  });
});

describe("I — fat service still works with bad dashboard", () => {
  it("same concrete service can back readonly UI", () => {
    const m = new MonolithProductService();
    const d = new ReadonlyDashboardBad(m);
    expect(d.showNames()).toBe("alpha, beta");
  });
});
