import React, { useEffect, useRef, useState } from 'react';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useReveal } from '../hooks/useReveal';

const NUM_FISH = 12;

function generateFish() {
  return Array.from({ length: NUM_FISH }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 60 + 15,
    size: Math.random() * 18 + 8,
    speed: Math.random() * 0.4 + 0.2,
    amplitude: Math.random() * 30 + 15,
    frequency: Math.random() * 0.02 + 0.008,
    phase: Math.random() * Math.PI * 2,
    color: ['#90e0ef', '#48cae4', '#00b4d8', '#caf0f8', '#ade8f4'][i % 5],
    dir: Math.random() > 0.5 ? 1 : -1,
    species: i % 3,
  }));
}

const FISH_DATA = generateFish();

const FACT_CARDS = [
  {
    front: { icon: '🐠', text: <p>Over <strong>90%</strong> of all marine species live in this zone.</p> },
    back:  { icon: '🔬', text: <p>Scientists estimate <strong>700,000+</strong> undiscovered species still hide here.</p> },
  },
  {
    front: { icon: '🌡️', text: <p>Temperature drops from <strong>20°C → 4°C</strong> as you descend.</p> },
    back:  { icon: '❄️', text: <p>Below 200m, temperature plummets through the <strong>thermocline</strong> — a sharp invisible wall.</p> },
  },
  {
    front: { icon: '🌊', text: <p>Sunlight penetrates only <strong>200m</strong> into the ocean.</p> },
    back:  { icon: '🌑', text: <p>Below 1,000m it is <strong>total darkness — forever.</strong> No photosynthesis can occur.</p> },
  },
];

