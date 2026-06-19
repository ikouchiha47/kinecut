# @roughcut/styles

An external library of radiate scene styles for Roughcut. Ships built-in styles (`spoke`, `thinair`) and default stamp elements (`radiate:text-accent`, `radiate:image`). Everything is opt-in — the library registers nothing on import.

---

## What it exports

```ts
// Style registry
export { registerRadiateStyle, resolveRadiateStyle } from './radiate-registry';

// Scene component
export { RadiateScene } from './RadiateScene';

// Built-in styles (import to use; must also register)
export { SpokeEffect, SpokeConfig } from './styles/spoke';
export { ThinAirEffect, ThinAirConfig } from './styles/thinair';

// Built-in stamp elements (import to register side-effects)
import './elements/text-accent';  // registers 'radiate:text-accent'
import './elements/image';        // registers 'radiate:image'

// Types
export type { RadiateStyleProps, StampSpec } from './radiate-registry';
```

---

## Wiring up in a project

In your project's `registry.ts`:

```ts
import { bundle } from '@roughcut/core';
import {
  RadiateScene,
  SpokeEffect,
  ThinAirEffect,
  registerRadiateStyle,
} from '@roughcut/styles';

// register built-in stamp elements (side-effect imports)
import '@roughcut/styles/elements/text-accent';
import '@roughcut/styles/elements/image';

// register the styles you want available
registerRadiateStyle('spoke',    SpokeEffect);
registerRadiateStyle('thinair',  ThinAirEffect);

// wire the scene type into the bundle
bundle.scenes.register('radiate', RadiateScene);
```

---

## Spec usage

```ts
{
  type: 'radiate',
  style: 'spoke',         // or 'thinair'
  duration: 4.2,
  items: [
    { element: 'core:pill', data: { label: 'Ghost Type', emoji: '👻', color: '#a78bfa' }, w: 260, h: 80 },
    { element: 'core:pill', data: { label: 'Red Flag',   emoji: '🚩', color: '#ef4444' }, w: 260, h: 80 },
  ],
  stamp: {
    element: 'radiate:text-accent',
    data: { text: 'everyone has a', accentWord: 'type.' },
    at: 3.0,
    w: 1080, h: 400,
  },
}
```

---

## Bringing your own style

```ts
import { registerRadiateStyle, RadiateStyleProps } from '@roughcut/styles';

const MyStyle: React.FC<RadiateStyleProps> = ({ items, stamp, config }) => {
  // your animation here
};

registerRadiateStyle('my-style', MyStyle);
```

Then use `style: 'my-style'` in your spec. No changes to the library needed.

---

## Bringing your own stamp element

```ts
import { registerElement } from '@platform/core/element-registry';

registerElement('myproject:logo', {
  render(data: { src: string }, w, h) {
    return <img src={data.src} style={{ width: w, height: h }} />;
  },
});
```

Then use `stamp: { element: 'myproject:logo', data: { src: 'logo.png' }, at: 3.0 }`.

---

## Built-in style configs

### `spoke` — SpokeConfig

| Prop | Default | Description |
|------|---------|-------------|
| `stageWidth` | `1080` | Stage width in px |
| `stageHeight` | `1920` | Stage height in px |
| `centerRadius` | `32` | Radius of the hub circle at center |
| `minRadius` | `240` | Minimum spoke length |
| `maxRadius` | `460` | Maximum spoke length |
| `spokeStagger` | `0.30` | Seconds between each spoke starting |
| `spokeDrawDur` | `0.55` | Seconds for a spoke line to fully extend |
| `spokeSpring` | `{ damping: 30, stiffness: 120 }` | Spring for spoke line draw |
| `chipSpring` | `{ damping: 14, stiffness: 180 }` | Spring for chip pop |
| `stampSpring` | `{ damping: 16, stiffness: 220 }` | Spring for stamp entrance |

### `thinair` — ThinAirConfig

| Prop | Default | Description |
|------|---------|-------------|
| `stageWidth` | `1080` | Stage width in px |
| `stageHeight` | `1920` | Stage height in px |
| `gapX` | `24` | Horizontal gap between chips in a row |
| `gapY` | `32` | Vertical gap between rows |
| `marginX` | `160` | Total horizontal margin (80px each side) |
| `stagger` | `0.09` | Seconds between each chip appearing |
| `chipSpring` | `{ damping: 14, stiffness: 240 }` | Spring for chip materialize |
| `stampSpring` | `{ damping: 16, stiffness: 220 }` | Spring for stamp entrance |

---

## Built-in stamp elements

### `radiate:text-accent`

Big slam-style text with an accent word below.

| Data field | Default | Description |
|------------|---------|-------------|
| `text` | required | Main text |
| `accentWord` | required | Colored word below |
| `fontFamily` | `'Space Grotesk, sans-serif'` | Font |
| `fontSize` | `140` | Size in px |
| `lineHeight` | `0.92` | Line height |
| `letterSpacing` | `-5` | Letter spacing in px |
| `accentColor` | `'#9d5cff'` | Accent word color |

### `radiate:image`

Centered image, sized to the stamp's `w`/`h`.

| Data field | Default | Description |
|------------|---------|-------------|
| `src` | required | Path relative to `public/` |
| `borderRadius` | `0` | Border radius in px |
| `objectFit` | `'cover'` | CSS object-fit |
