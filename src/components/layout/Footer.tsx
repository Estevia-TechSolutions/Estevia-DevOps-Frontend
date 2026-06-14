import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 18px',
      borderRadius: '30px',
      border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
      pointerEvents: 'auto',
      transition: 'all 0.3s ease'
    }}>
      <img
        src="/estevia-new-logo.png"
        alt="Estevia Logo"
        style={{ height: '20px', width: 'auto', objectFit: 'contain', opacity: 0.85 }}
      />
    </footer>
  );
};
