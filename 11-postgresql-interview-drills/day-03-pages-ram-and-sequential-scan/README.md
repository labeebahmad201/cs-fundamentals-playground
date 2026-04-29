# Day 03: Pages, RAM, and Why Sequential Scan Reads the Whole Table

When people first tune SQL, they often think in rows: "My query needs 1 row, so PostgreSQL should read 1 row."  
At the storage level, PostgreSQL thinks in pages, not individual rows.

This note explains the core model behind that behavior and why `Seq Scan` exists.

## The core rule

PostgreSQL reads and writes table data in fixed-size blocks called **pages** (usually 8 KB).  
A row lives inside a page, and pages are the minimum practical unit of disk I/O.

That means:

- you do not fetch one row directly from SSD
- you fetch a page that contains many rows
- then PostgreSQL checks each row in memory against your filter

## Where pages live: disk and RAM

A table is persisted on disk as many pages. During query execution, PostgreSQL loads needed pages into memory:

1. Check shared buffers (PostgreSQL RAM cache)
2. If missing, read page from disk/OS cache
3. Process rows from that page in memory

In `EXPLAIN (ANALYZE, BUFFERS)`:

- `shared hit` = page found in RAM cache
- `shared read` = page had to be loaded

So the performance story is usually about **how many pages you touch**, not only how many rows you return.

## What a sequential scan actually does

A `Seq Scan` walks table pages from beginning to end and evaluates each row on those pages.

Conceptually:

1. Read page 1
2. Check each row for predicate match
3. Move to page 2
4. Repeat until table end

This is why, on non-selective predicates or small tables, sequential scan can be cheaper than random index lookups.

## Why PostgreSQL cannot read "just one row" from heap directly

Without an index, PostgreSQL has no fast address book for predicates like:

```sql
WHERE country = 'US' AND status = 'active'
```

It must inspect candidate rows to discover matches. Since rows are packed into pages, that inspection is page-oriented.

With an index, PostgreSQL can jump to candidate row locations (TIDs), but even then it may still visit heap pages unless it can do an index-only scan.

## How this connects to your plan output

If you see:

- `Seq Scan on users`
- many `Rows Removed by Filter`

that means PostgreSQL read many pages and rejected many rows after checking them.

If you later see:

- `Bitmap Heap Scan`

PostgreSQL is using an index to find candidate locations, but still reading heap pages.

If you see:

- `Index Only Scan` with `Heap Fetches: 0`

PostgreSQL answered from index pages and avoided heap lookups in that run.

## Quick commands to observe page-level behavior

```sql
-- 1) Baseline without index
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';

-- 2) Add composite index
CREATE INDEX idx_users_country_status ON users (country, status);
ANALYZE users;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';

-- 3) Add covering index
CREATE INDEX idx_users_country_status_cover
ON users (country, status) INCLUDE (id, email);
ANALYZE users;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';
```

## Interview-ready summary

PostgreSQL storage and I/O are page-based. A sequential scan reads table pages in order and filters rows in memory. Indexes reduce the number of pages touched, and covering indexes can sometimes remove heap page lookups entirely.
