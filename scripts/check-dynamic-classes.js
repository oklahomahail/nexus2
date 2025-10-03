#!/usr/bin/env node
const { execSync } = require("node:child_process");
const fs = require("fs");

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function getChangedFiles() {
  // Try diff vs origin/main; fall back to last commit
  sh("git fetch origin main --depth=1");
  const base = sh("git merge-base HEAD origin/main");
  const diff = base
    ? sh(`git diff --name-only --diff-filter=ACMRTUXB ${base}...HEAD`)
    : sh("git diff --name-only --diff-filter=ACMRTUXB HEAD~1...HEAD");
  return diff
    .split("\n")
    .filter(Boolean)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
}

const checkAll = process.env.CHECK_TW_CHANGED_ONLY === "0";
const files = checkAll
  ? require("fast-glob").sync(["src/**/*.{ts,tsx}"], { dot: false })
  : getChangedFiles();

if (files.length === 0) {
  console.log("No files to check (changed-files mode).");
  process.exit(0);
}

const pattern = /className\s*=\s*{`[^`]*\$\{[^`]+}[^`]*`}/m;
const offenders = [];
for (const f of files) {
  let s = "";
  try {
    s = fs.readFileSync(f, "utf8");
  } catch {}
  if (pattern.test(s)) offenders.push(f);
}

if (offenders.length) {
  console.error(
    "Dynamic Tailwind template literals detected in changed files:",
  );
  for (const f of offenders) console.error(` - ${f}`);
  process.exit(1);
}
console.log("✓ No dynamic Tailwind template literals in changed files.");
