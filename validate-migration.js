#!/usr/bin/env node
const _fs = require("fs");
const _path = require("path");

function log(message, level = "info") {
  const colors = {
    info: "[36m",
    success: "[32m",
    warning: "[33m",
    error: "[31m",
  };
  console.log(`${colors[level]}[${level.toUpperCase()}][0m ${message}`);
}

function quickValidation() {
  log("🔍 Running migration validation...", "info");

  let errorCount = 0;
  let _warningCount = 0;

  // Check for StatCard issues
  try {
    const result = require("child_process").execSync(
      'grep -r "StatCard" src/ --include="*.tsx" --include="*.ts"',
      { encoding: "utf8" },
    );
    if (result.trim()) {
      log("ERROR: Found StatCard usage", "error");
      errorCount++;
    }
  } catch {
    // No matches found, which is good
  }

  // Check for MetricCard issues
  try {
    const result = require("child_process").execSync(
      'grep -r "MetricCard" src/ --include="*.tsx" --include="*.ts"',
      { encoding: "utf8" },
    );
    if (result.trim()) {
      log("ERROR: Found MetricCard usage", "error");
      errorCount++;
    }
  } catch {
    // No matches found, which is good
  }

  log(`Errors: ${errorCount}`, errorCount > 0 ? "error" : "success");
  return errorCount === 0;
}

const success = quickValidation();
process.exit(success ? 0 : 1);
