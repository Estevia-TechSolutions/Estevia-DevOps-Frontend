import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Bell, User, Mail, Settings, X, Check, RefreshCw, ChevronDown, Lock } from 'lucide-react';

interface Incident {
    id: number;
    app_key: string;
    resource_type: 'swa' | 'aca' | 'vm';
    environment: 'dev' | 'qa' | 'prod';
    category: 'CRITICAL_OUTAGE' | 'HIGH_RESOURCE_PRESSURE' | 'LATENCY_DEGRADATION' | 'SSL_CERT_EXPIRING' | 'HEALTH_CHECK_FAILURE';
    severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
    title: string;
    description: string;
    telemetry_snapshot: any;
    status: 'triggered' | 'acknowledged' | 'resolved' | 'auto_healed';
    responsible_user_id?: string;
    created_at: string;
}

interface IncidentsAlertsViewProps {
    theme?: 'dark' | 'light';
}

export const IncidentsAlertsView: React.FC<IncidentsAlertsViewProps> = ({ theme = 'dark' }) => {
    const isLight = theme === 'light';
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    // Grouped Alert Config State per Resource Type
    const [configApp, setConfigApp] = useState<string>('connecthub');
    const [configResourceType, setConfigResourceType] = useState<'swa' | 'aca' | 'vm'>('aca');
    const [configEnv, setConfigEnv] = useState<'dev' | 'qa' | 'prod'>('dev');
    const [primaryOwner, setPrimaryOwner] = useState<string>('Dhruv Charan');
    const [secondaryOwner, setSecondaryOwner] = useState<string>('Akhil Menon');
    const [notificationEmail, setNotificationEmail] = useState<string>('devops-alerts@estevia.com');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([
        'CRITICAL_OUTAGE',
        'HIGH_RESOURCE_PRESSURE',
        'LATENCY_DEGRADATION'
    ]);
    const [savingConfig, setSavingConfig] = useState<boolean>(false);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('evaops_token');
            const res = await fetch('/api/observability/incidents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setIncidents(data.incidents || []);
            }
        } catch (err) {
            console.error('Failed to load incidents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id: number) => {
        try {
            const token = localStorage.getItem('evaops_token');
            await fetch(`/api/observability/incidents/${id}/acknowledge`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchIncidents();
        } catch (err) {
            console.error('Failed to acknowledge incident:', err);
        }
    };

    const handleResolve = async (id: number) => {
        try {
            const token = localStorage.getItem('evaops_token');
            await fetch(`/api/observability/incidents/${id}/resolve`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchIncidents();
        } catch (err) {
            console.error('Failed to resolve incident:', err);
        }
    };

    const handleSaveAlertConfig = async () => {
        setSavingConfig(true);
        try {
            const token = localStorage.getItem('evaops_token');
            await fetch('/api/observability/owners', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    app_key: configApp,
                    resource_type: configResourceType,
                    environment: configEnv,
                    primary_owner_user_id: primaryOwner,
                    secondary_owner_user_id: secondaryOwner,
                    notification_email: notificationEmail,
                    alert_categories: selectedCategories
                })
            });
            setShowConfigModal(false);
            alert(`Alert notification settings saved for ${configApp} (${configResourceType.toUpperCase()} / ${configEnv.toUpperCase()})`);
        } catch (err) {
            console.error('Failed to save alert configuration:', err);
        } finally {
            setSavingConfig(false);
        }
    };

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const getSeverityBadge = (sev: string) => {
        if (sev === 'P1_CRITICAL') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', text: '🔴 P1 CRITICAL' };
        if (sev === 'P2_HIGH') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', text: '🟠 P2 HIGH' };
        if (sev === 'P3_MEDIUM') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', text: '🟡 P3 MEDIUM' };
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: '🔵 P4 LOW' };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Control Toolbar */}
            <div className="glass-panel" style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                    }}>
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            Incident Management & Telemetry Alerts
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                            Multi-category lifecycle tracking, telemetry root-cause snapshots & email notifications
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowConfigModal(true)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <Bell size={16} />
                    <span>🔔 Configure Alert Recipients</span>
                </button>
            </div>

            {/* Incidents Data Table */}
            <div className="glass-panel" style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>Severity & Category</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>Resource & Env</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>Title & Description</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>Status</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>Created At</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                        <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '8px' }} />
                                        <div>All systems operational! No active incidents recorded.</div>
                                    </td>
                                </tr>
                            ) : (
                                incidents.map(inc => {
                                    const sev = getSeverityBadge(inc.severity);
                                    return (
                                        <tr key={inc.id} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{
                                                    padding: '3px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    background: sev.bg,
                                                    color: sev.color
                                                }}>
                                                    {sev.text}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 18px', fontWeight: 600, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                                <div>{inc.app_key}</div>
                                                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                                    {inc.resource_type || 'aca'} • {inc.environment}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ fontWeight: 600, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>{inc.title}</div>
                                                <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>{inc.description}</div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    background: inc.status === 'triggered' ? 'rgba(239,68,68,0.1)' : inc.status === 'acknowledged' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                                    color: inc.status === 'triggered' ? '#ef4444' : inc.status === 'acknowledged' ? '#f59e0b' : '#10b981'
                                                }}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 18px', fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                                {new Date(inc.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    {inc.status === 'triggered' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAcknowledge(inc.id)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.74rem',
                                                                fontWeight: 600,
                                                                background: 'rgba(245, 158, 11, 0.15)',
                                                                color: '#f59e0b',
                                                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Acknowledge ✋
                                                        </button>
                                                    )}
                                                    {inc.status !== 'resolved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResolve(inc.id)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.74rem',
                                                                fontWeight: 600,
                                                                background: 'rgba(16, 185, 129, 0.15)',
                                                                color: '#10b981',
                                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Resolve ✅
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Grouped Alert Notification Settings (SWA, ACA, VM) */}
            {showConfigModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(2, 6, 23, 0.8)',
                    backdropFilter: 'blur(16px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div className="glass-panel" style={{
                        width: '640px',
                        maxWidth: '100%',
                        borderRadius: '20px',
                        background: isLight ? '#ffffff' : '#0f172a',
                        border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                🔔 Configure Alert Notification Recipients & Rules
                            </h3>
                            <button type="button" onClick={() => setShowConfigModal(false)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Grouping 1: Resource Type */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: isLight ? '#475569' : 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Target Asset Category & Environment:
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    <select value={configResourceType} onChange={(e) => setConfigResourceType(e.target.value as any)} style={{ padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <option value="aca">📦 Container App (ACA)</option>
                                        <option value="swa">🌐 Static Web App (SWA)</option>
                                        <option value="vm">🖥️ Virtual Machine (VM)</option>
                                    </select>
                                    <select value={configApp} onChange={(e) => setConfigApp(e.target.value)} style={{ padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <option value="connecthub">ConnectHub</option>
                                        <option value="docai">DocAI Portal</option>
                                        <option value="protrack">ProTrack ERP</option>
                                    </select>
                                    <select value={configEnv} onChange={(e) => setConfigEnv(e.target.value as any)} style={{ padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <option value="dev">Dev</option>
                                        <option value="qa">QA</option>
                                        <option value="prod">Production</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grouping 2: Ownership */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: isLight ? '#475569' : 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Primary Responsible Engineer:
                                    </label>
                                    <input type="text" value={primaryOwner} onChange={(e) => setPrimaryOwner(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: isLight ? '#475569' : 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Secondary Backup Engineer:
                                    </label>
                                    <input type="text" value={secondaryOwner} onChange={(e) => setSecondaryOwner(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }} />
                                </div>
                            </div>

                            {/* Target Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: isLight ? '#475569' : 'var(--text-secondary)', marginBottom: '4px' }}>
                                    Notification Target Email / Distribution Alias:
                                </label>
                                <input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }} />
                            </div>

                            {/* Category Filters */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: isLight ? '#475569' : 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Enable Alerts for Incident Categories:
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { key: 'CRITICAL_OUTAGE', label: '🔴 Critical Outage (Container Crash / 5xx Errors > 15%)' },
                                        { key: 'HIGH_RESOURCE_PRESSURE', label: '🟠 High Resource Pressure (CPU > 85% / Memory > 90%)' },
                                        { key: 'LATENCY_DEGRADATION', label: '🟡 Latency Degradation (p95 Latency > 2,000 ms)' },
                                        { key: 'SSL_CERT_EXPIRING', label: '🔵 SSL Certificate Expiration (< 14 Days)' },
                                        { key: 'HEALTH_CHECK_FAILURE', label: '🟣 Health Check Failure (Liveness Probe Fail)' }
                                    ].map(item => (
                                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(item.key)}
                                                onChange={() => toggleCategory(item.key)}
                                                style={{ accentColor: '#8b5cf6' }}
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px 24px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => setShowConfigModal(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                                Cancel
                            </button>
                            <button type="button" onClick={handleSaveAlertConfig} disabled={savingConfig} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: '#fff', border: 'none', borderRadius: '8px' }}>
                                {savingConfig ? <RefreshCw size={14} className="spin-anim" /> : <Check size={14} />}
                                Save Alert Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
