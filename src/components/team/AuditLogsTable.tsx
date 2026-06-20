import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, ChevronUp, RefreshCw, Terminal, Copy, Check } from 'lucide-react';

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

interface AuditLogsTableProps {
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
        fontSize: '0.72rem',
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

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ API_BASE, theme }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Interactive Category Filter State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [API_BASE]);

  // Reset to page 1 when search, items per page, or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage, activeCategory]);

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
      case 'ORG_SETTINGS_UPDATE': return { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' };
      case 'TEAMS_WEBHOOK_TEST':
      case 'TEAMS_HOOK_SETUP': return { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)' };
      case 'DISCOVER_WORKSPACE': return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)' };
      case 'DOCKERFILE_CREATE':
      case 'DOCKERFILE_UPDATE': return { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)' };
      case 'TRAFFIC_UPDATE': return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)' };
      case 'REVISION_MODE_UPDATE': return { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)' };
      case 'DNS_SWAP': return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' };
      case 'TEST_AZURE_CONN':
      case 'TEST_GITHUB_CONN':
      case 'TEST_DEVOPS_CONN':
      case 'TEST_GODADDY_CONN': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' };
      default:
        if (action.startsWith('TEST_') && action.endsWith('_CONN')) {
          return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' };
        }
        return { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' };
    }
  };

  // Category Matching Rule
  const matchesCategory = (log: AuditLog) => {
    const act = log.actionType;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'logins') return act === 'USER_LOGIN_MS' || act === 'USER_LOGIN_BYPASS';
    if (activeCategory === 'databases') return ['SQL_RUN', 'PROVISION_DB', 'DB_SCHEMA_COMPARE', 'DB_SCHEMA_MIGRATE', 'DB_DATA_MIGRATE', 'DB_BACKUP'].includes(act);
    if (activeCategory === 'credentials') return ['CRED_UPDATE', 'CRED_VALIDATE', 'KEYVAULT_SECRET_MAP', 'KEYVAULT_SECRET_UNMAP'].includes(act);
    if (activeCategory === 'remediations') return act === 'APPLY_REMEDIATION';
    if (activeCategory === 'general') {
      return !['USER_LOGIN_MS', 'USER_LOGIN_BYPASS', 'SQL_RUN', 'PROVISION_DB', 'DB_SCHEMA_COMPARE', 'DB_SCHEMA_MIGRATE', 'DB_DATA_MIGRATE', 'DB_BACKUP', 'CRED_UPDATE', 'CRED_VALIDATE', 'KEYVAULT_SECRET_MAP', 'KEYVAULT_SECRET_UNMAP', 'APPLY_REMEDIATION'].includes(act);
    }
    return true;
  };

  const filteredLogs = logs.filter(l => 
    matchesCategory(l) && (
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.actionType.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Animation Style */}
      <style>{`
        @keyframes pulse-shimmer {
          0% { opacity: 0.35; }
          50% { opacity: 0.75; }
          100% { opacity: 0.35; }
        }
      `}</style>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '3px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--glass-border)', width: 'fit-content' }}>
        {[
          { key: 'all', label: 'All Audits' },
          { key: 'logins', label: 'Logins' },
          { key: 'databases', label: 'Database Ops' },
          { key: 'credentials', label: 'Credentials' },
          { key: 'remediations', label: 'Remediations' },
          { key: 'general', label: 'General' }
        ].map((cat) => {
          const isCatActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: isCatActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'transparent',
                color: isCatActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: isCatActive ? 600 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                boxShadow: isCatActive ? '0 2px 6px var(--accent-blue-glow)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search and Refresh bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search logs by actor email, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              fontSize: '0.82rem',
              height: '36px',
              padding: '0 12px 0 34px',
              borderRadius: '8px',
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
          style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
          Refresh Logs
        </button>
      </div>

      {/* Grid Table / Loading Shimmers */}
      {loading && logs.length === 0 ? (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Target</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '80px', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`shimmer-${idx}`} style={{ borderBottom: '1px solid var(--divider)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="shimmer" style={{ width: '135px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="shimmer" style={{ width: '95px', height: '18px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="shimmer" style={{ width: '150px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="shimmer" style={{ width: '110px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', margin: '0 auto', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center', fontStyle: 'italic', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
          No audited actions recorded.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actor</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Target</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, width: '80px', textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const badgeStyle = getActionBadgeColor(log.actionType);
                  return (
                    <React.Fragment key={log.id}>
                      <tr style={{ 
                        borderBottom: isExpanded ? 'none' : '1px solid var(--divider)',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(255,255,255,0.015)' : 'transparent'
                      }} onClick={() => toggleRow(log.id)}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.actorEmail}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            ...badgeStyle
                          }}>
                            {log.actionType}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{log.target}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>

                      {/* Overhauled Details Panel */}
                      {isExpanded && (
                        <tr style={{ borderBottom: '1px solid var(--divider)', background: 'rgba(0,0,0,0.15)' }}>
                          <td colSpan={5} style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              
                              {/* Metadata Grid */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                padding: '14px 18px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--glass-border)'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Actor Email</span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{log.actorEmail}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Target Entity</span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.target}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Request Endpoint</span>
                                  {(() => {
                                    try {
                                      const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                                      const method = detailsObj?.method || 'POST';
                                      const path = detailsObj?.path || '/';
                                      const methodColor = method === 'DELETE' ? '#ef4444' : method === 'PUT' ? '#fb923c' : method === 'GET' ? '#3b82f6' : '#10b981';
                                      return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                                          <span style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 800,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${methodColor}`,
                                            color: methodColor
                                          }}>
                                            {method}
                                          </span>
                                          <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{path}</span>
                                        </div>
                                      );
                                    } catch (err) {
                                      return <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>-</span>;
                                    }
                                  })()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Source IP Address</span>
                                  {(() => {
                                    try {
                                      const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                                      return <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{detailsObj?.ip || 'Unknown'}</span>;
                                    } catch (err) {
                                      return <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>-</span>;
                                    }
                                  })()}
                                </div>
                              </div>

                              {/* Request Payload JSON */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                    <Terminal size={12} style={{ color: 'var(--accent-purple)' }} />
                                    <span>Request Body Payload & Parameters</span>
                                  </div>
                                  <CopyButton text={(() => {
                                    try {
                                      const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                                      return JSON.stringify(detailsObj?.payload || detailsObj?.query || {}, null, 2);
                                    } catch (err) {
                                      return String(log.details);
                                    }
                                  })()} />
                                </div>
                                
                                <pre style={{
                                  margin: 0,
                                  background: '#020617',
                                  borderRadius: '8px',
                                  padding: '14px',
                                  fontFamily: 'monospace',
                                  fontSize: '0.74rem',
                                  color: '#cbd5e1',
                                  whiteSpace: 'pre-wrap',
                                  border: '1px solid var(--glass-border)',
                                  maxHeight: '220px',
                                  overflowY: 'auto'
                                }}>
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
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Premium Pagination Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            background: 'rgba(255, 255, 255, 0.01)', 
            border: '1px solid var(--glass-border)',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span>Show</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '2px 8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  width: 'auto',
                  outline: 'none'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
              <span style={{ marginLeft: '12px', opacity: 0.8 }}>
                Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length} entries
              </span>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    opacity: currentPage === 1 ? 0.4 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={isCurrent ? "btn-primary" : "btn-secondary"}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        borderRadius: '6px',
                        fontWeight: isCurrent ? 'bold' : 'normal',
                        minWidth: '32px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCurrent ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : undefined,
                        borderColor: isCurrent ? 'transparent' : undefined,
                        boxShadow: isCurrent ? 'none' : undefined,
                        transform: 'none'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
