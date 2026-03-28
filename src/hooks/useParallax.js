import { useRef, useEffect } from 'react';
import { useDepth } from '../context/DepthContext';

/**
 * Returns a ref to attach to any element for parallax offset.
 * @param {number} factor  – parallax strength (negative = opposite scroll direction)
 * @param {string} axis    – 'y' (default) or 'x'
 */
export function useParallax(factor = 0.3, axis = 'y') {
  const ref = useRef(null);
  const { scrollRatio } = useDepth();

  useEffect(() => {
    if (!ref.current) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const px = scrollRatio * maxScroll * factor;
    if (axis === 'y') {
      ref.current.style.transform = `translateY(${px}px)`;
    } else {
      ref.current.style.transform = `translateX(${px}px)`;
    }
  }, [scrollRatio, factor, axis]);

  return ref;
}
