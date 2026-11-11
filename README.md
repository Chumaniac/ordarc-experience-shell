<img src="src/ordarc.svg" width="56" height="56" alt="" />

# Ordarc

[![Build](https://github.com/Chumaniac/ordarc-experience-shell/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/Chumaniac/ordarc-experience-shell/actions/workflows/check.yml) [![License](https://img.shields.io/badge/license-MIT-555)](LICENSE)

在浏览器整理研习笔记，保留版本并导出自己的记录。

[打开记录工作台](https://chumaniac.github.io/ordarc-experience-shell/) · [进入 Ordarc 命盘与研习工作台](https://chumanic.com/)

## 快速开始

```sh
git clone https://github.com/Chumaniac/ordarc-experience-shell.git
cd ordarc-experience-shell
npm ci
npm run dev
```

使用 Node 20.19+ 或 22.12+，打开终端显示的本机地址。展示程序无需账号或环境变量。

## 可以做什么

- 新建带标题、栏目和正文的研习记录，保存并查看此前的修改。
- 在当前浏览器搜索记录，导入导出 JSON 或导出文本摘要。
- 在 React 项目中复用页头、导航、卡片与页脚组件。

**清除浏览器数据后可以找回记录吗？** 请先导出备份。公开展示没有云端账户，也不包含命盘计算服务。

**旧版记录能否导入？** 工作台读取 `ordarc.notes.v1`，支持单条记录 JSON 的 `version: 1` 格式，最多包含最近十次正文版本。导入会新建草稿，确认后再保存。正式产品的整库备份采用独立格式，请在原产品中恢复。

## 组件与许可

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


## 本地工作台体验更新（2026-11-09）

从只有未绑定textarea的展示样例变为本机文字记录工作台：示例、栏目、搜索、新建/保存、刷新恢复、10次正文旧版本、JSON/Markdown导出、受校验的JSON导入与删除。

实现范围、启动方式与验证边界见 [体验改造说明](docs/PRODUCT_EXPERIENCE.md)。

## macOS application

The record workspace now uses a quiet sidebar and a compact content area. Build its independent window application using [desktop/README.md](desktop/README.md); existing browser records remain in their original storage and can be moved through the existing JSON export/import flow. No astrology computation or external model service is added.
