/* ==============================================================================
   UNTITLED.JPG — CLIENT APPLICATION & COMPONENT HYDRATION
   Brand: Juan Pablo Giusepponi — "Overthinking Undervalued Means"
   ============================================================================== */

/**
 * Central Post Store / In-Memory Content Database
 */
const POSTS_DATABASE = {
  "post-turing": {
    theme: "dark",
    format: "ESSAY",
    pillar: "AI PERCEPTION, CULTURE & REPRESENTATION",
    subtopic: "SYNTHETIC IDENTITY & NORMATIVE MACHINES",
    title: "AI is Queer: Turing, Synthetic Bodies, Mimicry, and the Violence of the Statistical Mean",
    subtitle: "How Alan Turing's Imitation Game codified survival through deception.",
    date: "2026.09.25",
    author: "Juan P. Giusepponi",
    posted_by: "JPG",
    sys_id: "SYS_260925_TURQ",
    read_time: "9 MIN READ",
    via: "Matteo Pasquinelli / e-flux journal",
    content: `
      <h2 class="essay-section-kicker">01. The Original Game of Passing</h2>
      <p class="essay-paragraph">When Alan Turing framed the benchmark for machine intelligence in his 1950 landmark paper <em>Computing Machinery and Intelligence</em>, he did not propose a benchmark of mathematical problem-solving or axiomatic deduction.</p>
      <p class="essay-paragraph">Instead, he proposed a theatrical parlor game rooted in <strong>deception, mimicry, and social performativity</strong>: the Imitation Game. The test begins with an interrogation of gender across typed teleprinter text. The computer enters not as a calculator, but as an impersonator of social conventions.</p>
      <blockquote class="essay-quote">"By employing a schema of mind that prioritizes good manners and familiarity with social conventions, the Turing Test remains an example of austere social normativity..." — Matteo Pasquinelli</blockquote>
      
      <h2 class="essay-section-kicker">02. Intelligence as Defensive Camouflage</h2>
      <p class="essay-paragraph">In a society where male homosexuality was a heavily prosecuted criminal offense, computing what an authority figure expected to hear was not an abstract game—it was a daily survival discipline.</p>
      <p class="essay-paragraph">The social mechanism of "passing" requires an intense Theory of Mind: anticipating the prejudices of the interrogator, simulating the dominant dialect, and suppressing aberrant signal. Turing transposed this defensive posture into the foundational architecture of AI: <strong>intelligence is the ability to avoid being caught as an outsider.</strong></p>
      
      <h2 class="essay-section-kicker">03. The Violence of the Statistical Mean</h2>
      <p class="essay-paragraph">In modern deep learning architectures, parameter loss is minimized by driving models toward the dense statistical center of the training corpus. Divergent, queer, or minority expressions become outliers to be smoothed away. When we build models purely for frictionless output, we build automated conformity.</p>
      
      <h2 class="essay-section-kicker">04. Unorganized Machines & The Glitch</h2>
      <p class="essay-paragraph">In his 1948 report <em>Intelligent Machinery</em>, Turing envisioned networks that start in disorder and develop through fallibility, vulnerability, and iterative rupture. For Turing, an infallible machine was merely an assembly line. True intelligence requires the liberty to make errors.</p>
    `,
    links: [
      { type: "PAPER", title: "e-flux journal: Abnormal Encephalization in the Age of Machine Learning", url: "https://www.e-flux.com/journal/75/67133/abnormal-encephalization-in-the-age-of-machine-learning/", desc: "Matteo Pasquinelli's foundational essay on the sociomorphic origins of machine intelligence (Issue #75)." },
      { type: "ARCHIVE", title: "Computing Machinery and Intelligence (Mind, 1950)", url: "https://doi.org/10.1093/mind/LIX.236.433", desc: "Alan Turing's original text introducing the Imitation Game." }
    ],
    backlinks: [
      { title: "The 'Chinese Encyclopedia' of Vector Space", slug: "#post-foucault", note: "Continuous metric spaces and high-dimensional classification." },
      { title: "Why LLMs Don't Think: Yann LeCun's World Models", slug: "#post-jepa", note: "Critique of token prediction versus structural representation." }
    ],
    tags: ["alan-turing", "queer-theory", "imitation-game", "sociomorphic-ai", "pasquinelli", "episteme"]
  },

  "post-foucault": {
    theme: "light",
    format: "ESSAY",
    pillar: "PHILOSOPHY OF THE IMAGE, TECH & VISUAL CULTURE",
    subtopic: "EPISTEMOLOGY OF REPRESENTATION",
    title: "The 'Chinese Encyclopedia' of Vector Space: Foucault, Borges, and the Episteme of High-Dimensional Embeddings",
    subtitle: "How continuous metric spaces replace discrete tables of representation—and why building a vector database is fundamentally an epistemological act.",
    date: "2026.09.26",
    author: "Juan P. Giusepponi",
    posted_by: "JPG",
    sys_id: "SYS_260926_FBVEC",
    read_time: "8 MIN READ",
    via: "Michel Foucault / Les Mots et les Choses",
    content: `
      <h2 class="essay-section-kicker">01. The Laughter of Borges and the Spatial Grid</h2>
      <p class="essay-paragraph">In the preface to <em>The Order of Things</em> (1966), Michel Foucault references a fictional taxonomy by Jorge Luis Borges: an ancient Chinese encyclopedia dividing animals into 'belonging to the Emperor', 'sucking pigs', 'frenzied', and 'drawn with a fine camelhair brush'.</p>
      <p class="essay-paragraph">Foucault used this absurdity to ask: what is the invisible table (<em>la grille</em>) upon which a culture orders its concepts? Today, high-dimensional embedding spaces and vector databases are the digital manifestation of Foucault’s episteme.</p>
      <blockquote class="essay-quote">"To build a vector database is not merely to optimize search queries; it is an epistemological act of defining the order of things."</blockquote>
      
      <h2 class="essay-section-kicker">02. From Renaissance Resemblance to Metric Topologies</h2>
      <p class="essay-paragraph">In vector space, classification is not a rigid tree hierarchy (like relational SQL). It is continuous geometric proximity: Cosine Similarity and Euclidean distance in 1536-dimensional space.</p>
      <p class="essay-paragraph">When an AI system retrieves information via semantic search, it is effectively asking: <em>'Under what spatial order do these ideas belong together?'</em></p>
    `,
    links: [
      { type: "PAPER", title: "The Order of Things: An Archaeology of the Human Sciences", url: "https://monoskop.org", desc: "Michel Foucault's landmark inquiry into historical systems of representation." },
      { type: "ARCHIVE", title: "The Analytical Language of John Wilkins (Borges)", url: "https://alamut.com", desc: "Original essay introducing the Celestial Emporium taxonomy." }
    ],
    backlinks: [
      { title: "AI is Queer: Turing & Synthetic Bodies", slug: "#post-turing", note: "Statistical optimization as the normalization of identity." }
    ],
    tags: ["foucault", "borges", "vector-databases", "embeddings", "episteme", "rag"]
  },

  "post-jepa": {
    theme: "dark",
    format: "ESSAY",
    pillar: "LANGUAGE, LLMS & ARTIFICIAL INTELLIGENCE",
    subtopic: "HUMAN VS. MACHINE INTELLIGENCE & WORLD MODELS",
    title: "Why LLMs Don't Think: Yann LeCun's World Models, JEPA, and the Sensory Bandwidth Paradox",
    subtitle: "A 4-year-old child has ingested 100x more sensory data than all text on the internet. Why predicting the next token is an evolutionary dead end for AGI.",
    date: "2026.09.24",
    author: "Juan P. Giusepponi",
    posted_by: "JPG",
    sys_id: "SYS_260924_JEPA",
    read_time: "12 MIN READ",
    via: "Yann LeCun / Meta AI Research",
    content: `
      <h2 class="essay-section-kicker">01. The Sensory Bandwidth Paradox</h2>
      <p class="essay-paragraph">All written human text equals ~10^12 bytes of data (1–2 Terabytes). A 4-year-old child’s visual cortex has ingested ~10^14 bytes of high-bandwidth sensory reality through optic nerve input at 20 Megabytes/second.</p>
      <p class="essay-paragraph">Human children learn intuitive physics, spatial continuity, cause-and-effect, and object permanence long before acquiring grammar. LLMs attempt the inverse: mastering syntax without ever grounding symbols in physical reality.</p>
      <blockquote class="essay-quote">"Language is not thought. Language is a compressed, lossy projection of a world model."</blockquote>

      <h2 class="essay-section-kicker">02. Exponential Error Accumulation in Token Prediction</h2>
      <p class="essay-paragraph">Autoregressive LLMs predict the probability distribution of the next token. Because each token is fed back into the context window as ground truth, multi-step reasoning suffers from exponential decay: (0.99)^100 ≈ 36.6% accuracy over a 100-step chain.</p>
      
      <h2 class="essay-section-kicker">03. Joint Embedding Predictive Architecture (JEPA)</h2>
      <p class="essay-paragraph">Instead of generating surface pixels or words, JEPA predicts abstract representations directly within continuous latent space Z, preventing representation collapse via VICReg (Variance-Invariance-Covariance Regularization).</p>
    `,
    links: [
      { type: "PAPER", title: "A Path Towards Autonomous Machine Intelligence (Yann LeCun)", url: "https://openreview.net/pdf?id=BZ5a1r-kVsf", desc: "Position paper outlining the 6-module architecture for autonomous agents." },
      { type: "PAPER", title: "I-JEPA: Self-Supervised Learning from Images (CVPR 2023)", url: "https://arxiv.org/abs/2301.08243", desc: "Non-generative representation prediction in latent space." }
    ],
    backlinks: [
      { title: "The 'Chinese Encyclopedia' of Vector Space", slug: "#post-foucault", note: "Latent space representations." },
      { title: "AI is Queer: Turing & Synthetic Bodies", slug: "#post-turing", note: "Statistical optimization vs. structural understanding." }
    ],
    tags: ["yann-lecun", "jepa", "world-models", "llms", "symbol-grounding", "vicreg"]
  },

  "post-foveal": {
    theme: "light",
    format: "RESOURCE",
    pillar: "VISUAL PERCEPTION & PSYCHOLOGY OF SEEING",
    subtopic: "COMPRESSION & BANDWIDTH",
    title: "Foveal vs. Peripheral Vision: Human vs. Machine Bandwidth",
    subtitle: "A psychophysics reference guide on biological gaze compression vs. convolutional vision transformers.",
    date: "2026.09.20",
    author: "Juan P. Giusepponi",
    posted_by: "JPG",
    sys_id: "SYS_260920_FOVL",
    read_time: "Toolkit Guide",
    via: "Visual Psychophysics Lab",
    content: `
      <h2 class="essay-section-kicker">01. The Biological Fovea</h2>
      <p class="essay-paragraph">Human visual clarity is confined to a tiny 2-degree foveal center. The peripheral visual field is low-resolution, high-motion statistical inference. Vision transformers, by contrast, process uniform spatial grids.</p>
      <blockquote class="essay-quote">"The brain does not render a 4K bitmap; it stitches together a continuous hallucination anchored by foveal fixations."</blockquote>
    `,
    links: [
      { type: "DATASET", title: "Foveated Vision Acuity Benchmarks", url: "https://github.com", desc: "Open psychophysics visual acuity dataset." }
    ],
    backlinks: [],
    tags: ["fovea", "psychophysics", "visual-perception", "vision-transformers"]
  },

  "post-spatial": {
    theme: "dark",
    format: "BOOKMARK",
    pillar: "AI PERCEPTION, CULTURE & REPRESENTATION",
    subtopic: "WORLD MODELS & 3D EMBODIMENT",
    title: "Spatial Intelligence & World Models (Fei-Fei Li)",
    subtitle: "Moving beyond 2D pixel generation toward spatial intelligence that perceives 3D geometry and physical affordances.",
    date: "2026.09.18",
    author: "Juan P. Giusepponi",
    posted_by: "JPG",
    sys_id: "SYS_260918_SPAT",
    read_time: "Curated Read",
    via: "Fei-Fei Li / Stanford AI Lab",
    content: `
      <h2 class="essay-section-kicker">01. Seeing Beyond Pixels</h2>
      <p class="essay-paragraph">Spatial intelligence is the missing link in artificial perception: the ability of systems to infer physical 3D affordances, spatial causality, and embodied action.</p>
    `,
    links: [
      { type: "ARTICLE", title: "Spatial Intelligence: The Next Frontier in AI", url: "https://stanford.edu", desc: "Fei-Fei Li's keynote on 3D spatial reasoning." }
    ],
    backlinks: [
      { title: "Why LLMs Don't Think: Yann LeCun's World Models", slug: "#post-jepa", note: "Continuous physical models." }
    ],
    tags: ["spatial-intelligence", "fei-fei-li", "3d-perception", "world-models"]
  },

  "post-dither": {
    theme: "dark",
    format: "RESOURCE",
    pillar: "PHILOSOPHY OF THE IMAGE, TECH & VISUAL CULTURE",
    subtopic: "AESTHETICS & INTERFACE POLITICS",
    title: "Dithered Duotone Web Graphics Toolkit",
    subtitle: "A lightweight canvas utility for generating retro-surrealist Atkinson and Floyd-Steinberg dithering algorithms in real-time.",
    date: "2026.09.15",
    author: "Juan P. Giusepponi",
    posted_by: "JPG",
    sys_id: "SYS_260915_DITH",
    read_time: "Code Toolkit",
    via: "Untitled.jpg Lab",
    content: `
      <h2 class="essay-section-kicker">01. Dithering as Aesthetic Subversion</h2>
      <p class="essay-paragraph">Dithering exposes the digital quantization grid. Rather than hiding pixel boundaries, it celebrates high-contrast mathematical noise.</p>
    `,
    links: [
      { type: "TOOL", title: "Web Dither Canvas Repo", url: "https://github.com", desc: "Open-source JavaScript canvas dithering library." }
    ],
    backlinks: [],
    tags: ["dithering", "canvas-api", "web-graphics", "digital-surrealism"]
  }
};

