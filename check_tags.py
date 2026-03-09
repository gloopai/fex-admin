import re

with open('src/pages/aiQuant/AiQuantYieldAdjustmentPage.vue', 'r') as f:
    lines = f.readlines()
    
template_start = None
template_end = None
for i, line in enumerate(lines):
    if '<template>' in line:
        template_start = i
    if '</template>' in line:
        template_end = i
        break

if template_start is not None and template_end is not None:
    template_lines = lines[template_start:template_end+1]
    
    stack = []
    for i, line in enumerate(template_lines, start=template_start+1):
        opens = [(m.start(), i) for m in re.finditer(r'<div[\s>]', line)]
        closes = [(m.start(), i) for m in re.finditer(r'</div>', line)]
        
        for pos, line_num in opens:
            stack.append((line_num, pos, 'open'))
        for pos, line_num in closes:
            if stack and stack[-1][2] == 'open':
                stack.pop()
            else:
                print(f'Extra </div> at line {line_num}, position {pos}')
                print(f'Content: {lines[line_num-1].strip()}')
    
    if stack:
        print(f'Unclosed <div> tags:')
        for line_num, pos, typ in stack:
            print(f'  Line {line_num}: {lines[line_num-1].strip()}')
    
    if not stack:
        print('All div tags are properly matched!')
