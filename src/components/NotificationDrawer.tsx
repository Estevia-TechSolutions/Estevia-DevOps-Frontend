import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Trash2, BellOff } from 'lucide-react';

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onDeleteNotification,
}) => {
  // Format the timestamp in a human-readable way
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '420px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(35px)',
          WebkitBackdropFilter: 'blur(35px)',
          borderLeft: '1px solid var(--glass-border)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.35)',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Notification Hub
            </span>
            {notifications.length > 0 && (
              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-purple)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  boxShadow: '0 0 8px var(--accent-purple-glow)',
                }}
              >
                {notifications.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {notifications.length > 0 && (
              <button 
                onClick={onClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
              >
                <Trash2 size={12} />
                Clear All
              </button>
            )}

            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="notification-list"
        >
          {notifications.length === 0 ? (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
                gap: '12px',
                opacity: 0.8,
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <BellOff size={20} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  All caught up!
                </span>
                <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  No new system notifications at this time.
                </span>
              </div>
            </div>
          ) : (
            notifications.map((n) => {
              // Icon mapping
              let icon = <Info size={14} style={{ color: 'var(--accent-blue)' }} />;
              let iconBg = 'rgba(59, 130, 246, 0.1)';
              let borderCol = 'rgba(59, 130, 246, 0.2)';
              
              if (n.type === 'success') {
                icon = <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />;
                iconBg = 'rgba(34, 197, 94, 0.1)';
                borderCol = 'rgba(34, 197, 94, 0.2)';
              } else if (n.type === 'warning') {
                icon = <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />;
                iconBg = 'rgba(245, 158, 11, 0.1)';
                borderCol = 'rgba(245, 158, 11, 0.2)';
              } else if (n.type === 'error') {
                icon = <AlertCircle size={14} style={{ color: 'var(--error)' }} />;
                iconBg = 'rgba(239, 68, 68, 0.1)';
                borderCol = 'rgba(239, 68, 68, 0.2)';
              }

              return (
                <div 
                  key={n.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: n.read ? 'rgba(255, 255, 255, 0.015)' : 'rgba(139, 92, 246, 0.03)',
                    border: n.read ? '1px solid var(--glass-border)' : '1px solid rgba(139, 92, 246, 0.25)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: n.read ? 'none' : 'inset 0 0 10px rgba(139, 92, 246, 0.02)',
                  }}
                >
                  {/* Unread indicator */}
                  {!n.read && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '44px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-purple)',
                        boxShadow: '0 0 6px var(--accent-purple)',
                      }}
                    />
                  )}

                  {/* Title & Icon Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div 
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: iconBg,
                        border: `1px solid ${borderCol}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span 
                        style={{ 
                          display: 'block', 
                          fontSize: '0.84rem', 
                          fontWeight: n.read ? 600 : 700, 
                          color: 'var(--text-primary)',
                          lineHeight: '1.35',
                        }}
                      >
                        {n.title}
                      </span>
                      
                      {/* Message */}
                      <p 
                        style={{ 
                          margin: '6px 0 0 0', 
                          fontSize: '0.78rem', 
                          color: 'var(--text-secondary)',
                          lineHeight: '1.45',
                          wordBreak: 'break-word',
                        }}
                      >
                        {n.message}
                      </p>

                      {/* Time */}
                      <span 
                        style={{ 
                          display: 'block', 
                          fontSize: '0.68rem', 
                          color: 'var(--text-muted)',
                          marginTop: '8px',
                          fontWeight: 500,
                        }}
                      >
                        {formatTime(n.timestamp)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => onDeleteNotification(n.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        marginLeft: '8px',
                        marginTop: '-4px',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
