/* ==============================================================================
   UNTITLED.JPG — CHRONOLOGICAL ARCHIVE ENGINE (js/archive.js)
   Handles:
   1. Left 50% Timeline Axis with polished 120px thumbnails & text metadata
   2. Right 50% Interactive Taxonomy Node Map canvas
   ============================================================================== */

let ARCHIVE_POSTS = [];
let filteredTimelinePosts = [];
let activeFormatFilter = "all";
let activeTagFilter = null;
let searchQuery = "";

// Node Map Canvas State
let canvas, ctx;
let nodes = [];
let connections = [];
let hoveredNode = null;
let activeNodeFilter = null;
let animFrameId = null;

document.addEventListener("DOMContentLoaded", () => {
  initArchiveApp();
});

function initArchiveApp() {
  if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
    ingestArchivePosts(window.DYNAMIC_POSTS);
  }

  fetchArchivePostsJson();
  initArchiveListeners();
  initNodeMapCanvas();
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

  renderTimelineList();
  buildNodeMapData();
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

  // Clear Node Filter button
  const clearNodeBtn = document.getElementById("clear-node-filter-btn");
  if (clearNodeBtn) {
    clearNodeBtn.addEventListener("click", () => {
      activeTagFilter = null;
      activeNodeFilter = null;
      clearNodeBtn.style.display = "none";
      const statusLabel = document.getElementById("nodemap-status-label");
      if (statusLabel) statusLabel.textContent = "EXPLORE TAG NODES & CONCEPTUAL VECTORS";
      renderTimelineList();
      resetNodeHighlights();
    });
  }
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

    // 2. Tag / Pillar Node Filter
    if (activeTagFilter) {
      const tagLower = activeTagFilter.toLowerCase();
      const pillar = (post.pillar || "").toLowerCase();
      const subtopic = (post.subtopic || "").toLowerCase();
      const tags = (post.tags || []).map(t => t.toLowerCase());
      
      const matchesPillar = pillar === tagLower;
      const matchesSubtopic = subtopic === tagLower;
      const matchesTag = tags.includes(tagLower);
      if (!matchesPillar && !matchesSubtopic && !matchesTag) return false;
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
    if (activeTagFilter) label += ` // NODE: ${activeTagFilter.toUpperCase()}`;
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

    // Format reading time duration (without "READ:")
    let readDuration = post.read_time || "8 MIN";
    readDuration = readDuration.replace(/^READ:\s*/i, '').replace(/^READ\s+/i, '').trim().toUpperCase();

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
      <li class="timeline-item" id="timeline-item-${post.slug}">
        <!-- Column 1: Date -->
        <div class="timeline-date-col">
          <div class="timeline-date-day">${dayNum} ${monthShort}</div>
          <div class="timeline-date-year">${yearFull}</div>
        </div>

        <!-- Column 2: Center Node on Spine -->
        <div class="timeline-node-col">
          <div class="timeline-node"></div>
        </div>

        <!-- Column 3: Thumbnail Box (Fixed 120px Height) -->
        <div class="timeline-thumb-col">
          <div class="timeline-thumb-box">
            <img src="${imageSrc}" alt="${post.title}" class="timeline-thumb-img" onerror="this.src='assets/images/turing1.png'" />
          </div>
        </div>

        <!-- Column 4: Text Content Payload -->
        <div class="timeline-content-col">
          <!-- Top Metadata: Plain text on 1 single line without chip boxes -->
          <div class="timeline-meta-top-text">
            <span class="meta-format-text">[${(post.format || "ESSAY").toUpperCase()}]</span>
            ${post.pillar ? `<span class="meta-sep-dot">•</span><span class="meta-topic-text">${post.pillar.toUpperCase()}</span>` : ''}
            ${post.subtopic ? `<span class="meta-sep-dot">•</span><span class="meta-topic-text">${post.subtopic.toUpperCase()}</span>` : ''}
          </div>

          <a href="index.html#dispatch-${post.slug}" class="timeline-title">${post.title}</a>
          ${post.excerpt ? `<p class="timeline-excerpt">${post.excerpt}</p>` : ''}

          <!-- Bottom Metadata Ordered: 1. Read Dispatch Button, 2. Duration, 3. Author -->
          <div class="timeline-meta-bottom">
            <a href="index.html#dispatch-${post.slug}" class="timeline-read-btn">[ READ DISPATCH ↗ ]</a>
            <span class="meta-sep">//</span>
            <span class="timeline-read-time">${readDuration}</span>
            <span class="meta-sep">//</span>
            <span class="timeline-author">BY: ${post.author || "Juan P. Giusepponi"}</span>
          </div>
        </div>
      </li>
    `;
  }).join("");

  container.innerHTML = `<ul class="timeline-list">${html}</ul>`;
}

function clearAllFilters() {
  activeFormatFilter = "all";
  activeTagFilter = null;
  activeNodeFilter = null;
  searchQuery = "";
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) searchInput.value = "";
  const clearNodeBtn = document.getElementById("clear-node-filter-btn");
  if (clearNodeBtn) clearNodeBtn.style.display = "none";
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(l => l.classList.remove("active"));
  const statusLabel = document.getElementById("nodemap-status-label");
  if (statusLabel) statusLabel.textContent = "EXPLORE TAG NODES & CONCEPTUAL VECTORS";
  renderTimelineList();
  resetNodeHighlights();
}

/**
 * ==============================================================================
 * RIGHT COLUMN: INTERACTIVE TAXONOMY NODE MAP ENGINE
 * ==============================================================================
 */

function initNodeMapCanvas() {
  canvas = document.getElementById("nodemap-canvas");
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!canvas || !wrapper) return;

  ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Canvas Interactions: Hover & Click
  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("mouseleave", handleCanvasMouseLeave);

  startNodeAnimationLoop();
}

function buildNodeMapData() {
  if (!canvas) return;

  const w = canvas.width || 500;
  const h = canvas.height || 500;
  const cx = w / 2;
  const cy = h / 2;

  nodes = [];
  connections = [];

  // Core Central Root Node
  const rootNode = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    x: cx,
    y: cy,
    vx: 0,
    vy: 0,
    radius: 20,
    color: "#E84A5F",
    postsCount: ARCHIVE_POSTS.length
  };
  nodes.push(rootNode);

  // Extract Unique Pillars
  const pillarMap = {};
  ARCHIVE_POSTS.forEach(p => {
    const pil = p.pillar || "GENERAL";
    if (!pillarMap[pil]) pillarMap[pil] = [];
    pillarMap[pil].push(p);
  });

  const pillarKeys = Object.keys(pillarMap);
  const pillarCount = pillarKeys.length;

  pillarKeys.forEach((pilName, idx) => {
    const angle = (idx / pillarCount) * Math.PI * 2;
    const distance = Math.min(w, h) * 0.26;
    const px = cx + Math.cos(angle) * distance;
    const py = cy + Math.sin(angle) * distance;

    const pillarNode = {
      id: `pillar_${idx}`,
      label: pilName,
      type: "pillar",
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 12,
      color: "#FF6579",
      postsCount: pillarMap[pilName].length,
      postSlugs: pillarMap[pilName].map(p => p.slug)
    };
    nodes.push(pillarNode);

    // Connect Root to Pillar
    connections.push({ from: rootNode, to: pillarNode, weight: 2 });

    // Extract Tags for this pillar
    const tagSet = new Set();
    pillarMap[pilName].forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => tagSet.add(t));
      }
    });

    const pillarTags = Array.from(tagSet).slice(0, 4);
    const tagCount = pillarTags.length;

    pillarTags.forEach((tag, tIdx) => {
      const tagAngle = angle + ((tIdx - (tagCount - 1) / 2) * 0.45);
      const tagDistance = distance + 95;
      const tx = cx + Math.cos(tagAngle) * tagDistance;
      const ty = cy + Math.sin(tagAngle) * tagDistance;

      const tagNode = {
        id: `tag_${idx}_${tIdx}`,
        label: `#${tag}`,
        rawTag: tag,
        type: "tag",
        x: tx,
        y: ty,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 8,
        color: "#38BDF8",
        postsCount: pillarMap[pilName].filter(p => p.tags && p.tags.includes(tag)).length
      };
      nodes.push(tagNode);

      // Connect Pillar to Tag
      connections.push({ from: pillarNode, to: tagNode, weight: 1 });
    });
  });
}

