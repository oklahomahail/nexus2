#!/usr/bin/env node
/**
 * Lazy-load selected imports in a TSX file.
 *
 * Usage:
 *   node scripts/lazyify-panels.mjs src/components/AppContent.tsx
 *
 * What it does:
 * - For each target in TARGETS, replaces:
 *     import Foo from '@/panels/Foo';
 *   with:
 *     const Foo = React.lazy(() => import('@/panels/Foo'));
 * - Ensures React + Suspense are imported.
 *
 * Non-destructive: creates a .bak next to the file.
 */

import fs from "node:fs";
import path from "node:path";

const filePath = process.argv[2] || "src/components/AppContent.tsx";

// Adjust this list to your app
const TARGETS = [
  { name: "DashboardPanel", from: "@/panels/DashboardPanel" },
  { name: "AnalyticsDashboard", from: "@/panels/AnalyticsDashboard" },
  { name: "CampaignsPanel", from: "@/panels/CampaignsPanel" },
  { name: "MessagingAssistPanel", from: "@/panels/MessagingAssistPanel" },
  // optional modal on-demand
  { name: "CampaignModal", from: "@/components/CampaignModal" },
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}
function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

let src = read(filePath);
write(filePath + ".bak", src);

// 1) Remove matching static imports and collect which we converted
const converted = new Set();
for (const { name, from } of TARGETS) {
  // matches: import Name from 'from';
  const importRegex = new RegExp(
    String.raw`^\s*import\s+${name}\s+from\s+['"]${from}['"];?\s*$`,
    "m",
  );
  if (importRegex.test(src)) {
    src = src.replace(importRegex, "");
    converted.add(name);

    // Insert a lazy const after the last import (we’ll place them together later)
  }
}

// 2) Ensure React import has Suspense
// Cases:
//   import React from 'react';
//   import React, { Suspense } from 'react';
//   import React, { useState } from 'react';
// Normalize to: import React, { Suspense, ...existing } from 'react';
const reactImportRegex =
  /^\s*import\s+React(?:\s*,\s*\{([^}]*)\})?\s+from\s+['"]react['"];?\s*$/m;
if (reactImportRegex.test(src)) {
  src = src.replace(reactImportRegex, (full, group) => {
    const items = new Set(
      (group || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    items.add("Suspense");
    const rest = items.size ? `, { ${Array.from(items).join(", ")} }` : "";
    return `import React${rest} from 'react';`;
  });
} else {
  // No React import at all — add it at the top
  src = `import React, { Suspense } from 'react';\n` + src;
}

// 3) Find last import line to insert lazy consts after it
const importBlockRegex = /^(?:\s*import[\s\S]+?;\s*)+/m;
let insertionIndex = 0;
{
  const allImports = [...src.matchAll(/^\s*import[\s\S]*?;$/gm)];
  if (allImports.length) {
    const last = allImports[allImports.length - 1];
    insertionIndex = last.index + last[0].length;
  }
}

// 4) Build lazy consts for converted names (keeping their original spec)
const lazyLines = [];
for (const { name, from } of TARGETS) {
  if (converted.has(name)) {
    lazyLines.push(`const ${name} = React.lazy(() => import('${from}'));`);
  }
}
if (lazyLines.length) {
  const before = src.slice(0, insertionIndex);
  const after = src.slice(insertionIndex);
  src = `${before}\n${lazyLines.join("\n")}\n${after}`;
}

// 5) Tidy: collapse blank lines
src = src.replace(/\n{3,}/g, "\n\n");

write(filePath, src);
console.log(
  `✅ Converted imports to lazy in ${path.relative(process.cwd(), filePath)}.`,
);
console.log(
  `ℹ️  A backup was saved as ${path.relative(process.cwd(), filePath + ".bak")}.`,
);
console.log(`👉 Remember to render these inside <Suspense fallback={...}>.`);
