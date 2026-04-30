# Reverse Proxy + Load Balancing + Cloud/K8s Mastery Labs

### Senior Backend / Platform Engineer - Top 10-15% Interview Track

This track is for engineers who are already comfortable with APIs and databases and now need strong platform depth:

- Reverse proxy behavior under real traffic
- Load balancing choices and failure handling
- Cloud architecture trade-offs
- Kubernetes operational fundamentals

Each lab gives you:

- What to build
- Success criteria
- Interview framing
- Proof artifact

**Recommended pace:** 1 lab every 2-3 days  
**Total:** 20 labs (~7-9 weeks)  
**Stack:** Nginx, HAProxy (optional), Docker, AWS/GCP concepts, Kubernetes, Prometheus/Grafana.

---

## PART ONE: EDGE + TRAFFIC ENGINEERING (LABS 1-7)

### Lab 1: Reverse Proxy Fundamentals (Nginx)

**Build:**

1. Run two simple backend services (`app-a`, `app-b`) behind Nginx.
2. Configure host-based routing and path-based routing.
3. Add forwarded headers and verify what backend receives.
4. Add request ID propagation (`X-Request-Id`).

**Success criteria:**

- Can explain reverse proxy vs forward proxy in one minute.
- Can prove header forwarding and route decisions with logs.

**Interview questions this unlocks:**

- What does a reverse proxy do in production?
- Why do teams terminate TLS at the edge?
- How do you preserve client identity across hops?

**Proof artifact:** `nginx.conf`, two backend logs, short architecture note.

---

### Lab 2: TLS Termination + Redirect + HSTS

**Build:**

1. Configure HTTPS listener and HTTP -> HTTPS redirect.
2. Add HSTS and security headers.
3. Validate certificate chain and protocol/cipher choices.
4. Demonstrate zero plaintext traffic after redirect.

**Success criteria:**

- Can describe TLS termination trade-offs (edge vs service mesh vs app).
- Can justify secure defaults for headers and protocol versions.

**Interview questions this unlocks:**

- Where should TLS terminate and why?
- What can go wrong with `X-Forwarded-Proto` misconfiguration?

**Proof artifact:** config snippets + curl validation commands + notes.

---

### Lab 3: Load Balancing Algorithms in Practice

**Build:**

1. Implement round-robin between 3 backend instances.
2. Switch to least-connections and compare under uneven request durations.
3. Add weighted routing for canary-like rollout.
4. Record p50/p95 latency by algorithm.

**Success criteria:**

- Can explain why one algorithm wins for one workload but loses for another.
- Can reason about hot spots and fairness.

**Interview questions this unlocks:**

- Round-robin vs least-connections: when and why?
- How would you route 10% traffic to a new version safely?

**Proof artifact:** latency table and recommendation memo.

---

### Lab 4: Health Checks, Passive Failures, and Outlier Ejection

**Build:**

1. Configure active health checks on upstreams.
2. Simulate backend partial failure (timeouts/errors).
3. Tune fail timeout and max fails.
4. Show traffic draining from unhealthy target and recovery.

**Success criteria:**

- Can explain active vs passive health checks clearly.
- Can tune failure detection without flapping.

**Interview questions this unlocks:**

- How do you keep bad nodes from poisoning latency?
- What are common failover tuning mistakes?

**Proof artifact:** before/after error-rate graph and config.

---

### Lab 5: Timeouts, Retries, and Idempotency Boundaries

**Build:**

1. Configure upstream connect/read/send timeouts.
2. Add retry policy only for safe/idempotent requests.
3. Simulate a slow backend and show retry storms when misconfigured.
4. Add request budget model (deadline propagation).

**Success criteria:**

- Can defend timeout values and retry counts.
- Can explain when retries are harmful.

**Interview questions this unlocks:**

- Why can retries amplify outages?
- How do you design idempotent APIs for resilience?

**Proof artifact:** outage simulation report with corrected policy.

---

### Lab 6: Sticky Sessions vs Stateless Scaling

**Build:**

1. Deploy stateful session app behind load balancer.
2. Compare sticky cookie routing vs Redis-backed session store.
3. Induce instance loss and compare user impact.
4. Document migration path from sticky to stateless.

**Success criteria:**

- Can explain why sticky sessions are often a temporary crutch.
- Can articulate session externalization strategy.

**Interview questions this unlocks:**

- When is sticky session acceptable?
- How do you scale auth/session-heavy apps safely?

**Proof artifact:** architecture decision record (ADR)-style note.

---

### Lab 7: WebSockets, gRPC, and Long-Lived Connections

**Build:**

1. Proxy WebSocket traffic through Nginx.
2. Configure keepalive and connection limits.
3. Document L4 vs L7 implications for long-lived streams.
4. Add graceful drain before pod/node shutdown.

**Success criteria:**

- Can identify which LB layer fits each protocol.
- Can prevent dropped long-lived connections during deploy.

**Interview questions this unlocks:**

- Why do WebSockets fail behind badly configured proxies?
- How do you drain connections during rolling updates?

**Proof artifact:** working config + deploy/drain checklist.

---

## PART TWO: CLOUD SYSTEM DESIGN (LABS 8-13)

### Lab 8: Multi-AZ Architecture and Blast Radius

- Design an API tier across 2+ AZs with private/public subnets.
- Add NAT, routing, and security groups.
- Explain failure domains and blast radius.
- Interview target: "Design for one AZ outage with minimal customer impact."

