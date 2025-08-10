#!/usr/bin/env node

const fs = require('fs');

function showFileContext(filePath, errorLine) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${filePath} not found`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`\n📄 ${filePath} around line ${errorLine}:`);
    console.log('---');
    
    const start = Math.max(0, errorLine - 5);
    const end = Math.min(lines.length, errorLine + 5);
    
    for (let i = start; i < end; i++) {
      const lineNum = i + 1;
      const marker = lineNum === errorLine ? '>>> ' : '    ';
      console.log(`${marker}${lineNum.toString().padStart(3, ' ')}: ${lines[i]}`);
    }
    console.log('---');
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

function showFullFunction(filePath, startPattern) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${filePath} not found`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find the function
    let functionStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(startPattern)) {
        functionStart = i;
        break;
      }
    }
    
    if (functionStart === -1) {
      console.log(`❌ Could not find function with pattern: ${startPattern}`);
      return;
    }
    
    console.log(`\n📄 ${filePath} - Function containing "${startPattern}":`);
    console.log('---');
    
    // Show from function start and try to find the end
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = functionStart; i < lines.length && i < functionStart + 20; i++) {
      const line = lines[i];
      console.log(`${(i + 1).toString().padStart(3, ' ')}: ${line}`);
      
      // Simple brace counting to find function end
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      if (line.includes(startPattern)) inFunction = true;
      if (inFunction && braceCount === 0 && line.includes('}')) break;
    }
    console.log('---');
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

console.log('🔍 Diagnosing syntax errors in files...');

// Check App.tsx around the error
showFileContext('src/App.tsx', 22);

// Check MessagingAssistPanel.tsx around both errors  
showFileContext('src/panels/MessagingAssistPanel.tsx', 65);
showFileContext('src/panels/MessagingAssistPanel.tsx', 223);

// Check the analytics service
showFileContext('src/services/analyticsService.ts', 24);
showFullFunction('src/services/analyticsService.ts', 'createRng');