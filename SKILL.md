---
name: roughcut-video-engine
description: Remotion-based short-form vertical video engine. Build videos from a scene DSL - collect assets, propose a scene breakdown, refine, then generate TypeScript specs for Remotion Studio preview and export.
license: MIT
compatibility: Requires Node.js, npm install run, and Remotion Studio available via `npm run preview`
metadata:
    skill-author: ikouchiha47
---

# Roughcut Video Engine

## Overview

Roughcut is a Remotion-based engine for building short-form vertical videos (9:16) from a declarative scene spec (TypeScript DSL). You write a spec, preview it live in Remotion Studio, and export.

Scene types: `text`, `screenshot`, `slideshow`, `chips`, `lockup`.

Built-in overlays: `core:vignette`, `core:film-grain`, `core:lens-flare`, `core:color-grade`, `core:light-leak`, `core:confetti`.

Full overlay reference: `references/overlay-api.md`.

## Workflow

```mermaid
flowchart TD
    A(["Start"]) --> R["Stage 0: Research<br/>Fetch URLs, screenshot pages<br/>Write research.yaml"]
    R --> B["Stage 1: Collect<br/>Download all assets locally<br/>Write assets.yaml"]
    B --> C["Stage 2: Understand<br/>Ask all 5 brief questions"]
    C --> G0{"Anti-fabrication<br/>gate"}
    G0 -- "Claims not backed" --> C
    G0 -- "All claims verified" --> D["Stage 3: Propose<br/>Output .rcs screenplay(s)"]
    D --> E{"Approved?"}
    E -- No --> F["Stage 4: Refine<br/>Revise full screenplay"]
    F --> E
    E -- Yes --> G["Stage 5a: Build scenes 1-2<br/>Screenshot preview"]
    G --> H{"Visual OK?"}
    H -- No --> G
    H -- Yes --> I["Stage 5b: Build remaining scenes"]
    I --> J["Full preview check"]
    J --> K{"Done?"}
    K -- "No, changes needed" --> I
    K -- Yes --> Z(["Done"])
```

## When to Use This Skill

Use this skill when the user wants to:
- Create a new short-form video (social, app demo, ad, launch clip)
- Add scenes or edit an existing video spec
- Add a new preset, effect, element, or overlay to the engine
- Understand what scene types or fields are available
- Bootstrap a new project inside `src/projects/`

Trigger phrases: "make a video", "create a video", "add a scene", "build a spec", "collect assets", "preview video", "add preset", "add effect", "here's the Play Store link", "research this app", "use this URL".

---

## Core Capabilities

### 0. Research (Stage 0)

Run this when the user gives you URLs — Play Store listing, website, landing page, Twitter/X profile, GitHub repo — instead of (or before) handing you assets directly.

**Goal:** build a factual product brief from public sources so Stage 2 questions have real answers, not guesses.

**Steps:**

**Step 1 — Fetch raw content**

For each URL, try a plain fetch first:
```bash
curl -sL "<url>" -o research/raw/<key>.html
```

If the page is JS-heavy (Play Store, SPAs) or you need a visual, screenshot with Chrome headless:
```bash
google-chrome --headless \
  --screenshot=research/<key>.png \
  --window-size=1280,900 \
  "<url>"
```
If `google-chrome` is not in PATH try `chromium`, `chromium-browser`. If none available, note it and continue — text fetch is enough.

For Play Store URLs, extract from HTML: app name, developer, short description, long description, rating, screenshot `<img>` tags.

Download product screenshots and icon:
```bash
node scripts/collect-assets.js --dest public/<project>/research --manifest src/projects/<project>/research.yaml \
  --name icon --src <icon-url> \
  --name screen1 --src <screenshot-url-1>
```

---

**Step 2 — Generate hypothetical brief (HyDE)**

Before writing `research.yaml`, write out what you *believe* is true about the product based on the raw content. Be explicit. Use this format:

```
HYPOTHETICAL BRIEF:
- Name: <what you read>
- Tagline: <what you read>
- Core feature 1: <claim>
- Core feature 2: <claim>
- Target audience: <claim>
- Pricing: <claim>
- Platform: <claim>
```

---

**Step 3 — Validate each claim with a test**

For every claim in the hypothetical brief, run a simple test against the raw content:

| Claim | Test | Result |
|-------|------|--------|
| "supports offline mode" | `grep -i "offline" research/raw/<key>.html` | PASS / FAIL |
| "free tier available" | `grep -i "free\|pricing\|\$0" research/raw/<key>.html` | PASS / FAIL |
| "available on iOS" | check for App Store link in raw HTML | PASS / FAIL |
| tagline text | exact string match against `og:title` or `h1` | PASS / FAIL |

