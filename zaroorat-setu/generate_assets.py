import os
from PIL import Image, ImageDraw, ImageFont

# Directory paths
base_dir = r"c:\Users\manee\Downloads\UploadFromMobile\zaroorat-setu"
img_dir = os.path.join(base_dir, "assets", "images")
os.makedirs(img_dir, exist_ok=True)

# 1. Generate clean SVG Logo
svg_logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="hard-shadow" x="0" y="0" width="120%" height="120%" filterUnits="userSpaceOnUse">
      <feOffset dx="16" dy="16" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.078   0 0 0 0 0.063   0 0 0 0 0.122  0 0 0 1 0" />
      <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
    </filter>
  </defs>

  <!-- Hard Offset Shadow -->
  <rect x="46" y="46" width="420" height="420" rx="84" fill="#14101F" />

  <!-- App Icon Base Lime Container -->
  <rect x="30" y="30" width="420" height="420" rx="84" fill="#C6F432" stroke="#14101F" stroke-width="18" />

  <!-- Bridge Pillars / Foundations (Violet #6C3BFF) -->
  <rect x="80" y="270" width="48" height="110" rx="14" fill="#6C3BFF" stroke="#14101F" stroke-width="14" />
  <rect x="352" y="270" width="48" height="110" rx="14" fill="#6C3BFF" stroke="#14101F" stroke-width="14" />

  <!-- Bridge Arch (Setu) Violet #6C3BFF -->
  <path d="M 80 320 C 110 160, 370 160, 400 320 C 350 200, 130 200, 80 320 Z" fill="#6C3BFF" stroke="#14101F" stroke-width="14" stroke-linejoin="round" />

  <!-- Bridge Deck Beam (Coral #FF5C7A) -->
  <rect x="65" y="280" width="350" height="46" rx="16" fill="#FF5C7A" stroke="#14101F" stroke-width="14" />
  
  <!-- Bridge Deck Grip Details -->
  <line x1="120" y1="294" x2="120" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />
  <line x1="160" y1="294" x2="160" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />
  <line x1="200" y1="294" x2="200" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />
  <line x1="240" y1="294" x2="240" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />
  <line x1="280" y1="294" x2="280" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />
  <line x1="320" y1="294" x2="320" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />
  <line x1="360" y1="294" x2="360" y2="312" stroke="#14101F" stroke-width="8" stroke-linecap="round" />

  <!-- Central White Heart Under Arch -->
  <g transform="translate(0, -10)">
    <!-- Heart drop shadow -->
    <path d="M 240 250 C 240 250, 168 190, 168 138 C 168 108, 192 90, 218 90 C 232 90, 240 98, 240 98 C 240 98, 248 90, 262 90 C 288 90, 312 108, 312 138 C 312 190, 240 250, 240 250 Z" fill="#14101F" transform="translate(6, 6)" />
    <!-- White Heart -->
    <path d="M 240 250 C 240 250, 168 190, 168 138 C 168 108, 192 90, 218 90 C 232 90, 240 98, 240 98 C 240 98, 248 90, 262 90 C 288 90, 312 108, 312 138 C 312 190, 240 250, 240 250 Z" fill="#FFFFFF" stroke="#14101F" stroke-width="12" stroke-linejoin="round" />
  </g>
</svg>'''

with open(os.path.join(img_dir, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(svg_logo)

with open(os.path.join(img_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_logo)

print("Saved SVG logo and favicon.")

# 2. Render PNG icons (512x512, 192x192, 48x48) using Pillow
def draw_app_icon(size):
    scale = size / 512.0
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Coordinates scaled
    s_off = int(16 * scale)
    x1, y1 = int(30 * scale), int(30 * scale)
    box_w = int(420 * scale)
    rx = int(84 * scale)
    sw = max(2, int(16 * scale))

    # Shadow
    draw.rounded_rectangle([x1 + s_off, y1 + s_off, x1 + box_w + s_off, y1 + box_w + s_off], radius=rx, fill=(20, 16, 31, 255))
    # Lime Base
    draw.rounded_rectangle([x1, y1, x1 + box_w, y1 + box_w], radius=rx, fill=(198, 244, 50, 255), outline=(20, 16, 31, 255), width=sw)

    # Violet Pillars
    p_w, p_h = int(48 * scale), int(110 * scale)
    draw.rounded_rectangle([int(80 * scale), int(270 * scale), int(80 * scale) + p_w, int(270 * scale) + p_h], radius=int(12 * scale), fill=(108, 59, 255, 255), outline=(20, 16, 31, 255), width=max(2, int(12 * scale)))
    draw.rounded_rectangle([int(352 * scale), int(270 * scale), int(352 * scale) + p_w, int(270 * scale) + p_h], radius=int(12 * scale), fill=(108, 59, 255, 255), outline=(20, 16, 31, 255), width=max(2, int(12 * scale)))

    # Violet Bridge Arch
    # Pillow doesn't do complex bezier natively without points, so we can approximate the polygon
    arch_pts = []
    for step in range(30):
        t = step / 29.0
        # Quadratic curve for top of arch
        px = 80 + t * (400 - 80)
        # 160 at top (t=0.5), 320 at sides
        py = 320 - 150 * (4 * t * (1 - t))
        arch_pts.append((int(px * scale), int(py * scale)))
    for step in range(30):
        t = (29 - step) / 29.0
        px = 80 + t * (400 - 80)
        py = 320 - 110 * (4 * t * (1 - t))
        arch_pts.append((int(px * scale), int(py * scale)))
    draw.polygon(arch_pts, fill=(108, 59, 255, 255), outline=(20, 16, 31, 255))

    # Coral Deck
    deck_x1, deck_y1 = int(65 * scale), int(280 * scale)
    deck_x2, deck_y2 = int(415 * scale), int(326 * scale)
    draw.rounded_rectangle([deck_x1, deck_y1, deck_x2, deck_y2], radius=int(14 * scale), fill=(255, 92, 122, 255), outline=(20, 16, 31, 255), width=max(2, int(12 * scale)))

    # Deck details lines
    for lx in [120, 160, 200, 240, 280, 320, 360]:
        draw.line([int(lx * scale), int(294 * scale), int(lx * scale), int(312 * scale)], fill=(20, 16, 31, 255), width=max(1, int(6 * scale)))

    # White Heart under arch (scaled)
    # Heart center approx (240, 160)
    hx, hy = int(240 * scale), int(155 * scale)
    hr = int(45 * scale)
    # Left circle
    draw.ellipse([hx - hr - int(2 * scale), hy - hr, hx + int(2 * scale), hy + hr], fill=(255, 255, 255, 255), outline=(20, 16, 31, 255), width=max(2, int(10 * scale)))
    # Right circle
    draw.ellipse([hx - int(2 * scale), hy - hr, hx + hr + int(2 * scale), hy + hr], fill=(255, 255, 255, 255), outline=(20, 16, 31, 255), width=max(2, int(10 * scale)))
    # Bottom triangle
    draw.polygon([(hx - int(48 * scale), hy + int(10 * scale)), (hx + int(48 * scale), hy + int(10 * scale)), (hx, hy + int(75 * scale))], fill=(255, 255, 255, 255), outline=(20, 16, 31, 255))
    # Re-fill interior white to hide overlap lines
    draw.ellipse([hx - hr + int(4 * scale), hy - hr + int(4 * scale), hx - int(4 * scale), hy + hr - int(4 * scale)], fill=(255, 255, 255, 255))
    draw.ellipse([hx + int(4 * scale), hy - hr + int(4 * scale), hx + hr - int(4 * scale), hy + hr - int(4 * scale)], fill=(255, 255, 255, 255))
    draw.polygon([(hx - int(38 * scale), hy + int(10 * scale)), (hx + int(38 * scale), hy + int(10 * scale)), (hx, hy + int(68 * scale))], fill=(255, 255, 255, 255))

    return im

icon_512 = draw_app_icon(512)
icon_512.save(os.path.join(img_dir, "icon-512.png"))

icon_192 = draw_app_icon(192)
icon_192.save(os.path.join(img_dir, "icon-192.png"))

icon_48 = draw_app_icon(48)
icon_48.save(os.path.join(img_dir, "favicon-48.png"))
icon_48.save(os.path.join(base_dir, "favicon.ico"), format="ICO")

print("Saved PNG icons (512, 192, 48, favicon.ico).")

# 3. Generate Social Preview Image (1200 x 630)
og_img = Image.new("RGB", (1200, 630), (239, 233, 255)) # Lavender background #EFE9FF
draw_og = ImageDraw.Draw(og_img)

# Neo-brutalist border around social card
draw_og.rectangle([20, 20, 1180, 610], outline=(20, 16, 31), width=8)

# Header badge: HackFest 3.0 · Track 06
badge_x, badge_y = 70, 60
draw_og.rounded_rectangle([badge_x + 6, badge_y + 6, badge_x + 360 + 6, badge_y + 46 + 6], radius=24, fill=(20, 16, 31))
draw_og.rounded_rectangle([badge_x, badge_y, badge_x + 360, badge_y + 46], radius=24, fill=(198, 244, 50), outline=(20, 16, 31), width=4)

# Paste app icon on the right
icon_preview = draw_app_icon(360)
og_img.paste(icon_preview, (740, 140), icon_preview)

# Draw decorative cards on bottom
# Card 1: Emergency & Medical
draw_og.rounded_rectangle([76, 476, 366, 556], radius=16, fill=(20, 16, 31))
draw_og.rounded_rectangle([70, 470, 360, 550], radius=16, fill=(255, 255, 255), outline=(20, 16, 31), width=4)
# Card 2: Reusable Borrow & Return
draw_og.rounded_rectangle([396, 476, 686, 556], radius=16, fill=(20, 16, 31))
draw_og.rounded_rectangle([390, 470, 680, 550], radius=16, fill=(198, 244, 50), outline=(20, 16, 31), width=4)

og_img.save(os.path.join(img_dir, "og-preview.png"))
print("Saved og-preview.png (1200x630).")
