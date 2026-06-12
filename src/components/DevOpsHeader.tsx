import React from 'react';
import { Cpu, Building2, RefreshCw, Sun, Moon, LogOut } from 'lucide-react';

interface SiteHeaderProps {
  token: string | null;
  syncCountdown: number;
  scanning: boolean;
  handleScan: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  orgName: string;
  organizationId: string;
  user: any;
  handleLogout: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  token,
  syncCountdown,
  scanning,
  handleScan,
  theme,
  toggleTheme,
  orgName,
  organizationId,
  user,
  handleLogout
}) => {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Brand */}
        <div className="site-header-brand">
          <div className="site-header-logo">
            <Cpu size={18} color="#fff" />
          </div>
          <div>
            <div className="site-header-title">EvaOps</div>
            <div className="site-header-subtitle">Cloud Control Centre</div>
          </div>
        </div>

        <div className="site-header-divider" />

        {/* Organisation badge */}
        <div className="site-header-org">
          <Building2 size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
          <span className="site-header-org-label">Org</span>
          <span className="site-header-org-name">
            {orgName || organizationId}
          </span>
          <span className="site-header-org-dot" />
        </div>

        {/* Right-side actions */}
        <div className="site-header-actions">
          {/* Auto-sync countdown display */}
          {token && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)', fontSize: '0.74rem', height: '36px' }}>
              <span className="site-header-org-dot" style={{ width: '6px', height: '6px', margin: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                Sync in <strong style={{ color: 'var(--success)' }}>{syncCountdown}s</strong>
              </span>
            </div>
          )}

          {/* Scan button */}
          <button
            className="btn-primary"
            onClick={handleScan}
            disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', fontSize: '0.82rem', height: '36px' }}
          >
            <RefreshCw size={14} className={scanning ? 'spin-anim' : ''} />
            {scanning ? 'Scanning…' : 'Scan Cloud'}
          </button>

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User chip */}
          {user && (
            <div className="user-chip">
              <div className="user-chip-info">
                <span className="user-chip-name">{user.name}</span>
                <span className="user-chip-role">{user.role === 'admin' ? 'Admin' : 'Developer'}</span>
              </div>
              <div className="user-chip-avatar">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}

          {/* Sign out */}
          <button className="btn-signout" onClick={handleLogout}>
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

interface ControlBannerProps {
  scanning: boolean;
  scanProgress: number;
  hasApps: boolean;
}

export const ControlBanner: React.FC<ControlBannerProps> = ({
  scanning,
  scanProgress,
  hasApps
}) => {
  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(210deg, rgba(139, 92, 246, 0.04) 0%, rgba(59, 130, 246, 0.01) 100%)',
        pointerEvents: 'none',
        transition: 'background 0.3s ease'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          margin: 0,
          fontSize: '2.1rem', 
          fontWeight: 800, 
          letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, var(--text-primary) 30%, rgba(167, 139, 250, 0.95))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          DevOps Control Centre
        </h1>
        <p style={{
          margin: '10px 0 0 0',
          fontSize: '0.86rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: 'var(--text-primary)', opacity: 0.95 }}>Automated Environment Scanning</span>
          <span style={{ color: 'var(--accent-purple)', fontWeight: 800, opacity: 0.8 }}>·</span>
          <span style={{ color: 'var(--text-primary)', opacity: 0.95 }}>SWA Provisioning</span>
          <span style={{ color: 'var(--accent-teal)', fontWeight: 800, opacity: 0.8 }}>·</span>
          <span style={{ color: 'var(--text-primary)', opacity: 0.95 }}>GoDaddy DNS</span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 800, opacity: 0.8 }}>·</span>
          <span style={{ color: 'var(--text-primary)', opacity: 0.95 }}>Azure DevOps CI/CD</span>
        </p>

        {(scanning || scanProgress > 0) && hasApps && (
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '10px',
            animation: 'pulse-anim 1.5s infinite alternate'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Scanning active cloud for updates and refreshing cost metrics...</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{Math.floor(scanProgress)}%</span>
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 8px var(--accent-purple-glow)', transition: 'width 0.15s ease-out', borderRadius: '3px' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
