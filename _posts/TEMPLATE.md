---
# ==============================================================================
# UNTITLED.JPG — COMPLETE POST FRONT-MATTER TEMPLATE
# ==============================================================================
# This template contains every supported front-matter field for the site.
# Omitted/blank fields will gracefully fall back to default computed values.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. CORE IDENTIFICATION & PUBLISHING
# ------------------------------------------------------------------------------
title: "title"
subtitle: "subtitle"
excerpt: "excerpt"

date: 2026-09-26 14:30:00 -0300 # Format: YYYY-MM-DD HH:MM:SS +/-TTTT
last_modified_at: 2026-09-26 18:00:00 -0300 # Updated timestamp for living notes / digital garden

author: "Juan P. Giusepponi" # Formal author name
posted_by: "JPG" # Optional moniker signature: "JPG" | "Untitled.jpg" | guest
status: "published" # "draft" | "in-progress" | "evergreen" | "published"

# ------------------------------------------------------------------------------
# 2. FORMAT & TAXONOMY (Renders in Chips Above Title)
# ------------------------------------------------------------------------------
# Choose one of the 4 core site formats:
# - "essay"    : Long-form foundational inquiries & philosophical analyses
# - "note"     : Field observations, working hypotheses & digital garden notes
# - "bookmark" : Curated external reads with contextual editorial commentary
# - "resource" : Practical guides, toolkits, datasets, code repos & cheat sheets
format: "essay"

topic:
  # Pillars:
  # - "AI Perception, Culture & Representation"
  # - "Visual Perception & Psychology of Seeing"
  # - "Language, LLMs & Artificial Intelligence"
  # - "Philosophy of the Image, Tech & Visual Culture"
  pillar: "AI Perception, Culture & Representation"
  subtopic: "Latent Spaces & Vector Embeddings"

tags:
  - "vector-space"
  - "biopolitics"
  - "foucault"
  - "machine-vision"
  - "latent-representation"

# ------------------------------------------------------------------------------
# 3. ATMOSPHERE & DISPLAY SETTINGS
# ------------------------------------------------------------------------------
# Theme mode (author-defined per post):
# - "dark"  : Midnight Slate (#1B2427 background, Pure Off-White text)
# - "light" : Pure Off-White (#DEE6E9 background, Midnight Slate text)
theme: "dark"

featured: true # true: Highlights post on homepage hero / top of 65/35 grid
toc: true # true: Automatically renders Table of Contents in sidebar
math: true # true: Enables KaTeX / MathJax for formulas and vector math

# ------------------------------------------------------------------------------
# 4. ARCHIVAL & SPEC BADGES (Auto-filled if left blank or omitted)
# ------------------------------------------------------------------------------
sys_id: "sysid" # Unique terminal ID (Auto-generated from date + slug if omitted)
vector_dim: # Latent dimension badge (Auto-filled from topic/content seed if omitted)
reading_time: "12 min read" # Read duration badge (Auto-calculated from word count if omitted)

# ------------------------------------------------------------------------------
# 5. MULTIPLE EXTERNAL DESTINATIONS & RESOURCES (Renders in Footer Section)
# ------------------------------------------------------------------------------
# Add as many links as needed. Supports papers, repositories, toolkits, articles, etc.
links:
  - title: "ArXiv Preprint: Latent Manifolds as Power Topologies"
    url: "https://arxiv.org/abs/2301.00000"
    type: "paper" # "paper" | "repo" | "article" | "tool" | "video" | "dataset"
    description: "Original mathematical formalization of high-dimensional manifold projection."
  - title: "Official PyTorch Implementation & Weights"
    url: "https://github.com/mynameisjpg/vector-biopolitics"
    type: "repo"
    description: "Codebase for reproducing cosine distance distribution benchmarks."
  - title: "Stanford Seminar: Geometry of Embeddings"
    url: "https://youtube.com/watch?v=example"
    type: "video"
    description: "Guest lecture contextualizing modern neural vector registries."

