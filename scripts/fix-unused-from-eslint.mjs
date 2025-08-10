// scripts/fix-unused-from-eslint.mjs
// Usage:
//   pnpm lint:json
//   node scripts/fix-unused-from-eslint.mjs .eslint-unused.json
//   (or just `pnpm fix:unused` with your package.json scripts)
//
// What it does:
// 1) Prefixes unused identifiers from the ESLint JSON report with "_".
// 2) Wraps known fire-and-forget calls with `void ` (configurable list).
// 3) Rewrites `.hasOwnProperty(` to `Object.prototype.hasOwnProperty.call(` safely.

import fs from "fs";
import path from "path";
import glob from "fast-glob";

const [, , reportPath] = process.argv;

// ------- Config -------
const SRC_GLOB = "src/**/*.{ts,tsx}";

// Known "fire-and-forget" call names to prefix with `void ` when they are
// used as standalone statements (not awaited, not assigned, not returned).
// Add more as you see them in lints.
const FIRE_AND_FORGET_FUNCS = [
  "refreshCampaigns",
  "loadSavedSessions",
  "saveSession",
  // Add any others here:
  // "trackEvent",
  // "logMetric",
];

// Regex to detect standalone calls to any of the above (idempotent).
const fireAndForgetPattern = new RegExp(
  // Start of line (allow whitespace), not 'await', 'return', or 'void',
  // then one of the function names followed by '(' ... ');' to end line.
  String.raw`^(?!\s*(?:await|return|void)\b)\s*(?:${FIRE_AND_FORGET_FUNCS.map(escapeRegExp).join("|")})\s*\([^;]*\);\s*$`,
);

// Replace obj.hasOwnProperty(key) → Object.prototype.hasOwnProperty.call(obj, key)
// Conservative: matches simple/typical object expressions.
const hasOwnPropPattern =
  /([A-Za-z_$][\w$.\]\)\[\s]*)\.hasOwnProperty\s*\(\s*([^)]+?)\s*\)/g;

// ------- Helpers -------
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// Collect edits per file from ESLint JSON (unused vars/params)
function collectUnusedEdits(eslintJson) {
  const UNUSED_RULES = new Set([
    "no-unused-vars",
    "@typescript-eslint/no-unused-vars",
  ]);
  const fileEdits = new Map();

  if (!Array.isArray(eslintJson)) return fileEdits;

  for (const res of eslintJson) {
    const { filePath, messages } = res || {};
    if (!filePath || !Array.isArray(messages)) continue;

    const edits = [];
    for (const m of messages) {
      if (!UNUSED_RULES.has(m.ruleId)) continue;
      const match = m.message?.match(/'([^']+)' is defined but never used/);
      const id = match ? match[1] : null;
      if (!id) continue;
      edits.push({
        line: m.line,
        column: m.column,
        id,
      });
    }
    if (edits.length) fileEdits.set(filePath, edits);
  }
  return fileEdits;
}

function applyUnusedPrefixes(filePath, edits) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  // Apply bottom-up so positions remain valid
  const sorted = [...edits].sort(
    (a, b) => b.line - a.line || b.column - a.column,
  );
  let changed = false;

  for (const e of sorted) {
    const i = e.line - 1;
    if (!lines[i]) continue;
    const before = lines[i].slice(0, e.column - 1);
    const after = lines[i].slice(e.column - 1);

    // Avoid double prefix
    if (after.startsWith(`_${e.id}`)) continue;

    // Replace the first exact identifier occurrence following the column
    const pattern = new RegExp(`\\b${escapeRegExp(e.id)}\\b`);
    const replaced = after.replace(pattern, `_${e.id}`);
    if (replaced !== after) {
      lines[i] = before + replaced;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    logChanged(filePath, "prefixed unused identifiers");
  }
}

function applyFireAndForgetAndHasOwnPropertyFixes(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const lines = original.split("\n");
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip import/export lines and type-only lines; we only want statements.
    if (/^\s*(import|export)\b/.test(line)) continue;

    // 1) Fire-and-forget → prefix with `void `
    if (fireAndForgetPattern.test(line)) {
      // Idempotent: if already void/await/return, we wouldn't match. So safe to prefix.
      line = line.replace(/^\s*/, (ws) => `${ws}void `);
      changed = true;
    }

    // 2) hasOwnProperty → safe call
    const replaced = line.replace(hasOwnPropPattern, (_, objExpr, keyExpr) => {
      const obj = objExpr.trim();
      const key = keyExpr.trim();
      return `Object.prototype.hasOwnProperty.call(${obj}, ${key})`;
    });
    if (replaced !== line) {
      line = replaced;
      changed = true;
    }

    lines[i] = line;
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    logChanged(filePath, "fire-and-forget + hasOwnProperty fixes");
  }
}

function logChanged(filePath, what) {
  console.log(`✅ ${what} in ${path.relative(process.cwd(), filePath)}`);
}

// ------- Main -------
const eslintJson =
  reportPath && fs.existsSync(reportPath) ? readJsonSafe(reportPath) : null;
const unusedByFile = eslintJson ? collectUnusedEdits(eslintJson) : new Map();

// 1) Prefix unused vars/params where ESLint pointed us
for (const [filePath, edits] of unusedByFile.entries()) {
  if (!/\.tsx?$/.test(filePath)) continue;
  if (!fs.existsSync(filePath)) continue;
  applyUnusedPrefixes(filePath, edits);
}

// 2) Apply codebase-wide safe fixes (fire-and-forget + hasOwnProperty)
const candidates = glob.sync(SRC_GLOB, { dot: false });
for (const filePath of candidates) {
  applyFireAndForgetAndHasOwnPropertyFixes(filePath);
}

console.log("Done.");
