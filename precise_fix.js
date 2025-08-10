#!/usr/bin/env node

const fs = require("fs");

function fixAppTsx() {
  const filePath = "src/App.tsx";
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");

  // The issue: missing "return (" before the JSX
  // We need to find where the return statement should be and add it

  // Look for the pattern where JSX starts without return
  content = content.replace(/(\s+)<Suspense/, "$1return (\n$1  <Suspense");

  // Also ensure the closing is properly formatted
  content = content.replace(
    /(\s+)<\/Suspense>\s+<\/div>\s+\);\s+}/,
    "$1</Suspense>\n$1</div>\n  );\n}",
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Fixed ${filePath}`);
}

function fixMessagingAssistPanel() {
  const filePath = "src/panels/MessagingAssistPanel.tsx";
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");

  // Issue 1: First orphaned closing around line 65-66
  // This suggests there's a missing return ( somewhere before

  // Issue 2: Duplicate function declaration on line 67
  // The export should be at the top, not in the middle

  // Let's rebuild this properly by finding the function start and fixing structure
  content = content.replace(
    /(<\/button>\s+<\/div>\s+\);\s+)(export default function MessagingAssistantPanel\(\): React\.ReactElement \{\s+<div)/,
    "$1\n}\n\n$2",
  );

  // Fix the first return statement
  content = content.replace(
    /(function MessagingAssistantPanel[^{]*\{)\s*(<div className="max-w-6xl)/,
    "$1\n  return (\n    $2",
  );

  // Fix orphaned closing at line 223-224
  content = content.replace(/(\s+)<\/div>\s+\);\s+}/, "$1</div>\n  );\n}");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Fixed ${filePath}`);
}

function fixAnalyticsService() {
  const filePath = "src/services/analyticsService.ts";
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");

  // Remove the extra closing braces that were added by mistake
  content = content.replace(
    /(return Math\.abs\(hash\) \/ 2147483648; \/\/ Normalize to 0-1\s+}\s+)(\s+\};\s+\})/,
    "$1",
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Fixed ${filePath}`);
}

function main() {
  console.log("🔧 Applying precise fixes...\n");

  try {
    fixAppTsx();
    fixMessagingAssistPanel();
    fixAnalyticsService();

    console.log("\n✨ All fixes applied!");
    console.log("\n🧪 Run `pnpm typecheck` to verify.");
  } catch (error) {
    console.error("❌ Error applying fixes:", error.message);
    console.log("\n📝 You may need to manually fix the remaining issues.");
    console.log("The main problems are:");
    console.log('1. App.tsx needs a "return (" before the JSX');
    console.log(
      "2. MessagingAssistPanel.tsx has structural issues with function declarations",
    );
    console.log("3. analyticsService.ts has extra closing braces");
  }
}

if (require.main === module) {
  main();
}
