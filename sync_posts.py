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

def _to_bool(val, default=True):
    if val is None:
        return default
    if isinstance(val, bool):
        return val
    return str(val).strip().lower() != "false"


def _resolve_taxonomy(meta, canonical_pillars):
    topic = meta.get("topic", {})
    raw_pillar = topic.get("pillar", "") if isinstance(topic, dict) else meta.get("pillar", "")
    raw_subtopic = topic.get("subtopic", "") if isinstance(topic, dict) else meta.get("subtopic", "")

    matched_pil = match_canonical_pillar(raw_pillar, canonical_pillars)
    pillar = matched_pil["title"] if matched_pil else raw_pillar
    pillar_id = matched_pil["id"] if matched_pil else (slugify(raw_pillar) if raw_pillar else "")

    matched_sub = match_canonical_subtopic(raw_subtopic, canonical_pillars)
    subtopic = matched_sub["title"] if matched_sub else raw_subtopic
    subtopic_id = matched_sub["id"] if matched_sub else (slugify(raw_subtopic) if raw_subtopic else "")

    return {
        "pillar": pillar,
        "pillar_id": pillar_id,
        "subtopic": subtopic,
        "subtopic_id": subtopic_id,
        "matched_pil": matched_pil,
    }


def _resolve_foundations(meta, matched_pil):
    inherited = matched_pil.get("foundations", []) if matched_pil else []
    raw = meta.get("foundations") or meta.get("foundation") or []
    if isinstance(raw, str):
        raw = [f.strip().lower() for f in raw.split(",") if f.strip()]
    elif isinstance(raw, list):
        raw = [str(f).strip().lower() for f in raw if f]
    else:
        raw = []

    seen = set()
    foundations = []
    for item in inherited + raw:
        s = slugify(item)
        if s and s not in seen:
            seen.add(s)
            foundations.append(s)
    return foundations


def _resolve_images(meta):
    img_data = meta.get("image")
    if isinstance(img_data, dict):
        image = img_data.get("path", "")
        img_alt = img_data.get("alt", "")
    elif isinstance(img_data, str):
        image = img_data
        img_alt = meta.get("image_alt") or meta.get("alt", "")
    else:
        image = meta.get("cover_image", "")
        img_alt = meta.get("image_alt") or meta.get("alt", "")

    thumbnail = generate_thumbnail(image) if image else ""

    gallery_imgs = []
    for g in meta.get("gallery_images") or []:
        g_path = (g.get("path") or g.get("image") or "") if isinstance(g, dict) else str(g)
        g_path = g_path.strip()
        if not g_path:
            continue
        g_alt = g.get("alt", "").strip() if isinstance(g, dict) else ""
        g_title = g.get("title", "").strip() if isinstance(g, dict) else ""
        gallery_imgs.append({
            "path": g_path,
            "image": g_path,
            "thumbnail": generate_thumbnail(g_path),
            "alt": g_alt,
            "title": g_title,
        })

    return {
        "image": image,
        "image_alt": img_alt,
        "thumbnail": thumbnail,
        "aspect_ratio": meta.get("aspect_ratio") or "h-tall-1",
        "gallery_images": gallery_imgs,
    }


def _resolve_links_and_backlinks(meta):
    links = [
        {
            "title": l.get("title", ""),
            "url": l.get("url", "#"),
            "type": (l.get("type") or "LINK").upper(),
            "desc": l.get("description") or l.get("desc") or "",
        }
        for l in (meta.get("links") or [])
        if isinstance(l, dict)
    ]
    backlinks = [
        {
            "slug": b.get("slug", "#"),
            "title": b.get("title", ""),
            "note": b.get("note", ""),
        }
        for b in (meta.get("backlinks") or [])
        if isinstance(b, dict)
    ]
    return links, backlinks


def _format_date(raw_date):
    raw_str = str(raw_date or "")
    match = re.match(r"^(\d{4})[-.](\d{2})[-.](\d{2})", raw_str)
    return f"{match.group(1)}.{match.group(2)}.{match.group(3)}" if match else raw_str


def _parse_single_post(file_path: Path, canonical_pillars):
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    meta, body = parse_yaml_frontmatter(content)
    slug = file_path.stem
    sys_id = meta.get("sys_id") or f"SYS_{slug.upper()}"

    tax = _resolve_taxonomy(meta, canonical_pillars)
    foundations = _resolve_foundations(meta, tax["matched_pil"])
    img = _resolve_images(meta)
    links, backlinks = _resolve_links_and_backlinks(meta)

    category = meta.get("category", "")
    media = meta.get("media", "")
    source = meta.get("source") or meta.get("via", "")
    target_url = meta.get("resource_url") or meta.get("bookmark_url") or meta.get("url") or meta.get("link") or ""
    is_featured = bool(meta.get("featured", False)) or str(meta.get("featured", "")).lower() == "true"

    return {
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
        "pillar": tax["pillar"].upper() if tax["pillar"] else "",
        "pillar_id": tax["pillar_id"],
        "foundations": foundations,
        "subtopic": tax["subtopic"].upper() if tax["subtopic"] else "",
        "subtopic_id": tax["subtopic_id"],
        "theme": meta.get("theme", "dark"),
        "featured": is_featured,
        "shareable": _to_bool(meta.get("shareable")),
        "allow_embed": _to_bool(meta.get("allow_embed")),
        "gallery": _to_bool(meta.get("gallery", meta.get("in_gallery"))),
        "status": meta.get("status", "published"),
        "date": _format_date(meta.get("date")),
        "author": meta.get("author", "Juan P. Giusepponi"),
        "read_time": (meta.get("reading_time") or meta.get("read_time") or "8 MIN READ").upper(),
        "via": source,
        "image": img["image"],
        "thumbnail": img["thumbnail"],
        "image_alt": img["image_alt"],
        "aspect_ratio": img["aspect_ratio"],
        "gallery_images": img["gallery_images"],
        "links": links,
        "backlinks": backlinks,
        "tags": meta.get("tags", []),
        "entities": meta.get("entities"),
        "content": clean_and_convert_markdown(body),
    }


def _write_outputs(posts):
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

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

    if ROOT_DIR != BASE_DIR:
        shutil.copy2(OUTPUT_JSON, ROOT_DIR / "posts.json")
        shutil.copy2(OUTPUT_JS, ROOT_DIR / "posts.js")


def compile_posts():
    """Reads all Markdown files in _posts/ and outputs posts.json & posts.js."""
    if not POSTS_DIR.exists():
        print(f"Error: Directory {POSTS_DIR} not found.")
        return False

    canonical_pillars, canonical_foundations = load_taxonomy_data()
    if canonical_pillars or canonical_foundations:
        sync_pillars_js(canonical_pillars, canonical_foundations)

    posts = []
    for file_path in sorted(POSTS_DIR.glob("*.md"), reverse=True):
        if file_path.name.startswith("TEMPLATE") or file_path.name.startswith("."):
            continue

        try:
            post = _parse_single_post(file_path, canonical_pillars)
            posts.append(post)
            print(f"  [OK] Processed: {file_path.name} -> {post['sys_id']}")
        except Exception as e:
            print(f"  [ERROR] Parsing {file_path.name}: {e}")

    _write_outputs(posts)
    compile_tags_database(posts)
    generate_post_html_files(posts)
    generate_sitemap(posts)

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