For screenshot-only claims (UI features visible in images but not in HTML text), mark as `VISUAL — needs user confirmation`.

---

**Step 4 — Write `research.yaml` with verification status**

```yaml
source: <url>
name: <app or product name>
tagline: <og:title or first h1>
description: <meta description or first paragraph>
features:
  - text: "offline support"
    verified: true
    evidence: "found 'offline' in raw HTML line 342"
  - text: "free tier"
    verified: false
    evidence: "no pricing text found in HTML — needs user confirmation"
assets:
  icon: public/<project>/research/icon.png
  screen1: public/<project>/research/screen1.png
raw: research/raw/<key>.html
```

---

**Step 5 — Surface unverified claims to user**

Show verified claims as confirmed. For each `verified: false` claim:
```
UNVERIFIED: "free tier available"
  Could not find pricing evidence in the fetched page.
  a) Confirm this is true
  b) Correct it: ___
  c) Remove it
```

Do not proceed to Stage 1 until all claims are either verified or user-resolved.

Trigger phrases: "here's the Play Store link", "use this URL", "research this app", "look at this website".

---

### 0b. Anti-Fabrication Gate (between Stage 2 and Stage 3)

Before proposing any screenplay, run this checklist. If any item fails, stop and ask the user — do not invent answers.

This gate enforces that the screenplay only contains what Stage 0 verified or the user explicitly confirmed. It is a diff between "what I want to write" and "what I know is true."

**Before writing any screenplay, generate a claim list for it:**

```
SCREENPLAY CLAIMS:
- Scene 1 copy: "Track anything, anywhere" → source?
- Scene 2 feature: offline sync → source?
- Scene 3 CTA: "Free forever" → source?
- Assets used: screen1, screen2 → in assets.yaml?
```

**Then check each claim against `research.yaml`:**

- If `verified: true` in research.yaml → ✓ proceed
- If user confirmed in Stage 2 → ✓ proceed  
- If neither → BLOCK and surface:

```
FABRICATION RISK: Scene 3 copy "Free forever"
  Not found in research.yaml and not confirmed by user.
  Options:
    a) Confirm this is the actual CTA
    b) Replace with verified copy: "<copy from research>"
    c) Remove the scene
```

Do not write the screenplay until every claim has a source. Silence is not confirmation.

---

### 1. Collect Assets (Stage 1)

All assets — images **and fonts** — must be local before any spec is written. Never skip this.

**Ask the user:**
- What images/screenshots do they have? (URLs, local paths, anything)
- What key/name to give each one (used as filename and manifest key)
- What font they want (default: Space Grotesk)

**Run for images:**
```bash
node scripts/collect-assets.js \
  --dest     public/<project> \
  --manifest src/projects/<project>/assets.yaml \
  --name <key> --src <url-or-path> \
  [--name <key2> --src <path2> ...]
```

**Download fonts locally (always — never use `type: 'google'` in specs):**

```bash
# Let the script resolve the woff2 URL via Google Fonts API:
node scripts/download-fonts.cjs "Space Grotesk" "400,700,800,900"
node scripts/download-fonts.cjs "Inter"

# Or pass the woff2 URL directly (preferred when you already have it):
node scripts/download-fonts.cjs "Inter" --url "https://fonts.gstatic.com/s/inter/v13/..."
```

To find a direct woff2 URL, fetch the Google Fonts CSS and extract it:
```bash
curl -sA "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=block" \
  | grep -oE "https://fonts\.gstatic\.com[^)]+"
```

The script skips download if the file is already cached in `public/fonts/`. It prints the exact `fonts:` entry to paste into your spec:

```ts
fonts: [
  { type: 'file', family: 'Space Grotesk', path: 'fonts/SpaceGrotesk.woff2' },
],
```

Show the resulting `assets.yaml`. Do not proceed until all assets and fonts are confirmed local.

---

### 2. Understand the Brief (Stage 2)

Read `assets.yaml` and look at each asset. Then ask all five questions - do not skip any:

1. **What is this video for?** (app launch, ad, demo, social post - platform and goal)
2. **Who is watching?** (existing users, cold audience, investors - what do they already know)
3. **What should they feel at the end?** (convinced, curious, entertained, informed)
4. **Is there a hook line?** (the first thing they read - help them write one if not)
5. **Is there a closing line?** (what the video ends on)

Do not propose a scene breakdown until you have all five answers. They determine scene order, pacing, and tone.

---

### 3. Propose Screenplay(s) (Stage 3)

Output one or more `.rcs` screenplays — not a table, not TypeScript. The screenplay is the review artifact.

Read `references/rcs-format.md` for the full format spec before writing.

**If the user asks for one screenplay**, output it directly:

