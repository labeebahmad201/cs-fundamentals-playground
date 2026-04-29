# PostgreSQL Interview Drills

## Core Index Topics

1. Indexes (general concept)
2. B-Tree index
3. GIN index
4. GiST index
5. Partial index
6. Composite index
7. Indexes can slow down writes (insert/update/delete overhead)

---

## 1) Indexes (general concept)

An index is a separate data structure PostgreSQL keeps to find rows faster without scanning the whole table.

- Table data is stored in heap pages.
- Index stores key values plus pointers (TIDs) to heap rows.
- Query planner decides whether index scan or sequential scan is cheaper.

Interview one-liner:
"An index is a lookup structure that trades extra storage and write cost for faster reads."

### Where does an index live: RAM or disk?

Short answer: both, at different times.

- Index is persisted on disk (like tables).
- Frequently accessed index pages are cached in PostgreSQL shared buffers and OS page cache (RAM).
- If needed page is not in memory, PostgreSQL reads it from disk.

So index is not "RAM-only". It is a disk structure that benefits from memory caching.

---

## 2) B-Tree index

Default and most common PostgreSQL index type.

Best for:

- equality (`=`)
- ranges (`>`, `<`, `BETWEEN`)
- sorting (`ORDER BY`) in matching order
- prefix lookups (with normal text/operator behavior)

Use B-Tree first unless you have a clear reason for another type.

Hands-on drills:

- Day 01 (setup sizes, **equality / range / ORDER BY / composite prefix**): [`day-01-indexes/README.md`](day-01-indexes/README.md)
- Day 02 (from `Seq Scan` to `Index Only Scan` with covering indexes): [`day-02-covering-indexes/README.md`](day-02-covering-indexes/README.md)

---

## 3) GIN index

GIN (Generalized Inverted Index) is for composite values where one row can map to many searchable tokens.

Common uses:

- full-text search (`tsvector`)
- arrays (`@>`, `&&`)
- JSONB containment (`@>`) and key existence patterns

Trade-off:

- can be larger and slower to update than B-Tree
- very powerful for "contains/overlap/membership" style queries

---

## 4) GiST index

GiST (Generalized Search Tree) is a flexible framework used by specialized operator classes.

Common uses:

- geometric and spatial search (often with PostGIS)
- range types and nearest-neighbor style operations

Think of GiST as "supports complex similarity/overlap/distance style logic" depending on operator class.

---

## 5) Partial index

A partial index indexes only rows matching a predicate.

Example:

- index only active users
- index only non-deleted records

Benefits:

- smaller index
- less maintenance overhead than full-table index
- faster targeted queries when predicate matches

Rule:
Your query predicate should align with the partial-index condition.

---

## 6) Composite index

Composite index has multiple columns, for example `(country, status, created_at)`.

Key idea: left-most prefix rule.

- Can use `(a, b, c)` for queries on `a`, or `a+b`, or `a+b+c`
- Usually cannot efficiently use it for only `b` without `a`

Column order should follow real query patterns:

- filter columns first
- then sort/group columns when useful

---

## 7) Indexes can slow down writes

Every insert/update/delete must also maintain related indexes.

So more indexes means:

- more write IO
- more CPU
- larger storage
- more vacuum/maintenance work

Interview framing:

- Reads get faster with good indexes.
- Writes get slower as index count/complexity grows.
- Good schema design picks only indexes that pay for themselves in real workload.

---

## Quick interview contrast: index vs table data

- Table (heap): full row storage, source of truth.
- Index: auxiliary access path to locate rows faster.
- Planner may skip index if sequential scan is cheaper (small table, low selectivity, cold cache patterns, etc.).