function startNodeAnimationLoop() {
  function animate() {
    if (ctx && canvas) {
      updatePhysics();
      drawNodeGraph();
    }
    animFrameId = requestAnimationFrame(animate);
  }

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animate();
}

function updatePhysics() {
  if (!canvas || nodes.length === 0) return;

  const w = canvas.width;
  const h = canvas.height;

  nodes.forEach(n => {
    if (n.type === "root") return; // Root stays centered

    n.x += n.vx;
    n.y += n.vy;

    // Soft bounds bouncing
    const margin = 40;
    if (n.x < margin || n.x > w - margin) n.vx *= -1;
    if (n.y < margin || n.y > h - margin) n.vy *= -1;

    // Slight dampening & subtle floating float
    n.vx += (Math.random() - 0.5) * 0.02;
    n.vy += (Math.random() - 0.5) * 0.02;
    n.vx *= 0.98;
    n.vy *= 0.98;
  });
}

function drawNodeGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Lines
  connections.forEach(conn => {
    const isHighlighted = (hoveredNode && (conn.from === hoveredNode || conn.to === hoveredNode)) ||
                          (activeNodeFilter && (conn.from === activeNodeFilter || conn.to === activeNodeFilter));

    ctx.beginPath();
    ctx.moveTo(conn.from.x, conn.from.y);
    ctx.lineTo(conn.to.x, conn.to.y);
    ctx.lineWidth = isHighlighted ? 2.5 : 1;
    ctx.strokeStyle = isHighlighted ? "rgba(232, 74, 95, 0.85)" : "rgba(255, 255, 255, 0.12)";
    ctx.stroke();
  });

  // Draw Nodes
  nodes.forEach(node => {
    const isHovered = hoveredNode === node;
    const isActive = activeNodeFilter === node;
    const isConnected = hoveredNode && connections.some(c => (c.from === hoveredNode && c.to === node) || (c.to === hoveredNode && c.from === node));

    const r = isHovered || isActive ? node.radius * 1.3 : node.radius;

    // Glow Effect
    if (isHovered || isActive || isConnected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = node.type === "tag" ? "rgba(56, 189, 248, 0.25)" : "rgba(232, 74, 95, 0.3)";
      ctx.fill();
    }

    // Node Circle Outer Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? "#FFFFFF" : "#141414";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isHovered || isActive ? "#FFFFFF" : node.color;
    ctx.stroke();

    // Inner Dot
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Text Label
    ctx.font = `${isHovered || isActive ? "600" : "400"} 10px 'Azeret Mono', monospace`;
    ctx.fillStyle = isHovered || isActive ? "#FFFFFF" : (isConnected ? "#D4D4D4" : "#A0A0A0");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y + r + 14);
  });
}

