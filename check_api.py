with open('app/api/solicitudes/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Check for facturas_url or facturas_url
import re
matches = re.findall(r'facturas?_url', content)
print('Matches:', matches)
# Show select line
idx = content.find('.select("id, servicio')
if idx >= 0:
    print('SELECT line:')
    print(content[idx:idx+600])