/* ==============================================================================
   UNTITLED.JPG — INTERACTIVE TAXONOMY NODE MAP NETWORK ENGINE (js/network.js)
   Handles:
   - Full View: Interactive Three.js 3D WebGL Tag Node Constellation & 2D Canvas Fallback
   - View Toggle: 3D Node Graph View vs Tags Directory Table View
   - Dynamic Taxonomy Data Ingestion, Search, and Connected Dispatch Inspection
   ============================================================================== */

let NETWORK_POSTS = [];
let NETWORK_TAGS_DATA = [];
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

// Three.js Scene Global Handles
let threeScene, threeCamera, threeRenderer, threeControls;
let threeNodesGroup, threeLinesGroup, threeParticlesGroup;
let threeNodes = [];      // { mesh, labelSprite, data, initialPos, targetPos }
let threeLines = [];      // { lineMesh, fromNode, toNode, defaultColor, highlightColor }
let threeRaycaster, threeMouse;
let hoveredThreeNode = null;
let isThreeInitialized = false;

document.addEventListener("DOMContentLoaded", () => {
  initNetworkApp();
});

function initNetworkApp() {
  if (typeof window !== "undefined" && window.DYNAMIC_POSTS) {
    ingestNetworkPosts(window.DYNAMIC_POSTS);
  }
  if (typeof window !== "undefined" && window.DYNAMIC_TAGS) {
    NETWORK_TAGS_DATA = window.DYNAMIC_TAGS;
  }

  fetchNetworkPostsJson();
  fetchNetworkTagsJson();
  initNetworkListeners();
  initNodeMapCanvas();
  initSubscribeAnimation();
  renderTagsDirectoryTable();
}

let isSubscribeAnimScheduled = false;

