# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML5, Vanilla CSS3 (Custom Properties & Modular Component Architecture), Vanilla JavaScript ES6+, Python 3 build engine (`sync_posts.py`), and GitHub Pages for static zero-CORS publishing.

## Users

Academics, researchers, designers, artists, psychologists, philosophers, nerds, and anyone interested in AI, philosophy, psychology, visual design, and systems thinking.

## Product Purpose

A digital notebook and editorial publication to think through contemporary culture via deep-dive essays, field notes, curated bookmarks, and practical toolkits.

## Positioning

"Overthinking Undervalued Means" — Post-ironic digital surrealism investigating the psychophysics of vision, latent space aesthetics, biopolitics of vector embeddings, and the epistemology of synthetic representation.

## Operating Context

A personal, open digital workspace published under the moniker `Untitled.jpg` (`JPG`). Visitors explore deep-dive essays, technical notes, curated external reading, and interactive spatial representations.

## Capabilities and Constraints

- **Content Taxonomy**: 4 Core Formats — Essays (`[ESSAY]`), Notes (`[NOTE]`), Bookmarks (`[BOOKMARK]`), Resources (`[RESOURCE]`).
- **Thematic Pillars**: 5 Core Pillars spanning Visual Perception & Psychophysics, AI Perception & Culture, Language & LLMs, Philosophy of the Image, and Critical Theory.
- **Visual Structure**:
  - **48px Vertical Navigation Rail**: Fixed ultra-thin left rail with vertical route labels (`vertical-rl`) and status indicators.
  - **50/50 Split Layout Shell**: Left asymmetric card grid matrix coupled with an edge-anchored sliding 1:1 essay reader pane.
  - **Infinite Scroll & Responsive Grid**: 4-column desktop matrix, reflowing smoothly to 3-column when the reader pane opens, with smooth card scroll anchoring and layout containment (`contain: layout paint`).
- **Performance Commitments**:
  - 60fps drawer slide-in/out transitions with zero paint thrashing (hardware-accelerated pseudo-elements and GPU compositing).
  - Deferred KaTeX math formula parsing and Mermaid diagram rendering to keep the main thread idle during transitions.
  - Zero third-party runtime framework dependencies (no React/Vue/Sass/Tailwind build bloat).
- **Per-Post Predefined Theme Modes**: Each dispatch sets its own visual theme (`theme: dark` in Midnight Slate `#1B2427` or `theme: light` in Off-White `#DEE6E9`) via Markdown frontmatter.
- **Archival Badging**: Raw monospace metadata chips pinned to card corners (`[FORMAT: ESSAY]`, `[MODE: DARK]`, `[PILLAR: VISUAL PERCEPTION]`).

## Brand Commitments

- **Brand Moniker**: `Untitled.jpg` (`.jpg` / `JPG`).
- **Palette**: Midnight Slate (`#121212` / `#161616`), Pure Off-White (`#F5F5F5` / `#DEE6E9`), Signature Coral Crimson Red (`#E84A5F`), Dusky Rose (`#FF8C96`).
- **Typography**: Azeret Mono (Bold/Geometric Monospace for headlines and kickers) + Platypi (High-contrast literary serif for body copy and subheads).
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
4. **Architectural Isolation**: Modular ES6 component interfaces with strict separation of concerns (State Hub, Navigation Router, Grid Matrix, Reading Pane, and Modals).

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
  | └── Sub-topic 2.6: Saccadic suppression and temporal inconsistency
  |
  ├── 3: Language, LLMs & Artificial Intelligence
  | ├── Sub-topic 3.1: LLM architectures and mechanics
  | ├── Sub-topic 3.2: Human vs. machine intelligence and benchmarking
  | ├── Sub-topic 3.3: Language, meaning and symbolic grounding
  | ├── Sub-topic 3.4: Agentic systems and autonomous code reviews
  | ├── Sub-topic 3.5: Conversational voice AI and speech processing
  | └── Sub-topic 3.6: AI safety, alignment and extreme risk evaluation
  |
  ├── 4: Philosophy of the Image, Tech & Visual Culture
  | ├── Sub-topic 4.1: Modes of seeing and visual semiotics
  | ├── Sub-topic 4.2: Photography, truth and operational images
  | ├── Sub-topic 4.3: Epistemology of representation and model collapse
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

## 2. Content Types / Post Formats:
├── **Essays**: ~1500-3000 words. Deep-dive investigations of a single topic within one of the pillars.
├── **Notes**: ~300-1000 words. Shorter, more informal reflections, observations, or provocations.
├── **Bookmarks**: Aggregated links to external content (articles, videos, tools) with author reflections.
└── **Resources**: Curated collections of tools, datasets, papers, or other materials organized by topic.

## 3. Metadata Structure:
├── **format**: `ESSAY`, `NOTE`, `BOOKMARK`, `RESOURCE`
├── **pillar**: Name of primary intellectual pillar
├── **pillar_id**: Kebab-case slug identifier (e.g., `visual-perception`)
├── **subtopic**: Specific domain subtopic
├── **subtopic_id**: Kebab-case subtopic identifier
├── **theme**: `dark` or `light`
├── **status**: `published` (default), `draft`, `archived`
├── **date**: `YYYY.MM.DD`
├── **read_time**: Reading time string (e.g., `4 MIN READ`)
├── **image**: Primary feature visual or fallback generator key
├── **aspect_ratio**: Card layout ratio (`v-ratio-1`, `h-tall-1`, etc.)
└── **links**: Array of structured citation links (title, url, description)

## 4. Content Surfaces
├── **Main Index (`/index.html`)**: Asymmetrical 50/50 split layout shell with instant debounced search, format and pillar filters, 4-to-3 column grid reflow, infinite scroll, and sliding reader pane.
├── **About Dossier (`/about.html`)**: Refined editorial dossier, background milestones accordion, and author contact coordinates.
├── **Database Archive (`/archive.html`)**: Reverse-chronological, searchable, filterable database of all dispatches with detailed metadata chips.
├── **Cover Vault Gallery (`/gallery.html`)**: Interactive 3D cover gallery powered by Three.js exploring typographic poster art and visual artifacts.
└── **3D Taxonomy Network (`/network.html`)**: Interactive WebGL force-directed 3D network visualizing 140+ taxonomy nodes, clusters, and cross-dispatch connections.
