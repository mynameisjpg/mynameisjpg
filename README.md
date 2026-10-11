<!-- UNTITLED.JPG — OFFICIAL REPOSITORY README -->
<div align="center">

# UNTITLED.JPG (`.JPG`)

### _“Overthinking Undervalued Means”_

**An editorial digital workspace, computational psychophysics notebook, and publication by Juan P. Giusepponi.**

[![Website](https://img.shields.io/badge/Live_Site-mynameisjpg.github.io-E84A5F?style=for-the-badge&logo=github&logoColor=white)](https://mynameisjpg.github.io/mynameisjpg)
[![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_Vanilla_CSS_%7C_JS_%7C_Python-161616?style=for-the-badge)](https://github.com/mynameisjpg)
[![License](https://img.shields.io/badge/License-MIT-E84A5F?style=for-the-badge)](LICENSE)

---

</div>

## 👁️ Overview

`Untitled.jpg` (`@mynameisjpg`) is an out-of-distribution digital notebook and editorial publication investigating contemporary visual culture, synthetic media, and cognitive mechanics. Grounded in post-ironic digital surrealism, the platform explores the psychophysics of vision, latent space aesthetics, the biopolitics of vector embeddings, and the epistemology of synthetic representation.

Rather than relying on templated blog layouts, `Untitled.jpg` pairs high-density monospace archival metadata with classical literary serif longform reading, wrapped in halftone textures and GPU-accelerated spatial interfaces.

---

## 🏛️ Content Architecture & Pillars

The publication organizes deep-dive investigations, technical reflections, and curated toolkits around **four core intellectual pillars**:

```
UNTITLED.JPG CONTENT PILLARS
├── 01. Visual Perception & Psychology of Seeing
│   ├── Psychophysics of human vision & perceptual mechanics (Gestalt)
│   ├── Foveal vs. peripheral visual bandwidth & sensory limits
│   └── Optical paradoxes, visual illusions, & saccadic blindness
│
├── 02. AI Perception, Culture & Representation
│   ├── Generative media, synthetic imagery & visual culture
│   ├── Machine vision, latent spaces & algorithmic representation
│   └── Political economy, ethics & societal impacts of AI
│
├── 03. Language, LLMs & Artificial Intelligence
│   ├── Large language models, architectures & computational reasoning
│   ├── Machine vs. human cognition, agentic systems & autonomy
│   └── Semantics, symbolic grounding & knowledge systems
│
└── 04. Philosophy of the Image, Tech & Visual Culture
    ├── Modes of seeing, visual semiotics, & photographic truth
    ├── Epistemology of synthetic representation & operational images
    └── Aesthetics as ideology, interface politics, & digital memory
```

### Content Formats

- **`[ESSAY]`** _(~1,500 - 3,000 words)_: Deep-dive investigations exploring complex intersections of technology, perception, and philosophy.
- **`[NOTE]`** _(~300 - 1,000 words)_: Concise observations, field reflections, and rapid theoretical provocations.
- **`[BOOKMARK]`**: Aggregated external references, papers, and media with author annotations.
- **`[RESOURCE]`**: Curated toolkits, open datasets, and technical references.

---

## 🎨 Visual System & Atmosphere

Designed to evoke tactile digital surrealism, `Untitled.jpg` rejects generic SaaS UI design in favor of author-controlled atmospheres:

- **Typography**:
  - `Azeret Mono`: Monospace display headlines, kickers, route labels, and archival badges.
  - `Platypi`: High-contrast literary serif for comfortable longform reading.
- **Color Palette**:
  - **Midnight Slate** (`#121212` / `#161616`): Deep neutral background and surface reader pane.
  - **Coral Crimson Red** (`#E84A5F`): Signature primary interactive accent.
  - **Archival Off-White** (`#F5F5F5` / `#D4D4D4`): Crisp headline contrast and soft body copy.
- **Layout Grid**:
  - **48px Vertical Rail**: Fixed ultra-thin left sidebar containing vertical nav routes (`vertical-rl`).
  - **50/50 Dual Container**: Floating asymmetric card matrix (left) paired with an immersive 1:1 sliding essay reader (right).
- **Author-Defined Theme Modes**: Posts configure their visual mood (`theme: dark` or `theme: light`) via frontmatter metadata.

---

## 🛠️ Stack & Engineering

The site operates as a zero-dependency, ultra-fast static site hydrated by client-side modular components and a Python Markdown compiler:

- **Frontend**: Standard HTML5, Vanilla CSS3 (custom CSS variables & component sheets), and Vanilla JavaScript ES6+.
- **Modular Architecture**:
  - `app.js`: Central State Hub, in-memory dispatch store & lifecycle orchestrator.
  - `js/components/card-matrix.js`: Asymmetric grid renderer, image fallback synthesis & infinite scroll pagination.
  - `js/components/reader-pane.js`: 1:1 drawer slide, typography scaler, card scroll anchoring & deferred KaTeX/Mermaid rendering.
  - `js/components/navigation-controls.js`: Dropdowns, debounced search, URL history synchronization & hotkeys.
  - `js/components/sidebar-rail.js`: Web Component for vertical navigation and brand status.
  - `js/components/subscribe-modal.js`: Native HTML `<dialog>` subscription pipeline.
- **Publishing Engine**: Jekyll-compatible Markdown posts hosted via **GitHub Pages**.
- **Content Compiler (`sync_posts.py`)**: Custom Python build tool that parses `_posts/*.md`, extracts YAML frontmatter, calculates reading metrics, generates `posts.json` / `posts.js`, taxonomy files `tags.json` / `tags.js`, standalone post HTML files, and updates `sitemap.xml`.
- **AI Agent Discovery**: Comprehensive [`llms.txt`](llms.txt) protocol specifying canonical entity definitions, pillar descriptions, and direct citations.

---

## 📁 Repository Structure

```
mynameisjpg/
├── _posts/                     # Raw Markdown dispatches (Essays, Notes, Bookmarks, Resources)
├── assets/                     # Imagery, procedural SVGs, fonts, and media
├── css/
│   ├── base.css                # CSS reset and fundamental variables
│   ├── index.css               # Central stylesheet bundle
│   └── components/             # Modular CSS stylesheets (split-layout, card-matrix, reader-pane, etc.)
├── js/
│   ├── app.js                  # Central application state orchestrator
│   └── components/             # Modular UI components (card-matrix, reader-pane, navigation, etc.)
├── posts/                      # Compiled standalone post HTML pages (generated)
├── sync_posts.py               # Core Python post compiler & metadata generator
├── PRODUCT.md                  # Product specifications & architectural contract
├── DESIGN.md                   # Visual design tokens & UI guidelines
├── llms.txt                    # Frontier AI & LLM web discovery file
├── robots.txt                  # Search engine and AI crawler access rules
├── sitemap.xml                 # XML sitemap index
├── index.html                  # Asymmetrical 2-column main application entry point
├── about.html                  # Curated editorial dossier & author profile
├── archive.html                # Database view for searchable post archives
├── gallery.html                # 3D spatial cover gallery & visual vault
└── network.html                # Interactive 3D WebGL graph view of topics & taxonomy
```

---

## 📜 Colophon & License

Built in zeroes and ones with blood, sweat, and coffee by **Juan P. Giusepponi** (`@mynameisjpg`).

Distributed under the [MIT License](LICENSE).
