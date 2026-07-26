import React, { useEffect, useState } from 'react';
import { Terminal, Server } from 'lucide-react';

interface AppStartLoaderProps {
  message?: string;
}

export const AppStartLoader: React.FC<AppStartLoaderProps> = ({
  message = "Auditing Azure Cloud Containers & CI/CD Pipelines..."
}) => {
  const [isLight, setIsLight] = useState(false);
  const [bootProgress, setBootProgress] = useState(45);

  useEffect(() => {
    const checkTheme = () => {
      const isL = document.documentElement.classList.contains('light') ||
                 document.body.classList.contains('light') ||
                 localStorage.getItem('theme') === 'light';
      setIsLight(isL);
    };
    checkTheme();
    const interval = setInterval(checkTheme, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBootProgress(prev => (prev >= 98 ? 45 : prev + 6));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: isLight 
        ? 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.99) 0%, rgba(236,253,245,0.97) 100%)' 
        : 'radial-gradient(circle at 50% 40%, rgba(2,24,18,0.99) 0%, rgba(15,23,42,0.97) 100%)',
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
        background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(5, 150, 105, 0.12)',
        border: isLight ? '1px solid rgba(5, 150, 105, 0.25)' : '1px solid rgba(5, 150, 105, 0.3)',
        boxShadow: isLight 
          ? '0 20px 50px rgba(5, 150, 105, 0.15), 0 0 30px rgba(255, 255, 255, 0.8)' 
          : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(5, 150, 105, 0.25)'
      }}>

        {/* Dual-Orbital Animated Badge */}
        <div style={{ position: 'relative', width: '104px', height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `3px solid transparent`,
            borderTopColor: '#059669', borderRightColor: '#f59e0b',
            animation: 'opsSpinCW 1.2s linear infinite',
            filter: 'drop-shadow(0 0 14px #059669)'
          }} />
          <div style={{
            position: 'absolute', inset: '10px', borderRadius: '50%',
            border: `2.5px solid transparent`,
            borderBottomColor: '#10b981', borderLeftColor: '#f59e0b',
            animation: 'opsSpinCCW 1.6s linear infinite',
            filter: 'drop-shadow(0 0 10px #10b981)'
          }} />
          <div style={{
            position: 'absolute', inset: '-12px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5,150,105,0.3) 0%, transparent 70%)',
            animation: 'opsPulseGlow 2s ease-in-out infinite'
          }} />
          <div style={{
            width: '60px', height: '60px', borderRadius: '22px',
            background: 'linear-gradient(135deg, #059669 0%, #f59e0b 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 35px rgba(5,150,105,0.5)',
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
            background: isLight ? 'rgba(5,150,105,0.1)' : 'rgba(5,150,105,0.2)',
            border: '1px solid rgba(5,150,105,0.35)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 10px #059669' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 900, color: isLight ? '#047857' : '#34d399', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              ESTEVIA DEVOPS ENGINE
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: isLight ? '#0f172a' : '#f8fafc' }}>
            {message}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isLight ? '#059669' : '#34d399', background: isLight ? 'rgba(5,150,105,0.12)' : 'rgba(5,150,105,0.25)', padding: '3px 10px', borderRadius: '99px' }}>
              Azure Cloud Hydration
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isLight ? '#475569' : '#94a3b8' }}>
              • Container Boot: {bootProgress}%
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
            <Server size={18} color="#059669" />
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: isLight ? '#047857' : '#34d399', fontFamily: 'monospace' }}>
              [estevia-prod-us-east-1a]
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>
            {bootProgress}% BOOTED
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '7px', borderRadius: '999px', background: isLight ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '999px',
            background: 'linear-gradient(90deg, #059669, #34d399, #f59e0b, #34d399, #059669)',
            backgroundSize: '200% 100%', animation: 'opsSweepLinear 1.5s linear infinite',
            boxShadow: '0 0 18px rgba(5,150,105,0.7)'
          }} />
        </div>

      </div>
    </div>
  );
};
