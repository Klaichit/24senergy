# 24sEnergy — V2

Next.js 16 application with a bilingual HTML storefront, Supabase CMS, authenticated administration and server-side lead submission.

## Development

Use Node.js 22.18+ (tests use Node's TypeScript support). `pnpm-lock.yaml` captures the dependency versions validated for V2.

V2 uses pnpm as the single package manager; the obsolete npm lockfile was removed to avoid two dependency sources.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Set the public Supabase values and the **server-only** `SUPABASE_SERVICE_ROLE_KEY`. Never prefix the service key with `NEXT_PUBLIC_`, commit it, or place it in HTML. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin without a trailing slash.

## Database rollout

1. For a **new database only**, run `supabase-schema.sql`.
2. Apply `supabase/migrations/202609070001_v2.sql`. For an existing database, apply this migration directly; it preserves rows but deliberately replaces prototype policies on the website's tables. Check custom policies before rollout.
3. Assign the intended administrator `app_metadata.role = "admin"` with Supabase's trusted Auth administration API/dashboard. Do not use user-editable `user_metadata`. Sign in again after changing this claim.
4. Run `supabase/tests/v2-access.sql` on a disposable Supabase test project. It tests anonymous, normal-user and admin access plus the persistent limiter, then rolls back fixtures.
5. Set the server-only service key on the deployment. Verify an actual quote and contact message appear under `/admin/quotes` and `/admin/inquiries` before promoting V2.

The migration creates missing CMS tables, contact messages, newsletter subscribers and rate-limit state. Public clients cannot read leads or write products. Anonymous lead insertion is disabled; only `/api/leads` inserts with the server key. Storage writes for `product-images` require the admin claim, including when older permissive storage policies exist.

Forms return success only after saving. Missing configuration, migrations, network failures and database errors fail visibly and preserve input. Newsletter duplicates return the same success response. The limiter allows 10 attempts per hour per Vercel-provided client IP, stores only an HMAC, and is atomic across instances. Non-Vercel hosts use one shared fallback bucket: configure a trusted proxy IP source before using another production host. Email delivery and marketing campaigns are not configured; inquiries and subscribers are saved for admins to manage.

## Source ownership

- Edit public HTML in `public/` only. Root HTML files are generated mirrors for legacy handoff; run `pnpm sync:public` after editing. CI checks drift.
- `public/site.js` and `public/site.css` own shared mobile navigation, forms, focus styling and escaping utilities.
- `/products/[slug]` reads published CMS data. Legacy `product-*.html` URLs redirect there through Next.js.
- Serve HTML through Next.js for `/api/leads` and redirects. Opening files with `file://` does not provide the backend.
- Public Supabase URL/key in `public/index.html` and `public/products.html` must match the deployment's public configuration. They are public identifiers, not administrative credentials.
- Static canonical/Open Graph tags use `https://24senergy.vercel.app`. Update them together with `NEXT_PUBLIC_SITE_URL` when assigning a production domain.
- Original PNGs are preserved. Four WebP alternatives total about 337 KB versus 6.56 MB for the originals.

## Checks

```sh
pnpm test
pnpm check:public
pnpm lint
pnpm build
```

Browser smoke checks require Playwright and Chrome. Start the production server on port 3100, set `PLAYWRIGHT_MODULE` and `CHROME_PATH` if needed, then run `node scripts/browser-check.cjs`. Supabase/form responses are intercepted; no real records are submitted. Screenshots are saved to ignored `artifacts/`.

`node scripts/integration-check.cjs` runs a local fake Supabase service and a separate Next.js dev instance. It tests real API routing, validation, error handling and product SSR without production credentials.

The default test suite also runs the migration and access-control assertions on PostgreSQL WASM (PGlite), with minimal local stubs for Supabase's Auth and Storage schemas. This checks policy behavior without contacting production; still run the Supabase test-project checks before rollout.

## Remaining production inputs

Real phone/LINE/social destinations and verified project/product claims must be supplied by the business. V2 removes fake actionable contact links. Apply and verify the migration and deployment environment separately; a local build does not prove the live database has the new policies.
