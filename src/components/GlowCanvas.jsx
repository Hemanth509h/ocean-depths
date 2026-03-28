import React, { useRef, useEffect } from 'react';
import { useDepth } from '../context/DepthContext';

/* Per-zone glow config: cursor colour, ambient colour, radii, strength */
const ZONE_CFG = [
  { cur: [144,224,239], amb: [72,202,228],   curR: 180, ambR: 260, str: 0.13, orbs: 4 }, // surface
  { cur: [72, 202,228], amb: [0, 180,216],   curR: 210, ambR: 300, str: 0.17, orbs: 5 }, // sunlight
  { cur: [144,224,239], amb: [0, 119,182],   curR: 260, ambR: 360, str: 0.28, orbs: 6 }, // twilight
  { cur: [144,224,239], amb: [144,224,239],  curR: 320, ambR: 440, str: 0.50, orbs: 7 }, // midnight
  { cur: [144,224,239], amb: [144,224,239],  curR: 400, ambR: 560, str: 0.80, orbs: 8 }, // abyss
];

function makeOrbs(n) {
  return Array.from({ length: n }, () => ({
    x:     Math.random(),
    y:     Math.random(),
    r:     70 + Math.random() * 130,
    vx:    (Math.random() - 0.5) * 0.00025,
    vy:    (Math.random() - 0.5) * 0.00025,
    phase: Math.random() * Math.PI * 2,
    freq:  0.3 + Math.random() * 0.7,
  }));
}

function radGlow(ctx, x, y, r, rgb, alpha) {
  if (r <= 0 || alpha <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0,    `rgba(${rgb},${alpha.toFixed(3)})`);
  g.addColorStop(0.35, `rgba(${rgb},${(alpha * 0.45).toFixed(3)})`);
  g.addColorStop(0.7,  `rgba(${rgb},${(alpha * 0.12).toFixed(3)})`);
  g.addColorStop(1,    `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const orbsStore = makeOrbs(8);

export default function GlowCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -1000, y: -1000 });
  const rafRef    = useRef(null);
  const tRef      = useRef(0);
  const { zoneIndex } = useDepth();
  const zoneRef   = useRef(zoneIndex);

  useEffect(() => { zoneRef.current = zoneIndex; }, [zoneIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const z = ZONE_CFG[zoneRef.current] || ZONE_CFG[0];
      const t = tRef.current;
      const curRGB = z.cur.join(',');
      const ambRGB = z.amb.join(',');

      ctx.clearRect(0, 0, W, H);

      /* ── 1. Ambient drifting orbs ───────────────────────── */
      const orbCount = Math.min(z.orbs, orbsStore.length);
      for (let i = 0; i < orbCount; i++) {
        const o = orbsStore[i];
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -0.25) o.x = 1.25;
        if (o.x >  1.25) o.x = -0.25;
        if (o.y < -0.25) o.y = 1.25;
        if (o.y >  1.25) o.y = -0.25;

        const pulse = 0.55 + 0.45 * Math.sin(t * o.freq + o.phase);
        radGlow(ctx, o.x * W, o.y * H, o.r * (0.8 + 0.3 * pulse), ambRGB, z.str * 0.22 * pulse);
      }

      /* ── 2. Slow breathe glow at top-center (sunlight illusion) */
      const topPulse = 0.6 + 0.4 * Math.sin(t * 0.4);
      radGlow(ctx, W * 0.5, 0, W * 0.55 * topPulse, curRGB, z.str * 0.18 * topPulse);

      /* ── 3. Cursor layers (only when mouse is on screen) ── */
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > -500) {
        // Layer A: wide outer halo
        radGlow(ctx, mx, my, z.curR * 2.2, curRGB, z.str * 0.18);
        // Layer B: medium glow field
        radGlow(ctx, mx, my, z.curR * 1.2, curRGB, z.str * 0.45);
        // Layer C: tight inner glow
        radGlow(ctx, mx, my, z.curR * 0.45, curRGB, z.str * 0.80);
        // Layer D: hot white core
        const hotR = 28 + z.str * 20;
        const hg = ctx.createRadialGradient(mx, my, 0, mx, my, hotR);
        hg.addColorStop(0,   `rgba(255,255,255,${(z.str * 0.85).toFixed(2)})`);
        hg.addColorStop(0.4, `rgba(${curRGB},${(z.str * 0.55).toFixed(2)})`);
        hg.addColorStop(1,   `rgba(${curRGB},0)`);
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(mx, my, hotR, 0, Math.PI * 2);
        ctx.fill();

        /* ── 4. Cursor light scatters: 6 small secondary glints */
        for (let i = 0; i < 6; i++) {
          const angle  = (i / 6) * Math.PI * 2 + t * 0.3;
          const dist   = 55 + 18 * Math.sin(t * 0.9 + i * 1.2);
          const gx = mx + Math.cos(angle) * dist;
          const gy = my + Math.sin(angle) * dist;
          radGlow(ctx, gx, gy, 22 + 8 * Math.sin(t + i), curRGB, z.str * 0.30);
        }
      }

      tRef.current += 0.012;
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
}
