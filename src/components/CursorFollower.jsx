import React, { useEffect, useRef } from 'react';
import { useDepth } from '../context/DepthContext';

const ZONE_STYLES = [
  { color: '#90e0ef', glowColor: 'rgba(144,224,239,0.45)', trailGlow: 24, scale: 1.0  },
  { color: '#48cae4', glowColor: 'rgba(72,202,228,0.45)',  trailGlow: 28, scale: 1.05 },
  { color: '#90e0ef', glowColor: 'rgba(0,180,216,0.50)',   trailGlow: 28, scale: 0.95 },
  { color: '#48cae4', glowColor: 'rgba(144,224,239,0.65)', trailGlow: 36, scale: 0.85 },
  { color: '#90e0ef', glowColor: 'rgba(144,224,239,0.80)', trailGlow: 48, scale: 0.70 },
];

export default function CursorFollower() {
  const dotRef   = useRef(null);
  const trailRef = useRef(null);
  const posRef   = useRef({ x: -400, y: -400 });
  const trailPos = useRef({ x: -400, y: -400 });
  const rafRef   = useRef(null);
  const { zoneIndex } = useDepth();
  const zoneRef  = useRef(zoneIndex);

  useEffect(() => { zoneRef.current = zoneIndex; }, [zoneIndex]);

  useEffect(() => {
    if ('ontouchstart' in window) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const onClick = (e) => {
      const s = ZONE_STYLES[zoneRef.current] || ZONE_STYLES[0];
      for (let i = 0; i < 3; i++) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 0; height: 0;
          border-radius: 50%;
          border: ${i === 0 ? 1.5 : 1}px solid ${s.color};
          box-shadow: 0 0 ${10 + i * 6}px ${s.color};
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 9998;
          animation: cursorRipple ${0.55 + i * 0.18}s ease-out forwards;
          animation-delay: ${i * 0.07}s;
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 900);
      }
    };
    window.addEventListener('click', onClick);

    const animate = () => {
      const s   = ZONE_STYLES[zoneRef.current] || ZONE_STYLES[0];
      const lag = 0.12 + zoneRef.current * 0.022;

      trailPos.current.x += (posRef.current.x - trailPos.current.x) * lag;
      trailPos.current.y += (posRef.current.y - trailPos.current.y) * lag;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x - 3}px, ${posRef.current.y - 3}px)`;
        dotRef.current.style.background   = s.color;
        dotRef.current.style.boxShadow    = `0 0 10px 3px ${s.color}`;
      }

      if (trailRef.current) {
        const hs = (18 * s.scale);
        trailRef.current.style.transform  = `translate(${trailPos.current.x - hs}px, ${trailPos.current.y - hs}px) scale(${s.scale})`;
        trailRef.current.style.borderColor = s.color;
        trailRef.current.style.boxShadow  = `0 0 ${s.trailGlow}px ${s.color}, inset 0 0 ${s.trailGlow * 0.4}px ${s.glowColor}`;
        trailRef.current.style.width  = `${36 * s.scale}px`;
        trailRef.current.style.height = `${36 * s.scale}px`;
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
      <div ref={dotRef}   className="cursor-dot"   aria-hidden="true" />
      <div ref={trailRef} className="cursor-trail"  aria-hidden="true">
        <div className="cursor-inner-ring" />
      </div>
    </>
  );
}
