# Single Responsibility Principle (SRP)

Robert C. Martin's clarified framing of SRP is:

> "A module should be responsible to one, and only one, actor."

An earlier phrasing ("a module should have one reason to change") was widely quoted, but it caused confusion around what exactly counts as a "reason."

The "one actor" framing is usually clearer: if different stakeholders (actors) want different changes from the same module, that module is likely taking on more than one responsibility.

In code examples, this idea is often shown with classes, but the definition itself is about a **module** and who it serves.

## What is an actor?

In SRP, an **actor** is the person or group that asks for a specific kind of change in a module.

An actor is usually a stakeholder role, not a technical component.  
Examples of actors:
- Accounting or Finance
- Operations or Support
- Security or Compliance
- Product or Growth

If one module serves multiple actors, each actor can pull the module in a different direction.  
That is the SRP warning sign.

### Quick example

Imagine one `ReportModule` that:
- calculates payroll totals (Finance actor)
- formats CSV exports for operations (Operations actor)
- enforces audit/redaction rules (Compliance actor)

Now three different actors can request changes to the same module for unrelated reasons.  
That coupling increases risk and makes changes harder to isolate.

## The "multi-context module" trap

A common path is to keep one module and make it work for multiple contexts by adding conditionals:
- `if (context === "finance") ...`
- `if (context === "ops") ...`
- `if (context === "compliance") ...`

At first this feels flexible, but it usually grows into tangled branching logic.  
Each new actor adds more conditions, more edge cases, and more chances to break unrelated behavior.

When a module starts splitting behavior by actor with many `if` or `switch` branches, treat it as a signal to separate responsibilities.

## What teams mean by "context" for an actor

When people say "this module supports multiple contexts," they usually mean each actor brings its own rules and constraints.

For example, each actor can have a different:
- **goal** (what outcome they care about)
- **policy** (rules that must be enforced)
- **data view** (which fields matter to them)
- **change cadence** (how often their rules change)
- **success metric** (how they define correctness)

That is why context is not just a label like `"finance"` or `"ops"`.  
A context carries different business meaning, and that meaning evolves independently per actor.

Once those differences are real, forcing all contexts into one module usually creates constant branching and "change collisions" (one actor's update accidentally affecting another actor's behavior).

## When modularity dies

If one module keeps absorbing logic for many actors, it stops being a focused module and turns into a giant coordination blob (often called a "god module").

Typical symptoms:
- too many actor/context branches in one place
- unrelated reasons to change the same file
- growing fear of touching the module
- regressions in one actor flow after changes for another actor

At that point, modularity is effectively gone: responsibilities are centralized, coupling increases, and change becomes slower and riskier.

SRP is the corrective move: split by actor-driven responsibility so each module can evolve with one stakeholder direction.

## Bad examples (SRP violations)

### 1) One module, many actor rules

```ts
type Actor = "finance" | "ops" | "compliance";

export function handleReport(actor: Actor, data: unknown) {
  if (actor === "finance") {
    // payroll and tax calculations
    return calculatePayrollReport(data);
  }

  if (actor === "ops") {
    // export shape and delivery format
    return exportCsv(data);
  }

  if (actor === "compliance") {
    // audit and redaction policy
    return redactAndAudit(data);
  }

  throw new Error("Unknown actor");
}
```

Why this is bad: one module is being pulled by three actors with different goals and policies.

### 2) Mixed business logic + infrastructure + policy

```ts
export async function processExpense(expense: Expense) {
  // finance actor rules
  if (expense.amount > 5_000 && !expense.managerApproved) {
    throw new Error("Manager approval required");
  }
  if (expense.type === "travel" && !expense.receiptUrl) {
    throw new Error("Receipt is required for travel");
  }

  // product/ops-driven branching
  if (expense.source === "mobile") {
    expense.tags.push("mobile-submission");
  }

  // persistence + SQL details
  await db.query(
    "INSERT INTO expenses (id, user_id, amount, type, status) VALUES (?, ?, ?, ?, ?)",
    [expense.id, expense.userId, expense.amount, expense.type, "PENDING"]
  );

  // integration and message format details
  await slackClient.postMessage({
    channel: "#ops-expenses",
    text: `Expense ${expense.id} submitted by ${expense.userId}`,
  });

  // compliance schema and storage details
  await db.query(
    "INSERT INTO audit_log (entity_id, event_type, payload_json, retention_days) VALUES (?, ?, ?, ?)",
    [expense.id, "EXPENSE_SUBMITTED", JSON.stringify(expense), 2555]
  );
}
```

