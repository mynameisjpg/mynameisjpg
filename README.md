<!-- UNTITLED.JPG — OFFICIAL REPOSITORY README -->
<div align="center">

# UNTITLED.JPG (`.JPG`)

### _“Overthinking Undervalued Means”_

**An editorial digital workspace, computational psychophysics notebook, and publication by Juan P. Giusepponi.**

[![Website](https://img.shields.io/badge/Live_Site-mynameisjpg.github.io-E84A5F?style=for-the-badge&logo=github&logoColor=white)](https://mynameisjpg.github.io)
[![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_Vanilla_CSS_%7C_JS_%7C_Python-161616?style=for-the-badge)](https://github.com/mynameisjpg)
[![License](https://img.shields.io/badge/License-MIT-E84A5F?style=for-the-badge)](LICENSE)

---

</div>

## 👁️ Overview

`Untitled.jpg` (`@mynameisjpg`) is an out-of-distribution digital notebook and editorial publication investigating contemporary visual culture, synthetic media, and cognitive mechanics. Grounded in post-ironic digital surrealism, the platform explores the psychophysics of vision, latent space aesthetics, the biopolitics of vector embeddings, and the epistemology of synthetic representation.

Rather than relying on templated blog layouts, `Untitled.jpg` pairs high-density monospace archival metadata with classical literary serif longform reading, wrapped in halftone and dithered procedural visuals.

---

## 🏛️ Content Architecture & Pillars

The publication organizes deep-dive investigations, technical reflections, and curated toolkits around **four core intellectual pillars**:

```
UNTITLED.JPG CONTENT PILLARS
├── 01. Visual Perception & Psychology of Seeing
│   ├── Psychophysics of human vision & perceptual mechanics (Gestalt)
│   ├── Foveal vs. peripheral visual bandwidth & sensory limits
│   └── Optical paradoxes, visual illusions, & cognitive biases
│
├── 02. AI Perception, Culture & Representation
│   ├── Synthetic & statistical images ("the mean image")
│   ├── Latent space navigation & algorithmic archive dynamics
│   └── Computer vision vs. human perceptual discrepancies
│
├── 03. Language, LLMs & Artificial Intelligence
│   ├── LLM architectures, symbolic grounding, & latent mechanics
│   ├── Human vs. machine intelligence benchmarking & agentic systems
│   └── AI safety, alignment, & conversational speech processing
│
└── 04. Philosophy of the Image, Tech & Visual Culture
    ├── Modes of seeing, visual semiotics, & photographic truth
    ├── Epistemology of synthetic representation & media ecology
    └── Aesthetics as ideology, interface politics, & digital memory
```

### Content Formats

- **`[ESSAY]`** _(~1,500 – 3,000 words)_: Deep-dive investigations exploring complex intersections of technology, perception, and philosophy.
- **`[NOTE]`** _(~300 – 1,000 words)_: Concise observations, field reflections, and rapid theoretical provocations.
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
  - **Coral Crimson Red** (`#E84A5F`): Signature primary interactive accent and radial card glow.
  - **Archival Off-White** (`#F5F5F5` / `#D4D4D4`): Crisp headline contrast and soft body copy.
- **Layout Grid**:
  - **48px Vertical Rail**: Fixed ultra-thin left sidebar containing vertical nav routes (`vertical-rl`).
  - **50/50 Dual Container**: Floating asymmetric card matrix (left) paired with an immersive 1:1 essay reader (right).
- **Author-Defined Theme Modes**: Posts configure their visual mood (`theme: dark` or `theme: light`) via frontmatter metadata.

---

## 🛠️ Stack & Engineering

The site operates as a zero-dependency, ultra-fast static site hydrated by client-side scripts and a Python Markdown compiler:

- **Frontend**: Standard HTML5, Vanilla CSS3 (custom CSS variables & grid layout), and Vanilla JavaScript ES6+.
- **Publishing Engine**: Jekyll-compatible Markdown posts hosted via **GitHub Pages**.
- **Content Compiler (`sync_posts.py`)**: Custom Python build tool that parses `_posts/*.md`, extracts YAML frontmatter, calculates reading metrics, extracts image headers for zero-layout-shift sizing, and hydrates `posts.json` / `posts.js` and `tags.json` / `tags.js`.

---

## 📁 Repository Structure

```
mynameisjpg/
├── _posts/                 # Raw Markdown dispatches (Essays, Notes, Bookmarks, Resources)
├── assets/                 # Imagery, procedural SVGs, fonts, and media
├── css/ & index.css        # Vanilla CSS design tokens & grid rules
├── js/ & app.js            # Client-side routing, filtering, and reader hydration
├── posts/                  # Compiled standalone post HTML pages (generated)
├── sync_posts.py           # Core Python post compiler & metadata watcher
├── post_creator_server.py  # Local Dispatch Creator backend server
├── DispatchCreator.exe     # Standalone Dispatch Creator desktop utility
├── PRODUCT.md              # Product specifications & architectural contract
├── DESIGN.md               # Visual design tokens & UI guidelines
├── index.html              # Asymmetrical 2-column main application entry point
├── archive.html            # Database view for searchable post archives
├── gallery.html            # Visual image & procedural artwork catalog
└── network.html            # Interactive graph view of content topics & relationships
```

---

## 📜 Colophon & License

Built in zeroes and ones with blood, sweat, and coffee by **Juan P. Giusepponi** (`@mynameisjpg`).

Distributed under the [MIT License](LICENSE).
