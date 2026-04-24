# BAD EXAMPLE for teaching only — do not use as a template
FROM node:latest
WORKDIR /app
# Missing .dockerignore: risk copying node_modules, .env, secrets
COPY . .
# Multiple RUNs without combining (more layers than needed) — minor vs security below
RUN npm install
RUN chown -R root:root /app
# Runs as root by default — larger blast radius in a compromise
EXPOSE 3000
# No HEALTHCHECK, no non-root user, "latest" drifts
CMD ["node", "server.js"]
