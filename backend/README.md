# Khan Backend

NestJS + PostgreSQL + Prisma backend for Khan marketplace.

## Run

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API prefix: `/api/v1`.

Seed creates only admin/ops accounts and does not add marketplace products, stores, reels, coupons, or categories.
Seed login password for system accounts: `Password123!`.
To remove old marketplace seed records from an already-seeded database, run `npm run prisma:clear-marketplace-seed`.

## Core Decisions

- Marketplace supports many stores, but one cart/order can contain products from one store only.
- Payments support `COD` and `SHAM_CASH`.
- Khan platform operations update delivery statuses.
- Sham Cash is implemented through a provider-facing callback and admin manual confirmation fallback.

## Main API Groups

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- `GET /home`, `/categories`, `/products`, `/stores/:id`, `/search`, `/reels`
- `GET/POST/PATCH/DELETE /cart/items`
- `POST /orders/checkout`, `GET /orders/my`, `GET /orders/:id`
- `POST /payments/sham-cash/initiate`, `POST /payments/sham-cash/callback`
- `/merchant/store`, `/merchant/products`, `/merchant/orders`, `/merchant/coupons`, `/merchant/reels`, `/merchant/wallet`
- `/admin/stores`, `/admin/orders`, `/admin/payments`, `/admin/delivery-events`, `/admin/reviews`
