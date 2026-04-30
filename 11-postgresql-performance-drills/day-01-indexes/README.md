# Day 01: Moved to single-file runbook

This section has been consolidated into one document:

- `../day-02-covering-indexes/README.md`

That file now includes the full end-to-end flow in one place:

- Docker PostgreSQL setup
- schema creation and data loading
- baseline `EXPLAIN (ANALYZE, BUFFERS)`
- composite index step
- covering index step

The standalone SQL files were removed so the workflow can be copied from one README.
