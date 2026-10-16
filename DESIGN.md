---
name: "Untitled.jpg"
description: "Overthinking Undervalued Means — Editorial digital surrealism & computational psychophysics workspace"
colors:
  primary: "#E84A5F"
  primary-glow: "rgba(232, 74, 95, 0.45)"
  primary-subtle: "rgba(232, 74, 95, 0.12)"
  primary-border: "rgba(232, 74, 95, 0.25)"
  secondary-rose: "#FF8484"
  neutral-bg: "#101010"
  neutral-surface: "#161616"
  neutral-card: "#202020"
  neutral-card-translucent: "rgba(12, 12, 12, 0.72)"
  text-bright: "#F5F5F5"
  text-body: "#D2D2D2"
  text-muted: "#888888"
  text-faint: "#555555"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-faint: "rgba(255, 255, 255, 0.04)"
  border-strong: "rgba(255, 255, 255, 0.16)"
typography:
  display:
    fontFamily: "'Azeret Mono', monospace"
    fontSize: "clamp(1.75rem, 3.5vw, 2.2rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Azeret Mono', monospace"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
  title:
    fontFamily: "'Azeret Mono', monospace"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
  body:
    fontFamily: "'Platypi', Georgia, serif"
    fontSize: "1.1rem"
    fontWeight: 300
    lineHeight: 1.8
    letterSpacing: "normal"
  label:
    fontFamily: "'Azeret Mono', monospace"
    fontSize: "0.65rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.12em"
rounded:
  none: "0px"
  sm: "1px"
  md: "2px"
  lg: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  xxl: "48px"
components:
  sidebar:
    width: "48px"
    backgroundColor: "{colors.neutral-surface}"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.md}"
    padding: "0.6rem"
  card-active:
    backgroundColor: "{colors.primary}"
    textColor: "#141414"
  chip-meta:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.55rem"
  button-filter:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    padding: "0.3rem 0.65rem"
  button-filter-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
  comment-cta:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "0.2rem 0.55rem"
  status-pill:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.6rem"
---

# Design System: Untitled.jpg (JPG)

## Overview

**Creative North Star: "The Digital Surrealist Lab Broadside"**

`Untitled.jpg` is a high-density, out-of-distribution digital notebook and editorial workspace investigating the psychophysics of vision, latent space aesthetics, and post-ironic digital surrealism. Created by Juan Pablo Giusepponi under the positioning *"Overthinking Undervalued Means"*, the visual language rejects boilerplate modern SaaS paradigms, sterile corporate palettes, and generic AI design cliches in favor of an authentic fusion: **halftone and dithered algorithmic art**, **disciplined monospace architectural metadata (`Azeret Mono`)**, and **classical literary serif longform reading (`Platypi`)**.

The interface operates with the precision of a research terminal and the typographical warmth of a high-end Swiss literary broadsheet. Across its seven primary surfaces—the asymmetric dispatch matrix (`index.html`), standalone reader dispatches (`why-ai-agents-look-like-tamagotchis.html`, `foucault-borges-meaning.html`), biographical dossier (`about.html`), chronological timeline stratigraphy (`archive.html`), 3D cover art spatial vault (`gallery.html`), and topological taxonomy graph (`network.html`)—the system enforces strict structural continuity through a unified navigation rail, modular CSS custom property tokens, and near-zero round-corner geometry.

**Key Characteristics:**
- **Tripartite Typographic Architecture**: `Azeret Mono` drives display headings, technical metadata, and UI controls; `Platypi` commands longform editorial prose and philosophical pullquotes; `JetBrains Mono` executes code blocks and ASCII diagnostic diagrams.
- **Asymmetric Asynchronous Composition**: Non-uniform card aspect ratios, organic masonry gaps, and ambient pixel glitch coordinates (`▪ ▫ ▪`) preserve an alive editorial stream.
- **Tonal Charcoal Stratigraphy**: Pure neutral blacks (`#101010`), graphite reading surfaces (`#161616`), and card containers (`#202020`) build depth through luminance contrast rather than muddy artificial drop shadows.
- **Singular Coral Crimson Accent**: `#E84A5F` acts as a high-frequency surgical laser, applied with extreme restraint to signify active states, reading progress, and critical citations.
- **Zero Framework Bloat**: Built entirely on native HTML5, modular Vanilla CSS custom properties, and autonomous Web Components (`<sidebar-rail>`).

---

