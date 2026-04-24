import { type Database } from "sql.js";
import { buildGetUserByNameSql } from "./bad.js";
import { getUserIdByNameSafe } from "./good.js";
import { getInMemoryUsersDb } from "./db-setup.js";

function runBadOnDb(db: Database): void {
  const evil = `nonexistent" OR 1=1; --`;
  const sql = buildGetUserByNameSql(evil);
  console.log("Bad: concatenated SQL (never do this in production):");
  console.log(sql, "\n");
  try {
    const result = db.exec(sql);
    if (result[0]) {
      console.log("  rows (attack can bypass or exfiltrate, depending on DB/driver):", result[0].values);
    } else {
      console.log("  (no row — this driver may be strict; never rely on that for safety.)");
    }
  } catch (e) {
    console.log("  error from DB:", (e as Error).message);
  }
}

const db = await getInMemoryUsersDb();

console.log("--- Vulnerable string building ---");
runBadOnDb(db);

console.log("\n--- Parameterized query ---");
const evil = `nonexistent" OR 1=1; --`;
const bypassAttempt = getUserIdByNameSafe(db, evil);
console.log("Good: same malicious string bound as a single name ->", bypassAttempt, "(treated as literal, not OR 1=1)");

const alice = getUserIdByNameSafe(db, "Alice");
console.log("Good: lookup for Alice ->", alice);
