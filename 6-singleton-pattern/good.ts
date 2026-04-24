/**
 * Better default for app code:
 * Use a single instance at composition root, but pass dependencies explicitly.
 * "Single instance" without "global singleton access."
 */

export interface AppConfig {
  get(key: string): string | undefined;
}

export class InMemoryConfig implements AppConfig {
  constructor(private readonly values: ReadonlyMap<string, string>) {}

  get(key: string): string | undefined {
    return this.values.get(key);
  }
}

export class WelcomeService {
  constructor(private readonly config: AppConfig) {}

  greet(user: string): string {
    const env = this.config.get("env") ?? "unknown";
    return `[${env}] hello ${user}`;
  }
}

/**
 * Composition root chooses one shared instance and injects it.
 * This still behaves like a singleton lifetime at app level, but without static global access.
 */
export function createApp() {
  const config = new InMemoryConfig(new Map([["env", "dev"]]));
  return {
    welcome: new WelcomeService(config),
    config,
  };
}
