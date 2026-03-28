import React, { useEffect, useRef } from 'react';
import { useDepth } from '../context/DepthContext';

const CURSOR_STYLES = [
  { scale: 1.0, color: '#90e0ef', glow: 20, label: 'default'  },
  { scale: 1.1, color: '#48cae4', glow: 24, label: 'explore'  },
  { scale: 0.9, color: '#0096c7', glow: 18, label: 'descend'  },
  { scale: 0.7, color: '#023e8a', glow: 12, label: 'pressure' },
  { scale: 0.5, color: '#03045e', glow: 6,  label: 'abyss'    },
];

export default function CursorFollower() {
  const dotRef   = useRef(null);
  const trailRef = useRef(null);
  const posRef   = useRef({ x: -100, y: -100 });
  const lerpPosRef = useRef({ x: -100, y: -100 });
  const rafRef   = useRef(null);
  const { zoneIndex, scrollVelocity } = useDepth();

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const style = CURSOR_STYLES[zoneIndex] || CURSOR_STYLES[0];
    const lagFactor = 0.08 + zoneIndex * 0.03; // increases inertia with depth

    const animate = () => {
      lerpPosRef.current.x += (posRef.current.x - lerpPosRef.current.x) * lagFactor;
      lerpPosRef.current.y += (posRef.current.y - lerpPosRef.current.y) * lagFactor;

      const qx = lerpPosRef.current.x;
      const qy = lerpPosRef.current.y;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${qx}px, ${qy}px) scale(${style.scale})`;
        trailRef.current.style.boxShadow = `0 0 ${style.glow}px ${style.color}`;
        trailRef.current.style.borderColor = style.color;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        dotRef.current.style.backgroundColor = style.color;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [zoneIndex]);

  if ('ontouchstart' in window) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={trailRef} className="cursor-trail" aria-hidden="true">
        <div className="cursor-inner-ring" />
      </div>
    </>
  );
}
