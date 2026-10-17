"""
Tags and Taxonomy Subsystem for UNTITLED.JPG
Compiles foundations and tags across dispatches.
All posts are categorized via flat tags, with foundations acting as the broadest tag concept.
"""

import json
import re
import shutil
from .config import OUTPUT_TAGS_JSON, OUTPUT_TAGS_JS, ROOT_DIR, BASE_DIR
from .taxonomy import load_taxonomy_data
from .parser import slugify

def compile_tags_database(posts):
    """
    Builds a clean index of all tags (including foundations) across all dispatches.
    Generates tags.json and tags.js containing occurrence stats, connected dispatches, and links.
    """
    tags_map = {}

    def get_or_create(tag_id, name, is_foundation=False):
        if tag_id not in tags_map:
            tags_map[tag_id] = {
                "id": tag_id,
                "name": name,
                "label": f"#{name}" if not is_foundation else name.upper(),
                "type": "foundation" if is_foundation else "tag",
                "count": 0,
                "posts": [],
                "links": [],
                "co_occurring": {}
            }
        return tags_map[tag_id]

    _, canonical_foundations = load_taxonomy_data()
    foundations_lookup = {}

    for cf in canonical_foundations:
        f_id = cf["id"].lower()
        f_slug = cf.get("slug", f_id).lower()
        f_name_lower = cf["name"].lower()
        foundations_lookup[f_id] = cf
        foundations_lookup[f_slug] = cf
        foundations_lookup[f_name_lower] = cf
        foundations_lookup[slugify(cf["name"]).lower()] = cf

    # Pre-populate all canonical foundations so they always exist in directory
    for cf in canonical_foundations:
        fid = cf["id"].lower()
        f_item = get_or_create(fid, cf["name"].lower(), is_foundation=True)
        f_item["order"] = cf.get("order", 99)
        f_item["description"] = cf.get("description", "")

    for p in posts:
        raw_slug = p.get("slug", "")
        clean_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', raw_slug)

        post_summary = {
            "id": p.get("id"),
            "slug": clean_slug,
            "title": p.get("title"),
            "date": p.get("date"),
            "format": p.get("format"),
            "foundations": p.get("foundations", []),
            "url": f"posts/{clean_slug}.html"
        }

        link_entry = {
            "title": p.get("title"),
            "slug": clean_slug,
            "format": p.get("format"),
            "url": f"posts/{clean_slug}.html",
            "date": p.get("date")
        }

        # Process post's tags
        post_tags = p.get("tags") or []
        if isinstance(post_tags, str):
            post_tags = [t.strip() for t in post_tags.split(",") if t.strip()]

        clean_post_tags = []
        for tag in post_tags:
            tag_clean = str(tag).strip().lower().lstrip("#")
            if not tag_clean:
                continue
            clean_post_tags.append(tag_clean)

        unique_post_tags = list(dict.fromkeys(clean_post_tags))

        for tag_clean in unique_post_tags:
            tag_slug = slugify(tag_clean)
            is_fnd = tag_clean in foundations_lookup or tag_slug in foundations_lookup
            tag_id = tag_slug
            display_name = tag_clean

            if is_fnd:
                f_obj = foundations_lookup.get(tag_clean) or foundations_lookup.get(tag_slug)
                tag_id = f_obj["id"].lower()
                display_name = f_obj["name"].lower()

            tag_item = get_or_create(tag_id, display_name, is_foundation=is_fnd)
            tag_item["count"] += 1
            tag_item["posts"].append(post_summary)
            tag_item["links"].append(link_entry)

            # Track co-occurring tags in the same dispatch
            for other_tag in unique_post_tags:
                other_clean = str(other_tag).strip().lower().lstrip("#")
                if other_clean and other_clean != tag_clean:
                    tag_item["co_occurring"][other_clean] = tag_item["co_occurring"].get(other_clean, 0) + 1

    TYPE_WEIGHT = {
        "foundation": 0,
        "tag": 1
    }

    tags_list = []
    for item in tags_map.values():
        co_sorted = sorted(item["co_occurring"].items(), key=lambda x: x[1], reverse=True)
        item["connected_tags"] = [k for k, _ in co_sorted[:6]]
        del item["co_occurring"]
        tags_list.append(item)

    tags_list.sort(key=lambda x: (
        TYPE_WEIGHT.get(x["type"], 99),
        x.get("order", 99) if x["type"] == "foundation" else 0,
        -x["count"],
        x["name"]
    ))

    # Write tags.json
    with open(OUTPUT_TAGS_JSON, "w", encoding="utf-8") as f:
        json.dump(tags_list, f, indent=2, ensure_ascii=False)

    # Write tags.js
    tags_js_content = (
        "/** Auto-generated from _posts/*.md by sync_posts.py */\n"
        "(function (root, factory) {\n"
        "  var data = factory();\n"
        "  if (typeof module === 'object' && module.exports) { module.exports = data; }\n"
        "  if (typeof root !== 'undefined') { root.DYNAMIC_TAGS = data; }\n"
        "  if (typeof window !== 'undefined') { window.DYNAMIC_TAGS = data; }\n"
        "  if (typeof global !== 'undefined') { global.DYNAMIC_TAGS = data; }\n"
        "})(typeof self !== 'undefined' ? self : this, function () {\n"
        f"  return {json.dumps(tags_list, indent=2, ensure_ascii=False)};\n"
        "});\n"
    )
    with open(OUTPUT_TAGS_JS, "w", encoding="utf-8") as f:
        f.write(tags_js_content)

    if ROOT_DIR != BASE_DIR:
        shutil.copy2(OUTPUT_TAGS_JSON, ROOT_DIR / "tags.json")
        shutil.copy2(OUTPUT_TAGS_JS, ROOT_DIR / "tags.js")
