import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { scrollToDepth, getZoneIndex, ZONE_NAMES, depthToPressure } from '../utils/depthUtils';

const DepthContext = createContext(null);

export function DepthProvider({ children }) {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [depth, setDepth] = useState(0);
  const [zoneIndex, setZoneIndex] = useState(0);
  const [pressure, setPressure] = useState('1.0');
  const [introComplete, setIntroComplete] = useState(false);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const rafRef = useRef(null);

  useEffect(() => {
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

      const now = Date.now();
      const dt = Math.max(now - lastScrollTime.current, 1);
      const vel = Math.abs(scrollY - lastScrollY.current) / dt;

      lastScrollY.current = scrollY;
      lastScrollTime.current = now;

      setScrollRatio(ratio);
      setScrollVelocity(vel);
      setDepth(scrollToDepth(ratio));
      setZoneIndex(getZoneIndex(ratio));
      setPressure(depthToPressure(scrollToDepth(ratio)));
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const value = {
    scrollRatio,
    scrollVelocity,
    depth,
    zoneIndex,
    zoneName: ZONE_NAMES[zoneIndex],
    pressure,
    introComplete,
    setIntroComplete,
  };

  return <DepthContext.Provider value={value}>{children}</DepthContext.Provider>;
}

export function useDepth() {
  const ctx = useContext(DepthContext);
  if (!ctx) throw new Error('useDepth must be used within DepthProvider');
  return ctx;
}
