"""Screenshot helper (Playwright via system Edge).
  python shoot.py page <index.html> <out.png> <width> <height> [full|viewport] [mobile]
  python shoot.py banners <banners.html> <outdir>
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

mode = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge")
    if mode == "page":
        src, out, w, h = Path(sys.argv[2]), Path(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
        full = (len(sys.argv) > 6 and sys.argv[6] == "full")
        mobile = (len(sys.argv) > 7 and sys.argv[7] == "mobile")
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if mobile else 1,
                            is_mobile=mobile, has_touch=mobile)
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text) if m.type in ("error", "warning") else None)
        pg.goto(src.resolve().as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(3600)  # let the receipt finish printing
        # force any pending reveals so the full-page capture is complete
        pg.evaluate("document.querySelectorAll('.reveal-pending').forEach(e=>e.classList.add('in'))")
        pg.wait_for_timeout(700)
        report = pg.evaluate("""() => ({
          fonts: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).filter((v,i,a)=>a.indexOf(v)===i),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
          h: document.documentElement.scrollHeight
        })""")
        print("fonts:", report["fonts"]); print("overflow:", report["overflow"], report["scrollW"], report["clientW"], "height:", report["h"])
        print("errors:", errs or "none")
        pg.screenshot(path=str(out), full_page=full)
        print("wrote", out)
    elif mode == "banners":
        src, outdir = Path(sys.argv[2]), Path(sys.argv[3])
        outdir.mkdir(parents=True, exist_ok=True)
        ctx = b.new_context(viewport={"width": 2600, "height": 2000}, device_scale_factor=1)
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(src.resolve().as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(1200)
        for el in pg.query_selector_all(".canvas"):
            name = el.get_attribute("data-name")
            box = el.bounding_box()
            el.screenshot(path=str(outdir / f"{name}.png"))
            print("wrote", name, int(box["width"]), "x", int(box["height"]))
        print("errors:", errs or "none")
    b.close()
