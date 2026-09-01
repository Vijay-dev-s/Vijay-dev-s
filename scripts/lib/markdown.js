'use strict';
/**
 * Each theme's `layout` key picks one of the composer functions below.
 * They all draw from the SAME component images (paths.*) and the SAME
 * identity/content data — what differs is the actual grid: column count,
 * card sizes, what leads, what's de-emphasized. That's what makes this a
 * composition change and not a re-skin.
 *
 * GitHub/GitLab README rendering supports plain HTML tables, <img>, <div
 * align>, <sub>, <details> — no <style>/<script>. Every layout below only
 * uses that safe subset.
 */

function hex(c) { return c.replace('#', ''); }

// Shields.io uses "-" as its field separator, so a literal "-" or "_" in
// label/message text must be escaped or it silently mis-splits the URL —
// this is exactly what breaks a username like "Vijay-dev-s".
function shieldEscape(s) {
  return String(s).replace(/_/g, '__').replace(/-/g, '--').replace(/ /g, '_');
}
function shield(label, value, color, logo) {
  const l = shieldEscape(label);
  const v = shieldEscape(value);
  const logoParam = logo ? `&logo=${logo}&logoColor=white` : '';
  return `https://img.shields.io/badge/${l}-${v}-${hex(color)}?style=for-the-badge${logoParam}`;
}

function img(src, width) {
  return `<img src="${src}" width="${width}" alt=""/>`;
}

function linksRow(identity, c) {
  const gh = identity.github, gl = identity.gitlab;
  return [
    `<div align="center">`,
    ``,
    `[![Portfolio](${shield('Portfolio', 'visit', c.accent)})](${identity.portfolio})`,
    `[![GitHub](${shield('GitHub', gh.username, c.accent, 'github')})](${gh.url})`,
    `[![GitLab](${shield('GitLab', gl.username, c.accent, 'gitlab')})](${gl.url})`,
    `[![LinkedIn](${shield('LinkedIn', 'connect', c.accent, 'linkedin')})](${identity.linkedin})`,
    ``,
    `</div>`,
  ].join('\n');
}

function footer(theme, mode, identity, platform) {
  return [
    `<div align="center">`,
    ``,
    `<sub>${identity.name} · ${identity.role} · <strong>${theme.themeName}</strong> (${mode}) · auto-generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC via ${platform}</sub>`,
    ``,
    `</div>`,
  ].join('\n');
}

function quoteBlock(theme) {
  return [
    `> ${theme.quote.full}`,
    `>`,
    `> — *${theme.quote.attribution}*`,
  ].join('\n');
}

function projectLinksList(projects) {
  return projects.map(p => `**[${p.name} ↗](${p.url})**`).join('  ·  ');
}

// Chunks project-card images into rows of `perRow` so cards never get
// crammed into a narrow column — GitHub's content column is only
// ~800-860px, so 3-per-row was squeezing each card to ~260px (well below
// its native 380px design width) and making every internal font
// effectively tiny. 2-per-row keeps each card close to its native size.
function projectGrid(cardPaths, perRow = 2) {
  const rows = [];
  for (let i = 0; i < cardPaths.length; i += perRow) rows.push(cardPaths.slice(i, i + perRow));
  return `<table width="100%">` + rows.map(row =>
    `<tr>` + row.map(p => `<td width="${Math.floor(100 / row.length)}%">${img(p, '100%')}</td>`).join('') + `</tr>`
  ).join('') + `</table>`;
}

const DIVIDER = `<br/>\n`;

// ── MONDAY · CRIMSON — cinematic, dense, hero-led ─────────────────────────
function split(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), DIVIDER,
    `<table width="100%"><tr>`,
    `<td width="55%" valign="top">\n\n#### ◆ About\n\n${config.content.about}\n\n</td>`,
    `<td width="45%" valign="top">${img(paths.coreFocus, '100%')}</td>`,
    `</tr></table>`, DIVIDER,
    `#### ◆ Projects\n`,
    img(paths.featured, '100%'), DIVIDER,
    projectGrid(paths.projects, 2), DIVIDER,
    `#### ◆ Experience\n`, img(paths.timeline, '100%'), DIVIDER,
    `<table width="100%"><tr><td width="60%">${img(paths.techStack, '100%')}</td><td width="40%">${img(paths.stats, '100%')}</td></tr></table>`,
    DIVIDER, linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── TUESDAY · BLUE — LIQUID GLASS: atmospheric → hero → metrics → panels → featured → timeline → quote → footer
