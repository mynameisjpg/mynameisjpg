/**
 * UNTITLED.JPG — COMPONENT: ASYMMETRIC CARD GRID MATRIX (js/components/card-matrix.js)
 * Handles dynamic 3x3 dispatch grid rendering, geometric artwork fallbacks,
 * incremental infinite scroll DOM appending, delegated keyboard & click events,
 * and leak-free hover glitch scramble animations.
 */

(function () {
  "use strict";

  const MATRIX_RATIOS = [
    "h-tall-1",
    "h-tall-2",
    "h-med",
    "h-square",
    "h-wide",
    "h-tall-1",
  ];

  const MATRIX_FALLBACK_ARTS = [
    "coral",
    "charcoal",
    "eye",
    "circle",
    "charcoal",
    "coral",
  ];

  const FORMAT_ICONS = {
    essay: `<svg viewBox="0 0 24 24" class="card-chip-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    note: `<svg viewBox="0 0 24 24" class="card-chip-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" class="card-chip-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
    resource: `<svg viewBox="0 0 24 24" class="card-chip-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  };

  const ART_FALLBACKS = {
    coral: `<svg class="card-art-svg" viewBox="0 0 180 230"><rect width="180" height="230" fill="#E84A5F"/><rect x="25" y="30" width="65" height="55" fill="#C73649"/><rect x="105" y="45" width="50" height="105" fill="#FF7084"/><ellipse cx="78" cy="130" rx="30" ry="42" fill="#170508"/></svg>`,
    charcoal: `<svg class="card-art-svg" viewBox="0 0 180 255"><rect width="180" height="255" fill="#181818"/><path d="M90,35 Q130,55 125,120 Q120,185 145,255 L35,255 Q60,185 55,120 Q50,55 90,35 Z" fill="#757575"/><ellipse cx="90" cy="85" rx="24" ry="34" fill="#E0E0E0"/><rect x="150" y="30" width="9" height="9" fill="#E84A5F"/></svg>`,
    eye: `<svg class="card-art-svg" viewBox="0 0 180 205"><rect width="180" height="205" fill="#191919"/><ellipse cx="90" cy="85" rx="45" ry="60" fill="#8E8E8E"/><path d="M72,65 Q88,62 104,65 Q100,115 88,128 Q76,115 72,65 Z" fill="#E8E8E8"/></svg>`,
    circle: `<svg class="card-art-svg" viewBox="0 0 180 185"><rect width="180" height="185" fill="#1B1B1B"/><ellipse cx="90" cy="92" rx="55" ry="36" fill="#808080"/><ellipse cx="90" cy="92" rx="45" ry="30" fill="#CCCCCC"/><circle cx="90" cy="92" r="22" fill="#141414"/><circle cx="90" cy="92" r="12" fill="#E84A5F"/></svg>`,
  };

  const CARD_GLITCH_WORDS = [
    "SURF...",
    "SEE...",
    "VIEW...",
    "VISIT...",
    "ENTER...",
    "DECODE...",
  ];
  const CARD_GLITCH_CHARS = "#!%$>_/-*01+@&~";

  let matrixObserver = null;
  let isMatrixScrollTicking = false;
  let isCardMatrixDelegated = false;

  function getAppState() {
    return window.UntitledApp || {};
  }

  function getFilteredPosts() {
    const app = getAppState();
    if (typeof app.getFilteredAndSortedPosts === "function") {
      return app.getFilteredAndSortedPosts();
    }
    if (typeof window.getFilteredAndSortedPosts === "function") {
      return window.getFilteredAndSortedPosts();
    }
    return [];
  }

  function getActivePostId() {
    const app = getAppState();
    return app.activePostId || window.activePostId || "";
  }

  function getMatrixVisibleCount() {
    const app = getAppState();
    return typeof app.matrixVisibleCount === "number"
      ? app.matrixVisibleCount
      : typeof window.matrixVisibleCount === "number"
      ? window.matrixVisibleCount
      : 8;
  }

  function setMatrixVisibleCount(val) {
    const app = getAppState();
    if (app && "matrixVisibleCount" in app) {
      app.matrixVisibleCount = val;
    }
    if (typeof window !== "undefined") {
      window.matrixVisibleCount = val;
    }
  }

  function getBatchSize() {
    const app = getAppState();
    return app.MATRIX_BATCH_SIZE || window.MATRIX_BATCH_SIZE || 8;
  }

  /**
   * Generate HTML string for an individual matrix card
   */
  function renderSingleCardHtml(post, idx) {
    const key = post.slug || post.id || post.sys_id;
    const ratio = post.aspect_ratio || MATRIX_RATIOS[idx % MATRIX_RATIOS.length];
    const format = (post.format || "ESSAY").toLowerCase();
    const isFeatured = Boolean(post.featured);
    const artKey = MATRIX_FALLBACK_ARTS[idx % MATRIX_FALLBACK_ARTS.length];
    const activeId = getActivePostId();
    const isSelected = key === activeId || post.sys_id === activeId;
    const iconSvg = FORMAT_ICONS[format] || FORMAT_ICONS.essay;

    return `
      <article class="grid-card ${isFeatured ? "card-featured" : ""} ${isSelected ? "selected-active" : ""}" data-id="${key}" data-format="${format}" tabindex="0" role="button" aria-pressed="${isSelected}">
        <div class="card-art-box ${ratio}">
          ${isFeatured ? `<span class="card-featured-badge" title="Featured" aria-label="Featured"><svg viewBox="0 0 24 24" class="card-featured-icon" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>` : ""}
          ${
            post.thumbnail || post.image
              ? `
            <img src="${post.thumbnail || post.image}" alt="${post.title}" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none;">${ART_FALLBACKS[artKey]}</div>
          `
              : ART_FALLBACKS[artKey]
          }
          <div class="hover-meta-reveal">
            <span class="meta-sub">${post.date} • ${post.read_time} • ${post.pillar || "DISPATCH"}</span>
          </div>
        </div>
        <h2 class="card-caption">${post.title}</h2>
        <div class="card-meta-bottom">
          <div class="card-meta-left">
            <span class="card-type-chip chip-${format}">${post.format} ${iconSvg}</span>
            <span class="card-meta-date">${post.date || ""}</span>
          </div>
          <span class="card-glitch-action" data-glitch-action aria-hidden="true">READ...</span>
        </div>
      </article>
    `;
  }

  /**
   * Event Delegation for Asymmetric Card Grid Matrix
   */
  function setupCardMatrixDelegation(container) {
    if (isCardMatrixDelegated || !container) return;
    isCardMatrixDelegated = true;

    // Delegated Click
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".grid-card");
      if (!card || !container.contains(card)) return;
      const postId = card.getAttribute("data-id");
      if (postId) {
        if (window.selectAndRenderPost) {
          window.selectAndRenderPost(postId);
        } else if (window.ReaderPane && window.ReaderPane.selectAndRenderPost) {
          window.ReaderPane.selectAndRenderPost(postId);
        }
      }
    });

    // Delegated Keyboard Activation (Enter or Space)
    container.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".grid-card");
      if (!card || !container.contains(card)) return;
      e.preventDefault();
      const postId = card.getAttribute("data-id");
      if (postId) {
        if (window.selectAndRenderPost) {
          window.selectAndRenderPost(postId);
        } else if (window.ReaderPane && window.ReaderPane.selectAndRenderPost) {
          window.ReaderPane.selectAndRenderPost(postId);
        }
      }
    });

    // Delegated Hover Glitch
    container.addEventListener("mouseover", (e) => {
      const card = e.target.closest(".grid-card");
      if (!card || !container.contains(card)) return;
      if (e.relatedTarget && card.contains(e.relatedTarget)) return;
      const glitchLabel = card.querySelector("[data-glitch-action]");
      if (glitchLabel) triggerCardGlitchAction(glitchLabel);
    });

    container.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".grid-card");
      if (!card || !container.contains(card)) return;
      if (e.relatedTarget && card.contains(e.relatedTarget)) return;
      const glitchLabel = card.querySelector("[data-glitch-action]");
      if (glitchLabel) resetCardGlitchAction(glitchLabel);
    });

    // Delegated Focus Glitch for Keyboard Navigation
    container.addEventListener("focusin", (e) => {
      const card = e.target.closest(".grid-card");
      if (!card || !container.contains(card)) return;
      const glitchLabel = card.querySelector("[data-glitch-action]");
      if (glitchLabel) triggerCardGlitchAction(glitchLabel);
    });

    container.addEventListener("focusout", (e) => {
      const card = e.target.closest(".grid-card");
      if (!card || !container.contains(card)) return;
      if (e.relatedTarget && card.contains(e.relatedTarget)) return;
      const glitchLabel = card.querySelector("[data-glitch-action]");
      if (glitchLabel) resetCardGlitchAction(glitchLabel);
    });
  }

  /**
   * Reset Card Glitch State & Clear Any Active Interval
   */
  function resetCardGlitchAction(element) {
    if (!element) return;
    if (element._glitchInterval) {
      clearInterval(element._glitchInterval);
      element._glitchInterval = null;
    }
    element.textContent = "READ...";
    element._isGlitching = false;
  }

  /**
   * Fast Scramble Glitch Animation for Card Action Label on Hover
   */
  function triggerCardGlitchAction(element) {
    if (!element) return;
    if (element._glitchInterval) {
      clearInterval(element._glitchInterval);
      element._glitchInterval = null;
    }
    element._isGlitching = true;

    let frame = 0;
    const totalFrames = 8;
    const shuffled = [...CARD_GLITCH_WORDS].sort(() => 0.5 - Math.random());
    const wordA = shuffled[0];
    const wordB = shuffled[1];

    element._glitchInterval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        resetCardGlitchAction(element);
        return;
      }

      const baseWord = frame < 4 ? wordA : frame < 7 ? wordB : "READ...";
      let scrambled = "";
      for (let i = 0; i < baseWord.length; i++) {
        if (Math.random() < 0.35 && i < baseWord.length - 3) {
          scrambled +=
            CARD_GLITCH_CHARS[
              Math.floor(Math.random() * CARD_GLITCH_CHARS.length)
            ];
        } else {
          scrambled += baseWord[i];
        }
      }
      element.textContent = scrambled;
    }, 36);
  }

  /**
   * Infinite Scroll Sentinel Status & Observer
   */
  function updateMatrixSentinel(loadedCount, totalCount) {
    let sentinel = document.getElementById("matrix-sentinel");
    const matrixCol =
      document.querySelector(".grid-column") ||
      document.querySelector("[data-component='dispatch-matrix']");

    if (!sentinel && matrixCol) {
      sentinel = document.createElement("div");
      sentinel.id = "matrix-sentinel";
      sentinel.className = "matrix-sentinel-loader";
      matrixCol.appendChild(sentinel);
    }

    if (!sentinel) return;

    if (loadedCount === 0) {
      sentinel.style.display = "none";
      return;
    }

    sentinel.style.display = "flex";
    if (loadedCount < totalCount) {
      sentinel.innerHTML = `
        <div class="sentinel-inner">
          <button type="button" class="btn-load-more" id="btn-load-more-dispatches" aria-label="Load more dispatches">
            <span class="load-more-icon">↓</span>
            <span class="load-more-text">LOAD MORE DISPATCHES</span>
            <span class="load-more-count">(${loadedCount} OF ${totalCount})</span>
          </button>
          <span class="sentinel-hint">// SCROLL OR CLICK TO REVEAL MORE</span>
        </div>
      `;
      const loadBtn = document.getElementById("btn-load-more-dispatches");
      if (loadBtn) {
        loadBtn.addEventListener("click", (e) => {
          e.preventDefault();
          loadMoreDispatches();
        });
      }
      setupSentinelObserver();
    } else {
      sentinel.innerHTML = `
        <div class="sentinel-inner">
          <span class="sentinel-text">[ ALL DISPATCHES LOADED • ${totalCount} TOTAL ]</span>
        </div>
      `;
      if (matrixObserver) {
        matrixObserver.disconnect();
        matrixObserver = null;
      }
    }
  }

  function setupSentinelObserver() {
    if (matrixObserver) {
      matrixObserver.disconnect();
      matrixObserver = null;
    }

    const sentinel = document.getElementById("matrix-sentinel");
    if (!sentinel) return;

    if ("IntersectionObserver" in window) {
      matrixObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const allPosts = getFilteredPosts();
              if (getMatrixVisibleCount() < allPosts.length) {
                loadMoreDispatches();
              }
            }
          });
        },
        { root: null, rootMargin: "80px" },
      );
      matrixObserver.observe(sentinel);
    }
  }

  /**
   * Load More Dispatches Batch Handler
   */
  function loadMoreDispatches() {
    const allPosts = getFilteredPosts();
    const visibleCount = getMatrixVisibleCount();
    const batchSize = getBatchSize();

    if (visibleCount < allPosts.length) {
      const nextCount = Math.min(visibleCount + batchSize, allPosts.length);
      setMatrixVisibleCount(nextCount);
      renderCardMatrix(false);
    }
  }

  /**
   * requestAnimationFrame Scroll Handler
   */
  function handleMatrixScroll() {
    if (isMatrixScrollTicking) return;
    isMatrixScrollTicking = true;

    requestAnimationFrame(() => {
      isMatrixScrollTicking = false;
      const allPosts = getFilteredPosts();
      if (getMatrixVisibleCount() >= allPosts.length) return;

      const matrixCol =
        document.querySelector(".grid-column") ||
        document.querySelector("[data-component='dispatch-matrix']");
      if (matrixCol) {
        const scrollBottom = matrixCol.scrollTop + matrixCol.clientHeight;
        const scrollHeight = matrixCol.scrollHeight;
        if (scrollHeight - scrollBottom < 400) {
          loadMoreDispatches();
          return;
        }
      }

      // Window scroll check
      const winScrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - winScrollBottom < 450) {
        loadMoreDispatches();
      }
    });
  }

  /**
   * Reset All Matrix Filters to Defaults
   */
  function resetMatrixFilters() {
    const app = getAppState();
    if (app && "activeFilter" in app) app.activeFilter = "all";
    if (app && "activeSort" in app) app.activeSort = "recent";
    if (app && "searchQuery" in app) app.searchQuery = "";

    if (typeof window !== "undefined") {
      window.activeFilter = "all";
      window.activeSort = "recent";
      window.searchQuery = "";
    }

    const searchInput = document.getElementById("matrix-search-input");
    const clearBtn = document.getElementById("clear-search-btn");
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";

    if (window.applyCategoryFilter) {
      window.applyCategoryFilter("all");
    }
    if (window.updateSortSelection) {
      window.updateSortSelection("recent", "MOST RECENT");
    }
    renderCardMatrix(true);
  }

  /**
   * Dynamically Render the Asymmetric Card Grid Matrix
   */
  function renderCardMatrix(resetPagination = true) {
    const container = document.getElementById("card-matrix");
    if (!container) return;

    setupCardMatrixDelegation(container);

    const allPosts = getFilteredPosts();
    const batchSize = getBatchSize();

    if (allPosts.length === 0) {
      setMatrixVisibleCount(0);
      const app = getAppState();
      const sQuery = app.searchQuery || window.searchQuery || "";
      const aFilter = app.activeFilter || window.activeFilter || "all";
      const aPillar = app.activePillar || window.activePillar || "all";

      const queryDisplay = sQuery.trim() ? `QUERY: "${sQuery}"` : "";
      const filterDisplay = aFilter !== "all" ? `FORMAT: [${aFilter.toUpperCase()}]` : "";
      const pillarDisplay = aPillar !== "all" ? `PILLAR: [${aPillar.toUpperCase()}]` : "";
      const activeFiltersText = [queryDisplay, filterDisplay, pillarDisplay].filter(Boolean).join(" // ") || "CURRENT_SELECTION";

      container.innerHTML = `
        <div class="matrix-empty-state" role="status" aria-live="polite">
          <div class="empty-state-tag">[ SYS_ALERT // NO_MATCHING_DISPATCHES ]</div>
          <h2 class="empty-state-title">No dispatches found</h2>
          <p class="empty-state-desc">
            No records in the dispatch matrix match <code>${activeFiltersText}</code>. Reset filters or broaden your query to reveal active dispatches.
          </p>
          <button type="button" class="btn-reset-filters" id="btn-empty-reset" onclick="resetMatrixFilters()" aria-label="Reset all filters and search query">
            <span aria-hidden="true">✕</span> RESET FILTERS &amp; SEARCH
          </button>
        </div>
      `;
      updateMatrixSentinel(0, 0);
      return;
    }

    if (resetPagination) {
      setMatrixVisibleCount(batchSize);
      const visiblePosts = allPosts.slice(0, batchSize);
      container.innerHTML = visiblePosts
        .map((post, idx) => renderSingleCardHtml(post, idx))
        .join("");
      updateMatrixSentinel(visiblePosts.length, allPosts.length);
    } else {
      // Incremental DOM update: Append only new slice of cards
      const visibleCount = getMatrixVisibleCount();
      const previousCount = visibleCount - batchSize;
      const newPosts = allPosts.slice(previousCount, visibleCount);
      if (newPosts.length > 0) {
        const newCardsHtml = newPosts
          .map((post, i) => renderSingleCardHtml(post, previousCount + i))
          .join("");
        container.insertAdjacentHTML("beforeend", newCardsHtml);
      }
      updateMatrixSentinel(visibleCount, allPosts.length);
    }
  }

  // Component Export
  const CardMatrix = {
    render: renderCardMatrix,
    renderCardHtml: renderSingleCardHtml,
    setupDelegation: setupCardMatrixDelegation,
    loadMore: loadMoreDispatches,
    handleScroll: handleMatrixScroll,
    resetFilters: resetMatrixFilters,
    triggerGlitch: triggerCardGlitchAction,
    resetGlitch: resetCardGlitchAction,
    updateSentinel: updateMatrixSentinel,
    FORMAT_ICONS,
    ART_FALLBACKS,
  };

  if (typeof window !== "undefined") {
    window.CardMatrix = CardMatrix;
    window.renderCardMatrix = renderCardMatrix;
    window.loadMoreDispatches = loadMoreDispatches;
    window.handleMatrixScroll = handleMatrixScroll;
    window.resetMatrixFilters = resetMatrixFilters;
    window.triggerCardGlitchAction = triggerCardGlitchAction;
    window.resetCardGlitchAction = resetCardGlitchAction;
  }
})();
