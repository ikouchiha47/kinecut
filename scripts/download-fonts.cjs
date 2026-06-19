#!/usr/bin/env node
// Downloads a font as a local woff2 file into public/fonts/.
//
// Usage (Google Fonts lookup):
//   node scripts/download-fonts.cjs "Space Grotesk"
//   node scripts/download-fonts.cjs "Inter" "400,700,900"
//
// Usage (direct URL — agent provides the woff2 URL directly):
//   node scripts/download-fonts.cjs "Inter" --url "https://fonts.gstatic.com/s/inter/..."
//   node scripts/download-fonts.cjs "MyFont" --url "https://example.com/myfont.woff2"
//
// Output: public/fonts/<FontName>.woff2
// Use in specs as: { type: 'file', family: 'Inter', path: 'fonts/Inter.woff2' }

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const ROOT      = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(ROOT, 'public', 'fonts');

fs.mkdirSync(FONTS_DIR, { recursive: true });

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = Object.assign(new URL(url), { headers });
    https.get(opts, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ── Resolve woff2 URL from Google Fonts CSS API ───────────────────────────────

async function resolveWoff2Url(family, weights) {
  const weightStr = (weights ?? [400, 700, 800, 900]).map(w => `0,${w}`).join(';');
  const apiUrl    = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightStr}&display=block`;

  const { status, body } = await get(apiUrl, {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  if (status !== 200) throw new Error(`Google Fonts API returned ${status} for "${family}"`);

  const css     = body.toString('utf8');
  const matches = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)];
  if (!matches.length) throw new Error(`No woff2 URL found in Google Fonts CSS for "${family}"`);

  // Prefer variable font (largest/most general); just take the first unique URL.
  return matches[0][1];
}

// ── Download a woff2 to public/fonts/<Slug>.woff2 ────────────────────────────

function slug(family) {
  return family.replace(/\s+/g, '');
}

async function ensureFont(family, { weights, url } = {}) {
  const dest = path.join(FONTS_DIR, `${slug(family)}.woff2`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000) {
    console.log(`  [fonts] "${family}" already cached → fonts/${slug(family)}.woff2`);
    return dest;
  }

  const woff2Url = url ?? await resolveWoff2Url(family, weights);
  process.stdout.write(`  [fonts] Downloading "${family}" from ${woff2Url} … `);
  const { status, body } = await get(woff2Url);
  if (status !== 200) throw new Error(`woff2 fetch returned ${status}`);
  fs.writeFileSync(dest, body);
  console.log(`${body.length} bytes → fonts/${slug(family)}.woff2`);
  return dest;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2);
  const family = args[0];

  if (!family) {
    console.error('Usage:');
    console.error('  node scripts/download-fonts.cjs "<Font Family>" ["400,700,900"]');
    console.error('  node scripts/download-fonts.cjs "<Font Family>" --url "<woff2-url>"');
    process.exit(1);
  }

  const urlFlagIdx = args.indexOf('--url');
  const url        = urlFlagIdx !== -1 ? args[urlFlagIdx + 1] : undefined;
  const weights    = (!url && args[1] && !args[1].startsWith('--'))
    ? args[1].split(',').map(w => parseInt(w.trim(), 10))
    : [400, 700, 800, 900];

  try {
    const dest = await ensureFont(family, { weights, url });
    const rel  = path.relative(ROOT, dest);
    console.log(`\nUse in your spec:`);
    console.log(`  { type: 'file', family: '${family}', path: '${rel.replace('public/', '')}' }`);
  } catch (e) {
    console.error(`[fonts] FAILED: ${e.message}`);
    process.exit(1);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
