import { useRef, useCallback } from 'react';
import { AUDIO_ZONES } from '../utils/animationConfig';

/**
 * Procedural Web Audio API ambient engine.
 * No external audio files – all sounds are synthesized.
 */
export function useAudio() {
  const ctxRef     = useRef(null);
  const nodesRef   = useRef({});
  const masterRef  = useRef(null);
  const startedRef = useRef(false);
  const mutedRef   = useRef(false);
  const zoneRef    = useRef('surface');

  const buildGraph = useCallback((actx) => {
    // Master output chain: gain → compressor → destination
    const master = actx.createGain();
    master.gain.value = 0.85;
    const compressor = actx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    master.connect(compressor);
    compressor.connect(actx.destination);
    masterRef.current = master;

    // ── Underwater ambient rumble ──────────────────────────────
    const noiseLen  = actx.sampleRate * 3;
    const noiseBuf  = actx.createBuffer(1, noiseLen, actx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;

    const noiseSrc = actx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop   = true;

    const noiseFilter = actx.createBiquadFilter();
    noiseFilter.type            = 'lowpass';
    noiseFilter.frequency.value = 400;
    noiseFilter.Q.value         = 0.8;

    const ambientGain = actx.createGain();
    ambientGain.gain.value = 0;

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(ambientGain);
    ambientGain.connect(master);
    noiseSrc.start();

    // ── Deep tension drone (two detuned sines → beating) ──────
    const osc1 = actx.createOscillator();
    osc1.type            = 'sine';
    osc1.frequency.value = 60;

    const osc2 = actx.createOscillator();
    osc2.type            = 'sine';
    osc2.frequency.value = 63.5;

    const tensionFilter = actx.createBiquadFilter();
    tensionFilter.type            = 'bandpass';
    tensionFilter.frequency.value = 90;
    tensionFilter.Q.value         = 2.5;

    const tensionGain = actx.createGain();
    tensionGain.gain.value = 0;

    osc1.connect(tensionFilter);
    osc2.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    tensionGain.connect(master);
    osc1.start();
    osc2.start();

    // ── Abyss sub-bass hum ────────────────────────────────────
    const abyssOsc = actx.createOscillator();
    abyssOsc.type            = 'sawtooth';
    abyssOsc.frequency.value = 30;

    const abyssFilter = actx.createBiquadFilter();
    abyssFilter.type            = 'lowpass';
    abyssFilter.frequency.value = 70;
    abyssFilter.Q.value         = 1.2;

    const abyssGain = actx.createGain();
    abyssGain.gain.value = 0;

    abyssOsc.connect(abyssFilter);
    abyssFilter.connect(abyssGain);
    abyssGain.connect(master);
    abyssOsc.start();

    return { ambientGain, tensionGain, abyssGain };
  }, []);

  const setZone = useCallback((zoneName) => {
    if (!startedRef.current || !nodesRef.current.ambientGain) return;
    zoneRef.current = zoneName;
    const cfg  = AUDIO_ZONES[zoneName] || AUDIO_ZONES.surface;
    const actx = ctxRef.current;
    const t    = actx.currentTime;
    const mul  = mutedRef.current ? 0 : 1;

    nodesRef.current.ambientGain.gain.setTargetAtTime(cfg.ambient * mul * 0.65, t, 0.8);
    nodesRef.current.tensionGain.gain.setTargetAtTime(cfg.tension * mul * 0.55, t, 0.8);
    nodesRef.current.abyssGain.gain.setTargetAtTime (cfg.abyss   * mul * 0.50, t, 0.8);
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    try {
      const actx = new Ctx();
      ctxRef.current   = actx;
      nodesRef.current = buildGraph(actx);
      startedRef.current = true;

      actx.resume().then(() => {
        setZone('surface');
      }).catch(() => {});
    } catch (e) {
      console.warn('Audio engine failed to start:', e);
    }
  }, [buildGraph, setZone]);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    if (masterRef.current) {
      masterRef.current.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.85,
        ctxRef.current.currentTime,
        0.3
      );
    }
    return mutedRef.current;
  }, []);

  const ping = useCallback((freq = 440, duration = 0.5) => {
    if (!startedRef.current || !ctxRef.current) return;
    const actx = ctxRef.current;
    const osc  = actx.createOscillator();
    const gain = actx.createGain();
    osc.type            = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterRef.current || actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
  }, []);

  return { start, setZone, toggleMute, ping, started: startedRef };
}
