# Approved day/night and desktop/mobile identity

The implementation follows the approved standalone desktop/mobile previews: Alexandria regular/semibold body, Alexandria ExtraBold headings, a readable white day theme, and the selected night navy palette (#080f1c canvas / #13243b cards). The home lesson journey explains six chapter activities plus final project and certification. Native mobile disclosures open on tap; desktop steps stay expanded. The catalog remains API-driven and known course covers fill their frames.

Validation:
- node --test tests/cro-flow.cjs: 3 passing unit checks.
- tests/cro-browser.cjs: 251 passing browser checks covering public pages, auth return paths, course/dashboard rendering, pixel/preview behavior, dark/light themes, fonts, search, country picker and mentor panel.
- tests/responsive-identity.cjs: 120 passing checks across 1440/834/390/360 widths and both themes, including journey counts/disclosures, mobile menu, retained reviews, full-frame cover images and no course/home overflow.

Use an externally installed playwright-core via NODE_PATH, CHROMIUM_PATH for the browser binary, and optional QL_QA_OUTPUT for temporary screenshots/reports. Both browser suites use mocked APIs and analytics; no production purchase or database write is exercised. Run the browser suites separately, or use their different local ports (8765 and 8766).

Auth, payments, tracking, trial and uploaded-course content logic is unchanged. Only the theme-color metadata changes in theme.js. The existing campaign retirement remains active. Regular/semibold font assets total 73,076 bytes and use the existing Alexandria OFL license. Service-worker cache v41 includes the new font assets.
