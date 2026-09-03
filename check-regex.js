const fs = require('fs');
const content = fs.readFileSync('app/dashboard/clientes/[id]/page.tsx', 'utf8');
const lines = content.split('\n');

// Find lines with what looks like regex literals: /.../
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const regex = /\/([^\/\n]*)\//g;
  let m;
  while ((m = regex.exec(line)) !== null) {
    const between = m[1];
    if (between.length > 0 && !between.includes('*')) {
      console.log((i+1) + ': ' + line.trim().substring(0, 120));
    }
  }
}
