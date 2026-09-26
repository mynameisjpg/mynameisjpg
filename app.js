/* ==============================================================================
   UNTITLED.JPG — DYNAMIC CLIENT APPLICATION & CONTENT HYDRATION
   Brand: Juan Pablo Giusepponi — "Overthinking Undervalued Means"
   ============================================================================== */

/**
 * In-Memory Post Store
 * Hydrated dynamically from posts.js (window.DYNAMIC_POSTS) and posts.json
 */
let POSTS_DATABASE = {};

function ingestPostList(postsArray) {
  if (!Array.isArray(postsArray)) return;
  postsArray.forEach(p => {
    const key = p.slug || p.id || p.sys_id;
    if (key) {
      POSTS_DATABASE[key] = p;
      if (p.sys_id) POSTS_DATABASE[p.sys_id] = p;
      if (p.slug) POSTS_DATABASE[p.slug] = p;
      if (p.id) POSTS_DATABASE[p.id] = p;

      // Map static/legacy card data-id aliases
      const s = (p.slug || "").toLowerCase();
      if (s.includes("turing")) {
        POSTS_DATABASE["post-turing"] = p;
        POSTS_DATABASE["turing"] = p;
      }
      if (s.includes("foucault")) {
        POSTS_DATABASE["post-foucault"] = p;
        POSTS_DATABASE["foucault"] = p;
      }
      if (s.includes("jepa") || s.includes("lecun")) {
        POSTS_DATABASE["post-jepa"] = p;
        POSTS_DATABASE["jepa"] = p;
      }
      if (s.includes("excavating")) {
        POSTS_DATABASE["post-excavating"] = p;
        POSTS_DATABASE["excavating"] = p;
      }
    }
  });
}

// Ingest immediate global feed if loaded via posts.js (Works 100% offline & on file:///)
if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
  ingestPostList(window.DYNAMIC_POSTS);
}

let activePostId = "";
let activeFilter = "all";
let activeSort = "recent";
let searchQuery = "";

let matrixVisibleCount = 9;
const MATRIX_BATCH_SIZE = 9;
let matrixObserver = null;


/**
 * Filter & Sort Helper for Dispatches
 * Rules enforced:
 * 1. Only "published" status dispatches (excludes "draft" or "archived").
 * 2. Featured posts ("featured: true") take priority / sort to top.
 * 3. Applies format filter, search query, and selected sort order.
 */
