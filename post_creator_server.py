#!/usr/bin/env python3
"""
UNTITLED.JPG — Post Creator Backend & Synchronization Server
Provides local REST API endpoints to load, create, edit, draft, publish, and delete dispatches in `_posts/`.
Auto-triggers `sync_posts.py` on save/publish to update `posts.json` & `posts.js` instantly.

Usage:
    python post_creator_server.py [port]  (default port: 8001)
"""

import os
import sys
import re
import json
import subprocess
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Ensure Windows console encoding is UTF-8
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
POSTS_DIR = BASE_DIR / "_posts"

def parse_frontmatter(file_path):
    """Parse YAML frontmatter and markdown body from file."""
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        return None, f"Error reading file: {e}"

    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
    if not match:
        return {}, content

    yaml_text = match.group(1)
    body_text = match.group(2)

    metadata = {}
    lines = yaml_text.splitlines()
    current_key = None
    sub_object_key = None

    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        # Sub-object indentation (e.g. topic:\n  pillar: ...)
        indent_match = re.match(r"^\s{2,4}([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if indent_match and current_key in ["topic", "image"]:
            sub_key = indent_match.group(1)
            sub_val = indent_match.group(2).strip().strip('"\'')
            if current_key not in metadata or not isinstance(metadata[current_key], dict):
                metadata[current_key] = {}
            if sub_val.lower() == "true":
                metadata[current_key][sub_key] = True
            elif sub_val.lower() == "false":
                metadata[current_key][sub_key] = False
            else:
                metadata[current_key][sub_key] = sub_val
            continue

        kv_match = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if kv_match and not line.startswith(" ") and not line.startswith("\t"):
            key = kv_match.group(1)
            val = kv_match.group(2).strip().strip('"\'')
            current_key = key

            if val == "":
                metadata[key] = []
            elif val.lower() == "true":
                metadata[key] = True
            elif val.lower() == "false":
                metadata[key] = False
            else:
                metadata[key] = val
        elif line.startswith("  - ") or line.startswith("- "):
            item = stripped.lstrip("- ").strip('"\'')
            if current_key:
                if not isinstance(metadata.get(current_key), list):
                    metadata[current_key] = []
                metadata[current_key].append(item)

    return metadata, body_text

def dump_yaml_frontmatter(metadata, body):
    """Serialize dictionary metadata and markdown content into frontmatter format."""
    lines = ["---"]
    lines.append("# UNTITLED.JPG DISPATCH METADATA")

    for key, val in metadata.items():
        if val is None or val == "":
            continue
        if isinstance(val, bool):
            lines.append(f"{key}: {str(val).lower()}")
        elif isinstance(val, int) or isinstance(val, float):
            lines.append(f"{key}: {val}")
        elif isinstance(val, str):
            # Escape quotes if necessary
            if ":" in val or "#" in val or "\n" in val:
                lines.append(f'{key}: "{val}"')
            else:
                lines.append(f'{key}: "{val}"')
        elif isinstance(val, list):
            lines.append(f"{key}:")
            for item in val:
                if isinstance(item, dict):
                    lines.append("  -")
                    for k, v in item.items():
                        lines.append(f'    {k}: "{v}"')
                else:
                    lines.append(f'  - "{item}"')
        elif isinstance(val, dict):
            lines.append(f"{key}:")
            for k, v in val.items():
                if isinstance(v, bool):
                    lines.append(f"  {k}: {str(v).lower()}")
                else:
                    lines.append(f'  {k}: "{v}"')

    lines.append("---")
    lines.append("")
    lines.append(body.strip())
    lines.append("")
    return "\n".join(lines)

def run_sync_posts():
    """Trigger sync_posts.py to update posts.json and posts.js."""
    try:
        sync_script = BASE_DIR / "sync_posts.py"
        if sync_script.exists():
            subprocess.run([sys.executable, str(sync_script)], cwd=str(BASE_DIR), check=True)
            return True, "Posts compiled successfully."
    except Exception as e:
        return False, str(e)
    return False, "sync_posts.py not found."


class PostCreatorRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/posts":
            self.handle_list_posts()
        elif path == "/api/post":
            filename = query.get("file", [""])[0]
            self.handle_get_post(filename)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/save":
            self.handle_save_post()
        elif path == "/api/delete":
            self.handle_delete_post()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_list_posts(self):
        """List all markdown posts in _posts/ with metadata summary."""
        posts = []
        if POSTS_DIR.exists():
            for f in sorted(POSTS_DIR.glob("*.md"), reverse=True):
                if f.name.startswith("TEMPLATE"):
                    continue
                meta, body = parse_frontmatter(f)
                posts.append({
                    "filename": f.name,
                    "title": meta.get("title", f.name),
                    "format": meta.get("format", "essay"),
                    "date": str(meta.get("date", "")),
                    "status": meta.get("status", "published"),
                    "featured": meta.get("featured", False),
                    "sys_id": meta.get("sys_id", "")
                })

        self.send_json_response({"success": True, "posts": posts})

    def handle_get_post(self, filename):
        """Load single post file details."""
        if not filename:
            self.send_json_response({"success": False, "error": "Filename parameter missing"}, status=400)
            return

        file_path = POSTS_DIR / filename
        if not file_path.exists():
            self.send_json_response({"success": False, "error": f"File {filename} not found"}, status=404)
            return

        meta, body = parse_frontmatter(file_path)
        self.send_json_response({
            "success": True,
            "filename": filename,
            "frontmatter": meta,
            "content": body
        })

    def handle_save_post(self):
        """Save frontmatter and body into markdown file in _posts/ and re-sync."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(content_length)
            payload = json.loads(raw_body.decode('utf-8'))

            filename = payload.get("filename", "").strip()
            metadata = payload.get("metadata", {})
            content = payload.get("content", "")

            if not filename:
                # Auto generate filename from date and title slug
                date_str = metadata.get("date", "")[:10] or "2026-09-26"
                title_slug = re.sub(r"[^a-z0-9]+", "-", metadata.get("title", "untitled").lower()).strip("-")
                filename = f"{date_str}-{title_slug}.md"

            if not filename.endswith(".md"):
                filename += ".md"

            # Auto-assign sys_id if missing
            if not metadata.get("sys_id"):
                date_compact = re.sub(r"\D", "", metadata.get("date", ""))[:6] or "260926"
                fmt_code = (metadata.get("format", "ESSAY")[:3]).upper()
                metadata["sys_id"] = f"SYS_{date_compact}_{fmt_code}"

            full_file_content = dump_yaml_frontmatter(metadata, content)

            POSTS_DIR.mkdir(parents=True, exist_ok=True)
            target_file = POSTS_DIR / filename
            target_file.write_text(full_file_content, encoding="utf-8")

            # Run sync_posts.py
            synced, sync_msg = run_sync_posts()

            self.send_json_response({
                "success": True,
                "filename": filename,
                "sys_id": metadata.get("sys_id"),
                "status": metadata.get("status"),
                "message": f"Dispatch saved to _posts/{filename}. Feed synchronized successfully!"
            })
        except Exception as e:
            self.send_json_response({"success": False, "error": str(e)}, status=500)

    def handle_delete_post(self):
        """Delete a dispatch file from _posts/."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(content_length)
            payload = json.loads(raw_body.decode('utf-8'))
            filename = payload.get("filename", "")

            if not filename or filename.startswith("TEMPLATE"):
                self.send_json_response({"success": False, "error": "Invalid filename"}, status=400)
                return

            target_file = POSTS_DIR / filename
            if target_file.exists():
                target_file.unlink()
                run_sync_posts()
                self.send_json_response({"success": True, "message": f"File {filename} deleted."})
            else:
                self.send_json_response({"success": False, "error": "File not found"}, status=404)
        except Exception as e:
            self.send_json_response({"success": False, "error": str(e)}, status=500)

    def send_json_response(self, data, status=200):
        body = json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def main():
    port = 8001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    server_address = ('', port)
    httpd = HTTPServer(server_address, PostCreatorRequestHandler)
    print(f"==========================================================================")
    print(f" UNTITLED.JPG — DISPATCH CREATOR & ADMIN SERVER")
    print(f" Serving live editor at: http://localhost:{port}/post-creator.html")
    print(f" Standard site live at:  http://localhost:{port}/index.html")
    print(f"==========================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[STOPPED] Server shutting down gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    main()
