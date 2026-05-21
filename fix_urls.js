const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

try {
  const filesStr = execSync('git grep -l "Helijet.it"', { encoding: 'utf-8' });
  const files = filesStr.split('\n').filter(f => f.trim() !== '');

  let replacedCount = 0;
  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Fix broken image filenames where my previous script blindly added .it before numbers, dashes, underscores
      // Examples: Helijet.it06.jpg, Helijet.it-AEROPLAN, Helijet.it_Canada
      const newContent = content.replace(/Helijet\.it([0-9\-_])/g, 'Helijet$1')
                                .replace(/HELIJET\.IT([0-9\-_])/g, 'HELIJET$1');
                                
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        replacedCount++;
      }
    }
  }
  console.log(`Successfully fixed broken URLs in ${replacedCount} files.`);
} catch (e) {
  console.error("Error:", e.message);
}
