#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Map of underscore props to standard props
const propMappings = {
  _onClick: "onClick",
  _className: "className",
  _onFiltersChange: "onFiltersChange",
  _onViewCampaign: "onViewCampaign",
  _onCreateCampaign: "onCreateCampaign",
  _text: "text",
  _type: "type",
  _data: "data",
  _height: "height",
};

// Files to process based on the errors
const filesToProcess = [
  "src/components/AnalyticsFiltersComponent.tsx",
  "src/components/CampaignList.tsx",
  "src/components/CampaignQuickCard.tsx",
  "src/components/LoadingSpinner.tsx",
  "src/components/PerformanceChart.tsx",
  "src/components/DonorInsightsPanel.tsx",
];

function fixUnderscoreProps(content) {
  let fixedContent = content;

  // Fix prop destructuring in component definitions
  // e.g., { _onClick, _className }: Props -> { onClick, className }: Props
  Object.entries(propMappings).forEach(([underscore, standard]) => {
    // Fix destructuring assignments
    const destructuringRegex = new RegExp(
      `\\b${underscore.replace("_", "_")}\\b(?=\\s*[,}])`,
      "g",
    );
    fixedContent = fixedContent.replace(destructuringRegex, standard);

    // Fix property definitions in interfaces/types
    const propDefRegex = new RegExp(
      `^(\\s*)${underscore.replace("_", "_")}(\\??\\s*:)`,
      "gm",
    );
    fixedContent = fixedContent.replace(propDefRegex, `$1${standard}$2`);
  });

  // Fix usage of underscore variables in JSX/code
  Object.entries(propMappings).forEach(([underscore, standard]) => {
    const varName = underscore.substring(1); // Remove the underscore
    const usageRegex = new RegExp(`\\b${varName}\\b`, "g");
    fixedContent = fixedContent.replace(usageRegex, standard);
  });

  // Fix specific cases mentioned in errors
  fixedContent = fixedContent.replace(/Cannot find name 'filters'/g, "");
  fixedContent = fixedContent.replace(/Cannot find name 'loading'/g, "");
  fixedContent = fixedContent.replace(/Cannot find name 'campaigns'/g, "");
  fixedContent = fixedContent.replace(/Cannot find name 'viewMode'/g, "");
  fixedContent = fixedContent.replace(
    /Cannot find name 'onCreateCampaign'/g,
    "",
  );
  fixedContent = fixedContent.replace(/Cannot find name 'onViewCampaign'/g, "");

  return fixedContent;
}

function fixDonorInsightsImport(content) {
  // Fix the DonorInsights import issue
  return content.replace(
    /import\s*{\s*DonorInsights\s*}\s*from\s*['"](.*analytics)['"]/,
    "import { DonorInsights as DonorInsights } from '$1'",
  );
}

function fixMissingPropsInComponents(content, filename) {
  // Add missing props to component interfaces based on usage
  if (filename.includes("CampaignList.tsx")) {
    // Add missing props that are being used
    const propsToAdd = [
      "filters?: any;",
      "loading?: boolean;",
      "campaigns?: any[];",
      "viewMode?: string;",
      "onCreateCampaign?: () => void;",
      "onViewCampaign?: (campaign: any) => void;",
    ];

    // Find the interface and add missing props
    content = content.replace(
      /(interface\s+CampaignListProps\s*{[^}]*)/,
      `$1\n  ${propsToAdd.join("\n  ")}`,
    );
  }

  if (filename.includes("CampaignPerformanceTable.tsx")) {
    // Add missing interface
    if (!content.includes("interface CampaignPerformanceTableProps")) {
      const interfaceDefinition = `
interface CampaignPerformanceTableProps {
  campaigns?: any[];
  // Add other props as needed
}

`;
      content = interfaceDefinition + content;
    }
  }

  if (filename.includes("DonorInsightsPanel.tsx")) {
    // Add missing interface
    if (!content.includes("interface DonorInsightsPanelProps")) {
      const interfaceDefinition = `
interface DonorInsightsPanelProps {
  insights?: any;
  // Add other props as needed
}

`;
      content = interfaceDefinition + content;
    }
  }

  return content;
}

function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);

    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist, skipping...`);
      return;
    }

    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Apply fixes
    content = fixUnderscoreProps(content);
    content = fixDonorInsightsImport(content);
    content = fixMissingPropsInComponents(content, filePath);

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log("🔧 Fixing underscore prop errors...\n");

  // Process each file
  filesToProcess.forEach(processFile);

  console.log("\n✨ Done! Run `pnpm typecheck` to verify fixes.");
  console.log("\n📝 Note: You may need to manually review and adjust:");
  console.log("   - Component prop interfaces for missing properties");
  console.log("   - Variable names that might need different handling");
  console.log(
    "   - Any remaining type errors specific to your component logic",
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  fixUnderscoreProps,
  fixDonorInsightsImport,
  fixMissingPropsInComponents,
};
