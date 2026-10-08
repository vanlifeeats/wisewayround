# Wise Way Round

Travel blog/vlog for Wise Way Round — Zoe & Mark's travel blog/vlog. Treading the globe, seeking adventure, exploring culture, and finding words of wisdom along the way.

## Running locally

```
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in real values before `/admin/travel-planner` or any Sanity-backed feature will work.

## Admin area

The Travel Planner CRM lives at `/admin/travel-planner`, behind Google sign-in restricted to the `ADMIN_EMAILS` allowlist. The landing page at `/` needs no auth.

**This project reads/writes the same Sanity dataset as the vanlifeeats project** — content created in one admin shows up in the other.

## Deployment

This site deploys to [Vercel](https://vercel.com) directly from this GitHub repository, using the standard Vercel Next.js build.
