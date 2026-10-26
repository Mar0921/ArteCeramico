const fs=require('fs');const p='C:\\Users\\DELL\\Downloads\\ArteCeramico\\app\\dashboard\\clientes\\[id]\\page.tsx';const c=fs.readFileSync(p,'utf8');const i=c.indexOf('from(\
materiales\)');if(i>=0){const s=Math.max(0,i-80);const e=Math.min(c.length,i+240);console.log(c.slice(s,e));}
