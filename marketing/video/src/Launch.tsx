import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, CHROME_GRADIENT, CRIMSON_GRADIENT, fontsReady } from './theme';

void fontsReady;

export const FPS = 30;
/* Scene plan, in frames (24 s total) */
const SC = {
  brand: { from: 0, dur: 90 },
  headline: { from: 90, dur: 130 },
  steps: { from: 220, dur: 130 },
  ecosystem: { from: 350, dur: 150 },
  trust: { from: 500, dur: 90 },
  cta: { from: 590, dur: 130 },
};
export const TOTAL_FRAMES = 720;

/* ---------- helpers ---------- */
const useLayout = () => {
  const { width: w, height: h } = useVideoConfig();
  const isV = h > w, isL = w > h;
  return { w, h, isV, isL, pad: isV ? 84 : 96, maxW: isL ? 1560 : w - 2 * (isV ? 84 : 96) };
};
const useRise = (delay: number, distance = 40) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 110, mass: 0.9 } });
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` } as React.CSSProperties;
};
const useSceneFade = (dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 10, dur - 12, dur], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};
const gradientText = (bg: string): React.CSSProperties => ({ backgroundImage: bg, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' });
const display = (size: number): React.CSSProperties => ({ fontFamily: FONT.display, fontWeight: 900, fontSize: size, lineHeight: 0.92, textTransform: 'uppercase', letterSpacing: '-0.005em', color: C.text, margin: 0 });
const mono = (size: number, color = C.chrome2): React.CSSProperties => ({ fontFamily: FONT.mono, fontSize: size, letterSpacing: '0.18em', textTransform: 'uppercase', color, margin: 0 });
const body = (size: number, color = C.body): React.CSSProperties => ({ fontFamily: FONT.body, fontSize: size, lineHeight: 1.45, color, margin: 0 });

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { pad, maxW } = useLayout();
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: pad }}>
      <div style={{ width: '100%', maxWidth: maxW, ...style }}>{children}</div>
    </AbsoluteFill>
  );
};

/* ---------- background ---------- */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gx = 72 + Math.sin(frame / 180) * 10;
  const gy = 28 + Math.cos(frame / 240) * 8;
  const grid = 'repeating-linear-gradient(90deg, rgba(206,14,45,.07) 0 1px, transparent 1px 56px), repeating-linear-gradient(0deg, rgba(206,14,45,.07) 0 1px, transparent 1px 56px)';
  const mask = 'radial-gradient(75% 70% at 55% 40%, #000 25%, transparent 100%)';
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 50% at ${gx}% ${gy}%, rgba(206,14,45,.32) 0%, rgba(206,14,45,0) 65%)` }} />
      <AbsoluteFill style={{ backgroundImage: grid, WebkitMaskImage: mask, maskImage: mask }} />
      <AbsoluteFill style={{ background: 'radial-gradient(90% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ---------- icons (same strokes as the site) ---------- */
const PATHS: Record<string, string> = {
  token: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM7 13c1.6-2.4 3.2-2.4 4.8 0s3.2 2.4 4.8 0',
  passport: 'M7 3h10a2.5 2.5 0 0 1 2.5 2.5v13A2.5 2.5 0 0 1 17 21H7a2.5 2.5 0 0 1-2.5-2.5v-13A2.5 2.5 0 0 1 7 3zM12 7.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2zM8.5 17h7',
  quest: 'M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z',
  stake: 'M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4',
  nodes: 'M6 15.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM18 15.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM12 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM8 16.2l3-7.8M16 16.2l-3-7.8M8.5 18h7',
  market: 'M4 8h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8zM9 8V6a3 3 0 0 1 6 0v2',
  game: 'M7 7h10a4.5 4.5 0 0 1 4.5 4.5v1A4.5 4.5 0 0 1 17 17h-.8l-2-2h-4.4l-2 2H7a4.5 4.5 0 0 1-4.5-4.5v-1A4.5 4.5 0 0 1 7 7zM8 10.5v3M6.5 12h3M15.5 11.2h.01M17.6 13h.01',
  lock: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
  check: 'M5 12.5l4.5 4.5L19 7',
};
const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={PATHS[name]} />
  </svg>
);

/* ---------- scene 1 · brand reveal ---------- */
const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isL } = useLayout();
  const fade = useSceneFade(SC.brand.dur);
  const p = spring({ frame, fps, config: { damping: 200, stiffness: 80, mass: 1 } });
  const line = interpolate(frame, [24, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eyebrow = useRise(30, 24);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Center style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
        <div style={{ position: 'relative', width: isL ? 820 : 720 }}>
          <div style={{ position: 'absolute', inset: '-40% -20%', background: 'radial-gradient(50% 50% at 35% 55%, rgba(206,14,45,.45), transparent 70%)', opacity: p }} />
          <Img src={staticFile('img/logo-lockup.png')} style={{ width: '100%', display: 'block', position: 'relative', opacity: interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' }), transform: `scale(${0.94 + 0.06 * p})` }} />
        </div>
        <div style={{ height: 2, width: isL ? 520 : 420, background: `linear-gradient(90deg, transparent, ${C.hot}, transparent)`, transform: `scaleX(${line})` }} />
        <p style={{ ...mono(isL ? 22 : 20), textAlign: 'center', ...eyebrow }}>Your entry into the NodalWaves ecosystem</p>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------- scene 2 · headline ---------- */
const HeadlineScene: React.FC = () => {
  const { isL } = useLayout();
  const fade = useSceneFade(SC.headline.dur);
  const a = useRise(0), b = useRise(10), c = useRise(30, 28);
  const size = isL ? 176 : 150;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Center>
        <h1 style={{ ...display(size), ...a }}>Start small.</h1>
        <h1 style={{ ...display(size), ...gradientText(CHROME_GRADIENT), ...b, marginTop: 6, textWrap: 'balance' } as React.CSSProperties}>Enter the ecosystem.</h1>
        <p style={{ ...body(isL ? 36 : 32, C.body), maxWidth: 900, marginTop: 40, ...c }}>
          Your entry into the NodalWaves ecosystem can start with <span style={{ color: C.text, fontWeight: 600 }}>$10 in NODAL</span>.
        </p>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------- scene 3 · three steps ---------- */
const STEPS = [
  { n: '01', title: 'Get NODAL', desc: 'A qualifying $10 purchase of NODAL.', icon: 'token' },
  { n: '02', title: 'Commit', desc: 'Keep it committed for the 24-month participation period.', icon: 'lock' },
  { n: '03', title: 'Receive promotional NODAL', desc: 'An additional allocation equal to the quantity you purchased.', icon: 'check' },
];
const StepCard: React.FC<{ s: typeof STEPS[number]; delay: number; wide: boolean }> = ({ s, delay, wide }) => {
  const r = useRise(delay, 34);
  return (
    <div style={{ ...r, background: 'rgba(14,16,20,.92)', border: `1px solid ${C.line2}`, borderRadius: 20, padding: wide ? '34px 34px 30px' : '28px 32px', display: 'flex', flexDirection: wide ? 'column' : 'row', gap: wide ? 18 : 28, alignItems: wide ? 'flex-start' : 'center', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={mono(20, C.hot)}>{s.n}</span>
        <Icon name={s.icon} size={34} color={C.chrome} />
      </div>
      <div>
        <h3 style={{ ...display(wide ? 54 : 50), fontWeight: 800, letterSpacing: '0.01em' }}>{s.title}</h3>
        <p style={{ ...body(wide ? 26 : 25), marginTop: 10, maxWidth: 560 }}>{s.desc}</p>
      </div>
    </div>
  );
};
const StepsScene: React.FC = () => {
  const { isL, isV } = useLayout();
  const fade = useSceneFade(SC.steps.dur);
  const t = useRise(0, 24);
  const end = useRise(84, 24);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Center style={{ display: 'flex', flexDirection: 'column', gap: isV ? 36 : 28 }}>
        <div style={t}>
          <p style={mono(20)}>How it works</p>
          <h2 style={{ ...display(isL ? 96 : 84), marginTop: 14 }}>Three <span style={gradientText(CHROME_GRADIENT)}>simple steps.</span></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: isL ? 'row' : 'column', gap: isV ? 22 : 16 }}>
          {STEPS.map((s, i) => <StepCard key={s.n} s={s} delay={14 + i * 16} wide={isL} />)}
        </div>
        <p style={{ ...display(isV ? 64 : 56), ...gradientText(CHROME_GRADIENT), ...end, marginTop: isV ? 20 : 8 }}>That's it. Your journey has started.</p>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------- scene 4 · ecosystem ---------- */
const NODES = [
  { icon: 'token', label: '$NODAL' },
  { icon: 'passport', label: 'Nodal Passport' },
  { icon: 'quest', label: 'Nodal Quest' },
  { icon: 'stake', label: 'Staking & participation' },
  { icon: 'nodes', label: 'Nodes' },
  { icon: 'market', label: 'Marketplace & utility' },
  { icon: 'game', label: 'Future gaming' },
];
const STEP_GAP = 11;
const EcosystemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { isV, isL } = useLayout();
  const fade = useSceneFade(SC.ecosystem.dur);
  const t = useRise(0, 24);
  const cap = useRise(98, 30);
  const start = 16;
  const progress = interpolate(frame, [start, start + STEP_GAP * (NODES.length - 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dot = isL ? 84 : isV ? 72 : 66;
  const lit = (i: number) => frame >= start + i * STEP_GAP;
  const Dot: React.FC<{ i: number }> = ({ i }) => {
    const on = lit(i);
    const pop = spring({ frame: frame - (start + i * STEP_GAP), fps: FPS, config: { damping: 14, stiffness: 160 } });
    return (
      <div style={{ width: dot, height: dot, borderRadius: '50%', border: `1.5px solid ${on ? C.hot : C.line2}`, background: on ? 'linear-gradient(180deg,#2A1218,#0E1014)' : C.hull, boxShadow: on ? `0 0 ${dot / 2}px -6px ${C.hot}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? 0.9 + 0.1 * pop : 1})`, flex: 'none' }}>
        <Icon name={NODES[i].icon} size={dot * 0.46} color={on ? '#fff' : C.chrome2} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Center style={{ display: 'flex', flexDirection: 'column', gap: isV ? 44 : 34 }}>
        <div style={t}>
          <p style={mono(20)}>The NodalWaves ecosystem</p>
          <h2 style={{ ...display(isL ? 96 : 74), marginTop: 14 }}>Where your journey <span style={gradientText(CHROME_GRADIENT)}>can go.</span></h2>
        </div>

        {isV ? (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ position: 'absolute', left: dot / 2 - 1, top: dot / 2, bottom: dot / 2, width: 2, background: C.line }} />
            <div style={{ position: 'absolute', left: dot / 2 - 1, top: dot / 2, bottom: dot / 2, width: 2, background: `linear-gradient(180deg, ${C.hot}, ${C.crimson})`, transform: `scaleY(${progress})`, transformOrigin: 'top', boxShadow: `0 0 12px rgba(255,46,76,.6)` }} />
            {NODES.map((n, i) => (
              <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 26, position: 'relative' }}>
                <Dot i={i} />
                <span style={{ ...display(44), fontWeight: 800, letterSpacing: '0.01em', color: lit(i) ? C.text : C.chrome2 }}>{n.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${NODES.length}, 1fr)`, gap: isL ? 14 : 8 }}>
            <div style={{ position: 'absolute', left: dot / 2, right: dot / 2, top: dot / 2 - 1, height: 2, background: C.line }} />
            <div style={{ position: 'absolute', left: dot / 2, right: dot / 2, top: dot / 2 - 1, height: 2, background: `linear-gradient(90deg, ${C.crimson}, ${C.hot})`, transform: `scaleX(${progress})`, transformOrigin: 'left', boxShadow: `0 0 12px rgba(255,46,76,.6)` }} />
            {NODES.map((n, i) => (
              <div key={n.label} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                <Dot i={i} />
                <span style={{ ...display(isL ? 30 : 24), fontWeight: 800, letterSpacing: '0.02em', color: lit(i) ? C.text : C.chrome2, paddingRight: 8 }}>{n.label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={cap}>
          <h3 style={{ ...display(isL ? 76 : 64) }}>Your $10 is the entry point.</h3>
          <h3 style={{ ...display(isL ? 76 : 64), ...gradientText(CRIMSON_GRADIENT) }}>The ecosystem is the journey.</h3>
          <p style={{ ...mono(17, C.muted), marginTop: 18, letterSpacing: '0.08em', textTransform: 'none' }}>Ecosystem layers roll out in phases. Features, availability and timing may change.</p>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------- scene 5 · trust ---------- */
const TRUST = [
  { kind: 'no', text: 'Not guaranteed income.' },
  { kind: 'no', text: 'Not a price promise.' },
  { kind: 'yes', text: 'A first step into a growing ecosystem.' },
];
const Mark: React.FC<{ kind: string }> = ({ kind }) =>
  kind === 'yes'
    ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: C.chrome, boxShadow: '0 0 0 5px rgba(198,205,214,.15)', flex: 'none' }} />
    : <span style={{ width: 18, height: 18, flex: 'none', background: `linear-gradient(45deg, transparent 42%, ${C.hot} 42% 58%, transparent 58%), linear-gradient(-45deg, transparent 42%, ${C.hot} 42% 58%, transparent 58%)` }} />;
const TrustScene: React.FC = () => {
  const { isL } = useLayout();
  const fade = useSceneFade(SC.trust.dur);
  const t = useRise(0, 24);
  const note = useRise(54, 20);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Center style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <div style={t}>
          <p style={mono(20)}>Trust &amp; transparency</p>
          <h2 style={{ ...display(isL ? 170 : 150), marginTop: 14 }}>No hype.</h2>
          <h2 style={{ ...display(isL ? 72 : 60), ...gradientText(CHROME_GRADIENT), marginTop: 10 }}>Know what you're joining.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {TRUST.map((l, i) => <TrustLine key={l.text} l={l} delay={16 + i * 12} />)}
        </div>
        <p style={{ ...mono(18, C.muted), letterSpacing: '0.08em', textTransform: 'none', ...note }}>Crypto assets involve risk. No guaranteed value or return.</p>
      </Center>
    </AbsoluteFill>
  );
};
const TrustLine: React.FC<{ l: { kind: string; text: string }; delay: number }> = ({ l, delay }) => {
  const r = useRise(delay, 24);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, ...r }}>
      <Mark kind={l.kind} />
      <span style={{ ...body(38, C.text), lineHeight: 1.2 }}>{l.text}</span>
    </div>
  );
};

/* ---------- scene 6 · call to action ---------- */
const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { isL, isV } = useLayout();
  const fade = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const logo = useRise(0, 20), a = useRise(8), b = useRise(16), pill = useRise(34, 26), fine = useRise(48, 16);
  const pulse = 0.55 + 0.45 * Math.sin(frame / 7);
  const size = isL ? 176 : 150;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Center style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: isV ? 40 : 30 }}>
        <Img src={staticFile('img/logo-lockup.png')} style={{ width: isL ? 420 : 360, ...logo }} />
        <div>
          <h1 style={{ ...display(size), ...a }}>Start small.</h1>
          <h1 style={{ ...display(size), ...gradientText(CHROME_GRADIENT), ...b, marginTop: 6 }}>Enter the ecosystem.</h1>
        </div>
        <div style={{ ...pill, display: 'inline-flex', alignItems: 'center', gap: 20, border: `1px solid ${C.chrome2}`, borderRadius: 999, padding: '20px 36px', background: 'rgba(14,16,20,.9)' }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.hot, boxShadow: `0 0 16px ${C.hot}`, opacity: pulse }} />
          <span style={{ ...mono(20, C.hot), letterSpacing: '0.22em' }}>Live now</span>
          <span style={{ width: 1, height: 28, background: C.line2 }} />
          <span style={{ fontFamily: FONT.mono, fontSize: isL ? 36 : 32, color: C.text, letterSpacing: '0.02em' }}>gateway.nodalwaves.com</span>
        </div>
        <p style={{ ...mono(17, C.muted), letterSpacing: '0.08em', textTransform: 'none', ...fine }}>$10 qualifying NODAL · 24-month commitment · promotional NODAL of the same quantity. Crypto assets involve risk. No guaranteed value or return.</p>
      </Center>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const Launch: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT.body, color: C.body }}>
    <Background />
    <Sequence from={SC.brand.from} durationInFrames={SC.brand.dur} name="Brand"><BrandScene /></Sequence>
    <Sequence from={SC.headline.from} durationInFrames={SC.headline.dur} name="Headline"><HeadlineScene /></Sequence>
    <Sequence from={SC.steps.from} durationInFrames={SC.steps.dur} name="Steps"><StepsScene /></Sequence>
    <Sequence from={SC.ecosystem.from} durationInFrames={SC.ecosystem.dur} name="Ecosystem"><EcosystemScene /></Sequence>
    <Sequence from={SC.trust.from} durationInFrames={SC.trust.dur} name="Trust"><TrustScene /></Sequence>
    <Sequence from={SC.cta.from} durationInFrames={SC.cta.dur} name="CTA"><CtaScene /></Sequence>
  </AbsoluteFill>
);
