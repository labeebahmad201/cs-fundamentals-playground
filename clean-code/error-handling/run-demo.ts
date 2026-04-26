import { parseUserId, saveOrderBad } from "./bad.js";
import { parseUserIdSafe, saveOrderSafe, toHttpStatus, ValidationError } from "./good.js";

console.log("--- Bad: silent fallbacks ---");
console.log("empty string ->", parseUserId("")); // 0 — might corrupt downstream queries

console.log("\n--- Good: throws ---");
try {
  parseUserIdSafe("");
} catch (e) {
  console.log("caught", e instanceof ValidationError, (e as Error).message);
}

void saveOrderBad("", {}).then(() => console.log("bad: empty order 'saved' (silent)"));
void saveOrderSafe("", {}, console.error).catch((e) => {
  console.log("good: rejected with", e?.constructor?.name, toHttpStatus(e));
});

void saveOrderBad("ok", {});
void saveOrderSafe("ok", {}, console.log).then(() => console.log("good: order saved when valid"));

void saveOrderBad("BOOM", {});
void saveOrderSafe("BOOM", {}, (msg, ctx) => {
  void msg;
  void console.error("log", ctx);
}).catch((e) => console.log("good: expected failure for BOOM, status", toHttpStatus(e)));
