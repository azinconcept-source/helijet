const fs = require('fs');

function cleanHtml(html) {
    // Remove style tags
    let cleaned = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    // Normalize newlines and spaces
    cleaned = cleaned.split('\n')
                     .map(line => line.trim())
                     .filter(line => line.length > 0)
                     .join('\n');
    return cleaned;
}

const b = cleanHtml(fs.readFileSync('index_before.html', 'utf-8'));
const c = cleanHtml(fs.readFileSync('index.html', 'utf-8'));

fs.writeFileSync('scratch/clean_before.txt', b, 'utf-8');
fs.writeFileSync('scratch/clean_current.txt', c, 'utf-8');

console.log('Wrote cleaned HTML files to scratch/clean_before.txt and scratch/clean_current.txt');