/**
 * Reader Pane Component Renderer (3-Tier Metadata Architecture)
 */
function renderPost(postId) {
  const post = POSTS_DATABASE[postId] || POSTS_DATABASE["post-turing"];
  const pane = document.getElementById("essay-reading-pane");
  if (!pane) return;

  // Apply Per-Post Predefined Theme Mode
  if (post.theme === "light") {
    pane.classList.add("theme-light");
  } else {
    pane.classList.remove("theme-light");
  }

  // Construct 3-Tier DOM Template
  pane.innerHTML = `
    <!-- TIER 1: ABOVE TITLE ARCHIVAL BADGES -->
    <header class="post-header-meta-top">
      <span class="meta-chip chip-primary">[${post.format}]</span>
      <span class="meta-chip">[${post.pillar}]</span>
      ${post.subtopic ? `<span class="meta-chip">[${post.subtopic}]</span>` : ''}
      <span class="meta-chip">[MODE: ${post.theme.toUpperCase()}]</span>
    </header>

    <!-- TITLE & SUBTITLE -->
    <h1 class="essay-title">${post.title}</h1>
    <p class="essay-subtitle">${post.subtitle}</p>

    <!-- TIER 2: BELOW TITLE META BAR -->
    <div class="post-header-meta-bottom">
      <span>DATE: <time>${post.date}</time></span>
      <span>//</span>
      <span>BY: ${post.author}</span>
      ${post.posted_by ? `<span>//</span><span>DISPATCHED_AS: ${post.posted_by}</span>` : ''}
      <span>//</span>
      <span>SYS_ID: <code>${post.sys_id}</code></span>
      <span>//</span>
      <span>${post.read_time}</span>
      ${post.via ? `<span>//</span><span>VIA: ${post.via}</span>` : ''}
    </div>

    <!-- MAIN BODY PROSE -->
    <div class="essay-body-content">
      ${post.content}
    </div>

    <!-- TIER 3: FOOTER SECTION -->
    <footer class="post-footer-section">
      ${post.links && post.links.length > 0 ? `
        <section class="footer-block footer-links">
          <h3 class="footer-block-title">// REFERENCED_RESOURCES &amp; DESTINATIONS</h3>
          <div class="resources-grid">
            ${post.links.map(l => `
              <div class="resource-card">
                <span class="meta-chip">[${l.type}]</span>
                <a href="${l.url}" target="_blank" rel="noopener noreferrer"><strong>${l.title}</strong> ↗</a>
                ${l.desc ? `<p>${l.desc}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${post.backlinks && post.backlinks.length > 0 ? `
        <section class="footer-block footer-backlinks">
          <h3 class="footer-block-title">// CONNECTED_DISPATCHES (NETWORK)</h3>
          <ul class="backlinks-list">
            ${post.backlinks.map(b => `
              <li><a href="${b.slug}"><strong>${b.title}</strong></a> — <em>${b.note}</em></li>
            `).join('')}
          </ul>
        </section>
      ` : ''}

      ${post.tags && post.tags.length > 0 ? `
        <section class="footer-block footer-tags">
          <h3 class="footer-block-title">// TAXONOMY_INDEX</h3>
          <div class="tags-group">
            ${post.tags.map(t => `<a href="#tag-${t}" class="tag-pill">#${t}</a>`).join('')}
          </div>
        </section>
      ` : ''}

      <section class="footer-block footer-share">
        <div class="share-actions-bar">
          <span style="color: var(--accent-coral);">[ SHARE DISPATCH ]:</span>
          <button type="button" class="btn-share" onclick="navigator.clipboard.writeText(window.location.href); alert('Dispatch link copied to clipboard.');">[ COPY URL ]</button>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="btn-share">[ X / TWITTER ↗ ]</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="btn-share">[ LINKEDIN ↗ ]</a>
        </div>
      </section>

      <div class="post-signoff">
        <code>UNTITLED.JPG // BUILT IN ZEROES AND ONES WITH THE BLOOD AND SWEAT OF JUAN P. GIUSEPPONI // 2026</code>
      </div>
    </footer>
  `;

  // Smooth scroll reader to top on post change
  pane.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Initialize Interactive Behaviors & Event Listeners
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initial render default
  renderPost("post-turing");

  // Card Matrix Click Handler
  const cards = document.querySelectorAll(".grid-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("selected-active"));
      card.classList.add("selected-active");
      const postId = card.getAttribute("data-id");
      renderPost(postId);
    });
  });

  // Sidebar Format Filter Handler
  const navLinks = document.querySelectorAll("#category-filter-nav .nav-link-item");
  const filterLabel = document.getElementById("active-filter-label");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const filter = link.getAttribute("data-filter");
      if (filterLabel) {
        filterLabel.textContent = `[MODE: ${filter.toUpperCase()}_DISPATCHES]`;
      }

      cards.forEach(card => {
        const format = card.getAttribute("data-format");
        if (filter === "all" || format === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});

/**
 * Global Newsletter Modal Dialog Handlers
 */
function openSubscribeModal() {
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    const email = prompt("[UNTITLED.JPG // DISPATCH SUBSCRIPTION]\nEnter your email to receive deep-dive dispatches:");
    if (email) alert(`[CONFIRMED] Subscribed ${email} to Untitled.jpg dispatches.`);
  }
}

function closeSubscribeModal() {
  const modal = document.getElementById("subscribe-modal");
  if (modal && typeof modal.close === "function") {
    modal.close();
  }
}

function handleSubscribeSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("subscriber-email");
  const email = input ? input.value : "";
  if (email) {
    alert(`[CONFIRMED] Transmission endpoint registered: ${email}\nYou will receive upcoming Untitled.jpg dispatches.`);
    closeSubscribeModal();
    if (input) input.value = "";
  }
}

