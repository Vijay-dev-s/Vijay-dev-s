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
    `[![Email](${shield('Email', 'contact', c.accent, 'gmail')})](mailto:${identity.email})`,
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

// Real, hosted, GitHub-API-backed widgets — never hand-fabricated numbers.
// Only included on the GitHub README (GitLab has no equivalent public
// service). The `theme` query param is one of vercel's fixed presets, so
// it's the closest available match to our custom palette, not a perfect
// hex match — an inherent limit of using a real third-party data source
// instead of drawing fake stats ourselves.
function githubWidgets(identity, statsTheme) {
  const u = identity.github.username;
  return [
    `<div align="center">`,
    ``,
    `<img src="https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" width="49%" alt="GitHub stats"/>`,
    `<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=compact&theme=${statsTheme}&hide_border=true" width="38%" alt="Top languages"/>`,
    ``,
    `<img src="https://github-readme-streak-stats.herokuapp.com/?user=${u}&theme=${statsTheme}&hide_border=true" width="90%" alt="Streak stats"/>`,
    ``,
    `<img src="https://github-profile-trophy.vercel.app/?username=${u}&theme=${statsTheme}&no-frame=true&row=1&column=6" width="90%" alt="Trophies"/>`,
    ``,
    `</div>`,
  ].join('\n');
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
    `<td width="45%" valign="top">\n\n#### ◆ Current Focus\n\n${theme.quote.short}\n\n</td>`,
    `</tr></table>`, DIVIDER,
    `#### ◆ Projects\n`,
    img(paths.featured, '100%'), DIVIDER,
    `<table width="100%"><tr>` +
      paths.projects.map(p => `<td width="${Math.floor(100 / paths.projects.length)}%">${img(p, '100%')}</td>`).join('') +
    `</tr></table>`, DIVIDER,
    `#### ◆ Experience\n`, img(paths.timeline, '100%'), DIVIDER,
    `<table width="100%"><tr><td width="60%">${img(paths.techStack, '100%')}</td><td width="40%">${img(paths.stats, '100%')}</td></tr></table>`,
    DIVIDER, (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── TUESDAY · BLUE — calm, centered, one strong focal project ─────────────
function centered(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    `<div align="center">`, img(paths.hero, '100%'), `</div>`, DIVIDER,
    `<div align="center">\n\n${quoteBlock(theme)}\n\n</div>`, DIVIDER,
    `<div align="center">\n\n#### ◆ Featured Work\n\n</div>`,
    `<div align="center">${img(paths.featured, '90%')}</div>`, DIVIDER,
    `<table width="100%"><tr>`,
    `<td width="50%" valign="top">\n\n#### About\n\n${config.content.about}\n\n</td>`,
    `<td width="50%" valign="top">\n\n#### Other Work\n\n${projectLinksList(config.content.projects.slice(1))}\n\n</td>`,
    `</tr></table>`, DIVIDER,
    `<div align="center">${img(paths.timeline, '100%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.techStack, '100%')}</div>`,
    DIVIDER, (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
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
    `<table width="100%"><tr>` +
      allProjects.map(p => `<td width="${Math.floor(100 / allProjects.length)}%">${img(p, '100%')}</td>`).join('') +
    `</tr></table>`, DIVIDER,
    `#### ◆ Technical Stack\n`, img(paths.techStack, '100%'), DIVIDER,
    `<table width="100%"><tr>`,
    `<td width="65%" valign="top">\n\n<sub>${config.content.about}</sub>\n\n</td>`,
    `<td width="35%" valign="top">${img(paths.stats, '100%')}</td>`,
    `</tr></table>`,
    DIVIDER, (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
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
    (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
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
    `<table width="100%"><tr>` +
      paths.projects.map(p => `<td width="${Math.floor(100 / Math.max(paths.projects.length, 1))}%">${img(p, '100%')}</td>`).join('') +
    `</tr></table>`, DIVIDER,
    img(paths.techStack, '100%'),
    DIVIDER, (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── SATURDAY · VIOLET — modular 2×2 dashboard grid ─────────────────────────
function dashboard(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), DIVIDER,
    img(paths.currently, '100%'), DIVIDER,
    `<table width="100%">`,
    `<tr><td width="50%" valign="top">${img(paths.stats, '100%')}</td><td width="50%" valign="top">${img(paths.featured, '100%')}</td></tr>`,
    `<tr><td width="50%" valign="top">${img(paths.techStack, '100%')}</td><td width="50%" valign="top">${paths.projects.map(p => img(p, '100%')).join('<br/>')}</td></tr>`,
    `</table>`, DIVIDER,
    img(paths.timeline, '100%'),
    DIVIDER, (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── SUNDAY · BLACK — extreme minimalism, single stacked column ────────────
function stealth(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    img(paths.hero, '100%'), ``,
    img(paths.currently, '100%'), ``,
    img(paths.featured, '100%'), ``,
    `<sub>${projectLinksList(config.content.projects.slice(1))}</sub>`, ``,
    img(paths.techStack, '100%'), ``,
    img(paths.stats, '100%'), ``,
    (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

// ── BIRTHDAY · CYAN — special edition, centered, quote-first ──────────────
function celebration(ctx) {
  const { theme, mode, config, paths } = ctx;
  const c = theme[mode];
  return [
    `<div align="center">`, img(paths.hero, '100%'), `</div>`, DIVIDER,
    `<div align="center">\n\n${quoteBlock(theme)}\n\n</div>`, DIVIDER,
    `<div align="center">${img(paths.currently, '85%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.featured, '85%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.stats, '85%')}</div>`, DIVIDER,
    `<div align="center">${img(paths.techStack, '85%')}</div>`,
    DIVIDER, (ctx.githubWidgets ? githubWidgets(config.identity, theme.statsWidgetTheme) + '\n' + DIVIDER : ''), linksRow(config.identity, c), footer(theme, mode, config.identity, ctx.platform),
  ].join('\n');
}

const COMPOSERS = { split, centered, showcase, editorial, asymmetric, dashboard, stealth, celebration };

/**
 * @param {object} theme  one entry from config.themes[key]
 * @param {'day'|'night'} mode
 * @param {object} config  full themes.json
 * @param {object} paths   { hero, featured, projects: [...], timeline, techStack, stats, currently }
 * @param {string} platform
 * @param {boolean} includeGithubWidgets  true only for the GitHub deployment
 */
function assembleReadme(theme, mode, config, paths, platform, includeGithubWidgets) {
  const composer = COMPOSERS[theme.layout] || centered;
  return composer({ theme, mode, config, paths, platform, githubWidgets: !!includeGithubWidgets });
}

module.exports = { assembleReadme, shield };
