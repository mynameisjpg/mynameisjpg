"""
Configuration and Environment Settings for UNTITLED.JPG Builder
"""

import sys
from pathlib import Path

# Fix Windows console encoding for terminal outputs
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Optional Image Processing Library (Pillow)
try:
    from PIL import Image, ImageOps  # type: ignore # noqa: F401
    HAS_PIL = True
except (ImportError, ModuleNotFoundError):
    Image = None  # type: ignore
    ImageOps = None  # type: ignore
    HAS_PIL = False

# Path configurations
# builder/ is a subdirectory, so .parent.parent is the root publication directory
BASE_DIR = Path(__file__).resolve().parent.parent
POSTS_DIR = BASE_DIR / "_posts"
OUTPUT_JSON = BASE_DIR / "posts.json"
OUTPUT_JS = BASE_DIR / "posts.js"
OUTPUT_TAGS_JSON = BASE_DIR / "tags.json"
OUTPUT_TAGS_JS = BASE_DIR / "tags.js"
PILLARS_JSON = BASE_DIR / "pillars.json"
PILLARS_JS = BASE_DIR / "pillars.js"
POSTS_HTML_DIR = BASE_DIR / "posts"
ROOT_DIR = BASE_DIR.parent if (BASE_DIR.parent / "index.html").exists() else BASE_DIR

# Canonical Knowledge Graph Entity Mappings for GEO & Schema.org Grounding
CANONICAL_ENTITIES = {
    "groupe-mu": {"@type": "Organization", "name": "Groupe µ", "sameAs": "https://en.wikipedia.org/wiki/Groupe_%CE%BC"},
    "foucault": {"@type": "Person", "name": "Michel Foucault", "sameAs": "https://en.wikipedia.org/wiki/Michel_Foucault"},
    "borges": {"@type": "Person", "name": "Jorge Luis Borges", "sameAs": "https://en.wikipedia.org/wiki/Jorge_Luis_Borges"},
    "paul-b-preciado": {"@type": "Person", "name": "Paul B. Preciado", "sameAs": "https://en.wikipedia.org/wiki/Paul_B._Preciado"},
    "yann-lecun": {"@type": "Person", "name": "Yann LeCun", "sameAs": "https://en.wikipedia.org/wiki/Yann_LeCun"},
    "alan-turing": {"@type": "Person", "name": "Alan Turing", "sameAs": "https://en.wikipedia.org/wiki/Alan_Turing"},
    "donna-haraway": {"@type": "Person", "name": "Donna Haraway", "sameAs": "https://en.wikipedia.org/wiki/Donna_Haraway"},
    "haraway": {"@type": "Person", "name": "Donna Haraway", "sameAs": "https://en.wikipedia.org/wiki/Donna_Haraway"},
    "byung-chul-han": {"@type": "Person", "name": "Byung-Chul Han", "sameAs": "https://en.wikipedia.org/wiki/Byung-Chul_Han"},
    "bernard-stiegler": {"@type": "Person", "name": "Bernard Stiegler", "sameAs": "https://en.wikipedia.org/wiki/Bernard_Stiegler"},
    "semiotics": {"@type": "Thing", "name": "Visual Semiotics", "sameAs": "https://en.wikipedia.org/wiki/Visual_semiotics"},
    "visual-semiotics": {"@type": "Thing", "name": "Visual Semiotics", "sameAs": "https://en.wikipedia.org/wiki/Visual_semiotics"},
    "plastic-signs": {"@type": "Thing", "name": "Plastic Sign (Visual Semiotics)", "sameAs": "https://en.wikipedia.org/wiki/Visual_semiotics"},
    "jepa": {"@type": "Thing", "name": "Joint Embedding Predictive Architecture", "sameAs": "https://en.wikipedia.org/wiki/Yann_LeCun#World_models_and_JEPA"},
    "world-models": {"@type": "Thing", "name": "World Models (Artificial Intelligence)", "sameAs": "https://en.wikipedia.org/wiki/World_model_(artificial_intelligence)"},
    "embeddings": {"@type": "Thing", "name": "Word Embedding", "sameAs": "https://en.wikipedia.org/wiki/Word_embedding"},
    "vector-databases": {"@type": "Thing", "name": "Vector Database", "sameAs": "https://en.wikipedia.org/wiki/Vector_database"},
    "generative-ai": {"@type": "Thing", "name": "Generative Artificial Intelligence", "sameAs": "https://en.wikipedia.org/wiki/Generative_artificial_intelligence"},
    "psychophysics": {"@type": "Thing", "name": "Psychophysics", "sameAs": "https://en.wikipedia.org/wiki/Psychophysics"},
    "visual-perception": {"@type": "Thing", "name": "Visual Perception", "sameAs": "https://en.wikipedia.org/wiki/Visual_perception"},
    "gestalt": {"@type": "Thing", "name": "Gestalt Psychology", "sameAs": "https://en.wikipedia.org/wiki/Gestalt_psychology"},
    "biopolitics": {"@type": "Thing", "name": "Biopolitics", "sameAs": "https://en.wikipedia.org/wiki/Biopolitics"},
    "knowledge-graphs": {"@type": "Thing", "name": "Knowledge Graph", "sameAs": "https://en.wikipedia.org/wiki/Knowledge_graph"},
    "tree-sitter": {"@type": "SoftwareApplication", "name": "Tree-sitter", "sameAs": "https://en.wikipedia.org/wiki/Tree-sitter_(parser)"},
    "shanzhai": {"@type": "Thing", "name": "Shanzhai", "sameAs": "https://en.wikipedia.org/wiki/Shanzhai"},
    "cyborg-manifesto": {"@type": "CreativeWork", "name": "A Cyborg Manifesto", "sameAs": "https://en.wikipedia.org/wiki/A_Cyborg_Manifesto"},
    "llms": {"@type": "Thing", "name": "Large Language Model", "sameAs": "https://en.wikipedia.org/wiki/Large_language_model"},
    "imitation-game": {"@type": "Thing", "name": "Turing Test", "sameAs": "https://en.wikipedia.org/wiki/Turing_test"},
    "tamagotchi-effect": {"@type": "Thing", "name": "Tamagotchi Effect", "sameAs": "https://en.wikipedia.org/wiki/Tamagotchi_effect"},
    "kindchenschema": {"@type": "Thing", "name": "Kindchenschema (Baby Schema)", "sameAs": "https://en.wikipedia.org/wiki/Cuteness#Kindchenschema"}
}
