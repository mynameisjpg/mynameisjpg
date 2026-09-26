/* ==============================================================================
   UNTITLED.JPG — CHRONOLOGICAL ARCHIVE ENGINE (js/archive.js)
   Handles:
   - Left 50%: Compact Timeline Axis with centered 520px frame, 120px thumbnails & text metadata
   - Right 50%: Interactive Taxonomy Node Map canvas
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

let activeSortOrder = "newest";

function initArchiveListeners() {
  // Search input
  const searchInput = document.getElementById("archive-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTimelineList();
    });
  }

  // Top navbar search input
  const topSearchInput = document.getElementById("top-search-input");
  if (topSearchInput) {
    topSearchInput.addEventListener("input", (e) => {
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

  // Close top navbar dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    const isInsideNavBtn = e.target.closest(".top-nav-icon-btn");
    const isInsidePanel = e.target.closest(".top-dropdown-panel");
    if (!isInsideNavBtn && !isInsidePanel) {
      closeAllTopDropdowns();
    }
  });
}

function toggleDispatchLogDropdown() {
  closeAllTopDropdowns("dispatch-log-dropdown");
  const panel = document.getElementById("dispatch-log-dropdown");
  const btn = document.getElementById("dispatch-log-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
}

function toggleTopSearchDropdown() {
  closeAllTopDropdowns("top-search-dropdown");
  const panel = document.getElementById("top-search-dropdown");
  const btn = document.getElementById("top-navbar-search-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "block" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
  if (isHidden) {
    const input = document.getElementById("top-search-input");
    if (input) input.focus();
  }
}

function toggleTopFilterDropdown() {
  closeAllTopDropdowns("top-filter-dropdown");
  const panel = document.getElementById("top-filter-dropdown");
  const btn = document.getElementById("top-navbar-filter-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
}

function toggleTopSortDropdown() {
  closeAllTopDropdowns("top-sort-dropdown");
  const panel = document.getElementById("top-sort-dropdown");
  const btn = document.getElementById("top-navbar-sort-btn");
  if (!panel) return;
  const isHidden = panel.style.display === "none" || !panel.style.display;
  panel.style.display = isHidden ? "flex" : "none";
  if (btn) btn.classList.toggle("active", isHidden);
}

function closeAllTopDropdowns(exceptId = null) {
  const dropdowns = ["dispatch-log-dropdown", "top-search-dropdown", "top-filter-dropdown", "top-sort-dropdown"];
  const btns = ["dispatch-log-btn", "top-navbar-search-btn", "top-navbar-filter-btn", "top-navbar-sort-btn"];

  dropdowns.forEach((id, idx) => {
    if (id !== exceptId) {
      const panel = document.getElementById(id);
      const btn = document.getElementById(btns[idx]);
      if (panel) panel.style.display = "none";
      if (btn) btn.classList.remove("active");
    }
  });
}

function handleTopInlineSearch(val) {
  searchQuery = (val || "").toLowerCase().trim();

  // Sync inputs
  const inlineInput = document.getElementById("top-inline-search-input");
  const modalInput = document.getElementById("top-search-input");
  if (inlineInput && inlineInput.value !== val) inlineInput.value = val;
  if (modalInput && modalInput.value !== val) modalInput.value = val;

  renderTimelineList();
}

function applyTopFilter(formatKey) {
  activeFormatFilter = formatKey;

  // Highlight dropdown options
  document.querySelectorAll("#top-filter-dropdown .dropdown-option, #dispatch-log-dropdown .dropdown-option").forEach(opt => {
    const clickAttr = opt.getAttribute("onclick") || "";
    opt.classList.toggle("active", clickAttr.includes(`'${formatKey}'`));
  });

  // Sync category nav links
  document.querySelectorAll("#category-filter-nav .nav-link-item").forEach(link => {
    const f = link.getAttribute("data-filter");
    link.classList.toggle("active", f === formatKey);
  });

  // Update dispatch log dropdown button label
  const btn = document.getElementById("dispatch-log-btn");
  if (btn) {
    const label = formatKey === "all" ? "_DISPATCH_LOG" : `_${formatKey.toUpperCase()}S`;
    btn.innerHTML = `${label} &#9660;`;
  }

  renderTimelineList();
  closeAllTopDropdowns();
}

function applyTopSort(sortOrder) {
  activeSortOrder = sortOrder;
  document.querySelectorAll("#top-sort-dropdown .dropdown-option").forEach(opt => {
    const clickAttr = opt.getAttribute("onclick") || "";
    opt.classList.toggle("active", clickAttr.includes(`'${sortOrder}'`));
  });
  renderTimelineList();
  closeAllTopDropdowns();
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

  // Apply Sort Order
  if (activeSortOrder === "newest") {
    filteredTimelinePosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (activeSortOrder === "oldest") {
    filteredTimelinePosts.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (activeSortOrder === "title") {
    filteredTimelinePosts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

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

        <!-- Column 3: Thumbnail Box (Fixed 120px Height, Clickable Lightbox) -->
        <div class="timeline-thumb-col">
          <div class="timeline-thumb-box" onclick="openImageLightbox('${imageSrc}', '${post.title.replace(/'/g, "\\'")}')" title="Click to view full image">
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
 * RIGHT COLUMN: INTERACTIVE THREE.JS WEBGL 3D TAXONOMY NODE MAP ENGINE
 * ==============================================================================
 */

