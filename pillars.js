/** Auto-generated from pillars.json by sync_posts.py */
(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = data;
  }
  if (typeof root !== 'undefined') {
    root.DYNAMIC_TAXONOMY = data;
    root.DYNAMIC_FOUNDATIONS = data.foundations;
    root.DYNAMIC_PILLARS = data.pillars;
  }
  if (typeof window !== 'undefined') {
    window.DYNAMIC_TAXONOMY = data;
    window.DYNAMIC_FOUNDATIONS = data.foundations;
    window.DYNAMIC_PILLARS = data.pillars;
  }
  if (typeof global !== 'undefined') {
    global.DYNAMIC_TAXONOMY = data;
    global.DYNAMIC_FOUNDATIONS = data.foundations;
    global.DYNAMIC_PILLARS = data.pillars;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
  "foundations": [
    {
      "id": "ai",
      "name": "AI",
      "slug": "ai",
      "order": 1,
      "description": "Artificial intelligence, machine learning models, neural architectures, and synthetic cognition.",
      "pillars": [
        "ai-perception",
        "language-llms"
      ]
    },
    {
      "id": "design",
      "name": "Design",
      "slug": "design",
      "order": 2,
      "description": "Interface design, visual architecture, usability heuristics, product systems, and aesthetic mechanics.",
      "pillars": [
        "philosophy-image"
      ]
    },
    {
      "id": "philosophy",
      "name": "Philosophy",
      "slug": "philosophy",
      "order": 3,
      "description": "Epistemology, critical theory, ontology, biopolitics, and conceptual frameworks interrogating tech.",
      "pillars": [
        "philosophy-image",
        "philosophy-critical-theory"
      ]
    },
    {
      "id": "perception",
      "name": "Perception",
      "slug": "perception",
      "order": 4,
      "description": "Biological sensory mechanics, psychophysics, predictive processing, and synthetic machine sight.",
      "pillars": [
        "visual-perception"
      ]
    },
    {
      "id": "psychology",
      "name": "Psychology",
      "slug": "psychology",
      "order": 5,
      "description": "Cognitive biases, Gestalt pattern completion, attentional bottlenecks, and behavioral product hooks.",
      "pillars": [
        "visual-perception",
        "philosophy-image"
      ]
    },
    {
      "id": "tech",
      "name": "Tech",
      "slug": "tech",
      "order": 6,
      "description": "Technological infrastructures, software frameworks, code architectures, and digital systems.",
      "pillars": [
        "ai-perception",
        "language-llms",
        "philosophy-critical-theory"
      ]
    },
    {
      "id": "vision",
      "name": "Vision",
      "slug": "vision",
      "order": 7,
      "description": "Human ocular mechanics, computer vision, foveal resolution, optical illusions, and visual rendering.",
      "pillars": [
        "ai-perception",
        "visual-perception",
        "philosophy-image"
      ]
    },
    {
      "id": "semiotics",
      "name": "Semiotics",
      "slug": "semiotics",
      "order": 8,
      "description": "Signs, symbols, iconicity, plastic signs (Groupe µ), linguistic tokenization, and visual rhetoric.",
      "pillars": [
        "philosophy-image",
        "philosophy-critical-theory"
      ]
    },
    {
      "id": "tools",
      "name": "Tools",
      "slug": "tools",
      "order": 9,
      "description": "Developer utilities, benchmarking toolkits, evaluation frameworks, and pragmatic workflow instrumentation.",
      "pillars": [
        "ai-perception",
        "language-llms"
      ]
    },
    {
      "id": "analysis",
      "name": "Analysis",
      "slug": "analysis",
      "order": 10,
      "description": "Forensic deconstruction, empirical evaluation, benchmark metrics, and theoretical examination.",
      "pillars": [
        "ai-perception",
        "visual-perception",
        "language-llms",
        "philosophy-critical-theory"
      ]
    },
    {
      "id": "data",
      "name": "Data",
      "slug": "data",
      "order": 11,
      "description": "Training datasets, high-dimensional vector spaces, empirical evidence, and data ecology.",
      "pillars": [
        "ai-perception",
        "language-llms",
        "philosophy-critical-theory"
      ]
    },
    {
      "id": "branding",
      "name": "Branding",
      "slug": "branding",
      "order": 12,
      "description": "Brand identity systems, corporate mascot psychology, cute AI interfaces, and visual positioning.",
      "pillars": [
        "philosophy-image"
      ]
    },
    {
      "id": "graphics",
      "name": "Graphics",
      "slug": "graphics",
      "order": 13,
      "description": "Scientific figures, diagrams, data visualization, digital raster and vector representation.",
      "pillars": [
        "ai-perception",
        "philosophy-image"
      ]
    },
    {
      "id": "art",
      "name": "Art",
      "slug": "art",
      "order": 14,
      "description": "Digital aesthetics, post-ironic visual culture, generative image creation, and media archaeology.",
      "pillars": [
        "ai-perception",
        "philosophy-image"
      ]
    }
  ],
  "pillars": [
    {
      "id": "ai-perception",
      "number": "01",
      "code": "1",
      "slug": "ai-perception",
      "title": "AI Perception, Culture & Representation",
      "short_title": "AI Perception",
      "foundations": [
        "ai",
        "vision",
        "tech",
        "art",
        "data",
        "analysis",
        "graphics",
        "tools"
      ],
      "description": "Investigating how computational models interpret and generate visual worlds, how machine vision reshapes visual culture, and how synthetic media alters human representation and societal consensus.",
      "subtopics": [
        {
          "id": "synthetic-statistical-images",
          "code": "1.1",
          "title": "Synthetic and statistical images (\"the mean image\")",
          "slug": "synthetic-statistical-images",
          "description": "Statistical aggregation and average representations in synthetic media generation."
        },
        {
          "id": "latent-spaces-ai-archives",
          "code": "1.2",
          "title": "Latent spaces and AI archives",
          "slug": "latent-spaces-ai-archives",
          "description": "High-dimensional vector topologies and institutional memory in machine learning weights."
        },
        {
          "id": "generative-tech-prompt-engineering",
          "code": "1.3",
          "title": "Generative technologies and prompt engineering",
          "slug": "generative-tech-prompt-engineering",
          "description": "Linguistic conditioning of diffusion networks and generative media tools."
        },
        {
          "id": "computer-vision-vs-human-perception",
          "code": "1.4",
          "title": "Computer vision vs. human perception",
          "slug": "computer-vision-vs-human-perception",
          "description": "Contrast between tensor activations, gradient heatmaps, and embodied human sight."
        },
        {
          "id": "political-economy-synthetic-media",
          "code": "1.5",
          "title": "The political economy of synthetic media and digital labor",
          "slug": "political-economy-synthetic-media",
          "description": "Data exploitation, clickworker infrastructure, and value extraction in model training."
        },
        {
          "id": "societal-algorithmic-biases",
          "code": "1.6",
          "title": "Societal and algorithmic biases",
          "slug": "societal-algorithmic-biases",
          "description": "Structural replication of historical prejudices within automated classification pipelines."
        },
        {
          "id": "synthetic-identity-normative-machines",
          "code": "1.7",
          "title": "Synthetic Identity & Normative Machines",
          "slug": "synthetic-identity-normative-machines",
          "description": "Algorithmic homogenization and surveillance of non-normative subjectivity."
        }
      ]
    },
    {
      "id": "visual-perception",
      "number": "02",
      "code": "2",
      "slug": "visual-perception",
      "title": "Visual Perception & Psychophysics",
      "short_title": "Visual Perception",
      "foundations": [
        "perception",
        "vision",
        "psychology",
        "analysis"
      ],
      "description": "Examining how the human visual system constructs reality from sensory signals—exploring the physiological mechanics of sight, optical paradoxes, Gestalt organization, and cognitive biases.",
      "subtopics": [
        {
          "id": "anatomy-psychophysics-vision",
          "code": "2.1",
          "title": "Anatomy and psychophysics of vision",
          "slug": "anatomy-psychophysics-vision",
          "description": "Retinal physiology, saccadic motion, receptive fields, and foveal constraints."
        },
        {
          "id": "visual-illusions-optical-paradoxes",
          "code": "2.2",
          "title": "Visual illusions and optical paradoxes",
          "slug": "visual-illusions-optical-paradoxes",
          "description": "Perceptual breakdowns revealing the brain's predictive rendering engines."
        },
        {
          "id": "cognitive-visual-biases",
          "code": "2.3",
          "title": "Cognitive and Visual Biases",
          "slug": "cognitive-visual-biases",
          "description": "Top-down perceptual assumptions, confirmation heuristic loops, and change blindness."
        },
        {
          "id": "perceptual-mechanics-gestalt",
          "code": "2.4",
          "title": "Perceptual mechanics and Gestalt",
          "slug": "perceptual-mechanics-gestalt",
          "description": "Principles of closure, continuity, figure-ground segregation, and pattern completion."
        },
        {
          "id": "multisensory-crossmodal-perception",
          "code": "2.5",
          "title": "Multi-sensory integration and cross-modal perception",
          "slug": "multisensory-crossmodal-perception",
          "description": "Synesthetic coupling, audio-visual synchrony, and tactile-visual binding."
        },
        {
          "id": "attention-trained-perception",
          "code": "2.6",
          "title": "Attention and trained perception",
          "slug": "attention-trained-perception",
          "description": "Visual expertise, foveal scanning efficiency, and attentional bottlenecks."
        }
      ]
    },
    {
      "id": "language-llms",
      "number": "03",
      "code": "3",
      "slug": "language-llms",
      "title": "Language, LLMs & Artificial Intelligence",
      "short_title": "Language & LLMs",
      "foundations": [
        "ai",
        "tech",
        "tools",
        "analysis",
        "data"
      ],
      "description": "Exploring the boundaries of machine cognition and symbolic reasoning—analyzing how language models process meaning, how agentic systems operate, and where artificial intelligence diverges from human thought.",
      "subtopics": [
        {
          "id": "llm-architectures-mechanics",
          "code": "3.1",
          "title": "LLM architectures and mechanics",
          "slug": "llm-architectures-mechanics",
          "description": "Transformers, self-attention matrices, tokenization schemes, and autoregression."
        },
        {
          "id": "human-vs-machine-intelligence",
          "code": "3.2",
          "title": "Human vs. machine intelligence and benchmarking",
          "slug": "human-vs-machine-intelligence",
          "description": "Sensory bandwidth paradox, world models, JEPA, and cognitive benchmarks."
        },
        {
          "id": "language-meaning-symbolic-grounding",
          "code": "3.3",
          "title": "Language, meaning and symbolic grounding",
          "slug": "language-meaning-symbolic-grounding",
          "description": "The Chinese Room, semiotic symbol grounding, and statistical mimicry."
        },
        {
          "id": "agentic-systems-human-agency",
          "code": "3.4",
          "title": "Agentic systems and human agency",
          "slug": "agentic-systems-human-agency",
          "description": "Autonomous agents, reinforcement learning from human feedback, and decision autonomy."
        },
        {
          "id": "conversational-voice-ai",
          "code": "3.5",
          "title": "Conversational voice AI and speech processing",
          "slug": "conversational-voice-ai",
          "description": "End-to-end audio neural models, latency psychophysics, and vocal prosody."
        },
        {
          "id": "ai-safety-alignment-eval",
          "code": "3.6",
          "title": "AI safety, alignment and extreme risk evaluation",
          "slug": "ai-safety-alignment-eval",
          "description": "Forensic failure audits, database deletion incidents, and mechanistic interpretability."
        }
      ]
    },
    {
      "id": "philosophy-image",
      "number": "04",
      "code": "4",
      "slug": "philosophy-image",
      "title": "Philosophy of the Image & Visual Culture",
      "short_title": "Philosophy of the Image",
      "foundations": [
        "philosophy",
        "semiotics",
        "design",
        "art",
        "branding",
        "graphics",
        "vision",
        "psychology"
      ],
      "description": "Analyzing the epistemology of seeing in the digital era—questioning how photographs, simulations, and algorithmic interfaces mediate power, cultural memory, and our understanding of truth.",
      "subtopics": [
        {
          "id": "modes-seeing-visual-semiotics",
          "code": "4.1",
          "title": "Modes of seeing and visual semiotics",
          "slug": "modes-seeing-visual-semiotics",
          "description": "Groupe µ, plastic and iconic signs, Flusser's apparatus, and Farocki's operational images."
        },
        {
          "id": "photography-truth-simulation",
          "code": "4.2",
          "title": "Photography, truth and simulation",
          "slug": "photography-truth-simulation",
          "description": "Baudrillard's simulacra, the death of optical reference, and generative camera sensors."
        },
        {
          "id": "epistemology-representation",
          "code": "4.3",
          "title": "Epistemology of representation",
          "slug": "epistemology-representation",
          "description": "Foucault's Las Meninas, Borges' celestial classifications, and high-dimensional spaces."
        },
        {
          "id": "aesthetics-ideology-interface",
          "code": "4.4",
          "title": "Aesthetics as ideology and interface politics",
          "slug": "aesthetics-ideology-interface",
          "description": "Haraway's cyborg interfaces, gendered silicon aesthetics, and cute mascot packaging."
        },
        {
          "id": "media-ecology-psychological-projection",
          "code": "4.5",
          "title": "Media ecology and psychological projection",
          "slug": "media-ecology-psychological-projection",
          "description": "Postman, McLuhan, and the cognitive habits instilled by algorithmic feed formats."
        },
        {
          "id": "archival-impulse-digital-memory",
          "code": "4.6",
          "title": "The archival impulse and digital memory systems",
          "slug": "archival-impulse-digital-memory",
          "description": "Derrida's Archive Fever, digital permanence, and the erosion of cultural amnesia."
        },
        {
          "id": "interface-politics-product-psychology",
          "code": "4.7",
          "title": "Interface politics & product psychology",
          "slug": "interface-politics-product-psychology",
          "description": "Tamagotchi effect, kindchenschema, and deceptive user interface mechanics."
        }
      ]
    },
    {
      "id": "philosophy-critical-theory",
      "number": "05",
      "code": "5",
      "slug": "philosophy-critical-theory",
      "title": "Philosophy & Critical Theory",
      "short_title": "Critical Theory",
      "foundations": [
        "philosophy",
        "tech",
        "analysis",
        "data",
        "semiotics"
      ],
      "description": "Engaging foundational philosophical frameworks to deconstruct contemporary technology—tracing the intersections of power, language, embodiment, and ideology in technical systems.",
      "subtopics": [
        {
          "id": "epistemic-paradigms-foucault",
          "code": "5.1",
          "title": "Epistemic Paradigms & Foucault",
          "slug": "epistemic-paradigms-foucault",
          "description": "Foucault's epistemes, archaeology of knowledge, and modern vector spaces."
        },
        {
          "id": "critical-theory-technology",
          "code": "5.2",
          "title": "Critical Theory of Technology",
          "slug": "critical-theory-technology",
          "description": "Frankfurt School, Feenberg, and technical rationality deconstruction."
        },
        {
          "id": "biopolitics-pharmacopornography",
          "code": "5.3",
          "title": "Biopolitics & Pharmacopornography",
          "slug": "biopolitics-pharmacopornography",
          "description": "Preciado's pharmacopornographic episteme and somatic governance."
        },
        {
          "id": "somatopolitics-latent-space",
          "code": "5.4",
          "title": "Somatopolitics & Latent Space",
          "slug": "somatopolitics-latent-space",
          "description": "The bodily dimension of vector spaces, synthetic genetics, and digital flesh."
        },
        {
          "id": "authenticity-knowledge-data-ecology",
          "code": "5.5",
          "title": "Authenticity, Knowledge Systems & Data Ecology",
          "slug": "authenticity-knowledge-data-ecology",
          "description": "Scientific semiotics, graphical integrity, empirical validation, and multimodal benchmark ecology."
        }
      ]
    }
  ]
};
});

