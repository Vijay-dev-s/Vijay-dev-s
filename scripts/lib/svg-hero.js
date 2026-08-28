'use strict';
/**
 * Generates the hero banner SVG for a given theme + mode.
 * One distinct LAYOUT per weekday theme (8 total layouts including birthday).
 * Day vs night only changes the palette/glow within that same layout —
 * per spec, identity stays recognizable, colors don't just invert.
 */

const W = 1200;
const H = 300;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function baseDefs(c, id) {
  return `
  <defs>
    <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="100%" stop-color="${c.accent2}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c.glow}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${c.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur-${id}"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>`;
}

function frame(inner, c) {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="profile hero">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  ${inner}
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="1.5" rx="18"/>
</svg>`;
}

const font = `font-family="Georgia, 'Cinzel Decorative', serif"`;
const mono = `font-family="'JetBrains Mono', ui-monospace, monospace"`;

// ── MONDAY · CRIMSON · "split" — a crest, not a circle: dominion motif ───
function split(id, c, m) {
  const hx = 200, hy = 150, hr = 76; // hexagonal crest
  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 180 * (60 * i - 90);
    return `${(hx + hr * Math.cos(a)).toFixed(1)},${(hy + hr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return frame(`
  ${baseDefs(c, id)}
  <polygon points="0,0 480,0 320,${H} 0,${H}" fill="${c.surface}"/>
  <line x1="480" y1="0" x2="320" y2="${H}" stroke="${c.accent}" stroke-width="2" stroke-opacity="0.5"/>
  <circle cx="230" cy="150" r="200" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  <line x1="${hx - 100}" y1="${hy - 100}" x2="${hx + 100}" y2="${hy + 100}" stroke="${c.accent}" stroke-opacity="0.28" stroke-width="1.5"/>
  <line x1="${hx + 100}" y1="${hy - 100}" x2="${hx - 100}" y2="${hy + 100}" stroke="${c.accent}" stroke-opacity="0.28" stroke-width="1.5"/>
  <polygon points="${hexPts}" fill="${c.bg}" fill-opacity="0.5" stroke="url(#grad-${id})" stroke-width="3"/>
  <text x="${hx}" y="163" text-anchor="middle" ${font} font-size="40" font-weight="700" fill="${c.accent2}">${esc(initials(m.identity.name))}</text>
  <text x="440" y="110" ${font} font-size="46" font-weight="700" fill="${c.text}">${esc(m.identity.name)}</text>
  <text x="440" y="148" ${mono} font-size="18" fill="${c.accent2}" letter-spacing="2">${esc(m.roleForDay.toUpperCase())}</text>
  <rect x="440" y="172" width="330" height="30" rx="15" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.5"/>
  <text x="605" y="192" text-anchor="middle" ${mono} font-size="13" fill="${c.text}" letter-spacing="1">◆ ${esc(m.themeName.toUpperCase())} · ${m.mode.toUpperCase()}</text>
  <text x="440" y="235" ${font} font-style="italic" font-size="14" fill="${c.text}" opacity="0.75">"${esc(m.quote.short)}"</text>
  ${monogramCorner(c)}
  `, c);
}

// ── TUESDAY · BLUE · "centered" — a compass, not a badge: service motif ──
function centered(id, c, m) {
  const cx = W / 2, cy = 150;
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (Math.PI / 12) * i;
    const r1 = 108, r2 = i % 6 === 0 ? 96 : 102;
    return `<line x1="${(cx + r1 * Math.cos(a)).toFixed(1)}" y1="${(cy + r1 * Math.sin(a)).toFixed(1)}" x2="${(cx + r2 * Math.cos(a)).toFixed(1)}" y2="${(cy + r2 * Math.sin(a)).toFixed(1)}" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="1"/>`;
  }).join('');
  return frame(`
  ${baseDefs(c, id)}
  <circle cx="${cx}" cy="${cy}" r="220" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  ${ticks}
  <circle cx="${cx}" cy="${cy}" r="95" fill="none" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="1"/>
  <polygon points="${cx},${cy - 66} ${cx + 14},${cy} ${cx},${cy + 66} ${cx - 14},${cy}" fill="none" stroke="url(#grad-${id})" stroke-width="2.5"/>
  <circle cx="${cx}" cy="${cy}" r="50" fill="${c.bg}" fill-opacity="0.55" stroke="url(#grad-${id})" stroke-width="2.5"/>
  <text x="${cx}" y="162" text-anchor="middle" ${font} font-size="32" font-weight="700" fill="${c.accent2}">${esc(initials(m.identity.name))}</text>
  <text x="${cx}" y="60" text-anchor="middle" ${font} font-size="38" font-weight="700" fill="${c.text}">${esc(m.identity.name)}</text>
  <text x="${cx}" y="88" text-anchor="middle" ${mono} font-size="15" fill="${c.accent2}" letter-spacing="3">${esc(m.roleForDay.toUpperCase())}</text>
  <text x="${cx}" y="245" text-anchor="middle" ${mono} font-size="13" fill="${c.text}" opacity="0.85" letter-spacing="1">◆ ${esc(m.themeName.toUpperCase())} · ${m.mode.toUpperCase()}</text>
  <text x="${cx}" y="270" text-anchor="middle" ${font} font-style="italic" font-size="13" fill="${c.text}" opacity="0.6">"${esc(m.quote.short)}"</text>
  `, c);
}

