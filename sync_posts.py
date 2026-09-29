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
import struct
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
OUTPUT_TAGS_JSON = BASE_DIR / "tags.json"
OUTPUT_TAGS_JS = BASE_DIR / "tags.js"
POSTS_HTML_DIR = BASE_DIR / "posts"
ROOT_DIR = BASE_DIR.parent if (BASE_DIR.parent / "index.html").exists() else BASE_DIR

def get_image_dimensions(image_rel_or_path):
    """
    Reads actual pixel dimensions (width, height) directly from PNG, JPEG, or WebP headers
    without external dependencies. Falls back to (1200, 630) if missing or unreadable.
    """
    if not image_rel_or_path:
        return 1200, 630
    
    clean_path = str(image_rel_or_path).lstrip("/").lstrip("./")
    target_path = BASE_DIR / clean_path
    if not target_path.exists():
        target_path = ROOT_DIR / clean_path
    if not target_path.exists():
        return 1200, 630

    try:
        with open(target_path, "rb") as f:
            data = f.read(65536) # Read first 64KB
        size = len(data)
        
        # 1. PNG
        if size >= 24 and data[:8] == b'\x89PNG\r\n\x1a\n' and data[12:16] == b'IHDR':
            w, h = struct.unpack('>LL', data[16:24])
            return int(w), int(h)
            
        # 2. JPEG
        if size >= 2 and data[:2] == b'\xff\xd8':
            idx = 2
            while idx < size - 8:
                if data[idx] != 0xff:
                    idx += 1
                    continue
                marker = data[idx+1]
                # SOF markers with dimensions
                if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                    h, w = struct.unpack('>HH', data[idx+5:idx+9])
                    return int(w), int(h)
                if idx + 4 > size:
                    break
                length = struct.unpack('>H', data[idx+2:idx+4])[0]
                idx += 2 + length
                
        # 3. WebP
        if size >= 30 and data[:4] == b'RIFF' and data[8:12] == b'WEBP':
            if data[12:16] == b'VP8 ':
                w, h = struct.unpack('<HH', data[26:30])
                return int(w & 0x3fff), int(h & 0x3fff)
            elif data[12:16] == b'VP8X':
                w = struct.unpack('<I', data[24:27] + b'\x00')[0] + 1
                h = struct.unpack('<I', data[27:30] + b'\x00')[0] + 1
                return int(w), int(h)
    except Exception:
        pass
        
    return 1200, 630

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
    # Escape HTML special chars inside text (preserving intentional tags if any)
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
            img_alt = ""
            if isinstance(img_data, dict):
                image = img_data.get("path", "")
                img_alt = img_data.get("alt", "")
            elif isinstance(img_data, str):
                image = img_data
                img_alt = meta.get("image_alt") or meta.get("alt", "")
            else:
                image = meta.get("cover_image", "")
                img_alt = meta.get("image_alt") or meta.get("alt", "")
                
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
                "image_alt": img_alt,
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
        
    # Compile tags & taxonomy database (tags.json / tags.js)
    compile_tags_database(posts)

    # Generate individual post HTML files for social media link previews and direct loading
    generate_post_html_files(posts)

    # Also sync copies to repository root if separate
    if ROOT_DIR != BASE_DIR:
        shutil.copy2(OUTPUT_JSON, ROOT_DIR / "posts.json")
        shutil.copy2(OUTPUT_JS, ROOT_DIR / "posts.js")

    print(f"\n[SUCCESS] Compiled {len(posts)} full posts into {OUTPUT_JSON.name} & {OUTPUT_JS.name}\n")
    return True

