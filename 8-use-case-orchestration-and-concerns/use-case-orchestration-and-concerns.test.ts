import { describe, expect, it, vi } from "vitest";
import { PlaceOrderBad } from "./bad.js";
import {
  PlaceOrderUseCase,
  type Orders,
  type Audit,
  type Notifications,
  createOrderFlow,
} from "./good.js";

describe("concerns in use case orchestration", () => {
  it("bad: works but inlines details in use case", async () => {
    const uc = new PlaceOrderBad();
    expect(await uc.run({ orderId: "o1", email: "a@b.com", totalCents: 1500 })).toBe("ok");
    expect(await uc.run({ orderId: "o1", email: "a@b.com", totalCents: 1500 })).toBe("duplicate");
  });

  it("good: concern lines stay, low-level details are delegated", async () => {
    const orders: Orders = {
      exists: vi.fn(async () => false),
      save: vi.fn(async () => {}),
    };
    const audit: Audit = { write: vi.fn(async () => {}) };
    const notifications: Notifications = { sendReceipt: vi.fn(async () => {}) };

    const uc = new PlaceOrderUseCase(orders, audit, notifications);
    const out = await uc.run({ orderId: "o2", email: "x@y.com", totalCents: 2000 });

    expect(out).toBe("ok");
    expect(orders.save).toHaveBeenCalledTimes(1);
    expect(audit.write).toHaveBeenCalledTimes(1);
    expect(notifications.sendReceipt).toHaveBeenCalledTimes(1);
  });

  it("good: composition root gives runnable defaults", async () => {
    const uc = createOrderFlow();
    expect(await uc.run({ orderId: "o3", email: "c@d.com", totalCents: 999 })).toBe("ok");
    expect(await uc.run({ orderId: "o3", email: "c@d.com", totalCents: 999 })).toBe("duplicate");
  });
});
