# ExpertHub backend deployment

This backend is designed to connect to the existing ExpertHub frontend through `/api`.

## Render
Build command:
`npm install`

Start command:
`npm start`

Required environment variables:
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- SESSION_SECRET
- JWT_SECRET
- APP_URL
- CORS_ORIGINS

Run the database migration once:
`npm run migrate`

Create an admin once:
`npm run seed`

Health check:
`GET /api/health`

The frontend already uses `/api` as its default API base, so when frontend and backend are on different origins, set `window.ExpertHub.apiBase` to the backend `/api` URL or update the frontend configuration accordingly.
