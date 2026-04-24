/** High level depends on abstractions; concrete DB/SMTP swap at the composition root. */

export interface OrderRead {
  getBuyerEmailForOrder(orderId: number): Promise<string>;
}

export interface Notifier {
  send(to: string, body: string): void;
}

export class OrderPlacedUseCase {
  constructor(
    private readonly orders: OrderRead,
    private readonly notify: Notifier,
  ) {}

  async run(orderId: number): Promise<void> {
    const to = await this.orders.getBuyerEmailForOrder(orderId);
    this.notify.send(to, `order ${orderId} placed`);
  }
}

/* Example details — swappable fakes in tests */
export const fakeOrderRead = (emails: Map<number, string>): OrderRead => ({
  getBuyerEmailForOrder: async (id) => {
    const e = emails.get(id);
    if (!e) throw new Error("unknown order");
    return e;
  },
});

export const captureNotifier = () => {
  const sent: { to: string; body: string }[] = [];
  return {
    notifier: {
      send(to: string, body: string): void {
        sent.push({ to, body });
      },
    } satisfies Notifier,
    get sent() {
      return sent;
    },
  };
};
