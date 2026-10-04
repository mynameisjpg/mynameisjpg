/**
 * UNTITLED.JPG — Digital Macroblock & Ambient Glow Canvas
 * High-tempo, snappy pixel glitch engine with instant on/off digital drops.
 * Features compact macroblocks, thin scanline slits, and wide viewport dispersion.
 */

(function () {
  "use strict";

  class GlitchBackground {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.animationId = null;
      this.glitches = [];
      this.lastSpawnTime = 0;
      this.nextBurstInterval = 2400 + Math.random() * 1400; // Balanced cadence: 2.4s to 3.8s between bursts
      this.burstRemaining = 0;
      this.isPaused = false;
      this.prefersReducedMotion = false;

      // Color Palette (derived from Untitled.jpg brand tokens)
      this.colors = {
        coral: "232, 74, 95",            // #E84A5F Signature Coral
        brightCoral: "255, 55, 80",      // #FF3750 High-luma Coral
        rose: "255, 140, 150",           // #FF8C96 Dusky Rose
        crimson: "205, 25, 45",          // #CD192D Deep Crimson
        darkWine: "22, 4, 7",            // #160407 Shadow macroblock
        lightHighlight: "255, 240, 245", // #FFF0F5 Hot flash core
        white: "255, 255, 255"
      };

      this.init();
    }

    init() {
      // Check reduced motion preference
      if (typeof window !== "undefined" && window.matchMedia) {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.prefersReducedMotion = mq.matches;
        mq.addEventListener("change", (e) => {
          this.prefersReducedMotion = e.matches;
        });
      }

      // Find or create canvas inside grid-column (or split-layout fallback)
      this.canvas = document.getElementById("matrix-glitch-canvas");
      const gridCol = document.querySelector(".grid-column");
      const splitLayout = document.querySelector(".split-layout");
      const targetContainer = gridCol || splitLayout || document.body;

      if (!this.canvas) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "matrix-glitch-canvas";
        this.canvas.className = "matrix-glitch-canvas";
        this.canvas.setAttribute("aria-hidden", "true");
        targetContainer.insertBefore(this.canvas, targetContainer.firstChild);
      } else if (gridCol && this.canvas.parentElement !== gridCol) {
        gridCol.insertBefore(this.canvas, gridCol.firstChild);
      }

      this.ctx = this.canvas.getContext("2d", { alpha: true });
      if (!this.ctx) return;

      this.handleResize = this.handleResize.bind(this);
      this.animate = this.animate.bind(this);
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

      window.addEventListener("resize", this.handleResize, { passive: true });
      document.addEventListener("visibilitychange", this.handleVisibilityChange);

      // Watch for reader pane open/close transitions
      if (splitLayout) {
        const observer = new MutationObserver(() => this.handleResize());
        observer.observe(splitLayout, { attributes: true, attributeFilter: ["class"] });
      }

      this.handleResize();

      // Start quietly with a gentle delay before the first subtle glitch
      this.lastSpawnTime = typeof performance !== "undefined" ? performance.now() : 0;
      this.nextBurstInterval = 2200 + Math.random() * 1200;

      this.start();
    }

    handleResize() {
      if (!this.canvas) return;
      const splitLayout = document.querySelector(".split-layout");
      const isSplitOpen = splitLayout && splitLayout.classList.contains("reader-open");
      const isMobile = window.innerWidth <= 980 || window.innerHeight <= 700;

      let targetW = window.innerWidth;
      let targetH = window.innerHeight;

      if (!isMobile) {
        const sidebarWidth = 48;
        if (isSplitOpen) {
          targetW = Math.floor((window.innerWidth - sidebarWidth) * 0.5);
        } else {
          targetW = window.innerWidth - sidebarWidth;
        }
      }

      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = targetW;
      this.height = targetH;

      this.canvas.width = Math.floor(targetW * this.dpr);
      this.canvas.height = Math.floor(targetH * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    handleVisibilityChange() {
      if (document.hidden) {
        this.isPaused = true;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      } else {
        this.isPaused = false;
        this.lastSpawnTime = performance.now();
        this.start();
      }
    }

    start() {
      if (!this.animationId && !this.isPaused) {
        this.animationId = requestAnimationFrame(this.animate);
      }
    }

    /**
     * Wide viewport dispersion with subtle center bias
     */
    getRandomCoord(range, centerRatio = 0.5) {
      if (Math.random() < 0.45) {
        // 45% concentrated in middle 50%
        const r = (Math.random() + Math.random()) / 2; // Triangular distribution around 0.5
        return Math.floor((centerRatio + (r - 0.5) * 0.7) * range);
      } else {
        // 55% distributed broadly across entire range
        return Math.floor(Math.random() * (range - 10) + 5);
      }
    }

    /**
     * Spawns a compact, snappy glitch unit
     */
    spawnGlitch(isInitial = false) {
      if (this.prefersReducedMotion) return;
      if (this.glitches.length >= 35) return; // Cap maximum simultaneous glitches

      const x = this.getRandomCoord(this.width, 0.5);
      const y = this.getRandomCoord(this.height, 0.45);

      // Snappy lifetime: between 3 and 9 frames (approx 50ms - 150ms)
      const lifeFrames = Math.floor(3 + Math.random() * 7);

      const style = Math.random();
      const segments = [];

      if (style < 0.40) {
        // STYLE 1: Compact Stepped Macroblock (12-40px wide, 3-7px high)
        const w = Math.floor(14 + Math.random() * 26);
        const h = Math.floor(3 + Math.random() * 5);

        // Dark back slice
        segments.push({
          ox: -2,
          oy: 1,
          w: w + 4,
          h: h + 2,
          color: this.colors.darkWine,
          alpha: 0.8
        });

        // Vivid coral top slice
        segments.push({
          ox: 0,
          oy: 0,
          w: w,
          h: h,
          color: Math.random() > 0.35 ? this.colors.brightCoral : this.colors.coral,
          alpha: 0.95
        });

        // Stepped side tag
        if (Math.random() > 0.4) {
          segments.push({
            ox: (Math.random() > 0.5 ? 1 : -1) * (Math.floor(w * 0.4) + 2),
            oy: Math.random() > 0.5 ? 2 : -2,
            w: Math.floor(w * 0.5),
            h: Math.max(2, h - 2),
            color: this.colors.rose,
            alpha: 0.85
          });
        }
      } else if (style < 0.70) {
        // STYLE 2: Ultra-fine Horizontal Slit Scanline (1px or 2px high, 25-90px wide)
        const w = Math.floor(25 + Math.random() * 70);
        const h = Math.random() > 0.7 ? 2 : 1;

        segments.push({
          ox: 0,
          oy: 0,
          w: w,
          h: h,
          color: Math.random() > 0.4 ? this.colors.brightCoral : this.colors.lightHighlight,
          alpha: 0.95
        });

        // Occasional micro dot next to slit
        if (Math.random() > 0.5) {
          segments.push({
            ox: w + 4,
            oy: 0,
            w: 4,
            h: h + 1,
            color: this.colors.rose,
            alpha: 0.9
          });
        }
      } else if (style < 0.88) {
        // STYLE 3: Discrete Digital Pixel Block (Single micro rectangle)
        const w = Math.floor(4 + Math.random() * 12);
        const h = Math.floor(2 + Math.random() * 5);

        segments.push({
          ox: 0,
          oy: 0,
          w: w,
          h: h,
          color: Math.random() > 0.5 ? this.colors.coral : this.colors.rose,
          alpha: 0.9
        });
      } else {
        // STYLE 4: Vertical Pixel Stitch (1px wide, 6-14px tall)
        segments.push({
          ox: 0,
          oy: 0,
          w: 1.5,
          h: Math.floor(6 + Math.random() * 10),
          color: this.colors.rose,
          alpha: 0.85
        });
      }

      this.glitches.push({
        x,
        y,
        segments,
        currentLife: isInitial ? Math.floor(Math.random() * lifeFrames) : 0,
        maxLife: lifeFrames,
        // Optional 1-frame strobe flicker
        hasFlicker: Math.random() < 0.25
      });
    }

    /**
     * Draw the subtle central ambient radial glow
     */
    drawAmbientRadialGlow() {
      if (!this.ctx || this.width === 0 || this.height === 0) return;

      const centerX = this.width * 0.5;
      const centerY = this.height * 0.42;
      const radius = Math.max(this.width, this.height) * 0.65;

      const radialGrad = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );

      // Clean, luminous radial glow
      radialGrad.addColorStop(0.0, "rgba(232, 74, 95, 0.22)");
      radialGrad.addColorStop(0.26, "rgba(232, 74, 95, 0.11)");
      radialGrad.addColorStop(0.56, "rgba(185, 38, 56, 0.04)");
      radialGrad.addColorStop(0.85, "rgba(18, 18, 18, 0.0)");
      radialGrad.addColorStop(1.0, "rgba(18, 18, 18, 0.0)");

      this.ctx.fillStyle = radialGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Main animation frame loop
     */
    animate(currentTime) {
      if (this.isPaused) return;

      // Balanced middle-ground cadence: 2.4 to 3.8 seconds between events
      if (this.burstRemaining > 0) {
        // Quick trailing glitch in the active micro-burst
        if (currentTime - this.lastSpawnTime > 100) {
          this.spawnGlitch();
          this.lastSpawnTime = currentTime;
          this.burstRemaining--;
          if (this.burstRemaining <= 0) {
            // Schedule the next interval (2.4s to 3.8s)
            this.nextBurstInterval = 2400 + Math.random() * 1400;
          }
        }
      } else if (currentTime - this.lastSpawnTime > this.nextBurstInterval) {
        // Trigger a concise, subtle micro-glitch (mostly 1 unit, occasionally 2)
        const burstCount = Math.random() > 0.65 ? 2 : 1;
        for (let b = 0; b < burstCount; b++) {
          this.spawnGlitch();
        }
        this.lastSpawnTime = currentTime;
        // Optionally schedule 1 trailing glitch 100ms later (25% chance)
        this.burstRemaining = Math.random() > 0.75 ? 1 : 0;
        if (this.burstRemaining <= 0) {
          this.nextBurstInterval = 2400 + Math.random() * 1400;
        }
      }

      // Clear Canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Render subtle central radial glow
      this.drawAmbientRadialGlow();

      // 2. Render snappy glitch units (pure instant on/off)
      for (let i = this.glitches.length - 1; i >= 0; i--) {
        const g = this.glitches[i];
        g.currentLife++;

        // Snap off immediately when maxLife is reached (no fade)
        if (g.currentLife >= g.maxLife) {
          this.glitches.splice(i, 1);
          continue;
        }

        // Discrete strobe/flicker frame (if enabled, off on 2nd frame)
        if (g.hasFlicker && g.currentLife === 2) {
          continue;
        }

        // Draw segments at 100% full crisp opacity
        for (let s = 0; s < g.segments.length; s++) {
          const seg = g.segments[s];
          this.ctx.fillStyle = `rgba(${seg.color}, ${seg.alpha})`;
          this.ctx.fillRect(g.x + seg.ox, g.y + seg.oy, seg.w, seg.h);
        }
      }

      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.__glitchBg = new GlitchBackground();
    });
  } else {
    window.__glitchBg = new GlitchBackground();
  }
})();
