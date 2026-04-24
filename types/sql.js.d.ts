/** Minimal typings for sql.js in this repo (enables tsc with strict + noImpliedAny). */
declare module "sql.js" {
  export class Database {
    run(sql: string): void;
    prepare(sql: string): {
      bind(values: unknown[]): void;
      step(): boolean;
      get(): unknown[];
      free(): void;
    };
    exec(sql: string): { values: unknown[][]; columns: string[] }[];
  }
  export default function init(
    _config?: unknown,
  ): Promise<{ Database: { new (data?: Uint8Array): Database } }>;
}

