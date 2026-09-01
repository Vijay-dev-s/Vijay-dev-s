#!/usr/bin/env node
'use strict';
/**
 * Regenerates THIS repository's own profile README, based on the theme
 * that is currently active in Asia/Kolkata time.
 *
 * This script is repo-local by design: ROOT is always "the folder this
 * script's parent sits in" — i.e. wherever this file has been deployed,
 * ROOT is that repo's root. It never knows or cares whether it's running
 * inside the GitHub repo or the GitLab repo, so it can never accidentally
 * create a nested github-profile/github-profile/ style folder.
 *
 * Usage:
 *   node scripts/generate.js                       # auto: current IST time
 *   node scripts/generate.js --theme=friday --mode=night   # manual test override
 *   node scripts/generate.js --theme=birthday --mode=day   # test birthday theme
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'themes.json'), 'utf8'));
const repoConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'repo.config.json'), 'utf8'));
const { resolveActiveTheme } = require('./lib/time');
const { generateHero } = require('./lib/svg-hero');
const { projectCard, featuredProject, timeline, techStack, statsPanel, currentlyPanel } = require('./lib/svg-components');
const { assembleReadme } = require('./lib/markdown');

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

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

  const theme = config.themes[themeKey];
  if (!theme) throw new Error(`Unknown theme key "${themeKey}". Valid: ${Object.keys(config.themes).join(', ')}`);
  if (mode !== 'day' && mode !== 'night') throw new Error(`Mode must be "day" or "night", got "${mode}"`);

  console.log(`[generate:${repoConfig.platform}] theme="${themeKey}" mode="${mode}" isBirthday=${resolved.isBirthday} weekday(IST)=${resolved.weekday} time(IST)=${resolved.ist.hour}:${String(resolved.ist.minute).padStart(2, '0')}`);

  const c = { ...theme[mode], panelStyle: theme.panelStyle };
  const { content } = config;

  // ── Hero banner (theme-specific layout) ──
  const heroDir = path.join(ROOT, 'assets', 'hero');
  fs.mkdirSync(heroDir, { recursive: true });
  const heroFilename = `hero-${themeKey}-${mode}.svg`;
  fs.writeFileSync(path.join(heroDir, heroFilename), generateHero(theme, mode, config.identity), 'utf8');

  // ── Reusable visual components, recolored for this theme/mode ──
  const panelDir = path.join(ROOT, 'assets', 'panels');
  fs.mkdirSync(panelDir, { recursive: true });
  const write = (name, svg) => { fs.writeFileSync(path.join(panelDir, name), svg, 'utf8'); return `assets/panels/${name}`; };

  const paths = {};
  paths.hero = `assets/hero/${heroFilename}`;
  paths.featured = write(`featured-${themeKey}-${mode}.svg`, featuredProject(content.projects[0], c));
  paths.projects = content.projects.slice(1).map((p, i) =>
    write(`project-${slug(p.name)}-${themeKey}-${mode}.svg`, projectCard(p, c)));
  const orientation = theme.timelineOrientation || 'horizontal';
  paths.timeline = write(`timeline-${themeKey}-${mode}.svg`, timeline(content.experience, c, orientation));
  paths.techStack = write(`techstack-${themeKey}-${mode}.svg`, techStack(content.techGroups, c));
  paths.stats = write(`stats-${themeKey}-${mode}.svg`, statsPanel(content.stats, c));
  paths.currently = write(`currently-${themeKey}-${mode}.svg`, currentlyPanel(
    [{ label: 'Building', text: content.currentlyBuilding }], c
  ));
  paths.coreFocus = write(`corefocus-${themeKey}-${mode}.svg`, currentlyPanel(
    content.coreFocus, c
  ));

  console.log(`[generate] wrote ${Object.keys(paths).length} component groups to assets/hero + assets/panels`);

  const readme = assembleReadme(theme, mode, config, paths, repoConfig.platform);
  fs.writeFileSync(path.join(ROOT, 'README.md'), readme, 'utf8');
  console.log(`[generate] wrote README.md`);
}

main();
