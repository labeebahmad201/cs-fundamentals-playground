/**
 * Anti-pattern: no composition root.
 * Use case reaches directly for concrete globals/details.
 */

const seen = new Set<string>();

function nowIso(): string {
  return new Date().toISOString();
}

export class CreateUserDirect {
  async run(email: string, name: string, log: (s: string) => void = console.log): Promise<boolean> {
    if (seen.has(email)) return false;
    seen.add(email);
    log(`[db] save ${email} at ${nowIso()}`);
    log(`[mail] welcome ${name} <${email}>`);
    return true;
  }
}
