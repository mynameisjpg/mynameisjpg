/* ==============================================================================
   UNTITLED.JPG - CORE APPLICATION ORCHESTRATOR & STATE HUB (app.js)
   Brand: Juan Pablo Giusepponi - "Overthinking Undervalued Means"
   Modular Component Architecture:
   - js/components/card-matrix.js          -> Asymmetric 3x3 Card Grid & Pagination
   - js/components/reader-pane.js          -> Markdown, KaTeX, Mermaid & Reading View
   - js/components/navigation-controls.js  -> Header Dropdowns, Search, Routing & Filters
   - js/components/subscribe-modal.js      -> Newsletter Dialog & Pipeline
   ============================================================================== */

(function () {
  "use strict";

  /**
   * In-Memory Post Store & Taxonomy State
   */
  const POSTS_DATABASE = {};
  let cachedUniquePublishedPosts = null;

  let activePostId = "";
  let activeFilter = "all";
  let activePillar = "all";
  let activeSort = "recent";
  let searchQuery = "";

  let matrixVisibleCount = 8;
  const MATRIX_BATCH_SIZE = 8;

  function invalidatePostsCache() {
    cachedUniquePublishedPosts = null;
  }

  function ingestPostList(postsArray) {
    if (!Array.isArray(postsArray)) return;
    invalidatePostsCache();
    postsArray.forEach((p) => {
      const key = p.slug || p.id || p.sys_id;
      if (!key) return;

      POSTS_DATABASE[key] = p;
      if (p.sys_id) POSTS_DATABASE[p.sys_id] = p;
      if (p.id) POSTS_DATABASE[p.id] = p;
      if (p.slug) {
        POSTS_DATABASE[p.slug] = p;
        const cleanSlug = p.slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
        if (cleanSlug && cleanSlug !== p.slug) {
          POSTS_DATABASE[cleanSlug] = p;
        }
      }
    });
  }

  // Immediate global feed ingestion if loaded via posts.js (Zero-CORS offline & file:///)
  if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
    ingestPostList(window.DYNAMIC_POSTS);
  }

  /**
   * Robust Pillar Matching Helper
   * Delegates directly to window.TaxonomyLookup when available
   */
  function matchesPillar(post, query) {
    if (!query || query === "all") return true;
    if (!post) return false;

    if (
      typeof window !== "undefined" &&
      window.TaxonomyLookup &&
      typeof window.TaxonomyLookup.matches === "function"
    ) {
      return window.TaxonomyLookup.matches(post, query);
    }

    const q = String(query).toLowerCase().replace(/[-_]/g, " ").trim();
    const pillar = String(post.pillar || "").toLowerCase();
    const subtopic = String(post.subtopic || "").toLowerCase();
    const category = String(post.category || "").toLowerCase();
    const tags = Array.isArray(post.tags)
      ? post.tags.map((t) => String(t).toLowerCase()).join(" ")
      : "";

    if (pillar.includes(q)) return true;
    return subtopic.includes(q) || category.includes(q) || tags.includes(q);
  }

  /**
   * Filter & Sort Engine for Dispatches
   */
  function getFilteredAndSortedPosts() {
    if (!cachedUniquePublishedPosts) {
      const uniquePosts = [];
      const seen = new Set();

      Object.values(POSTS_DATABASE).forEach((post) => {
        const uniqueKey = post.slug || post.id || post.sys_id;
        const statusStr = (post.status || "published").toLowerCase();
        const isPublished = statusStr === "published" || statusStr === "active";
        if (uniqueKey && !seen.has(uniqueKey) && isPublished) {
          seen.add(uniqueKey);
          uniquePosts.push(post);
        }
      });
      cachedUniquePublishedPosts = uniquePosts;
    }

    // Filter by Format, Pillar & Search Query
    let filtered = cachedUniquePublishedPosts.filter((post) => {
      const postFormat = (post.format || "ESSAY")
        .toLowerCase()
        .trim()
        .replace(/s$/, "");
      const curFilter = (activeFilter || "all")
        .toLowerCase()
        .trim()
        .replace(/s$/, "");
      if (curFilter !== "all" && postFormat !== curFilter) return false;

      if (activePillar !== "all" && !matchesPillar(post, activePillar)) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (post.title || "").toLowerCase().includes(q);
        const matchSubtitle = (post.subtitle || "").toLowerCase().includes(q);
        const matchExcerpt = (post.excerpt || "").toLowerCase().includes(q);
        const matchPillar = (post.pillar || "").toLowerCase().includes(q);
        const matchSubtopic = (post.subtopic || "").toLowerCase().includes(q);
        const matchCategory = (post.category || "").toLowerCase().includes(q);
        const matchTags =
          Array.isArray(post.tags) &&
          post.tags.some((t) => String(t).toLowerCase().includes(q));
        if (
          !matchTitle &&
          !matchSubtitle &&
          !matchExcerpt &&
          !matchPillar &&
          !matchSubtopic &&
          !matchCategory &&
          !matchTags
        ) {
          return false;
        }
      }
      return true;
    });

    // Sort order (default: Most Recent First)
    filtered.sort((a, b) => {
      if (activeSort === "recent") {
        const cmp = (b.date || "").localeCompare(a.date || "");
        if (cmp !== 0) return cmp;
        const isFeatA = Boolean(a.featured);
        const isFeatB = Boolean(b.featured);
        if (isFeatA && !isFeatB) return -1;
        if (!isFeatA && isFeatB) return 1;
        return 0;
      } else if (activeSort === "oldest") {
        return (a.date || "").localeCompare(b.date || "");
      } else if (activeSort === "readtime") {
        const parseTime = (str) =>
          parseInt((str || "").replace(/\D/g, "")) || 0;
        return parseTime(b.read_time) - parseTime(a.read_time);
      } else if (activeSort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return (b.date || "").localeCompare(a.date || "");
    });

    return filtered;
  }

  /**
   * Dynamically Fetch posts.json (Live HTTP Server / Production Build)
   */
  async function loadDynamicPosts() {
    const isSubdir =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/posts/");
    const jsonPath = isSubdir
      ? "../posts.json?t=" + Date.now()
      : "posts.json?t=" + Date.now();

    try {
      const res = await fetch(jsonPath);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          ingestPostList(data);
          console.log(
            `[UNTITLED.JPG] Loaded ${data.length} dispatches live from posts.json`,
          );
        }
      }
    } catch (err) {
      console.log("[UNTITLED.JPG] Running with direct script posts feed.");
    }

    // Parse URL search parameters (?filter=essay, ?pillar=visual-perception, etc.)
    if (window.parseUrlParamsAndApply) {
      window.parseUrlParamsAndApply();
    }

    // Check URL Hash or INITIAL_POST_SLUG for deep-link
    const rawHash = (window.location.hash || "").replace("#", "");
    const cleanHash = rawHash.replace(/^dispatch-/, "");
    const targetSlug =
      (POSTS_DATABASE[rawHash] ? rawHash : "") ||
      (POSTS_DATABASE[cleanHash] ? cleanHash : "") ||
      (typeof window !== "undefined" ? window.INITIAL_POST_SLUG : "");

    // Render Matrix Cards
    if (window.renderCardMatrix) {
      window.renderCardMatrix(true);
    } else if (window.CardMatrix && window.CardMatrix.render) {
      window.CardMatrix.render(true);
    }

    // Auto-select deep-linked dispatch
    if (targetSlug && POSTS_DATABASE[targetSlug]) {
      if (window.selectAndRenderPost) {
        window.selectAndRenderPost(targetSlug, false);
      } else if (window.ReaderPane && window.ReaderPane.selectAndRenderPost) {
        window.ReaderPane.selectAndRenderPost(targetSlug, false);
      }
    } else {
      activePostId = "";
      if (window.closeReaderPane) window.closeReaderPane();
      else if (window.ReaderPane && window.ReaderPane.closeReaderPane) {
        window.ReaderPane.closeReaderPane();
      }
    }
  }

  /**
   * Full Page Reset (Brand Logo & Home Icon)
   */
  function resetPage() {
    if (window.resetMatrixFilters) {
      window.resetMatrixFilters();
    } else if (window.CardMatrix && window.CardMatrix.resetFilters) {
      window.CardMatrix.resetFilters();
    }

    const matrixCol =
      document.querySelector(".grid-column") ||
      document.querySelector("[data-component='dispatch-matrix']");
    if (matrixCol) matrixCol.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const posts = getFilteredAndSortedPosts();
    if (posts.length > 0) {
      const firstPostId = posts[0].slug || posts[0].id || posts[0].sys_id;
      if (window.selectAndRenderPost) {
        window.selectAndRenderPost(firstPostId);
      } else if (window.ReaderPane && window.ReaderPane.selectAndRenderPost) {
        window.ReaderPane.selectAndRenderPost(firstPostId);
      }
    }
  }

  /**
   * Initialize Client Application & Wire Components
   */
  function initApp() {
    if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
      ingestPostList(window.DYNAMIC_POSTS);
    }

    // Initialize Navigation & Controls Listeners
    if (window.NavigationControls && window.NavigationControls.init) {
      window.NavigationControls.init();
    }

    // Initialize Subscribe Hint Animation
    if (window.SubscribeModal && window.SubscribeModal.initAnimation) {
      window.SubscribeModal.initAnimation();
    }

    // Reset page on brand logo or home icon click
    const brandLogo = document.querySelector(".brand-logo-v");
    if (brandLogo) {
      brandLogo.addEventListener("click", (e) => {
        e.preventDefault();
        resetPage();
      });
    }

    const homeBtn = document.getElementById("sidebar-home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetPage();
      });
    }

    // Static Format Filter Fallback Links
    const staticNavLinks = document.querySelectorAll(
      "nav:not(sidebar-rail nav) .nav-link-item",
    );
    staticNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const filter = (link.getAttribute("data-filter") || "all")
          .toLowerCase()
          .replace(/s$/, "");
        if (window.applyCategoryFilter) {
          window.applyCategoryFilter(filter, true);
        }
      });
    });

    // Attach Infinite Scroll Listeners
    const matrixCol =
      document.querySelector(".grid-column") ||
      document.querySelector("[data-component='dispatch-matrix']");
    if (matrixCol && window.handleMatrixScroll) {
      matrixCol.addEventListener("scroll", window.handleMatrixScroll, {
        passive: true,
      });
    }
    if (window.handleMatrixScroll) {
      window.addEventListener("scroll", window.handleMatrixScroll, {
        passive: true,
      });
    }

    // Load dynamic posts & render UI
    loadDynamicPosts();
  }

  // DOMContentLoaded Listener
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

  // Global Browser Hash Listener for Deep-Linking
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && POSTS_DATABASE[hash]) {
        if (window.selectAndRenderPost) {
          window.selectAndRenderPost(hash, false);
        } else if (window.ReaderPane && window.ReaderPane.selectAndRenderPost) {
          window.ReaderPane.selectAndRenderPost(hash, false);
        }
      } else if (!hash) {
        if (window.closeReaderPane) window.closeReaderPane();
        else if (window.ReaderPane && window.ReaderPane.closeReaderPane) {
          window.ReaderPane.closeReaderPane();
        }
      }
    });
  }

  // Unified State & Component Interface
  const UntitledApp = {
    get postsDatabase() {
      return POSTS_DATABASE;
    },
    get activePostId() {
      return activePostId;
    },
    set activePostId(val) {
      activePostId = val;
    },
    get activeFilter() {
      return activeFilter;
    },
    set activeFilter(val) {
      activeFilter = val;
    },
    get activePillar() {
      return activePillar;
    },
    set activePillar(val) {
      activePillar = val;
    },
    get activeSort() {
      return activeSort;
    },
    set activeSort(val) {
      activeSort = val;
    },
    get searchQuery() {
      return searchQuery;
    },
    set searchQuery(val) {
      searchQuery = val;
    },
    get matrixVisibleCount() {
      return matrixVisibleCount;
    },
    set matrixVisibleCount(val) {
      matrixVisibleCount = val;
    },
    get MATRIX_BATCH_SIZE() {
      return MATRIX_BATCH_SIZE;
    },

    ingestPostList,
    getFilteredAndSortedPosts,
    matchesPillar,
    loadDynamicPosts,
    resetPage,
    parseUrlParamsAndApply: () => {
      if (window.parseUrlParamsAndApply) window.parseUrlParamsAndApply();
    },
    updateBrowserUrl: (r) => {
      if (window.updateBrowserUrl) window.updateBrowserUrl(r);
    },
    syncFilterUIState: () => {
      if (window.syncFilterUIState) window.syncFilterUIState();
    },
  };

  if (typeof window !== "undefined") {
    window.UntitledApp = UntitledApp;
    window.POSTS_DATABASE = POSTS_DATABASE;
    window.getFilteredAndSortedPosts = getFilteredAndSortedPosts;
    window.matchesPillar = matchesPillar;
    window.loadDynamicPosts = loadDynamicPosts;
    window.resetPage = resetPage;
  }
})();