Why this is bad: finance policy, ops behavior, DB schema knowledge, external integrations, and compliance retention details are all in one function.

### 3) "Context flag explosion"

```ts
export function priceOrder(order: Order, context: "retail" | "enterprise" | "partner") {
  if (context === "retail") {
    // retail discounts
  } else if (context === "enterprise") {
    // enterprise contracts
  } else if (context === "partner") {
    // partner commission
  }

  // more context checks keep getting added here...
}
```

Why this is bad: context branches grow over time and gradually create a god module.

## Good examples (SRP-friendly)

### 1) Split modules by actor responsibility

```ts
export class FinanceReportService {
  buildPayrollReport(data: PayrollInput) {
    return calculatePayrollReport(data);
  }
}

export class OperationsReportService {
  buildCsvExport(data: OpsInput) {
    return exportCsv(data);
  }
}

export class ComplianceReportService {
  buildAuditedReport(data: ComplianceInput) {
    return redactAndAudit(data);
  }
}
```

Why this is better: each module has one actor direction and changes for one actor do not force edits in the others.

### 2) Support auditing without turning one function into a blob

```ts
type DomainEvent =
  | { type: "expense.submitted"; expenseId: string; userId: string; amount: number }
  | { type: "expense.rejected"; expenseId: string; reason: string };

interface DomainEventBus {
  publish(event: DomainEvent): Promise<void>;
}

class ExpenseService {
  constructor(private readonly repo: ExpenseRepository, private readonly eventBus: DomainEventBus) {}

  async submit(expense: Expense): Promise<void> {
    validateExpensePolicy(expense); // finance rules only
    await this.repo.save(expense); // persistence only

    // one business event; no compliance/ops implementation details here
    await this.eventBus.publish({
      type: "expense.submitted",
      expenseId: expense.id,
      userId: expense.userId,
      amount: expense.amount,
    });
  }
}

class OpsExpenseSubmittedHandler {
  async handle(event: DomainEvent): Promise<void> {
    if (event.type !== "expense.submitted") return;
    await slackClient.postMessage({
      channel: "#ops-expenses",
      text: `Expense ${event.expenseId} submitted by ${event.userId}`,
    });
  }
}

class ComplianceAuditHandler {
  async handle(event: DomainEvent): Promise<void> {
    if (event.type !== "expense.submitted") return;
    await db.query(
      "INSERT INTO audit_log (entity_id, event_type, payload_json, retention_days) VALUES (?, ?, ?, ?)",
      [event.expenseId, "EXPENSE_SUBMITTED", JSON.stringify(event), 2555]
    );
  }
}
```

Why this is better: the submit use case stays focused, and ops/compliance changes happen in separate handlers owned by different actor concerns.

### Implement interface vs use composition

In the auditing example, `ExpenseService` does not implement ops or compliance behavior.  
It only publishes a domain event and composes with collaborators.

Use this rule:
- **Implement an interface** when your class is a provider of that behavior.
- **Compose with an interface** when your class only needs to use that behavior.

Applied here:
- `ExpenseService` is an application/use-case orchestrator.
- Separate handlers own ops and compliance behavior.

Quick test:
Ask "If this behavior changes, should this class change?"
- If yes, the class may implement that interface.
- If no, keep it as a dependency and use composition.

### 3) Replace context flags with strategy per context

```ts
interface PricingPolicy {
  price(order: Order): Money;
}

class RetailPricingPolicy implements PricingPolicy {
  price(order: Order): Money {
    return retailPrice(order);
  }
}

class EnterprisePricingPolicy implements PricingPolicy {
  price(order: Order): Money {
    return contractPrice(order);
  }
}

class PartnerPricingPolicy implements PricingPolicy {
  price(order: Order): Money {
    return partnerPrice(order);
  }
}
```

Why this is better: each policy evolves independently, instead of piling up more `if` branches in one growing function.

SRP helps keep code:
- easier to read
- easier to test
- safer to change
- less coupled to unrelated behavior