## Colors

The color palette is strictly rooted in deep, unpolluted neutral blacks and greys, devoid of blue or purple casts, punctuated by a vibrant **Coral Crimson (`#E84A5F`)** focal point and its soft harmonic **Dusky Rose (`#FF8484`)**.

### Primary
- **Signature Coral Crimson** (`#E84A5F`): The primary interactive accent. Applied to active navigation indicators, active filter buttons, reading progress track fills, pullquote anchor bars, and the intense radial bloom of selected cards.
- **Coral Radial Glow** (`rgba(232, 74, 95, 0.45)`): Ambient atmospheric illumination emitted exclusively when cards or critical actions enter active selection.
- **Coral Subtle Wash** (`rgba(232, 74, 95, 0.12)`): Translucent tinted background for comment CTA pills and micro-interaction containers.
- **Coral Hairline Border** (`rgba(232, 74, 95, 0.25)`): Boundary containment for interactive hover triggers and active chips.

### Secondary
- **Dusky Rose** (`#FF8484`): Harmonic secondary accent used for secondary tag highlights, reaction counter pops, and sub-headline emphases.

### Neutral
- **Deep Neutral Charcoal** (`#101010` / `#121212`): The foundational viewport canvas for the page background, timeline column base, and document root.
- **Graphite Reader Surface** (`#161616`): The right-column essay reader background, top header groups, and 48px fixed navigation rail.
- **Card Container Grey** (`#202020`): Solid opaque grey base for grid matrix artifact cards and timeline listing items.
- **Frosted Card Translucent** (`rgba(12, 12, 12, 0.72)`): Translucent card container blended with `backdrop-filter: blur(14px)` over ambient glitch art.
- **Crisp Off-White** (`#F5F5F5`): Display headlines, article titles, active route labels, and high-contrast navigational glyphs.
- **Soft Reading Grey** (`#D2D2D2`): High-legibility serif longform body copy calibrated for extended reading without eye fatigue.
- **Mid-Tone Monospace Muted** (`#888888`): Secondary metadata, timestamps, route numbers (`01`, `02`), tag counts, and inactive control icons.
- **Dark Neutral Faint** (`#555555`): De-emphasized structural borders, ASCII dividers, and ambient coordinate notations.
- **Subtle White Border** (`rgba(255, 255, 255, 0.08)`): Master dividing line separating columns, header bars, and structural panels.
- **Faint Boundary Border** (`rgba(255, 255, 255, 0.04)`): Internal cell borders, metadata chip boundaries, and hairline table separators.

### Per-Post Dual-Theme Modes (Light Theme Inversion)
Certain dispatches command a clinical, high-key paper aesthetic specified in their metadata:
- **Light Mode Canvas** (`#F5F5F5`): Clean paper document background.
- **Light Mode Card Surface** (`#D5D5D5`): Tactile grey archival container with `#C2C2C2` hover state.
- **Light Mode Primary Ink** (`#121212`): High-contrast headline typography.
- **Light Mode Body Ink** (`#3B3B3B`): Soft charcoal serif longform prose.
- **Light Mode Muted Tone** (`#616161`): Technical notes and secondary timestamps.

### Named Rules
**The Coral Accent Rarity Rule.** Coral Crimson (`#E84A5F`) must never cover more than 8% of the viewport at any time. It operates as an epistemological highlighter; overusing it dilutes its surgical authority.
**The Pure Neutrality Rule.** All grey scales must remain strictly desaturated neutrals (`#101010`, `#161616`, `#202020`). Do not introduce slate-blue, cold indigo, or warm sepia undertones into base dark containers.

---

## Typography

The typographic system creates an intentional friction between computational logic and classical humanistic literature.

**Display Font:** `Azeret Mono`, monospace (Weight: 400 Regular, 500 Medium)  
**Body Font:** `Platypi`, Georgia, serif (Weight: 300 Light, 400 Regular, 600 Semi-Bold)  
**Code & Diagnostic Font:** `JetBrains Mono`, monospace (Weight: 400 Regular, 500 Medium)  

**Character:** The pairing mirrors the tension between algorithmic automation and phenomenological perception. `Azeret Mono` provides rigid, unembellished, machine-readable scaffolding, while `Platypi` delivers an expressive, tactile literary cadence with flared serif terminals.