export default function Sunlight() {
  const { scrollVelocity } = useScrollDepth();
  const canvasRef  = useRef(null);
  const fishRef    = useRef(FISH_DATA.map(f => ({ ...f })));
  const rafRef     = useRef(null);
  const sectionRef = useRef(null);
  const timeRef    = useRef(0);
  const scatterRef = useRef(false);
  const revealRef  = useReveal({ stagger: 120 });
  const [flippedCard, setFlippedCard] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Rare Giant Silhouette ── */
    const giant = {
      x: -50,
      y: 40,
      w: 180,
      h: 50,
      speed: 0.15,
      active: true
    };

    const drawGiant = (t) => {
      giant.x += giant.speed;
      if (giant.x > 150) giant.x = -100;
      
      const px = (giant.x / 100) * canvas.width;
      const py = (giant.y / 100) * canvas.height + Math.sin(t * 0.0005) * 20;

      ctx.save();
      ctx.translate(px, py);
      ctx.beginPath();
      ctx.ellipse(0, 0, giant.w, giant.h, Math.sin(t * 0.0002) * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(2, 62, 138, 0.08)';
      ctx.fill();
      
      // Tail fluke
      ctx.beginPath();
      ctx.moveTo(-giant.w * 0.8, 0);
      const wag = Math.sin(t * 0.001) * 15;
      ctx.lineTo(-giant.w * 1.2, wag);
      ctx.lineTo(-giant.w * 1.2, -wag);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawFish = (fish, t) => {
      const w = canvas.width;
      const h = canvas.height;

      fish.x += fish.dir * fish.speed * (scatterRef.current ? 4 : 1);
      fish.y = fish.y + Math.sin(t * fish.frequency + fish.phase) * 0.3;

      if (fish.x > 105) { fish.x = -5; fish.dir = 1; }
      if (fish.x < -5)  { fish.x = 105; fish.dir = -1; }
      fish.y = Math.max(5, Math.min(95, fish.y));

      const px = (fish.x / 100) * w;
      const py = (fish.y / 100) * h;
      const flip = fish.dir < 0;

      ctx.save();
      ctx.translate(px, py);
      if (flip) ctx.scale(-1, 1);

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, fish.size, fish.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = fish.color;
      ctx.globalAlpha = 0.65 + Math.sin(t * 0.5 + fish.phase) * 0.1;
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(-fish.size * 0.8, 0);
      const tailWag = Math.sin(t * fish.frequency * 60 + fish.phase) * fish.size * 0.5;
      ctx.lineTo(-fish.size * 1.5, tailWag * 0.6);
      ctx.lineTo(-fish.size * 1.5, -tailWag * 0.6);
      ctx.closePath();
      ctx.fillStyle = fish.color;
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(fish.size * 0.5, -fish.size * 0.1, fish.size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#001845';
      ctx.globalAlpha = 0.9;
      ctx.fill();

      ctx.restore();
    };

    const drawRays = (t) => {
      const w = canvas.width;
      const h = canvas.height;
      const numRays = 8;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI - Math.PI / 2;
        const x = w * 0.35 + Math.sin(t * 0.0003 + i) * 40;
        const speed = 1 + scrollVelocity * 0.2;
        const len = (h * 0.8) * (0.7 + 0.3 * Math.sin(t * 0.0007 * speed + i));
        const grd = ctx.createLinearGradient(x, 0, x + Math.sin(angle) * len, len);
        grd.addColorStop(0, 'rgba(144,224,239,0.18)');
        grd.addColorStop(1, 'rgba(0,119,182,0)');
        ctx.save();
        ctx.translate(x, 0);
        ctx.rotate(angle * 0.15);
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.lineTo(40, len);
        ctx.lineTo(-40, len);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.restore();
      }
    };

    const drawBubbles = (t) => {
      for (let i = 0; i < 15; i++) {
        const bx = ((Math.sin(t * 0.001 * (i + 1) + i * 0.7) + 1) / 2) * canvas.width;
        const by = ((t * 0.05 * (i * 0.3 + 0.2) + i * 120) % canvas.height);
        ctx.beginPath();
        ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(144,224,239,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const animate = (ts) => {
      timeRef.current = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      drawGiant(ts);
      drawRays(ts);
      drawBubbles(ts);
      fishRef.current.forEach(f => drawFish(f, ts));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Scatter fish on hover
    const onMouseMove = () => {
      scatterRef.current = true;
      setTimeout(() => { scatterRef.current = false; }, 600);
    };
    canvas.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [scrollVelocity]);

  const toggleCard = (i) => setFlippedCard(prev => prev === i ? -1 : i);

  return (
    <section
      ref={sectionRef}
      id="sunlight"
      className="zone-section sunlight-section"
      aria-label="Sunlight Zone – 200 to 1000 metres"
    >
      <canvas ref={canvasRef} className="zone-canvas" aria-hidden="true" />

      <div ref={revealRef} className="zone-content sunlight-content">
        <div className="zone-label-badge reveal-item">☀️ Sunlight Zone · 200–1,000m</div>
        <h2 className="zone-title reveal-item" data-text="Life in the Light" style={{ transitionDelay: '0.12s' }}>Life in the Light</h2>
        <p className="zone-body reveal-item" style={{ transitionDelay: '0.24s' }}>
          Here, sunlight still dances through the water. Coral reefs thrive.
          Schools of fish dart in synchrony. This is the ocean the world knows—
          but even here, the darkness begins its approach below you.
        </p>

        <div className="fact-cards-grid reveal-item" style={{ transitionDelay: '0.36s' }}>
          {FACT_CARDS.map((card, i) => (
            <div
              key={i}
              id={`fact-card-${i}`}
              className={`flip-card${flippedCard === i ? ' flipped' : ''}`}
              tabIndex={0}
              role="button"
              aria-label={`Fact ${i + 1}. Hover or press Enter to reveal a deeper fact.`}
              onClick={() => toggleCard(i)}
              onKeyDown={e => e.key === 'Enter' && toggleCard(i)}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="fact-icon">{card.front.icon}</div>
                  {card.front.text}
                </div>
                <div className="flip-card-back">
                  <div className="fact-icon">{card.back.icon}</div>
                  {card.back.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="flip-hint">Hover or tap cards to reveal deeper facts</p>
      </div>
    </section>
  );
}
