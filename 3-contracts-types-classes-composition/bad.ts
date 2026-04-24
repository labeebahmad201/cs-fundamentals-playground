/**
 * Contrast example: one class reaches into concrete details directly.
 * Harder to test and harder to swap behavior.
 */

export class RegisterUserDirect {
  private readonly emails = new Set<string>();

  run(email: string, name: string, log: (s: string) => void = console.log): boolean {
    if (email.trim() === "" || !email.includes("@")) return false;
    if (this.emails.has(email)) return false;
    this.emails.add(email);
    log(`[welcome] ${name} <${email}>`);
    return true;
  }
}
