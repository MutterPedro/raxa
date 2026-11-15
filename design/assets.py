# raxa — brand asset generator (source of truth: design/logo-final.html)
#
# Emits the final SVGs under public/ and the raster-ready SVGs under design/src/;
# PNG rasterization is done by design/rasterize.mjs (Chromium), which reads these.
#
# Master geometry (grid 32): corners r 4.6 at (8,8)(24,8)(8,24)(24,24); center r 5.4
# at (16,16). Micro (<=19px): corners r 4, center r 6. Tile: mark at 76% over #C2410C.
# Wordmark: Plus Jakarta Sans 800 (instance of the self-hosted variable font),
# tracking -0.05em, the x-cell is a 0.6em square sitting on the baseline.
#
# Usage: npm run assets:svg   (via uv; equivalently `uv run --with fonttools,brotli design/assets.py`)
import pathlib

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"
SRC = ROOT / "design" / "src"
FONT = PUBLIC / "fonts" / "plus-jakarta-sans-latin-normal-var.woff2"

CREAM, DARK = "#FAF6F0", "#16120E"
INK = "#1C1410"  # warm ink of the light context (same as the approved sheet)
C2410C, EA580C, F97316, FDBA74 = "#C2410C", "#EA580C", "#F97316", "#FDBA74"

MASTER = dict(r_c=4.6, r_0=5.4)  # master mark
MICRO = dict(r_c=4, r_0=6)  # <=19px variant
TILE_MARK = 0.76  # mark at 76% of the tile (fits the 80% maskable safe zone)


def mark(r_c: float, r_0: float, corners: str, center: str, indent: str = "  ") -> str:
    """The five dots on the 32 grid (four corners + center)."""
    d = 8
    corners_ = [
        f'<circle cx="{d}" cy="{d}" r="{r_c}" fill="{corners}"/>',
        f'<circle cx="{32 - d}" cy="{d}" r="{r_c}" fill="{corners}"/>',
        f'<circle cx="{d}" cy="{32 - d}" r="{r_c}" fill="{corners}"/>',
        f'<circle cx="{32 - d}" cy="{32 - d}" r="{r_c}" fill="{corners}"/>',
    ]
    rows = corners_ + [f'<circle cx="16" cy="16" r="{r_0}" fill="{center}"/>']
    return "\n".join(indent + r for r in rows)


def mark_group(mark_inner: str, canvas: float, frac: float) -> str:
    """Master mark centered at `frac` of a square canvas (transform composition)."""
    m = canvas * (1 - frac) / 2
    s = canvas / 32 * frac
    return f'  <g transform="translate({m:.3f} {m:.3f}) scale({s:.5f})">\n{mark_inner}\n  </g>'


# ---------------------------------------------------------------- final SVGs


def favicon_svg() -> str:
    # micro, 2 tones, transparent; in dark theme the mark steps up one rung of the ladder
    inner = mark(**MICRO, corners="__C__", center="__O__").replace('fill="__C__"', 'class="c"').replace(
        'fill="__O__"', 'class="o"'
    )
    style = (
        f"    .c {{ fill: {C2410C}; }} .o {{ fill: {F97316}; }}\n"
        f"    @media (prefers-color-scheme: dark) {{\n"
        f"      .c {{ fill: {F97316}; }} .o {{ fill: {FDBA74}; }}\n"
        f"    }}"
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="raxa">\n'
        f"  <style>\n{style}\n  </style>\n{inner}\n</svg>\n"
    )


def logo_svg() -> str:
    # master mark, 2 tones in light context — the canonical one (docs, README, OG)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="raxa">\n'
        f"{mark(**MASTER, corners=C2410C, center=F97316)}\n</svg>\n"
    )


# ---------------------------------------------------------------- lockup (vectorized text)


def text_metrics(font_size: float):
    """Outlines 'ra' and 'a' (PJS 800) and measures them in the final SVG space
    (y down; baseline at y=0; first letter at x=0).
    Returns a glyph(ch, x_off) helper."""
    font = TTFont(FONT)
    font = instancer.instantiateVariableFont(font, {"wght": 800}, inplace=False)
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    upem = font["head"].unitsPerEm
    glyphs = font.getGlyphSet()
    s = font_size / upem

    def glyph(ch: str, x_off: float):
        gname = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[gname].draw(TransformPen(pen, (s, 0, 0, -s, x_off, 0)))
        bp = BoundsPen(glyphs)
        glyphs[gname].draw(TransformPen(bp, (s, 0, 0, -s, x_off, 0)))
        return pen.getCommands(), hmtx[gname][0] * s, bp.bounds  # bounds already in SVG coords

    return glyph, s


