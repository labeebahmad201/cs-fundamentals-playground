/**
 * OCP violation: every new rule (holiday, loyalty tier) means editing and retesting
 * the same function — merge conflicts and high regression risk.
 */
export function totalWithBranches(listPrice: number, season: string | null, isMember: boolean): number {
  let p = listPrice;
  if (season?.toLowerCase() === "xmas") {
    p = Math.max(0, p - 5);
  }
  if (isMember) {
    p *= 0.9;
  }
  return p;
}
