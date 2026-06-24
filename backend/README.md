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

Seed login password for all demo users: `Password123!`.

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
