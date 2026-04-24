import { describe, expect, it, beforeAll } from "vitest";
import { type Database } from "sql.js";
import { buildGetUserByNameSql } from "./bad.js";
import { getUserIdByNameSafe } from "./good.js";
import { getInMemoryUsersDb } from "./db-setup.js";

describe("SQL injection education", () => {
  let db: Database;

  beforeAll(async () => {
    db = await getInMemoryUsersDb();
  });

  it("bad: concatenation injects text into the SQL as syntax", () => {
    const sql = buildGetUserByNameSql(`" OR 1=1; --`);
    expect(sql).toMatch(/OR 1=1/);
  });

  it("good: treats malicious input as a single literal", () => {
    const r = getUserIdByNameSafe(db, `nonexistent" OR 1=1; --`);
    expect(r).toBeNull();
  });

  it("good: finds a real user", () => {
    const r = getUserIdByNameSafe(db, "Alice");
    expect(r).toEqual({ id: 1, name: "Alice" });
  });
});
