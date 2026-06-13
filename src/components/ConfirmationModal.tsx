import React from 'react';
import { AlertTriangle, Database } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      animation: 'fade-in-anim 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '24px',
        border: `1px solid ${type === 'danger' ? 'rgba(239, 68, 68, 0.25)' : 'var(--glass-border)'}`,
        boxShadow: 'var(--modal-shadow)',
        animation: 'pulse-anim 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${type === 'danger' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {type === 'danger' ? (
              <AlertTriangle size={20} style={{ color: 'var(--error)' }} />
            ) : (
              <Database size={20} style={{ color: 'var(--accent-blue)' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {message}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.82rem', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              background: type === 'danger' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              padding: '8px 16px',
              fontSize: '0.82rem',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: type === 'danger' ? '0 4px 12px rgba(239, 68, 68, 0.25)' : '0 4px 12px var(--accent-blue-glow)',
              cursor: 'pointer'
            }}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
