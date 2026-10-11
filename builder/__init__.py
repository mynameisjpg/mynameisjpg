"""
UNTITLED.JPG — Modular Static Site & Taxonomy Builder Subsystem
"""

from .config import (
    BASE_DIR,
    POSTS_DIR,
    OUTPUT_JSON,
    OUTPUT_JS,
    OUTPUT_TAGS_JSON,
    OUTPUT_TAGS_JS,
    PILLARS_JSON,
    PILLARS_JS,
    POSTS_HTML_DIR,
    ROOT_DIR,
    HAS_PIL,
    CANONICAL_ENTITIES,
)

from .taxonomy import (
    load_taxonomy_data,
    load_pillars_data,
    sync_pillars_js,
    match_canonical_pillar,
    match_canonical_subtopic,
)

from .images import (
    get_image_dimensions,
    generate_thumbnail,
)

from .parser import (
    slugify,
    parse_yaml_frontmatter,
    format_inline_markdown,
    clean_and_convert_markdown,
)

from .tags import (
    compile_tags_database,
)

from .html_page import (
    resolve_post_entities,
    generate_post_html_files,
)

from .sitemap import (
    generate_sitemap,
)

__all__ = [
    "BASE_DIR",
    "POSTS_DIR",
    "OUTPUT_JSON",
    "OUTPUT_JS",
    "OUTPUT_TAGS_JSON",
    "OUTPUT_TAGS_JS",
    "PILLARS_JSON",
    "PILLARS_JS",
    "POSTS_HTML_DIR",
    "ROOT_DIR",
    "HAS_PIL",
    "CANONICAL_ENTITIES",
    "load_taxonomy_data",
    "load_pillars_data",
    "sync_pillars_js",
    "match_canonical_pillar",
    "match_canonical_subtopic",
    "get_image_dimensions",
    "generate_thumbnail",
    "slugify",
    "parse_yaml_frontmatter",
    "format_inline_markdown",
    "clean_and_convert_markdown",
    "compile_tags_database",
    "resolve_post_entities",
    "generate_post_html_files",
    "generate_sitemap",
]
