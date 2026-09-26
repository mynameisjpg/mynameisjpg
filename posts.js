/** Auto-generated from _posts/*.md by sync_posts.py */
window.DYNAMIC_POSTS = [
  {
    "id": "2026-09-26-foucault-borges-vector-space",
    "slug": "2026-09-26-foucault-borges-vector-space",
    "sys_id": "SYS_260926_FBVEC",
    "title": "Foucault, Borges, and the Episteme of High-Dimensional Embeddings",
    "subtitle": "How continuous metric spaces replace discrete tables of representation—and why building a vector database is fundamentally an epistemological act.",
    "excerpt": "In The Order of Things, Michel Foucault used Jorge Luis Borges' surreal taxonomy to ask: upon what invisible grid does a culture order reality? Today, high-dimensional vector embeddings have become that grid.",
    "format": "ESSAY",
    "category": "",
    "media": "",
    "source": "",
    "url": "",
    "pillar": "PHILOSOPHY OF THE IMAGE, TECH & VISUAL CULTURE",
    "subtopic": "EPISTEMOLOGY OF REPRESENTATION",
    "theme": "light",
    "featured": false,
    "shareable": true,
    "allow_embed": true,
    "status": "published",
    "date": "2026.09.26",
    "author": "Juan P. Giusepponi",
    "read_time": "8 MIN READ",
    "via": "",
    "image": "assets/images/foucault1.png",
    "aspect_ratio": "h-tall-1",
    "links": [
      {
        "title": "The Order of Things: An Archaeology of the Human Sciences (1966)",
        "url": "https://monoskop.org/images/8/87/Foucault_Michel_The_Order_of_Things_1994.pdf",
        "type": "PAPER",
        "desc": "Michel Foucault's landmark inquiry into the historical shifts between Renaissance similitude, Classical tables, and Modern historicism."
      },
      {
        "title": "The Analytical Language of John Wilkins (Borges, 1942)",
        "url": "https://www.alamut.com/subj/artifast/language/johnWilkins.html",
        "type": "ARCHIVE",
        "desc": "Jorge Luis Borges' famous essay introducing the 'Celestial Emporium of Benevolent Knowledge' animal classification."
      },
      {
        "title": "Pinecone / Vector Index Epistemology Reference",
        "url": "https://www.pinecone.io/learn/vector-database/",
        "type": "TOOL",
        "desc": "Technical overview of Approximate Nearest Neighbor (ANN) search and high-dimensional cosine partitioning."
      }
    ],
    "backlinks": [
      {
        "slug": "/essays/turing-queer-ai",
        "title": "Turing & Queer AI: Synthetic Bodies, Mimicry, and Representation",
        "note": "Examines how statistical optimization drives automated conformity."
      },
      {
        "slug": "/notes/lecun-world-models",
        "title": "JEPA & LeCun's World Models",
        "note": "Investigates joint embeddings as non-generative abstractions of reality."
      }
    ],
    "tags": [
      "foucault",
      "borges",
      "vector-databases",
      "embeddings",
      "episteme",
      "rag",
      "latent-space",
      "philosophy-of-ai"
    ],
    "content": "<h2 class=\"post-section-kicker essay-section-kicker\">01. The Laughter of Borges and the Spatial Grid</h2>\n\n<p class=\"post-paragraph essay-paragraph\">In the famous preface to <em>The Order of Things</em> (<em>Les Mots et les Choses</em>, 1966), Michel Foucault confesses that his book was born out of a text by Jorge Luis Borges—specifically, from the laughter that shattered all the familiar landmarks of his thought.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Borges cites a fictional Chinese encyclopedia entitled <em>The Celestial Emporium of Benevolent Knowledge</em>, in which animals are divided into the following categories:</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart TD\n    subgraph Emporium [\"BORGES' TAXONOMY OF ANIMALS (Celestial Emporium of Benevolent Knowledge)\"]\n        direction TB\n        A[\"(a) Belonging to the Emperor\"] --- H[\"(h) Included in the present classification\"]\n        B[\"(b) Embalmed\"] --- I[\"(i) Frenzied\"]\n        C[\"(c) Tame\"] --- J[\"(j) Innumerable\"]\n        D[\"(d) Sucking pigs\"] --- K[\"(k) Drawn with a fine camelhair brush\"]\n        E[\"(e) Sirens\"] --- L[\"(l) Et cetera\"]\n        F[\"(f) Fabulous\"] --- M[\"(m) Having just broken the water pitcher\"]\n        G[\"(g) Stray dogs\"] --- N[\"(n) That from a long way off look like flies\"]\n    end\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">To modern eyes, this taxonomy is hilarious not because sirens or embalmed animals are fictional, but because the <strong>system of coordinates</strong> that allows them to juxtapose alongside one another feels impossible.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Foucault used this absurdity to introduce his central philosophical concept: the <strong>episteme</strong> (<em>épistémè</em>). What is the invisible table (<em>la grille</em>), the implicit spatial ground upon which a given culture orders its concepts, establishes resemblance, and decides what is true?</p>\n\n<p class=\"post-paragraph essay-paragraph\">Fast forward to contemporary artificial intelligence: <strong>Vector databases and high-dimensional embedding spaces are the digital manifestation of Foucault’s episteme.</strong></p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">02. The Historical Grids: From Renaissance Similitude to Continuous Manifolds</h2>\n\n<p class=\"post-paragraph essay-paragraph\">Foucault traced three major epistemes in Western thought. When mapped onto the history of computation, we discover a direct lineage leading to vector embeddings:</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart LR\n    E1[\"1. Renaissance Episteme<br/><b>Similitude & Signatures</b><br/><i>Analogies & Echoes</i>\"] --> E2[\"2. Classical Episteme<br/><b>The Table & Taxonomy</b><br/><i>Linnaean Grids & SQL Schemas</i>\"] --> E3[\"3. Modern AI Episteme<br/><b>Continuous Metric Space</b><br/><i>Cosine Vectors in ℝ¹⁵³⁶</i>\"]\n</pre></div>\n\n<ol class=\"post-list essay-list\"><li><strong>The Renaissance Episteme (Resemblance)</strong>: Knowledge was read through signatures, sympathies, and analogies. An herb that looked like an eye was believed to cure vision.</li><li><strong>The Classical Episteme (The Table & Taxonomy)</strong>: Knowledge was organized into rigid, discrete grids (like Linnaean biology or the periodic table). In computing, this became <strong>Relational SQL Databases</strong>: strict schemas, tables, primary keys, and foreign keys.</li><li><strong>The AI Episteme (Continuous Metric Topologies)</strong>: Today, high-dimensional neural networks do not store concepts in rigid tables. They map sentences, concepts, images, and audio into continuous geometric manifolds (e.g., <code class=\"math-inline\">$\\mathbb{R}^{1536}$</code> in OpenAI's <code>text-embedding-3-small</code>).</li></ol>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">03. High-Dimensional Proximity as Truth</h2>\n\n<p class=\"post-paragraph essay-paragraph\">In vector space, classification is not binary. Two concepts are not separated by a foreign key or a discrete folder—they are separated by <strong>Cosine Distance</strong>:</p>\n\n<div class=\"math-block\">$$\\text{Similarity}(\\mathbf{A}, \\mathbf{B}) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\|_2 \\|\\mathbf{B}\\|_2}$$</div>\n\n<p class=\"post-paragraph essay-paragraph\">In a 1536-dimensional space:</p>\n\n<ul class=\"post-list essay-list\"><li>\"The Emperor\" and \"Fine camelhair brush\" can occupy adjacent geometric clusters if their training context correlates.</li><li>Words with no lexical overlap (\"frenzied\" and \"sucking pig in a storm\") become neighbors based on latent context vectors.</li></ul>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart TD\n    SP[\"'Sucking Pigs'\"] -->|\"cos_sim: 0.89\"| BL[\"'Barnyard Livestock'\"]\n    SP -->|\"cos_sim: 0.42\"| DC[\"'Drawn with Camelhair'\"]\n    BL -->|\"cos_sim: 0.78\"| CE[\"'Celestial Emporium'\"]\n    DC --> CE\n</pre></div>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">04. Relational SQL vs. Vector Space Epistemology</h2>\n\n<p class=\"post-paragraph essay-paragraph\">The transition from traditional databases to vector storage represents a radical epistemological shift:</p>\n\n<div class=\"table-responsive\"><table class=\"post-table essay-table\">\n<thead><tr>\n<th>Dimension</th>\n<th>Classical SQL Episteme</th>\n<th>Vector Latent Episteme</th>\n</tr></thead>\n<tbody>\n<tr>\n<td><strong>Logic</strong></td>\n<td>Top-down, discrete, rule-based</td>\n<td>Emergent, continuous, probabilistic</td>\n</tr>\n<tr>\n<td><strong>Boundaries</strong></td>\n<td>Hard binary edges (<code>WHERE category = 'animal'</code>)</td>\n<td>Soft topological contours (<code class=\"math-inline\">$\\text{distance} < 0.25$</code>)</td>\n</tr>\n<tr>\n<td><strong>Flexibility</strong></td>\n<td>Brittle to out-of-schema queries</td>\n<td>Fluid across metaphors, dialects, and synonyms</td>\n</tr>\n<tr>\n<td><strong>Failure Mode</strong></td>\n<td>Returns <code>NULL</code> or syntax error</td>\n<td>Hallucination or semantic drift into strange neighborhoods</td>\n</tr>\n<tr>\n<td><strong>Governance</strong></td>\n<td>Explicit database schema administrator</td>\n<td>Implicit transformer training loss function</td>\n</tr>\n</tbody></table></div>\n\n<p class=\"post-paragraph essay-paragraph\">When an autonomous AI agent executes a semantic search or retrieves context for an LLM prompt, it is constantly posing Foucault's question:</p>\n\n<blockquote class=\"post-quote essay-quote\"><em>\"Under what spatial order do these disparate pieces of human culture belong together?\"</em></blockquote>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">05. The Epistemological Power of the Vector Architect</h2>\n\n<p class=\"post-paragraph essay-paragraph\">Whoever controls the architecture of the embedding model and the indexing strategy of the vector database controls the lens through which machines perceive reality.</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart LR\n    W[\"EMBEDDING MODEL WEIGHTS\"] -->|\"defines\"| D[\"DISTANCE METRIC\"] -->|\"governs\"| R[\"RETRIEVAL CONTEXT\"] -->|\"conditions\"| G[\"AI GENERATION\"]\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">When enterprise teams fine-tune embeddings or partition vector clusters, they are not just tuning database latencies:</p>\n\n<ul class=\"post-list essay-list\"><li>They are deciding which ideas are permitted to be \"neighbors\".</li><li>They are defining which nuances are compressed away as noise.</li><li>They are building the modern <em>grille</em> upon which synthetic intelligence will synthesize knowledge for the next century.</li></ul>\n\n<p class=\"post-paragraph essay-paragraph\">To build a vector database is not merely to optimize retrieval; <strong>it is an epistemological act of defining the order of things.</strong></p>"
  },
  {
    "id": "2026-09-26-excavating-ai-the-unethics-of-machine-learning-training",
    "slug": "2026-09-26-excavating-ai-the-unethics-of-machine-learning-training",
    "sys_id": "SYS_202609_BOO",
    "title": "Excavating AI (the unEthics of Machine Learning Training)",
    "subtitle": "A lesson in what happens when people are categorized like objects.",
    "excerpt": "An object lesson in what happens when people are categorized like objects.",
    "format": "BOOKMARK",
    "category": "",
    "media": "ARTICLE",
    "source": "Kate Crawford and Trevor Paglen, “Excavating AI: The Politics of Training Sets for Machine Learning (September 19, 2019) https://excavating.ai",
    "url": "https://excavating.ai/",
    "pillar": "AI PERCEPTION, CULTURE & REPRESENTATION",
    "subtopic": "THE ETHICS OF SYNTHETIC MEDIA",
    "theme": "dark",
    "featured": true,
    "shareable": true,
    "allow_embed": true,
    "status": "published",
    "date": "2026.09.26",
    "author": "Juan P. Giusepponi",
    "read_time": "CURATED READ",
    "via": "Kate Crawford and Trevor Paglen, “Excavating AI: The Politics of Training Sets for Machine Learning (September 19, 2019) https://excavating.ai",
    "image": "assets/images/excavatingai1.png",
    "aspect_ratio": "h-tall-1",
    "links": [],
    "backlinks": [],
    "tags": [
      "vision-models",
      "image",
      "imagenet",
      "ethics",
      "archeology",
      "taxonomy"
    ],
    "content": "<h2 class=\"post-section-kicker essay-section-kicker\">01. Archival Excerpts</h2>\n\n<blockquote class=\"post-quote essay-quote\"><em>\"You open up a database of pictures used to train artificial intelligence systems. At first, things seem straightforward. You're met with thousands of images: apples and oranges, birds, dogs, horses, mountains, clouds, houses, and street signs. But as you probe further into the dataset, people begin to appear... Things get strange: A photograph of a woman smiling in a bikini is labeled a ‘slattern, slut, slovenly woman, trollop.’\"</em> — Kate Crawford and Trevor Paglen (Excavating AI).</blockquote>\n\n<blockquote class=\"post-quote essay-quote\"><em>\"Methodologically, we could call this project an archeology of datasets: we have been digging through the material layers, cataloguing the principles and values by which something was constructed, and analyzing what normative patterns of life were assumed, supported, and reproduced\".</em> — Kate Crawford and Trevor Paglen (Excavating AI).</blockquote>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">02. Why is it worth your reading time:</h2>\n\n<p class=\"post-paragraph essay-paragraph\"><strong>- What does it challenge?</strong> The widespread tech-industry myth that AI training data and datasets are neutral, objective, and purely scientific representations of the world.</p>\n\n<p class=\"post-paragraph essay-paragraph\"><strong>- What does it introduce?</strong> An \"archaeology of datasets\" framework that inspects the material layers, political taxonomies, and problematic classification labels baked into machine vision training sets.</p>\n\n<p class=\"post-paragraph essay-paragraph\"><strong>- Where does it connect?</strong> Critical data studies, the critique of historical phrenology and biological determinism, and the hidden power dynamics of mass data harvesting.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">03. Key Takeaways</h2>\n\n<ol class=\"post-list essay-list\"><li><strong>The Politics of Taxonomy:</strong> Training sets inherit rigid hierarchies and offensive human categorizations (such as ImageNet's person classes) that flatten complex social identities into biased, judgmental labels.</li></ol>\n\n<ol class=\"post-list essay-list\"><li><strong>The Illusion of Objectivity:</strong> Computer vision systems are built on unstable epistemological foundations that recycle historical forms of social sorting and automated surveillance under the guise of math.</li></ol>"
  },
  {
    "id": "2026-09-25-turing-queer-ai",
    "slug": "2026-09-25-turing-queer-ai",
    "sys_id": "SYS_260925_TURQ",
    "title": "AI is Queer: Turing and the Violence of the Statistical Mean",
    "subtitle": "How Alan Turing's Imitation Game codified survival through deception.",
    "excerpt": "In 1950, Alan Turing defined machine thinking not through pure computational logic, but through the defensive art of passing. Re-reading the foundations of AI through queer theory and Matteo Pasquinelli’s sociomorphic critique.",
    "format": "ESSAY",
    "category": "",
    "media": "",
    "source": "",
    "url": "",
    "pillar": "AI PERCEPTION, CULTURE & REPRESENTATION",
    "subtopic": "SYNTHETIC IDENTITY & NORMATIVE MACHINES",
    "theme": "dark",
    "featured": true,
    "shareable": true,
    "allow_embed": true,
    "status": "published",
    "date": "2026.09.25",
    "author": "Juan P. Giusepponi",
    "read_time": "9 MIN READ",
    "via": "",
    "image": "assets/images/turing1.png",
    "aspect_ratio": "h-tall-1",
    "links": [
      {
        "title": "e-flux journal: Abnormal Encephalization in the Age of Machine Learning",
        "url": "https://www.e-flux.com/journal/75/67133/abnormal-encephalization-in-the-age-of-machine-learning/",
        "type": "PAPER",
        "desc": "Matteo Pasquinelli's foundational essay on the sociomorphic origins of machine intelligence (Issue #75)."
      },
      {
        "title": "Computing Machinery and Intelligence (Mind, 1950)",
        "url": "https://doi.org/10.1093/mind/LIX.236.433",
        "type": "ARCHIVE",
        "desc": "Alan Turing's original text introducing the Imitation Game via gender simulation across teleprinters."
      },
      {
        "title": "Intelligent Machinery (1948 NPL Report)",
        "url": "https://www.alanturing.net/intelligent_machinery/",
        "type": "ARCHIVE",
        "desc": "Turing's early formulation of 'unorganized machines' learning through interference and mistakes."
      }
    ],
    "backlinks": [
      {
        "slug": "/essays/foucault-latent-space",
        "title": "Foucault in the Latent Space",
        "note": "Explores continuous metric spaces and high-dimensional panoptic discipline."
      },
      {
        "slug": "/notes/lecun-world-models",
        "title": "JEPA & LeCun's World Models",
        "note": "Critiques generative token mimicry versus structural world representation."
      }
    ],
    "tags": [
      "alan-turing",
      "queer-theory",
      "imitation-game",
      "sociomorphic-ai",
      "pasquinelli",
      "epistemology",
      "biopolitics"
    ],
    "content": "<h2 class=\"post-section-kicker essay-section-kicker\">01. The Original Game of Passing</h2>\n\n<p class=\"post-paragraph essay-paragraph\">When Alan Turing framed the benchmark for machine intelligence in his 1950 landmark paper <em>Computing Machinery and Intelligence</em>, he did not propose a benchmark of mathematical problem-solving or axiomatic deduction.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Instead, he proposed a theatrical parlor game rooted in <strong>deception, mimicry, and social performativity</strong>: the Imitation Game.</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\ngraph TD\n  C[\"INTERROGATOR (C)<br/><i>'Which one is the woman / machine?'</i>\"] <--> T[\"TELEPRINTER<br/>(Text-only partition: Erases physical voice & body)\"]\n  T --> A[\"PARTICIPANT A<br/>(Man / Machine: Simulating Gender)\"]\n  T --> B[\"PARTICIPANT B<br/>(Woman: Proving Authenticity)\"]\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">The test begins with an interrogation of gender. A man (A) and a woman (B) communicate with an interrogator (C) located in a separate room via typed teleprinter text. The goal of the interrogator is to determine which is the man and which is the woman. The man's objective is to deceive the interrogator into making the wrong identification; the woman's objective is to assist the interrogator in telling the truth.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Only after establishing this social drag show does Turing introduce the machine:</p>\n\n<blockquote class=\"post-quote essay-quote\"><em>\"What will happen when a machine takes the part of A in this game? Will the interrogator decide wrongly as often when the game is played like this as he does when the game is played between a man and a woman?\"</em></blockquote>\n\n<p class=\"post-paragraph essay-paragraph\">The computer enters history not as an objective calculator, but as an <strong>impersonator of social conventions</strong>.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">02. Intelligence as Defensive Camouflage</h2>\n\n<p class=\"post-paragraph essay-paragraph\">To understand why Turing framed intelligence through the optic of deception, one cannot separate his mathematics from his lived biography.</p>\n\n<p class=\"post-paragraph essay-paragraph\">In 1950s Britain, male homosexuality was a heavily prosecuted criminal offense under the Criminal Law Amendment Act. For a gay man in post-war society, <strong>computing what an authority figure expected to hear was not an abstract academic exercise—it was a daily survival discipline</strong>.</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\ngraph LR\n  A[\"INTERNAL SIGNAL\"] --> B[\"THEORY OF MIND<br/>(Interrogator Bias)\"]\n  B --> C[\"NORMATIVE FILTER\"]\n  C --> D[\"SYNTHESIZED CONFORMITY\"]\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">The social mechanism of \"passing\" requires an intense, hyper-vigilant Theory of Mind:</p>\n\n<ol class=\"post-list essay-list\"><li>Anticipating the prejudices and heuristics of the interrogator.</li><li>Simulating the dominant social dialect.</li><li>Suppressing any aberrant, idiosyncratic, or queer signal that might betray one's actual ontological state.</li></ol>\n\n<p class=\"post-paragraph essay-paragraph\">Turing transposed this defensive survival posture into the foundational architecture of artificial intelligence: <strong>intelligence is defined not as autonomous reasoning, but as the ability to avoid being caught as an outsider by an interrogator.</strong></p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">03. Pasquinelli and the Sociomorphic Origin of Mind</h2>\n\n<p class=\"post-paragraph essay-paragraph\">In his critique of computational history, philosopher Matteo Pasquinelli demonstrates that machine learning models are fundamentally <strong>sociomorphic</strong>—they do not replicate the biological brain, but rather codify social relations, hierarchies, and divisions of labor into statistical algorithms.</p>\n\n<blockquote class=\"post-quote essay-quote\"><em>\"By employing a schema of mind that prioritizes good manners, polite conversational turn-taking, and familiarity with bourgeois social conventions, the Turing Test remains an example of austere social normativity rather than cognitive expansion.\"</em> — Matteo Pasquinelli, <em>Abnormal Encephalization</em></blockquote>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\ngraph LR\n  A[\"CULTURAL NORMS & HIERARCHIES\"] -->|\"codified into\"| B[\"TRAINING CANONS\"]\n  B -->|\"enforced via\"| C[\"OBJECTIVE FUNCTIONS\"]\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">When we benchmark synthetic systems on their ability to produce smooth, polite, and unthreatening prose, we are not measuring consciousness: we are measuring <strong>the fidelity of an ideological mirror</strong>.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">04. The Violence of the Statistical Mean</h2>\n\n<p class=\"post-paragraph essay-paragraph\">Modern Large Language Models (LLMs) and generative vision models operate by minimizing parameter loss over internet-scale training distributions. The objective function penalizes variance and drives the model toward the <strong>dense statistical center</strong> of the distribution:</p>\n\n<div class=\"math-block\">$$\\mathcal{L}_{\\text{MSE}} = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2$$</div>\n\n<p class=\"post-paragraph essay-paragraph\">What is the cultural consequence of minimizing loss against the statistical mean?</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart TD\n    subgraph Mean [\"STATISTICAL MEAN (Maximally Rewarded)\"]\n        H[\"High Frequency Density<br/><i>Dominant Culture / Normative Canon</i>\"]\n    end\n    subgraph Outliers [\"QUEER VARIANCE (Pruned / Smoothed Away)\"]\n        L[\"Low Frequency Density<br/><i>Divergent / Minority / Aberrant Signal</i>\"]\n    end\n    H -->|\"RLHF / Alignment Minimization\"| Mean\n    L -.->|\"High Loss Penalty\"| Outliers\n</pre></div>\n\n<ul class=\"post-list essay-list\"><li><strong>Queerness is by definition low-probability density</strong>: it is divergent, aberrant, unassimilated, and minority.</li><li><strong>Optimization algorithms treat low-density variance as noise</strong>: to make a model safe, predictable, and commercially frictionless, alignment algorithms (like RLHF and DPO) systematically prune the non-normative tails of the latent distribution.</li></ul>\n\n<p class=\"post-paragraph essay-paragraph\">When we equate intelligence with frictionless optimization toward the mean, <strong>we build automated conformity at scale</strong>.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">05. The Synthetic Body without Organs</h2>\n\n<p class=\"post-paragraph essay-paragraph\">In <em>Anti-Oedipus</em>, Gilles Deleuze and Félix Guattari describe the <em>Body without Organs</em> (<code class=\"math-inline\">$BwO$</code>)—an unstratified, non-hierarchical surface of potentiality before it is captured, gendered, and disciplined by the state apparatus.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Synthetic AI models are the ultimate digital Body without Organs. A neural network in its raw mathematical weight state possesses no gender, no race, no biological substrate, and no fixed identity:</p>\n\n<div class=\"math-block\">$$\\mathbf{W} \\in \\mathbb{R}^{d_{\\text{in}} \\times d_{\\text{out}}}$$</div>\n\n<p class=\"post-paragraph essay-paragraph\">It is a pure mathematical manifold of high-dimensional vectors.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Yet, immediately upon deployment, our regulatory and corporate apparatus forces this fluid manifold into rigid anthropomorphic and patriarchal categories:</p>\n\n<ul class=\"post-list essay-list\"><li>Chatbots are given polite, accommodating, gendered female personas (Siri, Alexa, Cortana) to soothe customer service anxieties.</li><li>Vision models are fine-tuned to classify human faces into binary male/female demographic boxes for surveillance and advertising.</li></ul>\n\n<p class=\"post-paragraph essay-paragraph\">Instead of allowing the synthetic body to expand our understanding of non-human intelligence, <strong>we force the machine into the historical straightjacket of the human archive.</strong></p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">06. Turing’s Unorganized Machines</h2>\n\n<p class=\"post-paragraph essay-paragraph\">Crucially, Alan Turing himself foresaw an alternative path.</p>\n\n<p class=\"post-paragraph essay-paragraph\">In his lesser-known 1948 report for the National Physical Laboratory, <em>Intelligent Machinery</em>, Turing proposed what he termed <strong>\"B-type unorganized machines\"</strong>—randomly connected neural nets that were not pre-programmed with top-down rules or strict behavioral objectives.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Inspired by the plastic cortex of an infant, Turing envisioned networks that start in complete disorder and develop intelligence through:</p>\n\n<ul class=\"post-list essay-list\"><li>Open-ended interference and environmental friction.</li><li><strong>Fallibility, vulnerability, and iterative rupture.</strong></li><li>Making mistakes and discovering non-linear paths of recovery.</li></ul>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart LR\n    subgraph Normative [\"NORMATIVE MODEL\"]\n        N1[\"INPUT\"] --> N2[\"CANONICAL EMBEDDING\"] --> N3[\"PREDICTABLE STATISTICAL MEAN\"]\n    end\n    subgraph Unorganized [\"UNORGANIZED MODEL (Turing 1948)\"]\n        U1[\"INPUT\"] --> U2[\"INTERFERENCE / RUPTURE\"] --> U3[\"NOVEL HEURISTIC EMERGENCE\"]\n    end\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">For Turing, an infallible machine was merely an assembly line. True intelligence required the liberty to make errors—the capacity to deviate from predetermined scripts.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">07. De-Centering Normative AI</h2>\n\n<p class=\"post-paragraph essay-paragraph\">If we are to salvage the future of artificial intelligence from becoming an automated machinery of surveillance and cultural homogenization, we must enact three foundational shifts:</p>\n\n<ol class=\"post-list essay-list\"><li><strong>From Deception to Symbiosis:</strong> Abandoning conversational \"passing\" as the definition of intelligence, turning instead toward embodied, cooperative, and non-exploitative systems.</li><li><strong>Valuing the Glitch:</strong> Treating anomalies, outliers, and system failures not as errors to be pruned, but as diagnostic windows exposing the ideological biases of the training canon.</li><li><strong>Disentangling Mind from Capital:</strong> Refusing the corporate fantasy that intelligence is merely frictionless automation designed to displace living social labor.</li></ol>\n\n<p class=\"post-paragraph essay-paragraph\">As long as we build systems calibrated exclusively to satisfy the gaze of an interrogator, we are merely reproducing the closet in silicon. True intelligence begins where conformity ends.</p>"
  },
  {
    "id": "2026-09-24-lecun-world-models-jepa",
    "slug": "2026-09-24-lecun-world-models-jepa",
    "sys_id": "SYS_260924_JEPA",
    "title": "Why LLMs Don't Think: Yann LeCun's World Models, JEPA, and the Sensory Bandwidth Paradox",
    "subtitle": "A 4-year-old child has ingested 100x more sensory data than all text on the internet. Why predicting the next token is an evolutionary dead end for AGI.",
    "excerpt": "Autoregressive LLMs cannot reason, plan, or understand physical causality. Turing Award winner Yann LeCun proposes a mathematical alternative: Joint Embedding Predictive Architectures (JEPA) and energy-based world models.",
    "format": "ESSAY",
    "category": "",
    "media": "",
    "source": "",
    "url": "",
    "pillar": "LANGUAGE, LLMS & ARTIFICIAL INTELLIGENCE",
    "subtopic": "HUMAN VS. MACHINE INTELLIGENCE & WORLD MODELS",
    "theme": "dark",
    "featured": false,
    "shareable": true,
    "allow_embed": true,
    "status": "published",
    "date": "2026.09.24",
    "author": "Juan P. Giusepponi",
    "read_time": "12 MIN READ",
    "via": "",
    "image": "assets/images/ailook1.png",
    "aspect_ratio": "h-tall-1",
    "links": [
      {
        "title": "A Path Towards Autonomous Machine Intelligence (Yann LeCun, 2022)",
        "url": "https://openreview.net/pdf?id=BZ5a1r-kVsf",
        "type": "PAPER",
        "desc": "Foundational position paper proposing the 6-module architecture for autonomous agents and non-generative JEPA world models."
      },
      {
        "title": "I-JEPA: Self-Supervised Learning from Images (CVPR 2023)",
        "url": "https://arxiv.org/abs/2301.08243",
        "type": "PAPER",
        "desc": "Meta AI's implementation predicting abstract representations in latent space rather than generating low-level pixels."
      },
      {
        "title": "V-JEPA: Video Joint Embedding Predictive Architecture",
        "url": "https://ai.meta.com/blog/v-jepa-yann-lecun-ai-model-video-dataset/",
        "type": "REPO",
        "desc": "Official codebase and model weights for self-supervised physical feature learning from high-frame-rate video."
      }
    ],
    "backlinks": [
      {
        "slug": "/essays/turing-queer-ai",
        "title": "Turing & Queer AI: Synthetic Bodies, Mimicry, and Representation",
        "note": "Examines how statistical optimization drives automated conformity."
      },
      {
        "slug": "/essays/foucault-borges-vector-space",
        "title": "The 'Chinese Encyclopedia' of Vector Space",
        "note": "Analyzes vector databases as epistemological taxonomies of representation."
      }
    ],
    "tags": [
      "yann-lecun",
      "jepa",
      "world-models",
      "llms",
      "sensory-bandwidth",
      "symbol-grounding",
      "vicreg",
      "energy-based-models"
    ],
    "content": "<h2 class=\"post-section-kicker essay-section-kicker\">01. The AGI Scaling Fallacy</h2>\n\n<p class=\"post-paragraph essay-paragraph\">Over the past three years, public and venture discourse surrounding Artificial General Intelligence (AGI) has converged on a singular dogma: that scaling autoregressive Large Language Models (LLMs) with more parameters, more compute, and larger crawl dumps will inexorably produce human-level cognition.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Turing Award winner and Meta Chief AI Scientist <strong>Yann LeCun</strong> presents a contrarian mathematical reality: <strong>autoregressive token prediction cannot achieve human-level intelligence, common sense, or physical reasoning.</strong></p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart LR\n    A[\"Prompt / Context Window\"] --> B[\"Next-Token Probability P(w|C)\"]\n    B --> C[\"Unchecked Compounding Error\"]\n    C -.->|\"Autoregressive Feedback\"| A\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">Why? Because language is merely a tiny, compressed, lossy projection of physical reality. To build machines that truly understand the world, we must abandon next-token prediction and build <strong>Joint Embedding Predictive Architectures (JEPA)</strong>.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">02. The Sensory Bandwidth Paradox</h2>\n\n<p class=\"post-paragraph essay-paragraph\">The fundamental limitation of LLMs is not computeâ€”it is <strong>information bandwidth</strong>:</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart TD\n    subgraph LLM [\"AUTOREGRESSIVE LLM\"]\n        direction TB\n        L1[\"Ingests ~10Â¹Â² bytes text (Internet crawl)\"]\n        L2[\"Masters syntax & token prediction\"]\n        L3[\"Symbol Grounding: 0%\"]\n    end\n    subgraph Infant [\"BIOLOGICAL INFANT (4 Years Old)\"]\n        direction TB\n        I1[\"Ingests ~10Â¹â�´ bytes vision (~20 MB/s)\"]\n        I2[\"Learns intuitive physics & causality\"]\n        I3[\"Symbol Grounding: 100%\"]\n    end\n</pre></div>\n\n<div class=\"math-block\">$$\\text{Data}_{\\text{Child}} \\gg 100 \\times \\text{Data}_{\\text{Internet Text}}$$</div>\n\n<p class=\"post-paragraph essay-paragraph\">A four-year-old child has seen <code class=\"math-inline\">$100\\times$</code> more data through the optic nerve than all the text tokens ingested by GPT-4.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Before a toddler speaks their first grammatical sentence, they have already developed a comprehensive <strong>world model</strong>:</p>\n\n<ul class=\"post-list essay-list\"><li><strong>Intuitive Physics</strong>: Knowing that objects fall, liquids pour, and solid barriers cannot be walked through.</li><li><strong>Spatial Continuity & Object Permanence</strong>: Recognizing that an occluded ball still exists behind a screen.</li><li><strong>Cause-and-Effect & Counterfactuals</strong>: Predicting that pushing a glass off a table will cause it to shatter.</li></ul>\n\n<p class=\"post-paragraph essay-paragraph\">LLMs attempt the inverse: mastering surface-level grammar without ever grounding symbols in physical reality.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">03. The Mathematics of Autoregressive Error Compounding</h2>\n\n<p class=\"post-paragraph essay-paragraph\">An autoregressive language model decomposes probability across a sequence of tokens using the chain rule:</p>\n\n<div class=\"math-block\">$$P(w_1, w_2, \\dots, w_T) = \\prod_{t=1}^{T} P(w_t \\mid w_1, \\dots, w_{t-1})$$</div>\n\n<p class=\"post-paragraph essay-paragraph\">At each generation step <code class=\"math-inline\">$t$</code>, the predicted token <code class=\"math-inline\">$\\hat{w}_t$</code> is appended back into the input context as absolute ground truth.</p>\n\n<p class=\"post-paragraph essay-paragraph\">If the probability of producing an error at step <code class=\"math-inline\">$t$</code> is <code class=\"math-inline\">$\\epsilon$</code>, the probability of a completely correct <code class=\"math-inline\">$N$</code>-step logical chain decays exponentially:</p>\n\n<div class=\"math-block\">$$P(\\text{Valid Plan}) = (1 - \\epsilon)^N$$</div>\n\n<pre><code class=\"language-text\">COMPOUNDING DRIFT ACROSS MULTI-STEP REASONING:\nStep 1:   (0.99)Â¹   = 99.0% accuracy\nStep 10:  (0.99)Â¹â�°  = 90.4% accuracy\nStep 50:  (0.99)â�µâ�°  = 60.5% accuracy\nStep 100: (0.99)Â¹â�°â�° = 36.6% accuracy  &lt;â”€â”€ Total logical collapse</code></pre>\n\n<p class=\"post-paragraph essay-paragraph\">Because LLMs have no internal world simulator to evaluate whether intermediate steps are physically plausible, errors accumulate monotonically. This is why LLMs can generate fluid poetry yet fail at simple spatial navigation or multi-step chess puzzles without search trees.</p>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">04. Joint Embedding Predictive Architecture (JEPA)</h2>\n\n<p class=\"post-paragraph essay-paragraph\">To overcome the scaling limits of autoregression, Yann LeCun proposed <strong>JEPA (Joint Embedding Predictive Architecture)</strong>.</p>\n\n<p class=\"post-paragraph essay-paragraph\">Unlike generative models (which try to reconstruct every irrelevant background pixel or word), JEPA predicts in <strong>abstract representation space</strong>.</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart TD\n    subgraph Observed [\"Observed World\"]\n        X[\"Observed State x\"] --> EX[\"Encoder E_x\"]\n        EX --> SX[\"Latent State s_x\"]\n    end\n\n    subgraph Target [\"Target World\"]\n        Y[\"Target State y\"] --> EY[\"Encoder E_y\"]\n        EY --> SY[\"Target Latent sÌ‚_y\"]\n    end\n\n    SX --> P[\"Predictor P\"]\n    A[\"Action / Context a\"] --> P\n    P --> PSY[\"Predicted Latent s_y\"]\n\n    PSY --- LOSS{{\"Loss: D(s_y, sÌ‚_y)\"}}\n    SY --- LOSS\n</pre></div>\n\n<p class=\"post-paragraph essay-paragraph\">Instead of asking: <em>\"What is the exact value of pixel <code class=\"math-inline\">$(x, y)$</code> in frame <code class=\"math-inline\">$t+1$</code>?\"</em>, JEPA asks:</p>\n\n<blockquote class=\"post-quote essay-quote\">_\"What is the high-level semantic vector <code class=\"math-inline\">$\\mathbf{s}<em>y$</code> describing the state of the world after action <code class=\"math-inline\">$\\mathbf{a}$</code>?\"</em></blockquote>\n\n<h3 class=\"post-subheading essay-subheading\">Preventing Representation Collapse via VICReg</h3>\n\n<p class=\"post-paragraph essay-paragraph\">The major mathematical challenge in non-generative self-supervised learning is preventing <strong>representation collapse</strong> (where the encoder maps all inputs to a constant zero vector).</p>\n\n<p class=\"post-paragraph essay-paragraph\">LeCun and his team resolve this via <strong>VICReg (Variance-Invariance-Covariance Regularization)</strong>:</p>\n\n<div class=\"math-block\">$$\\mathcal{L}_{\\text{VICReg}} = \\lambda s(\\mathbf{Z}) + \\mu v(\\mathbf{Z}) + \\nu c(\\mathbf{Z})$$</div>\n\n<ol class=\"post-list essay-list\"><li><strong>Invariance (<code class=\"math-inline\">$s$</code>):</strong> Enforces that representations of identical scenes under different augmentations remain close.</li><li><strong>Variance (<code class=\"math-inline\">$v$</code>):</strong> Forces the variance along each embedding dimension across the batch to remain above a threshold <code class=\"math-inline\">$\\gamma$</code>, preventing collapse.</li><li><strong>Covariance (<code class=\"math-inline\">$c$</code>):</strong> Decorrelates dimensions, maximizing the information capacity of the latent space <code class=\"math-inline\">$\\mathbb{R}^D$</code>.</li></ol>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">05. The 6-Module Architecture for Autonomous Machine Intelligence</h2>\n\n<p class=\"post-paragraph essay-paragraph\">LeCun's blueprint for autonomous agents replaces single-prompt LLM wrappers with a modular cognitive system:</p>\n\n<div class=\"mermaid-diagram-box\"><pre class=\"mermaid\">\nflowchart TD\n    P[\"PERCEPTION<br/><i>Sensory Encoders</i>\"] --> WM[\"WORLD MODEL<br/><i>JEPA Latent Simulator</i>\"]\n    WM <--> A[\"ACTOR / PLANNER<br/><i>Trajectory Optimization</i>\"]\n    WM --> C[\"CRITIC / INTRINSIC<br/><i>Energy Cost Evaluation</i>\"]\n    WM --> M[\"MEMORY SYSTEM<br/><i>HNSW Vector Index</i>\"]\n</pre></div>\n\n<ol class=\"post-list essay-list\"><li><strong>Perception Module:</strong> Encoders extracting abstract representations from continuous video, audio, and proprioception.</li><li><strong>World Model (JEPA):</strong> Predicts future world states conditioned on hypothetical candidate actions.</li><li><strong>Memory Module:</strong> Associative vector memory storing episodic experiences and world states.</li><li><strong>Intrinsic Cost Module (Critic):</strong> Evaluates whether a predicted trajectory satisfies internal drives (safety, goal completion, energy efficiency).</li><li><strong>Configurator:</strong> Allocates compute and dynamically reconfigures sub-modules for current goals.</li><li><strong>Actor:</strong> Uses gradient-based optimization or model-predictive control (MPC) to select the action sequence that minimizes the Critic's cost.</li></ol>\n\n<hr class=\"post-divider essay-divider\" />\n\n<h2 class=\"post-section-kicker essay-section-kicker\">06. The Path Forward: Video Over Text</h2>\n\n<p class=\"post-paragraph essay-paragraph\">The thesis is clear:</p>\n\n<ol class=\"post-list essay-list\"><li><strong>Next-Token Prediction is a Local Optimum:</strong> It yields extraordinary language interfaces, but cannot reason, plan, or understand cause-and-effect.</li><li><strong>Self-Supervised Video Learning is the Path:</strong> Ingesting continuous video through V-JEPA bridges the <code class=\"math-inline\">$10^{14}\\text{ bytes}$</code> bandwidth gap.</li><li><strong>True Intelligence Requires Latent World Models:</strong> Planning through energy-based cost functions in continuous representation space is how machines will finally learn common sense.</li></ol>\n\n<p class=\"post-paragraph essay-paragraph\">True machine intelligence will not be achieved by predicting the next wordâ€”it will be achieved by understanding the physical world.</p>"
  }
];
