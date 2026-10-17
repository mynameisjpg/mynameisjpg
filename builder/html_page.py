"""
Standalone HTML Post Page & Schema.org JSON-LD Generation Subsystem for UNTITLED.JPG
"""

import re
import json
import sys
from pathlib import Path

if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    __package__ = "builder"

from .config import CANONICAL_ENTITIES, POSTS_HTML_DIR, OUTPUT_JSON
from .images import get_image_dimensions
from .parser import slugify

def resolve_post_entities(post):
    """
    Extracts structured 'about' and 'mentions' entities for Schema.org JSON-LD
    to enable precise AI answer engine (Perplexity, ChatGPT, Claude) entity resolution.
    Supports explicit frontmatter override or automatic extraction from tags/title/slug.
    """
    custom_entities = post.get("entities")
    if isinstance(custom_entities, dict):
        about = custom_entities.get("about", [])
        mentions = custom_entities.get("mentions", [])
        return about, mentions

    raw_tags = post.get("tags") or []
    slug = (post.get("slug") or "").lower()
    title = (post.get("title") or "").lower()

    tag_keys = set()
    for t in raw_tags:
        k = str(t).strip().lower().lstrip("#")
        tag_keys.add(k)
        tag_keys.add(slugify(k))

    matched_entities = []
    seen_urls = set()

    for k, entity in CANONICAL_ENTITIES.items():
        if entity["sameAs"] in seen_urls:
            continue
        if k in tag_keys or k in slug or f" {k} " in f" {title} " or f"({k})" in title or f"[{k}]" in title:
            matched_entities.append(entity)
            seen_urls.add(entity["sameAs"])

    if not matched_entities:
        pillar = post.get("pillar")
        about = [{"@type": "Thing", "name": pillar or "Artificial Intelligence"}]
        mentions = []
        return about, mentions

    about = matched_entities[:2]
    mentions = matched_entities[2:8]
    return about, mentions

AUTHOR_SCHEMA = {
    "@type": "Person",
    "name": "Juan Pablo Giusepponi",
    "jobTitle": "Sr. Designer, Head of Communication & Frontier AI Specialist",
    "url": "https://mynameisjpg.github.io/mynameisjpg/about.html",
    "image": "https://mynameisjpg.github.io/mynameisjpg/assets/images/self-jpg1.jpg",
    "sameAs": [
        "https://github.com/mynameisjpg",
        "https://mynameisjpg.github.io/mynameisjpg/",
    ],
    "knowsAbout": [
        "Artificial Intelligence",
        "Visual Semiotics",
        "Cognitive Psychophysics",
        "Latent Space Topologies",
        "Machine Learning",
        "Joint Embedding Predictive Architecture",
        "Design Systems",
        "Epistemology",
    ],
}

def resolve_meta_description(excerpt, subtitle):
    """Selects an optimal social description >= 100 chars and <= 300 chars."""
    combined = f"{subtitle} {excerpt}" if subtitle and excerpt and subtitle != excerpt else ""
    for candidate in [excerpt, subtitle, combined]:
        if candidate and len(candidate) >= 100:
            desc = candidate
            break
    else:
        desc = (
            excerpt
            or subtitle
            or "Untitled.jpg — Dispatches on AI perception, cognitive psychophysics, high-dimensional latent space, and media archaeology."
        )

    if len(desc) > 300:
        desc = desc[:297].rsplit(" ", 1)[0] + "..."
    return desc.replace('"', "&quot;").replace("\n", " ").strip()