function handleCanvasMouseMove(e) {
  if (!canvas || nodes.length === 0) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let found = null;
  nodes.forEach(n => {
    const dist = Math.hypot(n.x - mx, n.y - my);
    if (dist < n.radius + 10) {
      found = n;
    }
  });

  hoveredNode = found;
  canvas.style.cursor = found ? "pointer" : "default";

  // Update Dock Text
  const dockTitle = document.getElementById("dock-node-title");
  const dockDesc = document.getElementById("dock-node-desc");

  if (found && dockTitle && dockDesc) {
    dockTitle.textContent = `[ NODE: ${found.label} ]`;
    if (found.type === "root") {
      dockDesc.textContent = `Central taxonomy core connecting ${ARCHIVE_POSTS.length} dispatches across conceptual pillars.`;
    } else if (found.type === "pillar") {
      dockDesc.textContent = `Pillar category with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter timeline.`;
    } else {
      dockDesc.textContent = `Conceptual tag node with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter timeline.`;
    }
  } else if (!activeNodeFilter && dockTitle && dockDesc) {
    dockTitle.textContent = "[ NODE MAP ACTIVE ]";
    dockDesc.textContent = "Hover over any tag or pillar node to highlight connected dispatches. Click to filter.";
  }
}

function handleCanvasClick(e) {
  if (!hoveredNode) return;

  const clearNodeBtn = document.getElementById("clear-node-filter-btn");
  const statusLabel = document.getElementById("nodemap-status-label");

  if (activeNodeFilter === hoveredNode) {
    // Toggle off
    activeNodeFilter = null;
    activeTagFilter = null;
    if (clearNodeBtn) clearNodeBtn.style.display = "none";
    if (statusLabel) statusLabel.textContent = "EXPLORE TAG NODES & CONCEPTUAL VECTORS";
  } else {
    activeNodeFilter = hoveredNode;
    if (hoveredNode.type === "pillar") {
      activeTagFilter = hoveredNode.label;
    } else if (hoveredNode.type === "tag") {
      activeTagFilter = hoveredNode.rawTag;
    } else {
      activeTagFilter = null;
    }

    if (clearNodeBtn) clearNodeBtn.style.display = "inline-block";
    if (statusLabel && activeTagFilter) {
      statusLabel.textContent = `FILTERED BY NODE: ${activeTagFilter.toUpperCase()}`;
    }
  }

  renderTimelineList();
}

function handleCanvasMouseLeave() {
  hoveredNode = null;
}

function resetNodeHighlights() {
  activeNodeFilter = null;
  hoveredNode = null;
}
