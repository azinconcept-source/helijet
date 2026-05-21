const fs = require('fs');

const bLines = fs.readFileSync('scratch/clean_before.txt', 'utf-8').split('\n');
const cLines = fs.readFileSync('scratch/clean_current.txt', 'utf-8').split('\n');

let bIdx = 0;
let cIdx = 0;

let out = `Before lines: ${bLines.length}, Current lines: ${cLines.length}\n`;

while (bIdx < bLines.length && cIdx < cLines.length) {
    if (bLines[bIdx] !== cLines[cIdx]) {
        out += `Mismatch at line B:${bIdx + 1} / C:${cIdx + 1}\n`;
        out += `  B: ${bLines[bIdx]}\n`;
        out += `  C: ${cLines[cIdx]}\n`;
        
        // Simple heuristic to sync back up if one side added/removed a line
        if (bLines[bIdx + 1] === cLines[cIdx]) {
            out += `  [B has extra line]\n`;
            bIdx++;
        } else if (bLines[bIdx] === cLines[cIdx + 1]) {
            out += `  [C has extra line]\n`;
            cIdx++;
        } else {
            // Check ahead for sync
            let synced = false;
            for (let offset = 1; offset < 10; offset++) {
                if (bLines[bIdx + offset] === cLines[cIdx]) {
                    bIdx += offset;
                    synced = true;
                    break;
                }
                if (bLines[bIdx] === cLines[cIdx + offset]) {
                    cIdx += offset;
                    synced = true;
                    break;
                }
            }
            if (!synced) {
                bIdx++;
                cIdx++;
            }
        }
    } else {
        bIdx++;
        cIdx++;
    }
}

fs.writeFileSync('scratch/diff_log.txt', out, 'utf-8');
console.log('Wrote mismatches to scratch/diff_log.txt');
