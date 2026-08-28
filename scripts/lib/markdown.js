'use strict';

function hex(c) { return c.replace('#', ''); }

function shield(label, value, color, logo) {
  const l = encodeURIComponent(label);
  const v = encodeURIComponent(value);
  const logoParam = logo ? `&logo=${logo}&logoColor=white` : '';
  return `https://img.shields.io/badge/${l}-${v}-${hex(color)}?style=for-the-badge${logoParam}`;
}

function buildSections(theme, mode, config, heroImgPath, platform) {
  const c = theme[mode];
  const { identity, content } = config;
  const S = {};

  S.hero = `<div align="center">\n\n<img src="${heroImgPath}" width="100%" alt="${identity.name} — ${theme.themeName} ${mode} theme"/>\n\n</div>\n`;

  S.banner = [
    `<div align="center">`,
    ``,
    `### ${theme.icon} ${theme.themeName} · ${mode === 'day' ? 'Day' : 'Night'} Edition`,
    ``,
    `*"${theme.quote.short}"*`,
    ``,
    `</div>`,
    ``,
  ].join('\n');

  S.stats = [
    `<div align="center">`,
    ``,
    `| ${content.stats.map(s => s.label).join(' | ')} |`,
    `|${content.stats.map(() => '---').join('|')}|`,
    `| ${content.stats.map(s => `**${s.value}**<br/><sub>${s.sub}</sub>`).join(' | ')} |`,
    ``,
    `</div>`,
    ``,
  ].join('\n');

  S.quote = [
    `> ${theme.quote.full}`,
    `>`,
    `> — *${theme.quote.attribution}*`,
    ``,
  ].join('\n');

  S.skills = [
    `#### ◆ Tech Stack`,
    ``,
    content.skills.map(s => `\`${s}\``).join(' '),
    ``,
  ].join('\n');

  S.projects = [
    `#### ◆ Featured Projects`,
    ``,
    ...content.projects.map(p =>
      `**[${p.name}](${p.url})**  \n${p.description}  \n${p.tags.map(t => `\`${t}\``).join(' ')}\n`
    ),
  ].join('\n');

  const gh = identity.github, gl = identity.gitlab;
  S.links = [
    `<div align="center">`,
    ``,
    `[![Portfolio](${shield('Portfolio', 'visit', c.accent)})](${identity.portfolio})`,
    `[![GitHub](${shield('GitHub', gh.username, c.accent, 'github')})](${gh.url})`,
    `[![GitLab](${shield('GitLab', gl.username, c.accent, 'gitlab')})](${gl.url})`,
    `[![LinkedIn](${shield('LinkedIn', 'connect', c.accent, 'linkedin')})](${identity.linkedin})`,
    `[![Email](${shield('Email', 'contact', c.accent, 'gmail')})](mailto:${identity.email})`,
    ``,
    `</div>`,
    ``,
  ].join('\n');

  S.footer = [
    `<div align="center">`,
    ``,
    `<sub>${identity.name} · ${identity.role} · <strong>${theme.themeName}</strong> (${mode}) · auto-generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC via ${platform} scheduled workflow</sub>`,
    ``,
    `</div>`,
  ].join('\n');

  return S;
}

function assembleReadme(theme, mode, config, heroImgPath, platform) {
  const S = buildSections(theme, mode, config, heroImgPath, platform);
  const order = theme.sectionOrder || ['hero', 'banner', 'stats', 'quote', 'skills', 'projects', 'links', 'footer'];
  return order.map(key => S[key]).filter(Boolean).join('\n');
}

module.exports = { assembleReadme, buildSections, shield };
