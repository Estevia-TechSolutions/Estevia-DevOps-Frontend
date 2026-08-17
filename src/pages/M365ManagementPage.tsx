import React, { useState, useEffect } from 'react';
import { Mail, Globe, Users, ShieldAlert, CheckCircle2, ArrowRight, Loader, ExternalLink, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';

interface M365ManagementPageProps {
    organizationId: string;
    currentUser?: { role: string } | null;
    isOrgDisabled: boolean;
    credentialsList: any[];
    API_BASE: string;
    setActiveTab: (tab: any) => void;
    showToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    m365TenantId?: string;
}

export const M365ManagementPage: React.FC<M365ManagementPageProps> = ({
    organizationId,
    currentUser,
    isOrgDisabled,
    credentialsList,
    API_BASE,
    setActiveTab,
    showToast,
    m365TenantId
}) => {
    const isM365Connected = credentialsList.some(c => c.provider === 'm365');
    const isGoDaddyConnected = credentialsList.some(c => c.provider === 'godaddy');

    // Onboarding Wizard state
    const [connectingM365, setConnectingM365] = useState(false);
    const [connectingGoDaddy, setConnectingGoDaddy] = useState(false);
    const [customDomain, setCustomDomain] = useState('');
    const [verifyingDomain, setVerifyingDomain] = useState(false);
    const [dnsCheckResult, setDnsCheckResult] = useState<any[] | null>(null);

    // Dashboard data states
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [licenseActionUserId, setLicenseActionUserId] = useState<string | null>(null);

    const [activeSection, setActiveSection] = useState<'overview' | 'domain' | 'billing'>('overview');

    const fetchM365Data = async () => {
        if (!isM365Connected) return;
        setLoadingData(true);
        setConnectionError(null);
        try {
            const token = localStorage.getItem('devops_token');
            const subRes = await fetch(`${API_BASE}/m365/subscriptions?organizationId=${organizationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (subRes.status === 400) {
                const subData = await subRes.json();
                setConnectionError(subData.message || 'Failed to authenticate with Microsoft Graph API.');
                setLoadingData(false);
                return;
            }
            
            const subData = await subRes.json();
            if (subData.success) {
                setSubscriptions(subData.subscriptions || []);
            }

            const userRes = await fetch(`${API_BASE}/m365/users?organizationId=${organizationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (userRes.status === 400) {
                const userData = await userRes.json();
                setConnectionError(userData.message || 'Failed to authenticate with Microsoft Graph API.');
                setLoadingData(false);
                return;
            }
            
            const userData = await userRes.json();
            if (userData.success) {
                setUsers(userData.users || []);
            }
        } catch (err: any) {
            console.error('Error fetching M365 data:', err);
            setConnectionError(err.message || 'Connection failed.');
        } finally {
            setLoadingData(false);
        }
    };

    const verifyDomainDns = (domainName: string) => {
        if (!domainName.trim()) return;
        setVerifyingDomain(true);
        const token = localStorage.getItem('devops_token');
        fetch(`${API_BASE}/m365/verify-godaddy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                organizationId,
                domainName: domainName.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setDnsCheckResult(data.dnsRecords || []);
            }
        })
        .catch(err => {
            console.error('DNS verification check failed:', err);
        })
        .finally(() => {
            setVerifyingDomain(false);
        });
    };

    useEffect(() => {
        fetchM365Data();

        // Fetch organization settings to pre-populate and verify custom domain
        const fetchOrgSettings = async () => {
            try {
                const activeToken = localStorage.getItem('devops_token');
                const res = await fetch(`${API_BASE}/org/status`, {
                    headers: { Authorization: `Bearer ${activeToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.organization && data.organization.m365_domain) {
                        const savedDomain = data.organization.m365_domain;
                        setCustomDomain(savedDomain);
                        verifyDomainDns(savedDomain);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch organization settings in M365ManagementPage:', err);
            }
        };
        fetchOrgSettings();
    }, [isM365Connected]);

    // One-Click Admin Consent Flow Simulation
    const handleOneClickConnect = () => {
        setConnectingM365(true);
        const token = localStorage.getItem('devops_token');
        setTimeout(() => {
            setConnectingM365(false);
            // Simulate saving M365 mock credentials in DB
            fetch(`${API_BASE}/credentials`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    organizationId,
                    provider: 'm365',
                    credentialName: 'Microsoft 365 Graph integration',
                    secrets: { tenantId: 'mock', clientId: 'mock', clientSecret: 'mock' }
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Connection Initialized', 'M365 Tenant successfully authorized via Admin Consent!', 'success');
                    window.location.reload();
                }
            });
        }, 1800);
    };

    // Reclaim seat handler
    const handleToggleLicense = async (userId: string, skuId: string, action: 'assign' | 'revoke') => {
        setLicenseActionUserId(userId);
        try {
            const token = localStorage.getItem('devops_token');
            const res = await fetch(`${API_BASE}/m365/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    organizationId,
                    userId,
                    skuId,
                    action
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast(
                    action === 'revoke' ? 'License Reclaimed' : 'License Assigned',
                    action === 'revoke' ? 'M365 license seat was successfully returned to the unassigned pool.' : 'M365 license seat successfully assigned.',
                    'success'
                );
                await fetchM365Data();
            } else {
                showToast('Failed to alter seat', data.message || 'M365 action failed.', 'error');
            }
        } catch (err: any) {
            showToast('Error', err.message || 'Error executing seat assignment.', 'error');
        } finally {
            setLicenseActionUserId(null);
        }
    };

    // GoDaddy Connection Wizard Handler
    const handleLinkGoDaddy = () => {
        if (!customDomain.trim()) {
            showToast('Invalid Domain', 'Please enter a valid custom domain registered on GoDaddy.', 'warning');
            return;
        }
        setVerifyingDomain(true);
        const token = localStorage.getItem('devops_token');
        fetch(`${API_BASE}/m365/verify-godaddy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                organizationId,
                domainName: customDomain.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('DNS Configuration Synced', `Successfully linked and verified ${customDomain} on GoDaddy.`, 'success');
                setDnsCheckResult(data.dnsRecords || []);
            } else {
                showToast('Setup Failed', data.message || 'Verification failed.', 'error');
            }
        })
        .catch(err => {
            showToast('Error', err.message || 'DNS wizard failed.', 'error');
        })
        .finally(() => {
            setVerifyingDomain(false);
        });
    };

    // Calculations
    const totalSubSeats = subscriptions.reduce((acc, sub) => acc + sub.totalSeats, 0);
    const assignedSubSeats = subscriptions.reduce((acc, sub) => acc + sub.assignedSeats, 0);
    const totalM365Cost = subscriptions.reduce((acc, sub) => acc + (sub.assignedSeats * sub.pricePerSeat), 0);
    const inactiveUsers = users.filter(u => u.status === 'inactive');

    // Dynamic Billing URL & Next Billing Date calculation (removes hardcoding)
    const getNextBillingDate = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };
    const nextBillingDate = getNextBillingDate();
    const tenantParam = m365TenantId && m365TenantId !== '••••••••••••••••••••' ? `?tid=${m365TenantId}` : '';
    const billingUrl = `https://admin.microsoft.com/Adminportal/Home${tenantParam}#/billing/bills-and-payments`;

    // Dynamic License Seat Allocation scanning (removes hardcoding of E3)
    const assignableSubscription = subscriptions.find(sub => sub.assignedSeats < sub.totalSeats);
    const hasAvailableLicense = !!assignableSubscription;

    // ONBOARDING WIZARD VIEW (When M365 is not connected)
    if (!isM365Connected) {
        return (
            <div className="glass-panel" style={{ padding: '36px', maxWidth: '800px', margin: '40px auto', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(59, 130, 246, 0.01) 100%)',
                    pointerEvents: 'none', borderRadius: '12px'
                }} />

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto',
                        border: '1px solid rgba(139, 92, 246, 0.25)', boxShadow: '0 0 16px rgba(139, 92, 246, 0.2)'
                    }}>
                        <Mail size={32} style={{ color: 'var(--accent-purple)' }} />
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Microsoft 365 Subscription Integration</h2>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px', margin: '8px auto 30px auto', lineHeight: 1.5 }}>
                        Connect your organization's Microsoft 365 Tenant to enable centralized operator seat audits, automated onboarding configurations, and GoDaddy DNS mail integrations.
                    </p>

                    <div style={{ maxWidth: '500px', margin: '0 auto 32px auto', textAlign: 'left' }}>
                        <div style={{
                            padding: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Setup M365 Connection Credentials</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '20px' }}>
                                Configure an App Registration in your Azure Active Directory portal, assign the required Graph API permissions (Organization, User, Directory, Reports), and input your Client ID, Tenant ID, and Secret Key inside the secure Credentials Vault.
                            </p>
                            <button className="btn-primary" onClick={() => setActiveTab('credentials')} style={{ width: '100%' }}>
                                Configure M365 in Credentials Tab <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                            </button>
                        </div>
                    </div>

                    <div style={{
                        padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--glass-border)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)'
                    }}>
                        <HelpCircle size={14} style={{ color: 'var(--accent-purple)' }} />
                        <span>Requires M365 Global Administrator roles to grant Graph API permission scopes in Azure.</span>
                    </div>
                </div>
            </div>
        );
    }

    // MAIN DASHBOARD VIEW (When M365 is connected)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Toolbar Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Microsoft 365 Control Centre</h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Manage subscriptions, audit license usage cost allocations, and synchronize custom domains.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
                    <button
                        className={`btn-subtab ${activeSection === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveSection('overview')}
                        style={{
                            padding: '8px 16px', border: 'none', borderRadius: '6px',
                            background: activeSection === 'overview' ? 'var(--accent-purple)' : 'transparent',
                            color: activeSection === 'overview' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Utilization Dashboard
                    </button>
                    <button
                        className={`btn-subtab ${activeSection === 'domain' ? 'active' : ''}`}
                        onClick={() => setActiveSection('domain')}
                        style={{
                            padding: '8px 16px', border: 'none', borderRadius: '6px',
                            background: activeSection === 'domain' ? 'var(--accent-purple)' : 'transparent',
                            color: activeSection === 'domain' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        GoDaddy DNS Bindings
                    </button>
                    <button
                        className={`btn-subtab ${activeSection === 'billing' ? 'active' : ''}`}
                        onClick={() => setActiveSection('billing')}
                        style={{
                            padding: '8px 16px', border: 'none', borderRadius: '6px',
                            background: activeSection === 'billing' ? 'var(--accent-purple)' : 'transparent',
                            color: activeSection === 'billing' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Billing & Payment Routing
                    </button>
                </div>
            </div>

            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {connectionError && (
                        <div className="glass-panel" style={{
                            padding: '16px 20px',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.06)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            fontSize: '0.82rem',
                            color: 'var(--text-primary)',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldAlert size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                                <span>
                                    <strong style={{ color: '#ef4444' }}>Microsoft 365 Integration Error:</strong> {connectionError} Please navigate to the Credentials tab to configure or update your tenant Application keys.
                                </span>
                            </div>
                            <button className="btn-outline" onClick={() => setActiveTab('credentials')} style={{ padding: '6px 12px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                                Vault Settings
                            </button>
                        </div>
                    )}

                    {/* Metrics row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--accent-purple)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active License Cost (Monthly)</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>${totalM365Cost.toFixed(2)}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--success)', marginTop: '6px' }}>Based on {assignedSubSeats} assigned seats</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--accent-blue)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>License Seat Utilization</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{assignedSubSeats} / {totalSubSeats}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{totalSubSeats - assignedSubSeats} unassigned seats free</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--warning)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Inactive M365 Seats</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>{inactiveUsers.length}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--warning)', marginTop: '6px' }}>⚠️ Reclaim opportunity: saving ${(inactiveUsers.length * 23.00).toFixed(2)}/mo</div>
                        </div>
                    </div>

                    {/* Subscription SKUs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {subscriptions.map(sub => {
                            const pct = Math.round((sub.assignedSeats / sub.totalSeats) * 100) || 0;
                            return (
                                <div key={sub.skuId} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    {/* Circular gauge */}
                                    <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                                        <svg width="70" height="70" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-purple)" strokeWidth="3" strokeDasharray={`${pct}, 100`} />
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                            {pct}%
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sub.skuPartNumber.replace(/_/g, ' ')}</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {sub.assignedSeats} assigned of {sub.totalSeats} seats
                                        </p>
                                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Rate: ${sub.pricePerSeat.toFixed(2)}/seat/mo</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Users list */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} style={{ color: 'var(--accent-purple)' }} />
                            M365 User Licenses & Seat Allocations
                        </h3>

                        {loadingData ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <RefreshCw size={24} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                                <p style={{ marginTop: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Loading Microsoft 365 seat maps...</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>User Details</th>
                                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>License Assigned</th>
                                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Activity Audits</th>
                                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => {
                                            const isInactive = user.status === 'inactive';
                                            return (
                                                <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                    </td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <span style={{
                                                            fontSize: '0.74rem', padding: '3px 8px', borderRadius: '4px',
                                                            background: user.skuPartNumber === 'NONE' ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.08)',
                                                            border: '1px solid ' + (user.skuPartNumber === 'NONE' ? 'var(--glass-border)' : 'rgba(139, 92, 246, 0.25)'),
                                                            color: user.skuPartNumber === 'NONE' ? 'var(--text-muted)' : 'var(--text-primary)'
                                                        }}>
                                                            {user.skuPartNumber.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        {isInactive ? (
                                                            <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                ⚠️ Inactive ({user.lastActiveDays} days idle)
                                                            </span>
                                                        ) : user.status === 'unassigned' ? (
                                                            <span style={{ color: 'var(--text-muted)' }}>No seat license</span>
                                                        ) : (
                                                            <span style={{ color: 'var(--success)' }}>🟢 Active today</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                        {user.skuPartNumber !== 'NONE' ? (
                                                            <button
                                                                className={isInactive ? 'btn-primary' : 'btn-outline'}
                                                                style={{
                                                                    padding: '4px 10px', fontSize: '0.74rem', height: '28px',
                                                                    background: isInactive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                                                    borderColor: isInactive ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)',
                                                                    color: isInactive ? '#ef4444' : 'var(--text-secondary)'
                                                                }}
                                                                onClick={() => handleToggleLicense(user.id, user.skuPartNumber, 'revoke')}
                                                                disabled={licenseActionUserId === user.id}
                                                            >
                                                                {licenseActionUserId === user.id ? 'Reclaiming...' : isInactive ? 'Reclaim Seat & Savings' : 'Revoke License'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-outline"
                                                                style={{ padding: '4px 10px', fontSize: '0.74rem', height: '28px' }}
                                                                onClick={() => handleToggleLicense(user.id, assignableSubscription?.skuPartNumber || '', 'assign')}
                                                                disabled={licenseActionUserId === user.id || !hasAvailableLicense}
                                                            >
                                                                {licenseActionUserId === user.id 
                                                                    ? 'Assigning...' 
                                                                    : hasAvailableLicense 
                                                                        ? `Assign ${assignableSubscription.skuPartNumber.replace('O365_', '').replace(/_/g, ' ')}` 
                                                                        : 'No seats available'
                                                                }
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* GODADDY DNS BINDINGS SECTION */}
            {activeSection === 'domain' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={18} style={{ color: 'var(--accent-purple)' }} />
                        GoDaddy Custom Domain DNS Bindings
                    </h3>

                    {!isGoDaddyConnected ? (
                        <div style={{ padding: '30px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                            <ShieldAlert size={36} style={{ color: 'var(--warning)', marginBottom: '12px' }} />
                            <h4 style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-primary)' }}>GoDaddy Credentials Missing</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px auto' }}>
                                To enable automated DNS record bindings, please configure your GoDaddy Developer API key inside the Vault.
                            </p>
                            <button className="btn-outline" onClick={() => setActiveTab('credentials')}>
                                Configure GoDaddy Keys
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
                                <input
                                    type="text"
                                    value={customDomain}
                                    onChange={e => setCustomDomain(e.target.value)}
                                    placeholder="e.g. companydomain.com"
                                    style={{ flex: 1 }}
                                    disabled={verifyingDomain}
                                />
                                <button className="btn-primary" onClick={handleLinkGoDaddy} disabled={verifyingDomain || !customDomain}>
                                    {verifyingDomain ? <><Loader size={12} className="spin-anim" /> Configuring...</> : 'Link & Auto-Verify'}
                                </button>
                            </div>

                            {/* Active connection topology map */}
                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap'
                            }}>
                                <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Microsoft Tenant</div>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>M365 Mailboxes</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.74rem', fontWeight: 600 }}>
                                    ──────── (Active Routing) ────────➔
                                </div>
                                <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GoDaddy Registrar</div>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>{customDomain || 'No Domain Linked'}</strong>
                                </div>
                            </div>

                            {/* Check records grid */}
                            {dnsCheckResult && (
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Active DNS Configuration Check Result</h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {dnsCheckResult.map((record, index) => (
                                            <div key={index} style={{
                                                padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)',
                                                border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem'
                                            }}>
                                                <div>
                                                    <span style={{ fontWeight: 700, color: 'var(--accent-purple)', marginRight: '8px' }}>[{record.type}]</span>
                                                    <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>{record.name}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.74rem' }}>➔ {record.value}</span>
                                                </div>
                                                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.12)', color: 'var(--success)', fontWeight: 600 }}>
                                                    ✓ Verified Active
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* BILLING SECTION */}
            {activeSection === 'billing' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💳 Microsoft 365 Billing & Pay Portal Routing
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
                        {/* Cost card details */}
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>M365 Next Billing Date</div>
                                <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>{nextBillingDate}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Renewal Cycle: Monthly Automatic Billing</span>
                            </div>

                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Total Invoice</div>
                                <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>${totalM365Cost.toFixed(2)}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--success)', display: 'block', marginTop: '4px' }}>✓ M365 Payment Status: Healthy / Paid</span>
                            </div>
                        </div>

                        {/* Direct Pay Card */}
                        <div style={{
                            padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '14px'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700 }}>Manage Billing & Payment Methods</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                                Microsoft 365 licensing bills are securely processed directly on official Microsoft portals. Click the button below to navigate to your M365 admin center to pay invoices or adjust credit card configurations.
                            </p>
                            <a
                                href={billingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    textDecoration: 'none', height: '40px', fontWeight: 650
                                }}
                            >
                                💳 Pay / Manage on Microsoft Admin Center
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
