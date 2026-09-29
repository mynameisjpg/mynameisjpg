/* ==============================================================================
   UNTITLED.JPG — CHRONOLOGICAL ARCHIVE ENGINE (js/archive.js)
   Handles:
   - Left 50%: Compact Timeline Axis with centered 520px frame, 120px thumbnails & text metadata
   - Right 50%: Interactive Taxonomy Node Map canvas
   ============================================================================== */

let ARCHIVE_POSTS = [];
let filteredTimelinePosts = [];
let activeFormatFilter = "all";
let activeTagFilter = null;
let searchQuery = "";

// Node Map Canvas State
let canvas, ctx;
let nodes = [];
let connections = [];
let hoveredNode = null;
let activeNodeFilter = null;
let animFrameId = null;

document.addEventListener("DOMContentLoaded", () => {
  initArchiveApp();
});

let ARCHIVE_TAGS_DATA = [];

function initArchiveApp() {
  if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
    ingestArchivePosts(window.DYNAMIC_POSTS);
  }
  if (typeof window !== "undefined" && window.DYNAMIC_TAGS) {
    ARCHIVE_TAGS_DATA = window.DYNAMIC_TAGS;
  }

  fetchArchivePostsJson();
  fetchArchiveTagsJson();
  initArchiveListeners();
  initNodeMapCanvas();
  initSubscribeAnimation();
  renderTagsDirectoryTable();
}

let isArchiveSubscribeAnimScheduled = false;

function initSubscribeAnimation() {
  if (isArchiveSubscribeAnimScheduled) return;
  isArchiveSubscribeAnimScheduled = true;

  const DELAY_MS = 6000;
  const ANIMATION_DURATION_MS = 4500;

  setTimeout(() => {
    const subscribeTargets = document.querySelectorAll('#sidebar-subscribe-btn, a[aria-label="Subscribe"], a[title*="Subscribe"]');
    if (!subscribeTargets || subscribeTargets.length === 0) return;

    subscribeTargets.forEach(el => {
      el.classList.add("subscribe-ring-vibrate");
      const svg = el.querySelector("svg");
      if (svg) svg.classList.add("subscribe-ring-vibrate");
    });

    const onAnimationDone = () => {
      subscribeTargets.forEach(el => {
        el.classList.remove("subscribe-ring-vibrate");
        el.classList.add("subscribe-coral-active");
        const svg = el.querySelector("svg");
        if (svg) {
          svg.classList.remove("subscribe-ring-vibrate");
          svg.classList.add("subscribe-coral-active");
        }
      });
    };

    setTimeout(onAnimationDone, ANIMATION_DURATION_MS + 100);
  }, DELAY_MS);
}

function ingestArchivePosts(postsArray) {
  if (!Array.isArray(postsArray)) return;

  const seen = new Set();
  ARCHIVE_POSTS = [];

  postsArray.forEach(p => {
    const key = p.slug || p.id || p.sys_id;
    const status = (p.status || "published").toLowerCase();
    if (key && !seen.has(key) && (status === "published" || status === "active")) {
      seen.add(key);
      ARCHIVE_POSTS.push(p);
    }
  });

  // Sort descending by date
  ARCHIVE_POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderTimelineList();
  buildNodeMapData();
  checkUrlTagParameters();
}

function checkUrlTagParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  let tag = urlParams.get("tag") || urlParams.get("node") || urlParams.get("topic") || urlParams.get("filter");

  if (!tag && window.location.hash) {
    const hash = window.location.hash.replace(/^#tag-?/i, "").replace(/^#/, "");
    if (hash && hash !== "archive" && !hash.startsWith("dispatch-") && hash !== "nodemap-canvas-wrapper") {
      tag = decodeURIComponent(hash);
    }
  }

  if (tag) {
    applyTagFilterDirectly(tag);
  }
}

function setNodeFilterUIState(isFiltered, filterText = "") {
  document.querySelectorAll("#clear-node-filter-btn, .btn-clear-node-filter").forEach(btn => {
    btn.style.display = isFiltered ? "inline-flex" : "none";
  });
  document.querySelectorAll("#nodemap-status-label, .top-navbar-legend-badge").forEach(label => {
    if (isFiltered) {
      label.textContent = `FILTERED BY NODE: ${filterText.toUpperCase()}`;
    } else {
      label.textContent = "EXPLORE 3D TAG NODES & CONCEPTUAL VECTORS";
    }
  });
}

