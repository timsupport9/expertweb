# ExpertHub — Section 1: Foundation

This package is the first of three implementation ZIPs. It contains the root runtime, Express bootstrap, configuration, middleware, utilities, constants, minimal routing, public entry page, and health-check script.

## Database intentionally omitted
The complete `database/` directory is intentionally NOT included. Your existing database can be placed in the project separately.

## Three sections
1. Foundation — root runtime, config, middleware, utilities, constants, base routes.
2. Application — controllers, models, repositories, services, integrations, jobs, events/listeners, validators.
3. Interface & operations — views, public CSS/JS/assets, scripts, tests, docs and remaining runtime folders.

## Start locally
Copy `.env.example` to `.env`, enter your database credentials, run `npm install`, then `npm start`.
