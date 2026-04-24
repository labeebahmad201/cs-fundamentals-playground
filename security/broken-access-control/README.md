# Broken Access Control (Most Important Security Lesson)

If you learn one security concept first, learn this:

**Never trust client-provided authorization claims.**

## What problem this solves

Broken access control happens when users can act on resources they do not own because authorization checks are weak, missing, or based on untrusted input.

This is consistently one of the highest-impact categories in OWASP because it directly leads to data exposure/modification.

## In this module

- `bad.ts`:
  - server authorizes using `claimedOwnerUserId` from request payload
  - attacker can forge this and update someone else's invoice
- `good.ts`:
  - server loads resource and checks ownership from trusted server state
  - policy is explicit (`canMarkPaid`)
- `broken-access-control.test.ts`:
  - demonstrates exploit in bad path
  - proves safe behavior in good path

## Practical rule

1. Authenticate actor (`ctx.userId`, `ctx.role`) from trusted auth middleware/token verification.
2. Load target resource server-side.
3. Evaluate policy server-side (`canX(actor, resource)`).
4. Ignore client ownership/role claims for authorization decisions.

## Run

```bash
npm test -- security/broken-access-control/broken-access-control.test.ts
```