def generate_post_html_files(posts):
    """
    Generates standalone post HTML pages under /posts/[slug].html.
    Each page contains exact Open Graph & Twitter Card metadata for LinkedIn, X, FB,
    and boots the full split-layout application with the current post active.
    """
    POSTS_HTML_DIR.mkdir(parents=True, exist_ok=True)
    SITE_ORIGIN = "https://mynameisjpg.github.io/mynameisjpg"
    DEFAULT_OG_IMAGE = f"{SITE_ORIGIN}/assets/images/favicon.svg"

    valid_html_filenames = set()

    for post in posts:
        raw_slug = post.get("slug") or post.get("id") or post.get("sys_id")
        if not raw_slug:
            continue

        # Strip date prefix (e.g., "2026-09-24-lecun-..." -> "lecun-...")
        clean_slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", raw_slug)
        valid_html_filenames.add(f"{clean_slug}.html")
        title = (post.get("title") or "Untitled Dispatch").replace('"', "&quot;")
        
        description = resolve_meta_description(
            (post.get("excerpt") or "").strip(),
            (post.get("subtitle") or "").strip(),
        )

        post_url = f"{SITE_ORIGIN}/posts/{clean_slug}.html"
        
        # ISO 8601 publish date (YYYY-MM-DD)
        raw_post_date = str(post.get("date", ""))
        iso_date_match = re.search(r"(\d{4})[-.](\d{2})[-.](\d{2})", raw_post_date)
        iso_published_time = (
            f"{iso_date_match.group(1)}-{iso_date_match.group(2)}-{iso_date_match.group(3)}"
            if iso_date_match
            else raw_post_date
        )

        # Resolve absolute image URL and real dimensions
        raw_image = post.get("image") or ""
        if raw_image.startswith(("http://", "https://")):
            og_image = raw_image
        elif raw_image:
            clean_img = raw_image.lstrip("./").lstrip("/")
            og_image = f"{SITE_ORIGIN}/{clean_img}"
        else:
            og_image = DEFAULT_OG_IMAGE

        img_w, img_h = get_image_dimensions(raw_image)

        raw_alt = post.get("image_alt") or post.get("subtitle") or title
        image_alt = raw_alt.replace('"', "&quot;").replace("\n", " ").strip()


        schema_dict = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            "datePublished": iso_published_time,
            "dateModified": iso_published_time,
            "inLanguage": "en-US",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": post_url
            },
            "author": AUTHOR_SCHEMA,
            "publisher": {
                "@type": "Organization",
                "name": "Untitled.jpg",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://mynameisjpg.github.io/mynameisjpg/assets/images/favicon.svg"
                }
            },
            "image": og_image
        }

        if post.get("pillar"):
            schema_dict["articleSection"] = post.get("pillar")

        raw_tags = post.get("tags") or []
        clean_tags = [str(t).strip().lstrip("#") for t in raw_tags if str(t).strip()]
        if clean_tags:
            schema_dict["keywords"] = clean_tags

        about_ents, mention_ents = resolve_post_entities(post)
        if about_ents:
            schema_dict["about"] = about_ents
        if mention_ents:
            schema_dict["mentions"] = mention_ents

        schema_json_ld = json.dumps(schema_dict, indent=2, ensure_ascii=False)

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


  <!-- Schema.org JSON-LD (BlogPosting / Article with GEO & EEAT Grounding) -->
  <script type="application/ld+json">
{schema_json_ld}
  </script>

  <base href="../">

  <!-- Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Azeret+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&family=Platypi:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  
  <!-- Math Rendering (KaTeX), Markdown (Marked.js), & Diagrams (Mermaid.js) -->
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"></noscript>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <!-- Design System Stylesheets -->
  <link rel="stylesheet" href="index.css?v=7">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
  <link rel="shortcut icon" type="image/svg+xml" href="assets/images/favicon.svg">
  <link rel="apple-touch-icon" href="assets/images/favicon.svg">
  
  <!-- Autonomous Web Components (Deferred) -->
  <script defer src="js/components/sidebar-rail.js"></script>
