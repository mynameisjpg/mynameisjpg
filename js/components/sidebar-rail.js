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
              <svg class="brand-logo-svg"viewBox="0 0 258 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5.71893e-05 18.1221V0.247004H2.67234V18.1221H5.71893e-05ZM0.875847 18.1221V16.0337H5.8162V18.1221H0.875847ZM0.875847 2.33543V0.247004H5.8162V2.33543H0.875847ZM36.1944 16.2133C34.9219 16.2133 33.8216 15.9738 32.8934 15.4947C31.9652 15.0007 31.2466 14.3195 30.7376 13.4512C30.2436 12.5679 29.9965 11.5424 29.9965 10.3747V0.269461H32.826V10.3747C32.826 11.0784 32.9608 11.6922 33.2302 12.2161C33.5147 12.7251 33.9114 13.1219 34.4204 13.4063C34.9294 13.6907 35.5208 13.833 36.1944 13.833C36.8831 13.833 37.4744 13.6907 37.9685 13.4063C38.4775 13.1219 38.8667 12.7251 39.1362 12.2161C39.4206 11.6922 39.5629 11.0784 39.5629 10.3747V0.269461H42.4148V10.3747C42.4148 11.5424 42.1603 12.5679 41.6513 13.4512C41.1423 14.3195 40.4237 15.0007 39.4955 15.4947C38.5673 15.9738 37.467 16.2133 36.1944 16.2133ZM47.1394 15.9438V0.269461H50.6874L56.5036 12.3509L56.3015 7.23086V0.269461H58.9737V15.9438H55.4481L49.5871 4.01964L49.8116 8.98244V15.9438H47.1394ZM68.4815 15.9438V2.62736H63.586V0.269461H76.1839V2.62736H71.2885V15.9438H68.4815ZM85.3323 15.9438V0.269461H88.1394V15.9438H85.3323ZM81.5148 0.269461H91.9569V2.62736H81.5148V0.269461ZM81.5148 13.586H91.9569V15.9438H81.5148V13.586ZM102.183 15.9438V2.62736H97.2878V0.269461H109.886V2.62736H104.99V15.9438H102.183ZM115.419 15.9438V0.269461H118.248V13.586H126.243V15.9438H115.419ZM131.798 15.9438V0.269461H143.161V2.62736H134.605V6.647H140.376V9.0049H134.605V13.586H143.251V15.9438H131.798ZM148.29 15.9438V0.269461H153.252C154.42 0.269461 155.461 0.456596 156.374 0.830864C157.302 1.19016 158.088 1.71414 158.732 2.40279C159.375 3.07648 159.869 3.89239 160.214 4.85051C160.558 5.80864 160.73 6.87905 160.73 8.06174C160.73 9.2594 160.558 10.3448 160.214 11.3179C159.869 12.276 159.375 13.1069 158.732 13.8105C158.088 14.4992 157.302 15.0306 156.374 15.4049C155.461 15.7642 154.42 15.9438 153.252 15.9438H148.29ZM151.097 13.586H153.252C154.21 13.586 155.026 13.3614 155.7 12.9123C156.374 12.4482 156.89 11.8044 157.25 10.981C157.624 10.1427 157.811 9.16958 157.811 8.06174C157.811 6.95391 157.624 5.99578 157.25 5.18736C156.89 4.36396 156.374 3.73519 155.7 3.30104C155.026 2.85192 154.21 2.62736 153.252 2.62736H151.097V13.586ZM169.407 15.9438V12.8H172.596V15.9438H169.407ZM182.732 15.9438V13.586H188.301C188.975 13.586 189.484 13.3838 189.828 12.9796C190.188 12.5605 190.367 11.9991 190.367 11.2954V0.269461H193.197V11.1382C193.197 11.9317 193.092 12.6278 192.883 13.2267C192.673 13.8105 192.366 14.3045 191.962 14.7088C191.558 15.113 191.049 15.4199 190.435 15.6295C189.821 15.8391 189.102 15.9438 188.279 15.9438H182.732ZM184.641 0.269461H192.972V2.62736H184.641V0.269461ZM201.088 10.487V8.12911H204.995C205.908 8.12911 206.642 7.87461 207.196 7.3656C207.75 6.84162 208.027 6.16046 208.027 5.32209C208.027 4.51367 207.765 3.86244 207.241 3.36841C206.717 2.87437 206.021 2.62736 205.152 2.62736H201.088V0.269461H205.152C206.32 0.269461 207.338 0.479052 208.206 0.898233C209.09 1.30244 209.771 1.8863 210.25 2.64981C210.729 3.41332 210.968 4.30408 210.968 5.32209C210.968 6.35508 210.721 7.26081 210.227 8.03929C209.733 8.81777 209.037 9.42408 208.139 9.85823C207.256 10.2774 206.215 10.487 205.018 10.487H201.088ZM199.067 15.9438V0.269461H201.896V15.9438H199.067ZM221.756 16.2133C220.379 16.2133 219.174 15.8765 218.141 15.2028C217.108 14.5291 216.299 13.586 215.716 12.3733C215.147 11.1607 214.862 9.73847 214.862 8.10665C214.862 6.48981 215.147 5.07508 215.716 3.86244C216.299 2.64981 217.115 1.70665 218.163 1.03297C219.226 0.344315 220.476 -1.29683e-05 221.913 -1.29683e-05C222.976 -1.29683e-05 223.949 0.217063 224.833 0.651215C225.716 1.0704 226.435 1.6842 226.988 2.49262C227.557 3.28607 227.879 4.25168 227.954 5.38946H224.855C224.75 4.49122 224.436 3.76513 223.912 3.21122C223.388 2.64233 222.699 2.35788 221.846 2.35788C221.083 2.35788 220.394 2.58993 219.78 3.05402C219.166 3.50315 218.68 4.15437 218.32 5.00771C217.976 5.86104 217.804 6.89402 217.804 8.10665C217.804 9.33426 217.984 10.3822 218.343 11.2505C218.717 12.1038 219.219 12.7551 219.847 13.2042C220.476 13.6384 221.195 13.8554 222.003 13.8554C222.692 13.8554 223.298 13.7357 223.822 13.4961C224.346 13.2566 224.795 12.9422 225.17 12.553V9.90315L222.654 9.99297L222.744 7.61262H227.954V13.3614C227.325 14.2596 226.487 14.9633 225.439 15.4723C224.391 15.9663 223.163 16.2133 221.756 16.2133ZM257.748 18.1221H255.076V0.247004H257.748V18.1221ZM256.873 18.1221H251.932V16.0337H256.873V18.1221ZM256.873 2.33543H251.932V0.247004H256.873V2.33543Z" fill="#E84A5F"/>
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

          </div>
        </div>
      </aside>
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


    [
      homeBtn,
      archiveBtn,
      networkBtn,
      galleryBtn,
      aboutBtn,
    ].forEach((btn) => btn?.classList.remove("active"));

    if (activeAttr === "about" || pathname.includes("about.html")) {
      if (aboutBtn) aboutBtn.classList.add("active");
    } else if (activeAttr === "network" || pathname.includes("network.html")) {
      if (networkBtn) networkBtn.classList.add("active");
    } else if (activeAttr === "archive" || pathname.includes("archive.html")) {
      if (archiveBtn) archiveBtn.classList.add("active");
    } else if (activeAttr === "gallery" || pathname.includes("gallery.html")) {
      if (galleryBtn) galleryBtn.classList.add("active");
    } else if (
      activeAttr === "home" ||
      pathname.endsWith("index.html") ||
      pathname === "/" ||
      pathname.endsWith("/")
    ) {
      if (homeBtn) homeBtn.classList.add("active");
    }
  }

  highlightActiveFilter() {
    // Navigation rail now uses format-agnostic icon navigation
  }

  bindEvents() {
    const searchBtn = this.querySelector("#top-navbar-search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof window.toggleTopSearchDropdown === "function") {
          window.toggleTopSearchDropdown();
        }
      });
    }

    const subscribeBtn = this.querySelector("#sidebar-subscribe-btn");
    if (subscribeBtn) {
      subscribeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openSubscribeModal === "function") {
          window.openSubscribeModal();
        } else {
          const modal = document.getElementById("subscribe-modal");
          if (modal && typeof modal.showModal === "function") {
            modal.showModal();
          }
        }
      });
    }
  }
}

// Register Custom Web Component Element
if (!customElements.get("sidebar-rail")) {
  customElements.define("sidebar-rail", SidebarRail);
}