function applyTagFilterDirectly(tag) {
  if (!tag) return;
  activeTagFilter = tag.trim();

  setNodeFilterUIState(true, activeTagFilter);

  const tagLower = activeTagFilter.toLowerCase();
  if (typeof threeNodes !== "undefined" && threeNodes && threeNodes.length > 0) {
    const match = threeNodes.find(n => {
      const d = n.data;
      if (!d) return false;
      const l = (d.label || "").toLowerCase().replace(/^#/, "");
      const raw = (d.rawTag || "").toLowerCase();
      return l === tagLower || raw === tagLower;
    });
    if (match) activeNodeFilter = match.data;
  } else if (typeof nodes !== "undefined" && nodes && nodes.length > 0) {
    const match = nodes.find(n => {
      const l = (n.label || "").toLowerCase().replace(/^#/, "");
      const raw = (n.rawTag || "").toLowerCase();
      return l === tagLower || raw === tagLower;
    });
    if (match) activeNodeFilter = match;
  }

  renderTimelineList();

  setTimeout(() => {
    const canvasWrapper = document.getElementById("nodemap-canvas-wrapper");
    if (canvasWrapper) {
      canvasWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 150);

  const archiveShell = document.querySelector(".archive-split-shell");
  if (archiveShell && window.innerWidth <= 980) {
    archiveShell.classList.add("nodemap-active");
  }
}

async function fetchArchivePostsJson() {
  try {
    const res = await fetch("posts.json?t=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      ingestArchivePosts(data);
    }
  } catch (err) {
    console.log("Archive JSON fetch fallback active.");
  }
}

async function fetchArchiveTagsJson() {
  try {
    const res = await fetch("tags.json?t=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        ARCHIVE_TAGS_DATA = data;
        renderTagsDirectoryTable();
      }
    }
  } catch (err) {
    console.log("Archive Tags JSON fetch fallback active.");
  }
}

function renderTagsDirectoryTable(searchVal = "") {
  const tbody = document.getElementById("tags-directory-tbody");
  const countLabel = document.getElementById("tags-table-count-label");
  if (!tbody) return;

  const rawData = (window.DYNAMIC_TAGS || ARCHIVE_TAGS_DATA || []);
  const searchLower = (searchVal || "").toLowerCase().trim();

  const filtered = rawData.filter(t => {
    if (!searchLower) return true;
    const nameMatch = (t.name || "").toLowerCase().includes(searchLower);
    const typeMatch = (t.type || "").toLowerCase().includes(searchLower);
    const postsMatch = (t.posts || []).some(p => (p.title || "").toLowerCase().includes(searchLower));
    return nameMatch || typeMatch || postsMatch;
  });

  if (countLabel) {
    countLabel.textContent = `TOTAL TAXONOMY ITEMS: ${filtered.length}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted); font-family: var(--font-mono);">
          [ NO TAXONOMY TAGS OR TOPICS MATCHING SELECTION ]
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const typeBadgeClass = t.type === "pillar" ? "tag-type-pillar" : (t.type === "subtopic" ? "tag-type-subtopic" : "tag-type-tag");
    const typeLabel = t.type.toUpperCase();

    const linksHtml = (t.links || []).map(l => {
      const fmt = (l.format || "ESSAY").toUpperCase();
      return `<a href="${l.url}" class="tag-dispatch-link" title="${l.title}">
        <span class="link-fmt">[${fmt}]</span> ${l.title}
      </a>`;
    }).join("");

    return `
      <tr class="tags-table-row" data-tag="${t.name}">
        <td class="tag-name-cell">
          <a href="javascript:void(0)" class="tag-directory-filter-link" onclick="applyTagFilterDirectly('${t.name}')">
            ${t.type === 'tag' ? '#' : ''}${t.name}
          </a>
        </td>
        <td><span class="tag-type-badge ${typeBadgeClass}">${typeLabel}</span></td>
        <td class="tag-count-cell">${t.count}</td>
        <td class="tag-links-cell">${linksHtml}</td>
      </tr>
    `;
  }).join("");
}

let activeSortOrder = "newest";

function initArchiveListeners() {
  // View Toggle Buttons (Graph vs Table)
  const graphBtn = document.getElementById("toggle-view-graph-btn");
  const tableBtn = document.getElementById("toggle-view-table-btn");
  const canvasWrapper = document.getElementById("nodemap-canvas-wrapper");
  const tableWrapper = document.getElementById("tags-table-wrapper");

  if (graphBtn && tableBtn) {
    graphBtn.addEventListener("click", () => {
      graphBtn.classList.add("active");
      tableBtn.classList.remove("active");
      if (canvasWrapper) canvasWrapper.style.display = "block";
      if (tableWrapper) tableWrapper.style.display = "none";
    });

    tableBtn.addEventListener("click", () => {
      tableBtn.classList.add("active");
      graphBtn.classList.remove("active");
      if (canvasWrapper) canvasWrapper.style.display = "none";
      if (tableWrapper) tableWrapper.style.display = "flex";
      renderTagsDirectoryTable();
    });
  }

  // Tags Table Search Input
  const tagsSearchInput = document.getElementById("tags-table-search-input");
  if (tagsSearchInput) {
    tagsSearchInput.addEventListener("input", (e) => {
      renderTagsDirectoryTable(e.target.value);
    });
  }
  // Search input
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTimelineList();
    });
  }

  // Top navbar search input
  const topSearchInput = document.getElementById("top-search-input");
  if (topSearchInput) {
    topSearchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTimelineList();
    });
  }

  // Format Filter nav links
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(link => {
    link.addEventListener("click", () => {
      const fmt = link.getAttribute("data-filter") || "all";
      if (activeFormatFilter === fmt) {
        activeFormatFilter = "all";
        link.classList.remove("active");
      } else {
        document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(l => l.classList.remove("active"));
        activeFormatFilter = fmt;
        link.classList.add("active");
      }
      renderTimelineList();
    });
  });

  // Clear Node Filter button
  document.querySelectorAll("#clear-node-filter-btn, .btn-clear-node-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTagFilter = null;
      activeNodeFilter = null;
      setNodeFilterUIState(false);
      renderTimelineList();
      resetNodeHighlights();
    });
  });

  // Live tag link click interceptor when already on archive.html
  document.addEventListener("click", (e) => {
    const tagLink = e.target.closest("a[href*='archive.html?tag='], a[href*='?tag=']");
    if (tagLink) {
      try {
        const url = new URL(tagLink.href, window.location.origin);
        const tag = url.searchParams.get("tag");
        if (tag) {
          e.preventDefault();
          history.pushState(null, "", tagLink.href);
          applyTagFilterDirectly(tag);
        }
      } catch (err) {}
    }
  });

  // Centralized Top Navigation & Dropdown Listeners
  const dispatchLogBtn = document.getElementById("dispatch-log-btn");
  if (dispatchLogBtn) {
    dispatchLogBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDispatchLogDropdown();
    });
  }

  const topFilterBtn = document.getElementById("top-navbar-filter-btn");
  if (topFilterBtn) {
    topFilterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTopFilterDropdown();
    });
  }

  const topSortBtn = document.getElementById("top-navbar-sort-btn");
  if (topSortBtn) {
    topSortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTopSortDropdown();
    });
  }

  const sidebarSubscribeBtn = document.getElementById("sidebar-subscribe-btn");
  if (sidebarSubscribeBtn) {
    sidebarSubscribeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openSubscribeModal();
    });
  }

  const topInlineSearch = document.getElementById("top-inline-search-input");
  if (topInlineSearch) {
    topInlineSearch.addEventListener("input", (e) => {
      handleTopInlineSearch(e.target.value);
    });
  }

  document.querySelectorAll("#dispatch-log-dropdown .dropdown-option, #top-filter-dropdown .dropdown-option").forEach(opt => {
    opt.addEventListener("click", () => {
      const filter = opt.getAttribute("data-filter") || "all";
      applyTopFilter(filter);
    });
  });

  document.querySelectorAll("#top-sort-dropdown .dropdown-option").forEach(opt => {
    opt.addEventListener("click", () => {
      const sort = opt.getAttribute("data-sort") || "newest";
      applyTopSort(sort);
    });
  });

  // Subscribe Modal Form & Buttons
  document.querySelectorAll("#subscribe-modal form, .modal-form").forEach(form => {
    form.addEventListener("submit", handleSubscribeSubmit);
  });

  document.querySelectorAll("#subscribe-modal .btn-modal-cancel, .btn-modal-cancel").forEach(btn => {
    btn.addEventListener("click", closeSubscribeModal);
  });

  // Image Lightbox Modal
  const lightboxModal = document.getElementById("image-lightbox-modal");
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) {
        closeImageLightbox();
      }
    });

    const lightboxContent = lightboxModal.querySelector(".image-lightbox-content");
    if (lightboxContent) {
      lightboxContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    const lightboxCloseBtn = lightboxModal.querySelector(".image-lightbox-close-btn");
    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener("click", closeImageLightbox);
    }
  }

  // Close top navbar dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    const isInsideNavBtn = e.target.closest(".top-nav-icon-btn");
    const isInsidePanel = e.target.closest(".top-dropdown-panel");
    if (!isInsideNavBtn && !isInsidePanel) {
      closeAllTopDropdowns();
    }
  });
}

function positionDropdown(panel, btn) {
  if (!panel || !btn) return;
  const rect = btn.getBoundingClientRect();
  if (btn.id === "dispatch-log-btn") {
    panel.style.left = `${Math.max(8, rect.left)}px`;
    panel.style.right = "auto";
  } else {
    const rightOffset = window.innerWidth - rect.right;
    panel.style.left = "auto";
    panel.style.right = `${Math.max(8, rightOffset)}px`;
  }
}

function toggleDispatchLogDropdown() {
  closeAllTopDropdowns("dispatch-log-dropdown");
  const panel = document.getElementById("dispatch-log-dropdown");
  const btn = document.getElementById("dispatch-log-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
  if (isHidden) positionDropdown(panel, btn);
}

function toggleTopSearchDropdown() {
  closeAllTopDropdowns("top-search-dropdown");
  const panel = document.getElementById("top-search-dropdown");
  const btn = document.getElementById("top-navbar-search-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "block" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
  if (isHidden) {
    positionDropdown(panel, btn);
    const input = document.getElementById("top-search-input");
    if (input) input.focus();
  }
}

function toggleTopFilterDropdown() {
  closeAllTopDropdowns("top-filter-dropdown");
  const panel = document.getElementById("top-filter-dropdown");
  const btn = document.getElementById("top-navbar-filter-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
  if (isHidden) positionDropdown(panel, btn);
}

function toggleTopSortDropdown() {
  closeAllTopDropdowns("top-sort-dropdown");
  const panel = document.getElementById("top-sort-dropdown");
  const btn = document.getElementById("top-navbar-sort-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
  if (isHidden) positionDropdown(panel, btn);
}

function closeAllTopDropdowns(exceptId = null) {
  const dropdowns = ["dispatch-log-dropdown", "top-search-dropdown", "top-filter-dropdown", "top-sort-dropdown"];
  const btns = ["dispatch-log-btn", "top-navbar-search-btn", "top-navbar-filter-btn", "top-navbar-sort-btn"];

  dropdowns.forEach((id, idx) => {
    if (id !== exceptId) {
      const panel = document.getElementById(id);
      const btn = document.getElementById(btns[idx]);
      if (panel) panel.style.display = "none";
      if (btn) btn.classList.remove("active");
    }
  });
}

function handleTopInlineSearch(val) {
  searchQuery = (val || "").toLowerCase().trim();

  // Sync inputs
  const inlineInput = document.getElementById("top-inline-search-input");
  const modalInput = document.getElementById("top-search-input");
  if (inlineInput && inlineInput.value !== val) inlineInput.value = val;
  if (modalInput && modalInput.value !== val) modalInput.value = val;

  renderTimelineList();
}

function applyTopFilter(formatKey) {
  activeFormatFilter = formatKey;

  // Highlight dropdown options
  document.querySelectorAll("#top-filter-dropdown .dropdown-option, #dispatch-log-dropdown .dropdown-option").forEach(opt => {
    const filter = opt.getAttribute("data-filter") || "all";
    opt.classList.toggle("active", filter === formatKey);
  });

  // Sync category nav links
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(link => {
    const f = link.getAttribute("data-filter");
    link.classList.toggle("active", f === formatKey);
  });

  // Update dispatch log dropdown button label
  const btn = document.getElementById("dispatch-log-btn");
  if (btn) {
    const label = formatKey === "all" ? "_DISPATCH_LOG" : `_${formatKey.toUpperCase()}S`;
    btn.innerHTML = `${label} &#9660;`;
  }

  renderTimelineList();
  closeAllTopDropdowns();
}

function applyTopSort(sortOrder) {
  activeSortOrder = sortOrder;
  document.querySelectorAll("#top-sort-dropdown .dropdown-option").forEach(opt => {
    const sort = opt.getAttribute("data-sort") || "newest";
    opt.classList.toggle("active", sort === sortOrder);
  });
  renderTimelineList();
  closeAllTopDropdowns();
}

/* Modal Helper Functions */
function openSubscribeModal() {
  const subscribeBtn = document.getElementById("sidebar-subscribe-btn") || document.querySelector('a[aria-label="Subscribe"]');
  if (subscribeBtn) {
    subscribeBtn.classList.remove("subscribe-ring-vibrate");
    subscribeBtn.classList.add("subscribe-coral-active");
  }
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.showModal === "function") modal.showModal();
}

function closeSubscribeModal() {
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.close === "function") modal.close();
}

function handleSubscribeSubmit(e) {
  e.preventDefault();
  alert("[SUBSCRIPTION CONFIRMED] Transmission endpoint registered.");
  closeSubscribeModal();
}

function openImageLightbox(src, captionText) {
  const modal = document.getElementById("image-lightbox-modal");
  const img = document.getElementById("image-lightbox-img");
  const caption = document.getElementById("image-lightbox-caption");
  if (modal && img) {
    img.src = src;
    if (caption) caption.textContent = captionText || "";
    if (typeof modal.showModal === "function") modal.showModal();
  }
}

function closeImageLightbox() {
  const modal = document.getElementById("image-lightbox-modal");
  if (modal && typeof modal.close === "function") modal.close();
}

/**
 * Renders Left Column Timeline List
 */
function renderTimelineList() {
  const container = document.getElementById("timeline-list-container");
  const filterStatusLabel = document.getElementById("timeline-active-filter-label");
  if (!container) return;

  // Filter posts
  filteredTimelinePosts = ARCHIVE_POSTS.filter(post => {
    // 1. Format filter
    const fmt = (post.format || "ESSAY").toLowerCase();
    if (activeFormatFilter !== "all" && fmt !== activeFormatFilter) return false;

    // 2. Tag / Pillar Node Filter
    if (activeTagFilter) {
      const tagLower = activeTagFilter.toLowerCase();
      const pillar = (post.pillar || "").toLowerCase();
      const subtopic = (post.subtopic || "").toLowerCase();
      const tags = (post.tags || []).map(t => t.toLowerCase());
      
      const matchesPillar = pillar === tagLower;
      const matchesSubtopic = subtopic === tagLower;
      const matchesTag = tags.includes(tagLower);
      if (!matchesPillar && !matchesSubtopic && !matchesTag) return false;
    }

    // 3. Search query
    if (searchQuery !== "") {
      const title = (post.title || "").toLowerCase();
      const subtitle = (post.subtitle || "").toLowerCase();
      const excerpt = (post.excerpt || "").toLowerCase();
      const pillar = (post.pillar || "").toLowerCase();
      const tags = (post.tags || []).join(" ").toLowerCase();
      if (!title.includes(searchQuery) && !subtitle.includes(searchQuery) && !excerpt.includes(searchQuery) && !pillar.includes(searchQuery) && !tags.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  // Apply Sort Order
  if (activeSortOrder === "newest") {
    filteredTimelinePosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (activeSortOrder === "oldest") {
    filteredTimelinePosts.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (activeSortOrder === "title") {
    filteredTimelinePosts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  // Update Status Label
  if (filterStatusLabel) {
    let label = `DISPATCHES: ${filteredTimelinePosts.length} TOTAL`;
    if (activeTagFilter) label += ` // NODE: ${activeTagFilter.toUpperCase()}`;
    if (activeFormatFilter !== "all") label += ` // FORMAT: ${activeFormatFilter.toUpperCase()}`;
    filterStatusLabel.textContent = label;
  }

  if (filteredTimelinePosts.length === 0) {
    container.innerHTML = `
      <div style="padding: 3rem 1.5rem; text-align: center; color: var(--text-muted);">
        <p style="font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 0.5rem;">[ NO DISPATCHES FOUND MATCHING FILTER ]</p>
        <button type="button" onclick="clearAllFilters()" class="timeline-read-btn">[ RESET ALL FILTERS ]</button>
      </div>
    `;
    return;
  }

  const html = filteredTimelinePosts.map(post => {
    const d = new Date(post.date);
    const dayNum = !isNaN(d.getTime()) ? d.getDate() : "--";
    const monthShort = !isNaN(d.getTime()) ? d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : "---";
    const yearFull = !isNaN(d.getTime()) ? d.getFullYear() : "----";

    // Format reading time duration (without "READ:")
    let readDuration = post.read_time || "8 MIN";
    readDuration = readDuration.replace(/^READ:\s*/i, '').replace(/^READ\s+/i, '').trim().toUpperCase();

    // Image path resolution
    let imageSrc = "assets/images/turing1.png";
    if (post.image) {
      if (typeof post.image === "object" && post.image.path) {
        imageSrc = post.image.path;
      } else if (typeof post.image === "string") {
        imageSrc = post.image;
      }
    }

    return `
      <li class="timeline-item" id="timeline-item-${post.slug}">
        <!-- Column 1: Date -->
        <div class="timeline-date-col">
          <div class="timeline-date-day">${dayNum} ${monthShort}</div>
          <div class="timeline-date-year">${yearFull}</div>
        </div>

        <!-- Column 2: Center Node on Spine -->
        <div class="timeline-node-col">
          <div class="timeline-node"></div>
        </div>

        <!-- Column 3: Thumbnail Box (Fixed 120px Height, Clickable Lightbox) -->
        <div class="timeline-thumb-col">
          <div class="timeline-thumb-box" onclick="openImageLightbox('${imageSrc}', '${post.title.replace(/'/g, "\\'")}')" title="Click to view full image">
            <img src="${imageSrc}" alt="${post.title}" class="timeline-thumb-img" onerror="this.src='assets/images/turing1.png'" />
          </div>
        </div>

        <!-- Column 4: Text Content Payload -->
        <div class="timeline-content-col">
          <!-- Top Metadata: Plain text on 1 single line without chip boxes -->
          <div class="timeline-meta-top-text">
            <span class="meta-format-text">[${(post.format || "ESSAY").toUpperCase()}]</span>
            ${post.pillar ? `<span class="meta-sep-dot">•</span><span class="meta-topic-text">${post.pillar.toUpperCase()}</span>` : ''}
            ${post.subtopic ? `<span class="meta-sep-dot">•</span><span class="meta-topic-text">${post.subtopic.toUpperCase()}</span>` : ''}
          </div>

          <a href="index.html#dispatch-${post.slug}" class="timeline-title">${post.title}</a>
          ${post.excerpt ? `<p class="timeline-excerpt">${post.excerpt}</p>` : ''}

          <!-- Bottom Metadata Ordered: 1. Read Dispatch Button, 2. Duration, 3. Author -->
          <div class="timeline-meta-bottom">
            <a href="index.html#dispatch-${post.slug}" class="timeline-read-btn">[ READ DISPATCH ↗ ]</a>
            <span class="meta-sep">//</span>
            <span class="timeline-read-time">${readDuration}</span>
            <span class="meta-sep">//</span>
            <span class="timeline-author">BY: ${post.author || "Juan P. Giusepponi"}</span>
          </div>
        </div>
      </li>
    `;
  }).join("");

  container.innerHTML = `<ul class="timeline-list">${html}</ul>`;
}

function clearAllFilters() {
  activeFormatFilter = "all";
  activeTagFilter = null;
  activeNodeFilter = null;
  searchQuery = "";
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(l => l.classList.remove("active"));
  setNodeFilterUIState(false);
  renderTimelineList();
  resetNodeHighlights();
}

/**
 * ==============================================================================
 * RIGHT COLUMN: INTERACTIVE THREE.JS WEBGL 3D TAXONOMY NODE MAP ENGINE
 * ==============================================================================
 */

// Three.js Scene Global Handles
let threeScene, threeCamera, threeRenderer, threeControls;
let threeNodesGroup, threeLinesGroup, threeParticlesGroup;
let threeNodes = [];      // { mesh, labelSprite, data, initialPos, targetPos }
let threeLines = [];      // { lineMesh, fromNode, toNode, defaultColor, highlightColor }
let threeRaycaster, threeMouse;
let hoveredThreeNode = null;
let isThreeInitialized = false;

function initNodeMapCanvas() {
  canvas = document.getElementById("nodemap-canvas");
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!canvas || !wrapper) return;

  // Try initializing WebGL 3D Engine first
  if (typeof THREE !== "undefined") {
    try {
      isThreeInitialized = initThreeJSNodeMap();
      if (isThreeInitialized) return;
    } catch (e) {
      console.log("Three.js 3D WebGL initialization fallback active:", e);
    }
  }

  // Fallback 2D Canvas Engine
  init2DCanvasEngine(wrapper);
}

/**
 * ==============================================================================
 * THREE.JS WEBGL 3D ENGINE IMPLEMENTATION
 * ==============================================================================
 */

function initThreeJSNodeMap() {
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  canvas = document.getElementById("nodemap-canvas");
  if (!wrapper || !canvas || typeof THREE === "undefined") return false;

  const w = wrapper.clientWidth || 500;
  const h = wrapper.clientHeight || 500;

  // 1. Scene setup
  threeScene = new THREE.Scene();
  threeScene.fog = new THREE.FogExp2(0x121212, 0.0012);

  // 2. Camera setup
  threeCamera = new THREE.PerspectiveCamera(45, w / h, 1, 2000);
  threeCamera.position.set(0, 15, 340);

  // 3. WebGL Renderer
  threeRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  threeRenderer.setSize(w, h, false);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Attach ResizeObserver to keep canvas sized to wrapper container
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      onThreeWindowResize();
    });
    ro.observe(wrapper);
  }

  // 4. Orbit Controls (Rotation, Pan, Zoom)
  if (typeof THREE.OrbitControls !== "undefined") {
    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.rotateSpeed = 0.7;
    threeControls.zoomSpeed = 0.9;
    threeControls.minDistance = 80;
    threeControls.maxDistance = 650;
    threeControls.autoRotate = true;
    threeControls.autoRotateSpeed = 0.35;
  }

  // 5. Dual Opposite Source Lighting (Red & Neutral)
  const ambientLight = new THREE.AmbientLight(0x06060a, 4.5);
  threeScene.add(ambientLight);

  // Source 1: Vibrant Red/Coral Point Light (Top-Front-Right)
  const lightRed = new THREE.PointLight(0xe84a5f, 3.0, 550);
  lightRed.position.set(200, 150, 180);
  threeScene.add(lightRed);

  // Source 2: Neutral White Point Light (Bottom-Back-Left - Directly Opposite)
  const lightNeutral = new THREE.PointLight(0xf1f5f9, 1.3, 550);
  lightNeutral.position.set(-200, -150, -180);
  threeScene.add(lightNeutral);

  // Groups
  threeNodesGroup = new THREE.Group();
  threeLinesGroup = new THREE.Group();
  threeParticlesGroup = new THREE.Group();
  threeScene.add(threeNodesGroup);
  threeScene.add(threeLinesGroup);
  threeScene.add(threeParticlesGroup);

  // Raycasting setup
  threeRaycaster = new THREE.Raycaster();
  threeMouse = new THREE.Vector2(-999, -999);

  // Build Scene Content
  build3DStarfield();
  build3DNodeMapGraph();

  // Event Listeners
  window.addEventListener("resize", onThreeWindowResize);
  canvas.addEventListener("mousemove", onThreeMouseMove);
  canvas.addEventListener("click", onThreeMouseClick);
  canvas.addEventListener("mouseleave", onThreeMouseLeave);

  // Start 3D Render Loop
  animateThreeJS();
  return true;
}

function build3DStarfield() {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 900;
    positions[i + 1] = (Math.random() - 0.5) * 900;
    positions[i + 2] = (Math.random() - 0.5) * 900;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.35
  });

  const starfield = new THREE.Points(geometry, material);
  threeParticlesGroup.add(starfield);
}

function build3DNodeMapGraph() {
  // Clear previous meshes & lines
  while (threeNodesGroup.children.length > 0) threeNodesGroup.remove(threeNodesGroup.children[0]);
  while (threeLinesGroup.children.length > 0) threeLinesGroup.remove(threeLinesGroup.children[0]);
  threeNodes = [];
  threeLines = [];

  if (!ARCHIVE_POSTS || ARCHIVE_POSTS.length === 0) return;

  // 1. Core Root Node: UNTITLED.JPG at origin
  const rootData = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    color: "#E84A5F",
    postsCount: ARCHIVE_POSTS.length
  };

  const rootMesh = createCrystalNodeMesh(16, 0xE84A5F, 0.4);
  rootMesh.position.set(0, 0, 0);
  threeNodesGroup.add(rootMesh);

  const rootSprite = create3DTextSprite("UNTITLED.JPG", "#FFFFFF", 26);
  rootSprite.position.set(0, -22, 0);
  rootMesh.add(rootSprite);

  const rootNodeItem = { mesh: rootMesh, labelSprite: rootSprite, data: rootData, neighbors: new Set() };
  threeNodes.push(rootNodeItem);

  // 2. Extract All 4 Pillars as major node vertices
  const pillarSet = new Set();
  ARCHIVE_POSTS.forEach(p => {
    if (p.pillar) pillarSet.add(p.pillar);
  });
  const pillarList = Array.from(pillarSet);

  const pillarNodeMap = {}; // name -> nodeItem
  const R_PILLAR = 85;
  const pillarPositions = [
    new THREE.Vector3( R_PILLAR * 0.707,  R_PILLAR * 0.707, 0),
    new THREE.Vector3(-R_PILLAR * 0.707,  R_PILLAR * 0.707, 0),
    new THREE.Vector3( 0, -R_PILLAR * 0.707,  R_PILLAR * 0.707),
    new THREE.Vector3( 0, -R_PILLAR * 0.707, -R_PILLAR * 0.707)
  ];

  pillarList.forEach((pilName, idx) => {
    const pos = pillarPositions[idx % pillarPositions.length];
    const postsInPillar = ARCHIVE_POSTS.filter(p => p.pillar === pilName);
    const pillarRadius = Math.min(18, 9.5 + postsInPillar.length * 2.2);

    const pillarData = {
      id: `pillar_${idx}`,
      label: pilName,
      type: "pillar",
      color: "#FF6579",
      postsCount: postsInPillar.length,
      postSlugs: postsInPillar.map(p => p.slug)
    };

    const pillarMesh = createCrystalNodeMesh(pillarRadius, 0xFF6579, 0.28);
    pillarMesh.position.copy(pos);
    threeNodesGroup.add(pillarMesh);

    const pillarSprite = create3DTextSprite(pilName.toUpperCase(), "#FFA0AD", 22);
    pillarSprite.position.set(0, -(pillarRadius + 8), 0);
    pillarMesh.add(pillarSprite);

    const pillarNodeItem = { mesh: pillarMesh, labelSprite: pillarSprite, data: pillarData, neighbors: new Set() };
    threeNodes.push(pillarNodeItem);
    pillarNodeMap[pilName] = pillarNodeItem;

    // Connect Root to Pillar
    rootNodeItem.neighbors.add(pillarNodeItem);
    pillarNodeItem.neighbors.add(rootNodeItem);
    create3DConnectionLine(rootNodeItem, pillarNodeItem, 0x993344, 0xe84a5f);
  });

  // 3. Extract Unique Tags across the portfolio
  const uniqueTagMap = {}; // cleanName -> { name, pillars: Set, posts: [], count: 0 }
  ARCHIVE_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(t => {
        const clean = String(t).trim().toLowerCase().replace(/^#/, "");
        if (!clean) return;
        if (!uniqueTagMap[clean]) {
          uniqueTagMap[clean] = { name: clean, pillars: new Set(), posts: [], count: 0 };
        }
        uniqueTagMap[clean].count++;
        uniqueTagMap[clean].posts.push(p);
        if (p.pillar) uniqueTagMap[clean].pillars.add(p.pillar);
      });
    }
  });

  const tagList = Object.values(uniqueTagMap);
  const tagNodeMap = {}; // cleanName -> nodeItem
  const totalTags = tagList.length;
  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
  const GOLDEN_ANGLE = 2 * Math.PI * (1 - 1 / GOLDEN_RATIO);

  tagList.forEach((tagObj, idx) => {
    // 3D Fibonacci Sphere sampling for ultra-harmonious spherical distribution
    const y = 1 - (idx / Math.max(1, totalTags - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * idx;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const fibVec = new THREE.Vector3(x, y, z).normalize();

    // Gently blend 30% with direction toward associated Pillar(s)
    const pillars = Array.from(tagObj.pillars);
    const targetPillarNodes = pillars.map(pName => pillarNodeMap[pName]).filter(Boolean);

    if (targetPillarNodes.length > 0) {
      const pillarDir = new THREE.Vector3(0, 0, 0);
      targetPillarNodes.forEach(pn => pillarDir.add(pn.mesh.position));
      pillarDir.normalize();
      fibVec.lerp(pillarDir, 0.30).normalize();
    }

    // Outer spherical shell radius: 145 to 170 units from root
    const tagDist = 145 + (idx % 5) * 6;
    const finalPos = fibVec.multiplyScalar(tagDist);

    // Node radius scales directly with post occurrence count
    const tagRadius = Math.min(15, 5.5 + Math.pow(tagObj.count, 0.75) * 3.5);
    const tagData = {
      id: `tag_${idx}`,
      label: `#${tagObj.name}`,
      rawTag: tagObj.name,
      type: "tag",
      color: "#D4D4D4",
      postsCount: tagObj.count,
      pillars: pillars
    };

    const tagMesh = createCrystalNodeMesh(tagRadius, 0xD4D4D4, 0.16);
    tagMesh.position.copy(finalPos);
    threeNodesGroup.add(tagMesh);

    const labelFontSize = Math.min(18, 12 + tagRadius * 0.45);
    const tagSprite = create3DTextSprite(`#${tagObj.name}`, "#F5F5F5", labelFontSize);
    tagSprite.position.set(0, -(tagRadius + 7), 0);
    tagMesh.add(tagSprite);

    const tagNodeItem = { mesh: tagMesh, labelSprite: tagSprite, data: tagData, neighbors: new Set() };
    threeNodes.push(tagNodeItem);
    tagNodeMap[tagObj.name] = tagNodeItem;

    // Connect Tag to ALL its Pillars
    targetPillarNodes.forEach(pNode => {
      tagNodeItem.neighbors.add(pNode);
      pNode.neighbors.add(tagNodeItem);
      create3DConnectionLine(pNode, tagNodeItem, 0x333333, 0xE84A5F);
    });
  });

  // 4. Connect Tags to Tags if they co-occur in the same post (Obsidian Network Cloud)
  ARCHIVE_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags) && p.tags.length > 1) {
      const cleanTags = p.tags.map(t => String(t).trim().toLowerCase().replace(/^#/, "")).filter(Boolean);
      for (let i = 0; i < cleanTags.length; i++) {
        for (let j = i + 1; j < cleanTags.length; j++) {
          const nodeA = tagNodeMap[cleanTags[i]];
          const nodeB = tagNodeMap[cleanTags[j]];
          if (nodeA && nodeB && nodeA !== nodeB && !nodeA.neighbors.has(nodeB)) {
            nodeA.neighbors.add(nodeB);
            nodeB.neighbors.add(nodeA);
            create3DConnectionLine(nodeA, nodeB, 0x222226, 0xFF8484);
          }
        }
      }
    }
  });
}

