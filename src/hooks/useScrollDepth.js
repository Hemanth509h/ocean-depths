import { useEffect, useRef, useCallback } from 'react';
import { useDepth } from '../context/DepthContext';
import { getZoneIndex, ZONE_NAMES } from '../utils/depthUtils';

/**
 * Returns scroll ratio, depth, zone name, and velocity from the DepthContext.
 * Also provides a helper to get the zone-local progress (0-1 within a zone).
 */
export function useScrollDepth() {
  const { scrollRatio, depth, zoneIndex, zoneName, scrollVelocity, pressure } = useDepth();

  const ZONE_RANGES = [
    [0, 0.05],
    [0.05, 0.30],
    [0.30, 0.58],
    [0.58, 0.80],
    [0.80, 1.00],
  ];

  const [min, max] = ZONE_RANGES[zoneIndex] || [0, 1];
  const zoneProgress = Math.min(Math.max((scrollRatio - min) / (max - min), 0), 1);

  const isFastScroll = scrollVelocity > 2;
  const isTurbulent  = scrollVelocity > 5;

  return {
    scrollRatio,
    depth,
    zoneIndex,
    zoneName,
    zoneProgress,
    scrollVelocity,
    pressure,
    isFastScroll,
    isTurbulent,
  };
}
