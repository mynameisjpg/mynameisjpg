(function () {
      "use strict";

      // Tab Switching
      const tabs = document.querySelectorAll(".tab-btn");
      const views = document.querySelectorAll(".layout-view");
      const indicator = document.getElementById("active-layout-indicator");

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active"));
          views.forEach((v) => v.classList.remove("active"));

          tab.classList.add("active");
          const target = tab.getAttribute("data-target");
          const targetView = document.getElementById(target);
          if (targetView) targetView.classList.add("active");

          if (target === "archetype-atlas") {
            indicator.textContent = "[ ARCHETYPE: 01 // THE BENTO ATLAS SYSTEM ]";
          } else {
            indicator.textContent = "[ ARCHETYPE: 02 // HIGH-DENSITY LAB MODE ]";
          }
        });
      });

      // Mode Switcher (Hi-Fi vs Wireframe)
      const btnHifi = document.getElementById("btn-mode-hifi");
      const btnWireframe = document.getElementById("btn-mode-wireframe");

      btnHifi.addEventListener("click", () => {
        btnHifi.classList.add("active");
        btnWireframe.classList.remove("active");
        document.body.classList.remove("mode-wireframe");
        document.body.classList.add("mode-hifi");
      });

      btnWireframe.addEventListener("click", () => {
        btnWireframe.classList.add("active");
        btnHifi.classList.remove("active");
        document.body.classList.remove("mode-hifi");
        document.body.classList.add("mode-wireframe");
      });

      // Keyboard shortcut for mode toggle (W key)
      window.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "w" || e.key === "W") {
          if (document.body.classList.contains("mode-wireframe")) {
            btnHifi.click();
          } else {
            btnWireframe.click();
          }
        }
      });

      // Viewport Presets
      const presetChips = document.querySelectorAll(".preset-chip");
      const stageFrame = document.getElementById("stage-frame");
      const dimIndicator = document.getElementById("viewport-dim-indicator");

      presetChips.forEach((chip) => {
        chip.addEventListener("click", () => {
          presetChips.forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");

          const w = chip.getAttribute("data-width");
          stageFrame.style.maxWidth = w;
          dimIndicator.textContent = w === "100%" ? "Fluid 100%" : `${w} × Adaptive`;
        });
      });

      // Specs Drawer Toggle
      const specsDrawer = document.getElementById("specs-drawer");
      const btnToggleSpecs = document.getElementById("btn-toggle-specs");
      const btnCloseSpecs = document.getElementById("btn-close-specs");

      btnToggleSpecs.addEventListener("click", () => {
        specsDrawer.classList.toggle("open");
      });

      btnCloseSpecs.addEventListener("click", () => {
        specsDrawer.classList.remove("open");
      });

      // Subscription Form Simulation
      const subBtn = document.getElementById("sub-submit-btn");
      const subInput = document.getElementById("sub-input-box");
      if (subBtn && subInput) {
        subBtn.addEventListener("click", () => {
          if (!subInput.value || !subInput.value.includes("@")) {
            subInput.style.borderColor = "var(--accent-coral)";
            subInput.placeholder = "PLEASE ENTER VALID ENDPOINT...";
            return;
          }
          subBtn.textContent = "TRANSMITTED!";
          subBtn.style.background = "var(--accent-emerald)";
          subInput.value = "";
          subInput.placeholder = "ENDPOINT REGISTERED // STAND BY";
          setTimeout(() => {
            subBtn.textContent = "TRANSMIT";
            subBtn.style.background = "var(--accent-coral)";
          }, 3500);
        });
      }

      // ========================================================================
      // INTERACTIVE NETWORK RADAR SIMULATOR (HTML5 Canvas)
      // ========================================================================
      function initRadarCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let width, height;
        function resize() {
          width = canvas.width = canvas.parentElement.clientWidth;
          height = canvas.height = canvas.parentElement.clientHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        const nodes = [];
        const nodeCount = 20;
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * 0.8 + 0.1,
            y: Math.random() * 0.8 + 0.1,
            vx: (Math.random() - 0.5) * 0.0012,
            vy: (Math.random() - 0.5) * 0.0012,
            radius: Math.random() * 2 + 1.5,
            tier: Math.floor(Math.random() * 3) + 1,
            pulse: Math.random() * Math.PI
          });
        }

        let angle = 0;

        function draw() {
          ctx.clearRect(0, 0, width, height);
          const cx = width / 2;
          const cy = height / 2;
          const maxRadius = Math.min(width, height) * 0.44;

          // Draw subtle concentric orbit rings
          ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          ctx.lineWidth = 1;
          for (let r = 0.25; r <= 1.0; r += 0.25) {
            ctx.beginPath();
            ctx.arc(cx, cy, maxRadius * r, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Draw radar sweep line
          angle += 0.02;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
          ctx.strokeStyle = "rgba(232, 74, 95, 0.4)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Update & draw nodes
          nodes.forEach((n, idx) => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0.08 || n.x > 0.92) n.vx *= -1;
            if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
            n.pulse += 0.04;

            const px = n.x * width;
            const py = n.y * height;

            // Connect nearby nodes
            for (let j = idx + 1; j < nodes.length; j++) {
              const n2 = nodes[j];
              const p2x = n2.x * width;
              const p2y = n2.y * height;
              const dist = Math.hypot(px - p2x, py - p2y);
              if (dist < 55) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(p2x, p2y);
                ctx.strokeStyle = `rgba(232, 74, 95, ${0.25 * (1 - dist / 55)})`;
                ctx.stroke();
              }
            }

            // Draw node dot
            ctx.beginPath();
            const glow = (Math.sin(n.pulse) + 1) * 0.5;
            ctx.arc(px, py, n.radius + glow * 0.8, 0, Math.PI * 2);
            if (n.tier === 1) {
              ctx.fillStyle = "#E84A5F";
            } else if (n.tier === 2) {
              ctx.fillStyle = "#4aa3e8";
            } else {
              ctx.fillStyle = "#D4D4D4";
            }
            ctx.fill();
          });

          requestAnimationFrame(draw);
        }

        draw();
      }

      initRadarCanvas("radar-canvas-atlas");

    })();