function createCrystalNodeMesh(radius, colorHex, emissiveIntensity = 0.3) {
  // Faceted 3D crystalline quartz shard geometry
  const geo = new THREE.IcosahedronGeometry(radius, 2);
  const pos = geo.attributes.position;
  const vec = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    vec.fromBufferAttribute(pos, i);
    const noise = Math.sin(vec.x * 0.4 + vec.y * 0.6) * Math.cos(vec.z * 0.5) * (radius * 0.22);
    vec.normalize().multiplyScalar(radius + noise);
    pos.setXYZ(i, vec.x, vec.y, vec.z);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: emissiveIntensity,
    roughness: 0.45,
    metalness: 0.1,
    flatShading: true
  });
  return new THREE.Mesh(geo, mat);
}

function splitTextIntoLines(text, maxCharsPerLine = 22) {
  if (!text || text.length <= maxCharsPerLine) return [text];

  // If text contains a comma (e.g. "PHILOSOPHY OF THE IMAGE, TECH & VISUAL CULTURE"), split by comma
  if (text.includes(",")) {
    const parts = text.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      const line1 = parts[0] + ",";
      const line2 = parts.slice(1).join(", ");
      return [line1, line2];
    }
  }

  // Otherwise split by space
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(w => {
    if ((currentLine + " " + w).trim().length <= maxCharsPerLine || !currentLine) {
      currentLine = currentLine ? currentLine + " " + w : w;
    } else {
      lines.push(currentLine);
      currentLine = w;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function create3DTextSprite(text, colorHexStr, fontSize = 20) {
  const lines = splitTextIntoLines(text, 22);
  const lineCount = lines.length;

  const canvasWidth = 440;
  const canvasHeight = lineCount > 1 ? 110 : 60;

  const canvasText = document.createElement("canvas");
  canvasText.width = canvasWidth;
  canvasText.height = canvasHeight;

  const tCtx = canvasText.getContext("2d");
  tCtx.font = `600 ${fontSize}px 'Azeret Mono', monospace`;
  tCtx.fillStyle = colorHexStr;
  tCtx.textAlign = "center";
  tCtx.textBaseline = "middle";

  const lineHeight = fontSize * 1.25;
  const startY = (canvasHeight / 2) - ((lineCount - 1) * lineHeight / 2);

  lines.forEach((l, i) => {
    tCtx.fillText(l, canvasWidth / 2, startY + (i * lineHeight));
  });

  const texture = new THREE.CanvasTexture(canvasText);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);

  const baseScaleY = lineCount > 1 ? 22 : 14;
  const aspect = canvasWidth / canvasHeight;
  sprite.scale.set(baseScaleY * aspect, baseScaleY, 1);
  return sprite;
}

function create3DConnectionLine(fromItem, toItem, defaultColorHex, highlightColorHex) {
  const points = [];
  points.push(fromItem.mesh.position);
  points.push(toItem.mesh.position);

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: defaultColorHex,
    transparent: true,
    opacity: 0.4,
    linewidth: 1
  });

  const lineMesh = new THREE.Line(geometry, material);
  threeLinesGroup.add(lineMesh);

  threeLines.push({
    mesh: lineMesh,
    fromItem: fromItem,
    toItem: toItem,
    defaultColorHex: defaultColorHex,
    highlightColorHex: highlightColorHex
  });
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  if (threeControls) threeControls.update();

  // Subtle background starfield rotation
  if (threeParticlesGroup) {
    threeParticlesGroup.rotation.y += 0.0003;
  }

  // Gentle rotation of 3D crystalline shard nodes to reflect lights across facets
  if (threeNodes && threeNodes.length > 0) {
    threeNodes.forEach((n, idx) => {
      if (n.mesh) {
        n.mesh.rotation.y += 0.003 * (idx % 2 === 0 ? 1 : -1);
        n.mesh.rotation.x += 0.0015 * (idx % 3 === 0 ? 1 : -1);
      }
    });
  }

  // 3D Raycasting hover update
  updateThreeRaycasting();

  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

function updateThreeRaycasting() {
  if (!threeRaycaster || !threeCamera || !threeNodesGroup) return;

  threeRaycaster.setFromCamera(threeMouse, threeCamera);
  const meshesToIntersect = threeNodes.map(n => n.mesh);
  const intersects = threeRaycaster.intersectObjects(meshesToIntersect);

  let newHovered = null;
  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    newHovered = threeNodes.find(n => n.mesh === hitMesh) || null;
  }

  if (hoveredThreeNode !== newHovered) {
    hoveredThreeNode = newHovered;

    // Apply new hover effect: scale up hovered node + all neighbor nodes in network
    threeNodes.forEach(n => {
      if (hoveredThreeNode && (n === hoveredThreeNode || (hoveredThreeNode.neighbors && hoveredThreeNode.neighbors.has(n)))) {
        const s = n === hoveredThreeNode ? 1.45 : 1.25;
        n.mesh.scale.set(s, s, s);
      } else {
        n.mesh.scale.set(1, 1, 1);
      }
    });

    if (hoveredThreeNode) {
      if (canvas) canvas.style.cursor = "pointer";
    } else {
      if (canvas) canvas.style.cursor = "default";
    }

    // Update lines highlight
    threeLines.forEach(l => {
      const isConn = hoveredThreeNode && (l.fromItem === hoveredThreeNode || l.toItem === hoveredThreeNode);
      l.mesh.material.color.setHex(isConn ? l.highlightColorHex : l.defaultColorHex);
      l.mesh.material.opacity = isConn ? 0.95 : 0.25;
    });

    // Update Dock Metadata
    updateThreeDockMetadata(hoveredThreeNode);
  }
}

