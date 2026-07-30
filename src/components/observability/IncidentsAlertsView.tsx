import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Bell, User, Mail, Settings, X, Check, RefreshCw, ChevronDown, Lock, CheckCircle2, Hand, Search, Globe, Package, Server, Info, Cpu, Activity, Bot, Sparkles, ExternalLink, Terminal, Copy } from 'lucide-react';

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

    // Grid Search & Filter State
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
    const [selectedEnvFilter, setSelectedEnvFilter] = useState<string>('ALL');

    // Info Drawer State & Priority Filtering
    const [drawerTab, setDrawerTab] = useState<'rules' | 'self_healing' | 'escalation'>('rules');
    const [drawerSearch, setDrawerSearch] = useState<string>('');
    const [drawerPriorityFilter, setDrawerPriorityFilter] = useState<string>('ALL');

    const getScopeInfoForApp = (appKey?: string) => {
        const keyLow = (appKey || '').toLowerCase();
        let sub = '4a551976-35a8-4305-b128-fe592805be41';
        let subName = 'Estevia Primary Subscription';
        let rg = 'Estevia-Platform-RG';

        if (keyLow.includes('peoplecraft')) {
            rg = 'Estevia-Client-Projects-RG';
            subName = 'Estevia Client Apps Subscription';
        } else if (keyLow.includes('marketing')) {
            rg = 'Estevia-Prod-RG';
            subName = 'Estevia Production Subscription';
        } else if (keyLow.includes('evaops') || keyLow.includes('connecthub') || keyLow.includes('estevia')) {
            rg = 'Estevia-Platform-RG';
            subName = 'Estevia Platform Subscription';
        }

        return { subId: sub, subName, subShort: subName, resourceGroup: rg };
    };

    const getResourceInfo = (appKey?: string, environment?: string, customName?: string, incidentObj?: any) => {
        // 1. If backend incident object already carries exact real azure_portal_url and azure_resource_name from DB, use it directly!
        if (incidentObj?.azure_portal_url && incidentObj?.azure_resource_name) {
            let displayName = customName || appKey || 'Cloud Resource';
            const keyLow = (appKey || '').toLowerCase();
            if (keyLow.includes('evaops') || keyLow.includes('cloud-service') || keyLow.includes('estevia-backend')) displayName = 'Estevia DevOps Core Backend API';
            else if (keyLow.includes('evaops-frontend') || keyLow.includes('estevia-frontend')) displayName = 'Estevia DevOps Control Portal';
            else if (keyLow.includes('marketing')) displayName = 'Estevia Corporate Marketing Portal';
            else if (keyLow.includes('peoplecraft') && keyLow.includes('frontend')) displayName = 'PeopleCraft Enterprise HR Web Portal';
            else if (keyLow.includes('peoplecraft')) displayName = 'PeopleCraft Enterprise HR Core Backend';
            else if (keyLow.includes('peoplecraft-db')) displayName = 'PeopleCraft MySQL Database Server';
            else if (keyLow.includes('estevia-platform-db')) displayName = 'Estevia Platform MySQL Database';

            return {
                displayName,
                serviceType: incidentObj.resource_type === 'swa' ? 'Static Web App (SWA)' : incidentObj.resource_type === 'mysql' ? 'MySQL Flexible Server' : 'Container App (ACA)',
                azureResourceName: incidentObj.azure_resource_name,
                azurePortalUrl: incidentObj.azure_portal_url,
                rawKey: appKey || ''
            };
        }

        const keyLow = (appKey || '').toLowerCase().trim();
        const env = (environment || 'dev').toLowerCase();

        let displayName = appKey || 'Unknown Resource';
        let serviceType = 'Container App (ACA)';
        let azureResourceName = `api-${keyLow || 'app'}-${env}`;
        let azureResourceId = '';
        let subId = '4a551976-35a8-4305-b128-fe592805be41';
        let resourceGroup = 'Estevia-Platform-RG';
        let providerType = 'Microsoft.App/containerapps';

        // Real Ground-Truth Azure Resource Map
        if (keyLow.includes('evaops-frontend') || keyLow === 'estevia-frontend') {
            displayName = 'Estevia DevOps Control Portal';
            serviceType = 'Static Web App (SWA)';
            azureResourceName = 'evaops-frontend-swa';
            subId = '4a551976-35a8-4305-b128-fe592805be41';
            resourceGroup = 'Estevia-Platform-RG';
            providerType = 'Microsoft.Web/staticSites';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else if (keyLow.includes('evaops') || keyLow === 'estevia-backend' || keyLow === 'cloud-service' || keyLow === 'api-evaops') {
            displayName = 'Estevia DevOps Core Backend API';
            serviceType = 'Container App (ACA)';
            azureResourceName = 'api-evaops';
            subId = '4a551976-35a8-4305-b128-fe592805be41';
            resourceGroup = 'Estevia-Platform-RG';
            providerType = 'Microsoft.App/containerapps';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else if (keyLow.includes('estevia-platform-db')) {
            displayName = 'Estevia Platform MySQL Database';
            serviceType = 'MySQL Flexible Server';
            azureResourceName = 'estevia-platform-db';
            subId = '4a551976-35a8-4305-b128-fe592805be41';
            resourceGroup = 'Estevia-Platform-RG';
            providerType = 'Microsoft.DBforMySQL/flexibleServers';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else if (keyLow.includes('marketing')) {
            displayName = 'Estevia Corporate Marketing Portal';
            serviceType = 'Static Web App (SWA)';
            azureResourceName = 'estevia-marketing-web-prod-swa';
            subId = '4a551976-35a8-4305-b128-fe592805be41';
            resourceGroup = 'Estevia-Prod-RG';
            providerType = 'Microsoft.Web/staticSites';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else if (keyLow.includes('peoplecraft') && keyLow.includes('frontend')) {
            displayName = 'PeopleCraft Enterprise HR Web Portal';
            serviceType = 'Static Web App (SWA)';
            azureResourceName = `peoplecraft-frontend-${env}-swa`;
            subId = '40070b3e-38c4-4c4e-89d5-dd601f9f7622';
            resourceGroup = 'Estevia-Client-Projects-RG';
            providerType = 'Microsoft.Web/staticSites';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else if (keyLow.includes('peoplecraft-db')) {
            displayName = 'PeopleCraft MySQL Database Server';
            serviceType = 'MySQL Flexible Server';
            azureResourceName = 'peoplecraft-db';
            subId = '40070b3e-38c4-4c4e-89d5-dd601f9f7622';
            resourceGroup = 'Estevia-Client-Projects-RG';
            providerType = 'Microsoft.DBforMySQL/flexibleServers';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else if (keyLow.includes('peoplecraft')) {
            displayName = 'PeopleCraft Enterprise HR Core Backend';
            serviceType = 'Container App (ACA)';
            azureResourceName = `api-peoplecraft-${env}`;
            subId = '40070b3e-38c4-4c4e-89d5-dd601f9f7622';
            resourceGroup = 'Estevia-Client-Projects-RG';
            providerType = 'Microsoft.App/containerapps';
            azureResourceId = `/subscriptions/${subId}/resourceGroups/${resourceGroup}/providers/${providerType}/${azureResourceName}`;
        } else {
            const scope = getScopeInfoForApp(appKey);
            azureResourceName = `ca-${keyLow || 'service'}-${env}`;
            azureResourceId = `/subscriptions/${scope.subId}/resourceGroups/${scope.resourceGroup}/providers/${providerType}/${azureResourceName}`;
            if (customName && customName.trim() !== '') displayName = customName;
        }

        const azurePortalUrl = `https://portal.azure.com/#resource${azureResourceId}`;

        return {
            displayName,
            serviceType,
            azureResourceName,
            azurePortalUrl,
            rawKey: appKey || ''
        };
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

    const [aiRemediation, setAiRemediation] = useState<any>(null);
    const [loadingAiRemediation, setLoadingAiRemediation] = useState<boolean>(false);
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

    useEffect(() => {
        if (selectedIncident) {
            setLoadingAiRemediation(true);
            setAiRemediation(null);
            fetch(`${API_BASE}/apps/observability/incidents/${selectedIncident.id}/ai-remediation`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.remediation) {
                        setAiRemediation(data.remediation);
                    }
                })
                .catch(err => console.warn('Failed to fetch AI remediation:', err))
                .finally(() => setLoadingAiRemediation(false));
        }
    }, [selectedIncident, API_BASE]);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Row 1: Header Title & Subtitle (Left) + Action Buttons (Right-Aligned) */}
            <div className="glass-panel" style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Title Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                    }}>
                        <ShieldAlert size={22} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            Incident Management & Telemetry Alerts
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                            Multi-category lifecycle tracking, telemetry root-cause snapshots & email notifications
                        </div>
                    </div>
                </div>

                {/* Right-Aligned Action Buttons (Same Line as Title) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
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
                            gap: '6px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Info size={16} style={{ color: '#3b82f6' }} />
                        <span>Incident Automation Rules</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowConfigModal(true)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Bell size={16} />
                        <span>Alert Recipients</span>
                    </button>
                </div>
            </div>

            {/* Row 2: Dedicated Filter Toolbar (On a Separate Line) */}
            <div className="glass-panel" style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.2)',
                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Filters:</span>

                {/* Search Input */}
                <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isLight ? '#94a3b8' : 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Filter incidents..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            padding: '6px 10px 6px 30px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                            background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)',
                            color: isLight ? '#0f172a' : '#fff',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Severity Filter */}
                <select
                    value={selectedSeverityFilter}
                    onChange={(e) => { setSelectedSeverityFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                        background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)',
                        color: isLight ? '#0f172a' : '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                        width: '25vw'
                    }}
                >
                    <option value="ALL">All Severities</option>
                    <option value="P1_CRITICAL">Critical (P1)</option>
                    <option value="P2_HIGH">High (P2)</option>
                    <option value="P3_MEDIUM">Medium (P3)</option>
                    <option value="P4_LOW">Low (P4)</option>
                </select>

                {/* Status Filter */}
                <select
                    value={selectedStatusFilter}
                    onChange={(e) => { setSelectedStatusFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                        background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)',
                        color: isLight ? '#0f172a' : '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                        width: '25vw'

                    }}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="triggered">Triggered</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                </select>

                {/* Environment Filter */}
                <select
                    value={selectedEnvFilter}
                    onChange={(e) => { setSelectedEnvFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                        background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)',
                        color: isLight ? '#0f172a' : '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                        width: '25vw'

                    }}
                >
                    <option value="ALL">All Envs</option>
                    <option value="dev">DEV</option>
                    <option value="qa">QA</option>
                    <option value="prod">PROD</option>
                </select>

                {(searchQuery || selectedSeverityFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedEnvFilter !== 'ALL') && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedSeverityFilter('ALL');
                            setSelectedStatusFilter('ALL');
                            setSelectedEnvFilter('ALL');
                            setCurrentPage(1);
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Reset Filters
                    </button>
                )}
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
                            {(() => {
                                const filteredIncidents = incidents.filter(inc => {
                                    if (searchQuery.trim() !== '') {
                                        const q = searchQuery.toLowerCase();
                                        const scope = getScopeInfoForApp(inc.app_key);
                                        const resInfo = getResourceInfo(inc.app_key);
                                        const matchTitle = (inc.title || '').toLowerCase().includes(q);
                                        const matchDesc = (inc.description || '').toLowerCase().includes(q);
                                        const matchApp = (inc.app_key || '').toLowerCase().includes(q) || resInfo.displayName.toLowerCase().includes(q);
                                        const matchRg = scope.resourceGroup.toLowerCase().includes(q);
                                        const matchSub = scope.subName.toLowerCase().includes(q);
                                        if (!matchTitle && !matchDesc && !matchApp && !matchRg && !matchSub) return false;
                                    }
                                    if (selectedSeverityFilter !== 'ALL' && inc.severity !== selectedSeverityFilter) return false;
                                    if (selectedStatusFilter !== 'ALL' && inc.status !== selectedStatusFilter) return false;
                                    if (selectedEnvFilter !== 'ALL' && inc.environment !== selectedEnvFilter) return false;
                                    return true;
                                });

                                if (filteredIncidents.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                                <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '8px' }} />
                                                <div>No telemetry incidents match your active filters.</div>
                                            </td>
                                        </tr>
                                    );
                                }

                                return filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(inc => {
                                    const sev = getSeverityBadge(inc.severity);
                                    const scopeInfo = getScopeInfoForApp(inc.app_key);
                                    const resInfo = getResourceInfo(inc.app_key, inc.environment, undefined, inc);
                                    const snapshot = inc.telemetry_snapshot || {};
                                    return (
                                        <tr key={inc.id} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    background: sev.bg,
                                                    color: sev.color,
                                                    display: 'inline-block'
                                                }}>
                                                    {sev.text}
                                                </span>
                                            </td>
                                            {/* Column 2: Multi-line Resource & Azure Identity */}
                                            <td style={{ padding: '16px 18px', verticalAlign: 'top', color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                                {/* Line 1: Human Title & Resource Group */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{resInfo.displayName}</span>
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.12)',
                                                        color: isLight ? '#0369a1' : '#38bdf8',
                                                        fontWeight: 700
                                                    }}>
                                                        {scopeInfo.resourceGroup}
                                                    </span>
                                                </div>

                                                {/* Line 2: Azure Native Name & Azure Portal Deep-Link */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Azure Resource:</span>
                                                    <code style={{ fontSize: '0.74rem', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', background: isLight ? '#f1f5f9' : 'rgba(56, 189, 248, 0.08)', fontWeight: 600 }}>
                                                        {resInfo.azureResourceName}
                                                    </code>
                                                    <a
                                                        href={resInfo.azurePortalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            color: isLight ? '#0284c7' : '#38bdf8',
                                                            background: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            textDecoration: 'none',
                                                            fontWeight: 600,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <ExternalLink size={12} /> Open in Azure Portal
                                                    </a>
                                                </div>

                                                {/* Line 3: Scope Metadata (Sub, Type, Env) */}
                                                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', marginTop: '6px' }}>
                                                    <code style={{ fontSize: '0.7rem', opacity: 0.85, padding: '1px 4px', borderRadius: '4px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)' }}>{inc.app_key}</code> • {scopeInfo.subName} • <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{inc.resource_type || 'aca'}</span> • <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{inc.environment}</span>
                                                </div>
                                            </td>

                                            {/* Column 3: Multi-line Telemetry Alert & Metric Snapshot */}
                                            <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                                    {inc.title || (inc as any).incident_title || (inc as any).summary || (inc as any).metric_type || 'Telemetry Incident Alert'}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                                                    {inc.description || (inc as any).incident_description || (inc as any).details || (inc as any).summary || 'Automated incident alert recorded by EvaOps Observability monitor.'}
                                                </div>

                                                {/* Live Telemetry Metric Snapshot Pills */}
                                                {snapshot && Object.keys(snapshot).length > 0 && (
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                        {Object.entries(snapshot).slice(0, 4).map(([k, v]) => (
                                                            <span key={k} style={{
                                                                fontSize: '0.68rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '6px',
                                                                background: isLight ? '#f1f5f9' : 'rgba(139, 92, 246, 0.1)',
                                                                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.2)',
                                                                color: isLight ? '#475569' : '#c084fc',
                                                                fontWeight: 600
                                                            }}>
                                                                {k.replace(/_/g, ' ').toUpperCase()}: {typeof v === 'number' ? v.toLocaleString() : String(v)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Column 4: Status */}
                                            <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                                                <span style={{
                                                    padding: '3px 10px',
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

                                            {/* Column 5: Created At */}
                                            <td style={{ padding: '16px 18px', verticalAlign: 'top', fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                                {new Date(inc.created_at).toLocaleString()}
                                            </td>

                                            {/* Column 6: Actions */}
                                            <td style={{ padding: '16px 18px', verticalAlign: 'top', textAlign: 'right' }}>
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
                                });
                            })()}
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
                                {(() => {
                                    const resDetails = getResourceInfo(selectedIncident.app_key, selectedIncident.environment, undefined, selectedIncident);
                                    return (
                                        <div style={{
                                            padding: '14px 18px',
                                            borderRadius: '12px',
                                            background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                            border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Application / Resource</div>
                                                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                                    {resDetails.displayName} <span style={{ fontSize: '0.74rem', opacity: 0.75, fontWeight: 500 }}>({selectedIncident.app_key})</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Azure Native Resource Name</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                    <code style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.1)' }}>
                                                        {resDetails.azureResourceName}
                                                    </code>
                                                    <a
                                                        href={resDetails.azurePortalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            color: isLight ? '#0284c7' : '#38bdf8',
                                                            background: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            textDecoration: 'none',
                                                            fontWeight: 600,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <ExternalLink size={12} /> Azure Portal
                                                    </a>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Environment / Resource Type</div>
                                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', textTransform: 'uppercase' }}>
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
                                    );
                                })()}

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

                                {/* Real-Time OpenAI Fix & Remediation Section */}
                                <div style={{
                                    padding: '18px 20px',
                                    borderRadius: '14px',
                                    background: isLight ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(217, 70, 239, 0.05) 100%)',
                                    border: isLight ? '1px solid #e9d5ff' : '1px solid rgba(139, 92, 246, 0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                                            }}>
                                                <Bot size={18} />
                                            </div>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: isLight ? '#581c87' : '#e9d5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    Real-Time OpenAI Fix & Remediation Guide <Sparkles size={14} style={{ color: '#d946ef' }} />
                                                </h5>
                                                <div style={{ fontSize: '0.74rem', color: isLight ? '#7e22ce' : 'rgba(233, 213, 255, 0.7)' }}>
                                                    Automated AI root cause diagnosis & step-by-step resolution commands
                                                </div>
                                            </div>
                                        </div>

                                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', fontWeight: 600 }}>
                                            GPT-4o Engine
                                        </span>
                                    </div>

                                    {loadingAiRemediation ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', color: isLight ? '#6b21a8' : '#d8b4fe', fontSize: '0.84rem' }}>
                                            <RefreshCw size={16} className="spin-anim" />
                                            <span>Analyzing incident telemetry with OpenAI & generating step-by-step fix instructions...</span>
                                        </div>
                                    ) : aiRemediation ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {/* Root Cause Diagnosis */}
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    🔍 Root Cause Diagnosis
                                                </div>
                                                <div style={{ fontSize: '0.84rem', color: isLight ? '#3b0764' : '#f3e8ff', lineHeight: 1.5 }}>
                                                    {aiRemediation.diagnosis}
                                                </div>
                                            </div>

                                            {/* Step-by-Step Fix Instructions */}
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                    🛠️ Step-by-Step Resolution Steps
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {aiRemediation.steps?.map((step: string, idx: number) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: isLight ? '#3b0764' : '#f3e8ff' }}>
                                                            <span style={{ fontWeight: 800, color: '#a855f7', minWidth: '18px' }}>{idx + 1}.</span>
                                                            <span>{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Azure CLI / PowerShell Execution Commands */}
                                            {aiRemediation.azureCliCommands?.length > 0 && (
                                                <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#0f172a' : 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Terminal size={13} /> Azure CLI / PowerShell Fix Commands
                                                        </div>
                                                    </div>
                                                    {aiRemediation.azureCliCommands.map((cmd: string, idx: number) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '8px 12px', borderRadius: '6px', marginBottom: idx < aiRemediation.azureCliCommands.length - 1 ? '6px' : 0 }}>
                                                            <code style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', wordBreak: 'break-all' }}>{cmd}</code>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(cmd);
                                                                    setCopiedCommand(cmd);
                                                                    setTimeout(() => setCopiedCommand(null), 2000);
                                                                }}
                                                                style={{ background: 'none', border: 'none', color: copiedCommand === cmd ? '#22c55e' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', marginLeft: '10px', flexShrink: 0 }}
                                                            >
                                                                {copiedCommand === cmd ? <Check size={14} /> : <Copy size={14} />}
                                                                <span>{copiedCommand === cmd ? 'Copied' : 'Copy'}</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
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
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{
                        width: '92vw',
                        maxWidth: '820px',
                        height: '100%',
                        background: isLight ? '#ffffff' : '#0f172a',
                        borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                        boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.5)',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                                    <Cpu size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                                        EvaPulse Rule Specifications & Self-Healing Engine
                                    </h3>
                                    <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                        Automated telemetry breach evaluation, priority categorization & self-healing triggers
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowInfoDrawer(false)}
                                style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Navigation Tabs Bar */}
                        <div style={{
                            padding: '12px 24px',
                            borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                            background: isLight ? '#f1f5f9' : 'rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setDrawerTab('rules')}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        background: drawerTab === 'rules' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : (isLight ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                                        color: drawerTab === 'rules' ? '#ffffff' : (isLight ? '#475569' : 'var(--text-secondary)'),
                                        border: drawerTab === 'rules' ? 'none' : (isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)'),
                                        cursor: 'pointer'
                                    }}
                                >
                                    Rule Specifications (10)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDrawerTab('self_healing')}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        background: drawerTab === 'self_healing' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : (isLight ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                                        color: drawerTab === 'self_healing' ? '#ffffff' : (isLight ? '#475569' : 'var(--text-secondary)'),
                                        border: drawerTab === 'self_healing' ? 'none' : (isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)'),
                                        cursor: 'pointer'
                                    }}
                                >
                                    Self-Healing Engine
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDrawerTab('escalation')}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        background: drawerTab === 'escalation' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : (isLight ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                                        color: drawerTab === 'escalation' ? '#ffffff' : (isLight ? '#475569' : 'var(--text-secondary)'),
                                        border: drawerTab === 'escalation' ? 'none' : (isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)'),
                                        cursor: 'pointer'
                                    }}
                                >
                                    Escalation & Routing Policy
                                </button>
                            </div>

                            {/* Search In Drawer */}
                            <div style={{ position: 'relative', width: '220px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: isLight ? '#94a3b8' : 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Search rules, scopes..."
                                    value={drawerSearch}
                                    onChange={(e) => setDrawerSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 10px 6px 30px',
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                                        background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.2)',
                                        color: isLight ? '#0f172a' : '#fff',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Drawer Content Body */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
                            {drawerTab === 'rules' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Priority Filter Pills */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isLight ? '#64748b' : 'var(--text-secondary)', marginRight: '4px' }}>Filter by Priority:</span>
                                        {[
                                            { id: 'ALL', label: 'All Rules (10)', bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
                                            { id: 'P1_CRITICAL', label: '🔴 P1 Critical (2)', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
                                            { id: 'P2_HIGH', label: '🟠 P2 High (4)', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
                                            { id: 'P3_MEDIUM', label: '🔵 P3 Medium (3)', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
                                            { id: 'P4_LOW', label: '🟢 P4 Low (1)', bg: 'rgba(16,185,129,0.15)', color: '#10b981' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setDrawerPriorityFilter(p.id)}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 700,
                                                    background: drawerPriorityFilter === p.id ? p.color : p.bg,
                                                    color: drawerPriorityFilter === p.id ? '#ffffff' : p.color,
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Rule Cards Grouped by Priority */}
                                    {(() => {
                                        const rulesList = [
                                            // P1 Critical Rules
                                            {
                                                id: 'CRITICAL_OUTAGE',
                                                priority: 'P1_CRITICAL',
                                                priorityLabel: 'P1 CRITICAL',
                                                category: 'CRITICAL_OUTAGE',
                                                title: 'Critical Outage / Server Down',
                                                icon: ShieldAlert,
                                                color: '#ef4444',
                                                borderColor: 'rgba(239,68,68,0.3)',
                                                condition: 'HTTP 5xx Errors ≥ 5 / 60s OR Unreachable Status Probe',
                                                scope: 'Container Apps (ACA) & Static Web Apps (SWA)',
                                                action: 'Instant P1 owner email dispatch + Eva AI root-cause snapshot prompt.',
                                                autoClear: 'Auto-clears when 5xx count drops to 0 across 2 consecutive scan windows.'
                                            },
                                            {
                                                id: 'DB_POOL_EXHAUSTION',
                                                priority: 'P1_CRITICAL',
                                                priorityLabel: 'P1 CRITICAL',
                                                category: 'DB_POOL_EXHAUSTION',
                                                title: 'Database Connection Pool Exhaustion',
                                                icon: Cpu,
                                                color: '#ef4444',
                                                borderColor: 'rgba(239,68,68,0.3)',
                                                condition: 'Active Connection Pool > 95% OR ER_TOO_MANY_USER_CONNECTIONS',
                                                scope: 'MySQL Flexible Server & Application Connection Pools',
                                                action: 'P1 critical alert dispatch + connection pool recycle & active query dump.',
                                                autoClear: 'Auto-clears when connection pool saturation drops below 80%.'
                                            },
                                            // P2 High Rules
                                            {
                                                id: 'HIGH_RESOURCE_PRESSURE',
                                                priority: 'P2_HIGH',
                                                priorityLabel: 'P2 HIGH',
                                                category: 'HIGH_RESOURCE_PRESSURE',
                                                title: 'High Resource Pressure (CPU / Memory)',
                                                icon: AlertTriangle,
                                                color: '#f59e0b',
                                                borderColor: 'rgba(245,158,11,0.3)',
                                                condition: 'CPU Utilization > 85.0% OR RAM Utilization > 90.0%',
                                                scope: 'ACA, SWA & Virtual Machines (VM)',
                                                action: 'P2 alert dispatch + auto-scale evaluation (+1 replica trigger).',
                                                autoClear: 'Auto-clears when CPU drops below 70.0%.'
                                            },
                                            {
                                                id: 'HEALTH_CHECK_FAILURE',
                                                priority: 'P2_HIGH',
                                                priorityLabel: 'P2 HIGH',
                                                category: 'HEALTH_CHECK_FAILURE',
                                                title: 'Container Health Probe Failure',
                                                icon: Activity,
                                                color: '#ec4899',
                                                borderColor: 'rgba(236,72,153,0.3)',
                                                condition: 'Replica Count = 0 OR Probe Status ≠ 200 OK',
                                                scope: 'Container Apps (ACA)',
                                                action: 'Triggers Container App revision restart & owner alert dispatch.',
                                                autoClear: 'Auto-clears when at least 1 replica reports HTTP 200 OK.'
                                            },
                                            {
                                                id: 'PIPELINE_BUILD_FAILURE',
                                                priority: 'P2_HIGH',
                                                priorityLabel: 'P2 HIGH',
                                                category: 'PIPELINE_BUILD_FAILURE',
                                                title: 'CI/CD Deployment Pipeline Failure',
                                                icon: Settings,
                                                color: '#f59e0b',
                                                borderColor: 'rgba(245,158,11,0.3)',
                                                condition: 'Build Status = Failed OR Pipeline Execution Error',
                                                scope: 'GitHub Actions & Azure DevOps Release Pipelines',
                                                action: 'P2 build alert dispatch + automatic rollback to last stable deployment revision.',
                                                autoClear: 'Auto-clears upon successful green pipeline build run.'
                                            },
                                            {
                                                id: 'MEMORY_LEAK_WARNING',
                                                priority: 'P2_HIGH',
                                                priorityLabel: 'P2 HIGH',
                                                category: 'MEMORY_LEAK_WARNING',
                                                title: 'Sustained Memory Growth Leak Warning',
                                                icon: Cpu,
                                                color: '#d946ef',
                                                borderColor: 'rgba(217,70,239,0.3)',
                                                condition: 'Heap Memory Utilization > 85% for 3 consecutive scan cycles',
                                                scope: 'Node.js / Java Container App Runtimes',
                                                action: 'P2 alert dispatch + heap dump snapshot + worker thread memory recycle.',
                                                autoClear: 'Auto-clears when heap memory drops below 70%.'
                                            },
                                            // P3 Medium Rules
                                            {
                                                id: 'LATENCY_DEGRADATION',
                                                priority: 'P3_MEDIUM',
                                                priorityLabel: 'P3 MEDIUM',
                                                category: 'LATENCY_DEGRADATION',
                                                title: 'API Endpoint Latency Degradation',
                                                icon: Clock,
                                                color: '#3b82f6',
                                                borderColor: 'rgba(59,130,246,0.3)',
                                                condition: 'p95 Latency > 2000 ms OR p99 Latency > 3500 ms',
                                                scope: 'ACA API Endpoints & Database Pools',
                                                action: 'P3 alert notification to assigned resource owners + DB pool snapshot.',
                                                autoClear: 'Auto-clears when p95 latency drops below 1200ms.'
                                            },
                                            {
                                                id: 'SSL_CERT_EXPIRING',
                                                priority: 'P3_MEDIUM',
                                                priorityLabel: 'P3 MEDIUM',
                                                category: 'SSL_CERT_EXPIRING',
                                                title: 'SSL / TLS Certificate Expiring',
                                                icon: Lock,
                                                color: '#10b981',
                                                borderColor: 'rgba(16,185,129,0.3)',
                                                condition: 'SSL Expiry ≤ 15 Days',
                                                scope: 'Static Web Apps (SWA) & Custom Domains',
                                                action: 'Automated TLS certificate renewal notification + GoDaddy DNS audit alert.',
                                                autoClear: 'Auto-clears when certificate is renewed with > 30 days validity.'
                                            },
                                            {
                                                id: 'STORAGE_VOLUME_FULL',
                                                priority: 'P3_MEDIUM',
                                                priorityLabel: 'P3 MEDIUM',
                                                category: 'STORAGE_VOLUME_FULL',
                                                title: 'Disk Storage Volume Capacity Full',
                                                icon: Cpu,
                                                color: '#8b5cf6',
                                                borderColor: 'rgba(139,92,246,0.3)',
                                                condition: 'Storage Volume > 90.0% OR Disk IOPS Saturation ≥ 95%',
                                                scope: 'Virtual Machines (VM) & Database Storage Volumes',
                                                action: 'Disk expansion recommendation + notification dispatched to primary storage owner.',
                                                autoClear: 'Auto-clears when available disk space rises above 20%.'
                                            },
                                            // P4 Low Rules
                                            {
                                                id: 'NETWORK_INGRESS_SPIKE',
                                                priority: 'P4_LOW',
                                                priorityLabel: 'P4 LOW',
                                                category: 'NETWORK_INGRESS_SPIKE',
                                                title: 'Network Ingress Traffic Spike / Anomaly',
                                                icon: Activity,
                                                color: '#10b981',
                                                borderColor: 'rgba(16,185,129,0.3)',
                                                condition: 'Inbound HTTP Traffic > 10,000 req/min OR Bandwidth > 500 Mbps',
                                                scope: 'Static Web Apps (SWA) & Edge Endpoints',
                                                action: 'P4 telemetry warning + rate limit rule activation & DDoS evaluation.',
                                                autoClear: 'Auto-clears when HTTP request rate normalizes below 5,000 req/min.'
                                            }
                                        ];

                                        // Apply Filter & Search
                                        const filtered = rulesList.filter(r => {
                                            if (drawerPriorityFilter !== 'ALL' && r.priority !== drawerPriorityFilter) return false;
                                            if (drawerSearch.trim() !== '') {
                                                const q = drawerSearch.toLowerCase();
                                                const matchCat = r.category.toLowerCase().includes(q);
                                                const matchTitle = r.title.toLowerCase().includes(q);
                                                const matchCond = r.condition.toLowerCase().includes(q);
                                                const matchScope = r.scope.toLowerCase().includes(q);
                                                if (!matchCat && !matchTitle && !matchCond && !matchScope) return false;
                                            }
                                            return true;
                                        });

                                        const groups = [
                                            { id: 'P1_CRITICAL', title: '🔴 P1 Critical Priority Rules', color: '#ef4444' },
                                            { id: 'P2_HIGH', title: '🟠 P2 High Priority Rules', color: '#f59e0b' },
                                            { id: 'P3_MEDIUM', title: '🔵 P3 Medium Priority Rules', color: '#3b82f6' },
                                            { id: 'P4_LOW', title: '🟢 P4 Low Priority Rules', color: '#10b981' }
                                        ];

                                        if (filtered.length === 0) {
                                            return (
                                                <div style={{ padding: '40px', textAlign: 'center', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                                    <Info size={32} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
                                                    <div>No automation rules match your active priority filter or search query.</div>
                                                </div>
                                            );
                                        }

                                        return groups.map(g => {
                                            const groupRules = filtered.filter(r => r.priority === g.id);
                                            if (groupRules.length === 0) return null;

                                            return (
                                                <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 800, color: g.color }}>
                                                        <span>{g.title}</span>
                                                        <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: '10px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)', color: isLight ? '#475569' : 'var(--text-secondary)' }}>
                                                            {groupRules.length} {groupRules.length === 1 ? 'Rule' : 'Rules'}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {groupRules.map(r => {
                                                            const IconComp = r.icon;
                                                            return (
                                                                <div key={r.id} style={{
                                                                    padding: '14px 16px',
                                                                    borderRadius: '12px',
                                                                    background: isLight ? '#ffffff' : 'rgba(0,0,0,0.25)',
                                                                    border: `1px solid ${r.borderColor}`,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '8px'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <IconComp size={16} style={{ color: r.color }} />
                                                                            <span style={{ fontWeight: 800, fontSize: '0.86rem', color: isLight ? '#0f172a' : '#ffffff' }}>
                                                                                {r.category}
                                                                            </span>
                                                                            <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                                                                — {r.title}
                                                                            </span>
                                                                        </div>
                                                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: `${r.color}20`, color: r.color }}>
                                                                            {r.priorityLabel}
                                                                        </span>
                                                                    </div>

                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.74rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5, marginTop: '2px' }}>
                                                                        <div>
                                                                            <strong style={{ color: isLight ? '#0f172a' : '#fff' }}>Condition:</strong> <code style={{ fontSize: '0.72rem', padding: '1px 4px', borderRadius: '4px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)' }}>{r.condition}</code>
                                                                        </div>
                                                                        <div>
                                                                            <strong style={{ color: isLight ? '#0f172a' : '#fff' }}>Target Scope:</strong> {r.scope}
                                                                        </div>
                                                                        <div>
                                                                            <strong style={{ color: isLight ? '#0f172a' : '#fff' }}>Self-Healing Action:</strong> {r.action}
                                                                        </div>
                                                                        <div>
                                                                            <strong style={{ color: isLight ? '#0f172a' : '#fff' }}>Auto-Clear Criteria:</strong> {r.autoClear}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}

                            {drawerTab === 'self_healing' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                        border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', marginBottom: '10px' }}>
                                            <Activity size={18} style={{ color: '#10b981' }} />
                                            <span>Eva AI Automated Remediation Engine</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: isLight ? '#475569' : 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            When an incident is generated, EvaPulse automatically executes Tier 1 remediation steps before notifying on-call engineers:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '0.76rem' }}>
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                                <strong style={{ color: '#10b981' }}>1. Auto-Replica Scaling (+1 Instance):</strong> Evaluates CPU pressure on Container Apps and scales out replicas to absorb sudden traffic spikes.
                                            </div>
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                                <strong style={{ color: '#3b82f6' }}>2. Container Revision Restart:</strong> Triggers zero-downtime revision restarts on health probe failures to clear deadlocked worker threads.
                                            </div>
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                                <strong style={{ color: '#8b5cf6' }}>3. Connection Pool Recycle:</strong> Flushes idle MySQL database connection pools when connection limits are approached.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {drawerTab === 'escalation' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                        border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', marginBottom: '10px' }}>
                                            <Mail size={18} style={{ color: '#ec4899' }} />
                                            <span>3-Tier Alert Routing & Escalation Matrix</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: isLight ? '#475569' : 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            Incident notifications follow assigned owner routing and automatic escalation tiers:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '0.76rem' }}>
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                                <strong style={{ color: '#ef4444' }}>Tier 1 — AI Root-Cause Snapshot (0 Min):</strong> Telemetry snapshot captured and logged to database.
                                            </div>
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                                <strong style={{ color: '#f59e0b' }}>Tier 2 — HTML Owner Email Dispatch (0-2 Min):</strong> Alert dispatched to Primary & Secondary resource owners with 5-min deduplication buffer.
                                            </div>
                                            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' }}>
                                                <strong style={{ color: '#8b5cf6' }}>Tier 3 — Escalation Pipeline (+15 Min Unacknowledged P1):</strong> Escalates to team administrator if a P1 outage remains unacknowledged after 15 minutes.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.15)'
                        }}>
                            <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                                💡 <strong>Note:</strong> All 10 rules evaluate continuously in 60-second background scan cycles.
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowInfoDrawer(false)}
                                className="btn-secondary"
                                style={{ padding: '8px 22px', fontSize: '0.82rem', fontWeight: 600 }}
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
                                    <span style={{ color: isLight ? '#64748b' : 'var(--text-secondary)' }}>Resource / App:</span>
                                    <strong style={{ color: '#8b5cf6' }}>{getResourceInfo(resolvingIncident.app_key).displayName} ({resolvingIncident.environment.toUpperCase()})</strong>
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
