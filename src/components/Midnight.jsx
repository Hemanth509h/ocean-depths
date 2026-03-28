import React, { useRef, useEffect, useState } from 'react';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useDepthAnimations } from '../hooks/useDepthAnimations';
import { useReveal } from '../hooks/useReveal';
import ThreeVolumetricDots from './ThreeVolumetricDots';
import gsap from 'gsap';

export default function Midnight() {
  const { zoneProgress, scrollVelocity } = useScrollDepth();
  const { shakeIntensity, brightness, particleSpeedMult } = useDepthAnimations();
  const sectionRef = useRef(null);
  const shakeRef   = useRef(null);
  const canvasRef  = useRef(null);
  const revealRef  = useReveal({ stagger: 110 });
  const [showThree, setShowThree] = useState(false);

  useEffect(() => {
    // Show Three.js field only after zone entry for performance
    const timer = setTimeout(() => setShowThree(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  /* ── Bioluminescent Swarm Animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const count = 40;
    const shrimp = Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
    }));

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      shrimp.forEach(s => {
        const combinedSpeed = (s.vx + (scrollVelocity * 0.1 * (s.vx > 0 ? 1 : -1))) * particleSpeedMult;
        s.x += combinedSpeed * 10; // scale back since particleSpeedMult is small here
        s.y += s.vy * particleSpeedMult * 10;

        // Flocking-ish reset
        if (s.x < -10) s.x = 110;
        if (s.x > 110) s.x = -10;
        if (s.y < -10) s.y = 110;
        if (s.y > 110) s.y = -10;

        const px = (s.x / 100) * w;
        const py = (s.y / 100) * h;

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        const alpha = (0.4 + Math.sin(t * 0.005 + s.x) * 0.3) * brightness;
        ctx.fillStyle = `rgba(144, 224, 239, ${alpha})`;
        ctx.shadowBlur = 5 * brightness;
        ctx.shadowColor = '#90e0ef';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [scrollVelocity, particleSpeedMult, brightness]);

  // Screen shake based on depth progress
  useEffect(() => {
    const el = shakeRef.current;
    if (!el || shakeIntensity < 0.1) return;
    
    // Continuous shake instead of discrete GSAP animation
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, [shakeIntensity, zoneProgress]);

  return (
    <section
      ref={sectionRef}
      id="midnight"
      className="zone-section midnight-section"
      aria-label="Midnight Zone – 4000 metres and below"
    >
      {showThree && <ThreeVolumetricDots count={350} opacity={0.25} color="#0077b6" />}
      
      {/* Global mouse-following glow flashlight */}
      <div className="mouse-glow" aria-hidden="true" />
      
      <canvas ref={canvasRef} className="zone-canvas" style={{ opacity: 0.7 }} aria-hidden="true" />
      <div ref={shakeRef} className="midnight-inner">
        {/* Void particles */}
        <div className="void-particles" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`void-dot void-dot-${i % 4}`} style={{
              left:  `${(i * 17 + 3) % 100}%`,
              top:   `${(i * 29 + 7) % 100}%`,
              animationDelay: `${(i * 1.1) % 6}s`,
            }} />
          ))}
        </div>

        {/* Single anglerfish bioluminescence lure */}
        <div className="angler-lure-wrapper" aria-label="Anglerfish lure — bioluminescent light">
          <div className="angler-lure" />
          <div className="angler-glow" />
        </div>

        <div ref={revealRef} className="zone-content midnight-content">
          <div className="zone-label-badge reveal-item">🌑 Midnight Zone · 4,000m+</div>
          <h2 className="zone-title reveal-item" data-text="Total Darkness" style={{ transitionDelay: '0.1s' }}>Total Darkness</h2>
          <p className="zone-body reveal-item" style={{ transitionDelay: '0.2s' }}>
            No sunlight. No sound but the groan of the ship above.
            The only light is made by the creatures themselves — cold, alien, 
            and luring. The pressure here would crush a human body
            <em> like crumpling a tin can.</em>
          </p>

          <div className="midnight-stats reveal-item" style={{ transitionDelay: '0.3s' }}>
            <div className="stat-block">
              <span className="stat-value">−2°C</span>
              <span className="stat-label">Water Temperature</span>
            </div>
            <div className="stat-block">
              <span className="stat-value">0%</span>
              <span className="stat-label">Sunlight Remaining</span>
            </div>
            <div className="stat-block">
              <span className="stat-value">600×</span>
              <span className="stat-label">Surface Pressure</span>
            </div>
          </div>

          <div className="midnight-quote reveal-item" style={{ transitionDelay: '0.4s' }}>
            <blockquote>
              "In the deep sea, the most common sound is silence — 
              broken only by creatures we don't yet have names for."
            </blockquote>
          </div>
        </div>

        {/* Light absorption effect lines */}
        <div className="absorption-lines" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absorption-line" style={{
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
