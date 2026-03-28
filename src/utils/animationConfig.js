// GSAP animation presets and ScrollTrigger configurations per zone

export const EASING = {
  smooth:   'power2.out',
  bouncy:   'elastic.out(1, 0.5)',
  slow:     'power4.inOut',
  water:    'sine.inOut',
};

// Per-zone particle config
export const PARTICLE_CONFIG = {
  surface:  { count: 60,  speed: 1.2, size: [1, 3],   opacity: 0.7, color: '#90e0ef' },
  sunlight: { count: 45,  speed: 0.9, size: [1, 2.5], opacity: 0.5, color: '#48cae4' },
  twilight: { count: 25,  speed: 0.5, size: [1, 2],   opacity: 0.3, color: '#0096c7' },
  midnight: { count: 12,  speed: 0.2, size: [0.5, 1.5],opacity: 0.2,color: '#023e8a' },
  abyss:    { count: 4,   speed: 0.1, size: [0.5, 1], opacity: 0.1, color: '#03045e' },
};

// Fish movement templates
export const FISH_PATHS = [
  { amplitude: 30, frequency: 0.015, speed: 1.4 },
  { amplitude: 50, frequency: 0.010, speed: 0.9 },
  { amplitude: 20, frequency: 0.025, speed: 1.8 },
  { amplitude: 40, frequency: 0.008, speed: 0.6 },
  { amplitude: 15, frequency: 0.030, speed: 2.2 },
];

// Text reveal animation presets
export const TEXT_REVEAL = {
  initial: { opacity: 0, y: 40, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)', duration: 1.2, ease: EASING.water },
};

// Sound track volume targets per zone
export const AUDIO_ZONES = {
  surface:  { ambient: 0.6, tension: 0.0, abyss: 0.0 },
  sunlight: { ambient: 0.5, tension: 0.1, abyss: 0.0 },
  twilight: { ambient: 0.3, tension: 0.4, abyss: 0.1 },
  midnight: { ambient: 0.1, tension: 0.6, abyss: 0.3 },
  abyss:    { ambient: 0.0, tension: 0.2, abyss: 0.7 },
};

// Depth zone scroll thresholds (0–1)
export const ZONE_THRESHOLDS = {
  surface:  [0,    0.05],
  sunlight: [0.05, 0.30],
  twilight: [0.30, 0.58],
  midnight: [0.58, 0.80],
  abyss:    [0.80, 1.00],
};
