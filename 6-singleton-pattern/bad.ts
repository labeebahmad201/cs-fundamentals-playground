/**
 * Singleton anti-pattern example:
 * Global mutable instance with hidden state and hard reset semantics.
 * Easy to call from anywhere, but coupling and test order issues appear quickly.
 */

export class AppConfigSingleton {
  private static instance: AppConfigSingleton | null = null;
  private readonly values = new Map<string, string>();

  private constructor() {}

  static getInstance(): AppConfigSingleton {
    if (!AppConfigSingleton.instance) {
      AppConfigSingleton.instance = new AppConfigSingleton();
    }
    return AppConfigSingleton.instance;
  }

  set(key: string, value: string): void {
    this.values.set(key, value);
  }

  get(key: string): string | undefined {
    return this.values.get(key);
  }

  // A "test fix" often added after pain appears:
  static __resetForTestsOnly(): void {
    AppConfigSingleton.instance = null;
  }
}

export class WelcomeServiceBad {
  greet(user: string): string {
    const cfg = AppConfigSingleton.getInstance();
    const env = cfg.get("env") ?? "unknown";
    return `[${env}] hello ${user}`;
  }
}