# Source attribution / discovery trail (Renders below title if present):
via: "Fei-Fei Li / Stanford AI Lab"

# ------------------------------------------------------------------------------
# 6. INTERNAL CITATIONS & BIDIRECTIONAL BACKLINKS (Renders in Footer Section)
# ------------------------------------------------------------------------------
# Connects this post to related dispatches across Untitled.jpg
backlinks:
  - slug: "/notes/lecun-world-models"
    title: "JEPA & LeCun's World Models"
    note: "Discusses non-generative joint embedding predictive architectures."
  - slug: "/resources/foveal-vs-peripheral"
    title: "Foveal vs. Peripheral Vision"
    note: "Psychophysics baseline for human visual compression."

# ------------------------------------------------------------------------------
# 7. SHARING, EMBEDS & SOCIAL SYNDICATION (Renders in Footer Section)
# ------------------------------------------------------------------------------
shareable: true # true: Displays copy link, quote-share & webmention badges
allow_embed: false # true: Permits iframe embedding with standalone reader styles
canonical_url: "" # External canonical link if syndicating to Substack/Medium/LinkedIn

image:
  path: "/assets/images/foucault-latent-cover.png"
  alt: "High-contrast dithered duotone lattice diagram representing high-dimensional latent space"
---

<!-- ======================================================================= -->
<!-- 1. ABOVE THE TITLE: TINY ARCHIVAL CHIPS (Format + Pillar + Subtopic)   -->
<!-- ======================================================================= -->
<header class="post-header-meta-top">
  <div class="meta-chips-group">
    <span class="meta-chip meta-chip-format">[{{ page.format | upcase }}]</span>
    <span class="meta-chip meta-chip-pillar">[{{ page.topic.pillar | upcase }}]</span>
    {% if page.topic.subtopic %}
    <span class="meta-chip meta-chip-subtopic">[{{ page.topic.subtopic | upcase }}]</span>
    {% endif %}
    <span class="meta-chip meta-chip-mode">[{{ page.theme | default: "dark" | upcase }}]</span>
  </div>
</header>

<!-- ======================================================================= -->
<!-- TITLE & SUBTITLE                                                        -->
<!-- ======================================================================= -->
<h1 class="post-title">{{ page.title }}</h1>
{% if page.subtitle %}
<p class="post-subtitle">{{ page.subtitle }}</p>
{% endif %}

<!-- ======================================================================= -->
<!-- 2. BELOW TITLE & SUBTITLE: META BAR (Date, Author, Sys_ID, Reading Time)-->
<!-- ======================================================================= -->
<div class="post-header-meta-bottom">
  <div class="meta-item meta-date">
    <span class="meta-label">DATE:</span>
    <time datetime="{{ page.date | date_to_xmlschema }}">{{ page.date | date: "%Y.%m.%d" }}</time>
  </div>
  <span class="meta-separator">//</span>
  <div class="meta-item meta-author">
    <span class="meta-label">BY:</span>
    <span>{{ page.author | default: "Juan P. Giusepponi" }}</span>
  </div>
  {% if page.posted_by %}
  <span class="meta-separator">//</span>
  <div class="meta-item meta-posted-by">
    <span class="meta-label">DISPATCHED_AS:</span>
    <span>{{ page.posted_by }}</span>
  </div>
  {% endif %}
  <span class="meta-separator">//</span>
  <div class="meta-item meta-sysid">
    <span class="meta-label">SYS_ID:</span>
    <code>{{ page.sys_id | default: "SYS_DISPATCH_AUTO" }}</code>
  </div>
  <span class="meta-separator">//</span>
  <div class="meta-item meta-readtime">
    <span>{{ page.reading_time | default: "12 MIN READ" }}</span>
  </div>
  {% if page.via %}
  <span class="meta-separator">//</span>
  <div class="meta-item meta-via">
    <span class="meta-label">VIA:</span>
    <span>{{ page.via }}</span>
  </div>
  {% endif %}
</div>

<hr class="post-header-divider" />

