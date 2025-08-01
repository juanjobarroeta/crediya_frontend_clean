const fs = require('fs');
const path = require('path');

// Function to recursively find all JS/JSX files
function findFiles(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .git
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Function to clean debug console.log statements
function cleanDebugLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;
    
    // Remove console.log statements (but keep console.error for actual error logging)
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\([^)]*\)\s*/g, '');
    
    // Remove debug comments
    content = content.replace(/\/\/ Debug.*$/gm, '');
    content = content.replace(/\/\/ 👈.*$/gm, '');
    content = content.replace(/\/\/ 🚀.*$/gm, '');
    content = content.replace(/\/\/ ✅.*$/gm, '');
    content = content.replace(/\/\/ ❌.*$/gm, '');
    content = content.replace(/\/\/ 🧾.*$/gm, '');
    content = content.replace(/\/\/ 🔍.*$/gm, '');
    content = content.replace(/\/\/ 📦.*$/gm, '');
    content = content.replace(/\/\/ 🧪.*$/gm, '');
    content = content.replace(/\/\/ 🧑‍💼.*$/gm, '');
    content = content.replace(/\/\/ 🔄.*$/gm, '');
    content = content.replace(/\/\/ 📊.*$/gm, '');
    content = content.replace(/\/\/ 🌐.*$/gm, '');
    content = content.replace(/\/\/ 📣.*$/gm, '');
    content = content.replace(/\/\/ 🏦.*$/gm, '');
    content = content.replace(/\/\/ 💳.*$/gm, '');
    content = content.replace(/\/\/ 📑.*$/gm, '');
    content = content.replace(/\/\/ 🧾.*$/gm, '');
    content = content.replace(/\/\/ 🏬.*$/gm, '');
    content = content.replace(/\/\/ 🧍‍♂️.*$/gm, '');
    content = content.replace(/\/\/ ⚙️.*$/gm, '');
    content = content.replace(/\/\/ 📦.*$/gm, '');
    content = content.replace(/\/\/ 🔍.*$/gm, '');
    
    // Remove empty lines that might be left after removing debug statements
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      changes = 1;
      console.log(`✅ Cleaned: ${filePath}`);
    }
    
    return changes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
function main() {
  console.log('🧹 Starting debug log cleanup...\n');
  
  const frontendDir = './src';
  const backendDir = './crediya-backend';
  
  let totalFiles = 0;
  let cleanedFiles = 0;
  
  // Clean frontend files
  if (fs.existsSync(frontendDir)) {
    const frontendFiles = findFiles(frontendDir);
    console.log(`📁 Found ${frontendFiles.length} frontend files`);
    
    frontendFiles.forEach(file => {
      totalFiles++;
      cleanedFiles += cleanDebugLogs(file);
    });
  }
  
  // Clean backend files
  if (fs.existsSync(backendDir)) {
    const backendFiles = findFiles(backendDir);
    console.log(`📁 Found ${backendFiles.length} backend files`);
    
    backendFiles.forEach(file => {
      totalFiles++;
      cleanedFiles += cleanDebugLogs(file);
    });
  }
  
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`📁 Total files processed: ${totalFiles}`);
  console.log(`🧹 Files cleaned: ${cleanedFiles}`);
  console.log(`✅ Cleanup completed!`);
}

// Run the cleanup
main(); 