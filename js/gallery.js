/**
 * UNTITLED.JPG — ULTRA-MINIMAL 3D SPATIAL GALLERY ENGINE
 * High-performance 3D spatial canvas displaying full-size cover artworks floating in 3D space,
 * with exact native aspect ratios, centered active view, discreet side navigation,
 * published status filtering, and Full-Height Artwork Modal with Share & Download.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[SPATIAL 3D GALLERY] Initializing Refined 3D Space Engine...');

  let galleryPosts = [];
  let currentIndex = 0;

  // Filter helper: Exclude drafts and empty/missing images
  function isPublishedWithImage(post) {
    const isPublished = !post.status || post.status.toLowerCase() === 'published';
    const hasImage = post.image && typeof post.image === 'string' && post.image.trim() !== '';
    return isPublished && hasImage;
  }

  // Robust POSTS_DATA extraction (Handles window.DYNAMIC_POSTS, window.POSTS_DATA, or fallback posts.json)
  const dataSrc = (window.DYNAMIC_POSTS && Array.isArray(window.DYNAMIC_POSTS) && window.DYNAMIC_POSTS.length > 0)
    ? window.DYNAMIC_POSTS
    : ((window.POSTS_DATA && Array.isArray(window.POSTS_DATA) && window.POSTS_DATA.length > 0) 
      ? window.POSTS_DATA 
      : (typeof POSTS_DATA !== 'undefined' ? POSTS_DATA : []));

  if (dataSrc.length > 0) {
    galleryPosts = dataSrc.filter(isPublishedWithImage);
    initGallery();
  } else {
    fetch('posts.json')
      .then(res => res.json())
      .then(data => {
        galleryPosts = data.filter(isPublishedWithImage);
        initGallery();
      })
      .catch(err => console.error('[SPATIAL 3D GALLERY] Error loading posts.json:', err));
  }

  function initGallery() {
    if (galleryPosts.length === 0) {
      console.warn('[SPATIAL 3D GALLERY] No published posts with images found.');
      return;
    }

    // Update HUD immediately with initial post metadata
    updateHUDPanel(0);

    if (typeof THREE !== 'undefined') {
      initThreeJS3DSpace();
    } else {
      initCSS3DSpace();
    }

    setupHUDNavigation();
    setupSideClickNavigation();
    setupFullViewModal();
  }

  // ==============================================================================
  // THREE.JS HIGH-PERFORMANCE 3D SPATIAL ENGINE
  // ==============================================================================
  function initThreeJS3DSpace() {
    const container = document.getElementById('spatial-canvas-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.022);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xe84a5f, 2.0, 50);
    pointLight.position.set(0, 0, 12);
    scene.add(pointLight);

    const meshes = [];
    const radius = 15;
    const count = galleryPosts.length;

    galleryPosts.forEach((post, i) => {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - radius * 0.5;
      const y = 0;

      // Default placeholder plane geometry
      const defaultAspect = 16 / 10;
      const baseHeight = 6.4;
      const baseWidth = baseHeight * defaultAspect;
      const geometry = new THREE.PlaneGeometry(baseWidth, baseHeight);

      const material = new THREE.MeshBasicMaterial({
        color: 0x1a1a1a,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.y = -angle;
      mesh.userData = { index: i, post: post, basePos: { x, y, z }, angle };

      scene.add(mesh);
      meshes.push(mesh);

      // Preload Image via HTML Image Element for 100% Reliable Texture Binding
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const nativeAspect = (img.naturalWidth && img.naturalHeight) 
          ? (img.naturalWidth / img.naturalHeight) 
          : defaultAspect;
        
        const finalHeight = 6.4;
        const finalWidth = finalHeight * nativeAspect;

        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
        mesh.material.dispose();
        mesh.material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
        });
        mesh.userData.nativeAspect = nativeAspect;
      };

      img.onerror = (err) => {
        console.warn(`[SPATIAL 3D GALLERY] Failed to load image: ${post.image}`, err);
      };

      img.src = post.image;
    });

    // Interaction & Camera Controls (Scroll Zoom)
    let targetRotationY = 0;
    let currentRotationY = 0;
    let targetCameraZ = 18;

    const viewport = document.querySelector('.gallery-spatial-viewport') || container;

    viewport.addEventListener('wheel', (e) => {
      if (e.target.closest('.floating-hud-panel') || e.target.closest('.artwork-full-modal')) return;
      e.preventDefault();
      targetCameraZ += e.deltaY * 0.008;
      targetCameraZ = Math.max(9, Math.min(28, targetCameraZ));
    }, { passive: false });

    // Raycaster & Artwork Click Handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e) => {
      // Ignore click if clicking HUD panel, side chevrons, or modal controls
      if (e.target.closest('.floating-hud-panel') || 
          e.target.closest('.gallery-side-nav-zone') || 
          e.target.closest('.artwork-full-modal')) {
        return;
      }
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        if (clickedMesh.userData.index === currentIndex) {
          openFullViewModal(galleryPosts[currentIndex]);
        } else {
          window.focusGalleryIndex(clickedMesh.userData.index);
        }
      } else {
        // Clicked in canvas area: navigate if clicking far edges, or open full view modal for center view
        const relX = (e.clientX - rect.left) / rect.width;
        if (relX < 0.20) {
          const prevIdx = (currentIndex - 1 + galleryPosts.length) % galleryPosts.length;
          window.focusGalleryIndex(prevIdx);
        } else if (relX > 0.80) {
          const nextIdx = (currentIndex + 1) % galleryPosts.length;
          window.focusGalleryIndex(nextIdx);
        } else {
          openFullViewModal(galleryPosts[currentIndex]);
        }
      }
    };

    container.addEventListener('click', handleCanvasClick);

    function focusOnMeshIndex(index) {
      currentIndex = index;
      const mesh = meshes[index];
      if (!mesh) return;

      targetRotationY = -mesh.userData.angle;
      updateHUDPanel(index);
    }

    window.focusGalleryIndex = (index) => {
      currentIndex = (index + count) % count;
      focusOnMeshIndex(currentIndex);
    };

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentRotationY += (targetRotationY - currentRotationY) * 0.06;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.06;

      meshes.forEach((mesh, idx) => {
        const isCurrent = idx === currentIndex;
        const rotatedAngle = mesh.userData.angle + currentRotationY;

        if (isCurrent) {
          // SELECTED IMAGE: Perfectly centered, 100% stationary!
          mesh.position.x = Math.sin(rotatedAngle) * radius;
          mesh.position.z = Math.cos(rotatedAngle) * radius - radius * 0.5;
          mesh.position.y = 0;
          mesh.rotation.y = -rotatedAngle;

          const targetScale = 1.25;
          mesh.scale.x += (targetScale - mesh.scale.x) * 0.08;
          mesh.scale.y += (targetScale - mesh.scale.y) * 0.08;
        } else {
          // OTHER IMAGES: Gentle, subtle ambient levitation
          const subtleLevitation = Math.sin(elapsedTime * 0.4 + idx) * 0.08;

          mesh.position.x = Math.sin(rotatedAngle) * radius;
          mesh.position.z = Math.cos(rotatedAngle) * radius - radius * 0.5;
          mesh.position.y = subtleLevitation;
          mesh.rotation.y = -rotatedAngle;

          const targetScale = 0.92;
          mesh.scale.x += (targetScale - mesh.scale.x) * 0.08;
          mesh.scale.y += (targetScale - mesh.scale.y) * 0.08;
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // ==============================================================================
  // CSS 3D SPATIAL ENGINE (FALLBACK)
  // ==============================================================================
  function initCSS3DSpace() {
    const container = document.getElementById('spatial-canvas-container');
    if (!container) return;

    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.perspective = '1200px';

    container.innerHTML = `
      <div id="css-3d-stage" style="width: 700px; height: 460px; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
        ${galleryPosts.map((post, i) => `
          <div class="css-3d-card" data-index="${i}" style="position: absolute; inset: 0; transform-style: preserve-3d; cursor: pointer; transition: transform 0.5s ease, opacity 0.5s ease;">
            <img src="${post.image}" alt="${escapeHtml(post.title)}" style="width:100%; height:100%; object-fit:contain; background:#050505; border:1px solid rgba(255,255,255,0.15); box-shadow:0 15px 40px rgba(0,0,0,0.9);" />
          </div>
        `).join('')}
      </div>
    `;

    updateCSS3DPositions();

    window.focusGalleryIndex = (index) => {
      currentIndex = (index + galleryPosts.length) % galleryPosts.length;
      updateCSS3DPositions();
      updateHUDPanel(currentIndex);
    };

    container.querySelectorAll('.css-3d-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        if (idx === currentIndex) {
          openFullViewModal(galleryPosts[currentIndex]);
        } else {
          window.focusGalleryIndex(idx);
        }
      });
    });
  }

  function updateCSS3DPositions() {
    const cards = document.querySelectorAll('.css-3d-card');
    const total = cards.length;

    cards.forEach((card, i) => {
      const offset = i - currentIndex;
      const translateZ = offset === 0 ? 120 : -Math.abs(offset) * 180;
      const translateX = offset * 320;
      const rotateY = offset * -12;
      const opacity = offset === 0 ? 1.0 : Math.max(0.2, 1 - Math.abs(offset) * 0.35);

      card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
      card.style.opacity = opacity;
      card.style.zIndex = total - Math.abs(offset);
      
      if (offset === 0) {
        card.style.animation = 'none';
      } else {
        card.style.animation = 'subtleFloat 6s ease-in-out infinite alternate';
      }
    });
  }

  // ==============================================================================
  // SIDE NAVIGATION CHEVRONS & HUD CONTROLLER
  // ==============================================================================
  function setupSideClickNavigation() {
    const sideLeft = document.getElementById('side-nav-left');
    const sideRight = document.getElementById('side-nav-right');

    if (sideLeft) {
      sideLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex - 1 + galleryPosts.length) % galleryPosts.length;
        if (window.focusGalleryIndex) window.focusGalleryIndex(nextIdx);
      });
    }

    if (sideRight) {
      sideRight.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % galleryPosts.length;
        if (window.focusGalleryIndex) window.focusGalleryIndex(nextIdx);
      });
    }
  }

  function updateHUDPanel(index) {
    const post = galleryPosts[index];
    if (!post) return;

    const counterEl = document.getElementById('hud-counter-val');
    const formatEl = document.getElementById('hud-format-val');
    const titleEl = document.getElementById('hud-title-val');
    const pillarEl = document.getElementById('hud-pillar-val');
    const linkEl = document.getElementById('hud-read-link');

    if (counterEl) counterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(galleryPosts.length).padStart(2, '0')}`;
    if (formatEl) formatEl.textContent = `[ ${post.format || 'POST'} ]`;
    if (titleEl) titleEl.textContent = post.title;
    if (pillarEl) pillarEl.textContent = `${post.date || ''} • ${post.pillar || 'AI PERCEPTION & CULTURE'}`;
    if (linkEl) linkEl.href = `index.html?post=${post.slug || post.id}`;
  }

  function setupHUDNavigation() {
    const prevBtn = document.getElementById('hud-prev-btn');
    const nextBtn = document.getElementById('hud-next-btn');
    const titleEl = document.getElementById('hud-title-val');

    if (titleEl) {
      titleEl.addEventListener('click', () => {
        openFullViewModal(galleryPosts[currentIndex]);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex - 1 + galleryPosts.length) % galleryPosts.length;
        if (window.focusGalleryIndex) window.focusGalleryIndex(nextIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % galleryPosts.length;
        if (window.focusGalleryIndex) window.focusGalleryIndex(nextIdx);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        const nextIdx = (currentIndex - 1 + galleryPosts.length) % galleryPosts.length;
        if (window.focusGalleryIndex) window.focusGalleryIndex(nextIdx);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentIndex + 1) % galleryPosts.length;
        if (window.focusGalleryIndex) window.focusGalleryIndex(nextIdx);
      }
    });
  }

  // ==============================================================================
  // FULL HEIGHT ARTWORK VIEW MODAL WITH SHARE & DOWNLOAD
  // ==============================================================================
  const fullModal = document.getElementById('artwork-full-modal');
  const fullImg = document.getElementById('artwork-full-img');
  const fullTitle = document.getElementById('artwork-full-title');
  const fullMeta = document.getElementById('artwork-full-meta');
  const shareBtn = document.getElementById('artwork-share-btn');
  const shareBtnText = document.getElementById('share-btn-text');
  const downloadBtn = document.getElementById('artwork-download-btn');
  const dispatchBtn = document.getElementById('artwork-dispatch-btn');
  const closeBtn = document.getElementById('artwork-modal-close');

  function openFullViewModal(post) {
    const modal = document.getElementById('artwork-full-modal');
    const img = document.getElementById('artwork-full-img');
    const downloadLink = document.getElementById('artwork-download-btn');
    const shareText = document.getElementById('share-btn-text');

    if (!modal || !post) return;

    // Hide HUD panel when opening lightbox view
    const hudPanel = document.querySelector('.floating-hud-panel');
    if (hudPanel) hudPanel.style.display = 'none';

    if (img) img.src = post.image;
    if (downloadLink) {
      downloadLink.href = post.image;
      const ext = post.image.split('.').pop() || 'png';
      downloadLink.download = `${post.slug || post.id || 'cover-art'}.${ext}`;
    }

    if (shareText) shareText.textContent = 'SHARE';
    modal.style.display = 'flex';
  }

  function closeFullViewModal() {
    const modal = document.getElementById('artwork-full-modal');
    if (modal) modal.style.display = 'none';
    // Restore HUD panel when closing lightbox view
    const hudPanel = document.querySelector('.floating-hud-panel');
    if (hudPanel) hudPanel.style.display = 'flex';
  }

  window.openFullViewModal = openFullViewModal;
  window.closeFullViewModal = closeFullViewModal;

  function setupFullViewModal() {
    const modal = document.getElementById('artwork-full-modal');
    const closeBtn = document.getElementById('artwork-modal-close');
    const shareBtn = document.getElementById('artwork-share-btn');
    const shareBtnText = document.getElementById('share-btn-text');

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFullViewModal();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        // Only close if user clicks directly on the dark overlay background (modal backdrop)
        if (e.target === modal) {
          closeFullViewModal();
        }
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const post = galleryPosts[currentIndex];
        if (!post) return;
        const shareUrl = `${window.location.origin}${window.location.pathname.replace('gallery.html', 'index.html')}?post=${post.slug || post.id}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
          if (shareBtnText) {
            shareBtnText.textContent = 'COPIED!';
            setTimeout(() => { shareBtnText.textContent = 'SHARE'; }, 2000);
          }
        }).catch(() => {
          prompt('Copy dispatch URL:', shareUrl);
        });
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFullViewModal();
      }
    });
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Global Subscribe Modal Handlers
  window.openSubscribeModal = function() {
    const modal = document.getElementById('subscribe-modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  };

  window.closeSubscribeModal = function() {
    const modal = document.getElementById('subscribe-modal');
    if (modal && typeof modal.close === 'function') {
      modal.close();
    }
  };

  const subscribeForm = document.getElementById('subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('[SUBSCRIPTION CONFIRMED] Transmission endpoint registered.');
      window.closeSubscribeModal();
    });
  }

  const subscribeCancelBtns = document.querySelectorAll('#subscribe-modal .btn-modal-cancel');
  subscribeCancelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.closeSubscribeModal();
    });
  });

  const subscribeModal = document.getElementById('subscribe-modal');
  if (subscribeModal) {
    subscribeModal.addEventListener('click', (e) => {
      if (e.target === subscribeModal) {
        window.closeSubscribeModal();
      }
    });
  }
});

