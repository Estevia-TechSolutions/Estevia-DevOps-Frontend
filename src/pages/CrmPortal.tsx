import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  Plus,
  RefreshCw,
  Power,
  X,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Lock,
  UserPlus,
  Info,
  Edit3,
  Check,
  Save,
  Loader,
  Search,
  DollarSign,
  Activity,
  Shield,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Globe
} from 'lucide-react';

interface CrmPortalProps {
  API_BASE: string;
  theme: 'dark' | 'light';
  onBackToApp: () => void;
}

export const CrmPortal: React.FC<CrmPortalProps> = ({ API_BASE, theme, onBackToApp }) => {
  const [crmToken, setCrmToken] = useState<string | null>(localStorage.getItem('evaops_crm_token'));
  const [crmUser, setCrmUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('evaops_crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard layout tabs
  const [activeTab, setActiveTab] = useState<'clients' | 'invoices' | 'agents'>('clients');

  // Clients state
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Client Details licensing forms
  const [licenseTier, setLicenseTier] = useState('growth');
  const [seatsLimit, setSeatsLimit] = useState(10);
  const [updatingLicensing, setUpdatingLicensing] = useState(false);
  const [licensingMsg, setLicensingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Client Invoices state
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [loadingClientInvoices, setLoadingClientInvoices] = useState(false);

  // Invoice Generation
  const [invoiceDueDays, setInvoiceDueDays] = useState('15');
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceMsg, setInvoiceMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // All Invoices state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Support Agents creation state
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [agentRole, setAgentRole] = useState('agent');
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [agentMsg, setAgentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Searching & Filtering for Client Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');

  // Support Agents list & edit state
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('agent');
  const [editPassword, setEditPassword] = useState('');
  const [editIsDisabled, setEditIsDisabled] = useState(false);
  const [editingMsg, setEditingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingAgent, setUpdatingAgent] = useState(false);

  // ── CRM Helper request wrapper ────────────────────────────────────────────────
  const crmRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (crmToken) {
      headers.set('Authorization', `Bearer ${crmToken}`);
    }
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${API_BASE}/crm${path}`, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  };

  // ── Authentication flows ──────────────────────────────────────────────────────
  const handleCrmLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginError(null);
    setLoginLoading(true);
    try {
      const data = await crmRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('evaops_crm_token', data.token);
      localStorage.setItem('evaops_crm_user', JSON.stringify(data.user));
      setCrmToken(data.token);
      setCrmUser(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleMicrosoftSSO = async () => {
    setSsoLoading(true);
    setLoginError(null);
    try {
      const redirectUriParam = window.location.origin + window.location.pathname;
      const res = await fetch(`${API_BASE}/crm/auth/login-url?redirectUri=${encodeURIComponent(redirectUriParam)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No login URL returned from server');
        }
      } else {
        throw new Error('Failed to retrieve login URL from server');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to initiate Microsoft login.');
      setSsoLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    if (errorParam) {
      setLoginError(`Microsoft SSO Login failed: ${errorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    if (!code) return;

    const exchangeSsoCode = async () => {
      setSsoLoading(true);
      setLoginError(null);
      try {
        const response = await fetch(`${API_BASE}/crm/auth/microsoft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirectUri: window.location.origin + window.location.pathname
          })
        });
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('evaops_crm_token', data.token);
          localStorage.setItem('evaops_crm_user', JSON.stringify(data.user));
          setCrmToken(data.token);
          setCrmUser(data.user);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error(data.error || data.message || 'Failed to authenticate via Microsoft Entra ID');
        }
      } catch (err: any) {
        console.error('[CRM Auth] Microsoft callback login failed:', err);
        setLoginError(err.message || 'Failed to complete Microsoft authentication.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } finally {
        setSsoLoading(false);
      }
    };

    exchangeSsoCode();
  }, [API_BASE]);

  const handleCrmLogout = () => {
    localStorage.removeItem('evaops_crm_token');
    localStorage.removeItem('evaops_crm_user');
    setCrmToken(null);
    setCrmUser(null);
    setSelectedClient(null);
  };

  // ── Load CRM content on tab/auth switch ────────────────────────────────────────
  useEffect(() => {
    if (!crmToken) return;
    if (activeTab === 'clients') {
      fetchClients();
    } else if (activeTab === 'invoices') {
      fetchAllInvoices();
    } else if (activeTab === 'agents') {
      fetchAgents();
    }
  }, [crmToken, activeTab]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const data = await crmRequest('/clients');
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch CRM clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchAllInvoices = async () => {
    setLoadingInvoices(true);
    try {
      // In CRM panel, let's fetch clients list first, then query invoices for each to aggregate them
      const clientList = await crmRequest('/clients');
      const allInvoicesAggregate: any[] = [];
      for (const client of clientList) {
        const clientInvoicesList = await crmRequest(`/clients/${client.id}/invoices`);
        clientInvoicesList.forEach((inv: any) => {
          allInvoicesAggregate.push({
            ...inv,
            clientName: client.name,
            clientId: client.id
          });
        });
      }
      // Sort by issue_date descending
      allInvoicesAggregate.sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
      setInvoices(allInvoicesAggregate);
    } catch (err) {
      console.error('Failed to fetch all invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // ── Client detail triggers ───────────────────────────────────────────────────
  const handleSelectClient = async (client: any) => {
    setSelectedClient(client);
    setLicenseTier(client.license_tier || 'growth');
    setSeatsLimit(client.operator_seats_limit || 10);
    setLicensingMsg(null);
    setInvoiceMsg(null);

    // Fetch client invoices
    setLoadingClientInvoices(true);
    try {
      const data = await crmRequest(`/clients/${client.id}/invoices`);
      setClientInvoices(data);
    } catch (err) {
      console.error('Failed to fetch client invoices:', err);
    } finally {
      setLoadingClientInvoices(false);
    }
  };

  const handleUpdateLicensing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setUpdatingLicensing(true);
    setLicensingMsg(null);
    try {
      await crmRequest(`/clients/${selectedClient.id}/licensing`, {
        method: 'PUT',
        body: JSON.stringify({
          plan: licenseTier, // update both
          license_tier: licenseTier,
          operator_seats_limit: seatsLimit
        })
      });
      setLicensingMsg({ type: 'success', text: 'Licensing parameters updated successfully.' });

      // Update local clients state
      setClients(prev => prev.map(c => c.id === selectedClient.id ? {
        ...c,
        plan: licenseTier,
        license_tier: licenseTier,
        operator_seats_limit: seatsLimit
      } : c));
      setSelectedClient((prev: any) => ({
        ...prev,
        plan: licenseTier,
        license_tier: licenseTier,
        operator_seats_limit: seatsLimit
      }));
    } catch (err: any) {
      setLicensingMsg({ type: 'error', text: err.message || 'Failed to update licensing.' });
    } finally {
      setUpdatingLicensing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedClient) return;
    const nextDisabledState = !selectedClient.is_disabled;
    try {
      await crmRequest(`/clients/${selectedClient.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_disabled: nextDisabledState })
      });
      // Update local state
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, is_disabled: nextDisabledState } : c));
      setSelectedClient((prev: any) => ({ ...prev, is_disabled: nextDisabledState }));
    } catch (err) {
      alert('Failed to update client status.');
    }
  };

  const handleImpersonateClient = async () => {
    if (!selectedClient) return;
    try {
      const res = await window.fetch(`${API_BASE}/auth/bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: selectedClient.id })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('devops_token', data.token);
        localStorage.setItem('devops_user', JSON.stringify(data.user));
        localStorage.setItem('devops_requires_onboarding', String(data.requiresOnboarding));
        if (data.organization && data.organization.id) {
          localStorage.setItem('devops_organization_id', data.organization.id);
          localStorage.setItem('devops_organization_name', data.organization.name || data.organization.id);
        }
        window.open(window.location.origin + '/', '_blank');
      } else {
        throw new Error(data.error || 'Failed to authenticate via bypass');
      }
    } catch (err: any) {
      alert('Failed to launch impersonation session: ' + err.message);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setGeneratingInvoice(true);
    setInvoiceMsg(null);
    try {
      const result = await crmRequest(`/clients/${selectedClient.id}/invoices`, {
        method: 'POST',
        body: JSON.stringify({
          due_days: parseInt(invoiceDueDays, 10)
        })
      });
      setInvoiceMsg({ type: 'success', text: `Invoice ${result.invoice_number} generated — $${result.breakdown.total_amount.toLocaleString()}` });

      // Refresh client invoices
      const updatedInvs = await crmRequest(`/clients/${selectedClient.id}/invoices`);
      setClientInvoices(updatedInvs);

      // Sync client list state (increases unpaid count)
      fetchClients();
    } catch (err: any) {
      setInvoiceMsg({ type: 'error', text: err.message || 'Failed to generate invoice.' });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: number, nextStatus: string, fromTab: 'detail' | 'global') => {
    try {
      await crmRequest(`/invoices/${invoiceId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });

      // Update local invoice lists
      if (fromTab === 'detail' && selectedClient) {
        setClientInvoices(prev => prev.map(i => i.id === invoiceId ? {
          ...i,
          status: nextStatus,
          payment_date: nextStatus.toLowerCase() === 'paid' ? new Date().toISOString() : null
        } : i));
      } else {
        setInvoices(prev => prev.map(i => i.id === invoiceId ? {
          ...i,
          status: nextStatus,
          payment_date: nextStatus.toLowerCase() === 'paid' ? new Date().toISOString() : null
        } : i));
      }

      // Sync client list state
      fetchClients();
    } catch (err) {
      alert('Failed to update invoice payment status.');
    }
  };

  // ── CRM Support User creation ────────────────────────────────────────────────
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !agentEmail || !agentPassword) return;
    setCreatingAgent(true);
    setAgentMsg(null);
    try {
      await crmRequest('/auth/create-user', {
        method: 'POST',
        body: JSON.stringify({
          name: agentName,
          email: agentEmail,
          password: agentPassword,
          role: agentRole
        })
      });
      setAgentMsg({ type: 'success', text: `Support agent user '${agentName}' created successfully.` });
      setAgentName('');
      setAgentEmail('');
      setAgentPassword('');
      setAgentRole('agent');
      fetchAgents();
    } catch (err: any) {
      setAgentMsg({ type: 'error', text: err.message || 'Failed to create support user.' });
    } finally {
      setCreatingAgent(false);
    }
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const data = await crmRequest('/users');
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch CRM users:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setUpdatingAgent(true);
    setEditingMsg(null);
    try {
      const payload: any = {
        name: editName,
        email: editEmail,
        role: editRole,
        is_disabled: editIsDisabled
      };
      if (editPassword) {
        payload.password = editPassword;
      }
      await crmRequest(`/users/${editingAgent.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setEditingMsg({ type: 'success', text: 'Support agent updated successfully.' });
      setEditPassword('');
      fetchAgents();
      setTimeout(() => {
        setEditingAgent(null);
        setEditingMsg(null);
      }, 1000);
    } catch (err: any) {
      setEditingMsg({ type: 'error', text: err.message || 'Failed to update support agent.' });
    } finally {
      setUpdatingAgent(false);
    }
  };

  const handleToggleAgentStatus = async (agent: any) => {
    if (agent.email === 'admin@evaops.crm') {
      alert('The master admin account cannot be disabled.');
      return;
    }
    try {
      await crmRequest(`/users/${agent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: agent.name,
          email: agent.email,
          role: agent.role,
          is_disabled: !agent.is_disabled
        })
      });
      fetchAgents();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  // ── RENDER CRM LOGIN SCREEN ──────────────────────────────────────────────────
  if (!crmToken) {
    const ACCENT = 'var(--accent-purple)';

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Navigation Bar */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(2, 6, 23, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="site-header-logo" style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '4px', boxShadow: 'none' }}>
              <img src="/evaops-logo.png" alt="EvaOps Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EvaOps</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            CRM Support Control Plane
          </span>
        </nav>

        {/* Main Body */}
        <div style={{
          flex: 1,
          display: 'flex',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 40px',
          gap: '60px',
          alignItems: 'center',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          
          {/* Left Column: Product pitch */}
          <div style={{ flex: 1.2, textAlign: 'left' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-purple)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}>
              🛡️ Estevia Operations & Licensing
            </span>
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              EvaOps Support. <br />
              <span className="glow-purple" style={{ 
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Compliance Desk.</span>
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              This operations terminal enables support agents to override seat allocations, generate custom subscription terms, update active domain bindings, and sync client directories from Active Directory.
            </p>

            {/* Feature Checkmarks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { title: 'Licensing Compliance', desc: 'Seat limit overrides & plan management' },
                { title: 'DNS Control Plane', desc: 'Multi-domain matching & domain bindings' },
                { title: 'Directory Syncing', desc: 'Sync users and permissions from Azure AD' },
                { title: 'Support Directory', desc: 'Agent permission management & logs' }
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', 
                    backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{f.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Client-Side Access Guide Panel */}
            <div style={{
              marginTop: '40px',
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.04)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              textAlign: 'left',
              boxShadow: 'inset 0 0 20px rgba(99,102,241,0.02)'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 10px 0' }}>
                <Shield size={16} style={{ color: 'var(--accent-purple)' }} />
                Client-Side Access Guide
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                Instructions for connecting to the main DevOps platform client interface:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 800 }}>01</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Developer Bypass:</strong> Toggle <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-primary)' }}>Developer Override</code> on the client login portal, input organization ID <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-primary)' }}>estevia</code>, and sign in.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 800 }}>02</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Admin SSO Login:</strong> Authenticate via Microsoft 365 on the client interface. The system maps organizational records and grants administrative write control options automatically.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Portal */}
          <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '420px',
              padding: '40px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>CRM Sign In</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Access is restricted to authorized Estevia support personnel.
                </p>
              </div>

              {loginError && (
                <div className="glass-panel" style={{ 
                  padding: '12px 14px', 
                  borderColor: 'var(--error)', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '20px',
                  fontSize: '0.82rem',
                  textAlign: 'left'
                }}>
                  <AlertCircle size={16} style={{ color: 'var(--error)', flexShrink: 0 }} />
                  <span style={{ color: '#fca5a5' }}>{loginError}</span>
                </div>
              )}

              {/* Microsoft SSO button */}
              <button
                onClick={handleMicrosoftSSO}
                disabled={loginLoading || ssoLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '13px 10px', borderRadius: '12px',
                  background: 'var(--bg-slate)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontSize: '0.84rem', fontWeight: 700,
                  cursor: (loginLoading || ssoLoading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', opacity: (loginLoading || ssoLoading) ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (!loginLoading && !ssoLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = 'rgba(0,114,240,0.5)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,114,240,0.18)'; e.currentTarget.style.background = 'rgba(0,114,240,0.06)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'var(--bg-slate)'; }}
              >
                {ssoLoading ? (
                  <RefreshCw size={18} className="spin-anim" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                    <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                    <path d="M0 12H11V23H0V12Z" fill="#00A1F1"/>
                    <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
                  </svg>
                )}
                <span>{ssoLoading ? 'Connecting...' : 'Microsoft 365'}</span>
              </button>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '18px 0', 
                color: 'var(--text-secondary)',
                fontSize: '0.78rem' 
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                <span style={{ padding: '0 8px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
              </div>

              <form onSubmit={handleCrmLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Support Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@evaops.crm"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading || ssoLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)', color: '#ffffff', border: 'none', fontSize: '0.88rem', fontWeight: 700, cursor: (loginLoading || ssoLoading) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: (loginLoading || ssoLoading) ? 0.7 : 1 }}>
                  {loginLoading ? <RefreshCw size={16} className="spin-anim" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
                </button>
              </form>

              {/* Return to App link */}
              {window.location.hostname !== 'evaops-crm.esteviatech.com' && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={onBackToApp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Return to Client Access Portal
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── RENDER CRM DASHBOARD ─────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--body-bg)',
      backgroundAttachment: 'fixed',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Global CRM animations */}
      <style>{`
        @keyframes crm-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .crm-tab-panel { animation: crm-fade-in 0.25s ease-out; }
        @keyframes crm-pulse-dot { 0%,100% { opacity:1; box-shadow:0 0 6px currentColor; } 50% { opacity:0.6; box-shadow:0 0 12px currentColor; } }
        .crm-pulse { animation: crm-pulse-dot 2.5s infinite; }
        .crm-sidebar-btn { display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border-radius:10px;border:1px solid transparent;font-size:0.86rem;font-weight:600;cursor:pointer;text-align:left;transition:all 0.22s cubic-bezier(0.4,0,0.2,1);background:transparent;position:relative; }
        .crm-sidebar-btn:hover { background:rgba(255,255,255,0.04); border-color:var(--glass-border); }
        .crm-sidebar-btn.active-clients { background:rgba(139,92,246,0.12); border-color:rgba(139,92,246,0.3); color:#a78bfa; box-shadow:0 2px 12px rgba(139,92,246,0.15); }
        .crm-sidebar-btn.active-invoices { background:rgba(20,184,166,0.1); border-color:rgba(20,184,166,0.3); color:#2dd4bf; box-shadow:0 2px 12px rgba(20,184,166,0.12); }
        .crm-sidebar-btn.active-agents { background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.3); color:#fbbf24; box-shadow:0 2px 12px rgba(245,158,11,0.12); }
        .crm-sidebar-btn .crm-tooltip { visibility:hidden;opacity:0;position:absolute;left:calc(100% + 12px);top:50%;transform:translateY(-50%);min-width:200px;max-width:240px;background:linear-gradient(135deg,rgba(15,23,42,0.97) 0%,rgba(30,10,60,0.96) 100%);border:1px solid rgba(139,92,246,0.35);border-radius:12px;padding:12px 14px;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 20px rgba(139,92,246,0.15);transition:opacity 0.22s,visibility 0.22s,transform 0.22s;z-index:9999;pointer-events:none; }
        .crm-sidebar-btn:hover .crm-tooltip { visibility:visible;opacity:1; }
        .crm-tooltip-title { font-size:0.78rem;font-weight:700;color:#a78bfa;margin-bottom:4px;display:flex;align-items:center;gap:6px; }
        .crm-tooltip-desc { font-size:0.73rem;color:rgba(148,163,184,0.9);line-height:1.4;font-weight:400; }
        .crm-section-label { font-size:0.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;padding:0 14px;margin-bottom:4px;margin-top:8px; }
        .crm-overdue-row td:first-child { border-left:3px solid #ef4444; }
        .crm-near-due-row td:first-child { border-left:3px solid #f59e0b; }
      `}</style>

      {/* ── Premium Site Header ── */}
      <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'linear-gradient(135deg, #0f172a 0%, #020617 55%, #1a0533 100%)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 1px 24px rgba(0,0,0,0.4), 0 0 50px rgba(139,92,246,0.08)' }}>
        <div style={{ maxWidth: '100%', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '4px', boxShadow: '0 0 16px rgba(139,92,246,0.35)', flexShrink: 0 }}>
              <img src="/evaops-logo.png" alt="EvaOps" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>EvaOps</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(148,163,184,0.8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>CRM Control Plane</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
            {/* CRM Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', flexShrink: 0 }}>
              <div className="crm-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(148,163,184,0.8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc' }}>CRM Admin Portal</div>
              </div>
            </div>
          </div>

          {/* Right: User Chip + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 4px 4px 12px', borderRadius: '40px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{crmUser.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(148,163,184,0.8)', textTransform: 'capitalize' }}>{crmUser.role}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: crmUser.role === 'admin' ? 'linear-gradient(135deg,#8b5cf6,#6366f1)' : 'linear-gradient(135deg,#3b82f6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {crmUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <button
              onClick={handleCrmLogout}
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── Premium Sidebar ── */}
        <div style={{ width: '248px', borderRight: '1px solid var(--divider)', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
          <div className="crm-section-label">MANAGE</div>

          <button
            className={`crm-sidebar-btn ${activeTab === 'clients' ? 'active-clients' : ''}`}
            onClick={() => { setActiveTab('clients'); setSelectedClient(null); }}
            style={{ color: activeTab === 'clients' ? '#a78bfa' : 'var(--text-secondary)' }}
          >
            <Building2 size={16} />
            Client Organizations
            <div className="crm-tooltip">
              <div className="crm-tooltip-title"><Building2 size={11} /> Client Directory</div>
              <div className="crm-tooltip-desc">Browse all registered client orgs, manage licensing tiers, seat allocations, and account suspension.</div>
            </div>
          </button>

          <button
            className={`crm-sidebar-btn ${activeTab === 'invoices' ? 'active-invoices' : ''}`}
            onClick={() => { setActiveTab('invoices'); setSelectedClient(null); }}
            style={{ color: activeTab === 'invoices' ? '#2dd4bf' : 'var(--text-secondary)' }}
          >
            <FileText size={16} />
            Billing Invoices
            <div className="crm-tooltip">
              <div className="crm-tooltip-title" style={{ color: '#2dd4bf' }}><FileText size={11} /> Billing Invoices</div>
              <div className="crm-tooltip-desc">Track all platform invoices, mark payments, view outstanding balances and billing collections.</div>
            </div>
          </button>

          {crmUser.role === 'admin' && (
            <>
              <div className="crm-section-label" style={{ marginTop: '12px' }}>ADMINISTRATION</div>
              <button
                className={`crm-sidebar-btn ${activeTab === 'agents' ? 'active-agents' : ''}`}
                onClick={() => { setActiveTab('agents'); setSelectedClient(null); }}
                style={{ color: activeTab === 'agents' ? '#fbbf24' : 'var(--text-secondary)' }}
              >
                <UserPlus size={16} />
                Support Agents
                <div className="crm-tooltip">
                  <div className="crm-tooltip-title" style={{ color: '#fbbf24' }}><UserPlus size={11} /> Support Staff</div>
                  <div className="crm-tooltip-desc">Create and manage CRM agent accounts. Assign admin or support roles and toggle account access.</div>
                </div>
              </button>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--divider)' }}>
            <button
              onClick={onBackToApp}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
              Back to Client Portal
            </button>
          </div>
        </div>

        {/* ── Content Panel ── */}
        <div style={{ flex: 1, padding: '36px', overflowY: 'auto', background: 'transparent' }}>
          {/* TAB 1: CLIENTS LIST */}
          {activeTab === 'clients' && !selectedClient && (() => {
            const totalCustomers = clients.length;
            const totalActiveSeats = clients.reduce((acc, c) => acc + (c.activeSeats || 0), 0);
            const totalSeatLimit = clients.reduce((acc, c) => acc + (c.operator_seats_limit || 10), 0);
            const pendingInvoices = clients.reduce((acc, c) => acc + (c.unpaidInvoicesCount || 0), 0);
            const revenueProjection = clients.reduce((acc, c) => {
              const tier = (c.license_tier || 'growth').toLowerCase();
              const price = tier === 'sovereign' ? 999 : tier === 'enterprise' ? 499 : 99;
              return acc + price;
            }, 0);

            const filteredClients = clients.filter(c => {
              const matchesSearch = (c.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
              const matchesTier = tierFilter === 'all' || (c.license_tier || 'growth') === tierFilter;
              const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'suspended' ? !!c.is_disabled : !c.is_disabled);
              return matchesSearch && matchesTier && matchesStatus;
            });

            return (
              <div className="crm-tab-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--accent-purple) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Client Directory</h3>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>{clients.length} orgs</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                      Monitor licensing tiers, resource seat allocations, active operations, and suspension locks.
                    </p>
                  </div>
                  <button
                    onClick={fetchClients}
                    disabled={loadingClients}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <RefreshCw size={13} className={loadingClients ? 'spin-anim' : ''} />
                    Reload List
                  </button>
                </div>

                {/* Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                  {/* Total Customers */}
                  <div className="glass-panel" style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ background: 'rgba(139,92,246,0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={24} style={{ color: 'var(--accent-purple)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Customers</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{totalCustomers} Orgs</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Registered Client Accounts</div>
                    </div>
                  </div>

                  {/* Seat Allocations */}
                  <div className="glass-panel" style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Seat Allocations</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>{totalActiveSeats} / {totalSeatLimit}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Used operator seats vs limit</div>
                    </div>
                  </div>

                  {/* Unpaid Invoices */}
                  <div className="glass-panel" style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ background: 'rgba(245,158,11,0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={24} style={{ color: '#f59e0b' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Unpaid Invoices</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{pendingInvoices} Pending</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Awaiting support clearance</div>
                    </div>
                  </div>

                  {/* MRR Projection */}
                  <div className="glass-panel" style={{ padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ background: 'rgba(20,184,166,0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={24} style={{ color: '#2dd4bf' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>MRR Projection</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2dd4bf', marginTop: '4px' }}>${revenueProjection.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Est. monthly recurring revenue</div>
                    </div>
                  </div>
                </div>

                {/* Directory Controls (Search & Filters) */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  background: 'var(--glass-bg)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <input
                      type="text"
                      placeholder="Search by Org ID or Name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <select
                        value={tierFilter}
                        onChange={e => setTierFilter(e.target.value)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All Licensing Tiers</option>
                        <option value="growth">Growth</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="sovereign">Sovereign</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loadingClients ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Loader size={32} className="spin-anim" style={{ marginBottom: '16px', color: '#8b5cf6' }} />
                    <div>Loading client directory...</div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ overflow: 'hidden', padding: 0, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--divider)', textAlign: 'left' }}>
                          <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Organization ID</th>
                          <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Organization Name</th>
                          <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Licensing Tier</th>
                          <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Seat Limit</th>
                          <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                          <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Invoices</th>
                          <th style={{ padding: '16px 20px', width: '90px', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <div style={{ padding: '48px', textAlign: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                                  <Building2 size={22} style={{ color: 'var(--accent-purple)' }} />
                                </div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>No organizations found</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No organizations match the current filter criteria.</div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredClients.map(client => (
                            <tr
                              key={client.id}
                              onClick={() => handleSelectClient(client)}
                              style={{
                                borderBottom: '1px solid var(--divider)',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.05)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{client.id}</td>
                              <td style={{ padding: '16px 20px' }}>{client.name}</td>
                              <td style={{ padding: '16px 20px', textTransform: 'capitalize' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  background: client.license_tier === 'sovereign' ? 'rgba(20,184,166,0.12)' : client.license_tier === 'enterprise' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
                                  border: client.license_tier === 'sovereign' ? '1px solid rgba(20,184,166,0.3)' : client.license_tier === 'enterprise' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(59,130,246,0.3)',
                                  color: client.license_tier === 'sovereign' ? '#2dd4bf' : client.license_tier === 'enterprise' ? '#c084fc' : '#60a5fa'
                                }}>
                                  {client.license_tier || 'growth'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                                {client.activeSeats} / {client.operator_seats_limit || 10}
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  background: client.is_disabled ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                                  border: client.is_disabled ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(34,197,94,0.25)',
                                  color: client.is_disabled ? '#ef4444' : '#22c55e',
                                  boxShadow: client.is_disabled ? '0 0 8px rgba(239,68,68,0.15)' : '0 0 8px rgba(34,197,94,0.15)'
                                }}>
                                  <span className="crm-pulse" style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: client.is_disabled ? '#ef4444' : '#22c55e',
                                    color: client.is_disabled ? '#ef4444' : '#22c55e'
                                  }}></span>
                                  {client.is_disabled ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                {client.unpaidInvoicesCount > 0 ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    background: 'rgba(245,158,11,0.12)',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    color: '#f59e0b'
                                  }}>{client.unpaidInvoicesCount} Pending</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>None</span>
                                )}
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a78bfa', fontWeight: 700, fontSize: '0.82rem', padding: '5px 10px', borderRadius: '6px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', transition: 'all 0.2s' }}>Manage ↗</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 1 DETAIL PANEL: MANAGE SPECIFIC CLIENT */}
          {activeTab === 'clients' && selectedClient && (
            <div className="crm-tab-panel">
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Client Directory</button>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{selectedClient.name}</span>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '18px',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--divider)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                ← Back to Client Directory
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 20%, var(--accent-purple) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {selectedClient.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Org Key: <code style={{ color: 'var(--text-primary)', background: 'var(--input-bg)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>{selectedClient.id}</code> | Admin Contact: {selectedClient.admin_email || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleImpersonateClient}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--divider)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg)'}
                  >
                    <Globe size={14} style={{ color: 'var(--accent-purple)' }} />
                    Launch Client DevOps Portal
                  </button>

                  <button
                    onClick={handleToggleStatus}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedClient.is_disabled ? 'var(--success)' : 'var(--error)',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: selectedClient.is_disabled ? '0 4px 14px rgba(34,197,94,0.2)' : '0 4px 14px rgba(239,68,68,0.2)'
                    }}
                  >
                    <Power size={14} />
                    {selectedClient.is_disabled ? 'Re-enable Account Access' : 'Suspend Account (Disable Access)'}
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {/* Stat 1: License Plan */}
                <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ background: 'rgba(139,92,246,0.1)', padding: '10px', borderRadius: '10px' }}>
                    <CreditCard size={20} style={{ color: 'var(--accent-purple)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>License Tier</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--accent-purple)' }}>{selectedClient.license_tier || 'growth'}</div>
                  </div>
                </div>

                {/* Stat 2: Seat Utilization */}
                <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Seat Utilization</div>
                    <Users size={14} style={{ color: '#14b8a6' }} />
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {selectedClient.activeSeats} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {selectedClient.operator_seats_limit || 10}</span>
                  </div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'var(--divider)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px', transition: 'width 0.4s',
                      width: `${Math.min(100, ((selectedClient.activeSeats || 0) / (selectedClient.operator_seats_limit || 10)) * 100)}%`,
                      background: 'linear-gradient(90deg, #14b8a6, #0d9488)'
                    }} />
                  </div>
                </div>

                {/* Stat 3: Balance */}
                <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '10px' }}>
                    <DollarSign size={20} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Outstanding</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                      ${clientInvoices.filter(i => i.status === 'Pending').reduce((s, i) => s + parseFloat(i.amount), 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Stat 4: Account Status */}
                <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ background: selectedClient.is_disabled ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', padding: '10px', borderRadius: '10px' }}>
                    <Activity size={20} style={{ color: selectedClient.is_disabled ? 'var(--error)' : 'var(--success)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Account Status</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: selectedClient.is_disabled ? 'var(--error)' : 'var(--success)' }}>
                      {selectedClient.is_disabled ? 'Suspended' : 'Active'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
                {/* Licensing - Visual Tier Cards + Seat Config */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} style={{ color: 'var(--accent-purple)' }} />
                      License Plan Configuration
                    </h4>

                    {licensingMsg && (
                      <div style={{
                        background: licensingMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${licensingMsg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        color: licensingMsg.type === 'success' ? '#a7f3d0' : '#fca5a5',
                        fontSize: '0.8rem',
                        marginBottom: '16px'
                      }}>
                        {licensingMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleUpdateLicensing} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Tier Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                        {[
                          { id: 'growth', name: 'Growth Plan', price: '$1,000', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', glow: 'rgba(59,130,246,0.2)', features: ['10 Active Operators limit', 'Standard shared runners', 'Email support (business hours)', 'Base infra metrics tracking'] },
                          { id: 'enterprise', name: 'Enterprise', price: '$2,000', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)', glow: 'rgba(139,92,246,0.2)', features: ['30 Active Operators limit', 'Dedicated build runners', '24/7 Priority support SLAs', 'Advanced insights dashboard', 'Custom Key Vault integration'] },
                          { id: 'sovereign', name: 'Sovereign', price: '$4,000', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', glow: 'rgba(20,184,166,0.2)', features: ['Unlimited active operators', 'Self-hosted private nodes', 'Dedicated SLA guarantees', 'Audit logs & SSO authentication', 'Multi-tenant routing rules'] }
                        ].map(tier => {
                          const isSelected = licenseTier === tier.id;
                          return (
                            <div
                              key={tier.id}
                              onClick={() => setLicenseTier(tier.id)}
                              style={{
                                borderRadius: '12px',
                                border: `2px solid ${isSelected ? tier.color : 'var(--glass-border)'}`,
                                background: isSelected ? `linear-gradient(145deg, ${tier.bg} 0%, rgba(255,255,255,0.01) 100%)` : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                padding: '14px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isSelected ? `0 0 18px ${tier.glow}` : 'none',
                                transform: isSelected ? 'translateY(-1px)' : 'none'
                              }}
                              onMouseEnter={e => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = tier.color;
                                  e.currentTarget.style.boxShadow = `0 4px 14px ${tier.glow}`;
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              <div style={{ height: '3px', background: `linear-gradient(90deg, ${tier.color}, transparent)`, borderRadius: '10px 10px 0 0', margin: '-14px -14px 10px -14px' }} />
                              {isSelected && (
                                <span style={{
                                  position: 'absolute', top: '8px', right: '8px',
                                  fontSize: '0.55rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px',
                                  background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)'
                                }}>ACTIVE</span>
                              )}
                              <div style={{ fontSize: '0.82rem', fontWeight: 750, color: isSelected ? tier.color : 'var(--text-primary)', marginBottom: '4px' }}>
                                {tier.name}
                              </div>
                              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: tier.color, lineHeight: 1 }}>
                                {tier.price}<span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span>
                              </div>

                              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {tier.features.map((feat, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.64rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    <Check size={9} style={{ color: tier.color }} />
                                    <span>{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>


                      {/* Seat Configuration */}
                      <div style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '18px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {/* Utilization Bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                              <span>Active Seat Allocation</span>
                              <span style={{ color: (selectedClient.activeSeats || 0) >= seatsLimit ? '#f87171' : 'var(--text-primary)' }}>
                                {selectedClient.activeSeats || 0} / {seatsLimit} in use
                              </span>
                            </div>
                            <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: '4px', transition: 'width 0.5s ease-out',
                                width: `${Math.min(100, ((selectedClient.activeSeats || 0) / seatsLimit) * 100)}%`,
                                background: (selectedClient.activeSeats || 0) >= seatsLimit
                                  ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                  : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                boxShadow: (selectedClient.activeSeats || 0) >= seatsLimit
                                  ? '0 0 10px rgba(239,68,68,0.2)'
                                  : '0 0 10px rgba(99,102,241,0.2)'
                              }} />
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                              Owners, Admins, Contributors consume 1 seat. Viewers are free.
                            </div>
                          </div>

                          {/* Interactive Range Config */}
                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 600 }}>
                              Configure Seat Limit
                            </label>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <input
                                type="range"
                                min={1}
                                max={100}
                                value={seatsLimit > 100 ? 100 : seatsLimit}
                                onChange={e => setSeatsLimit(parseInt(e.target.value, 10) || 1)}
                                style={{
                                  flex: 1,
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: 'var(--divider)',
                                  outline: 'none',
                                  cursor: 'pointer',
                                  accentColor: '#8b5cf6'
                                }}
                              />
                              <input
                                type="number"
                                min={1}
                                max={5000}
                                value={seatsLimit}
                                onChange={e => setSeatsLimit(parseInt(e.target.value, 10) || 1)}
                                style={{
                                  width: '75px',
                                  padding: '8px 10px',
                                  background: 'var(--input-bg)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: '8px',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.86rem',
                                  textAlign: 'center',
                                  outline: 'none'
                                }}
                              />
                              <button
                                type="submit"
                                disabled={updatingLicensing}
                                style={{
                                  padding: '9px 18px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                  color: '#ffffff',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  cursor: updatingLicensing ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.84rem'
                                }}
                              >
                                {updatingLicensing ? (
                                  <><RefreshCw size={13} className="spin-anim" /> Saving...</>
                                ) : (
                                  'Save Plan'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Policy & Calculation Details */}
                      <div style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px dashed var(--glass-border)',
                        borderRadius: '10px',
                        padding: '16px 18px',
                        marginBottom: '20px',
                        fontSize: '0.74rem',
                        lineHeight: 1.45,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          <Info size={14} style={{ color: 'var(--accent-purple)' }} />
                          <span>Billing & Policy Guidelines</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <li><strong>Base Fees:</strong> Flat subscription fees are charged monthly in advance relative to the selected tier plan.</li>
                          <li><strong>Operator Seat Surcharges:</strong> Additional active user seats are billed at dynamic per-seat rates determined by the current tier ($40/seat on Growth, $90/seat on Enterprise, and $30/seat on Sovereign).</li>
                          <li><strong>Terms & Adjustments:</strong> Mid-cycle changes are pro-rated. Plan switches are applied instantly to platform quotas.</li>
                        </ul>
                      </div>


                    </form>
                  </div>

                {/* Right Column: Billing Summary + Invoice Generator */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Billing Summary */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} style={{ color: 'var(--accent-purple)' }} />
                      Billing Summary
                    </h4>
                    {(() => {
                      const totalInvoiced = clientInvoices.reduce((s, i) => s + parseFloat(i.amount), 0);
                      const totalPaid = clientInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + parseFloat(i.amount), 0);
                      const totalPending = clientInvoices.filter(i => i.status === 'Pending').reduce((s, i) => s + parseFloat(i.amount), 0);
                      const lastInv = clientInvoices.length > 0 ? clientInvoices[0] : null;
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '12px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Invoiced</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>${totalInvoiced.toLocaleString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Collected</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#4ade80' }}>${totalPaid.toLocaleString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Outstanding</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: totalPending > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>${totalPending.toLocaleString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Last Invoice</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>
                              {lastInv ? `$${parseFloat(lastInv.amount).toLocaleString()}` : '—'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {lastInv ? new Date(lastInv.issue_date).toLocaleDateString() : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Invoice Preview & Generate */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--accent-purple)' }} />
                      Generate Client Invoice
                    </h4>

                    {invoiceMsg && (
                      <div style={{
                        background: invoiceMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${invoiceMsg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        color: invoiceMsg.type === 'success' ? '#a7f3d0' : '#fca5a5',
                        fontSize: '0.8rem',
                        marginBottom: '16px'
                      }}>
                        {invoiceMsg.text}
                      </div>
                    )}

                    {(() => {
                      const tier = (selectedClient.license_tier || 'growth').toLowerCase();
                      const seats = selectedClient.activeSeats || 0;
                      const seatLimit = selectedClient.operator_seats_limit || 10;
                      const pricing: Record<string, { base: number; perSeat: number }> = {
                        'growth': { base: 1000, perSeat: 40 },
                        'enterprise': { base: 2000, perSeat: 90 },
                        'sovereign': { base: 4000, perSeat: 30 }
                      };
                      const p = pricing[tier] || pricing.growth;

                      const baseAmount = p.base;
                      const perSeatTotal = seats * p.perSeat;
                      const totalAmount = baseAmount + perSeatTotal;

                      return (
                        <div>
                          <div style={{
                            background: 'var(--input-bg)', borderRadius: '8px', padding: '14px', marginBottom: '12px', border: '1px dashed var(--glass-border)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Base ({tier})</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>${baseAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Seats ({seats} × ${p.perSeat}/seat)</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>${perSeatTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ borderTop: '1px dashed var(--divider)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Invoice Total</span>
                              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-purple)' }}>${totalAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          <form onSubmit={handleGenerateInvoice}>
                            <div style={{ marginBottom: '14px' }}>
                              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                Payment Due Terms
                              </label>
                              <select
                                value={invoiceDueDays}
                                onChange={e => setInvoiceDueDays(e.target.value)}
                                style={{
                                  width: '100%', padding: '10px 12px',
                                  background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.86rem', outline: 'none'
                                }}
                              >
                                <option value="7">Due in 7 Days (Net 7)</option>
                                <option value="15">Due in 15 Days (Net 15)</option>
                                <option value="30">Due in 30 Days (Net 30)</option>
                                <option value="60">Due in 60 Days (Net 60)</option>
                              </select>
                            </div>

                            <button
                              type="submit"
                              disabled={generatingInvoice}
                              style={{
                                width: '100%', padding: '10px 16px',
                                borderRadius: '8px', border: 'none',
                                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                color: '#ffffff', fontWeight: 600,
                                cursor: generatingInvoice ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                fontSize: '0.84rem',
                                transition: 'opacity 0.2s, transform 0.15s'
                              }}
                              onMouseEnter={e => { if (!generatingInvoice) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                            >
                              {generatingInvoice ? (
                                <><RefreshCw size={14} className="spin-anim" /> Generating...</>
                              ) : (
                                <><Plus size={14} /> Generate & Dispatch Invoice</>
                              )}
                            </button>
                          </form>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Full Width: Billing History */}
              <div className="glass-panel" style={{ padding: '24px', marginTop: '28px' }}>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px' }}>Organization Billing History</h4>

                {loadingClientInvoices ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <RefreshCw size={20} className="spin-anim" />
                  </div>
                ) : clientInvoices.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    No billing invoices generated for this organization.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '10px 14px' }}>Invoice #</th>
                          <th style={{ padding: '10px 14px' }}>Issue Date</th>
                          <th style={{ padding: '10px 14px' }}>Amount</th>
                          <th style={{ padding: '10px 14px' }}>Due Date</th>
                          <th style={{ padding: '10px 14px' }}>Status</th>
                          <th style={{ padding: '10px 14px', width: '100px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientInvoices.map(inv => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid var(--divider)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--divider)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>{inv.invoice_number}</td>
                            <td style={{ padding: '12px 14px' }}>{new Date(inv.issue_date).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 14px' }}>${parseFloat(inv.amount).toLocaleString()}</td>
                            <td style={{ padding: '12px 14px' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: inv.status === 'Paid' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                                color: inv.status === 'Paid' ? 'var(--success)' : 'var(--warning)',
                                border: inv.status === 'Paid' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)'
                              }}>
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {inv.status === 'Pending' ? (
                                <button
                                  onClick={() => handleUpdateInvoiceStatus(inv.id, 'Paid', 'detail')}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(34,197,94,0.3)',
                                    background: 'rgba(34,197,94,0.1)',
                                    color: '#4ade80',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Mark Paid
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INVOICES LIST (GLOBAL) */}
          {activeTab === 'invoices' && (
            <div className="crm-tab-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 40%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Billing Invoices</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Track payments, view collections, and toggle invoice status across all platform customers.
                  </p>
                </div>
                <button
                  onClick={fetchAllInvoices}
                  disabled={loadingInvoices}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} className={loadingInvoices ? 'spin-anim' : ''} />
                  Refresh List
                </button>
              </div>

              {/* Dynamic Invoices Stats Bar */}
              {(() => {
                const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
                const collected = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + (inv.amount || 0), 0);
                const outstanding = invoices.filter(inv => inv.status === 'Pending').reduce((acc, inv) => acc + (inv.amount || 0), 0);
                const paidCount = invoices.filter(inv => inv.status === 'Paid').length;
                const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    {/* Card 1: Total Invoiced */}
                    <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      <div style={{ background: 'rgba(139,92,246,0.1)', padding: '10px', borderRadius: '10px' }}>
                        <DollarSign size={20} style={{ color: 'var(--accent-purple)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Total Invoiced</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>${totalInvoiced.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Card 2: Collected */}
                    <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      <div style={{ background: 'rgba(20,184,166,0.1)', padding: '10px', borderRadius: '10px' }}>
                        <ShieldCheck size={20} style={{ color: '#14b8a6' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Collected Volume</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14b8a6' }}>${collected.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Card 3: Outstanding */}
                    <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '10px' }}>
                        <Activity size={20} style={{ color: '#f59e0b' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Outstanding Balance</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>${outstanding.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Card 4: Paid vs Pending */}
                    <div className="glass-panel" style={{ padding: '16px 20px', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '10px' }}>
                        <FileText size={20} style={{ color: '#6366f1' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Settled / Unpaid</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{paidCount} Paid / {pendingCount} Pending</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Directory Controls (Search Filter) */}
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                background: 'var(--glass-bg)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Search invoices by invoice number, client name, or org ID..."
                    value={invoiceSearchQuery}
                    onChange={e => setInvoiceSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              </div>

              {loadingInvoices ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin-anim" style={{ marginBottom: '10px' }} />
                  <div>Loading system invoices...</div>
                </div>
              ) : (
                <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--divider)', textAlign: 'left' }}>
                        <th style={{ padding: '14px 20px' }}>Invoice Number</th>
                        <th style={{ padding: '14px 20px' }}>Client Organization</th>
                        <th style={{ padding: '14px 20px' }}>Amount</th>
                        <th style={{ padding: '14px 20px' }}>Issue Date</th>
                        <th style={{ padding: '14px 20px' }}>Due Date</th>
                        <th style={{ padding: '14px 20px' }}>Status</th>
                        <th style={{ padding: '14px 20px', width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = invoices.filter(inv => {
                          const query = invoiceSearchQuery.toLowerCase();
                          return (inv.invoice_number || '').toLowerCase().includes(query) ||
                            (inv.clientName || '').toLowerCase().includes(query) ||
                            (inv.organization_id || '').toLowerCase().includes(query);
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No invoices match the search query.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(inv => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid var(--divider)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--divider)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '14px 20px', fontWeight: 600 }}>{inv.invoice_number}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontWeight: 500 }}>{inv.clientName}</span>
                              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>({inv.organization_id})</span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>${parseFloat(inv.amount).toLocaleString()}</td>
                            <td style={{ padding: '14px 20px' }}>{new Date(inv.issue_date).toLocaleDateString()}</td>
                            <td style={{ padding: '14px 20px' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: inv.status === 'Paid' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                                color: inv.status === 'Paid' ? 'var(--success)' : 'var(--warning)',
                                border: inv.status === 'Paid' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)'
                              }}>
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {inv.status === 'Pending' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleUpdateInvoiceStatus(inv.id, 'Paid', 'global')}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(34,197,94,0.3)',
                                      background: 'rgba(34,197,94,0.1)',
                                      color: '#4ade80',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Mark Paid
                                  </button>
                                  <button
                                    onClick={() => handleUpdateInvoiceStatus(inv.id, 'Void', 'global')}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(239,68,68,0.2)',
                                      background: 'rgba(239,68,68,0.05)',
                                      color: '#f87171',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Void
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  {inv.status === 'Paid' ? `Settled on ${new Date(inv.payment_date).toLocaleDateString()}` : 'No Action'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORT AGENTS MANAGEMENT (ADMIN ONLY) */}
          {activeTab === 'agents' && crmUser.role === 'admin' && (
            <div className="crm-tab-panel">
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 40%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Manage Support Staff</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Create secure administrator and support agent accounts to coordinate customer assistance.
                  </p>
                </div>
                <button
                  onClick={fetchAgents}
                  disabled={loadingAgents}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} className={loadingAgents ? 'spin-anim' : ''} />
                  Refresh
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', alignItems: 'start' }}>
                {/* Left Column: Staff Roster */}
                <div>

                  {/* ── Existing Agents Grid ── */}
                  {loadingAgents ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <RefreshCw size={20} className="spin-anim" />
                      <div style={{ marginTop: '8px', fontSize: '0.84rem' }}>Loading support agents...</div>
                    </div>
                  ) : agents.length > 0 ? (
                    <div className="glass-panel" style={{ overflow: 'hidden', padding: 0, marginBottom: '24px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--divider)', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px' }}>Name</th>
                            <th style={{ padding: '12px 16px' }}>Email</th>
                            <th style={{ padding: '12px 16px' }}>Role</th>
                            <th style={{ padding: '12px 16px' }}>Status</th>
                            <th style={{ padding: '12px 16px', width: '130px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agents.map(agent => {
                            const isMasterAdmin = agent.email === 'admin@evaops.crm';
                            const isCurrentlyEditing = editingAgent?.id === agent.id;
                            return (
                              <tr key={agent.id} style={{ borderBottom: '1px solid var(--divider)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--divider)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{agent.name}</td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{agent.email}</td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    background: agent.role === 'admin' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                                    color: agent.role === 'admin' ? 'var(--accent-purple)' : '#60a5fa',
                                    border: agent.role === 'admin' ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(59,130,246,0.2)'
                                  }}>
                                    {agent.role}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    background: agent.is_disabled ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                                    color: agent.is_disabled ? '#f87171' : '#4ade80',
                                    border: agent.is_disabled ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)'
                                  }}>
                                    {agent.is_disabled ? 'Disabled' : 'Active'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    {!isCurrentlyEditing && (
                                      <button
                                        onClick={() => {
                                          setEditingAgent(agent);
                                          setEditName(agent.name);
                                          setEditEmail(agent.email);
                                          setEditRole(agent.role);
                                          setEditIsDisabled(agent.is_disabled);
                                          setEditPassword('');
                                          setEditingMsg(null);
                                        }}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          border: '1px solid var(--glass-border)',
                                          background: 'var(--glass-bg)',
                                          color: 'var(--text-primary)',
                                          fontSize: '0.72rem',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        <Edit3 size={12} /> Edit
                                      </button>
                                    )}
                                    {!isMasterAdmin && !isCurrentlyEditing && (
                                      <button
                                        onClick={() => handleToggleAgentStatus(agent)}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          border: agent.is_disabled ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.2)',
                                          background: agent.is_disabled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.05)',
                                          color: agent.is_disabled ? '#4ade80' : '#f87171',
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        <Power size={12} />
                                        {agent.is_disabled ? 'Enable' : 'Disable'}
                                      </button>
                                    )}
                                    {isMasterAdmin && (
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic', padding: '4px 0' }}>
                                        Protected
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '24px' }}>
                      No support agents found.
                    </div>
                  )}

                </div>

                {/* Right Column: Register & Edit Forms */}
                <div>
                  {/* ── Inline Edit Panel ── */}
                  {editingAgent && (
                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Edit3 size={16} style={{ color: 'var(--accent-purple)' }} />
                          Editing: {editingAgent.name}
                        </h4>
                        <button
                          onClick={() => setEditingAgent(null)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#f87171',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {editingMsg && (
                        <div style={{
                          background: editingMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${editingMsg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                          padding: '10px 12px',
                          borderRadius: '8px',
                          color: editingMsg.type === 'success' ? '#a7f3d0' : '#fca5a5',
                          fontSize: '0.8rem',
                          marginBottom: '16px'
                        }}>
                          {editingMsg.text}
                        </div>
                      )}

                      <form onSubmit={handleUpdateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                              Agent Name
                            </label>
                            <input
                              type="text"
                              required
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.86rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                              Agent Email
                            </label>
                            <input
                              type="email"
                              required
                              value={editEmail}
                              onChange={e => setEditEmail(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.86rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                              Role
                            </label>
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.86rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            >
                              <option value="agent">Support Agent</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                              Password (leave blank to keep current)
                            </label>
                            <input
                              type="password"
                              value={editPassword}
                              onChange={e => setEditPassword(e.target.value)}
                              placeholder="Min 8 characters"
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.86rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={editIsDisabled}
                              onChange={e => setEditIsDisabled(e.target.checked)}
                              disabled={editingAgent.email === 'admin@evaops.crm'}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            Account Disabled
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={updatingAgent}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: '#ffffff',
                            fontWeight: 600,
                            cursor: updatingAgent ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.86rem',
                            alignSelf: 'flex-start',
                            marginTop: '4px'
                          }}
                        >
                          {updatingAgent ? (
                            <><RefreshCw size={14} className="spin-anim" /> Saving...</>
                          ) : (
                            <><Save size={14} /> Save Changes</>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ── Create New Agent ── */}
                  <div className="glass-panel" style={{ padding: '28px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserPlus size={16} style={{ color: 'var(--accent-purple)' }} />
                      Create Support Agent Account
                    </h4>

                    {agentMsg && (
                      <div style={{
                        background: agentMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${agentMsg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        color: agentMsg.type === 'success' ? '#a7f3d0' : '#fca5a5',
                        fontSize: '0.8rem',
                        marginBottom: '20px'
                      }}>
                        {agentMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            Agent Name
                          </label>
                          <input
                            type="text"
                            required
                            value={agentName}
                            onChange={e => setAgentName(e.target.value)}
                            placeholder="Jane Doe"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.86rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            Agent Email
                          </label>
                          <input
                            type="email"
                            required
                            value={agentEmail}
                            onChange={e => setAgentEmail(e.target.value)}
                            placeholder="jane.doe@evaops.crm"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.86rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            Initial Password
                          </label>
                          <input
                            type="password"
                            required
                            value={agentPassword}
                            onChange={e => setAgentPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.86rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            Administrative Role
                          </label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {[
                              { id: 'agent', label: 'Support Agent', desc: 'Invoicing & plan view only', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                              { id: 'admin', label: 'Administrator', desc: 'Full access & user creation', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' }
                            ].map(r => {
                              const isSel = agentRole === r.id;
                              return (
                                <div key={r.id} onClick={() => setAgentRole(r.id)} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: `2px solid ${isSel ? r.color : 'var(--glass-border)'}`, background: isSel ? r.bg : 'transparent', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isSel ? `0 0 12px ${r.bg}` : 'none' }}>
                                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSel ? r.color : 'var(--text-primary)', marginBottom: '2px' }}>{r.label}</div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={creatingAgent}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                          color: '#ffffff',
                          fontWeight: 600,
                          cursor: creatingAgent ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '0.86rem',
                          alignSelf: 'flex-start',
                          marginTop: '4px'
                        }}
                      >
                        {creatingAgent ? (
                          <><RefreshCw size={14} className="spin-anim" /> Creating...</>
                        ) : (
                          <><Plus size={14} /> Register CRM User</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
