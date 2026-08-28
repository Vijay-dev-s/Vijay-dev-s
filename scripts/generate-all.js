#!/usr/bin/env node
'use strict';
/**
 * Renders EVERY theme x mode combination (16 SVGs total: 7 weekdays + birthday, x day/night).
 * Use this to eyeball every theme without waiting for the calendar/clock.
 *   node scripts/generate-all.js
 * Output: assets/hero/hero-<theme>-<mode>.svg for all 16 combinations,
 * plus assets/hero/preview.html to view them all in a browser at once.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'themes.json'), 'utf8'));
const { generateHero } = require('./lib/svg-hero');

const heroDir = path.join(ROOT, 'assets', 'hero');
fs.mkdirSync(heroDir, { recursive: true });

const rows = [];
for (const key of Object.keys(config.themes)) {
  const theme = config.themes[key];
  for (const mode of ['day', 'night']) {
    const svg = generateHero(theme, mode, config.identity);
    const filename = `hero-${key}-${mode}.svg`;
    fs.writeFileSync(path.join(heroDir, filename), svg, 'utf8');
    rows.push({ key, themeName: theme.themeName, mode, filename });
    console.log(`wrote ${filename}`);
  }
}

const preview = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Theme Preview — all 16 combinations</title>
<style>body{background:#111;font-family:sans-serif;color:#eee;padding:2rem;}
h2{margin-top:2.5rem;border-bottom:1px solid #333;padding-bottom:.4rem}
img{width:100%;max-width:1000px;display:block;margin:.6rem 0;border-radius:10px}
.label{font-size:.8rem;opacity:.6;font-family:monospace}</style></head><body>
<h1>All theme × mode combinations</h1>
${rows.map(r => `<h2>${r.themeName} — ${r.mode}</h2><div class="label">${r.filename}</div><img src="${r.filename}"/>`).join('\n')}
</body></html>`;
fs.writeFileSync(path.join(heroDir, 'preview.html'), preview, 'utf8');
console.log(`\nwrote assets/hero/preview.html — open it in a browser to see all 16 themes at once`);
