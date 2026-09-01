'use strict';
/**
 * Reusable visual components shared across all 8 theme layouts.
 * Each theme's assembler (markdown.js) picks which of these to use,
 * in what size, and in what arrangement. The actual SURFACE MATERIAL
 * (flat hard-shadow / frosted glass / organic blob / Swiss rule / bare
 * editorial / aurora glow / cybercore terminal / Y2K chrome) comes from
 * `c.panelStyle` via materials.js — every component below defers its
 * background/border to that, so the same theme automatically gets a
 * consistent surface language everywhere, not just color.
 */

const { panelMaterial } = require('./materials');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const font = `font-family="Georgia, 'Cinzel Decorative', serif"`;
const mono = `font-family="'JetBrains Mono', ui-monospace, monospace"`;
let uidCounter = 0;

function svgWrap(w, h, inner, c) {
  const id = `p${uidCounter++}`;
  const style = c.panelStyle || 'glass';
  const m = panelMaterial(style, w, h, c, id);
  const clipOpen = m.clipId ? `<g clip-path="url(#${m.clipId})">` : '';
  const clipClose = m.clipId ? `</g>` : '';
  return `<svg width="${m.canvasW}" height="${m.canvasH}" viewBox="0 0 ${m.canvasW} ${m.canvasH}" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>${m.defs}</defs>
  ${m.bg}
  ${clipOpen}${inner}${clipClose}
  ${m.fg}
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
function projectCard(project, c, w = 380, h = 205) {
  const lines = wrapText(project.description, 38).slice(0, 3);
  let tx = 20;
  const tagSvg = project.tags.map(t => {
    const tw = 18 + t.length * 7.6;
    const rect = `<rect x="${tx}" y="${h - 46}" width="${tw}" height="26" rx="13" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.4"/><text x="${tx + tw / 2}" y="${h - 29}" text-anchor="middle" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="11.5" fill="${c.accent2}">${esc(t)}</text>`;
    tx += tw + 8;
    return rect;
  }).join('');
  return svgWrap(w, h, `
  <polygon points="${w - 46},0 ${w},0 ${w},46" fill="${c.accent}" fill-opacity="0.22"/>
  <polygon points="${w - 30},0 ${w},0 ${w},30" fill="url(#pcgrad)" fill-opacity="0.55"/>
  <circle cx="${w - 22}" cy="22" r="5" fill="${c.accent2}"/>
  <text x="20" y="38" ${font} font-size="20" font-weight="700" fill="${c.text}">${esc(project.name)}</text>
  <rect x="20" y="48" width="36" height="2.5" fill="url(#pcgrad)"/>
  <defs><linearGradient id="pcgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>
  ${lines.map((l, i) => `<text x="20" y="${74 + i * 20}" ${mono} font-size="14" fill="${c.text}" opacity="0.85">${esc(l)}</text>`).join('')}
  ${tagSvg}
  <text x="20" y="${h - 13}" ${mono} font-size="10.5" fill="${c.text}" opacity="0.5" letter-spacing="1">${esc((project.status || 'LIVE').toUpperCase())}</text>
  `, c);
}

/** Large featured project card — bigger type, fuller description, prominent link label. */
function featuredProject(project, c, w = 780, h = 232) {
  const lines = wrapText(project.description, 58).slice(0, 3);
  const tags = project.tags.join('   ·   ');
  return svgWrap(w, h, `
  <text x="30" y="32" ${mono} font-size="12.5" fill="${c.accent2}" letter-spacing="2">FEATURED PROJECT</text>
  <text x="30" y="68" ${font} font-size="34" font-weight="700" fill="${c.text}">${esc(project.name)}</text>
  <rect x="30" y="84" width="60" height="3" fill="${c.accent}"/>
  ${lines.map((l, i) => `<text x="30" y="${115 + i * 24}" ${mono} font-size="15" fill="${c.text}" opacity="0.85">${esc(l)}</text>`).join('')}
  <text x="30" y="${h - 26}" ${mono} font-size="13" fill="${c.accent2}" letter-spacing="1">${esc(tags.toUpperCase())}</text>
  <circle cx="${w - 40}" cy="40" r="6" fill="${c.accent2}"/>
  <text x="${w - 54}" y="44" text-anchor="end" ${mono} font-size="11.5" fill="${c.text}" opacity="0.6" letter-spacing="1">${esc((project.status || 'LIVE').toUpperCase())}</text>
  `, c);
}

