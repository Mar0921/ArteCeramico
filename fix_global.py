with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all 'sudoku' with 'sudoku' in the entire file
# This is safe because 'sudoku' is not used anywhere else in the codebase
content = content.replace('sudoku', 'sudoku')

with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Corregido')