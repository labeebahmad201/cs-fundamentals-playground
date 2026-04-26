/**
 * Bad example: high coupling + low cohesion.
 * One class mixes unrelated responsibilities and hard-codes collaborators.
 */

class EmailClient {
  send(to: string, body: string): void {
    console.log(`[email] to=${to} body=${body}`);
  }
}

class AuditStore {
  write(event: string): void {
    console.log(`[audit] ${event}`);
  }
}

export class UserModuleGod {
  private readonly users = new Map<string, { name: string; password: string }>();
  private readonly email = new EmailClient(); // tightly coupled concrete dependency
  private readonly audit = new AuditStore(); // tightly coupled concrete dependency

  register(email: string, name: string, password: string): boolean {
    if (email.trim() === "" || !email.includes("@") || password.length < 8) return false;
    if (this.users.has(email)) return false;

    this.users.set(email, { name, password }); // persistence concern
    this.audit.write(`registered:${email}`); // audit concern
    this.email.send(email, `Welcome ${name}`); // notification concern
    return true;
  }

  resetPassword(email: string, nextPassword: string): boolean {
    const row = this.users.get(email);
    if (!row || nextPassword.length < 8) return false;
    row.password = nextPassword; // security/auth concern
    this.audit.write(`password_reset:${email}`);
    this.email.send(email, "Your password was changed.");
    return true;
  }
}
