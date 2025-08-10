#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive prop mappings
const propMappings = {
  // Event handlers
  '_onClick': 'onClick',
  '_onSubmit': 'onSubmit',
  '_onChange': 'onChange',
  '_onClose': 'onClose',
  '_onOpen': 'onOpen',
  '_onSelect': 'onSelect',
  '_onFiltersChange': 'onFiltersChange',
  '_onViewCampaign': 'onViewCampaign',
  '_onCreateCampaign': 'onCreateCampaign',
  '_onEdit': 'onEdit',
  '_onDelete': 'onDelete',
  '_onSave': 'onSave',
  '_onCancel': 'onCancel',
  
  // Common props
  '_className': 'className',
  '_children': 'children',
  '_style': 'style',
  '_id': 'id',
  '_title': 'title',
  '_text': 'text',
  '_label': 'label',
  '_value': 'value',
  '_placeholder': 'placeholder',
  '_disabled': 'disabled',
  '_loading': 'loading',
  '_visible': 'visible',
  '_active': 'active',
  '_selected': 'selected',
  
  // Data props
  '_data': 'data',
  '_items': 'items',
  '_campaigns': 'campaigns',
  '_donors': 'donors',
  '_analytics': 'analytics',
  '_insights': 'insights',
  '_segments': 'segments',
  '_filters': 'filters',
  
  // Layout props
  '_width': 'width',
  '_height': 'height',
  '_size': 'size',
  '_type': 'type',
  '_variant': 'variant',
  '_color': 'color',
  '_theme': 'theme',
  
  // State props
  '_isOpen': 'isOpen',
  '_isLoading': 'isLoading',
  '_isActive': 'isActive',
  '_isSelected': 'isSelected',
  '_isDisabled': 'isDisabled',
  '_isVisible': 'isVisible',
  
  // Navigation props
  '_href': 'href',
  '_to': 'to',
  '_path': 'path',
  '_route': 'route',
  
  // Form props
  '_name': 'name',
  '_required': 'required',
  '_error': 'error',
  '_errors': 'errors',
  '_touched': 'touched',
  '_dirty': 'dirty',
  
  // Chart/visualization props
  '_chartData': 'chartData',
  '_xAxis': 'xAxis',
  '_yAxis': 'yAxis',
  '_labels': 'labels',
  '_datasets': 'datasets'
};

// Files to scan (all TypeScript/TSX files) - using built-in fs instead of glob
function getAllTsFiles(dir = 'src', fileList = []) {
  try {
    // Try current directory first, then parent directory
    if (!fs.existsSync(dir)) {
      dir = path.join('..', 'src');
      if (!fs.existsSync(dir)) {
        console.log('src directory not found. Make sure you\'re running this from the project root or scripts folder.');
        console.log('Current directory:', process.cwd());
        console.log('Looking for:', path.resolve(dir));
        return [];
      }
    }
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          getAllTsFiles(filePath, fileList);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  } catch (error) {
    console.error('Error scanning directory:', error.message);
    return [];
  }
}

function fixUnderscoreProps(content) {
  let fixedContent = content;
  
  // 1. Fix prop destructuring in function parameters
  // { _onClick, _className }: Props -> { onClick, className }: Props
  Object.entries(propMappings).forEach(([underscore, standard]) => {
    const destructuringRegex = new RegExp(`\\b${underscore}\\b(?=\\s*[,}:])`, 'g');
    fixedContent = fixedContent.replace(destructuringRegex, standard);
  });
  
  // 2. Fix property definitions in interfaces/types
  Object.entries(propMappings).forEach(([underscore, standard]) => {
    const propDefRegex = new RegExp(`^(\\s*)${underscore}(\\??\\s*:)`, 'gm');
    fixedContent = fixedContent.replace(propDefRegex, `$1${standard}$2`);
  });
  
  // 3. Fix usage of variables (remove underscore prefix when used)
  Object.entries(propMappings).forEach(([underscore, standard]) => {
    const varName = underscore.substring(1); // Remove underscore
    
    // Only replace standalone variable names, not parts of other identifiers
    const standaloneVarRegex = new RegExp(`\\b${varName}\\b(?![A-Za-z0-9_])`, 'g');
    
    // Skip if it's already the standard name
    if (varName !== standard) {
      fixedContent = fixedContent.replace(standaloneVarRegex, standard);
    }
  });
  
  return fixedContent;
}

