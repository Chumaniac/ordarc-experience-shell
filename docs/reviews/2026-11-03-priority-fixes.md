# Presentation package verification

Date: 2026-11-03. Status: source candidate; no hosted demo or npm release published.

- Locked development dependencies and Node 24.17.0 CI run typecheck, demo build,
  source verification and an independent tarball consumer. The consumer installs
  the actual npm pack result, then typechecks and builds outside this checkout.
- Existing props retain their defaults. Footer navigation can be named for the
  host language; card headings can use h2/h3/h4 to match the host hierarchy.
  Slot and landmark responsibilities are documented in the README.
- Components import no CSS. An explicit styles.css export provides optional
  component-scoped surfaces and focus styles; demo-wide resets and typography
  remain in demo.css. MIT and React/React DOM dependency notices remain present.
- A maintained 17-file build-input manifest binds a clean ancestor commit,
  lockfile, input bytes and digest. The manifest and review reports are excluded
  from its own inventory. Static build receipts record source state, actual
  output digests, tool versions and license metadata; a draft build is marked as
  modified. These are provenance records, not authenticated release approval.

Isolated real Chrome checks at 1440×900 and 320×900 verified a single page banner,
main and footer; uniquely named navigation; keyboard skip-link activation and
main focus; no horizontal overflow; an actual packaged consumer with h1/h2/h3;
visible focus and card-heading contrast above 4.5. No page errors or external
requests were observed. This is focused browser evidence, not full screen-reader
or every-host accessibility certification. The demo makes no business API calls.

Current build is approximately 145 kB of JavaScript before compression. Package
source, type/build gates, browser checks, hosted CI and a published release remain
separate evidence. No calculation engine, user data, credential or business API
was added. Original source/history and other workspaces remain preserved.
