# Nodal Gateway — landing page

**Start Small. Enter the Ecosystem.**

Static, mobile-first landing page for **Nodal Gateway**, the $10 NODAL entry point into the NodalWaves
ecosystem (identity, learning, participation, future utility), with the optional Community Partner
program on its own page.

No build step. Open `index.html` or serve the folder as-is (GitHub Pages, Cloudflare Pages, any static host).

```
index.html          landing page markup + copy (13 sections + the "Start my journey" dialog)
community.html      Community Partner program (optional; compensation mechanics live here, not on the landing page)
config.js           business rules, price source, links, flow mode + integration hooks, unconfirmed-rule placeholders
styles.css          design system + components, mobile-first (390px base → 760 tablet → 1024 desktop)
community.css       components used only by community.html (level explorer, ranks, ledger)
main.js             calculator, rails, tabs, journey dialog, mobile menu, launch-list forms, scroll reveals
community.js        level-unlock explorer (reads config.community)
assets/             Nodal Gateway lockup + badge (64 / 192 / 512, favicon); NodalWaves badge (64 / 192 / 512 / 1024) used in the Passport previews
banners/            banners.html (source for all sizes) + exported PNGs
preview/            shoot.mjs (Playwright screenshots) + desktop / mobile captures
build-artifact.mjs  inlines CSS/JS/config into dist/artifact.html for single-file previews
```

## Page story (in order)

1. Hero — *Start small. Enter the ecosystem.* Passport preview card, no program mechanics.
2. Why we're building NodalWaves — purpose before mechanics.
3. What can $10 start? — spending vs participating.
4. How it works — three steps: get NODAL, commit, receive promotional NODAL.
5. Live NODAL calculator — `$10 / applicable price = estimated NODAL`, plus the promotional allocation. Estimate only.
6. The ecosystem — $NODAL → Passport → Quest → staking & participation → Nodes → marketplace & utility → future gaming.
7. Your journey — Identity / Learn / Progress / Participate / Discover, with a Passport / Quest interface preview.
8. 24 months, one long-term journey — milestone timeline + the commitment in plain terms.
9. Two years can change a lot — with the seed → network growth figure.
10. Community Partner — optional, one CTA to `community.html`.
11. Trust & transparency — what it is / what it is not.
12. FAQ.
13. Final CTA — *Every big journey has a first step.*

## Editing copy and rules

- **Copy** lives in `index.html` / `community.html` as plain semantic markup. Each section starts with a
  `<!-- ==== N. NAME ==== -->` comment.
- **Brand** (`config.brand`): Nodal Gateway is the page / entry program; NodalWaves is the ecosystem it leads into.
- **Numbers and rules** live in `config.js`. The entry amount and commitment months are injected wherever the
  markup carries `data-cfg="entry.amount"` / `data-cfg="entry.months"`, so they only need changing once.
- **Price source** (`config.price.source`): `placeholder` (development placeholder, labelled on the page),
  `static` (an official reference quote) or `api` (fetched from `price.api.url`, value at `price.api.jsonPath`).
  The page never shows a quantity it did not compute; if the price cannot load it says so.
- **Start my journey flow** (`config.flow.mode`): `prelaunch` runs steps 1–2 (summary, understanding confirmation)
  and collects an email for the official link at step 3, previewing steps 4–7. `live` calls the async hooks in
  `config.flow.integrations` (`connect`, `purchase`, `commit`, `eligibility`) and ends on *Welcome to the Next Wave*
  → create your Nodal Passport → start your first quest.
- **Launch list**: `config.flow.launchListEndpoint` — empty string is a front-end demo; set a POST endpoint to wire the CRM.
- **Unconfirmed rules** (`config.unconfirmedRules`) are `null` on purpose. The pages make no public statement about
  directs beyond five, sponsor locking / corrections, unused-level handling or the exact promotional release schedule
  until the product owner confirms them.

## Copy rules baked in

- Never "1:1", "match", "$10 becomes $20", "double your money", a fixed future USD value, or guaranteed income / rate / price.
- The promotional benefit is **100% purchase-linked promotional NODAL**: an additional allocation equal to the qualifying
  purchased token quantity. Token units, never a dollar value.
- No levels, percentages, ranks or referral language in the hero, navigation or the first two-thirds of the page.
- Community Partner is opt-in; the landing page links to it once. Rates, ranks and the ledger example live on `community.html`.
- Legacy names (NodeWaves, NWS) never appear.

```bash
grep -n -i -E "1 ?: ?1|match|becomes \$20|100x|nodewaves|\bnws\b" index.html community.html   # should return nothing
```

## Regenerate previews and banners

```bash
node preview/shoot.mjs page index.html preview/desktop-full.png 1440 900 full
node preview/shoot.mjs page index.html preview/mobile-full.png 390 844 full mobile
node preview/shoot.mjs page index.html preview/hero-1440x900.png 1440 900 viewport
node preview/shoot.mjs banners banners/banners.html banners
node build-artifact.mjs
```

`shoot.mjs` uses the Playwright package plus its Chromium (set `CHROME_PATH` to point at another browser binary).
If the machine cannot reach Google Fonts from a headless browser, set `FONT_DIR` to a folder holding the Google
Fonts CSS as `local.css` (with font URLs rewritten to `https://fonts.gstatic.com/local/<file>`) and the woff2 files;
the script serves them locally.

## Open items for product sign-off

1. Replace the development placeholder price with the real reference price source (`config.price`).
2. Wire the launch list (`config.flow.launchListEndpoint`) and, at launch, the flow integrations (`config.flow.integrations`).
3. Confirm the rules under `config.unconfirmedRules`, then surface them in copy.
4. Point the `terms` link at the published program terms.
