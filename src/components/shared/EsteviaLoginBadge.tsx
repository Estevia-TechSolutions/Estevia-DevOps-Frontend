import * as React from 'react';

interface EsteviaLoginBadgeProps {
  appName: string;
  category: string;
  accentColor?: string;
  isInnovationCenter?: boolean;
}

function injectBadgeStyles(isNeural: boolean) {
  const id = isNeural ? 'estevia-neural-badge-styles' : 'estevia-workspace-badge-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  const color = isNeural ? '#8b5cf6' : '#0BE58E';
  style.textContent = `
    @keyframes estRingSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .est-ring {
      transform-origin: 18px 18px;
      animation: estRingSpin 16s linear infinite;
    }
    .est-badge-logo-wrap svg {
      filter: drop-shadow(0 2px 8px ${isNeural ? 'rgba(139,92,246,0.15)' : 'rgba(11,229,142,0.15)'});
    }
    .est-badge-link-${isNeural ? 'neural' : 'workspace'} { transition: color 0.2s; }
    .est-badge-link-${isNeural ? 'neural' : 'workspace'}:hover { color: ${color} !important; }
  `;
  document.head.appendChild(style);
}

export function EsteviaLoginBadge({ appName, category, isInnovationCenter }: EsteviaLoginBadgeProps) {
  const isNeural = appName.toLowerCase().includes('evafusion') || appName.toLowerCase().includes('evaops') || !!isInnovationCenter;
  
  React.useEffect(() => {
    injectBadgeStyles(isNeural);
  }, [isNeural]);

  const themeColor = isNeural ? '#8b5cf6' : '#0BE58E';
  const gradEndColor = isNeural ? '#7c3aed' : '#05d97e';
  const bgGlow = isNeural ? 'rgba(139,92,246,0.04)' : 'rgba(11,229,142,0.04)';
  const borderGlow = isNeural ? 'rgba(139,92,246,0.16)' : 'rgba(11,229,142,0.16)';

  return (
    <div
      className="est-badge-root"
      style={{
        position: 'relative',
        zIndex: 2,
        borderRadius: '16px',
        padding: '16px 18px',
        background: bgGlow,
        border: `1px solid ${borderGlow}`,
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
                <stop offset="0%" stopColor={themeColor} />
                <stop offset="100%" stopColor={gradEndColor} />
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
            <circle className="est-ring" cx="18" cy="18" r="16" stroke={themeColor} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Inner fill */}
            <circle cx="18" cy="18" r="13.5" fill={isNeural ? 'rgba(139,92,246,0.06)' : 'rgba(11,229,142,0.06)'} />
            {/* Staggered bars (top → middle → bottom) */}
            <rect className="est-bar1" x="9.5" y="10" width="17" height="4" rx="2" fill="url(#estGradBadge)" filter="url(#estBarGlow)" />
            <rect className="est-bar2" x="9.5" y="16" width="17" height="4" rx="2" fill="url(#estGradBadge)" filter="url(#estBarGlow)" />
            <rect className="est-bar3" x="9.5" y="22" width="17" height="4" rx="2" fill="url(#estGradBadge)" filter="url(#estBarGlow)" />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              background: `linear-gradient(135deg, #ffffff 20%, ${themeColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isNeural ? 'Estevia Neural' : 'Estevia Workspace'}
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: themeColor, marginTop: '2px', opacity: 0.8 }}>
            {isNeural ? 'Neural Engine & Core Automation' : 'Enterprise Productivity Suite'}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: isNeural ? 'linear-gradient(90deg, rgba(139,92,246,0.25) 0%, transparent 100%)' : 'linear-gradient(90deg, rgba(11,229,142,0.25) 0%, transparent 100%)' }} />

      {/* Bottom row: category pill + link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.75)' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: themeColor, flexShrink: 0 }} />
          {category} · {appName}
        </div>
        <a
          href="https://www.esteviatech.com"
          target="_blank"
          rel="noreferrer"
          className={`est-badge-link-${isNeural ? 'neural' : 'workspace'}`}
          style={{ fontSize: '0.6rem', fontWeight: 600, color: isNeural ? 'rgba(139,92,246,0.5)' : 'rgba(11,229,142,0.5)', textDecoration: 'none' }}
        >
          esteviatech.com ↗
        </a>
      </div>
    </div>
  );
}
