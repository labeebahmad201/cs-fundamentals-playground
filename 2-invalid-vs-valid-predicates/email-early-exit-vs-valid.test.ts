import { describe, expect, it } from "vitest";
import { isEmailInvalidForRegistration, isEmailValidForRegistration } from "./email-early-exit-vs-valid.js";

const samples = [
  "",
  "  ",
  "a",
  "a@b",
  "no-at-sign",
  "user@host",
  "x@y.z",
  " spaces@around@test.com ",
];

describe("invalid vs valid: opposite predicates for the same rule", () => {
  it("for every case, isValid is not isInvalid (equivalent to the early-return refactor)", () => {
    for (const email of samples) {
      const invalid = isEmailInvalidForRegistration(email);
      const valid = isEmailValidForRegistration(email);
      expect(valid).toBe(!invalid);
    }
  });
});