</head>
<body>

  <!-- Sidebar Rail Component -->
  <sidebar-rail active-page="home" has-search></sidebar-rail>


  <div id="top-search-dropdown" class="top-dropdown-panel search-dropdown-panel" style="display:none;">
    <input type="text" id="top-search-input" name="search" placeholder="SEARCH DISPATCHES..." aria-label="Search dispatches" autocomplete="off" spellcheck="false" />
  </div>

  <!-- Split 50-50 Layout -->
  <main class="split-layout reader-open" data-component="split-shell">
    <section class="grid-column" data-component="dispatch-matrix" aria-label="Dispatch Grid Matrix">
      <div class="matrix-header-group">
        <div class="header-col-left">
          <span class="header-legend">SYS_LOG // ASYMMETRIC_DISPATCH_MATRIX</span>
          <div class="controls-row-left" role="toolbar" aria-label="Dispatch format filters">
            <button type="button" class="matrix-filter-btn filter-btn-essay" data-filter="essay" title="Filter by Essays">
              <svg viewBox="0 0 24 24" class="filter-btn-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>ESSAYS</span>
            </button>
            <button type="button" class="matrix-filter-btn filter-btn-note" data-filter="note" title="Filter by Notes">
              <svg viewBox="0 0 24 24" class="filter-btn-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>NOTES</span>
            </button>
            <button type="button" class="matrix-filter-btn filter-btn-resource" data-filter="resource" title="Filter by Resources">
              <svg viewBox="0 0 24 24" class="filter-btn-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>RESOURCES</span>
            </button>
            <button type="button" class="matrix-filter-btn filter-btn-bookmark" data-filter="bookmark" title="Filter by Bookmarks">
              <svg viewBox="0 0 24 24" class="filter-btn-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span>BOOKMARKS</span>
            </button>
            <button type="button" class="matrix-filter-btn filter-btn-all active" data-filter="all" title="View all dispatches">
              <span>VIEW ALL</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card-grid-matrix" id="card-matrix"></div>
    </section>

    <!-- Reading Pane -->
    <article class="post-column essay-column" id="essay-reading-pane" data-component="reader-pane" aria-label="Post Reader View">
      <button type="button" class="btn-return-grid" aria-label="Return to Grid Feed">
        <span class="return-arrow">&lt;&lt;</span>
        <span class="return-text">RETURN TO GRID FEED</span>
      </button>
    </article>
  </main>

  <div class="floating-nav-buttons" data-component="floating-controls">
    <button type="button" class="btn-nav-action" id="btn-scroll-top" title="Scroll Reader to Top" aria-label="Scroll Reader to Top">
      <svg viewBox="0 0 24 24" class="nav-arrow-svg" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
    </button>
    <button type="button" class="btn-nav-action" id="btn-scroll-bottom" title="Scroll Reader to Bottom" aria-label="Scroll Reader to Bottom">
      <svg viewBox="0 0 24 24" class="nav-arrow-svg" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
    </button>
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
          <button type="button" class="btn-modal-cancel">CANCEL</button>
          <button type="submit" class="btn-modal-submit">TRANSMIT SUBSCRIPTION</button>
        </div>
      </form>
    </div>
  </dialog>

  <!-- Specify active post slug for deep-load -->
  <script>
    window.INITIAL_POST_SLUG = "{clean_slug}";
  </script>
  <script defer src="pillars.js"></script>
  <script defer src="posts.js"></script>
  <script defer src="js/components/subscribe-modal.js"></script>
  <script defer src="js/components/card-matrix.js"></script>
  <script defer src="js/components/post-engagement.js"></script>
  <script defer src="js/components/reader-pane.js"></script>
  <script defer src="js/components/navigation-controls.js"></script>
  <script defer src="app.js"></script>
</body>
</html>
"""
        target_file = POSTS_HTML_DIR / f"{clean_slug}.html"
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(post_html_content)

    # Clean up stale/orphaned post HTML files that no longer correspond to an active markdown post
    stale_files = [f for f in POSTS_HTML_DIR.glob("*.html") if f.name not in valid_html_filenames]
    for stale_file in stale_files:
        try:
            stale_file.unlink()
            print(f"  [CLEANUP] Deleted stale post HTML: {stale_file.name}")
        except Exception as e:
            print(f"  [WARNING] Could not delete {stale_file.name}: {e}")

    if stale_files:
        print(f"  [OK] Cleaned up {len(stale_files)} stale HTML file(s) in {POSTS_HTML_DIR.name}/")

    print(f"  [OK] Generated {len(posts)} post HTML files in {POSTS_HTML_DIR.name}/")

if __name__ == "__main__":
    if OUTPUT_JSON.exists():
        with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
            posts = json.load(f)
        generate_post_html_files(posts)
    else:
        print(f"  [ERROR] {OUTPUT_JSON} not found. Run sync_posts.py first.")