// Three.js Scene Global Handles
let threeScene, threeCamera, threeRenderer, threeControls;
let threeNodesGroup, threeLinesGroup, threeParticlesGroup;
let threeNodes = [];      // { mesh, labelSprite, data, initialPos, targetPos }
let threeLines = [];      // { lineMesh, fromNode, toNode, defaultColor, highlightColor }
let threeRaycaster, threeMouse;
let hoveredThreeNode = null;
let isThreeInitialized = false;

function initNodeMapCanvas() {
  canvas = document.getElementById("nodemap-canvas");
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!canvas || !wrapper) return;

  // Try initializing WebGL 3D Engine first
  if (typeof THREE !== "undefined") {
    try {
      isThreeInitialized = initThreeJSNodeMap();
      if (isThreeInitialized) return;
    } catch (e) {
      console.log("Three.js 3D WebGL initialization fallback active:", e);
    }
  }

  // Fallback 2D Canvas Engine
  init2DCanvasEngine(wrapper);
}

/**
 * ==============================================================================
 * THREE.JS WEBGL 3D ENGINE IMPLEMENTATION
 * ==============================================================================
 */

function initThreeJSNodeMap() {
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  canvas = document.getElementById("nodemap-canvas");
  if (!wrapper || !canvas || typeof THREE === "undefined") return false;

  const w = wrapper.clientWidth || 500;
  const h = wrapper.clientHeight || 500;

  // 1. Scene setup
  threeScene = new THREE.Scene();
  threeScene.fog = new THREE.FogExp2(0x121212, 0.0012);

  // 2. Camera setup
  threeCamera = new THREE.PerspectiveCamera(45, w / h, 1, 2000);
  threeCamera.position.set(0, 20, 420);

  // 3. WebGL Renderer
  threeRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  threeRenderer.setSize(w, h);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 4. Orbit Controls (Rotation, Pan, Zoom)
  if (typeof THREE.OrbitControls !== "undefined") {
    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.rotateSpeed = 0.7;
    threeControls.zoomSpeed = 0.9;
    threeControls.minDistance = 120;
    threeControls.maxDistance = 850;
    threeControls.autoRotate = true;
    threeControls.autoRotateSpeed = 0.4;
  }

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  threeScene.add(ambientLight);

  const lightRed = new THREE.PointLight(0xe84a5f, 2.2, 500);
  lightRed.position.set(120, 150, 180);
  threeScene.add(lightRed);

  const lightCyan = new THREE.PointLight(0x38bdf8, 1.8, 500);
  lightCyan.position.set(-150, -100, 150);
  threeScene.add(lightCyan);

  // Groups
  threeNodesGroup = new THREE.Group();
  threeLinesGroup = new THREE.Group();
  threeParticlesGroup = new THREE.Group();
  threeScene.add(threeNodesGroup);
  threeScene.add(threeLinesGroup);
  threeScene.add(threeParticlesGroup);

  // Raycasting setup
  threeRaycaster = new THREE.Raycaster();
  threeMouse = new THREE.Vector2(-999, -999);

  // Build Scene Content
  build3DStarfield();
  build3DNodeMapGraph();

  // Event Listeners
  window.addEventListener("resize", onThreeWindowResize);
  canvas.addEventListener("mousemove", onThreeMouseMove);
  canvas.addEventListener("click", onThreeMouseClick);
  canvas.addEventListener("mouseleave", onThreeMouseLeave);

  // Start 3D Render Loop
  animateThreeJS();
  return true;
}

