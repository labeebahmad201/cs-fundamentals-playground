# Day 02: From Docker Setup to Covering Index in One Runbook

If you want one single document that goes end to end, this is it. You can copy this sequence exactly, run it on a fresh PostgreSQL instance, and reproduce the full optimization path:

`Seq Scan` -> `Bitmap Heap Scan` -> `Index Only Scan`

The goal query is:

```sql
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';
```

## 1) Start PostgreSQL with Docker

Run a local PostgreSQL 16 container:

```bash
docker run -d \
  --name pg-drills \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=pg_interview_drills \
  -p 5432:5432 \
  postgres:16
```

Confirm it is ready:

```bash
docker logs pg-drills
```

You can stop and remove it later with:

```bash
docker stop pg-drills && docker rm pg-drills
```

## 2) Connect to the database

Use `psql` from your machine:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=dev
export PGDATABASE=pg_interview_drills

psql
```

If you do not have `psql` installed locally, use this instead:

```bash
docker exec -it pg-drills psql -U postgres -d pg_interview_drills
```

## 3) Create schema and seed data

Run this full SQL block in `psql`:

```sql
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  amount_cents INTEGER NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO users (email, country, status, created_at)
SELECT
  'user' || gs::text || '@example.com',
  (ARRAY['US', 'CA', 'GB', 'IN', 'DE'])[1 + (random() * 4)::int],
  (ARRAY['active', 'inactive'])[1 + (random() * 1)::int],
  now() - ((random() * 365)::int || ' days')::interval
FROM generate_series(1, 100000) AS gs;

INSERT INTO orders (user_id, amount_cents, state, created_at)
SELECT
  (1 + (random() * 99999)::int),
  (500 + (random() * 200000)::int),
  (ARRAY['pending', 'paid', 'failed'])[1 + (random() * 2)::int],
  now() - ((random() * 365)::int || ' days')::interval
FROM generate_series(1, 400000);

ANALYZE users;
ANALYZE orders;
```

Verify row counts:

```sql
SELECT count(*) AS users_count FROM users;
SELECT count(*) AS orders_count FROM orders;
```

Expected:

- `users_count = 100000`
- `orders_count = 400000`

## 4) Baseline: no index

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';
```

In the benchmark run, the result looked like:

```text
Seq Scan on users  (cost=0.00..2484.00 rows=6403 width=29) (actual time=0.033..12.267 rows=6237 loops=1)
  Filter: ((country = 'US'::text) AND (status = 'active'::text))
  Rows Removed by Filter: 93763
  Buffers: shared hit=984
Planning Time: 0.213 ms
Execution Time: 12.558 ms
```

This means PostgreSQL scanned the whole table and filtered rows afterward.

## 5) Add a composite index

Run:

```sql
CREATE INDEX idx_users_country_status ON users (country, status);
ANALYZE users;
```

Then rerun the same explain:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';
```

In the benchmark run:

```text
Bitmap Heap Scan on users  (cost=89.92..1169.97 rows=6403 width=29) (actual time=0.387..3.200 rows=6237 loops=1)
  Recheck Cond: ((country = 'US'::text) AND (status = 'active'::text))
  Heap Blocks: exact=982
  Buffers: shared hit=982 read=7
  ->  Bitmap Index Scan on idx_users_country_status  (cost=0.00..88.32 rows=6403 width=0) (actual time=0.282..0.282 rows=6237 loops=1)
        Index Cond: ((country = 'US'::text) AND (status = 'active'::text))
        Buffers: shared read=7
Planning:
  Buffers: shared hit=22 read=1
Planning Time: 0.318 ms
Execution Time: 3.460 ms
```

This is faster, but PostgreSQL still touches heap pages to fetch selected columns.

## 6) Add a covering index

Run:

```sql
CREATE INDEX idx_users_country_status_cover
ON users (country, status) INCLUDE (id, email);
ANALYZE users;
```

Run the explain again:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';
```

In the benchmark run:

```text
Index Only Scan using idx_users_country_status_cover on users  (cost=0.42..344.48 rows=6403 width=29) (actual time=0.059..1.444 rows=6237 loops=1)
  Index Cond: ((country = 'US'::text) AND (status = 'active'::text))
  Heap Fetches: 0
  Buffers: shared hit=1 read=55
Planning:
  Buffers: shared hit=25 read=1
Planning Time: 0.298 ms
Execution Time: 1.740 ms
```

Now PostgreSQL can answer from the index path with zero heap fetches.

## 7) What changed, practically

The first index made row filtering faster. The covering index made row retrieval faster by including `id` and `email`, which allowed an index-only scan in this run.

For this dataset and query, execution time improved from `12.558 ms` to `1.740 ms`, which is about a 7x improvement.

## 8) Cleanup and optional choice

If this exact query pattern is hot, keep the covering index. If the non-covering index is now redundant for your workload, you can test dropping it:

```sql
DROP INDEX IF EXISTS idx_users_country_status;
```

Re-run your critical queries after dropping any index.
