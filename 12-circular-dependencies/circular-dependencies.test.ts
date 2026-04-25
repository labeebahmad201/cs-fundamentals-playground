import { describe, it, expect } from "vitest";

describe("circular dependencies", () => {
  it("bad cycle can fail at module initialization time", async () => {
    await expect(import("./bad/a.js")).rejects.toThrow();
  });

  it("good graph works when shared module is extracted", async () => {
    const { valueFromA } = await import("./good/a.js");
    const { valueFromB } = await import("./good/b.js");

    expect(valueFromA).toBe("a uses shared");
    expect(valueFromB).toBe("b uses shared");
  });
});
