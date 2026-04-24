# Docker: bad vs good

## What is wrong in `bad.Dockerfile`

- **`node:latest`:** Unpinned tags move under your feet. Reproducible builds and security patches need an explicit version (e.g. `20-bookworm-slim` or the exact digest).
- **Copying everything (no `.dockerignore` context):** Risk of shipping `node_modules` from the host, `.env` files, or a huge build context, slowing builds and **leaking secrets** into the image.
- **Running as root:** A container break gives root in the user namespace. Map to a non-root `UID` in production; Kubernetes also expects readable security contexts.
- **No `HEALTHCHECK`:** Or external probes — orchestration cannot know if the app is really serving traffic.

## What the good example shows

- **Pinned** `node:20-alpine` (or slim variants for glibc if native addons need it).
- **`USER app:app`:** Drop privileges before `CMD` (in real apps, combine with `COPY --chown`).
- **`HEALTHCHECK`:** A minimal HTTP check so `docker`/`compose`/Swarm can restart unhealthy tasks.
- **`docker/hint.dockerignore`:** A template to exclude `node_modules`, VCS, logs, and env files from the **build context** (rename to `.dockerignore` at the context root when you build).
- **`docker-compose.hint.yml`:** Shows `restart: policy` and how to add databases next.

A **multi-stage** `Dockerfile` (build TS in one image, run `node dist/...` from a small runtime stage) belongs in a real app; the root `package.json` here is tooling-heavy, so the runnable demo image only copies `docker/entrypoint-hint.mjs`.

## Build and run the “good” image

From the **repository root**:

```bash
docker build -f docker/good.Dockerfile -t fundamentals-demo:good .
docker run --rm -p 3000:3000 fundamentals-demo:good
curl -s http://127.0.0.1:3000
```

**Do not** run `bad.Dockerfile` as-is in production; it is intentionally unsafe and incomplete.

## Interview talking points

- **Layers:** Merge `RUN` lines where it helps **cache** (install deps, then copy source last).
- **Signals:** `CMD` exec form + Node as PID 1, or a tiny `tini` init if the process mis-handles `SIGTERM`.
- **.dockerignore** is as important as `.gitignore` for build speed and secret hygiene.
