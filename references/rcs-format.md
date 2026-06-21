# Roughcut Screenplay (.rcs) Format Reference

A `.rcs` file is a human-readable screenplay for a Roughcut video. It describes scenes, content, effects, and transitions in a format designed for quick review and editing — before any TypeScript spec is generated.

Source of truth for supported values: `src/platform/types.ts`, `src/projects/<project>/types.ts`, and the reference docs in `references/`.

---

## File structure

```
ROUGHCUT SCREENPLAY v1
project: <project-name>
fps: 30
dimensions: 1080x1920

--- SCENE 1 ---
...

--- SCENE 2 ---
...

TOTAL: <sum of durations>s
```

### Header fields

| Field        | Required | Description                                      |
|--------------|----------|--------------------------------------------------|
| `project`    | yes      | Matches a folder in `src/projects/`              |
| `fps`        | no       | Frames per second. Default: `30`                 |
| `dimensions` | no       | Always `1080x1920`. Included for documentation   |

---

## Multiple screenplays

When proposing multiple options, separate them with a horizontal rule and label each:

```
== SCREENPLAY A: Fast Cut ==

ROUGHCUT SCREENPLAY v1
project: my-app
fps: 30

--- SCENE 1 ---
...

TOTAL: 8s

---

== SCREENPLAY B: Slow Drift ==

ROUGHCUT SCREENPLAY v1
project: my-app
fps: 30

--- SCENE 1 ---
...

TOTAL: 12s
```

---

## Scene block

Every scene starts with `--- SCENE N ---` and ends at the next scene block or `TOTAL:`.

```
--- SCENE 1 ---
type: text
duration: 1.5s
transition: cut
...scene-specific fields...
```

### Common fields (all scene types)

| Field        | Required | Values                          | Default |
|--------------|----------|---------------------------------|---------|
| `type`       | yes      | see scene types below           | —       |
| `duration`   | yes      | seconds, e.g. `1.5s` or `1.5`  | —       |
| `transition` | no       | `cut` \| `fade`                 | `cut`   |
| `preset`     | no       | preset id (screenshot/slideshow only) | — |

---

## Scene types

### `text`

Bold lines animating in independently.

```
--- SCENE 1 ---
type: text
duration: 1.5s
lines:
  - "Hook line here"
  - "Accented line" [accent]
  - "Mixed [accent]color[/accent] in a line"
  enter: slam
transition: cut
```

**Line syntax:**

| Syntax | Effect |
|--------|--------|
| `"Plain text"` | Normal line, default enter |
| `"Text" [accent]` | Whole line in accent color |
| `"Mix [accent]word[/accent] here"` | Inline accent on a word |
| `enter: <value>` | Applied to the line above it, or globally to all lines |

**`enter` values:** `slide-up` `slide-left` `slide-right` `slam`

**Global enter** (applies to all lines unless overridden):
```
lines:
  enter: slide-up
  - "Line one"
  - "Line two"
```

---

### `screenshot`

Single image filling the frame with camera motion and optional element overlays.

```
--- SCENE 2 ---
type: screenshot
duration: 3s
asset: profile
preset: ken-burns
enter: slide up
motion: pan down to:0.85
elements:
  - pill "Red Flag" emoji:🚩 color:#ef4444 at:1.2s pos:540,900 size:400x80
    effect: pop-in
    effect: bloom color:#ef4444 delay:0.3s
overlays:
  - vignette intensity:0.5
koFinish: "DEXED." sub:"optional subtitle" at:2.5s
transition: cut
```

**`asset`** — key from `assets.yaml`, not a full path. Resolved to `public/<project>/<key>.png`.

**`enter` values:** `slide up` `slide down` `slide left` `slide right` _(omit = cut-in)_

**`motion` syntax:**
```
motion: pan down to:0.85
motion: zoom from:1.0 to:1.2
motion: zoom from:1.0 to:1.3 origin:top
motion: fade
motion: cut
```

Multiple motions (space-separated lines under `motion:`):
```
motion:
  - zoom from:1.0 to:1.12
  - pan up to:0.3
```

**`elements` syntax:**
```
- <element-type> "<label>" [data-fields...] at:<seconds>s pos:<cx>,<cy> size:<w>x<h>
  effect: <effect-type> [effect-fields...]
```