/** Experience timeline — 'horizontal' or 'vertical' orientation. */
function timeline(experience, c, orientation = 'horizontal', w = 900, h = 190) {
  if (orientation === 'vertical') {
    const rowH = h / experience.length;
    const rows = experience.map((e, i) => {
      const y = rowH * i + rowH / 2;
      return `
      <circle cx="34" cy="${y - 16}" r="7" fill="url(#tlgrad)"/>
      ${i < experience.length - 1 ? `<line x1="34" y1="${y - 8}" x2="34" y2="${y + rowH - 22}" stroke="${c.accent}" stroke-opacity="0.4" stroke-width="2"/>` : ''}
      <text x="58" y="${y - 20}" ${font} font-size="18" font-weight="700" fill="${c.text}">${esc(e.role)}</text>
      <text x="58" y="${y + 2}" ${mono} font-size="14" fill="${c.accent2}">${esc(e.org)} · ${esc(e.period)}</text>
      <text x="58" y="${y + 24}" ${mono} font-size="13" fill="${c.text}" opacity="0.75">${esc(wrapText(e.detail, 80)[0] || '')}</text>`;
    }).join('');
    return svgWrap(w, h, `<defs><linearGradient id="tlgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>${rows}`, c);
  }
  // horizontal
  const n = experience.length;
  const segW = (w - 80) / n;
  const cols = experience.map((e, i) => {
    const x = 40 + segW * i + segW / 2;
    return `
    <circle cx="${x}" cy="56" r="8" fill="url(#tlgrad)"/>
    ${i < n - 1 ? `<line x1="${x + 9}" y1="56" x2="${x + segW - 9}" y2="56" stroke="${c.accent}" stroke-opacity="0.4" stroke-width="2"/>` : ''}
    <text x="${x}" y="92" text-anchor="middle" ${font} font-size="17" font-weight="700" fill="${c.text}">${esc(e.role)}</text>
    <text x="${x}" y="114" text-anchor="middle" ${mono} font-size="13" fill="${c.accent2}">${esc(e.org)}</text>
    <text x="${x}" y="134" text-anchor="middle" ${mono} font-size="13" fill="${c.text}" opacity="0.65">${esc(e.period)}</text>`;
  }).join('');
  return svgWrap(w, h, `<defs><linearGradient id="tlgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>${cols}`, c);
}

/** Tech stack grouped into category rows, chips not a badge wall. Chips
 *  wrap onto a second line within their category if they'd overflow the
 *  panel width — previously they just ran off unbounded to the right. */
function techStack(groups, c, w = 900) {
  const labelW = 168, padX = 30, chipGap = 12, chipH = 32, chipFont = 14, catFont = 14;
  const rightEdge = w - 24;

  const catRows = Object.entries(groups).map(([cat, items]) => {
    const chipRows = [[]];
    let x = padX + labelW;
    for (const t of items) {
      const tw = 26 + t.length * 8.2;
      if (x + tw > rightEdge && chipRows[chipRows.length - 1].length > 0) {
        chipRows.push([]);
        x = padX + labelW;
      }
      chipRows[chipRows.length - 1].push({ t, tw, x });
      x += tw + chipGap;
    }
    return { cat, chipRows };
  });

  const rowH = 52;
  let y = 44;
  let svgContent = '';
  for (const { cat, chipRows } of catRows) {
    const catBlockH = chipRows.length * rowH;
    svgContent += `<text x="${padX}" y="${y}" ${mono} font-size="${catFont}" font-weight="700" fill="${c.accent2}" letter-spacing="1.5">${esc(cat.toUpperCase())}</text>`;
    chipRows.forEach((row, ri) => {
      const rowY = y - chipFont + 2 + ri * rowH;
      row.forEach(({ t, tw, x }) => {
        svgContent += `<rect x="${x}" y="${rowY - chipH / 2 - 4}" width="${tw}" height="${chipH}" rx="${chipH / 2}" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.45"/><text x="${x + tw / 2}" y="${rowY + 5}" text-anchor="middle" ${mono} font-size="${chipFont}" fill="${c.text}">${esc(t)}</text>`;
      });
    });
    y += catBlockH + 20;
  }
  const h = y - 4;
  return svgWrap(w, h, svgContent, c);
}

