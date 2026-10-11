"""
UNTITLED.JPG — Markdown Post Compiler & Content Synchronizer
Scans `_posts/*.md` and generates `posts.json` & `posts.js` for seamless client-side hydration.

Usage:
  python sync_posts.py          # Compile once
  python sync_posts.py --watch  # Watch _posts folder for changes and auto-recompile
"""

import sys
import re
import json
import time
import shutil
from pathlib import Path

from builder.config import (
    BASE_DIR,
    POSTS_DIR,
    OUTPUT_JSON,
    OUTPUT_JS,
    PILLARS_JSON,
    ROOT_DIR,
)
from builder.taxonomy import (
    load_taxonomy_data,
    sync_pillars_js,
    match_canonical_pillar,
    match_canonical_subtopic,
)
from builder.images import generate_thumbnail
from builder.parser import (
    slugify,
    parse_yaml_frontmatter,
    clean_and_convert_markdown,
)
from builder.tags import compile_tags_database
from builder.html_page import generate_post_html_files
from builder.sitemap import generate_sitemap

def compile_posts():
    """Reads all Markdown files in _posts/ and outputs posts.json & posts.js."""
    if not POSTS_DIR.exists():
        print(f"Error: Directory {POSTS_DIR} not found.")
        return False
        
    canonical_pillars, canonical_foundations = load_taxonomy_data()
    if canonical_pillars or canonical_foundations:
        sync_pillars_js(canonical_pillars, canonical_foundations)

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
            
            # Topic hierarchy & canonical taxonomy resolution
            topic = meta.get("topic", {})
            raw_pillar = topic.get("pillar", "") if isinstance(topic, dict) else meta.get("pillar", "")
            raw_subtopic = topic.get("subtopic", "") if isinstance(topic, dict) else meta.get("subtopic", "")

            matched_pil = match_canonical_pillar(raw_pillar, canonical_pillars)
            pillar = matched_pil["title"] if matched_pil else raw_pillar
            pillar_id = matched_pil["id"] if matched_pil else (slugify(raw_pillar) if raw_pillar else "")

            matched_sub = match_canonical_subtopic(raw_subtopic, canonical_pillars)
            subtopic = matched_sub["title"] if matched_sub else raw_subtopic
            subtopic_id = matched_sub["id"] if matched_sub else (slugify(raw_subtopic) if raw_subtopic else "")

            # Foundations resolution (inherited from matched pillar + explicit post frontmatter)
            inherited_foundations = matched_pil.get("foundations", []) if matched_pil else []
            raw_meta_foundations = meta.get("foundations") or meta.get("foundation") or []
            if isinstance(raw_meta_foundations, str):
                raw_meta_foundations = [f.strip().lower() for f in raw_meta_foundations.split(",") if f.strip()]
            elif isinstance(raw_meta_foundations, list):
                raw_meta_foundations = [str(f).strip().lower() for f in raw_meta_foundations if f]
            else:
                raw_meta_foundations = []

            combined_foundations = []
            seen_f = set()
            for f_item in inherited_foundations + raw_meta_foundations:
                f_slug = slugify(f_item)
                if f_slug and f_slug not in seen_f:
                    seen_f.add(f_slug)
                    combined_foundations.append(f_slug)
            
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
            
            # Generate or reuse optimized downscaled thumbnail
            thumbnail = generate_thumbnail(image) if image else ""

            # Gallery Images (additional artworks to populate 3D spatial gallery)
            raw_gallery_imgs = meta.get("gallery_images") or []
            normalized_gallery_images = []
            if isinstance(raw_gallery_imgs, list):
                for g_item in raw_gallery_imgs:
                    g_path = ""
                    g_alt = ""
                    g_title = ""
                    if isinstance(g_item, dict):
                        g_path = str(g_item.get("path") or g_item.get("image") or "").strip()
                        g_alt = str(g_item.get("alt") or "").strip()
                        g_title = str(g_item.get("title") or "").strip()
                    elif isinstance(g_item, str):
                        g_path = g_item.strip()
                    if g_path:
                        g_thumb = generate_thumbnail(g_path)
                        normalized_gallery_images.append({
                            "path": g_path,
                            "image": g_path,
                            "thumbnail": g_thumb,
                            "alt": g_alt,
                            "title": g_title
                        })
            
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
            gallery = meta.get("gallery", meta.get("in_gallery", True))
            if isinstance(gallery, str):
                gallery = gallery.lower() != "false"

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
                "pillar": pillar.upper() if pillar else "",
                "pillar_id": pillar_id,
                "foundations": combined_foundations,
                "subtopic": subtopic.upper() if subtopic else "",
                "subtopic_id": subtopic_id,
                "theme": meta.get("theme", "dark"),
                "featured": is_featured,
                "shareable": shareable,
                "allow_embed": allow_embed,
                "gallery": gallery,
                "status": meta.get("status", "published"),
                "date": formatted_date,
                "author": meta.get("author", "Juan P. Giusepponi"),
                "read_time": (meta.get("reading_time") or meta.get("read_time") or "8 MIN READ").upper(),
                "via": source,
                "image": image,
                "thumbnail": thumbnail,
                "image_alt": img_alt,
                "aspect_ratio": aspect_ratio,
                "gallery_images": normalized_gallery_images,
                "links": normalized_links,
                "backlinks": normalized_backlinks,
                "tags": meta.get("tags", []),
                "entities": meta.get("entities"),
                "content": html_content
            }
            posts.append(post_obj)
            print(f"  [OK] Processed: {file_path.name} -> {sys_id}")
            
        except Exception as e:
            print(f"  [ERROR] Parsing {file_path.name}: {e}")
            
    # Write to posts.json
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    # Write to posts.js (for zero-CORS direct file:/// and browser/Node execution)
    js_content = (
        "/** Auto-generated from _posts/*.md by sync_posts.py */\n"
        "(function (root, factory) {\n"
        "  var data = factory();\n"
        "  if (typeof module === 'object' && module.exports) { module.exports = data; }\n"
        "  if (typeof root !== 'undefined') { root.DYNAMIC_POSTS = data; }\n"
        "  if (typeof window !== 'undefined') { window.DYNAMIC_POSTS = data; }\n"
        "  if (typeof global !== 'undefined') { global.DYNAMIC_POSTS = data; }\n"
        "})(typeof self !== 'undefined' ? self : this, function () {\n"
        f"  return {json.dumps(posts, indent=2, ensure_ascii=False)};\n"
        "});\n"
    )
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    # Compile tags & taxonomy database (tags.json / tags.js)
    compile_tags_database(posts)

    # Generate individual post HTML files for social media link previews and direct loading
    generate_post_html_files(posts)

    # Generate sitemap
    generate_sitemap(posts)

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

            if PILLARS_JSON.exists():
                p_mtime = PILLARS_JSON.stat().st_mtime
                if PILLARS_JSON not in last_mtimes or last_mtimes[PILLARS_JSON] != p_mtime:
                    last_mtimes[PILLARS_JSON] = p_mtime
                    changed = True
                    
            if changed:
                print(f"[{time.strftime('%H:%M:%S')}] Detected change in _posts/ or pillars.json. Recompiling...")
                compile_posts()
                
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[WATCHER STOPPED]")

if __name__ == "__main__":
    if "--watch" in sys.argv or "-w" in sys.argv:
        watch_posts()
    else:
        compile_posts()
