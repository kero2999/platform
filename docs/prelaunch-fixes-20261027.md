# Prelaunch repairs

Deploy the companion backend first. No course ZIP re-upload is required; assessment chrome and criteria are repaired in the gateway and refreshed from task metadata.

- Public Launch preview is generated from the reviewed published chapter, retaining 14 concepts, HOW TO MAKE, visual interactions and photography. Only this chapter and its six images are copied. Authenticated RPC, mentor bridge and assessment assets are excluded. Embedded fonts reuse the existing hosted brand fonts. Preview starts the existing 10-minute guard when readable markup is ready; expiry and browser-session deduplication remain in the existing trial module.
- Shared course presentation removes literal bold markers and standardizes known marketing-level categories and instructor aliases without modifying database records.
- Locked chapters display a recovery action before the iframe loads. Same-origin microphone access is permitted for the existing mentor controls; camera/geolocation remain disabled.
- Add robots.txt and a public-page sitemap; remove internal implementation wording from policy pages without inventing refund deadlines.

Validation: seven jsdom tests in `tests/prelaunch-ui.test.cjs`, with jsdom installed externally, e.g. `NODE_PATH=/tmp/ql-prelaunch-test/node_modules node --test tests/prelaunch-ui.test.cjs`. These are DOM tests, not a claim of mobile-browser coverage. Backend has 57 separate regression tests.

Before launch: verify the deployed preview on a real phone, test account recovery email, complete a sandbox payment and an ordinary student's chapter assessment, and verify analytics receipt. Business/legal refund-policy approval is still separate.

Public-preview verification also excludes the authored chapter's collapsed review answer-key section. It remains in the private course; the 14 concept sections, chapter summary and HOW TO MAKE remain in the public preview.
