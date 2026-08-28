#!/usr/bin/env node
'use strict';
/**
 * Regenerates the profile README for GitHub and/or GitLab based on the
 * theme that is currently active in Asia/Kolkata time.
 *
 * Usage:
 *   node scripts/generate.js                 # auto: current IST time
 *   node scripts/generate.js --theme=friday --mode=night   # manual test override
 *   node scripts/generate.js --theme=birthday --mode=day   # test birthday theme
 *   node scripts/generate.js --target=github  # only regenerate github-profile/
 *   node scripts/generate.js --target=gitlab  # only regenerate gitlab-profile/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'themes.json'), 'utf8'));
const { resolveActiveTheme } = require('./lib/time');
const { generateHero } = require('./lib/svg-hero');
const { assembleReadme } = require('./lib/markdown');

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  const resolved = resolveActiveTheme(config);

  const themeKey = args.theme || resolved.themeKey;
  const mode = args.mode || resolved.mode;
  const target = args.target || 'all'; // all | github | gitlab

  const theme = config.themes[themeKey];
  if (!theme) throw new Error(`Unknown theme key "${themeKey}". Valid: ${Object.keys(config.themes).join(', ')}`);
  if (mode !== 'day' && mode !== 'night') throw new Error(`Mode must be "day" or "night", got "${mode}"`);

  console.log(`[generate] resolved -> theme="${themeKey}" mode="${mode}" isBirthday=${resolved.isBirthday} weekday(IST)=${resolved.weekday} time(IST)=${resolved.ist.hour}:${String(resolved.ist.minute).padStart(2, '0')}`);

  // 1. Write the hero SVG (shared asset, referenced by both READMEs)
  const svg = generateHero(theme, mode, config.identity);
  const heroDir = path.join(ROOT, 'assets', 'hero');
  fs.mkdirSync(heroDir, { recursive: true });
  const heroFilename = `hero-${themeKey}-${mode}.svg`;
  fs.writeFileSync(path.join(heroDir, heroFilename), svg, 'utf8');
  console.log(`[generate] wrote assets/hero/${heroFilename}`);

  // 2. GitHub profile README (github-profile/Vijay-dev-s repo root)
  if (target === 'all' || target === 'github') {
    const ghDir = ROOT;
    fs.mkdirSync(path.join(ghDir, 'assets', 'hero'), { recursive: true });
    fs.copyFileSync(
      path.join(heroDir, heroFilename),
      path.join(ghDir, 'assets', 'hero', heroFilename)
    );
    const ghReadme = assembleReadme(
      theme,
      mode,
      config,
      `assets/hero/${heroFilename}`,
      'GitHub Actions'
    );
    fs.writeFileSync(path.join(ghDir, 'README.md'), ghReadme, 'utf8');
    console.log(`[generate] wrote README.md`);
  }

  // 3. GitLab profile README (gitlab-profile/coc29042004 repo root)
  if (target === 'all' || target === 'gitlab') {
    const glDir = path.join(ROOT, 'gitlab-profile');
    fs.mkdirSync(glDir, { recursive: true });
    fs.mkdirSync(path.join(glDir, 'assets', 'hero'), { recursive: true });
    fs.copyFileSync(path.join(heroDir, heroFilename), path.join(glDir, 'assets', 'hero', heroFilename));
    const glReadme = assembleReadme(theme, mode, config, `assets/hero/${heroFilename}`, 'GitLab CI');
    fs.writeFileSync(path.join(glDir, 'README.md'), glReadme, 'utf8');
    console.log(`[generate] wrote gitlab-profile/README.md`);
  }
}

main();
