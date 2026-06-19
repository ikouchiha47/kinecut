# @roughcut/styles — contributor guide

## Adding a new style

1. Create `src/styles/<name>.tsx`
   - Export a `React.FC<RadiateStyleProps & { config?: <Name>Config }>` named `<Name>Effect`
   - Export a `<Name>Config` type with all tuneable values as optional with documented defaults
   - Use `resolveElement` from `@platform/core/element-registry` to render items and stamp
   - Use `renderStamp(stamp, opacity, scale)` pattern — the stamp is just an element, not hardcoded text
   - No hardcoded stage dimensions — read from `config.stageWidth ?? 1080` / `config.stageHeight ?? 1920`

2. Export from `src/index.ts`
   ```ts
   export { <Name>Effect } from './styles/<name>';
   export type { <Name>Config } from './styles/<name>';
   ```

3. Register in `src/radiate.ts` (batteries-included entry)
   ```ts
   import { <Name>Effect } from './styles/<name>';
   registerRadiateStyle('<name>', <Name>Effect);
   ```

## Adding a new stamp element

1. Create `src/elements/<name>.tsx`
   - Call `registerElement('radiate:<name>', { render(data, w, h) { ... } })` as a side effect
   - Keep it a pure renderer — no hooks, no Remotion deps, no animation

2. Import in `src/radiate.ts` for auto-registration
   ```ts
   import './elements/<name>';
   ```

3. Export the import path from `src/index.ts` if callers may want à la carte control

## Rules

- Core (`src/platform/`) has zero changes — styles depend on it, never modify it
- `src/index.ts` is pure exports only — no side effects, no registrations
- `src/radiate.ts` is the side-effect entry — all auto-registrations go here
- All config values must be optional with sensible defaults
- Use `@platform/` imports, never relative `../../../../src/platform/`

## Reference

- Spoke animation: `src/styles/spoke.tsx`
- Thinair animation: `src/styles/thinair.tsx`
- Stamp elements: `src/elements/text-accent.tsx`, `src/elements/image.tsx`
- Types: `src/radiate-registry.ts`
- Full API: `references/styles-package.md` (repo root)
