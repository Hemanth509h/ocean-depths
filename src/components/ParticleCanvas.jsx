import React, { useEffect, useRef } from 'react';
import { useDepth } from '../context/DepthContext';
import { PARTICLE_CONFIG } from '../utils/animationConfig';
import { ZONE_NAMES as ZONE_NAME_LIST } from '../utils/depthUtils';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);
  const { zoneIndex } = useDepth();
  const zoneName = ZONE_NAME_LIST[zoneIndex] || 'surface';

  const createParticle = (w, h, cfg) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * cfg.speed,
    vy: -(Math.random() * cfg.speed * 0.5 + 0.05),
    r: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
    opacity: Math.random() * cfg.opacity,
    life: 1,
    decay: 0.002 + Math.random() * 0.004,
    color: cfg.color,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const getCfg = () => PARTICLE_CONFIG[zoneName] || PARTICLE_CONFIG.surface;

    // Spawn initial particles
    const spawnParticles = () => {
      const cfg = getCfg();
      const reduce = window.innerWidth < 768 ? 0.4 : 1; // mobile reduction
      const target = Math.floor(cfg.count * reduce);
      while (particles.current.length < target) {
        particles.current.push(createParticle(canvas.width, canvas.height, cfg));
      }
      while (particles.current.length > target) {
        particles.current.pop();
      }
    };
    spawnParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cfg = getCfg();

      particles.current = particles.current.filter(p => p.life > 0.01);

      // Respawn
      const reduce = window.innerWidth < 768 ? 0.4 : 1;
      const target = Math.floor(cfg.count * reduce);
      while (particles.current.length < target) {
        const p = createParticle(canvas.width, canvas.height, cfg);
        p.y = canvas.height + 5; // spawn at bottom
        particles.current.push(p);
      }

      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.y < -10) { p.y = canvas.height + 5; p.life = 1; }

        ctx.globalAlpha = p.life * p.opacity;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [zoneName]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
