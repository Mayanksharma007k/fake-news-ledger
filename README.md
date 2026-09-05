# Fake News Ledger — Docker deployment

## Local Docker

1. Copy env file:
   `cp fake-news-ledger-backend/.env.example fake-news-ledger-backend/.env`
2. Start:
   `docker compose up --build`
3. Open:
   `http://localhost:3000/`
4. API docs:
   `http://localhost:8000/docs`

## Public deployment

Deploy the `fake-news-ledger-backend` and `fake-news-ledger-frontend` containers to any Docker-compatible host.

Backend environment:
- `CORS_ORIGINS=https://YOUR-FRONTEND-DOMAIN`
- `OPENAI_API_KEY=...` (optional)
- `DATABASE_URL=...`

Frontend build argument/environment:
- `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN`

For a cloud demo, use a host that supports Dockerfiles or Docker Compose. The frontend must use the public backend URL, not `127.0.0.1`.
