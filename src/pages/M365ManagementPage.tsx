import React, { useState, useEffect } from 'react';
import { Mail, Globe, Users, ShieldAlert, CheckCircle2, ArrowRight, Loader, ExternalLink, ShieldCheck, HelpCircle, RefreshCw, Edit2, Check, X } from 'lucide-react';

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
    const [invoices, setInvoices] = useState<any[]>([]);
    const [billingSyncStatus, setBillingSyncStatus] = useState<string>('Unauthorized');
    const [users, setUsers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [licenseActionUserId, setLicenseActionUserId] = useState<string | null>(null);
    const [billingRenewalDate, setBillingRenewalDate] = useState<string | null>(null);
    const [editingSku, setEditingSku] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editCurrency, setEditCurrency] = useState<string>('USD');
    const [editDisplayName, setEditDisplayName] = useState<string>('');
    const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
    const [updatingPricing, setUpdatingPricing] = useState(false);

    const [activeSection, setActiveSection] = useState<'overview' | 'domain' | 'billing'>('overview');

    const handleSavePricing = async (skuPartNumber: string) => {
        setUpdatingPricing(true);
        try {
            const token = localStorage.getItem('devops_token');
            const res = await fetch(`${API_BASE}/m365/pricing`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    organizationId,
                    skuPartNumber,
                    pricePerSeat: editPrice,
                    currency: editCurrency,
                    displayName: editDisplayName
                })
            });
            const data = await res.json();
            if (data.success) {
                setEditingSku(null);
                showToast('Success', 'Pricing updated successfully.', 'success');
                fetchM365Data();
            } else {
                showToast('Error', data.message || 'Failed to update pricing.', 'error');
            }
        } catch (err: any) {
            showToast('Error', 'Error updating pricing: ' + err.message, 'error');
        } finally {
            setUpdatingPricing(false);
        }
    };

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
                setInvoices(subData.invoices || []);
                setBillingSyncStatus(subData.billingSyncStatus || 'Unauthorized');
                if (subData.nextBillingDate) {
                    setBillingRenewalDate(subData.nextBillingDate);
                }
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

        const handleOutsideClick = () => setActiveDropdownUserId(null);
        window.addEventListener('click', handleOutsideClick);
        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
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
    // Filter out free/trial/viral subscriptions from core seat calculations and grid views
    const paidSubscriptions = subscriptions.filter(sub => {
        const skuPart = (sub.skuPartNumber || '').toUpperCase();
        return !(skuPart.includes('FREE') || skuPart.includes('TRIAL') || skuPart.includes('TEAMS_EXPLORATORY') || skuPart.includes('STUDENT') || skuPart.includes('VIRAL') || sub.pricePerSeat === 0);
    });

    const totalSubSeats = paidSubscriptions.reduce((acc, sub) => acc + sub.totalSeats, 0);
    const assignedSubSeats = paidSubscriptions.reduce((acc, sub) => acc + sub.assignedSeats, 0);
    const totalM365Cost = paidSubscriptions.reduce((acc, sub) => acc + (sub.totalSeats * sub.pricePerSeat), 0);
    const inactiveUsers = users.filter(u => u.status === 'inactive');

    // Group subscriptions by currency to provide formatted aggregated costs
    const currencyTotals = paidSubscriptions.reduce((acc, sub) => {
        const cur = sub.currency || 'USD';
        if (!acc[cur]) acc[cur] = { total: 0, assigned: 0, unassigned: 0 };
        acc[cur].total += sub.totalSeats * sub.pricePerSeat;
        acc[cur].assigned += sub.assignedSeats * sub.pricePerSeat;
        acc[cur].unassigned += Math.max(0, sub.totalSeats - sub.assignedSeats) * sub.pricePerSeat;
        return acc;
    }, {} as Record<string, { total: number, assigned: number, unassigned: number }>);

    const getFormattedTotal = (type: 'total' | 'assigned' | 'unassigned') => {
        const parts = Object.entries(currencyTotals).map(([cur, vals]: [string, any]) => {
            const symbol = cur === 'INR' ? '₹' : (cur === 'USD' ? '$' : cur + ' ');
            return `${symbol}${vals[type].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        });
        return parts.length > 0 ? parts.join(' + ') : '$0.00';
    };

    // Calculate dynamic reclaim opportunity from actual active rates of inactive users
    const reclaimTotals = inactiveUsers.reduce((acc, user) => {
        const userLicenses = (user.skuPartNumber || '').split(',');
        userLicenses.forEach((lic: string) => {
            const matchedSub = paidSubscriptions.find(sub => sub.skuPartNumber.toUpperCase() === lic.trim().toUpperCase());
            if (matchedSub) {
                const cur = matchedSub.currency || 'USD';
                acc[cur] = (acc[cur] || 0) + matchedSub.pricePerSeat;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const getFormattedReclaim = () => {
        const parts = Object.entries(reclaimTotals).map(([cur, val]: [string, any]) => {
            const symbol = cur === 'INR' ? '₹' : (cur === 'USD' ? '$' : cur + ' ');
            return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        });
        return parts.length > 0 ? parts.join(' + ') : '$0.00';
    };

    // Dynamic Billing URL & Next Billing Date calculation (removes hardcoding)
    const getNextBillingDate = () => {
        if (billingRenewalDate) {
            const d = new Date(billingRenewalDate);
            return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };
    const nextBillingDate = getNextBillingDate();
    const tenantParam = m365TenantId && m365TenantId !== '••••••••••••••••••••' ? `?tid=${m365TenantId}` : '';
    const billingUrl = `https://admin.microsoft.com/Adminportal/Home${tenantParam}#/billing/bills-and-payments`;

    // Dynamic License Seat Allocation scanning (removes hardcoding of E3)
    const assignableSubscription = paidSubscriptions.find(sub => sub.assignedSeats < sub.totalSeats);
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
            <style>{`
                .tooltip-container {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                         .tooltip-content {
                    visibility: hidden;
                    position: absolute;
                    bottom: 125%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(15, 12, 30, 0.95);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #ffffff !important; /* Force white text for visibility in light mode */
                    padding: 10px 14px;
                    border-radius: 8px;
                    width: max-content;
                    max-width: 250px;
                    font-size: 0.74rem;
                    line-height: 1.4;
                    white-space: pre-line;
                    z-index: 99999 !important; /* Force on top */
                    opacity: 0;
                    transition: opacity 0.2s, visibility 0.2s;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
                    font-weight: 500;
                    text-align: left;
                }
                /* Show header tooltip below the header to avoid clipping at the top boundary */
                th .tooltip-content {
                    bottom: auto;
                    top: 125%;
                }
                .tooltip-container:hover .tooltip-content {
                    visibility: visible;
                    opacity: 1;
                }
                /* Elevate z-index of the hovered table row/header cell so the tooltip draws on top */
                tr:hover {
                    position: relative;
                    z-index: 50;
                }
                thead th:hover {
                    position: relative;
                    z-index: 60;
                }
                .billing-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    align-items: stretch;
                }
                @media (max-width: 768px) {
                    .billing-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
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
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated License Cost (Monthly)</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{getFormattedTotal('total')}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--success)', marginTop: '6px' }}>Based on {totalSubSeats} paid seats. (Excludes free/trial plans)</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--accent-blue)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>License Seat Utilization</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{assignedSubSeats} / {totalSubSeats}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{totalSubSeats - assignedSubSeats} unassigned seats free</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--warning)' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Inactive M365 Seats</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>{inactiveUsers.length}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--warning)', marginTop: '6px' }}>⚠️ Reclaim opportunity: saving {getFormattedReclaim()}/mo</div>
                        </div>
                    </div>

                    {/* License Cost & Allocation Breakdown Card */}
                    <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                            background: 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-blue) 100%)'
                        }} />
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle size={18} style={{ color: 'var(--accent-purple)' }} />
                            License Cost & Allocation Breakdown
                        </h4>
                        <p style={{ margin: '6px 0 20px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Breakdown of subscription spend based on prepaid licenses vs. active user seat assignments.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Prepaid Cost</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>{getFormattedTotal('total')}</div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total cost of all purchased seats</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Assigned Cost</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: 'var(--success)' }}>{getFormattedTotal('assigned')}</div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cost of actively allocated seats</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Unassigned Waste</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: '#f59e0b' }}>{getFormattedTotal('unassigned')}</div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Potential savings from unassigned seats</span>
                            </div>
                        </div>
                    </div>

                    {/* Subscription SKUs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {paidSubscriptions.map(sub => {
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
                                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sub.displayName || sub.skuPartNumber.replace(/_/g, ' ')}</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {sub.assignedSeats} assigned of {sub.totalSeats} seats
                                        </p>
                                        {editingSku === sub.skuPartNumber ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                                <input
                                                    type="text"
                                                    value={editDisplayName}
                                                    placeholder="License Name"
                                                    onChange={e => setEditDisplayName(e.target.value)}
                                                    style={{ width: '130px', padding: '2px 4px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}
                                                />
                                                <input
                                                    type="text"
                                                    value={editCurrency}
                                                    placeholder="Cur"
                                                    onChange={e => setEditCurrency(e.target.value)}
                                                    style={{ width: '45px', padding: '2px 4px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}
                                                />
                                                <input
                                                    type="number"
                                                    value={editPrice}
                                                    step="0.01"
                                                    onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                                                    style={{ width: '60px', padding: '2px 4px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}
                                                />
                                                <button
                                                    onClick={() => handleSavePricing(sub.skuPartNumber)}
                                                    disabled={updatingPricing}
                                                    style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', padding: 0 }}
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingSku(null)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: 0 }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                                    Rate: {sub.currency === 'INR' ? '₹' : (sub.currency || '$')}{sub.pricePerSeat.toFixed(2)}/seat/mo
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditingSku(sub.skuPartNumber);
                                                        setEditPrice(sub.pricePerSeat);
                                                        setEditCurrency(sub.currency || 'USD');
                                                        setEditDisplayName(sub.displayName || '');
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', display: 'inline-flex', padding: '2px' }}
                                                >
                                                    <Edit2 size={11} />
                                                </button>
                                            </div>
                                        )}
                                        {sub.priceMismatch && (
                                            <div style={{
                                                marginTop: '6px', fontSize: '0.72rem', color: '#f59e0b',
                                                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600
                                            }}>
                                                ⚠️ Rate Mismatch: DB has {sub.currency === 'INR' ? '₹' : (sub.currency || '$')}{sub.pricePerSeat.toFixed(2)}, but Microsoft invoice shows {sub.currency === 'INR' ? '₹' : (sub.currency || '$')}{sub.actualInvoiceRate?.toFixed(2)}/seat
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Users list */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={18} style={{ color: 'var(--accent-purple)' }} />
                                M365 User Licenses & Seat Allocations
                            </h3>
                            <a
                                href={`https://admin.microsoft.com/Adminportal/Home${tenantParam}#/users`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-outline"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem',
                                    height: '32px', padding: '0 12px', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)',
                                    textDecoration: 'none', fontWeight: 600, borderRadius: '8px'
                                }}
                            >
                                <Users size={12} />
                                ➕ Add/Manage Users on Microsoft 365
                                <ExternalLink size={12} style={{ marginLeft: '2px' }} />
                            </a>
                        </div>

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
                                            <th style={{ padding: '10px 8px', color: 'var(--text-secondary)', position: 'relative' }}>
                                                <div className="tooltip-container">
                                                    Activity Audits ℹ️
                                                    <span className="tooltip-content" style={{ bottom: '135%' }}>
                                                        Activity Thresholds:
                                                        {"\n"}• Active: &lt; 7 days idle
                                                        {"\n"}• Mild Idle: 7-14 days idle
                                                        {"\n"}• Moderate Idle: 15-29 days idle
                                                        {"\n"}• Inactive: &ge; 30 days idle
                                                    </span>
                                                </div>
                                            </th>
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
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                            {(user.skuDisplayName || 'No seat license').split(',').map((license: string, idx: number) => {
                                                                const trimmed = license.trim();
                                                                const isNone = trimmed === 'No seat license' || trimmed === 'NONE';
                                                                return (
                                                                    <span key={idx} style={{
                                                                        fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px',
                                                                        background: isNone ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.08)',
                                                                        border: '1px solid ' + (isNone ? 'var(--glass-border)' : 'rgba(139, 92, 246, 0.25)'),
                                                                        color: isNone ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                        fontWeight: isNone ? 400 : 600
                                                                    }}>
                                                                        {trimmed}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        {(() => {
                                                            if (user.skuPartNumber === 'NONE') {
                                                                 return <span style={{ color: 'var(--text-muted)' }}>No seat license</span>;
                                                            }
                                                            const lastActiveDays = typeof user.lastActiveDays === 'number' ? user.lastActiveDays : null;
                                                            const formattedDate = user.lastActiveDate
                                                                 ? new Date(user.lastActiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                 : 'None recorded';

                                                            let badgeStyle = { color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' };
                                                            let labelText = '🟢 Active today (0 days idle)';

                                                            if (lastActiveDays !== null) {
                                                                if (lastActiveDays >= 30) {
                                                                    badgeStyle = { color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' };
                                                                    labelText = `🔴 Inactive (${lastActiveDays} days idle)`;
                                                                } else if (lastActiveDays >= 15) {
                                                                    badgeStyle = { color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' };
                                                                    labelText = `🟠 Idle (${lastActiveDays} days idle)`;
                                                                } else if (lastActiveDays >= 7) {
                                                                    badgeStyle = { color: '#eab308', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' };
                                                                    labelText = `🟡 Idle (${lastActiveDays} days idle)`;
                                                                } else if (lastActiveDays > 0) {
                                                                    badgeStyle = { color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' };
                                                                    labelText = `🟢 Active (${lastActiveDays} days idle)`;
                                                                }
                                                            } else {
                                                                badgeStyle = { color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' };
                                                                labelText = `🔴 Inactive (no activity records)`;
                                                            }

                                                            return (
                                                                <div>
                                                                    <div className="tooltip-container">
                                                                        <span style={badgeStyle}>{labelText}</span>
                                                                        <span className="tooltip-content" style={{ bottom: '150%' }}>
                                                                            Activity Thresholds:
                                                                            {"\n"}• Active: &lt; 7 days idle
                                                                            {"\n"}• Mild Idle: 7-14 days idle
                                                                            {"\n"}• Moderate Idle: 15-29 days idle
                                                                            {"\n"}• Inactive: &ge; 30 days idle
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                                        Last Active: {formattedDate}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                     </td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right', position: 'relative' }}>
                                                        {(() => {
                                                            const userSkus = user.skuPartNumber && user.skuPartNumber !== 'NONE'
                                                                ? user.skuPartNumber.split(',').map((s: string) => s.trim()).filter(Boolean)
                                                                : [];
                                                            const userNames = user.skuDisplayName && user.skuDisplayName !== 'No seat license'
                                                                ? user.skuDisplayName.split(',').map((s: string) => s.trim()).filter(Boolean)
                                                                : [];
                                                            
                                                            const assignableToUser = paidSubscriptions.filter(sub => {
                                                                const alreadyHas = userSkus.includes(sub.skuPartNumber);
                                                                return !alreadyHas && sub.assignedSeats < sub.totalSeats;
                                                            });

                                                            return (
                                                                <div style={{ display: 'inline-block' }}>
                                                                    <button
                                                                        className="btn-outline"
                                                                        style={{
                                                                            padding: '4px 10px', fontSize: '0.74rem', height: '26px',
                                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                            borderColor: activeDropdownUserId === user.id ? 'var(--accent-purple)' : 'var(--glass-border)',
                                                                            color: activeDropdownUserId === user.id ? 'var(--accent-purple)' : 'var(--text-secondary)'
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveDropdownUserId(activeDropdownUserId === user.id ? null : user.id);
                                                                        }}
                                                                        disabled={licenseActionUserId === user.id}
                                                                    >
                                                                        {licenseActionUserId === user.id ? 'Processing...' : '⚙️ Actions'}
                                                                    </button>
                                                                    {activeDropdownUserId === user.id && (
                                                                        <div style={{
                                                                            position: 'absolute', right: '8px', top: '32px', zIndex: 100,
                                                                            minWidth: '220px', background: 'rgba(20, 20, 25, 0.98)',
                                                                            backdropFilter: 'blur(10px)',
                                                                            border: '1px solid var(--glass-border)', borderRadius: '8px',
                                                                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '6px 0',
                                                                            textAlign: 'left'
                                                                        }}>
                                                                            {userSkus.length > 0 && (
                                                                                <>
                                                                                    <div style={{ fontSize: '0.64rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 12px', fontWeight: 700, letterSpacing: '0.05em' }}>Revoke License</div>
                                                                                    {userSkus.map((skuCode: string, idx: number) => {
                                                                                        const displayName = userNames[idx] || skuCode.replace(/_/g, ' ');
                                                                                        return (
                                                                                            <button
                                                                                                key={skuCode}
                                                                                                style={{
                                                                                                    width: '100%', padding: '6px 12px', fontSize: '0.74rem',
                                                                                                    background: 'none', border: 'none', color: '#ef4444',
                                                                                                    textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                                                                                                    display: 'block'
                                                                                                }}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setActiveDropdownUserId(null);
                                                                                                    handleToggleLicense(user.id, skuCode, 'revoke');
                                                                                                }}
                                                                                            >
                                                                                                Revoke {displayName}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </>
                                                                            )}
                                                                            
                                                                            {assignableToUser.length > 0 && (
                                                                                <>
                                                                                    {userSkus.length > 0 && <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />}
                                                                                    <div style={{ fontSize: '0.64rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 12px', fontWeight: 700, letterSpacing: '0.05em' }}>Assign License</div>
                                                                                    {assignableToUser.map(sub => (
                                                                                        <button
                                                                                            key={sub.skuId}
                                                                                            style={{
                                                                                                width: '100%', padding: '6px 12px', fontSize: '0.74rem',
                                                                                                background: 'none', border: 'none', color: 'var(--accent-purple)',
                                                                                                textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                                                                                                display: 'block'
                                                                                            }}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setActiveDropdownUserId(null);
                                                                                                handleToggleLicense(user.id, sub.skuPartNumber, 'assign');
                                                                                            }}
                                                                                        >
                                                                                            Assign {sub.displayName || sub.skuPartNumber.replace(/_/g, ' ')}
                                                                                        </button>
                                                                                    ))}
                                                                                </>
                                                                            )}

                                                                            {userSkus.length === 0 && assignableToUser.length === 0 && (
                                                                                <div style={{ padding: '8px 12px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                                                                    No actions available
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
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

                    {!isGoDaddyConnected && (
                        <div style={{
                            padding: '16px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.05)',
                            border: '1px solid rgba(234, 179, 8, 0.25)', display: 'flex', alignItems: 'center', gap: '12px',
                            fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '20px'
                        }}>
                            <ShieldAlert size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                            <span>
                                <strong>GoDaddy Vault Keys Missing:</strong> Automated DNS record synchronization is disabled. You can still link your domain below and perform manual verification checks.
                            </span>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
                            <input
                                type="text"
                                value={customDomain}
                                onChange={e => setCustomDomain(e.target.value)}
                                placeholder="e.g. companydomain.com"
                                style={{ flex: 1 }}
                                disabled={verifyingDomain || isGoDaddyConnected}
                            />
                            <button 
                                className="btn-primary" 
                                onClick={handleLinkGoDaddy} 
                                disabled={verifyingDomain || !customDomain || isGoDaddyConnected}
                                style={isGoDaddyConnected ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                            >
                                {verifyingDomain ? <><Loader size={12} className="spin-anim" /> Configuring...</> : 'Link & Auto-Verify'}
                            </button>
                        </div>

                        {isGoDaddyConnected && (
                            <div style={{
                                padding: '12px 16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.04)',
                                border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.8rem', color: '#10b981',
                                display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                            }}>
                                <span>✓ <strong>Auto-Managed:</strong> GoDaddy Vault connection is active. Custom DNS bindings are automatically synchronized and managed.</span>
                            </div>
                        )}

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
                                                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.74rem' }}>➔ {record.value || record.data}</span>
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
                </div>
            )}

            {/* BILLING SECTION */}
            {activeSection === 'billing' && (() => {
                const totalPaid = invoices
                    .filter(inv => inv.status?.toLowerCase() === 'paid')
                    .reduce((sum, inv) => sum + inv.amount, 0);

                const totalOverdue = invoices
                    .filter(inv => inv.status?.toLowerCase() === 'overdue')
                    .reduce((sum, inv) => sum + inv.amount, 0);

                const currency = invoices[0]?.currency || 'INR';

                const formatAmount = (val: number) => {
                    const symbol = currency === 'INR' ? '₹' : (currency || '$');
                    return `${symbol}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                };

                return (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            💳 Microsoft 365 Billing & Pay Portal Routing
                        </h3>

                        <div className="billing-grid">
                            {/* Card 1: M365 Next Billing Date */}
                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>M365 Next Billing Date</div>
                                <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>{nextBillingDate}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Renewal Cycle: Monthly Automatic Billing</span>
                            </div>

                            {/* Card 2: Manage Billing & Direct Pay */}
                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700 }}>Manage Billing & Payment Methods</h4>
                                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                                        Microsoft 365 licensing bills are securely processed directly on official Microsoft portals.
                                    </p>
                                </div>
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
                                    💳 Pay & Manage Bills
                                    <ExternalLink size={14} />
                                </a>
                            </div>

                            {/* Card 3: Total Paid Invoices */}
                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.02)',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Total Paid Invoices</div>
                                <strong style={{ fontSize: '1.3rem', color: '#10b981', display: 'block', marginTop: '6px' }}>{formatAmount(totalPaid)}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>From successfully processed payments</span>
                            </div>

                            {/* Card 4: Total Overdue Invoices */}
                            <div style={{
                                padding: '20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.02)',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>Total Overdue Invoices</div>
                                <strong style={{ fontSize: '1.3rem', color: '#ef4444', display: 'block', marginTop: '6px' }}>{formatAmount(totalOverdue)}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Requires urgent attention / settlement</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                                📋 Microsoft 365 Invoices & Subscription Status
                            </h4>

                            {invoices.length === 0 ? (
                                billingSyncStatus === 'Authorized' ? (
                                    <div style={{
                                        padding: '16px 20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.02)',
                                        border: '1px dashed rgba(16, 185, 129, 0.25)', color: 'var(--text-secondary)', fontSize: '0.82rem',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}>
                                        <span>✓ Microsoft Billing Access Verified: No historical invoices were returned by Microsoft for this billing account.</span>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '16px 20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.02)',
                                        border: '1px dashed rgba(239, 68, 68, 0.25)', color: 'var(--text-secondary)', fontSize: '0.82rem',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}>
                                        <span>⚠️ No verified Microsoft 365 billing invoices found. To sync billing records automatically, grant your Azure Service Principal the <strong>Billing Account Reader</strong> role in the Azure Portal.</span>
                                    </div>
                                )
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {subscriptions.map(sub => (
                                        <div key={sub.skuId} style={{
                                            padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div>
                                                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{sub.displayName}</strong>
                                                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                        {sub.totalSeats} seats allocated • Rate: {sub.currency === 'INR' ? '₹' : (sub.currency || '$')}{sub.pricePerSeat.toFixed(2)}/seat/mo
                                                    </span>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 700,
                                                    background: sub.totalSeats > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: sub.totalSeats > 0 ? '#10b981' : '#ef4444',
                                                    border: `1px solid ${sub.totalSeats > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                                                }}>
                                                    {sub.totalSeats > 0 ? '🟢 Active' : '🔴 Inactive'}
                                                </span>
                                            </div>

                                            {(() => {
                                                const subInvoices = invoices.filter(inv => inv.currency === sub.currency);
                                                if (subInvoices.length === 0) {
                                                    return (
                                                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0 0 0', borderTop: '1px dashed var(--glass-border)' }}>
                                                            No invoice history synced for this subscription.
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div style={{ overflowX: 'auto', marginTop: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                                                    <th style={{ padding: '6px 4px' }}>Invoice No</th>
                                                                    <th style={{ padding: '6px 4px' }}>Issue Date</th>
                                                                    <th style={{ padding: '6px 4px' }}>Due Date</th>
                                                                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Amount</th>
                                                                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {subInvoices.map(inv => (
                                                                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                                        <td style={{ padding: '6px 4px', fontWeight: 500 }}>
                                                                            {inv.documentUrl ? (
                                                                                <a href={inv.documentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
                                                                                    {inv.invoiceNumber} ↗
                                                                                </a>
                                                                            ) : (
                                                                                inv.invoiceNumber
                                                                            )}
                                                                        </td>
                                                                        <td style={{ padding: '6px 4px', color: 'var(--text-secondary)' }}>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : 'N/A'}</td>
                                                                        <td style={{ padding: '6px 4px', color: 'var(--text-secondary)' }}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>{inv.currency === 'INR' ? '₹' : (inv.currency || '$')}{inv.amount.toLocaleString()}</td>
                                                                        <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                                                                            <span style={{
                                                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 600,
                                                                                background: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                                color: inv.status === 'Paid' ? '#10b981' : '#ef4444'
                                                                            }}>
                                                                                {inv.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
