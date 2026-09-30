# Stock Trading Platform Backend

A beginner-friendly Java and Spring Boot REST API for a simulated stock-trading platform.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Spring Boot API (uses `PORT`, defaults to 8080)
- `pnpm --filter @workspace/api-server run typecheck` — compile the Java backend
- `pnpm --filter @workspace/api-server run build` — package the backend with Maven

## Stack

- Java 17, Spring Boot, Maven
- In-memory Java collections; no database or external financial API

## Where things live

- `artifacts/api-server/src/main/java/com/codealpha/stocktrading/model` — stock, user, portfolio, holding, and transaction models
- `artifacts/api-server/src/main/java/com/codealpha/stocktrading/service` — stock search and trading calculations
- `artifacts/api-server/src/main/java/com/codealpha/stocktrading/controller` — REST endpoints and API error responses
- `artifacts/api-server/src/main/java/com/codealpha/stocktrading/repository` — in-memory stock, user, and transaction collections

## Architecture decisions

- Trades are simulated against fixed mock prices; no external market data is used.
- Portfolio profit/loss reports unrealized gains on current holdings. Overall performance compares account value to the initial cash and includes realized trade results.
- All data resets when the API process restarts.

## Product

Lists and searches mock stocks, executes simulated buy/sell trades, and reports holdings, transactions, and account performance.

## User preferences

- Keep the implementation beginner-friendly and use Java, Spring Boot, and Maven only for the backend.
- Do not add a database, frontend, or deployment unless requested.

## Gotchas

- The API runs at `/api`; trade requests use JSON with `symbol` and a positive integer `quantity`.
- Since all repositories are in memory, each application restart restores the initial demo user and empty portfolio.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
