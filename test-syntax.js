// Quick syntax test for TaskViewer.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing TaskViewer.js syntax...');

try {
  const filePath = path.join(__dirname, 'frontend', 'src', 'components', 'Tasks', 'TaskViewer.js');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Basic syntax check - look for unmatched template literals
  const backticks = (content.match(/`/g) || []).length;
  console.log(`Found ${backticks} backticks (should be even number)`);
  
  if (backticks % 2 !== 0) {
    console.error('❌ Unmatched template literals detected!');
    process.exit(1);
  }
  
  // Check for common syntax issues
  const issues = [];
  
  // Check for unmatched braces in template literals
  const lines = content.split('\n');
  let inTemplateLiteral = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('`') && !inTemplateLiteral) {
      inTemplateLiteral = true;
      braceCount = 0;
    }
    
    if (inTemplateLiteral) {
      const openBraces = (line.match(/\${/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
    }
    
    if (line.includes('`') && inTemplateLiteral && i > 0) {
      inTemplateLiteral = false;
      if (braceCount !== 0) {
        issues.push(`Line ${i + 1}: Unmatched braces in template literal`);
      }
    }
  }
  
  if (issues.length > 0) {
    console.error('❌ Syntax issues found:');
    issues.forEach(issue => console.error(issue));
    process.exit(1);
  }
  
  console.log('✅ Basic syntax check passed!');
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
  process.exit(1);
}
