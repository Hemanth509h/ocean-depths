import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDepth } from '../context/DepthContext';
import gsap from 'gsap';

export default function Hero({ audioRef }) {
  const canvasRef   = useRef(null);
  const heroRef     = useRef(null);
  const overlayRef  = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef      = useRef(null);
  const ripples     = useRef([]);
  const { setIntroComplete } = useDepth();

  /* ── Ripple effect on canvas ─────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const addRipple = (x, y) => {
      ripples.current.push({ x, y, r: 0, maxR: 200, opacity: 0.8, speed: 4 });
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.current = ripples.current.filter(rp => rp.opacity > 0.01);
      ripples.current.forEach(rp => {
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(144, 224, 239, ${rp.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        rp.r += rp.speed;
        rp.opacity *= 0.93;
        // Secondary ring
        if (rp.r > 40) {
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(144, 224, 239, ${rp.opacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      animId = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    const onClick = (e) => {
      addRipple(e.clientX, e.clientY);
      // Start audio on first interaction
      if (audioRef?.current?.start) audioRef.current.start();
    };
    window.addEventListener('click', onClick);

    // Auto-ripple for visual flair (less frequent on mobile)
    const autoRipple = setInterval(() => {
      if (document.hidden) return;
      addRipple(
        Math.random() * window.innerWidth,
        Math.random() * (window.innerHeight * 0.7)
      );
    }, window.innerWidth < 768 ? 6000 : 3500);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
      clearInterval(autoRipple);
    };
  }, [audioRef]);

  /* ── Cinematic intro sequence ────────────────────────────────────── */
  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setIntroComplete(true);
      },
    });

    tl.set(overlayRef.current, { opacity: 1 })
      .to(overlayRef.current, { opacity: 0, duration: 1.8, ease: 'power2.out' }, 0.3)
      .from(titleRef.current, { opacity: 0, y: 60, filter: 'blur(20px)', duration: 1.8, ease: 'power3.out' }, 0.8)
      .from(subtitleRef.current, { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1.4, ease: 'power3.out' }, 1.4)
      .from(ctaRef.current, { opacity: 0, y: 20, duration: 1.0, ease: 'power2.out' }, 2.0);

    return () => tl.kill();
  }, []);

  /* ── Wave SVG parallax ──────────────────────────────────────────── */
  const { scrollRatio } = useDepth();

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

      {/* Surface Life: Seagulls */}
      <div className="surface-life" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`seagull seagull-${i}`} style={{
            animationDelay: `${i * 8}s`,
            top: `${15 + i * 10}%`
          }}>
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
          You stand at the surface.<br />
          Below you lies a world no human fully understands.<br />
          <em>Are you brave enough to descend?</em>
        </p>
        <div ref={ctaRef} className="hero-cta">
          <div className="cta-scroll-hint">
            <span>Scroll to descend</span>
            <div className="cta-arrow">
              <div className="arrow-shaft" />
              <div className="arrow-head" />
            </div>
          </div>
          <p className="cta-warning">⚠ Click anywhere to activate audio</p>
        </div>
      </div>

      {/* Surface depth display */}
      <div className="surface-depth-badge">
        <span className="depth-label">DEPTH</span>
        <span className="depth-value">0 m</span>
      </div>
    </section>
  );
}
