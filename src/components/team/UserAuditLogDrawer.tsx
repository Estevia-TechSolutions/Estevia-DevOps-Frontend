import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Terminal, Copy, Check, ChevronDown, ChevronUp, Search, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: number;
  actorEmail: string;
  actionType: string;
  target: string;
  details: {
    method: string;
    path: string;
    ip: string;
    payload: any;
    query?: any;
  };
  createdAt: string;
}

interface UserAuditLogDrawerProps {
  userEmail: string;
  userName: string;
  onClose: () => void;
  API_BASE: string;
  theme: 'dark' | 'light';
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
        color: copied ? 'var(--success)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '0.7rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s'
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

export const UserAuditLogDrawer: React.FC<UserAuditLogDrawerProps> = ({
  userEmail,
  userName,
  onClose,
  API_BASE,
  theme
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const isLight = theme === 'light';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/audit-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch user audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userEmail, API_BASE]);

  const toggleRow = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'SQL_RUN': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'DELETE_RESOURCES': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' };
      case 'ROLE_CHANGE': return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' };
      case 'PROVISION_APP': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'BIND_DOMAIN': return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'CRED_UPDATE': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' };
      case 'APPLY_REMEDIATION': return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' };
      case 'RESOURCE_POWER_CONTROL': return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)' };
      case 'PIPELINE_CREATE': return { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)' };
      case 'PROVISION_DB': return { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)' };
      case 'KEYVAULT_SECRET_MAP': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' };
      case 'KEYVAULT_SECRET_UNMAP': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' };
      case 'ONBOARDING_SETUP': return { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' };
      case 'SCHEDULER_SAVE': return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)' };
      case 'DB_SCHEMA_COMPARE': return { color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.1)', border: '1px solid rgba(203, 213, 225, 0.2)' };
      case 'DB_SCHEMA_MIGRATE': return { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)', border: '1px solid rgba(244, 114, 182, 0.2)' };
      case 'DB_DATA_MIGRATE': return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)' };
      case 'EVA_AI_CONSULT': return { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)' };
      case 'DB_BACKUP': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'USER_LOGIN_MS':
      case 'USER_LOGIN_BYPASS': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      default:
        return { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' };
    }
  };

  const userLogs = logs.filter(
    (log) =>
      log.actionType !== 'VIEW_AUDIT' &&
      log.actionType !== 'VIEW_LOGS' &&
      (log.actorEmail || '').toLowerCase() === (userEmail || '').toLowerCase() &&
      ((log.actionType || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.target || '').toLowerCase().includes(search.toLowerCase()))
  );

  return createPortal(
    <>
      {/* Animation Style */}
      <style>{`
        @keyframes slide-in-anim {
          from { right: -100%; }
          to { right: 0; }
        }
        @keyframes fade-in-anim {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-shimmer {
          0% { opacity: 0.35; }
          50% { opacity: 0.75; }
          100% { opacity: 0.35; }
        }
      `}</style>

      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.6)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 9998,
          opacity: 1,
          animation: 'fade-in-anim 0.2s ease-out forwards'
        }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '580px',
          maxWidth: '100vw',
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
          borderLeft: '1px solid var(--glass-border)',
          boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.45)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-anim 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >

        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.01)'
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Shield size={18} style={{ color: 'var(--accent-purple)' }} />
              User Audit Logs: {userName}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Viewing recorded operations for <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{userEmail}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search toolbar */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search user logs by action or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                fontSize: '0.8rem',
                height: '32px',
                padding: '0 10px 0 30px',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              fontSize: '0.78rem'
            }}
          >
            <RefreshCw size={12} className={loading ? 'spin-anim' : ''} />
            Refresh
          </button>
        </div>

        {/* Drawer content list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading && logs.length === 0 ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`shimmer-${idx}`}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '140px',
                    height: '14px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.04)',
                    animation: 'pulse-shimmer 1.5s infinite ease-in-out'
                  }}
                />
                <div
                  style={{
                    width: '80px',
                    height: '18px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.04)',
                    animation: 'pulse-shimmer 1.5s infinite ease-in-out'
                  }}
                />
              </div>
            ))
          ) : userLogs.length === 0 ? (
            <div
              style={{
                color: 'var(--text-secondary)',
                padding: '40px 0',
                textAlign: 'center',
                fontStyle: 'italic',
                border: '1px dashed var(--glass-border)',
                borderRadius: '8px'
              }}
            >
              No matching audit logs found for this user.
            </div>
          ) : (
            userLogs.map((log) => {
              const isExpanded = String(expandedId) === String(log.id);
              const badgeStyle = getActionBadgeColor(log.actionType);

              return (
                <div
                  key={log.id}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: isExpanded 
                      ? (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.015)') 
                      : (isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.005)'),
                    overflow: 'hidden',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {/* Collapsed Header Summary */}
                  <div
                    onClick={() => toggleRow(log.id)}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', ...badgeStyle }}>
                        {log.actionType}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        Target: <strong style={{ color: 'var(--text-primary)' }}>{log.target}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ 
                      padding: '16px', 
                      borderTop: '1px solid var(--glass-border)', 
                      background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.15)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      {/* Metadata summary */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.74rem' }}>
                        {(() => {
                          try {
                            const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                            const method = detailsObj?.method || 'POST';
                            const path = detailsObj?.path || '/';
                            const ip = detailsObj?.ip || 'Unknown IP';
                            const methodColor = method === 'DELETE' ? '#ef4444' : method === 'PUT' ? '#fb923c' : method === 'GET' ? '#3b82f6' : '#10b981';
                            return (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    padding: '2px 5px',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${methodColor}`,
                                    color: methodColor
                                  }}>
                                    {method}
                                  </span>
                                  <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{path}</span>
                                </div>
                                <div style={{ color: 'var(--text-muted)' }}>|</div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                  IP: <span style={{ fontFamily: 'monospace' }}>{ip}</span>
                                </div>
                              </>
                            );
                          } catch (err) {
                            return null;
                          }
                        })()}
                      </div>

                      {/* Pre Payload details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Terminal size={11} style={{ color: 'var(--accent-purple)' }} />
                            Request Body / Parameters
                          </span>
                          <CopyButton text={(() => {
                            try {
                              const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                              return JSON.stringify(detailsObj?.payload || detailsObj?.query || {}, null, 2);
                            } catch (err) {
                              return String(log.details);
                            }
                          })()} />
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            background: '#020617',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--glass-border)',
                            maxHeight: '160px',
                            overflowY: 'auto'
                          }}
                        >
                          {(() => {
                            try {
                              const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                              return JSON.stringify(detailsObj?.payload || detailsObj?.query || {}, null, 2);
                            } catch (err) {
                              return String(log.details);
                            }
                          })()}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
