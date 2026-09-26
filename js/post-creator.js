/* ==============================================================================
   UNTITLED.JPG — DISPATCH CREATOR & EDITOR CLIENT ENGINE
   Handles template switching, markdown editing, real-time reader preview,
   and REST API calls for loading/saving/publishing dispatches.
   ============================================================================== */

let currentFormat = "essay";
let currentFilename = "";
let loadedPostsList = [];

const PILLAR_SUBTOPICS = {
  "Visual Perception & Psychology of Seeing": [
    "Anatomy and psychophysics of vision",
    "Visual illusions and optical paradoxes",
    "Cognitive and Visual Biases",
    "Perceptual mechanics and Gestalt",
    "Multi-sensory integration and cross-modal perception",
    "Attention and trained perception"
  ],
  "AI Perception, Culture & Representation": [
    "Synthetic and statistical images (\"the mean image\")",
    "Latent spaces and AI archives",
    "Generative technologies and prompt engineering",
    "Computer vision vs. human perception",
    "The political economy of synthetic media and digital labor",
    "Societal and algorithmic biases",
    "Synthetic Identity & Normative Machines"
  ],
  "Language, LLMs & Artificial Intelligence": [
    "LLM architectures and mechanics",
    "Human vs. machine intelligence and benchmarking",
    "Language, meaning and symbolic grounding",
    "Agentic systems and human agency",
    "Conversational voice AI and speech processing",
    "AI safety, alignment and extreme risk evaluation"
  ],
  "Philosophy of the Image, Tech & Visual Culture": [
    "Modes of seeing and visual semiotics",
    "Photography, truth and simulation",
    "Epistemology of representation",
    "Aesthetics as ideology and interface politics",
    "Media ecology and psychological projection",
    "The archival impulse and digital memory systems"
  ]
};

function updateSubtopicsDropdown(targetSubtopic = null) {
  const pillarSelect = document.getElementById("field-pillar");
  const subtopicSelect = document.getElementById("field-subtopic");
  if (!pillarSelect || !subtopicSelect) return;

  const pillarVal = pillarSelect.value || "";
  const normalizedPillarVal = pillarVal.toLowerCase().replace(/&/g, "and").trim();

  const pillarKey = Object.keys(PILLAR_SUBTOPICS).find(k => 
    k.toLowerCase().replace(/&/g, "and").trim() === normalizedPillarVal
  ) || Object.keys(PILLAR_SUBTOPICS)[0];

  const subtopics = PILLAR_SUBTOPICS[pillarKey] || [];
  
  subtopicSelect.innerHTML = subtopics.map(st => `<option value="${st}">${st}</option>`).join("");

  if (targetSubtopic) {
    const exists = subtopics.some(st => st.toLowerCase() === targetSubtopic.toLowerCase());
    if (!exists && targetSubtopic.trim() !== "") {
      const opt = document.createElement("option");
      opt.value = targetSubtopic;
      opt.textContent = targetSubtopic;
      subtopicSelect.appendChild(opt);
    }
    subtopicSelect.value = targetSubtopic;
  }
}

