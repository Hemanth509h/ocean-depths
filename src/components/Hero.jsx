import React, { useEffect, useRef } from 'react';
import { useDepth } from '../context/DepthContext';
import gsap from 'gsap';

const STATS = [
  { value: '71%',    label: 'of Earth covered by ocean' },
  { value: '36,000m', label: 'deepest point — Mariana Trench' },
  { value: '95%',    label: 'of ocean remains unexplored' },
];

export default function Hero({ audioRef }) {
  const canvasRef   = useRef(null);
  const heroRef     = useRef(null);
  const overlayRef  = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef    = useRef(null);
  const ctaRef      = useRef(null);
  const ripples     = useRef([]);
  const { setIntroComplete } = useDepth();

  /* ── Ripple canvas ───────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const addRipple = (x, y) => {
      ripples.current.push({ x, y, r: 0, maxR: 220, opacity: 0.75, speed: 4 });
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.current = ripples.current.filter(rp => rp.opacity > 0.01);
      ripples.current.forEach(rp => {
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(144, 224, 239, ${rp.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (rp.r > 50) {
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(144, 224, 239, ${rp.opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        rp.r       += rp.speed;
        rp.opacity *= 0.93;
      });
      animId = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    const onClick = (e) => {
      addRipple(e.clientX, e.clientY);
      if (audioRef?.current?.start) audioRef.current.start();
    };
    window.addEventListener('click', onClick);

    const autoRipple = setInterval(() => {
      if (document.hidden) return;
      addRipple(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.75),
      );
    }, window.innerWidth < 768 ? 5000 : 3000);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
      clearInterval(autoRipple);
    };
  }, [audioRef]);

  /* ── Cinematic intro sequence ────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setIntroComplete(true);
      },
    });

    tl.set(overlayRef.current,  { opacity: 1 })
      .to(overlayRef.current,   { opacity: 0, duration: 1.8, ease: 'power2.out' }, 0.3)
      .from(titleRef.current,   { opacity: 0, y: 50, duration: 1.6, ease: 'power3.out', clearProps: 'opacity,y,filter' }, 0.9)
      .from(subtitleRef.current,{ opacity: 0, y: 28, filter: 'blur(8px)', duration: 1.3, ease: 'power3.out' }, 1.5)
      .from(statsRef.current,   { opacity: 0, y: 20, duration: 1.0, ease: 'power2.out' }, 2.0)
      .from(ctaRef.current,     { opacity: 0, y: 16, duration: 0.9, ease: 'power2.out' }, 2.4);

    return () => tl.kill();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-section"
      aria-label="Ocean surface – start of journey"
    >
      {/* Dark intro overlay */}
      <div ref={overlayRef} className="intro-overlay" />

      {/* Ripple canvas */}
      <canvas ref={canvasRef} className="ripple-canvas" aria-hidden="true" />

      {/* Animated water layers */}
      <div className="wave-container" aria-hidden="true">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      {/* Seagulls */}
      <div className="surface-life" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`seagull seagull-${i}`}
            style={{ animationDelay: `${i * 8}s`, top: `${15 + i * 10}%` }}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,18L4,14V12L12,16L20,12V14L12,18Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Light caustics */}
      <div className="caustics" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`caustic caustic-${i}`} />
        ))}
      </div>

      {/* Hero content */}
      <div className="hero-content">
        <h1 ref={titleRef} className="hero-title">
          <span className="title-line-1">Ocean Depths</span>
          <span className="title-separator">—</span>
          <span className="title-line-2">Fear of the Deep</span>
        </h1>

        <p ref={subtitleRef} className="hero-subtitle">
          You stand at the edge of the known world.<br />
          Below you lies 36,000 metres of darkness, pressure,<br />
          and creatures science has barely begun to understand.<br />
          <em>Dare to descend?</em>
        </p>

        {/* Stat pills */}
        <div ref={statsRef} className="hero-stats">
          {STATS.map((s, i) => (
            <div key={i} className="hero-stat-pill">
              <span className="hero-stat-value">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA + down arrow */}
        <div ref={ctaRef} className="hero-cta">
          <p className="cta-audio-hint">🔊 Click anywhere to activate audio</p>
          <div className="hero-scroll-arrow" aria-label="Scroll down">
            <span className="scroll-label">Scroll to descend</span>
            <div className="arrow-bounce">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M6 10 L16 22 L26 10" stroke="#90e0ef" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"
                style={{ opacity: 0.45, marginTop: '-10px' }}>
                <path d="M6 10 L16 22 L26 10" stroke="#90e0ef" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Surface depth badge */}
      <div className="surface-depth-badge">
        <span className="depth-label">DEPTH</span>
        <span className="depth-value">0 m</span>
      </div>
    </section>
  );
}
