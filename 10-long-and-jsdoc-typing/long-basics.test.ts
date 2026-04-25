import { describe, it, expect } from "vitest";
import Long from "long";

/**
 * Runnable examples for `long`: int64 in JS, used by protobuf / SDKs.
 * Narrative: see ./README.md
 */
describe("long: basics", () => {
  it("fromNumber and fromString represent integer amounts", () => {
    const a = Long.fromNumber(100);
    expect(a.toString()).toBe("100");
    const b = Long.fromString("100");
    expect(b.eq(a)).toBe(true);
  });

  it("values past Number.MAX_SAFE_INTEGER are still exact as Long", () => {
    const ulpPast =
      "9007199254740992"; // 2^53 — still exactly representable as number
    const n = Long.fromString(ulpPast);
    expect(n.toString()).toBe(ulpPast);
    const oneMore = n.add(Long.ONE);
    // 9007199254740993 is not representable as an exact JS number, but is as Long
    expect(oneMore.toString()).toBe("9007199254740993");
  });

  it("arithmetic: add and compare", () => {
    const x = Long.fromString("50");
    const y = Long.fromString("-25");
    expect(x.add(y).toString()).toBe("25");
    expect(x.gt(y)).toBe(true);
  });

  it("signed int64 range via Long.MIN_VALUE and Long.MAX_VALUE", () => {
    expect(Long.MIN_VALUE.toString()).toBe("-9223372036854775808");
    expect(Long.MAX_VALUE.toString()).toBe("9223372036854775807");
  });
});
