const fs = require('fs');

const b = fs.readFileSync('index_before.html', 'utf-8');
const c = fs.readFileSync('index.html', 'utf-8');

function findContexts(html) {
    const regex = /.{0,50}helijet\.it.{0,50}/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        matches.push(match[0].trim());
    }
    return matches;
}

const bMatches = findContexts(b);
const cMatches = findContexts(c);

console.log('=== BEFORE (PRE-CLEANUP) OCCURRENCES ===');
console.log(`Count: ${bMatches.length}`);
bMatches.forEach((m, idx) => console.log(`${idx + 1}: ${m}`));

console.log('\n=== CURRENT (RESPONSIVE) OCCURRENCES ===');
console.log(`Count: ${cMatches.length}`);
cMatches.forEach((m, idx) => console.log(`${idx + 1}: ${m}`));