function getFilteredAndSortedPosts() {
  const uniquePosts = [];
  const seen = new Set();

  Object.values(POSTS_DATABASE).forEach(post => {
    const uniqueKey = post.slug || post.id || post.sys_id;
    const statusStr = (post.status || "published").toLowerCase();
    const isPublished = statusStr === "published" || statusStr === "active";
    if (uniqueKey && !seen.has(uniqueKey) && isPublished) {
      seen.add(uniqueKey);
      uniquePosts.push(post);
    }
  });

  // Filter by Format & Search Query
  let filtered = uniquePosts.filter(post => {
    const format = (post.format || "ESSAY").toLowerCase();
    if (activeFilter !== "all" && format !== activeFilter) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (post.title || "").toLowerCase().includes(q);
      const matchSubtitle = (post.subtitle || "").toLowerCase().includes(q);
      const matchExcerpt = (post.excerpt || "").toLowerCase().includes(q);
      const matchPillar = (post.pillar || "").toLowerCase().includes(q);
      const matchSubtopic = (post.subtopic || "").toLowerCase().includes(q);
      const matchCategory = (post.category || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSubtitle && !matchExcerpt && !matchPillar && !matchSubtopic && !matchCategory) {
        return false;
      }
    }
    return true;
  });

  // Sort: Featured posts first, then secondary sort
  filtered.sort((a, b) => {
    const isFeatA = Boolean(a.featured);
    const isFeatB = Boolean(b.featured);
    if (isFeatA && !isFeatB) return -1;
    if (!isFeatA && isFeatB) return 1;

    if (activeSort === "recent") {
      return (b.date || "").localeCompare(a.date || "");
    } else if (activeSort === "oldest") {
      return (a.date || "").localeCompare(b.date || "");
    } else if (activeSort === "readtime") {
      const parseTime = (str) => parseInt((str || "").replace(/\D/g, "")) || 0;
      return parseTime(b.read_time) - parseTime(a.read_time);
    } else if (activeSort === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  return filtered;
}

/**
 * Fallback Geometric Art Vectors for Card Matrix
 */
const ART_FALLBACKS = {
  coral: `<svg class="card-art-svg" viewBox="0 0 180 230"><rect width="180" height="230" fill="#E84A5F"/><rect x="25" y="30" width="65" height="55" fill="#C73649"/><rect x="105" y="45" width="50" height="105" fill="#FF7084"/><ellipse cx="78" cy="130" rx="30" ry="42" fill="#170508"/></svg>`,
  charcoal: `<svg class="card-art-svg" viewBox="0 0 180 255"><rect width="180" height="255" fill="#181818"/><path d="M90,35 Q130,55 125,120 Q120,185 145,255 L35,255 Q60,185 55,120 Q50,55 90,35 Z" fill="#757575"/><ellipse cx="90" cy="85" rx="24" ry="34" fill="#E0E0E0"/><rect x="150" y="30" width="9" height="9" fill="#E84A5F"/></svg>`,
  eye: `<svg class="card-art-svg" viewBox="0 0 180 205"><rect width="180" height="205" fill="#191919"/><ellipse cx="90" cy="85" rx="45" ry="60" fill="#8E8E8E"/><path d="M72,65 Q88,62 104,65 Q100,115 88,128 Q76,115 72,65 Z" fill="#E8E8E8"/></svg>`,
  circle: `<svg class="card-art-svg" viewBox="0 0 180 185"><rect width="180" height="185" fill="#1B1B1B"/><ellipse cx="90" cy="92" rx="55" ry="36" fill="#808080"/><ellipse cx="90" cy="92" rx="45" ry="30" fill="#CCCCCC"/><circle cx="90" cy="92" r="22" fill="#141414"/><circle cx="90" cy="92" r="12" fill="#E84A5F"/></svg>`
};

/**
 * Dynamically Fetch posts.json (Live HTTP Server / Production Build)
 */
async function loadDynamicPosts() {
  // If already populated by posts.js, set default activePostId if needed
  if (Object.keys(POSTS_DATABASE).length > 0 && !POSTS_DATABASE[activePostId]) {
    activePostId = Object.keys(POSTS_DATABASE)[0];
  }

  try {
    const res = await fetch("posts.json?t=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        ingestPostList(data);
        console.log(`[UNTITLED.JPG] Loaded ${data.length} dispatches live from posts.json`);
      }
    }
  } catch (err) {
    // Offline / file protocol fallback (already populated by posts.js)
    console.log("[UNTITLED.JPG] Running with direct script posts feed.");
  }

  // Check URL Hash for deep-link
  const hash = (typeof window !== "undefined" && window.location && window.location.hash) ? window.location.hash.replace("#", "") : "";
  if (hash && POSTS_DATABASE[hash]) {
    activePostId = hash;
  } else {
    activePostId = Object.keys(POSTS_DATABASE)[0] || "2026-09-25-turing-queer-ai";
  }

  // Render Matrix Cards and Initial Reader Pane
  renderCardMatrix(true);
  selectAndRenderPost(activePostId);
}

/**
 * Dynamically Render the Asymmetric Card Grid Matrix
 */
function renderCardMatrix(resetPagination = true) {
  const container = document.getElementById("card-matrix");
  if (!container) return;

  if (resetPagination) {
    matrixVisibleCount = MATRIX_BATCH_SIZE;
  }

  const allPosts = getFilteredAndSortedPosts();

  if (allPosts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);">
        [NO DISPATCHES FOUND MATCHING SELECTION]
        <br><br>
        <button type="button" onclick="resetMatrixFilters()" style="background: rgba(232,74,95,0.15); border: 1px solid var(--accent-coral); color: var(--text-bright); padding: 0.4rem 0.8rem; font-family: inherit; font-size: 0.72rem; cursor: pointer; border-radius: 2px;">
          RESET FILTERS
        </button>
      </div>
    `;
    updateMatrixSentinel(0, 0);
    return;
  }

  const visiblePosts = allPosts.slice(0, matrixVisibleCount);

  const ratios = ["h-tall-1", "h-tall-2", "h-med", "h-square", "h-wide", "h-tall-1"];
  const fallbackArts = ["coral", "charcoal", "eye", "circle", "charcoal", "coral"];

  container.innerHTML = visiblePosts.map((post, idx) => {
    const key = post.slug || post.id || post.sys_id;
    const ratio = post.aspect_ratio || ratios[idx % ratios.length];
    const format = (post.format || "ESSAY").toLowerCase();
    const isEssay = format === "essay";
    const isFeatured = Boolean(post.featured);
    const artKey = fallbackArts[idx % fallbackArts.length];
    const isSelected = key === activePostId || post.sys_id === activePostId;

    return `
      <article class="grid-card ${isFeatured ? 'card-featured' : ''} ${isSelected ? 'selected-active' : ''}" data-id="${key}" data-format="${format}" tabindex="0" role="button" aria-pressed="${isSelected}">
        <div class="card-art-box ${ratio}">
          <span class="card-type-chip ${isEssay ? 'chip-essay' : ''}">[${post.format}]</span>
          ${isFeatured ? `<span class="card-featured-badge">★ FEATURED</span>` : ''}
          ${post.image ? `
            <img src="${post.image}" alt="${post.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none;">${ART_FALLBACKS[artKey]}</div>
          ` : ART_FALLBACKS[artKey]}
          <div class="hover-meta-reveal">
            <span class="meta-sub">${post.date} • ${post.read_time} • ${post.pillar || 'DISPATCH'}</span>
          </div>
        </div>
        <h2 class="card-caption">${post.title}</h2>
      </article>
    `;
  }).join("");

  // Re-attach Click & Key Event Handlers
  const cards = container.querySelectorAll(".grid-card");
  cards.forEach(card => {
    const handler = () => {
      const postId = card.getAttribute("data-id");
      selectAndRenderPost(postId);
    };
    card.addEventListener("click", handler);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  });

  updateMatrixSentinel(visiblePosts.length, allPosts.length);
}

/**
 * Infinite Scroll Sentinel Status & Observer
 */
function updateMatrixSentinel(loadedCount, totalCount) {
  let sentinel = document.getElementById("matrix-sentinel");
  if (!sentinel) {
    const matrixCol = document.querySelector(".matrix-column");
    if (matrixCol) {
      sentinel = document.createElement("div");
      sentinel.id = "matrix-sentinel";
      sentinel.className = "matrix-sentinel-loader";
      matrixCol.appendChild(sentinel);
    }
  }

  if (!sentinel) return;

  if (loadedCount === 0) {
    sentinel.style.display = "none";
    return;
  }

  sentinel.style.display = "flex";
  if (loadedCount < totalCount) {
    sentinel.innerHTML = `<span class="sentinel-text">[ SCROLL FOR MORE DISPATCHES • ${loadedCount} OF ${totalCount} LOADED ]</span>`;
    setupSentinelObserver();
  } else {
    sentinel.innerHTML = `<span class="sentinel-text">[ ALL DISPATCHES LOADED • ${totalCount} TOTAL ]</span>`;
    if (matrixObserver) {
      matrixObserver.disconnect();
      matrixObserver = null;
    }
  }
}

function setupSentinelObserver() {
  if (matrixObserver) matrixObserver.disconnect();

  const sentinel = document.getElementById("matrix-sentinel");
  if (!sentinel) return;

  if ("IntersectionObserver" in window) {
    matrixObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const allPosts = getFilteredAndSortedPosts();
          if (matrixVisibleCount < allPosts.length) {
            matrixVisibleCount += MATRIX_BATCH_SIZE;
            renderCardMatrix(false);
          }
        }
      });
    }, { rootMargin: "200px" });

    matrixObserver.observe(sentinel);
  }
}

function resetMatrixFilters() {
  activeFilter = "all";
  activeSort = "recent";
  searchQuery = "";

  const searchInput = document.getElementById("matrix-search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.style.display = "none";

  applyCategoryFilter("all");
  updateSortSelection("recent", "MOST RECENT");
  renderCardMatrix(true);
}

/**
 * Full Page Reset (Brand Logo & Home Icon)
 * Resets category filter, search query, sort order, matrix scroll, and selects top dispatch
 */
function resetPage() {
  resetMatrixFilters();

  const matrixCol = document.querySelector(".matrix-column");
  if (matrixCol) matrixCol.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });

  const posts = getFilteredAndSortedPosts();
  if (posts.length > 0) {
    const firstPostId = posts[0].slug || posts[0].id || posts[0].sys_id;
    selectAndRenderPost(firstPostId);
  }
}

/**
 * Mobile Sliding Viewport Functions (< 980px Width or Short Height)
 */
function showReaderPaneMobile() {
  const splitLayout = document.querySelector(".split-layout");
  if (splitLayout) {
    splitLayout.classList.add("mobile-reader-active");
  }
}

function showGridFeedMobile() {
  const splitLayout = document.querySelector(".split-layout");
  if (splitLayout) {
    splitLayout.classList.remove("mobile-reader-active");
  }
}

// Touch swipe gesture listeners
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  if (e.touches && e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (e.changedTouches && e.changedTouches.length > 0) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX < 0) {
        showReaderPaneMobile();
      } else {
        showGridFeedMobile();
      }
    }
  }
}, { passive: true });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    showGridFeedMobile();
  }
});

/**
 * Select a Card and Render in Reader Pane
 */
function selectAndRenderPost(postId) {
  activePostId = postId;
  const cards = document.querySelectorAll(".grid-card");
  cards.forEach(c => {
    const cardId = c.getAttribute("data-id");
    const targetPost = POSTS_DATABASE[postId];
    if (cardId === postId || (targetPost && (cardId === targetPost.slug || cardId === targetPost.sys_id))) {
      c.classList.add("selected-active");
      c.setAttribute("aria-pressed", "true");
    } else {
      c.classList.remove("selected-active");
      c.setAttribute("aria-pressed", "false");
    }
  });

  renderPost(postId);

  if (window.innerWidth <= 980) {
    showReaderPaneMobile();
  }
}

/**
 * Reader Pane Component Renderer (3-Tier Metadata Architecture)
 */
function renderPost(postId) {
  const post = POSTS_DATABASE[postId] || Object.values(POSTS_DATABASE)[0];
  const pane = document.getElementById("essay-reading-pane");
  if (!pane || !post) return;

  const pageUrl = (typeof window !== "undefined" && window.location && window.location.href) ? window.location.href : "";

  // Apply Per-Post Theme Mode
  if (post.theme === "light") {
    pane.classList.add("theme-light");
  } else {
    pane.classList.remove("theme-light");
  }

  // Construct 3-Tier DOM Template
  pane.innerHTML = `
    <!-- Mobile Return to Grid Feed Button -->
    <button type="button" class="btn-return-grid" onclick="showGridFeedMobile()" aria-label="Return to Grid Feed">
      <span class="return-arrow">&lt;&lt;</span>
      <span class="return-text">[ RETURN TO GRID FEED ]</span>
    </button>

    <!-- TIER 1: ABOVE TITLE ARCHIVAL BADGES -->
    <header class="post-header-meta-top">
      <span class="meta-chip chip-primary">[${post.format}]</span>
      ${post.category ? `<a href="archive.html?tag=${encodeURIComponent(post.category)}" class="meta-chip meta-chip-category" title="Explore ${post.category} in Archive Network Map">[${post.category}]</a>` : ''}
      ${post.media ? `<span class="meta-chip meta-chip-media">[MEDIA: ${post.media}]</span>` : ''}
      ${post.pillar ? `<a href="archive.html?tag=${encodeURIComponent(post.pillar)}" class="meta-chip" title="Explore ${post.pillar} in Archive Network Map">[${post.pillar}]</a>` : ''}
      ${post.subtopic ? `<a href="archive.html?tag=${encodeURIComponent(post.subtopic)}" class="meta-chip" title="Explore ${post.subtopic} in Archive Network Map">[${post.subtopic}]</a>` : ''}
    </header>

    <!-- TITLE & SUBTITLE -->
    <h1 class="post-title essay-title">${post.title}</h1>
    ${post.subtitle ? `<p class="post-subtitle essay-subtitle">${post.subtitle}</p>` : ''}

    ${post.url ? `
      <!-- PROMINENT ACTION LINK (FOR RESOURCES & BOOKMARKS) -->
      <div class="post-prominent-action">
        <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn-prominent-action">
          <span class="action-kicker">${post.format === 'RESOURCE' ? 'ACCESS RESOURCE ↗' : (post.format === 'BOOKMARK' ? 'VIEW SOURCE ↗' : 'VISIT DESTINATION ↗')}</span>
          <span class="action-url-text">${post.url}</span>
        </a>
      </div>
    ` : ''}

    <!-- TIER 2: BELOW TITLE META BAR -->
    <div class="post-header-meta-bottom">
      <span>DATE: <time>${post.date}</time></span>
      <span class="meta-sep">//</span>
      <span>BY: <strong class="meta-author">${post.author}</strong></span>
      <span class="meta-sep">//</span>
      <span class="meta-readtime">${post.read_time}</span>
      ${(post.source || post.via) ? `<span class="meta-sep">//</span><span>SOURCE: <strong class="meta-author">${post.source || post.via}</strong></span>` : ''}
      <span class="meta-sep">//</span>
      <span>SYS_ID: <code>${post.sys_id}</code></span>
    </div>

    <!-- MAIN BODY PROSE -->
    <div class="post-body-content essay-body-content">
      ${post.content}
    </div>

    <!-- TIER 3: FOOTER SECTION -->
    <footer class="post-footer-section">
      ${post.links && post.links.length > 0 ? `
        <section class="footer-block footer-links">
          <h3 class="footer-block-title">// REFERENCED_RESOURCES &amp; DESTINATIONS</h3>
          <div class="resources-grid">
            ${post.links.map(l => `
              <div class="resource-card">
                <div class="resource-card-header">
                  <span class="meta-chip resource-chip">[${l.type}]</span>
                  <a href="${l.url}" target="_blank" rel="noopener noreferrer"><strong>${l.title}</strong> ↗</a>
                </div>
                ${l.desc ? `<p class="resource-card-desc">${l.desc}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${post.backlinks && post.backlinks.length > 0 ? `
        <section class="footer-block footer-backlinks">
          <h3 class="footer-block-title">// CONNECTED_DISPATCHES (NETWORK)</h3>
          <ul class="backlinks-list">
            ${post.backlinks.map(b => `
              <li><a href="${b.slug}"><strong>${b.title}</strong></a> ${b.note ? `— <em>${b.note}</em>` : ''}</li>
            `).join('')}
          </ul>
        </section>
      ` : ''}

      ${post.tags && post.tags.length > 0 ? `
        <section class="footer-block footer-tags">
          <h3 class="footer-block-title">// TAXONOMY_INDEX</h3>
          <div class="tags-group">
            ${post.tags.map(t => `<a href="archive.html?tag=${encodeURIComponent(t)}" class="tag-pill" title="Explore #${t} in Archive Network Map">#${t}</a>`).join('')}
          </div>
        </section>
      ` : ''}

      ${post.shareable !== false ? `
        <section class="footer-block footer-share">
          <div class="share-actions-bar">
            <span class="share-caption">SHARE DISPATCH:</span>
            
            <!-- Copy URL Button -->
            <button type="button" class="btn-share" onclick="copyPostUrl()" title="Copy Link to Clipboard">
              <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>[ COPY URL ]</span>
            </button>

            <!-- Embed Card Button -->
            ${post.allow_embed !== false ? `
              <button type="button" class="btn-share" onclick="copyEmbedCard('${postId}')" title="Copy HTML Embed Card">
                <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span>EMBED</span>
              </button>
            ` : ''}

            <!-- X / Twitter -->
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + ' — Untitled.jpg')}&url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-share" title="Share on X / Twitter">
              <svg viewBox="0 0 24 24"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
              <span>X / TWITTER ↗</span>
            </a>

            <!-- LinkedIn -->
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-share" title="Share on LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <span>LINKEDIN ↗</span>
            </a>

            <!-- Facebook -->
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-share" title="Share on Facebook">
              <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              <span>FACEBOOK ↗</span>
            </a>

            <!-- Instagram Stories -->
            <button type="button" class="btn-share" onclick="shareInstagram('${postId}')" title="Copy for Instagram Stories">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <span>INSTAGRAM ↗</span>
            </button>
          </div>
        </section>
      ` : ''}

      <div class="post-signoff">
        <code>UNTITLED.JPG // BUILT IN ZEROES AND ONES WITH THE BLOOD AND SWEAT OF JUAN P. GIUSEPPONI // 2026</code>
      </div>
    </footer>
  `;

  // Smooth scroll reader to top on post change
  pane.scrollTo({ top: 0, behavior: "smooth" });

  // Auto-render KaTeX math formulas if available
  if (typeof renderMathInElement === "function") {
    try {
      renderMathInElement(pane, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "option"],
        throwOnError: false
      });
    } catch (err) {
      console.log("[KaTeX] Math render skipped:", err);
    }
  }

  // Auto-render Mermaid diagrams if available
  if (typeof mermaid !== "undefined") {
    try {
      // Auto-convert standard markdown code blocks (e.g. from marked default parser) into mermaid diagram boxes
      pane.querySelectorAll("pre code.language-mermaid").forEach((el) => {
        const pre = el.parentElement;
        const rawCode = el.textContent;
        const container = document.createElement("div");
        container.className = "mermaid-diagram-box";
        container.innerHTML = `<pre class="mermaid">\n${rawCode}\n</pre>`;
        pre.replaceWith(container);
      });

      const isLight = pane.classList.contains("theme-light");
      mermaid.initialize({
        startOnLoad: false,
        theme: isLight ? "neutral" : "dark",
        themeVariables: {
          darkMode: !isLight,
          background: "transparent",
          mainBkg: isLight ? "#FFFFFF" : "#141414",
          nodeBkg: isLight ? "#FFFFFF" : "#141414",
          primaryColor: isLight ? "#FFFFFF" : "#141414",
          primaryTextColor: isLight ? "#1B2427" : "#F5F5F5",
          primaryBorderColor: isLight ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.18)",
          nodeBorder: isLight ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.18)",
          clusterBkg: "transparent",
          clusterBorder: "none",
          lineColor: "#E84A5F",
          edgeLabelBackground: isLight ? "#DEE6E9" : "#0E0E0E",
          fontFamily: "'Azeret Mono', monospace",
          fontSize: "12px"
        },
        securityLevel: "loose"
      });
      mermaid.run({
        nodes: pane.querySelectorAll(".mermaid")
      });
    } catch (err) {
      console.log("[Mermaid] Render skipped:", err);
    }
  }
}

