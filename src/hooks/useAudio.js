import { useRef, useEffect, useCallback } from 'react';
import { AUDIO_ZONES } from '../utils/animationConfig';
import { ZONE_NAMES } from '../utils/depthUtils';

/**
 * Procedural Web Audio API ambient engine.
 * No external audio files needed – all sounds are synthesized.
 */
export function useAudio() {
  const ctxRef   = useRef(null);
  const nodesRef = useRef({});
  const startedRef = useRef(false);
  const mutedRef   = useRef(false);
  const zoneRef    = useRef('surface');

  const createAmbient = useCallback((actx) => {
    // --- Underwater rumble (surface / ambient) ---
    const bufferSize = actx.sampleRate * 4;
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const ambientSrc = actx.createBufferSource();
    ambientSrc.buffer = buffer;
    ambientSrc.loop = true;

    const ambientFilter = actx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.value = 300;
    ambientFilter.Q.value = 0.5;

    const ambientGain = actx.createGain();
    ambientGain.gain.value = 0;

    ambientSrc.connect(ambientFilter);
    ambientFilter.connect(ambientGain);
    ambientGain.connect(actx.destination);
    ambientSrc.start();

    // --- Deep drone (tension) ---
    const osc1 = actx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;

    const osc2 = actx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 58; // slight detune for beating effect

    const tensionFilter = actx.createBiquadFilter();
    tensionFilter.type = 'bandpass';
    tensionFilter.frequency.value = 80;
    tensionFilter.Q.value = 2;

    const tensionGain = actx.createGain();
    tensionGain.gain.value = 0;

    osc1.connect(tensionFilter);
    osc2.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    tensionGain.connect(actx.destination);
    osc1.start();
    osc2.start();

    // --- Abyss hum (very low frequency) ---
    const abyssOsc = actx.createOscillator();
    abyssOsc.type = 'sawtooth';
    abyssOsc.frequency.value = 28;

    const abyssFilter = actx.createBiquadFilter();
    abyssFilter.type = 'lowpass';
    abyssFilter.frequency.value = 60;

    const abyssGain = actx.createGain();
    abyssGain.gain.value = 0;

    abyssOsc.connect(abyssFilter);
    abyssFilter.connect(abyssGain);
    abyssGain.connect(actx.destination);
    abyssOsc.start();

    // --- Bubble pings (surface only) ---
    const pingGain = actx.createGain();
    pingGain.gain.value = 0;
    pingGain.connect(actx.destination);

    return {
      ambientGain,
      tensionGain,
      abyssGain,
      pingGain,
    };
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    const actx = new AudioContextClass();
    ctxRef.current = actx;
    nodesRef.current = createAmbient(actx);
    startedRef.current = true;
    
    // Explicitly resume in case it's in suspended state
    if (actx.state === 'suspended') {
      actx.resume();
    }
    
    // Set initial zone volumes
    setZone('surface');
  }, [createAmbient]);

  const setZone = useCallback((zoneName) => {
    if (!startedRef.current || !nodesRef.current.ambientGain) return;
    zoneRef.current = zoneName;
    const cfg = AUDIO_ZONES[zoneName] || AUDIO_ZONES.surface;
    const actx = ctxRef.current;
    const t = actx.currentTime;
    const mute = mutedRef.current ? 0 : 1;

    nodesRef.current.ambientGain.gain.setTargetAtTime(cfg.ambient * mute * 0.15, t, 1.5);
    nodesRef.current.tensionGain.gain.setTargetAtTime(cfg.tension * mute * 0.12, t, 1.5);
    nodesRef.current.abyssGain.gain.setTargetAtTime(cfg.abyss * mute * 0.10, t, 1.5);
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setZone(zoneRef.current);
    return mutedRef.current;
  }, [setZone]);

  // Trigger a short pitch "ping" on events
  const ping = useCallback((freq = 440, duration = 0.5) => {
    if (!startedRef.current || !ctxRef.current) return;
    const actx = ctxRef.current;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
  }, []);

  return { start, setZone, toggleMute, ping, started: startedRef };
}
