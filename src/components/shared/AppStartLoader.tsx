import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Server } from 'lucide-react';

interface AppStartLoaderProps {
  message?: string;
}

export const AppStartLoader: React.FC<AppStartLoaderProps> = ({
  message = "Auditing Azure Cloud Containers & CI/CD Pipelines..."
}) => {
  const [isLight, setIsLight] = useState(false);
  const [bootProgress, setBootProgress] = useState(45);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkTheme = () => {
      const stored = localStorage.getItem('theme') || 
                     localStorage.getItem('devops-theme') || 
                     localStorage.getItem('platform-theme') || 
                     localStorage.getItem('evafusion_theme');
      
      const isDarkClass = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      const isLightClass = document.documentElement.classList.contains('light') || document.body.classList.contains('light');

      if (stored === 'dark' || (isDarkClass && !isLightClass)) {
        setIsLight(false);
      } else {
        setIsLight(true);
      }
    };
    checkTheme();
    const interval = setInterval(checkTheme, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBootProgress(prev => (prev >= 98 ? 45 : prev + 6));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Guaranteed Minimum 2.5s Display Guard with Smooth Fade Out
  useEffect(() => {
    const mountTime = Date.now();
    const portalDiv = containerRef.current;

    return () => {
      if (portalDiv && portalDiv.parentNode) {
        const elapsed = Date.now() - mountTime;
        const remaining = Math.max(0, 2500 - elapsed);

        const clone = portalDiv.cloneNode(true) as HTMLDivElement;
        clone.style.transition = 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
        clone.style.opacity = '1';
        clone.style.transform = 'scale(1)';
        document.body.appendChild(clone);

        setTimeout(() => {
          clone.style.opacity = '0';
          clone.style.transform = 'scale(1.02)';
          setTimeout(() => {
            if (clone.parentNode) {
              clone.parentNode.removeChild(clone);
            }
          }, 300);
        }, remaining);
      }
    };
  }, []);

  return createPortal(
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: isLight 
        ? 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.99) 0%, rgba(245,243,255,0.97) 100%)' 
        : 'radial-gradient(circle at 50% 40%, rgba(15,5,28,0.99) 0%, rgba(4,2,7,0.98) 100%)',
      backdropFilter: 'blur(36px)', WebkitBackdropFilter: 'blur(36px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
      color: isLight ? '#0f172a' : '#ffffff',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      transition: 'background 0.3s ease'
    }}>
      <style>{`
        @keyframes opsSpinCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes opsSpinCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes opsPulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes opsSweepLinear {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', maxWidth: '480px', width: '100%',
        padding: '36px 28px', borderRadius: '32px',
        background: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 5, 28, 0.75)',
        border: isLight ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid rgba(167, 139, 250, 0.3)',
        boxShadow: isLight 
          ? '0 20px 50px rgba(124, 58, 237, 0.15), 0 0 30px rgba(255, 255, 255, 0.8)' 
          : '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(124, 58, 237, 0.3)'
      }}>

        {/* Dual-Orbital Animated Badge */}
        <div style={{ position: 'relative', width: '104px', height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `3px solid transparent`,
            borderTopColor: '#7c3aed', borderRightColor: '#10b981',
            animation: 'opsSpinCW 1.2s linear infinite',
            filter: 'drop-shadow(0 0 14px #7c3aed)'
          }} />
          <div style={{
            position: 'absolute', inset: '10px', borderRadius: '50%',
            border: `2.5px solid transparent`,
            borderBottomColor: '#a78bfa', borderLeftColor: '#10b981',
            animation: 'opsSpinCCW 1.6s linear infinite',
            filter: 'drop-shadow(0 0 10px #a78bfa)'
          }} />
          <div style={{
            position: 'absolute', inset: '-12px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
            animation: 'opsPulseGlow 2s ease-in-out infinite'
          }} />
          <div style={{
            width: '60px', height: '60px', borderRadius: '22px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #10b981 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 35px rgba(124,58,237,0.5)',
            color: '#ffffff', zIndex: 10
          }}>
            <Terminal size={30} />
          </div>
        </div>

        {/* Brand & Step Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '999px',
            background: isLight ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(167,139,250,0.4)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 10px #7c3aed' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 900, color: isLight ? '#6d28d9' : '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              ESTEVIA DEVOPS ENGINE
            </span>
          </div>

          <h2 style={{
            fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0,
            color: isLight ? '#0f172a' : '#f8fafc',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
          }}>
            {message}
          </h2>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
          }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800, color: isLight ? '#6d28d9' : '#a78bfa',
              background: isLight ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.25)', padding: '3px 10px', borderRadius: '99px',
              whiteSpace: 'nowrap'
            }}>
              {message.includes('Authenticator') ? 'EVA Authenticator' : 'Azure Cloud Hydration'}
            </span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, color: isLight ? '#475569' : '#94a3b8',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              • {message.includes('Authenticator') ? 'Verifying 2FA Neural Handshake' : `Container Boot: ${bootProgress}%`}
            </span>
          </div>
        </div>

        {/* Azure Container Boot Telemetry Widget */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%',
          padding: '14px 16px', borderRadius: '20px',
          background: isLight ? 'rgba(241,245,249,0.9)' : 'rgba(3,7,18,0.7)',
          border: isLight ? '1px solid rgba(226,232,240,0.9)' : '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color={isLight ? '#6d28d9' : '#a78bfa'} />
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: isLight ? '#475569' : '#cbd5e1', fontFamily: 'monospace' }}>
              [estevia-prod-us-east-1a]
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
            {bootProgress}% BOOTED
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '7px', borderRadius: '999px', background: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '999px',
            background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #10b981, #a78bfa, #7c3aed)',
            backgroundSize: '200% 100%', animation: 'opsSweepLinear 1.5s linear infinite',
            boxShadow: '0 0 18px rgba(124,58,237,0.7)'
          }} />
        </div>

      </div>
    </div>,
    document.body
  );
};
