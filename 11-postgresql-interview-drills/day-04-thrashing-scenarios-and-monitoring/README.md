# Day 04: Cache Thrashing in PostgreSQL (Scenarios, Detection, and Monitoring)

If performance feels random in production, cache thrashing is often one of the hidden causes.  
This guide explains it slowly, starting from intuition, then moving into practical detection.

## 1) What is cache thrashing?

PostgreSQL keeps frequently used pages in memory (shared buffers + OS cache).  
Thrashing happens when useful pages are evicted too quickly and loaded again and again.

In plain terms:

- Query A loads pages into RAM
- Query B and C load different pages and evict A's pages
- Query A runs again and must re-read from disk
- cycle repeats

This causes unstable latency and unnecessary I/O.

## 2) Why this matters

When data fits in memory well, queries mostly see cache hits and stay fast.  
When workloads compete for limited memory, disk reads increase and response times fluctuate.

So thrashing is not only "slow." It is often "sometimes fast, sometimes slow" for the same SQL.

## 3) Scenario-first understanding

### Scenario A: One hot OLTP query, low interference

Symptoms:

- query latency stable
- mostly cache hits
- low `shared_blks_read` relative to `shared_blks_hit`

Interpretation:
This is healthy cache behavior.

### Scenario B: Nightly/reporting scan collides with OLTP

Symptoms:

- latency spikes during reporting window
- read IOPS increase sharply
- OLTP queries show higher `shared_blks_read`

Interpretation:
Large scans are evicting OLTP working-set pages.

### Scenario C: One "bad" query touches huge page ranges repeatedly

Symptoms:

- top query by `shared_blks_read` in `pg_stat_statements`
- high total time + high read volume
- same query hash appears in slow logs frequently

Interpretation:
A single query pattern is causing churn and polluting cache.

### Scenario D: Throughput increases and memory no longer fits working set

Symptoms:

- gradual degradation over days/weeks
- no obvious single bad query
- disk read pressure rises with traffic

Interpretation:
You outgrew current memory/index/layout assumptions.

## 4) How to detect thrashing in production

Use a layered approach. Do not rely on one metric.

### Layer 1: Database-wide signal

Check read-vs-hit trend:

```sql
SELECT
  datname,
  blks_read,
  blks_hit,
  round(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2) AS cache_hit_pct
FROM pg_stat_database
WHERE datname = current_database();
```

Watch trend over time, not one snapshot.

### Layer 2: Per-query pressure

Find queries reading many pages:

```sql
SELECT
  queryid,
  calls,
  total_exec_time,
  shared_blks_read,
  shared_blks_hit,
  rows,
  left(query, 180) AS sample_query
FROM pg_stat_statements
ORDER BY shared_blks_read DESC
LIMIT 20;
```

If high `shared_blks_read` and high latency cluster together, you likely found churn contributors.

### Metric glossary (what these columns mean)

These fields are often unfamiliar at first. Here is the plain meaning:

- `calls`: how many times this normalized query ran
- `total_exec_time`: total execution time across all calls (ms)
- `rows`: total rows returned or affected across calls
- `shared_blks_read`: number of shared-buffer pages that had to be loaded (cache miss path)
- `shared_blks_hit`: number of shared-buffer page hits already found in memory
- `blks_read` (in `pg_stat_database`): database-level page reads from storage path
- `blks_hit` (in `pg_stat_database`): database-level page hits in cache
- `cache_hit_pct`: derived metric showing hit ratio over the observed counters

How to interpret quickly:

- Rising `shared_blks_read` with stable traffic often means more cache misses.
- High `shared_blks_hit` alone is not bad; it usually means cache is helping.
- High `total_exec_time` + high `shared_blks_read` on the same query is a strong thrashing clue.
- Use rates/deltas over time, not absolute lifetime totals, because these views are cumulative.

### Layer 3: Plan-level confirmation

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

Compare the same query:

- low-load window vs high-load window
- if `shared read` rises sharply at peak with similar plan shape, cache churn is likely

### Layer 4: Host/infra correlation

Correlate DB evidence with:

- disk read IOPS
- disk latency/queue depth
- memory pressure

When all rise together during query slowdowns, diagnosis confidence is high.

## 5) Practical monitoring checklist

Track these continuously:

1. `pg_stat_database` hit/read trend
2. top `pg_stat_statements` by `shared_blks_read`
3. top `pg_stat_statements` by total execution time
4. slow query sample with `auto_explain` + `BUFFERS` (careful sampling)
5. host disk latency + read IOPS
6. latency percentiles (p50/p95/p99) for critical queries

Do this in dashboards and compare by time window.

## 6) What to do once confirmed

Start with high-impact, low-risk steps:

1. Add/fix indexes on churn-heavy query patterns
2. Reduce full-table scans on hot paths
3. Move heavy reporting to read replica or off-peak windows
4. Partition data to reduce touched page ranges
5. Re-check memory sizing (`shared_buffers`, host RAM) with workload context

Then re-measure using the same queries and windows.

## 7) A simple "is this thrashing?" runbook

1. Pick one critical query from `pg_stat_statements`
2. Capture `EXPLAIN (ANALYZE, BUFFERS)` in calm period
3. Capture again at peak
4. Compare:
   - execution time
   - `shared hit` vs `shared read`
   - same plan or changed plan
5. If reads and latency spike without logic changes, investigate cache churn sources

## 8) Controlled low-RAM lab (to make thrashing visible)

Yes, your idea is exactly how many teams teach this internally: constrain memory, replay workload, chart the break point.

### Step A: Run PostgreSQL container with a memory cap

```bash
docker run -d \
  --name pg-thrash-lab \
  --memory=512m \
  --cpus=2 \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=pg_interview_drills \
  -p 5432:5432 \
  postgres:16
```

Then use your normal seed/load process and run the same query mix.

### Step B: Test multiple memory tiers

Repeat the same workload at different container memory limits, for example:

- 256 MB
- 512 MB
- 1 GB
- 2 GB

Keep everything else constant (dataset size, query mix, concurrency, runtime window).

### Step C: Collect the same metrics each run

For each tier, capture:

- p50/p95 query latency for critical SQL
- `shared_blks_read` and `shared_blks_hit` deltas
- total read IOPS and disk latency
- `EXPLAIN (ANALYZE, BUFFERS)` for top slow query

Use deltas per run window, not lifetime counters.

### Step D: Chart and infer a practical limit

Plot memory tier on X-axis and each metric on Y-axis:

- p95 latency
- `shared_blks_read` rate
- read IOPS / disk latency

You often see a knee point where metrics degrade sharply below a certain memory tier.  
That knee is your practical working-set boundary for this workload shape.

Important: this is a workload-specific operational limit, not a universal physical law.  
Change data shape or query mix, and the knee can move.

## Final takeaway

Thrashing is repeated page eviction and reload under memory pressure or competing access patterns.  
The fastest way to diagnose it is scenario-based reasoning plus multi-layer evidence: query stats, plan buffers, and host I/O metrics together.