function initSubscribeAnimation() {
  if (isSubscribeAnimScheduled) return;
  isSubscribeAnimScheduled = true;

  const DELAY_MS = 6000;
  const ANIMATION_DURATION_MS = 4500;

  setTimeout(() => {
    const subscribeTargets = document.querySelectorAll('#sidebar-subscribe-btn, a[aria-label="Subscribe"], a[title*="Subscribe"]');
    if (!subscribeTargets || subscribeTargets.length === 0) return;

    subscribeTargets.forEach(el => {
      el.classList.add("subscribe-ring-vibrate");
      const svg = el.querySelector("svg");
      if (svg) svg.classList.add("subscribe-ring-vibrate");
    });

    const onAnimationDone = () => {
      subscribeTargets.forEach(el => {
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

function ingestNetworkPosts(postsArray) {
  if (!Array.isArray(postsArray)) return;

  const seen = new Set();
  NETWORK_POSTS = [];

  postsArray.forEach(p => {
    const key = p.slug || p.id || p.sys_id;
    const status = (p.status || "published").toLowerCase();
    if (key && !seen.has(key) && (status === "published" || status === "active")) {
      seen.add(key);
      NETWORK_POSTS.push(p);
    }
  });

  NETWORK_POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));

  buildNodeMapData();
  checkUrlTagParameters();
}

function checkUrlTagParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  let tag = urlParams.get("tag") || urlParams.get("node") || urlParams.get("topic") || urlParams.get("filter");

  if (!tag && window.location.hash) {
    const hash = window.location.hash.replace(/^#tag-?/i, "").replace(/^#/, "");
    if (hash && hash !== "network" && !hash.startsWith("dispatch-") && hash !== "nodemap-canvas-wrapper") {
      tag = decodeURIComponent(hash);
    }
  }

  if (tag) {
    applyTagFilterDirectly(tag);
  }
}

function setNodeFilterUIState(isFiltered, filterText = "") {
  document.querySelectorAll("#clear-node-filter-btn, .btn-clear-node-filter").forEach(btn => {
    btn.style.display = isFiltered ? "inline-flex" : "none";
  });
  document.querySelectorAll("#nodemap-status-label, .top-navbar-legend-badge").forEach(label => {
    if (isFiltered) {
      label.textContent = `FILTERED BY NODE: ${filterText.toUpperCase()}`;
    } else {
      label.textContent = "EXPLORE 3D TAG NODES & CONCEPTUAL VECTORS";
    }
  });
}

function applyTagFilterDirectly(tag) {
  if (!tag) return;
  activeTagFilter = tag.trim();

  setNodeFilterUIState(true, activeTagFilter);

  const tagLower = activeTagFilter.toLowerCase();
  if (typeof threeNodes !== "undefined" && threeNodes && threeNodes.length > 0) {
    const match = threeNodes.find(n => {
      const d = n.data;
      if (!d) return false;
      const l = (d.label || "").toLowerCase().replace(/^#/, "");
      const raw = (d.rawTag || "").toLowerCase();
      return l === tagLower || raw === tagLower;
    });
    if (match) activeNodeFilter = match.data;
  } else if (typeof nodes !== "undefined" && nodes && nodes.length > 0) {
    const match = nodes.find(n => {
      const l = (n.label || "").toLowerCase().replace(/^#/, "");
      const raw = (n.rawTag || "").toLowerCase();
      return l === tagLower || raw === tagLower;
    });
    if (match) activeNodeFilter = match;
  }
}

async function fetchNetworkPostsJson() {
  try {
    const res = await fetch("posts.json?t=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      ingestNetworkPosts(data);
    }
  } catch (err) {
    console.log("Network Posts JSON fetch fallback active.");
  }
}

async function fetchNetworkTagsJson() {
  try {
    const res = await fetch("tags.json?t=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        NETWORK_TAGS_DATA = data;
        renderTagsDirectoryTable();
      }
    }
  } catch (err) {
    console.log("Network Tags JSON fetch fallback active.");
  }
}

function renderTagsDirectoryTable(searchVal = "") {
  const tbody = document.getElementById("tags-directory-tbody");
  const countLabel = document.getElementById("tags-table-count-label");
  if (!tbody) return;

  const rawData = (window.DYNAMIC_TAGS || NETWORK_TAGS_DATA || []);
  const searchLower = (searchVal || "").toLowerCase().trim();

  const filtered = rawData.filter(t => {
    if (!searchLower) return true;
    const nameMatch = (t.name || "").toLowerCase().includes(searchLower);
    const typeMatch = (t.type || "").toLowerCase().includes(searchLower);
    const postsMatch = (t.posts || []).some(p => (p.title || "").toLowerCase().includes(searchLower));
    return nameMatch || typeMatch || postsMatch;
  });

  if (countLabel) {
    countLabel.textContent = `TOTAL TAXONOMY ITEMS: ${filtered.length}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted); font-family: var(--font-mono);">
          [ NO TAXONOMY TAGS OR TOPICS MATCHING SELECTION ]
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const typeBadgeClass = t.type === "pillar" ? "tag-type-pillar" : (t.type === "subtopic" ? "tag-type-subtopic" : "tag-type-tag");
    const typeLabel = t.type.toUpperCase();

    const linksHtml = (t.links || []).map(l => {
      const fmt = (l.format || "ESSAY").toUpperCase();
      return `<a href="${l.url}" class="tag-dispatch-link" title="${l.title}">
        <span class="link-fmt">[${fmt}]</span> ${l.title}
      </a>`;
    }).join("");

    return `
      <tr class="tags-table-row" data-tag="${t.name}">
        <td class="tag-name-cell">
          <a href="javascript:void(0)" class="tag-directory-filter-link" onclick="applyTagFilterDirectly('${t.name}')">
            ${t.type === 'tag' ? '#' : ''}${t.name}
          </a>
        </td>
        <td><span class="tag-type-badge ${typeBadgeClass}">${typeLabel}</span></td>
        <td class="tag-count-cell">${t.count}</td>
        <td class="tag-links-cell">${linksHtml}</td>
      </tr>
    `;
  }).join("");
}

function initNetworkListeners() {
  // View Toggle Buttons (Graph vs Table)
  const graphBtn = document.getElementById("toggle-view-graph-btn");
  const tableBtn = document.getElementById("toggle-view-table-btn");
  const canvasWrapper = document.getElementById("nodemap-canvas-wrapper");
  const tableWrapper = document.getElementById("tags-table-wrapper");

  if (graphBtn && tableBtn) {
    graphBtn.addEventListener("click", () => {
      graphBtn.classList.add("active");
      tableBtn.classList.remove("active");
      if (canvasWrapper) canvasWrapper.style.display = "block";
      if (tableWrapper) tableWrapper.style.display = "none";
    });

    tableBtn.addEventListener("click", () => {
      tableBtn.classList.add("active");
      graphBtn.classList.remove("active");
      if (canvasWrapper) canvasWrapper.style.display = "none";
      if (tableWrapper) tableWrapper.style.display = "flex";
      renderTagsDirectoryTable();
    });
  }

  // Tags Table Search Input
  const tagsSearchInput = document.getElementById("tags-table-search-input");
  if (tagsSearchInput) {
    tagsSearchInput.addEventListener("input", (e) => {
      renderTagsDirectoryTable(e.target.value);
    });
  }

  // Clear Node Filter button
  document.querySelectorAll("#clear-node-filter-btn, .btn-clear-node-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTagFilter = null;
      activeNodeFilter = null;
      setNodeFilterUIState(false);
      resetNodeHighlights();
    });
  });

  // Modal Listeners
  document.querySelectorAll("#subscribe-modal form, .modal-form").forEach(form => {
    form.addEventListener("submit", handleSubscribeSubmit);
  });
  document.querySelectorAll("#subscribe-modal .btn-modal-cancel, .btn-modal-cancel").forEach(btn => {
    btn.addEventListener("click", closeSubscribeModal);
  });

  const lightboxModal = document.getElementById("image-lightbox-modal");
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) closeImageLightbox();
    });
    const lightboxContent = lightboxModal.querySelector(".image-lightbox-content");
    if (lightboxContent) lightboxContent.addEventListener("click", (e) => e.stopPropagation());
    const lightboxCloseBtn = lightboxModal.querySelector(".image-lightbox-close-btn");
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeImageLightbox);
  }
}

function openSubscribeModal() {
  const subscribeBtn = document.getElementById("sidebar-subscribe-btn") || document.querySelector('a[aria-label="Subscribe"]');
  if (subscribeBtn) {
    subscribeBtn.classList.remove("subscribe-ring-vibrate");
    subscribeBtn.classList.add("subscribe-coral-active");
  }
  const modal = document.getElementById("subscribe-modal");
  if (modal) {
    if (!modal.dataset.backdropBound) {
      modal.dataset.backdropBound = "true";
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeSubscribeModal();
      });
    }
    if (!modal.querySelector("#subscriber-name") || modal.querySelector(".modal-confirmation-card")) {
      renderSubscribeFormNetwork(modal);
    }
    if (typeof modal.showModal === "function") modal.showModal();
  }
}

function escapeHtmlNetwork(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderSubscribeFormNetwork(modal) {
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
          <button type="button" class="btn-modal-cancel">[ CANCEL ]</button>
          <button type="submit" class="btn-modal-submit">[ TRANSMIT SUBSCRIPTION ]</button>
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

function renderSubscribeConfirmationNetwork(email, name) {
  const modal = document.getElementById("subscribe-modal");
  if (!modal) return;

  const safeEmail = escapeHtmlNetwork(email || "");
  const safeName = escapeHtmlNetwork(name || "");

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
        <button type="button" class="btn-modal-submit" onclick="closeSubscribeModal()" style="min-width: 120px;">[ CLOSE ]</button>
      </div>
    </div>
  `;
}

function closeSubscribeModal() {
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.close === "function") modal.close();
}

async function handleSubscribeSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("subscriber-name");
  const emailInput = document.getElementById("subscriber-email");
  const submitBtn = e.target ? e.target.querySelector('button[type="submit"]') : null;

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";

  if (!email) return;

  const originalText = submitBtn ? submitBtn.textContent : "[ TRANSMIT SUBSCRIPTION ]";
  if (submitBtn) {
    submitBtn.textContent = "[ TRANSMITTING... ]";
    submitBtn.disabled = true;
  }

  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScWoT07kZjH1m5Mu1zrK4l_eFpzOytLler0cwd0j4yQTXYDJQ/formResponse";
  const bodyParams = new URLSearchParams();
  bodyParams.append("entry.1020667952", email);
  if (name) bodyParams.append("entry.1290617359", name);

  try {
    await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams
    });
  } catch (err) {
    console.warn("[Subscription Notice]", err);
  } finally {
    renderSubscribeConfirmationNetwork(email, name);
  }
}

function openImageLightbox(src, captionText) {
  const modal = document.getElementById("image-lightbox-modal");
  const img = document.getElementById("image-lightbox-img");
  const caption = document.getElementById("image-lightbox-caption");
  if (modal && img) {
    img.src = src;
    if (caption) caption.textContent = captionText || "";
    if (typeof modal.showModal === "function") modal.showModal();
  }
}

function closeImageLightbox() {
  const modal = document.getElementById("image-lightbox-modal");
  if (modal && typeof modal.close === "function") modal.close();
}

/* Three.js 3D WebGL Engine Implementation */
function initNodeMapCanvas() {
  canvas = document.getElementById("nodemap-canvas");
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!canvas || !wrapper) return;

  if (typeof THREE !== "undefined") {
    try {
      isThreeInitialized = initThreeJSNodeMap();
      if (isThreeInitialized) return;
    } catch (e) {
      console.log("Three.js 3D WebGL initialization fallback active:", e);
    }
  }

  init2DCanvasEngine(wrapper);
}

function initThreeJSNodeMap() {
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  canvas = document.getElementById("nodemap-canvas");
  if (!wrapper || !canvas || typeof THREE === "undefined") return false;

  const w = wrapper.clientWidth || 800;
  const h = wrapper.clientHeight || 600;

  threeScene = new THREE.Scene();
  threeScene.fog = new THREE.FogExp2(0x050507, 0.00085);

  threeCamera = new THREE.PerspectiveCamera(45, w / h, 1, 2400);
  threeCamera.position.set(0, 30, 480);

  threeRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  threeRenderer.setSize(w, h, false);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      onThreeWindowResize();
    });
    ro.observe(wrapper);
  }

  if (typeof THREE.OrbitControls !== "undefined") {
    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.rotateSpeed = 0.75;
    threeControls.zoomSpeed = 0.95;
    threeControls.minDistance = 90;
    threeControls.maxDistance = 850;
    threeControls.autoRotate = true;
    threeControls.autoRotateSpeed = 0.28;
  }

  const ambientLight = new THREE.AmbientLight(0x0a0a10, 3.2);
  threeScene.add(ambientLight);

  const lightRed = new THREE.PointLight(0xe84a5f, 3.8, 800);
  lightRed.position.set(250, 180, 220);
  threeScene.add(lightRed);

  const lightNeutral = new THREE.PointLight(0xfff5ea, 2.2, 800);
  lightNeutral.position.set(-250, -180, -220);
  threeScene.add(lightNeutral);

  const lightCyan = new THREE.PointLight(0xa0c4ff, 1.4, 700);
  lightCyan.position.set(0, 320, 100);
  threeScene.add(lightCyan);

  threeNodesGroup = new THREE.Group();
  threeLinesGroup = new THREE.Group();
  threeParticlesGroup = new THREE.Group();
  threeScene.add(threeNodesGroup);
  threeScene.add(threeLinesGroup);
  threeScene.add(threeParticlesGroup);

  threeRaycaster = new THREE.Raycaster();
  threeMouse = new THREE.Vector2(-999, -999);

  build3DStarfield();
  build3DNodeMapGraph();

  window.addEventListener("resize", onThreeWindowResize);
  canvas.addEventListener("mousemove", onThreeMouseMove);
  canvas.addEventListener("click", onThreeMouseClick);
  canvas.addEventListener("mouseleave", onThreeMouseLeave);

  animateThreeJS();
  return true;
}

