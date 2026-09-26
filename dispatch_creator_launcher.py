#!/usr/bin/env python3
"""
UNTITLED.JPG — DISPATCH CREATOR DESKTOP LAUNCHER
Launches local background admin server and opens Post Creator Studio as a standalone desktop application window.
"""

import os
import sys
import time
import subprocess
import threading
import webbrowser
from pathlib import Path
from http.server import HTTPServer

# Import backend request handler
from post_creator_server import PostCreatorRequestHandler, BASE_DIR

PORT = 8001

def start_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, PostCreatorRequestHandler)
    httpd.serve_forever()

def open_desktop_app():
    url = f"http://localhost:{PORT}/post-creator.html"
    time.sleep(0.5)

    # Try opening in MS Edge App Mode or Chrome App Mode for native desktop window look
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    ]

    launched = False
    for path in edge_paths + chrome_paths:
        if os.path.exists(path):
            try:
                subprocess.Popen([path, f"--app={url}", "--name=Untitled Dispatch Creator", "--window-size=1280,850"])
                launched = True
                break
            except Exception:
                pass

    if not launched:
        webbrowser.open(url)

def main():
    # Start server thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    print(f"==========================================================================")
    print(f" UNTITLED.JPG — DISPATCH CREATOR DESKTOP APP")
    print(f" Server active at: http://localhost:{PORT}/post-creator.html")
    print(f"==========================================================================")

    open_desktop_app()

    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        sys.exit(0)

if __name__ == "__main__":
    main()
