import os
import glob
import re

files = glob.glob('_posts/*.md')
PILLAR_MAP = {
    'philosophy of the image & visual culture': 'philosophy-image',
    'art worth sharing': 'art',
    'ai perception, culture & representation': 'ai-perception',
    'visual perception & psychophysics': 'visual-perception',
    'language, llms & artificial intelligence': 'language-llms',
    'visual perception & psychology of seeing': 'visual-perception',
    'ai-perception': 'ai-perception',
    'tools & useful artifacts': 'tools',
    'philosophy and critical theory': 'philosophy-critical-theory'
}

updated_count = 0

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        continue

    parts = content.split('---', 2)
    if len(parts) < 3:
        continue

    frontmatter = parts[1]
    body = parts[2]

    # Find pillar in frontmatter
    pillar_match = re.search(r'^\s*pillar:\s*["\']?(.*?)["\']?\s*$', frontmatter, re.M)
    pillar_tag = None
    if pillar_match:
        raw_pil = pillar_match.group(1).strip()
        pillar_tag = PILLAR_MAP.get(raw_pil.lower(), raw_pil.lower().replace(' ', '-'))

    # Extract existing tags
    tags = []
    tags_match = re.search(r'^tags:\s*\n((?:\s*-\s*.*?\n)+)', frontmatter, re.M)
    inline_match = None
    if tags_match:
        tag_lines = tags_match.group(1).splitlines()
        for tl in tag_lines:
            t = re.sub(r'^\s*-\s*', '', tl).strip().strip('"\'').lstrip('#')
            if t and t not in tags:
                tags.append(t)
    else:
        inline_match = re.search(r'^tags:\s*\[(.*?)\]', frontmatter, re.M)
        if inline_match:
            for t in inline_match.group(1).split(','):
                t_clean = t.strip().strip('"\'').lstrip('#')
                if t_clean and t_clean not in tags:
                    tags.append(t_clean)

    # Add pillar tag if not already in tags
    if pillar_tag and pillar_tag not in tags:
        tags.insert(0, pillar_tag)

    # Remove topic block, standalone pillar, subtopic, foundations
    new_fm = re.sub(r'^[ \t]*topic:\s*\n(?:[ \t]+.*?\n)+', '', frontmatter, flags=re.M)
    new_fm = re.sub(r'^[ \t]*pillar:.*?\n', '', new_fm, flags=re.M)
    new_fm = re.sub(r'^[ \t]*subtopic:.*?\n', '', new_fm, flags=re.M)
    new_fm = re.sub(r'^[ \t]*foundations:\s*\n(?:[ \t]+.*?\n)+', '', new_fm, flags=re.M)
    new_fm = re.sub(r'^[ \t]*foundations:.*?\n', '', new_fm, flags=re.M)

    # Replace tags block with updated tags
    tags_yaml = 'tags:\n' + '\n'.join([f'  - "{t}"' for t in tags]) + '\n'
    if tags_match:
        # replace the original tags block in new_fm
        new_fm = re.sub(r'^tags:\s*\n(?:[ \t]*-\s*.*?\n)+', tags_yaml, new_fm, flags=re.M)
    elif inline_match:
        new_fm = re.sub(r'^tags:\s*\[.*?\]', tags_yaml, new_fm, flags=re.M)
    else:
        new_fm = new_fm.rstrip() + '\n\n' + tags_yaml

    # Clean consecutive blank lines in frontmatter
    new_fm = re.sub(r'\n{3,}', '\n\n', new_fm)

    new_content = '---' + new_fm + '---' + body
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    updated_count += 1

print(f'Successfully updated {updated_count} markdown post files.')
