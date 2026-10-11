"""
Tags and Taxonomy Graph Indexing Subsystem for UNTITLED.JPG
Compiles foundations, pillars, subtopics, and generic tags with strict deduplication.
"""

import json
import re
import shutil
from .config import OUTPUT_TAGS_JSON, OUTPUT_TAGS_JS, ROOT_DIR, BASE_DIR
from .taxonomy import load_taxonomy_data
from .parser import slugify

def compile_tags_database(posts):
    """
    Builds a comprehensive index of all foundations, pillars, subtopics, and tags across all dispatches.
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
                "foundations": set(),
                "pillars": set(),
                "subtopics": set(),
                "co_occurring": {}
            }
        return tags_map[key]

    canonical_pillars, canonical_foundations = load_taxonomy_data()
    canonical_taxonomy_slugs = set()
    foundations_lookup = {}

    for cf in canonical_foundations:
        f_slug = cf["slug"].lower()
        f_id = cf["id"].lower()
        f_name_lower = cf["name"].lower()
        canonical_taxonomy_slugs.add(f_id)
        canonical_taxonomy_slugs.add(f_slug)
        canonical_taxonomy_slugs.add(f_name_lower)
        canonical_taxonomy_slugs.add(slugify(cf["name"]).lower())
        foundations_lookup[f_id] = cf
        foundations_lookup[f_slug] = cf
        foundations_lookup[f_name_lower] = cf

    for cp in canonical_pillars:
        canonical_taxonomy_slugs.add(cp["id"].lower())
        canonical_taxonomy_slugs.add(cp["slug"].lower())
        canonical_taxonomy_slugs.add(slugify(cp["title"]).lower())
        canonical_taxonomy_slugs.add(cp["title"].lower())
        if cp.get("short_title"):
            canonical_taxonomy_slugs.add(slugify(cp["short_title"]).lower())
            canonical_taxonomy_slugs.add(cp["short_title"].lower())
        for csub in cp.get("subtopics", []):
            canonical_taxonomy_slugs.add(csub["id"].lower())
            canonical_taxonomy_slugs.add(csub["slug"].lower())
            canonical_taxonomy_slugs.add(slugify(csub["title"]).lower())
            canonical_taxonomy_slugs.add(csub["title"].lower())

    # Pre-populate all 14 canonical foundations so all foundations exist in tags.json
    for cf in canonical_foundations:
        fid = f"foundation-{cf['id']}"
        f_item = get_or_create(fid, cf["name"], "foundation")
        f_item["order"] = cf.get("order", 99)
        f_item["description"] = cf.get("description", "")
        for cp_id in cf.get("pillars", []):
            for cp in canonical_pillars:
                if cp["id"] == cp_id or cp["slug"] == cp_id:
                    f_item["pillars"].add(cp.get("short_title") or cp["title"])

    # Pre-populate all 5 canonical pillars
    for cp in canonical_pillars:
        pid = f"pillar-{cp['id']}"
        p_name = cp.get("short_title") or cp["title"]
        p_item = get_or_create(pid, p_name, "pillar")
        p_num = str(cp.get("number", "99"))
        p_item["order"] = int(p_num) if p_num.isdigit() else 99
        p_item["description"] = cp.get("description", "")
        for f_id in cp.get("foundations", []):
            if f_id in foundations_lookup:
                p_item["foundations"].add(foundations_lookup[f_id]["name"])

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

        pillar = p.get("pillar")
        pillar_id = p.get("pillar_id")
        subtopic = p.get("subtopic")
        subtopic_id = p.get("subtopic_id")
        post_foundations = p.get("foundations") or []

        # 1. Process Foundations (Tier 1 - Highest Order)
        for f_ref in post_foundations:
            f_obj = foundations_lookup.get(str(f_ref).lower())
            if f_obj:
                fid = f"foundation-{f_obj['id']}"
                f_item = get_or_create(fid, f_obj["name"], "foundation")
                f_item["count"] += 1
                f_item["posts"].append(post_summary)
                f_item["links"].append(link_entry)
                if pillar:
                    f_item["pillars"].add(pillar)
                if subtopic:
                    f_item["subtopics"].add(subtopic)

        # 2. Process Pillar (Tier 2)
        if pillar:
            pil_id = f"pillar-{pillar_id}" if pillar_id else f"pillar-{slugify(pillar)}"
            pil_item = get_or_create(pil_id, pillar, "pillar")
            pil_item["count"] += 1
            pil_item["posts"].append(post_summary)
            pil_item["links"].append(link_entry)
            for f_ref in post_foundations:
                f_obj = foundations_lookup.get(str(f_ref).lower())
                if f_obj:
                    pil_item["foundations"].add(f_obj["name"])

        # 3. Process Subtopic (Tier 3)
        if subtopic:
            sub_id = f"subtopic-{subtopic_id}" if subtopic_id else f"subtopic-{slugify(subtopic)}"
            sub_item = get_or_create(sub_id, subtopic, "subtopic")
            sub_item["count"] += 1
            sub_item["posts"].append(post_summary)
            sub_item["links"].append(link_entry)
            if pillar:
                sub_item["pillars"].add(pillar)
            for f_ref in post_foundations:
                f_obj = foundations_lookup.get(str(f_ref).lower())
                if f_obj:
                    sub_item["foundations"].add(f_obj["name"])

        # 4. Process Tags (Tier 4 - Generic Tags, strictly deduplicated against taxonomy)
        post_tags = p.get("tags") or []
        if isinstance(post_tags, str):
            post_tags = [t.strip() for t in post_tags.split(",") if t.strip()]

        for tag in post_tags:
            tag_clean = str(tag).strip().lower().lstrip("#")
            if not tag_clean:
                continue
            tag_slug = slugify(tag_clean)
            if tag_slug in canonical_taxonomy_slugs or tag_clean in canonical_taxonomy_slugs:
                continue
            tag_item = get_or_create(tag_slug, tag_clean, "tag")
            tag_item["count"] += 1
            tag_item["posts"].append(post_summary)
            tag_item["links"].append(link_entry)
            if pillar:
                tag_item["pillars"].add(pillar)
            if subtopic:
                tag_item["subtopics"].add(subtopic)
            for f_ref in post_foundations:
                f_obj = foundations_lookup.get(str(f_ref).lower())
                if f_obj:
                    tag_item["foundations"].add(f_obj["name"])

            # Track co-occurrences with other tags in same post
            for other_tag in post_tags:
                other_clean = str(other_tag).strip().lower().lstrip("#")
                other_slug = slugify(other_clean)
                if other_clean and other_clean != tag_clean and other_slug not in canonical_taxonomy_slugs and other_clean not in canonical_taxonomy_slugs:
                    tag_item["co_occurring"][other_clean] = tag_item["co_occurring"].get(other_clean, 0) + 1

    TYPE_WEIGHT = {
        "foundation": 0,
        "pillar": 1,
        "subtopic": 2,
        "tag": 3
    }

    # Format final list sorted by tier hierarchy, then count, then order/name
    tags_list = []
    for item in tags_map.values():
        item["foundations"] = sorted(list(item["foundations"]))
        item["pillars"] = sorted(list(item["pillars"]))
        item["subtopics"] = sorted(list(item["subtopics"]))
        co_sorted = sorted(item["co_occurring"].items(), key=lambda x: x[1], reverse=True)
        item["connected_tags"] = [k for k, _ in co_sorted[:6]]
        del item["co_occurring"]
        tags_list.append(item)

    tags_list.sort(key=lambda x: (
        TYPE_WEIGHT.get(x["type"], 99),
        x.get("order", 99) if x["type"] in ("foundation", "pillar") else 0,
        -x["count"],
        x["name"]
    ))

    # Write tags.json
    with open(OUTPUT_TAGS_JSON, "w", encoding="utf-8") as f:
        json.dump(tags_list, f, indent=2, ensure_ascii=False)

    # Write tags.js (for zero-CORS direct file:/// and browser/Node execution)
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

    print(f"  [OK] Generated {len(tags_list)} taxonomy entries in {OUTPUT_TAGS_JSON.name} & {OUTPUT_TAGS_JS.name}")
