# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: HTML5, Vanilla CSS, JavaScript, and Jekyll / GitHub Pages for static publishing.

## Users

Academics, researchers, designers, artists, psychologists, philosophers, nerds, and anyone interested in AI, philosophy, psychology, visual design, and systems thinking.

## Product Purpose

A digital notebook and editorial blog to think through contemporary culture via essays, field notes, curated bookmarks, and practical resources.

## Positioning

"Overthinking Undervalued Means" — Post-ironic digital surrealism investigating the psychophysics of vision, latent space aesthetics, biopolitics of vector embeddings, and the epistemology of synthetic representation.

## Operating Context

A personal, open digital workspace published under the moniker `Untitled.jpg` (`JPG`). Visitors explore deep-dive essays, technical notes, curated external reading, and design/code toolkits.

## Capabilities and Constraints

- **Content Taxonomy**: 4 Core Formats — Essays (`/essays`), Notes (`/notes`), Bookmarks (`/bookmarks`), Resources (`/resources`).
- **Topics (Metadata Tags)**: AI Perception, Culture & Representation; Visual Perception & Psychology of Seeing; Language, LLMs & Artificial Intelligence; Philosophy of the Image, Tech & Visual Culture; Philosophy and Critical Theory.
- **Visual Structure**: Fixed left sidebar navigation rail with newsletter subscribe CTA button; asymmetrical 2-column grid (65% Essays/Notes, 35% Bookmarks/Resources).
- **Per-Post Predefined Theme Modes**: Each dispatch sets its own visual theme (`theme: dark` in Midnight Slate `#1B2427` or `theme: light` in Off-White `#DEE6E9`) via Markdown frontmatter.
- **Archival Badging**: Raw metadata chips pinned to card corners (`[FORMAT: ESSAY]`, `[MODE: DARK]`, `[TOPIC: AI PERCEPTION]`).

## Brand Commitments

- **Brand Moniker**: `Untitled.jpg` (`.jpg` / `JPG`).
- **Palette**: Midnight Slate (`#1B2427`), Pure Off-White (`#DEE6E9` / `#D9D9D9`), Coral Crimson Red (`#E84A5F`), Dusky Rose (`#FF8484` / `#FFC4D5`).
- **Typography**: Azeret Mono (Bold/Geometric Monospace for headlines and kickers) + Platypi / Berlingske Serif (High-contrast serif for body and subheads).
- **Footer Sign-off**: `UNTITLED.JPG // BUILT IN ZEROES AND ONES WITH THE BLOOD AND SWEAT OF JUAN P. GIUSEPPONI // 2026`.

## Evidence on Hand