### Hierarchy
- **Display** (`Azeret Mono`, 400, `clamp(1.75rem, 3.5vw, 2.2rem)`, line-height 1.25, letter-spacing `-0.015em`): Primary article titles, dossier headlines, and spatial vault display banners.
- **Headline / Section Kicker** (`Azeret Mono`, 400/500, `1.08rem`–`1.2rem`, line-height 1.4, letter-spacing `0.02em`): H2 section headers, drawer titles, and timeline period markers.
- **Title / Card Caption** (`Azeret Mono`, 500, `0.78rem`–`0.9rem`, line-height 1.35, letter-spacing `0.04em`): Card titles, modal headers, and component legends.
- **Body Longform** (`Platypi`, 300 Light, `1.1rem` [17.6px], line-height 1.8, measure `65ch`–`72ch`): The core reading engine. Designed for uninterrupted immersive reading with proportional kerning.
- **Body Sub-Lead** (`Platypi`, 400 Regular italicized, `1.22rem`, line-height 1.6): Article executive summaries and theoretical theses.
- **Pullquotes** (`Platypi`, 300/400 italicized, `1.2rem`, line-height 1.6, 2px solid `#E84A5F` left border, `2.5rem` indent): Foundational philosophical citations and core arguments.
- **Label / System Chip** (`Azeret Mono`, 400, `0.65rem` [10.4px], line-height 1.3, letter-spacing `0.12em`, uppercase): Nav routes (`01. ESSAYS`), system statuses, filter buttons, and timestamps.
- **Badge / Micro-Telemetry** (`Azeret Mono`, 400/500, `0.52rem`–`0.58rem`, letter-spacing `0.06em`): Card corner tags (`[ESSAY]`, `[NOTE]`, `[RESOURCE]`), reading time indicators (`14 MIN READ`), and tag pill badges.

### Named Rules
**The Serif Immersion Rule.** All continuous expository prose must be rendered in `Platypi` with a line-height of 1.75–1.85 and maximum measure of 72ch. Monospace fonts are prohibited for body paragraphs.
**The Weight Restraint Rule.** Never set `Azeret Mono` at weights above 600. Heavy bold monospace destroys optical density and reads as crude industrial signage rather than refined computational craft.

---

## Layout

The spatial model prioritizes density, architectural rigor, and smooth drawer state reflow across five specialized page patterns.

### 1. Ultra-Thin Left Navigation Rail (`48px` Fixed Width)
- Pinned permanently to the left viewport edge (`width: 48px`, `height: 100vh`, `background: #161616`, `border-right: 1px solid rgba(255, 255, 255, 0.08)`).
- **Top Glyph**: Vertically aligned `[ UNTITLED.JPG ]` brand mark with a high-contrast 3-line hamburger menu trigger (`≡`).
- **Vertical Navigation Stacks**: Rendered via `writing-mode: vertical-rl; transform: rotate(180deg)` reading top-to-bottom:
  - `01. ESSAYS`
  - `02. NOTES`
  - `03. ARCHIVE`
  - `04. NETWORK`
  - `05. ABOUT`
- **Bottom Tool Dock**: Minimal line stroke icons aligned vertically: **Search (`Cmd+K`)**, **3D Vault / Gallery**, **RSS / Newsletter Modal**, and **LinkedIn Profile**.
- **Mobile Responsive Reflow**: On screens `< 768px`, the 48px rail transforms into a fixed 48px top navigation bar with a slide-out hamburger drawer.

### 2. Main 50/50 Split Shell (`split-layout`)
- Used on `index.html` and post reader pages. Divides the viewport (minus 48px rail) into two 50% columns (`grid-template-columns: 1fr 1fr`).
- **Left Column**: The Asymmetric Dispatch Grid Matrix with ambient background dithering and sticky filter toolbar (`82px` height).
- **Right Column**: The Edge-Anchored Sliding Essay Reader Pane with independent hardware-accelerated scroll container (`.reader-scroll-wrapper`).
- **Responsive Drawer Reflow**: When the reader pane opens on desktop, the left grid reflows from 4 columns to 3 columns using container queries (`@container gridcol (max-width: 980px)`), eliminating layout thrashing. On viewports `< 900px`, the reader pane shifts into a full 100vw sliding sheet with a sticky back-button.

### 3. Chronological Stratigraphy Shell (`archive-timeline-shell`)
- Used on `archive.html`. Implements a centralized stratigraphic axis (`max-width: 900px`) centered in the viewport.
- Decades and years are anchored with large monospace watermark typography (`2026 // YEAR_CYCLE_01`), connected by a continuous 1px neutral timeline spine (`#333333`) with `#E84A5F` node junctions.

