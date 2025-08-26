#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

const files = fg.sync(["src/**/*.{ts,tsx,js,jsx}"], { dot: false });

const risky = [
  // Template literal with interpolation inside className
  /className\s*=\s*{`[^`]*\$\{[^`]+}[^`]*`}/m,
  // String concatenation inside className
  /className\s*=\s*{[^}]*(['"][^'"]*['"]\s*\+\s*| \+\s*['"][^'"]*['"])[^}]*}/m,
  // Dynamic tailwind prefix fragments like bg-${...}, text-${...}, etc.
  /(bg|text|border|ring|shadow|w|h|p|m|grid-cols|col-span|gap|rounded)-\$\{/m,
  /`grid-cols-\$\{[^}]+\}`/m,
  /`col-span-\$\{[^}]+\}`/m,
];

let errors = [];
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const re of risky) {
    if (re.test(src)) {
      errors.push({ file, pattern: re.source });
    }
  }
}

if (errors.length) {
  console.error("Dynamic Tailwind class patterns detected:");
  for (const e of errors) console.error(` - ${e.file}  [${e.pattern}]`);
  process.exit(1);
} else {
  console.log("No risky dynamic Tailwind classes found.");
}
