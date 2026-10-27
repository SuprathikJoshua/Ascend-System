import type { WebDevTopic } from "./localDb";

export const WEBDEV_SEED: Omit<WebDevTopic, "id">[] = [
  {
    "phase": 0,
    "name": "How the internet works (DNS, TCP/IP, HTTP/HTTPS handshake)",
    "difficulty": "Easy",
    "importance": "Critical",
    "practical": false,
    "resourceLinks": "[{\"label\":\"MDN — HTTP overview\",\"url\":\"https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview\"},{\"label\":\"freeCodeCamp — How the Web Works\",\"url\":\"https://www.freecodecamp.org/news/how-the-web-works-a-primer-for-newcomers-to-web-development-or-anyone-really-b4584e63585c/\"}]",
    "status": "todo",
    "order": 0
  },
  {
    "phase": 0,
    "name": "OS basics: process vs thread, memory management",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"OSTEP — Operating Systems: Three Easy Pieces\",\"url\":\"https://pages.cs.wisc.edu/~remzi/OSTEP/\"}]",
    "status": "todo",
    "order": 1
  },
  {
    "phase": 0,
    "name": "Concurrency vs parallelism, deadlock conditions",
    "difficulty": "Medium",
    "importance": "High",
    "practical": false,
    "resourceLinks": "[{\"label\":\"OSTEP — Operating Systems: Three Easy Pieces\",\"url\":\"https://pages.cs.wisc.edu/~remzi/OSTEP/\"}]",
    "status": "todo",
    "order": 2
  },
  {
    "phase": 0,
    "name": "Git workflows: branching, rebase, resolving conflicts",
    "difficulty": "Easy",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Learn Git Branching\",\"url\":\"https://learngitbranching.js.org/\"},{\"label\":\"Pro Git book\",\"url\":\"https://git-scm.com/book/en/v2\"}]",
    "status": "todo",
    "order": 3
  },
  {
    "phase": 1,
    "name": "Event loop: phases, microtask vs macrotask, execution order",
    "difficulty": "Hard",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Node.js official docs — The Event Loop\",\"url\":\"https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick\"}]",
    "status": "todo",
    "order": 4
  },
  {
    "phase": 1,
    "name": "Closures, prototypes, `this` binding",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"You Don't Know JS Yet\",\"url\":\"https://github.com/getify/You-Dont-Know-JS\"}]",
    "status": "todo",
    "order": 5
  },
  {
    "phase": 1,
    "name": "Async evolution: callbacks → promises → async/await; Promise.all/allSettled/race",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"MDN — Asynchronous JavaScript\",\"url\":\"https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS\"}]",
    "status": "todo",
    "order": 6
  },
  {
    "phase": 1,
    "name": "Error handling: try/catch, unhandled rejections, custom error classes, partial-failure/rollback logic",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Node.js Design Patterns\",\"url\":\"https://www.nodejsdesignpatterns.com/\"}]",
    "status": "todo",
    "order": 7
  },
  {
    "phase": 1,
    "name": "Streams & buffers: readable/writable/duplex/transform, backpressure",
    "difficulty": "Hard",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Node.js official Stream docs\",\"url\":\"https://nodejs.org/api/stream.html\"},{\"label\":\"stream-handbook\",\"url\":\"https://github.com/substack/stream-handbook\"}]",
    "status": "todo",
    "order": 8
  },
  {
    "phase": 1,
    "name": "Module systems: CommonJS vs ESM",
    "difficulty": "Easy",
    "importance": "Medium",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Node.js official ESM docs\",\"url\":\"https://nodejs.org/api/esm.html\"}]",
    "status": "todo",
    "order": 9
  },
  {
    "phase": 1,
    "name": "Child processes & worker threads (CPU-bound offloading)",
    "difficulty": "Hard",
    "importance": "Medium",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Node.js official Worker Threads docs\",\"url\":\"https://nodejs.org/api/worker_threads.html\"}]",
    "status": "todo",
    "order": 10
  },
  {
    "phase": 1,
    "name": "Node internals: libuv, thread pool",
    "difficulty": "Hard",
    "importance": "Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"libuv design overview\",\"url\":\"https://docs.libuv.org/en/v1.x/design.html\"}]",
    "status": "todo",
    "order": 11
  },
  {
    "phase": 2,
    "name": "HTTP protocol deep dive: methods, status codes, headers, keep-alive, HTTP/2 basics",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"MDN — HTTP guides\",\"url\":\"https://developer.mozilla.org/en-US/docs/Web/HTTP\"}]",
    "status": "todo",
    "order": 12
  },
  {
    "phase": 2,
    "name": "REST design principles: resource naming, statelessness",
    "difficulty": "Easy",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"restfulapi.net\",\"url\":\"https://restfulapi.net/\"},{\"label\":\"Microsoft REST API Guidelines\",\"url\":\"https://github.com/microsoft/api-guidelines\"}]",
    "status": "todo",
    "order": 13
  },
  {
    "phase": 2,
    "name": "API versioning strategies",
    "difficulty": "Easy",
    "importance": "Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"restfulapi.net\",\"url\":\"https://restfulapi.net/\"},{\"label\":\"Microsoft REST API Guidelines\",\"url\":\"https://github.com/microsoft/api-guidelines\"}]",
    "status": "todo",
    "order": 14
  },
  {
    "phase": 2,
    "name": "Pagination, filtering, sorting patterns",
    "difficulty": "Easy",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Stripe API docs — Pagination\",\"url\":\"https://stripe.com/docs/api/pagination\"}]",
    "status": "todo",
    "order": 15
  },
  {
    "phase": 2,
    "name": "WebSockets / real-time (Socket.io)",
    "difficulty": "Medium",
    "importance": "Medium",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Socket.io official docs\",\"url\":\"https://socket.io/docs/v4/\"},{\"label\":\"MDN — WebSocket API\",\"url\":\"https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API\"}]",
    "status": "todo",
    "order": 16
  },
  {
    "phase": 2,
    "name": "GraphQL basics vs REST tradeoffs",
    "difficulty": "Medium",
    "importance": "Low–Medium",
    "practical": "optional",
    "resourceLinks": "[{\"label\":\"restfulapi.net\",\"url\":\"https://restfulapi.net/\"},{\"label\":\"Microsoft REST API Guidelines\",\"url\":\"https://github.com/microsoft/api-guidelines\"},{\"label\":\"graphql.org — Learn\",\"url\":\"https://graphql.org/learn/\"}]",
    "status": "todo",
    "order": 17
  },
  {
    "phase": 2,
    "name": "gRPC basics",
    "difficulty": "Medium",
    "importance": "Low",
    "practical": false,
    "resourceLinks": "[{\"label\":\"grpc.io — Introduction\",\"url\":\"https://grpc.io/docs/what-is-grpc/introduction/\"}]",
    "status": "todo",
    "order": 18
  },
  {
    "phase": 3,
    "name": "Relational DB fundamentals: normalization, joins, indexes",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Use The Index, Luke\",\"url\":\"https://use-the-index-luke.com/\"},{\"label\":\"PostgreSQL official tutorial\",\"url\":\"https://www.postgresql.org/docs/current/tutorial.html\"},{\"label\":\"Prisma docs — Query optimization / N+1\",\"url\":\"https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance\"}]",
    "status": "todo",
    "order": 19
  },
  {
    "phase": 3,
    "name": "Query optimization & reading EXPLAIN plans",
    "difficulty": "Hard",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Use The Index, Luke\",\"url\":\"https://use-the-index-luke.com/\"},{\"label\":\"PostgreSQL official tutorial\",\"url\":\"https://www.postgresql.org/docs/current/tutorial.html\"}]",
    "status": "todo",
    "order": 20
  },
  {
    "phase": 3,
    "name": "Transactions & ACID",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Designing Data-Intensive Applications\",\"url\":\"https://dataintensive.net/\"}]",
    "status": "todo",
    "order": 21
  },
  {
    "phase": 3,
    "name": "Isolation levels, optimistic vs pessimistic locking",
    "difficulty": "Hard",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Designing Data-Intensive Applications\",\"url\":\"https://dataintensive.net/\"}]",
    "status": "todo",
    "order": 22
  },
  {
    "phase": 3,
    "name": "NoSQL data modeling (MongoDB schema design)",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"MongoDB official — Data Modeling\",\"url\":\"https://www.mongodb.com/docs/manual/data-modeling/\"}]",
    "status": "todo",
    "order": 23
  },
  {
    "phase": 3,
    "name": "ORM tradeoffs + detecting/fixing N+1 queries",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Prisma docs — Query optimization / N+1\",\"url\":\"https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance\"}]",
    "status": "todo",
    "order": 24
  },
  {
    "phase": 3,
    "name": "Caching strategy (Redis): cache-aside, write-through, TTL, invalidation",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Redis official docs\",\"url\":\"https://redis.io/docs/latest/\"}]",
    "status": "todo",
    "order": 25
  },
  {
    "phase": 3,
    "name": "Connection pooling",
    "difficulty": "Easy",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"node-postgres — pooling docs\",\"url\":\"https://node-postgres.com/features/pooling\"}]",
    "status": "todo",
    "order": 26
  },
  {
    "phase": 3,
    "name": "DB scaling: replication, sharding, read replicas",
    "difficulty": "Hard",
    "importance": "Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"Designing Data-Intensive Applications\",\"url\":\"https://dataintensive.net/\"}]",
    "status": "todo",
    "order": 27
  },
  {
    "phase": 4,
    "name": "Auth patterns: sessions, JWT, OAuth2, SSO",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Auth0 blog — Session vs Token Auth\",\"url\":\"https://auth0.com/blog/cookies-vs-tokens-definitive-guide/\"},{\"label\":\"oauth.net\",\"url\":\"https://oauth.net/2/\"},{\"label\":\"jwt.io\",\"url\":\"https://jwt.io/\"},{\"label\":\"Auth0 — JWT Handbook\",\"url\":\"https://auth0.com/resources/ebooks/jwt-handbook\"}]",
    "status": "todo",
    "order": 28
  },
  {
    "phase": 4,
    "name": "JWT internals & common mistakes (alg:none, weak secret, missing expiry)",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"jwt.io\",\"url\":\"https://jwt.io/\"},{\"label\":\"Auth0 — JWT Handbook\",\"url\":\"https://auth0.com/resources/ebooks/jwt-handbook\"}]",
    "status": "todo",
    "order": 29
  },
  {
    "phase": 4,
    "name": "Password security (bcrypt/argon2, salting)",
    "difficulty": "Easy",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"OWASP — Password Storage Cheat Sheet\",\"url\":\"https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html\"}]",
    "status": "todo",
    "order": 30
  },
  {
    "phase": 4,
    "name": "OWASP Top 10 (SQLi, XSS, CSRF, SSRF, broken access control)",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"owasp.org/Top10\",\"url\":\"https://owasp.org/www-project-top-ten/\"}]",
    "status": "todo",
    "order": 31
  },
  {
    "phase": 4,
    "name": "Rate limiting algorithms (token bucket, sliding/fixed window)",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Stripe blog — rate limiters\",\"url\":\"https://stripe.com/blog/rate-limiters\"}]",
    "status": "todo",
    "order": 32
  },
  {
    "phase": 4,
    "name": "CORS — how it actually works",
    "difficulty": "Easy",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"MDN — CORS\",\"url\":\"https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS\"}]",
    "status": "todo",
    "order": 33
  },
  {
    "phase": 4,
    "name": "Secrets management (env vars, vaults)",
    "difficulty": "Easy",
    "importance": "Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"12factor.net — Config\",\"url\":\"https://12factor.net/config\"}]",
    "status": "todo",
    "order": 34
  },
  {
    "phase": 4,
    "name": "Input validation & sanitization",
    "difficulty": "Easy",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"OWASP — Input Validation Cheat Sheet\",\"url\":\"https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html\"}]",
    "status": "todo",
    "order": 35
  },
  {
    "phase": 5,
    "name": "Idempotency & idempotency keys",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Stripe official docs — Idempotent Requests\",\"url\":\"https://stripe.com/docs/api/idempotent_requests\"}]",
    "status": "todo",
    "order": 36
  },
  {
    "phase": 5,
    "name": "Distributed locks (Redis SETNX / Redlock)",
    "difficulty": "Hard",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Redis docs — Distributed Locks\",\"url\":\"https://redis.io/docs/latest/develop/use/patterns/distributed-locks/\"},{\"label\":\"\\\"How to do distributed locking\\\"\",\"url\":\"https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html\"}]",
    "status": "todo",
    "order": 37
  },
  {
    "phase": 5,
    "name": "Message queues (BullMQ / RabbitMQ / Kafka basics)",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"BullMQ official docs\",\"url\":\"https://docs.bullmq.io/\"},{\"label\":\"Kafka — Introduction\",\"url\":\"https://kafka.apache.org/documentation/#gettingStarted\"}]",
    "status": "todo",
    "order": 38
  },
  {
    "phase": 5,
    "name": "Event-driven architecture & pub/sub",
    "difficulty": "Medium",
    "importance": "Medium",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Confluent — What is Event-Driven Architecture\",\"url\":\"https://www.confluent.io/learn/event-driven-architecture/\"}]",
    "status": "todo",
    "order": 39
  },
  {
    "phase": 5,
    "name": "Horizontal scaling & load balancing",
    "difficulty": "Medium",
    "importance": "High",
    "practical": "optional",
    "resourceLinks": "[{\"label\":\"NGINX docs — Load Balancing\",\"url\":\"https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/\"},{\"label\":\"Designing Data-Intensive Applications\",\"url\":\"https://dataintensive.net/\"}]",
    "status": "todo",
    "order": 40
  },
  {
    "phase": 5,
    "name": "Stateless service design",
    "difficulty": "Easy",
    "importance": "High",
    "practical": false,
    "resourceLinks": "[{\"label\":\"12factor.net — Processes\",\"url\":\"https://12factor.net/processes\"}]",
    "status": "todo",
    "order": 41
  },
  {
    "phase": 5,
    "name": "Microservices vs monolith tradeoffs",
    "difficulty": "Medium",
    "importance": "Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"\\\"MonolithFirst\\\"\",\"url\":\"https://martinfowler.com/bliki/MonolithFirst.html\"}]",
    "status": "todo",
    "order": 42
  },
  {
    "phase": 5,
    "name": "API Gateway pattern",
    "difficulty": "Medium",
    "importance": "Low–Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"Kong docs — API Gateway intro\",\"url\":\"https://docs.konghq.com/gateway/latest/\"}]",
    "status": "todo",
    "order": 43
  },
  {
    "phase": 5,
    "name": "CAP theorem & consistency models",
    "difficulty": "Hard",
    "importance": "Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"\\\"CAP Twelve Years Later\\\"\",\"url\":\"https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/\"},{\"label\":\"Designing Data-Intensive Applications\",\"url\":\"https://dataintensive.net/\"}]",
    "status": "todo",
    "order": 44
  },
  {
    "phase": 6,
    "name": "Structured logging practices",
    "difficulty": "Easy",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"12factor.net — Logs\",\"url\":\"https://12factor.net/logs\"},{\"label\":\"Pino docs\",\"url\":\"https://getpino.io/\"}]",
    "status": "todo",
    "order": 45
  },
  {
    "phase": 6,
    "name": "Monitoring & metrics (Prometheus/Grafana basics)",
    "difficulty": "Medium",
    "importance": "Medium",
    "practical": "optional",
    "resourceLinks": "[{\"label\":\"Prometheus — Getting Started\",\"url\":\"https://prometheus.io/docs/prometheus/latest/getting_started/\"}]",
    "status": "todo",
    "order": 46
  },
  {
    "phase": 6,
    "name": "Distributed tracing basics",
    "difficulty": "Medium",
    "importance": "Low–Medium",
    "practical": false,
    "resourceLinks": "[{\"label\":\"OpenTelemetry docs — intro\",\"url\":\"https://opentelemetry.io/docs/what-is-opentelemetry/\"}]",
    "status": "todo",
    "order": 47
  },
  {
    "phase": 6,
    "name": "Testing: unit, integration, e2e",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Jest official docs\",\"url\":\"https://jestjs.io/docs/getting-started\"},{\"label\":\"Node.js Best Practices\",\"url\":\"https://github.com/goldbergyoni/nodebestpractices\"},{\"label\":\"k6 — Getting Started\",\"url\":\"https://grafana.com/docs/k6/latest/\"}]",
    "status": "todo",
    "order": 48
  },
  {
    "phase": 6,
    "name": "Load testing (k6 / Artillery)",
    "difficulty": "Medium",
    "importance": "Medium",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Jest official docs\",\"url\":\"https://jestjs.io/docs/getting-started\"},{\"label\":\"Node.js Best Practices\",\"url\":\"https://github.com/goldbergyoni/nodebestpractices\"},{\"label\":\"k6 — Getting Started\",\"url\":\"https://grafana.com/docs/k6/latest/\"}]",
    "status": "todo",
    "order": 49
  },
  {
    "phase": 6,
    "name": "Error tracking (Sentry-style tools)",
    "difficulty": "Easy",
    "importance": "Medium",
    "practical": "optional",
    "resourceLinks": "[{\"label\":\"Sentry docs — quickstart\",\"url\":\"https://docs.sentry.io/platforms/node/\"}]",
    "status": "todo",
    "order": 50
  },
  {
    "phase": 7,
    "name": "Docker fundamentals: image, container, Dockerfile, compose",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Docker official — Get Started\",\"url\":\"https://docs.docker.com/get-started/\"},{\"label\":\"docker-curriculum.com\",\"url\":\"https://docker-curriculum.com/\"}]",
    "status": "todo",
    "order": 51
  },
  {
    "phase": 7,
    "name": "CI/CD pipelines (GitHub Actions)",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"GitHub Actions — Quickstart\",\"url\":\"https://docs.github.com/en/actions/quickstart\"}]",
    "status": "todo",
    "order": 52
  },
  {
    "phase": 7,
    "name": "Cloud deployment basics (AWS EC2/S3, Railway/Render)",
    "difficulty": "Medium",
    "importance": "High",
    "practical": true,
    "resourceLinks": "[{\"label\":\"Railway docs\",\"url\":\"https://docs.railway.app/\"},{\"label\":\"Render docs\",\"url\":\"https://render.com/docs\"}]",
    "status": "todo",
    "order": 53
  },
  {
    "phase": 7,
    "name": "Environment configs (dev/staging/prod separation)",
    "difficulty": "Easy",
    "importance": "Medium",
    "practical": true,
    "resourceLinks": "[{\"label\":\"12factor.net — Config\",\"url\":\"https://12factor.net/config\"}]",
    "status": "todo",
    "order": 54
  },
  {
    "phase": 7,
    "name": "Kubernetes awareness (not needed at internship level yet)",
    "difficulty": "Hard",
    "importance": "Low",
    "practical": false,
    "resourceLinks": "[{\"label\":\"kubernetes.io — Learn Kubernetes Basics\",\"url\":\"https://kubernetes.io/docs/tutorials/kubernetes-basics/\"}]",
    "status": "todo",
    "order": 55
  },
  {
    "phase": 8,
    "name": "Latency vs throughput",
    "difficulty": "Easy",
    "importance": "Critical",
    "practical": false,
    "resourceLinks": "[{\"label\":\"\\\"Latency Numbers Every Programmer Should Know\\\"\",\"url\":\"https://colin-scott.github.io/personal_website/research/interactive_latency.html\"}]",
    "status": "todo",
    "order": 56
  },
  {
    "phase": 8,
    "name": "Scalability patterns: caching layers, CDN, vertical/horizontal scale",
    "difficulty": "Medium",
    "importance": "Critical",
    "practical": false,
    "resourceLinks": "[{\"label\":\"System Design Primer\",\"url\":\"https://github.com/donnemartin/system-design-primer\"}]",
    "status": "todo",
    "order": 57
  },
  {
    "phase": 8,
    "name": "Consistency vs availability tradeoffs",
    "difficulty": "Medium",
    "importance": "High",
    "practical": false,
    "resourceLinks": "[{\"label\":\"Designing Data-Intensive Applications\",\"url\":\"https://dataintensive.net/\"}]",
    "status": "todo",
    "order": 58
  },
  {
    "phase": 8,
    "name": "Back-of-envelope capacity estimation",
    "difficulty": "Medium",
    "importance": "High",
    "practical": false,
    "resourceLinks": "[{\"label\":\"System Design Primer\",\"url\":\"https://github.com/donnemartin/system-design-primer\"}]",
    "status": "todo",
    "order": 59
  },
  {
    "phase": 8,
    "name": "Case studies: URL shortener, rate limiter, chat app, payment system, notification system",
    "difficulty": "Hard",
    "importance": "Critical",
    "practical": true,
    "resourceLinks": "[{\"label\":\"System Design Primer\",\"url\":\"https://github.com/donnemartin/system-design-primer\"},{\"label\":\"ByteByteGo YouTube channel\",\"url\":\"https://www.youtube.com/@ByteByteGo\"}]",
    "status": "todo",
    "order": 60
  }
];
