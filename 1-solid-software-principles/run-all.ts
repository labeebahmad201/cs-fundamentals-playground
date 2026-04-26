import { RegisterUserGod } from "./s-single-responsibility/bad.js";
import {
  UserRegistration,
  inMemoryUserStore,
  simpleFormatValidator,
  consoleWelcome,
} from "./s-single-responsibility/good.js";
import { totalWithBranches } from "./o-open-closed/bad.js";
import { FixedDiscount, PercentDiscount, PricingEngine } from "./o-open-closed/good.js";
import { ExplodingTextSource, InMemoryTextSource, printAll } from "./l-liskov-substitution/bad.js";
import { InMemoryLines, PrefixedFileLines, printAllGood } from "./l-liskov-substitution/good.js";
import { MonolithProductService, ReadonlyDashboardBad } from "./i-interface-segregation/bad.js";
import { ProductService, ReadonlyReport } from "./i-interface-segregation/good.js";
import { DirectInfra, OrderNotifierDirect } from "./d-dependency-inversion/bad.js";
import { OrderPlacedUseCase, captureNotifier, fakeOrderRead } from "./d-dependency-inversion/good.js";

console.log("========== S — Single Responsibility ==========\n");
console.log("Bad: god object with validation, storage, and email in one place\n");
new RegisterUserGod().run("ada@example.com", "Ada");
console.log("\nGood: orchestration, separate collaborators\n");
const srp = new UserRegistration(
  simpleFormatValidator,
  inMemoryUserStore(),
  consoleWelcome(),
);
srp.tryRegister({ email: "bob@example.com", name: "Bob" });

console.log("\n========== O — Open / Closed ==================\n");
const afterBad = totalWithBranches(100, "Xmas", true);
console.log("Bad: branches, list 100, Xmas + member ->", afterBad.toFixed(2));
const engine = new PricingEngine([new FixedDiscount(5), new PercentDiscount(0.1)]);
const afterGood = engine.calculateTotal({ listPrice: 100 });
console.log("Good: -5 then 10% on remainder, list 100 ->", afterGood.toFixed(2));

console.log("\n========== L — Liskov Substitution =============\n");
console.log("Bad: one implementation throws — breaks callers that iterate lines\n");
try {
  printAll(new ExplodingTextSource(), "x.txt");
} catch (e) {
  console.log("caught (expected for ExplodingTextSource):", (e as Error).message);
}
const okBad = printAll(new InMemoryTextSource(), "x.txt");
console.log("in-memory in bad example:", okBad);

const okGood1 = printAllGood(new InMemoryLines(["a", "b", "c"]), "any");
const okGood2 = printAllGood(new PrefixedFileLines("demo"), "any");
console.log("Good: substitutable readers ->", okGood1, "+", okGood2);

console.log("\n========== I — Interface Segregation ==========\n");
const monolith = new MonolithProductService();
const dashBad = new ReadonlyDashboardBad(monolith);
console.log("Bad: dashboard typed against fat service (all methods visible), names:", dashBad.showNames());
const product = new ProductService();
const dashGood = new ReadonlyReport(product);
console.log("Good: report only depends on query slice, names:", dashGood.showNames());

console.log("\n========== D — Dependency Inversion ===========\n");
console.log("Bad: use case calls static DirectInfra\n");
new OrderNotifierDirect().notifyPlaced(42, (s) => {
  void console.log(s);
});
const cap = captureNotifier();
const dip = new OrderPlacedUseCase(
  fakeOrderRead(new Map([[1, "a1@test"]])),
  cap.notifier,
);
await dip.run(1);
console.log("Good: fakes injected, captured:", cap.sent[0], cap.sent[0] ? "ok" : "none");
