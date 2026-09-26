---
# ==============================================================================
# UNTITLED.JPG — MASTER POST FRONT-MATTER TEMPLATE
# ==============================================================================
# This template defines the YAML front-matter schema for dispatches.
# The layout, headers, metadata chips, resource cards, and share buttons
# are 100% AUTOMATICALLY populated by the design system engine.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. CORE IDENTIFICATION & PUBLISHING
# ------------------------------------------------------------------------------
title: "Title of Dispatch"
subtitle: "Subtitle expanding on the core conceptual thesis."
excerpt: "A concise 2-sentence summary for search feeds and social cards."

date: 2026-09-26 12:00:00 -0300 # Format: YYYY-MM-DD HH:MM:SS +/-TTTT
last_modified_at: 2026-09-26 12:00:00 -0300

author: "Juan P. Giusepponi"
#posted_by: "JPG" # Optional moniker signature
status: "published" # "draft" | "published"

# ------------------------------------------------------------------------------
# 2. FORMAT & TAXONOMY (Renders Chips Above Title)
# ------------------------------------------------------------------------------
# Choose one of the 4 core formats:
# - "essay"    : Foundational inquiries & philosophical critiques
# - "note"     : Field observations, working hypotheses & ideas
# - "bookmark" : Curated external reads with editorial commentary
# - "resource" : Practical toolkits, datasets, code repos & cheat sheets
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
  - "machine-vision"
  - "epistemology"

# ------------------------------------------------------------------------------
# 3. ATMOSPHERE & CARD DISPLAY SETTINGS
# ------------------------------------------------------------------------------
# Theme mode (author-defined per post):
# - "dark"  : Midnight Slate (#121212 background, off-white text)
# - "light" : Pure Off-White (#DEE6E9 background, dark charcoal text)
theme: "dark"

featured: false # true: Spans 2 columns on the homepage matrix grid with widescreen card!
toc: true
math: true

# ------------------------------------------------------------------------------
# 4. ARCHIVAL & SPEC BADGES
# ------------------------------------------------------------------------------
sys_id: "SYS_260926_DISPATCH"
vector_dim: 0001
reading_time: "8 min read"

# ------------------------------------------------------------------------------
# 5. REFERENCED DESTINATIONS & RESOURCES (Auto-populates in Footer Section)
# ------------------------------------------------------------------------------
links:
  - title: "Source Paper / Documentation Title"
    url: "https://example.com"
    type: "paper" # "paper" | "archive" | "repo" | "tool" | "article" | "video"
    description: "Short contextual note describing this external resource."

# Source attribution (Optional, renders below title):
#via: "Source Name"

# ------------------------------------------------------------------------------
# 6. CONNECTED DISPATCHES & BACKLINKS (Auto-populates in Footer Section)
# ------------------------------------------------------------------------------
backlinks:
  - slug: "#2026-09-25-turing-queer-ai"
    title: "AI is Queer: Turing and the Violence of the Statistical Mean"
    note: "Examines how statistical optimization drives automated conformity."

# ------------------------------------------------------------------------------
# 7. SHARING PERMISSIONS
# ------------------------------------------------------------------------------
shareable: true # true: Auto-populates copy, social, and embed buttons; false: hides share bar
allow_embed: true # true: Includes the [EMBED] card button; false: hides embed button

# ------------------------------------------------------------------------------
# 8. CARD ARTWORK
# ------------------------------------------------------------------------------
image:
  path: "assets/images/turing1.png"
  alt: "Dithered duotone artwork description"
---

## 01. First Section Heading

Write standard Markdown body prose here.

You can use **bold text**, *italics*, inline `code`, and [hyperlinks](https://example.com).

> "Blockquotes for key citations or statements."

## 02. Second Section Heading

More paragraphs...