<!-- ======================================================================= -->
<!-- MAIN EDITORIAL CONTENT (Prose / Math / Callouts)                       -->
<!-- ======================================================================= -->

## 01. The Continuous Panopticon

When identity becomes a normalized coordinate in 1536-dimensional space, surveillance ceases to be an architecture of physical walls and inspection towers. It becomes a continuous metric space where deviance is simply measured as **cosine distance from the centroid**.

> "Discipline is a physics of power, but latent spaces are its continuous geometry."

### High-Dimensional Clustering

In traditional biopolitical frameworks, classification was discrete (normal vs. abnormal, citizen vs. alien). In modern foundation models, categorization is continuous:

$$\text{Sim}(u, v) = \frac{u \cdot v}{\|u\|_2 \|v\|_2}$$

Where $u$ and $v$ represent high-dimensional vector projections of human behavior, language, or gaze patterns.

---

<!-- ======================================================================= -->
<!-- 3. FOOTER SECTION: Links List + Tags + Backlinks + Share Buttons       -->
<!-- ======================================================================= -->
<footer class="post-footer-section">

  <!-- A. EXTERNAL LINKS LIST -->

{% if page.links and page.links.size > 0 %}

  <section class="footer-block footer-links">
    <h3 class="footer-block-title">// REFERENCED_RESOURCES &amp; DESTINATIONS</h3>
    <div class="resources-grid">
      {% for item in page.links %}
      <div class="resource-card">
        <span class="chip">[{{ item.type | default: "LINK" | upcase }}]</span>
        <a href="{{ item.url }}" target="_blank" rel="noopener noreferrer">
          <strong>{{ item.title }}</strong> ↗
        </a>
        {% if item.description %}
        <p>{{ item.description }}</p>
        {% endif %}
      </div>
      {% endfor %}
    </div>
  </section>
  {% endif %}

  <!-- B. BACKLINKS / CONNECTED DISPATCHES -->

{% if page.backlinks and page.backlinks.size > 0 %}

  <section class="footer-block footer-backlinks">
    <h3 class="footer-block-title">// CONNECTED_DISPATCHES (NETWORK)</h3>
    <ul class="backlinks-list">
      {% for link in page.backlinks %}
      <li>
        <a href="{{ link.slug }}"><strong>{{ link.title }}</strong></a>
        {% if link.note %} — <em>{{ link.note }}</em>{% endif %}
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endif %}

  <!-- C. TAXONOMY INDEX / TAGS CLOUD -->

{% if page.tags and page.tags.size > 0 %}

  <section class="footer-block footer-tags">
    <h3 class="footer-block-title">// TAXONOMY_INDEX</h3>
    <div class="tags-group">
      {% for tag in page.tags %}
      <a href="/tags/{{ tag | slugify }}/" class="tag-pill">#{{ tag }}</a>
      {% endfor %}
    </div>
  </section>
  {% endif %}

  <!-- D. SHARE & EMBED ACTIONS -->

{% if page.shareable %}

  <section class="footer-block footer-share">
    <div class="share-actions-bar">
      <span class="share-label">[ SHARE DISPATCH ]:</span>
      <button type="button" class="btn-share" onclick="navigator.clipboard.writeText(window.location.href)">
        [ COPY URL ]
      </button>
      <a href="https://twitter.com/intent/tweet?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="btn-share">
        [ X / TWITTER ↗ ]
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="btn-share">
        [ LINKEDIN ↗ ]
      </a>
      {% if page.allow_embed %}
      <button type="button" class="btn-share" onclick="alert('Embed snippet copied!')">
        [ EMBED SNIPPET ]
      </button>
      {% endif %}
    </div>
  </section>
  {% endif %}

  <!-- E. BRAND MONOSPACE SIGN-OFF -->
  <div class="post-signoff">
    <code>UNTITLED.JPG // BUILT IN ZEROES AND ONES WITH THE BLOOD AND SWEAT OF JUAN P. GIUSEPPONI // 2026</code>
  </div>

</footer>
