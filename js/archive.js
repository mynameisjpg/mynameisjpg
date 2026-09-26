/* ==============================================================================
   UNTITLED.JPG — CHRONOLOGICAL ARCHIVE ENGINE (js/archive.js)
   Handles Timeline rendering on Left 50% & Interactive Calendar Grid on Right 50%.
   ============================================================================== */

let ARCHIVE_POSTS = [];
let filteredTimelinePosts = [];
let activeFormatFilter = "all";
let activeDateFilter = null; // null or "YYYY-MM-DD"
let currentYear = 2026;
let currentMonth = 8; // 0-indexed (8 = September)
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  initArchiveApp();
});

function initArchiveApp() {
  // Ingest posts from window.DYNAMIC_POSTS or fetch posts.json
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

  // Set default view date based on latest post
  if (ARCHIVE_POSTS.length > 0) {
    const latestDate = new Date(ARCHIVE_POSTS[0].date);
    if (!isNaN(latestDate.getTime())) {
      currentYear = latestDate.getFullYear();
      currentMonth = latestDate.getMonth();
    }
  }

  updateTimelineAndCalendar();
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

  // Calendar Prev/Next buttons
  const prevBtn = document.getElementById("calendar-prev-month");
  const nextBtn = document.getElementById("calendar-next-month");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendarGrid();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendarGrid();
    });
  }

  // Year Switcher Pills
  document.querySelectorAll(".year-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".year-pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const yr = btn.getAttribute("data-year");
      if (yr === "ALL") {
        activeDateFilter = null;
        renderTimelineList();
      } else {
        currentYear = parseInt(yr, 10);
        renderCalendarGrid();
      }
    });
  });

  // Clear date filter button
  const clearDateBtn = document.getElementById("clear-date-filter-btn");
  if (clearDateBtn) {
    clearDateBtn.addEventListener("click", () => {
      activeDateFilter = null;
      clearDateBtn.style.display = "none";
      updateTimelineAndCalendar();
    });
  }
}

