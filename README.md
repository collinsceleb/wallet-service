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

