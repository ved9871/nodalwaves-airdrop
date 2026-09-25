# NodalWaves 5×5 — landing page

Static landing page for the NodalWaves **5×5 Participation Growth Program** ($10 activation → 24-month
commitment → 1:1 promotional NODAL → Build Your 5 → five generation rates 5 / 5 / 4 / 3 / 3, max 20%).
Built from `Airdrop development Plan.pdf` (Final IT development specification v2.0, 25 Sep 2026).

No build step. Open `index.html` or serve the folder as-is (GitHub Pages, Cloudflare Pages, any static host).

```
index.html          page markup + copy
styles.css          design system + components
main.js             level-unlock explorer, launch-list form (demo), scroll reveals, receipt timestamp
assets/             red-dot logo badge (64 / 192 / 512 / 1024) + favicon
banners/            banners.html (source for all sizes) + exported PNGs
preview/            shoot.py (Playwright screenshots) + desktop / mobile captures
build-artifact.mjs  inlines CSS/JS into dist/artifact.html for claude.ai Artifact publishing
```

## Design

- **Signature:** the activation receipt. A thermal-paper receipt that prints itself in the hero and recurs
  as the "every allocation has a receipt" ledger. Receipt = proof = the brand's security-first stance.
- **Palette:** void `#050507`, hull `#0E1014`, crimson `#CE0E2D` / hot `#FF2E4C`, chrome `#C6CDD6`,
  paper `#F3EFE7`, gold `#FCD033` (used once, APEX only).
- **Type:** Big Shoulders Display (display, page-level override of Space Grotesk for the Gen Z audience),
  Inter (body, brand standard), JetBrains Mono (receipt, HUD labels, data — brand standard).
- Reduced motion respected; keyboard focus visible; no horizontal overflow at 390px.

## Copy rules baked in (from the spec §9 and the brand context)

- Never "$10 becomes $20", "double your money", fixed future USD value, guaranteed income / rate / price.
- Promo is a **token quantity** (same units, separate vault). Fiat reference is informational only.
- Level figures are shown as **the rule applied to one example activation**, never as an income projection.
- Community Partner is **opt-in**; registration alone qualifies nothing; one promo per verified device.
- Ranks are recognition, APEX verified manually. No spillover / compression / auto-placement.
- Legacy names (NodeWaves, NWS) never appear. Run `grep -i -E "nodewaves|\bnws\b|apy|yield" index.html` before shipping.

## Regenerate previews and banners

```bash
python preview/shoot.py page index.html preview/desktop-full.png 1440 900 full
python preview/shoot.py page index.html preview/mobile-full.png 390 844 full mobile
python preview/shoot.py banners banners/banners.html banners
node build-artifact.mjs
```

(Playwright uses the system Edge via `channel="msedge"`.)

## Open items for management sign-off

1. Program name on the page: "5×5 Participation Program" (the spec's name). "Airdrop" is deliberately not used
   in copy because the mechanic is a purchase-linked promo, not a free distribution.
2. Launch-list form is a front-end demo; wire it to the CRM / mailing tool before go-live.
3. Activation CTA currently anchors to the launch list; point it at the real activation flow once built.
4. The 2,898 NODAL example quote comes from the spec; refresh if the reference quote changes.
