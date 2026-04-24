import { describe, expect, it } from "vitest";
import { getInvoice as getBadInvoice, markInvoicePaidBad } from "./bad.js";
import { getInvoice as getSafeInvoice, markInvoicePaidSafe } from "./good.js";

describe("broken access control", () => {
  it("bad: user can forge owner claim to modify someone else's invoice", () => {
    const attacker = { userId: "u-1", role: "user" } as const;
    const ok = markInvoicePaidBad(attacker, "inv-2", "u-1"); // forged claim
    expect(ok).toBe(true);
    expect(getBadInvoice("inv-2")?.status).toBe("paid");
  });

  it("good: server-side ownership check blocks forged attempt", () => {
    const attacker = { userId: "u-1", role: "user" } as const;
    const out = markInvoicePaidSafe(attacker, "inv-2");
    expect(out).toBe("forbidden");
    expect(getSafeInvoice("inv-2")?.status).toBe("open");
  });

  it("good: admin can perform operation", () => {
    const admin = { userId: "admin-1", role: "admin" } as const;
    const out = markInvoicePaidSafe(admin, "inv-2");
    expect(out).toBe("ok");
  });
});