def lockup_svg() -> str:
    F = 40.0
    ls = -0.05 * F  # tracking
    cell = 0.6 * F  # x-cell: square, sitting on the baseline
    glyph, _ = text_metrics(F)

    # letter advances measured with x_off=0
    d_r, adv_r, b_r = glyph("r", 0)
    _, adv_a, b_a = glyph("a", 0)

    # sequence: r a [cell] a
    xs = {}
    x = 0.0
    for name, adv in (("r", adv_r), ("a1", adv_a)):
        xs[name] = x
        x += adv + ls
    xs["cell"] = x
    x += cell + ls
    xs["a2"] = x
    width = x + adv_a

    parts = [glyph("r", xs["r"])[0], glyph("a", xs["a1"])[0], glyph("a", xs["a2"])[0]]
    fills = [INK, INK, INK]  # in the approved wordmark the letters are ink; only the dots have color
    ys = [b for b in (b_r, b_a) if b]
    y_top, y_bot = min(min(b[1] for b in ys), -cell), max(b[3] for b in ys)

    # the 5-dot cell (grid 20, r 3.35), top at y=-cell (sitting on the baseline)
    cs = cell / 20
    dots = [
        (4, 16, C2410C),
        (16, 4, C2410C),  # darker TL/BR diagonal pair
        (4, 4, EA580C),
        (16, 16, EA580C),
        (10, 10, F97316),  # center = the name's only accent
    ]
    cell_rows = [
        f'    <circle cx="{xs["cell"] + cx * cs:.2f}" cy="{-cy * cs:.2f}" r="{3.35 * cs:.2f}" fill="{fill}"/>'
        for cx, cy, fill in dots
    ]

    # mark at 1.30em, gap = 0.32 × mark width, optical centers aligned (spec 04)
    M = 1.30 * F
    G = 0.32 * M
    text_mid = (y_top + y_bot) / 2
    pad = 6.0
    total_w = M + G + width
    total_h = max(M, y_bot - y_top)
    mark_y = pad + (total_h - M) / 2  # mark vertically centered in the canvas
    dy = mark_y + M / 2 - text_mid  # text translation so the optical centers coincide

    rows = []
    rows.append(f'  <g transform="translate({pad:.2f} {mark_y:.2f}) scale({M / 32:.5f})">')
    rows.append(mark(**MASTER, corners=C2410C, center=F97316, indent="    "))
    rows.append("  </g>")
    rows.append(f'  <g transform="translate({pad + M + G:.2f} {dy:.2f})">')
    for d, fill in zip(parts, fills):
        rows.append(f'    <path d="{d}" fill="{fill}"/>')
    rows.extend(cell_rows)
    rows.append("  </g>")
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w + 2 * pad:.2f} {total_h + 2 * pad:.2f}" '
        f'role="img" aria-label="raxa">\n' + "\n".join(rows) + "\n</svg>\n"
    )


# ---------------------------------------------------------------- raster-ready


def tile_svg(px: int) -> str:
    inner = mark(**MASTER, corners=FDBA74, center=CREAM)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="{px}" height="{px}">\n'
        f'  <rect width="512" height="512" fill="{C2410C}"/>\n'
        f"{mark_group(inner, 512, TILE_MARK)}\n</svg>\n"
    )


def splash_svg(px: int, bg: str, ink: str) -> str:
    inner = mark(**MASTER, corners=ink, center=ink)  # 1 color: the center defends itself by radius
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="{px}" height="{px}">\n'
        f'  <rect width="1024" height="1024" fill="{bg}"/>\n'
        f"{mark_group(inner, 1024, 0.40)}\n</svg>\n"
    )


# ---------------------------------------------------------------- main


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    SRC.mkdir(parents=True, exist_ok=True)
    out = {
        PUBLIC / "favicon.svg": favicon_svg(),
        BRAND / "logo.svg": logo_svg(),
        BRAND / "lockup.svg": lockup_svg(),
        SRC / "tile-512.svg": tile_svg(512),
        SRC / "splash-light.svg": splash_svg(1024, CREAM, C2410C),
        SRC / "splash-dark.svg": splash_svg(1024, DARK, F97316),
    }
    for path, text in out.items():
        path.write_text(text)
        print(f"{path.relative_to(ROOT)}  ({len(text)} bytes)")


if __name__ == "__main__":
    main()
