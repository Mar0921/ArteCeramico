path = r'C:\Users\DELL\Downloads\ArteCeramico\app\admin\incidencias\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove the stray ')' on line 482 (0-indexed: 481)
# It's between </tr> and </> which is invalid
if len(lines) > 481:
    # Line 482 (index 481) should just be empty or removed
    # The structure should be:
    #   </tr>
    #   </>
    # Let's check what's there
    print(f'Line 482: {repr(lines[481])}')
    # Remove the stray ')'
    lines[481] = '\n'

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('OK')