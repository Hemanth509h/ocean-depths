// Zone definitions and depth/color configuration

export const ZONES = {
  SURFACE: { name: 'Surface', min: 0, max: 200, label: '0 – 200m', emoji: '🌊' },
  SUNLIGHT: { name: 'Sunlight Zone', min: 200, max: 1000, label: '200 – 1,000m', emoji: '☀️' },
  TWILIGHT: { name: 'Twilight Zone', min: 1000, max: 4000, label: '1,000 – 4,000m', emoji: '🌌' },
  MIDNIGHT: { name: 'Midnight Zone', min: 4000, max: 11000, label: '4,000 – 11,000m', emoji: '🌑' },
  ABYSS:    { name: 'The Abyss',    min: 11000, max: 36000, label: '11,000m+', emoji: '⚫' },
};

// Map scroll ratio (0-1) to depth in meters (0-36000m)
export function scrollToDepth(ratio) {
  return Math.round(ratio * 36000);
}

// Map scroll ratio to zone index (0-4)
export function getZoneIndex(ratio) {
  if (ratio < 0.05) return 0; // Surface
  if (ratio < 0.30) return 1; // Sunlight
  if (ratio < 0.58) return 2; // Twilight
  if (ratio < 0.80) return 3; // Midnight
  return 4;                    // Abyss
}

export const ZONE_NAMES = ['surface', 'sunlight', 'twilight', 'midnight', 'abyss'];

// Lerped background colors per zone via CSS custom properties
export const ZONE_COLORS = [
  { sky: '#00b4d8', mid: '#0077b6', deep: '#023e8a' },   // surface
  { sky: '#0096c7', mid: '#0077b6', deep: '#03045e' },   // sunlight
  { sky: '#03045e', mid: '#023e8a', deep: '#05004e' },   // twilight
  { sky: '#03012e', mid: '#010018', deep: '#000010' },   // midnight
  { sky: '#000008', mid: '#000003', deep: '#000000' },   // abyss
];

// Atmosphere values per zone (0-1 scale)
export const ZONE_ATMOSPHERE = [
  { fog: 0,    blur: 0,    brightness: 1.0, saturation: 1.0, shake: 0    },
  { fog: 0.05, blur: 0,    brightness: 0.9, saturation: 0.9, shake: 0    },
  { fog: 0.35, blur: 2,    brightness: 0.5, saturation: 0.5, shake: 0.02 },
  { fog: 0.65, blur: 6,    brightness: 0.2, saturation: 0.2, shake: 0.06 },
  { fog: 0.95, blur: 12,   brightness: 0.05,saturation: 0,   shake: 0.1  },
];

// Pressure in atm per meter (approx 1 atm per 10m)
export function depthToPressure(depth) {
  return (1 + depth / 10).toFixed(1);
}

// Lerp helper
export function lerp(a, b, t) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

// Map value from one range to another
export function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, t);
}

// Get interpolated atmosphere for a given scroll ratio
export function getAtmosphere(ratio) {
  const zoneIndex = getZoneIndex(ratio);
  const nextIndex = Math.min(zoneIndex + 1, ZONE_ATMOSPHERE.length - 1);
  const zoneRatio = ratio / (1 / ZONE_ATMOSPHERE.length);
  const localT = (zoneRatio % 1);
  const current = ZONE_ATMOSPHERE[zoneIndex];
  const next = ZONE_ATMOSPHERE[nextIndex];
  return {
    fog: lerp(current.fog, next.fog, localT),
    blur: lerp(current.blur, next.blur, localT),
    brightness: lerp(current.brightness, next.brightness, localT),
    saturation: lerp(current.saturation, next.saturation, localT),
    shake: lerp(current.shake, next.shake, localT),
  };
}