function updateThreeDockMetadata(nodeItem) {
  const dockTitle = document.getElementById("dock-node-title");
  const dockDesc = document.getElementById("dock-node-desc");
  if (!dockTitle || !dockDesc) return;

  if (nodeItem) {
    const d = nodeItem.data;
    dockTitle.textContent = `[ 3D NODE: ${d.label} ]`;
    if (d.type === "root") {
      dockDesc.textContent = `Central taxonomy core connecting all dispatches across 4 primary pillars.`;
    } else if (d.type === "pillar") {
      dockDesc.textContent = `Pillar category with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}. Click to filter timeline.`;
    } else {
      const pStr = (d.pillars || []).join(" • ");
      dockDesc.textContent = `Tag node with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}${pStr ? ' across ' + pStr : ''}. Click node to filter timeline.`;
    }
  } else if (!activeNodeFilter) {
    dockTitle.textContent = "[ 3D TAGS CLOUD ACTIVE ]";
    dockDesc.textContent = "Drag to rotate 3D constellation. Scroll to zoom. Hover over nodes to inspect network connections. Click to filter.";
  }
}

function onThreeMouseMove(e) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  threeMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  threeMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onThreeMouseClick() {
  if (!hoveredThreeNode) return;

  const clickedData = hoveredThreeNode.data;

  if (activeNodeFilter === clickedData) {
    // Toggle off
    activeNodeFilter = null;
    activeTagFilter = null;
    setNodeFilterUIState(false);
  } else {
    activeNodeFilter = clickedData;
    if (clickedData.type === "pillar") {
      activeTagFilter = clickedData.label;
    } else if (clickedData.type === "tag") {
      activeTagFilter = clickedData.rawTag;
    } else {
      activeTagFilter = null;
    }

    if (activeTagFilter) {
      setNodeFilterUIState(true, activeTagFilter);
    } else {
      setNodeFilterUIState(false);
    }
  }

  renderTimelineList();
}

