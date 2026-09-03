const fs = require('fs');
const content = fs.readFileSync('app/dashboard/clientes/[id]/page.tsx', 'utf8');
const lines = content.split('\n');

let inString = false;
let stringChar = '';
let inTemplate = false;
let inRegex = false;
let regexDepth = 0;
let inComment = false;
let inLineComment = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let j = 0;
  let lineEvents = [];
  
  while (j < line.length) {
    const char = line[j];
    const next = line[j + 1];
    
    if (inLineComment) {
      j++;
      continue;
    }
    
    if (inComment) {
      if (char === '*' && next === '/') {
        inComment = false;
        j += 2;
        continue;
      }
      j++;
      continue;
    }
    
    if (inString) {
      if (char === '\\') {
        j += 2;
        continue;
      }
      if (char === stringChar) {
        lineEvents.push(`Closed string '${stringChar}'`);
        inString = false;
        stringChar = '';
      }
      j++;
      continue;
    }
    
    if (inTemplate) {
      if (char === '\\') {
        j += 2;
        continue;
      }
      if (char === '`') {
        lineEvents.push(`Closed template`);
        inTemplate = false;
      }
      j++;
      continue;
    }
    
    if (inRegex) {
      if (char === '\\') {
        j += 2;
        continue;
      }
      if (char === '[') {
        regexDepth++;
        j++;
        continue;
      }
      if (char === ']') {
        regexDepth--;
        j++;
        continue;
      }
      if (char === '/' && regexDepth === 0) {
        lineEvents.push(`Closed regex`);
        inRegex = false;
      }
      j++;
      continue;
    }
    
    if (char === '/' && next === '/') {
      inLineComment = true;
      j += 2;
      continue;
    }
    
    if (char === '/' && next === '*') {
      inComment = true;
      j += 2;
      continue;
    }
    
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      lineEvents.push(`Opened string '${char}'`);
      j++;
      continue;
    }
    
    if (char === '`') {
      inTemplate = true;
      lineEvents.push(`Opened template`);
      j++;
      continue;
    }
    
    if (char === '/') {
      let prevIdx = j - 1;
      while (prevIdx >= 0 && /\s/.test(line[prevIdx])) prevIdx--;
      const prev = prevIdx >= 0 ? line[prevIdx] : '';
      
      if (/[a-zA-Z0-9_$)\]}]/.test(prev)) {
        j++;
        continue;
      }
      
      inRegex = true;
      regexDepth = 0;
      lineEvents.push(`Opened regex`);
      j++;
      continue;
    }
    
    j++;
  }
  
  inLineComment = false;
  
  if (i >= 1069 && i <= 1089) {
    if (lineEvents.length > 0) {
      console.log(`Line ${i+1}: ${lineEvents.join(', ')}`);
    } else {
      console.log(`Line ${i+1}: (no events)`);
    }
  }
}
