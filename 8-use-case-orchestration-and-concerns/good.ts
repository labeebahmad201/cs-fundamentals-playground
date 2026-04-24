/**
 * Good: use case keeps concern-level orchestration lines, but delegates details.
 *
 * Important idea:
 * "Concern" means "reason to change."
 * It is valid for a use case to contain concern lines (persist, audit, notify) because
 * it owns business workflow orchestration. What it should avoid is inlined low-level details.
 */

export type PlaceOrderInput = {
  orderId: string;
  email: string;
  totalCents: number;
};

export interface Orders {
  exists(orderId: string): Promise<boolean>;
  save(input: PlaceOrderInput): Promise<void>;
}

export interface Audit {
  write(event: string): Promise<void>;
}

export interface Notifications {
  sendReceipt(email: string, totalCents: number): Promise<void>;
}

export class PlaceOrderUseCase {
  constructor(
    private readonly orders: Orders,
    private readonly audit: Audit,
    private readonly notifications: Notifications,
  ) {}

  async run(input: PlaceOrderInput): Promise<"ok" | "duplicate"> {
    // Concern line: persistence concern (allowed in use case orchestration)
    if (await this.orders.exists(input.orderId)) return "duplicate";
    await this.orders.save(input);

    // Concern line: audit concern (allowed in use case orchestration)
    await this.audit.write(`placed:${input.orderId}`);

    // Concern line: notification concern (allowed in use case orchestration)
    await this.notifications.sendReceipt(input.email, input.totalCents);

    return "ok";
  }
}

// Example adapters
export function makeInMemoryOrders(): Orders {
  const ids = new Set<string>();
  return {
    async exists(orderId: string): Promise<boolean> {
      return ids.has(orderId);
    },
    async save(input: PlaceOrderInput): Promise<void> {
      ids.add(input.orderId);
    },
  };
}

export function makeConsoleAudit(log: (m: string) => void = console.log): Audit {
  return {
    async write(event: string): Promise<void> {
      log(`[audit] ${event}`);
    },
  };
}

export function makeConsoleNotifications(log: (m: string) => void = console.log): Notifications {
  return {
    async sendReceipt(email: string, totalCents: number): Promise<void> {
      log(`[mail] receipt to=${email} total=${totalCents}`);
    },
  };
}

export function createOrderFlow() {
  return new PlaceOrderUseCase(
    makeInMemoryOrders(),
    makeConsoleAudit(),
    makeConsoleNotifications(),
  );
}
