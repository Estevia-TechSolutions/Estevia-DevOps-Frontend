import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      padding: '40px 24px',
      borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
      background: 'rgba(2, 6, 23, 0.2)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      fontSize: '0.82rem',
      color: 'var(--text-secondary)',
      marginTop: '60px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <img
          src="/estevia-new-logo.png"
          alt="Estevia Logo"
          style={{ height: '28px', width: 'auto', objectFit: 'contain', opacity: 0.85 }}
        />
        <div style={{ textAlign: 'center', marginTop: '2px' }}>
          <p style={{ margin: 0, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted, #94a3b8)' }}>
            © {currentYear} Estevia TechSolutions. All rights reserved.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <a href="#/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.74rem', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'color 0.2s' }}>Terms</a>
        <a href="#/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.74rem', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'color 0.2s' }}>Privacy</a>
        <a href="mailto:support@esteviatech.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.74rem', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'color 0.2s' }}>Support</a>
      </div>
    </footer>
  );
};
