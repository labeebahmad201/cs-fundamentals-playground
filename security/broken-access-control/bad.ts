/**
 * Security lesson: Broken Access Control.
 *
 * Bad pattern:
 * - server trusts client-supplied ownership/role flags
 * - updates are authorized using request body fields instead of server-known identity
 */

export type AuthContext = {
  userId: string;
  role: "user" | "admin";
};

export type Invoice = {
  invoiceId: string;
  ownerUserId: string;
  amountCents: number;
  status: "open" | "paid";
};

// Pretend DB
const invoices = new Map<string, Invoice>([
  ["inv-1", { invoiceId: "inv-1", ownerUserId: "u-1", amountCents: 5000, status: "open" }],
  ["inv-2", { invoiceId: "inv-2", ownerUserId: "u-2", amountCents: 9000, status: "open" }],
]);

/**
 * BAD:
 * Uses `claimedOwnerUserId` from the payload for authorization.
 * An attacker can set this to their own id and pass checks.
 */
export function markInvoicePaidBad(
  ctx: AuthContext,
  invoiceId: string,
  claimedOwnerUserId: string,
): boolean {
  const inv = invoices.get(invoiceId);
  if (!inv) return false;

  // Vulnerability: trusts caller claim instead of server-side invoice owner
  if (ctx.role !== "admin" && claimedOwnerUserId !== ctx.userId) return false;

  inv.status = "paid";
  return true;
}

export function getInvoice(invoiceId: string): Invoice | undefined {
  return invoices.get(invoiceId);
}