// Helper Functions for lookup across any script (Browser & Node.js)
var _getTaxonomyData = function() {
  var d = { foundations: [], pillars: [] };
  if (typeof window !== 'undefined') {
    if (window.DYNAMIC_FOUNDATIONS) d.foundations = window.DYNAMIC_FOUNDATIONS;
    if (window.DYNAMIC_PILLARS) d.pillars = window.DYNAMIC_PILLARS;
    if (window.DYNAMIC_TAXONOMY) return window.DYNAMIC_TAXONOMY;
  }
  if (typeof self !== 'undefined') {
    if (self.DYNAMIC_FOUNDATIONS) d.foundations = self.DYNAMIC_FOUNDATIONS;
    if (self.DYNAMIC_PILLARS) d.pillars = self.DYNAMIC_PILLARS;
    if (self.DYNAMIC_TAXONOMY) return self.DYNAMIC_TAXONOMY;
  }
  if (typeof global !== 'undefined') {
    if (global.DYNAMIC_FOUNDATIONS) d.foundations = global.DYNAMIC_FOUNDATIONS;
    if (global.DYNAMIC_PILLARS) d.pillars = global.DYNAMIC_PILLARS;
    if (global.DYNAMIC_TAXONOMY) return global.DYNAMIC_TAXONOMY;
  }
  return d;
};