function onThreeMouseLeave() {
  threeMouse.set(-999, -999);
}

function onThreeWindowResize() {
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!wrapper || !threeRenderer || !threeCamera) return;
  const nw = wrapper.clientWidth;
  const nh = wrapper.clientHeight;
  if (nw === 0 || nh === 0) return;
  threeCamera.aspect = nw / nh;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(nw, nh, false);
}

/**
 * ==============================================================================
 * FALLBACK 2D CANVAS ENGINE IMPLEMENTATION
 * ==============================================================================
 */

function init2DCanvasEngine(wrapper) {
  ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("mouseleave", handleCanvasMouseLeave);

  startNodeAnimationLoop();
}

function buildNodeMapData() {
  if (isThreeInitialized) {
    build3DNodeMapGraph();
    return;
  }

  if (!canvas) return;

  const w = canvas.width || 500;
  const h = canvas.height || 500;
  const cx = w / 2;
  const cy = h / 2;

  nodes = [];
  connections = [];

  // Core Central Root Node
  const rootNode = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    x: cx,
    y: cy,
    vx: 0,
    vy: 0,
    radius: 18,
    color: "#E84A5F",
    postsCount: ARCHIVE_POSTS.length
  };
  nodes.push(rootNode);

  // 1. Extract All 4 Pillars
  const pillarSet = new Set();
  ARCHIVE_POSTS.forEach(p => { if (p.pillar) pillarSet.add(p.pillar); });
  const pillarList = Array.from(pillarSet);

  const pillarNodeMap = {};
  const pillarCount = pillarList.length;

  pillarList.forEach((pilName, idx) => {
    const angle = (idx / Math.max(1, pillarCount)) * Math.PI * 2;
    const distance = Math.min(w, h) * 0.28;
    const px = cx + Math.cos(angle) * distance;
    const py = cy + Math.sin(angle) * distance;

    const postsInPillar = ARCHIVE_POSTS.filter(p => p.pillar === pilName);
    const pillarRadius = Math.min(18, 9.5 + postsInPillar.length * 2.2);

    const pillarNode = {
      id: `pillar_${idx}`,
      label: pilName,
      type: "pillar",
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: pillarRadius,
      color: "#FF6579",
      postsCount: postsInPillar.length,
      postSlugs: postsInPillar.map(p => p.slug)
    };
    nodes.push(pillarNode);
    pillarNodeMap[pilName] = pillarNode;
    connections.push({ from: rootNode, to: pillarNode, weight: 2 });
  });

  // 2. Extract Unique Tags
  const uniqueTagMap = {};
  ARCHIVE_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(t => {
        const clean = String(t).trim().toLowerCase().replace(/^#/, "");
        if (!clean) return;
        if (!uniqueTagMap[clean]) {
          uniqueTagMap[clean] = { name: clean, pillars: new Set(), count: 0 };
        }
        uniqueTagMap[clean].count++;
        if (p.pillar) uniqueTagMap[clean].pillars.add(p.pillar);
      });
    }
  });

  const tagList = Object.values(uniqueTagMap);
  const tagNodeMap = {};

  tagList.forEach((tagObj, idx) => {
    const pillars = Array.from(tagObj.pillars);
    const targetPillarNodes = pillars.map(pName => pillarNodeMap[pName]).filter(Boolean);

    let tx = cx, ty = cy;
    if (targetPillarNodes.length > 0) {
      let sumX = 0, sumY = 0;
      targetPillarNodes.forEach(pn => { sumX += pn.x; sumY += pn.y; });
      tx = sumX / targetPillarNodes.length;
      ty = sumY / targetPillarNodes.length;
    }

    const angle = (idx / Math.max(1, tagList.length)) * Math.PI * 2;
    const distOffset = 65 + (idx % 6) * 15;
    tx += Math.cos(angle) * distOffset;
    ty += Math.sin(angle) * distOffset;

    const tagRadius = Math.min(15, 5.5 + Math.pow(tagObj.count, 0.75) * 3.5);
    const tagNode = {
      id: `tag_${idx}`,
      label: `#${tagObj.name}`,
      rawTag: tagObj.name,
      type: "tag",
      x: tx,
      y: ty,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: tagRadius,
      color: "#D4D4D4",
      postsCount: tagObj.count,
      pillars: pillars
    };
    nodes.push(tagNode);
    tagNodeMap[tagObj.name] = tagNode;

    targetPillarNodes.forEach(pn => {
      connections.push({ from: pn, to: tagNode, weight: 1 });
    });
  });

  // 3. Connect Co-occurring Tags in 2D
  ARCHIVE_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags) && p.tags.length > 1) {
      const cleanTags = p.tags.map(t => String(t).trim().toLowerCase().replace(/^#/, "")).filter(Boolean);
      for (let i = 0; i < cleanTags.length; i++) {
        for (let j = i + 1; j < cleanTags.length; j++) {
          const nodeA = tagNodeMap[cleanTags[i]];
          const nodeB = tagNodeMap[cleanTags[j]];
          if (nodeA && nodeB && nodeA !== nodeB) {
            connections.push({ from: nodeA, to: nodeB, weight: 1 });
          }
        }
      }
    }
  });
}