// Configure Marked.js renderer for Mermaid diagrams if marked is present
if (typeof marked !== "undefined" && marked.use) {
  try {
    marked.use({
      renderer: {
        code(code, infostring, escaped) {
          const lang = (infostring || "").trim().toLowerCase();
          if (lang === "mermaid") {
            return `<div class="mermaid-diagram-box"><pre class="mermaid">\n${code}\n</pre></div>`;
          }
          return false;
        }
      }
    });
  } catch (e) {
    console.log("[Marked] Custom renderer initialization skipped:", e);
  }
}

/**
 * Initialize Interactive Behaviors & Category Filter Nav
 */
function initApp() {
  if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
    ingestPostList(window.DYNAMIC_POSTS);
  }

  // Load dynamic posts & initialize UI
  loadDynamicPosts();

  // Attach click handlers to any existing static cards in DOM
  document.querySelectorAll(".grid-card").forEach(card => {
    const handler = () => {
      const postId = card.getAttribute("data-id");
      selectAndRenderPost(postId);
    };
    card.addEventListener("click", handler);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  });

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

  // Sidebar Format Filter Handler
  const navLinks = document.querySelectorAll("#category-filter-nav .nav-link-item");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const filter = link.getAttribute("data-filter") || "all";

      // Toggle active filter off if clicked again
      if (link.classList.contains("active")) {
        applyCategoryFilter("all");
      } else {
        applyCategoryFilter(filter);
      }
    });
  });

  // Filter Pill Button & Dropdown
  const filterBtn = document.getElementById("filter-pill-btn");
  const filterDropdown = document.getElementById("filter-dropdown");

  if (filterBtn && filterDropdown) {
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = filterDropdown.classList.contains("open");
      closeAllControlDropdowns();
      if (!isOpen) {
        filterDropdown.classList.add("open");
        filterBtn.setAttribute("aria-expanded", "true");
        filterBtn.classList.add("active");
      }
    });

    filterDropdown.querySelectorAll(".dropdown-opt").forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedFilter = opt.getAttribute("data-filter") || "all";
        applyCategoryFilter(selectedFilter);
        closeAllControlDropdowns();
      });
    });
  }

  // Sort Pill Button & Dropdown
  const sortBtn = document.getElementById("sort-pill-btn");
  const sortDropdown = document.getElementById("sort-dropdown");

  if (sortBtn && sortDropdown) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = sortDropdown.classList.contains("open");
      closeAllControlDropdowns();
      if (!isOpen) {
        sortDropdown.classList.add("open");
        sortBtn.setAttribute("aria-expanded", "true");
        sortBtn.classList.add("active");
      }
    });

    sortDropdown.querySelectorAll(".dropdown-opt").forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedSort = opt.getAttribute("data-sort") || "recent";
        const labelText = opt.textContent.replace(/^\[|\]$/g, '');
        updateSortSelection(selectedSort, labelText);
        closeAllControlDropdowns();
      });
    });
  }

  // Quick Search Input Handler
  const searchInput = document.getElementById("matrix-search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery.trim() !== "" ? "inline-block" : "none";
      }
      renderCardMatrix();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.style.display = "none";
      renderCardMatrix();
    });
  }

  // Close dropdowns on outside click
  document.addEventListener("click", () => {
    closeAllControlDropdowns();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}


function closeAllControlDropdowns() {
  document.querySelectorAll(".custom-select-dropdown").forEach(d => d.classList.remove("open"));
  document.querySelectorAll(".btn-matrix-pill").forEach(b => {
    b.setAttribute("aria-expanded", "false");
    b.classList.remove("active");
  });
}

function updateSortSelection(sortKey, sortLabel) {
  activeSort = sortKey;
  const sortValLabel = document.getElementById("current-sort-val");
  const sortDropdown = document.getElementById("sort-dropdown");

  if (sortValLabel) {
    sortValLabel.textContent = sortLabel;
  }
  if (sortDropdown) {
    sortDropdown.querySelectorAll(".dropdown-opt").forEach(o => {
      if (o.getAttribute("data-sort") === sortKey) {
        o.classList.add("active");
      } else {
        o.classList.remove("active");
      }
    });
  }
  renderCardMatrix();
}

/**
 * Filter Cards by Format
 */
function applyCategoryFilter(filter) {
  activeFilter = filter;
  const navLinks = document.querySelectorAll("#category-filter-nav .nav-link-item");
  const filterLabel = document.getElementById("active-filter-label");
  const filterValLabel = document.getElementById("current-filter-val");
  const filterDropdown = document.getElementById("filter-dropdown");

  navLinks.forEach(l => {
    const lFilter = l.getAttribute("data-filter");
    if (filter !== "all" && lFilter === filter) {
      l.classList.add("active");
    } else {
      l.classList.remove("active");
    }
  });

  if (filterValLabel) {
    const labels = {
      all: "ALL POSTS",
      essay: "ESSAYS",
      note: "NOTES",
      bookmark: "BOOKMARKS",
      resource: "RESOURCES"
    };
    filterValLabel.textContent = labels[filter] || filter.toUpperCase();
  }

  if (filterDropdown) {
    filterDropdown.querySelectorAll(".dropdown-opt").forEach(opt => {
      if (opt.getAttribute("data-filter") === filter) {
        opt.classList.add("active");
      } else {
        opt.classList.remove("active");
      }
    });
  }

  if (filterLabel) {
    filterLabel.textContent = `[MODE: ${filter.toUpperCase()}_DISPATCHES]`;
  }

  renderCardMatrix();
}

/* ==============================================================================
   TOP NAVBAR CONTROLS & DROPDOWN HANDLERS (FEED / INDEX)
   ============================================================================== */
function toggleDispatchLogDropdown() {
  closeAllTopDropdowns("dispatch-log-dropdown");
  const panel = document.getElementById("dispatch-log-dropdown");
  const btn = document.getElementById("dispatch-log-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
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
}

function toggleTopSortDropdown() {
  closeAllTopDropdowns("top-sort-dropdown");
  const panel = document.getElementById("top-sort-dropdown");
  const btn = document.getElementById("top-navbar-sort-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
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
  searchQuery = (val || "").trim();

  // Sync inputs
  const inlineInput = document.getElementById("top-inline-search-input");
  const modalInput = document.getElementById("top-search-input");
  if (inlineInput && inlineInput.value !== val) inlineInput.value = val;
  if (modalInput && modalInput.value !== val) modalInput.value = val;

  matrixVisibleCount = MATRIX_BATCH_SIZE;
  renderCardMatrix();
}

function applyTopFilter(formatKey) {
  activeFilter = formatKey;

  // Highlight dropdown options
  document.querySelectorAll("#top-filter-dropdown .dropdown-option, #dispatch-log-dropdown .dropdown-option").forEach(opt => {
    const clickAttr = opt.getAttribute("onclick") || "";
    opt.classList.toggle("active", clickAttr.includes(`'${formatKey}'`));
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

  matrixVisibleCount = MATRIX_BATCH_SIZE;
  renderCardMatrix();
  closeAllTopDropdowns();
}

function applyTopSort(sortOrder) {
  activeSort = sortOrder === "newest" ? "recent" : sortOrder;
  document.querySelectorAll("#top-sort-dropdown .dropdown-option").forEach(opt => {
    const clickAttr = opt.getAttribute("onclick") || "";
    opt.classList.toggle("active", clickAttr.includes(`'${sortOrder}'`));
  });
  matrixVisibleCount = MATRIX_BATCH_SIZE;
  renderCardMatrix();
  closeAllTopDropdowns();
}

// Close top dropdowns on click outside
document.addEventListener("click", (e) => {
  const isTopNav = e.target.closest(".sidebar-rail") || e.target.closest(".top-dropdown-panel");
  if (!isTopNav) {
    closeAllTopDropdowns();
  }
});

/**
 * Global Newsletter Modal Dialog Handlers
 */
function openSubscribeModal() {
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    const email = prompt("[UNTITLED.JPG // DISPATCH SUBSCRIPTION]\nEnter your email to receive deep-dive dispatches:");
    if (email) alert(`[CONFIRMED] Subscribed ${email} to Untitled.jpg dispatches.`);
  }
}

function closeSubscribeModal() {
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.close === "function") {
    modal.close();
  }
}

function handleSubscribeSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("subscriber-email");
  const email = input ? input.value : "";
  if (email) {
    alert(`[CONFIRMED] Transmission endpoint registered: ${email}\nYou will receive upcoming Untitled.jpg dispatches.`);
    closeSubscribeModal();
    if (input) input.value = "";
  }
}

/**
 * Dispatch Sharing Handlers
 */
function copyPostUrl() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert(`[COPIED] Dispatch URL copied to clipboard:\n${url}`);
    }).catch(() => {
      prompt("Copy dispatch URL:", url);
    });
  } else {
    prompt("Copy dispatch URL:", url);
  }
}

