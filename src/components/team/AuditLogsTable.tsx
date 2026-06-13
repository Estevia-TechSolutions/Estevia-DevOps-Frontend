import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, ChevronUp, RefreshCw, Terminal, Eye } from 'lucide-react';

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
  };
  createdAt: string;
}

interface AuditLogsTableProps {
  API_BASE: string;
  theme: 'dark' | 'light';
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ API_BASE, theme }) => {
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
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [API_BASE]);

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
      default: return { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' };
    }
  };

  const filteredLogs = logs.filter(l => 
    l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.actionType.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
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

      {/* Grid Table */}
      {loading && logs.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '20px 0' }}>
          <RefreshCw size={20} className="spin-anim" />
          <span>Loading activity logs...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center', fontStyle: 'italic' }}>
          No audited actions recorded.
        </div>
      ) : (
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
              {filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                const badgeStyle = getActionBadgeColor(log.actionType);
                return (
                  <React.Fragment key={log.id}>
                    <tr style={{ 
                      borderBottom: isExpanded ? 'none' : '1px solid var(--divider)',
                      cursor: 'pointer'
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

                    {/* Expanded Metadata Block */}
                    {isExpanded && (
                      <tr style={{ borderBottom: '1px solid var(--divider)', background: 'rgba(0,0,0,0.1)' }}>
                        <td colSpan={5} style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              <Terminal size={12} style={{ color: 'var(--accent-purple)' }} />
                              <span>Request Metadata Payload:</span>
                            </div>
                            
                            <pre style={{
                              margin: 0,
                              background: '#020617',
                              borderRadius: '6px',
                              padding: '14px',
                              fontFamily: 'monospace',
                              fontSize: '0.74rem',
                              color: '#cbd5e1',
                              whiteSpace: 'pre-wrap',
                              border: '1px solid var(--glass-border)',
                              maxHeight: '180px',
                              overflowY: 'auto'
                            }}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
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
      )}

    </div>
  );
};
