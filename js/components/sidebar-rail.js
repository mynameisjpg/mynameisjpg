/**
 * UNTITLED.JPG — WEB COMPONENT: <sidebar-rail>
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
    return ['active-page', 'active-filter', 'has-search'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.children.length > 0) {
      if (name === 'active-page') this.highlightActivePage();
      if (name === 'active-filter') this.highlightActiveFilter();
      if (name === 'has-search') this.render();
    }
  }

  render() {
    const hasSearch = this.hasAttribute('has-search');

    const searchSection = hasSearch ? `
      <!-- Top Navbar Search Icon Button -->
      <div class="top-nav-controls-group">
        <button type="button" class="top-nav-icon-btn" id="top-navbar-search-btn" title="Search Dispatches" aria-label="Search Dispatches">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
    ` : '';

    // Render into Light DOM so all existing sidebar-rail.css rules, media queries, and tokens apply 100% natively
    this.innerHTML = `
      <aside class="sidebar-rail" data-component="sidebar-rail" aria-label="Main Navigation Rail">
        <!-- LEFT GROUP: Logo + Format Links / Dispatch Log Dropdown -->
        <div class="sidebar-left-group">
          <div class="sidebar-top-section">
            <a href="index.html" class="brand-logo-v" id="brand-logo-btn" title="Untitled.jpg">
              <span class="logo-full">[ UNTITLED.JPG ]</span>
              <span class="logo-short">[ .JPG ]</span>
              <span class="rail-tooltip">[ UNTITLED.JPG ]</span>
            </a>
          </div>

          <!-- Format links follow logo on the left -->
          <nav class="nav-stacked-vertical" id="category-filter-nav" aria-label="Format Filters">
            <a href="index.html?filter=essay" class="nav-link-item" data-filter="essay">
              _ESSAYS
              <span class="rail-tooltip">
                _ESSAYS
                <svg viewBox="0 0 24 24" class="tooltip-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </span>
            </a>
            <a href="index.html?filter=note" class="nav-link-item" data-filter="note">
              _NOTES
              <span class="rail-tooltip">
                _NOTES
                <svg viewBox="0 0 24 24" class="tooltip-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </span>
            </a>
            <a href="index.html?filter=bookmark" class="nav-link-item" data-filter="bookmark">
              _BOOKMARKS
              <span class="rail-tooltip">
                _BOOKMARKS
                <svg viewBox="0 0 24 24" class="tooltip-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </span>
            </a>
            <a href="index.html?filter=resource" class="nav-link-item" data-filter="resource">
              _RESOURCES
              <span class="rail-tooltip">
                _RESOURCES
                <svg viewBox="0 0 24 24" class="tooltip-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </span>
            </a>
          </nav>

          <!-- Collapsed format links dropdown button (Shown at width <= 740px) -->
          <button type="button" class="dispatch-log-dropdown-btn" id="dispatch-log-btn" aria-haspopup="true" aria-expanded="false" title="Format Options">
            _DISPATCH_LOG &#9660;
          </button>
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
            <a href="https://linkedin.com/in/jpgiuse" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <span class="rail-tooltip">/ LINK IN</span>
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
        ${hasSearch ? `
          <button type="button" class="dropdown-option hamburger-nav-opt" id="hamburger-search-opt">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            SEARCH DISPATCHES
          </button>
        ` : ''}
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
        <button type="button" class="dropdown-option hamburger-nav-opt" id="hamburger-subscribe-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          &gt;&gt; SUBSCRIBE
        </button>
        <a href="https://linkedin.com/in/jpgiuse" target="_blank" rel="noopener noreferrer" class="dropdown-option hamburger-nav-opt" id="hamburger-linkedin-opt">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          / LINKEDIN
        </a>
      </div>
    `;

    this.highlightActivePage();
    this.highlightActiveFilter();
    this.bindEvents();
  }

  highlightActivePage() {
    const activeAttr = this.getAttribute('active-page') || '';
    const pathname = window.location.pathname.toLowerCase();

    const homeBtn = this.querySelector('#sidebar-home-btn');
    const archiveBtn = this.querySelector('#sidebar-archive-btn');
    const networkBtn = this.querySelector('#sidebar-network-btn');
    const galleryBtn = this.querySelector('#sidebar-gallery-btn');

    const hHomeBtn = this.querySelector('#hamburger-home-opt');
    const hArchiveBtn = this.querySelector('#hamburger-archive-opt');
    const hNetworkBtn = this.querySelector('#hamburger-network-opt');
    const hGalleryBtn = this.querySelector('#hamburger-gallery-opt');

    [homeBtn, archiveBtn, networkBtn, galleryBtn, hHomeBtn, hArchiveBtn, hNetworkBtn, hGalleryBtn].forEach(btn => btn?.classList.remove('active'));

    if (activeAttr === 'network' || pathname.includes('network.html')) {
      if (networkBtn) networkBtn.classList.add('active');
      if (hNetworkBtn) hNetworkBtn.classList.add('active');
    } else if (activeAttr === 'archive' || pathname.includes('archive.html')) {
      if (archiveBtn) archiveBtn.classList.add('active');
      if (hArchiveBtn) hArchiveBtn.classList.add('active');
    } else if (activeAttr === 'gallery' || pathname.includes('gallery.html')) {
      if (galleryBtn) galleryBtn.classList.add('active');
      if (hGalleryBtn) hGalleryBtn.classList.add('active');
    } else if (activeAttr === 'home' || pathname.endsWith('index.html') || pathname === '/' || pathname.endsWith('/')) {
      if (homeBtn) homeBtn.classList.add('active');
      if (hHomeBtn) hHomeBtn.classList.add('active');
    }
  }

  highlightActiveFilter() {
    const activeFilterAttr = this.getAttribute('active-filter') || '';
    const filterItems = this.querySelectorAll('.nav-link-item');

    filterItems.forEach(item => {
      const f = item.getAttribute('data-filter');
      if (f && f === activeFilterAttr) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  bindEvents() {
    const triggerSubscribe = (e) => {
      e.preventDefault();
      this.closeHamburgerDropdown();
      if (typeof window.openSubscribeModal === 'function') {
        window.openSubscribeModal();
      } else {
        const modal = document.getElementById('subscribe-modal');
        if (modal && typeof modal.showModal === 'function') {
          modal.showModal();
        }
      }
    };

    const subBtn = this.querySelector('#sidebar-subscribe-btn');
    if (subBtn) subBtn.addEventListener('click', triggerSubscribe);

    const hSubBtn = this.querySelector('#hamburger-subscribe-opt');
    if (hSubBtn) hSubBtn.addEventListener('click', triggerSubscribe);

    const dispatchBtn = this.querySelector('#dispatch-log-btn');
    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeHamburgerDropdown();
        if (typeof window.toggleDispatchLogDropdown === 'function') {
          window.toggleDispatchLogDropdown();
        }
      });
    }

    const searchBtn = this.querySelector('#top-navbar-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeHamburgerDropdown();
        if (typeof window.toggleTopSearchDropdown === 'function') {
          window.toggleTopSearchDropdown();
        }
      });
    }

    const hSearchBtn = this.querySelector('#hamburger-search-opt');
    if (hSearchBtn) {
      hSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeHamburgerDropdown();
        if (typeof window.toggleTopSearchDropdown === 'function') {
          window.toggleTopSearchDropdown();
        } else {
          const searchPanel = document.getElementById('top-search-dropdown');
          if (searchPanel) {
            searchPanel.style.display = 'block';
            searchPanel.style.left = '50%';
            searchPanel.style.right = 'auto';
            searchPanel.style.transform = 'translateX(-50%)';
            searchPanel.style.top = '54px';
            const input = searchPanel.querySelector('input');
            if (input) input.focus();
          }
        }
      });
    }

    const hamburgerBtn = this.querySelector('#top-nav-hamburger-btn');
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleHamburgerDropdown();
      });
    }

    // Handle global click outside to close hamburger dropdown if open
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sidebar-rail') && !e.target.closest('.top-dropdown-panel')) {
        this.closeHamburgerDropdown();
      }
    });
  }

  toggleHamburgerDropdown() {
    const panel = this.querySelector('#top-nav-hamburger-dropdown');
    const btn = this.querySelector('#top-nav-hamburger-btn');
    if (!panel || !btn) return;

    if (typeof window.closeAllTopDropdowns === 'function') {
      window.closeAllTopDropdowns('top-nav-hamburger-dropdown');
    }

    const isHidden = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = isHidden ? 'flex' : 'none';
    btn.classList.toggle('active', isHidden);
    btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  }

  closeHamburgerDropdown() {
    const panel = this.querySelector('#top-nav-hamburger-dropdown');
    const btn = this.querySelector('#top-nav-hamburger-btn');
    if (panel) panel.style.display = 'none';
    if (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  }
}

// Register Custom Web Component Element
if (!customElements.get('sidebar-rail')) {
  customElements.define('sidebar-rail', SidebarRail);
}
