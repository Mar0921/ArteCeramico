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
  if (inString) {
    console.log(`Line ${i+1}: Starts with open string '${stringChar}'`);
  }
  
  const line = lines[i];
  let j = 0;
  
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
      j++;
      continue;
    }
    
    if (char === '`') {
      inTemplate = true;
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
      j++;
      continue;
    }
    
    j++;
  }
  
  inLineComment = false;
}

console.log('\nFinal state:');
console.log('In string:', inString);
console.log('In template:', inTemplate);
console.log('In regex:', inRegex);
console.log('In comment:', inComment);
