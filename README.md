# أثر | Ather

Luxury accessories store built with Next.js, Prisma, and Tailwind CSS. Architecture follows the same storefront + admin pattern as the previous commerce project, restyled for أثر.

## Brand

- **Pearl** `#EFEADC` — canvas
- **Powder** `#8EA7C1` — accent
- **Truffle** `#4B2F24` — text and primary actions
- Logo: fingerprint mark with Arabic lockup (أثر)

Cocoa `#7F5B3B` is not part of the palette.

## Stack

- Next.js (App Router)
- Prisma + PostgreSQL
- Tailwind CSS 4
- Zustand cart
- NextAuth
- Framer Motion
- Arabic / English dictionaries

## Setup

```bash
npm install
```

Create `.env` from `.env.example`, then:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

## Structure

- `src/app` — storefront, admin, actions, API
- `src/components` — UI, layout, product
- `src/lib` — prisma, auth, i18n
- `prisma` — schema and seed
- `public/logo.png` — brand mark
