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
      label.textContent = "EXPLORE 3D TAXONOMY: FOUNDATIONS → PILLARS → SUBTOPICS → TAGS";
    }
  });
}

function applyTagFilterDirectly(tag) {
  if (!tag) return;
  activeTagFilter = tag.trim();

  const tagLower = activeTagFilter.toLowerCase().replace(/^#/, "");
  let matchedData = null;

  if (typeof threeNodes !== "undefined" && threeNodes && threeNodes.length > 0) {
    const match = threeNodes.find(n => {
      const d = n.data;
      if (!d) return false;
      const l = (d.label || "").toLowerCase().replace(/^#/, "");
      const raw = (d.rawTag || "").toLowerCase().replace(/^#/, "");
      return l === tagLower || raw === tagLower;
    });
    if (match) {
      activeNodeFilter = match.data;
      matchedData = match.data;
    }
  } else if (typeof nodes !== "undefined" && nodes && nodes.length > 0) {
    const match = nodes.find(n => {
      const l = (n.label || "").toLowerCase().replace(/^#/, "");
      const raw = (n.rawTag || "").toLowerCase().replace(/^#/, "");
      return l === tagLower || raw === tagLower;
    });
    if (match) {
      activeNodeFilter = match;
      matchedData = match;
    }
  }

  if (!matchedData) {
    matchedData = {
      type: "tag",
      label: `#${tagLower}`,
      rawTag: tagLower,
      postsCount: 0
    };
    activeNodeFilter = matchedData;
  }

  setNodeFilterUIState(true, activeTagFilter);
  updateActivePill(matchedData);
  renderSelectedNodePostsStrip(matchedData);
  updateThreeSceneFocus();
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
    const typeBadgeClass = t.type === "foundation" ? "tag-type-foundation" : (t.type === "pillar" ? "tag-type-pillar" : (t.type === "subtopic" ? "tag-type-subtopic" : "tag-type-tag"));
    const typeLabel = (t.type || "tag").toUpperCase();
    const postsList = t.links || t.posts || [];
    const linksHtml = postsList.map(l => {
      const fmt = (l.format || "ESSAY").toUpperCase();
      const postUrl = getPostUrl(l);
      return `<a href="${postUrl}" class="tag-dispatch-link" title="${l.title}">
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

    if (window.location.hash === "#tags-table" || window.location.search.includes("view=table")) {
      tableBtn.click();
    }
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
        <button type="button" class="btn-modal-submit" onclick="closeSubscribeModal()" style="min-width: 120px;">CLOSE</button>
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

  const originalText = submitBtn ? submitBtn.textContent : "TRANSMIT SUBSCRIPTION";
  if (submitBtn) {
    submitBtn.textContent = "TRANSMITTING...";
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

  threeCamera = new THREE.PerspectiveCamera(45, w / h, 1, 3200);
  threeCamera.position.set(0, 35, 620);

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
    threeControls.maxDistance = 1500;
    threeControls.autoRotate = true;
    threeControls.autoRotateSpeed = 0.28;
  }

  const ambientLight = new THREE.AmbientLight(0x181824, 2.5);
  threeScene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x22223a, 1.4);
  threeScene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(150, 300, 200);
  threeScene.add(dirLight);

  const lightRed = new THREE.PointLight(0xe84a5f, 3.2, 900);
  lightRed.position.set(250, 180, 220);
  threeScene.add(lightRed);

  const lightNeutral = new THREE.PointLight(0xfff5ea, 2.0, 900);
  lightNeutral.position.set(-250, -180, -220);
  threeScene.add(lightNeutral);

  const lightCyan = new THREE.PointLight(0xa0c4ff, 1.2, 800);
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
  const fleckCount = tier === "root" ? 7500 : (tier === "foundation" ? 6500 : (tier === "pillar" ? 5600 : (tier === "subtopic" ? 4400 : 3600)));

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
    bumpScale: tier === "root" || tier === "pillar" || tier === "foundation" ? 0.16 : (tier === "subtopic" ? 0.13 : 0.10),
    roughness: 0.36,
    metalness: tier === "foundation" ? 0.82 : 0.76,
    emissive: colorHex,
    emissiveIntensity: emissiveIntensity,
    roughnessMap: bumpTex
  });

  return new THREE.Mesh(geo, mat);
}

const CANONICAL_FOUNDATIONS = [
  { id: "ai", name: "AI", slug: "ai", order: 1, pillars: ["ai-perception", "language-llms"] },
  { id: "design", name: "Design", slug: "design", order: 2, pillars: ["philosophy-image"] },
  { id: "philosophy", name: "Philosophy", slug: "philosophy", order: 3, pillars: ["philosophy-image", "philosophy-critical-theory"] },
  { id: "perception", name: "Perception", slug: "perception", order: 4, pillars: ["visual-perception"] },
  { id: "psychology", name: "Psychology", slug: "psychology", order: 5, pillars: ["visual-perception", "philosophy-image"] },
  { id: "tech", name: "Tech", slug: "tech", order: 6, pillars: ["ai-perception", "language-llms", "philosophy-critical-theory"] },
  { id: "vision", name: "Vision", slug: "vision", order: 7, pillars: ["ai-perception", "visual-perception", "philosophy-image"] },
  { id: "semiotics", name: "Semiotics", slug: "semiotics", order: 8, pillars: ["philosophy-image", "philosophy-critical-theory"] },
  { id: "tools", name: "Tools", slug: "tools", order: 9, pillars: ["ai-perception", "language-llms"] },
  { id: "analysis", name: "Analysis", slug: "analysis", order: 10, pillars: ["ai-perception", "visual-perception", "language-llms", "philosophy-critical-theory"] },
  { id: "data", name: "Data", slug: "data", order: 11, pillars: ["ai-perception", "language-llms"] },
  { id: "branding", name: "Branding", slug: "branding", order: 12, pillars: ["philosophy-image"] },
  { id: "graphics", name: "Graphics", slug: "graphics", order: 13, pillars: ["ai-perception", "visual-perception", "philosophy-image"] },
  { id: "art", name: "Art", slug: "art", order: 14, pillars: ["ai-perception", "philosophy-image"] }
];

function getCanonicalFoundations() {
  if (typeof window !== "undefined" && window.DYNAMIC_FOUNDATIONS && Array.isArray(window.DYNAMIC_FOUNDATIONS) && window.DYNAMIC_FOUNDATIONS.length > 0) {
    return window.DYNAMIC_FOUNDATIONS;
  }
  return CANONICAL_FOUNDATIONS;
}

function getCanonicalPillars() {
  if (typeof window !== "undefined" && window.DYNAMIC_PILLARS && Array.isArray(window.DYNAMIC_PILLARS) && window.DYNAMIC_PILLARS.length > 0) {
    return window.DYNAMIC_PILLARS;
  }
  return [
    { id: "ai-perception", title: "AI, Perception & Visual Culture", slug: "ai-perception", foundations: ["ai", "vision", "tech", "art", "data", "analysis", "graphics", "tools"] },
    { id: "visual-perception", title: "Visual Perception & Psychophysics", slug: "visual-perception", foundations: ["perception", "vision", "psychology", "analysis"] },
    { id: "language-llms", title: "Language, LLMs & Artificial Intelligence", slug: "language-llms", foundations: ["ai", "tech", "tools", "analysis", "data"] },
    { id: "philosophy-image", title: "Philosophy of the Image & Media Archeology", slug: "philosophy-image", foundations: ["design", "philosophy", "psychology", "vision", "semiotics", "analysis", "branding", "graphics", "art"] },
    { id: "philosophy-critical-theory", title: "Philosophy, Critical Theory & Technological Infrastructure", slug: "philosophy-critical-theory", foundations: ["philosophy", "tech", "semiotics", "analysis"] }
  ];
}

function build3DNodeMapGraph() {
  if (!threeNodesGroup || !threeLinesGroup) return;
  while (threeNodesGroup.children.length > 0) threeNodesGroup.remove(threeNodesGroup.children[0]);
  while (threeLinesGroup.children.length > 0) threeLinesGroup.remove(threeLinesGroup.children[0]);
  threeNodes = [];
  threeLines = [];

  if (!NETWORK_POSTS || NETWORK_POSTS.length === 0) return;

  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
  const GOLDEN_ANGLE = 2 * Math.PI * (1 - 1 / GOLDEN_RATIO);

  // Orbital tier radii
  const R_FOUNDATION = 100; // Level 1 (first level after center)
  const R_PILLAR = 205;     // Level 2 (second level)
  const R_SUBTOPIC = 310;   // Level 3 (third level)
  const R_TAG_BASE = 410;   // Level 4 (outer tag cloud)

  // 1. ROOT NODE (Level 0 - Center)
  const rootData = {
    id: "root",
    label: "UNTITLED.JPG",
    type: "root",
    color: "#E84A5F",
    postsCount: NETWORK_POSTS.length
  };

  const rootMesh = createGlitterSphereNodeMesh(22, 0xE84A5F, "root", 0.35);
  rootMesh.position.set(0, 0, 0);
  threeNodesGroup.add(rootMesh);

  const rootSprite = create3DTextSprite("UNTITLED.JPG", "#FFFFFF", 28);
  rootSprite.position.set(0, -29, 0);
  rootMesh.add(rootSprite);

  const rootNodeItem = { mesh: rootMesh, labelSprite: rootSprite, data: rootData, neighbors: new Set() };
  threeNodes.push(rootNodeItem);

  // 2. FOUNDATIONS (Level 1 - First level of nodes after the center)
  const foundationList = getCanonicalFoundations();
  const foundationNodeMap = {};
  const totalFoundations = foundationList.length;

  foundationList.forEach((fObj, fIdx) => {
    const fId = fObj.id || fObj.slug;
    const fName = (fObj.name || fId).toUpperCase();

    // Match all posts referencing this foundation
    const postsInFoundation = NETWORK_POSTS.filter(p => {
      if (!p.foundations || !Array.isArray(p.foundations)) return false;
      return p.foundations.some(f => {
        const clean = String(f).toLowerCase().trim();
        return clean === fId.toLowerCase() || clean === (fObj.slug || "").toLowerCase() || clean === (fObj.name || "").toLowerCase();
      });
    });

    // Fibonacci sphere distribution for uniform coverage around center
    const y = 1 - (fIdx / Math.max(1, totalFoundations - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * fIdx;
    const fDir = new THREE.Vector3(
      Math.cos(theta) * radiusAtY,
      y,
      Math.sin(theta) * radiusAtY
    ).normalize();
    const fPos = fDir.clone().multiplyScalar(R_FOUNDATION);

    const fRadius = Math.min(15, 11 + Math.min(4, postsInFoundation.length * 0.4));

    const fData = {
      id: `found_${fId}`,
      foundationId: fId,
      slug: fObj.slug || fId,
      label: fObj.name || fId,
      type: "foundation",
      color: "#4E95FF",
      postsCount: postsInFoundation.length,
      postSlugs: postsInFoundation.map(p => p.slug)
    };

    const fMesh = createGlitterSphereNodeMesh(fRadius, 0x4E95FF, "foundation", 0.28);
    fMesh.position.copy(fPos);
    threeNodesGroup.add(fMesh);

    const fSprite = create3DTextSprite(fName, "#79B8FF", 16);
    fSprite.position.set(0, -(fRadius + 8), 0);
    fMesh.add(fSprite);

    const fNodeItem = { mesh: fMesh, labelSprite: fSprite, data: fData, neighbors: new Set() };
    threeNodes.push(fNodeItem);

    // Register in map for lookup by id, slug, or name
    foundationNodeMap[fId.toLowerCase()] = fNodeItem;
    if (fObj.slug) foundationNodeMap[fObj.slug.toLowerCase()] = fNodeItem;
    if (fObj.name) foundationNodeMap[fObj.name.toLowerCase()] = fNodeItem;

    // Connect Level 1 (Foundation) directly to Level 0 (Center Root)
    rootNodeItem.neighbors.add(fNodeItem);
    fNodeItem.neighbors.add(rootNodeItem);
    create3DConnectionLine(rootNodeItem, fNodeItem, 0x1E3A6E, 0x4E95FF, 0.24);
  });

  // 3. PILLARS (Level 2 - Second level of nodes, grounded on foundations)
  const canonicalPillars = getCanonicalPillars();
  const pillarMap = {}; // upperName -> pillarObj
  canonicalPillars.forEach(cp => {
    const key = (cp.title || cp.slug).toUpperCase();
    pillarMap[key] = {
      name: cp.title.toUpperCase(),
      pillarId: cp.id || cp.slug,
      foundations: cp.foundations || [],
      posts: [],
      subtopics: {}
    };
  });

  NETWORK_POSTS.forEach(p => {
    const pil = (p.pillar || "GENERAL PILLAR").toUpperCase();
    const sub = (p.subtopic || "CORE THEORIES").toUpperCase();
    let pilObj = pillarMap[pil];
    if (!pilObj) {
      const foundCp = canonicalPillars.find(cp => (cp.id === p.pillar_id) || (cp.slug === p.pillar_id) || cp.title.toUpperCase() === pil);
      if (foundCp) pilObj = pillarMap[foundCp.title.toUpperCase()];
    }
    if (!pilObj) {
      pilObj = {
        name: pil,
        pillarId: p.pillar_id || pil.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        foundations: p.foundations || [],
        posts: [],
        subtopics: {}
      };
      pillarMap[pil] = pilObj;
    }

    pilObj.posts.push(p);

    if (!pilObj.subtopics[sub]) {
      pilObj.subtopics[sub] = { name: sub, subtopicId: p.subtopic_id || "", posts: [] };
    }
    pilObj.subtopics[sub].posts.push(p);
  });

  const pillarList = Object.values(pillarMap);
  const pillarNodeMap = {};
  const subtopicNodeMap = {};

  // Polyhedral basis directions for clean radial separation
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
    const postsInPillar = pilObj.posts;

    // Identify supporting foundation nodes
    const supportingFNodes = (pilObj.foundations || [])
      .map(fId => foundationNodeMap[String(fId).toLowerCase()])
      .filter(Boolean);

    // Direction vector: organic blend of supporting foundations and polyhedral basis
    const basisDir = (pillarBasisDirs[pIdx % pillarBasisDirs.length] || new THREE.Vector3(Math.cos(pIdx), Math.sin(pIdx), 0)).clone().normalize();
    let pilDir = basisDir;
    if (supportingFNodes.length > 0) {
      const avgFoundDir = new THREE.Vector3(0, 0, 0);
      supportingFNodes.forEach(fn => avgFoundDir.add(fn.mesh.position));
      if (avgFoundDir.lengthSq() > 0.001) {
        avgFoundDir.normalize();
        pilDir = avgFoundDir.clone().lerp(basisDir, 0.45).normalize();
      }
    }

    const pilPos = pilDir.clone().multiplyScalar(R_PILLAR);
    const pillarRadius = Math.min(22, 16 + Math.min(6, postsInPillar.length * 0.9));

    const pillarData = {
      id: `pillar_${pIdx}`,
      pillarId: pilObj.pillarId,
      label: pilName,
      type: "pillar",
      color: "#FF4D64",
      postsCount: postsInPillar.length,
      postSlugs: postsInPillar.map(p => p.slug)
    };

    const pillarMesh = createGlitterSphereNodeMesh(pillarRadius, 0xFF4D64, "pillar", 0.30);
    pillarMesh.position.copy(pilPos);
    threeNodesGroup.add(pillarMesh);

    const pillarSprite = create3DTextSprite(pilName, "#FFA0AD", 22);
    pillarSprite.position.set(0, -(pillarRadius + 9), 0);
    pillarMesh.add(pillarSprite);

    const pillarNodeItem = { mesh: pillarMesh, labelSprite: pillarSprite, data: pillarData, neighbors: new Set() };
    threeNodes.push(pillarNodeItem);
    pillarNodeMap[pilName] = pillarNodeItem;
    if (pilObj.pillarId) pillarNodeMap[pilObj.pillarId.toLowerCase()] = pillarNodeItem;

    // Connect Level 2 (Pillar) to its supporting Level 1 (Foundations)
    if (supportingFNodes.length > 0) {
      supportingFNodes.forEach(fNode => {
        fNode.neighbors.add(pillarNodeItem);
        pillarNodeItem.neighbors.add(fNode);
        create3DConnectionLine(fNode, pillarNodeItem, 0x2A3E62, 0x79B8FF, 0.20);
      });
    } else {
      rootNodeItem.neighbors.add(pillarNodeItem);
      pillarNodeItem.neighbors.add(rootNodeItem);
      create3DConnectionLine(rootNodeItem, pillarNodeItem, 0x8A2A38, 0xFF3B56, 0.20);
    }

    // 4. SUBTOPICS (Level 3 - Third level of nodes, branching outward from parent pillar)
    const subtopicEntries = Object.values(pilObj.subtopics);
    const subCount = subtopicEntries.length;

    // Construct orthogonal fan plane
    const upRef = Math.abs(pilDir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const rightVec = new THREE.Vector3().crossVectors(pilDir, upRef).normalize();
    const upVec = new THREE.Vector3().crossVectors(rightVec, pilDir).normalize();

    subtopicEntries.forEach((subObj, sIdx) => {
      const subName = subObj.name;
      const postsInSub = subObj.posts;
      const coneAngle = subCount === 1 ? 0 : 0.38;
      const fanAngle = subCount === 1 ? 0 : ((sIdx / (subCount - 1)) - 0.5) * Math.PI * 1.1;

      const subDir = pilDir.clone()
        .addScaledVector(rightVec, Math.cos(fanAngle) * coneAngle)
        .addScaledVector(upVec, Math.sin(fanAngle) * coneAngle)
        .normalize();

      const subDist = R_SUBTOPIC + (sIdx % 2) * 18;
      const subPos = subDir.clone().multiplyScalar(subDist);
      const subRadius = Math.min(15, 11 + Math.min(4, postsInSub.length * 0.9));

      const subData = {
        id: `sub_${pIdx}_${sIdx}`,
        subtopicId: subObj.subtopicId || "",
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

      const subSprite = create3DTextSprite(subName, "#FFD5DC", 16);
      subSprite.position.set(0, -(subRadius + 8), 0);
      subMesh.add(subSprite);

      const subNodeItem = { mesh: subMesh, labelSprite: subSprite, data: subData, neighbors: new Set() };
      threeNodes.push(subNodeItem);
      subtopicNodeMap[`${pilName}:::${subName}`] = subNodeItem;
      if (subObj.subtopicId) subtopicNodeMap[subObj.subtopicId.toLowerCase()] = subNodeItem;

      // Connect Level 3 (Subtopic) to Level 2 (Pillar)
      pillarNodeItem.neighbors.add(subNodeItem);
      subNodeItem.neighbors.add(pillarNodeItem);
      create3DConnectionLine(pillarNodeItem, subNodeItem, 0x652838, 0xFF6585, 0.14);
    });
  });

  // 5. TAGS (Level 4 - Outer tag sphere)
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
        if (p.pillar) uniqueTagMap[clean].pillars.add(p.pillar.toUpperCase());
        if (p.pillar && p.subtopic) uniqueTagMap[clean].subtopics.add(`${p.pillar.toUpperCase()}:::${p.subtopic.toUpperCase()}`);
      });
    }
  });

  const tagList = Object.values(uniqueTagMap);
  const tagNodeMap = {};
  const totalTags = tagList.length;

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

    const tagDist = R_TAG_BASE + (idx % 6) * 14;
    const finalPos = fibVec.multiplyScalar(tagDist);
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

    // Connect Level 4 (Tag) to Level 3 (Subtopics) or Level 2 (Pillars)
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

  // 6. INTER-TAG CO-OCCURRENCE LINES
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

  const pixelRatio = 2;
  const canvasWidth = 440 * pixelRatio;
  const canvasHeight = (lineCount > 1 ? 110 : 60) * pixelRatio;

  const canvasText = document.createElement("canvas");
  canvasText.width = canvasWidth;
  canvasText.height = canvasHeight;

  const tCtx = canvasText.getContext("2d");
  const actualFontSize = fontSize * pixelRatio;
  tCtx.font = `700 ${actualFontSize}px 'Azeret Mono', monospace`;
  tCtx.textAlign = "center";
  tCtx.textBaseline = "middle";

  const lineHeight = actualFontSize * 1.25;
  const startY = (canvasHeight / 2) - ((lineCount - 1) * lineHeight / 2);

  lines.forEach((l, i) => {
    const yPos = startY + (i * lineHeight);
    // Dark outline / halo for contrast against 3D nodes & space
    tCtx.strokeStyle = "rgba(10, 10, 14, 0.95)";
    tCtx.lineWidth = 5 * pixelRatio;
    tCtx.lineJoin = "round";
    tCtx.strokeText(l, canvasWidth / 2, yPos);

    // Sharp bright fill
    tCtx.fillStyle = colorHexStr;
    tCtx.fillText(l, canvasWidth / 2, yPos);
  });

  const texture = new THREE.CanvasTexture(canvasText);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);

  const baseScaleY = lineCount > 1 ? 23 : 15;
  const aspect = canvasWidth / canvasHeight;
  const scaleX = baseScaleY * aspect;
  const scaleY = baseScaleY;
  sprite.scale.set(scaleX, scaleY, 1);
  sprite.userData = { baseScaleX: scaleX, baseScaleY: scaleY };
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

  // Dynamic zoom compensation so text labels remain crisp and legible even when zoomed out
  if (threeCamera && threeNodes && threeNodes.length > 0) {
    const camDist = threeCamera.position.length();
    const zoomFactor = Math.max(1.0, Math.min(1.75, camDist / 330));
    threeNodes.forEach(n => {
      if (n.labelSprite && n.labelSprite.userData && n.labelSprite.userData.baseScaleX) {
        n.labelSprite.scale.set(
          n.labelSprite.userData.baseScaleX * zoomFactor,
          n.labelSprite.userData.baseScaleY * zoomFactor,
          1
        );
      }
    });
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

function getPostsForNode(nodeData) {
  if (!nodeData || !NETWORK_POSTS || NETWORK_POSTS.length === 0) return [];

  if (nodeData.type === "root") {
    return NETWORK_POSTS;
  }

  if (nodeData.type === "foundation") {
    const fId = (nodeData.foundationId || nodeData.id || "").replace(/^found_/, "").toLowerCase().trim();
    const fSlug = (nodeData.slug || "").toLowerCase().trim();
    const fName = (nodeData.label || "").toLowerCase().trim();
    return NETWORK_POSTS.filter(p => {
      if (!p.foundations || !Array.isArray(p.foundations)) return false;
      return p.foundations.some(f => {
        const clean = String(f).toLowerCase().trim();
        return clean === fId || clean === fSlug || clean === fName;
      });
    });
  }

  if (nodeData.type === "pillar") {
    const pName = (nodeData.label || "").toLowerCase().trim();
    const pId = (nodeData.pillarId || "").toLowerCase().trim();
    return NETWORK_POSTS.filter(p => {
      const pilName = (p.pillar || "").toLowerCase().trim();
      const pilId = (p.pillar_id || "").toLowerCase().trim();
      return pilName === pName || (pId && pilId === pId);
    });
  }

  if (nodeData.type === "subtopic") {
    const sName = (nodeData.label || "").toLowerCase().trim();
    const sId = (nodeData.subtopicId || "").toLowerCase().trim();
    return NETWORK_POSTS.filter(p => {
      const subName = (p.subtopic || "").toLowerCase().trim();
      const subId = (p.subtopic_id || "").toLowerCase().trim();
      return subName === sName || (sId && subId === sId);
    });
  }

  // Tag node
  const targetTag = (nodeData.rawTag || nodeData.label || "").toLowerCase().trim().replace(/^#/, "");
  return NETWORK_POSTS.filter(p => {
    if (!p.tags || !Array.isArray(p.tags)) return false;
    return p.tags.some(t => String(t).toLowerCase().trim().replace(/^#/, "") === targetTag);
  });
}

function getPostUrl(p) {
  if (!p) return "#";
  const rawSlug = String(p.slug || p.id || p.sys_id || "").trim();
  if (rawSlug) {
    const cleanSlug = rawSlug
      .replace(/^posts\//, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .replace(/\.html$/, "")
      .trim();
    if (cleanSlug) return `posts/${cleanSlug}.html`;
  }
  if (p.url && !p.url.startsWith("http") && p.url.includes(".html")) {
    const baseName = p.url
      .replace(/^posts\//, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .trim();
    return `posts/${baseName}`;
  }
  if (p.title) {
    const titleSlug = p.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (titleSlug) return `posts/${titleSlug}.html`;
  }
  return "index.html";
}

function openTagsTableForNode(nodeData) {
  if (!nodeData) return;
  const graphBtn = document.getElementById("toggle-view-graph-btn");
  const tableBtn = document.getElementById("toggle-view-table-btn");
  const canvasWrapper = document.getElementById("nodemap-canvas-wrapper");
  const tableWrapper = document.getElementById("tags-table-wrapper");
  const searchInput = document.getElementById("tags-table-search-input");

  // Switch tab buttons and view containers
  if (tableBtn && graphBtn) {
    tableBtn.classList.add("active");
    graphBtn.classList.remove("active");
  }
  if (canvasWrapper) canvasWrapper.style.display = "none";
  if (tableWrapper) tableWrapper.style.display = "flex";

  // Determine appropriate search filter string
  let query = "";
  if (nodeData.type === "root") {
    query = "";
  } else if (nodeData.type === "foundation" || nodeData.type === "pillar" || nodeData.type === "subtopic") {
    query = (nodeData.label || "").trim();
  } else {
    query = (nodeData.rawTag || nodeData.label || "").replace(/^#/, "").trim();
  }

  // Pre-fill and trigger search
  if (searchInput) {
    searchInput.value = query;
    searchInput.focus();
  }

  renderTagsDirectoryTable(query);
}

function updateActivePill(nodeData) {
  const pillEl = document.getElementById("nodemap-active-pill");
  if (!pillEl) return;
  if (!nodeData) {
    pillEl.style.display = "none";
    pillEl.textContent = "";
    pillEl.onclick = null;
    pillEl.onkeydown = null;
    return;
  }

  let pillText = "";
  let queryName = "";
  if (nodeData.type === "root") {
    pillText = `[ CORE : UNTITLED.JPG ]`;
    queryName = "Untitled.jpg Taxonomy";
  } else if (nodeData.type === "foundation") {
    pillText = `[ FOUNDATION : ${nodeData.label.toUpperCase()} ]`;
    queryName = nodeData.label;
  } else if (nodeData.type === "pillar") {
    pillText = `[ PILLAR : ${nodeData.label.toUpperCase()} ]`;
    queryName = nodeData.label;
  } else if (nodeData.type === "subtopic") {
    pillText = `[ SUBTOPIC : ${nodeData.label.toUpperCase()} ]`;
    queryName = nodeData.label;
  } else {
    const raw = (nodeData.rawTag || nodeData.label || "").toUpperCase().replace(/^#/, "");
    pillText = `[ TAG : #${raw} ]`;
    queryName = `#${raw}`;
  }

  pillEl.textContent = pillText;
  pillEl.title = `Click to view ${queryName} in Tags Directory Table`;
  pillEl.style.display = "inline-flex";

  pillEl.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openTagsTableForNode(nodeData);
  };

  pillEl.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      openTagsTableForNode(nodeData);
    }
  };
}

function renderSelectedNodePostsStrip(nodeData) {
  const strip = document.getElementById("nodemap-posts-strip");
  if (!strip) return;

  if (!nodeData) {
    strip.innerHTML = "";
    return;
  }

  const posts = getPostsForNode(nodeData);

  // Chronological order: left most recent, right oldest
  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const postCardsHtml = posts.map((p, idx) => {
    const postUrl = getPostUrl(p);
    const coverImg = p.image || (p.thumbnail ? p.thumbnail.replace('thumbnails/', '') : '');
    const bgStyle = coverImg ? `background-image: url('${coverImg}');` : '';
    const safeTitle = (p.title || "Read Dispatch").replace(/"/g, '&quot;');
    const safeReadTime = p.read_time ? ` • ${p.read_time}` : '';
    const isFeatured = p.featured === true || String(p.featured).toLowerCase() === 'true';

    return `
      <a href="${postUrl}" class="nodemap-post-card ${isFeatured ? 'is-featured' : ''}" style="--card-idx: ${idx}; ${bgStyle}" title="${safeTitle}${safeReadTime}" aria-label="${safeTitle}" target="_self">
        <div class="nodemap-post-card-inner">
          <span class="nodemap-post-card-label">READ</span>
        </div>
      </a>
    `;
  }).join("");

  const tagQuery = activeTagFilter || (nodeData.type === 'tag' ? (nodeData.rawTag || nodeData.label) : nodeData.label);
  const archiveUrl = `archive.html?tag=${encodeURIComponent(tagQuery)}`;
  const seeAllCardHtml = `
    <a href="${archiveUrl}" class="nodemap-see-all-card" style="--card-idx: ${posts.length};" title="View all dispatches with ${tagQuery} in Timeline" target="_self">
      <span class="see-all-slash">//</span>
      <span class="see-all-text">SEE<br>ALL</span>
    </a>
  `;

  strip.innerHTML = postCardsHtml + seeAllCardHtml;
}

function updateThreeSceneFocus() {
  if (!threeNodes || threeNodes.length === 0) return;

  const activeNodeItem = activeNodeFilter ? threeNodes.find(n => n.data === activeNodeFilter) : null;
  const isSelectedState = !!activeNodeItem;
  const targetHoverItem = hoveredThreeNode;

  threeNodes.forEach(n => {
    if (!n.mesh) return;

    if (isSelectedState) {
      const isSelectedNode = n === activeNodeItem;
      const isNeighbor = activeNodeItem.neighbors && activeNodeItem.neighbors.has(n);
      const isHoveredInSelected = n === targetHoverItem;

      if (isSelectedNode) {
        const s = isHoveredInSelected ? 1.75 : 1.6;
        n.mesh.scale.set(s, s, s);
        if (n.mesh.material) n.mesh.material.emissiveIntensity = 0.75;
        if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = 1.0;
      } else if (isNeighbor) {
        const s = isHoveredInSelected ? 1.4 : 1.25;
        n.mesh.scale.set(s, s, s);
        if (n.mesh.material) n.mesh.material.emissiveIntensity = 0.45;
        if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = 0.95;
      } else {
        const s = isHoveredInSelected ? 1.15 : 0.88;
        n.mesh.scale.set(s, s, s);
        if (n.mesh.material) n.mesh.material.emissiveIntensity = n.data && n.data.type === "root" ? 0.35 : (n.data && (n.data.type === "pillar" || n.data.type === "foundation") ? 0.28 : (n.data && n.data.type === "subtopic" ? 0.22 : 0.18));
        if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = isHoveredInSelected ? 0.85 : 0.65;
      }
    } else if (targetHoverItem) {
      const isHovered = n === targetHoverItem;
      const isNeighbor = targetHoverItem.neighbors && targetHoverItem.neighbors.has(n);

      if (isHovered) {
        n.mesh.scale.set(1.45, 1.45, 1.45);
        if (n.mesh.material) n.mesh.material.emissiveIntensity = 0.55;
        if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = 1.0;
      } else if (isNeighbor) {
        n.mesh.scale.set(1.22, 1.22, 1.22);
        if (n.mesh.material) n.mesh.material.emissiveIntensity = 0.35;
        if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = 0.92;
      } else {
        n.mesh.scale.set(1.0, 1.0, 1.0);
        if (n.mesh.material) n.mesh.material.emissiveIntensity = n.data && n.data.type === "root" ? 0.35 : (n.data && (n.data.type === "pillar" || n.data.type === "foundation") ? 0.28 : (n.data && n.data.type === "subtopic" ? 0.22 : 0.18));
        if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = 0.75;
      }
    } else {
      n.mesh.scale.set(1.0, 1.0, 1.0);
      if (n.mesh.material) n.mesh.material.emissiveIntensity = n.data && n.data.type === "root" ? 0.35 : (n.data && (n.data.type === "pillar" || n.data.type === "foundation") ? 0.28 : (n.data && n.data.type === "subtopic" ? 0.22 : 0.18));
      if (n.labelSprite && n.labelSprite.material) n.labelSprite.material.opacity = 1.0;
    }
  });

  // Highlight Lines
  if (threeLines && threeLines.length > 0) {
    const focusItem = activeNodeItem || targetHoverItem;
    threeLines.forEach(l => {
      if (!l.mesh || !l.mesh.material) return;
      if (focusItem) {
        const isDirect = l.fromItem === focusItem || l.toItem === focusItem;
        if (isDirect) {
          l.mesh.material.color.setHex(0xFF4D64);
          l.mesh.material.opacity = isSelectedState ? 1.0 : 0.95;
        } else {
          l.mesh.material.color.setHex(l.defaultColorHex);
          l.mesh.material.opacity = isSelectedState ? 0.04 : l.defaultOpacity;
        }
      } else {
        l.mesh.material.color.setHex(l.defaultColorHex);
        l.mesh.material.opacity = l.defaultOpacity;
      }
    });
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

    if (hoveredThreeNode) {
      if (canvas) canvas.style.cursor = "pointer";
    } else {
      if (canvas) canvas.style.cursor = "default";
    }

    updateThreeSceneFocus();
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
    // Deselect if already selected
    activeNodeFilter = null;
    activeTagFilter = null;
    setNodeFilterUIState(false);
    updateActivePill(null);
    renderSelectedNodePostsStrip(null);
    updateThreeSceneFocus();
  } else {
    // Select clicked node
    activeNodeFilter = clickedData;
    if (clickedData.type === "foundation" || clickedData.type === "pillar" || clickedData.type === "subtopic") {
      activeTagFilter = clickedData.label;
    } else if (clickedData.type === "tag") {
      activeTagFilter = clickedData.rawTag;
    } else {
      activeTagFilter = "all";
    }

    setNodeFilterUIState(true, activeTagFilter);
    updateActivePill(clickedData);
    renderSelectedNodePostsStrip(clickedData);
    updateThreeSceneFocus();
  }
}

function onThreeMouseLeave() {
  threeMouse.set(-999, -999);
  hoveredThreeNode = null;
  updateThreeSceneFocus();
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

  // 1. ROOT NODE (Level 0 - Center)
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

  // 2. FOUNDATIONS (Level 1 - First level of nodes after center)
  const foundationList = getCanonicalFoundations();
  const foundationNodeMap = {};
  const totalFoundations = foundationList.length;
  const fDistance = Math.min(w, h) * 0.16;

  foundationList.forEach((fObj, fIdx) => {
    const fId = fObj.id || fObj.slug;
    const fAngle = (fIdx / Math.max(1, totalFoundations)) * Math.PI * 2;
    const fx = cx + Math.cos(fAngle) * fDistance;
    const fy = cy + Math.sin(fAngle) * fDistance;

    const postsInFoundation = NETWORK_POSTS.filter(p => {
      if (!p.foundations || !Array.isArray(p.foundations)) return false;
      return p.foundations.some(f => {
        const clean = String(f).toLowerCase().trim();
        return clean === fId.toLowerCase() || clean === (fObj.slug || "").toLowerCase() || clean === (fObj.name || "").toLowerCase();
      });
    });

    const fRadius = Math.min(13, 10 + postsInFoundation.length * 0.3);

    const fNode = {
      id: `found_${fId}`,
      foundationId: fId,
      slug: fObj.slug || fId,
      label: (fObj.name || fId).toUpperCase(),
      type: "foundation",
      x: fx,
      y: fy,
      angle: fAngle,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: fRadius,
      color: "#4E95FF",
      postsCount: postsInFoundation.length
    };
    nodes.push(fNode);
    foundationNodeMap[fId.toLowerCase()] = fNode;
    if (fObj.slug) foundationNodeMap[fObj.slug.toLowerCase()] = fNode;
    if (fObj.name) foundationNodeMap[fObj.name.toLowerCase()] = fNode;

    // Connect Level 1 (Foundation) to Level 0 (Root)
    connections.push({ from: rootNode, to: fNode, color: "rgba(78, 149, 255, 0.7)", weight: 1.8 });
  });

  // 3. PILLARS (Level 2 - Second level of nodes, grounded on foundations)
  const canonicalPillars = getCanonicalPillars();
  const pillarMap = {};
  canonicalPillars.forEach(cp => {
    const key = (cp.title || cp.slug).toUpperCase();
    pillarMap[key] = {
      name: cp.title.toUpperCase(),
      pillarId: cp.id || cp.slug,
      foundations: cp.foundations || [],
      posts: [],
      subtopics: {}
    };
  });

  NETWORK_POSTS.forEach(p => {
    const pil = (p.pillar || "GENERAL PILLAR").toUpperCase();
    const sub = (p.subtopic || "CORE THEORIES").toUpperCase();
    let pilObj = pillarMap[pil];
    if (!pilObj) {
      const foundCp = canonicalPillars.find(cp => (cp.id === p.pillar_id) || (cp.slug === p.pillar_id) || cp.title.toUpperCase() === pil);
      if (foundCp) pilObj = pillarMap[foundCp.title.toUpperCase()];
    }
    if (!pilObj) {
      pilObj = {
        name: pil,
        pillarId: p.pillar_id || pil.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        foundations: p.foundations || [],
        posts: [],
        subtopics: {}
      };
      pillarMap[pil] = pilObj;
    }
    pilObj.posts.push(p);

    if (!pilObj.subtopics[sub]) pilObj.subtopics[sub] = { name: sub, subtopicId: p.subtopic_id || "", posts: [] };
    pilObj.subtopics[sub].posts.push(p);
  });

  const pillarList = Object.values(pillarMap);
  const pillarNodeMap = {};
  const subtopicNodeMap = {};
  const pillarCount = pillarList.length;
  const pDistance = Math.min(w, h) * 0.32;

  pillarList.forEach((pilObj, pIdx) => {
    const pilName = pilObj.name;
    const postsInPillar = pilObj.posts;

    // Supporting foundations
    const supportingFNodes = (pilObj.foundations || [])
      .map(fId => foundationNodeMap[String(fId).toLowerCase()])
      .filter(Boolean);

    // Calculate angle towards supporting foundations or evenly spaced circle
    let pAngle = (pIdx / Math.max(1, pillarCount)) * Math.PI * 2;
    if (supportingFNodes.length > 0) {
      let avgAngleX = 0, avgAngleY = 0;
      supportingFNodes.forEach(fn => {
        avgAngleX += Math.cos(fn.angle);
        avgAngleY += Math.sin(fn.angle);
      });
      pAngle = Math.atan2(avgAngleY, avgAngleX);
    }

    const px = cx + Math.cos(pAngle) * pDistance;
    const py = cy + Math.sin(pAngle) * pDistance;
    const pillarRadius = Math.min(18, 14 + postsInPillar.length * 0.8);

    const pillarNode = {
      id: `pillar_${pIdx}`,
      pillarId: pilObj.pillarId,
      label: pilName,
      type: "pillar",
      x: px,
      y: py,
      angle: pAngle,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: pillarRadius,
      color: "#FF4D64",
      postsCount: postsInPillar.length
    };
    nodes.push(pillarNode);
    pillarNodeMap[pilName] = pillarNode;
    if (pilObj.pillarId) pillarNodeMap[pilObj.pillarId.toLowerCase()] = pillarNode;

    // Connect Level 2 (Pillar) to supporting Level 1 (Foundations)
    if (supportingFNodes.length > 0) {
      supportingFNodes.forEach(fNode => {
        connections.push({ from: fNode, to: pillarNode, color: "rgba(121, 184, 255, 0.6)", weight: 1.6 });
      });
    } else {
      connections.push({ from: rootNode, to: pillarNode, color: "rgba(232, 74, 95, 0.7)", weight: 2 });
    }

    // 4. SUBTOPICS (Level 3 - Third level of nodes, branching from parent pillar)
    const subEntries = Object.values(pilObj.subtopics);
    const subCount = subEntries.length;
    const sDistance = Math.min(w, h) * 0.48;

    subEntries.forEach((subObj, sIdx) => {
      const subName = subObj.name;
      const sAngle = pAngle + (subCount === 1 ? 0 : ((sIdx / (subCount - 1)) - 0.5) * 0.85);
      const sx = cx + Math.cos(sAngle) * sDistance;
      const sy = cy + Math.sin(sAngle) * sDistance;

      const postsInSub = subObj.posts;
      const subRadius = Math.min(13, 9.5 + postsInSub.length * 0.7);

      const subNode = {
        id: `sub_${pIdx}_${sIdx}`,
        subtopicId: subObj.subtopicId || "",
        label: subName,
        type: "subtopic",
        pillar: pilName,
        x: sx,
        y: sy,
        angle: sAngle,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: subRadius,
        color: "#FFA0B0",
        postsCount: postsInSub.length
      };
      nodes.push(subNode);
      subtopicNodeMap[`${pilName}:::${subName}`] = subNode;
      if (subObj.subtopicId) subtopicNodeMap[subObj.subtopicId.toLowerCase()] = subNode;

      // Connect Level 3 (Subtopic) to Level 2 (Pillar)
      connections.push({ from: pillarNode, to: subNode, color: "rgba(255, 160, 176, 0.6)", weight: 1.4 });
    });
  });

  // 5. TAGS (Level 4 - Outer tag layer)
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
        if (p.pillar) uniqueTagMap[clean].pillars.add(p.pillar.toUpperCase());
        if (p.pillar && p.subtopic) uniqueTagMap[clean].subtopics.add(`${p.pillar.toUpperCase()}:::${p.subtopic.toUpperCase()}`);
      });
    }
  });

  const tagList = Object.values(uniqueTagMap);
  const tagNodeMap = {};

  tagList.forEach((tagObj, idx) => {
    const angle = (idx / Math.max(1, tagList.length)) * Math.PI * 2;
    const distance = Math.min(w, h) * 0.64 + (idx % 4) * 10;
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
      ctx.fillStyle = node.type === "foundation" ? "rgba(78, 149, 255, 0.35)" : (node.type === "tag" ? "rgba(226, 232, 240, 0.22)" : "rgba(232, 74, 95, 0.35)");
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
}

function handleCanvasClick(e) {
  if (!hoveredNode) return;

  if (activeNodeFilter === hoveredNode) {
    activeNodeFilter = null;
    activeTagFilter = null;
    setNodeFilterUIState(false);
    updateActivePill(null);
    renderSelectedNodePostsStrip(null);
  } else {
    activeNodeFilter = hoveredNode;
    if (hoveredNode.type === "foundation" || hoveredNode.type === "pillar" || hoveredNode.type === "subtopic") {
      activeTagFilter = hoveredNode.label;
    } else if (hoveredNode.type === "tag") {
      activeTagFilter = hoveredNode.rawTag;
    } else {
      activeTagFilter = "all";
    }

    setNodeFilterUIState(true, activeTagFilter);
    updateActivePill(hoveredNode);
    renderSelectedNodePostsStrip(hoveredNode);
  }
}

function handleCanvasMouseLeave() {
  hoveredNode = null;
}

function resetNodeHighlights() {
  activeNodeFilter = null;
  activeTagFilter = null;
  hoveredNode = null;
  hoveredThreeNode = null;
  updateActivePill(null);
  renderSelectedNodePostsStrip(null);
  updateThreeSceneFocus();
}