function fixImportExportIssues(content) {
  // Fix named exports with underscores
  content = content.replace(
    /export\s*{\s*([^}]*\b_\w+[^}]*)\s*}/g,
    (match, exports) => {
      const fixedExports = exports.replace(/\b_(\w+)\b/g, '_$1 as $1');
      return `export { ${fixedExports} }`;
    }
  );
  
  // Fix imports expecting non-underscore names from underscore exports
  content = content.replace(
    /import\s*{\s*([^}]*)\s*}\s*from\s*(['"][^'"]*['"])/g,
    (match, imports, from) => {
      // If importing something that might be exported with underscore
      const fixedImports = imports.replace(/\b(\w+)\b/g, (name) => {
        if (Object.values(propMappings).includes(name)) {
          return `_${name} as ${name}`;
        }
        return name;
      });
      return `import { ${fixedImports} } from ${from}`;
    }
  );
  
  // Specific fix for DonorInsights
  content = content.replace(
    /import\s*{\s*DonorInsights\s*}\s*from\s*(['"][^'"]*analytics['"])/,
    'import { _DonorInsights as DonorInsights } from $1'
  );
  
  return content;
}

function addMissingInterfaces(content, filename) {
  const componentName = path.basename(filename, path.extname(filename));
  const propsInterfaceName = `${componentName}Props`;
  
  // Check if props interface exists
  if (!content.includes(`interface ${propsInterfaceName}`) && 
      !content.includes(`type ${propsInterfaceName}`)) {
    
    // Look for function component definition to infer props
    const functionMatch = content.match(new RegExp(`function\\s+${componentName}\\s*\\([^)]*\\)|const\\s+${componentName}\\s*[=:]\\s*\\([^)]*\\)\\s*=>`));
    
    if (functionMatch) {
      // Create a basic interface
      const interfaceDefinition = `
interface ${propsInterfaceName} {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props based on component usage
}

`;
      
      // Insert after imports
      const importEndIndex = content.lastIndexOf('import ');
      if (importEndIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importEndIndex);
        content = content.slice(0, nextLineIndex + 1) + interfaceDefinition + content.slice(nextLineIndex + 1);
      } else {
        // Insert at the beginning if no imports
        content = interfaceDefinition + content;
      }
    }
  }
  
  return content;
}

function fixTypeScriptErrors(content) {
  // Fix common TypeScript issues
  
  // Add React import if JSX is used but React isn't imported
  if (content.includes('<') && content.includes('>') && !content.includes('import React') && !content.includes('import * as React')) {
    content = 'import React from \'react\';\n' + content;
  }
  
  // Fix implicit any parameters
  content = content.replace(
    /(\w+)\s*=>\s*\(/g,
    '($1: any) => ('
  );
  
  // Fix missing return types for functions that clearly return JSX
  content = content.replace(
    /(function\s+\w+\s*\([^)]*\))\s*{[\s\S]*?return\s*\(/g,
    '$1: React.ReactElement {'
  );
  
  return content;
}

function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist, skipping...`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply all fixes
    content = fixUnderscoreProps(content);
    content = fixImportExportIssues(content);
    content = addMissingInterfaces(content, filePath);
    content = fixTypeScriptErrors(content);
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Comprehensive TypeScript/React prop fixing...\n');
  
  const allFiles = getAllTsFiles();
  console.log(`Found ${allFiles.length} TypeScript files to process\n`);
  
  let filesChanged = 0;
  
  // Process each file
  allFiles.forEach(filePath => {
    if (processFile(filePath)) {
      filesChanged++;
    }
  });
  
  console.log(`\n✨ Done! Fixed ${filesChanged} files out of ${allFiles.length} total.`);
  console.log('\n🧪 Run `pnpm typecheck` to verify fixes.');
  console.log('\n📝 Manual review may be needed for:');
  console.log('   - Complex prop interfaces');
  console.log('   - Custom hook return types');
  console.log('   - Context provider types');
  console.log('   - Service method signatures');
  console.log('   - Component-specific logic types');
}

if (require.main === module) {
  main();
}

module.exports = { 
  fixUnderscoreProps, 
  fixImportExportIssues, 
  addMissingInterfaces,
  fixTypeScriptErrors 
};