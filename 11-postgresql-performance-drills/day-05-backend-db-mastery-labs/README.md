# Day 05: Backend Developer Database Mastery Labs

A structured 15-lab program for backend developers who want to be in the top 10-15% on database performance and reliability. The goal is not to become a DBA. The goal is to confidently own database performance from the application side.

Each lab follows the same shape:

- Goal
- Setup
- Steps
- Success criteria
- Stretch challenge
- Proof artifact (what to keep for portfolio or interviews)

Recommended pace: one lab every 2-3 days, or 3-4 hours per week over ~8 weeks.

## How to use this program

1. Run each lab end-to-end on a real PostgreSQL instance (Docker is enough).
2. Capture before/after evidence for each lab.
3. Save proof artifacts (plan output, query stats, postmortem note) in your own notes.
4. Repeat any lab whose success criteria you cannot meet on the first try.

The earlier `day-01` to `day-04` documents in this directory back up these labs with concept material.

---

## Lab 1: EXPLAIN ANALYZE BUFFERS Fluency

Goal: read any plan in under 2 minutes and explain what is expensive.

Setup: use the `users` and `orders` tables from the Day 02 runbook.

### Query set (run all five)

```sql
-- Q1: Equality filter
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE country = 'US' AND status = 'active';

Index Only Scan using idx_users_country_status_cover on users  (cost=0.42..344.48 rows=6403 width=29) (actual time=0.029..0.982 rows=6237 loops=1)
  Index Cond: ((country = 'US'::text) AND (status = 'active'::text))
  Heap Fetches: 0
  Buffers: shared hit=56
Planning Time: 0.116 ms
Execution Time: 1.236 ms

-- Q2: Range filter
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, user_id, created_at
FROM orders
WHERE created_at >= now() - interval '30 days'
ORDER BY created_at DESC
LIMIT 200;



Limit  (cost=7845.26..7868.59 rows=200 width=24) (actual time=27.518..29.647 rows=200 loops=1)
  Buffers: shared hit=3408
  ->  Gather Merge  (cost=7845.26..11055.45 rows=27514 width=24) (actual time=27.517..29.509 rows=200 loops=1)
        Workers Planned: 2
        Workers Launched: 2
        Buffers: shared hit=3408
        ->  Sort  (cost=6845.23..6879.63 rows=13757 width=24) (actual time=26.155..26.168 rows=200 loops=3)
              Sort Key: created_at DESC
              Sort Method: top-N heapsort  Memory: 48kB
              Buffers: shared hit=3408
              Worker 0:  Sort Method: top-N heapsort  Memory: 48kB
              Worker 1:  Sort Method: top-N heapsort  Memory: 48kB
              ->  Parallel Seq Scan on orders  (cost=0.00..6250.67 rows=13757 width=24) (actual time=0.011..24.948 rows=10707 loops=3)
                    Filter: (created_at >= (now() - '30 days'::interval))
                    Rows Removed by Filter: 122626
                    Buffers: shared hit=3334
Planning Time: 0.054 ms
Execution Time: 29.682 ms

-- Q2 plan notes:
-- 1) This is a parallel plan: 2 workers were launched, and leader also participates in parallel nodes.
-- 2) loops=3 on Sort/Parallel Seq Scan means those nodes ran once per participant (2 workers + leader).
-- 3) Predicate filtering happens inside Parallel Seq Scan (not after merge).
-- 4) top-N heapsort is used because ORDER BY ... LIMIT 200 only needs the best 200 rows from each participant.
-- 5) Gather Merge merges sorted streams from participants, then Limit returns final 200 rows.
-- 6) shared hit=3408 indicates many cached pages were touched; this still scans a large table portion.

-- Q2 improvement command (explicit DESC index order):
CREATE INDEX idx_orders_created_at_desc
ON orders (created_at DESC);
ANALYZE orders;

-- Note: PostgreSQL lets you control index ordering (ASC/DESC), which can remove sort work
-- when query ORDER BY uses the same direction.

Limit  (cost=0.43..85.47 rows=200 width=24) (actual time=0.083..0.241 rows=200 loops=1)
  Buffers: shared hit=183 read=3
  ->  Index Scan using idx_orders_created_at_desc on orders  (cost=0.43..14033.92 rows=33003 width=24) (actual time=0.082..0.228 rows=200 loops=1)
        Index Cond: (created_at >= (now() - '30 days'::interval))
        Buffers: shared hit=183 read=3
Planning:
  Buffers: shared hit=16 read=1
Planning Time: 0.229 ms
Execution Time: 0.264 ms

-- Q2 after-index notes:
-- 1) Planner switched to direct Index Scan using idx_orders_created_at_desc.
-- 2) This is a top-N pattern (`ORDER BY ... DESC LIMIT 200`): PostgreSQL needs only first N rows in that order.
-- 3) No separate Sort/Gather Merge is needed because index order already matches ORDER BY created_at DESC.
-- 4) Runtime dropped from ~29.7 ms to ~0.26 ms in this run.
-- 5) Buffers dropped sharply (from ~3408 hits to 183 hits + 3 reads), so far fewer pages were touched.
-- 6) This is a textbook top-N win: ORDER BY + LIMIT with matching index.
-- 7) This is `Index Scan`, not `Index Only Scan`, so PostgreSQL still does heap fetches for row values.
-- 8) Why no large disk reads then? Because most needed heap/index pages were already cached (`shared hit=183`).
-- 9) `shared read=3` means only 3 pages were loaded during this run; everything else came from cache.
-- 10) Non-covering index != disk read per row. It means heap access is needed, but access can be RAM hits.
-- 11) If you want to observe more reads, test from a colder cache state:
--     a) easiest lab method: restart PostgreSQL container, then run query once (cold) and again (warm).
--     b) in Docker: `docker restart pg-drills` then re-run EXPLAIN (ANALYZE, BUFFERS).
--     c) compare first run vs second run: first usually shows higher `shared read`, second higher `shared hit`.

-- Q3: Join
EXPLAIN (ANALYZE, BUFFERS)
SELECT o.id, o.amount_cents, u.email
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE u.country = 'US'
ORDER BY o.created_at DESC
LIMIT 200;

-- Q4: Sort-heavy query
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, amount_cents, created_at
FROM orders
ORDER BY amount_cents DESC
LIMIT 5000;

-- Q5: Aggregate
EXPLAIN (ANALYZE, BUFFERS)
SELECT state, count(*) AS cnt, avg(amount_cents) AS avg_amount
FROM orders
GROUP BY state
ORDER BY cnt DESC;
```

