/**
 * UNTITLED.JPG — COMPONENT: SUBSCRIBE MODAL (js/components/subscribe-modal.js)
 * Manages newsletter dialog lifecycle, Google Forms background submission,
 * validation, confirmation states, and the subtle ambient subscribe vibration hint.
 */

(function () {
  "use strict";

  // Public Google Form response endpoint
  const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLScWoT07kZjH1m5Mu1zrK4l_eFpzOytLler0cwd0j4yQTXYDJQ/formResponse";
  const GOOGLE_FORM_EMAIL_ENTRY_ID = "entry.1020667952";
  const GOOGLE_FORM_NAME_ENTRY_ID = "entry.1290617359";

  let isSubscribeAnimScheduled = false;

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSubscribeForm(modal) {
    if (!modal) modal = document.getElementById("subscribe-modal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header-tag">[ DISPATCH_SUBSCRIPTION // FREQUENCY: FORTNIGHTLY ]</div>
        <h2 id="modal-heading" class="modal-title">Subscribe to Untitled.jpg</h2>
        <p class="modal-description">Deep-dive essays and technical dispatches on AI perception, cognitive psychophysics, high-dimensional latent space, and media archaeology.</p>
        
        <form class="modal-form" id="subscribe-form" method="dialog">
          <div class="modal-input-group">
            <label for="subscriber-name" class="modal-input-label">IDENTITY (NAME):</label>
            <input type="text" id="subscriber-name" name="name" class="modal-input" placeholder="Your Name / Alias" autocomplete="name">
          </div>
          <div class="modal-input-group">
            <label for="subscriber-email" class="modal-input-label">TRANSMISSION_ENDPOINT (EMAIL):</label>
            <input type="email" id="subscriber-email" name="email" class="modal-input" placeholder="reader@domain.xyz" required autocomplete="email" spellcheck="false">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-modal-cancel">CANCEL</button>
            <button type="submit" class="btn-modal-submit">TRANSMIT SUBSCRIPTION</button>
          </div>
        </form>
      </div>
    `;

    const form = modal.querySelector("form");
    if (form) {
      form.addEventListener("submit", handleSubscribeSubmit);
    }

    const cancelBtn = modal.querySelector(".btn-modal-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeSubscribeModal);
    }
  }

  function renderSubscribeConfirmation(email, name) {
    const modal = document.getElementById("subscribe-modal");
    if (!modal) return;

    const safeEmail = escapeHtml(email || "");
    const safeName = escapeHtml(name || "");

    modal.innerHTML = `
      <div class="modal-box modal-success-anim" role="status" aria-live="polite">
        <div class="modal-header-tag">[ TRANSMISSION_RECEIVED // STATUS: CONFIRMED ]</div>
        <h2 id="modal-heading" class="modal-title">Subscription Confirmed</h2>
        <p class="modal-description" style="margin-bottom: 1.2rem;">
          Thank you for subscribing to <strong>Untitled.jpg</strong> dispatches. Technical essays on AI perception, cognitive psychophysics, and latent space geometry will be transmitted to your endpoint.
        </p>
        
        <div class="modal-confirmation-card">
          <div class="modal-confirmation-tag">[ REGISTERED_ENDPOINT ]</div>
          <div class="modal-confirmation-value">${safeEmail}${safeName ? ` <span style="color:var(--text-muted);font-size:var(--text-sm);margin-left:0.4rem;">(${safeName})</span>` : ""}</div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-modal-submit" onclick="closeSubscribeModal()" style="min-width: 120px;">CLOSE</button>
        </div>
      </div>
    `;
  }

  function ensureSubscribeModal() {
    let modal = document.getElementById("subscribe-modal");
    if (!modal) {
      modal = document.createElement("dialog");
      modal.id = "subscribe-modal";
      modal.className = "modal-dialog";
      modal.setAttribute("data-component", "subscribe-modal");
      modal.setAttribute("aria-labelledby", "modal-heading");
      document.body.appendChild(modal);
    }

    if (!modal.dataset.backdropBound) {
      modal.dataset.backdropBound = "true";
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeSubscribeModal();
        }
      });
    }

    if (
      !modal.querySelector("#subscriber-name") &&
      !modal.querySelector(".modal-confirmation-card")
    ) {
      renderSubscribeForm(modal);
    }

    return modal;
  }

  function openSubscribeModal() {
    const subscribeBtn =
      document.getElementById("sidebar-subscribe-btn") ||
      document.querySelector('a[aria-label="Subscribe"]');
    if (subscribeBtn) {
      subscribeBtn.classList.remove("subscribe-ring-vibrate");
      subscribeBtn.classList.add("subscribe-coral-active");
    }
    const modal = ensureSubscribeModal();
    if (modal) {
      if (
        !modal.querySelector("#subscriber-name") ||
        modal.querySelector(".modal-confirmation-card")
      ) {
        renderSubscribeForm(modal);
      }
      if (typeof modal.showModal === "function") {
        modal.showModal();
      }
    }
  }

  function closeSubscribeModal() {
    const modal = document.getElementById("subscribe-modal");
    if (modal && typeof modal.close === "function") {
      modal.close();
    }
  }

  function initSubscribeAnimation() {
    if (isSubscribeAnimScheduled) return;
    isSubscribeAnimScheduled = true;

    const DELAY_MS = 6000;
    const ANIMATION_DURATION_MS = 4500;

    setTimeout(() => {
      const subscribeTargets = document.querySelectorAll(
        '#sidebar-subscribe-btn, a[aria-label="Subscribe"], a[title*="Subscribe"]',
      );
      if (!subscribeTargets || subscribeTargets.length === 0) return;

      subscribeTargets.forEach((el) => {
        el.classList.add("subscribe-ring-vibrate");
        const svg = el.querySelector("svg");
        if (svg) svg.classList.add("subscribe-ring-vibrate");
      });

      const onAnimationDone = () => {
        subscribeTargets.forEach((el) => {
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

  async function handleSubscribeSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById("subscriber-name");
    const emailInput = document.getElementById("subscriber-email");
    const submitBtn = event.target
      ? event.target.querySelector('button[type="submit"]')
      : null;

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) return;

    if (submitBtn) {
      submitBtn.textContent = "TRANSMITTING...";
      submitBtn.disabled = true;
    }

    const bodyParams = new URLSearchParams();
    bodyParams.append(GOOGLE_FORM_EMAIL_ENTRY_ID, email);
    if (GOOGLE_FORM_NAME_ENTRY_ID && name) {
      bodyParams.append(GOOGLE_FORM_NAME_ENTRY_ID, name);
    }

    try {
      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams,
      });
    } catch (err) {
      console.warn("[Subscription Notice]", err);
    } finally {
      renderSubscribeConfirmation(email, name);
    }
  }

  // Export Component API
  const SubscribeModal = {
    open: openSubscribeModal,
    close: closeSubscribeModal,
    ensure: ensureSubscribeModal,
    renderForm: renderSubscribeForm,
    renderConfirmation: renderSubscribeConfirmation,
    initAnimation: initSubscribeAnimation,
    handleSubmit: handleSubscribeSubmit,
    escapeHtml,
  };

  if (typeof window !== "undefined") {
    window.SubscribeModal = SubscribeModal;
    window.openSubscribeModal = openSubscribeModal;
    window.closeSubscribeModal = closeSubscribeModal;
    window.initSubscribeAnimation = initSubscribeAnimation;
    window.handleSubscribeSubmit = handleSubscribeSubmit;
  }
})();
