# CRO refinement verification

Unit checks: `node --test tests/cro-flow.cjs` (3 passing).
Browser checks: install playwright-core externally, provide NODE_PATH and CHROMIUM_PATH, then run `node tests/cro-browser.cjs`. QL_QA_OUTPUT optionally selects the screenshot/report directory. 251 checks passed across 1440, 834, 390 and 360 pixel viewports. API responses and analytics are mocked; no real purchases or user mutations occur.

Coverage: light/dark theme, Arabic web fonts, measured body-copy contrast >=4.5, mobile overflow, search, country picker, mentor panel, portrait removal, real photo loading, name-only preview dialog, timer activation on lesson DOM load, expiry choices, StartTrial deduplication for public preview and authenticated iframe, course return after login, public syllabus expansion, and no uncaught browser errors.

Deploy backend PR first: it retires the hour/review offer and exposes the public overview. Frontend then removes the offer UI and adds the refined experience. Existing granted access and legitimate payment fulfillment are preserved. Content iframe load is the measurement trigger; it does not prove the learner read the chapter. Public browser preview is a convenience preview, not a server-enforced entitlement.

Not validated: real Paymob purchase, production Supabase writes, live analytics delivery, or uploaded course ZIP internals. Uploaded lesson content is unchanged. The legacy public first chapter changes only its preview gate and Pixel script inclusion.
