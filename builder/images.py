"""
Image Optimization & Dimension Inspector Subsystem for UNTITLED.JPG
"""

import struct
from .config import BASE_DIR, ROOT_DIR, HAS_PIL, Image, ImageOps

def get_image_dimensions(image_rel_or_path):
    """
    Reads actual pixel dimensions (width, height) directly from PNG, JPEG, or WebP headers
    without external dependencies. Falls back to (1200, 630) if missing or unreadable.
    """
    if not image_rel_or_path:
        return 1200, 630
    
    clean_path = str(image_rel_or_path).lstrip("/").lstrip("./")
    target_path = BASE_DIR / clean_path
    if not target_path.exists():
        target_path = ROOT_DIR / clean_path
    if not target_path.exists():
        return 1200, 630

    try:
        with open(target_path, "rb") as f:
            data = f.read(65536)  # Read first 64KB
        size = len(data)
        
        # 1. PNG
        if size >= 24 and data[:8] == b'\x89PNG\r\n\x1a\n' and data[12:16] == b'IHDR':
            w, h = struct.unpack('>LL', data[16:24])
            return int(w), int(h)
            
        # 2. JPEG
        if size >= 2 and data[:2] == b'\xff\xd8':
            idx = 2
            while idx < size - 8:
                if data[idx] != 0xff:
                    idx += 1
                    continue
                marker = data[idx+1]
                # SOF markers with dimensions
                if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                    h, w = struct.unpack('>HH', data[idx+5:idx+9])
                    return int(w), int(h)
                if idx + 4 > size:
                    break
                length = struct.unpack('>H', data[idx+2:idx+4])[0]
                idx += 2 + length
                
        # 3. WebP
        if size >= 30 and data[:4] == b'RIFF' and data[8:12] == b'WEBP':
            if data[12:16] == b'VP8 ':
                w, h = struct.unpack('<HH', data[26:30])
                return int(w & 0x3fff), int(h & 0x3fff)
            elif data[12:16] == b'VP8X':
                w = struct.unpack('<I', data[24:27] + b'\x00')[0] + 1
                h = struct.unpack('<I', data[27:30] + b'\x00')[0] + 1
                return int(w), int(h)
    except Exception:
        pass
        
    return 1200, 630

def generate_thumbnail(image_rel_or_path, max_width=640, quality=82):
    """
    Generates an optimized downscaled WebP thumbnail in assets/images/thumbnails/.
    Preserves aspect ratio, resamples with LANCZOS, and converts color profiles safely.
    Skips generation if thumbnail is already newer than source image.
    Returns relative web path (e.g. 'assets/images/thumbnails/telebodies.webp').
    """
    if not image_rel_or_path:
        return ""
        
    clean_path = str(image_rel_or_path).lstrip("/").lstrip("./")
    target_path = BASE_DIR / clean_path
    if not target_path.exists():
        target_path = ROOT_DIR / clean_path
    if not target_path.exists() or target_path.is_dir():
        return clean_path

    # Only process standard raster image extensions
    valid_exts = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
    if target_path.suffix.lower() not in valid_exts:
        return clean_path

    thumb_dir = BASE_DIR / "assets" / "images" / "thumbnails"
    thumb_dir.mkdir(parents=True, exist_ok=True)
    
    thumb_filename = f"{target_path.stem}.webp"
    thumb_path = thumb_dir / thumb_filename
    thumb_rel_path = f"assets/images/thumbnails/{thumb_filename}"

    # Cache check: if thumb exists and is newer than source, skip regeneration
    try:
        if thumb_path.exists() and thumb_path.stat().st_mtime >= target_path.stat().st_mtime:
            return thumb_rel_path
    except Exception:
        pass

    if not HAS_PIL or Image is None or ImageOps is None:
        return clean_path

    try:
        with Image.open(target_path) as img:  # type: ignore
            img = ImageOps.exif_transpose(img)  # type: ignore
            
            orig_w, orig_h = img.size
            if orig_w <= max_width:
                new_w, new_h = orig_w, orig_h
            else:
                scale = max_width / float(orig_w)
                new_w = int(max_width)
                new_h = int(orig_h * scale)
                img = img.resize((new_w, new_h), resample=Image.Resampling.LANCZOS)

            # Ensure compatible mode for WebP
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")
            elif img.mode != "RGB":
                img = img.convert("RGB")

            img.save(thumb_path, "WEBP", quality=quality, method=6)
            print(f"    [THUMB] Generated: {thumb_filename} ({orig_w}x{orig_h} -> {new_w}x{new_h})")
            return thumb_rel_path
    except Exception as e:
        print(f"    [WARN] Thumbnail generation fallback for {target_path.name}: {e}")
        return clean_path
