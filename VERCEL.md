# Vercel deployment

This repository is a monorepo. For Vercel, import the repository and set **Root Directory** to `fake-news-ledger-frontend`.

Set the environment variable `NEXT_PUBLIC_API_URL` to the public FastAPI backend URL before deploying the frontend.

Example:
`NEXT_PUBLIC_API_URL=https://your-backend.example.com`
