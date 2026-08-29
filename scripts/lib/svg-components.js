'use strict';
/**
 * Reusable visual components shared across all 8 theme layouts.
 * Each theme's assembler (markdown.js) picks which of these to use,
 * in what size, and in what arrangement — the components themselves
 * stay theme-agnostic and are recolored via the `c` palette object.
 */

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const font = `font-family="Georgia, 'Cinzel Decorative', serif"`;
const mono = `font-family="'JetBrains Mono', ui-monospace, monospace"`;

function svgWrap(w, h, inner, c) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">
  <rect width="${w}" height="${h}" rx="12" fill="${c.bg}"/>
  ${inner}
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="11" fill="none" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="1.5"/>
</svg>`;
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Compact project card — folder-ribbon corner, diagonal accent, tag chips. */
function projectCard(project, c, w = 380, h = 190) {
  const lines = wrapText(project.description, 40).slice(0, 3);
  let tx = 20;
  const tagSvg = project.tags.map(t => {
    const tw = 14 + t.length * 6.5;
    const rect = `<rect x="${tx}" y="${h - 40}" width="${tw}" height="22" rx="11" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.4"/><text x="${tx + tw / 2}" y="${h - 25}" text-anchor="middle" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="10" fill="${c.accent2}">${esc(t)}</text>`;
    tx += tw + 8;
    return rect;
  }).join('');
  return svgWrap(w, h, `
  <polygon points="${w - 46},0 ${w},0 ${w},46" fill="${c.accent}" fill-opacity="0.22"/>
  <polygon points="${w - 30},0 ${w},0 ${w},30" fill="url(#pcgrad)" fill-opacity="0.55"/>
  <circle cx="${w - 22}" cy="22" r="5" fill="${c.accent2}"/>
  <text x="20" y="38" ${font} font-size="19" font-weight="700" fill="${c.text}">${esc(project.name)}</text>
  <rect x="20" y="48" width="36" height="2.5" fill="url(#pcgrad)"/>
  <defs><linearGradient id="pcgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>
  ${lines.map((l, i) => `<text x="20" y="${72 + i * 18}" ${mono} font-size="12.5" fill="${c.text}" opacity="0.8">${esc(l)}</text>`).join('')}
  ${tagSvg}
  <text x="20" y="${h - 12}" ${mono} font-size="9" fill="${c.text}" opacity="0.5" letter-spacing="1">${esc((project.status || 'LIVE').toUpperCase())}</text>
  `, c);
}

/** Large featured project card — bigger type, fuller description, prominent link label. */
function featuredProject(project, c, w = 780, h = 220) {
  const lines = wrapText(project.description, 62).slice(0, 3);
  const tags = project.tags.join('   ·   ');
  return svgWrap(w, h, `
  <text x="30" y="30" ${mono} font-size="11" fill="${c.accent2}" letter-spacing="2">FEATURED PROJECT</text>
  <text x="30" y="66" ${font} font-size="34" font-weight="700" fill="${c.text}">${esc(project.name)}</text>
  <rect x="30" y="82" width="60" height="3" fill="${c.accent}"/>
  ${lines.map((l, i) => `<text x="30" y="${112 + i * 22}" ${mono} font-size="14" fill="${c.text}" opacity="0.82">${esc(l)}</text>`).join('')}
  <text x="30" y="${h - 26}" ${mono} font-size="12" fill="${c.accent2}" letter-spacing="1">${esc(tags.toUpperCase())}</text>
  <circle cx="${w - 40}" cy="40" r="6" fill="${c.accent2}"/>
  <text x="${w - 54}" y="44" text-anchor="end" ${mono} font-size="10" fill="${c.text}" opacity="0.6" letter-spacing="1">${esc((project.status || 'LIVE').toUpperCase())}</text>
  `, c);
}

