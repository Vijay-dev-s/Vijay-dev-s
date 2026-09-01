#!/usr/bin/env node
'use strict';
/**
 * node scripts/validate.js
 *
 * Validates the CURRENT state of README.md + assets/ in this repo root
 * (wherever this script lives — repo-local, same convention as generate.js).
 * Exits non-zero if anything is wrong, so CI can fail the workflow instead
 * of committing a broken README.
 */

const path = require('path');
const { runValidation } = require('./lib/validate');

const ROOT = path.join(__dirname, '..');
const report = runValidation(ROOT);

function line(ok, label, detail) {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail !== undefined ? ': ' + detail : ''}`);
}

console.log(`\nValidating ${ROOT}\n${'-'.repeat(40)}`);

if (!report.readmeExists) {
  line(false, 'README.md exists', report.error);
  process.exit(1);
}

line(true, 'README.md found');
line(true, 'Image references found', report.imageRefsFound);
line(true, 'Local assets resolved', report.localAssetsFound);
line(report.missingAssets.length === 0, 'Missing assets', report.missingAssets.length);
report.missingAssets.forEach(a => console.log(`    ✗ missing: ${a}`));

line(report.invalidSvgs.length === 0, 'Invalid SVGs', report.invalidSvgs.length);
report.invalidSvgs.forEach(({ file, problems }) => {
  console.log(`    ✗ ${file}:`);
  problems.forEach(p => console.log(`        - ${p}`));
});

line(report.externalWidgetsFound.length === 0, 'External statistic widgets', report.externalWidgetsFound.length);
report.externalWidgetsFound.forEach(w => console.log(`    ✗ found: ${w}`));

line(report.privateInfoFound.length === 0, 'Private information found', report.privateInfoFound.length);
report.privateInfoFound.forEach(p => console.log(`    ✗ ${p}`));

line(report.oldUsernameFound.length === 0, 'Old username references', report.oldUsernameFound.length);
report.oldUsernameFound.forEach(u => console.log(`    ✗ found: ${u}`));

console.log('-'.repeat(40));
if (report.ok) {
  console.log('✓ ALL CHECKS PASSED\n');
  process.exit(0);
} else {
  console.log('✗ VALIDATION FAILED — see ✗ items above\n');
  process.exit(1);
}
