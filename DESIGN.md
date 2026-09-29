---
name: "Untitled.jpg"
description: "Overthinking Undervalued Means — Editorial digital surrealism & computational psychophysics workspace"
colors:
  primary: "#E84A5F"
  primary-glow: "rgba(232, 74, 95, 0.45)"
  neutral-bg: "#121212"
  neutral-surface: "#161616"
  neutral-card: "#202020"
  neutral-card-hover: "#262626"
  text-bright: "#F5F5F5"
  text-body: "#D4D4D4"
  text-muted: "#888888"
  text-faint: "#555555"
  border-subtle: "rgba(255, 255, 255, 0.08)"
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
  badge:
    fontFamily: "'Azeret Mono', monospace"
    fontSize: "0.52rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  none: "0px"
  sm: "1px"
  md: "2px"
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
    rounded: "{rounded.sm}"
    padding: "0.55rem"
  card-active:
    backgroundColor: "{colors.primary}"
    textColor: "#141414"
  chip-meta:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.55rem"
---

# Design System: Untitled.jpg (JPG)

## Overview

`Untitled.jpg` is a high-density, out-of-distribution digital notebook and editorial publication exploring the psychophysics of vision, latent space aesthetics, and post-ironic digital surrealism. The visual language rejects generic SaaS/blog conventions in favor of a bespoke, tactile fusion: **halftone/dithered algorithmic art**, **lightweight geometric monospace metadata (`Azeret Mono`)**, and **classical literary serif longform reading (`Platypi`)**.

---

## Colors

The palette is strictly rooted in deep neutral blacks, dark graphite, and medium greys, punctuated by a single focal accent of **Coral Crimson Red (`#E84A5F`)**.

| Token             | Hex / Value               | Role                                                                         |
| :---------------- | :------------------------ | :--------------------------------------------------------------------------- |
| `primary`         | `#E84A5F`                 | Primary interactive accent, active card glow, quote bars, active link states |
| `primary-glow`    | `rgba(232, 74, 95, 0.45)` | Ambient halo on active/selected elements                                     |
| `neutral-bg`      | `#121212`                 | Deep neutral black background for viewport and sidebar rail                  |
| `neutral-surface` | `#161616`                 | Right-column essay reader background                                         |
| `neutral-card`    | `#202020`                 | Base solid neutral grey wrapper for floating grid cards                      |
| `text-bright`     | `#F5F5F5`                 | Crisp high-contrast headlines, titles, and active nav items                  |
| `text-body`       | `#D4D4D4`                 | Soft neutral serif body copy for extended reading comfort                    |
| `text-muted`      | `#888888`                 | Secondary monospace labels, dates, route numbers, and icons                  |
| `text-faint`      | `#555555`                 | Subtle grid noise, borders, and ambient background glitches                  |

---

## Typography

The typography system pairs structural monospace precision with classical literary warmth.

```
Display & Section Headers: Azeret Mono (Weight: 400 Regular / 300 Light)
Body & Literary Quotes:   Platypi (Weight: 300 Light / 400 Regular)
Metadata & System Chips:  Azeret Mono (Weight: 400 Regular)
```

- **Article Headline**: `Azeret Mono`, 1.95rem (weight 400), line-height 1.25, letter-spacing `-0.015em`.
- **Section Kicker**: `Azeret Mono`, 1.08rem (weight 400), letter-spacing `0.02em`.
- **Body Longform**: `Platypi`, 1.1rem (weight 300), line-height 1.8.
- **Card Caption**: `Azeret Mono`, 0.78rem (weight 400), line-height 1.35.
- **Navigation Routes**: `Azeret Mono`, 0.65rem (weight 400), letter-spacing `0.12em`.

---

## Layout

### 1. Ultra-Thin Left Sidebar Rail (`48px` Width)

- Fixed to the left viewport boundary with background `#161616` (`neutral-surface`), creating tonal harmony with the right-column reader.
- **Top Section**: Vertically oriented brand logo `[ UNTITLED.JPG ]` above a 3-line hamburger menu glyph (`≡`).
- **Stacked Routes**: `writing-mode: vertical-rl; transform: rotate(180deg)` text reading upwards with characters facing left:
  - `01. ESSAYS` (at top)
  - `02. NOTES`
  - `03. BOOKMARKS`
  - `04. RESOURCES` (at bottom)
