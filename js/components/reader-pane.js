/**
 * UNTITLED.JPG — COMPONENT: ESSAY READER PANE (js/components/reader-pane.js)
 * Manages post reading interface, 3-tier archival metadata rendering,
 * KaTeX formula hydration, Mermaid diagram rendering, typography font-size calibration,
 * mobile sliding viewport interactions & gestures, and social sharing/embeds.
 */

(function () {
  "use strict";

  function getAppState() {
    return window.UntitledApp || {};
  }

  function getPostsDatabase() {
    const app = getAppState();
    return app.postsDatabase || window.POSTS_DATABASE || {};
  }

  function getActivePostId() {
    const app = getAppState();
    return app.activePostId || window.activePostId || "";
  }

  function setActivePostId(val) {
    const app = getAppState();
    if (app && "activePostId" in app) app.activePostId = val;
    if (typeof window !== "undefined") window.activePostId = val;
  }

  /**
   * Helper to get canonical permanent URL without dates in the slug
   */
  function getCanonicalPostUrl(postOrId) {
    const db = getPostsDatabase();
    const activeId = getActivePostId();
    const post =
      typeof postOrId === "object" && postOrId
        ? postOrId
        : db[postOrId] || (activeId ? db[activeId] : null);
    const raw = post ? post.slug || post.id || post.sys_id || postOrId : postOrId;
    const clean = String(raw || "").replace(/^\d{4}-\d{2}-\d{2}-/, "");

    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.origin
    ) {
      const origin = window.location.origin;
      const basePath = window.location.pathname
        .replace(/\/posts\/.*$/, "/")
        .replace(/\/index\.html$/, "/")
        .replace(/\/$/, "");
      return `${origin}${basePath}/posts/${clean}.html`;
    }
    return `https://mynameisjpg.github.io/mynameisjpg/posts/${clean}.html`;
  }

  /**
   * Typography Scaling Preferences & Dynamic CSS Cascade
   */
  function getSavedReaderFontSize() {
    if (typeof window === "undefined" || !window.localStorage) return 16;
    const saved = localStorage.getItem("untitled_reader_font_size");
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 12 && parsed <= 24 ? parsed : 16;
  }

  function getReaderFontSizeDisplay(size) {
    return size === 16 ? "DEFAULT PX" : `${size} PX`;
  }

  function applyReaderFontScale(size) {
    const pane = document.getElementById("essay-reading-pane");
    if (!pane) return;
    const scale = size / 16;
    pane.style.setProperty("--reader-font-scale", scale.toFixed(4));
  }

  function initReaderTypoScaler() {
    const slider = document.getElementById("reader-font-slider");
    const valBtn = document.getElementById("typo-scaler-val");
    const pane = document.getElementById("essay-reading-pane");
    if (!slider || !pane) return;

    const currentSize = getSavedReaderFontSize();
    slider.value = currentSize;
    applyReaderFontScale(currentSize);
    if (valBtn) valBtn.textContent = getReaderFontSizeDisplay(currentSize);

    slider.oninput = (e) => {
      const size = parseInt(e.target.value, 10);
      applyReaderFontScale(size);
      if (valBtn) valBtn.textContent = getReaderFontSizeDisplay(size);
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("untitled_reader_font_size", size.toString());
      }
    };

    if (valBtn) {
      valBtn.onclick = () => {
        slider.value = 16;
        applyReaderFontScale(16);
        valBtn.textContent = "DEFAULT PX";
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("untitled_reader_font_size", "16");
        }
      };
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
      splitLayout.classList.remove("reader-open");
    }
    setActivePostId("");
    const cards = document.querySelectorAll(".grid-card");
    cards.forEach((c) => {
      c.classList.remove("selected-active");
      c.setAttribute("aria-pressed", "false");
    });
    if (
      typeof window !== "undefined" &&
      window.history &&
      window.history.replaceState
    ) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  /**
   * Smoothly anchor a card in the viewport center during width transitions
   */
  function scrollCardIntoViewWithTransition(cardEl) {
    if (!cardEl) return;
    const doScroll = () => {
      try {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      } catch (e) {
        cardEl.scrollIntoView();
      }
    };
    doScroll();
    setTimeout(doScroll, 180);
    setTimeout(doScroll, 360);
  }

  /**
   * Select a Card and Render in Reader Pane
   */
  function selectAndRenderPost(postId, updateUrl = true) {
    const db = getPostsDatabase();
    if (!postId || !db[postId]) return;
    setActivePostId(postId);
    const targetPost = db[postId];
    const rawSlug = targetPost
      ? targetPost.slug || targetPost.id || targetPost.sys_id
      : postId;
    const canonicalSlug = String(rawSlug).replace(/^\d{4}-\d{2}-\d{2}-/, "");

    let targetCard = null;
    const cards = document.querySelectorAll(".grid-card");
    cards.forEach((c) => {
      const cardId = c.getAttribute("data-id");
      if (
        cardId === postId ||
        (targetPost &&
          (cardId === targetPost.slug || cardId === targetPost.sys_id))
      ) {
        c.classList.add("selected-active");
        c.setAttribute("aria-pressed", "true");
        targetCard = c;
      } else {
        c.classList.remove("selected-active");
        c.setAttribute("aria-pressed", "false");
      }
    });

    renderPost(postId);

    const splitLayout = document.querySelector(".split-layout");
    if (splitLayout) {
      splitLayout.classList.add("reader-open");
    }

    if (targetCard) {
      scrollCardIntoViewWithTransition(targetCard);
    }

    if (window.innerWidth <= 980 || window.innerHeight <= 700) {
      showReaderPaneMobile();
    }

    // Update URL Hash for direct deep-linking
    if (
      updateUrl &&
      typeof window !== "undefined" &&
      window.history &&
      window.history.replaceState
    ) {
      window.history.replaceState(null, "", "#" + canonicalSlug);
    }
  }

  /**
   * Close Reader Pane & Return to Full Grid View
   */
  function closeReaderPane() {
    const activeId = getActivePostId();
    const activeCard = activeId
      ? document.querySelector(`.grid-card[data-id="${activeId}"]`) ||
        document.querySelector(".grid-card.selected-active")
      : null;

    setActivePostId("");
    const splitLayout = document.querySelector(".split-layout");
    if (splitLayout) {
      splitLayout.classList.remove("reader-open");
      splitLayout.classList.remove("mobile-reader-active");
    }

    const cards = document.querySelectorAll(".grid-card");
    cards.forEach((c) => {
      c.classList.remove("selected-active");
      c.setAttribute("aria-pressed", "false");
    });

    if (activeCard) {
      scrollCardIntoViewWithTransition(activeCard);
    }

    if (
      typeof window !== "undefined" &&
      window.history &&
      window.history.replaceState
    ) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  /**
   * Reader Pane Component Renderer (3-Tier Metadata Architecture)
   */
  function renderPost(postId) {
    const db = getPostsDatabase();
    const post = db[postId] || Object.values(db)[0];
    const pane = document.getElementById("essay-reading-pane");
    if (!pane || !post) return;

    const pageUrl = getCanonicalPostUrl(post);

    // Apply Per-Post Theme Mode
    if (post.theme === "light") {
      pane.classList.add("theme-light");
    } else {
      pane.classList.remove("theme-light");
    }

    const currentFontSize = getSavedReaderFontSize();

    // Construct 3-Tier DOM Template
    pane.innerHTML = `
      <!-- Edge Close Button (Vertical 3-Chevron Drawer Tab) -->
      <button type="button" class="btn-close-reader-edge" onclick="closeReaderPane()" title="Close reader panel (ESC)" aria-label="Close reader panel">
        <svg class="close-chevron-svg" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"></polyline></svg>
        <svg class="close-chevron-svg" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"></polyline></svg>
        <svg class="close-chevron-svg" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"></polyline></svg>
      </button>

      <div class="reader-scroll-wrapper">
        <div class="reader-content-container">
          <!-- Return to Grid Feed Button (Mobile / Narrow Screens) -->
          <button type="button" class="btn-return-grid" onclick="showGridFeedMobile()" aria-label="Return to Grid Feed">
            <span class="return-arrow">&lt;&lt;</span>
            <span class="return-text">RETURN TO GRID FEED</span>
          </button>

          <!-- TYPOGRAPHY SCALING CALIBRATOR -->
          <div class="reader-typo-scaler" data-component="typo-scaler">
            <span class="typo-scaler-label">TYPO _ SCALING</span>
            <div class="typo-scaler-slider-wrap">
              <div class="typo-scaler-track-ticks" aria-hidden="true"></div>
              <input 
                type="range" 
                id="reader-font-slider" 
                class="typo-scale-slider" 
                min="13" 
                max="21" 
                step="1" 
                value="${currentFontSize}" 
                aria-label="Reader typography scale" 
              />
            </div>
            <button type="button" id="typo-scaler-val" class="typo-scaler-val" title="Click to reset to default 16px size">
              ${getReaderFontSizeDisplay(currentFontSize)}
            </button>
          </div>

          <!-- TIER 1: ABOVE TITLE ARCHIVAL BADGES -->
          <header class="post-header-meta-top">
            <span class="meta-chip chip-primary">[${post.format}]</span>
            ${post.category && post.category !== post.format && post.category !== post.pillar ? `<a href="network.html?tag=${encodeURIComponent(post.category)}" class="meta-text-link" title="Explore ${post.category} in Taxonomy Node Map">${post.category}</a>` : ""}
            ${post.media ? `<span class="meta-text-item">MEDIA: ${post.media}</span>` : ""}
            ${post.pillar ? `<a href="network.html?tag=${encodeURIComponent(post.pillar)}" class="meta-text-link" title="Explore ${post.pillar} in Taxonomy Node Map">${post.pillar}</a>` : ""}
            ${post.subtopic ? `<a href="network.html?tag=${encodeURIComponent(post.subtopic)}" class="meta-text-link" title="Explore ${post.subtopic} in Taxonomy Node Map">${post.subtopic}</a>` : ""}
          </header>

          <!-- TITLE & SUBTITLE -->
          <h1 class="post-title essay-title">${post.title}</h1>
          ${post.subtitle ? `<p class="post-subtitle essay-subtitle">${post.subtitle}</p>` : ""}

          ${
            post.url
              ? `
            <!-- PROMINENT ACTION LINK (FOR RESOURCES & BOOKMARKS) -->
            <div class="post-prominent-action">
              <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn-prominent-action">
                <span class="action-kicker">${
                  post.format === "RESOURCE"
                    ? Boolean(
                        post.download ||
                          (post.url &&
                            (post.url.endsWith(".pdf") ||
                              post.url.endsWith(".zip") ||
                              post.url.endsWith(".tar.gz") ||
                              post.url.includes("download") ||
                              (post.url.includes("github.com") &&
                                post.url.includes("/releases")))),
                      )
                      ? "DOWNLOAD IT ↗"
                      : "ACCESS RESOURCE ↗"
                    : post.format === "BOOKMARK"
                    ? "VIEW SOURCE ↗"
                    : "VISIT DESTINATION ↗"
                }</span>
                <span class="action-url-text">${post.url}</span>
              </a>
            </div>
          `
              : ""
          }

          <!-- TIER 2: BELOW TITLE META BAR -->
          <div class="post-header-meta-bottom">
            <span>DATE: <time>${post.date}</time></span>
            <span class="meta-sep">//</span>
            <span>BY: <strong class="meta-author">${post.author}</strong></span>
            <span class="meta-sep">//</span>
            <span class="meta-readtime">${post.read_time}</span>
            ${post.source || post.via ? `<span class="meta-sep">//</span><span>SOURCE: <strong class="meta-author">${post.source || post.via}</strong></span>` : ""}
            <span class="meta-sep">//</span>
            <button type="button" class="meta-comment-cta" onclick="window.scrollToCommentsSection()" title="Jump to comments">
              <svg viewBox="0 0 24 24" class="comment-cta-icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span class="comment-cta-label" id="meta-comment-count-label">(0) Comment first!</span>
            </button>
          </div>

          <!-- MAIN BODY PROSE -->
          <div class="post-body-content essay-body-content">
            ${post.content}
          </div>

          <!-- TIER 3: FOOTER SECTION -->
          <footer class="post-footer-section">
            <!-- REACTION BAR (36-40px) -->
            <section class="post-reaction-bar" aria-label="Article Reactions">
              <span class="reaction-prompt">SHOW YOUR REACTION:</span>
              <div class="reaction-buttons-group">
                <button type="button" class="btn-reaction" data-reaction="heart" title="Appreciate / Love">
                  <span class="reaction-icon-wrap">
                    <svg viewBox="0 0 24 24" class="anim-icon anim-heart" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                  </span>
                  <span class="reaction-count">0</span>
                </button>
                <button type="button" class="btn-reaction" data-reaction="laugh" title="Laugh">
                  <span class="reaction-icon-wrap">
                    <svg viewBox="0 0 24 24" class="anim-icon anim-laugh" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M18 13a6 6 0 0 1-12 0"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                  </span>
                  <span class="reaction-count">0</span>
                </button>
                <button type="button" class="btn-reaction" data-reaction="insight" title="Insightful / Lightbulb">
                  <span class="reaction-icon-wrap">
                    <svg viewBox="0 0 24 24" class="anim-icon anim-insight" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                  </span>
                  <span class="reaction-count">0</span>
                </button>
                <button type="button" class="btn-reaction" data-reaction="mindblown" title="Mind Blown">
                  <span class="reaction-icon-wrap">
                    <svg viewBox="0 0 24 24" class="anim-icon anim-mindblown" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                  </span>
                  <span class="reaction-count">0</span>
                </button>
                <button type="button" class="btn-reaction" data-reaction="anger" title="Fired Up / Intense">
                  <span class="reaction-icon-wrap">
                    <svg viewBox="0 0 24 24" class="anim-icon anim-fire" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                  </span>
                  <span class="reaction-count">0</span>
                </button>
                <button type="button" class="btn-reaction" data-reaction="dislike" title="Skeptical / Disagree">
                  <span class="reaction-icon-wrap">
                    <svg viewBox="0 0 24 24" class="anim-icon anim-dislike" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h-1.5a1.5 1.5 0 0 1-1.5-1.5v-2.38Z"></path></svg>
                  </span>
                  <span class="reaction-count">0</span>
                </button>
              </div>
            </section>
            ${
              post.links && post.links.length > 0
                ? `
              <section class="footer-block footer-links">
                <h3 class="footer-block-title">// REFERENCED_RESOURCES &amp; DESTINATIONS</h3>
                <div class="resources-grid">
                  ${post.links
                    .map(
                      (l) => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="resource-card">
                      <div class="resource-card-header">
                        <span class="meta-chip resource-chip">[${l.type}]</span>
                        <span class="resource-card-link-text"><strong>${l.title}</strong> <span class="resource-card-arrow" aria-hidden="true">↗</span></span>
                      </div>
                      ${l.desc ? `<p class="resource-card-desc">${l.desc}</p>` : ""}
                    </a>
                  `,
                    )
                    .join("")}
                </div>
              </section>
            `
                : ""
            }

            ${
              post.backlinks && post.backlinks.length > 0
                ? `
              <section class="footer-block footer-backlinks">
                <h3 class="footer-block-title">// CONNECTED_DISPATCHES (NETWORK)</h3>
                <ul class="backlinks-list">
                  ${post.backlinks
                    .map(
                      (b) => `
                    <li><a href="${b.slug}"><strong>${b.title}</strong></a> ${b.note ? `— <em>${b.note}</em>` : ""}</li>
                  `,
                    )
                    .join("")}
                </ul>
              </section>
            `
                : ""
            }

            ${
              post.tags && post.tags.length > 0
                ? `
              <section class="footer-block footer-tags">
                <h3 class="footer-block-title">// TAXONOMY_INDEX</h3>
                <div class="tags-group">
                  ${post.tags.map((t) => `<a href="network.html?tag=${encodeURIComponent(t)}" class="tag-pill" title="Explore #${t} in Taxonomy Node Map">#${t}</a>`).join("")}
                </div>
              </section>
            `
                : ""
            }

            ${
              post.shareable !== false
                ? `
              <section class="footer-block footer-share">
                <div class="share-actions-bar">
                  <span class="share-caption">SHARE DISPATCH:</span>
                  
                  <!-- Copy URL Button -->
                  <button type="button" class="btn-share" onclick="copyPostUrl('${postId}')" title="Copy Link to Clipboard">
                    <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <span>COPY URL</span>
                  </button>

                  <!-- Embed Card Button -->
                  ${
                    post.allow_embed !== false
                      ? `
                    <button type="button" class="btn-share" onclick="copyEmbedCard('${postId}')" title="Copy HTML Embed Card">
                      <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                      <span>EMBED</span>
                    </button>
                  `
                      : ""
                  }

                  <!-- X / Twitter -->
                  <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + " — Untitled.jpg")}&url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-share" title="Share on X / Twitter">
                    <svg viewBox="0 0 24 24"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                    <span>X ↗</span>
                  </a>

                  <!-- LinkedIn -->
                  <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-share" title="Share on LinkedIn">
                    <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    <span>LINKEDIN ↗</span>
                  </a>

                  <!-- Facebook -->
                  <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-share" title="Share on Facebook">
                    <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    <span>FB ↗</span>
                  </a>

                  <!-- Instagram Stories -->
                  <button type="button" class="btn-share" onclick="shareInstagram('${postId}')" title="Copy for Instagram Stories">
                    <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    <span>IG ↗</span>
                  </button>
                </div>
              </section>
            `
                : ""
            }

            <!-- DISPATCH COMMENTS SECTION -->
            <section id="dispatch-comments-section" class="footer-block footer-comments" aria-label="Dispatch Comments and Replies">
              <h3 class="footer-block-title">// DISPATCH_REPLIES &amp; FIELD_OBSERVATIONS</h3>
              
              <!-- Comment Submission Form -->
              <form id="comment-submission-form" class="comment-form-shell">
                <div class="comment-inputs-row">
                  <div class="input-field-wrap">
                    <label for="comment-alias">ALIAS *</label>
                    <input type="text" id="comment-alias" name="alias" placeholder="e.g. observer_01" required maxlength="35" autocomplete="nickname" />
                  </div>
                  <div class="input-field-wrap">
                    <label for="comment-email">EMAIL (OPTIONAL - KEPT PRIVATE)</label>
                    <input type="email" id="comment-email" name="email" placeholder="you@domain.xyz" maxlength="100" autocomplete="email" />
                  </div>
                </div>

                <!-- Anti-spam bot honeypot (hidden from humans) -->
                <input type="text" name="hp_field" style="display:none;" tabindex="-1" autocomplete="off" aria-hidden="true" />

                <div class="textarea-field-wrap">
                  <textarea id="comment-body" name="content" placeholder="ENTER TRANSMISSION..." rows="3" required maxlength="2000"></textarea>
                </div>

                <div class="comment-form-actions">
                  <span class="comment-disclaimer">No account required. Keep it civil &amp; insightful.</span>
                  <button type="submit" class="btn-submit-comment">TRANSMIT REPLY ↗</button>
                </div>
              </form>

              <!-- Stream of Approved Comments -->
              <div class="comments-stream" id="comments-stream-container">
                <div class="comments-loading-state">[ FETCHING DISPATCH TRANSMISSIONS... ]</div>
              </div>
            </section>

            <div class="post-signoff">
              <code>UNTITLED.JPG // BUILT IN ZEROES AND ONES WITH THE BLOOD AND SWEAT OF JUAN P. GIUSEPPONI // 2026</code>
            </div>
          </footer>
        </div>
      </div>
    `;

    // Initialize Typography Scaler Slider and Preferences
    initReaderTypoScaler();

    // Initialize Post Engagement (Reactions & Comments via Supabase)
    const initEngagement = () => {
      if (window.UntitledEngagement && typeof window.UntitledEngagement.init === "function") {
        window.UntitledEngagement.init(postId, post.slug || postId);
      }
    };
    if (window.UntitledEngagement) {
      initEngagement();
    } else {
      const engScript = document.createElement("script");
      engScript.src = "js/components/post-engagement.js";
      engScript.defer = true;
      engScript.onload = initEngagement;
      document.body.appendChild(engScript);
    }

    // Smooth scroll reader to top on post change
    pane.scrollTo({ top: 0, behavior: "smooth" });

    // Defer heavy KaTeX math parsing & Mermaid diagram rendering until after the drawer transition completes (350ms)
    const runDeferredEnhancements = () => {
      // Auto-render KaTeX math formulas if available
      if (typeof renderMathInElement === "function") {
        try {
          renderMathInElement(pane, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\[", right: "\\]", display: true },
              { left: "\\(", right: "\\)", display: false },
            ],
            ignoredTags: [
              "script",
              "noscript",
              "style",
              "textarea",
              "pre",
              "option",
            ],
            throwOnError: false,
          });
        } catch (err) {
          console.log("[KaTeX] Math render skipped:", err);
        }
      }

      // Auto-render Mermaid diagrams if available
      if (typeof mermaid !== "undefined") {
        try {
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
              primaryBorderColor: isLight
                ? "rgba(0, 0, 0, 0.18)"
                : "rgba(255, 255, 255, 0.18)",
              nodeBorder: isLight
                ? "rgba(0, 0, 0, 0.18)"
                : "rgba(255, 255, 255, 0.18)",
              clusterBkg: "transparent",
              clusterBorder: "none",
              lineColor: "#E84A5F",
              edgeLabelBackground: isLight ? "#DEE6E9" : "#0E0E0E",
              fontFamily: "'Azeret Mono', monospace",
              fontSize: "12px",
            },
            securityLevel: "loose",
          });
          mermaid.run({
            nodes: pane.querySelectorAll(".mermaid"),
          });
        } catch (err) {
          console.log("[Mermaid] Render skipped:", err);
        }
      }
    };

    if ("requestIdleCallback" in window) {
      setTimeout(() => {
        requestIdleCallback(runDeferredEnhancements, { timeout: 1000 });
      }, 360);
    } else {
      setTimeout(runDeferredEnhancements, 360);
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
          },
        },
      });
    } catch (e) {
      console.log("[Marked] Custom renderer initialization skipped:", e);
    }
  }

  // Touch swipe gesture listeners
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    (e) => {
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
    },
    { passive: true },
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const splitLayout = document.querySelector(".split-layout");
      if (splitLayout && splitLayout.classList.contains("reader-open")) {
        closeReaderPane();
      }
    }
  });

  /**
   * Dispatch Sharing Handlers
   */
  function copyPostUrl(postId) {
    const url = getCanonicalPostUrl(postId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert(`[COPIED] Dispatch URL copied to clipboard:\n${url}`);
        })
        .catch(() => {
          prompt("Copy dispatch URL:", url);
        });
    } else {
      prompt("Copy dispatch URL:", url);
    }
  }

  function copyEmbedCard(postId) {
    const db = getPostsDatabase();
    const activeId = getActivePostId();
    const post = postId
      ? db[postId]
      : activeId
        ? db[activeId]
        : Object.values(db)[0];
    if (!post) return;
    const currentUrl = getCanonicalPostUrl(post);
    const embedCode = `<div class="untitled-dispatch-embed" style="border:1px solid #333;background:#161616;color:#f5f5f5;padding:1.25rem;border-radius:2px;font-family:sans-serif;max-width:560px;">\n  <div style="font-family:monospace;font-size:0.75rem;color:#E84A5F;letter-spacing:0.08em;margin-bottom:0.4rem;">[ UNTITLED.JPG // ${post.format} ]</div>\n  <h3 style="margin:0 0 0.5rem 0;font-size:1.15rem;line-height:1.3;"><a href="${currentUrl}" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:none;">${post.title}</a></h3>\n  <p style="color:#cccccc;font-size:0.88rem;line-height:1.45;margin:0 0 0.75rem 0;">${post.subtitle}</p>\n  <div style="font-family:monospace;font-size:0.7rem;color:#888888;">BY ${post.author} (${post.posted_by}) • ${post.date} • ${post.read_time}</div>\n</div>`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(embedCode)
        .then(() => {
          alert(
            `[COPIED] HTML Embed Card snippet copied to clipboard! You can paste this card into any website or blog.`,
          );
        })
        .catch(() => {
          prompt("Copy HTML Embed code:", embedCode);
        });
    } else {
      prompt("Copy HTML Embed code:", embedCode);
    }
  }

  function shareInstagram(postId) {
    const db = getPostsDatabase();
    const activeId = getActivePostId();
    const post = postId
      ? db[postId]
      : activeId
        ? db[activeId]
        : Object.values(db)[0];
    const url = getCanonicalPostUrl(post);
    const storyText = `${post ? post.title : "Untitled.jpg Dispatch"}\n\nRead full dispatch: ${url}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(storyText).then(() => {
        alert(
          `[INSTAGRAM / STORIES]\nDispatch link and title copied to clipboard for your story or bio link:\n\n${storyText}`,
        );
      });
    } else {
      prompt("Copy dispatch text for Instagram story link:", storyText);
    }
  }

  // Export Component API
  const ReaderPane = {
    selectAndRenderPost,
    renderPost,
    closeReaderPane,
    showMobile: showReaderPaneMobile,
    hideMobile: showGridFeedMobile,
    getCanonicalUrl: getCanonicalPostUrl,
    initScaler: initReaderTypoScaler,
    copyUrl: copyPostUrl,
    copyEmbed: copyEmbedCard,
    shareInstagram,
  };

  if (typeof window !== "undefined") {
    window.ReaderPane = ReaderPane;
    window.selectAndRenderPost = selectAndRenderPost;
    window.renderPost = renderPost;
    window.closeReaderPane = closeReaderPane;
    window.showReaderPaneMobile = showReaderPaneMobile;
    window.showGridFeedMobile = showGridFeedMobile;
    window.getCanonicalPostUrl = getCanonicalPostUrl;
    window.copyPostUrl = copyPostUrl;
    window.copyEmbedCard = copyEmbedCard;
    window.shareInstagram = shareInstagram;
  }
})();