### 4. 3D Spatial Canvas Viewport (`gallery-spatial-viewport`)
- Used on `gallery.html`. Full-bleed WebGL canvas (`#050505` deep black) with subtle radial vignette glow (`rgba(232, 74, 95, 0.03)`).
- Features a floating glassmorphic corner HUD panel (`bottom: 24px`, `right: 24px`, `width: 360px`, `backdrop-filter: blur(16px)`).

### 5. Taxonomy Node Map Shell (`network-full-shell`)
- Used on `network.html`. Houses an interactive topological knowledge graph displaying the 5 core conceptual pillars and interconnecting sub-topic tags.

---

## Elevation & Depth

`Untitled.jpg` adheres strictly to **Tonal Layering** rather than fake drop-shadow elevation. Physical depth is expressed through relative surface brightness and edge translucency.

### Surface Stratigraphy
```
Level 0 (Canvas Base):     #101010 (Viewport canvas, timeline background)
Level 1 (Panel Surface):   #161616 (Fixed sidebar rail, reader pane, top headers)
Level 2 (Opaque Container): #202020 (Solid card container, timeline card)
Level 3 (Frosted Surface):  rgba(12, 12, 12, 0.72) with backdrop-filter: blur(14px)
Level 4 (Floating HUD):     rgba(18, 18, 18, 0.82) with backdrop-filter: blur(16px)
```

### Shadow & Glow Vocabulary
- **Card Rest State**: `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5)` with `1px solid rgba(255, 255, 255, 0.09)`.
- **Card Hover State**: `box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8)` with `transform: translateY(-2px) scale(1.02)` and border brightening to `rgba(255, 255, 255, 0.18)`.
- **Active Card Coral Bloom**: `box-shadow: 0 0 35px rgba(232, 74, 95, 0.45)` with `border-color: #E84A5F` and `transform: scale(1.04)`.
- **Reader Pane Elevation**: `box-shadow: -12px 0 35px rgba(0, 0, 0, 0.6)` on the left dividing border.

### Named Rules
**The Tonal-First Depth Rule.** Never place a blurred drop shadow on an element without first giving it a 1px solid hairline border (`rgba(255, 255, 255, 0.08)`) and an explicit surface tone. Shadows reinforce edges; they do not define them.
**The No-Float Card Rule.** Cards at rest must feel rooted in the graphite plane. Hover lifts are slight (`translateY(-2px)`); cards never fly above their matrix container.

---

## Shapes

The form language is sharp, mathematical, and uncompromising. Rounded corners are suppressed to maintain an archival and technical instrument feel.

### Corner Radii Tokens
- **`radius-none`** (`0px`): Sidebar rail, dividing panels, timeline spine, code containers, and pullquote bars.
- **`radius-sm`** (`1px`): Metadata tags, format chips (`[ESSAY]`), status pills, and scrollbar thumbs.
- **`radius-md`** (`2px`): Matrix artifact cards, filter buttons, comment CTA pills, and search inputs.
- **`radius-lg`** (`4px`): Floating corner HUD panel and central modal dialogues.

### Geometric Proportions
Cards utilize deliberately varied aspect ratios to avoid the monotony of a uniform grid:
- **Tall Portrait**: `aspect-ratio: 1 / 1.42` & `1 / 1.28` (Used for flagship philosophical essays)
- **Standard Portrait**: `aspect-ratio: 1 / 1.15` (Used for technical field notes)
- **Equilateral Square**: `aspect-ratio: 1 / 1.02` (Used for curated bookmarks)
- **Compact Wide**: `aspect-ratio: 1 / 0.95` (Used for toolkits and dataset resources)

### Ghost Border Stratum
All interactive containers feature hairline borders with subtle opacity layering:
- Rest: `1px solid rgba(255, 255, 255, 0.08)`
- Hover: `1px solid rgba(255, 255, 255, 0.20)`
- Active / Focus: `1px solid var(--accent-coral, #E84A5F)`

---

## Components

