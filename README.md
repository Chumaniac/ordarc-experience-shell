# Ordarc experience shell

Presentation components and a standalone interface example. This package contains no calculation engines, user records, datasets, model prompts, credentials or business API clients. The example makes no network requests to an application service.

Install the development dependencies, then run `npm run build` or `npm run dev`. The components accept presentation slots rather than importing product logic. React is a peer dependency; `react-dom` and Vite are used only by the example.

MIT applies only to this independently authored package. It does not relicense the Ordarc application, its calculation engines, upstream materials or product trademarks. Dependency notices retain their own effect.

## Slots and semantics

`ProductHeader` supplies the header element; provide a brand link and, when needed,
a `nav` with a meaningful accessible name, or `ProductNavigation` with link children. Use one page-level banner and main
landmark. `ProductFooter` supplies the footer and named navigation: its children
are links, not another `nav` or `footer`. Set `navigationLabel` for the page
language and to distinguish multiple navigation regions; the compatible default
is `页脚导航`.

`ServiceCard` is a non-interactive article. It supplies a heading and paragraph;
links or buttons belong in its optional children. Match the document hierarchy
with `headingAs="h2"`, `"h3"`, or `"h4"` (default `h2`). Do not wrap the whole
article in a button or link containing other controls. Consumers own destinations,
link names, logical heading order, page language and visible focus styling.

The demo includes a skip link, focusable main target, unique navigation names and
visible keyboard focus. The independent [consumer example](examples/consumer.tsx)
uses an `h1` → `h2` → `h3` hierarchy and localized footer navigation. Run
`npm ci`, `npm run typecheck`, `npm run build` and `npm run test:consumer`; the
last command installs the actual tarball into a fresh directory and checks its
consumer types and production build. These checks do not certify every host UI
or replace assistive-technology review.

`ProductNavigation` supplies the reusable disclosure navigation used by both the
demo and independent consumer. Pass links as children, `navigationLabel` for its
navigation region and `toggleLabel` for the button, in the page language (compatible
Chinese defaults are `主要导航` and `菜单`). Each instance generates its own control
ID. It collapses at widths up to 720px, exposes `aria-expanded`, returns focus on
Escape, and closes after choosing a destination, an outside pointer press or a
resize to desktop. It is a disclosure of ordinary links, with no menu-role or
focus trap. Viewport and outside-pointer listeners are removed on unmount.

Visibility uses native hidden attributes and settles after hydration; server
rendering keeps the links available. Import the optional styles for the supplied
header layout, or style the `product-navigation`, `product-navigation-toggle` and
`product-navigation-links` classes in the host. Keep hidden elements hidden and
use the same 720px breakpoint. `ProductHeader` continues to accept arbitrary slots;
using the navigation component is optional.

## Styles and reproducible source

The component entry is headless: it imports no stylesheet. For the optional
component styles, explicitly import `@ordarc/experience-shell/styles.css`.
The optional styles supply dark component surfaces with readable foregrounds;
customize `--ordarc-surface`, `--ordarc-card`, `--ordarc-foreground` and
`--ordarc-focus`. Those rules target the component classes; host-wide resets, colors and typography
belong to the host. `demo.css` is demo-only and should not be a host stylesheet.
The package exports TSX source and requires a TSX-capable consumer bundler; `dist`
is the static demo, not a compiled component library. No npm publication is
performed by these checks.

After committing source changes, run `npm run source:write`, review and commit
`SHOWCASE-MANIFEST.json`. `npm run source:verify` checks its maintained input
allowlist, file sizes/digests, source-tree digest and ancestor commit. The manifest
excludes itself and review reports; the old nine-file manifest remains in Git
history. A clean build records `dist/BUILD-PROVENANCE.json` with actual input and
output digests, lockfile, Node/npm/Vite/TypeScript versions and license metadata.
Draft builds explicitly report working-tree changes. The receipt excludes itself
and does not prove a hosted release, source authorship or business acceptance.


## Manual content tabs

`ProductTabs` is an uncontrolled, presentation-only horizontal tab set. Pass stable,
unique non-empty `id` values, plain non-empty `label` strings and React `panel`
content through `items`. Set `ariaLabel` for the page language. `defaultTabId`
chooses the initial item; a missing/invalid default falls back to the first item.
Changing the default later does not control selection. Empty arrays render nothing;
invalid/duplicate IDs or labels are rejected. Existing header/navigation/footer/card
APIs are unchanged.

Left/Right wrap focus; Home/End focus the first/last control. Focus movement does
not activate a panel. Native Enter, Space or click activates it. A single selected
tab enters the page tab sequence, and each panel has unique generated IDs and
`aria-controls`/`aria-labelledby` links. This follows the
[WAI-ARIA manual activation pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/).

Inactive panels remain mounted and hidden, preserving their inputs and child state
across ordinary tab switches. Removing an item explicitly unmounts its content;
selection falls back to the first remaining item and does not resurrect when the
item returns. Hosts own focus if they remove focused content. `onTabChange` fires
only for an actual user activation change, not initial or roster fallback selection.
The component changes no URL, storage, server state or business permissions.

Import the existing optional stylesheet for focus/selected styles, or style
`product-tabs`, `product-tablist`, `product-tab`, and `product-tabpanel` in the host;
keep hidden panels hidden. The entry still imports no CSS and works in React 18
server rendering. There are no global listeners, timers, body copies or added
runtime dependencies. Retaining panels intentionally retains their content: use
small tab sets and manage large/async content in the host rather than treating
tabs as an unlimited cache. Local bounds/cleanup are not a CPU or memory benchmark.

The demo and actual packed consumer use the component. Consumer verification now
also server-renders the installed tarball to check unique associations, selected
states, retained panels and empty/invalid rosters. Native browser checks cover
manual activation, input retention, independent instances, dynamic removal/reorder,
no accidental callback, responsive layout and the existing mobile navigation;
they do not replace an independent assistive-technology review.