var TaxonomyLookup = {
  getAllFoundations: function () {
    return _getTaxonomyData().foundations || [];
  },
  getFoundation: function (query) {
    if (!query) return null;
    var list = this.getAllFoundations();
    var q = String(query).toLowerCase().trim().replace(/[-_]/g, ' ');
    return list.find(function (f) {
      var fid = (f.id || '').toLowerCase().replace(/[-_]/g, ' ');
      var fslug = (f.slug || '').toLowerCase().replace(/[-_]/g, ' ');
      var fname = (f.name || '').toLowerCase();
      return fid === q ||
             fslug === q ||
             fname === q ||
             fname.includes(q) ||
             q.includes(fid);
    }) || null;
  },
  getAllPillars: function () {
    return _getTaxonomyData().pillars || [];
  },
  getPillar: function (query) {
    if (!query) return null;
    var list = this.getAllPillars();
    var q = String(query).toLowerCase().trim().replace(/[-_]/g, ' ');
    return list.find(function (p) {
      var pid = p.id.toLowerCase().replace(/[-_]/g, ' ');
      var pslug = p.slug.toLowerCase().replace(/[-_]/g, ' ');
      return pid === q ||
             pslug === q ||
             p.code === q ||
             p.number === q ||
             p.title.toLowerCase().includes(q) ||
             (p.short_title && p.short_title.toLowerCase().includes(q)) ||
             q.includes(pid) ||
             q.includes(pslug);
    }) || null;
  },
  getSubtopic: function (query) {
    if (!query) return null;
    var list = this.getAllPillars();
    var q = String(query).toLowerCase().trim().replace(/[-_]/g, ' ');
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var found = (p.subtopics || []).find(function (st) {
        var stid = st.id.toLowerCase().replace(/[-_]/g, ' ');
        var stslug = st.slug.toLowerCase().replace(/[-_]/g, ' ');
        return stid === q ||
               stslug === q ||
               st.code === q ||
               st.title.toLowerCase().includes(q) ||
               q.includes(stid) ||
               q.includes(stslug);
      });
      if (found) return { pillar: p, subtopic: found };
    }
    return null;
  },
  matches: function (post, query) {
    if (!query || query === "all") return true;
    if (!post) return false;
    var q = String(query).toLowerCase().trim().replace(/[-_]/g, ' ');
    var postPillar = String(post.pillar || "").toLowerCase();
    var postPillarId = String(post.pillar_id || "").toLowerCase();
    var postSubtopic = String(post.subtopic || "").toLowerCase();
    var postSubtopicId = String(post.subtopic_id || "").toLowerCase();
    var postCategory = String(post.category || "").toLowerCase();
    var postFoundations = Array.isArray(post.foundations) ? post.foundations.map(function(f) { return String(f).toLowerCase(); }) : [];
    var tags = Array.isArray(post.tags) ? post.tags.map(function(t) { return String(t).toLowerCase(); }).join(" ") : "";

    // 1. Check if query matches a canonical foundation
    var targetFoundation = this.getFoundation(query);
    if (targetFoundation) {
      var fId = targetFoundation.id.toLowerCase();
      var fSlug = targetFoundation.slug.toLowerCase();
      var fName = targetFoundation.name.toLowerCase();
      if (postFoundations.includes(fId) || postFoundations.includes(fSlug) || postFoundations.includes(fName)) return true;
      if (tags.includes(fId) || tags.includes(fSlug)) return true;
      if (targetFoundation.pillars && targetFoundation.pillars.some(function(pilId) {
        return postPillarId === pilId.toLowerCase();
      })) return true;
    }

    // 2. Check if query matches a canonical pillar
    var targetPillar = this.getPillar(query);
    if (targetPillar) {
      var pilId = targetPillar.id.toLowerCase().replace(/[-_]/g, ' ');
      var pilShort = (targetPillar.short_title || "").toLowerCase();
      var pilTitle = targetPillar.title.toLowerCase();
      if (postPillarId === targetPillar.id.toLowerCase()) return true;
      if (postPillar.includes(pilShort) || postPillar.includes(pilId) || pilTitle.includes(postPillar)) return true;
      if (targetPillar.subtopics && targetPillar.subtopics.some(function(st) {
        return postSubtopicId === st.id.toLowerCase() ||
               postSubtopic.includes(st.slug.toLowerCase()) ||
               postSubtopic.includes(st.id.toLowerCase()) ||
               tags.includes(st.id.toLowerCase()) ||
               tags.includes(st.slug.toLowerCase());
      })) return true;
    }

    // 3. Check if query matches a canonical subtopic
    var subMatch = this.getSubtopic(query);
    if (subMatch) {
      var st = subMatch.subtopic;
      if (postSubtopicId === st.id.toLowerCase()) return true;
      if (postSubtopic.includes(st.slug.toLowerCase()) || postSubtopic.includes(st.id.toLowerCase())) return true;
    }

    // 4. Fallback direct substring checks
    if (postPillar.includes(q) || postPillarId.includes(q)) return true;
    if (postSubtopic.includes(q) || postSubtopicId.includes(q)) return true;
    if (postCategory.includes(q)) return true;
    if (tags.includes(q)) return true;

    return false;
  }
};

if (typeof window !== 'undefined') window.TaxonomyLookup = TaxonomyLookup;
if (typeof global !== 'undefined') global.TaxonomyLookup = TaxonomyLookup;

