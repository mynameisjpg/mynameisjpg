/**
 * UNTITLED.JPG — COMPONENT: POST ENGAGEMENT (js/components/post-engagement.js)
 * Manages post reactions (heart, laugh, insight, mindblown, anger, dislike)
 * and anonymous dispatch comments via Supabase REST API.
 */

(function (window, document) {
  "use strict";

  const SUPABASE_URL = "https://taoqykuyxfcykvfwptvj.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhb3F5a3V5eGZjeWt2ZndwdHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5OTA2NTUsImV4cCI6MjEwNzU2NjY1NX0.aHEwGFNCiBm-JGOJ8C3r15LefwisNcv9BEDPSV90FDk";

  const API_HEADERS = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };

  const REACTION_TYPES = ["like", "love", "insightful", "mindblown", "dislike"];

  const LOTTIE_PATHS = {
    love: "assets/images/reactions/love/lottie.json",
    like: "assets/images/reactions/like/lottie.json",
    insightful: "assets/images/reactions/insightful/lottie.json",
    mindblown: "assets/images/reactions/mindblown/lottie.json",
    dislike: "assets/images/reactions/dislike/lottie.json",
  };

  const WEBP_FALLBACKS = {
    love: "assets/images/reactions/love/512.webp",
    like: "assets/images/reactions/like/512.webp",
    insightful: "assets/images/reactions/insightful/512.webp",
    mindblown: "assets/images/reactions/mindblown/512.webp",
    dislike: "assets/images/reactions/dislike/512.webp",
  };

  let reactionAnimInstances = {};

  let currentActiveSlug = "";
  let isSubmitting = false;

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(isoStr) {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${year}.${month}.${day} • ${hours}:${mins}`;
    } catch (e) {
      return isoStr;
    }
  }

  function getStoredReactions(slug) {
    try {
      const raw = localStorage.getItem(`untitled_reactions_${slug}`);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStoredReaction(slug, reactionType) {
    try {
      const reactions = getStoredReactions(slug);
      reactions[reactionType] = true;
      localStorage.setItem(`untitled_reactions_${slug}`, JSON.stringify(reactions));
    } catch (e) {}
  }

  function getStoredReactionCounts(slug) {
    try {
      const raw = localStorage.getItem(`untitled_reaction_counts_${slug}`);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStoredReactionCount(slug, reactionType, count) {
    try {
      const counts = getStoredReactionCounts(slug);
      counts[reactionType] = Number(count) || 0;
      localStorage.setItem(`untitled_reaction_counts_${slug}`, JSON.stringify(counts));
    } catch (e) {}
  }

  function getStoredComments(slug) {
    try {
      const raw = localStorage.getItem(`untitled_comments_${slug}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredComment(slug, comment) {
    try {
      const comments = getStoredComments(slug);
      comments.push(comment);
      localStorage.setItem(`untitled_comments_${slug}`, JSON.stringify(comments));
    } catch (e) {}
  }

  /**
   * Smoothly scroll reader pane to comments section
   */
  function scrollToComments() {
    const commentsSec = document.getElementById("dispatch-comments-section");
    if (!commentsSec) return;

    const pane = document.getElementById("essay-reading-pane");
    const scrollWrapper = pane ? pane.querySelector(".reader-scroll-wrapper") : null;

    if (scrollWrapper) {
      const topPos = commentsSec.offsetTop - 40;
      scrollWrapper.scrollTo({ top: topPos, behavior: "smooth" });
    } else {
      commentsSec.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Focus comment alias input if empty, or content
    setTimeout(() => {
      const aliasInput = document.getElementById("comment-alias");
      const contentInput = document.getElementById("comment-body");
      if (aliasInput && !aliasInput.value.trim()) {
        aliasInput.focus();
      } else if (contentInput) {
        contentInput.focus();
      }
    }, 450);
  }

  /**
   * Fetch and display reactions from localStorage & Supabase
   */
  async function loadReactions(slug) {
    const stored = getStoredReactions(slug);
    const storedCounts = getStoredReactionCounts(slug);

    // 1. Immediately restore state and cached numbers from localStorage
    REACTION_TYPES.forEach((type) => {
      const btn = document.querySelector(`.btn-reaction[data-reaction="${type}"]`);
      if (btn) {
        if (stored[type]) {
          btn.classList.add("active-reacted");
        } else {
          btn.classList.remove("active-reacted");
        }

        const countEl = btn.querySelector(".reaction-count");
        if (countEl) {
          if (typeof storedCounts[type] === "number") {
            countEl.textContent = storedCounts[type];
          } else if (stored[type]) {
            countEl.textContent = "1";
            saveStoredReactionCount(slug, type, 1);
          }
        }
      }
    });

    // 2. Fetch live data from Supabase if table permissions allow
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/post_reactions?post_slug=eq.${encodeURIComponent(slug)}&select=*`,
        { headers: API_HEADERS }
      );
      if (!res.ok) {
        // Table SELECT permission may be restricted; local numbers remain safely preserved
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) return;

      data.forEach((item) => {
        const btn = document.querySelector(`.btn-reaction[data-reaction="${item.reaction_type}"]`);
        if (btn) {
          const countEl = btn.querySelector(".reaction-count");
          if (countEl) {
            countEl.textContent = item.count;
            saveStoredReactionCount(slug, item.reaction_type, item.count);
          }
        }
      });
    } catch (err) {
      console.warn("[Engagement] Error loading reactions:", err);
    }
  }

  function loadLottieScript() {
    if (window.lottie) return Promise.resolve(window.lottie);
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src*="lottie"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.lottie));
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js";
      s.defer = true;
      s.onload = () => resolve(window.lottie);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  function getBasePath() {
    const baseEl = document.querySelector("base");
    if (baseEl && baseEl.getAttribute("href")) {
      const href = baseEl.getAttribute("href");
      if (href === "../" || href === "/" || href.endsWith("/")) {
        return "";
      }
    }
    const path = window.location.pathname || "";
    if (path.includes("/posts/") || path.includes("\\posts\\")) {
      return "../";
    }
    return "./";
  }

  function fallbackToWebp(container, type, basePath) {
    if (!container) return;
    const path = (basePath || getBasePath()) + WEBP_FALLBACKS[type];
    container.innerHTML = `<img src="${path}" class="reaction-webp-img" alt="${type}" width="38" height="38" />`;
  }

  async function setupLottieReactions() {
    const basePath = getBasePath();

    // Immediately render WebP fallbacks so icons are visible without delay
    REACTION_TYPES.forEach((type) => {
      const btn = document.querySelector(`.btn-reaction[data-reaction="${type}"]`);
      if (!btn) return;
      const wrap = btn.querySelector(".reaction-icon-wrap");
      if (!wrap) return;

      if (!wrap.querySelector(".reaction-webp-img") && !wrap.querySelector(".reaction-lottie-container")) {
        fallbackToWebp(wrap, type, basePath);
      }
    });

    // On local file:// protocol, XMLHttpRequest for JSON is blocked by browser CORS policy.
    // Keep the animated WebP images for seamless local browsing without errors.
    if (window.location.protocol === "file:") {
      return;
    }

    await loadLottieScript();

    REACTION_TYPES.forEach((type) => {
      const btn = document.querySelector(`.btn-reaction[data-reaction="${type}"]`);
      if (!btn) return;
      const wrap = btn.querySelector(".reaction-icon-wrap");
      if (!wrap) return;

      if (reactionAnimInstances[type] && typeof reactionAnimInstances[type].destroy === "function") {
        try {
          reactionAnimInstances[type].destroy();
        } catch (e) {}
      }

      if (window.lottie) {
        try {
          const animContainer = document.createElement("div");
          animContainer.className = "reaction-lottie-container";

          const anim = window.lottie.loadAnimation({
            container: animContainer,
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: basePath + LOTTIE_PATHS[type],
          });

          anim.addEventListener("DOMLoaded", () => {
            anim.goToAndStop(0, true);
            wrap.innerHTML = "";
            wrap.appendChild(animContainer);
          });

          anim.addEventListener("data_failed", () => {
            console.warn("[Engagement] Lottie data failed for", type);
            fallbackToWebp(wrap, type, basePath);
          });

          anim.addEventListener("error", () => {
            console.warn("[Engagement] Lottie error for", type);
            fallbackToWebp(wrap, type, basePath);
          });

          reactionAnimInstances[type] = anim;
        } catch (e) {
          console.warn("[Engagement] Lottie load error for", type, e);
          fallbackToWebp(wrap, type, basePath);
        }
      } else {
        fallbackToWebp(wrap, type, basePath);
      }
    });
  }

  /**
   * Handle Reaction Click
   */
  async function handleReactionClick(btn, slug) {
    const reaction = btn.getAttribute("data-reaction");
    if (!reaction || !slug) return;

    // Trigger lottie animation playback
    const anim = reactionAnimInstances[reaction];
    if (anim) {
      anim.goToAndPlay(0, true);
    }

    const stored = getStoredReactions(slug);
    const countEl = btn.querySelector(".reaction-count");
    let currentCount = parseInt(countEl ? countEl.textContent : "0", 10) || 0;

    // Prevent spam double-clicking if already clicked recently
    if (stored[reaction]) {
      // Visually bump
      btn.style.transform = "scale(1.2)";
      setTimeout(() => (btn.style.transform = ""), 150);
      return;
    }

    // Optimistic UI update
    saveStoredReaction(slug, reaction);
    btn.classList.add("active-reacted");
    const optimisticCount = currentCount + 1;
    if (countEl) countEl.textContent = optimisticCount;
    saveStoredReactionCount(slug, reaction, optimisticCount);

    // Subtle celebration animation
    btn.style.transform = "scale(1.25)";
    setTimeout(() => (btn.style.transform = ""), 200);

    // Call Supabase atomic increment RPC
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_reaction`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({ p_post_slug: slug, p_reaction: reaction }),
      });
      if (res.ok) {
        const newCount = await res.json();
        if (typeof newCount === "number" && countEl) {
          countEl.textContent = newCount;
          saveStoredReactionCount(slug, reaction, newCount);
        }
      }
    } catch (err) {
      console.error("[Engagement] Error sending reaction:", err);
    }
  }

  /**
   * Fetch and render comments from Supabase & localStorage
   */
  async function loadComments(slug) {
    const container = document.getElementById("comments-stream-container");
    const countLabel = document.getElementById("meta-comment-count-label");

    if (!container) return;

    const localComments = getStoredComments(slug);

    // 1. Immediately render local comments if available
    if (localComments.length > 0) {
      if (countLabel) {
        countLabel.textContent =
          localComments.length === 1 ? "(1 COMMENT)" : `(${localComments.length} COMMENTS)`;
      }
      container.innerHTML = localComments
        .map(
          (c) => `
        <article class="comment-item" id="comment-${c.id || Date.now()}">
          <header class="comment-item-header">
            <span class="comment-author-name">@${escapeHtml(c.author_alias)}</span>
            <time class="comment-timestamp" datetime="${c.created_at}">${formatDate(c.created_at)}</time>
          </header>
          <div class="comment-body-text">${escapeHtml(c.content)}</div>
        </article>
      `
        )
        .join("");
    }

    try {
      // Query comments (first try public_comments view, fallback to post_comments)
      let res = await fetch(
        `${SUPABASE_URL}/rest/v1/public_comments?post_slug=eq.${encodeURIComponent(slug)}&order=created_at.asc`,
        { headers: API_HEADERS }
      );

      if (!res.ok) {
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/post_comments?post_slug=eq.${encodeURIComponent(slug)}&approved=eq.true&select=id,post_slug,author_alias,content,created_at&order=created_at.asc`,
          { headers: API_HEADERS }
        );
      }

      if (!res.ok) {
        if (localComments.length === 0) {
          container.innerHTML = `<div class="comments-empty-state">[ DISPATCH TRANSMISSIONS READY // BE THE FIRST TO COMMENT ]</div>`;
          if (countLabel) countLabel.textContent = "(0) COMMENT FIRST!";
        }
        return;
      }

      const comments = await res.json();

      if (!Array.isArray(comments) || comments.length === 0) {
        if (localComments.length === 0) {
          container.innerHTML = `<div class="comments-empty-state">[ NO TRANSMISSIONS LOGGED YET // BE THE FIRST TO COMMENT ]</div>`;
          if (countLabel) countLabel.textContent = "(0) COMMENT FIRST!";
        }
        return;
      }

      // Merge server comments with local comments
      const allComments = [...comments];
      localComments.forEach((lc) => {
        if (!allComments.some((sc) => sc.content === lc.content && sc.author_alias === lc.author_alias)) {
          allComments.push(lc);
        }
      });

      // Update CTA label
      if (countLabel) {
        countLabel.textContent =
          allComments.length === 1 ? "(1 COMMENT)" : `(${allComments.length} COMMENTS)`;
      }

      // Render comment cards
      container.innerHTML = allComments
        .map(
          (c) => `
        <article class="comment-item" id="comment-${c.id}">
          <header class="comment-item-header">
            <span class="comment-author-name">@${escapeHtml(c.author_alias)}</span>
            <time class="comment-timestamp" datetime="${c.created_at}">${formatDate(c.created_at)}</time>
          </header>
          <div class="comment-body-text">${escapeHtml(c.content)}</div>
        </article>
      `
        )
        .join("");
    } catch (err) {
      console.warn("[Engagement] Error loading comments:", err);
      if (localComments.length === 0) {
        container.innerHTML = `<div class="comments-empty-state">[ COMMENTS LOG READY // BE THE FIRST TO COMMENT ]</div>`;
        if (countLabel) countLabel.textContent = "(0) COMMENT FIRST!";
      }
    }
  }

  /**
   * Handle Comment Form Submission
   */
  async function handleCommentSubmit(e, slug) {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.target;
    const aliasInput = form.querySelector('[name="alias"]');
    const emailInput = form.querySelector('[name="email"]');
    const contentInput = form.querySelector('[name="content"]');
    const hpInput = form.querySelector('[name="hp_field"]');
    const submitBtn = form.querySelector(".btn-submit-comment");
    const alertBox = document.getElementById("comment-status-alert");

    // Honeypot check: If bot filled this hidden field, fake success and exit
    if (hpInput && hpInput.value) {
      form.reset();
      return;
    }

    const alias = aliasInput ? aliasInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const content = contentInput ? contentInput.value.trim() : "";

    if (!alias || alias.length < 2) {
      showAlert("Alias must be at least 2 characters.", "error");
      aliasInput.focus();
      return;
    }

    if (!content || content.length < 2) {
      showAlert("Transmission content cannot be empty.", "error");
      contentInput.focus();
      return;
    }

    // Save alias in localStorage for future convenience
    try {
      localStorage.setItem("untitled_commenter_alias", alias);
      if (email) localStorage.setItem("untitled_commenter_email", email);
    } catch (err) {}

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "TRANSMITTING...";
    }

    try {
      const payload = {
        post_slug: slug,
        author_alias: alias,
        author_email: email || null,
        content: content,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/post_comments`, {
        method: "POST",
        headers: {
          ...API_HEADERS,
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const inserted = await res.json();
      const newComment = Array.isArray(inserted) ? inserted[0] : (inserted || payload);
      newComment.created_at = newComment.created_at || new Date().toISOString();
      saveStoredComment(slug, newComment);

      showAlert("Transmission confirmed and logged in dispatch stream.", "success");
      form.reset();

      // Restore saved alias if available
      if (aliasInput) aliasInput.value = alias;
      if (emailInput && email) emailInput.value = email;

      // Optimistically append new comment to the container
      const container = document.getElementById("comments-stream-container");
      const emptyState = container ? container.querySelector(".comments-empty-state") : null;
      if (emptyState) emptyState.remove();

      if (container && newComment) {
        const commentHtml = `
          <article class="comment-item" id="comment-${newComment.id || Date.now()}">
            <header class="comment-item-header">
              <span class="comment-author-name">@${escapeHtml(newComment.author_alias || alias)}</span>
              <time class="comment-timestamp" datetime="${newComment.created_at || new Date().toISOString()}">${formatDate(newComment.created_at || new Date().toISOString())}</time>
            </header>
            <div class="comment-body-text">${escapeHtml(newComment.content || content)}</div>
          </article>
        `;
        container.insertAdjacentHTML("beforeend", commentHtml);
      }

      // Update CTA count
      const countLabel = document.getElementById("meta-comment-count-label");
      if (countLabel) {
        const existingItems = container ? container.querySelectorAll(".comment-item").length : 1;
        countLabel.textContent =
          existingItems === 1 ? "(1 COMMENT)" : `(${existingItems} COMMENTS)`;
      }
    } catch (err) {
      console.error("[Engagement] Submission error:", err);
      showAlert("Failed to transmit comment. Please verify your connection and retry.", "error");
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "TRANSMIT REPLY ↗";
      }
    }
  }

  function showAlert(msg, type) {
    let alertBox = document.getElementById("comment-status-alert");
    if (!alertBox) {
      alertBox = document.createElement("div");
      alertBox.id = "comment-status-alert";
      const form = document.getElementById("comment-submission-form");
      if (form) form.prepend(alertBox);
    }
    alertBox.className = `comment-status-alert status-${type}`;
    alertBox.textContent = msg;
    alertBox.style.display = "block";

    setTimeout(() => {
      if (alertBox) alertBox.style.display = "none";
    }, 5000);
  }

  /**
   * Main Initialization called whenever a post opens in the reader pane
   */
  function init(postId, postSlug) {
    const slug = postSlug || postId;
    if (!slug) return;
    currentActiveSlug = slug;

    // Attach reaction click listeners
    const reactionButtons = document.querySelectorAll(".btn-reaction");
    reactionButtons.forEach((btn) => {
      btn.onclick = () => handleReactionClick(btn, slug);
    });

    // Populate saved Alias and Email into comment form
    try {
      const savedAlias = localStorage.getItem("untitled_commenter_alias");
      const savedEmail = localStorage.getItem("untitled_commenter_email");
      const aliasInput = document.getElementById("comment-alias");
      const emailInput = document.getElementById("comment-email");
      if (aliasInput && savedAlias) aliasInput.value = savedAlias;
      if (emailInput && savedEmail) emailInput.value = savedEmail;
    } catch (e) {}

    // Attach form submission listener
    const commentForm = document.getElementById("comment-submission-form");
    if (commentForm) {
      commentForm.onsubmit = (e) => handleCommentSubmit(e, slug);
    }

    // Load remote data and initialize animated reactions
    setupLottieReactions();
    loadReactions(slug);
    loadComments(slug);
  }

  // Export to window
  window.UntitledEngagement = {
    init,
    scrollToComments,
  };
  window.scrollToCommentsSection = scrollToComments;
})(window, document);
