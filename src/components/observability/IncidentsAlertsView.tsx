import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Bell, User, Mail, Settings, X, Check, RefreshCw, ChevronDown, Lock, CheckCircle2, Hand, Search, Globe, Package, Server, Info, Cpu, Activity } from 'lucide-react';

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
    API_BASE?: string;
    isPackageActive?: boolean;
    onNavigateSettings?: () => void;
    selectedSubscriptionId?: string;
    selectedControlResourceGroup?: string;
}

export const IncidentsAlertsView: React.FC<IncidentsAlertsViewProps> = ({ 
    theme = 'dark', 
    API_BASE = 'http://localhost:5005/api',
    isPackageActive = true,
    onNavigateSettings,
    selectedSubscriptionId,
    selectedControlResourceGroup
}) => {
    const isLight = theme === 'light';
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
    const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [resolvingIncident, setResolvingIncident] = useState<Incident | null>(null);
    const [packageLocked, setPackageLocked] = useState<boolean>(!isPackageActive);

    // Dynamic Data State
    const [teamUsers, setTeamUsers] = useState<any[]>([]);
    const [appsCatalog, setAppsCatalog] = useState<any[]>([]);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const getScopeInfoForApp = (appKey?: string) => {
        const keyLow = (appKey || '').toLowerCase();
        let sub = '4a551976-35a8-4305-b128-fe592805be41';
        let rg = 'Estevia-Platform-RG';

        if (keyLow.includes('peoplecraft')) {
            rg = 'Estevia-Client-Projects-RG';
        } else if (keyLow.includes('marketing')) {
            rg = 'Estevia-Prod-RG';
        } else if (keyLow.includes('evaops') || keyLow.includes('connecthub') || keyLow.includes('estevia')) {
            rg = 'Estevia-Platform-RG';
        }

        return { subId: sub, subShort: `Sub: ${sub.slice(0, 8)}...`, resourceGroup: rg };
    };

    const [configApp, setConfigApp] = useState<string>('connecthub');
    const [configResourceType, setConfigResourceType] = useState<'swa' | 'aca' | 'vm'>('aca');
    const [configEnv, setConfigEnv] = useState<'dev' | 'qa' | 'prod'>('dev');
    const [primaryOwner, setPrimaryOwner] = useState<string>('');
    const [secondaryOwner, setSecondaryOwner] = useState<string>('');
    const [notificationEmail, setNotificationEmail] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['CRITICAL_OUTAGE', 'HIGH_RESOURCE_PRESSURE']);
    const [savingConfig, setSavingConfig] = useState<boolean>(false);

    useEffect(() => {
        setPackageLocked(!isPackageActive);
    }, [isPackageActive]);

    useEffect(() => {
        if (!packageLocked) {
            fetchIncidents();
            fetchTeamAndCatalog();
        } else {
            setLoading(false);
        }
    }, [packageLocked, selectedSubscriptionId, selectedControlResourceGroup]);

    const getToken = () => {
        return localStorage.getItem('evaops_token') || localStorage.getItem('token') || '';
    };

    const fetchTeamAndCatalog = async () => {
        try {
            const token = getToken();
            const uRes = await fetch(`${API_BASE}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);
            if (uRes && uRes.ok) {
                const uData = await uRes.json();
                setTeamUsers(uData.users || uData || []);
            }

            const params = new URLSearchParams();
            if (selectedSubscriptionId) params.append('subscriptionId', selectedSubscriptionId);
            if (selectedControlResourceGroup) params.append('resourceGroup', selectedControlResourceGroup);
            const querySuffix = params.toString() ? `?${params.toString()}` : '';

            const catRes = await fetch(`${API_BASE}/apps/observability/resource-catalog${querySuffix}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);
            if (catRes && catRes.ok) {
                const cData = await catRes.json();
                setAppsCatalog(cData.catalog || []);
                if (cData.catalog && cData.catalog.length > 0) {
                    setConfigApp(cData.catalog[0].key);
                }
            }
        } catch (err) {
            console.error('Failed to load team users or catalog:', err);
        }
    };

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const token = getToken();
            let res = await fetch(`${API_BASE}/apps/observability/incidents`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);

            if (res && res.status === 403) {
                setPackageLocked(true);
                setLoading(false);
                return;
            }

            if (res && res.ok) {
                const data = await res.json();
                if (data.success) {
                    setIncidents((data.incidents || []).map((i: any) => ({ ...i, status: i.status || 'triggered' })));
                    setPackageLocked(false);
                    setLoading(false);
                    return;
                }
            }
            setIncidents([]);
        } catch (err) {
            console.error('Failed to load incidents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id: number) => {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'acknowledged' } : inc));
        try {
            const token = getToken();
            await fetch(`${API_BASE}/apps/observability/incidents/${id}/acknowledge`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);
        } catch (err) {
            console.error('Failed to acknowledge incident:', err);
        }
    };

    const handleResolve = (inc: Incident) => {
        setResolvingIncident(inc);
    };

    const confirmResolve = async () => {
        if (!resolvingIncident) return;
        const id = resolvingIncident.id;
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
        setResolvingIncident(null);
        try {
            const token = getToken();
            await fetch(`${API_BASE}/apps/observability/incidents/${id}/resolve`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);
        } catch (err) {
            console.error('Failed to resolve incident:', err);
        }
    };

    const handleSaveAlertConfig = async () => {
        setSavingConfig(true);
        try {
            const token = getToken();
            await fetch(`${API_BASE}/apps/observability/owners`, {
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

    if (packageLocked) {
        return (
            <div className="glass-panel" style={{
                padding: '56px 36px',
                borderRadius: '24px',
                textAlign: 'center',
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.65)',
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: '20px',
                    background: 'rgba(239, 68, 68, 0.12)', border: '1.5px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
                }}>
                    <Lock size={36} />
                </div>
                <div style={{ maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 12px 0', color: isLight ? '#0f172a' : '#fff' }}>
                        Observability & AI Package Inactive
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: isLight ? '#64748b' : 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
                        Multi-category incident detection, telemetry root-cause snapshots, automated email alerts, and Eva AI resolution requires an active <strong>Observability & AI Package</strong> subscription ($149.00/mo).
                    </p>
                </div>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        if (onNavigateSettings) onNavigateSettings();
                        else window.location.hash = '#settings';
                    }}
                    style={{
                        padding: '12px 28px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                        cursor: 'pointer'
                    }}
                >
                    Activate Observability & AI Package ($149/mo)
                </button>
            </div>
        );
    }

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', whiteSpace: 'nowrap', overflowX: 'auto' }}>
                    <button
                        type="button"
                        onClick={() => setShowInfoDrawer(true)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                            color: isLight ? '#0f172a' : 'var(--text-primary)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Info size={16} style={{ color: '#3b82f6' }} />
                        <span>Incident Rules & Info</span>
                    </button>

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
                        <span>Configure Alert Recipients</span>
                    </button>
                </div>
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
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>Resource, Scope & Env</th>
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
                                incidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(inc => {
                                    const sev = getSeverityBadge(inc.severity);
                                    const scopeInfo = getScopeInfoForApp(inc.app_key);
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span>{inc.app_key}</span>
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        background: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.12)',
                                                        color: isLight ? '#0369a1' : '#38bdf8',
                                                        fontWeight: 600
                                                    }}>
                                                        {scopeInfo.resourceGroup}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>
                                                    {inc.resource_type || 'aca'} • {inc.environment} • <span style={{ textTransform: 'none', opacity: 0.85 }}>{scopeInfo.subShort}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ fontWeight: 600, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                                    {inc.title || (inc as any).incident_title || (inc as any).summary || (inc as any).metric_type || 'Telemetry Incident Alert'}
                                                </div>
                                                <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                                    {inc.description || (inc as any).incident_description || (inc as any).details || (inc as any).summary || 'Automated incident alert recorded by EvaOps Observability monitor.'}
                                                </div>
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
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedIncident(inc)}
                                                        style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.74rem',
                                                            fontWeight: 600,
                                                            background: 'rgba(139, 92, 246, 0.15)',
                                                            color: '#a78bfa',
                                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Search size={12} /> Details
                                                    </button>
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
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <Hand size={12} /> Acknowledge
                                                        </button>
                                                    )}
                                                    {inc.status !== 'resolved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResolve(inc)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.74rem',
                                                                fontWeight: 600,
                                                                background: 'rgba(16, 185, 129, 0.15)',
                                                                color: '#10b981',
                                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <CheckCircle2 size={12} /> Resolve
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

                {/* Pagination Controls */}
                {incidents.length > 0 && (
                    <div style={{
                        padding: '12px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                        fontSize: '0.8rem',
                        color: isLight ? '#64748b' : 'var(--text-secondary)',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div>
                            Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, incidents.length)}</strong> of <strong>{incidents.length}</strong> telemetry incidents
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                                    color: isLight ? '#0f172a' : '#ffffff',
                                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.4 : 1
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ fontWeight: 700, padding: '0 6px', color: isLight ? '#0f172a' : '#ffffff' }}>
                                Page {currentPage} of {Math.ceil(incidents.length / itemsPerPage) || 1}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= Math.ceil(incidents.length / itemsPerPage)}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(incidents.length / itemsPerPage)))}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                                    color: isLight ? '#0f172a' : '#ffffff',
                                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                                    cursor: currentPage >= Math.ceil(incidents.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                                    opacity: currentPage >= Math.ceil(incidents.length / itemsPerPage) ? 0.4 : 1
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Incident Detail & Telemetry Snapshot View */}
            {selectedIncident && (() => {
                const sev = getSeverityBadge(selectedIncident.severity);
                const titleText = selectedIncident.title || (selectedIncident as any).incident_title || (selectedIncident as any).summary || (selectedIncident as any).metric_type || 'Telemetry Incident Alert';
                const descText = selectedIncident.description || (selectedIncident as any).incident_description || (selectedIncident as any).details || (selectedIncident as any).summary || 'Automated incident alert recorded by EvaOps Observability monitor.';
                const snapshot = selectedIncident.telemetry_snapshot || {};

                return (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.5)' : 'rgba(2, 6, 23, 0.82)',
                        backdropFilter: 'blur(16px)',
                        zIndex: 99999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px'
                    }}>
                        <div className="glass-panel" style={{
                            width: '680px',
                            maxWidth: '100%',
                            borderRadius: '20px',
                            background: isLight ? '#ffffff' : '#0f172a',
                            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldAlert size={22} style={{ color: sev.color }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                        Incident Details #{selectedIncident.id}
                                    </h3>
                                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: sev.bg, color: sev.color }}>
                                        {sev.text}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedIncident(null)}
                                    style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', maxHeight: '75vh' }}>
                                {/* Resource Meta Banner */}
                                <div style={{
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Application</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>{selectedIncident.app_key}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Environment / Type</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', textTransform: 'uppercase' }}>
                                            {selectedIncident.environment} • {selectedIncident.resource_type || 'aca'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Recorded Time</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                            {new Date(selectedIncident.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                        {titleText}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.86rem', color: isLight ? '#475569' : 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {descText}
                                    </p>
                                </div>

                                {/* Telemetry Snapshot */}
                                <div>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                                        ⚡ Telemetry Snapshot at Incident Time
                                    </h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {Object.entries(snapshot).length > 0 ? (
                                            Object.entries(snapshot).map(([key, val]) => (
                                                <div key={key} style={{
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    background: isLight ? '#f1f5f9' : 'rgba(139, 92, 246, 0.08)',
                                                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(139, 92, 246, 0.2)'
                                                }}>
                                                    <div style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                                                        {key.replace(/_/g, ' ')}
                                                    </div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: isLight ? '#0f172a' : '#a78bfa', marginTop: '2px' }}>
                                                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ gridColumn: 'span 3', padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                No telemetry snapshot captured.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                    Status: <strong style={{ textTransform: 'uppercase', color: selectedIncident.status === 'triggered' ? '#ef4444' : selectedIncident.status === 'acknowledged' ? '#f59e0b' : '#10b981' }}>{selectedIncident.status}</strong>
                                </span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {selectedIncident.status === 'triggered' && (
                                        <button
                                            type="button"
                                            onClick={() => { handleAcknowledge(selectedIncident.id); setSelectedIncident(null); }}
                                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}
                                        >
                                            Acknowledge Alert ✋
                                        </button>
                                    )}
                                    {selectedIncident.status !== 'resolved' && (
                                        <button
                                            type="button"
                                            onClick={() => { handleResolve(selectedIncident); setSelectedIncident(null); }}
                                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}
                                        >
                                            Mark Resolved ✅
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedIncident(null)}
                                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)', color: isLight ? '#475569' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                                        {appsCatalog.map(app => (
                                            <option key={app.key} value={app.key}>{app.icon || '📦'} {app.label}</option>
                                        ))}
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
                                    <select value={primaryOwner} onChange={(e) => setPrimaryOwner(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <option value="">-- Select Team Member --</option>
                                        {teamUsers.map(u => (
                                            <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: isLight ? '#475569' : 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Secondary Backup Engineer:
                                    </label>
                                    <select value={secondaryOwner} onChange={(e) => setSecondaryOwner(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <option value="">-- Select Team Member --</option>
                                        {teamUsers.map(u => (
                                            <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
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

            {/* Right-Side Slide-Over Information Drawer */}
            {showInfoDrawer && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '460px',
                        height: '100%',
                        background: isLight ? '#ffffff' : '#0f172a',
                        borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto'
                    }}>
                        {/* Drawer Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                    <Info size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                        Incident Automation Rules
                                    </h3>
                                    <div style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                        EvaPulse Telemetry Engine Specifications
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowInfoDrawer(false)}
                                style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Content Body */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Section 1: Detailed Incident Automation Rules */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                        <Cpu size={18} style={{ color: '#8b5cf6' }} />
                                        <span>Incident Automation Rule Specifications</span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                        6 Active Categories
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)', lineHeight: 1.45 }}>
                                    EvaPulse scans telemetry streams in 60-second cycles against these 6 automated breach condition rules:
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                                    {/* Rule 1: CRITICAL_OUTAGE */}
                                    <div style={{ padding: '12px', borderRadius: '10px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ShieldAlert size={14} /> CRITICAL_OUTAGE
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>P1_CRITICAL</span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                                            <strong>Condition:</strong> <code>HTTP 5xx Errors ≥ 5 / interval</code> OR <code>Unreachable Status</code><br />
                                            <strong>Scope:</strong> Container Apps (ACA) & Static Web Apps (SWA)<br />
                                            <strong>Action:</strong> Instant P1 owner email dispatch + Eva AI root-cause snapshot prompt. Auto-clears when 5xx count returns to 0.
                                        </div>
                                    </div>

                                    {/* Rule 2: HIGH_RESOURCE_PRESSURE */}
                                    <div style={{ padding: '12px', borderRadius: '10px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <AlertTriangle size={14} /> HIGH_RESOURCE_PRESSURE
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>P2_HIGH</span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                                            <strong>Condition:</strong> <code>CPU Utilization &gt; 85.0%</code> OR <code>RAM &gt; 90%</code> limit<br />
                                            <strong>Scope:</strong> ACA, SWA & Virtual Machines (VM)<br />
                                            <strong>Action:</strong> P2 alert dispatch + auto-scale evaluation (+1 replica trigger). Auto-clears when CPU drops below 70.0%.
                                        </div>
                                    </div>

                                    {/* Rule 3: LATENCY_DEGRADATION */}
                                    <div style={{ padding: '12px', borderRadius: '10px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)', border: '1px solid rgba(59,130,246,0.25)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} /> LATENCY_DEGRADATION
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>P3_MEDIUM</span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                                            <strong>Condition:</strong> <code>p95 Latency &gt; 2000 ms</code> OR <code>p99 Latency &gt; 3500 ms</code><br />
                                            <strong>Scope:</strong> ACA API Endpoints & Database Pools<br />
                                            <strong>Action:</strong> P3 alert notification to assigned resource owners + database connection pool snapshot.
                                        </div>
                                    </div>

                                    {/* Rule 4: HEALTH_CHECK_FAILURE */}
                                    <div style={{ padding: '12px', borderRadius: '10px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)', border: '1px solid rgba(236,72,153,0.25)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Activity size={14} /> HEALTH_CHECK_FAILURE
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>P2_HIGH</span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                                            <strong>Condition:</strong> <code>Replica Count = 0</code> OR <code>Probe Status ≠ 200 OK</code><br />
                                            <strong>Scope:</strong> Container Apps (ACA)<br />
                                            <strong>Action:</strong> Triggers Container App revision restart & owner alert dispatch.
                                        </div>
                                    </div>

                                    {/* Rule 5: SSL_CERT_EXPIRING */}
                                    <div style={{ padding: '12px', borderRadius: '10px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Lock size={14} /> SSL_CERT_EXPIRING
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>P3_MEDIUM</span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                                            <strong>Condition:</strong> <code>SSL Expiry ≤ 15 Days</code><br />
                                            <strong>Scope:</strong> Static Web Apps (SWA) & Custom Domains<br />
                                            <strong>Action:</strong> Automated TLS certificate renewal notification + GoDaddy DNS audit alert.
                                        </div>
                                    </div>

                                    {/* Rule 6: STORAGE_VOLUME_FULL */}
                                    <div style={{ padding: '12px', borderRadius: '10px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)', border: '1px solid rgba(139,92,246,0.25)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Cpu size={14} /> STORAGE_VOLUME_FULL
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>P3_MEDIUM</span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                                            <strong>Condition:</strong> <code>Storage Volume &gt; 90.0%</code> OR <code>Disk IOPS Saturation ≥ 95%</code><br />
                                            <strong>Scope:</strong> Virtual Machines (VM) & Database Volumes<br />
                                            <strong>Action:</strong> Disk expansion recommendation + notification dispatched to primary storage owner.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Incident Lifecycle */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', marginBottom: '12px' }}>
                                    <Activity size={16} style={{ color: '#2dd4bf' }} />
                                    <span>Incident Lifecycle States</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 700, fontSize: '0.72rem' }}>
                                            Triggered
                                        </span>
                                        <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Newly detected breach. Default state until assigned.</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700, fontSize: '0.72rem' }}>
                                            Acknowledged
                                        </span>
                                        <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Claimed by owner engineer currently investigating.</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                                            Resolved
                                        </span>
                                        <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Fix deployed & verified with user confirmation.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Deduplication & Email Pipeline */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', marginBottom: '12px' }}>
                                    <Mail size={16} style={{ color: '#ec4899' }} />
                                    <span>Alert Routing & Deduplication</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: isLight ? '#475569' : 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Active incident deduplication checks prevent email notification spamming for existing active breaches. HTML alert emails are dispatched to assigned Primary & Secondary resource owners.
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 'auto'
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowInfoDrawer(false)}
                                className="btn-secondary"
                                style={{ padding: '8px 20px', fontSize: '0.82rem' }}
                            >
                                Close Info
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Glassmorphism Resolve Confirmation Modal */}
            {resolvingIncident && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '480px',
                        background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                        Confirm Incident Resolution
                                    </h3>
                                    <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                        Marking ticket as resolved & persisting state to DB
                                    </div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setResolvingIncident(null)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.86rem', color: isLight ? '#334155' : 'var(--text-primary)', lineHeight: 1.5 }}>
                                Are you sure you want to resolve this telemetry incident? Once marked resolved, status will be persisted into MySQL database.
                            </div>

                            <div style={{
                                padding: '14px 16px',
                                borderRadius: '10px',
                                background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                fontSize: '0.78rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Incident ID:</span>
                                    <strong style={{ color: isLight ? '#0f172a' : '#fff' }}>#{resolvingIncident.id}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>App & Environment:</span>
                                    <strong style={{ color: '#8b5cf6' }}>{resolvingIncident.app_key} ({resolvingIncident.environment.toUpperCase()})</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Title:</span>
                                    <span style={{ fontWeight: 600, color: isLight ? '#0f172a' : '#fff' }}>{resolvingIncident.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)'
                        }}>
                            <button
                                type="button"
                                onClick={() => setResolvingIncident(null)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)',
                                    color: isLight ? '#475569' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmResolve}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#ffffff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <CheckCircle2 size={16} /> Confirm & Mark Resolved
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
