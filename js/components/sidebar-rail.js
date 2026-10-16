/**
 * UNTITLED.JPG - WEB COMPONENT: <sidebar-rail>
 * Custom Autonomous Web Component representing the ultra-thin responsive sidebar rail / top navbar.
 * Supports active page routing, category filter state, search & status badge integration (`has-search`),
 * subscribe modal triggers, mobile hamburger menu (<= 590px), and 100% responsive behavior across all device screens.
 */

class SidebarRail extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["active-page", "active-filter", "has-search"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.children.length > 0) {
      if (name === "active-page") this.highlightActivePage();
      if (name === "active-filter") this.highlightActiveFilter();
      if (name === "has-search") this.render();
    }
  }

  render() {
    const hasSearch = this.hasAttribute("has-search");

    const searchSection = hasSearch
      ? `
      <!-- Top Navbar Search Icon Button -->
      <div class="top-nav-controls-group">
        <button type="button" class="top-nav-icon-btn" id="top-navbar-search-btn" title="Search Dispatches" aria-label="Search Dispatches">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
    `
      : "";

    // Render into Light DOM so all existing sidebar-rail.css rules, media queries, and tokens apply 100% natively
    this.innerHTML = `
      <aside class="sidebar-rail" data-component="sidebar-rail" aria-label="Main Navigation Rail">
        <!-- LEFT GROUP: Logo -->
        <div class="sidebar-left-group">
          <div class="sidebar-top-section">
            <a href="index.html" class="brand-logo-v" id="brand-logo-btn" title="Untitled.jpg" aria-label="Untitled.jpg">
              <svg class="brand-logo-svg" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21.3714 39.6782V21.8032H24.0437V39.6782H21.3714ZM22.2472 39.6782V37.5898H27.1875V39.6782H22.2472ZM22.2472 23.8916V21.8032H27.1875V23.8916H22.2472ZM57.5658 37.7695C56.2933 37.7695 55.1929 37.5299 54.2647 37.0509C53.3365 36.5568 52.6179 35.8757 52.1089 35.0074C51.6149 34.1241 51.3679 33.0986 51.3679 31.9309V21.8256H54.1974V31.9309C54.1974 32.6345 54.3321 33.2483 54.6016 33.7723C54.886 34.2813 55.2827 34.678 55.7917 34.9625C56.3008 35.2469 56.8921 35.3891 57.5658 35.3891C58.2544 35.3891 58.8458 35.2469 59.3398 34.9625C59.8488 34.678 60.2381 34.2813 60.5075 33.7723C60.792 33.2483 60.9342 32.6345 60.9342 31.9309V21.8256H63.7861V31.9309C63.7861 33.0986 63.5316 34.1241 63.0226 35.0074C62.5136 35.8757 61.795 36.5568 60.8668 37.0509C59.9386 37.5299 58.8383 37.7695 57.5658 37.7695ZM68.5107 37.5V21.8256H72.0588L77.8749 33.907L77.6728 28.787V21.8256H80.3451V37.5H76.8195L70.9584 25.5758L71.183 30.5386V37.5H68.5107ZM89.8528 37.5V24.1835H84.9574V21.8256H97.5553V24.1835H92.6598V37.5H89.8528ZM106.704 37.5V21.8256H109.511V37.5H106.704ZM102.886 21.8256H113.328V24.1835H102.886V21.8256ZM102.886 35.1421H113.328V37.5H102.886V35.1421ZM123.555 37.5V24.1835H118.659V21.8256H131.257V24.1835H126.362V37.5H123.555ZM136.79 37.5V21.8256H139.619V35.1421H147.614V37.5H136.79ZM153.169 37.5V21.8256H164.532V24.1835H155.976V28.2032H161.748V30.5611H155.976V35.1421H164.622V37.5H153.169ZM169.661 37.5V21.8256H174.624C175.791 21.8256 176.832 22.0127 177.745 22.387C178.673 22.7463 179.459 23.2703 180.103 23.9589C180.747 24.6326 181.241 25.4485 181.585 26.4067C181.929 27.3648 182.102 28.4352 182.102 29.6179C182.102 30.8156 181.929 31.9009 181.585 32.874C181.241 33.8322 180.747 34.663 180.103 35.3667C179.459 36.0553 178.673 36.5868 177.745 36.9611C176.832 37.3204 175.791 37.5 174.624 37.5H169.661ZM172.468 35.1421H174.624C175.582 35.1421 176.398 34.9175 177.071 34.4684C177.745 34.0043 178.262 33.3606 178.621 32.5372C178.995 31.6988 179.182 30.7257 179.182 29.6179C179.182 28.5101 178.995 27.5519 178.621 26.7435C178.262 25.9201 177.745 25.2913 177.071 24.8572C176.398 24.4081 175.582 24.1835 174.624 24.1835H172.468V35.1421ZM190.778 37.5V34.3561H193.967V37.5H190.778ZM204.104 37.5V35.1421H209.673C210.346 35.1421 210.855 34.94 211.2 34.5358C211.559 34.1166 211.739 33.5552 211.739 32.8516V21.8256H214.568V32.6944C214.568 33.4878 214.463 34.184 214.254 34.7828C214.044 35.3667 213.737 35.8607 213.333 36.2649C212.929 36.6691 212.42 36.976 211.806 37.1856C211.192 37.3952 210.474 37.5 209.65 37.5H204.104ZM206.012 21.8256H214.344V24.1835H206.012V21.8256ZM222.459 32.0432V29.6853H226.366C227.28 29.6853 228.013 29.4308 228.567 28.9218C229.121 28.3978 229.398 27.7166 229.398 26.8782C229.398 26.0698 229.136 25.4186 228.612 24.9246C228.088 24.4305 227.392 24.1835 226.524 24.1835H222.459V21.8256H226.524C227.691 21.8256 228.709 22.0352 229.578 22.4544C230.461 22.8586 231.142 23.4425 231.621 24.206C232.1 24.9695 232.34 25.8602 232.34 26.8782C232.34 27.9112 232.093 28.817 231.599 29.5954C231.105 30.3739 230.409 30.9802 229.51 31.4144C228.627 31.8336 227.587 32.0432 226.389 32.0432H222.459ZM220.438 37.5V21.8256H223.268V37.5H220.438ZM243.128 37.7695C241.75 37.7695 240.545 37.4326 239.512 36.7589C238.479 36.0853 237.671 35.1421 237.087 33.9295C236.518 32.7168 236.234 31.2946 236.234 29.6628C236.234 28.046 236.518 26.6312 237.087 25.4186C237.671 24.206 238.487 23.2628 239.535 22.5891C240.597 21.9005 241.848 21.5561 243.285 21.5561C244.348 21.5561 245.321 21.7732 246.204 22.2074C247.087 22.6265 247.806 23.2403 248.36 24.0488C248.929 24.8422 249.251 25.8078 249.325 26.9456H246.226C246.122 26.0474 245.807 25.3213 245.283 24.7674C244.759 24.1985 244.071 23.914 243.217 23.914C242.454 23.914 241.765 24.1461 241.151 24.6102C240.538 25.0593 240.051 25.7105 239.692 26.5639C239.347 27.4172 239.175 28.4502 239.175 29.6628C239.175 30.8904 239.355 31.9384 239.714 32.8067C240.088 33.66 240.59 34.3112 241.219 34.7604C241.848 35.1945 242.566 35.4116 243.375 35.4116C244.063 35.4116 244.67 35.2918 245.194 35.0523C245.717 34.8127 246.167 34.4984 246.541 34.1091V31.4593L244.026 31.5491L244.116 29.1688H249.325V34.9175C248.697 35.8158 247.858 36.5194 246.81 37.0284C245.762 37.5225 244.535 37.7695 243.128 37.7695ZM279.12 39.6782H276.448V21.8032H279.12V39.6782ZM278.244 39.6782H273.304V37.5898H278.244V39.6782ZM278.244 23.8916H273.304V21.8032H278.244V23.8916Z" fill="#E84A5F"/>
              </svg>
              <span class="rail-tooltip">[ UNTITLED.JPG ]</span>
            </a>
          </div>
        </div>

        <!-- RIGHT GROUP: Search Controls + Icon Navigation -->
        <div class="sidebar-right-group">
          ${searchSection}

          <!-- Pinned Icons: Home (Vertical rail only), Archive, Gallery, Subscribe, LinkedIn -->
          <div class="sidebar-bottom-icons">
            <a href="index.html" id="sidebar-home-btn" title="Home Feed" aria-label="Home">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span class="rail-tooltip">&gt;&gt; GO HOME</span>
            </a>
            <a href="archive.html" id="sidebar-archive-btn" title="Chronological Archive" aria-label="Archive">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span class="rail-tooltip"># ARCHIVE_TIMELINE</span>
            </a>
            <a href="network.html" id="sidebar-network-btn" title="Taxonomy Node Map Network" aria-label="Network">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><line x1="8" y1="7.5" x2="10" y2="10.5"/><line x1="16" y1="7.5" x2="14" y2="10.5"/><line x1="8" y1="16.5" x2="10" y2="13.5"/><line x1="16" y1="16.5" x2="14" y2="13.5"/></svg>
              <span class="rail-tooltip"># NETWORK_NODEMAP</span>
            </a>
            <a href="gallery.html" id="sidebar-gallery-btn" title="Cover Art Gallery" aria-label="Gallery">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span class="rail-tooltip"># GALLERY_VAULT</span>
            </a>
            <a href="javascript:void(0)" id="sidebar-subscribe-btn" title="Subscribe to Dispatches" aria-label="Subscribe">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span class="rail-tooltip">&gt;&gt; SUB-SCRIBE</span>
            </a>
            <a href="about.html" id="sidebar-about-btn" title="About the Author & Publication" aria-label="About">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span class="rail-tooltip">? ABOUT_AUTHOR</span>
            </a>
          </div>

          <!-- Hamburger Button (Displayed on mobile screens <= 590px) -->
          <button type="button" class="top-nav-hamburger-btn" id="top-nav-hamburger-btn" title="Navigation Menu" aria-label="Navigation Menu" aria-expanded="false" aria-haspopup="true">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </aside>

      <!-- Hamburger Menu Dropdown Overlay -->
      <div id="top-nav-hamburger-dropdown" class="top-dropdown-panel menu-dropdown-panel hamburger-panel" style="display:none;">
        <div class="dropdown-header">[ NAVIGATION ]</div>
        ${
          hasSearch
            ? `
          <button type="button" class="dropdown-option hamburger-nav-opt" id="hamburger-search-opt">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            SEARCH DISPATCHES
          </button>
        `
            : ""
        }
        <a href="index.html" class="dropdown-option hamburger-nav-opt" id="hamburger-home-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          &gt;&gt; GO HOME
        </a>
        <a href="archive.html" class="dropdown-option hamburger-nav-opt" id="hamburger-archive-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          # ARCHIVE_TIMELINE
        </a>
        <a href="network.html" class="dropdown-option hamburger-nav-opt" id="hamburger-network-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><line x1="8" y1="7.5" x2="10" y2="10.5"/><line x1="16" y1="7.5" x2="14" y2="10.5"/><line x1="8" y1="16.5" x2="10" y2="13.5"/><line x1="16" y1="16.5" x2="14" y2="13.5"/></svg>
          # NETWORK_NODEMAP
        </a>
        <a href="gallery.html" class="dropdown-option hamburger-nav-opt" id="hamburger-gallery-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          # GALLERY_VAULT
        </a>
        <a href="about.html" class="dropdown-option hamburger-nav-opt" id="hamburger-about-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          ? ABOUT_AUTHOR
        </a>
        <button type="button" class="dropdown-option hamburger-nav-opt" id="hamburger-subscribe-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          &gt;&gt; SUBSCRIBE
        </button>
      </div>
    `;

    this.highlightActivePage();
    this.highlightActiveFilter();
    this.bindEvents();
  }

  highlightActivePage() {
    const activeAttr = this.getAttribute("active-page") || "";
    const pathname = window.location.pathname.toLowerCase();

    const homeBtn = this.querySelector("#sidebar-home-btn");
    const archiveBtn = this.querySelector("#sidebar-archive-btn");
    const networkBtn = this.querySelector("#sidebar-network-btn");
    const galleryBtn = this.querySelector("#sidebar-gallery-btn");
    const aboutBtn = this.querySelector("#sidebar-about-btn");

    const hHomeBtn = this.querySelector("#hamburger-home-opt");
    const hArchiveBtn = this.querySelector("#hamburger-archive-opt");
    const hNetworkBtn = this.querySelector("#hamburger-network-opt");
    const hGalleryBtn = this.querySelector("#hamburger-gallery-opt");
    const hAboutBtn = this.querySelector("#hamburger-about-opt");

    [
      homeBtn,
      archiveBtn,
      networkBtn,
      galleryBtn,
      aboutBtn,
      hHomeBtn,
      hArchiveBtn,
      hNetworkBtn,
      hGalleryBtn,
      hAboutBtn,
    ].forEach((btn) => btn?.classList.remove("active"));

    if (activeAttr === "about" || pathname.includes("about.html")) {
      if (aboutBtn) aboutBtn.classList.add("active");
      if (hAboutBtn) hAboutBtn.classList.add("active");
    } else if (activeAttr === "network" || pathname.includes("network.html")) {
      if (networkBtn) networkBtn.classList.add("active");
      if (hNetworkBtn) hNetworkBtn.classList.add("active");
    } else if (activeAttr === "archive" || pathname.includes("archive.html")) {
      if (archiveBtn) archiveBtn.classList.add("active");
      if (hArchiveBtn) hArchiveBtn.classList.add("active");
    } else if (activeAttr === "gallery" || pathname.includes("gallery.html")) {
      if (galleryBtn) galleryBtn.classList.add("active");
      if (hGalleryBtn) hGalleryBtn.classList.add("active");
    } else if (
      activeAttr === "home" ||
      pathname.endsWith("index.html") ||
      pathname === "/" ||
      pathname.endsWith("/")
    ) {
      if (homeBtn) homeBtn.classList.add("active");
      if (hHomeBtn) hHomeBtn.classList.add("active");
    }
  }

  highlightActiveFilter() {
    const activeFilterAttr = (this.getAttribute("active-filter") || "")
      .toLowerCase()
      .replace(/s$/, "");
    const filterItems = this.querySelectorAll(".nav-link-item");

    filterItems.forEach((item) => {
      const f = (item.getAttribute("data-filter") || "")
        .toLowerCase()
        .replace(/s$/, "");
      if (f && f === activeFilterAttr && activeFilterAttr !== "all") {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  bindEvents() {
    const triggerSubscribe = (e) => {
      e.preventDefault();
      this.closeHamburgerDropdown();
      if (typeof window.openSubscribeModal === "function") {
        window.openSubscribeModal();
      } else {
        const modal = document.getElementById("subscribe-modal");
        if (modal && typeof modal.showModal === "function") {
          modal.showModal();
        }
      }
    };

    // Intercept format filters on home page for instant in-memory filtering without full page reloads
    const filterLinks = this.querySelectorAll(".nav-link-item");
    filterLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const isGridPage = Boolean(
          document.getElementById("card-matrix") ||
          (typeof window.applyCategoryFilter === "function" &&
            document.querySelector("[data-component='dispatch-matrix']")),
        );
        if (isGridPage && typeof window.applyCategoryFilter === "function") {
          e.preventDefault();
          const filter = (link.getAttribute("data-filter") || "all")
            .toLowerCase()
            .replace(/s$/, "");
          const currentActive = (this.getAttribute("active-filter") || "all")
            .toLowerCase()
            .replace(/s$/, "");
          if (currentActive === filter && filter !== "all") {
            window.applyCategoryFilter("all", true);
          } else {
            window.applyCategoryFilter(filter, true);
          }
        }
      });
    });

    const logoBtn = this.querySelector("#brand-logo-btn");
    if (logoBtn) {
      logoBtn.addEventListener("click", (e) => {
        const isGridPage = Boolean(
          document.getElementById("card-matrix") ||
          (typeof window.resetPage === "function" &&
            document.querySelector("[data-component='dispatch-matrix']")),
        );
        if (isGridPage && typeof window.resetPage === "function") {
          e.preventDefault();
          window.resetPage();
        }
      });
    }

    const subBtn = this.querySelector("#sidebar-subscribe-btn");
    if (subBtn) subBtn.addEventListener("click", triggerSubscribe);

    const hSubBtn = this.querySelector("#hamburger-subscribe-opt");
    if (hSubBtn) hSubBtn.addEventListener("click", triggerSubscribe);

    const dispatchBtn = this.querySelector("#dispatch-log-btn");
    if (dispatchBtn) {
      dispatchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeHamburgerDropdown();
        if (typeof window.toggleDispatchLogDropdown === "function") {
          window.toggleDispatchLogDropdown();
        }
      });
    }

    const searchBtn = this.querySelector("#top-navbar-search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeHamburgerDropdown();
        if (typeof window.toggleTopSearchDropdown === "function") {
          window.toggleTopSearchDropdown();
        }
      });
    }

    const hSearchBtn = this.querySelector("#hamburger-search-opt");
    if (hSearchBtn) {
      hSearchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeHamburgerDropdown();
        if (typeof window.toggleTopSearchDropdown === "function") {
          window.toggleTopSearchDropdown();
        } else {
          const searchPanel = document.getElementById("top-search-dropdown");
          if (searchPanel) {
            searchPanel.style.display = "block";
            searchPanel.style.left = "50%";
            searchPanel.style.right = "auto";
            searchPanel.style.transform = "translateX(-50%)";
            searchPanel.style.top = "54px";
            const input = searchPanel.querySelector("input");
            if (input) input.focus();
          }
        }
      });
    }

    const hamburgerBtn = this.querySelector("#top-nav-hamburger-btn");
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleHamburgerDropdown();
      });
    }

    // Handle global click outside to close hamburger dropdown if open
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".sidebar-rail") &&
        !e.target.closest(".top-dropdown-panel")
      ) {
        this.closeHamburgerDropdown();
      }
    });
  }

  toggleHamburgerDropdown() {
    const panel = this.querySelector("#top-nav-hamburger-dropdown");
    const btn = this.querySelector("#top-nav-hamburger-btn");
    if (!panel || !btn) return;

    if (typeof window.closeAllTopDropdowns === "function") {
      window.closeAllTopDropdowns("top-nav-hamburger-dropdown");
    }

    const isHidden = panel.style.display === "none" || !panel.style.display;
    panel.style.display = isHidden ? "flex" : "none";
    btn.classList.toggle("active", isHidden);
    btn.setAttribute("aria-expanded", isHidden ? "true" : "false");
  }

  closeHamburgerDropdown() {
    const panel = this.querySelector("#top-nav-hamburger-dropdown");
    const btn = this.querySelector("#top-nav-hamburger-btn");
    if (panel) panel.style.display = "none";
    if (btn) {
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
    }
  }
}

// Register Custom Web Component Element
if (!customElements.get("sidebar-rail")) {
  customElements.define("sidebar-rail", SidebarRail);
}