function build3DStarfield() {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 900;
    positions[i + 1] = (Math.random() - 0.5) * 900;
    positions[i + 2] = (Math.random() - 0.5) * 900;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.35
  });

  const starfield = new THREE.Points(geometry, material);
  threeParticlesGroup.add(starfield);
}

function build3DNodeMapGraph() {
  // Clear previous meshes
  while (threeNodesGroup.children.length > 0) threeNodesGroup.remove(threeNodesGroup.children[0]);
  while (threeLinesGroup.children.length > 0) threeLinesGroup.remove(threeLinesGroup.children[0]);
  threeNodes = [];
  threeLines = [];

  if (!ARCHIVE_POSTS || ARCHIVE_POSTS.length === 0) return;

  // 1. Root Node: UNTITLED.JPG
  const rootData = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    color: "#E84A5F",
    postsCount: ARCHIVE_POSTS.length
  };

  const rootMesh = createSphereNodeMesh(14, 0xE84A5F, 0.7);
  rootMesh.position.set(0, 0, 0);
  threeNodesGroup.add(rootMesh);

  const rootSprite = create3DTextSprite("UNTITLED.JPG", "#E84A5F", 26);
  rootSprite.position.set(0, -22, 0);
  rootMesh.add(rootSprite);

  const rootNodeItem = { mesh: rootMesh, labelSprite: rootSprite, data: rootData };
  threeNodes.push(rootNodeItem);

  // 2. Extract Pillars
  const pillarMap = {};
  ARCHIVE_POSTS.forEach(p => {
    const pil = p.pillar || "GENERAL";
    if (!pillarMap[pil]) pillarMap[pil] = [];
    pillarMap[pil].push(p);
  });

  const pillarKeys = Object.keys(pillarMap);
  const pillarCount = pillarKeys.length;

  pillarKeys.forEach((pilName, idx) => {
    // Distribute pillars in 3D spherical shell
    const phi = Math.acos(-1 + (2 * idx) / pillarCount);
    const theta = Math.sqrt(pillarCount * Math.PI) * phi;
    const radius = 135;

    const px = radius * Math.cos(theta) * Math.sin(phi);
    const py = radius * Math.sin(theta) * Math.sin(phi);
    const pz = radius * Math.cos(phi);

    const pillarData = {
      id: `pillar_${idx}`,
      label: pilName,
      type: "pillar",
      color: "#FF6579",
      postsCount: pillarMap[pilName].length,
      postSlugs: pillarMap[pilName].map(p => p.slug)
    };

    const pillarMesh = createSphereNodeMesh(9, 0xFF6579, 0.4);
    pillarMesh.position.set(px, py, pz);
    threeNodesGroup.add(pillarMesh);

    const pillarSprite = create3DTextSprite(pilName.toUpperCase(), "#FF6579", 20);
    pillarSprite.position.set(0, -16, 0);
    pillarMesh.add(pillarSprite);

    const pillarNodeItem = { mesh: pillarMesh, labelSprite: pillarSprite, data: pillarData };
    threeNodes.push(pillarNodeItem);

    // Connect Root to Pillar in 3D
    create3DConnectionLine(rootNodeItem, pillarNodeItem, 0x993344, 0xe84a5f);

    // 3. Extract Tags for this pillar
    const tagSet = new Set();
    pillarMap[pilName].forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => tagSet.add(t));
      }
    });

    const pillarTags = Array.from(tagSet).slice(0, 4);
    const tagCount = pillarTags.length;

    pillarTags.forEach((tag, tIdx) => {
      const tagAngle = (tIdx / tagCount) * Math.PI * 2;
      const tagDist = 65;
      const tx = px + Math.cos(tagAngle) * tagDist;
      const ty = py + Math.sin(tagAngle) * tagDist * 0.7 + (tIdx % 2 === 0 ? 25 : -25);
      const tz = pz + Math.sin(tagAngle) * tagDist;

      const tagData = {
        id: `tag_${idx}_${tIdx}`,
        label: `#${tag}`,
        rawTag: tag,
        type: "tag",
        color: "#38BDF8",
        postsCount: pillarMap[pilName].filter(p => p.tags && p.tags.includes(tag)).length
      };

      const tagMesh = createSphereNodeMesh(5.5, 0x38BDF8, 0.3);
      tagMesh.position.set(tx, ty, tz);
      threeNodesGroup.add(tagMesh);

      const tagSprite = create3DTextSprite(`#${tag}`, "#38BDF8", 16);
      tagSprite.position.set(0, -12, 0);
      tagMesh.add(tagSprite);

      const tagNodeItem = { mesh: tagMesh, labelSprite: tagSprite, data: tagData };
      threeNodes.push(tagNodeItem);

      // Connect Pillar to Tag in 3D
      create3DConnectionLine(pillarNodeItem, tagNodeItem, 0x1e4f66, 0x38bdf8);
    });
  });
}

