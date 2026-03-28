import React, { useEffect, useRef } from 'react';
import { useDepth } from '../context/DepthContext';

const ZONE_STYLES = [
  { color: '#90e0ef', glowColor: 'rgba(144,224,239,0.35)', trailGlow: 22, auraSize: 90,  auraOpacity: 0.12, scale: 1.0  },
  { color: '#48cae4', glowColor: 'rgba(72,202,228,0.35)',  trailGlow: 26, auraSize: 100, auraOpacity: 0.14, scale: 1.1  },
  { color: '#0096c7', glowColor: 'rgba(0,150,199,0.40)',   trailGlow: 22, auraSize: 110, auraOpacity: 0.18, scale: 0.9  },
  { color: '#48cae4', glowColor: 'rgba(144,224,239,0.55)', trailGlow: 32, auraSize: 130, auraOpacity: 0.28, scale: 0.8  },
  { color: '#90e0ef', glowColor: 'rgba(144,224,239,0.70)', trailGlow: 42, auraSize: 160, auraOpacity: 0.40, scale: 0.65 },
];

export default function CursorFollower() {
  const dotRef   = useRef(null);
  const trailRef = useRef(null);
  const auraRef  = useRef(null);
  const posRef      = useRef({ x: -200, y: -200 });
  const trailPos    = useRef({ x: -200, y: -200 });
  const auraPos     = useRef({ x: -200, y: -200 });
  const rafRef      = useRef(null);
  const clickRipples = useRef([]);
  const rippleContainerRef = useRef(null);
  const { zoneIndex } = useDepth();
  const zoneRef = useRef(zoneIndex);

  useEffect(() => { zoneRef.current = zoneIndex; }, [zoneIndex]);

  useEffect(() => {
    if ('ontouchstart' in window) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      // Update CSS vars for the full-screen mouse glow
      const xPct = (e.clientX / window.innerWidth)  * 100;
      const yPct = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mx', `${xPct}%`);
      document.documentElement.style.setProperty('--my', `${yPct}%`);
    };
    window.addEventListener('mousemove', onMove);

    const onClick = (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'cursor-click-ripple';
      const s = ZONE_STYLES[zoneRef.current] || ZONE_STYLES[0];
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top:  ${e.clientY}px;
        width: 0; height: 0;
        border-radius: 50%;
        border: 1.5px solid ${s.color};
        box-shadow: 0 0 12px ${s.color};
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        z-index: 9998;
        animation: cursorRipple 0.7s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    };
    window.addEventListener('click', onClick);

    const animate = () => {
      const s = ZONE_STYLES[zoneRef.current] || ZONE_STYLES[0];
      const lagTrail = 0.10 + zoneRef.current * 0.025;
      const lagAura  = 0.05 + zoneRef.current * 0.012;

      trailPos.current.x += (posRef.current.x - trailPos.current.x) * lagTrail;
      trailPos.current.y += (posRef.current.y - trailPos.current.y) * lagTrail;

      auraPos.current.x  += (posRef.current.x - auraPos.current.x)  * lagAura;
      auraPos.current.y  += (posRef.current.y - auraPos.current.y)  * lagAura;

      const tx = trailPos.current.x;
      const ty = trailPos.current.y;
      const ax = auraPos.current.x;
      const ay = auraPos.current.y;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        dotRef.current.style.background = s.color;
        dotRef.current.style.boxShadow  = `0 0 8px 2px ${s.color}`;
      }

      if (trailRef.current) {
        trailRef.current.style.transform  = `translate(${tx}px, ${ty}px) scale(${s.scale})`;
        trailRef.current.style.borderColor = s.color;
        trailRef.current.style.boxShadow  = `0 0 ${s.trailGlow}px ${s.color}, inset 0 0 ${s.trailGlow * 0.5}px ${s.glowColor}`;
      }

      if (auraRef.current) {
        const half = s.auraSize / 2;
        auraRef.current.style.transform = `translate(${ax - half}px, ${ay - half}px)`;
        auraRef.current.style.width     = `${s.auraSize}px`;
        auraRef.current.style.height    = `${s.auraSize}px`;
        auraRef.current.style.opacity   = `${s.auraOpacity}`;
        auraRef.current.style.background = `radial-gradient(circle, ${s.glowColor} 0%, transparent 70%)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if ('ontouchstart' in window) return null;

  return (
    <>
      <div ref={auraRef}  className="cursor-aura"  aria-hidden="true" />
      <div ref={dotRef}   className="cursor-dot"   aria-hidden="true" />
      <div ref={trailRef} className="cursor-trail" aria-hidden="true">
        <div className="cursor-inner-ring" />
      </div>
    </>
  );
}