See [Element types](#element-types) and [Effects](#effects) below.

**`overlays` syntax:**
```
overlays:
  - vignette intensity:0.5
  - film-grain opacity:0.08
  - lens-flare x:540 y:200 color:#fff startAt:0s duration:0.4s
  - color-grade tint:#001133 opacity:0.2
  - light-leak color:#ff9933 direction:right startAt:0s duration:1.2s
```

Overlay names map to `core:<name>`. See [Overlays](#overlays) for all params.

**`koFinish`** _(project-specific: example project only)_
```
koFinish: "WORD" sub:"subtitle" at:2.5s
```

---

### `slideshow`

Multiple images with horizontal swipe between them.

```
--- SCENE 3 ---
type: slideshow
duration: 5s
assets:
  - screen1
  - screen2
  - screen3
preset: slow-pan-up
enter: slide right
motion: pan down to:0.9
overlays:
  - vignette intensity:0.3
transition: fade
```

Each image gets `duration / count` seconds. Swipe transition is 0.35s.

---

### `chips` _(project-specific: example project)_

Elements radiating from center.

```
--- SCENE 4 ---
type: chips
duration: 4.2s
layout: radial-spoke
items:
  - pill "Ghost Type" emoji:👻 color:#a78bfa size:260x80
  - pill "Water Type" emoji:💧 color:#38bdf8 size:260x80
  - pill "Fire Type" emoji:🔥 color:#ef4444 size:260x80
stamp: "everyone has a [accent]type.[/accent]" at:3.0s
transition: cut
```

**`layout` values:** `radiate` `radial-spoke`

**`stamp` syntax:** plain or inline `[accent]word[/accent]`

---

### `lockup` _(project-specific: example project)_

Branding end card. Words slam in, logo scales, subtitle slides.

```
--- SCENE 5 ---
type: lockup
duration: 2.5s
hook: "your closing hook"
name: "App Name"
sub: "Your tagline here"
```

---

## Element types

Used in `screenshot` scenes under `elements:`.

```
- <type> "<label>" [data fields] at:<s>s pos:<cx>,<cy> size:<w>x<h>
```

### `pill`

Rounded label with optional emoji.

```
- pill "Red Flag" emoji:🚩 color:#ef4444 at:1.2s pos:540,900 size:400x80
```

| Field   | Description                  |
|---------|------------------------------|
| label   | Text inside the pill         |
| emoji   | Optional emoji prefix        |
| color   | Background color (hex)       |
| at      | Seconds from scene start     |
| pos     | Center x,y in stage px       |
| size    | Width x height in px         |

### `text`

Plain text label. Use this to layer multiple text overlays on a scene manually — one element per line of text.

```
- text "GINZA LINE" at:0.5s pos:540,200 size:600x60 fontSize:36 color:#ffffff fontWeight:700
- text "UENO-HIROKOJI" at:0.8s pos:540,380 size:900x160 fontSize:140 color:#60d4f7 fontWeight:900
- text "銀座線" at:1.0s pos:540,560 size:400x60 fontSize:40 color:#aaaaaa fontWeight:400
```

| Field        | Description                                    |
|--------------|------------------------------------------------|
| value        | The text string (quoted, first positional arg) |
| at           | Seconds from scene start                       |
| pos          | Center x,y in stage px                        |
| size         | Width x height in px                           |
| fontSize     | Font size in px (default: h × 0.5)            |
| color        | Text color hex (default: #ffffff)             |
| fontWeight   | Font weight (default: 800)                    |

**Multiple text overlays** — place as many `text` elements as needed on the same scene. Each has its own `at:` time, position, and size. Combine with `stagger-in` to bring them in sequentially:

```
- text "DEPARTMENT-STORE" at:1s pos:960,640 size:700x60 fontSize:38 color:#ffffff
  effect: stagger-in delay:0s enter:fade
- text "BACKROOMS" at:1s pos:960,760 size:1100x160 fontSize:140 color:#ffffff fontWeight:900
  effect: stagger-in delay:0.15s enter:slide-up
- text "ENERGY" at:1s pos:960,870 size:500x50 fontSize:34 color:#aaaaaa
  effect: stagger-in delay:0.25s enter:fade
```

---

## Effects

Applied to elements via indented `effect:` lines.

```
- pill "Label" ... at:1s pos:540,900 size:400x80
  effect: pop-in
  effect: bloom color:#ef4444 delay:0.3s
  effect: tap-ring color:#9d5cff count:5
  effect: typewriter speed:12 cursor:true
  effect: stagger-in delay:0.08s enter:scale
```

| Effect | Params |
|--------|--------|
| `pop-in` | `overshoot:<n>` (default 2.2) |
| `bloom` | `color:<hex>` `delay:<s>` `duration:<s>` `maxScale:<n>` `maxBlur:<px>` `peakAt:<0-1>` |
| `tap-ring` | `color:<hex>` `count:<n>` `stagger:<s>` `ringDuration:<s>` `maxScale:<n>` `thickness:<px>` |
| `typewriter` | `unit:char\|word` `speed:<n>` `cursor:true\|false` `cursorColor:<hex>` |
| `stagger-in` | `delay:<s>` (required) `enter:fade\|scale\|slide-up\|slide-down` `duration:<s>` (default 0.3) |

**Stagger groups** — assign the same `at:` to all shapes and increment `delay` by a fixed interval (e.g. 0.08s) per element. The effect handles hiding the element until its delay has passed.

```
- circle at:1s pos:100,200 size:40x40
  effect: stagger-in delay:0s enter:scale
- pill at:1s pos:220,300 size:60x20
  effect: stagger-in delay:0.08s enter:scale
- circle at:1s pos:350,150 size:30x30
  effect: stagger-in delay:0.16s enter:slide-up
```

---

## Overlays

Fullscreen effects on a scene. Written as shorthand (no `core:` prefix needed in `.rcs`).

| Name | Params |
|------|--------|
| `vignette` | `intensity:<0-1>` `color:<hex>` `shape:ellipse\|rect` |
| `film-grain` | `opacity:<0-1>` `size:<px>` `animated:true\|false` |
| `lens-flare` | `x:<px>` `y:<px>` `color:<hex>` `intensity:<0-1>` `startAt:<s>` `duration:<s>` |
| `color-grade` | `tint:<hex>` `opacity:<0-1>` `mode:<blend-mode>` `saturation:<0-2>` `contrast:<0-2>` |
| `light-leak` | `color:<hex>` `opacity:<0-1>` `direction:left\|right\|top\|bottom` `startAt:<s>` `duration:<s>` |
| `confetti` | `count:<n>` `origin:top\|sides\|corners` `startAt:<s>` `duration:<s>` `gravity:<n>` `spread:<0-1>` |

---

## Presets

Presets bundle motion + overlays + enter for `screenshot` and `slideshow` scenes. Explicit fields override preset values.

| id | category | duration | motion | overlays |
|----|----------|----------|--------|---------|
| `ken-burns` | cinematic | 4s | zoom 1.0→1.12 + pan up 0.3 | vignette 0.4 |
| `dramatic-zoom` | dramatic | 3s | zoom 1.0→1.3 | vignette 0.6 + grain 0.06 |
| `slow-pan-up` | cinematic | 4s | pan down 0.8 | vignette 0.35 |
| `push-in` | social | 3s | zoom 1.0→1.18 | — |
| `film` | cinematic | 4s | zoom 1.02→1.1 | grain 0.12 + vignette + light-leak |
| `cold-open` | dramatic | 2.5s | zoom 1.05→1.2 top | dark vignette + color-grade |

---

## Timing rules

- `duration` is the full clip duration including enter animation.
- `at` on elements is seconds from scene start (not from enter end).
- `stamp.at` and `koFinish.at` are seconds from scene start.
- Keep `at` values at least `0.5s` before `duration` to avoid cutoff.
- `TOTAL` at end of file = sum of all scene durations (not accounting for transition overlap).

---

## Full example

```
ROUGHCUT SCREENPLAY v1
project: example
fps: 30
dimensions: 1080x1920

--- SCENE 1 ---
type: text
duration: 1.5s
lines:
  - "everyone's been" [accent]
  - "ghosted."
  enter: slide-up
transition: cut

--- SCENE 2 ---
type: screenshot
duration: 3s
asset: profile
preset: ken-burns
elements:
  - pill "Ghost Type" emoji:👻 color:#a78bfa at:1.2s pos:540,1200 size:400x80
    effect: pop-in
    effect: bloom color:#a78bfa delay:0.3s
overlays:
  - vignette intensity:0.4
transition: cut

--- SCENE 3 ---
type: chips
duration: 4.2s
layout: radial-spoke
items:
  - pill "Ghost Type" emoji:👻 color:#a78bfa size:260x80
  - pill "Red Flag" emoji:🚩 color:#ef4444 size:260x80
  - pill "Situationship" emoji:💀 color:#6b7280 size:320x80
  - pill "Soft Launch" emoji:🌸 color:#f472b6 size:280x80
stamp: "everyone has a [accent]type.[/accent]" at:3.0s
transition: cut

--- SCENE 4 ---
type: lockup
duration: 2.5s
hook: "know yours."
name: "Dex"
sub: "the dating decoder"

TOTAL: 11.2s
```