### How to read the sample output (Q1)

For the sample plan shown under Q1:

- `Index Only Scan ...` means PostgreSQL satisfied this query from the covering index path.
- `Index Cond: ...` means both predicates were applied at index level.
- `Heap Fetches: 0` means no table-row lookups were needed from heap pages.
- `Buffers: shared hit=56` means pages were served from cache for this run and since `read` is not mentioned so it was 0.
- `Execution Time: 1.236 ms` is the total query runtime and indicates a very efficient read path.

### Steps

1. Run all five queries and save each plan output.
2. For each plan, identify:
   - scan type(s) (`Seq Scan`, `Index Scan`, `Bitmap Heap Scan`, etc.)
   - most expensive node by time
   - presence of sort/hash nodes
   - buffer behavior (`shared hit` vs `shared read`)
3. Write a 3-line diagnosis per query:
   - What shape is this query?
   - What is the dominant cost?
   - One likely optimization idea.
4. Re-run the same five queries and compare second-run buffer/timing behavior (warm vs colder cache effect).

Success criteria:

- Can explain plan structure without re-reading docs.
- Can identify the most expensive node in seconds.
- Can explain `shared hit` vs `shared read` in plain language.

Stretch:

- Compare plans before and after `ANALYZE`.
- Try `track_io_timing = on` and compare I/O timings.

Proof artifact: a short notes file with five plan summaries and one warm-vs-cold comparison note.

---

## Lab 2: B-tree Indexes and Composite Order

Goal: choose composite index column order based on real query patterns.

Setup: same dataset.

Steps:

1. Pick three queries with different filter shapes.
2. Add a single-column index. Capture plan and timing.
3. Replace with a well-ordered composite index. Capture plan and timing.
4. Reverse the column order intentionally. Capture and explain why it is worse.

Success criteria:

- Can defend column order with selectivity reasoning.
- Can predict whether left-prefix rule will help a query.