- **Existing Content**: [`Content/Foucault-Vectors.pdf`](file:///E:/GIT%20PAGE/Content/Foucault-Vectors.pdf), [`Content/TuringQueerAI.pdf`](file:///E:/GIT%20PAGE/Content/TuringQueerAI.pdf), [`Content/P3-ST2-LeCunWorldModels.pdf`](file:///E:/GIT%20PAGE/Content/P3-ST2-LeCunWorldModels.pdf), [`Content/FovealvsPeripheral.pdf`](file:///E:/GIT%20PAGE/Content/FovealvsPeripheral.pdf), [`Content/LinkedIn.md`](file:///E:/GIT%20PAGE/Content/LinkedIn.md).
- **Brand Blueprint**: [`brand-statement.md`](file:///E:/GIT%20PAGE/brand-statement.md).
- **Layout Specification**: [`homepage_layout_and_copy_proposal.md`](file:///E:/GIT%20PAGE/homepage_layout_and_copy_proposal.md).
- **Design References**: Visual assets in [`Resources/Design Refs`](file:///E:/GIT%20PAGE/Resources/Design%20Refs).

## Product Principles

1. **Out-of-Distribution Craft**: Reject templated AI design tells; ground every element in technical philosophy and post-ironic digital surrealism.
2. **Author-Controlled Atmosphere**: Respect the predefined visual mode (`dark` / `light`) of each piece to match its intellectual mood.
3. **High Density & Legibility**: Balance rich editorial serif prose with crisp monospace archival metadata.

---

# Content Architecture

## 1. Content Pillars:

- The five main conceptual pillars under which content falls into:
  ├── 1: AI Perception, Culture & Representation
  | ├── Sub-topic 1.1: Synthetic and statistical images ("the mean image")
  | ├── Sub-topic 1.2: Latent spaces and AI archives
  | ├── Sub-topic 1.3: Generative technologies and prompt engineering
  | ├── Sub-topic 1.4: Computer vision vs. human perception
  | ├── Sub-topic 1.5: The political economy of synthetic media and digital labor
  | ├── Sub-topic 1.6: Societal and algorithmic biases
  | └── Sub-topic 1.7: Synthetic Identity & Normative Machines
  |
  ├── 2: Visual Perception & Psychology of Seeing
  | ├── Sub-topic 2.1: Anatomy and psychophysics of vision
  | ├── Sub-topic 2.2: Visual illusions and optical paradoxes
  | ├── Sub-topic 2.3: Cognitive and Visual Biases
  | ├── Sub-topic 2.4: Perceptual mechanics and Gestalt
  | ├── Sub-topic 2.5: Multi-sensory integration and cross-modal perception
  | └── Sub-topic 2.6: Attention and trained perception
  |
  ├── 3: Language, LLMs & Artificial Intelligence
  | ├── Sub-topic 3.1: LLM architectures and mechanics
  | ├── Sub-topic 3.2: Human vs. machine intelligence and benchmarking
  | ├── Sub-topic 3.3: Language, meaning and symbolic grounding
  | ├── Sub-topic 3.4: Agentic systems and human agency
  | ├── Sub-topic 3.5: Conversational voice AI and speech processing
  | └── Sub-topic 3.6: AI safety, alignment and extreme risk evaluation
  |
  ├── 4: Philosophy of the Image, Tech & Visual Culture
  | ├── Sub-topic 4.1: Modes of seeing and visual semiotics
  | ├── Sub-topic 4.2: Photography, truth and simulation
  | ├── Sub-topic 4.3: Epistemology of representation
  | ├── Sub-topic 4.4: Aesthetics as ideology and interface politics
  | ├── Sub-topic 4.5: Media ecology and psychological projection
  | ├── Sub-topic 4.6: The archival impulse and digital memory systems
  | └── Sub-topic 4.7: Interface politics & product psychology
  |
  └── 5: Philosophy and Critical Theory
    ├── Sub-topic 5.1: Epistemic Paradigms & Foucault
    ├── Sub-topic 5.2: Critical Theory of Technology
    ├── Sub-topic 5.3: Biopolitics & Pharmacopornography
    └── Sub-topic 5.4: Somatopolitics & Latent Space

##2. Content Types / Post Formats:
├── **Essays**: ~1500-3000 words. Deep-dive investigations of a single topic within one of the four pillars.
├── **Notes**: ~300-1000 words. Shorter, more informal reflections, observations, or provocations.
├── **Bookmarks**: Aggregated links to external content (articles, videos, tools) with a short personal reflection.
└── **Resources**: Curated collections of tools, datasets, papers, or other materials organized by topic.

##3. Metadata Structure:
├── **Type**: `essay`, `note`, `bookmark`, `resource`
├── **Topic**: `vision-perception`, `ai-ml`, `language`, `philosophy`, `psychology`, `design`, `systems-thinking`, `epistemology`, `cognitive-science` (one or more)
├── **Pillar**:
├── **Status**: `published` (default), `draft`, `archived`
├── **Created**: YYYY-MM-DD
├── **Updated**: YYYY-MM-DD
├── **Keywords**: Array of 5-10 relevant terms
├── **Canonical URL**: https://[URL]/[slug]
├── **Cover Image**: URL or path to featured image (1:1 for photos, landscape for essays)
├── **Reading Time**: Calculated automatically based on word count (750 words/minute standard)
└── **Series**: [String or null] Name of the series the post belongs to (e.g., "Conversations on AI", "Foucault Vectors"). Optional field.

##4. Content Organization Strategy
├── **Landing Page (Homepage)**: Editorial blog with an asymmetrical 2-column grid: 65% main content (essays/notes) on the left, 35% secondary content (bookmarks/resources) on the right. No infinite scroll — content ends at the footer.
├── **Blog Page (`/blog`)**: A reverse-chronological, filtered view of only **Essays** and **Notes**. High-density card layout with cover image, title, metadata grid, and short excerpt.
├── **Topic Pages (`/topics/[slug]`)**: Curated collections of posts filtered by a specific Topic (e.g., `/topics/vision`). Displays all 4 post types.
├── **Format Pages (`/format/[slug]`)**: Collections filtered by content type (e.g., `/format/bookmark`).
├── **Archive (`/archive`)**: Reverse-chronological, searchable, filterable database of all posts with detailed metadata and content summaries.
├── **Resources (`/resources`)**: A catalog of tools, papers, and other resources, filterable by category.
└── **Reading List (`/reading`)**: A dedicated page for **Bookmarked** items with annotations and context.
