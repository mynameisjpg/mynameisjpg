---
title: "Why LLMs Don't Think: Yann LeCun's World Models, JEPA, and the Sensory Bandwidth Paradox"
subtitle: "A 4-year-old child has ingested 100x more sensory data than all text on the internet. Why predicting the next token is an evolutionary dead end for AGI."
excerpt: "Language is not thought—it is a lossy, low-dimensional projection of reality. An inquiry into Joint Embedding Predictive Architectures (JEPA), exponential error drift, and the physical grounding required for autonomous machine intelligence."

date: 2026-09-24 09:00:00 -0300
last_modified_at: 2026-09-26 01:40:00 -0300

author: "Juan P. Giusepponi"
posted_by: "JPG"
status: "published"

format: "essay"

topic:
  pillar: "Language, LLMs & Artificial Intelligence"
  subtopic: "Human vs. Machine Intelligence & World Models"

tags:
  - "yann-lecun"
  - "jepa"
  - "world-models"
  - "llms"
  - "symbol-grounding"
  - "energy-based-models"
  - "vicreg"
  - "cognitive-architecture"
  - "philosophy-of-ai"

theme: "dark"
featured: true
toc: true
math: true

sys_id: "SYS_260924_JEPA"
vector_dim: 1536
reading_time: "12 min read"

links:
  - title: "A Path Towards Autonomous Machine Intelligence (Yann LeCun, 2022)"
    url: "https://openreview.net/pdf?id=BZ5a1r-kVsf"
    type: "paper"
    description: "LeCun's foundational position paper outlining the 6-module architecture for autonomous agents and Joint Embedding Predictive Architectures."
  - title: "I-JEPA: Self-Supervised Learning from Images (CVPR 2023)"
    url: "https://arxiv.org/abs/2301.08243"
    type: "paper"
    description: "Official implementation and benchmark validation of non-generative representation prediction in latent space."
  - title: "V-JEPA: Video Joint Embedding Predictive Architecture (Meta AI, 2024)"
    url: "https://ai.meta.com/research/publications/v-jepa-video-joint-embedding-predictive-architecture/"
    type: "tool"
    description: "Extending latent world modeling to continuous spatio-temporal video streams without pixel-level decoding."
  - title: "The Symbol Grounding Problem (Stevan Harnad, 1990)"
    url: "https://doi.org/10.1016/0167-2789(90)90087-6"
    type: "paper"
    description: "Classic cognitive science treatise explaining why formal syntactic systems cannot bootstrap semantic meaning in isolation."
  - title: "Mean Images (Hito Steyerl, e-flux #138)"
    url: "https://www.e-flux.com/journal/138/554199/mean-images/"
    type: "article"
    description: "Critical analysis of generative models as statistical averages and extractors of collective digital labor."

via: "Yann LeCun / Meta AI Research"

backlinks:
  - slug: "/essays/turing-queer-ai"
    title: "Turing & Queer AI: Synthetic Bodies, Mimicry, and Representation"
    note: "Examines how statistical optimization drives automated conformity."
  - slug: "/essays/foucault-borges-vector-space"
    title: "The 'Chinese Encyclopedia' of Vector Space"
    note: "Analyzes vector databases as epistemological taxonomies of representation."

shareable: true
allow_embed: true
canonical_url: ""

image:
  path: "/assets/images/lecun-world-models-cover.png"
  alt: "High-contrast dithered duotone graphic of a human eye and optic nerve transforming into a vector network grid"
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
    <span class="meta-chip meta-chip-mode">[{{ page.theme | default: "dark" | upcase }}]</span>
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
    <span>{{ page.reading_time | default: "12 MIN READ" }}</span>
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

## 01. The AGI Scaling Fallacy

Over the past three years, public and venture discourse surrounding Artificial General Intelligence (AGI) has converged on a singular dogma: that scaling autoregressive Large Language Models (LLMs) with more parameters, more compute, and larger crawl dumps will inexorably produce human-level cognition.

Turing Award winner and Meta Chief AI Scientist **Yann LeCun** presents a contrarian mathematical reality: **autoregressive token prediction cannot achieve human-level intelligence, common sense, or physical reasoning.**

```text
THE AUTOREGRESSIVE TRAP:
[DISCRETE TOKENS] ──(Predict Next Word)──> [FLUENT SYNTAX] ──≠──> [PHYSICAL CAUSALITY]
```

LLMs master syntax without ever understanding the physical world from which language is abstracted. They operate on a fundamental **epistemological inversion** of how intelligence develops in biological systems.