def generate_post_html_files(posts):
    """
    Generates standalone post HTML pages under /posts/[slug].html.
    Each page contains exact Open Graph & Twitter Card metadata for LinkedIn, X, FB,
    and boots the full split-layout application with the current post active.
    """
    POSTS_HTML_DIR.mkdir(parents=True, exist_ok=True)
    SITE_ORIGIN = "https://mynameisjpg.github.io/mynameisjpg"
    DEFAULT_OG_IMAGE = f"{SITE_ORIGIN}/assets/images/favicon.svg"

    for post in posts:
        raw_slug = post.get("slug") or post.get("id") or post.get("sys_id")
        if not raw_slug:
            continue

        # Strip date prefix (e.g., "2026-09-24-lecun-..." -> "lecun-...")
        clean_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', raw_slug)

        title = (post.get("title") or "Untitled Dispatch").replace('"', '&quot;')
        
        # Ensure description is at least 100 characters (LinkedIn warning requirement)
        # and capped under 300 characters for optimal card rendering.
        excerpt = (post.get("excerpt") or "").strip()
        subtitle = (post.get("subtitle") or "").strip()
        
        candidates = []
        if excerpt and len(excerpt) >= 100:
            candidates.append(excerpt)
        if subtitle and len(subtitle) >= 100:
            candidates.append(subtitle)
        if subtitle and excerpt and subtitle != excerpt:
            combined = f"{subtitle} {excerpt}"
            if len(combined) >= 100:
                candidates.append(combined)
        if excerpt:
            candidates.append(excerpt)
        if subtitle:
            candidates.append(subtitle)
        candidates.append("Untitled.jpg — Dispatches on AI perception, cognitive psychophysics, high-dimensional latent space, and media archaeology.")
        
        # Pick the first candidate with >= 100 characters, or fallback to the longest available
        description = candidates[0]
        for c in candidates:
            if len(c) >= 100:
                description = c
                break
        
        # Clean quotes and clamp to 300 characters without cutting words awkwardly
        if len(description) > 300:
            description = description[:297].rsplit(' ', 1)[0] + '...'
        description = description.replace('"', '&quot;').replace('\n', ' ').strip()

        post_url = f"{SITE_ORIGIN}/posts/{clean_slug}.html"
        
        # ISO 8601 publish date (YYYY-MM-DD) for LinkedIn and schema crawlers
        raw_post_date = str(post.get("date", ""))
        iso_date_match = re.search(r'(\d{4})[-.](\d{2})[-.](\d{2})', raw_post_date)
        iso_published_time = f"{iso_date_match.group(1)}-{iso_date_match.group(2)}-{iso_date_match.group(3)}" if iso_date_match else raw_post_date

        # Resolve absolute image URL and real dimensions for Open Graph crawlers
        raw_image = post.get("image") or ""
        if raw_image.startswith("http://") or raw_image.startswith("https://"):
            og_image = raw_image
        elif raw_image:
            clean_img = raw_image.lstrip("./").lstrip("/")
            og_image = f"{SITE_ORIGIN}/{clean_img}"
        else:
            og_image = DEFAULT_OG_IMAGE

        # Measure actual pixel dimensions of the image
        img_w, img_h = get_image_dimensions(raw_image)

        # Alt text for the image: use image_alt, falling back to subtitle or title
        raw_alt = post.get("image_alt") or post.get("subtitle") or title
        image_alt = raw_alt.replace('"', '&quot;').replace('\n', ' ').strip()

        post_html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Untitled.jpg</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{post_url}">

  <!-- Open Graph / LinkedIn / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Untitled.jpg">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{post_url}">
  <meta name="image" property="og:image" content="{og_image}">
  <meta property="og:image:secure_url" content="{og_image}">
  <meta property="og:image:width" content="{img_w}">
  <meta property="og:image:height" content="{img_h}">
  <meta property="og:image:alt" content="{image_alt}">
  <meta property="article:published_time" content="{iso_published_time}">
  <meta property="article:author" content="{post.get('author', 'Juan P. Giusepponi')}">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@untitled_jpg">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">
  <meta name="twitter:image:alt" content="{image_alt}">

  <base href="../">

  <!-- Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Azeret+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&family=Platypi:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  
  <!-- Math Rendering (KaTeX), Markdown (Marked.js), & Diagrams (Mermaid.js) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <!-- Design System Stylesheets -->
  <link rel="stylesheet" href="index.css">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
  <link rel="shortcut icon" type="image/svg+xml" href="assets/images/favicon.svg">
  <link rel="apple-touch-icon" href="assets/images/favicon.svg">
  
  <!-- Autonomous Web Components -->
  <script src="js/components/sidebar-rail.js"></script>
