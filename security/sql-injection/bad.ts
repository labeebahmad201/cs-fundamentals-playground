/**
 * DELIBERATELY VULNERABLE — only for a closed, local education demo. Never do this in production.
 * Building SQL with string concatenation allows attackers to run arbitrary SQL.
 */
export function buildGetUserByNameSql(userInput: string): string {
  // Attacker: `" OR 1=1; --` can change the whole query
  return `SELECT id, name FROM users WHERE name = '${userInput}' LIMIT 1`;
}
