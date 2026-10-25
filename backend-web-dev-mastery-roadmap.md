# Backend / Web Development Mastery Roadmap
**Stack focus:** Node.js (TypeScript-heavy), with the full-stack context you already have (React/Next.js).
**Goal:** Go from "know the term" to "can explain and rebuild it under interview pressure."

**Legend**
- **Difficulty:** Easy / Medium / Hard
- **Importance:** Low / Medium / High / Critical
- **Practical:** Yes = build/break it hands-on. No = concept + case-study understanding is enough.

Study phases in order. Don't skip ahead — later phases assume earlier ones are solid. Note: OS concepts (Phase 0) should run in parallel with Phase 1, since event-loop understanding leans on process/thread concepts.

**Three resources reused across multiple phases — get these early:**
1. [Designing Data-Intensive Applications](https://dataintensive.net/) by Martin Kleppmann — cited in Phases 3, 5, 8
2. [System Design Primer](https://github.com/donnemartin/system-design-primer) (free, GitHub) — backbone of Phase 8
3. [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) (free, GitHub) — general reference across Phases 1, 6

---

## Phase 0 — Foundations

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| How the internet works (DNS, TCP/IP, HTTP/HTTPS handshake) | Easy | Critical | No (trace a request with browser dev tools once) |
| OS basics: process vs thread, memory management | Medium | Critical | Yes — small script showing process vs thread behavior |
| Concurrency vs parallelism, deadlock conditions | Medium | High | No (case-study only) |
| Git workflows: branching, rebase, resolving conflicts | Easy | High | Yes |

**Resources**
- How the internet works: [MDN — HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview), [freeCodeCamp — How the Web Works](https://www.freecodecamp.org/news/how-the-web-works-a-primer-for-newcomers-to-web-development-or-anyone-really-b4584e63585c/)
- OS basics + concurrency/deadlock: [OSTEP — Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/) (free book, read Concurrency + Persistence sections), CodeHelp (Babbar) OS Placements playlist (already on your list)
- Git workflows: [Learn Git Branching](https://learngitbranching.js.org/) (interactive), [Pro Git book](https://git-scm.com/book/en/v2) (free)

---

## Phase 1 — Node.js & JavaScript Core

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Event loop: phases, microtask vs macrotask, execution order | Hard | Critical | Yes — write scripts, predict then verify console.log order |
| Closures, prototypes, `this` binding | Medium | High | Yes |
| Async evolution: callbacks → promises → async/await; Promise.all/allSettled/race | Medium | Critical | Yes |
| Error handling: try/catch, unhandled rejections, custom error classes, partial-failure/rollback logic | Medium | High | Yes |
| Streams & buffers: readable/writable/duplex/transform, backpressure | Hard | High | Yes — pipe a large file, break it on purpose, then fix |
| Module systems: CommonJS vs ESM | Easy | Medium | Yes |
| Child processes & worker threads (CPU-bound offloading) | Hard | Medium | Yes |
| Node internals: libuv, thread pool | Hard | Medium | No |

**Resources**
- Event loop: [Node.js official docs — The Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick), Jake Archibald — "In The Loop" (JSConf talk, YouTube)
- Closures/prototypes/`this`: [You Don't Know JS Yet](https://github.com/getify/You-Dont-Know-JS) (free book series, "Scope & Closures" + "Objects & Classes" volumes)
- Async evolution: [MDN — Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS)
- Error handling: [Node.js Design Patterns](https://www.nodejsdesignpatterns.com/) book (Casciaro) — error handling chapter
- Streams & backpressure: [Node.js official Stream docs](https://nodejs.org/api/stream.html), [stream-handbook](https://github.com/substack/stream-handbook) (free, GitHub)
- CommonJS vs ESM: [Node.js official ESM docs](https://nodejs.org/api/esm.html)
- Child processes & worker threads: [Node.js official Worker Threads docs](https://nodejs.org/api/worker_threads.html)
- Node internals (libuv): Node.js Design Patterns book, [libuv design overview](https://docs.libuv.org/en/v1.x/design.html)

---

## Phase 2 — HTTP & API Design

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| HTTP protocol deep dive: methods, status codes, headers, keep-alive, HTTP/2 basics | Medium | Critical | Yes — build a raw HTTP server, no framework |
| REST design principles: resource naming, statelessness | Easy | Critical | Yes |
| API versioning strategies | Easy | Medium | No |
| Pagination, filtering, sorting patterns | Easy | High | Yes |
| WebSockets / real-time (Socket.io) | Medium | Medium | Yes (you already have some exposure — deepen it) |
| GraphQL basics vs REST tradeoffs | Medium | Low–Medium | Optional |
| gRPC basics | Medium | Low | No |

**Resources**
- HTTP deep dive: [MDN — HTTP guides](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- REST design + versioning: [restfulapi.net](https://restfulapi.net/), [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) (free, GitHub)
- Pagination/filtering: [Stripe API docs — Pagination](https://stripe.com/docs/api/pagination) (worth studying closely given your target)
- WebSockets: [Socket.io official docs](https://socket.io/docs/v4/), [MDN — WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- GraphQL: [graphql.org — Learn](https://graphql.org/learn/)
- gRPC: [grpc.io — Introduction](https://grpc.io/docs/what-is-grpc/introduction/)

---

## Phase 3 — Database Layer

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Relational DB fundamentals: normalization, joins, indexes | Medium | Critical | Yes |
| Query optimization & reading EXPLAIN plans | Hard | High | Yes |
| Transactions & ACID | Medium | Critical | Yes |
| Isolation levels, optimistic vs pessimistic locking | Hard | Critical | Yes — simulate a race condition, fix it with locking |
| NoSQL data modeling (MongoDB schema design) | Medium | High | Yes |
| ORM tradeoffs + detecting/fixing N+1 queries | Medium | Critical | Yes — cause an N+1 bug on purpose, fix with eager loading |
| Caching strategy (Redis): cache-aside, write-through, TTL, invalidation | Medium | Critical | Yes |
| Connection pooling | Easy | High | Yes |
| DB scaling: replication, sharding, read replicas | Hard | Medium | No |

**Resources**
- Relational fundamentals + query optimization/EXPLAIN: [Use The Index, Luke](https://use-the-index-luke.com/) (free site), [PostgreSQL official tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- Transactions/ACID + locking: **Designing Data-Intensive Applications** by Martin Kleppmann — Ch. 7 (Transactions). This book is worth owning; it's the single best backend reference that exists
- NoSQL modeling: [MongoDB official — Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- ORM tradeoffs + N+1: [Prisma docs — Query optimization / N+1](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)
- Caching (Redis): [Redis official docs](https://redis.io/docs/latest/)
- DB scaling: DDIA book — Ch. 5 (Replication) & Ch. 6 (Partitioning)
- Connection pooling: [node-postgres — pooling docs](https://node-postgres.com/features/pooling)

---

## Phase 4 — Authentication & Security

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Auth patterns: sessions, JWT, OAuth2, SSO | Medium | Critical | Yes — build JWT auth from scratch once, then with a library |
| JWT internals & common mistakes (alg:none, weak secret, missing expiry) | Medium | Critical | Yes — break your own token, then patch it |
| Password security (bcrypt/argon2, salting) | Easy | Critical | Yes |
| OWASP Top 10 (SQLi, XSS, CSRF, SSRF, broken access control) | Medium | Critical | Yes — attack your own toy app, then patch |
| Rate limiting algorithms (token bucket, sliding/fixed window) | Medium | High | Yes |
| CORS — how it actually works | Easy | High | Yes |
| Secrets management (env vars, vaults) | Easy | Medium | No |
| Input validation & sanitization | Easy | Critical | Yes |

**Resources**
- Auth patterns: [Auth0 blog — Session vs Token Auth](https://auth0.com/blog/cookies-vs-tokens-definitive-guide/), [oauth.net](https://oauth.net/2/)
- JWT internals & mistakes: [jwt.io](https://jwt.io/) (intro + debugger), [Auth0 — JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook) (free PDF)
- Password security: [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- OWASP Top 10: [owasp.org/Top10](https://owasp.org/www-project-top-ten/) (official, primary source)
- Rate limiting: [Stripe blog — rate limiters](https://stripe.com/blog/rate-limiters) (again, directly relevant to your target)
- CORS: [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- Secrets management: [12factor.net — Config](https://12factor.net/config)
- Input validation: [OWASP — Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

## Phase 5 — Concurrency, Scaling & Architecture

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Idempotency & idempotency keys | Medium | Critical | Yes — implement one on a real endpoint |
| Distributed locks (Redis SETNX / Redlock) | Hard | High | Yes |
| Message queues (BullMQ / RabbitMQ / Kafka basics) | Medium | High | Yes — one small queue-based job |
| Event-driven architecture & pub/sub | Medium | Medium | Yes |
| Horizontal scaling & load balancing | Medium | High | Optional (simulate with 2 processes + nginx locally) |
| Stateless service design | Easy | High | No |
| Microservices vs monolith tradeoffs | Medium | Medium | No |
| API Gateway pattern | Medium | Low–Medium | No |
| CAP theorem & consistency models | Hard | Medium | No |

**Resources**
- Idempotency: [Stripe official docs — Idempotent Requests](https://stripe.com/docs/api/idempotent_requests) (this is literally the canonical real-world example — study it directly)
- Distributed locks: [Redis docs — Distributed Locks](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/), Martin Kleppmann — ["How to do distributed locking"](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) (a critique worth reading for the interview-level nuance)
- Message queues: [BullMQ official docs](https://docs.bullmq.io/), [Kafka — Introduction](https://kafka.apache.org/documentation/#gettingStarted)
- Event-driven/pub-sub: [Confluent — What is Event-Driven Architecture](https://www.confluent.io/learn/event-driven-architecture/)
- Horizontal scaling/load balancing: DDIA book, [NGINX docs — Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
- Stateless design: [12factor.net — Processes](https://12factor.net/processes)
- Microservices vs monolith: Martin Fowler — ["MonolithFirst"](https://martinfowler.com/bliki/MonolithFirst.html)
- API Gateway: [Kong docs — API Gateway intro](https://docs.konghq.com/gateway/latest/), AWS API Gateway docs
- CAP theorem: DDIA book — Ch. 9, Eric Brewer — ["CAP Twelve Years Later"](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)

---

## Phase 6 — Reliability & Observability

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Structured logging practices | Easy | High | Yes |
| Monitoring & metrics (Prometheus/Grafana basics) | Medium | Medium | Optional |
| Distributed tracing basics | Medium | Low–Medium | No |
| Testing: unit, integration, e2e | Medium | Critical | Yes |
| Load testing (k6 / Artillery) | Medium | Medium | Yes |
| Error tracking (Sentry-style tools) | Easy | Medium | Optional |

**Resources**
- Structured logging: [12factor.net — Logs](https://12factor.net/logs), [Pino docs](https://getpino.io/) (fast Node logger)
- Monitoring: [Prometheus — Getting Started](https://prometheus.io/docs/prometheus/latest/getting_started/)
- Distributed tracing: [OpenTelemetry docs — intro](https://opentelemetry.io/docs/what-is-opentelemetry/)
- Testing: [Jest official docs](https://jestjs.io/docs/getting-started), [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) (GitHub — excellent all-round reference, revisit this repo across every phase)
- Load testing: [k6 — Getting Started](https://grafana.com/docs/k6/latest/)
- Error tracking: [Sentry docs — quickstart](https://docs.sentry.io/platforms/node/)

---

## Phase 7 — DevOps & Infra

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Docker fundamentals: image, container, Dockerfile, compose | Medium | Critical | Yes — containerize an existing project (Tropex/SkillSync) |
| CI/CD pipelines (GitHub Actions) | Medium | High | Yes — set up once, reuse the pattern |
| Cloud deployment basics (AWS EC2/S3, Railway/Render) | Medium | High | Yes |
| Environment configs (dev/staging/prod separation) | Easy | Medium | Yes |
| Kubernetes awareness (not needed at internship level yet) | Hard | Low | No |

**Resources**
- Docker: [Docker official — Get Started](https://docs.docker.com/get-started/), [docker-curriculum.com](https://docker-curriculum.com/) (free walkthrough)
- CI/CD: [GitHub Actions — Quickstart](https://docs.github.com/en/actions/quickstart)
- Cloud deployment: [Railway docs](https://docs.railway.app/), [Render docs](https://render.com/docs)
- Env configs: [12factor.net — Config](https://12factor.net/config)
- Kubernetes (low priority, later): [kubernetes.io — Learn Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

---

## Phase 8 — System Design (interview boss level)

| Topic | Difficulty | Importance | Practical |
|---|---|---|---|
| Latency vs throughput | Easy | Critical | No |
| Scalability patterns: caching layers, CDN, vertical/horizontal scale | Medium | Critical | No |
| Consistency vs availability tradeoffs | Medium | High | No |
| Back-of-envelope capacity estimation | Medium | High | No |
| Case studies: URL shortener, rate limiter, chat app, payment system, notification system | Hard | Critical | Yes — design on paper/whiteboard, walk through out loud |

**Resources**
- Latency numbers: ["Latency Numbers Every Programmer Should Know"](https://colin-scott.github.io/personal_website/research/interactive_latency.html) (interactive gist)
- Scalability patterns + case studies + estimation: [System Design Primer](https://github.com/donnemartin/system-design-primer) (GitHub, free) — the single best free resource for this whole phase, use it as your spine
- Consistency/availability: DDIA book (same one from Phase 3/5 — you'll be rereading chapters by now)
- Case study walkthroughs: [ByteByteGo YouTube channel](https://www.youtube.com/@ByteByteGo) (Alex Xu) — visual explainers for exactly these case studies

---

## Rule of thumb for "do I need to build this?"
If the topic involves **race conditions, data loss, or money loss** — build it hands-on, break it, fix it. If it's a **pure tradeoff discussion** (microservices vs monolith, CDN, CAP theorem) — understanding + being able to argue both sides in an interview is enough.

## How to use this doc
- Work top to bottom. Don't jump to Phase 5 because it sounds cooler than Phase 1.
- For every "Practical: Yes" row, you're not done until you've broken it once and fixed it — not just followed a tutorial.
- Revisit Phase 8 case studies after finishing Phase 5, then again after Phase 7 — your answers should get sharper each pass.
- This roadmap assumes DSA prep is running in parallel on its own track — the two don't block each other.