function createSphereNodeMesh(radius, colorHex, emissiveIntensity = 0.3) {
  const geo = new THREE.SphereGeometry(radius, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: emissiveIntensity,
    roughness: 0.25,
    metalness: 0.5
  });
  return new THREE.Mesh(geo, mat);
}

function splitTextIntoLines(text, maxCharsPerLine = 22) {
  if (!text || text.length <= maxCharsPerLine) return [text];

  // If text contains a comma (e.g. "PHILOSOPHY OF THE IMAGE, TECH & VISUAL CULTURE"), split by comma
  if (text.includes(",")) {
    const parts = text.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      const line1 = parts[0] + ",";
      const line2 = parts.slice(1).join(", ");
      return [line1, line2];
    }
  }

  // Otherwise split by space
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(w => {
    if ((currentLine + " " + w).trim().length <= maxCharsPerLine || !currentLine) {
      currentLine = currentLine ? currentLine + " " + w : w;
    } else {
      lines.push(currentLine);
      currentLine = w;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function create3DTextSprite(text, colorHexStr, fontSize = 20) {
  const lines = splitTextIntoLines(text, 22);
  const lineCount = lines.length;

  const canvasWidth = 440;
  const canvasHeight = lineCount > 1 ? 110 : 60;

  const canvasText = document.createElement("canvas");
  canvasText.width = canvasWidth;
  canvasText.height = canvasHeight;

  const tCtx = canvasText.getContext("2d");
  tCtx.font = `600 ${fontSize}px 'Azeret Mono', monospace`;
  tCtx.fillStyle = colorHexStr;
  tCtx.textAlign = "center";
  tCtx.textBaseline = "middle";

  const lineHeight = fontSize * 1.25;
  const startY = (canvasHeight / 2) - ((lineCount - 1) * lineHeight / 2);

  lines.forEach((l, i) => {
    tCtx.fillText(l, canvasWidth / 2, startY + (i * lineHeight));
  });

  const texture = new THREE.CanvasTexture(canvasText);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);

  const baseScaleY = lineCount > 1 ? 22 : 14;
  const aspect = canvasWidth / canvasHeight;
  sprite.scale.set(baseScaleY * aspect, baseScaleY, 1);
  return sprite;
}

function create3DConnectionLine(fromItem, toItem, defaultColorHex, highlightColorHex) {
  const points = [];
  points.push(fromItem.mesh.position);
  points.push(toItem.mesh.position);

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: defaultColorHex,
    transparent: true,
    opacity: 0.4,
    linewidth: 1
  });

  const lineMesh = new THREE.Line(geometry, material);
  threeLinesGroup.add(lineMesh);

  threeLines.push({
    mesh: lineMesh,
    fromItem: fromItem,
    toItem: toItem,
    defaultColorHex: defaultColorHex,
    highlightColorHex: highlightColorHex
  });
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  if (threeControls) threeControls.update();

  // Subtle background starfield rotation
  if (threeParticlesGroup) {
    threeParticlesGroup.rotation.y += 0.0003;
  }

  // 3D Raycasting hover update
  updateThreeRaycasting();

  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

function updateThreeRaycasting() {
  if (!threeRaycaster || !threeCamera || !threeNodesGroup) return;

  threeRaycaster.setFromCamera(threeMouse, threeCamera);
  const meshesToIntersect = threeNodes.map(n => n.mesh);
  const intersects = threeRaycaster.intersectObjects(meshesToIntersect);

  let newHovered = null;
  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    newHovered = threeNodes.find(n => n.mesh === hitMesh) || null;
  }

  if (hoveredThreeNode !== newHovered) {
    // Reset previous hovered node scale & highlight
    if (hoveredThreeNode) {
      hoveredThreeNode.mesh.scale.set(1, 1, 1);
    }

    hoveredThreeNode = newHovered;

    // Apply new hover effect
    if (hoveredThreeNode) {
      hoveredThreeNode.mesh.scale.set(1.4, 1.4, 1.4);
      if (canvas) canvas.style.cursor = "pointer";
    } else {
      if (canvas) canvas.style.cursor = "default";
    }

    // Update lines highlight
    threeLines.forEach(l => {
      const isConn = hoveredThreeNode && (l.fromItem === hoveredThreeNode || l.toItem === hoveredThreeNode);
      l.mesh.material.color.setHex(isConn ? l.highlightColorHex : l.defaultColorHex);
      l.mesh.material.opacity = isConn ? 0.95 : 0.4;
    });

    // Update Dock Metadata
    updateThreeDockMetadata(hoveredThreeNode);
  }
}

