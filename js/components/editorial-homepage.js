/**
 * UNTITLED.JPG — COMPONENT: EDITORIAL HOMEPAGE ORCHESTRATOR (js/components/editorial-homepage.js)
 * Manages interactivity for the full-width Hero section and 3-panel editorial grid:
 * - Essays & Notes Timeline Feed
 * - Bookmarks Stack
 * - Resources Stack
 * Wires smooth reading pane transitions, keyboard accessibility, and audio dispatch playback.
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
      // Fallback navigation if reader pane component is missing
      const cleanSlug = String(postId).replace(/^\d{4}-\d{2}-\d{2}-/, "");
      window.location.href = `posts/${cleanSlug}.html`;
    }
  }

  /**
   * Setup click listeners for hero & editorial panels
   */
  function initEditorialInteractions() {
    const container = document.querySelector(".editorial-shell");
    if (!container) return;

    // Delegated click handler
    container.addEventListener("click", (e) => {
      // Audio Dispatch Button
      const audioBtn = e.target.closest(".hero-audio-dispatch-btn");
      if (audioBtn) {
        e.preventDefault();
        const postId = audioBtn.getAttribute("data-post-id") || "2026-10-03-telebody-latent-space-pharmacopornographic-ai";
        openPostInReader(postId);
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

    // Keyboard support (Enter/Space on clickable elements)
    container.addEventListener("keydown", (e) => {
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
    openPost: openPostInReader
  };
})();
