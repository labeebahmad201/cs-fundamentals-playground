/**
 * Good pattern:
 * - authorization is enforced server-side from trusted data
 * - checks use server-loaded resource ownership and actor role
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

const invoices = new Map<string, Invoice>([
  ["inv-1", { invoiceId: "inv-1", ownerUserId: "u-1", amountCents: 5000, status: "open" }],
  ["inv-2", { invoiceId: "inv-2", ownerUserId: "u-2", amountCents: 9000, status: "open" }],
]);

export function canMarkPaid(ctx: AuthContext, inv: Invoice): boolean {
  if (ctx.role === "admin") return true;
  return inv.ownerUserId === ctx.userId;
}

export function markInvoicePaidSafe(ctx: AuthContext, invoiceId: string): "ok" | "forbidden" | "not-found" {
  const inv = invoices.get(invoiceId);
  if (!inv) return "not-found";
  if (!canMarkPaid(ctx, inv)) return "forbidden";

  inv.status = "paid";
  return "ok";
}

export function getInvoice(invoiceId: string): Invoice | undefined {
  return invoices.get(invoiceId);
}
