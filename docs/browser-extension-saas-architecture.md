# AI Resume Truth Checker Browser Extension SaaS Architecture

## Goal

Build a Chrome Manifest V3 extension that detects job postings, extracts job context, authenticates against the existing platform, fetches the user's saved CV profile, and generates a tailored cover letter through secure backend APIs.

## System Diagram

```text
Chrome Extension
  Popup UI <-> Background Service Worker <-> Platform API
      ^                 ^
      |                 |
Content Script ---- Job Page DOM

Platform API
  Auth Middleware
  Extension Origin Validation
  Trial + Subscription Middleware
  Cover Letter Controller
  AI Provider Layer
  Stripe Webhooks
  Analytics Events

Data
  PostgreSQL: users, resumes, subscriptions, usage, cover_letters, events
  Redis: rate limits, short-lived refresh locks, abuse counters
  Object Storage: resume files
```

## Extension Folder Structure

```text
extension/
  public/manifest.json
  src/
    background/index.ts
    content/index.tsx
    content/styles.css
    popup/main.tsx
    popup/styles.css
    shared/api.ts
    shared/siteExtractors.ts
    shared/storage.ts
    shared/types.ts
  popup.html
  vite.config.ts
  tailwind.config.ts
```

## Backend API Structure

```text
/api/extension/auth/login
/api/extension/auth/refresh
/api/extension/auth/logout
/api/extension/me
/api/extension/usage
/api/extension/cover-letters/generate
/api/extension/cover-letters/save
/api/extension/events
/api/billing/stripe/create-checkout-session
/api/billing/stripe/portal
/api/billing/stripe/webhook
```

## PostgreSQL Schema

```sql
CREATE TYPE subscription_plan AS ENUM ('free', 'monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('none', 'trialing', 'active', 'past_due', 'canceled');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  extracted_text TEXT NOT NULL,
  parsed_profile JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'none',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE extension_usage (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  trial_limit INT NOT NULL DEFAULT 5,
  trial_used INT NOT NULL DEFAULT 0,
  generation_count INT NOT NULL DEFAULT 0,
  last_generated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  job_url TEXT,
  job_site TEXT,
  job_title TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  job_description_hash TEXT NOT NULL,
  subject_line TEXT,
  body_markdown TEXT NOT NULL,
  match_score INT,
  model_provider TEXT,
  model_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Trial Enforcement

The frontend can display counters, but enforcement must happen server-side in one transaction.

```ts
async function assertCanGenerate(userId: string, tx: Tx) {
  const sub = await tx.subscriptions.findByUserId(userId);
  if (sub?.status === "active" && ["monthly", "yearly"].includes(sub.plan)) return;

  const usage = await tx.extensionUsage.lockForUpdate(userId);
  if (usage.trial_used >= usage.trial_limit) {
    throw new ApiError(402, "Trial limit reached", { upgradeUrl: "/pricing" });
  }

  await tx.extensionUsage.incrementTrial(userId);
}
```

## Generate Cover Letter API

```http
POST /api/extension/cover-letters/generate
Authorization: Bearer <access-token>
X-Extension-Client: <chrome-extension-id>
Content-Type: application/json

{
  "job": {
    "site": "linkedin",
    "url": "https://www.linkedin.com/jobs/view/...",
    "title": "Senior Frontend Engineer",
    "companyName": "Acme",
    "location": "Remote",
    "description": "..."
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subjectLine": "Application for Senior Frontend Engineer",
    "bodyMarkdown": "Dear Acme team...",
    "callToAction": "I would welcome...",
    "matchScore": 84,
    "usage": {
      "plan": "free",
      "trialLimit": 5,
      "trialUsed": 2,
      "remainingTrial": 3,
      "subscriptionStatus": "none",
      "canGenerate": true,
      "upgradeUrl": "/pricing"
    }
  }
}
```

## Backend Controller Example

```ts
router.post(
  "/extension/cover-letters/generate",
  authenticateAccessToken,
  validateExtensionOrigin,
  rateLimitByUser("cover_letter", { limit: 10, windowSeconds: 3600 }),
  validateBody(generateCoverLetterSchema),
  async (req, res) => {
    const userId = req.user.id;

    const result = await db.transaction(async (tx) => {
      await assertCanGenerate(userId, tx);
      const resume = await tx.resumes.findDefaultByUserId(userId);
      if (!resume) throw new ApiError(400, "Upload a CV before using the extension.");

      const letter = await coverLetterService.generateFromResumeAndJob({
        resumeText: resume.extracted_text,
        candidateProfile: resume.parsed_profile,
        job: req.body.job
      });

      const saved = await tx.coverLetters.create({
        userId,
        resumeId: resume.id,
        job: req.body.job,
        ...letter
      });

      await tx.analyticsEvents.create(userId, "cover_letter_generated", {
        site: req.body.job.site,
        matchScore: letter.matchScore
      });

      return { ...saved, usage: await tx.extensionUsage.summary(userId) };
    });

    res.status(201).json({ success: true, data: result });
  }
);
```

## Stripe Subscription Flow

1. User clicks upgrade in popup.
2. Extension opens `https://app.example.com/pricing?source=extension`.
3. Backend creates Stripe Checkout Session.
4. Stripe redirects back to account page.
5. Stripe webhook updates `subscriptions`.
6. Extension calls `/api/extension/usage` and unlocks generation.

