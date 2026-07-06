import React from 'react';

interface EsteviaLoginBadgeProps {
  appName: string;
  category: string;
  accentColor: string;
  isInnovationCenter?: boolean;
}

/** Inject keyframes once per page load */
const STYLE_ID = 'est-badge-styles';
function injectBadgeStyles() {
  if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes estRingRotate {
        0%   { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -188; }
      }
      @keyframes estBar1Pulse {
        0%, 100% { opacity: 0.55; }
        16%  { opacity: 1; filter: drop-shadow(0 0 3px #0BE58E); }
        50%  { opacity: 0.6; }
      }
      @keyframes estBar2Pulse {
        0%, 100% { opacity: 0.55; }
        33%  { opacity: 1; filter: drop-shadow(0 0 3px #0BE58E); }
        66%  { opacity: 0.6; }
      }
      @keyframes estBar3Pulse {
        0%, 100% { opacity: 0.55; }
        50%  { opacity: 1; filter: drop-shadow(0 0 3px #0BE58E); }
        83%  { opacity: 0.6; }
      }
      @keyframes estLogoFloat {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-2px); }
      }
      @keyframes estBadgePulse {
        0%, 100% { box-shadow: 0 0 0px rgba(11,229,142,0); }
        50%       { box-shadow: 0 0 20px rgba(11,229,142,0.12); }
      }
      .est-badge-logo-wrap { animation: estLogoFloat 3.5s ease-in-out infinite; }
      .est-ring {
        stroke-dasharray: 60 128;
        animation: estRingRotate 3s linear infinite;
        transform-origin: 18px 18px;
      }
      .est-bar1 { animation: estBar1Pulse 2.4s ease-in-out infinite; }
      .est-bar2 { animation: estBar2Pulse 2.4s ease-in-out infinite 0.15s; }
      .est-bar3 { animation: estBar3Pulse 2.4s ease-in-out infinite 0.30s; }
      .est-badge-root {
        animation: estBadgePulse 4s ease-in-out infinite;
        transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
      }
      .est-badge-root:hover {
        border-color: rgba(11,229,142,0.38) !important;
        box-shadow: 0 0 28px rgba(11,229,142,0.14) !important;
      }
      .est-platform-name {
        background: linear-gradient(135deg, #ffffff 20%, #0BE58E 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .est-badge-link { transition: color 0.2s; }
      .est-badge-link:hover { color: #0BE58E !important; }
    `;
    document.head.appendChild(style);
  }
}

export function EsteviaLoginBadge({ appName, category, isInnovationCenter }: EsteviaLoginBadgeProps) {
  React.useEffect(() => { injectBadgeStyles(); }, []);

  return (
    <div
      className="est-badge-root"
      style={{
        position: 'relative',
        zIndex: 2,
        borderRadius: '16px',
        padding: '16px 18px',
        background: 'rgba(11,229,142,0.04)',
        border: '1px solid rgba(11,229,142,0.16)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backdropFilter: 'blur(12px)',
        cursor: 'default',
      }}
    >
      {/* Top row: animated logo + text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          className="est-badge-logo-wrap"
          style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="estGradBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0BE58E" />
                <stop offset="100%" stopColor="#05d97e" />
              </linearGradient>
              <filter id="estBarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer rotating ring */}
            <circle className="est-ring" cx="18" cy="18" r="16" stroke="#0BE58E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Inner fill */}
            <circle cx="18" cy="18" r="13.5" fill="rgba(11,229,142,0.06)" />
            {/* Staggered bars (top → middle → bottom) */}
            <rect className="est-bar1" x="9.5" y="10" width="17" height="4" rx="2" fill="url(#estGradBadge)" filter="url(#estBarGlow)" />
            <rect className="est-bar2" x="9.5" y="16" width="17" height="4" rx="2" fill="url(#estGradBadge)" filter="url(#estBarGlow)" />
            <rect className="est-bar3" x="9.5" y="22" width="17" height="4" rx="2" fill="url(#estGradBadge)" filter="url(#estBarGlow)" />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="est-platform-name"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.88rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2 }}
          >
            {isInnovationCenter ? 'Estevia Innovation Center' : 'Estevia Platform'}
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0BE58E', marginTop: '2px', opacity: 0.8 }}>
            {isInnovationCenter ? 'Research & Development' : 'Enterprise Suite · v4.0'}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(11,229,142,0.25) 0%, transparent 100%)' }} />

      {/* Bottom row: category pill + link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.75)' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0BE58E', flexShrink: 0 }} />
          {category} · {appName}
        </div>
        <a
          href="https://www.esteviatech.com"
          target="_blank"
          rel="noreferrer"
          className="est-badge-link"
          style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(11,229,142,0.5)', textDecoration: 'none' }}
        >
          esteviatech.com ↗
        </a>
      </div>
    </div>
  );
}