const FORMAT_TEMPLATES = {
  essay: {
    format: "essay",
    title: "Title of Long-Form Essay",
    subtitle: "Subtitle expanding on the core conceptual thesis and theoretical framework.",
    excerpt: "A concise summary for search feeds and preview cards.",
    pillar: "AI Perception, Culture & Representation",
    subtopic: "Synthetic Identity & Normative Machines",
    tags: "epistemology, philosophy-of-tech, latent-space",
    reading_time: "10 min read",
    theme: "dark",
    featured: false,
    status: "published",
    image: "assets/images/turing1.png",
    image_alt: "Dithered duotone artwork description",
    content: `## 01. The Opening Thesis

Opening paragraph establishing the primary problem space, historical context, or theoretical provocation.

> _"A poignant opening blockquote or philosophical citation framing the essay's core inquiry."_ — Source Citation

---

## 02. The Analytical Framework

Developing the structural argument, juxtaposing historical epistemes with modern computation:

1. **First Premise:** Deep dive into the primary mechanism.
2. **Second Premise:** The unintended structural consequence.
3. **Third Premise:** The ideological synthesis.

---

## 03. High-Density Mathematical & Conceptual Formulations

Mathematical formulations and definitions when applicable:

$$\\text{Similarity}(\\mathbf{A}, \\mathbf{B}) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\|_2 \\|\\mathbf{B}\\|_2}$$

| Dimension | Classical Framework | Computational Modernity |
| :--- | :--- | :--- |
| **Episteme** | Discrete Taxonomy | Continuous Latent Space |
| **Logic** | Top-down Rules | Statistical Optimization |
| **Boundary** | Binary Boundary | Metric Angle & Distance |

---

## 04. Synthesis & Concluding Thought

Concluding thoughts summarizing what this theoretical shift demands of future architecture, culture, and ethics.`
  },

  note: {
    format: "note",
    title: "Title of Working Note or Observation",
    subtitle: "A short reflective remark or working question framing the note.",
    excerpt: "A concise fragment summary capturing the essence of the observation.",
    category: "reflection",
    pillar: "Visual Perception & Psychology of Seeing",
    subtopic: "Psychophysics of Digital Interfaces",
    tags: "working-notes, reflections, observations, fragments",
    reading_time: "3 min read",
    theme: "dark",
    featured: false,
    status: "published",
    image: "assets/images/turing1.png",
    image_alt: "Note visual preview graphic",
    content: `## 01. The Observation

Record the immediate thought, empirical observation, or system glitch as it happened in real-time.

> _"A concise, raw insight or quote written during research or design prototyping."_

---

## 02. The Working Hypothesis

Explain what this observation might mean:

- Why did this pattern emerge?
- What does it expose about the current computational paradigm or visual interface?
- How might this develop into a full essay or experimental prototype?

---

## 03. Open Questions & Fragment Notes

1. How do we test this intuition quantitatively?
2. What are the counterarguments?
3. Next reading / reference to explore.`
  },

  bookmark: {
    format: "bookmark",
    title: "Original Title of Curated Item",
    subtitle: "Editorial commentary expanding on why this bookmark is essential reading.",
    excerpt: "A concise summary of the external discovery and its core thesis.",
    media: "article",
    source: "source",
    url: "https://",
    pillar: "Language, LLMs & Artificial Intelligence",
    subtopic: "World Models & Spatial Intelligence",
    tags: "ai, ",
    reading_time: "10 minutes",
    theme: "dark",
    featured: false,
    status: "published",
    image: "assets/images/[image].png",
    image_alt: "Spatial intelligence conceptual artwork",
    content: `## 01. Archival Excerpt

> _"Important Quote."_ — Author

---

## 02. Editorial Commentary & Context

Provide your own analysis of why this external piece is significant:

- **What does it challenge?** [Answer].
- **What does it introduce?** [Answer].
- **Where does it connect?** [Answer].

---

## 03. Key Takeaways

1. **Takeaway1:** One sentence.
2. **Takeaway2:** One sentence.`
  },

  resource: {
    format: "resource",
    title: "Name of Toolkit / Resource / Utility",
    subtitle: "High-level summary of what this tool, dataset, or utility accomplishes.",
    excerpt: "A direct description of the codebase, package, or download artifact.",
    category: "tool/software",
    url: "https://...",
    pillar: "Philosophy of the Image, Tech & Visual Culture",
    subtopic: "Aesthetics & Interface Politics",
    tags: "toolkit, web-graphics, dithering, canvas-api",
    reading_time: "Code Toolkit",
    theme: "dark",
    featured: false,
    status: "published",
    image: "assets/images/[image].png",
    image_alt: "Dithered toolkit interface graphic",
    content: `## 01. Overview & Capability

Describe what problem this resource solves, who it is designed for, and its primary technical advantages.

---

## 02. Quickstart & Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/repository-name.git

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

---

## 03. API Reference & Code Snippet

Example usage for embedding or running the toolkit:

\`\`\`javascript
import { createDitherFilter } from "./toolkit.js";

const canvas = document.getElementById("viewport");
const filter = createDitherFilter({
  algorithm: "atkinson",
  palette: ["#121212", "#E84A5F", "#FFFFFF"],
  threshold: 128
});

filter.apply(canvas);
\`\`\`

---

## 04. Technical Specifications & Benchmarks

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| \`algorithm\` | \`floyd-steinberg\` | Error-diffusion quantization matrix |
| \`fps\` | \`60 FPS\` | Target WebGL render cycle |
| \`license\` | \`MIT\` | Open-source permissive license |`
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initFormatPickers();
  initFormListeners();
  initToolbar();
  loadFormatTemplate("essay");

  // Fetch list of existing posts
  fetchPostsList();
});

function initFormatPickers() {
  const cards = document.querySelectorAll(".btn-format-card");
  cards.forEach(c => {
    c.addEventListener("click", () => {
      cards.forEach(x => x.classList.remove("active"));
      c.classList.add("active");
      const fmt = c.getAttribute("data-format");
      currentFormat = fmt;
      loadFormatTemplate(fmt);
    });
  });
}