- **Bottom Section**: Minimal stroke icons pinned vertically: **Home**, **Subscribe (Newsletter/RSS)**, and **LinkedIn**.

### 2. Main 50-50 Split Container

- The viewport (minus the 48px rail) is divided into two equal 50% columns (`grid-template-columns: 1fr 1fr`).
- **Left Column (50%)**: Floating asymmetric grid matrix with scattered digital pixel glitches (`▪ ▫ ▪`) in the margins.
- **Right Column (50%)**: Immersive full-view essay reading pane with custom header metadata chips and smooth-scrolling `↑ TOP` / `↓ BOTTOM` controls.

---

## Elevation & Depth

- **Tonal Layering**: Depth is created primarily through tonal contrast (`#121212` background vs `#161616` panel vs `#202020` card) rather than heavy drop shadows.
- **Active Card Glow**: The active card emits an intense **Coral Red radial bloom** (`box-shadow: 0 0 35px rgba(232, 74, 95, 0.45)`).
- **Hover Lift**: Cards scale smoothly (`transform: scale(1.06)`) with subtle shadow elevation (`0 0 25px rgba(0, 0, 0, 0.6)`).

---

## Shapes

- **Corner Radii**: Strictly sharp or near-square (`rounded-sm: 1px` to `2px`). No bubbly rounded pills or standard iOS-style corners.
- **Asymmetric Aspect Ratios**: Non-uniform card heights to preserve an organic, floating editorial stream:
  - Tall Portrait: `aspect-ratio: 1 / 1.28` & `1 / 1.42`
  - Medium Portrait: `aspect-ratio: 1 / 1.15`
  - Square: `aspect-ratio: 1 / 1.02`
  - Landscape / Wide: `aspect-ratio: 1 / 0.95`

---

## Components

### 1. Dithered Asymmetric Card

- **Structure**: A solid `#202020` container wrapping the surrealist artwork box and bottom monospace caption.
- **Corner Badges**: Discrete top-right type indicator (`[ESSAY]`, `[NOTE]`, `[BOOKMARK]`, `[RESOURCE]`).
- **Hover Overlay**: Seamless text overlay directly onto the artwork without background boxes (`text-shadow: 0 1px 4px rgba(0,0,0,0.95)`). Displays Title, Date, Reading Time, and Topic.
- **Active State**: Entire card transitions to `#E84A5F` (Coral Red), scaling to `1.06` with caption text becoming `#141414` (dark grey).

### 2. Essay Reading Pane

- **Metadata Header**: Archival chips (`[FORMAT: ESSAY]`, `[MODE: DARK]`, `[2026.09.25]`, `[14 MIN READ]`, `#AIPerception`, `#QueerTheory`).
- **Editorial Pullquotes**: 2px solid Coral Red left border with italicized serif text.
- **Floating Controls**: Minimalist monospace buttons `↑ TOP` and `↓ BOTTOM` fixed in the bottom-right corner.

---

## Do's and Don'ts

### Do:

- ✅ Keep typography weights light/medium (`Azeret Mono` at 400/300) to maintain crisp elegance.
- ✅ Maintain pure neutral greys and blacks (`#121212`, `#161616`, `#202020`) with no blue/slate cast.
- ✅ Use authentic halftone, dither, and surrealist procedural SVG artwork for cards.
- ✅ Ensure cards have ample margin gap (`2.2rem 1.8rem`) so hover expansions never overlap.
- ✅ Preserve `writing-mode: vertical-rl` on the sidebar navigation for top-to-bottom reading order.

### Don't:

- ❌ Do not use heavy bold (`700`/`900`) for monospace titles—it makes the layout feel clunky.
- ❌ Do not add heavy border outlines around cards or dividing panels; prioritize seamless tonal transitions.
- ❌ Do not use generic solid black bounding boxes for hover text overlays.
- ❌ Do not use rounded pill shapes or generic colored tags.