```
ROUGHCUT SCREENPLAY v1
project: my-app
fps: 30
dimensions: 1080x1920

--- SCENE 1 ---
type: text
duration: 1.5s
...

TOTAL: 9s
```

**If the user asks for two or more**, label and separate them:

```
== SCREENPLAY A: Fast Cut ==

ROUGHCUT SCREENPLAY v1
...

TOTAL: 8s

---

== SCREENPLAY B: Slow Drift ==

ROUGHCUT SCREENPLAY v1
...

TOTAL: 13s
```

Below the screenplay(s) state:
- Intended pacing per option
- Any assumptions made (e.g. "assumed 30fps", "used ken-burns as default preset")

Stop here. Wait for the user to pick a screenplay and explicitly approve it. Silence is not approval.

---

### 4. Refine (Stage 4 - loop)

Take feedback. Output the full revised screenplay each time - not just changed scenes.

Keep iterating until the user explicitly approves. "Looks good", "yes", "go", "ship it". Silence is not approval.

---

### 5a. Build First 1-2 Scenes + Screenshot (Stage 5a)

Only after explicit approval of a screenplay.

1. Read `references/scene-types.md`
2. Read `references/rcs-format.md`
3. For each scene type used, read the source in `src/platform/scenes/` — source is authoritative over docs
4. Read `templates/new-spec.ts`
5. **Verify fonts are local** before writing the spec — check `public/fonts/` and download any missing ones (see Stage 1 font instructions). Never write `type: 'google'` in a spec.
6. Write `src/projects/<project>/specs/<name>.ts` with **scenes 1-2 only**
6. Add the composition to `src/projects/<project>/index.ts`
7. Ensure Remotion Studio is running:
   ```bash
   npm run preview
   # -> http://localhost:3000
   ```
8. Take a screenshot of the preview using the best available method:

   **Chrome headless** (preferred, if `--chrome` flag passed or `google-chrome`/`chromium` is in PATH):
   ```bash
   google-chrome --headless --screenshot=preview.png --window-size=324,576 http://localhost:3000
   ```

   **macOS** (`screencapture`):
   ```bash
   sleep 2 && screencapture -x preview.png
   ```

   **Linux** (`scrot` or `import`):
   ```bash
   sleep 2 && scrot preview.png
   # or
   sleep 2 && import -window root preview.png
   ```

   Show the screenshot to the user. Ask: does this look right? Fix and re-screenshot until they say yes.

---

### 5b. Build Remaining Scenes (Stage 5b)

Only after visual approval of scenes 1-2.

1. Add the remaining scenes to the spec
2. Screenshot again using the same method as Stage 5a
3. Ask for final feedback
4. Repeat until done

After every spec edit, always tell the user what changed and ask them to check the preview.

---

### 6. Bootstrap a New Project

```bash
# Copy the example project
cp -r src/projects/example src/projects/<your-project>

# Register it
echo '"<your-project>"' >> projects.json  # add to the array

# Sync (auto-generates Root.tsx imports)
node scripts/sync-projects.cjs

# Preview
npm run preview
```

---

## Scene Type Quick Reference

| Type | Use for |
|------|---------|
| `text` | Bold lines animating in independently |
| `screenshot` | Single image with camera motion + element overlays |
| `slideshow` | Multiple images with horizontal swipe |
| `chips` | Elements radiating from center (radiate / radial-spoke) |
| `lockup` | Branding end card - word slam + logo |

Full field reference: `references/scene-types.md`
Screenplay format: `references/rcs-format.md`

---

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/research` | Stage 0 - fetch URLs, screenshot pages, write research.yaml |
| `/collect-assets` | Stage 1 - download/copy assets, write assets.yaml |
| `/make-video` | Stages 2-5 in one go when assets are already local |
| `/add-preset` | Register a new named camera/atmosphere preset |
| `/add-effect` | Implement a new per-element visual effect |

---

## Reference Files

| File | What it covers |
|------|---------------|
| `references/rcs-format.md` | Roughcut Screenplay (.rcs) format - scene types, elements, effects, overlays |
| `references/scene-types.md` | TypeScript SceneSpec variants with all fields |
| `references/motion-api.md` | Motion types, compose system, motion registry |
| `references/effect-api.md` | Effect types, EffectFn signature, registry |
| `references/preset-api.md` | Preset type, built-in presets, how to add one |
| `references/element-api.md` | Element types, ElementRenderer interface, registry |
| `references/overlay-api.md` | SceneOverlay types, overlay registry, built-in list |

## Templates

| File | Use for |
|------|---------|
| `templates/new-spec.ts` | New video spec for an existing project |
| `templates/new-project.ts` | Bootstrapping a brand new project folder |

## Extension Guides

Each `src/platform/*/agents.md` describes what that directory does and how to extend it. Read before touching that directory.
