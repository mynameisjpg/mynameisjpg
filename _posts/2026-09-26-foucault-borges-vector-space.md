---
title: "The 'Chinese Encyclopedia' of Vector Space: Foucault, Borges, and the Episteme of High-Dimensional Embeddings"
subtitle: "How continuous metric spaces replace discrete tables of representation—and why building a vector database is fundamentally an epistemological act."
excerpt: "In The Order of Things, Michel Foucault used Jorge Luis Borges' surreal taxonomy to ask: upon what invisible grid does a culture order reality? Today, high-dimensional vector embeddings have become that grid."

date: 2026-09-26 12:00:00 -0300
last_modified_at: 2026-09-26 12:00:00 -0300

author: "Juan P. Giusepponi"
posted_by: "JPG"
status: "published"

format: "essay"

topic:
  pillar: "Philosophy of the Image, Tech & Visual Culture"
  subtopic: "Epistemology of Representation"

tags:
  - "foucault"
  - "borges"
  - "vector-databases"
  - "embeddings"
  - "episteme"
  - "rag"
  - "latent-space"
  - "philosophy-of-ai"

theme: "light"
featured: true
toc: true
math: true

sys_id: "SYS_260926_FBVEC"
vector_dim: 1536
reading_time: "8 min read"

links:
  - title: "The Order of Things: An Archaeology of the Human Sciences (1966)"
    url: "https://monoskop.org/images/8/87/Foucault_Michel_The_Order_of_Things_1994.pdf"
    type: "paper"
    description: "Michel Foucault's landmark inquiry into the historical shifts between Renaissance similitude, Classical tables, and Modern historicism."
  - title: "The Analytical Language of John Wilkins (Borges, 1942)"
    url: "https://www.alamut.com/subj/artifast/language/johnWilkins.html"
    type: "archive"
    description: "Jorge Luis Borges' famous essay introducing the 'Celestial Emporium of Benevolent Knowledge' animal classification."
  - title: "Pinecone / Vector Index Epistemology Reference"
    url: "https://www.pinecone.io/learn/vector-database/"
    type: "tool"
    description: "Technical overview of Approximate Nearest Neighbor (ANN) search and high-dimensional cosine partitioning."

via: "Michel Foucault / Les Mots et les Choses"

backlinks:
  - slug: "/essays/turing-queer-ai"
    title: "Turing & Queer AI: Synthetic Bodies, Mimicry, and Representation"
    note: "Examines how statistical optimization drives automated conformity."
  - slug: "/notes/lecun-world-models"
    title: "JEPA & LeCun's World Models"
    note: "Investigates joint embeddings as non-generative abstractions of reality."

shareable: true
allow_embed: true
canonical_url: ""

image:
  path: "/assets/images/foucault-borges-vectors-cover.png"
  alt: "High-contrast architectural diagram of a 1536-dimensional vector sphere intersecting Borges' Chinese encyclopedia taxonomy"
---

<!-- ======================================================================= -->
<!-- 1. ABOVE THE TITLE: ARCHIVAL BADGES                                     -->
<!-- ======================================================================= -->
<header class="post-header-meta-top">
  <div class="meta-chips-group">
    <span class="meta-chip meta-chip-format">[{{ page.format | upcase }}]</span>
    <span class="meta-chip meta-chip-pillar">[{{ page.topic.pillar | upcase }}]</span>
    {% if page.topic.subtopic %}
    <span class="meta-chip meta-chip-subtopic">[{{ page.topic.subtopic | upcase }}]</span>
    {% endif %}
    <span class="meta-chip meta-chip-mode">[{{ page.theme | default: "light" | upcase }}]</span>
  </div>
</header>

<!-- ======================================================================= -->
<!-- TITLE & SUBTITLE                                                        -->
<!-- ======================================================================= -->
<h1 class="post-title">{{ page.title }}</h1>
{% if page.subtitle %}
<p class="post-subtitle">{{ page.subtitle }}</p>
{% endif %}

<!-- ======================================================================= -->
<!-- 2. BELOW TITLE & SUBTITLE: META BAR                                     -->
<!-- ======================================================================= -->
<div class="post-header-meta-bottom">
  <div class="meta-item meta-date">
    <span class="meta-label">DATE:</span>
    <time datetime="{{ page.date | date_to_xmlschema }}">{{ page.date | date: "%Y.%m.%d" }}</time>
  </div>
  <span class="meta-separator">//</span>
  <div class="meta-item meta-author">
    <span class="meta-label">BY:</span>
    <span>{{ page.author | default: "Juan P. Giusepponi" }}</span>
  </div>
  {% if page.posted_by %}
  <span class="meta-separator">//</span>
  <div class="meta-item meta-posted-by">
    <span class="meta-label">DISPATCHED_AS:</span>
    <span>{{ page.posted_by }}</span>
  </div>
  {% endif %}
  <span class="meta-separator">//</span>
  <div class="meta-item meta-sysid">
    <span class="meta-label">SYS_ID:</span>
    <code>{{ page.sys_id | default: "SYS_DISPATCH_AUTO" }}</code>
  </div>
  <span class="meta-separator">//</span>
  <div class="meta-item meta-readtime">
    <span>{{ page.reading_time | default: "8 MIN READ" }}</span>
  </div>
  {% if page.via %}
  <span class="meta-separator">//</span>
  <div class="meta-item meta-via">
    <span class="meta-label">VIA:</span>
    <span>{{ page.via }}</span>
  </div>
  {% endif %}