---

## 02. The Sensory Bandwidth Paradox

The core flaw of the text-first paradigm begins with a quantitative disparity in data throughput:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ THE SENSORY BANDWIDTH GAP:                                             │
│                                                                        │
│ • ALL HUMAN TEXT ON INTERNET:  ~10^12 bytes (1–2 Terabytes)            │
│ • 4-YEAR-OLD HUMAN TODDLER:    ~10^14 bytes (Visual/Sensory Streams)   │
│                                                                        │
│ RATIO: A toddler ingests 100x more data than the entire web text dump. │
└────────────────────────────────────────────────────────────────────────┘
```

* **All Written Human Knowledge:** If you aggregate literature, scientific preprints, legal codes, and Wikipedia, humanity has produced roughly $\approx 10^{12}\text{ bytes}$ of text.
* **Human Toddler Ingestion:** By age four, a child has ingested $\approx 10^{14}\text{ bytes}$ of high-bandwidth sensory input, processing visual signals through the optic nerve at approximately **20 Megabytes/second**.

A four-year-old child has seen two orders of magnitude more information about the causal structure of reality than GPT-4 or Claude 3.5 have ever parsed in text.

---

## 03. The Symbol Grounding Problem

This data disparity exposes what cognitive scientist Stevan Harnad termed the **Symbol Grounding Problem**:

> "How can the semantic interpretation of a formal symbol system be made intrinsic to the system, rather than dependent on meanings in our heads?"

Human children do not learn about gravity, momentum, inertia, object permanence, and 3D spatial geometry through grammar. They build an internal, intuitive **World Model** through continuous sensorimotor feedback long before they utter their first sentence.

```text
BIOLOGICAL COGNITION:   [SENSORY STREAM] ──> [INTUITIVE WORLD MODEL] ──> [LOSS-COMPRESSED LANGUAGE]
AUTOREGRESSIVE AI:      [UNGROUNDED TEXT TOKENS] ──> [STATISTICAL CORRELATION] ──> [HALLUCINATION]
```

Language is not thought; **language is a compressed, lossy projection of a world model.** Attempting to train an AI on text alone is like trying to reconstruct a 4K hologram from a Morse code transcript.

---

## 04. Exponential Error Accumulation in Token Prediction

Autoregressive language models predict a probability distribution over discrete vocabulary tokens conditioned on previous tokens:

$$P(w_t \mid w_1, w_2, \dots, w_{t-1})$$

Because each generated token $w_t$ is fed back into the context window as absolute ground truth, autoregressive generation suffers from **exponential error drift**:

```text
REASONING DRIFT OVER N STEPS:
Step 1:   P(Success) = 0.99
Step 10:  P(Success) = (0.99)^10 ≈ 0.904
Step 50:  P(Success) = (0.99)^50 ≈ 0.605
Step 100: P(Success) = (0.99)^100 ≈ 0.366
```

If a model has a 99% accuracy per token step, over a 100-step chain of complex logical deduction, the probability of remaining uncorrupted collapses to just **36.6%**. 

Because the model possesses no internal simulator of physical reality, it cannot verify whether its generated plan violates physical causality until after the token stream collapses into hallucination.

---

## 05. LeCun’s 6 Modules for Autonomous Machine Intelligence

In *A Path Towards Autonomous Machine Intelligence*, LeCun replaces monolithic sequence-to-sequence transformers with a modular cognitive architecture:

```text
┌────────────────────────────────────────────────────────────────────────┐
│             LECUN'S AUTONOMOUS COGNITIVE ARCHITECTURE                 │
│                                                                        │
│                ┌──────────────────────────────┐                        │
│                │      1. CONFIGURATOR         │                        │
│                │   (Executive Control/Goals)  │                        │
│                └──────────────┬───────────────┘                        │
│                               │                                        │
│          ┌────────────────────┼────────────────────┐                   │
│          ▼                    ▼                    ▼                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │2. PERCEPTION │────>│3. WORLD MODEL│<────│   5. ACTOR   │            │
│  │ (Sensory x)  │ s_t │ (Predicts s) │ a_t │ (Plans a_t)  │            │
│  └──────────────┘     └───────┬──────┘     └──────────────┘            │
│                               │ s_{t+1}                                │
│                               ▼                                        │
│                       ┌──────────────┐                                 │
│                       │4. COST MODULE│ (Intrinsic & Critic Energy)     │
│                       └──────────────┘                                 │
│                               ▲                                        │
│                       ┌───────┴──────┐                                 │
│                       │6. SHORT-TERM │                                 │
│                       │    MEMORY    │                                 │
│                       └──────────────┘                                 │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Configurator:** Executive control modulating system parameters and setting dynamic sub-goals.
2. **Perception Module:** Maps raw sensor streams $x$ into abstract latent states $s_t$.
3. **World Model:** Simulates the environment, predicting future state $s_{t+1}$ given candidate action $a_t$.
4. **Cost Module:** Computes intrinsic discomfort (pain, constraint violations, goal divergence) combined with a trainable critic cost.
5. **Actor Module:** Optimizes action sequences $(a_t, a_{t+1}, \dots)$ to minimize predicted future cost.
6. **Short-Term Memory:** Stores state-action-cost trajectories to enable multi-horizon planning.