Stretch:

- Test composite index with `ORDER BY` matching trailing column.

Proof artifact: a "before/after timings" note.

---

## Lab 3: Covering Indexes and Index-Only Scans

Goal: turn `Bitmap Heap Scan` into `Index Only Scan` with `Heap Fetches: 0`.

Setup: continue from the Day 02 runbook.

Steps:

1. Reproduce the three-step progression: no index -> composite -> covering.
2. Verify `Heap Fetches: 0` after the covering index.
3. Drop redundant index and re-check no regression.

Success criteria:

- Achieve index-only scan reliably.
- Can explain `INCLUDE` columns and their trade-off.

Stretch:

- Force `Bitmap Heap Scan` again with selectivity changes and explain why.

Proof artifact: side-by-side plan outputs.

---

## Lab 4: Partial and Expression Indexes

Goal: use partial and expression indexes for predicate-aligned wins.

Steps:

1. Add an expression index for `lower(email)` and verify it works.
2. Add a partial index `WHERE state = 'pending'` on `orders` and verify usage.
3. Show one query where partial index does not match predicate and explain why.

Success criteria:

- Can identify when partial or expression indexes are warranted.

Stretch:

- Combine partial + composite + `INCLUDE` and measure.

Proof artifact: short note with predicate-to-index mapping.

---

## Lab 5: Sequential Scan vs Index Scan Decisions

Goal: understand when seq scan is correct.

Steps:

1. Choose a low-selectivity predicate (matches large fraction of rows).
2. Show that planner picks seq scan even with index available.
3. Force index usage with `enable_seqscan = off` and compare timings.

Success criteria:

- Can explain why seq scan is sometimes optimal.
- Can articulate selectivity in plain language.

Stretch:

- Adjust `random_page_cost` and see plan changes.

Proof artifact: plan-comparison table.

---

## Lab 6: Pages, Buffers, and Cache Behavior

Goal: master page-level reasoning.

Steps:

1. Run any query twice. Compare cold vs warm cache buffer counters.
2. Use `pg_buffercache` (extension) to inspect what is cached.
3. Tie buffer hit/read changes to query latency change.

Success criteria:

- Can describe page lifecycle: disk -> shared buffers -> processing.
- Can interpret `Buffers: shared hit/read` confidently.

Stretch:

- Use `EXPLAIN (ANALYZE, BUFFERS)` with `track_io_timing = on` for full picture.

Proof artifact: cold/warm comparison note.

---

## Lab 7: Cache Thrashing Under Memory Pressure

Goal: reproduce thrashing intentionally.

Setup: Docker container with `--memory=512m` (or smaller).

Steps:

1. Load workload that exceeds container memory.
2. Capture `shared_blks_read` rates at different memory tiers.
3. Identify the knee point where latency degrades sharply.
4. Compare to a tier where the working set fits in memory.

Success criteria:

- Show a clear before/after with one critical query.
- Articulate when sharding/scaling becomes the right move.

Stretch:

- Isolate one bad query that causes most of the churn.

Proof artifact: small chart or table of memory tier vs latency/IOPS.

---

## Lab 8: pg_stat_statements and Top-N Triage

Goal: build production-grade query observation skills.

Steps:

1. Enable `pg_stat_statements`.
2. Run mixed workload for some time.
3. Find top 5 by `total_exec_time`.
4. Find top 5 by `shared_blks_read`.
5. Pick the worst overlapping one and propose a fix.

Success criteria:

- Can produce a triage list in under 10 minutes.
- Can rank queries by impact, not anecdote.

Stretch:

- Track day-over-day deltas, not lifetime totals.

Proof artifact: top-N triage output snapshot.

---

## Lab 9: Slow Query Incident Simulation

Goal: practice your incident loop.

Steps:

1. Inject a slow query (e.g. add wide scan or remove an index).
2. Detect it from monitoring data.
3. Triage and propose a safe fix.
4. Apply fix and prove improvement with the same evidence shape used to detect.

Success criteria:

- Detect to mitigate in under 30 minutes for a known scenario.

Stretch:

- Write a 1-page postmortem for the run.

Proof artifact: short postmortem note.

---

## Lab 10: Locks, Deadlocks, and Isolation

Goal: confidently reason about concurrency without panic.