### Lab 9: Autoscaling Policies (CPU Is Not Enough)

- Build HPA/ASG-style policy with queue depth + latency signals.
- Compare reactive vs predictive scaling behavior.
- Simulate sudden spike and cooldown mistakes.
- Interview target: "How would you prevent scale oscillation?"

### Lab 10: CDN + Edge Caching + Origin Protection

- Put static assets and cacheable APIs behind CDN.
- Configure cache keys, TTL, and purge strategy.
- Protect origin with rate limits and signed URLs where relevant.
- Interview target: "How do you reduce origin load without stale bugs?"

### Lab 11: Managed Database + Read Replica Strategy

- Build read/write split strategy with clear consistency caveats.
- Simulate replica lag and stale reads.
- Define read-after-write critical flows that must hit primary.
- Interview target: "When should read replicas be avoided?"

### Lab 12: Queue-Centric Architecture and Backpressure

- Model async pipeline with queue and worker consumers.
- Add DLQ, retry with jitter, poison-message handling.
- Define SLO for processing delay and alert thresholds.
- Interview target: "How do you keep queue systems from silently degrading?"

### Lab 13: Disaster Recovery Baseline (RPO/RTO)

- Define backup frequency and restore rehearsal process.
- Run a restore drill from backup snapshot.
- Document RPO/RTO achieved vs target.
- Interview target: "How do you prove DR readiness, not just claim it?"

---

## PART THREE: KUBERNETES MASTERY (LABS 14-20)

### Lab 14: Kubernetes Core Objects by Building a Real Service

- Deploy API with `Deployment`, `Service`, `ConfigMap`, `Secret`.
- Add namespace isolation and resource requests/limits.
- Interview target: "Explain K8s primitives through your own deployment."

### Lab 15: Readiness, Liveness, and Startup Probes

- Add all three probes and intentionally break one.
- Show difference between unavailable vs restart loops.
- Interview target: "How do probes protect reliability?"

### Lab 16: Ingress, Service Types, and Traffic Flow

- Configure Ingress + path rules + TLS.
- Explain packet flow from client to pod.
- Compare ClusterIP, NodePort, LoadBalancer.
- Interview target: "How does traffic enter and move through the cluster?"

### Lab 17: Rolling Updates, Canary, and Rollback

- Configure rollout strategy with `maxUnavailable` and `maxSurge`.
- Run failed rollout and automated rollback.
- Canary 10% with progressive increase plan.
- Interview target: "How do you deploy safely under live load?"

### Lab 18: HPA + Resource Tuning + Cost Awareness

- Run HPA on CPU plus custom metric (req/sec or queue depth).
- Tune requests/limits to avoid CPU throttling.
- Track cost/perf trade-off in a simple dashboard.
- Interview target: "How do you balance reliability and cloud cost?"

### Lab 19: Pod Disruption Budgets and Node Failures

- Add PDB and anti-affinity.
- Simulate node drain and observe service behavior.
- Ensure minimum replicas remain available.
- Interview target: "How do you keep maintenance from causing outages?"

### Lab 20: Observability + Incident Triage in K8s

- Instrument with Prometheus metrics and structured logs.
- Add tracing context propagation (`trace_id`, `span_id`).
- Create an incident runbook for elevated 5xx and latency.
- Interview target: "Walk me through your first 30 minutes of an incident."

---

## Top 10-15% Interview Question Bank (Cloud + K8s + Edge)

Use STAR-style examples from your labs. Keep answers structured:

1. Context and constraints
2. Decision and alternatives
3. Outcome and measurement
4. What you would improve next

### Reverse Proxy / Load Balancing

- How do you choose between L4 and L7 load balancing?
- What failure modes happen when timeout values are misaligned?
- Why do retry policies need idempotency awareness?
- How do you handle sticky sessions during scale-out?
- How do you protect upstreams during sudden traffic spikes?

### Cloud Architecture

- How do you design for AZ failure without overpaying?
- How do you set autoscaling signals beyond CPU?
- How do you design for graceful degradation when dependencies fail?
- What is your strategy for DR testing and confidence?
- How do you explain trade-offs between managed vs self-managed components?

### Kubernetes

- What is the difference between readiness and liveness, and why it matters?
- How do resource requests/limits impact scheduling and reliability?
- How do you design a safe deployment strategy for high-traffic services?
- When does HPA fail to scale effectively?
- How do PDBs and anti-affinity reduce outage risk?

---

## Weekly Integration Plan (Suggested)

- **Week 1-2:** Labs 1-5 (edge fundamentals, failure behavior).
- **Week 3:** Labs 6-7 + recap interview drills.
- **Week 4-5:** Labs 8-13 (cloud architecture and resilience).
- **Week 6-7:** Labs 14-18 (K8s operations and scaling).
- **Week 8:** Labs 19-20 + mock interview round.

For each week, produce:

- One architecture diagram
- One trade-off memo
- One incident/failure write-up
- Five verbal interview answers recorded in 2-3 minute format

---

## Completion Definition

You are ready for top 10-15% platform/backend interview rounds when you can:

- Explain edge and balancing behavior using concrete failure stories.
- Defend timeout/retry/probe/autoscaling settings with data.
- Discuss Kubernetes rollout, scaling, and incident response confidently.
- Communicate trade-offs in cost, reliability, and complexity.
