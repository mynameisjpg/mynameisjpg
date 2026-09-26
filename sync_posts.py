#!/usr/bin/env python3
"""
UNTITLED.JPG — Markdown Post Compiler & Content Synchronizer
Scans `_posts/*.md` and generates `posts.json` & `posts.js` for seamless client-side hydration.

Usage:
  python sync_posts.py          # Compile once
  python sync_posts.py --watch  # Watch _posts folder for changes and auto-recompile
"""

import os
import sys
import re
import json
import time
import shutil
from pathlib import Path

# Fix Windows console encoding for terminal outputs
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Path configurations
BASE_DIR = Path(__file__).resolve().parent
POSTS_DIR = BASE_DIR / "_posts"
OUTPUT_JSON = BASE_DIR / "posts.json"
OUTPUT_JS = BASE_DIR / "posts.js"
ROOT_DIR = BASE_DIR.parent if (BASE_DIR.parent / "index.html").exists() else BASE_DIR

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
        
        kv_match = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if kv_match and not line.startswith(" ") and not line.startswith("\t"):
            key = kv_match.group(1)
            val = kv_match.group(2).strip().strip('"\'')
            current_key = key
            
            if val == "":
                metadata[key] = []
            elif val.lower() == "true":
                metadata[key] = True
            elif val.lower() == "false":
                metadata[key] = False
            else:
                metadata[key] = val
        elif line.startswith("  - ") or line.startswith("- "):
            item = stripped.lstrip("- ").strip('"\'')
            if current_key:
                if not isinstance(metadata.get(current_key), list):
                    metadata[current_key] = []
                metadata[current_key].append(item)
    
    return metadata, body_text

def format_inline_markdown(text):
    """Transforms inline Markdown: bold, italic, code, math, links."""
    # Escape HTML special chars inside text (preserving intentional tags if any)
    out = text
    # Math inline: $E = mc^2$ -> <code class="math-inline">$E = mc^2$</code>
    out = re.sub(r'(?<!\\)\$([^\$]+?)\$', r'<code class="math-inline">$\1$</code>', out)
    # Bold + Italic: ***text*** or ___text___
    out = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', out)
    # Bold: **text**
    out = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', out)
    # Italic: *text* or _text_
    out = re.sub(r'(?<!\w)\*([^\*]+?)\*(?!\w)', r'<em>\1</em>', out)
    out = re.sub(r'(?<!\w)_([^_]+?)_(?!\w)', r'<em>\1</em>', out)
    # Code inline: `code`
    out = re.sub(r'`([^`]+?)`', r'<code>\1</code>', out)
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
    list_type = "ul" # or "ol"
    list_items = []
    
    def flush_list():
        nonlocal in_list, list_type, list_items
        if in_list and list_items:
            tag = list_type
            items_html = "".join([f"<li>{item}</li>" for item in list_items])
            html_blocks.append(f"<{tag} class=\"post-list essay-list\">{items_html}</{tag}>")
            list_items = []
            in_list = False

    def flush_table():
        nonlocal in_table, table_buffer
        if in_table and table_buffer:
            rows = table_buffer
            table_html = ['<div class="table-responsive"><table class="post-table essay-table">']
            # First row is header
            if len(rows) > 0:
                header_cols = [c.strip() for c in rows[0].strip('|').split('|')]
                table_html.append('<thead><tr>')
                for c in header_cols:
                    table_html.append(f'<th>{format_inline_markdown(c)}</th>')
                table_html.append('</tr></thead>')
            # Check for body rows (skipping delimiter row like |---|---|)
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
                # Multi-line math block
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

        # 9. Direct HTML Tag pass-through
        if stripped.startswith("<h") or stripped.startswith("<div") or stripped.startswith("<p") or stripped.startswith("<table"):
            html_blocks.append(stripped)
            i += 1
            continue

        # 10. Standard Paragraph
        html_blocks.append(f'<p class="post-paragraph essay-paragraph">{format_inline_markdown(stripped)}</p>')
        i += 1

    flush_list()
    flush_table()

    return "\n\n".join(html_blocks)