function loadFormatTemplate(fmt) {
  const tmpl = FORMAT_TEMPLATES[fmt] || FORMAT_TEMPLATES.essay;
  currentFilename = "";

  document.getElementById("field-title").value = tmpl.title || "";
  document.getElementById("field-subtitle").value = tmpl.subtitle || "";
  document.getElementById("field-excerpt").value = tmpl.excerpt || "";

  // Date
  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").substring(0, 19) + " -0300";
  document.getElementById("field-date").value = dateStr;

  document.getElementById("field-author").value = "Juan P. Giusepponi";
  document.getElementById("field-pillar").value = tmpl.pillar || "AI Perception, Culture & Representation";
  updateSubtopicsDropdown(tmpl.subtopic || "");
  document.getElementById("field-tags").value = tmpl.tags || "";
  document.getElementById("field-readtime").value = tmpl.reading_time || "8 min read";
  document.getElementById("field-theme").value = tmpl.theme || "dark";
  document.getElementById("field-featured").checked = Boolean(tmpl.featured);
  document.getElementById("field-status").value = tmpl.status || "published";

  document.getElementById("field-image-path").value = tmpl.image || "assets/images/turing1.png";
  document.getElementById("field-image-alt").value = tmpl.image_alt || "Artwork preview";

  // Format Specific Fields Visibility
  toggleFormatSpecificFields(fmt, tmpl);

  // Content
  document.getElementById("field-content").value = tmpl.content || "";

  updatePreview();
}

function toggleFormatSpecificFields(fmt, data = {}) {
  const noteCategoryBox = document.getElementById("box-note-category");
  const bookmarkMediaBox = document.getElementById("box-bookmark-media");
  const bookmarkSourceBox = document.getElementById("box-bookmark-source");
  const resourceCategoryBox = document.getElementById("box-resource-category");
  const urlBox = document.getElementById("box-url");

  noteCategoryBox.style.display = fmt === "note" ? "flex" : "none";
  bookmarkMediaBox.style.display = fmt === "bookmark" ? "flex" : "none";
  bookmarkSourceBox.style.display = fmt === "bookmark" ? "flex" : "none";
  resourceCategoryBox.style.display = fmt === "resource" ? "flex" : "none";
  urlBox.style.display = (fmt === "bookmark" || fmt === "resource") ? "flex" : "none";

  if (fmt === "note") document.getElementById("field-note-category").value = data.category || "reflection";
  if (fmt === "bookmark") {
    document.getElementById("field-bookmark-media").value = data.media || "article";
    document.getElementById("field-bookmark-source").value = data.source || "";
  }
  if (fmt === "resource") document.getElementById("field-resource-category").value = data.category || "tool/software";
  if (fmt === "bookmark" || fmt === "resource") document.getElementById("field-url").value = data.url || (data.bookmark_url || data.resource_url || "");
}

function initFormListeners() {
  const pillarSelect = document.getElementById("field-pillar");
  if (pillarSelect) {
    pillarSelect.addEventListener("change", () => {
      updateSubtopicsDropdown();
      updatePreview();
    });
  }

  const inputs = document.querySelectorAll(".form-input, .form-select, .form-textarea, #field-content");
  inputs.forEach(input => {
    input.addEventListener("input", updatePreview);
    input.addEventListener("change", updatePreview);
  });
  document.getElementById("field-featured").addEventListener("change", updatePreview);
}

function initToolbar() {
  const tools = {
    bold: ["**", "**"],
    italic: ["*", "*"],
    h2: ["\n## ", ""],
    h3: ["\n### ", ""],
    quote: ["\n> ", ""],
    code: ["\`", "\`"],
    codeblock: ["\n\`\`\`text\n", "\n\`\`\`"],
    list: ["\n- ", ""],
    table: ["\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n", ""],
    math: ["\n$$\n", "\n$$\n"],
    action: ["\n[ACTION BUTTON](https://example.com)\n", ""]
  };

  Object.keys(tools).forEach(id => {
    const btn = document.getElementById(`btn-tool-${id}`);
    if (btn) {
      btn.addEventListener("click", () => {
        const [pref, suff] = tools[id];
        insertMarkdown(pref, suff);
      });
    }
  });
}

