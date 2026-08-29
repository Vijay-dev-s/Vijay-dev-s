#!/usr/bin/env node
'use strict';
/**
 * Renders EVERY theme x mode combination (16 states) into
 * assets/previews/<key>-<mode>/README.md + its own component SVGs,
 * plus a top-level gallery.html to eyeball every hero side by side.
 *   node scripts/generate-all.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'themes.json'), 'utf8'));
const { generateHero } = require('./lib/svg-hero');
const { projectCard, featuredProject, timeline, techStack, statsPanel, currentlyPanel } = require('./lib/svg-components');
const { assembleReadme } = require('./lib/markdown');

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

const previewRoot = path.join(ROOT, 'assets', 'previews');
fs.mkdirSync(previewRoot, { recursive: true });

const rows = [];
for (const key of Object.keys(config.themes)) {
  const theme = config.themes[key];
  for (const mode of ['day', 'night']) {
    const c = theme[mode];
    const dir = path.join(previewRoot, `${key}-${mode}`);
    fs.mkdirSync(path.join(dir, 'assets', 'hero'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'assets', 'panels'), { recursive: true });
    const write = (sub, name, svg) => { fs.writeFileSync(path.join(dir, 'assets', sub, name), svg, 'utf8'); return `assets/${sub}/${name}`; };

    const paths = {};
    paths.hero = write('hero', `hero-${key}-${mode}.svg`, generateHero(theme, mode, config.identity));
    paths.featured = write('panels', `featured.svg`, featuredProject(config.content.projects[0], c));
    paths.projects = config.content.projects.slice(1).map(p => write('panels', `project-${slug(p.name)}.svg`, projectCard(p, c)));
    const orientation = theme.timelineOrientation || 'horizontal';
    paths.timeline = write('panels', `timeline.svg`, timeline(config.content.experience, c, orientation));
    paths.techStack = write('panels', `techstack.svg`, techStack(config.content.techGroups, c));
    paths.stats = write('panels', `stats.svg`, statsPanel(config.content.stats, c));
    paths.currently = write('panels', `currently.svg`, currentlyPanel(
      [{ label: 'Building', text: config.content.currentlyBuilding }, { label: 'Focus', text: theme.quote.short }], c
    ));

    const readme = assembleReadme(theme, mode, config, paths, 'preview', true);
    fs.writeFileSync(path.join(dir, 'README.md'), readme, 'utf8');

    rows.push({ key, mode, themeName: theme.themeName, layout: theme.layout, dir: `assets/previews/${key}-${mode}` });
    console.log(`wrote ${dir.replace(ROOT + '/', '')}/README.md (+ ${2 + paths.projects.length + 3} SVGs)`);
  }
}

const gallery = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>16-state preview</title>
<style>body{background:#111;font-family:sans-serif;color:#eee;padding:2rem;}
h2{margin-top:2.5rem;border-bottom:1px solid #333;padding-bottom:.4rem}
img{width:100%;max-width:1000px;display:block;margin:.6rem 0;border-radius:10px}
.meta{font-size:.8rem;opacity:.6;font-family:monospace}</style></head><body>
<h1>All 16 theme × mode states — hero preview</h1>
<p>Full composed READMEs are in each <code>assets/previews/&lt;key&gt;-&lt;mode&gt;/README.md</code> folder.</p>
${rows.map(r => `<h2>${r.themeName} — ${r.mode}</h2><div class="meta">layout: ${r.layout} · ${r.dir}/README.md</div><img src="${r.dir}/assets/hero/hero-${r.key}-${r.mode}.svg"/>`).join('\n')}
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'assets', 'previews', 'gallery.html'), gallery, 'utf8');
console.log(`\nwrote assets/previews/gallery.html — open it in a browser to see all 16 heroes at once`);
console.log(`Each assets/previews/<key>-<mode>/README.md is the FULL composed page for that state.`);