---

## 06. JEPA: Predicting in Latent Space, Not Pixel Space

Traditional generative architectures (autoencoders, diffusion models) waste immense computational capacity attempting to predict every individual pixel or background texture in a scene:

```text
GENERATIVE PIXEL PREDICTION (Inefficient):
[OBSERVATION X] ──> [GENERATE FULL PIXEL SCENE Y] ──> (Wastes compute on tree leaves/ripples)

JEPA LATENT PREDICTION (Efficient):
[OBSERVATION X] ──(Encoder)──> [LATENT STATE s_x]
                                      │
                                      ▼ (Predictor in Latent Space Z)
[OBSERVATION Y] ──(Encoder)──> [LATENT STATE s_y]
```

**Joint Embedding Predictive Architecture (JEPA)** does not generate surface observations. Instead:
1. Encoder $E_x$ extracts structural features $s_x \in \mathcal{Z}$.
2. Encoder $E_y$ extracts target features $s_y \in \mathcal{Z}$.
3. Predictor $P_\phi(s_x, z)$ predicts $s_y$ directly inside continuous **Latent Space $\mathcal{Z}$**.

By predicting in representation space, JEPA discards irrelevant high-frequency noise and focuses exclusively on structural dynamics and causal topology.

---

## 07. Non-Contrastive Regularization & VICReg

In self-supervised latent modeling, systems face the danger of **representation collapse**—where the encoders learn a trivial constant output for all inputs ($s_x = s_y = \text{const}$).

Rather than relying on computationally expensive negative sample batches, LeCun utilizes **VICReg** (Variance-Invariance-Covariance Regularization):

$$\mathcal{L}_{\text{VICReg}} = \lambda \cdot s(Z_1, Z_2) + \mu \cdot \left[ v(Z_1) + v(Z_2) \right] + \nu \cdot \left[ c(Z_1) + c(Z_2) \right]$$

* **Invariance $s(Z_1, Z_2)$:** Forces representations of transformed inputs to remain close in cosine distance.
* **Variance $v(Z)$:** Forces each latent dimension to maintain a variance above a unit threshold, preventing collapse to a single point.
* **Covariance $c(Z)$:** Decorrelates latent feature pairs, ensuring each dimension captures independent physical properties of the environment.

---

## 08. The Epistemic Error: Foucault & "The Mean Image"

This technical divergence connects directly with philosophical critique:

1. **Michel Foucault’s *Episteme* (*The Order of Things*):** Vector databases map words according to statistical proximity in digital texts. Confusing spatial proximity inside a vector manifold with physical causality is the central epistemic error of modern AI marketing.
2. **Hito Steyerl’s *Mean Images* (2023):** Generative AI does not produce photographs of physical reality; it produces statistical averages extracted from past online traces. When LLMs generate text, they sample the median consensus of their training distribution.

```text
THE MEAN IMAGE DILEMMA:
[TRAINING DISTRIBUTION] ──(Loss Minimization)──> [STATISTICAL MEDIAN] ──≠──> [PHYSICAL TRUTH]
```

---

## 09. Conclusion: The Future Belongs to Video Grounding

The transition from text-pretrained LLMs to physically grounded World Models represents the definitive threshold for AI:

1. **Next-Token Prediction is a Local Optimum:** It yields extraordinary language interfaces, but cannot reason, plan, or understand cause-and-effect.
2. **Self-Supervised Video Learning is the Path:** Ingesting continuous video through V-JEPA bridges the $10^{14}\text{ bytes}$ bandwidth gap.
3. **True Intelligence Requires Latent World Models:** Planning through energy-based cost functions in continuous representation space is how machines will finally learn common sense.

True machine intelligence will not be achieved by predicting the next word—it will be achieved by understanding the physical world.

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
