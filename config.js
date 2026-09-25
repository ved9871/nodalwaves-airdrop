/* NodalWaves landing page — site configuration
   ------------------------------------------------------------------
   Everything the page treats as a business rule, a number, a link or an
   integration point lives here. Edit this file, not main.js.

   Copy for each section lives in index.html (semantic markup, easy to edit).
   The handful of values that must stay in sync across the page (entry amount,
   commitment months) are injected from here via data-cfg="..." attributes.
   ------------------------------------------------------------------ */
window.NW_CONFIG = {

  brand: {
    name: 'NodalWaves',
    slogan: 'Power the Next Wave.',
    campaign: 'Start small. Stay for the journey.',
    token: 'NODAL',
    network: 'Polygon'
  },

  /* The participation entry ------------------------------------------ */
  entry: {
    amountUsd: 10,            // qualifying purchase, USD equivalent
    currencySymbol: '$',
    commitmentMonths: 24,     // participation / commitment period
    /* Promotional NODAL = promoRatio × qualifying purchased token quantity.
       1 = "100% purchase-linked promotional NODAL". Token units, never a USD value. */
    promoRatio: 1
  },

  /* NODAL reference price used by the live calculator ---------------- */
  price: {
    /* 'placeholder' → development placeholder, clearly labelled on the page.
       'static'      → staticUsd below (e.g. an official reference quote), labelled with staticLabel.
       'api'         → fetched from api.url; the value at api.jsonPath is used. */
    source: 'placeholder',
    placeholderUsd: 0.00345,
    staticUsd: null,
    staticLabel: 'Official reference quote',
    api: {
      url: '',                // e.g. 'https://api.nodalwaves.com/price/nodal'
      jsonPath: 'price.usd',  // dot path to the USD price inside the JSON response
      label: 'Live reference price',
      refreshMs: 60000
    },
    quantityDecimals: 0       // how many decimals to show for estimated NODAL quantities
  },

  /* Links -------------------------------------------------------------- */
  links: {
    site: 'https://nodalwaves.com',
    litepaper: 'https://nodalwaves.com',
    quest: 'https://nodalwavesquest.com',
    community: 'community.html',
    terms: 'https://nodalwaves.com',
    telegram: 'https://t.me/Nodalwaves',
    youtube: 'https://www.youtube.com/@Nodalwaves',
    instagram: 'https://www.instagram.com/nodalwaves/',
    facebook: 'https://www.facebook.com/nodalwaves'
  },

  /* "Start my journey" flow ------------------------------------------- */
  flow: {
    /* 'prelaunch' → steps 1–2 run in full; step 3 collects an email for the
                     official activation link and previews steps 4–7.
       'live'      → step 3 onwards call the integration hooks below. */
    mode: 'prelaunch',

    /* Launch-list capture. Empty string = front-end demo (no request is sent).
       Set to a POST endpoint (JSON body: { email, source }) once the CRM is wired. */
    launchListEndpoint: '',

    /* Integration hooks for 'live' mode. Each is an async function that resolves
       when its step completes (or throws to show an error). Wire these to the real
       wallet / purchase / commitment / eligibility services. */
    integrations: {
      connect: null,      // async () => ({ address })
      purchase: null,     // async ({ amountUsd }) => ({ quantity, txHash })
      commit: null,       // async ({ quantity }) => ({ commitmentEnds })
      eligibility: null   // async () => ({ promoQuantity, status })
    },

    /* Where the success screen sends people next */
    passportUrl: '#journey',
    firstQuestUrl: 'https://nodalwavesquest.com'
  },

  /* Business rules the product owner has NOT yet confirmed -------------
     The page deliberately makes no public statement about these while they are
     null. Fill them in (and surface them in copy) only once confirmed. */
  unconfirmedRules: {
    maxDirectsPerPartner: null,      // may a Community Partner have more than five directs?
    sponsorLocking: null,            // when/if a sponsor locks, and how corrections work
    unusedLevelHandling: null,       // what happens to allocations for levels not yet unlocked
    promoReleaseSchedule: null       // exact promotional NODAL release / vesting implementation
  },

  /* Community Partner program (used by community.html only) ------------ */
  community: {
    optIn: true,
    levelRatesBps: [500, 500, 400, 300, 300],  // per generation, basis points
    maxRateBps: 2000,                          // cap per qualifying activation
    ranks: [
      { name: 'Spark', threshold: 5,    desc: 'personally qualified directs' },
      { name: 'Rise',  threshold: 25,   desc: 'activations at generation 2' },
      { name: 'Boost', threshold: 125,  desc: 'activations at generation 3' },
      { name: 'Prime', threshold: 625,  desc: 'activations at generation 4' },
      { name: 'Apex',  threshold: 3905, desc: 'across all five generations · 5 / 25 / 125 / 625 / 3,125', verified: true }
    ]
  }
};
