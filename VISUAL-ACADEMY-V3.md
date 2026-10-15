# Quadralevel Visual Academy V3

The approved blue/white Editorial + Bento + Visual Storytelling identity now applies to 25 platform pages. Shared tokens retain the existing component names; the course ZIP contents and legacy chapter files remain independent.

- Self-hosted Alexandria 800, IBM Plex Sans Arabic 400/500/600/700 and Space Grotesk 500 in WOFF2, with their OFL licenses. Total font payload: about 345 KB.
- Editorial home hero with an interactive feature/benefit example, existing server-backed reviews near the top, and explanatory product-tour artwork.
- Marketplace, course detail, learner dashboard, auth forms, policies, country dialog and Kero panel share the same type, surfaces, spacing and accessible blue palette.
- Light is the default for new visitors; an existing dark/light preference is retained. PWA cache version advances atomically with the new CSS/JS.
- Auth, API/payment/access/progress/tracking modules are unchanged. One existing Promise-chain invocation error in platform-reviews.html is fixed so reviews can render.

## Validation

`tests/visual-academy-v3.cjs` serves the static repository and uses Chromium via playwright-core. Set `CHROMIUM_PATH` to an installed Chromium binary, make playwright-core resolvable to Node, then run `node tests/visual-academy-v3.cjs`. Optional `QL_QA_OUTPUT` sets the local report/screenshot directory (defaults to the OS temporary directory).

The browser suite checks desktop (1440), tablet (834), and mobile (390/360) layouts, document overflow, local fonts, RTL, search, persisted theme, the homepage interaction, country dialog, learner chapter locks and Kero panel. API calls and account state are isolated test fixtures; no payment or live user mutation is performed. External analytics/CDN traffic is stubbed during the test. Screenshots are local review artifacts, not site content.

Real payment completion, live mentor answers, uploaded course content and non-Chromium browsers are not verified by this visual change.
