import React, { useEffect, useRef, useState } from 'react';
import { DepthProvider, useDepth } from './context/DepthContext';
import { useScrollDepth } from './hooks/useScrollDepth';
import { useAudio } from './hooks/useAudio';
import { ZONE_COLORS, getZoneIndex, lerp } from './utils/depthUtils';
import Hero from './components/Hero';
import Sunlight from './components/Sunlight';
import Twilight from './components/Twilight';
import Midnight from './components/Midnight';
import Abyss from './components/Abyss';
import DepthHUD from './components/DepthHUD';
import ParticleCanvas from './components/ParticleCanvas';
import CursorFollower from './components/CursorFollower';
import Lenis from 'lenis';

function OceanExperience() {
  const { scrollRatio, zoneIndex, scrollVelocity } = useScrollDepth();
  const audio = useAudio();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const [muted, setMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const bgRef = useRef(null);
  const prevZoneRef = useRef(0);

  /* ── Smooth Scroll (Lenis) ────────────────────────────────────── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  /* ── Dynamic background color grading ─────────────────────────── */
  useEffect(() => {
    if (!bgRef.current) return;
    const zi = zoneIndex;
    const nextZi = Math.min(zi + 1, ZONE_COLORS.length - 1);
    const ZONE_SCROLL_RANGES = [[0,0.05],[0.05,0.30],[0.30,0.58],[0.58,0.80],[0.80,1.00]];
    const [min, max] = ZONE_SCROLL_RANGES[zi];
    const localT = Math.max(0, Math.min((scrollRatio - min) / (max - min), 1));

    const c0 = ZONE_COLORS[zi];
    const c1 = ZONE_COLORS[nextZi];

    const interpHex = (a, b, t) => {
      const ai = parseInt(a.slice(1), 16);
      const bi = parseInt(b.slice(1), 16);
      const r = Math.round(lerp((ai >> 16) & 0xff, (bi >> 16) & 0xff, t));
      const g = Math.round(lerp((ai >> 8)  & 0xff, (bi >> 8)  & 0xff, t));
      const bv= Math.round(lerp( ai        & 0xff,  bi        & 0xff, t));
      return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bv.toString(16).padStart(2,'0')}`;
    };

    const sky = interpHex(c0.sky, c1.sky, localT);
    const mid = interpHex(c0.mid, c1.mid, localT);
    const deep= interpHex(c0.deep,c1.deep,localT);

    bgRef.current.style.background = `radial-gradient(ellipse at 50% 0%, ${sky} 0%, ${mid} 40%, ${deep} 100%)`;
  }, [scrollRatio, zoneIndex]);

  /* ── Audio zone updates ───────────────────────────────────────── */
  useEffect(() => {
    if (!audioStarted) return;
    const ZONE_NAMES = ['surface','sunlight','twilight','midnight','abyss'];
    if (zoneIndex !== prevZoneRef.current) {
      audio.setZone(ZONE_NAMES[zoneIndex]);
      prevZoneRef.current = zoneIndex;
    }
  }, [zoneIndex, audioStarted, audio]);

  /* ── Motion blur on fast scroll ──────────────────────────────── */
  useEffect(() => {
    const root = document.documentElement;
    if (scrollVelocity > 4) {
      root.style.setProperty('--motion-blur', `${Math.min(scrollVelocity * 1.2, 8)}px`);
    } else {
      root.style.setProperty('--motion-blur', '0px');
    }
  }, [scrollVelocity]);

  const handleFirstInteraction = () => {
    if (!audioStarted) {
      audio.start();
      setAudioStarted(true);
    }
  };

  const handleToggleMute = () => {
    const nowMuted = audio.toggleMute();
    setMuted(nowMuted);
  };

  return (
    <div
      className={`ocean-wrapper zone-${['surface','sunlight','twilight','midnight','abyss'][zoneIndex]}`}
      onClick={handleFirstInteraction}
    >
      {/* Dynamic background */}
      <div ref={bgRef} className="ocean-bg" aria-hidden="true" />

      {/* Global particle layer */}
      <ParticleCanvas />

      {/* Custom cursor */}
      <CursorFollower />

      {/* HUD */}
      <DepthHUD
        onToggleMute={handleToggleMute}
        muted={muted}
        audioStarted={audioStarted}
      />

      {/* Story sections */}
      <main className="ocean-main">
        <Hero audioRef={audioRef} />
        <Sunlight />
        <Twilight />
        <Midnight />
        <Abyss audioRef={audioRef} />
      </main>

      {/* Global overlay vignette */}
      <div className="global-vignette" aria-hidden="true" />
    </div>
  );
}

export default function App() {
  return (
    <DepthProvider>
      <OceanExperience />
    </DepthProvider>
  );
}
