import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to the returned ref element.
 * All children with class `reveal-item` animate in with `is-revealed`
 * when they enter the viewport, staggered by `stagger` ms each.
 */
export function useReveal({ threshold = 0.15, stagger = 120 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.reveal-item'));
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = items.indexOf(entry.target);
            setTimeout(() => {
              entry.target.classList.add('is-revealed');
            }, idx * stagger);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return ref;
}
