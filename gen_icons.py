from PIL import Image, ImageDraw
import math

def make_icon(size, maskable=False):
    scale = size / 512.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bg = "#8B6914"
    # background (rounded rect if maskable, full if not)
    if maskable:
        d.rectangle([0, 0, size, size], fill=bg)
        inset = int(64 * scale)
    else:
        r = int(110 * scale)
        d.rounded_rectangle([0, 0, size, size], radius=r, fill=bg)
        inset = int(40 * scale)
    # crown
    cx = size / 2
    cy = size / 2
    gold = "#FFD700"
    dark = "#F5C518"
    base_w = (size - 2 * inset) * 0.82
    base_left = cx - base_w / 2
    base_right = cx + base_w / 2
    base_bottom = cy + base_w * 0.32
    base_top = cy - base_w * 0.18
    tip_y = cy - base_w * 0.55
    # band
    band_h = base_w * 0.22
    d.rectangle([base_left, base_bottom, base_right, base_bottom + band_h], fill=dark)
    # crown spikes (5 points)
    pts = [
        (base_left, base_bottom),
        (base_left + base_w * 0.5, tip_y),
        (cx, base_bottom - base_w * 0.18),
        (base_right - base_w * 0.5, tip_y),
        (base_right, base_bottom),
    ]
    d.polygon(pts, fill=gold)
    # jewels
    for fx in [base_left + base_w * 0.5, cx, base_right - base_w * 0.5]:
        d.ellipse([fx - base_w*0.06, tip_y - base_w*0.06, fx + base_w*0.06, tip_y + base_w*0.06], fill="#E63946")
    d.ellipse([cx - base_w*0.05, base_bottom - band_h*0.5 - base_w*0.05, cx + base_w*0.05, base_bottom - band_h*0.5 + base_w*0.05], fill="#E63946")
    img.save(f"assets/icons/icon-{size}.png")
    print("saved", size)

make_icon(192)
make_icon(512)
make_icon(512, maskable=True)
print("done")
