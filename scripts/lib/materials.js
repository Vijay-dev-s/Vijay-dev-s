'use strict';
/**
 * Each theme has a `panelStyle` (brutalist/glass/organic/swiss/editorial/
 * aurora/cybercore/y2k). This module is the ONE place that decides what a
 * "panel" physically looks like for that style — flat hard-shadow block,
 * frosted glass, organic blob, thin Swiss rule, bare editorial rule, soft
 * aurora glow, glitch-framed terminal, or chrome Y2K capsule.
 *
 * svg-components.js and svg-hero.js both call panelMaterial(style, w, h, c, id)
 * for every panel/hero frame they draw, so the SAME theme automatically gets
 * a consistent surface language everywhere — not just in the hero.
 *
 * Returns { canvasW, canvasH, contentX, contentY, defs, bg, fg }
 *   canvasW/H  — the actual <svg> size needed (may exceed w,h for styles
 *                that need bleed room, e.g. brutalist's offset shadow)
 *   contentX/Y — where the "front" content area starts (usually 0,0)
 *   defs       — extra <defs> markup (gradients/filters), unique per `id`
 *   bg         — markup drawn BEHIND the inner content
 *   fg         — markup drawn ON TOP of the inner content (borders, scanlines, stars)
 */

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const mono = `font-family="'JetBrains Mono', ui-monospace, monospace"`;

// ── NEO-BRUTALISM (Monday) — flat, hard-edged, offset hard shadow, no blur ─
function brutalist(w, h, c, id) {
  const off = 9;
  return {
    canvasW: w + off, canvasH: h + off, contentX: 0, contentY: 0,
    defs: '',
    bg: `
    <rect x="${off}" y="${off}" width="${w}" height="${h}" fill="${c.text}" opacity="0.9"/>
    <rect x="0" y="0" width="${w}" height="${h}" fill="${c.bg}" stroke="${c.accent}" stroke-width="4"/>
    <rect x="0" y="0" width="18" height="${h}" fill="${c.accent}"/>`,
    fg: `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${c.text}" stroke-width="1" stroke-opacity="0.4"/>`,
  };
}

// ── LIQUID GLASS (Tuesday) — frosted translucency, one clean material ─────
function glass(w, h, c, id) {
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    clipId: `clip-${id}`,
    defs: `
    <clipPath id="clip-${id}"><rect x="0" y="0" width="${w}" height="${h}" rx="20"/></clipPath>
    <linearGradient id="glass-sheen-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glass-border-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.accent2}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0.25"/>
    </linearGradient>`,
    bg: `
    <rect x="0" y="0" width="${w}" height="${h}" rx="20" fill="${c.surface}"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="20" fill="url(#glass-sheen-${id})"/>`,
    fg: `
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="19" fill="none" stroke="url(#glass-border-${id})" stroke-width="1.5"/>`,
  };
}

// ── ORGANIC TECH (Wednesday) — asymmetric blob outline, branch veins ──────
function organic(w, h, c, id) {
  const r = Math.min(w, h) * 0.09;
  const path = `M ${r},0 L ${w - r * 1.6},0 Q ${w},0 ${w},${r} L ${w},${h - r} Q ${w},${h} ${w - r},${h} L ${r * 1.4},${h} Q 0,${h} 0,${h - r * 1.3} L 0,${r} Q 0,0 ${r},0 Z`;
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    clipId: `clip-${id}`,
    defs: `<clipPath id="clip-${id}"><path d="${path}"/></clipPath><linearGradient id="org-grad-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.accent}" stop-opacity="0.12"/><stop offset="100%" stop-color="${c.accent2}" stop-opacity="0.04"/></linearGradient>`,
    bg: `<path d="${path}" fill="${c.bg}"/><path d="${path}" fill="url(#org-grad-${id})"/>`,
    fg: `
    <path d="${path}" fill="none" stroke="${c.accent}" stroke-opacity="0.4" stroke-width="1.5"/>
    <path d="M 0,${h * 0.7} Q ${w * 0.15},${h * 0.6} ${w * 0.1},${h * 0.4}" fill="none" stroke="${c.accent2}" stroke-opacity="0.3" stroke-width="1"/>
    <circle cx="${w * 0.1}" cy="${h * 0.4}" r="2.5" fill="${c.accent2}" opacity="0.5"/>`,
  };
}

// ── SWISS EDITORIAL (Thursday) — no box, grid rules, registration marks ───
function swiss(w, h, c, id) {
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    defs: '',
    bg: `<rect x="0" y="0" width="${w}" height="${h}" fill="${c.bg}"/>`,
    fg: `
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${c.text}" stroke-opacity="0.25" stroke-width="1"/>
    <line x1="0" y1="0" x2="10" y2="0" stroke="${c.accent}" stroke-width="2"/>
    <line x1="0" y1="0" x2="0" y2="10" stroke="${c.accent}" stroke-width="2"/>
    <line x1="${w - 10}" y1="${h}" x2="${w}" y2="${h}" stroke="${c.accent}" stroke-width="2"/>
    <line x1="${w}" y1="${h - 10}" x2="${w}" y2="${h}" stroke="${c.accent}" stroke-width="2"/>`,
  };
}

