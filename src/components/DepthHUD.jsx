import React from 'react';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { ZONES } from '../utils/depthUtils';

const ZONE_DESCRIPTORS = [
  { name: 'Surface',       color: '#90e0ef', icon: '🌊' },
  { name: 'Sunlight Zone', color: '#48cae4', icon: '☀️' },
  { name: 'Twilight Zone', color: '#023e8a', icon: '🌌' },
  { name: 'Midnight Zone', color: '#03012e', icon: '🌑' },
  { name: 'The Abyss',    color: '#000010', icon: '⚫' },
];

export default function DepthHUD({ onToggleMute, muted, audioStarted }) {
  const { depth, pressure, zoneIndex, scrollVelocity } = useScrollDepth();
  const zone = ZONE_DESCRIPTORS[zoneIndex] || ZONE_DESCRIPTORS[0];
  const pct  = Math.min((depth / 36000) * 100, 100);

  return (
    <aside className="depth-hud" aria-label="Depth and pressure indicators">
      {/* Depth meter bar */}
      <div className="hud-meter-track" aria-label={`Current depth: ${depth.toLocaleString()} metres`}>
        <div className="hud-meter-label">DEPTH</div>
        <div className="hud-meter-bar">
          <div className="hud-meter-fill" style={{ height: `${pct}%` }} />
          <div className="hud-meter-marker" style={{ bottom: `${pct}%` }}>
            <span className="hud-meter-value">{depth.toLocaleString()}m</span>
          </div>
        </div>
      </div>

      {/* Zone badge */}
      <div className="hud-zone-badge" style={{ borderColor: zone.color, color: zone.color }}>
        <span className="hud-zone-icon">{zone.icon}</span>
        <span className="hud-zone-name">{zone.name}</span>
      </div>

      {/* Pressure */}
      <div className="hud-pressure">
        <span className="hud-pressure-value">{pressure}</span>
        <span className="hud-pressure-unit">atm</span>
        <span className="hud-pressure-label">Pressure</span>
      </div>

      {/* Velocity indicator */}
      <div className={`hud-velocity ${scrollVelocity > 3 ? 'turbulent' : ''}`}>
        <div className="vel-bar" style={{ width: `${Math.min(scrollVelocity * 12, 100)}%` }} />
        <span className="vel-label">
          {scrollVelocity > 3 ? '⚡ Turbulent' : '〰 Calm'}
        </span>
      </div>

      {/* Audio toggle */}
      <button
        className={`hud-mute-btn ${muted ? 'muted' : ''}`}
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        title={!audioStarted ? 'Click anywhere to start audio first' : (muted ? 'Unmute' : 'Mute')}
      >
        <span>{muted ? '🔇' : '🔊'}</span>
      </button>
    </aside>
  );
}
