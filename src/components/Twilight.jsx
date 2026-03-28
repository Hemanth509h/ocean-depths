import React, { useRef, useEffect } from 'react';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useReveal } from '../hooks/useReveal';

const CREATURES = [
  { emoji: '🪼', name: 'Jellyfish', desc: 'No brain, no heart, no blood — yet they\'ve survived 500 million years.' },
  { emoji: '🦑', name: 'Giant Squid', desc: 'Eyes the size of dinner plates. They hunt in complete darkness.' },
  { emoji: '🐙', name: 'Cuttlefish', desc: 'Can change colour in milliseconds. Intelligent beyond measure.' },
];

export default function Twilight() {
  const { scrollVelocity } = useScrollDepth();
  const sectionRef = useRef(null);
  const jellyRef   = useRef([]);
  const canvasRef  = useRef(null);
  const revealRef  = useReveal({ stagger: 100 });

  /* ── Background Jellyfish Animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const jellies = Array.from({ length: 5 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 30 + Math.random() * 40,
      speed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawJelly = (j, t) => {
      const w = canvas.width;
      const h = canvas.height;
      const breathe = Math.sin(t * 0.001 + j.phase);
      const px = (j.x / 100) * w;
      const py = ((j.y - t * j.speed) % 120 + 120) % 120 - 10;
      const actualY = (py / 100) * h;

      ctx.save();
      ctx.translate(px, actualY);
      
      // Bell
      ctx.beginPath();
      ctx.arc(0, 0, j.size + breathe * 5, Math.PI, 0);
      ctx.fillStyle = `rgba(144, 224, 239, ${0.1 + Math.abs(breathe) * 0.05})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(144, 224, 239, ${0.3 + Math.abs(breathe) * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tentacles
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const tx = (i - 2.5) * (j.size * 0.3);
        ctx.moveTo(tx, 0);
        const ty = j.size * 1.5 + Math.sin(t * 0.002 + i) * 10;
        ctx.quadraticCurveTo(tx + Math.sin(t * 0.003 + i) * 10, ty / 2, tx, ty);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const animate = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      jellies.forEach(j => drawJelly(j, t));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Lag/delay effect on creature cards
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.twilight-creature');
    if (!cards) return;
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.15 + scrollVelocity * 0.05}s`;
    });
  }, [scrollVelocity]);

  return (
    <section
      ref={sectionRef}
      id="twilight"
      className="zone-section twilight-section"
      aria-label="Twilight Zone – 1000 to 4000 metres"
    >
      <canvas ref={canvasRef} className="zone-canvas" style={{ opacity: 0.6 }} aria-hidden="true" />
      {/* Multi-layer depth fog */}
      <div className="twilight-fog-layer fog-layer-1" aria-hidden="true" />
      <div className="twilight-fog-layer fog-layer-2" aria-hidden="true" />
      <div className="twilight-fog-layer fog-layer-3" aria-hidden="true" />

      {/* Bioluminescent particles */}
      <div className="bio-particles" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className={`bio-dot bio-dot-${i % 6}`} style={{
            left: `${(i * 37 + 5) % 100}%`,
            top:  `${(i * 53 + 10) % 100}%`,
            animationDelay: `${(i * 0.7) % 5}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }} />
        ))}
      </div>

      <div ref={revealRef} className="zone-content twilight-content">
        <div className="zone-label-badge reveal-item">🌌 Twilight Zone · 1,000–4,000m</div>
        <h2 className="zone-title reveal-item" style={{ transitionDelay: '0.1s' }}>Where Light Dies</h2>
        <p className="zone-body reveal-item" style={{ transitionDelay: '0.2s' }}>
          Sunlight fades. Only a dim blue glow remains — barely enough to see.
          Creatures here have evolved eyes thirty times more sensitive than yours.
          Some carry their own light. The pressure exceeds 400 atmospheres.
          <em> You can feel the weight of the water above you.</em>
        </p>

        <div className="creatures-grid reveal-item" style={{ transitionDelay: '0.3s' }}>
          {CREATURES.map((c, i) => (
            <div
              key={i}
              ref={el => jellyRef.current[i] = el}
              className="twilight-creature"
              tabIndex={0}
              role="article"
              aria-label={c.name}
            >
              <div className="creature-emoji">{c.emoji}</div>
              <div className="creature-name">{c.name}</div>
              <div className="creature-desc">{c.desc}</div>
              <div className="creature-glow-ring" aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className="twilight-pressure-block reveal-item" style={{ transitionDelay: '0.4s' }}>
          <span className="pressure-number">400×</span>
          <span className="pressure-label">Surface Pressure</span>
        </div>
      </div>

      {/* Hover distortion overlay */}
      <div className="hover-distortion-overlay" aria-hidden="true" />
    </section>
  );
}
