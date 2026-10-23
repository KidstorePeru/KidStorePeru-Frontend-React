# KidStorePeru — Frontend

Admin dashboard for the KidStorePeru Fortnite gifting shop. Operators log in,
connect Fortnite (Epic) accounts, browse the live item shop and send gifts;
admins also manage users and see every account and transaction.

## Stack

- React 18 + Vite 5, TypeScript (strict)
- React Router 7
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

## Prices in soles

Every shop item, the gift confirmation, the history and the dashboard show the
price in soles (S/) next to the V-Bucks price. **Every 100 pavos cost S/ 1.30.**
The rate lives in one place, [`src/lib/pricing.ts`](src/lib/pricing.ts); to
change it without editing code set a build variable (Railway → Variables):

```
VITE_SOLES_PER_100_PAVOS=1.50
```

Prices are computed in whole céntimos and rounded to the nearest one per gift
(e.g. 500 pavos → S/ 6.50, 75 pavos → S/ 0.98); totals add the per-gift prices.
The history shows today's rate for old gifts too (no price is stored per sale).

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc --noEmit` then `vite build` → `dist/` |
| `npm run typecheck` | type check only |
| `npm run lint` | ESLint over js/jsx/ts/tsx |

## Structure

```
src/lib/api.ts        shared axios instance: attaches the JWT, logs out on 401, 45 s timeout
src/lib/pricing.ts    soles price list (S/ 1.30 per 100 pavos)
src/App.tsx           routing, session check, admin gating
src/pages/            one file per screen
src/components/        UI, grouped by feature
src/hooks/            usePageTitle, usePolling (refresh while the tab is visible), useEscapeKey, useMediaQuery
src/components/theme/  dark/light via CSS variables + localStorage
```

Auth: `POST /loginform` returns a JWT that is stored in the `session` cookie
(`secure` only over HTTPS, 1-day expiry). Every request carries it as
`Authorization: Bearer <jwt>`; a 401 clears the cookie and redirects to login.

## Deployment

Deployed on Railway with Railpack: it runs `npm ci` + `npm run build` and
serves the static `dist/` output. Set `VITE_API_URL` as a build variable if it
should differ from the committed `.env`.
