import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const code = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf-8');
const lines = code.split('\n');

let targetLineNo = -1;
for (let idx = 0; idx < lines.length; idx++) {
  if (lines[idx].includes('(unifiedEvents.length > 0 || loadingAuditLogsForEvents)')) {
    targetLineNo = idx + 1; // 1-indexed
    console.log(`Found target at line ${targetLineNo}: "${lines[idx].trim()}"`);
    break;
  }
}

if (targetLineNo === -1) {
  console.log("Target line not found!");
  process.exit(1);
}

let stack = [];
let lineNo = 1;
for (let i = 0; i < code.length; i++) {
  const char = code[i];
  if (char === '\n') {
    lineNo++;
  }
  
  if (char === '{' || char === '(' || char === '[') {
    stack.push({ char, index: i, lineNo });
  } else if (char === '}' || char === ')' || char === ']') {
    if (stack.length === 0) {
      continue;
    }
    const top = stack.pop();
    if (top.lineNo === targetLineNo) {
      console.log(`Bracket opened on line ${targetLineNo} was closed on line ${lineNo} with '${char}'`);
      console.log(`  Context: "${code.substring(i - 20, i + 20).replace(/\n/g, '\\n')}"`);
    }
  }
}