function startNodeAnimationLoop() {
  function animate() {
    if (ctx && canvas) {
      updatePhysics();
      drawNodeGraph();
    }
    animFrameId = requestAnimationFrame(animate);
  }

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animate();
}

function updatePhysics() {
  if (!canvas || nodes.length === 0) return;

  const w = canvas.width;
  const h = canvas.height;

  nodes.forEach(n => {
    if (n.type === "root") return; // Root stays centered

    n.x += n.vx;
    n.y += n.vy;

    // Soft bounds bouncing
    const margin = 35;
    if (n.x < margin || n.x > w - margin) n.vx *= -1;
    if (n.y < margin || n.y > h - margin) n.vy *= -1;

    // Slight dampening & subtle floating
    n.vx += (Math.random() - 0.5) * 0.02;
    n.vy += (Math.random() - 0.5) * 0.02;
    n.vx *= 0.98;
    n.vy *= 0.98;
  });
}

function drawNodeGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Lines
  connections.forEach(conn => {
    const isHighlighted = (hoveredNode && (conn.from === hoveredNode || conn.to === hoveredNode)) ||
                          (activeNodeFilter && (conn.from === activeNodeFilter || conn.to === activeNodeFilter));

    ctx.beginPath();
    ctx.moveTo(conn.from.x, conn.from.y);
    ctx.lineTo(conn.to.x, conn.to.y);
    ctx.lineWidth = isHighlighted ? 2.5 : 1;
    ctx.strokeStyle = isHighlighted ? "rgba(232, 74, 95, 0.85)" : "rgba(255, 255, 255, 0.12)";
    ctx.stroke();
  });

  // Draw Nodes
  nodes.forEach(node => {
    const isHovered = hoveredNode === node;
    const isActive = activeNodeFilter === node;
    const isConnected = hoveredNode && connections.some(c => (c.from === hoveredNode && c.to === node) || (c.to === hoveredNode && c.from === node));

    const r = isHovered || isActive ? node.radius * 1.3 : node.radius;

    // Glow Effect
    if (isHovered || isActive || isConnected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = node.type === "tag" ? "rgba(184, 184, 184, 0.25)" : "rgba(232, 74, 95, 0.3)";
      ctx.fill();
    }

    // Node Circle Outer Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? "#FFFFFF" : "#141414";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isHovered || isActive ? "#FFFFFF" : node.color;
    ctx.stroke();

    // Inner Dot
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Text Label (Supports Multi-line)
    ctx.font = `${isHovered || isActive ? "600" : "400"} 10px 'Azeret Mono', monospace`;
    ctx.fillStyle = isHovered || isActive ? "#FFFFFF" : (isConnected ? "#FFFFFF" : "#E2E8F0");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelLines = splitTextIntoLines(node.label, 20);
    labelLines.forEach((l, idx) => {
      ctx.fillText(l, node.x, node.y + r + 14 + (idx * 13));
    });
  });
}

