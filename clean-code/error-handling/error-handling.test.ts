import { describe, expect, it, vi } from "vitest";
import { parseUserId, saveOrderBad } from "./bad.js";
import { parseUserIdSafe, saveOrderSafe, toHttpStatus, ValidationError } from "./good.js";

describe("error-handling: bad", () => {
  it("returns 0 for invalid input instead of failing", () => {
    expect(parseUserId("nope")).toBe(0);
  });

  it("saveOrder does not throw on internal failure (dangerous contract)", async () => {
    await expect(saveOrderBad("BOOM", {})).resolves.toBeUndefined();
  });
});

describe("error-handling: good", () => {
  it("parseUserIdSafe throws for invalid", () => {
    expect(() => parseUserIdSafe("")).toThrow(ValidationError);
  });

  it("maps validation to 400", () => {
    try {
      parseUserIdSafe("");
    } catch (e) {
      expect(toHttpStatus(e)).toBe(400);
    }
  });

  it("saveOrderSafe rejects on boom id", async () => {
    const log = vi.fn();
    await expect(saveOrderSafe("BOOM", {}, log)).rejects.toThrow("network hiccup");
  });
});