function build3DStarfield() {
  const particleCount = 350;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1200;
    positions[i + 1] = (Math.random() - 0.5) * 1200;
    positions[i + 2] = (Math.random() - 0.5) * 1200;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.8,
    transparent: true,
    opacity: 0.28
  });

  const starfield = new THREE.Points(geometry, material);
  threeParticlesGroup.add(starfield);
}

// Procedural Glitter Texture Cache
const glitterTextureCache = {};

function getGlitterTextures(colorHexStr, tier = "tag") {
  const cacheKey = `${colorHexStr}_${tier}`;
  if (glitterTextureCache[cacheKey]) return glitterTextureCache[cacheKey];

  const size = 512;
  const canvasDiffuse = document.createElement("canvas");
  canvasDiffuse.width = size;
  canvasDiffuse.height = size;
  const ctxD = canvasDiffuse.getContext("2d");

  // Base background fill
  ctxD.fillStyle = colorHexStr;
  ctxD.fillRect(0, 0, size, size);

  // Micro-granular noise and multi-spectral glitter flecks
  const fleckCount = tier === "root" ? 7500 : (tier === "pillar" ? 6000 : (tier === "subtopic" ? 4800 : 3600));

  for (let i = 0; i < fleckCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.6 + 0.4;
    const alpha = Math.random() * 0.85 + 0.15;
    const isBrightGlint = Math.random() > 0.86;

    if (isBrightGlint) {
      ctxD.fillStyle = Math.random() > 0.45 ? `rgba(255, 255, 255, ${alpha})` : `rgba(255, 235, 195, ${alpha})`;
      ctxD.beginPath();
      ctxD.arc(x, y, r * 1.3, 0, Math.PI * 2);
      ctxD.fill();
    } else {
      const brightness = Math.floor(Math.random() * 110 + 145);
      ctxD.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha * 0.65})`;
      ctxD.fillRect(x, y, r, r);
    }
  }

  // Granular Bump Map for micro-surface glitter reflection
  const canvasBump = document.createElement("canvas");
  canvasBump.width = size;
  canvasBump.height = size;
  const ctxB = canvasBump.getContext("2d");
  ctxB.fillStyle = "#808080";
  ctxB.fillRect(0, 0, size, size);

  const imgDataB = ctxB.getImageData(0, 0, size, size);
  const dataB = imgDataB.data;
  for (let i = 0; i < dataB.length; i += 4) {
    const noise = (Math.random() - 0.5) * 120;
    const val = Math.max(0, Math.min(255, 128 + noise));
    dataB[i] = val;
    dataB[i + 1] = val;
    dataB[i + 2] = val;
  }
  ctxB.putImageData(imgDataB, 0, 0);

  const diffTex = new THREE.CanvasTexture(canvasDiffuse);
  diffTex.wrapS = THREE.RepeatWrapping;
  diffTex.wrapT = THREE.RepeatWrapping;

  const bumpTex = new THREE.CanvasTexture(canvasBump);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;

  const result = { diffTex, bumpTex };
  glitterTextureCache[cacheKey] = result;
  return result;
}

function createGlitterSphereNodeMesh(radius, colorHex, tier = "tag", emissiveIntensity = 0.22) {
  // Perfect Sphere Geometry with high segment count for pristine spherical form
  const geo = new THREE.SphereGeometry(radius, 36, 36);

  const colorHexStr = typeof colorHex === "number" ? "#" + colorHex.toString(16).padStart(6, "0") : colorHex;
  const { diffTex, bumpTex } = getGlitterTextures(colorHexStr, tier);

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    map: diffTex,
    bumpMap: bumpTex,
    bumpScale: tier === "root" || tier === "pillar" ? 0.16 : (tier === "subtopic" ? 0.13 : 0.10),
    roughness: 0.36,
    metalness: 0.76, // High metallic shimmer for holiday ornament / glitter bauble look
    emissive: colorHex,
    emissiveIntensity: emissiveIntensity,
    roughnessMap: bumpTex
  });

  return new THREE.Mesh(geo, mat);
}

function build3DNodeMapGraph() {
  while (threeNodesGroup.children.length > 0) threeNodesGroup.remove(threeNodesGroup.children[0]);
  while (threeLinesGroup.children.length > 0) threeLinesGroup.remove(threeLinesGroup.children[0]);
  threeNodes = [];
  threeLines = [];

  if (!NETWORK_POSTS || NETWORK_POSTS.length === 0) return;

  // 1. ROOT NODE (Center)
  const rootData = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    color: "#E84A5F",
    postsCount: NETWORK_POSTS.length
  };

  const rootMesh = createGlitterSphereNodeMesh(21, 0xE84A5F, "root", 0.35);
  rootMesh.position.set(0, 0, 0);
  threeNodesGroup.add(rootMesh);

  const rootSprite = create3DTextSprite("UNTITLED.JPG", "#FFFFFF", 28);
  rootSprite.position.set(0, -28, 0);
  rootMesh.add(rootSprite);

  const rootNodeItem = { mesh: rootMesh, labelSprite: rootSprite, data: rootData, neighbors: new Set() };
  threeNodes.push(rootNodeItem);

  // 2. EXTRACT PILLARS & SUBTOPICS
  const pillarMap = {}; // pillarName -> { posts, subtopics: { subtopicName -> posts } }
  NETWORK_POSTS.forEach(p => {
    const pil = p.pillar || "GENERAL PILLAR";
    const sub = p.subtopic || "CORE THEORIES";
    if (!pillarMap[pil]) {
      pillarMap[pil] = { name: pil, posts: [], subtopics: {} };
    }
    pillarMap[pil].posts.push(p);

    if (!pillarMap[pil].subtopics[sub]) {
      pillarMap[pil].subtopics[sub] = [];
    }
    pillarMap[pil].subtopics[sub].push(p);
  });

  const pillarList = Object.values(pillarMap);
  const pillarCount = pillarList.length;
  const pillarNodeMap = {};
  const subtopicNodeMap = {};

  // Spacious orbital radii
  const R_PILLAR = 125;
  const R_SUBTOPIC = 210;

  // Spherically distributed pillar positions (Tetrahedral / Polyhedral spacing)
  const pillarBasisDirs = [
    new THREE.Vector3( 0.85,  0.52,  0.0),
    new THREE.Vector3(-0.85,  0.52,  0.0),
    new THREE.Vector3( 0.0,  -0.75,  0.66),
    new THREE.Vector3( 0.0,  -0.75, -0.66),
    new THREE.Vector3( 0.65, -0.25,  0.72),
    new THREE.Vector3(-0.65, -0.25, -0.72)
  ];

  pillarList.forEach((pilObj, pIdx) => {
    const pilName = pilObj.name;
    const dir = (pillarBasisDirs[pIdx % pillarBasisDirs.length] || new THREE.Vector3(Math.cos(pIdx), Math.sin(pIdx), 0)).clone().normalize();
    const pilPos = dir.clone().multiplyScalar(R_PILLAR);

    const postsInPillar = pilObj.posts;
    const pillarRadius = Math.min(20, 15 + Math.min(5, postsInPillar.length * 1.2));

    const pillarData = {
      id: `pillar_${pIdx}`,
      label: pilName,
      type: "pillar",
      color: "#FF4D64",
      postsCount: postsInPillar.length,
      postSlugs: postsInPillar.map(p => p.slug)
    };

    const pillarMesh = createGlitterSphereNodeMesh(pillarRadius, 0xFF4D64, "pillar", 0.28);
    pillarMesh.position.copy(pilPos);
    threeNodesGroup.add(pillarMesh);

    const pillarSprite = create3DTextSprite(pilName.toUpperCase(), "#FFA0AD", 22);
    pillarSprite.position.set(0, -(pillarRadius + 9), 0);
    pillarMesh.add(pillarSprite);

    const pillarNodeItem = { mesh: pillarMesh, labelSprite: pillarSprite, data: pillarData, neighbors: new Set() };
    threeNodes.push(pillarNodeItem);
    pillarNodeMap[pilName] = pillarNodeItem;

    rootNodeItem.neighbors.add(pillarNodeItem);
    pillarNodeItem.neighbors.add(rootNodeItem);
    create3DConnectionLine(rootNodeItem, pillarNodeItem, 0x8A2A38, 0xFF3B56, 0.22);

    // 3. SUB-TOPICS BRANCHING OUTWARD FROM PILLAR
    const subtopicNames = Object.keys(pilObj.subtopics);
    const subCount = subtopicNames.length;

    // Build orthogonal basis vectors for the cone fan
    const upRef = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const rightVec = new THREE.Vector3().crossVectors(dir, upRef).normalize();
    const upVec = new THREE.Vector3().crossVectors(rightVec, dir).normalize();

    subtopicNames.forEach((subName, sIdx) => {
      const postsInSub = pilObj.subtopics[subName];
      const coneAngle = subCount === 1 ? 0 : 0.38;
      const fanAngle = subCount === 1 ? 0 : ((sIdx / (subCount - 1)) - 0.5) * Math.PI * 1.1;

      const subDir = dir.clone()
        .addScaledVector(rightVec, Math.cos(fanAngle) * coneAngle)
        .addScaledVector(upVec, Math.sin(fanAngle) * coneAngle)
        .normalize();

      const subDist = R_SUBTOPIC + (sIdx % 2) * 18;
      const subPos = subDir.clone().multiplyScalar(subDist);

      const subRadius = Math.min(15, 11 + Math.min(4, postsInSub.length * 0.9));

      const subData = {
        id: `sub_${pIdx}_${sIdx}`,
        label: subName,
        type: "subtopic",
        pillar: pilName,
        color: "#FFA0B0",
        postsCount: postsInSub.length,
        postSlugs: postsInSub.map(p => p.slug)
      };

      const subMesh = createGlitterSphereNodeMesh(subRadius, 0xFFA0B0, "subtopic", 0.22);
      subMesh.position.copy(subPos);
      threeNodesGroup.add(subMesh);

      const subSprite = create3DTextSprite(subName.toUpperCase(), "#FFD5DC", 16);
      subSprite.position.set(0, -(subRadius + 8), 0);
      subMesh.add(subSprite);

      const subNodeItem = { mesh: subMesh, labelSprite: subSprite, data: subData, neighbors: new Set() };
      threeNodes.push(subNodeItem);
      subtopicNodeMap[`${pilName}:::${subName}`] = subNodeItem;

      pillarNodeItem.neighbors.add(subNodeItem);
      subNodeItem.neighbors.add(pillarNodeItem);
      create3DConnectionLine(pillarNodeItem, subNodeItem, 0x652838, 0xFF6585, 0.14);
    });
  });

  // 4. TAGS GATHERING & POSITIONING
  const uniqueTagMap = {};
  NETWORK_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(t => {
        const clean = String(t).trim().toLowerCase().replace(/^#/, "");
        if (!clean) return;
        if (!uniqueTagMap[clean]) {
          uniqueTagMap[clean] = {
            name: clean,
            pillars: new Set(),
            subtopics: new Set(),
            posts: [],
            count: 0
          };
        }
        uniqueTagMap[clean].count++;
        uniqueTagMap[clean].posts.push(p);
        if (p.pillar) uniqueTagMap[clean].pillars.add(p.pillar);
        if (p.pillar && p.subtopic) uniqueTagMap[clean].subtopics.add(`${p.pillar}:::${p.subtopic}`);
      });
    }
  });

  const tagList = Object.values(uniqueTagMap);
  const tagNodeMap = {};
  const totalTags = tagList.length;
  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
  const GOLDEN_ANGLE = 2 * Math.PI * (1 - 1 / GOLDEN_RATIO);

  tagList.forEach((tagObj, idx) => {
    const y = 1 - (idx / Math.max(1, totalTags - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * idx;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const fibVec = new THREE.Vector3(x, y, z).normalize();

    // Pull gently towards parent subtopic/pillar direction
    const connectedSubNodes = Array.from(tagObj.subtopics).map(key => subtopicNodeMap[key]).filter(Boolean);
    const connectedPillarNodes = Array.from(tagObj.pillars).map(pName => pillarNodeMap[pName]).filter(Boolean);

    if (connectedSubNodes.length > 0) {
      const avgSubDir = new THREE.Vector3(0, 0, 0);
      connectedSubNodes.forEach(sn => avgSubDir.add(sn.mesh.position));
      avgSubDir.normalize();
      fibVec.lerp(avgSubDir, 0.42).normalize();
    } else if (connectedPillarNodes.length > 0) {
      const avgPilDir = new THREE.Vector3(0, 0, 0);
      connectedPillarNodes.forEach(pn => avgPilDir.add(pn.mesh.position));
      avgPilDir.normalize();
      fibVec.lerp(avgPilDir, 0.35).normalize();
    }

    // Outer orbital range with comfortable breathing room
    const tagDist = 295 + (idx % 6) * 12;
    const finalPos = fibVec.multiplyScalar(tagDist);

    // Tag size reflects frequency: smaller than subtopics (11+) but distinct across tag usage
    const tagRadius = Math.min(9.5, 5.2 + Math.min(4.3, Math.pow(tagObj.count, 0.75) * 1.5));

    const tagData = {
      id: `tag_${idx}`,
      label: `#${tagObj.name}`,
      rawTag: tagObj.name,
      type: "tag",
      color: "#E2E8F0",
      postsCount: tagObj.count,
      pillars: Array.from(tagObj.pillars),
      subtopics: Array.from(tagObj.subtopics).map(k => k.split(":::")[1] || k)
    };

    const tagMesh = createGlitterSphereNodeMesh(tagRadius, 0xE2E8F0, "tag", 0.18);
    tagMesh.position.copy(finalPos);
    threeNodesGroup.add(tagMesh);

    const labelFontSize = Math.min(18, 11 + tagRadius * 0.5);
    const tagSprite = create3DTextSprite(`#${tagObj.name}`, "#F1F5F9", labelFontSize);
    tagSprite.position.set(0, -(tagRadius + 7), 0);
    tagMesh.add(tagSprite);

    const tagNodeItem = { mesh: tagMesh, labelSprite: tagSprite, data: tagData, neighbors: new Set() };
    threeNodes.push(tagNodeItem);
    tagNodeMap[tagObj.name] = tagNodeItem;

    // Connect Tag to Subtopics (or Pillars if no subtopic) with very subtle default opacity
    if (connectedSubNodes.length > 0) {
      connectedSubNodes.forEach(sNode => {
        tagNodeItem.neighbors.add(sNode);
        sNode.neighbors.add(tagNodeItem);
        create3DConnectionLine(sNode, tagNodeItem, 0x2A2E38, 0xFF6080, 0.07);
      });
    } else {
      connectedPillarNodes.forEach(pNode => {
        tagNodeItem.neighbors.add(pNode);
        pNode.neighbors.add(tagNodeItem);
        create3DConnectionLine(pNode, tagNodeItem, 0x2A2E38, 0xFF4D64, 0.07);
      });
    }
  });

  // 5. INTER-TAG CO-OCCURRENCE LINES (Refined: Chain consecutive related tags to avoid dense mesh)
  const coOccurrenceCounts = {};
  NETWORK_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags) && p.tags.length > 1) {
      const cleanTags = p.tags.map(t => String(t).trim().toLowerCase().replace(/^#/, "")).filter(Boolean);
      for (let i = 0; i < cleanTags.length - 1; i++) {
        const tA = cleanTags[i];
        const tB = cleanTags[i + 1];
        const key = tA < tB ? `${tA}|${tB}` : `${tB}|${tA}`;
        coOccurrenceCounts[key] = (coOccurrenceCounts[key] || 0) + 1;
      }
    }
  });

  Object.keys(coOccurrenceCounts).forEach(pairKey => {
    const [tA, tB] = pairKey.split("|");
    const nodeA = tagNodeMap[tA];
    const nodeB = tagNodeMap[tB];
    if (nodeA && nodeB && !nodeA.neighbors.has(nodeB)) {
      nodeA.neighbors.add(nodeB);
      nodeB.neighbors.add(nodeA);
      create3DConnectionLine(nodeA, nodeB, 0x1E222A, 0xFFA0B0, 0.04);
    }
  });
}

