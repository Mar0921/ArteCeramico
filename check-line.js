const fs = require('fs');
const line = fs.readFileSync('app/dashboard/clientes/[id]/page.tsx', 'utf8').split('\n')[2296];
console.log('Line length:', line.length);
for (let i = 0; i < line.length; i++) {
  const c = line[i];
  const code = c.charCodeAt(0);
  console.log(i + ': ' + JSON.stringify(c) + ' (code=' + code + ')');
}