Webhook must use raw body verification:

```ts
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  req.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

Handle:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

## Authentication Flow

```text
Popup login
  -> POST /extension/auth/login
  <- short-lived access token + rotating refresh token
  -> chrome.storage.local stores session

Background request
  -> if access token expires in <60s
  -> POST /extension/auth/refresh
  -> replace both tokens
```

Production hardening:

- Access token lifetime: 10-15 minutes.
- Refresh token lifetime: 30 days.
- Store refresh token hash in DB, not raw token.
- Rotate refresh token on every refresh.
- Revoke token on logout.
- Use `chrome.storage.local`; do not put tokens in content scripts or DOM.

## Security Controls

- Verify JWT signature and issuer/audience.
- Validate `X-Extension-Client` against an allowlist of production extension IDs.
- Use strict request schemas with Zod.
- Rate limit by user ID, IP, extension ID, and job description hash.
- Hash job descriptions before analytics storage when possible.
- Stripe webhook route must bypass JSON parser and verify raw body signature.
- CORS should allow only web app origins; extension calls are authenticated and origin-validated by extension ID.
- Do not trust trial counters from the extension.
- Lock `extension_usage` row in a transaction before incrementing trial count.
- Log failed auth attempts and repeated 402/429 events.

## Analytics Events

Track:

```text
extension_login_success
job_detected
cover_letter_generation_started
cover_letter_generated
cover_letter_generation_failed
cover_letter_saved
trial_limit_reached
upgrade_clicked
stripe_checkout_completed
```

Useful properties:

```json
{
  "site": "linkedin",
  "descriptionLength": 5200,
  "plan": "free",
  "remainingTrial": 3,
  "matchScore": 84
}
```

## Streaming Support

Use Server-Sent Events for Chrome extension compatibility:

```http
POST /api/extension/cover-letters/generate-stream
Accept: text/event-stream
```

Events:

```text
event: token
data: {"text":"Dear"}

event: done
data: {"coverLetterId":"uuid","usage":{...}}
```

## Deployment Strategy

- Extension: build with `npm run build --prefix extension`, upload `extension/dist` to Chrome Web Store.
- Backend: deploy API to Vercel, Render, Fly.io, or AWS ECS.
- PostgreSQL: Neon, Supabase, RDS, or Cloud SQL.
- Redis: Upstash or Elasticache for rate limiting.
- Secrets: store JWT, Stripe, DB, and AI provider keys in managed secret storage.
- Use separate extension IDs and backend allowlists for dev/staging/prod.

## CI/CD

```text
pull_request:
  npm ci --prefix frontend
  npm run build --prefix frontend
  npm ci --prefix backend
  npm run lint --prefix backend
  npm ci --prefix extension
  npm run build --prefix extension

main:
  deploy backend
  deploy frontend
  upload extension artifact for manual Chrome Web Store review
```

## Scaling Recommendations

- Queue long AI jobs if latency exceeds 20 seconds.
- Cache resume parsed profile by resume ID.
- Store job description hash to detect repeat generations.
- Add idempotency keys to generation requests.
- Partition analytics events monthly when volume grows.
- Use read replicas for analytics dashboards.
- Add OpenTelemetry traces across extension API, AI provider, and Stripe webhook processing.

## Bonus Roadmap

- Job match score: compare resume skills and job keywords before generation.
- Improve Resume for This Job: reuse ATS scanner and resume enhancer against extracted job description.
- One-click apply assistant: prefill common application fields where permitted by site policies.
- Multilingual cover letters: add `language` to generation request.
- Offline drafts: store unsaved letters in `chrome.storage.local`, sync when online.
