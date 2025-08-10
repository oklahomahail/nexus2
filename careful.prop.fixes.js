#!/usr/bin/env node

const fs = require('fs');

// Fix ONE file at a time to avoid corruption
function fixSingleFile(filePath, fixFunction) {
  try {
    console.log(`Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${filePath} not found`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = fixFunction(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Fix 1: AnalyticsFiltersComponent.tsx
function fixAnalyticsFilters(content) {
  // Fix: __onFiltersChange -> onFiltersChange
  content = content.replace('__onFiltersChange,', 'onFiltersChange,');
  content = content.replace('_onFiltersChange(filters)', 'onFiltersChange(filters)');
  
  // Add the missing prop to interface if it exists
  if (content.includes('interface AnalyticsFiltersComponentProps')) {
    content = content.replace(
      /(interface AnalyticsFiltersComponentProps\s*{[^}]*)/,
      '$1\n  onFiltersChange?: (filters: any) => void;'
    );
  }
  
  return content;
}

// Fix 2: CampaignQuickCard.tsx  
function fixCampaignQuickCard(content) {
  // Fix underscore props
  content = content.replace('_onClick,', 'onClick,');
  content = content.replace('_className,', 'className,');
  
  // Add missing props to interface
  if (content.includes('interface CampaignQuickCardProps')) {
    content = content.replace(
      /(interface CampaignQuickCardProps\s*{[^}]*)/,
      '$1\n  onClick?: () => void;\n  className?: string;'
    );
  }
  
  return content;
}

// Fix 3: LoadingSpinner.tsx
function fixLoadingSpinner(content) {
  // Fix underscore props
  content = content.replace('_text,', 'text,');
  content = content.replace('_className = "",', 'className = "",');
  
  // Fix usage
  content = content.replace(/\btext\b/g, 'text');
  content = content.replace(/\bclassName\b/g, 'className');
  
  // Add missing props to interface
  if (content.includes('interface LoadingSpinnerProps')) {
    content = content.replace(
      /(interface LoadingSpinnerProps\s*{[^}]*)/,
      '$1\n  text?: string;\n  className?: string;'
    );
  }
  
  return content;
}

// Fix 4: DonorInsightsPanel.tsx
function fixDonorInsightsPanel(content) {
  // Fix import
  content = content.replace(
    'import { DonorInsights } from "../models/analytics";',
    'import { _DonorInsights as DonorInsights } from "../models/analytics";'
  );
  
  // Add missing interface
  if (!content.includes('interface DonorInsightsPanelProps')) {
    const interfaceDefinition = `
interface DonorInsightsPanelProps {
  insights: DonorInsights | null;
  className?: string;
}

`;
    
    // Insert after imports
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextLineIndex + 1) + interfaceDefinition + content.slice(nextLineIndex + 1);
    }
  }
  
  return content;
}

// Fix 5: CampaignPerformanceTable.tsx
function fixCampaignPerformanceTable(content) {
  // Add missing interface
  if (!content.includes('interface CampaignPerformanceTableProps')) {
    const interfaceDefinition = `
interface CampaignPerformanceTableProps {
  campaigns: any[];
  className?: string;
}

`;
    
    // Insert at the beginning
    content = interfaceDefinition + content;
  }
  
  // Fix parameter type
  content = content.replace(
    '{campaigns.map((c) =>',
    '{campaigns.map((c: any) =>'
  );
  
  return content;
}

function main() {
  console.log('🔧 Fixing critical prop issues one file at a time...\n');
  
  const fixes = [
    {
      file: 'src/components/AnalyticsFiltersComponent.tsx',
      fix: fixAnalyticsFilters,
      description: 'Fix __onFiltersChange prop issue'
    },
    {
      file: 'src/components/CampaignQuickCard.tsx', 
      fix: fixCampaignQuickCard,
      description: 'Fix _onClick and _className props'
    },
    {
      file: 'src/components/LoadingSpinner.tsx',
      fix: fixLoadingSpinner,
      description: 'Fix _text and _className props'
    },
    {
      file: 'src/components/DonorInsightsPanel.tsx',
      fix: fixDonorInsightsPanel,
      description: 'Fix DonorInsights import and interface'
    },
    {
      file: 'src/components/CampaignPerformanceTable.tsx',
      fix: fixCampaignPerformanceTable,
      description: 'Add missing interface and fix types'
    }
  ];
  
  let totalFixed = 0;
  
  fixes.forEach(({ file, fix, description }) => {
    console.log(`\n📝 ${description}`);
    if (fixSingleFile(file, fix)) {
      totalFixed++;
    }
  });
  
  console.log(`\n✨ Fixed ${totalFixed} files!`);
  console.log('\n🧪 Run `pnpm typecheck` to see progress.');
  console.log('These fixes should reduce errors significantly.');
}

if (require.main === module) {
  main();
}