function updateTimelineAndCalendar() {
  renderTimelineList();
  renderCalendarGrid();
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

    // 2. Exact Date Filter (if clicked from calendar)
    if (activeDateFilter) {
      const postDateStr = post.date.substring(0, 10);
      if (postDateStr !== activeDateFilter) return false;
    }

    // 3. Search query
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
    if (activeDateFilter) label += ` // DATE: ${activeDateFilter}`;
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
    const sysId = post.sys_id || "0x00";

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
      <li class="timeline-item ${activeDateFilter && post.date.substring(0,10) === activeDateFilter ? 'active-highlight' : ''}" id="timeline-item-${post.slug}">
        <!-- Column 1: Date -->
        <div class="timeline-date-col">
          <div class="timeline-date-day">${dayNum} ${monthShort}</div>
          <div class="timeline-date-year">${yearFull}</div>
        </div>

        <!-- Column 2: Center Node on Spine -->
        <div class="timeline-node-col">
          <div class="timeline-node"></div>
        </div>

        <!-- Column 3: Dithered Thumbnail -->
        <div class="timeline-thumb-col">
          <div class="timeline-thumb-box">
            <img src="${imageSrc}" alt="${post.title}" class="timeline-thumb-img" onerror="this.src='assets/images/turing1.png'" />
          </div>
        </div>

        <!-- Column 4: Text Content Payload -->
        <div class="timeline-content-col">
          <div class="timeline-meta-top">
            <span class="meta-chip chip-primary">[${(post.format || "ESSAY").toUpperCase()}]</span>
            ${post.pillar ? `<span class="meta-chip">[${post.pillar}]</span>` : ''}
            ${post.subtopic ? `<span class="meta-chip">[${post.subtopic}]</span>` : ''}
          </div>

          <a href="index.html#dispatch-${post.slug}" class="timeline-title">${post.title}</a>
          ${post.excerpt ? `<p class="timeline-excerpt">${post.excerpt}</p>` : ''}

          <div class="timeline-meta-bottom">
            <span>READ: ${post.read_time || "8 MIN READ"}</span>
            <span>//</span>
            <span>BY: ${post.author || "Juan P. Giusepponi"}</span>
            <span>//</span>
            <span>SYS_ID: <code>${sysId}</code></span>
            <span>//</span>
            <a href="index.html#dispatch-${post.slug}" class="timeline-read-btn">[ READ DISPATCH ↗ ]</a>
          </div>
        </div>
      </li>
    `;
  }).join("");

  container.innerHTML = `<ul class="timeline-list">${html}</ul>`;
}

function clearAllFilters() {
  activeFormatFilter = "all";
  activeDateFilter = null;
  searchQuery = "";
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) searchInput.value = "";
  const clearDateBtn = document.getElementById("clear-date-filter-btn");
  if (clearDateBtn) clearDateBtn.style.display = "none";
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(l => l.classList.remove("active"));
  updateTimelineAndCalendar();
}

/**
 * Renders Right Column 7-Column Calendar Grid
 */
function renderCalendarGrid() {
  const monthDisplay = document.getElementById("calendar-current-month");
  const gridContainer = document.getElementById("calendar-grid-cells");
  if (!gridContainer) return;

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  if (monthDisplay) {
    monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  // Calculate First Day of Month & Total Days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Map posts for current year & month by day number
  const postsByDay = {};
  ARCHIVE_POSTS.forEach(post => {
    const pDate = new Date(post.date);
    if (!isNaN(pDate.getTime())) {
      if (pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth) {
        const day = pDate.getDate();
        if (!postsByDay[day]) postsByDay[day] = [];
        postsByDay[day].push(post);
      }
    }
  });

  let cellsHtml = "";

  // Previous month trailing days
  for (let x = firstDayIndex; x > 0; x--) {
    const prevDayNum = prevMonthDays - x + 1;
    cellsHtml += `
      <div class="calendar-day-cell other-month">
        <span class="day-number">${prevDayNum}</span>
      </div>
    `;
  }

  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayPosts = postsByDay[day] || [];
    const hasPosts = dayPosts.length > 0;
    const dateFormatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = activeDateFilter === dateFormatted;

    cellsHtml += `
      <div class="calendar-day-cell ${hasPosts ? 'has-posts' : ''} ${isSelected ? 'selected-date' : ''}" 
           data-date="${dateFormatted}" 
           data-day="${day}"
           onclick="handleCalendarDayClick('${dateFormatted}', ${hasPosts})">
        <span class="day-number">${day}</span>
        <div class="day-indicator-area">
          ${hasPosts ? `<span class="day-count-badge">[${dayPosts.length}]</span>` : ''}
          ${hasPosts ? `<div class="day-dot-indicator"></div>` : ''}
        </div>
      </div>
    `;
  }

  // Next month leading days to complete 35 cells
  const totalRendered = firstDayIndex + totalDaysInMonth;
  const remainingCells = (totalRendered <= 35 ? 35 : 42) - totalRendered;

  for (let y = 1; y <= remainingCells; y++) {
    cellsHtml += `
      <div class="calendar-day-cell other-month">
        <span class="day-number">${y}</span>
      </div>
    `;
  }

  gridContainer.innerHTML = cellsHtml;

  // Attach Hover Listener for Fixed Bottom Dock Preview
  attachCalendarHoverEvents(postsByDay);

  // Set default initial preview content if no cell is hovered
  setInitialDockPreview();
}

function handleCalendarDayClick(dateStr, hasPosts) {
  if (!hasPosts) return;

  const clearDateBtn = document.getElementById("clear-date-filter-btn");

  if (activeDateFilter === dateStr) {
    // Toggle off
    activeDateFilter = null;
    if (clearDateBtn) clearDateBtn.style.display = "none";
  } else {
    activeDateFilter = dateStr;
    if (clearDateBtn) clearDateBtn.style.display = "inline-block";
  }

  updateTimelineAndCalendar();

  // Scroll left timeline to top
  const scrollCol = document.querySelector(".timeline-scroll-container");
  if (scrollCol) scrollCol.scrollTop = 0;
}

function setInitialDockPreview() {
  const dock = document.getElementById("calendar-hover-preview");
  if (!dock) return;

  if (activeDateFilter) {
    const matchingPosts = ARCHIVE_POSTS.filter(p => p.date.substring(0, 10) === activeDateFilter);
    if (matchingPosts.length > 0) {
      dock.innerHTML = `
        <div class="dock-date-title">
          <span>[ FILTERED DATE: ${activeDateFilter} ]</span>
          <span>${matchingPosts.length} DISPATCH${matchingPosts.length > 1 ? 'ES' : ''}</span>
        </div>
        <div class="dock-post-item">
          <a href="index.html#dispatch-${matchingPosts[0].slug}" class="dock-post-title">${matchingPosts[0].title}</a>
          <div class="dock-post-meta">
            <span>[${(matchingPosts[0].format || 'ESSAY').toUpperCase()}]</span> • 
            <span>${matchingPosts[0].read_time || '8 MIN READ'}</span> • 
            <span>${matchingPosts[0].pillar || ''}</span>
          </div>
        </div>
      `;
      return;
    }
  }

  // Fallback default dock message
  dock.innerHTML = `
    <div class="dock-date-title">
      <span>[ CALENDAR DENSITY MATRIX ]</span>
      <span>INSPECTION DOCK</span>
    </div>
    <div class="dock-post-item">
      <span class="dock-post-title" style="color:var(--text-muted); font-size:0.75rem;">Hover or click any illuminated day cell to inspect dispatch details.</span>
    </div>
  `;
}

function attachCalendarHoverEvents(postsByDay) {
  const cells = document.querySelectorAll(".calendar-day-cell.has-posts");
  const dock = document.getElementById("calendar-hover-preview");
  if (!dock) return;

  cells.forEach(cell => {
    cell.addEventListener("mouseenter", () => {
      const day = parseInt(cell.getAttribute("data-day"), 10);
      const dateStr = cell.getAttribute("data-date");
      const posts = postsByDay[day] || [];

      if (posts.length > 0) {
        dock.innerHTML = `
          <div class="dock-date-title">
            <span>[ DATE: ${dateStr} ]</span>
            <span>${posts.length} DISPATCH${posts.length > 1 ? 'ES' : ''}</span>
          </div>
          <div class="dock-post-item">
            <a href="index.html#dispatch-${posts[0].slug}" class="dock-post-title">${posts[0].title}</a>
            <div class="dock-post-meta">
              <span>[${(posts[0].format || 'ESSAY').toUpperCase()}]</span> • 
              <span>${posts[0].read_time || '8 MIN READ'}</span> • 
              <span>${posts[0].pillar || ''}</span>
            </div>
          </div>
        `;
      }
    });

    cell.addEventListener("mouseleave", () => {
      setInitialDockPreview();
    });
  });
}