function splitTextIntoLines(text, maxCharsPerLine = 22) {
  if (!text || text.length <= maxCharsPerLine) return [text];
  if (text.includes(",")) {
    const parts = text.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      const line1 = parts[0] + ",";
      const line2 = parts.slice(1).join(", ");
      return [line1, line2];
    }
  }

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

function create3DConnectionLine(fromItem, toItem, defaultColorHex, highlightColorHex, defaultOpacity = 0.06) {
  const points = [];
  points.push(fromItem.mesh.position);
  points.push(toItem.mesh.position);

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: defaultColorHex,
    transparent: true,
    opacity: defaultOpacity,
    linewidth: 1
  });

  const lineMesh = new THREE.Line(geometry, material);
  threeLinesGroup.add(lineMesh);

  threeLines.push({
    mesh: lineMesh,
    fromItem: fromItem,
    toItem: toItem,
    defaultColorHex: defaultColorHex,
    highlightColorHex: highlightColorHex,
    defaultOpacity: defaultOpacity
  });
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  if (threeControls) threeControls.update();

  if (threeParticlesGroup) {
    threeParticlesGroup.rotation.y += 0.00025;
  }

  // Continuous subtle spin so glitter micro-flecks shimmer dynamically under scene lights
  if (threeNodes && threeNodes.length > 0) {
    threeNodes.forEach((n, idx) => {
      if (n.mesh) {
        n.mesh.rotation.y += 0.004 * (idx % 2 === 0 ? 1 : -1);
        n.mesh.rotation.x += 0.002 * (idx % 3 === 0 ? 1 : -1);
      }
    });
  }

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
    hoveredThreeNode = newHovered;

    threeNodes.forEach(n => {
      if (hoveredThreeNode && (n === hoveredThreeNode || (hoveredThreeNode.neighbors && hoveredThreeNode.neighbors.has(n)))) {
        const s = n === hoveredThreeNode ? 1.45 : 1.22;
        n.mesh.scale.set(s, s, s);
      } else {
        n.mesh.scale.set(1, 1, 1);
      }
    });

    if (hoveredThreeNode) {
      if (canvas) canvas.style.cursor = "pointer";
    } else {
      if (canvas) canvas.style.cursor = "default";
    }

    // Only highlight lines connected to mouse-hovered node; keep the rest very subtle
    threeLines.forEach(l => {
      const isDirectConn = hoveredThreeNode && (l.fromItem === hoveredThreeNode || l.toItem === hoveredThreeNode);
      if (isDirectConn) {
        l.mesh.material.color.setHex(l.highlightColorHex);
        l.mesh.material.opacity = 0.95;
      } else {
        l.mesh.material.color.setHex(l.defaultColorHex);
        l.mesh.material.opacity = l.defaultOpacity;
      }
    });

    updateThreeDockMetadata(hoveredThreeNode);
  }
}

