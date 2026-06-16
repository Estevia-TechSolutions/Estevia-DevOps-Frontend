import React from 'react';
import { Cpu, Building2, RefreshCw, Sun, Moon, LogOut, Bell } from 'lucide-react';

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
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
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
  handleLogout,
  unreadNotificationsCount,
  onToggleNotifications
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
          {/* Combined Sync Countdown / Scan Cloud Pill */}
          {token && (
            <button
              className="btn-primary"
              onClick={() => handleScan()}
              disabled={scanning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                fontSize: '0.82rem',
                height: '36px',
                borderRadius: '20px',
                background: scanning 
                  ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                  : 'rgba(34, 197, 94, 0.08)',
                border: scanning 
                  ? 'none' 
                  : '1px solid rgba(34, 197, 94, 0.25)',
                boxShadow: scanning 
                  ? '0 0 12px var(--accent-purple-glow)' 
                  : 'none',
                color: scanning ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: scanning ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!scanning) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!scanning) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.25)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <RefreshCw 
                size={14} 
                className={scanning ? 'spin-anim' : ''} 
                style={{ color: scanning ? '#fff' : 'var(--success)' }}
              />
              {scanning ? (
                <span style={{ fontWeight: 600 }}>Scanning Cloud…</span>
              ) : (
                <span style={{ fontWeight: 500 }}>
                  Scan Cloud <span style={{ color: 'var(--text-secondary)', opacity: 0.6, margin: '0 4px' }}>|</span> Sync in <strong style={{ color: 'var(--success)', fontWeight: 700 }}>
                    {syncCountdown >= 60
                      ? `${Math.floor(syncCountdown / 60)}:${String(syncCountdown % 60).padStart(2, '0')}m`
                      : `${syncCountdown}s`}
                  </strong>
                </span>
              )}
            </button>
          )}

          {/* Notification bell toggle */}
          {token && (
            <button 
              className="theme-toggle" 
              onClick={onToggleNotifications} 
              title="Notifications Center"
              style={{ position: 'relative' }}
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--error)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-header)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User chip */}
          {user && (
            <div className="user-chip">
              <div className="user-chip-info">
                <span className="user-chip-name">{user.name}</span>
                <span className="user-chip-role">
                  {user.role === 'member' || user.role === 'contributor' ? 'Contributor' : user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Contributor'}
                </span>
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
  resourceGroups?: string[];
  selectedResourceGroup?: string;
  onResourceGroupChange?: (rg: string) => void;
  primaryResourceGroup?: string;
}

export const ControlBanner: React.FC<ControlBannerProps> = ({
  scanning,
  scanProgress,
  hasApps,
  resourceGroups = [],
  selectedResourceGroup = '',
  onResourceGroupChange,
  primaryResourceGroup = ''
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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

          {/* Resource Group Dropdown Selector */}
          {resourceGroups && resourceGroups.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resource Group:</span>
              <select
                value={selectedResourceGroup}
                onChange={(e) => onResourceGroupChange?.(e.target.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {resourceGroups.map((rg) => {
                  const isPrimary = rg === primaryResourceGroup;
                  return (
                    <option key={rg} value={rg} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                      {rg} {isPrimary ? ' (Primary)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
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