// ── LUXURY EDITORIAL (Friday) — bare page, one gold rule, no card at all ──
function editorial(w, h, c, id) {
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    defs: '',
    bg: `<rect x="0" y="0" width="${w}" height="${h}" fill="${c.bg}"/>`,
    fg: `<line x1="0" y1="1" x2="${w}" y2="1" stroke="${c.accent}" stroke-width="2"/>`,
  };
}

// ── AURORA UI (Saturday) — floating panel, layered painterly glow waves ───
function aurora(w, h, c, id) {
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    clipId: `clip-${id}`,
    defs: `
    <clipPath id="clip-${id}"><rect x="0" y="0" width="${w}" height="${h}" rx="22"/></clipPath>
    <linearGradient id="aur1-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c.accent}" stop-opacity="0.35"/><stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/></linearGradient>
    <linearGradient id="aur2-${id}" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c.accent2}" stop-opacity="0.3"/><stop offset="100%" stop-color="${c.accent2}" stop-opacity="0"/></linearGradient>`,
    bg: `
    <rect x="0" y="0" width="${w}" height="${h}" rx="22" fill="${c.surface}"/>
    <path d="M 0,${h * 0.2} Q ${w * 0.3},${-h * 0.1} ${w * 0.6},${h * 0.15} T ${w},${h * 0.05} L ${w},0 L 0,0 Z" fill="url(#aur1-${id})"/>
    <path d="M 0,${h} Q ${w * 0.4},${h * 1.15} ${w * 0.7},${h * 0.85} T ${w},${h} Z" fill="url(#aur2-${id})"/>`,
    fg: `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="21" fill="none" stroke="${c.accent2}" stroke-opacity="0.35" stroke-width="1"/>`,
  };
}

// ── CYBERCORE (Sunday) — glitch fragments, scanlines, terminal brackets ───
function cybercore(w, h, c, id) {
  const scanlines = Array.from({ length: Math.floor(h / 6) }, (_, i) =>
    `<line x1="0" y1="${i * 6}" x2="${w}" y2="${i * 6}" stroke="${c.accent}" stroke-opacity="0.035" stroke-width="1"/>`
  ).join('');
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    defs: '',
    bg: `<rect x="0" y="0" width="${w}" height="${h}" fill="${c.bg}"/>${scanlines}`,
    fg: `
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${c.accent2}" stroke-width="1" stroke-opacity="0.6"/>
    <rect x="${w - 26}" y="6" width="14" height="3" fill="${c.accent2}" opacity="0.7"/>
    <rect x="${w - 42}" y="6" width="8" height="3" fill="${c.accent}" opacity="0.5"/>
    <text x="8" y="${h - 6}" ${mono} font-size="8" fill="${c.accent2}" opacity="0.5">0x${id.length.toString(16).padStart(2, '0')}</text>
    <path d="M 0,0 L 12,0 L 12,2 L 2,2 L 2,12 L 0,12 Z" fill="${c.accent2}" opacity="0.8"/>
    <path d="M ${w},${h} L ${w - 12},${h} L ${w - 12},${h - 2} L ${w - 2},${h - 2} L ${w - 2},${h - 12} L ${w},${h - 12} Z" fill="${c.accent2}" opacity="0.8"/>`,
  };
}

// ── Y2K VAPORWAVE (Birthday) — chrome capsule, gloss highlight, sparkle ───
function y2k(w, h, c, id) {
  return {
    canvasW: w, canvasH: h, contentX: 0, contentY: 0,
    clipId: `clip-${id}`,
    defs: `
    <clipPath id="clip-${id}"><rect x="0" y="0" width="${w}" height="${h}" rx="${h * 0.14}"/></clipPath>
    <linearGradient id="chrome-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.accent2}" stop-opacity="0.9"/>
      <stop offset="15%" stop-color="${c.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0.15"/>
    </linearGradient>`,
    bg: `<rect x="0" y="0" width="${w}" height="${h}" rx="${h * 0.14}" fill="${c.surface}"/>`,
    fg: `
    <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${h * 0.13}" fill="none" stroke="url(#chrome-${id})" stroke-width="2.5"/>
    <ellipse cx="${w * 0.28}" cy="6" rx="${w * 0.22}" ry="5" fill="#ffffff" opacity="0.35"/>
    <text x="${w - 16}" y="18" text-anchor="end" font-size="12" fill="${c.accent2}" opacity="0.8">✦</text>`,
  };
}

const MATERIALS = { brutalist, glass, organic, swiss, editorial, aurora, cybercore, y2k };

function panelMaterial(style, w, h, c, id) {
  const fn = MATERIALS[style] || glass;
  return fn(w, h, c, id);
}

module.exports = { panelMaterial };
