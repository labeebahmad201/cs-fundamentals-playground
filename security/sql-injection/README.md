# SQL injection: bad vs good

## Why concatenation is dangerous

When user-controlled strings are **pasted into SQL** as if they were code, the attacker can change the **grammar** of the query: add `OR 1=1`, insert `; DELETE FROM`, or in some cases stack new statements. Defenses you might hear in interviews:

- **Parameterized queries** (prepared statements): values are **values**, not part of the SQL text.
- **Query builders / ORMs** (when they parameterize) — still verify they do not interpolate raw user strings into the SQL.
- **Least privilege** and **WAFs** are extras; they are not substitutes for correct parameterization on the app side.

In .NET, Dapper/EF use parameters the same way; a vulnerable Node `query("SELECT * WHERE x='" + in + "'")` maps 1:1 to a string-built SQL command there.

## What this module shows

- `bad.ts`: A helper that **concatenates** a user string into a `SELECT`. Easy to read and **easy to exploit**.
- `good.ts`: **Bind** the name with a `?` placeholder. The string `nonexistent" OR 1=1; --` is a **name**, not a sequence of SQL tokens.

`sql.js` (SQLite in WebAssembly) runs fully in process so you can try this without a server. The mental model is identical for PostgreSQL and `pg` (`$1` placeholders).

## Run the demo and tests

```bash
npm run demo:sql-injection
npm test
```

**Never** deploy the bad pattern, even in debug builds.