</div>

<hr class="post-header-divider" />

<!-- ======================================================================= -->
<!-- MAIN EDITORIAL ESSAY PROSE                                              -->
<!-- ======================================================================= -->

## 01. The Laughter of Borges and the Spatial Grid

In the famous preface to *The Order of Things* (*Les Mots et les Choses*, 1966), Michel Foucault confesses that his book was born out of a text by Jorge Luis Borges—specifically, from the laughter that shattered all the familiar landmarks of his thought.

Borges cites a fictional Chinese encyclopedia entitled *The Celestial Emporium of Benevolent Knowledge*, in which animals are divided into the following categories:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ BORGES' TAXONOMY OF ANIMALS (Celestial Emporium of Benevolent Knowledge):│
│ (a) Belonging to the Emperor         (h) Included in the present classification│
│ (b) Embalmed                         (i) Frenzied                      │
│ (c) Tame                             (j) Innumerable                   │
│ (d) Sucking pigs                     (k) Drawn with a fine camelhair brush│
│ (e) Sirens                           (l) Et cetera                     │
│ (f) Fabulous                         (m) Having just broken the water pitcher│
│ (g) Stray dogs                       (n) That from a long way off look like flies│
└────────────────────────────────────────────────────────────────────────┘
```

To modern eyes, this taxonomy is hilarious not because sirens or embalmed animals are fictional, but because the **system of coordinates** that allows them to juxtapose alongside one another feels impossible.

Foucault used this absurdity to introduce his central philosophical concept: the **episteme** (*épistémè*). What is the invisible table (*la grille*), the implicit spatial ground upon which a given culture orders its concepts, establishes resemblance, and decides what is true?

Fast forward to contemporary artificial intelligence: **Vector databases and high-dimensional embedding spaces are the digital manifestation of Foucault’s episteme.**

---

## 02. From Renaissance Resemblance to Continuous Metric Space

To understand why vector search represents an epistemic rupture, we must look at how Western knowledge historically organized representation:

```text
HISTORICAL SHIFTS IN REPRESENTATION:
1. RENAISSANCE EPISTEME  ──> Resemblance, sympathetic echoes, cosmic signatures.
2. CLASSICAL EPISTEME    ──> Discrete tables, relational grids, Linnaean taxonomy.
3. VECTOR / AI EPISTEME  ──> High-dimensional metric distance & semantic manifold.
```

1. **The Renaissance Episteme (Similitude):** Things were grouped because they echoed one another in nature (*convenientia*, *aemulatio*, *analogy*, *sympathy*). A walnut cured brain ailments because its shape resembled the cerebral cortex.
2. **The Classical Episteme (The Table):** Knowledge abandoned mystical echoes and organized into rigid, discrete grids (taxonomies, Linnaean biological trees, relational SQL tables).
3. **The Vector Episteme (Continuous Proximity):** Modern AI architectures paradoxically bridge both worlds.

Instead of slotting concepts into rigid hierarchical folders (like `Category > Subcategory > Item`), an embedding model maps every text, image, or audio fragment to a point in high-dimensional continuous space $\mathbb{R}^D$ (typically $D = 768$, $1536$, or $3072$).

$$\text{Cosine Similarity}(u, v) = \frac{u \cdot v}{\|u\|_2 \|v\|_2} = \cos(\theta)$$

Relationships are no longer determined by predefined taxonomies, but by **spatial angle and geometric proximity**. `Dog` is close to `Wolf` or `Pet` and distant from `Microchip` purely because of its geometric coordinates.

---

## 03. Every Latent Space Embeds an Ideological Episteme

We often discuss vector search and Retrieval-Augmented Generation (RAG) as neutral engineering optimizations. But as Foucault showed, **no taxonomy is innocent.**

When you query a vector database, you are not retrieving raw, unmediated reality; you are navigating the historical episteme frozen inside the model weights:

```text
UNSEEN GEOMETRIES:
[MASS CULTURAL DATA] ──(Transformer Loss)──> [1536-DIM MANIFOLD] ──(Cosine Query)──> [AI TRUTH]
```

* The distance between two concepts in latent space is dictated by statistical co-occurrence across internet-scale crawl datasets.
* Just like Borges' Chinese encyclopedia, vector spaces generate startling juxtapositions: slang terms, corporate marketing tropes, demographic identities, and technical jargon collapse into shared high-dimensional neighborhoods.
* If the training distribution links a minoritized demographic with specific occupations or criminalized contexts, that association is encoded directly as **spatial proximity**.

---

## 04. Traditional Taxonomies vs. Vector Topologies

The structural differences between classical data schemas and vector geometries redefine how systems think:

| Dimension | Classical Relational Schema (SQL / Trees) | High-Dimensional Vector Space (Embeddings) |
| :--- | :--- | :--- |
| **Logic** | Top-down, discrete, rule-based | Emergent, continuous, probabilistic |
| **Boundaries** | Hard binary edges (`WHERE category = 'animal'`) | Soft topological contours ($\text{distance} < 0.25$) |
| **Flexibility** | Brittle to out-of-schema queries | Fluid across metaphors, dialects, and synonyms |
| **Failure Mode** | Returns `NULL` or syntax error | Hallucination or semantic drift into strange neighborhoods |
| **Governance** | Explicit database schema administrator | Implicit transformer training loss function |

When an autonomous AI agent executes a semantic search or retrieves context for an LLM prompt, it is constantly posing Foucault's question:

> *"Under what spatial order do these disparate pieces of human culture belong together?"*

---

## 05. The Epistemological Power of the Vector Architect

Whoever controls the architecture of the embedding model and the indexing strategy of the vector database controls the lens through which machines perceive reality.

```text
THE POWER OF THE GRID:
[EMBEDDING MODEL WEIGHTS] ──defines──> [DISTANCE METRIC] ──governs──> [RETRIEVAL CONTEXT] ──conditions──> [AI GENERATION]
```

When enterprise teams fine-tune embeddings or partition vector clusters, they are not just tuning database latencies:
* They are deciding which ideas are permitted to be "neighbors".
* They are defining which nuances are compressed away as noise.
* They are building the modern *grille* upon which synthetic intelligence will synthesize knowledge for the next century.

To build a vector database is not merely to optimize retrieval; **it is an epistemological act of defining the order of things.**

---

<!-- ======================================================================= -->
<!-- 3. FOOTER SECTION: Resources + Backlinks + Tags + Share                 -->
<!-- ======================================================================= -->
<footer class="post-footer-section">

  <!-- A. REFERENCED RESOURCES -->
  {% if page.links and page.links.size > 0 %}
  <section class="footer-block footer-links">
    <h3 class="footer-block-title">// REFERENCED_RESOURCES &amp; DESTINATIONS</h3>
    <div class="resources-grid">
      {% for item in page.links %}
      <div class="resource-card">
        <span class="chip">[{{ item.type | default: "LINK" | upcase }}]</span>
        <a href="{{ item.url }}" target="_blank" rel="noopener noreferrer">
          <strong>{{ item.title }}</strong> ↗
        </a>
        {% if item.description %}
        <p>{{ item.description }}</p>
        {% endif %}
      </div>
      {% endfor %}
    </div>
  </section>
  {% endif %}

  <!-- B. CONNECTED BACKLINKS -->
  {% if page.backlinks and page.backlinks.size > 0 %}
  <section class="footer-block footer-backlinks">
    <h3 class="footer-block-title">// CONNECTED_DISPATCHES (NETWORK)</h3>
    <ul class="backlinks-list">
      {% for link in page.backlinks %}
      <li>
        <a href="{{ link.slug }}"><strong>{{ link.title }}</strong></a>
        {% if link.note %} — <em>{{ link.note }}</em>{% endif %}
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endif %}

  <!-- C. TAXONOMY INDEX -->
  {% if page.tags and page.tags.size > 0 %}
  <section class="footer-block footer-tags">
    <h3 class="footer-block-title">// TAXONOMY_INDEX</h3>
    <div class="tags-group">
      {% for tag in page.tags %}
      <a href="/tags/{{ tag | slugify }}/" class="tag-pill">#{{ tag }}</a>
      {% endfor %}
    </div>
  </section>
  {% endif %}

  <!-- D. SHARE & EMBED ACTIONS -->
  {% if page.shareable %}
  <section class="footer-block footer-share">
    <div class="share-actions-bar">
      <span class="share-label">[ SHARE DISPATCH ]:</span>
      <button type="button" class="btn-share" onclick="navigator.clipboard.writeText(window.location.href)">
        [ COPY URL ]
      </button>
      <a href="https://twitter.com/intent/tweet?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="btn-share">
        [ X / TWITTER ↗ ]
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="btn-share">
        [ LINKEDIN ↗ ]
      </a>
      {% if page.allow_embed %}
      <button type="button" class="btn-share" onclick="alert('Embed snippet copied!')">
        [ EMBED SNIPPET ]
      </button>
      {% endif %}
    </div>
  </section>
  {% endif %}

  <!-- E. BRAND MONOSPACE SIGN-OFF -->
  <div class="post-signoff">
    <code>UNTITLED.JPG // BUILT IN ZEROES AND ONES WITH THE BLOOD AND SWEAT OF JUAN P. GIUSEPPONI // 2026</code>
  </div>

</footer>
