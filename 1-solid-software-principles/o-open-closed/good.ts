/** New discount = new class implementing one interface; core loop stays unchanged. */

export type Order = { listPrice: number };

export interface PriceRule {
  apply(current: number): number;
}

export class FixedDiscount implements PriceRule {
  constructor(private readonly amount: number) {}
  apply(current: number): number {
    return Math.max(0, current - this.amount);
  }
}

export class PercentDiscount implements PriceRule {
  constructor(private readonly rate: number) {}
  apply(current: number): number {
    return current * (1 - this.rate);
  }
}

export class PricingEngine {
  constructor(private readonly rules: ReadonlyArray<PriceRule>) {}

  calculateTotal(order: Order): number {
    return this.rules.reduce((p, rule) => rule.apply(p), order.listPrice);
  }
}
