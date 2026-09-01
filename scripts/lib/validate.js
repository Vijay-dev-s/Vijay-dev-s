'use strict';
/**
 * Everything needed to answer "does the generated profile actually work",
 * not just "did the generator script exit 0". Used by scripts/validate.js
 * (human-readable report) and by CI (fails the workflow on any problem).
 */

const fs = require('fs');
const path = require('path');

const MIN_SVG_DIMENSION = 10; // px in viewBox units — below this is "suspiciously tiny"

// Known unreliable third-party GitHub statistics services. These are
// legitimate/real (not fake), but this project intentionally does not
// depend on them — see README.md item on external widgets.
const EXTERNAL_STAT_WIDGET_HOSTS = [
  'github-readme-stats.vercel.app',
  'github-readme-streak-stats.herokuapp.com',
  'github-profile-trophy.vercel.app',
];

// The old identity that must never appear anywhere in the generated profile.
const OLD_USERNAME = 'Vijaypope';

// Direct, specific private-data check rather than a broad phone-number regex
// (which would false-positive on dates like "2021-2025" or version strings).
const KNOWN_PRIVATE_STRINGS = ['9342037610', '+919342037610'];
const EMAIL_PATTERN = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const SECRET_PATTERNS = [
  { name: 'GitHub token', re: /gh[pousr]_[A-Za-z0-9]{20,}/g },
  { name: 'GitLab token', re: /glpat-[A-Za-z0-9_-]{10,}/g },
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/g },
  { name: 'generic secret assignment', re: /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"'\s]{8,}["']/gi },
];

function findImageRefs(readmeText) {
  const refs = new Set();
  const htmlImg = /<img[^>]+src="([^"]+)"/g;
  const mdImg = /!\[[^\]]*\]\(([^)\s]+)\)/g;
  let m;
  while ((m = htmlImg.exec(readmeText))) refs.add(m[1]);
  while ((m = mdImg.exec(readmeText))) refs.add(m[1]);
  return [...refs];
}

function isExternal(ref) { return /^https?:\/\//i.test(ref); }

function validateSvgContent(svgText, filePath) {
  const problems = [];
  const trimmed = svgText.trim();
  if (trimmed.length === 0) { problems.push('file is empty'); return problems; }
  if (!/^<svg[\s>]/.test(trimmed)) problems.push('does not start with <svg> (malformed root element)');
  if (!/<\/svg>\s*$/.test(trimmed)) problems.push('does not end with </svg> (malformed/truncated)');
  const openCount = (trimmed.match(/<svg[\s>]/g) || []).length;
  const closeCount = (trimmed.match(/<\/svg>/g) || []).length;
  if (openCount !== closeCount) problems.push(`unbalanced <svg> tags (${openCount} open, ${closeCount} close)`);

  const viewBoxMatch = trimmed.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    problems.push('missing viewBox attribute');
  } else {
    const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) {
      problems.push(`invalid viewBox value: "${viewBoxMatch[1]}"`);
    } else {
      const [, , vbW, vbH] = parts;
      if (vbW < MIN_SVG_DIMENSION || vbH < MIN_SVG_DIMENSION) {
        problems.push(`suspiciously tiny viewBox dimensions (${vbW}x${vbH})`);
      }
    }
  }
  return problems;
}

/**
 * @param {string} repoRoot  the repo root to validate (e.g. github-profile/)
 * @returns {object} full report
 */
function runValidation(repoRoot) {
  const readmePath = path.join(repoRoot, 'README.md');
  const report = {
    repoRoot,
    readmeExists: fs.existsSync(readmePath),
    imageRefsFound: 0,
    localAssetsFound: 0,
    missingAssets: [],
    invalidSvgs: [],
    externalWidgetsFound: [],
    privateInfoFound: [],
    oldUsernameFound: [],
    ok: true,
  };

  if (!report.readmeExists) {
    report.ok = false;
    report.error = `README.md not found at ${readmePath}`;
    return report;
  }

  const readmeText = fs.readFileSync(readmePath, 'utf8');
  const refs = findImageRefs(readmeText);
  report.imageRefsFound = refs.length;

  for (const ref of refs) {
    if (isExternal(ref)) {
      const host = (ref.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
      if (EXTERNAL_STAT_WIDGET_HOSTS.some(h => host.includes(h))) {
        report.externalWidgetsFound.push(ref);
      }
      continue; // external, non-widget (e.g. shields.io badges) — not a broken-asset concern
    }
    const fullPath = path.join(repoRoot, ref);
    if (!fs.existsSync(fullPath)) {
      report.missingAssets.push(ref);
      continue;
    }
    report.localAssetsFound++;
    if (ref.endsWith('.svg')) {
      const svgText = fs.readFileSync(fullPath, 'utf8');
      const problems = validateSvgContent(svgText, fullPath);
      if (problems.length) report.invalidSvgs.push({ file: ref, problems });
    }
  }

  // Private info + old username scan — README plus every generated SVG
  const scanTargets = [readmeText, ...refs.filter(r => !isExternal(r) && fs.existsSync(path.join(repoRoot, r)))
    .map(r => fs.readFileSync(path.join(repoRoot, r), 'utf8'))];
  const allText = scanTargets.join('\n');

  for (const needle of KNOWN_PRIVATE_STRINGS) {
    if (allText.includes(needle)) report.privateInfoFound.push(`known private string: "${needle}"`);
  }
  const emails = allText.match(EMAIL_PATTERN) || [];
  for (const e of [...new Set(emails)]) report.privateInfoFound.push(`email address present: ${e}`);
  for (const { name, re } of SECRET_PATTERNS) {
    const hits = allText.match(re) || [];
    if (hits.length) report.privateInfoFound.push(`possible ${name} (${hits.length} match(es))`);
  }
  if (allText.toLowerCase().includes(OLD_USERNAME.toLowerCase())) {
    report.oldUsernameFound.push(OLD_USERNAME);
  }

  report.ok = report.missingAssets.length === 0
    && report.invalidSvgs.length === 0
    && report.externalWidgetsFound.length === 0
    && report.privateInfoFound.length === 0
    && report.oldUsernameFound.length === 0;

  return report;
}

module.exports = { runValidation, findImageRefs, validateSvgContent, OLD_USERNAME };
