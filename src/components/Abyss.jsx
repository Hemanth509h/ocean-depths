import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useDepthAnimations } from '../hooks/useDepthAnimations';
import { useReveal } from '../hooks/useReveal';
import ThreeVolumetricDots from './ThreeVolumetricDots';

// Seeded pseudo-random so each session is slightly different
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateProceduralElements(seed) {
  const rand = seededRand(seed);
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: rand() * 90 + 5,
    y: rand() * 85 + 5,
    size: rand() * 4 + 1,
    opacity: rand() * 0.25 + 0.02,
    speed: rand() * 0.4 + 0.05,
    phase: rand() * Math.PI * 2,
    type: Math.floor(rand() * 3), // 0 = dot, 1 = cross, 2 = ring
  }));
}

const EASTER_EGGS = [
  { id: 0, x: 72, y: 38, secret: 'You found it. Something is watching you.' },
  { id: 1, x: 18, y: 67, secret: 'A signal from unknown depths. Unidentified.' },
];

export default function Abyss({ audioRef }) {
  const { zoneProgress, scrollVelocity } = useScrollDepth();
  const { brightness, particleSpeedMult, shakeIntensity } = useDepthAnimations();
  const seed = useMemo(() => Math.floor(Date.now() / 60000), []); // changes each visit
  const elements = useMemo(() => generateProceduralElements(seed), [seed]);
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const [foundEgg, setFoundEgg] = useState(null);
  const sectionRef = useRef(null);
  const revealRef  = useReveal({ stagger: 110 });
  const [showThree, setShowThree] = useState(false);

  useEffect(() => {
    // Show Three.js field only after zone entry for performance
    const timer = setTimeout(() => setShowThree(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  /* ── Procedural canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = parent.offsetWidth; canvas.height = parent.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const animate = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements.forEach(el => {
        const x = (el.x / 100) * canvas.width;
        // Speed scales with depth
        const verticalMove = Math.sin(ts * el.speed * 0.001 * particleSpeedMult * 10 + el.phase);
        const y = ((el.y + verticalMove * 2) / 100) * canvas.height;
        const breathe = 0.5 + 0.5 * Math.sin(ts * 0.001 * el.speed + el.phase);
        const alpha = el.opacity * breathe * (0.3 + zoneProgress * 0.7) * brightness;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#03045e';

        if (el.type === 0) {
          ctx.beginPath();
          ctx.arc(x, y, el.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (el.type === 1) {
          ctx.fillRect(x - el.size / 2, y - el.size * 2, el.size, el.size * 4);
          ctx.fillRect(x - el.size * 2, y - el.size / 2, el.size * 4, el.size);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, el.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(3,4,94,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // The Ancient One — massive silhouette with bioluminescent eyes
      const t = ts * 0.0002;
      const ex = canvas.width * 0.5 + Math.sin(t * 0.5) * 100;
      const ey = canvas.height * 0.6 + Math.cos(t * 0.3) * 40;
      
      // Giant Body
      ctx.save();
      ctx.globalAlpha = (0.02 + Math.sin(ts * 0.0005) * 0.01) * brightness;
      const bodyGrd = ctx.createRadialGradient(ex, ey, 0, ex, ey, 400);
      bodyGrd.addColorStop(0, '#023e8a');
      bodyGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = bodyGrd;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 350, 150, Math.sin(t) * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Occasional glowing eyes
      const eyeBlink = Math.max(0, Math.sin(ts * 0.0004));
      if (eyeBlink > 0.8) {
        ctx.globalAlpha = (eyeBlink - 0.8) * 2;
        ctx.fillStyle = '#90e0ef';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#90e0ef';
        // Left eye
        ctx.beginPath();
        ctx.arc(ex - 60, ey - 20, 4, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.arc(ex + 60, ey - 20, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [elements, zoneProgress]);

  const handleEasterEgg = (egg, e) => {
    e.stopPropagation();
    setFoundEgg(egg);
    if (audioRef?.current?.ping) audioRef.current.ping(220, 1.5);
    setTimeout(() => setFoundEgg(null), 4000);
  };

  return (
    <section
      ref={sectionRef}
      id="abyss"
      className="zone-section abyss-section"
      aria-label="The Abyss — beyond 11000 metres"
    >
      {showThree && <ThreeVolumetricDots count={350} opacity={0.2 * brightness} color="#0077b6" />}
      
      {/* Dynamic mouse-following glow flashlight (Global Layer) */}
      <div className="mouse-glow" aria-hidden="true" />

      <canvas ref={canvasRef} className="zone-canvas abyss-canvas" aria-hidden="true" />
      <div 
        className="abyss-inner-wrapper" 
        style={{ transform: `translate(${(Math.random()-0.5)*shakeIntensity*1.5}px, ${(Math.random()-0.5)*shakeIntensity*1.5}px)` }}
      >

      {/* Easter eggs */}
      {EASTER_EGGS.map(egg => (
        <button
          key={egg.id}
          className="easter-egg-spot"
          style={{ left: `${egg.x}%`, top: `${egg.y}%` }}
          onClick={(e) => handleEasterEgg(egg, e)}
          aria-label="Hidden interaction"
          title="Something lurks here…"
        />
      ))}

      {/* Easter egg reveal */}
      {foundEgg && (
        <div className="easter-egg-reveal" role="alert">
          <div className="egg-text">{foundEgg.secret}</div>
        </div>
      )}

      <div className="zone-content abyss-content">
        <div className="zone-label-badge abyss-badge">⚫ The Abyss · 11,000m+</div>
        <h2 className="zone-title abyss-title">The End of the World</h2>
        <p className="zone-body abyss-body">
          You have reached the deepest place on Earth.<br />
          The Mariana Trench. The Challenger Deep.<br />
          <em>Where even light has surrendered.</em>
        </p>
        <p className="zone-body abyss-body" style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: '1rem' }}>
          Here, things move that have never been named.<br />
          You are not alone.
        </p>

        <div className="abyss-final-stat">
          <span className="final-depth">36,000 m</span>
          <span className="final-label">Maximum Depth · Challenger Deep</span>
        </div>

        <div className="abyss-restart-hint">
          <span>↑ Scroll back to the surface</span>
        </div>
      </div>

      {/* Journey complete overlay effect */}
      <div className="abyss-vignette" aria-hidden="true" />
      </div>
    </section>
  );
}
