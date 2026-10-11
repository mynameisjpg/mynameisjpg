"""
Markdown, YAML Frontmatter, and Semantic HTML Conversion Subsystem for UNTITLED.JPG
"""

import re

def slugify(text):
    """Normalize text into a clean URL-safe slug."""
    if not text:
        return ""
    return re.sub(r'[^a-z0-9]+', '-', str(text).lower()).strip('-')

def parse_yaml_frontmatter(text):
    """Robust YAML front-matter parser."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if not match:
        return {}, text
    
    yaml_text = match.group(1)
    body_text = match.group(2)
    
    # Try importing PyYAML if available
    try:
        import yaml
        metadata = yaml.safe_load(yaml_text) or {}
        return metadata, body_text
    except Exception:
        pass

    # Basic YAML parser fallback
    metadata = {}
    lines = yaml_text.splitlines()
    current_key = None
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        
        indented_kv = re.match(r"^\s+([a-zA-Z0-9_-]+):\s*(.*)$", line)
        top_kv = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        
        if line.startswith("  - ") or line.startswith("- "):
            item = stripped.lstrip("- ").strip('"\'')
            if current_key:
                if not isinstance(metadata.get(current_key), list):
                    metadata[current_key] = []
                metadata[current_key].append(item)
        elif indented_kv and current_key:
            sub_key = indented_kv.group(1)
            sub_val = indented_kv.group(2).strip().strip('"\'')
            if not isinstance(metadata.get(current_key), dict):
                metadata[current_key] = {}
            metadata[current_key][sub_key] = sub_val
        elif top_kv and not line.startswith(" ") and not line.startswith("\t"):
            key = top_kv.group(1)
            val = top_kv.group(2).strip().strip('"\'')
            current_key = key
            
            if val == "":
                metadata[key] = {}
            elif val.lower() == "true":
                metadata[key] = True
            elif val.lower() == "false":
                metadata[key] = False
            else:
                metadata[key] = val
    
    return metadata, body_text

def format_inline_markdown(text):
    """Transforms inline Markdown: bold, italic, code, math, links."""
    out = text
    # Math inline: $E = mc^2$ -> <span class="math-inline">$E = mc^2$</span>
    out = re.sub(r'(?<!\\)\$([^\$]+?)\$', r'<span class="math-inline">$\1$</span>', out)
    # Bold + Italic: ***text*** or ___text___
    out = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', out)
    # Bold: **text**
    out = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', out)
    # Italic: *text* or _text_
    out = re.sub(r'(?<!\w)\*([^\*]+?)\*(?!\w)', r'<em>\1</em>', out)
    out = re.sub(r'(?<!\w)_([^_]+?)_(?!\w)', r'<em>\1</em>', out)
    # Code inline: `code` (with HTML entity escaping for < and >)
    def _code_repl(m):
        code_str = m.group(1).replace('<', '&lt;').replace('>', '&gt;')
        return f'<code>{code_str}</code>'
    out = re.sub(r'`([^`]+?)`', _code_repl, out)
    # Links: [text](url)
    out = re.sub(r'\[([^\]]+?)\]\(([^)]+?)\)', r'<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>', out)
    return out

def clean_and_convert_markdown(md_text):
    """Converts full Markdown body to rich, semantic HTML."""
    # Strip legacy HTML tags if any were accidentally preserved
    cleaned = md_text
    cleaned = re.sub(r'<header class="post-header-meta-top">.*?</header>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<h1 class="post-title">.*?</h1>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<p class="post-subtitle">.*?</p>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<div class="post-header-meta-bottom">.*?</div>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<footer class="post-footer-section">.*?</footer>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<!-- ===.*?=== -->', '', cleaned)
    cleaned = re.sub(r'<!--.*?-->', '', cleaned, flags=re.DOTALL)

    lines = cleaned.splitlines()
    html_blocks = []
    
    in_code_block = False
    code_lang = ""
    code_buffer = []
    
    in_table = False
    table_buffer = []
    
    in_list = False
    list_type = "ul"
    list_items = []
    
    def flush_list():
        nonlocal in_list, list_type, list_items
        if in_list and list_items:
            tag = list_type
            items_html = "".join([f"<li>{item}</li>" for item in list_items])
            html_blocks.append(f'<{tag} class="post-list essay-list">{items_html}</{tag}>')
            list_items = []
            in_list = False

    def flush_table():
        nonlocal in_table, table_buffer
        if in_table and table_buffer:
            rows = table_buffer
            table_html = ['<div class="table-responsive"><table class="post-table essay-table">']
            if len(rows) > 0:
                header_cols = [c.strip() for c in rows[0].strip('|').split('|')]
                table_html.append('<thead><tr>')
                for c in header_cols:
                    table_html.append(f'<th>{format_inline_markdown(c)}</th>')
                table_html.append('</tr></thead>')
            table_html.append('<tbody>')
            for r in rows[1:]:
                if re.match(r'^\s*\|?\s*[-:\s|]+\s*\|?\s*$', r):
                    continue
                cols = [c.strip() for c in r.strip('|').split('|')]
                table_html.append('<tr>')
                for c in cols:
                    table_html.append(f'<td>{format_inline_markdown(c)}</td>')
                table_html.append('</tr>')
            table_html.append('</tbody></table></div>')
            html_blocks.append("\n".join(table_html))
            table_buffer = []
            in_table = False

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # 1. Code Block Fence
        if stripped.startswith("```"):
            flush_list()
            flush_table()
            if in_code_block:
                if code_lang == "mermaid":
                    raw_mermaid = "\n".join(code_buffer)
                    html_blocks.append(f'<div class="mermaid-diagram-box"><pre class="mermaid">\n{raw_mermaid}\n</pre></div>')
                else:
                    escaped_code = "\n".join(code_buffer).replace("<", "&lt;").replace(">", "&gt;")
                    html_blocks.append(f'<pre><code class="language-{code_lang}">{escaped_code}</code></pre>')
                code_buffer = []
                in_code_block = False
            else:
                code_lang = stripped.lstrip("`").strip().lower() or "text"
                code_buffer = []
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_buffer.append(line)
            i += 1
            continue

        # 2. Markdown Table Detection (starts and ends with |)
        if stripped.startswith("|") and stripped.endswith("|"):
            flush_list()
            in_table = True
            table_buffer.append(stripped)
            i += 1
            continue
        elif in_table:
            flush_table()

        # 3. Empty Line
        if not stripped:
            flush_list()
            flush_table()
            i += 1
            continue

        # 4. Horizontal Rule
        if re.match(r'^(?:---|\*\*\*|___)$', stripped):
            flush_list()
            flush_table()
            html_blocks.append('<hr class="post-divider essay-divider" />')
            i += 1
            continue

        # 5. Math Display Block ($$...$$)
        if stripped.startswith("$$"):
            flush_list()
            flush_table()
            if stripped.endswith("$$") and len(stripped) > 2:
                math_expr = stripped[2:-2].strip()
                html_blocks.append(f'<div class="math-block">$${math_expr}$$</div>')
                i += 1
                continue
            else:
                math_lines = [stripped[2:]]
                i += 1
                while i < len(lines):
                    m_line = lines[i].strip()
                    if m_line.endswith("$$"):
                        math_lines.append(m_line[:-2])
                        i += 1
                        break
                    else:
                        math_lines.append(lines[i])
                        i += 1
                math_expr = "\n".join(math_lines).strip()
                html_blocks.append(f'<div class="math-block">$${math_expr}$$</div>')
                continue

        # 6. Headings
        h1_m = re.match(r'^#\s+(.+)$', stripped)
        h2_m = re.match(r'^##\s+(.+)$', stripped)
        h3_m = re.match(r'^###\s+(.+)$', stripped)

        if h2_m:
            flush_list()
            flush_table()
            html_blocks.append(f'<h2 class="post-section-kicker essay-section-kicker">{format_inline_markdown(h2_m.group(1))}</h2>')
            i += 1
            continue
        if h3_m:
            flush_list()
            flush_table()
            html_blocks.append(f'<h3 class="post-subheading essay-subheading">{format_inline_markdown(h3_m.group(1))}</h3>')
            i += 1
            continue
        if h1_m:
            flush_list()
            flush_table()
            html_blocks.append(f'<h2 class="post-section-kicker essay-section-kicker">{format_inline_markdown(h1_m.group(1))}</h2>')
            i += 1
            continue

        # 7. Blockquote
        if stripped.startswith(">"):
            flush_list()
            flush_table()
            quote_text = re.sub(r'^>\s*', '', stripped)
            html_blocks.append(f'<blockquote class="post-quote essay-quote">{format_inline_markdown(quote_text)}</blockquote>')
            i += 1
            continue

        # 8. Lists (Ordered: 1. Item, Unordered: - Item / * Item)
        ol_m = re.match(r'^\d+\.\s+(.+)$', stripped)
        ul_m = re.match(r'^[-*]\s+(.+)$', stripped)

        if ol_m:
            if not in_list or list_type != "ol":
                flush_list()
                in_list = True
                list_type = "ol"
            list_items.append(format_inline_markdown(ol_m.group(1)))
            i += 1
            continue
        elif ul_m:
            if not in_list or list_type != "ul":
                flush_list()
                in_list = True
                list_type = "ul"
            list_items.append(format_inline_markdown(ul_m.group(1)))
            i += 1
            continue
        else:
            flush_list()

        # 9. Direct HTML Tag / Block pass-through (iframes, divs, styles, comments, embeds)
        if re.match(r"^<(?:!--|[a-zA-Z0-9_-]+|\/[a-zA-Z0-9_-]+)", stripped):
            flush_list()
            flush_table()
            if stripped.startswith("<style"):
                style_lines = [line]
                if not stripped.endswith("</style>"):
                    i += 1
                    while i < len(lines):
                        style_lines.append(lines[i])
                        if "</style>" in lines[i]:
                            break
                        i += 1
                html_blocks.append("\n".join(style_lines))
                i += 1
                continue
            elif stripped.startswith("<!--"):
                comment_lines = [line]
                if not stripped.endswith("-->"):
                    i += 1
                    while i < len(lines):
                        comment_lines.append(lines[i])
                        if "-->" in lines[i]:
                            break
                        i += 1
                html_blocks.append("\n".join(comment_lines))
                i += 1
                continue
            else:
                html_blocks.append(stripped)
                i += 1
                continue

        # 10. Standard Paragraph
        html_blocks.append(f'<p class="post-paragraph essay-paragraph">{format_inline_markdown(stripped)}</p>')
        i += 1

    flush_list()
    flush_table()

    return "\n\n".join(html_blocks)