function insertMarkdown(prefix, suffix) {
  const textarea = document.getElementById("field-content");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const replacement = prefix + (selectedText || "text") + suffix;

  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.focus();
  textarea.selectionStart = start + prefix.length;
  textarea.selectionEnd = start + prefix.length + (selectedText.length || 4);
  updatePreview();
}

/**
 * Real-Time Reader Pane Preview Hydration
 */
function updatePreview() {
  const previewContainer = document.getElementById("essay-reading-pane");
  if (!previewContainer) return;

  const title = document.getElementById("field-title").value || "Untitled Dispatch";
  const subtitle = document.getElementById("field-subtitle").value || "";
  const date = document.getElementById("field-date").value || "";
  const author = document.getElementById("field-author").value || "Juan P. Giusepponi";
  const pillar = document.getElementById("field-pillar").value || "DISPATCH";
  const subtopic = document.getElementById("field-subtopic").value || "";
  const readtime = document.getElementById("field-readtime").value || "5 min read";
  const theme = document.getElementById("field-theme").value || "dark";
  const url = document.getElementById("field-url") ? document.getElementById("field-url").value : "";

  let categoryBadge = "";
  if (currentFormat === "note") {
    categoryBadge = document.getElementById("field-note-category").value;
  } else if (currentFormat === "resource") {
    categoryBadge = document.getElementById("field-resource-category").value;
  }

  let mediaBadge = "";
  if (currentFormat === "bookmark") {
    mediaBadge = document.getElementById("field-bookmark-media").value;
  }

  const rawMarkdown = document.getElementById("field-content").value || "";
  const parsedHtml = renderMarkdownToHtml(rawMarkdown);

  if (theme === "light") {
    previewContainer.classList.add("theme-light");
  } else {
    previewContainer.classList.remove("theme-light");
  }

  previewContainer.innerHTML = `
    <!-- TIER 1 METADATA -->
    <header class="post-header-meta-top">
      <span class="meta-chip chip-primary">[${currentFormat.toUpperCase()}]</span>
      ${categoryBadge ? `<span class="meta-chip meta-chip-category">[${categoryBadge}]</span>` : ''}
      ${mediaBadge ? `<span class="meta-chip meta-chip-media">[MEDIA: ${mediaBadge}]</span>` : ''}
      <span class="meta-chip">[${pillar}]</span>
      ${subtopic ? `<span class="meta-chip">[${subtopic}]</span>` : ''}
    </header>

    <h1 class="post-title essay-title">${title}</h1>
    ${subtitle ? `<p class="post-subtitle essay-subtitle">${subtitle}</p>` : ''}

    ${url ? `
      <div class="post-prominent-action">
        <a href="${url}" target="_blank" class="btn-prominent-action">
          <span class="action-kicker">${currentFormat === 'resource' ? 'ACCESS RESOURCE ↗' : 'VIEW DESTINATION ↗'}</span>
          <span class="action-url-text">${url}</span>
        </a>
      </div>
    ` : ''}

    <!-- TIER 2 METADATA -->
    <div class="post-header-meta-bottom">
      <span>DATE: <time>${date}</time></span>
      <span class="meta-sep">//</span>
      <span>BY: <strong class="meta-author">${author}</strong></span>
      <span class="meta-sep">//</span>
      <span class="meta-readtime">${readtime}</span>
    </div>

    <!-- MAIN PROSE -->
    <div class="post-body-content essay-body-content">
      ${parsedHtml}
    </div>
  `;
}

function renderMarkdownToHtml(md) {
  if (!md) return "";

  let html = md;
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Codeblocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<pre') || p.startsWith('<hr')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

/**
 * REST API Calls: Fetch Posts, Load Post, Save Draft / Publish
 */
async function fetchPostsList() {
  try {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        loadedPostsList = data.posts || [];
        renderFileDrawerList(loadedPostsList);
      }
    }
  } catch (err) {
    console.log("Not running with live server API.");
  }
}

function renderFileDrawerList(posts) {
  const container = document.getElementById("drawer-posts-list");
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); padding:1rem;">No saved dispatches found in _posts/</div>`;
    return;
  }

  container.innerHTML = posts.map(p => `
    <div class="drawer-item" onclick="loadPostFromFile('${p.filename}')">
      <div>
        <div class="drawer-item-title">${p.title}</div>
        <div class="drawer-item-meta">
          <span>${p.filename}</span> •
          <span>[${p.format.toUpperCase()}]</span> •
          <span>${p.date.substring(0, 10)}</span>
        </div>
      </div>
      <span class="status-badge ${p.status}">${p.status.toUpperCase()}</span>
    </div>
  `).join("");
}

