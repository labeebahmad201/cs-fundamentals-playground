/**
 * DIP violation: high-level notifier imports concrete "infra" and static mail. Hard to
 * unit-test `notifyPlaced` without hitting real I/O and globals.
 */
export const DirectInfra = {
  loadContactEmailForOrder(orderId: number): string {
    return `buyer${orderId}@shop.test`;
  },
  smtpSend(_to: string, log: (s: string) => void = console.log): void {
    log(`[D bad] smtp -> ${_to}`);
  },
};

export class OrderNotifierDirect {
  notifyPlaced(orderId: number, log: (s: string) => void = console.log): void {
    const to = DirectInfra.loadContactEmailForOrder(orderId);
    DirectInfra.smtpSend(to, log);
  }
}