### 1. Autonomous Navigation Rail (`<sidebar-rail>`)
- **Structure**: Fixed 48px rail instantiated via native Web Component `<sidebar-rail active-page="home" has-search>`.
- **Brand Mark**: Vertical logo linking to home (`font-family: 'Azeret Mono'`, `0.75rem`, letter-spacing `0.15em`).
- **Route Links**: Monospace links with `writing-mode: vertical-rl; transform: rotate(180deg)`. Hover triggers color transition to `#E84A5F` and subtle letter-spacing dilation.
- **Active Route State**: Solid `#E84A5F` left indicator dot and crisp `#F5F5F5` text.
- **Search & Utility Dock**: Inline SVG icons (Search, 3D Vault, RSS, LinkedIn) with `width: 18px`, `stroke-width: 1.75`, and `:hover` color shift to Coral Crimson.

### 2. Asymmetric Artifact Card (`.grid-card`)
- **Container**: Translucent grey shell (`rgba(12, 12, 12, 0.72)`) with `backdrop-filter: blur(14px)`, `border-radius: 2px`, and `border: 1px solid rgba(255, 255, 255, 0.09)`.
- **Artwork Box**: Procedural SVG or dithered cover illustration with crisp monochrome contrast.
- **Corner Badges**: Absolute positioned top-right format badge (`[ESSAY]`, `[NOTE]`, `[BOOKMARK]`, `[RESOURCE]`) in `Azeret Mono` `0.55rem` with background `rgba(0, 0, 0, 0.75)`.
- **Caption Block**: Bottom caption bar with monospace date, estimated reading time, and clean article title.
- **Hover Reveal**: Direct textual overlay on artwork featuring date, reading duration, and conceptual pillar tags with `text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95)`.
- **Active State**: Border turns `#E84A5F`, card scales `1.04`, emits `box-shadow: 0 0 35px rgba(232, 74, 95, 0.45)`.

### 3. Reading Pane & Editorial Engine (`.reader-pane`)
- **Container**: Sliding right panel (`.post-column`, `.essay-column`) with `background: #161616`, maximum measure container `800px`, and custom scrollbar.
- **Archival Metadata Header**: Multi-tier header containing publication series, serial timestamp (`[2026.10.02]`), format badge, reading duration, and pillar taxonomy pills.
- **Lead Section**: Large `Platypi` italic thesis statement introducing the essay.
- **Prose Typography**: `Platypi` 1.1rem, line-height 1.8, paragraphs separated by `1.6rem`.
- **Editorial Pullquotes**: Indented 2.5rem with 2px solid `#E84A5F` left border, italicized serif text, and source attribution.
- **Mathematical & Code Fences**: KaTeX inline and display math formula blocks; JetBrains Mono code fences with syntax highlighting; responsive Mermaid diagram containers.

### 4. Archival Metadata Tiers (`.meta-tier`)
- **Tier 1 (Core Taxonomy)**: High-contrast format badge (`[FORMAT: ESSAY]`) and post mode indicator (`[MODE: DARK]`).
- **Tier 2 (Thematic Pill Tags)**: Monospace hashtag chips (`#AIPerception`, `#LatentSpace`, `#Semiotics`) with `background: rgba(255, 255, 255, 0.04)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, and `:hover` border color transition to Coral Crimson.
- **Tier 3 (Telemetry & Status)**: Operational system indicators (`[ STATUS: OPERATIONAL ]`, `[ CITATION_GRAPH: VERIFIED ]`).

### 5. Post Engagement & Reaction Telemetry (`.post-engagement`)
- **Structure**: Horizontal telemetry bar anchored beneath article headlines and duplicated at post conclusion.
- **Comment CTA Pill (`.meta-comment-cta`)**: Monospace button with speech bubble SVG icon, background `rgba(232, 74, 95, 0.08)`, border `1px solid rgba(232, 74, 95, 0.28)`, and label `DISPATCH REPLIES`. Hover triggers `messagePop` keyframe animation.
- **Reaction Pills (`.reaction-pill`)**: Multi-reaction telemetry buttons (Applaud, Insightful, Provocative) with live counters and Lottie animation micro-bursts on click.
- **Reading Progress Tracker**: Ultra-fine 2px Coral Crimson progress line fixed to the reader pane header reflecting scroll percentage.

### 6. Matrix & Timeline Filter Toolbar (`.matrix-filter-btn`)
- **Toolbar Bar**: Sticky header (`height: 82px`) housing format filters and search telemetry.
- **Buttons**: Monospace filter buttons with SVG icon + text (`ESSAYS`, `NOTES`, `RESOURCES`, `BOOKMARKS`).
- **Rest State**: Ghost background, border `1px solid rgba(255, 255, 255, 0.08)`, text `#888888`.
- **Hover State**: Border `rgba(255, 255, 255, 0.25)`, text `#F5F5F5`.
- **Active State**: Background `#E84A5F`, text `#101010`, border `transparent`, icon fill `#101010`.

