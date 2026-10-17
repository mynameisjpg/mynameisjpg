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
      "description": "Artificial intelligence, machine learning models, neural architectures, and synthetic cognition."
    },
    {
      "id": "design",
      "name": "Design",
      "slug": "design",
      "order": 2,
      "description": "Interface design, visual architecture, usability heuristics, product systems, and aesthetic mechanics."
    },
    {
      "id": "philosophy",
      "name": "Philosophy",
      "slug": "philosophy",
      "order": 3,
      "description": "Epistemology, critical theory, ontology, biopolitics, and conceptual frameworks interrogating tech."
    },
    {
      "id": "perception",
      "name": "Perception",
      "slug": "perception",
      "order": 4,
      "description": "Biological sensory mechanics, psychophysics, predictive processing, and synthetic machine sight."
    },
    {
      "id": "psychology",
      "name": "Psychology",
      "slug": "psychology",
      "order": 5,
      "description": "Cognitive biases, Gestalt pattern completion, attentional bottlenecks, and behavioral product hooks."
    },
    {
      "id": "tech",
      "name": "Tech",
      "slug": "tech",
      "order": 6,
      "description": "Technological infrastructures, software frameworks, code architectures, and digital systems."
    },
    {
      "id": "vision",
      "name": "Vision",
      "slug": "vision",
      "order": 7,
      "description": "Human ocular mechanics, computer vision, foveal resolution, optical illusions, and visual rendering."
    },
    {
      "id": "semiotics",
      "name": "Semiotics",
      "slug": "semiotics",
      "order": 8,
      "description": "Signs, symbols, iconicity, plastic signs (Groupe µ), linguistic tokenization, and visual rhetoric."
    },
    {
      "id": "tools",
      "name": "Tools",
      "slug": "tools",
      "order": 9,
      "description": "Developer utilities, benchmarking toolkits, evaluation frameworks, and pragmatic workflow instrumentation."
    },
    {
      "id": "analysis",
      "name": "Analysis",
      "slug": "analysis",
      "order": 10,
      "description": "Forensic deconstruction, empirical evaluation, benchmark metrics, and theoretical examination."
    },
    {
      "id": "data",
      "name": "Data",
      "slug": "data",
      "order": 11,
      "description": "Training datasets, high-dimensional vector spaces, empirical evidence, and data ecology."
    },
    {
      "id": "branding",
      "name": "Branding",
      "slug": "branding",
      "order": 12,
      "description": "Brand identity systems, corporate mascot psychology, cute AI interfaces, and visual positioning."
    },
    {
      "id": "graphics",
      "name": "Graphics",
      "slug": "graphics",
      "order": 13,
      "description": "Scientific figures, diagrams, data visualization, digital raster and vector representation."
    },
    {
      "id": "art",
      "name": "Art",
      "slug": "art",
      "order": 14,
      "description": "Digital aesthetics, post-ironic visual culture, generative image creation, and media archaeology."
    }
  ],
  "pillars": [
    {
      "id": "ai-perception",
      "code": "1",
      "slug": "ai-perception",
      "title": "AI perception & representation",
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
      "description": "How AI is perceived and how machine vision reshapes visual culture, and how synthetic media alters human representation and societal consensus."
    },
    {
      "id": "visual-perception",
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
      "description": "Examining how the human visual system constructs reality from sensory signals -exploring the physiological mechanics of sight, optical paradoxes, Gestalt organization, and cognitive biases."
    },
    {
      "id": "language-llms",
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
      "description": "Exploring the boundaries of machine cognition and symbolic reasoning -analyzing how language models process meaning, how agentic systems operate, and where artificial intelligence diverges from human thought."
    },
    {
      "id": "philosophy-image",
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
      "description": "Analyzing the epistemology of seeing in the digital era -questioning how photographs, simulations, and algorithmic interfaces mediate power, cultural memory, and our understanding of truth."
    },
    {
      "id": "philosophy-critical-theory",
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
      "description": "Engaging foundational philosophical frameworks to deconstruct contemporary technology -tracing the intersections of power, language, embodiment, and ideology in technical systems."
    },
    {
      "id": "art-worth-sharing",
      "code": "6",
      "slug": "art-worth-sharing",
      "title": "Art worth sharing",
      "short_title": "Art Sharing",
      "foundations": [
        "art",
        "perception",
        "design"
      ],
      "description": "Curated artistic creations, expansive soundscapes, avant-garde audiovisual experiences, and aesthetic artifacts."
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

