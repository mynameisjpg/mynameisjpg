"""
XML Sitemap Generation Subsystem for UNTITLED.JPG
"""

import re
import shutil
from .config import BASE_DIR, ROOT_DIR

def generate_sitemap(posts):
    """
    Generates an XML sitemap (sitemap.xml) for all core publication pages and dispatches.
    """
    base_url = "https://mynameisjpg.github.io/mynameisjpg"
    static_pages = [
        {"loc": f"{base_url}/index.html", "priority": "1.0", "changefreq": "daily"},
        {"loc": f"{base_url}/about.html", "priority": "0.8", "changefreq": "monthly"},
        {"loc": f"{base_url}/archive.html", "priority": "0.8", "changefreq": "weekly"},
        {"loc": f"{base_url}/gallery.html", "priority": "0.8", "changefreq": "monthly"},
        {"loc": f"{base_url}/network.html", "priority": "0.8", "changefreq": "weekly"},
    ]
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    for page in static_pages:
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{page['loc']}</loc>")
        xml_lines.append(f"    <changefreq>{page['changefreq']}</changefreq>")
        xml_lines.append(f"    <priority>{page['priority']}</priority>")
        xml_lines.append("  </url>")
        
    for p in posts:
        raw_slug = p.get("slug", "")
        clean_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', raw_slug)
        post_url = f"{base_url}/posts/{clean_slug}.html"
        raw_date = p.get("date", "")
        post_date = raw_date.replace(".", "-").replace("/", "-") if raw_date else ""
        
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{post_url}</loc>")
        if post_date:
            xml_lines.append(f"    <lastmod>{post_date}</lastmod>")
        xml_lines.append("    <changefreq>monthly</changefreq>")
        xml_lines.append("    <priority>0.7</priority>")
        xml_lines.append("  </url>")
        
    xml_lines.append("</urlset>")
    
    sitemap_path = BASE_DIR / "sitemap.xml"
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines) + "\n")
        
    if ROOT_DIR != BASE_DIR:
        shutil.copy2(sitemap_path, ROOT_DIR / "sitemap.xml")
        
    print(f"  [OK] Generated sitemap.xml with {len(static_pages) + len(posts)} URLs")
