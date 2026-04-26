/**
 * SRP violation: one class validates, stores, and sends a welcome message.
 * Any change to email rules, storage, or copy hits the same class.
 */
export class RegisterUserGod {
  private readonly emails = new Set<string>();

  run(email: string, name: string): void {
    if (email.trim() === "" || !email.includes("@")) {
      return;
    }
    if (this.emails.has(email)) {
      return;
    }
    this.emails.add(email);
    console.log(`[SRP bad] welcome email -> ${name} <${email}>`);
  }
}
