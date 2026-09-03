# KidStorePeru — Frontend

Admin dashboard for the KidStorePeru Fortnite gifting shop. Operators log in,
connect Fortnite (Epic) accounts, browse the live item shop and send gifts;
admins also manage users and see every account and transaction.

## Stack

- React 18 + Vite 5, TypeScript (strict)
- React Router 6
- axios (one shared instance in `src/lib/api.ts`)
- Tailwind for a few utilities; most styling is inline
- framer-motion, lucide-react

## Running locally

```bash
npm install
npm run dev            # http://localhost:3000
```

Point it at a backend by creating `.env.local`:

```
VITE_API_URL=http://localhost:8080
```

The committed `.env` already targets the production backend.

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc --noEmit` then `vite build` → `dist/` |
| `npm run typecheck` | type check only |
| `npm run lint` | ESLint over js/jsx/ts/tsx |
| `npm start` | serve `dist/` on `$PORT` (used in production) |

## Structure

```
src/lib/api.ts        shared axios instance: attaches the JWT, logs out on 401
src/App.tsx           routing, session check, admin gating
src/pages/            one file per screen
src/components/        UI, grouped by feature
src/hooks/            usePageTitle
src/components/theme/  dark/light via CSS variables + localStorage
```

Auth: `POST /loginform` returns a JWT that is stored in the `session` cookie
(`secure` only over HTTPS, 1-day expiry). Every request carries it as
`Authorization: Bearer <jwt>`; a 401 clears the cookie and redirects to login.

## Deployment

Railway builds via `nixpacks.toml` (`npm ci` → `npm run build` → `npm start`).
Set `VITE_API_URL` as a build variable if it should differ from the committed
`.env`.
