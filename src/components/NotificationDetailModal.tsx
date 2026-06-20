import React, { useState } from 'react';
import { X, Calendar, Clock, Copy, Check, Info, CheckCircle2, AlertTriangle, AlertOctagon, ExternalLink } from 'lucide-react';
import type { AppNotification } from './NotificationDrawer';

interface NotificationDetailModalProps {
  isOpen: boolean;
  notification: AppNotification | null;
  onClose: () => void;
  onNavigate: (category: string, notification: AppNotification) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  notification,
  onClose,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(notification.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic Operations Tagging helper to determine category dynamically
  const getCategoryTag = (title: string, message: string) => {
    const t = (title + ' ' + message).toLowerCase();
    if (t.includes('remediation') || t.includes('optimize') || t.includes('cost') || t.includes('savings') || t.includes('bill') || t.includes('finops')) {
      return { label: 'FINOPS', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' };
    }
    if (t.includes('security') || t.includes('credentials') || t.includes('secrets') || t.includes('keyvault') || t.includes('token') || t.includes('audit')) {
      return { label: 'SECURITY', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)' };
    }
    if (t.includes('provision') || t.includes('database') || t.includes('pipeline') || t.includes('deploy') || t.includes('backup') || t.includes('swap')) {
      return { label: 'PROVISION', color: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.2)' };
    }
    if (t.includes('scan') || t.includes('infrastructure') || t.includes('telemetry') || t.includes('agent') || t.includes('monitor') || t.includes('observability')) {
      return { label: 'MONITOR', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.2)' };
    }
    return { label: 'SYSTEM', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.2)' };
  };

  const category = getCategoryTag(notification.title, notification.message);

  // Get severity specific styling variables
  const getSeverityStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />,
          color: 'var(--success)',
          glow: 'rgba(16, 185, 129, 0.25)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          label: 'Success'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={22} style={{ color: '#eab308' }} />,
          color: '#eab308',
          glow: 'rgba(234, 179, 8, 0.25)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          label: 'Warning'
        };
      case 'error':
        return {
          icon: <AlertOctagon size={22} style={{ color: 'var(--error)' }} />,
          color: 'var(--error)',
          glow: 'rgba(239, 68, 68, 0.25)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          label: 'Error'
        };
      case 'info':
      default:
        return {
          icon: <Info size={22} style={{ color: 'var(--accent-blue)' }} />,
          color: 'var(--accent-blue)',
          glow: 'rgba(59, 130, 246, 0.25)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          label: 'Info'
        };
    }
  };

  const severity = getSeverityStyle(notification.type);

  // Helper to resolve readable section names for tabs
  const getSectionName = (catLabel: string) => {
    switch (catLabel) {
      case 'FINOPS': return 'Cost tab';
      case 'SECURITY': return 'Credentials tab';
      case 'PROVISION': return 'Provisioning or Database tab';
      case 'MONITOR': return 'Observability tab';
      case 'SYSTEM': return 'Events Log tab';
      default: return 'relevant section';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      animation: 'fade-in-anim 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        border: severity.border,
        boxShadow: `0 0 30px ${severity.glow}, var(--modal-shadow)`,
        animation: 'pulse-anim 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {severity.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  color: severity.color,
                  letterSpacing: '0.05em'
                }}>
                  {severity.label.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  color: 'var(--accent-purple)',
                  letterSpacing: '0.05em'
                }}>
                  {category.label}
                </span>
              </div>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                {notification.title}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Event Details</span>
            <button
              onClick={handleCopy}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                color: copied ? 'var(--success)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          
          <div style={{
            background: 'rgba(0,0,0,0.18)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            padding: '16px',
            maxHeight: '180px',
            overflowY: 'auto',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {notification.message}
            </p>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.01)',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relative Time</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {(() => {
                  const diff = Date.now() - new Date(notification.timestamp).getTime();
                  const mins = Math.floor(diff / 60000);
                  const hrs = Math.floor(mins / 60);
                  const days = Math.floor(hrs / 24);
                  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                  if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
                  if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
                  return 'Just now';
                })()}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logged Timestamp</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              fontSize: '0.82rem',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 500
            }}
          >
            Close
          </button>
          
          <button
            onClick={() => onNavigate(category.label, notification)}
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              padding: '8px 20px',
              fontSize: '0.82rem',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px var(--accent-blue-glow)',
              cursor: 'pointer'
            }}
          >
            <span>Go to {getSectionName(category.label)}</span>
            <ExternalLink size={12} />
          </button>
        </div>

      </div>
    </div>
  );
};
