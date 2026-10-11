"""
Taxonomy Subsystem for UNTITLED.JPG
Handles foundations, canonical pillars, subtopics, and pillars.js UMD bundle generation.
"""

import json
import shutil
import sys
from pathlib import Path

try:
    from .config import PILLARS_JSON, PILLARS_JS, ROOT_DIR, BASE_DIR
except (ImportError, ValueError):
    # Support direct execution via `python builder/taxonomy.py`
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from config import PILLARS_JSON, PILLARS_JS, ROOT_DIR, BASE_DIR

def load_taxonomy_data():
    """Loads canonical taxonomy (foundations, pillars, subtopics) from pillars.json."""
    if not PILLARS_JSON.exists():
        return [], []
    try:
        with open(PILLARS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data.get("pillars", []), data.get("foundations", [])
            elif isinstance(data, list):
                return data, []
            return [], []
    except Exception as e:
        print(f"  [WARN] Failed to read pillars.json: {e}")
        return [], []

def load_pillars_data():
    """Loads canonical content pillars and subtopics from pillars.json for backward compatibility."""
    pillars, _ = load_taxonomy_data()
    return pillars

def sync_pillars_js(pillars, foundations=None):
    """Generates pillars.js UMD bundle from pillars.json to ensure 100% zero-CORS runtime compatibility."""
    if foundations is None:
        _, foundations = load_taxonomy_data()
    if not pillars and not foundations:
        return
    try:
        lookup_code = """
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
"""
        bundle_data = {
            "foundations": foundations or [],
            "pillars": pillars or []
        }
        js_code = (
            "/** Auto-generated from pillars.json by sync_posts.py */\n"
            "(function (root, factory) {\n"
            "  var data = factory();\n"
            "  if (typeof module === 'object' && module.exports) {\n"
            "    module.exports = data;\n"
            "  }\n"
            "  if (typeof root !== 'undefined') {\n"
            "    root.DYNAMIC_TAXONOMY = data;\n"
            "    root.DYNAMIC_FOUNDATIONS = data.foundations;\n"
            "    root.DYNAMIC_PILLARS = data.pillars;\n"
            "  }\n"
            "  if (typeof window !== 'undefined') {\n"
            "    window.DYNAMIC_TAXONOMY = data;\n"
            "    window.DYNAMIC_FOUNDATIONS = data.foundations;\n"
            "    window.DYNAMIC_PILLARS = data.pillars;\n"
            "  }\n"
            "  if (typeof global !== 'undefined') {\n"
            "    global.DYNAMIC_TAXONOMY = data;\n"
            "    global.DYNAMIC_FOUNDATIONS = data.foundations;\n"
            "    global.DYNAMIC_PILLARS = data.pillars;\n"
            "  }\n"
            "})(typeof self !== 'undefined' ? self : this, function () {\n"
            f"  return {json.dumps(bundle_data, indent=2, ensure_ascii=False)};\n"
            "});\n"
            f"{lookup_code}\n"
        )
        with open(PILLARS_JS, "w", encoding="utf-8") as f:
            f.write(js_code)
        if ROOT_DIR != BASE_DIR:
            shutil.copy2(PILLARS_JSON, ROOT_DIR / "pillars.json")
            shutil.copy2(PILLARS_JS, ROOT_DIR / "pillars.js")
    except Exception as e:
        print(f"  [WARN] Failed to sync pillars.js: {e}")

def match_canonical_pillar(raw_pillar, pillars):
    """Fuzzy matches a raw pillar string from frontmatter against the canonical pillars."""
    if not raw_pillar or not pillars:
        return None
    q = str(raw_pillar).lower().strip().replace("-", " ").replace("_", " ")
    for p in pillars:
        p_id = p["id"].lower().replace("-", " ")
        p_slug = p["slug"].lower().replace("-", " ")
        p_short = p.get("short_title", "").lower()
        p_title = p.get("title", "").lower()
        if p_id == q or p_slug == q or p_short == q or p.get("code") == q or p.get("number") == q:
            return p
        if p_id in q or q in p_id or p_short in q or q in p_short or p_title in q or q in p_title:
            return p
    return None

def match_canonical_subtopic(raw_subtopic, pillars):
    """Fuzzy matches a raw subtopic string against all canonical subtopics."""
    if not raw_subtopic or not pillars:
        return None
    q = str(raw_subtopic).lower().strip().replace("-", " ").replace("_", " ")
    for p in pillars:
        for st in p.get("subtopics", []):
            st_id = st["id"].lower().replace("-", " ")
            st_slug = st["slug"].lower().replace("-", " ")
            st_title = st.get("title", "").lower()
            if st_id == q or st_slug == q or st.get("code") == q:
                return st
            if st_id in q or q in st_id or st_title in q or q in st_title:
                return st
    return None

if __name__ == "__main__":
    pillars, foundations = load_taxonomy_data()
    sync_pillars_js(pillars, foundations)
    print("  [OK] Taxonomy synced from pillars.json to pillars.js successfully.")
