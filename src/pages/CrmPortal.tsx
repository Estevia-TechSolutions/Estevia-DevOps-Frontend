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
  Save
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
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1e1b4b, #0f172a, #020617)',
        padding: '20px',
        color: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(167, 139, 250, 0.3)'
          }}>
            <Building2 size={20} style={{ color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EvaOps Admin Support</span>
        </div>

        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '36px',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.45)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>CRM Support Sign In</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '24px' }}>
            Provide local administrator credentials to access client controls.
          </p>

          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              padding: '10px 12px',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleCrmLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Support Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="agent@evaops.crm"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Secure Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                marginTop: '8px',
                transition: 'opacity 0.2s'
              }}
            >
              {loginLoading ? (
                <><RefreshCw size={16} className="spin-anim" /> Connecting...</>
              ) : (
                <><Lock size={15} /> Sign In to CRM</>
              )}
            </button>
          </form>
        </div>

        <button
          onClick={onBackToApp}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            marginTop: '24px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Return to Client Access Portal
        </button>
      </div>
    );
  }

  // ── RENDER CRM DASHBOARD ─────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 28px',
        borderBottom: '1px solid var(--divider)',
        background: 'rgba(2, 6, 23, 0.45)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={15} style={{ color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EvaOps CRM Portal</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)'
            }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {crmUser.name} <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6 }}>({crmUser.role})</span>
            </span>
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--divider)' }}></div>

          <button
            onClick={handleCrmLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500
            }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Tabs Navigation */}
        <div style={{
          width: '240px',
          borderRight: '1px solid var(--divider)',
          background: 'rgba(2, 6, 23, 0.15)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          <button
            onClick={() => { setActiveTab('clients'); setSelectedClient(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              background: activeTab === 'clients' ? 'var(--badge-bg)' : 'transparent',
              color: activeTab === 'clients' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <Building2 size={16} />
            Client Organizations
          </button>

          <button
            onClick={() => { setActiveTab('invoices'); setSelectedClient(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              background: activeTab === 'invoices' ? 'var(--badge-bg)' : 'transparent',
              color: activeTab === 'invoices' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} />
            Billing Invoices
          </button>

          {crmUser.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('agents'); setSelectedClient(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                background: activeTab === 'agents' ? 'var(--badge-bg)' : 'transparent',
                color: activeTab === 'agents' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={16} />
              Support Agents
            </button>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--divider)' }}>
            <button
              onClick={onBackToApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Back to Client Portal
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>
          {/* TAB 1: CLIENTS LIST */}
          {activeTab === 'clients' && !selectedClient && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Client Organizations</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Monitor client licensing tiers, resource seat allocations, and account suspension locks.
                  </p>
                </div>
                <button
                  onClick={fetchClients}
                  disabled={loadingClients}
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
                  <RefreshCw size={13} className={loadingClients ? 'spin-anim' : ''} />
                  Reload List
                </button>
              </div>

              {loadingClients ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin-anim" style={{ marginBottom: '10px' }} />
                  <div>Loading client organizations...</div>
                </div>
              ) : (
                <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--divider)', textAlign: 'left' }}>
                        <th style={{ padding: '14px 20px' }}>Organization ID</th>
                        <th style={{ padding: '14px 20px' }}>Organization Name</th>
                        <th style={{ padding: '14px 20px' }}>Licensing Tier</th>
                        <th style={{ padding: '14px 20px' }}>Seat Limit</th>
                        <th style={{ padding: '14px 20px' }}>Status</th>
                        <th style={{ padding: '14px 20px' }}>Outstanding Invoices</th>
                        <th style={{ padding: '14px 20px', width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No client organizations registered in the system.
                          </td>
                        </tr>
                      ) : (
                        clients.map(client => (
                          <tr 
                            key={client.id} 
                            onClick={() => handleSelectClient(client)}
                            style={{ 
                              borderBottom: '1px solid var(--divider)', 
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: '14px 20px', fontWeight: 600 }}>{client.id}</td>
                            <td style={{ padding: '14px 20px' }}>{client.name}</td>
                            <td style={{ padding: '14px 20px', textTransform: 'capitalize' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                background: client.license_tier === 'sovereign' ? 'rgba(20,184,166,0.1)' : client.license_tier === 'enterprise' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                                border: client.license_tier === 'sovereign' ? '1px solid rgba(20,184,166,0.25)' : client.license_tier === 'enterprise' ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(59,130,246,0.25)',
                                color: client.license_tier === 'sovereign' ? '#2dd4bf' : client.license_tier === 'enterprise' ? '#c084fc' : '#60a5fa'
                              }}>
                                {client.license_tier || 'growth'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {client.activeSeats} / {client.operator_seats_limit || 10}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                background: client.is_disabled ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                                border: client.is_disabled ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)',
                                color: client.is_disabled ? 'var(--error)' : 'var(--success)'
                              }}>
                                <span style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  backgroundColor: client.is_disabled ? 'var(--error)' : 'var(--success)'
                                }}></span>
                                {client.is_disabled ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {client.unpaidInvoicesCount > 0 ? (
                                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{client.unpaidInvoicesCount} Pending</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', color: 'var(--accent-purple)', fontWeight: 600 }}>
                              Manage →
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 1 DETAIL PANEL: MANAGE SPECIFIC CLIENT */}
          {activeTab === 'clients' && selectedClient && (
            <div>
              <button
                onClick={() => setSelectedClient(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '18px',
                  fontWeight: 600
                }}
              >
                ← Back to Client Directory
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                    {selectedClient.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Org Key: <code style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '4px' }}>{selectedClient.id}</code> | Admin Contact: {selectedClient.admin_email || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
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
                      gap: '8px'
                    }}
                  >
                    <Power size={14} />
                    {selectedClient.is_disabled ? 'Re-enable Account Access' : 'Suspend Account (Disable Access)'}
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div className="glass-panel" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '6px' }}>License Tier</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem',
                      background: selectedClient.license_tier === 'sovereign' ? 'rgba(20,184,166,0.12)' : selectedClient.license_tier === 'enterprise' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
                      border: selectedClient.license_tier === 'sovereign' ? '1px solid rgba(20,184,166,0.3)' : selectedClient.license_tier === 'enterprise' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(59,130,246,0.3)',
                      color: selectedClient.license_tier === 'sovereign' ? '#2dd4bf' : selectedClient.license_tier === 'enterprise' ? '#c084fc' : '#60a5fa'
                    }}>
                      {selectedClient.license_tier || 'growth'}
                    </span>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '6px' }}>Seat Utilization</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {selectedClient.activeSeats} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {selectedClient.operator_seats_limit || 10}</span>
                  </div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px', transition: 'width 0.4s',
                      width: `${Math.min(100, ((selectedClient.activeSeats || 0) / (selectedClient.operator_seats_limit || 10)) * 100)}%`,
                      background: 'linear-gradient(90deg, #14b8a6, #0d9488)'
                    }} />
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '6px' }}>Outstanding Balance</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedClient.unpaidInvoicesCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
                    ${clientInvoices.filter(i => i.status === 'Pending').reduce((s, i) => s + parseFloat(i.amount), 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedClient.unpaidInvoicesCount} pending invoice{selectedClient.unpaidInvoicesCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '6px' }}>Account Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      color: selectedClient.is_disabled ? 'var(--error)' : 'var(--success)'
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: selectedClient.is_disabled ? 'var(--error)' : 'var(--success)' }} />
                      {selectedClient.is_disabled ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Created {new Date(selectedClient.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
                {/* Left Column: Plan and licensing controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Account Overview / Seat Utilization */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px' }}>Account Overview</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Org Key</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: '4px', fontFamily: 'monospace' }}>
                          {selectedClient.org_key}
                        </div>
                      </div>
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Admin Email</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: '4px' }}>
                          {selectedClient.admin_email || '—'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '14px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Seat Utilization</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>
                          {selectedClient.activeSeats} active <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>of {selectedClient.operator_seats_limit || 10} limit</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 600, color: (selectedClient.activeSeats || 0) >= (selectedClient.operator_seats_limit || 10) ? 'var(--warning)' : 'var(--success)' }}>
                        {Math.round(((selectedClient.activeSeats || 0) / (selectedClient.operator_seats_limit || 10)) * 100)}%
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '4px', transition: 'width 0.5s',
                        width: `${Math.min(100, ((selectedClient.activeSeats || 0) / (selectedClient.operator_seats_limit || 10)) * 100)}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                      }} />
                    </div>
                  </div>

                  {/* Licensing form */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px' }}>License Management</h4>
                    
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

                    <form onSubmit={handleUpdateLicensing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Select Service Tier
                        </label>
                        <select
                          value={licenseTier}
                          onChange={e => setLicenseTier(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.86rem',
                            outline: 'none'
                          }}
                        >
                          <option value="growth">Growth ($1,000/mo)</option>
                          <option value="enterprise">Enterprise ($2,000/mo)</option>
                          <option value="sovereign">Sovereign ($4,000/mo)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Max Write User Seat Limit
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={5000}
                          value={seatsLimit}
                          onChange={e => setSeatsLimit(parseInt(e.target.value, 10) || 1)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.86rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updatingLicensing}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                          color: '#ffffff',
                          fontWeight: 600,
                          cursor: updatingLicensing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '0.84rem'
                        }}
                      >
                        {updatingLicensing ? (
                          <><RefreshCw size={14} className="spin-anim" /> Updating...</>
                        ) : (
                          'Save Licensing Parameters'
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Client Invoices list */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
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
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)' }}>
                              <th style={{ padding: '8px 10px' }}>Invoice #</th>
                              <th style={{ padding: '8px 10px' }}>Amount</th>
                              <th style={{ padding: '8px 10px' }}>Due Date</th>
                              <th style={{ padding: '8px 10px' }}>Status</th>
                              <th style={{ padding: '8px 10px', width: '90px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientInvoices.map(inv => (
                              <tr key={inv.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                                <td style={{ padding: '10px 10px', fontWeight: 600 }}>{inv.invoice_number}</td>
                                <td style={{ padding: '10px 10px' }}>${parseFloat(inv.amount).toLocaleString()}</td>
                                <td style={{ padding: '10px 10px' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                                <td style={{ padding: '10px 10px' }}>
                                  <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '0.66rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    background: inv.status === 'Paid' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                                    color: inv.status === 'Paid' ? 'var(--success)' : 'var(--warning)',
                                    border: inv.status === 'Paid' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)'
                                  }}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 10px' }}>
                                  {inv.status === 'Pending' ? (
                                    <button
                                      onClick={() => handleUpdateInvoiceStatus(inv.id, 'Paid', 'detail')}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(34,197,94,0.3)',
                                        background: 'rgba(34,197,94,0.1)',
                                        color: '#4ade80',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Mark Paid
                                    </button>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
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

                {/* Right Column: Billing Summary + Invoice Generator */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Billing Summary */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px' }}>Billing Summary</h4>
                    {(() => {
                      const totalInvoiced = clientInvoices.reduce((s, i) => s + parseFloat(i.amount), 0);
                      const totalPaid = clientInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + parseFloat(i.amount), 0);
                      const totalPending = clientInvoices.filter(i => i.status === 'Pending').reduce((s, i) => s + parseFloat(i.amount), 0);
                      const lastInv = clientInvoices.length > 0 ? clientInvoices[0] : null;
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Invoiced</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>${totalInvoiced.toLocaleString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Collected</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#4ade80' }}>${totalPaid.toLocaleString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Outstanding</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: totalPending > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>${totalPending.toLocaleString()}</div>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
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
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '16px' }}>Generate Client Invoice</h4>
                    
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
                      const PRICING: Record<string, { base: number; perSeat: number }> = {
                        'growth': { base: 1000, perSeat: 25 },
                        'enterprise': { base: 2000, perSeat: 35 },
                        'sovereign': { base: 4000, perSeat: 50 }
                      };
                      const p = PRICING[tier] || PRICING.growth;
                      const baseAmount = p.base;
                      const perSeatTotal = seats * p.perSeat;
                      const totalAmount = baseAmount + perSeatTotal;
                      return (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '14px', marginBottom: '12px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Base ({tier})</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>${baseAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Seats ({seats} × ${p.perSeat}/seat)</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>${perSeatTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--divider)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                fontSize: '0.84rem'
                              }}
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
            </div>
          )}

          {/* TAB 2: INVOICES LIST (GLOBAL) */}
          {activeTab === 'invoices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>System Billing Invoices</h3>
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

              {loadingInvoices ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin-anim" style={{ marginBottom: '10px' }} />
                  <div>Loading system invoices...</div>
                </div>
              ) : (
                <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--divider)', textAlign: 'left' }}>
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
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No invoices generated in the system.
                          </td>
                        </tr>
                      ) : (
                        invoices.map(inv => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid var(--divider)' }}>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORT AGENTS MANAGEMENT (ADMIN ONLY) */}
          {activeTab === 'agents' && crmUser.role === 'admin' && (
            <div style={{ maxWidth: '720px' }}>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Manage Support Staff</h3>
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
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--divider)', textAlign: 'left' }}>
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
                          <tr key={agent.id} style={{ borderBottom: '1px solid var(--divider)' }}>
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
                      <select
                        value={agentRole}
                        onChange={e => setAgentRole(e.target.value)}
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
                        <option value="agent">Support Agent (Invoicing & Plan view)</option>
                        <option value="admin">Administrator (Full Access & User creation)</option>
                      </select>
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
          )}
        </div>
      </div>
    </div>
  );
};