/** Stats dashboard row — big numbers with sub-labels, evenly spaced. */
function statsPanel(stats, c, w = 900, h = 150) {
  const colW = w / stats.length;
  const cols = stats.map((s, i) => {
    const x = colW * i + colW / 2;
    return `
    <text x="${x}" y="66" text-anchor="middle" ${font} font-size="42" font-weight="700" fill="url(#stgrad)">${esc(s.value)}</text>
    <text x="${x}" y="94" text-anchor="middle" ${mono} font-size="15" font-weight="700" fill="${c.text}" letter-spacing="1.5">${esc(s.label.toUpperCase())}</text>
    <text x="${x}" y="116" text-anchor="middle" ${mono} font-size="13" fill="${c.text}" opacity="0.6">${esc(s.sub)}</text>
    ${i < stats.length - 1 ? `<line x1="${colW * (i + 1)}" y1="24" x2="${colW * (i + 1)}" y2="${h - 24}" stroke="${c.accent}" stroke-opacity="0.25"/>` : ''}`;
  }).join('');
  return svgWrap(w, h, `<defs><linearGradient id="stgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c.accent}"/><stop offset="100%" stop-color="${c.accent2}"/></linearGradient></defs>${cols}`, c);
}

/** "Currently" / Core Focus panel — only cells backed by real config data
 *  get rendered. Previously packed all cells into a single row, which at
 *  4 cells meant ~225px columns wrapping 34-char lines — text didn't fit
 *  and effectively became unreadable. Now uses a max-2-column grid sized
 *  to the panel's real width, with wrap width computed from the ACTUAL
 *  column width rather than a fixed guess, so nothing overflows. */
function currentlyPanel(cells, c, w = 900) {
  const cols = Math.min(2, cells.length);
  const rows = Math.ceil(cells.length / cols);
  const colW = w / cols;
  const padX = 28;
  const labelSize = 14, textSize = 17, lineHeight = 25;
  const charWidth = textSize * 0.52; // rough average glyph width for this font at this size
  const maxChars = Math.max(12, Math.floor((colW - padX * 2) / charWidth));

  const wrapped = cells.map(cell => wrapText(cell.text, maxChars));
  const rowHeights = [];
  for (let r = 0; r < rows; r++) {
    const rowCells = wrapped.slice(r * cols, r * cols + cols);
    const maxLines = Math.max(1, ...rowCells.map(l => l.length));
    rowHeights.push(48 + maxLines * lineHeight + 20);
  }
  const h = rowHeights.reduce((a, b) => a + b, 0);

  let svgContent = '';
  let yOffset = 0;
  cells.forEach((cell, i) => {
    const r = Math.floor(i / cols), cIdx = i % cols;
    const x = colW * cIdx;
    const rowH = rowHeights[r];
    const rowY = rowHeights.slice(0, r).reduce((a, b) => a + b, 0);
    const lines = wrapped[i];
    svgContent += `
    ${cIdx > 0 ? `<line x1="${x}" y1="${rowY + 14}" x2="${x}" y2="${rowY + rowH - 14}" stroke="${c.accent}" stroke-opacity="0.25"/>` : ''}
    ${r > 0 && cIdx === 0 ? `<line x1="14" y1="${rowY}" x2="${w - 14}" y2="${rowY}" stroke="${c.accent}" stroke-opacity="0.18"/>` : ''}
    <text x="${x + padX}" y="${rowY + 34}" ${mono} font-size="${labelSize}" font-weight="700" fill="${c.accent2}" letter-spacing="1.5">${esc(cell.label.toUpperCase())}</text>
    ${lines.map((l, li) => `<text x="${x + padX}" y="${rowY + 58 + li * lineHeight}" ${font} font-size="${textSize}" fill="${c.text}">${esc(l)}</text>`).join('')}`;
  });
  return svgWrap(w, h, svgContent, c);
}

module.exports = { projectCard, featuredProject, timeline, techStack, statsPanel, currentlyPanel, wrapText };