function updateThreeDockMetadata(nodeItem) {
  const dockTitle = document.getElementById("dock-node-title");
  const dockDesc = document.getElementById("dock-node-desc");
  if (!dockTitle || !dockDesc) return;

  if (nodeItem) {
    const d = nodeItem.data;
    if (d.type === "root") {
      dockTitle.textContent = `[ 3D CORE: ${d.label} ]`;
      dockDesc.textContent = `Central taxonomy core connecting ${d.postsCount} dispatches across pillars and subtopics.`;
    } else if (d.type === "pillar") {
      dockTitle.textContent = `[ 3D PILLAR: ${d.label} ]`;
      dockDesc.textContent = `Major intellectual pillar with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}. Click to explore in Timeline.`;
    } else if (d.type === "subtopic") {
      dockTitle.textContent = `[ 3D SUBTOPIC: ${d.label} ]`;
      dockDesc.textContent = `Subtopic under [${d.pillar}] with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}. Click to explore in Timeline.`;
    } else {
      const pStr = (d.pillars || []).join(" • ");
      const subStr = (d.subtopics || []).slice(0, 2).join(" • ");
      dockTitle.textContent = `[ 3D TAG: ${d.label} ]`;
      dockDesc.textContent = `Tag node with ${d.postsCount} dispatch${d.postsCount > 1 ? 'es' : ''}${subStr ? ' • ' + subStr : (pStr ? ' across ' + pStr : '')}. Click to filter in Timeline.`;
    }
  } else if (!activeNodeFilter) {
    dockTitle.textContent = "[ 3D TAXONOMY CONSTELLATION ]";
    dockDesc.textContent = "Drag to rotate 3D constellation. Scroll to zoom. Hover over nodes to inspect network connections. Click to filter.";
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

  if (activeNodeFilter === clickedData) {
    activeNodeFilter = null;
    activeTagFilter = null;
    setNodeFilterUIState(false);
  } else {
    activeNodeFilter = clickedData;
    if (clickedData.type === "pillar" || clickedData.type === "subtopic") {
      activeTagFilter = clickedData.label;
    } else if (clickedData.type === "tag") {
      activeTagFilter = clickedData.rawTag;
    } else {
      activeTagFilter = null;
    }

    if (activeTagFilter) {
      setNodeFilterUIState(true, activeTagFilter);
      window.location.href = `archive.html?tag=${encodeURIComponent(activeTagFilter)}`;
    } else {
      setNodeFilterUIState(false);
    }
  }
}

function onThreeMouseLeave() {
  threeMouse.set(-999, -999);
}

function onThreeWindowResize() {
  const wrapper = document.getElementById("nodemap-canvas-wrapper");
  if (!wrapper || !threeRenderer || !threeCamera) return;
  const nw = wrapper.clientWidth;
  const nh = wrapper.clientHeight;
  if (nw === 0 || nh === 0) return;
  threeCamera.aspect = nw / nh;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(nw, nh, false);
}

/* Fallback 2D Canvas Engine Implementation */
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

  const w = canvas.width || 600;
  const h = canvas.height || 600;
  const cx = w / 2;
  const cy = h / 2;

  nodes = [];
  connections = [];

  const rootNode = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    x: cx,
    y: cy,
    vx: 0,
    vy: 0,
    radius: 19,
    color: "#E84A5F",
    postsCount: NETWORK_POSTS.length
  };
  nodes.push(rootNode);

  const pillarMap = {};
  NETWORK_POSTS.forEach(p => {
    const pil = p.pillar || "GENERAL PILLAR";
    const sub = p.subtopic || "CORE THEORIES";
    if (!pillarMap[pil]) pillarMap[pil] = { name: pil, posts: [], subtopics: {} };
    pillarMap[pil].posts.push(p);
    if (!pillarMap[pil].subtopics[sub]) pillarMap[pil].subtopics[sub] = [];
    pillarMap[pil].subtopics[sub].push(p);
  });

  const pillarList = Object.values(pillarMap);
  const pillarNodeMap = {};
  const subtopicNodeMap = {};
  const pillarCount = pillarList.length;

  pillarList.forEach((pilObj, pIdx) => {
    const pilName = pilObj.name;
    const pAngle = (pIdx / Math.max(1, pillarCount)) * Math.PI * 2;
    const pDistance = Math.min(w, h) * 0.28;
    const px = cx + Math.cos(pAngle) * pDistance;
    const py = cy + Math.sin(pAngle) * pDistance;

    const postsInPillar = pilObj.posts;
    const pillarRadius = Math.min(18, 14 + postsInPillar.length * 0.8);

    const pillarNode = {
      id: `pillar_${pIdx}`,
      label: pilName,
      type: "pillar",
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: pillarRadius,
      color: "#FF4D64",
      postsCount: postsInPillar.length
    };
    nodes.push(pillarNode);
    pillarNodeMap[pilName] = pillarNode;
    connections.push({ from: rootNode, to: pillarNode, color: "rgba(232, 74, 95, 0.7)", weight: 2 });

    const subNames = Object.keys(pilObj.subtopics);
    const subCount = subNames.length;
    subNames.forEach((subName, sIdx) => {
      const sAngle = pAngle + (subCount === 1 ? 0 : ((sIdx / (subCount - 1)) - 0.5) * 0.9);
      const sDistance = Math.min(w, h) * 0.44;
      const sx = cx + Math.cos(sAngle) * sDistance;
      const sy = cy + Math.sin(sAngle) * sDistance;

      const postsInSub = pilObj.subtopics[subName];
      const subRadius = Math.min(13, 9.5 + postsInSub.length * 0.7);

      const subNode = {
        id: `sub_${pIdx}_${sIdx}`,
        label: subName,
        type: "subtopic",
        pillar: pilName,
        x: sx,
        y: sy,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: subRadius,
        color: "#FFA0B0",
        postsCount: postsInSub.length
      };
      nodes.push(subNode);
      subtopicNodeMap[`${pilName}:::${subName}`] = subNode;
      connections.push({ from: pillarNode, to: subNode, color: "rgba(255, 160, 176, 0.6)", weight: 1.5 });
    });
  });

  const uniqueTagMap = {};
  NETWORK_POSTS.forEach(p => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(t => {
        const clean = String(t).trim().toLowerCase().replace(/^#/, "");
        if (!clean) return;
        if (!uniqueTagMap[clean]) {
          uniqueTagMap[clean] = { name: clean, pillars: new Set(), subtopics: new Set(), count: 0 };
        }
        uniqueTagMap[clean].count++;
        if (p.pillar) uniqueTagMap[clean].pillars.add(p.pillar);
        if (p.pillar && p.subtopic) uniqueTagMap[clean].subtopics.add(`${p.pillar}:::${p.subtopic}`);
      });
    }
  });

  const tagList = Object.values(uniqueTagMap);
  const tagNodeMap = {};

  tagList.forEach((tagObj, idx) => {
    const angle = (idx / Math.max(1, tagList.length)) * Math.PI * 2;
    const distance = Math.min(w, h) * 0.60 + (idx % 4) * 12;
    const tx = cx + Math.cos(angle) * distance;
    const ty = cy + Math.sin(angle) * distance;

    const tagRadius = Math.min(8.5, 4.8 + Math.min(3.7, Math.pow(tagObj.count, 0.75) * 1.3));
    const tagNode = {
      id: `tag_${idx}`,
      label: `#${tagObj.name}`,
      rawTag: tagObj.name,
      type: "tag",
      x: tx,
      y: ty,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: tagRadius,
      color: "#E2E8F0",
      postsCount: tagObj.count
    };
    nodes.push(tagNode);
    tagNodeMap[tagObj.name] = tagNode;

    const subs = Array.from(tagObj.subtopics).map(k => subtopicNodeMap[k]).filter(Boolean);
    if (subs.length > 0) {
      subs.forEach(sn => connections.push({ from: sn, to: tagNode, color: "rgba(126, 134, 153, 0.45)", weight: 1 }));
    } else {
      Array.from(tagObj.pillars).map(pn => pillarNodeMap[pn]).filter(Boolean).forEach(pn => {
        connections.push({ from: pn, to: tagNode, color: "rgba(126, 134, 153, 0.45)", weight: 1 });
      });
    }
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
    if (n.type === "root") return;

    n.x += n.vx;
    n.y += n.vy;

    const margin = 25;
    if (n.x < margin || n.x > w - margin) n.vx *= -1;
    if (n.y < margin || n.y > h - margin) n.vy *= -1;

    n.vx += (Math.random() - 0.5) * 0.015;
    n.vy += (Math.random() - 0.5) * 0.015;
    n.vx *= 0.98;
    n.vy *= 0.98;
  });
}

function drawNodeGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  connections.forEach(conn => {
    const isHighlighted = (hoveredNode && (conn.from === hoveredNode || conn.to === hoveredNode)) ||
                          (activeNodeFilter && (conn.from === activeNodeFilter || conn.to === activeNodeFilter));

    ctx.beginPath();
    ctx.moveTo(conn.from.x, conn.from.y);
    ctx.lineTo(conn.to.x, conn.to.y);
    ctx.lineWidth = isHighlighted ? 2.5 : 1;
    ctx.strokeStyle = isHighlighted ? "rgba(255, 77, 100, 0.95)" : (conn.color || "rgba(126, 134, 153, 0.45)");
    ctx.stroke();
  });

  nodes.forEach(node => {
    const isHovered = hoveredNode === node;
    const isActive = activeNodeFilter === node;
    const isConnected = hoveredNode && connections.some(c => (c.from === hoveredNode && c.to === node) || (c.to === hoveredNode && c.from === node));

    const r = isHovered || isActive ? node.radius * 1.35 : node.radius;

    if (isHovered || isActive || isConnected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = node.type === "tag" ? "rgba(226, 232, 240, 0.22)" : "rgba(232, 74, 95, 0.35)";
      ctx.fill();
    }

    // Outer circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? "#FFFFFF" : "#121214";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isHovered || isActive ? "#FFFFFF" : node.color;
    ctx.stroke();

    // Glitter center speckle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    ctx.font = `${isHovered || isActive ? "600" : "400"} 10px 'Azeret Mono', monospace`;
    ctx.fillStyle = isHovered || isActive ? "#FFFFFF" : (isConnected ? "#FFFFFF" : "#E2E8F0");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelLines = splitTextIntoLines(node.label, 20);
    labelLines.forEach((l, idx) => {
      ctx.fillText(l, node.x, node.y + r + 13 + (idx * 12));
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

  const dockTitle = document.getElementById("dock-node-title");
  const dockDesc = document.getElementById("dock-node-desc");

  if (found && dockTitle && dockDesc) {
    if (found.type === "root") {
      dockTitle.textContent = `[ CORE: ${found.label} ]`;
      dockDesc.textContent = `Central taxonomy core connecting ${NETWORK_POSTS.length} dispatches across pillars and subtopics.`;
    } else if (found.type === "pillar") {
      dockTitle.textContent = `[ PILLAR: ${found.label} ]`;
      dockDesc.textContent = `Pillar category with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter in Timeline.`;
    } else if (found.type === "subtopic") {
      dockTitle.textContent = `[ SUBTOPIC: ${found.label} ]`;
      dockDesc.textContent = `Subtopic under [${found.pillar}] with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter in Timeline.`;
    } else {
      dockTitle.textContent = `[ TAG: ${found.label} ]`;
      dockDesc.textContent = `Tag node with ${found.postsCount} dispatch${found.postsCount > 1 ? 'es' : ''}. Click to filter in Timeline.`;
    }
  } else if (!activeNodeFilter && dockTitle && dockDesc) {
    dockTitle.textContent = "[ TAXONOMY MAP ACTIVE ]";
    dockDesc.textContent = "Hover over any node to highlight connected dispatches. Click to filter in Timeline.";
  }
}

function handleCanvasClick(e) {
  if (!hoveredNode) return;

  if (activeNodeFilter === hoveredNode) {
    activeNodeFilter = null;
    activeTagFilter = null;
    setNodeFilterUIState(false);
  } else {
    activeNodeFilter = hoveredNode;
    if (hoveredNode.type === "pillar" || hoveredNode.type === "subtopic") {
      activeTagFilter = hoveredNode.label;
    } else if (hoveredNode.type === "tag") {
      activeTagFilter = hoveredNode.rawTag;
    } else {
      activeTagFilter = null;
    }

    if (activeTagFilter) {
      setNodeFilterUIState(true, activeTagFilter);
      window.location.href = `archive.html?tag=${encodeURIComponent(activeTagFilter)}`;
    } else {
      setNodeFilterUIState(false);
    }
  }
}

function handleCanvasMouseLeave() {
  hoveredNode = null;
}

function resetNodeHighlights() {
  activeNodeFilter = null;
  hoveredNode = null;
}
