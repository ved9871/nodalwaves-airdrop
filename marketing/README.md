# Nodal Gateway · launch marketing toolkit

Everything needed to launch gateway.nodalwaves.com on social, in community channels and with press.

**Start with `playbook/LAUNCH-PLAYBOOK.md`.** It explains the one message, the language rules, the calendar, and where each asset goes.

```
marketing/
  playbook/LAUNCH-PLAYBOOK.md     the plan: message, rules, channels, calendar, UTMs, roles, checklist
  copy/captions.md                captions for every asset, per platform
  copy/messages.md                Telegram, WhatsApp, DM, partner note, support replies, email
  copy/launch-video.srt           subtitles for the launch video
  pr/PRESS-RELEASE.md             press release
  pr/MEDIA-PITCH.md               three pitches, a follow-up, and what we will not discuss
  pr/FACTSHEET.md                 factsheet, media FAQ, boilerplate
  posters/DESIGN-PHILOSOPHY.md    the visual philosophy behind the set ("Measured Signal")
  posters/posters.html            poster source (edit copy here, re-render below)
  posters/out/                    18 PNGs: six designs × square, vertical, landscape
  video/                          Remotion project for the launch video (three formats)
  video/out/                      rendered MP4s and review stills (not committed; re-render below)
```

## Re-rendering

Posters (from the repository root):
```
node preview/shoot.mjs banners marketing/posters/posters.html marketing/posters/out
```

Video:
```
cd marketing/video
npm install
node render.mjs                 # all three formats + review stills
node render.mjs LaunchVertical  # one format
```
The video uses the brand fonts from `video/public/fonts` and the logo from `video/public/img`, so it renders without network access. Scene copy lives in `video/src/Launch.tsx`; colours and fonts in `video/src/theme.ts`.

## Brand

Nodal Gateway is the entry point into the NodalWaves ecosystem. Tagline: *Start Small. Enter the Ecosystem.* Colours: graphite `#050507`, crimson `#CE0E2D` / `#FF2E4C`, silver `#C6CDD6`. Type: Big Shoulders Display, Inter, JetBrains Mono.