### 7. Chronological Timeline Axis (`.timeline-column`)
- **Watermark Headers**: Large `Azeret Mono` year indicators (`2026 // YEAR_CYCLE_01`) set in `#555555` with `0.15em` letter-spacing.
- **Central Spine**: 1px vertical line running through the chronological feed with `#E84A5F` diamond markers representing individual dispatches.
- **Timeline Card Item**: Compact horizontal cards (`background: #202020`, `padding: 1rem 1.25rem`, `border-radius: 2px`) featuring inline format tags, date kickers, and title links.

### 8. Spatial 3D Art Vault & Corner HUD (`.floating-hud-panel`)
- **Canvas Container**: Three.js WebGL spatial coordinate system with orbit/scroll interaction.
- **Glassmorphic HUD**: Floating panel (`backdrop-filter: blur(16px)`, `background: rgba(18, 18, 18, 0.82)`, `border: 1px solid rgba(255, 255, 255, 0.14)`).
- **HUD Content**: Active artwork title in `Azeret Mono`, camera zoom telemetry coordinates (`X: 0.00 Y: 1.25 Z: 4.50`), and reset camera button.

### 9. Interactive Taxonomy Node Map (`.nodemap-column`)
- **Legend & Header**: Monospace system legend (`SYS_LOG // INTERACTIVE_TAXONOMY_NODE_MAP`).
- **Graph Canvas**: Interactive node-link topology linking content pillars to dispatches.
- **Tag Cloud Pill Matrix**: Dense tag cloud sorted by frequency with hashtag badges and dispatch counters.

### 10. Floating Controls & Progress Telemetry (`.reader-floating-nav`)
- **Position**: Pinned to the bottom-right corner of the reader pane (`z-index: 200`).
- **Jump Buttons**: Minimal monospace buttons `↑ TOP` and `↓ BOTTOM` with `backdrop-filter: blur(12px)`, background `rgba(22, 22, 22, 0.85)`, and border `1px solid rgba(255, 255, 255, 0.12)`.
- **Hover**: Background `#E84A5F`, text `#101010`.

### 11. Modal Overlays & Command Search (`.search-dropdown-panel`, `.subscribe-modal`)
- **Search Dropdown**: Full-bleed glassmorphic overlay triggered by `Cmd+K` or sidebar search icon. Monospace input field with real-time fuzzy filter query results.
- **Subscribe Modal**: Archival newsletter subscription form with clean text inputs, `#E84A5F` submission button, and monospace disclaimer.

---

## Do's and Don'ts

### Do:
- **Do** maintain pure, uncolored neutral greys (`#101010`, `#161616`, `#202020`) for all background canvases and containers.
- **Do** restrict `Azeret Mono` to weights `300`, `400`, and `500` to preserve mathematical elegance.
- **Do** render all longform expository prose in `Platypi` with a line-height of `1.8` and maximum width of `72ch`.
- **Do** keep corner radii strictly sharp or near-square (`0px` to `2px`).
- **Do** treat Coral Crimson (`#E84A5F`) as a rare surgical accent reserved for active states, reading progress, and citation bars.
- **Do** use authentic halftone, dither, and procedural algorithmic SVG artwork for cards.
- **Do** preserve the fixed 48px width on the left navigation rail across all desktop surfaces.
- **Do** construct depth through tonal luminance stratigraphy and 1px hairline borders before applying any drop shadow.

### Don't:
- **Don't** use heavy bold monospace (`700`/`900`) for headers or titles—it makes the layout feel crude and noisy.
- **Don't** introduce rounded pills (`border-radius: 9999px`) or bubble cards.
- **Don't** add slate, navy, or purple color casts into neutral dark surfaces.
- **Don't** use generic solid black bounding boxes for card hover overlays; overlay text directly on the artwork with `text-shadow`.
- **Don't** use monospace fonts for longform body paragraphs.
- **Don't** flood screens with Coral Crimson; keep accent coverage strictly below 8% of the viewport.
- **Don't** load heavy third-party CSS or JS frameworks; all design system primitives must remain vanilla and autonomous.
