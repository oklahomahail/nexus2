#!/usr/bin/env node

const fs = require('fs');

function fixImportErrors(filePath) {
  try {
    console.log(`Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} not found, skipping...`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix the malformed DonorInsights import
    // FROM: import { *DonorInsights as *DonorInsights as DonorInsights  } from "../models/analytics";
    // TO:   import { _DonorInsights as DonorInsights } from "../models/analytics";
    
    content = content.replace(
      /import\s*{\s*\*DonorInsights\s+as\s+\*DonorInsights\s+as\s+DonorInsights\s*}\s*from\s*["']([^"']*analytics)["']/g,
      'import { _DonorInsights as DonorInsights } from "$1"'
    );
    
    // Also handle any other similar malformed imports
    content = content.replace(
      /import\s*{\s*\*(\w+)\s+as\s+\*\1\s+as\s+\1\s*}\s*from/g,
      'import { _$1 as $1 } from'
    );
    
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

function main() {
  console.log('🔧 Fixing the final 4 import errors...\n');
  
  const filesToFix = [
    'src/components/DonorInsightsPanel.tsx',
    'src/viewModels/donorView.ts'
  ];
  
  let filesFixed = 0;
  
  filesToFix.forEach(filePath => {
    if (fixImportErrors(filePath)) {
      filesFixed++;
    }
  });
  
  console.log(`\n✨ Fixed ${filesFixed} files!`);
  console.log('\n🎉 Run `pnpm typecheck` - you should now have ZERO errors!');
}

if (require.main === module) {
  main();
}