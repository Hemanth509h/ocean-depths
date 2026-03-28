import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeVolumetricDots({ count = 1000, color = "#90e0ef", opacity = 0.5 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      velocities[i] = 0.5 + Math.random() * 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 2,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation
    let raf;
    const animate = () => {
      const positionsAttr = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        // Move towards camera
        positionsAttr[i * 3 + 2] += velocities[i];
        
        // Reset if past camera
        if (positionsAttr[i * 3 + 2] > 1000) {
          positionsAttr[i * 3 + 2] = -1000;
          positionsAttr[i * 3] = (Math.random() - 0.5) * 2000;
          positionsAttr[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [count, color, opacity]);

  return <div ref={mountRef} className="three-scene-overlay" aria-hidden="true" />;
}