function updateThreeDockMetadata(nodeItem) {
  const dockTitle = document.getElementById("dock-node-title");
  const dockDesc = document.getElementById("dock-node-desc");
  if (!dockTitle || !dockDesc) return;

  if (nodeItem) {
    const d = nodeItem.data;
    dockTitle.textContent = `[ 3D NODE: ${d.label} ]`;
    if (d.type === "root") {
      dockDesc.textContent = `Central taxonomy core connecting ${ARCHIVE_POSTS.length} dispatches in 3D WebGL space.`;
    } else if (d.type === "pillar") {
      dockDesc.textContent = `Pillar category with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}. Click 3D node to filter timeline.`;
    } else {
      dockDesc.textContent = `Conceptual tag node with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}. Click 3D node to filter timeline.`;
    }
  } else if (!activeNodeFilter) {
    dockTitle.textContent = "[ 3D WEBGL GRAPH ACTIVE ]";
    dockDesc.textContent = "Drag to rotate 3D view. Scroll to zoom. Hover over nodes to inspect or click to filter timeline.";
  }
}

function onThreeMouseMove(e) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  threeMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  threeMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onThreeMouseClick() {
  if (!hoveredThreeNode) return;

  const clickedData = hoveredThreeNode.data;
  const clearNodeBtn = document.getElementById("clear-node-filter-btn");
  const statusLabel = document.getElementById("nodemap-status-label");

  if (activeNodeFilter === clickedData) {
    // Toggle off
    activeNodeFilter = null;
    activeTagFilter = null;
    if (clearNodeBtn) clearNodeBtn.style.display = "none";
    if (statusLabel) statusLabel.textContent = "EXPLORE 3D TAG NODES & CONCEPTUAL VECTORS";
  } else {
    activeNodeFilter = clickedData;
    if (clickedData.type === "pillar") {
      activeTagFilter = clickedData.label;
    } else if (clickedData.type === "tag") {
      activeTagFilter = clickedData.rawTag;
    } else {
      activeTagFilter = null;
    }

    if (clearNodeBtn) clearNodeBtn.style.display = "inline-block";
    if (statusLabel && activeTagFilter) {
      statusLabel.textContent = `FILTERED BY 3D NODE: ${activeTagFilter.toUpperCase()}`;
    }
  }

  renderTimelineList();
}

function onThreeMouseLeave() {
  threeMouse.set(-999, -999);
}

function onThreeWindowResize() {
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!wrapper || !threeRenderer || !threeCamera) return;
  const nw = wrapper.clientWidth;
  const nh = wrapper.clientHeight;
  threeCamera.aspect = nw / nh;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(nw, nh);
}

/**
 * ==============================================================================
 * FALLBACK 2D CANVAS ENGINE IMPLEMENTATION
 * ==============================================================================
 */

function init2DCanvasEngine(wrapper) {
  ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("mouseleave", handleCanvasMouseLeave);

  startNodeAnimationLoop();
}

function buildNodeMapData() {
  if (isThreeInitialized) {
    build3DNodeMapGraph();
    return;
  }

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
    radius: 18,
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
      const tagDistance = distance + 90;
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
    const margin = 35;
    if (n.x < margin || n.x > w - margin) n.vx *= -1;
    if (n.y < margin || n.y > h - margin) n.vy *= -1;

    // Slight dampening & subtle floating
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

    // Text Label (Supports Multi-line)
    ctx.font = `${isHovered || isActive ? "600" : "400"} 10px 'Azeret Mono', monospace`;
    ctx.fillStyle = isHovered || isActive ? "#FFFFFF" : (isConnected ? "#D4D4D4" : "#A0A0A0");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelLines = splitTextIntoLines(node.label, 20);
    labelLines.forEach((l, idx) => {
      ctx.fillText(l, node.x, node.y + r + 14 + (idx * 13));
    });
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
    dockDesc.textContent = "Hover over any tag or pillar node to highlight connected dispatches. Click to filter timeline.";
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

