const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

try {
  // Get all files tracked by git that contain helijet.com
  const filesStr = execSync('git grep -il "helijet.com"', { encoding: 'utf-8' });
  const files = filesStr.split('\n').filter(f => f.trim() !== '');

  let replacedCount = 0;
  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      // Case-insensitive replacement
      const newContent = content.replace(/helijet\.com/gi, 'helijet.to.com');
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        replacedCount++;
      }
    }
  }
  console.log(`Successfully replaced text in ${replacedCount} files.`);
  
  // Now rename the directory
  const oldDir = path.join(__dirname, 'helijet.com');
  const newDir = path.join(__dirname, 'helijet.to.com');
  
  if (fs.existsSync(oldDir)) {
    // Because git tracks it, we should use git mv or just fs.rename and then git add
    execSync(`git mv helijet.com helijet.to.com`);
    console.log(`Successfully renamed directory helijet.com to helijet.to.com`);
  }
} catch (e) {
  console.error("Error:", e.message);
}
