/**
 * Bad: use case mixes orchestration + low-level details.
 * The concern lines are present, but implementation details are inlined.
 */

export type PlaceOrderInput = {
  orderId: string;
  email: string;
  totalCents: number;
};

export class PlaceOrderBad {
  private readonly seen = new Set<string>();

  async run(input: PlaceOrderInput, log: (m: string) => void = console.log): Promise<"ok" | "duplicate"> {
    // Persistence concern:
    // "Have we already stored this order?" and "store this order now".
    // That's a valid concern for a use-case to orchestrate.
    if (this.seen.has(input.orderId)) return "duplicate";
    // Problem in bad version: storage IMPLEMENTATION detail is inlined (`Set` mutation here),
    // instead of delegating to an Orders port/repository.
    this.seen.add(input.orderId);

    // Audit concern:
    // "Record that order was placed" is valid orchestration.
    // Problem in bad version: the use-case also decides audit formatting/output details.
    log(`[audit] placed:${input.orderId}`);

    // Notification concern:
    // "Send receipt/notification" belongs in workflow orchestration.
    // Problem in bad version: notification transport/detail is inlined in the same method.
    log(`[mail] receipt to=${input.email} total=${input.totalCents}`);

    return "ok";
  }
}