</head>
<body>

  <!-- Sidebar Rail Component -->
  <sidebar-rail active-page="home" has-search></sidebar-rail>

  <!-- Interactive Dropdown Overlays -->
  <div id="dispatch-log-dropdown" class="top-dropdown-panel menu-dropdown-panel dispatch-log-panel" style="display:none;">
    <div class="dropdown-header">[ DISPATCH LOG ]</div>
    <button type="button" class="dropdown-option active" data-filter="all">SHOW ALL DISPATCHES</button>
    <button type="button" class="dropdown-option" data-filter="essay">_ESSAYS</button>
    <button type="button" class="dropdown-option" data-filter="note">_NOTES</button>
    <button type="button" class="dropdown-option" data-filter="bookmark">_BOOKMARKS</button>
    <button type="button" class="dropdown-option" data-filter="resource">_RESOURCES</button>
  </div>

  <div id="top-search-dropdown" class="top-dropdown-panel search-dropdown-panel" style="display:none;">
    <input type="text" id="top-search-input" name="search" placeholder="SEARCH DISPATCHES..." aria-label="Search dispatches" autocomplete="off" spellcheck="false" />
  </div>

  <div id="top-filter-dropdown" class="top-dropdown-panel menu-dropdown-panel filter-panel" style="display:none;">
    <div class="dropdown-header">[ FILTER BY FORMAT ]</div>
    <button type="button" class="dropdown-option active" data-filter="all">SHOW ALL DISPATCHES</button>
    <button type="button" class="dropdown-option" data-filter="essay">_ESSAYS</button>
    <button type="button" class="dropdown-option" data-filter="note">_NOTES</button>
    <button type="button" class="dropdown-option" data-filter="bookmark">_BOOKMARKS</button>
    <button type="button" class="dropdown-option" data-filter="resource">_RESOURCES</button>
  </div>

  <div id="top-sort-dropdown" class="top-dropdown-panel menu-dropdown-panel sort-panel" style="display:none;">
    <div class="dropdown-header">[ SORT ORDER ]</div>
    <button type="button" class="dropdown-option active" data-sort="newest">NEWEST FIRST &#8595;</button>
    <button type="button" class="dropdown-option" data-sort="oldest">OLDEST FIRST &#8593;</button>
    <button type="button" class="dropdown-option" data-sort="title">ALPHABETICAL (A-Z)</button>
  </div>

  <!-- Split 50-50 Layout -->
  <main class="split-layout reader-open" data-component="split-shell">
    <section class="grid-column" data-component="dispatch-matrix" aria-label="Dispatch Grid Matrix">
      <div class="matrix-header-group">
        <div class="header-col-left">
          <span class="header-legend">SYS_LOG // ASYMMETRIC_DISPATCH_MATRIX</span>
          <div class="controls-row-left">
            <div class="custom-select-wrapper flex-pill">
              <button type="button" class="btn-matrix-pill" id="filter-pill-btn" aria-haspopup="true" aria-expanded="false" title="Filter by format">
                <span class="pill-label">FILTER:</span>
                <span class="pill-value" id="current-filter-val">ALL POSTS</span>
                <span class="pill-arrow">▼</span>
              </button>
              <div class="custom-select-dropdown" id="filter-dropdown" role="menu">
                <button type="button" class="dropdown-opt active" data-filter="all" role="menuitem">[ALL POSTS]</button>
                <button type="button" class="dropdown-opt" data-filter="essay" role="menuitem">[ESSAYS]</button>
                <button type="button" class="dropdown-opt" data-filter="note" role="menuitem">[NOTES]</button>
                <button type="button" class="dropdown-opt" data-filter="bookmark" role="menuitem">[BOOKMARKS]</button>
                <button type="button" class="dropdown-opt" data-filter="resource" role="menuitem">[RESOURCES]</button>
              </div>
            </div>

            <div class="custom-select-wrapper flex-pill">
              <button type="button" class="btn-matrix-pill" id="sort-pill-btn" aria-haspopup="true" aria-expanded="false" title="Sort dispatches">
                <span class="pill-label">SORT:</span>
                <span class="pill-value" id="current-sort-val">MOST RECENT</span>
                <span class="pill-arrow">▼</span>
              </button>
              <div class="custom-select-dropdown" id="sort-dropdown" role="menu">
                <button type="button" class="dropdown-opt active" data-sort="recent" role="menuitem">[MOST RECENT]</button>
                <button type="button" class="dropdown-opt" data-sort="oldest" role="menuitem">[OLDEST]</button>
                <button type="button" class="dropdown-opt" data-sort="readtime" role="menuitem">[READING TIME]</button>
                <button type="button" class="dropdown-opt" data-sort="title" role="menuitem">[TITLE A-Z]</button>
              </div>
            </div>
          </div>
        </div>

        <div class="header-col-right">
          <span class="header-legend filter-status" id="active-filter-label">[MODE: ALL_DISPATCHES]</span>
          <div class="matrix-search-box">
            <svg viewBox="0 0 24 24" class="search-icon-svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="matrix-search-input" placeholder="SEARCH DISPATCHES..." aria-label="Search dispatches" autocomplete="off" />
            <button type="button" id="clear-search-btn" style="display: none;" title="Clear search">✕</button>
          </div>
        </div>
      </div>

      <div class="card-grid-matrix" id="card-matrix"></div>
    </section>

    <!-- Reading Pane -->
    <article class="post-column essay-column" id="essay-reading-pane" data-component="reader-pane" aria-label="Post Reader View">
      <button type="button" class="btn-return-grid" aria-label="Return to Grid Feed">
        <span class="return-arrow">&lt;&lt;</span>
        <span class="return-text">[ RETURN TO GRID FEED ]</span>
      </button>
    </article>
  </main>

  <div class="floating-nav-buttons" data-component="floating-controls">
    <button type="button" class="btn-nav-action" id="btn-scroll-top" title="Scroll Reader to Top">↑ TOP</button>
    <button type="button" class="btn-nav-action" id="btn-scroll-bottom" title="Scroll Reader to Bottom">↓ BOTTOM</button>
  </div>

  <dialog id="subscribe-modal" class="modal-dialog" data-component="subscribe-modal" aria-labelledby="modal-heading">
    <div class="modal-box">
      <div class="modal-header-tag">[ DISPATCH_SUBSCRIPTION // FREQUENCY: FORTNIGHTLY ]</div>
      <h2 id="modal-heading" class="modal-title">Subscribe to Untitled.jpg</h2>
      <p class="modal-description">Deep-dive essays and technical dispatches on AI perception, cognitive psychophysics, high-dimensional latent space, and media archaeology.</p>
      
      <form class="modal-form" id="subscribe-form" method="dialog">
        <div class="modal-input-group">
          <label for="subscriber-name" class="modal-input-label">IDENTITY (NAME):</label>
          <input type="text" id="subscriber-name" name="name" class="modal-input" placeholder="Your Name / Alias" autocomplete="name">
        </div>
        <div class="modal-input-group">
          <label for="subscriber-email" class="modal-input-label">TRANSMISSION_ENDPOINT (EMAIL):</label>
          <input type="email" id="subscriber-email" name="email" class="modal-input" placeholder="reader@domain.xyz" required autocomplete="email" spellcheck="false">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-modal-cancel">[ CANCEL ]</button>
          <button type="submit" class="btn-modal-submit">[ TRANSMIT SUBSCRIPTION ]</button>
        </div>
      </form>
    </div>
  </dialog>

  <!-- Specify active post slug for deep-load -->
  <script>
    window.INITIAL_POST_SLUG = "{clean_slug}";
  </script>
  <script src="posts.js"></script>
  <script src="app.js"></script>
</body>
</html>
"""
        target_file = POSTS_HTML_DIR / f"{clean_slug}.html"
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(post_html_content)

    print(f"  [OK] Generated {len(posts)} post HTML files in {POSTS_HTML_DIR.name}/")

def compile_tags_database(posts):
    """
    Builds a comprehensive index of all tags, pillars, and subtopics across all dispatches.
    Generates tags.json and tags.js containing occurrence stats, connected dispatches, and links.
    """
    tags_map = {}

    def get_or_create(tag_id, name, entity_type):
        key = (entity_type, tag_id)
        if key not in tags_map:
            tags_map[key] = {
                "id": tag_id,
                "name": name,
                "label": f"#{name}" if entity_type == "tag" else name,
                "type": entity_type,
                "count": 0,
                "posts": [],
                "links": [],
                "pillars": set(),
                "subtopics": set(),
                "co_occurring": {}
            }
        return tags_map[key]

    for p in posts:
        raw_slug = p.get("slug", "")
        clean_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', raw_slug)

        post_summary = {
            "id": p.get("id"),
            "slug": clean_slug,
            "title": p.get("title"),
            "date": p.get("date"),
            "format": p.get("format"),
            "pillar": p.get("pillar"),
            "subtopic": p.get("subtopic"),
            "url": f"posts/{clean_slug}.html"
        }

        link_entry = {
            "title": p.get("title"),
            "slug": clean_slug,
            "format": p.get("format"),
            "url": f"posts/{clean_slug}.html",
            "date": p.get("date")
        }

        # 1. Process Pillar
        pillar = p.get("pillar")
        if pillar:
            pil_id = f"pillar-{slugify(pillar)}"
            pil_item = get_or_create(pil_id, pillar, "pillar")
            pil_item["count"] += 1
            pil_item["posts"].append(post_summary)
            pil_item["links"].append(link_entry)

        # 2. Process Subtopic
        subtopic = p.get("subtopic")
        if subtopic:
            sub_id = f"subtopic-{slugify(subtopic)}"
            sub_item = get_or_create(sub_id, subtopic, "subtopic")
            sub_item["count"] += 1
            sub_item["posts"].append(post_summary)
            sub_item["links"].append(link_entry)
            if pillar:
                sub_item["pillars"].add(pillar)

        # 3. Process Tags
        post_tags = p.get("tags") or []
        if isinstance(post_tags, str):
            post_tags = [t.strip() for t in post_tags.split(",") if t.strip()]

        for tag in post_tags:
            tag_clean = str(tag).strip().lower().lstrip("#")
            if not tag_clean:
                continue
            tag_id = slugify(tag_clean)
            tag_item = get_or_create(tag_id, tag_clean, "tag")
            tag_item["count"] += 1
            tag_item["posts"].append(post_summary)
            tag_item["links"].append(link_entry)
            if pillar:
                tag_item["pillars"].add(pillar)
            if subtopic:
                tag_item["subtopics"].add(subtopic)

            # Track co-occurrences with other tags in same post
            for other_tag in post_tags:
                other_clean = str(other_tag).strip().lower().lstrip("#")
                if other_clean and other_clean != tag_clean:
                    tag_item["co_occurring"][other_clean] = tag_item["co_occurring"].get(other_clean, 0) + 1

    # Format final list sorted by count descending, then name
    tags_list = []
    for item in tags_map.values():
        item["pillars"] = sorted(list(item["pillars"]))
        item["subtopics"] = sorted(list(item["subtopics"]))
        co_sorted = sorted(item["co_occurring"].items(), key=lambda x: x[1], reverse=True)
        item["connected_tags"] = [k for k, _ in co_sorted[:6]]
        del item["co_occurring"]
        tags_list.append(item)

    tags_list.sort(key=lambda x: (-x["count"], x["name"]))

    # Write tags.json
    with open(OUTPUT_TAGS_JSON, "w", encoding="utf-8") as f:
        json.dump(tags_list, f, indent=2, ensure_ascii=False)

    # Write tags.js (for zero-CORS direct file:/// and browser execution)
    tags_js_content = f"/** Auto-generated from _posts/*.md by sync_posts.py */\nwindow.DYNAMIC_TAGS = {json.dumps(tags_list, indent=2, ensure_ascii=False)};\n"
    with open(OUTPUT_TAGS_JS, "w", encoding="utf-8") as f:
        f.write(tags_js_content)

    if ROOT_DIR != BASE_DIR:
        shutil.copy2(OUTPUT_TAGS_JSON, ROOT_DIR / "tags.json")
        shutil.copy2(OUTPUT_TAGS_JS, ROOT_DIR / "tags.js")

    print(f"  [OK] Generated {len(tags_list)} taxonomy entries in {OUTPUT_TAGS_JSON.name} & {OUTPUT_TAGS_JS.name}")

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
