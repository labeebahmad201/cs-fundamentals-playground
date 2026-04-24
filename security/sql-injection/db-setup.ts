import initSqlJs, { type Database } from "sql.js";

let dbPromise: Promise<Database> | null = null;

export function getInMemoryUsersDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = initSqlJs().then((SQL) => {
      const db = new SQL.Database();
      db.run(`
        CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
        INSERT INTO users (id, name) VALUES (1, 'Alice'), (2, 'Bob');
      `);
      return db;
    });
  }
  return dbPromise;
}
