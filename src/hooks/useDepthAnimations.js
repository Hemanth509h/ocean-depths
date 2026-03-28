import { useMemo } from 'react';
import { useDepth } from '../context/DepthContext';
import { lerp, mapRange } from '../utils/depthUtils';

/**
 * Returns continuously interpolated depth-driven animation values.
 * Every value is derived from the raw scrollRatio (0–1), so it
 * animates smoothly between zones rather than snapping.
 */
export function useDepthAnimations() {
  const { scrollRatio, scrollVelocity, depth, zoneIndex } = useDepth();
  const r = scrollRatio; // 0 → 1

  return useMemo(() => {
    /* ── Brightness: 1.0 (surface) → 0.28 (abyss) ── */
    const brightness = lerp(1.0, 0.28, r);

    /* ── CSS filter: blur increases with depth ── */
    const blur = mapRange(r, 0.3, 1.0, 0, 4); // no blur until twilight

    /* ── Colour saturation: vivid → monochrome ── */
    const saturation = lerp(1.1, 0.0, Math.pow(r, 0.7));

    /* ── Vignette strength: edge darkening ── */
    const vignetteOpacity = lerp(0.2, 0.92, Math.pow(r, 0.6));

    /* ── Pressure colour overlay (cold blue tint at depth) ── */
    const pressureTint = Math.round(lerp(0, 38, r)); // 0–38% blue overlay

    /* ── Content opacity: deepens slowly ── */
    const contentOpacity = r < 0.85 ? 1 : lerp(1, 0.6, mapRange(r, 0.85, 1, 0, 1));

    /* ── Particle speed multiplier ──
       Slows to near-still in the abyss */
    const particleSpeedMult = lerp(1.0, 0.08, Math.pow(r, 1.4));

    /* ── Text glow based on depth ── */
    const glowRadius = Math.round(lerp(8, 55, r));
    const glowStrength = lerp(0.12, 0.95, Math.pow(r, 0.55));
    const glowColor  = `rgba(144,224,239,${glowStrength.toFixed(3)})`;

    /* ── Pressure shake: starts in midnight, builds in abyss ── */
    const shakeIntensity = r > 0.58
      ? mapRange(r, 0.58, 1.0, 0, 8) * (1 + scrollVelocity * 0.3)
      : 0;

    /* ── Wave speed in hero / sunlight ── */
    const waveSpeed = lerp(1.0, 0.2, Math.min(r * 4, 1));

    /* ── Ambient light colour tint (CSS custom property value) ── */
    const ambientHue = Math.round(lerp(195, 240, r)); // cyan(195) → deep blue(240)

    /* ── Float/bob amplitude for creatures (twilight only) ── */
    const bobAmplitude = zoneIndex === 2
      ? mapRange(r, 0.30, 0.58, 4, 14)
      : 0;

    return {
      brightness,
      saturation,
      vignetteOpacity,
      pressureTint,
      contentOpacity,
      particleSpeedMult,
      glowRadius,
      glowColor,
      shakeIntensity,
      waveSpeed,
      ambientHue,
      bobAmplitude,
    };
  }, [scrollRatio, scrollVelocity, zoneIndex]);
}
