# CLAUDE.md

Guidance for AI agents and human contributors working in this repo.

## Theming rules (mandatory)

The suite supports light / dark / system UI themes. The switching mechanism is a
`data-theme` attribute on `<html>` plus CSS custom properties defined once in
`packages/ui/src/tokens.css` (light defaults in `:root`, overrides in
`[data-theme='dark']`, and a `prefers-color-scheme` media-query fallback for
system mode).

1. **UI chrome colors must use semantic tokens.** Never write raw `#hex` /
   `rgb()` in renderer CSS rules or chrome-related inline styles — reference
   `var(--surface)`, `var(--text)`, `var(--hover)`, etc. from
   `packages/ui/src/tokens.css`. Raw values are allowed only on custom-property
   definition lines (`--x: #...;` — token, accent, or app-scoped variable
   definitions). CI enforces this for new/changed renderer CSS lines
   (`tools/check-theme-colors.mjs`).
2. **Every new token gets both values.** Adding a token means adding it to all
   three blocks in `tokens.css` (light, dark, system-dark fallback).
3. **Accent colors stay per-app.** Each app defines `--accent` /
   `--accent-dark` / `--accent-soft` (and its dark-adjusted values) in its own
   `styles.css`. Shared rules reference `var(--accent)` and inherit the app's
   brand color.
4. **Document content never follows the theme.** Page surfaces, cell fills,
   slide content, PDF page bitmaps, export/print stylesheets, chart palettes,
   highlight color maps, stamps, and WordArt presets are document data: they
   stay hardcoded, must not reference chrome tokens, and must render/export
   identically in both themes. (Word-style "dark chrome, white paper".)
5. **Canvas-drawn UI affordances go through a constants table.** Konva/canvas
   editing chrome (selection frames, guides, handles) reads from the app's
   canvas color table (e.g. `canvas-colors.ts`) keyed by the current theme —
   no inline hex in draw calls.

## Build gotchas

- App main-process code (`apps/*/src/main`) is compiled into the **shell**
  build. After changing it, rebuild the shell or the change silently does not
  run.
- In dev mode, preload changes require a rebuild — a stale preload leaves the
  renderer blank.
- Workspace packages listed in an app's `dependencies` must also be added to
  the `externalizeDepsPlugin` `exclude` list, or the packaged app crashes on
  launch.
- `useI18n()`'s `t` is not referentially stable; never put it in a hook
  dependency array. Store the key and translate at render time.
## Release & Whitelabel Rules (mandatory)

1. **Commit to main does NOT trigger release build**: Normal commits pushed to `main` branch are for source code history only and do NOT trigger release artifact builds or published releases.
2. **Release Workflow**: Release builds are strictly triggered on demand via release tags or tag push:
   - Workflow: Bump version in `package.json` & `apps/shell/package.json` ➔ Commit ➔ Create & push tag `v*` (e.g. `git tag v0.6.2 && git push github v0.6.2`) ➔ GitHub Actions executes Production Release & Publishes artifacts.
3. **Release artifact naming**: File names must clearly specify platform and architecture so users are never confused:
   - macOS Apple Silicon: `VuaOffice-${version}-macOS-Apple-Silicon.dmg` / `.zip`
   - macOS Intel: `VuaOffice-${version}-macOS-Intel.dmg` / `.zip`
   - Windows x64: `VuaOffice-${version}-Windows-x64-Setup.exe`
   - Linux: `VuaOffice-${version}.AppImage` / `vuaoffice_${version}_amd64.deb`
4. **Synchronized version bumping**: Always bump version in BOTH root `package.json` AND `apps/shell/package.json` before creating release tag. The GitHub Actions release workflow validates that tag version matches `apps/shell/package.json` exactly.
5. **Dual-remote Git push**: Always push commits and tags to both `origin` (GitLab) and `github` (GitHub). Never use `--no-verify` to bypass `.git/hooks/pre-push` unless executing the authorized publish flow.
6. **Branding & Whitelabel integrity**:
   - Sidebar logo: Use standalone icon `/whitelabel/logo/VuaOffice_Icon.svg` (28x28px) next to crisp brand text "VuaOffice", not co-axial stretched logo lockups.
   - AI Panel & Ribbon titles: Must use "VuaOffice AI" title and badge, not legacy "Genspark" text or sparkle icons.
   - Run `npm run whitelabel:apply` before every release build to ensure whitelabel transformation rules are clean.
7. **AI Settings & Provider Modes**:
   - Normal Mode: Connects directly via 360 CORP Gateway (`vuahethong.net` / `OmiRouter`).
   - Developer Mode: Supports multi-endpoint selection including Hermes Agent (`https://hermes.vuahethong.com/v1`).
