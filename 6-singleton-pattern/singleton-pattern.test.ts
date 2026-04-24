import { describe, expect, it } from "vitest";
import { AppConfigSingleton, WelcomeServiceBad } from "./bad.js";
import { createApp, InMemoryConfig, WelcomeService } from "./good.js";

describe("singleton pattern trade-offs", () => {
  it("bad: static singleton shares state globally", () => {
    AppConfigSingleton.__resetForTestsOnly();
    const s1 = AppConfigSingleton.getInstance();
    const s2 = AppConfigSingleton.getInstance();

    s1.set("env", "prod");
    expect(s2.get("env")).toBe("prod"); // same global instance

    const w = new WelcomeServiceBad();
    expect(w.greet("Ada")).toBe("[prod] hello Ada");
  });

  it("good: explicit dependency keeps tests isolated", () => {
    const cfg = new InMemoryConfig(new Map([["env", "test"]]));
    const w = new WelcomeService(cfg);
    expect(w.greet("Ada")).toBe("[test] hello Ada");
  });

  it("good: app composition can still use one shared instance", () => {
    const app = createApp();
    expect(app.welcome.greet("Bob")).toBe("[dev] hello Bob");
  });
});
