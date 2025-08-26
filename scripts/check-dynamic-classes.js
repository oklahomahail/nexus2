#!/usr/bin/env node
const { execSync } = require("node:child_process");
const fs = require("fs");

function sh(cmd) {
  return execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] })
    .toString()
    .trim();
}

function getChangedFiles() {
  // Prefer merge-base with origin/main; fall back to previous commit
  try {
    try { sh("git fetch origin main --depth=1"); } catch {}
    const base = sh("git merge-base HEAD origin/main");
    const diff = sh(`git diff --name-only --diff-filter=ACMRTUXB ${base}...HEAD`);
    return diff.split("\n").filter((f) => f && (f.endsWith(".tsx") || f.endsWith(".ts")));
  } catch {
    try {
      const diff = sh("git diff --name-only --diff-filter=ACMRTUXB HEAD~1...HEAD");
      return diff.split("\n").filter((f) => f && (f.endsWith(".tsx") || f.endsWith(".ts")));
    } catch {
      return [];
    }
  }
}

const files =
  process.env.CHECK_TW_CHANGED_ONLY === "0"
    ? require("fast-glob").sync(["src/**/*.{ts,tsx}"], { dot: false })
    : getChangedFiles();

if (files.length === 0) {
  console.log("No files to check (changed-only mode).");
  process.exit(0);
}

const pattern = /className\s*=\s*{`[^`]*\$\{[^`]+}[^`]*`}/m;
const offenders = [];

for (const f of files) {
  let s;
  try { s = fs.readFileSync(f, "utf8"); } catch { continue; }
  if (pattern.test(s)) offenders.push(f);
}

if (offenders.length) {
  console.error("Dynamic Tailwind class template literals detected in changed files:");
  for (const f of offenders) console.error(` - ${f}`);
  process.exit(1);
}

console.log("✓ No dynamic Tailwind class template literals in changed files.");
