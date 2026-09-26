/* ==============================================================================
   UNTITLED.JPG — CHRONOLOGICAL ARCHIVE ENGINE (js/archive.js)
   Handles:
   - Left 50% Timeline Axis with 120px thumbnails & text metadata
   - Right 50% Empty Panel (Cleared for future iteration)
   ============================================================================== */

let ARCHIVE_POSTS = [];
let filteredTimelinePosts = [];
let activeFormatFilter = "all";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  initArchiveApp();
});

function initArchiveApp() {
  if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
    ingestArchivePosts(window.DYNAMIC_POSTS);
  }

  fetchArchivePostsJson();
  initArchiveListeners();
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

function initArchiveListeners() {
  // Search input
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
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

    // 2. Search query
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

  // Update Status Label
  if (filterStatusLabel) {
    let label = `DISPATCHES: ${filteredTimelinePosts.length} TOTAL`;
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

        <!-- Column 3: Thumbnail Box (Fixed 120px Height) -->
        <div class="timeline-thumb-col">
          <div class="timeline-thumb-box">
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
  searchQuery = "";
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(l => l.classList.remove("active"));
  renderTimelineList();
}
