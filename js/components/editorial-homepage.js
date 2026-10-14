/**
 * UNTITLED.JPG — COMPONENT: EDITORIAL HOMEPAGE ORCHESTRATOR (js/components/editorial-homepage.js)
 * Manages interactivity for the full-width Hero section and 3-panel editorial grid:
 * - Essays & Notes Timeline Feed (Dynamic rendering & "Load More" pagination)
 * - Bookmarks Stack
 * - Resources Stack
 * Wires smooth reading pane transitions, keyboard accessibility, and audio dispatch playback.
 */

(function () {
  "use strict";

  const INITIAL_BATCH_SIZE = 6;
  const LOAD_MORE_BATCH_SIZE = 6;
  let currentVisibleCount = INITIAL_BATCH_SIZE;
  let activeTimelineTag = null;

  function getAppState() {
    return window.UntitledApp || {};
  }

  function getEssaysAndNotesPosts() {
    let posts = [];
    if (window.DYNAMIC_POSTS && Array.isArray(window.DYNAMIC_POSTS)) {
      posts = window.DYNAMIC_POSTS;
    } else {
      const db = window.POSTS_DATABASE || {};
      const seen = new Set();
      Object.values(db).forEach((p) => {
        const key = p.slug || p.id || p.sys_id;
        if (key && !seen.has(key)) {
          seen.add(key);
          posts.push(p);
        }
      });
    }

    return posts
      .filter((p) => {
        const fmt = (p.format || "ESSAY").toUpperCase().trim();
        const isEssayOrNote = fmt === "ESSAY" || fmt === "NOTE" || fmt === "DISPATCH";
        if (!isEssayOrNote) return false;

        if (activeTimelineTag) {
          const tagTarget = activeTimelineTag.toLowerCase();
          const matchesFoundation = Array.isArray(p.foundations) && p.foundations.some((f) => String(f).toLowerCase() === tagTarget);
          const matchesTags = Array.isArray(p.tags) && p.tags.some((t) => String(t).toLowerCase() === tagTarget);
          const matchesPillar = String(p.pillar || "").toLowerCase().includes(tagTarget);
          return matchesFoundation || matchesTags || matchesPillar;
        }

        return true;
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return { dayMonth: "10 OCT", year: "2026" };
    const parts = dateStr.split(/[.-]/);
    if (parts.length >= 3) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const day = parts[2];
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const monthName = monthNames[monthNum - 1] || "OCT";
      return {
        dayMonth: `${day} ${monthName}`,
        year: year
      };
    }
    return { dayMonth: dateStr, year: "2026" };
  }

  function renderTimelineItem(post) {
    const postId = post.slug || post.id || post.sys_id;
    const format = (post.format || "ESSAY").toUpperCase();
    const isNote = format === "NOTE";
    const badgeClass = isNote ? "format-badge-cyan" : "format-badge-red";
    const dateObj = formatDisplayDate(post.date);

    let foundationText = "VISION";
    if (Array.isArray(post.foundations) && post.foundations.length > 0) {
      foundationText = post.foundations[0].toUpperCase();
    } else if (post.pillar) {
      foundationText = post.pillar.toUpperCase();
    }

    let tagsHtml = "";
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      const tagSlice = post.tags.slice(0, 2).map((t) => `#${String(t).toUpperCase().replace(/\s+/g, "-")}`).join(" ");
      tagsHtml = `<span class="tag-mid-dot">·</span> <span class="tags-meta-grey">${tagSlice}</span>`;
    }

    const imageSrc = post.thumbnail || post.image || "assets/images/thumbnails/operational-images.webp";
    const readTime = post.read_time ? (post.read_time.includes("READ") ? post.read_time : `${post.read_time} MIN READ`) : "6 MIN READ";
    const author = post.author || "Juan P. Giusepponi";

    return `
      <article class="timeline-stream-item">
        <div class="timeline-node-group">
          <div class="timeline-date-block">
            <span class="date-day-month">${dateObj.dayMonth}</span>
            <span class="date-year">${dateObj.year}</span>
          </div>
          <div class="timeline-glowing-dot" aria-hidden="true"></div>
        </div>
        <div class="timeline-entry-box">
          <div class="entry-thumb-col">
            <a href="#${postId}" class="entry-thumb-box" data-post-id="${postId}" title="Read ${escapeHtml(post.title || '')}">
              <img src="${imageSrc}" alt="${escapeHtml(post.title || '')}" loading="lazy" />
            </a>
            <div class="thumb-actions-stack">
              <button type="button" class="btn-read-dispatch btn-thumb-action" data-post-id="${postId}">
                READ ↗
              </button>
              <span class="thumb-meta-read">// ${readTime}</span>
            </div>
          </div>
          <div class="entry-body-box">
            <div class="entry-tags-row">
              <span class="${badgeClass}">[${format}]</span>
              <span class="tag-mid-dot">·</span>
              <span class="foundation-tag-red">${foundationText}</span>
              ${tagsHtml}
            </div>
            <h3 class="entry-headline">
              <a href="#${postId}" data-post-id="${postId}">
                ${escapeHtml(post.title || 'Untitled Dispatch')}
              </a>
            </h3>
            ${post.excerpt ? `<p class="entry-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
            <div class="entry-byline-row">
              <span class="entry-author-meta">BY: ${escapeHtml(author)}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTimelinePosts(count) {
    const container = document.querySelector(".timeline-stream-container");
    if (!container) return;

    const posts = getEssaysAndNotesPosts();
    if (!posts || posts.length === 0) return;

    const visiblePosts = posts.slice(0, count);
    const trackLineHtml = `<div class="timeline-track-line" aria-hidden="true"></div>`;
    const itemsHtml = visiblePosts.map((p) => renderTimelineItem(p)).join("");

    container.innerHTML = trackLineHtml + itemsHtml;

    // Update Load More Button visibility & text
    const loadMoreBtn = document.getElementById("btn-load-more-timeline");
    if (loadMoreBtn) {
      if (visiblePosts.length >= posts.length) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "flex";
      }
    }
  }

  /**
   * Safe post viewer trigger
   */
  function openPostInReader(postId, scrollToTop = true) {
    if (!postId) return;
    if (typeof window.selectAndRenderPost === "function") {
      window.selectAndRenderPost(postId, scrollToTop);
    } else if (window.ReaderPane && typeof window.ReaderPane.selectAndRenderPost === "function") {
      window.ReaderPane.selectAndRenderPost(postId, scrollToTop);
    } else {
      const cleanSlug = String(postId).replace(/^\d{4}-\d{2}-\d{2}-/, "");
      window.location.href = `posts/${cleanSlug}.html`;
    }
  }

  /**
   * Setup click listeners for hero & editorial panels
   */
  function initEditorialInteractions() {
    const shell = document.querySelector(".editorial-shell");
    if (!shell) return;

    // Render dynamic posts for timeline
    renderTimelinePosts(currentVisibleCount);

    // Load More click handler
    const loadMoreBtn = document.getElementById("btn-load-more-timeline");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        currentVisibleCount += LOAD_MORE_BATCH_SIZE;
        renderTimelinePosts(currentVisibleCount);
      });
    }

    // Delegated click handler for posts & audio
    shell.addEventListener("click", (e) => {
      // Audio Dispatch Button
      const audioBtn = e.target.closest(".hero-audio-dispatch-btn");
      if (audioBtn) {
        e.preventDefault();
        const postId = audioBtn.getAttribute("data-post-id") || "2026-10-03-telebody-latent-space-pharmacopornographic-ai";
        openPostInReader(postId);
        return;
      }

      // Related Posts Button (Filter timeline by foundation tag)
      const relatedBtn = e.target.closest(".hero-related-posts-btn");
      if (relatedBtn) {
        e.preventDefault();
        const tag = relatedBtn.getAttribute("data-filter-tag") || "philosophy";
        activeTimelineTag = tag;
        currentVisibleCount = INITIAL_BATCH_SIZE;
        renderTimelinePosts(currentVisibleCount);

        // Update timeline title strip to show active filter with clear option
        const titleSpan = document.querySelector(".panel-essays-notes .panel-header-title span");
        if (titleSpan) {
          titleSpan.innerHTML = `ESSAYS &amp; NOTES <span style="color:#ffffff; font-size:0.6rem; margin-left:6px;">[#${tag.toUpperCase()}]</span>`;
        }

        const actionLink = document.querySelector(".panel-essays-notes .panel-header-action");
        if (actionLink) {
          actionLink.textContent = "CLEAR FILTER [×]";
          actionLink.href = "#";
          actionLink.onclick = (evt) => {
            evt.preventDefault();
            activeTimelineTag = null;
            if (titleSpan) titleSpan.innerHTML = "ESSAYS &amp; NOTES DISPATCH LOG";
            actionLink.textContent = "VIEW ALL 22 [/]";
            actionLink.href = "archive.html";
            actionLink.onclick = null;
            renderTimelinePosts(INITIAL_BATCH_SIZE);
          };
        }

        // Smooth scroll to timeline panel
        const timelinePanel = document.querySelector(".panel-essays-notes");
        if (timelinePanel) {
          timelinePanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      // Read Dispatch / Title clicks
      const dispatchTrigger = e.target.closest("[data-post-id]");
      if (dispatchTrigger && !e.target.closest("a[href^='http']")) {
        const postId = dispatchTrigger.getAttribute("data-post-id");
        if (postId) {
          e.preventDefault();
          openPostInReader(postId);
        }
      }
    });

    // Keyboard support
    shell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const dispatchTrigger = e.target.closest("[data-post-id]");
        if (dispatchTrigger && dispatchTrigger.getAttribute("role") === "button") {
          e.preventDefault();
          const postId = dispatchTrigger.getAttribute("data-post-id");
          if (postId) openPostInReader(postId);
        }
      }
    });
  }

  // Auto-init on DOMContentLoaded or immediate execution
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditorialInteractions);
  } else {
    initEditorialInteractions();
  }

  window.EditorialHomepage = {
    init: initEditorialInteractions,
    openPost: openPostInReader,
    renderTimeline: renderTimelinePosts
  };
})();