function handleCanvasMouseMove(e) {
  if (!canvas || nodes.length === 0) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let found = null;
  nodes.forEach(n => {
    const dist = Math.hypot(n.x - mx, n.y - my);
    if (dist < n.radius + 10) {
      found = n;
    }
  });

  hoveredNode = found;
  canvas.style.cursor = found ? "pointer" : "default";

  // Update Dock Text
  const dockTitle = document.getElementById("dock-node-title");
  const dockDesc = document.getElementById("dock-node-desc");

  if (found && dockTitle && dockDesc) {
    dockTitle.textContent = `[ NODE: ${found.label} ]`;
    if (found.type === "root") {
      dockDesc.textContent = `Central taxonomy core connecting ${ARCHIVE_POSTS.length} dispatches across conceptual pillars.`;
    } else if (found.type === "pillar") {
      dockDesc.textContent = `Pillar category with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter timeline.`;
    } else {
      dockDesc.textContent = `Conceptual tag node with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter timeline.`;
    }
  } else if (!activeNodeFilter && dockTitle && dockDesc) {
    dockTitle.textContent = "[ 3D TAGS CLOUD ACTIVE ]";
    dockDesc.textContent = "Hover over any tag or pillar node to highlight connected dispatches. Click to filter timeline.";
  }
}

function handleCanvasClick(e) {
  if (!hoveredNode) return;

  if (activeNodeFilter === hoveredNode) {
    // Toggle off
    activeNodeFilter = null;
    activeTagFilter = null;
    setNodeFilterUIState(false);
  } else {
    activeNodeFilter = hoveredNode;
    if (hoveredNode.type === "pillar") {
      activeTagFilter = hoveredNode.label;
    } else if (hoveredNode.type === "tag") {
      activeTagFilter = hoveredNode.rawTag;
    } else {
      activeTagFilter = null;
    }

    if (activeTagFilter) {
      setNodeFilterUIState(true, activeTagFilter);
    } else {
      setNodeFilterUIState(false);
    }
  }

  renderTimelineList();
}

function handleCanvasMouseLeave() {
  hoveredNode = null;
}

function resetNodeHighlights() {
  activeNodeFilter = null;
  hoveredNode = null;
}