/** Experience timeline — 'horizontal' or 'vertical' orientation. */
function timeline(experience, c, orientation = 'horizontal', w = 900, h = 170) {
  if (orientation === 'vertical') {
    const rowH = h / experience.length;
    const rows = experience.map((e, i) => {
      const y = rowH * i + rowH / 2;
      return `
      <circle cx="30" cy="${y - 14}" r="6" fill="url(#tlgrad)"/>
      ${i < experience.length - 1 ? `<line x1="30" y1="${y - 8}" x2="30" y2="${y + rowH - 20}" stroke="${c.accent}" stroke-opacity="0.4" stroke-width="2"/>` : ''}
      <text x="52" y="${y - 18}" ${font} font-size="15" font-weight="700" fill="${c.text}">${esc(e.role)}</text>
      <text x="52" y="${y}" ${mono} font-size="11.5" fill="${c.accent2}">${esc(e.org)} · ${esc(e.period)}</text>
      <text x="52" y="${y + 18}" ${mono} font-size="11" fill="${c.text}" opacity="0.7">${esc(wrapText(e.detail, 70)[0] || '')}</text>`;
    }).join('');
    return svgWrap(w, h, `<defs><linearGradient id="tlgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>${rows}`, c);
  }
  // horizontal
  const n = experience.length;
  const segW = (w - 80) / n;
  const cols = experience.map((e, i) => {
    const x = 40 + segW * i + segW / 2;
    return `
    <circle cx="${x}" cy="50" r="7" fill="url(#tlgrad)"/>
    ${i < n - 1 ? `<line x1="${x + 8}" y1="50" x2="${x + segW - 8}" y2="50" stroke="${c.accent}" stroke-opacity="0.4" stroke-width="2"/>` : ''}
    <text x="${x}" y="82" text-anchor="middle" ${font} font-size="14" font-weight="700" fill="${c.text}">${esc(e.role)}</text>
    <text x="${x}" y="100" text-anchor="middle" ${mono} font-size="10.5" fill="${c.accent2}">${esc(e.org)}</text>
    <text x="${x}" y="116" text-anchor="middle" ${mono} font-size="10" fill="${c.text}" opacity="0.65">${esc(e.period)}</text>`;
  }).join('');
  return svgWrap(w, h, `<defs><linearGradient id="tlgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>${cols}`, c);
}

/** Tech stack grouped into category rows, chips not a badge wall. */
function techStack(groups, c, w = 900) {
  const rowH = 52;
  const h = Object.keys(groups).length * rowH + 24;
  let y = 40;
  const rows = Object.entries(groups).map(([cat, items]) => {
    let x = 190;
    const chips = items.map(t => {
      const tw = 20 + t.length * 7;
      const chip = `<rect x="${x}" y="${y - 20}" width="${tw}" height="26" rx="13" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.45"/><text x="${x + tw / 2}" y="${y - 3}" text-anchor="middle" ${mono} font-size="11.5" fill="${c.text}">${esc(t)}</text>`;
      x += tw + 10;
      return chip;
    }).join('');
    const row = `<text x="30" y="${y - 3}" ${mono} font-size="12" font-weight="700" fill="${c.accent2}" letter-spacing="1.5">${esc(cat.toUpperCase())}</text>${chips}`;
    y += rowH;
    return row;
  }).join('');
  return svgWrap(w, h, rows, c);
}

/** Stats dashboard row — big numbers with sub-labels, evenly spaced. */
function statsPanel(stats, c, w = 900, h = 130) {
  const colW = w / stats.length;
  const cols = stats.map((s, i) => {
    const x = colW * i + colW / 2;
    return `
    <text x="${x}" y="60" text-anchor="middle" ${font} font-size="40" font-weight="700" fill="url(#stgrad)">${esc(s.value)}</text>
    <text x="${x}" y="84" text-anchor="middle" ${mono} font-size="12" fill="${c.text}" letter-spacing="1.5">${esc(s.label.toUpperCase())}</text>
    <text x="${x}" y="102" text-anchor="middle" ${mono} font-size="10" fill="${c.text}" opacity="0.55">${esc(s.sub)}</text>
    ${i < stats.length - 1 ? `<line x1="${colW * (i + 1)}" y1="20" x2="${colW * (i + 1)}" y2="${h - 20}" stroke="${c.accent}" stroke-opacity="0.25"/>` : ''}`;
  }).join('');
  return svgWrap(w, h, `<defs><linearGradient id="stgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>${cols}`, c);
}

/** "Currently" panel — only cells backed by real config data get rendered.
 *  Height auto-fits whichever cell needs the most lines, so nothing is
 *  silently truncated mid-sentence. */
function currentlyPanel(cells, c, w = 900) {
  const colW = w / cells.length;
  const wrapped = cells.map(cell => wrapText(cell.text, 34));
  const maxLines = Math.max(...wrapped.map(l => l.length));
  const h = 56 + maxLines * 20;
  const cols = cells.map((cell, i) => {
    const x = colW * i;
    const lines = wrapped[i];
    return `
    ${i > 0 ? `<line x1="${x}" y1="16" x2="${x}" y2="${h - 16}" stroke="${c.accent}" stroke-opacity="0.25"/>` : ''}
    <text x="${x + 24}" y="34" ${mono} font-size="11" font-weight="700" fill="${c.accent2}" letter-spacing="1.5">${esc(cell.label.toUpperCase())}</text>
    ${lines.map((l, li) => `<text x="${x + 24}" y="${60 + li * 20}" ${font} font-size="14" fill="${c.text}">${esc(l)}</text>`).join('')}`;
  }).join('');
  return svgWrap(w, h, cols, c);
}

module.exports = { projectCard, featuredProject, timeline, techStack, statsPanel, currentlyPanel, wrapText };