Steps:

1. Reproduce a row-level lock wait with two sessions.
2. Reproduce a deadlock and resolve it with consistent lock order.
3. Compare behavior across `READ COMMITTED` and `REPEATABLE READ`.

Success criteria:

- Can explain isolation differences with a simple example.
- Can avoid deadlocks via consistent ordering and short transactions.

Stretch:

- Use `pg_locks` and `pg_blocking_pids()` to diagnose lock waits.

Proof artifact: concurrency notebook with reproductions.

---

## Lab 11: Read Replicas and Replication Lag

Goal: understand when read replicas help and where they hurt.

Steps:

1. Set up a streaming replica (Docker compose with primary and replica).
2. Run heavy reads on the replica and writes on the primary.
3. Measure replication lag under stress.
4. Identify queries where replica is acceptable vs not.

Success criteria:

- Can articulate read-after-write challenges.
- Can choose replica vs primary by query type.

Stretch:

- Add lag monitoring and an alert threshold.

Proof artifact: lag/load measurement notes.

---

## Lab 12: Partitioning Basics

Goal: understand when partitioning is worth the complexity.

Steps:

1. Build a partitioned table by month on `orders.created_at`.
2. Compare query plans against an unpartitioned version.
3. Identify when partition pruning actually triggers.

Success criteria:

- Can describe pruning conditions clearly.
- Can list operational costs of partitioning honestly.

Stretch:

- Drop old partitions and time the operation vs equivalent `DELETE`.

Proof artifact: pruning vs no-pruning comparison.

---

## Lab 13: Bloat, VACUUM, and ANALYZE

Goal: make table maintenance second nature.

Steps:

1. Generate updates/deletes to create bloat.
2. Use `pgstattuple` (or simple size queries) to inspect bloat.
3. Run `VACUUM`, `VACUUM ANALYZE`, and `VACUUM FULL`. Compare effects and risks.

Success criteria:

- Can explain when each variant is appropriate.
- Can avoid `VACUUM FULL` in production unless necessary.

Stretch:

- Tune autovacuum thresholds for one heavy table.

Proof artifact: bloat measurements before/after.

---

## Lab 14: Postmortem Writing and Before/After Proof

Goal: communicate database changes like a senior engineer.

Steps:

1. Pick one finished optimization (Lab 3 or Lab 9).
2. Write a 1-page postmortem covering: context, signal, hypothesis, fix, evidence, follow-ups.
3. Include numerical evidence: timings, buffers, query stats.

Success criteria:

- Postmortem reads cleanly to a non-DB reviewer.
- Numbers are self-explanatory.

Stretch:

- Add a regression-protection note (alert, dashboard, or test).

Proof artifact: the postmortem itself.

---

## Lab 15: Live Interview Drill (60-minute Mock)

Goal: prove fluency under time pressure.

Steps:

1. Pick a slow query from your earlier labs.
2. In one hour:
   - read its plan
   - propose two fixes with trade-offs
   - implement one
   - prove improvement with evidence
3. Narrate decisions out loud while doing it.

Success criteria:

- Finish under one hour with a measured improvement.

Stretch:

- Repeat under 30 minutes.

Proof artifact: short writeup with the decision narrative.

---

## Skill matrix to track

| Area | Beginner | Capable | Senior | Top 10-15% |
| --- | --- | --- | --- | --- |
| Plan reading | reads names | finds expensive node | explains plan and fixes | drives team-wide reviews |
| Index design | adds one column | composite ordering | covering + partial + expr | predicts trade-offs cleanly |
| Monitoring | knows logs | uses `pg_stat_statements` | dashboards top-N | drives alerting strategy |
| Concurrency | basic SQL | knows isolation | resolves locks safely | guides design to avoid them |
| Scaling | knows replicas | uses replica reads | partitions where useful | makes informed scaling choices |
| Communication | shares results | explains tradeoffs | writes postmortems | influences engineering culture |

Aim to reach the "Top 10-15%" column in at least 4 of 6 areas before declaring this program complete.

## Final note

This is not about memorizing PostgreSQL trivia. It is about being the engineer that other engineers trust when database performance matters. Finish all 15 labs, keep your proof artifacts, and you will not need to convince anyone in interviews. Your evidence will speak.
