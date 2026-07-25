import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Zap, Sparkles, ChevronDown, ChevronUp, ShieldCheck, Brain, Lock, Gauge } from 'lucide-react';
import packageJson from '../../../package.json';

const UPDATE_MESSAGES = [
  "Synchronizing Control Plane Cache...",
  "Recalibrating Neural Handshakes...",
  "Hydrating Security & RBAC Manifests...",
  "Optimizing Platform Database Indexes...",
  "Finalizing Zero-Downtime System Swap..."
];

const GET_APP_HIGHLIGHTS = () => {
  return [
    { label: 'DevOps Fleet Scanner', Icon: Gauge },
    { label: 'Neural Infrastructure Sync', Icon: Brain },
    { label: 'RBAC Policy Hydration', Icon: Lock }
  ];
};

export const PWAUpdateManager: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('[PWA] Service Worker registered');
      if (r) {
        setInterval(() => {
          r.update();
        }, 2 * 60 * 1000);
      }
    },
    onRegisterError(error: any) {
      console.error('[PWA] Service Worker registration error', error);
    },
  });

  const [messageIndex, setMessageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % UPDATE_MESSAGES.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isUpdating]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('testPwa') === 'true' || params.get('pwaTest') === 'true') {
      setNeedRefresh(true);
    }
    (window as any).__TRIGGER_PWA_TEST__ = () => {
      setNeedRefresh(true);
    };
  }, [setNeedRefresh]);

  useEffect(() => {
    const handleControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    setNeedRefresh(false);
    updateServiceWorker(true);
  };

  if (!needRefresh && !isUpdating) return null;

  const highlights = GET_APP_HIGHLIGHTS();
  const versionStr = packageJson.version || '4.0.0';

  if (isUpdating) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(2, 18, 13, 0.96)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', textAlign: 'center', color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        <style>{`
          @keyframes emeraldSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes emeraldSpinRev {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes emeraldPulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.08); }
          }
          @keyframes barSweep {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', maxWidth: '420px', width: '100%' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '3px solid transparent', borderTopColor: '#10b981', borderRightColor: '#34d399',
              animation: 'emeraldSpin 1s linear infinite',
              filter: 'drop-shadow(0 0 10px #10b981)'
            }} />
            <div style={{
              position: 'absolute', inset: '10px', borderRadius: '50%',
              border: '2.5px solid transparent', borderBottomColor: '#059669', borderLeftColor: '#6ee7b7',
              animation: 'emeraldSpinRev 1.4s linear infinite',
              filter: 'drop-shadow(0 0 8px #34d399)'
            }} />
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'radial-gradient(circle, #10b981 0%, #064e3b 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px #10b981', animation: 'emeraldPulse 2s ease-in-out infinite'
            }}>
              <Zap size={22} color="#ffffff" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em' }}>LIVE SYNC IN PROGRESS</span>
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '12px 0 0 0', color: '#f8fafc' }}>
              {UPDATE_MESSAGES[messageIndex]}
            </h2>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              Applying Estevia Core Build v{versionStr}
            </p>
          </div>

          <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '999px',
              background: 'linear-gradient(90deg, #10b981, #34d399, #059669, #34d399, #10b981)',
              backgroundSize: '200% 100%', animation: 'barSweep 1.5s linear infinite',
              boxShadow: '0 0 16px #10b981'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '0 16px', width: '100%', maxWidth: '440px',
      boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      <style>{`
        @keyframes swSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mintDotPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(52,211,153,0.7); }
          50%       { transform: scale(1.2); opacity: 1; box-shadow: 0 0 0 6px rgba(52,211,153,0); }
        }
        @keyframes emeraldLaser {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        .pwa-emerald-card {
          animation: swSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          position: relative; overflow: hidden;
          border-radius: 24px;
          background: rgba(4, 24, 18, 0.88);
          backdrop-filter: blur(28px); WebkitBackdropFilter: blur(28px);
          border: 1px solid rgba(52, 211, 153, 0.35);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 35px rgba(16, 185, 129, 0.28);
        }
        .pwa-laser-sweep {
          position: absolute; top: 0; bottom: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.18), transparent);
          transform: skewX(-20deg);
          animation: emeraldLaser 6s ease-in-out infinite;
          pointer-events: none;
        }
        .pwa-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 24px rgba(16,185,129,0.55) !important;
        }
      `}</style>

      <div className="pwa-emerald-card">
        <div className="pwa-laser-sweep" />

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animation: 'mintDotPulse 2s infinite' }} />
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.14em' }}>SYSTEM UPDATE READY</span>
            </div>
            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#6ee7b7', fontFamily: 'monospace', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(52,211,153,0.25)' }}>
              v{versionStr}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.35) 100%)',
                border: '1.5px solid rgba(52,211,153,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#34d399', flexShrink: 0,
                boxShadow: '0 0 16px rgba(16,185,129,0.35)'
              }}>
                <Sparkles size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  Estevia Core Release
                </h4>
                <p style={{ fontSize: '0.72rem', color: '#a7f3d0', margin: '3px 0 0 0', fontWeight: 500 }}>
                  New build and features auto-synced
                </p>
              </div>
            </div>

            <button onClick={handleUpdate} className="pwa-btn" style={{
              padding: '11px 18px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              color: '#ffffff', border: 'none', fontWeight: 800, fontSize: '0.76rem',
              textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: '0 4px 18px rgba(16,185,129,0.45)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap', flexShrink: 0
            }}>
              <Zap size={14} style={{ fill: 'currentColor' }} />
              <span>Update</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '2px' }}>
            {highlights.map((h, idx) => (
              <span key={idx} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 9px', borderRadius: '999px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.22)',
                color: '#6ee7b7', fontSize: '0.64rem', fontWeight: 700
              }}>
                <h.Icon size={11} color="#34d399" />
                <span>{h.label}</span>
              </span>
            ))}
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none', border: 'none', padding: '4px 0 0 0',
              color: '#34d399', fontSize: '0.68rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '4px', textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            <span>{showDetails ? 'Hide Release Breakdown' : 'View Release Details'}</span>
            {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showDetails && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              padding: '12px 14px', borderRadius: '14px',
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(52,211,153,0.18)',
              marginTop: '2px', animation: 'swSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 700 }}>
                <ShieldCheck size={14} color="#34d399" />
                <span>Zero-Downtime Control Plane Swap</span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#a7f3d0', margin: 0, lineHeight: 1.45 }}>
                Includes neural service worker cache hydration, security policy synchronization, and instant runtime asset pre-caching (~1.2s activation).
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
