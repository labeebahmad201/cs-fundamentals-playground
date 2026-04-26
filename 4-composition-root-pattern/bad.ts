/**
 * Anti-pattern: no composition root.
 * Use case reaches directly for concrete globals/details.
 */

const seen = new Set<string>();

function nowIso(): string {
  return new Date().toISOString();
}

export class CreateUserDirect {
  /**
   * Clarification:
   * This is not "pure procedural code" in form (it is a class method),
   * but the body is procedural in style: direct step-by-step logic that reaches
   * for concrete/global details (`seen`, `nowIso`, default `console.log`).
   *
   * The composition-root problem is the key issue here, not OO vs procedural syntax.
   */
  async run(email: string, name: string, log: (s: string) => void = console.log): Promise<boolean> {
    if (seen.has(email)) return false;
    seen.add(email);
    log(`[db] save ${email} at ${nowIso()}`);
    log(`[mail] welcome ${name} <${email}>`);
    return true;
  }
}
