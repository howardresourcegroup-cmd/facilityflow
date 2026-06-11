#!/usr/bin/env python3
"""
Wrap raw app screenshots in a polished browser-frame mockup for marketing.

Adds a macOS-style window (traffic-light dots + a per-page URL pill), rounds the
corners, and drops a soft shadow on a transparent canvas so the result composites
cleanly on any website background — light or dark.

Usage:
    python3 scripts/frame-screenshots.py [SRC_DIR] [OUT_DIR]

Defaults:
    SRC_DIR = ~/Desktop/roomward-shots
    OUT_DIR = ~/Desktop/roomward-shots/framed

Each PNG named "NN-page.png" gets the URL roomward.app/<page-route>. Override or
extend the route map in URL_MAP below.
"""
import os, sys, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HOME = os.path.expanduser("~")
SRC = sys.argv[1] if len(sys.argv) > 1 else f"{HOME}/Desktop/roomward-shots"
OUT = sys.argv[2] if len(sys.argv) > 2 else f"{SRC}/framed"

# filename slug (after the NN- prefix) -> URL path shown in the address bar
URL_MAP = {
    "property-map": "property",
    "dashboard":    "",
    "work-orders":  "work-orders",
    "housekeeping": "housekeeping",
    "front-desk":   "front-desk",
    "team-chat":    "messages",
    "technicians":  "technicians",
    "assets":       "assets",
    "reports":      "reports",
    "buildings":    "buildings",
}

CHROME_BG   = (24, 24, 32, 255)     # browser title bar
PILL_BG     = (44, 44, 56, 255)     # URL pill
PILL_TEXT   = (150, 152, 165, 255)
DOT_RED     = (255, 95, 87, 255)
DOT_YELLOW  = (254, 188, 46, 255)
DOT_GREEN   = (40, 200, 64, 255)


def load_font(size):
    for path in ("/System/Library/Fonts/Supplemental/Arial.ttf",
                 "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius, fill=255)
    return m


def frame(path, out_path):
    shot = Image.open(path).convert("RGBA")
    w, h = shot.size

    chrome_h = int(w * 0.030)            # title bar height
    radius   = int(w * 0.014)            # window corner radius
    win_w, win_h = w, h + chrome_h

    # ── Build the window (chrome bar + screenshot) ──
    win = Image.new("RGBA", (win_w, win_h), (0, 0, 0, 0))
    ImageDraw.Draw(win).rectangle([0, 0, win_w, chrome_h], fill=CHROME_BG)
    win.paste(shot, (0, chrome_h))

    d = ImageDraw.Draw(win)
    # traffic-light dots
    r = int(chrome_h * 0.17)
    cy = chrome_h // 2
    x = int(chrome_h * 0.9)
    gap = int(r * 3.2)
    for color in (DOT_RED, DOT_YELLOW, DOT_GREEN):
        d.ellipse([x - r, cy - r, x + r, cy + r], fill=color)
        x += gap

    # URL pill (centered)
    slug = os.path.splitext(os.path.basename(path))[0].split("-", 1)[-1]
    route = URL_MAP.get(slug, "")
    url = "roomward.app" + (f"/{route}" if route else "")
    font = load_font(int(chrome_h * 0.34))
    tw = d.textlength(url, font=font)
    pill_w = int(max(tw + chrome_h * 1.2, win_w * 0.28))
    pill_h = int(chrome_h * 0.56)
    px = (win_w - pill_w) // 2
    py = (chrome_h - pill_h) // 2
    d.rounded_rectangle([px, py, px + pill_w, py + pill_h], pill_h // 2, fill=PILL_BG)
    d.text((px + (pill_w - tw) / 2, cy), url, font=font, fill=PILL_TEXT, anchor="lm")

    # round the window corners
    win.putalpha(rounded_mask((win_w, win_h), radius))

    # ── Canvas with soft drop shadow on transparent background ──
    pad = int(w * 0.055)
    cw, ch = win_w + pad * 2, win_h + pad * 2
    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))

    shadow = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    drop = int(pad * 0.35)
    sd.rounded_rectangle([pad, pad + drop, pad + win_w, pad + win_h + drop],
                         radius, fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(pad * 0.45)))

    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(win, (pad, pad), win)
    canvas.save(out_path)
    return canvas.size


def main():
    os.makedirs(OUT, exist_ok=True)
    files = sorted(f for f in glob.glob(f"{SRC}/*.png") if os.path.dirname(f) != OUT.rstrip("/"))
    if not files:
        print(f"No PNGs in {SRC}"); return
    for f in files:
        out = os.path.join(OUT, os.path.basename(f))
        size = frame(f, out)
        print(f"{os.path.basename(f):22s} -> framed {size[0]}x{size[1]}")
    print(f"\n{len(files)} framed mockups in {OUT}")


if __name__ == "__main__":
    main()
