import type { Database } from "sql.js";

/**
 * Use bound parameters. The value is never treated as SQL syntax.
 * With `pg` you would use $1, $2; the idea is identical to ORMs and Dapper/EF in .NET.
 */
export function getUserIdByNameSafe(
  db: Database,
  name: string,
): { id: number; name: string } | null {
  const stmt = db.prepare("SELECT id, name FROM users WHERE name = ? LIMIT 1");
  try {
    stmt.bind([name]);
    if (stmt.step()) {
      const [id, n] = stmt.get() as [number, string];
      return { id, name: n };
    }
    return null;
  } finally {
    stmt.free();
  }
}