function centered(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    // Atmospheric background lives inside the hero SVG itself (fluid glow layers);
    // everything below is glass-material panels, but each panel earns its place —
    // not every line of text gets boxed in glass.
    `<div align="center">`, img(paths.hero, '100%'), `</div>`, DIVIDER,
    `<div align="center">${img(paths.stats, '92%')}</div>`, DIVIDER,
    `<table width="100%"><tr>`,
    `<td width="50%" valign="top">${img(paths.currently, '100%')}</td>`,
    `<td width="50%" valign="top">${img(paths.coreFocus, '100%')}</td>`,
    `</tr></table>`, DIVIDER,
    `<div align="center">\n\n#### ◆ Featured Work\n\n</div>`,
    `<div align="center">${img(paths.featured, '90%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.timeline, '100%')}</div>`, DIVIDER,
    `<div align="center">\n\n${quoteBlock(theme)}\n\n</div>`, DIVIDER,
    `<div align="center">${img(paths.techStack, '95%')}</div>`, DIVIDER,
    `<sub>${projectLinksList(config.content.projects.slice(1))}</sub>`,
    DIVIDER, linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── WEDNESDAY · GREEN — projects lead everything, quiet profile ───────────
function showcase(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  const allProjects = [paths.featured, ...paths.projects];
  return [
    img(paths.hero, '100%'), DIVIDER,
    `#### ◆ Project Showcase\n`,
    projectGrid(allProjects, 2), DIVIDER,
    `#### ◆ Technical Stack\n`, img(paths.techStack, '100%'), DIVIDER,
    `<table width="100%"><tr>`,
    `<td width="65%" valign="top">\n\n<sub>${config.content.about}</sub>\n\n</td>`,
    `<td width="35%" valign="top">${img(paths.stats, '100%')}</td>`,
    `</tr></table>`,
    DIVIDER, linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── THURSDAY · WHITE — editorial minimalism, single column, restraint ─────
function editorial(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), ``,
    `${config.content.about}`, ``,
    `---`, ``,
    img(paths.featured, '100%'), ``,
    `<sub>${projectLinksList(config.content.projects.slice(1))}</sub>`, ``,
    `---`, ``,
    img(paths.techStack, '100%'), ``,
    img(paths.stats, '70%'), ``,
    `---`, ``,
    linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── FRIDAY · GOLD — grand, asymmetric, achievement-forward ────────────────
function asymmetric(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), DIVIDER,
    `<table width="100%"><tr>`,
    `<td width="68%" valign="top">${img(paths.featured, '100%')}</td>`,
    `<td width="32%" valign="top">${img(paths.stats, '100%')}</td>`,
    `</tr></table>`, DIVIDER,
    `#### ◆ Experience\n`, img(paths.timeline, '100%'), DIVIDER,
    projectGrid(paths.projects, 2), DIVIDER,
    img(paths.techStack, '100%'),
    DIVIDER, linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── SATURDAY · VIOLET — modular 2×2 dashboard grid ─────────────────────────
function dashboard(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), DIVIDER,
    img(paths.currently, '100%'), img(paths.coreFocus, '100%'), DIVIDER,
    `<table width="100%">`,
    `<tr><td width="50%" valign="top">${img(paths.stats, '100%')}</td><td width="50%" valign="top">${img(paths.featured, '100%')}</td></tr>`,
    `</table>`, DIVIDER,
    `#### ◆ Projects\n`, projectGrid(paths.projects, 2), DIVIDER,
    img(paths.techStack, '100%'), DIVIDER,
    img(paths.timeline, '100%'),
    DIVIDER, linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── SUNDAY · BLACK — extreme minimalism, single stacked column ────────────
function stealth(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), ``,
    img(paths.currently, '100%'), img(paths.coreFocus, '100%'), ``,
    img(paths.featured, '100%'), ``,
    `<sub>${projectLinksList(config.content.projects.slice(1))}</sub>`, ``,
    img(paths.techStack, '100%'), ``,
    img(paths.stats, '100%'), ``,
    linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── BIRTHDAY · CYAN — special edition, centered, quote-first ──────────────
function celebration(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    `<div align="center">`, img(paths.hero, '100%'), `</div>`, DIVIDER,
    `<div align="center">\n\n${quoteBlock(theme)}\n\n</div>`, DIVIDER,
    `<div align="center">${img(paths.currently, '85%')}</div>`, `<div align="center">${img(paths.coreFocus, '85%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.featured, '85%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.stats, '85%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.techStack, '85%')}</div>`,
    DIVIDER, linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

const COMPOSERS = { split, centered, showcase, editorial, asymmetric, dashboard, stealth, celebration };

/**
 * @param {object} theme  one entry from config.themes[key]
 * @param {'day'|'night'} mode
 * @param {object} config  full themes.json
 * @param {object} paths   { hero, featured, projects: [...], timeline, techStack, stats, currently }
 * @param {string} platform
 */
function assembleReadme(theme, mode, config, paths, platform) {
  const composer = COMPOSERS[theme.layout] || centered;
  return composer({ theme, mode, config, paths, platform });
}

module.exports = { assembleReadme, shield };
