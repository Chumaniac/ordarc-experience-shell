# Ordarc experience shell

Presentation components and a standalone interface example. This package contains no calculation engines, user records, datasets, model prompts, credentials or business API clients. The example makes no network requests to an application service.

Install the development dependencies, then run `npm run build` or `npm run dev`. The components accept presentation slots rather than importing product logic. React is a peer dependency; `react-dom` and Vite are used only by the example.

MIT applies only to this independently authored package. It does not relicense the Ordarc application, its calculation engines, upstream materials or product trademarks. Dependency notices retain their own effect.

## Slots and semantics

`ProductHeader` supplies the header element; provide a brand link and, when needed,
a `nav` with a meaningful accessible name. Use one page-level banner and main
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

The demo uses a disclosure menu at widths up to 720px. Its button exposes the
expanded state, Escape returns focus to the button, and choosing a destination,
clicking outside or resizing to desktop closes it. This interaction belongs to
the demo; the headless header still accepts arbitrary presentation slots.

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