// ── WEDNESDAY · GREEN · "showcase" (large quiet left panel + orb right) ──
function wrapWords(text, maxChars) {
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
function showcase(id, c, m) {
  // Growth-ring motif: patience/precision, not a data list — the quote
  // carries the same weight here that it does in every other theme.
  const lines = wrapWords(m.quote.short, 40).slice(0, 2);
  return frame(`
  ${baseDefs(c, id)}
  <rect x="0" y="0" width="720" height="${H}" fill="${c.surface}"/>
  <line x1="720" y1="0" x2="720" y2="${H}" stroke="${c.accent}" stroke-opacity="0.4"/>
  ${[100, 130, 160].map(r => `<circle cx="0" cy="${H}" r="${r}" fill="none" stroke="${c.accent}" stroke-opacity="0.12" stroke-width="1"/>`).join('')}
  <text x="48" y="70" ${font} font-size="34" font-weight="700" fill="${c.text}">${esc(m.identity.name)}</text>
  <text x="48" y="98" ${mono} font-size="14" fill="${c.accent2}" letter-spacing="2">${esc(m.roleForDay.toUpperCase())}</text>
  <rect x="48" y="126" width="3" height="90" fill="url(#grad-${id})"/>
  <text x="68" y="150" ${font} font-style="italic" font-size="16" fill="${c.text}" opacity="0.85">"${esc(lines[0] || '')}</text>
  <text x="68" y="174" ${font} font-style="italic" font-size="16" fill="${c.text}" opacity="0.85">${esc(lines[1] || '')}"</text>
  <text x="68" y="205" ${mono} font-size="11" fill="${c.accent2}" letter-spacing="1" opacity="0.8">◆ ${esc(m.themeName.toUpperCase())} · ${m.mode.toUpperCase()}</text>
  <circle cx="960" cy="150" r="230" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  <circle cx="960" cy="150" r="80" fill="none" stroke="url(#grad-${id})" stroke-width="3"/>
  <text x="960" y="163" text-anchor="middle" ${font} font-size="46" font-weight="700" fill="${c.accent2}">${esc(initials(m.identity.name))}</text>
  `, c);
}

// ── THURSDAY · WHITE · "editorial" (minimal, huge whitespace) ────────────
function editorial(id, c, m) {
  return frame(`
  ${baseDefs(c, id)}
  <line x1="70" y1="90" x2="70" y2="210" stroke="${c.accent}" stroke-width="1.5"/>
  <text x="100" y="130" ${font} font-size="42" font-weight="400" fill="${c.text}" letter-spacing="1">${esc(m.identity.name)}</text>
  <text x="100" y="160" ${mono} font-size="14" fill="${c.accent}" letter-spacing="4">${esc(m.roleForDay.toUpperCase())}</text>
  <text x="100" y="200" ${font} font-style="italic" font-size="14" fill="${c.text}" opacity="0.55">"${esc(m.quote.short)}"</text>
  <text x="${W - 60}" y="45" text-anchor="end" ${mono} font-size="12" fill="${c.accent}" letter-spacing="2">${esc(m.themeName.toUpperCase())}</text>
  <text x="${W - 60}" y="65" text-anchor="end" ${mono} font-size="12" fill="${c.text}" opacity="0.5" letter-spacing="2">${m.mode.toUpperCase()}</text>
  <circle cx="${W - 90}" cy="230" r="1.5" fill="${c.accent}"/>
  <circle cx="${W - 70}" cy="230" r="1.5" fill="${c.accent}"/>
  <circle cx="${W - 50}" cy="230" r="1.5" fill="${c.accent}"/>
  `, c);
}

// ── FRIDAY · GOLD · "asymmetric" — a thunderbolt, not a stripe: force ────
function asymmetric(id, c, m) {
  const bolt = `${W - 260},0 ${W - 340},130 ${W - 220},130 ${W - 340},${H} ${W - 120},110 ${W - 210},110`;
  return frame(`
  ${baseDefs(c, id)}
  <polygon points="700,0 ${W},0 ${W},${H} 900,${H}" fill="${c.surface}"/>
  <circle cx="1000" cy="80" r="150" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  <polygon points="${bolt}" fill="url(#grad-${id})" fill-opacity="0.9"/>
  <polygon points="${bolt}" fill="none" stroke="${c.bg}" stroke-opacity="0.5" stroke-width="1"/>
  <text x="60" y="90" ${font} font-size="44" font-weight="700" fill="${c.text}" transform="rotate(-2 60 90)">${esc(m.identity.name)}</text>
  <text x="60" y="122" ${mono} font-size="15" fill="${c.accent2}" letter-spacing="3">${esc(m.roleForDay.toUpperCase())}</text>
  <rect x="60" y="150" width="380" height="2" fill="url(#grad-${id})"/>
  <text x="60" y="185" ${font} font-style="italic" font-size="14" fill="${c.text}" opacity="0.75">"${esc(m.quote.short)}"</text>
  <text x="60" y="255" ${mono} font-size="13" fill="${c.accent}" font-weight="700" letter-spacing="1">◆ ${esc(m.themeName.toUpperCase())} · ${m.mode.toUpperCase()}</text>
  `, c);
}

// ── SATURDAY · VIOLET · "dashboard" — fractured shards, not plain cards ──
function dashboard(id, c, m) {
  const cards = [
    ['NAME', m.identity.name],
    ['ROLE', m.roleForDay],
    ['THEME', m.themeName],
    ['MODE', m.mode.toUpperCase()],
  ];
  const shards = [
    [40, 20, 90, 45, 60, 75], [1140, 15, 1180, 55, 1120, 60],
    [1160, 200, 1195, 240, 1140, 260], [15, 220, 55, 260, 10, 270],
  ].map(p => `<polygon points="${p[0]},${p[1]} ${p[2]},${p[3]} ${p[4]},${p[5]}" fill="${c.accent}" fill-opacity="0.16" stroke="${c.accent2}" stroke-opacity="0.3" stroke-width="0.75"/>`).join('');
  return frame(`
  ${baseDefs(c, id)}
  <circle cx="1080" cy="60" r="180" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  ${shards}
  <text x="48" y="55" ${font} font-size="26" font-weight="700" fill="${c.text}">${esc(m.identity.name)} — Dashboard</text>
  ${cards.map(([label, val], i) => {
    const x = 48 + i * 280;
    const nick = i % 2 === 0 ? '4 2 12 2 12 12 2 12' : '2 2 10 2 12 10 4 12'; // asymmetric corner cuts, alternating
    return `<polygon points="${x},95 ${x + 260},85 ${x + 250},175 ${x + 8},175" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.5"/>
    <text x="${x + 20}" y="118" ${mono} font-size="11" fill="${c.accent2}" letter-spacing="1">${esc(label)}</text>
    <text x="${x + 20}" y="150" ${font} font-size="17" font-weight="700" fill="${c.text}">${esc(val)}</text>`;
  }).join('')}
  <polygon points="48,192 1152,198 1148,255 52,253" fill="${c.surface}" stroke="${c.accent}" stroke-opacity="0.35"/>
  <text x="68" y="228" ${font} font-style="italic" font-size="13" fill="${c.text}" opacity="0.8">"${esc(m.quote.short)}"</text>
  `, c);
}

// ── SUNDAY · BLACK · "stealth" — a faint seal, not empty space: devotion ─
function stealth(id, c, m) {
  const sx = W - 150, sy = 150;
  const seal = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 4 * i;
    return `${(sx + 46 * Math.cos(a)).toFixed(1)},${(sy + 46 * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return frame(`
  ${baseDefs(c, id)}
  <polygon points="${seal}" fill="none" stroke="${c.accent}" stroke-opacity="0.25" stroke-width="1"/>
  <circle cx="${sx}" cy="${sy}" r="30" fill="none" stroke="${c.accent}" stroke-opacity="0.3" stroke-width="1"/>
  <circle cx="${sx}" cy="${sy}" r="3" fill="${c.accent2}" opacity="0.6"/>
  ${Array.from({length:20},(_,i)=>`<circle cx="${40+i*58}" cy="20" r="1" fill="${c.accent}" opacity="0.18"/>`).join('')}
  <text x="60" y="175" ${font} font-size="72" font-weight="700" fill="${c.text}" opacity="0.94">${esc(m.identity.name.toUpperCase())}</text>
  <text x="64" y="210" ${mono} font-size="14" fill="${c.accent2}" letter-spacing="6">${esc(m.roleForDay.toUpperCase())}</text>
  <line x1="64" y1="228" x2="${W - 64}" y2="228" stroke="${c.accent}" stroke-opacity="0.3"/>
  <text x="${W - 64}" y="258" text-anchor="end" ${mono} font-size="12" fill="${c.text}" opacity="0.5" letter-spacing="2">◆ ${esc(m.themeName.toUpperCase())} · ${m.mode.toUpperCase()}</text>
  `, c);
}

// ── BIRTHDAY · CYAN · "celebration" (center burst + sparkles + confetti) ─
function celebration(id, c, m) {
  const sparkles = Array.from({ length: 14 }).map((_, i) => {
    const x = 40 + (i * 83) % (W - 80);
    const y = 25 + ((i * 47) % (H - 50));
    const r = 1.5 + (i % 3);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? c.accent2 : (c.accent3 || c.accent2)}" opacity="${0.4 + (i % 5) * 0.1}"/>`;
  }).join('');
  const confetti = Array.from({ length: 10 }).map((_, i) => {
    const x = 30 + (i * 113) % (W - 60);
    const y = 15 + (i * 71) % (H - 30);
    const s = 5 + (i % 3) * 2;
    const rot = (i * 37) % 360;
    const fill = i % 3 === 0 ? c.accent3 || c.accent2 : c.accent2;
    return `<polygon points="0,-${s} ${s},${s} -${s},${s}" fill="${fill}" opacity="0.5" transform="translate(${x},${y}) rotate(${rot})"/>`;
  }).join('');
  return frame(`
  ${baseDefs(c, id)}
  <circle cx="${W / 2}" cy="150" r="260" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  ${sparkles}${confetti}
  <text x="${W / 2}" y="70" text-anchor="middle" ${font} font-size="20" font-weight="700" fill="${c.accent3 || c.accent2}" letter-spacing="4">✦ HAPPY BIRTHDAY ✦</text>
  <circle cx="${W / 2}" cy="150" r="70" fill="none" stroke="url(#grad-${id})" stroke-width="3.5"/>
  <circle cx="${W / 2}" cy="150" r="70" fill="${c.bg}" fill-opacity="0.4"/>
  <text x="${W / 2}" y="163" text-anchor="middle" ${font} font-size="40" font-weight="700" fill="${c.accent2}">${esc(initials(m.identity.name))}</text>
  <text x="${W / 2}" y="235" text-anchor="middle" ${font} font-size="26" font-weight="700" fill="${c.text}">${esc(m.identity.name)}</text>
  <text x="${W / 2}" y="260" text-anchor="middle" ${mono} font-size="13" fill="${c.accent2}" letter-spacing="2">${esc(m.roleForDay.toUpperCase())}</text>
  `, c);
}

function monogramCorner(c) {
  return `<text x="${W - 30}" y="30" text-anchor="end" ${mono} font-size="11" fill="${c.text}" opacity="0.35" letter-spacing="1">VS</text>`;
}

const LAYOUTS = { split, centered, showcase, editorial, asymmetric, dashboard, stealth, celebration };

/**
 * @param {object} theme  one entry from config.themes[key]
 * @param {'day'|'night'} mode
 * @param {object} identity  config.identity
 * @returns {string} SVG markup
 */
function generateHero(theme, mode, identity) {
  const c = theme[mode];
  const id = `${theme.key}-${mode}`;
  const fn = LAYOUTS[theme.layout] || centered;
  const m = { identity, mode, themeName: theme.themeName, quote: theme.quote, roleForDay: theme.roleForDay };
  return fn(id, c, m);
}

module.exports = { generateHero, LAYOUTS };
