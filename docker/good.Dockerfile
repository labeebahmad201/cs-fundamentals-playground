# GOOD: pinned version, small base, non-root, healthcheck, explicit CMD
# From repo root:
#   docker build -f docker/good.Dockerfile -t fundamentals-demo:good .
#   docker run --rm -p 3000:3000 fundamentals-demo:good
# For production you would add a multi-stage build, copy `dist/`, and use `npm ci --omit=dev`.

# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS app
WORKDIR /app

# Non-root from the first mutable layer
RUN addgroup -S app && adduser -S -G app app
COPY --chown=app:app docker/entrypoint-hint.mjs ./

USER app:app
EXPOSE 3000

# Replace with a real check that your framework exposes /health
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))" || exit 1

# Exec form, plain Node — good signal handling for PID 1
CMD ["node", "entrypoint-hint.mjs"]