def compile_posts():
    """Reads all Markdown files in _posts/ and outputs posts.json & posts.js."""
    if not POSTS_DIR.exists():
        print(f"Error: Directory {POSTS_DIR} not found.")
        return False
        
    posts = []
    # Sort files chronologically descending
    for file_path in sorted(POSTS_DIR.glob("*.md"), reverse=True):
        if file_path.name.startswith("TEMPLATE") or file_path.name.startswith("."):
            continue
            
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
                
            meta, body = parse_yaml_frontmatter(content)
            
            # Extract attributes
            slug = file_path.stem
            sys_id = meta.get("sys_id") or f"SYS_{slug.upper()}"
            
            # Topic hierarchy
            topic = meta.get("topic", {})
            pillar = topic.get("pillar", "") if isinstance(topic, dict) else meta.get("pillar", "")
            subtopic = topic.get("subtopic", "") if isinstance(topic, dict) else meta.get("subtopic", "")
            
            # Format-specific metadata
            category = meta.get("category", "")
            media = meta.get("media", "")
            source = meta.get("source") or meta.get("via", "")
            target_url = meta.get("resource_url") or meta.get("bookmark_url") or meta.get("url") or meta.get("link") or ""
            
            # Date formatting
            raw_date = str(meta.get("date", ""))
            date_match = re.match(r"^(\d{4})[-.](\d{2})[-.](\d{2})", raw_date)
            formatted_date = f"{date_match.group(1)}.{date_match.group(2)}.{date_match.group(3)}" if date_match else raw_date
            
            # Image & Aspect Ratio Defaults
            img_data = meta.get("image")
            if isinstance(img_data, dict):
                image = img_data.get("path", "")
            elif isinstance(img_data, str):
                image = img_data
            else:
                image = meta.get("cover_image", "")
                
            aspect_ratio = meta.get("aspect_ratio") or "h-tall-1"
            
            # Convert body to clean rich HTML
            html_content = clean_and_convert_markdown(body)
            
            # Normalize links and backlinks
            links = meta.get("links") or []
            normalized_links = []
            for l in links:
                if isinstance(l, dict):
                    normalized_links.append({
                        "title": l.get("title", ""),
                        "url": l.get("url", "#"),
                        "type": (l.get("type") or "LINK").upper(),
                        "desc": l.get("description") or l.get("desc") or ""
                    })
                    
            backlinks = meta.get("backlinks") or []
            normalized_backlinks = []
            for b in backlinks:
                if isinstance(b, dict):
                    normalized_backlinks.append({
                        "slug": b.get("slug", "#"),
                        "title": b.get("title", ""),
                        "note": b.get("note", "")
                    })
            
            is_featured = bool(meta.get("featured", False)) or str(meta.get("featured", "")).lower() == "true"
            shareable = meta.get("shareable", True)
            if isinstance(shareable, str):
                shareable = shareable.lower() != "false"
            allow_embed = meta.get("allow_embed", True)
            if isinstance(allow_embed, str):
                allow_embed = allow_embed.lower() != "false"

            post_obj = {
                "id": slug,
                "slug": slug,
                "sys_id": sys_id,
                "title": meta.get("title", slug),
                "subtitle": meta.get("subtitle", ""),
                "excerpt": meta.get("excerpt", ""),
                "format": (meta.get("format") or "ESSAY").upper(),
                "category": category.upper() if category else "",
                "media": media.upper() if media else "",
                "source": source,
                "url": target_url,
                "pillar": pillar.upper(),
                "subtopic": subtopic.upper(),
                "theme": meta.get("theme", "dark"),
                "featured": is_featured,
                "shareable": shareable,
                "allow_embed": allow_embed,
                "status": meta.get("status", "published"),
                "date": formatted_date,
                "author": meta.get("author", "Juan P. Giusepponi"),
                "read_time": (meta.get("reading_time") or meta.get("read_time") or "8 MIN READ").upper(),
                "via": source,
                "image": image,
                "aspect_ratio": aspect_ratio,
                "links": normalized_links,
                "backlinks": normalized_backlinks,
                "tags": meta.get("tags", []),
                "content": html_content
            }
            posts.append(post_obj)
            print(f"  [OK] Processed: {file_path.name} -> {sys_id}")
            
        except Exception as e:
            print(f"  [ERROR] Parsing {file_path.name}: {e}")
            
    # Write to posts.json
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    # Write to posts.js (for zero-CORS direct file:/// and browser execution)
    js_content = f"/** Auto-generated from _posts/*.md by sync_posts.py */\nwindow.DYNAMIC_POSTS = {json.dumps(posts, indent=2, ensure_ascii=False)};\n"
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    # Also sync copies to repository root if separate
    if ROOT_DIR != BASE_DIR:
        shutil.copy2(OUTPUT_JSON, ROOT_DIR / "posts.json")
        shutil.copy2(OUTPUT_JS, ROOT_DIR / "posts.js")

    print(f"\n[SUCCESS] Compiled {len(posts)} full posts into {OUTPUT_JSON.name} & {OUTPUT_JS.name}\n")
    return True

def watch_posts():
    """Watches _posts/ folder and auto-recompiles on change."""
    print(f"[WATCHER ACTIVE] Monitoring {POSTS_DIR} for changes... (Press Ctrl+C to stop)")
    compile_posts()
    last_mtimes = {}
    
    try:
        while True:
            changed = False
            for file_path in POSTS_DIR.glob("*.md"):
                mtime = file_path.stat().st_mtime
                if file_path not in last_mtimes or last_mtimes[file_path] != mtime:
                    last_mtimes[file_path] = mtime
                    changed = True
                    
            if changed:
                print(f"[{time.strftime('%H:%M:%S')}] Detected change in _posts/. Recompiling...")
                compile_posts()
                
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[WATCHER STOPPED]")

if __name__ == "__main__":
    if "--watch" in sys.argv or "-w" in sys.argv:
        watch_posts()
    else:
        compile_posts()
