/**
 * Bad: swallows errors, no stable contract for callers, no correlation with logs.
 * In real apps this makes outages impossible to debug and can hide data corruption.
 */
export function parseUserId(raw: string): number {
  try {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) {
      return 0; // magic fallback — often wrong
    }
    return n;
  } catch (e) {
    console.log("parse failed", e); // loses stack; not structured; easy to miss in production
    return 0;
  }
}

export async function saveOrderBad(orderId: string, _data: object): Promise<void> {
  try {
    if (!orderId) {
      return; // silent failure: caller thinks it succeeded
    }
    // imagine DB call that throws
    if (orderId === "BOOM") {
      throw new Error("network hiccup");
    }
  } catch (e) {
    // swallowed — HTTP layer will still return 200 if you don't rethrow
    void e;
  }
}