async function loadPostFromFile(filename) {
  try {
    const res = await fetch(`/api/post?file=${encodeURIComponent(filename)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        currentFilename = data.filename;
        const meta = data.frontmatter || {};
        const fmt = (meta.format || "essay").toLowerCase();

        // Switch active format
        currentFormat = fmt;
        document.querySelectorAll(".btn-format-card").forEach(c => {
          c.classList.toggle("active", c.getAttribute("data-format") === fmt);
        });

        document.getElementById("field-title").value = meta.title || "";
        document.getElementById("field-subtitle").value = meta.subtitle || "";
        document.getElementById("field-excerpt").value = meta.excerpt || "";
        document.getElementById("field-date").value = meta.date || "";
        document.getElementById("field-author").value = meta.author || "Juan P. Giusepponi";

        if (meta.topic) {
          document.getElementById("field-pillar").value = meta.topic.pillar || "";
          updateSubtopicsDropdown(meta.topic.subtopic || "");
        } else {
          updateSubtopicsDropdown();
        }

        document.getElementById("field-tags").value = Array.isArray(meta.tags) ? meta.tags.join(", ") : (meta.tags || "");
        document.getElementById("field-readtime").value = meta.reading_time || "8 min read";
        document.getElementById("field-theme").value = meta.theme || "dark";
        document.getElementById("field-featured").checked = Boolean(meta.featured);
        document.getElementById("field-status").value = meta.status || "published";

        if (meta.image) {
          document.getElementById("field-image-path").value = meta.image.path || "";
          document.getElementById("field-image-alt").value = meta.image.alt || "";
        }

        toggleFormatSpecificFields(fmt, meta);

        document.getElementById("field-content").value = data.content || "";
        updatePreview();
        closeFileDrawer();
        alert(`[LOADED] Dispatch loaded from _posts/${filename}`);
      }
    }
  } catch (err) {
    alert("Error loading dispatch file.");
  }
}

async function saveDispatch(status) {
  document.getElementById("field-status").value = status;

  const fmt = currentFormat;
  const title = document.getElementById("field-title").value.trim() || "Untitled Dispatch";
  const subtitle = document.getElementById("field-subtitle").value.trim();
  const excerpt = document.getElementById("field-excerpt").value.trim();
  const date = document.getElementById("field-date").value.trim();
  const author = document.getElementById("field-author").value.trim() || "Juan P. Giusepponi";
  const pillar = document.getElementById("field-pillar").value;
  const subtopic = document.getElementById("field-subtopic").value.trim();
  const tags = document.getElementById("field-tags").value.split(",").map(t => t.trim()).filter(Boolean);
  const readtime = document.getElementById("field-readtime").value.trim();
  const theme = document.getElementById("field-theme").value;
  const featured = document.getElementById("field-featured").checked;

  const imagePath = document.getElementById("field-image-path").value.trim();
  const imageAlt = document.getElementById("field-image-alt").value.trim();

  const content = document.getElementById("field-content").value;

  const metadata = {
    title,
    subtitle,
    excerpt,
    date,
    author,
    status,
    format: fmt,
    topic: {
      pillar,
      subtopic
    },
    tags,
    theme,
    featured,
    reading_time: readtime,
    image: {
      path: imagePath,
      alt: imageAlt
    }
  };

  // Format Specific Fields
  if (fmt === "note") {
    metadata.category = document.getElementById("field-note-category").value;
  }
  if (fmt === "bookmark") {
    metadata.media = document.getElementById("field-bookmark-media").value;
    metadata.source = document.getElementById("field-bookmark-source").value;
    metadata.bookmark_url = document.getElementById("field-url").value;
  }
  if (fmt === "resource") {
    metadata.category = document.getElementById("field-resource-category").value;
    metadata.resource_url = document.getElementById("field-url").value;
  }

  const payload = {
    filename: currentFilename,
    metadata,
    content
  };

  try {
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        currentFilename = data.filename;
        alert(`[${status.toUpperCase()} CONFIRMED]\n${data.message}`);
        fetchPostsList();
      } else {
        alert(`Error saving dispatch: ${data.error}`);
      }
    } else {
      alert("API save request failed.");
    }
  } catch (err) {
    alert("Save failed. Ensure post_creator_server.py is running!");
  }
}

function openFileDrawer() {
  fetchPostsList();
  document.getElementById("file-drawer-modal").classList.add("open");
}

function closeFileDrawer() {
  document.getElementById("file-drawer-modal").classList.remove("open");
}
