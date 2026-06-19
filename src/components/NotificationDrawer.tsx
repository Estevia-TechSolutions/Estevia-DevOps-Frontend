import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Trash2, BellOff, ChevronDown, ChevronRight, Clock, ArrowRight } from 'lucide-react';

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
  onViewDetails?: (category: string, notification: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onDeleteNotification,
  onViewDetails,
}) => {
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});

  // Calculate dynamic relative time labels
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Format absolute timestamp for tooltips
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Dynamic Operations Tagging
  const getCategoryTag = (title: string, message: string) => {
    const t = (title + ' ' + message).toLowerCase();
    if (t.includes('remediation') || t.includes('optimize') || t.includes('cost') || t.includes('savings') || t.includes('bill')) {
      return { label: 'FINOPS', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' };
    }
    if (t.includes('security') || t.includes('credentials') || t.includes('secrets') || t.includes('keyvault') || t.includes('token')) {
      return { label: 'SECURITY', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)' };
    }
    if (t.includes('provision') || t.includes('database') || t.includes('pipeline') || t.includes('deploy')) {
      return { label: 'PROVISION', color: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.2)' };
    }
    if (t.includes('scan') || t.includes('infrastructure') || t.includes('telemetry') || t.includes('agent')) {
      return { label: 'MONITOR', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.2)' };
    }
    return { label: 'SYSTEM', color: 'var(--text-secondary)', bg: 'rgba(255, 255, 255, 0.04)', border: 'var(--glass-border)' };
  };

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 4px rgba(139, 92, 246, 0.4); }
          50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 10px rgba(139, 92, 246, 0.8); }
        }
        .notification-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .notification-card:hover {
          transform: translateY(-2px) !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
        }
        .notif-delete-btn:hover {
          color: var(--error) !important;
          background: rgba(239, 68, 68, 0.08) !important;
        }
        .notif-action-btn:hover {
          color: var(--accent-blue) !important;
          transform: translateX(2px) !important;
        }
      `}</style>

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
              // Icon and background color mapping by notification severity
              let icon = <Info size={14} style={{ color: 'var(--accent-blue)' }} />;
              let iconBg = 'rgba(59, 130, 246, 0.1)';
              let borderCol = 'rgba(59, 130, 246, 0.2)';
              let cardBg = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.01) 100%)';
              let cardBorderLeft = '3px solid var(--accent-blue, #3b82f6)';
              let unreadShadow = 'rgba(59, 130, 246, 0.08)';

              if (n.type === 'success') {
                icon = <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />;
                iconBg = 'rgba(34, 197, 94, 0.1)';
                borderCol = 'rgba(34, 197, 94, 0.2)';
                cardBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.01) 100%)';
                cardBorderLeft = '3px solid var(--success, #10b981)';
                unreadShadow = 'rgba(16, 185, 129, 0.08)';
              } else if (n.type === 'warning') {
                icon = <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />;
                iconBg = 'rgba(245, 158, 11, 0.1)';
                borderCol = 'rgba(245, 158, 11, 0.2)';
                cardBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.01) 100%)';
                cardBorderLeft = '3px solid var(--warning, #f59e0b)';
                unreadShadow = 'rgba(245, 158, 11, 0.08)';
              } else if (n.type === 'error') {
                icon = <AlertCircle size={14} style={{ color: 'var(--error)' }} />;
                iconBg = 'rgba(239, 68, 68, 0.1)';
                borderCol = 'rgba(239, 68, 68, 0.2)';
                cardBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.01) 100%)';
                cardBorderLeft = '3px solid var(--error, #ef4444)';
                unreadShadow = 'rgba(239, 68, 68, 0.08)';
              }

              const isExpanded = expandedNotifications[n.id] !== undefined
                ? expandedNotifications[n.id]
                : !n.read; // unread expanded by default, read collapsed by default

              const category = getCategoryTag(n.title, n.message);

              return (
                <div 
                  key={n.id}
                  className="notification-card"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: cardBg,
                    border: n.read ? '1px solid var(--glass-border)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderLeft: cardBorderLeft,
                    position: 'relative',
                    boxShadow: n.read ? 'none' : `0 4px 14px ${unreadShadow}`,
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                    {/* Collapsible toggle trigger zone */}
                    <div 
                      onClick={() => setExpandedNotifications(prev => ({ ...prev, [n.id]: !isExpanded }))}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                        userSelect: 'none'
                      }}
                    >
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
                        }}
                      >
                        {icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span 
                            style={{ 
                              fontSize: '0.82rem', 
                              fontWeight: n.read ? 600 : 700, 
                              color: 'var(--text-primary)',
                              lineHeight: '1.2',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              maxWidth: '130px',
                            }}
                          >
                            {n.title}
                          </span>
                          <span 
                            style={{
                              fontSize: '0.56rem',
                              fontWeight: 700,
                              color: category.color,
                              background: category.bg,
                              border: `1px solid ${category.border}`,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              letterSpacing: '0.02em',
                              flexShrink: 0,
                            }}
                          >
                            {category.label}
                          </span>
                        </div>
                        
                        {/* Time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                          <Clock size={10} style={{ opacity: 0.6 }} />
                          <span title={formatTime(n.timestamp)} style={{ cursor: 'help' }}>
                            {getRelativeTime(n.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Collapse/Expand chevron */}
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>

                    {/* Non-trigger operations zone: unread dot + delete trigger */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {!n.read && (
                        <span 
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-purple)',
                            boxShadow: '0 0 6px var(--accent-purple)',
                            animation: 'pulse-dot 2s infinite ease-in-out',
                            display: 'inline-block',
                          }}
                        />
                      )}

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(n.id);
                        }}
                        className="notif-delete-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail view */}
                  {isExpanded && (
                    <div 
                      style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px dashed var(--glass-border)',
                        animation: 'fade-in-anim 0.2s ease-out'
                      }}
                    >
                      <p 
                        style={{ 
                          margin: 0, 
                          fontSize: '0.78rem', 
                          color: 'var(--text-secondary)',
                          lineHeight: '1.45',
                          wordBreak: 'break-word',
                        }}
                      >
                        {n.message}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onViewDetails) {
                              onViewDetails(category.label, n);
                            } else {
                              onClose();
                            }
                          }}
                          className="notif-action-btn"
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--accent-purple)',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>View Details</span>
                          <ArrowRight size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