function copyEmbedCard(postId) {
  const post = POSTS_DATABASE[postId] || Object.values(POSTS_DATABASE)[0];
  if (!post) return;
  const currentUrl = window.location.origin + window.location.pathname + '#' + (post.slug || postId);
  const embedCode = `<div class="untitled-dispatch-embed" style="border:1px solid #333;background:#161616;color:#f5f5f5;padding:1.25rem;border-radius:2px;font-family:sans-serif;max-width:560px;">\n  <div style="font-family:monospace;font-size:0.75rem;color:#E84A5F;letter-spacing:0.08em;margin-bottom:0.4rem;">[ UNTITLED.JPG // ${post.format} ]</div>\n  <h3 style="margin:0 0 0.5rem 0;font-size:1.15rem;line-height:1.3;"><a href="${currentUrl}" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:none;">${post.title}</a></h3>\n  <p style="color:#cccccc;font-size:0.88rem;line-height:1.45;margin:0 0 0.75rem 0;">${post.subtitle}</p>\n  <div style="font-family:monospace;font-size:0.7rem;color:#888888;">BY ${post.author} (${post.posted_by}) • ${post.date} • ${post.read_time}</div>\n</div>`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(embedCode).then(() => {
      alert(`[COPIED] HTML Embed Card snippet copied to clipboard! You can paste this card into any website or blog.`);
    }).catch(() => {
      prompt("Copy HTML Embed code:", embedCode);
    });
  } else {
    prompt("Copy HTML Embed code:", embedCode);
  }
}

function shareInstagram(postId) {
  const post = POSTS_DATABASE[postId] || Object.values(POSTS_DATABASE)[0];
  const url = window.location.origin + window.location.pathname + '#' + (post.slug || postId);
  const storyText = `${post ? post.title : 'Untitled.jpg Dispatch'}\n\nRead full dispatch: ${url}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(storyText).then(() => {
      alert(`[INSTAGRAM / STORIES]\nDispatch link and title copied to clipboard for your story or bio link:\n\n${storyText}`);
    });
  } else {
    prompt("Copy dispatch text for Instagram story link:", storyText);
  }
}
