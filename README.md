## Wallet Service API

## Description

[Wallet Service ](https://github.com/collinsceleb/wallet-service) API TypeScript repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Migration

```bash
# Generate Migration
# Ensure you change YourMigrationName to the actual name you want to migration file to be
$ npx typeorm-ts-node-commonjs migration:generate -d ./typeOrm.config.ts ./migrations/YourMigrationName

# Run Migration
$ npx typeorm-ts-node-commonjs migration:run -d ./typeOrm.config.ts
```

## Data Integrity

- Transfers are executed inside database transactions
- Pessimistic row locking prevents race conditions
- Ensure wallet balances cannot go negative
- Idempotency is added on fund/transfer operation

## Production Scaling

This section outlines practical considerations for running the Wallet Service at scale.

- **Transactions & Concurrency:** Ensure Keep using DB transactions and row-level locks for balance updates. Keep transactions short to reduce lock contention. Prefer deterministic locking order (by wallet id) to avoid deadlocks during transfers.

- **Idempotency & Exactly-Once:** Maintain idempotency keys (already implemented) and maintain a dedicated `transfers` table(already implemented) to reconcile concurrent retries. Periodic cleanup of old idempotency records is recommended.

- **Caching:** Ensure Caching for non-critical read data (recent wallet metadata or computed aggregates) in Redis to reduce read load. Avoid caching balance values unless you implement strong cache invalidation on writes.

- **Background Workers:** Ensure Offloading long-running work (reporting, reconciliation, heavy analytics) to background workers (e.g., BullMQ with Redis) to keep request latency low.

- **Observability & Monitoring:** Add structured logging, distributed tracing (W3C trace context, OpenTelemetry), and metrics (Prometheus + Grafana). Monitor DB long-running queries, lock contention, and queue lengths.

- **Rate Limiting & Throttling:** Apply API rate limits and per-wallet quotas to mitigate abuse and reduce hot-keys. Implement exponential backoff and client-friendly retry guidance.

- **Failover & Backups:** Configure automated backups, PITR (point-in-time recovery), and a tested failover process. Regularly restore backups to ensure recovery plans work.

- **Migrations & Deploys:** Run schema migrations as a controlled step in CI/CD with pre-migration checks and deploys that support rolling updates. Consider zero-downtime migration practices (avoid locking table-wide DDL during peak hours).

- **Security:** Enforce TLS, strong auth (OAuth2/JWT), input validation, least-privilege DB roles, and audit logging for financial operations.
