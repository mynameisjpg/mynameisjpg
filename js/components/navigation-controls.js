/**
 * UNTITLED.JPG - COMPONENT: NAVIGATION & CONTROLS (js/components/navigation-controls.js)
 * Manages top navigation dropdowns (Dispatch Log, Search, Format Filter, Sort Order),
 * instant-sync debounced search input handling, category & pillar filter selection,
 * outside click dismissal, and global keyboard shortcuts (j/k/Escape).
 */

(function () {
  "use strict";

  let searchDebounceTimer = null;

  function getAppState() {
    return window.UntitledApp || {};
  }

  function positionDropdown(panel, btn) {
    if (!panel || !btn) return;
    if (
      panel.id === "top-search-dropdown" &&
      (window.innerWidth <= 590 || !btn || btn.offsetParent === null)
    ) {
      panel.style.left = "0";
      panel.style.right = "0";
      panel.style.width = "100%";
      panel.style.transform = "none";
      return;
    }

    if (!btn || btn.offsetParent === null) return;

    if (btn.id === "dispatch-log-btn") {
      const rail = document.querySelector(".sidebar-rail");
      const railRect = rail ? rail.getBoundingClientRect() : null;
      if (railRect && window.innerWidth > 980) {
        panel.style.left = `${railRect.right + 8}px`;
        panel.style.top = `${btn.getBoundingClientRect().top}px`;
        panel.style.transform = "none";
        return;
      }
    }

    const rect = btn.getBoundingClientRect();
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.bottom + 6}px`;
    panel.style.transform = "none";
  }

  function toggleDispatchLogDropdown() {
    const panel = document.getElementById("dispatch-log-dropdown");
    const btn = document.getElementById("dispatch-log-btn");
    if (!panel) return;
    const isHidden = panel.style.display === "none" || !panel.style.display;
    closeAllControlDropdowns("dispatch-log-dropdown");
    if (isHidden) {
      panel.style.display = "flex";
      if (btn) btn.classList.add("active");
      positionDropdown(panel, btn);
    } else {
      panel.style.display = "none";
      if (btn) btn.classList.remove("active");
    }
  }

  function toggleTopSearchDropdown() {
    const panel = document.getElementById("top-search-dropdown");
    const btn = document.getElementById("top-navbar-search-btn");
    if (!panel) return;
    const isHidden = panel.style.display === "none" || !panel.style.display;
    closeAllControlDropdowns("top-search-dropdown");
    if (isHidden) {
      panel.style.display = "block";
      if (btn) btn.classList.add("active");
      positionDropdown(panel, btn);
      const input = document.getElementById("top-search-input");
      if (input) {
        setTimeout(() => input.focus(), 60);
      }
    } else {
      panel.style.display = "none";
      if (btn) btn.classList.remove("active");
    }
  }

  function toggleTopFilterDropdown() {
    const panel = document.getElementById("top-filter-dropdown");
    const btn = document.getElementById("top-navbar-filter-btn");
    if (!panel) return;
    const isHidden = panel.style.display === "none" || !panel.style.display;
    closeAllControlDropdowns("top-filter-dropdown");
    if (isHidden) {
      panel.style.display = "flex";
      if (btn) btn.classList.add("active");
      positionDropdown(panel, btn);
    } else {
      panel.style.display = "none";
      if (btn) btn.classList.remove("active");
    }
  }

  function toggleTopSortDropdown() {
    const panel = document.getElementById("top-sort-dropdown");
    const btn = document.getElementById("top-navbar-sort-btn");
    if (!panel) return;
    const isHidden = panel.style.display === "none" || !panel.style.display;
    closeAllControlDropdowns("top-sort-dropdown");
    if (isHidden) {
      panel.style.display = "flex";
      if (btn) btn.classList.add("active");
      positionDropdown(panel, btn);
    } else {
      panel.style.display = "none";
      if (btn) btn.classList.remove("active");
    }
  }

  function toggleFilterPillDropdown() {
    const dropdown = document.getElementById("filter-dropdown");
    const btn = document.getElementById("filter-pill-btn");
    if (!dropdown || !btn) return;
    const isOpen = dropdown.classList.contains("open");
    closeAllControlDropdowns("filter-dropdown");
    if (!isOpen) {
      dropdown.classList.add("open");
      btn.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
    } else {
      dropdown.classList.remove("open");
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
    }
  }

  function toggleSortPillDropdown() {
    const dropdown = document.getElementById("sort-dropdown");
    const btn = document.getElementById("sort-pill-btn");
    if (!dropdown || !btn) return;
    const isOpen = dropdown.classList.contains("open");
    closeAllControlDropdowns("sort-dropdown");
    if (!isOpen) {
      dropdown.classList.add("open");
      btn.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
    } else {
      dropdown.classList.remove("open");
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
    }
  }

  function closeAllTopDropdowns(exceptId = null) {
    const dropdowns = [
      "dispatch-log-dropdown",
      "top-search-dropdown",
      "top-filter-dropdown",
      "top-sort-dropdown",
    ];
    const btns = [
      "dispatch-log-btn",
      "top-navbar-search-btn",
      "top-navbar-filter-btn",
      "top-navbar-sort-btn",
    ];

    dropdowns.forEach((id, idx) => {
      if (id !== exceptId) {
        const panel = document.getElementById(id);
        const btn = document.getElementById(btns[idx]);
        if (panel) panel.style.display = "none";
        if (btn) {
          btn.classList.remove("active");
          btn.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  function closeAllPillDropdowns(exceptId = null) {
    const pillDropdowns = [
      { id: "filter-dropdown", btnId: "filter-pill-btn" },
      { id: "sort-dropdown", btnId: "sort-pill-btn" },
    ];

    pillDropdowns.forEach(({ id, btnId }) => {
      if (id !== exceptId) {
        const dropdown = document.getElementById(id);
        const btn = document.getElementById(btnId);
        if (dropdown) dropdown.classList.remove("open");
        if (btn) {
          btn.classList.remove("active");
          btn.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  function closeAllControlDropdowns(exceptId = null) {
    closeAllTopDropdowns(exceptId);
    closeAllPillDropdowns(exceptId);
  }

  function handleTopInlineSearch(val) {
    const rawVal = val || "";
    const cleanVal = rawVal.trim();

    const app = getAppState();
    if (app && "searchQuery" in app) app.searchQuery = cleanVal;
    if (typeof window !== "undefined") window.searchQuery = cleanVal;

    // Instant UI Sync across all search fields
    const inlineInput = document.getElementById("top-inline-search-input");
    const modalInput = document.getElementById("top-search-input");
    const searchInput = document.getElementById("matrix-search-input");
    const clearBtn = document.getElementById("clear-search-btn");

    if (inlineInput && inlineInput.value !== rawVal) inlineInput.value = rawVal;
    if (modalInput && modalInput.value !== rawVal) modalInput.value = rawVal;
    if (searchInput && searchInput.value !== rawVal) searchInput.value = rawVal;
    if (clearBtn) clearBtn.style.display = cleanVal ? "inline-block" : "none";

    // Immediate update if cleared
    if (!cleanVal) {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
      }
      if (window.updateBrowserUrl) window.updateBrowserUrl(true);
      if (app.setMatrixVisibleCount) app.setMatrixVisibleCount(8);
      else if (window.matrixVisibleCount) window.matrixVisibleCount = 8;
      if (window.renderCardMatrix) window.renderCardMatrix(true);
      return;
    }

    // 120ms Debounce
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(() => {
      searchDebounceTimer = null;
      if (window.updateBrowserUrl) window.updateBrowserUrl(true);
      if (app.setMatrixVisibleCount) app.setMatrixVisibleCount(8);
      else if (window.matrixVisibleCount) window.matrixVisibleCount = 8;
      if (window.renderCardMatrix) window.renderCardMatrix(true);
    }, 120);
  }

  function applyCategoryFilter(filter, updateHistory = true) {
    const clean = (filter || "all").toLowerCase().trim().replace(/s$/, "");
    const app = getAppState();
    if (app && "activeFilter" in app) app.activeFilter = clean;
    if (typeof window !== "undefined") window.activeFilter = clean;
    if (clean === "all") {
      if (app && "activePillar" in app) app.activePillar = "all";
      if (typeof window !== "undefined") window.activePillar = "all";
    }

    if (window.syncFilterUIState) window.syncFilterUIState();
    if (updateHistory && window.updateBrowserUrl) window.updateBrowserUrl();
    if (window.renderCardMatrix) window.renderCardMatrix(true);
  }

  function applyPillarFilter(pillar, updateHistory = true) {
    const clean = (pillar || "all").toLowerCase().trim();
    const app = getAppState();
    if (app && "activePillar" in app) app.activePillar = clean;
    if (typeof window !== "undefined") window.activePillar = clean;

    if (window.syncFilterUIState) window.syncFilterUIState();
    if (updateHistory && window.updateBrowserUrl) window.updateBrowserUrl();
    if (window.renderCardMatrix) window.renderCardMatrix(true);
  }

  function updateSortSelection(sortKey, sortLabel, updateHistory = true) {
    const app = getAppState();
    const clean = sortKey === "newest" ? "recent" : sortKey;
    if (app && "activeSort" in app) app.activeSort = clean;
    if (typeof window !== "undefined") window.activeSort = clean;

    if (window.syncFilterUIState) window.syncFilterUIState();
    if (updateHistory && window.updateBrowserUrl) window.updateBrowserUrl();
    if (window.renderCardMatrix) window.renderCardMatrix(true);
  }

  function applyTopFilter(formatKey) {
    applyCategoryFilter(formatKey, true);
    closeAllTopDropdowns();
  }

  function applyTopSort(sortOrder) {
    updateSortSelection(sortOrder, sortOrder.toUpperCase(), true);
    closeAllTopDropdowns();
  }

  function setupNavigationListeners() {
    // Dropdown Toggles
    const dispatchLogBtn = document.getElementById("dispatch-log-btn");
    if (dispatchLogBtn) {
      dispatchLogBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDispatchLogDropdown();
      });
    }

    const topNavbarSearchBtn = document.getElementById("top-navbar-search-btn");
    if (topNavbarSearchBtn) {
      topNavbarSearchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTopSearchDropdown();
      });
    }

    const topNavbarFilterBtn = document.getElementById("top-navbar-filter-btn");
    if (topNavbarFilterBtn) {
      topNavbarFilterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTopFilterDropdown();
      });
    }

    const topNavbarSortBtn = document.getElementById("top-navbar-sort-btn");
    if (topNavbarSortBtn) {
      topNavbarSortBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTopSortDropdown();
      });
    }

    // Search inputs
    const topInlineSearch = document.getElementById("top-inline-search-input");
    if (topInlineSearch) {
      topInlineSearch.addEventListener("input", (e) => {
        handleTopInlineSearch(e.target.value);
      });
    }

    const topSearchInput = document.getElementById("top-search-input");
    if (topSearchInput) {
      topSearchInput.addEventListener("input", (e) => {
        handleTopInlineSearch(e.target.value);
      });
    }

    const searchInput = document.getElementById("matrix-search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        handleTopInlineSearch(e.target.value);
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        handleTopInlineSearch("");
      });
    }

    // Matrix Pill Dropdown Toggles
    const filterPillBtn = document.getElementById("filter-pill-btn");
    if (filterPillBtn) {
      filterPillBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFilterPillDropdown();
      });
      filterPillBtn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleFilterPillDropdown();
          const firstOpt = document.querySelector("#filter-dropdown .dropdown-opt");
          if (firstOpt) setTimeout(() => firstOpt.focus(), 50);
        }
      });
    }

    const sortPillBtn = document.getElementById("sort-pill-btn");
    if (sortPillBtn) {
      sortPillBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSortPillDropdown();
      });
      sortPillBtn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleSortPillDropdown();
          const firstOpt = document.querySelector("#sort-dropdown .dropdown-opt");
          if (firstOpt) setTimeout(() => firstOpt.focus(), 50);
        }
      });
    }

    // Dropdown Options Selection
    document
      .querySelectorAll(
        "#dispatch-log-dropdown .dropdown-option, #top-filter-dropdown .dropdown-option",
      )
      .forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const filter = (opt.getAttribute("data-filter") || "all")
            .toLowerCase()
            .replace(/s$/, "");
          applyCategoryFilter(filter, true);
          closeAllControlDropdowns();
        });
      });

    // Matrix Format Filter Buttons
    document.querySelectorAll(".matrix-filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const filter = (btn.getAttribute("data-filter") || "all")
          .toLowerCase()
          .replace(/s$/, "");
        applyCategoryFilter(filter, true);
      });
    });

    document
      .querySelectorAll("#filter-dropdown .dropdown-opt")
      .forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const filter = (opt.getAttribute("data-filter") || "all")
            .toLowerCase()
            .replace(/s$/, "");
          applyCategoryFilter(filter, true);
          closeAllControlDropdowns();
          const filterBtn = document.getElementById("filter-pill-btn");
          if (filterBtn) filterBtn.focus();
        });
      });

    document
      .querySelectorAll("#top-sort-dropdown .dropdown-option")
      .forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sortKey = (
            opt.getAttribute("data-sort") || "newest"
          ).toLowerCase();
          updateSortSelection(sortKey, opt.textContent.trim(), true);
          closeAllControlDropdowns();
        });
      });

    document
      .querySelectorAll("#sort-dropdown .dropdown-opt")
      .forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sortKey = (
            opt.getAttribute("data-sort") || "recent"
          ).toLowerCase();
          updateSortSelection(sortKey, opt.textContent.trim(), true);
          closeAllControlDropdowns();
          const sortBtn = document.getElementById("sort-pill-btn");
          if (sortBtn) sortBtn.focus();
        });
      });

    // Keyboard Navigation within Pill Dropdowns
    document
      .querySelectorAll(".custom-select-dropdown")
      .forEach((dropdown) => {
        dropdown.addEventListener("keydown", (e) => {
          const options = Array.from(dropdown.querySelectorAll(".dropdown-opt"));
          const currentIndex = options.indexOf(document.activeElement);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            options[nextIndex]?.focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            options[prevIndex]?.focus();
          } else if (e.key === "Escape") {
            e.preventDefault();
            closeAllControlDropdowns();
            const wrapper = dropdown.closest(".custom-select-wrapper");
            const btn = wrapper?.querySelector(".btn-matrix-pill");
            if (btn) btn.focus();
          }
        });
      });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".custom-select-wrapper") &&
        !e.target.closest(".top-dropdown-panel") &&
        !e.target.closest("#dispatch-log-btn") &&
        !e.target.closest("#top-navbar-search-btn") &&
        !e.target.closest("#top-navbar-filter-btn") &&
        !e.target.closest("#top-navbar-sort-btn")
      ) {
        closeAllControlDropdowns();
      }
    });

    // Subscribe trigger
    const sidebarSubscribeBtn = document.getElementById(
      "sidebar-subscribe-btn",
    );
    if (sidebarSubscribeBtn) {
      sidebarSubscribeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.openSubscribeModal) window.openSubscribeModal();
      });
    }

    // Floating Nav Buttons (Top/Bottom reader scroll)
    const btnScrollTop = document.getElementById("btn-scroll-top");
    const btnScrollBottom = document.getElementById("btn-scroll-bottom");

    if (btnScrollTop && !btnScrollTop.querySelector("svg")) {
      btnScrollTop.innerHTML = `<svg viewBox="0 0 24 24" class="nav-arrow-svg" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    }
    if (btnScrollBottom && !btnScrollBottom.querySelector("svg")) {
      btnScrollBottom.innerHTML = `<svg viewBox="0 0 24 24" class="nav-arrow-svg" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`;
    }

    function scrollCurrentView(toBottom = false) {
      const splitLayout = document.querySelector(".split-layout");
      const isMobile = window.innerWidth <= 980;
      const isReaderActive =
        splitLayout && splitLayout.classList.contains("mobile-reader-active");

      if (isMobile && !isReaderActive) {
        const matrixCol =
          document.querySelector(".grid-column") ||
          document.querySelector("[data-component='dispatch-matrix']");
        const target = matrixCol || window;
        if (toBottom) {
          if (matrixCol)
            matrixCol.scrollTo({
              top: matrixCol.scrollHeight,
              behavior: "smooth",
            });
          else
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
        } else {
          if (matrixCol) matrixCol.scrollTo({ top: 0, behavior: "smooth" });
          else window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        const pane = document.getElementById("essay-reading-pane");
        const scrollTarget =
          pane && pane.querySelector(".reader-scroll-wrapper")
            ? pane.querySelector(".reader-scroll-wrapper")
            : pane;
        if (scrollTarget) {
          scrollTarget.scrollTo({
            top: toBottom ? scrollTarget.scrollHeight : 0,
            behavior: "smooth",
          });
        }
      }
    }
    if (btnScrollTop) {
      btnScrollTop.addEventListener("click", (e) => {
        e.preventDefault();
        scrollCurrentView(false);
      });
    }
    if (btnScrollBottom) {
      btnScrollBottom.addEventListener("click", (e) => {
        e.preventDefault();
        scrollCurrentView(true);
      });
    }

    // Global Keyboard Shortcuts (j / k / Escape)
    document.addEventListener("keydown", (e) => {
      const activeTag = document.activeElement
        ? document.activeElement.tagName.toLowerCase()
        : "";
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select"
      )
        return;

      if (e.key === "Escape") {
        closeAllControlDropdowns();
        return;
      }

      // If a dropdown menu is open, don't trigger global post navigation
      const hasOpenDropdown =
        document.querySelector(".custom-select-dropdown.open") ||
        document.querySelector(".top-dropdown-panel[style*='display: flex'], .top-dropdown-panel[style*='display: block']");
      if (hasOpenDropdown) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        const appState = getAppState();
        const posts =
          typeof appState.getFilteredAndSortedPosts === "function"
            ? appState.getFilteredAndSortedPosts()
            : [];
        if (posts.length > 0) {
          const currentId = appState.activePostId || window.activePostId || "";
          const curIndex = posts.findIndex(
            (p) => (p.slug || p.id || p.sys_id) === currentId,
          );
          const nextIndex = curIndex < posts.length - 1 ? curIndex + 1 : 0;
          const nextPost = posts[nextIndex];
          if (nextPost && window.selectAndRenderPost) {
            window.selectAndRenderPost(
              nextPost.slug || nextPost.id || nextPost.sys_id,
            );
          }
        }
      } else if (e.key === "k" || e.key === "ArrowUp") {
        const appState = getAppState();
        const posts =
          typeof appState.getFilteredAndSortedPosts === "function"
            ? appState.getFilteredAndSortedPosts()
            : [];
        if (posts.length > 0) {
          const currentId = appState.activePostId || window.activePostId || "";
          const curIndex = posts.findIndex(
            (p) => (p.slug || p.id || p.sys_id) === currentId,
          );
          const prevIndex = curIndex > 0 ? curIndex - 1 : posts.length - 1;
          const prevPost = posts[prevIndex];
          if (prevPost && window.selectAndRenderPost) {
            window.selectAndRenderPost(
              prevPost.slug || prevPost.id || prevPost.sys_id,
            );
          }
        }
      }
    });
  }

  /**
   * Synchronize Active UI Filter & Sort Indicators in the DOM
   */
  function syncFilterUIState() {
    const app = getAppState();
    const activeFilter = app.activeFilter || window.activeFilter || "all";
    const activePillar = app.activePillar || window.activePillar || "all";
    const activeSort = app.activeSort || window.activeSort || "recent";

    const cleanFilter = (activeFilter || "all").toLowerCase().replace(/s$/, "");
    const navLinks = document.querySelectorAll(
      "#category-filter-nav .nav-link-item, .sidebar-rail .nav-link-item",
    );
    const filterLabel = document.getElementById("active-filter-label");
    const filterValLabel = document.getElementById("current-filter-val");
    const sortValLabel = document.getElementById("current-sort-val");
    const dispatchLogBtn = document.getElementById("dispatch-log-btn");

    navLinks.forEach((l) => {
      const lFilter = (l.getAttribute("data-filter") || "")
        .toLowerCase()
        .replace(/s$/, "");
      if (cleanFilter !== "all" && lFilter === cleanFilter) {
        l.classList.add("active");
      } else {
        l.classList.remove("active");
      }
    });

    const rail = document.querySelector("sidebar-rail");
    if (rail) {
      rail.setAttribute(
        "active-filter",
        cleanFilter !== "all" ? cleanFilter : "",
      );
    }

    // Highlight matrix filter buttons
    document.querySelectorAll(".matrix-filter-btn").forEach((btn) => {
      const f = (btn.getAttribute("data-filter") || "all")
        .toLowerCase()
        .replace(/s$/, "");
      btn.classList.toggle("active", f === cleanFilter);
    });

    // Highlight dropdown options
    document
      .querySelectorAll(
        "#top-filter-dropdown .dropdown-option, #dispatch-log-dropdown .dropdown-option, #filter-dropdown .dropdown-opt",
      )
      .forEach((opt) => {
        const f = (opt.getAttribute("data-filter") || "all")
          .toLowerCase()
          .replace(/s$/, "");
        opt.classList.toggle("active", f === cleanFilter);
      });

    // Highlight sort dropdown options
    document
      .querySelectorAll(
        "#top-sort-dropdown .dropdown-option, #sort-dropdown .dropdown-opt",
      )
      .forEach((opt) => {
        const s = opt.getAttribute("data-sort") || "recent";
        const isActiveSort =
          s === activeSort || (s === "newest" && activeSort === "recent");
        opt.classList.toggle("active", isActiveSort);
      });

    if (filterValLabel) {
      const labels = {
        all: "ALL POSTS",
        essay: "ESSAYS",
        note: "NOTES",
        bookmark: "BOOKMARKS",
        resource: "RESOURCES",
      };
      if (activePillar !== "all") {
        filterValLabel.textContent = `PILLAR: ${activePillar.toUpperCase().replace(/[-_]/g, " ")}`;
      } else {
        filterValLabel.textContent =
          labels[cleanFilter] ||
          (cleanFilter !== "all" ? cleanFilter.toUpperCase() : "ALL POSTS");
      }
    }

    if (sortValLabel) {
      const sortLabels = {
        recent: "MOST RECENT",
        oldest: "OLDEST",
        title: "TITLE A-Z",
        readtime: "READING TIME",
      };
      sortValLabel.textContent = sortLabels[activeSort] || "MOST RECENT";
    }

    if (dispatchLogBtn) {
      const label =
        cleanFilter === "all"
          ? "_DISPATCH_LOG"
          : `_${cleanFilter.toUpperCase()}S`;
      dispatchLogBtn.innerHTML = `${label} &#9660;`;
    }

    if (filterLabel) {
      if (activePillar !== "all") {
        filterLabel.textContent = `[PILLAR: ${activePillar.toUpperCase().replace(/[-_]/g, " ")}]`;
      } else {
        filterLabel.textContent = `[MODE: ${cleanFilter.toUpperCase()}_DISPATCHES]`;
      }
    }
  }

  /**
   * Sync Browser URL with In-Memory State
   */
  function updateBrowserUrl(replace = false) {
    if (
      typeof window === "undefined" ||
      !window.history ||
      !window.history.pushState
    )
      return;
    const url = new URL(window.location.href);
    const app = getAppState();
    const activeFilter = app.activeFilter || window.activeFilter || "all";
    const activePillar = app.activePillar || window.activePillar || "all";
    const activeSort = app.activeSort || window.activeSort || "recent";
    const searchQuery = app.searchQuery || window.searchQuery || "";

    if (activeFilter && activeFilter !== "all") {
      url.searchParams.set("filter", activeFilter);
    } else {
      url.searchParams.delete("filter");
      url.searchParams.delete("format");
    }

    if (activePillar && activePillar !== "all") {
      url.searchParams.set("pillar", activePillar);
    } else {
      url.searchParams.delete("pillar");
      url.searchParams.delete("topic");
      url.searchParams.delete("subtopic");
    }

    if (searchQuery && searchQuery.trim()) {
      url.searchParams.set("search", searchQuery.trim());
    } else {
      url.searchParams.delete("search");
      url.searchParams.delete("q");
    }

    if (activeSort && activeSort !== "recent") {
      url.searchParams.set("sort", activeSort);
    } else {
      url.searchParams.delete("sort");
    }

    const newUrl =
      url.pathname +
      (url.search ? url.search : "") +
      (window.location.hash || "");
    if (replace) {
      window.history.replaceState(null, "", newUrl);
    } else {
      window.history.pushState(null, "", newUrl);
    }
  }

  /**
   * URL Parameter Parser & Syncer
   */
  function parseUrlParamsAndApply() {
    if (typeof window === "undefined" || !window.location) return;
    const params = new URLSearchParams(window.location.search);
    const app = getAppState();

    // 1. Format filter
    const filterParam = params.get("filter") || params.get("format");
    if (filterParam) {
      const cleanF = filterParam.toLowerCase().trim().replace(/s$/, "");
      const valid = ["all", "essay", "note", "bookmark", "resource"];
      const val = valid.includes(cleanF) ? cleanF : filterParam.toLowerCase();
      if ("activeFilter" in app) app.activeFilter = val;
      if (typeof window !== "undefined") window.activeFilter = val;
    }

    // 2. Pillar filter
    const pillarParam =
      params.get("pillar") || params.get("topic") || params.get("subtopic");
    if (pillarParam) {
      const val = pillarParam.toLowerCase().trim();
      if ("activePillar" in app) app.activePillar = val;
      if (typeof window !== "undefined") window.activePillar = val;
    }

    // 3. Search query
    const qParam = params.get("search") || params.get("q");
    if (qParam) {
      const val = qParam.trim();
      if ("searchQuery" in app) app.searchQuery = val;
      if (typeof window !== "undefined") window.searchQuery = val;
      const searchInput = document.getElementById("matrix-search-input");
      const clearBtn = document.getElementById("clear-search-btn");
      const inlineInput = document.getElementById("top-inline-search-input");
      const modalInput = document.getElementById("top-search-input");
      if (searchInput) searchInput.value = val;
      if (clearBtn) clearBtn.style.display = val ? "inline-block" : "none";
      if (inlineInput) inlineInput.value = val;
      if (modalInput) modalInput.value = val;
    }

    // 4. Sort order
    const sortParam = params.get("sort");
    if (sortParam) {
      const val = sortParam === "newest" ? "recent" : sortParam.toLowerCase();
      if ("activeSort" in app) app.activeSort = val;
      if (typeof window !== "undefined") window.activeSort = val;
    }

    syncFilterUIState();
  }

  // Component Export
  const NavigationControls = {
    init: setupNavigationListeners,
    toggleDispatchLogDropdown,
    toggleTopSearchDropdown,
    toggleTopFilterDropdown,
    toggleTopSortDropdown,
    toggleFilterPillDropdown,
    toggleSortPillDropdown,
    closeAllTopDropdowns,
    closeAllPillDropdowns,
    closeAllControlDropdowns,
    handleTopInlineSearch,
    applyCategoryFilter,
    applyPillarFilter,
    updateSortSelection,
    applyTopFilter,
    applyTopSort,
    positionDropdown,
    syncFilterUIState,
    syncUIState: syncFilterUIState,
    updateBrowserUrl,
    parseUrlParamsAndApply,
  };

  if (typeof window !== "undefined") {
    window.NavigationControls = NavigationControls;
    window.toggleFilterPillDropdown = toggleFilterPillDropdown;
    window.toggleSortPillDropdown = toggleSortPillDropdown;
    window.closeAllPillDropdowns = closeAllPillDropdowns;
    window.applyCategoryFilter = applyCategoryFilter;
    window.applyPillarFilter = applyPillarFilter;
    window.updateSortSelection = updateSortSelection;
    window.handleTopInlineSearch = handleTopInlineSearch;
    window.applyTopFilter = applyTopFilter;
    window.applyTopSort = applyTopSort;
    window.closeAllTopDropdowns = closeAllTopDropdowns;
    window.closeAllControlDropdowns = closeAllControlDropdowns;
    window.syncFilterUIState = syncFilterUIState;
    window.updateBrowserUrl = updateBrowserUrl;
    window.parseUrlParamsAndApply = parseUrlParamsAndApply;
  }
})();
