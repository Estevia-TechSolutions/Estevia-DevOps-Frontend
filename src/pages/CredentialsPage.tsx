import React, { useState } from 'react';
import { Database, Eye, EyeOff, GitBranch, Settings, Globe, Cloud, AlertTriangle, MessageSquare, Copy, CheckCircle, Loader, RefreshCw, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { KeyVaultConfigurator } from '../components/credentials/KeyVaultConfigurator';

interface CredentialsPageProps {
  currentUser?: { role: string; name?: string; email?: string } | null;
  credentialsList: any[];
  // Credentials
  githubToken: string;
  setGithubToken: (val: string) => void;
  showGithubToken: boolean;
  setShowGithubToken: (val: boolean) => void;
  decryptedGithubToken: string;
  credentialStatus: Record<string, boolean>;
  savingCredentials: string | null;
  credMsg: { type: 'success' | 'error'; text: string } | null;
  handleLoadSavedCredential: (type: 'github' | 'godaddy' | 'azure_devops' | 'azure') => void;
  handleSaveCredential: (type: string, data: any, label: string, expiresAt?: string) => void;
  godaddyKey: string;
  setGodaddyKey: (val: string) => void;

  godaddySecret: string;
  setGodaddySecret: (val: string) => void;
  showGodaddyKey: boolean;
  setShowGodaddyKey: (val: boolean) => void;
  showGodaddySecret: boolean;
  setShowGodaddySecret: (val: boolean) => void;
  decryptedGodaddyKey: string;
  decryptedGodaddySecret: string;

  devopsPat: string;
  setDevopsPat: (val: string) => void;
  showDevopsPat: boolean;
  setShowDevopsPat: (val: boolean) => void;
  decryptedDevopsPat: string;

  // Org settings
  azureSubscriptionId: string;
  setAzureSubscriptionId: (val: string) => void;
  azureResourceGroup: string;
  setAzureResourceGroup: (val: string) => void;
  defaultDnsDomain: string;
  setDefaultDnsDomain: (val: string) => void;
  azureDevopsOrgUrl: string;
  setAzureDevopsOrgUrl: (val: string) => void;
  azureDevopsProject: string;
  setAzureDevopsProject: (val: string) => void;
  pipelineVariableGroup: string;
  setPipelineVariableGroup: (val: string) => void;
  githubOwner: string;
  setGithubOwner: (val: string) => void;
  azureContainerRegistry: string;
  setAzureContainerRegistry: (val: string) => void;
  azureDevopsServiceConnection: string;
  setAzureDevopsServiceConnection: (val: string) => void;
  dockerRegistryServiceConnection: string;
  setDockerRegistryServiceConnection: (val: string) => void;
  azureKeyVaultUrl: string;
  setAzureKeyVaultUrl: (val: string) => void;
  devDbHost: string;
  setDevDbHost: (val: string) => void;
  qaDbHost: string;
  setQaDbHost: (val: string) => void;
  prodDbHost: string;
  setProdDbHost: (val: string) => void;
  devManagedEnvId: string;
  setDevManagedEnvId: (val: string) => void;
  prodManagedEnvId: string;
  setProdManagedEnvId: (val: string) => void;
  discoveringInfra: boolean;
  handleDiscoverAzureResources: () => void;
  savingSettings: boolean;
  settingsMsg: { type: 'success' | 'error' | 'warning'; text: string } | null;
  handleSaveSettings: (e: React.FormEvent) => void;
  containerRegistries: any[];
  serviceConnections: { arm: any[]; docker: any[] };
  loadingMetadata: boolean;
  API_BASE: string;
  theme: 'dark' | 'light';
  // Teams & Observability
  teamsWebhookUrl: string;
  setTeamsWebhookUrl: (val: string) => void;
  teamsWebhookToken: string;
  logAnalyticsWorkspaceId: string;
  setLogAnalyticsWorkspaceId: (val: string) => void;
  prodLogAnalyticsWorkspaceId: string;
  setProdLogAnalyticsWorkspaceId: (val: string) => void;
  testingCredential: string | null;
  validationResult: Record<string, { success: boolean; message: string }>;
  handleValidateCredential: (provider: 'github' | 'godaddy' | 'azure_devops' | 'azure') => void;
  azureClientId: string;
  setAzureClientId: (val: string) => void;
  azureClientSecret: string;
  setAzureClientSecret: (val: string) => void;
  azureTenantId: string;
  setAzureTenantId: (val: string) => void;
  showAzureClientId: boolean;
  setShowAzureClientId: (val: boolean) => void;
  showAzureClientSecret: boolean;
  setShowAzureClientSecret: (val: boolean) => void;
  showAzureTenantId: boolean;
  setShowAzureTenantId: (val: boolean) => void;
  decryptedAzureClientId: string;
  decryptedAzureClientSecret: string;
  decryptedAzureTenantId: string;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  handleDiscoverAzureEnvCredentials: () => Promise<void>;
}

type CredTab = 'summary' | 'github' | 'godaddy' | 'azure' | 'keyvault' | 'teams';

const TABS: { id: CredTab; label: string; sublabel: string; icon: React.ReactNode; accentVar: string }[] = [
  { id: 'summary',  label: 'Integration Health', sublabel: 'Live health check across all credentials and infrastructure configuration', icon: <ShieldCheck size={15} />, accentVar: '#ca8a04' },
  { id: 'github',   label: 'GitHub Integration',   sublabel: 'Personal Access Tokens & repository owner organization configuration', icon: <GitBranch size={15} />,    accentVar: '#ca8a04' },
  { id: 'godaddy',  label: 'GoDaddy DNS Binding',  sublabel: 'Automated DNS record bindings for custom app domains', icon: <Globe size={15} />,        accentVar: '#ca8a04' },
  { id: 'azure',    label: 'Azure Infrastructure', sublabel: 'Subscriptions, target resource groups, variable groups, and container registries', icon: <Cloud size={15} />,        accentVar: '#ca8a04' },
  { id: 'keyvault', label: 'Key Vault & Monitoring', sublabel: 'Secure Key Vault mappings and Log Analytics auto-discovery setup', icon: <Database size={15} />,     accentVar: '#ca8a04' },
  { id: 'teams',    label: 'MS Teams Alerts',      sublabel: 'Life-cycle webhooks and Azure DevOps service hook automated setup', icon: <MessageSquare size={15} />, accentVar: '#6264a7' },
];

/* ── Shared sub-components ── */

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
    {children}
  </label>
);

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span style={{
    fontSize: '0.78rem',
    color: active ? 'var(--success)' : 'var(--error)',
    background: active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    flexShrink: 0,
  }}>
    {active ? '● ACTIVE (ENCRYPTED)' : '○ NOT CONFIGURED'}
  </span>
);

const RevealBtn: React.FC<{ shown: boolean; configured: boolean; onToggle: () => void; accent: string; disabled?: boolean }> = ({
  shown, configured, onToggle, accent, disabled,
}) => {
  if (!configured) return null;
  return (
    <button type="button" className="reveal-btn" onClick={onToggle} style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
      color: accent, fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px',
      cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px',
      opacity: disabled ? 0.6 : 1,
    }} disabled={disabled}>
      {shown ? <><EyeOff size={12} /> Hide Saved</> : <><Eye size={12} /> Reveal Saved</>}
    </button>
  );
};

const SectionBlock: React.FC<{
  title: string; subtitle?: string; accent: string;
  status?: boolean; revealShown?: boolean; onReveal?: () => void;
  disabledReveal?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, accent, status, revealShown, onReveal, disabledReveal, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderLeft: `3px solid ${accent}`,
    borderRadius: '12px',
    padding: '20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: accent, marginBottom: subtitle ? '4px' : 0 }}>{title}</h4>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{subtitle}</p>}
      </div>
      {status !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onReveal && <RevealBtn shown={!!revealShown} configured={status} onToggle={onReveal} accent={accent} disabled={disabledReveal} />}
          <StatusBadge active={status} />
        </div>
      )}
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  </div>
);

const PasswordInput: React.FC<{
  value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string;
  disabled?: boolean;
}> = ({ value, onChange, show, onToggle, placeholder, disabled }) => (
  <div style={{ position: 'relative', flex: 1 }}>
    <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} style={{ paddingRight: '40px', width: '100%' }} disabled={disabled} />
    <button type="button" onClick={onToggle} style={{
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', color: 'var(--text-secondary)',
      display: 'flex', alignItems: 'center', padding: 0, cursor: disabled ? 'not-allowed' : 'pointer',
    }} disabled={disabled}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);

/* ── Main Component ── */

export const CredentialsPage: React.FC<CredentialsPageProps> = ({
  credentialsList,
  githubToken, setGithubToken, showGithubToken, setShowGithubToken, decryptedGithubToken,
  credentialStatus, savingCredentials, credMsg,
  handleLoadSavedCredential, handleSaveCredential,
  godaddyKey, setGodaddyKey, godaddySecret, setGodaddySecret,
  showGodaddyKey, setShowGodaddyKey, showGodaddySecret, setShowGodaddySecret,
  decryptedGodaddyKey, decryptedGodaddySecret,
  devopsPat, setDevopsPat, showDevopsPat, setShowDevopsPat, decryptedDevopsPat,
  azureSubscriptionId, setAzureSubscriptionId,
  azureResourceGroup, setAzureResourceGroup,
  defaultDnsDomain, setDefaultDnsDomain,
  azureDevopsOrgUrl, setAzureDevopsOrgUrl,
  azureDevopsProject, setAzureDevopsProject,
  pipelineVariableGroup, setPipelineVariableGroup,
  githubOwner, setGithubOwner,
  azureContainerRegistry, setAzureContainerRegistry,
  savingSettings, settingsMsg, handleSaveSettings,
  azureKeyVaultUrl, setAzureKeyVaultUrl,
  devDbHost, setDevDbHost,
  qaDbHost, setQaDbHost,
  prodDbHost, setProdDbHost,
  devManagedEnvId, setDevManagedEnvId,
  prodManagedEnvId, setProdManagedEnvId,
  discoveringInfra, handleDiscoverAzureResources,
  containerRegistries, loadingMetadata,
  currentUser,
  API_BASE,
  theme,
  teamsWebhookUrl, setTeamsWebhookUrl,
  teamsWebhookToken,
  logAnalyticsWorkspaceId, setLogAnalyticsWorkspaceId,
  prodLogAnalyticsWorkspaceId, setProdLogAnalyticsWorkspaceId,
  testingCredential, validationResult, handleValidateCredential,
  azureClientId, setAzureClientId, azureClientSecret, setAzureClientSecret, azureTenantId, setAzureTenantId,
  showAzureClientId, setShowAzureClientId, showAzureClientSecret, setShowAzureClientSecret, showAzureTenantId, setShowAzureTenantId,
  decryptedAzureClientId, decryptedAzureClientSecret, decryptedAzureTenantId,
  showToast, handleDiscoverAzureEnvCredentials,
}) => {
  const [activeTab, setActiveTab] = useState<CredTab>('summary');
  const [azureSubTab, setAzureSubTab] = useState<'auth' | 'scope' | 'pipelines'>('auth');
  const [discoveringWorkspace, setDiscoveringWorkspace] = useState(false);
  const [runningAll, setRunningAll] = useState(false);

  const [githubExpiresAt, setGithubExpiresAt] = useState('');
  const [devopsExpiresAt, setDevopsExpiresAt] = useState('');
  const [azureExpiresAt, setAzureExpiresAt] = useState('');
  const [rotatingSecret, setRotatingSecret] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Sync saved expiration dates from list
  React.useEffect(() => {
    if (credentialsList && credentialsList.length > 0) {
      const gh = credentialsList.find(c => c.provider === 'github');
      if (gh && gh.expires_at) {
        setGithubExpiresAt(new Date(gh.expires_at).toISOString().split('T')[0]);
      }
      const ado = credentialsList.find(c => c.provider === 'azure_devops');
      if (ado && ado.expires_at) {
        setDevopsExpiresAt(new Date(ado.expires_at).toISOString().split('T')[0]);
      }
      const az = credentialsList.find(c => c.provider === 'azure');
      if (az && az.expires_at) {
        setAzureExpiresAt(new Date(az.expires_at).toISOString().split('T')[0]);
      }
    }
  }, [credentialsList]);

  const handleRotateAzureSecret = async () => {
    setRotatingSecret(true);
    try {
      const orgId = localStorage.getItem('devops_organization_id') || '';
      const token = localStorage.getItem('devops_token') || '';
      const res = await fetch(`${API_BASE}/credentials/rotate-azure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ organizationId: orgId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Secret Rotated', 'Azure Service Principal Client Secret has been programmatically rotated in Entra ID and local settings!', 'success');
        if (data.expiresAt) {
          setAzureExpiresAt(new Date(data.expiresAt).toISOString().split('T')[0]);
        }
        handleLoadSavedCredential('azure');
      } else {
        showToast('Rotation Failed', data.message || 'Verification of rotation permissions failed.', 'error');
      }
    } catch (err: any) {
      showToast('Rotation Error', err.message || 'Error occurred during secret rotation.', 'error');
    } finally {
      setRotatingSecret(false);
    }
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    for (const c of ['azure', 'github', 'azure_devops', 'godaddy'] as const) {
      await new Promise<void>(resolve => {
        handleValidateCredential(c as any);
        setTimeout(resolve, 800);
      });
    }
    setRunningAll(false);
  };


  const handleDiscoverWorkspace = async () => {
    setDiscoveringWorkspace(true);
    try {
      const orgId = localStorage.getItem('organizationId') || 'estevia';
      const token = localStorage.getItem('devops_token') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE}/apps/discover-workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ organizationId: orgId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogAnalyticsWorkspaceId(data.workspaceId || '');
        setProdLogAnalyticsWorkspaceId(data.prodWorkspaceId || '');
        showToast('Workspaces Discovered', 'Successfully discovered and linked workspaces. Dev/QA: ' + (data.workspaceId || 'None') + ' | Prod: ' + (data.prodWorkspaceId || 'None'), 'success');
      } else {
        showToast('Discovery Failed', 'Discovery failed: ' + (data.message || 'Unknown error'), 'error');
      }
    } catch (err: any) {
      showToast('Discovery Error', 'Error during workspace discovery: ' + err.message, 'error');
    } finally {
      setDiscoveringWorkspace(false);
    }
  };

  const canEdit = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  return (
    <div className="glass-panel creds-amber" style={{
      padding: '32px', height: '100%',
      background: 'linear-gradient(150deg, rgba(234, 179, 8, 0.08) 0%, rgba(161, 120, 0, 0.12) 55%, rgba(120, 80, 0, 0.16) 100%)',
      borderColor: 'rgba(234, 179, 8, 0.18)',
      boxShadow: '0 0 40px rgba(234,179,8,0.05), inset 0 0 20px rgba(234,179,8,0.03)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gap: '16px'
    }}>
      {/* Ambient top glow */}
      <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(234,179,8,0.6), rgba(251,191,36,0.9), rgba(234,179,8,0.3))', borderRadius: '2px 2px 0 0' }} />

      {/* Scoped amber button theme */}
      <style>{`
        .creds-amber {
          background: linear-gradient(150deg, rgba(234, 179, 8, 0.05) 0%, rgba(202, 138, 4, 0.08) 55%, rgba(133, 77, 14, 0.12) 100%) !important;
          border-color: rgba(234, 179, 8, 0.15) !important;
          box-shadow: 0 0 40px rgba(234, 179, 8, 0.04), inset 0 0 20px rgba(234, 179, 8, 0.02) !important;
        }
        [data-theme="light"] .creds-amber {
          background: linear-gradient(150deg, rgba(254, 240, 138, 0.25) 0%, rgba(253, 224, 71, 0.15) 50%, rgba(250, 204, 21, 0.08) 100%) !important;
          border-color: rgba(202, 138, 4, 0.2) !important;
          box-shadow: 0 4px 20px rgba(202, 138, 4, 0.06) !important;
        }
        .creds-amber .btn-primary {
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%) !important;
          border-color: #d97706 !important;
          color: #ffffff !important;
          box-shadow: 0 2px 12px rgba(234, 179, 8, 0.25) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12) !important;
          transition: all 0.2s ease-in-out !important;
        }
        .creds-amber .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #facc15 0%, #eab308 100%) !important;
          box-shadow: 0 4px 20px rgba(234, 179, 8, 0.4) !important;
          transform: translateY(-1px);
        }
        .creds-amber .btn-primary:disabled {
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%) !important;
          border-color: #ca8a04 !important;
          color: rgba(255, 255, 255, 0.65) !important;
          opacity: 0.45 !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }
        [data-theme="light"] .creds-amber .reveal-btn {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border-color: rgba(202, 138, 4, 0.3) !important;
          color: #b45309 !important;
        }
      `}</style>


      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <Database style={{ color: '#ca8a04' }} />
        <h3 style={{ margin: 0 }}>Credentials &amp; Organization Settings</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
        Manage API keys, access tokens, and infrastructure configuration — all encrypted with <strong>AES-256-GCM</strong>.
      </p>

      {/* Warning banner for read-only roles */}
      {!canEdit && (
        <div className="glass-panel" style={{
          padding: '14px 18px',
          borderColor: 'rgba(217, 119, 6, 0.4)',
          backgroundColor: 'rgba(217, 119, 6, 0.12)',
          color: '#f59e0b',
          marginBottom: '20px',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderRadius: '8px',
          fontWeight: 500,
        }}>
          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>Read-Only Mode: Only Owners and Administrators can manage organization settings and credentials.</span>
        </div>
      )}

      {/* Credential message */}
      {credMsg && (
        <div className="glass-panel" style={{
          padding: '12px 16px',
          borderColor: credMsg.type === 'success' ? 'var(--success)' : 'var(--error)',
          backgroundColor: credMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: 'var(--text-primary)', marginBottom: '20px', fontSize: '0.9rem',
        }}>
          {credMsg.text}
        </div>
      )}

      {/* 2-Column Split Layout */}
      <div style={{ display: 'flex', gap: '28px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Column - Stepper Style Vertical Menu (Yellow Theme) */}
        <div className="glass-panel" style={{
          width: '300px',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flexShrink: 0,
          boxSizing: 'border-box',
          background: 'linear-gradient(160deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.18) 60%, rgba(133, 77, 14, 0.22) 100%)',
          borderColor: 'rgba(234, 179, 8, 0.20)',
          boxShadow: '0 0 30px rgba(234, 179, 8, 0.06), inset 0 0 20px rgba(234, 179, 8, 0.04)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
            {TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '12px 8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    opacity: isActive ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
                  }}
                >
                  {/* Stepper column line and circle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'rgba(234, 179, 8, 0.15)' : '#1e293b',
                      border: `2px solid ${isActive ? '#ca8a04' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#eab308' : 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      boxShadow: isActive ? '0 0 12px rgba(234, 179, 8, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {tab.icon}
                    </div>
                    {idx < TABS.length - 1 && (
                      <div style={{ 
                        width: '2px', 
                        height: '34px',
                        background: isActive 
                          ? 'linear-gradient(180deg, #ca8a04, rgba(255,255,255,0.06))' 
                          : 'rgba(255,255,255,0.06)', 
                        margin: '4px 0' 
                      }} />
                    )}
                  </div>
                  
                  {/* Label & Sublabel */}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingTop: '2px' }}>
                    <span style={{ 
                      fontSize: '0.86rem', 
                      color: isActive ? '#eab308' : 'var(--text-primary)', 
                      fontWeight: isActive ? 700 : 500,
                      lineHeight: '1.3'
                    }}>
                      {tab.label}
                    </span>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      lineHeight: '1.35',
                      whiteSpace: 'normal',
                    }}>
                      {tab.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Informative text at the bottom of the sidebar */}
          <div style={{ 
            marginTop: 'auto', 
            paddingTop: '20px', 
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-secondary)', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Security &amp; Compliance
            </span>
            <p style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.45', 
              margin: 0 
            }}>
              All organization API credentials and private keys are encrypted natively using AES-256-GCM. Decrypted scopes are processed on-demand.
            </p>
          </div>
        </div>

        {/* Right Column - Tab Contents & Horizontal Footer */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '8px' }}>
          
          <div style={{ flex: 1 }}>
            {/* ── INTEGRATION HEALTH SUMMARY TAB ── */}
            {activeTab === 'summary' && (() => {
              const creds = [
                { key: 'azure',       label: 'Azure Service Principal',  icon: '☁️', tab: 'azure' as CredTab,   statusKey: 'azure'       },
                { key: 'github',      label: 'GitHub Platform Token',    icon: '🐙', tab: 'github' as CredTab,  statusKey: 'github'      },
                { key: 'azure_devops',label: 'Azure DevOps PAT',         icon: '🔧', tab: 'azure' as CredTab,   statusKey: 'azure_devops'},
                { key: 'godaddy',     label: 'GoDaddy Domain API',       icon: '🌐', tab: 'godaddy' as CredTab, statusKey: 'godaddy'     },
              ];

              const infraChecks = [
                { label: 'Azure Subscription ID',    ok: !!azureSubscriptionId },
                { label: 'Azure Resource Group',     ok: !!azureResourceGroup },
                { label: 'Azure DevOps Org URL',     ok: !!azureDevopsOrgUrl },
                { label: 'DevOps Project Name',      ok: !!azureDevopsProject },
                { label: 'Pipeline Variable Group',  ok: !!pipelineVariableGroup },
                { label: 'Container Registry',       ok: !!azureContainerRegistry },
                { label: 'Default DNS Domain',       ok: !!defaultDnsDomain },
                { label: 'Dev DB Host',              ok: !!devDbHost },
                { label: 'QA DB Host',               ok: !!qaDbHost },
                { label: 'Prod DB Host',             ok: !!prodDbHost },
              ];

              const obsChecks = [
                { label: 'MS Teams Webhook',         ok: !!teamsWebhookUrl },
                { label: 'Log Analytics (Dev/QA)',   ok: !!logAnalyticsWorkspaceId },
                { label: 'Log Analytics (Prod)',     ok: !!prodLogAnalyticsWorkspaceId },
                { label: 'Azure Key Vault URL',      ok: !!azureKeyVaultUrl },
              ];

              const credOk = creds.filter(c => credentialStatus[c.statusKey]).length;
              const infraOk = infraChecks.filter(c => c.ok).length;
              const obsOk = obsChecks.filter(c => c.ok).length;
              const totalOk = credOk + infraOk + obsOk;
              const totalItems = creds.length + infraChecks.length + obsChecks.length;
              const healthPct = Math.round((totalOk / totalItems) * 100);
              const healthColor = healthPct >= 80 ? '#22c55e' : healthPct >= 50 ? '#f59e0b' : '#ef4444';



              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fade-in-anim 0.25s ease-out' }}>

                  {/* Overview header */}
                  <div style={{
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '20px 24px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={18} style={{ color: '#ca8a04' }} />
                          Integration Health Overview
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {totalOk} / {totalItems} integrations configured
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: healthColor, lineHeight: 1 }}>{healthPct}%</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Health Score</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginTop: '16px' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        width: `${healthPct}%`,
                        background: healthPct >= 80
                          ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                          : healthPct >= 50
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)',
                        transition: 'width 0.6s ease-out',
                        boxShadow: `0 0 8px ${healthColor}44`,
                      }} />
                    </div>
                  </div>

                  {/* Critical Credentials */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#ca8a04', display: 'inline-block' }} />
                      Critical Credentials
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {creds.map(cred => {
                        const isConfigured = credentialStatus[cred.statusKey];
                        const vResult = validationResult[cred.key === 'azure_devops' ? 'azure_devops' : cred.key];
                        const isTesting = testingCredential === cred.key;
                        const statusColor = !isConfigured ? '#f59e0b' : vResult?.success === false ? '#ef4444' : '#22c55e';
                        const statusLabel = !isConfigured ? 'Not Configured' : vResult?.success === false ? 'Connection Failed' : vResult?.success ? 'Connected' : 'Configured';
                        const statusIcon = !isConfigured ? '⚠' : vResult?.success === false ? '✗' : '●';

                        const dbCred = credentialsList.find(c => c.provider === (cred.key === 'azure_devops' ? 'azure_devops' : cred.key));
                        const expiresAt = dbCred?.expires_at;
                        let expiryLabel = '';
                        let isExpired = false;
                        let isWarning = false;
                        if (isConfigured && expiresAt) {
                          const expDate = new Date(expiresAt);
                          const now = new Date();
                          const diff = expDate.getTime() - now.getTime();
                          const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          if (diffDays <= 0) {
                            expiryLabel = `Expired on ${expDate.toLocaleDateString()}`;
                            isExpired = true;
                          } else if (diffDays <= 30) {
                            expiryLabel = `Expires in ${diffDays} days (${expDate.toLocaleDateString()})`;
                            isWarning = true;
                          } else {
                            expiryLabel = `Expires on ${expDate.toLocaleDateString()}`;
                          }
                        }

                        return (
                          <div key={cred.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px', borderRadius: '10px',
                            background: isConfigured ? 'rgba(34,197,94,0.03)' : 'rgba(245,158,11,0.04)',
                            border: `1px solid ${isConfigured ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.2)'}`,
                            gap: '12px', flexWrap: 'wrap',
                          }}>
                            {/* Left: icon + label + validation message */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '18px', flexShrink: 0 }}>{cred.icon}</span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{cred.label}</div>
                                {expiryLabel && (
                                  <div style={{
                                    fontSize: '0.72rem', marginTop: '2px',
                                    color: isExpired ? '#ef4444' : isWarning ? '#fbbf24' : 'var(--text-secondary)'
                                  }}>
                                    {expiryLabel}
                                  </div>
                                )}
                                {vResult && (
                                  <div style={{
                                    fontSize: '0.72rem', marginTop: '4px',
                                    color: vResult.success ? '#4ade80' : '#f87171',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                  }}>
                                    {vResult.success ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                                    {vResult.message}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: status badge + CTA */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <span style={{
                                fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                                background: isConfigured ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                                color: statusColor,
                                border: `1px solid ${isConfigured ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                              }}>
                                {statusIcon} {statusLabel}
                              </span>
                              {isConfigured ? (
                                <button
                                  type="button"
                                  onClick={() => handleValidateCredential(cred.key as any)}
                                  disabled={isTesting}
                                  style={{
                                    fontSize: '0.74rem', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                                    color: 'var(--text-secondary)', cursor: isTesting ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                  }}
                                >
                                  {isTesting ? <><Loader size={11} className="spin-anim" /> Testing...</> : <><RefreshCw size={11} /> Test</>}
                                </button>
                              ) : canEdit ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab(cred.tab)}
                                  style={{
                                    fontSize: '0.74rem', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
                                    background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
                                    color: '#eab308', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                  }}
                                >
                                  Set Up <ArrowRight size={11} />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Infrastructure Configuration */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#3b82f6', display: 'inline-block' }} />
                      Infrastructure Configuration
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                      {infraChecks.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: '8px',
                          background: item.ok ? 'rgba(34,197,94,0.03)' : 'rgba(245,158,11,0.03)',
                          border: `1px solid ${item.ok ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.15)'}`,
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700,
                            color: item.ok ? '#4ade80' : '#f59e0b',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            {item.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {item.ok ? 'Set' : 'Missing'}
                          </span>
                        </div>
                      ))}
                    </div>
                    {canEdit && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab('azure')}
                          style={{
                            fontSize: '0.74rem', color: '#ca8a04', background: 'none', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0', fontWeight: 600,
                          }}
                        >
                          Configure Azure Infrastructure <ArrowRight size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Observability & Notifications */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#8b5cf6', display: 'inline-block' }} />
                      Observability &amp; Notifications
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                      {obsChecks.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: '8px',
                          background: item.ok ? 'rgba(34,197,94,0.03)' : 'rgba(245,158,11,0.03)',
                          border: `1px solid ${item.ok ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.15)'}`,
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700,
                            color: item.ok ? '#4ade80' : '#f59e0b',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            {item.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {item.ok ? 'Set' : 'Missing'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Run All Tests */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleRunAll}
                      disabled={runningAll}
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '0.84rem' }}
                    >
                      {runningAll ? <><Loader size={14} className="spin-anim" /> Running Tests...</> : <><Zap size={14} /> Run All Connection Tests</>}
                    </button>
                  </div>

                </div>
              );
            })()}

            {/* ── GITHUB TAB ── */}
            {activeTab === 'github' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
                  <SectionBlock
                    title="Personal Access Token"
                    subtitle="Powers pipeline template commits & repo scanner."
                    accent="#ca8a04"
                    status={credentialStatus.github}
                    revealShown={showGithubToken && githubToken !== ''}
                    onReveal={() => {
                      if (githubToken !== '' && showGithubToken) { setGithubToken('••••••••••••••••••••'); setShowGithubToken(false); }
                      else { handleLoadSavedCredential('github'); }
                    }}
                    disabledReveal={!canEdit}
                  >
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <PasswordInput
                        value={githubToken} onChange={setGithubToken}
                        show={showGithubToken} onToggle={() => setShowGithubToken(!showGithubToken)}
                        placeholder="ghp_................................."
                        disabled={!canEdit}
                      />
                      <div>
                        <FieldLabel>Expiration Date (Optional)</FieldLabel>
                        <input 
                          type="date" 
                          value={githubExpiresAt} 
                          onChange={e => setGithubExpiresAt(e.target.value)}
                          disabled={!canEdit}
                          onFocus={() => setFocusedInput('github')}
                          onBlur={() => setFocusedInput(null)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: focusedInput === 'github' ? '1px solid #ca8a04' : '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            colorScheme: 'dark',
                            boxShadow: focusedInput === 'github' ? '0 0 12px rgba(202, 138, 4, 0.25), inset 0 1px 2px rgba(0,0,0,0.4)' : 'inset 0 1px 2px rgba(0,0,0,0.4)',
                            transition: 'all 0.2s ease-in-out',
                          }} 
                        />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          This date is automatically populated/updated when testing or saving a valid token.
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '2px 0' }}>
                        <a href="https://github.com/settings/tokens/new?description=EvaOps+Integration&scopes=repo,read:org" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#ca8a04', textDecoration: 'underline', fontWeight: 500 }}>
                          Generate new token on GitHub ↗
                        </a>
                      </div>
                      <button className="btn-primary" style={{ width: '100%' }}
                        onClick={() => handleSaveCredential('github', { token: githubToken }, 'GitHub Platform Token', githubExpiresAt)}
                        disabled={!canEdit || savingCredentials === 'github' || !githubToken || githubToken === '••••••••••••••••••••' || (!!decryptedGithubToken && githubToken === decryptedGithubToken)}
                      >
                        {savingCredentials === 'github' ? 'Saving...' : 'Save'}
                      </button>

                      {credentialStatus.github && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                          <button 
                            type="button"
                            className="btn-secondary"
                            style={{ 
                              width: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: 'rgba(255,255,255,0.02)',
                              color: 'var(--text-primary)',
                              cursor: testingCredential === 'github' ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => handleValidateCredential('github')}
                            disabled={testingCredential === 'github'}
                          >
                            {testingCredential === 'github' ? (
                              <>
                                <Loader size={12} className="spin-anim" />
                                <span>Testing Connection...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw size={12} />
                                <span>Test Connection</span>
                              </>
                            )}
                          </button>
                          {validationResult.github && (
                            <div style={{ 
                              padding: '8px 12px', 
                              borderRadius: '8px', 
                              fontSize: '0.75rem',
                              border: `1px solid ${validationResult.github.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              backgroundColor: validationResult.github.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                              color: validationResult.github.success ? 'var(--success)' : 'var(--error)',
                              lineHeight: '1.4'
                            }}>
                              {validationResult.github.success ? '🟢 ' : '🔴 '}
                              {validationResult.github.message}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </SectionBlock>

                  <SectionBlock
                    title="GitHub Organization Settings"
                    subtitle="Repository owner / org used when scanning and committing pipeline files."
                    accent="#ca8a04"
                  >
                    <form onSubmit={handleSaveSettings}>
                      <div style={{ display: 'grid', gap: '14px' }}>
                        <div>
                          <FieldLabel>GitHub Owner / Org</FieldLabel>
                          <input type="text" value={githubOwner} onChange={e => setGithubOwner(e.target.value)}
                            placeholder="Estevia-TechSolutions" required disabled={!canEdit} />
                        </div>
                        {settingsMsg && (
                          <div style={{
                            padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem',
                            color: settingsMsg.type === 'success' ? 'var(--success)' : settingsMsg.type === 'warning' ? 'var(--warning)' : 'var(--error)',
                            background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                          }}>
                            {settingsMsg.text}
                          </div>
                        )}
                        <button type="submit" className="btn-primary" disabled={!canEdit || savingSettings} style={{ width: '100%' }}>
                          {savingSettings ? 'Saving...' : 'Save GitHub Settings'}
                        </button>
                      </div>
                    </form>
                  </SectionBlock>
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(234, 179, 8, 0.04)',
                  border: '1px solid rgba(234, 179, 8, 0.1)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                }}>
                  <strong style={{ color: '#ca8a04', display: 'block', marginBottom: '4px' }}>💡 GitHub Integration Summary &amp; Pipeline Sync</strong>
                  The GitHub Personal Access Token (PAT) is stored securely and encrypted natively using AES-256-GCM. It authorizes the EvaOps (CloudOps Management & Governance) orchestrator to discover private and public organization repositories, scan branch structures, register webhook subscription events, and configure continuous integration triggers. When a pipeline is created or modified, the repository owner or organization settings are utilized to automatically commit custom workflow configuration files directly to your target branches under signature commits, facilitating zero-touch infrastructure-as-code updates.
                </div>
              </div>
            )}

            {/* ── GODADDY TAB ── */}
            {activeTab === 'godaddy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
                  <SectionBlock
                    title="GoDaddy API Credentials"
                    subtitle="Powers automatic DNS record binding for custom domains."
                    accent="#ca8a04"
                    status={credentialStatus.godaddy}
                    revealShown={showGodaddyKey && (godaddyKey !== '' || godaddySecret !== '')}
                    onReveal={() => {
                      if ((godaddyKey !== '' || godaddySecret !== '') && showGodaddyKey) {
                        setGodaddyKey('••••••••••••••••••••'); setGodaddySecret('••••••••••••••••••••');
                        setShowGodaddyKey(false); setShowGodaddySecret(false);
                      } else { handleLoadSavedCredential('godaddy'); }
                    }}
                    disabledReveal={!canEdit}
                  >
                    <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                      <PasswordInput value={godaddyKey} onChange={setGodaddyKey}
                        show={showGodaddyKey} onToggle={() => setShowGodaddyKey(!showGodaddyKey)}
                        placeholder="GoDaddy API Key" disabled={!canEdit} />
                      <PasswordInput value={godaddySecret} onChange={setGodaddySecret}
                        show={showGodaddySecret} onToggle={() => setShowGodaddySecret(!showGodaddySecret)}
                        placeholder="GoDaddy API Secret" disabled={!canEdit} />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}
                      onClick={() => handleSaveCredential('godaddy', { apiKey: godaddyKey, apiSecret: godaddySecret }, 'GoDaddy Domain API Keys')}
                      disabled={!canEdit || savingCredentials === 'godaddy' || !godaddyKey || !godaddySecret || godaddyKey === '••••••••••••••••••••' || godaddySecret === '••••••••••••••••••••' || (!!decryptedGodaddyKey && godaddyKey === decryptedGodaddyKey && godaddySecret === decryptedGodaddySecret)}
                    >
                      {savingCredentials === 'godaddy' ? 'Saving GoDaddy API Keys...' : 'Save GoDaddy Keys'}
                    </button>

                    {credentialStatus.godaddy && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          type="button"
                          className="btn-secondary"
                          style={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '6px',
                            padding: '8px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.02)',
                            color: 'var(--text-primary)',
                            cursor: testingCredential === 'godaddy' ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleValidateCredential('godaddy')}
                          disabled={testingCredential === 'godaddy'}
                        >
                          {testingCredential === 'godaddy' ? (
                            <>
                              <Loader size={12} className="spin-anim" />
                              <span>Testing Connection...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw size={12} />
                              <span>Test Connection</span>
                            </>
                          )}
                        </button>
                        {validationResult.godaddy && (
                          <div style={{ 
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem',
                            border: `1px solid ${validationResult.godaddy.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            backgroundColor: validationResult.godaddy.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                            color: validationResult.godaddy.success ? 'var(--success)' : 'var(--error)',
                            lineHeight: '1.4'
                          }}>
                            {validationResult.godaddy.success ? '🟢 ' : '🔴 '}
                            {validationResult.godaddy.message}
                          </div>
                        )}
                      </div>
                    )}
                  </SectionBlock>

                  <SectionBlock
                    title="Domain Settings"
                    subtitle="Default DNS domain used when binding custom domains to apps."
                    accent="#ca8a04"
                  >
                    <form onSubmit={handleSaveSettings}>
                      <div style={{ display: 'grid', gap: '14px' }}>
                        <div>
                          <FieldLabel>Default DNS Domain</FieldLabel>
                          <input type="text" value={defaultDnsDomain} onChange={e => setDefaultDnsDomain(e.target.value)}
                            placeholder="esteviatech.com" required disabled={!canEdit} />
                        </div>
                        {settingsMsg && (
                          <div style={{
                            padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem',
                            color: settingsMsg.type === 'success' ? 'var(--success)' : settingsMsg.type === 'warning' ? 'var(--warning)' : 'var(--error)',
                            background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                          }}>
                            {settingsMsg.text}
                          </div>
                        )}
                        <button type="submit" className="btn-primary" disabled={!canEdit || savingSettings} style={{ width: '100%' }}>
                          {savingSettings ? 'Saving...' : 'Save Domain Settings'}
                        </button>
                      </div>
                    </form>
                  </SectionBlock>
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(234, 179, 8, 0.04)',
                  border: '1px solid rgba(234, 179, 8, 0.1)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                }}>
                  <strong style={{ color: '#ca8a04', display: 'block', marginBottom: '4px' }}>💡 GoDaddy DNS Automation &amp; Domain Lifecycle Management</strong>
                  The GoDaddy API Key and API Secret are utilized to programmatically interface with GoDaddy's DNS REST endpoints to coordinate DNS lifecycle bindings. This enables the platform to automatically provision, modify, and delete custom DNS records (specifically targeting CNAME mappings and TXT domain validations). When new feature branches are created or environments are cloned, EvaOps (CloudOps Management & Governance) handles zero-touch subdomain generation and automatically configures SSL/TLS certificates, ensuring your dynamic deployments are instantly accessible under secure custom URLs.
                </div>
              </div>
            )}

            {/* ── AZURE TAB ── */}
            {activeTab === 'azure' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Sleek Amber Pills for Sub-tabs */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  borderBottom: '1px solid var(--glass-border)',
                  paddingBottom: '12px',
                  marginBottom: '4px',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { id: 'auth', label: 'Auth & Access' },
                    { id: 'scope', label: 'Scope & Resources' },
                    { id: 'pipelines', label: 'Pipelines & Databases' }
                  ].map((sub) => {
                    const isSubActive = azureSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setAzureSubTab(sub.id as any)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: isSubActive ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid var(--glass-border)',
                          background: isSubActive ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: isSubActive ? '#eab308' : 'var(--text-secondary)'
                        }}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>

                {azureSubTab === 'auth' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
                    <SectionBlock
                      title="Azure DevOps Personal Access Token"
                      subtitle="Registers pipelines & triggers builds via Azure DevOps API."
                      accent="#ca8a04"
                      status={credentialStatus.azure_devops}
                      revealShown={showDevopsPat && devopsPat !== ''}
                      onReveal={() => {
                        if (devopsPat !== '' && showDevopsPat) { setDevopsPat('••••••••••••••••••••'); setShowDevopsPat(false); }
                        else { handleLoadSavedCredential('azure_devops'); }
                      }}
                      disabledReveal={!canEdit}
                    >
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <PasswordInput value={devopsPat} onChange={setDevopsPat}
                          show={showDevopsPat} onToggle={() => setShowDevopsPat(!showDevopsPat)}
                          placeholder="Azure DevOps PAT (Pipeline Scope)" disabled={!canEdit} />
                        <div>
                          <FieldLabel>Expiration Date (Optional)</FieldLabel>
                          <input 
                            type="date" 
                            value={devopsExpiresAt} 
                            onChange={e => setDevopsExpiresAt(e.target.value)}
                            disabled={!canEdit}
                            onFocus={() => setFocusedInput('azure_devops')}
                            onBlur={() => setFocusedInput(null)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: focusedInput === 'azure_devops' ? '1px solid #ca8a04' : '1px solid var(--glass-border)',
                              borderRadius: '10px',
                              color: 'var(--text-primary)',
                              fontSize: '0.88rem',
                              outline: 'none',
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              colorScheme: 'dark',
                              boxShadow: focusedInput === 'azure_devops' ? '0 0 12px rgba(202, 138, 4, 0.25), inset 0 1px 2px rgba(0,0,0,0.4)' : 'inset 0 1px 2px rgba(0,0,0,0.4)',
                              transition: 'all 0.2s ease-in-out',
                            }} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '2px 0' }}>
                          <a href="https://dev.azure.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#ca8a04', textDecoration: 'underline', fontWeight: 500 }}>
                            Generate new PAT on Azure DevOps ↗
                          </a>
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }}
                          onClick={() => handleSaveCredential('azure_devops', { pat: devopsPat }, 'Azure DevOps Pipeline PAT', devopsExpiresAt)}
                          disabled={!canEdit || savingCredentials === 'azure_devops' || !devopsPat || devopsPat === '••••••••••••••••••••' || (!!decryptedDevopsPat && devopsPat === decryptedDevopsPat)}
                        >
                          {savingCredentials === 'azure_devops' ? 'Saving...' : 'Save'}
                        </button>

                        {credentialStatus.azure_devops && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                            <button 
                              type="button"
                              className="btn-secondary"
                              style={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px',
                                padding: '8px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.02)',
                                color: 'var(--text-primary)',
                                cursor: testingCredential === 'azure_devops' ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => handleValidateCredential('azure_devops')}
                              disabled={testingCredential === 'azure_devops'}
                            >
                              {testingCredential === 'azure_devops' ? (
                                <>
                                  <Loader size={12} className="spin-anim" />
                                  <span>Testing Connection...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={12} />
                                  <span>Test Connection</span>
                                </>
                              )}
                            </button>
                            {validationResult.azure_devops && (
                              <div style={{ 
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                fontSize: '0.75rem',
                                border: `1px solid ${validationResult.azure_devops.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                backgroundColor: validationResult.azure_devops.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                                color: validationResult.azure_devops.success ? 'var(--success)' : 'var(--error)',
                                lineHeight: '1.4'
                              }}>
                                {validationResult.azure_devops.success ? '🟢 ' : '🔴 '}
                                {validationResult.azure_devops.message}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </SectionBlock>

                    <SectionBlock
                      title="Azure Service Principal Credentials"
                      subtitle="Powers direct Azure resource metrics collection & container logs."
                      accent="#ca8a04"
                      status={credentialStatus.azure}
                      revealShown={showAzureClientSecret && (azureClientId !== '' || azureClientSecret !== '' || azureTenantId !== '')}
                      onReveal={() => {
                        if ((azureClientId !== '' || azureClientSecret !== '' || azureTenantId !== '') && showAzureClientSecret) {
                          setAzureClientId('••••••••••••••••••••');
                          setAzureClientSecret('••••••••••••••••••••');
                          setAzureTenantId('••••••••••••••••••••');
                          setShowAzureClientId(false);
                          setShowAzureClientSecret(false);
                          setShowAzureTenantId(false);
                        } else {
                          handleLoadSavedCredential('azure');
                        }
                      }}
                      disabledReveal={!canEdit}
                    >
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <div>
                          <FieldLabel>Azure Tenant ID</FieldLabel>
                          <PasswordInput
                            value={azureTenantId} onChange={setAzureTenantId}
                            show={showAzureTenantId} onToggle={() => setShowAzureTenantId(!showAzureTenantId)}
                            placeholder="Tenant ID Guid" disabled={!canEdit}
                          />
                        </div>
                        <div>
                          <FieldLabel>Azure Client ID</FieldLabel>
                          <PasswordInput
                            value={azureClientId} onChange={setAzureClientId}
                            show={showAzureClientId} onToggle={() => setShowAzureClientId(!showAzureClientId)}
                            placeholder="App Registration Client ID Guid" disabled={!canEdit}
                          />
                        </div>
                        <div>
                          <FieldLabel>Azure Client Secret</FieldLabel>
                          <PasswordInput
                            value={azureClientSecret} onChange={setAzureClientSecret}
                            show={showAzureClientSecret} onToggle={() => setShowAzureClientSecret(!showAzureClientSecret)}
                            placeholder="Client Secret password value" disabled={!canEdit}
                          />
                        </div>
                        <div>
                          <FieldLabel>Client Secret Expiration Date (Optional)</FieldLabel>
                          <input 
                            type="date" 
                            value={azureExpiresAt} 
                            onChange={e => setAzureExpiresAt(e.target.value)}
                            disabled={!canEdit}
                            onFocus={() => setFocusedInput('azure')}
                            onBlur={() => setFocusedInput(null)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: focusedInput === 'azure' ? '1px solid #ca8a04' : '1px solid var(--glass-border)',
                              borderRadius: '10px',
                              color: 'var(--text-primary)',
                              fontSize: '0.88rem',
                              outline: 'none',
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              colorScheme: 'dark',
                              boxShadow: focusedInput === 'azure' ? '0 0 12px rgba(202, 138, 4, 0.25), inset 0 1px 2px rgba(0,0,0,0.4)' : 'inset 0 1px 2px rgba(0,0,0,0.4)',
                              transition: 'all 0.2s ease-in-out',
                            }} 
                          />
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }}
                          onClick={() => handleSaveCredential('azure', { clientId: azureClientId, clientSecret: azureClientSecret, tenantId: azureTenantId }, 'Azure Service Principal', azureExpiresAt)}
                          disabled={
                            !canEdit || 
                            savingCredentials === 'azure' || 
                            !azureClientId || !azureClientSecret || !azureTenantId || 
                            azureClientId === '••••••••••••••••••••' || 
                            azureClientSecret === '••••••••••••••••••••' || 
                            azureTenantId === '••••••••••••••••••••' || 
                            (!!decryptedAzureClientId && 
                              azureClientId === decryptedAzureClientId && 
                              azureClientSecret === decryptedAzureClientSecret && 
                              azureTenantId === decryptedAzureTenantId)
                          }
                        >
                          {savingCredentials === 'azure' ? 'Saving...' : 'Save Azure Credentials'}
                        </button>

                        {canEdit && credentialStatus.azure && (
                          <button
                            type="button"
                            onClick={handleRotateAzureSecret}
                            disabled={rotatingSecret}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                              color: '#a78bfa',
                              fontWeight: 600,
                              cursor: rotatingSecret ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 0 15px rgba(139, 92, 246, 0.1)',
                              transition: 'all 0.25s'
                            }}
                          >
                            {rotatingSecret ? (
                              <><Loader size={14} className="spin-anim" /> Rotating Secret...</>
                            ) : (
                              <><RefreshCw size={14} /> Auto-Rotate Client Secret (via Graph API)</>
                            )}
                          </button>
                        )}

                        {canEdit && handleDiscoverAzureEnvCredentials && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: 'rgba(255,255,255,0.02)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                            onClick={handleDiscoverAzureEnvCredentials}
                          >
                            <RefreshCw size={12} />
                            <span>Auto-Discover Credentials</span>
                          </button>
                        )}

                        {credentialStatus.azure && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                            <button 
                              type="button"
                              className="btn-secondary"
                              style={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px',
                                padding: '8px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.02)',
                                color: 'var(--text-primary)',
                                cursor: testingCredential === 'azure' ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => handleValidateCredential('azure')}
                              disabled={testingCredential === 'azure'}
                            >
                              {testingCredential === 'azure' ? (
                                <>
                                  <Loader size={12} className="spin-anim" />
                                  <span>Testing Connection...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={12} />
                                  <span>Test Connection</span>
                                </>
                              )}
                            </button>
                            {validationResult.azure && (
                              <div style={{ 
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                fontSize: '0.75rem',
                                border: `1px solid ${validationResult.azure.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                backgroundColor: validationResult.azure.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                                color: validationResult.azure.success ? 'var(--success)' : 'var(--error)',
                                lineHeight: '1.4'
                              }}>
                                {validationResult.azure.success ? '🟢 ' : '🔴 '}
                                {validationResult.azure.message}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </SectionBlock>
                  </div>
                )}

                {azureSubTab === 'scope' && (
                  <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
                      {/* Azure Infrastructure */}
                      <SectionBlock title="Infrastructure" subtitle="Azure subscription, resource group, and container registry." accent="#ca8a04">
                        <div style={{ display: 'grid', gap: '14px' }}>
                          <div>
                            <FieldLabel>Azure Subscription ID</FieldLabel>
                            <input type="text" value={azureSubscriptionId} onChange={e => setAzureSubscriptionId(e.target.value)}
                              placeholder="a812e8e3-34f9-4773-82ee-6398869533b0" required disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>Target Resource Group</FieldLabel>
                            <input type="text" value={azureResourceGroup} onChange={e => setAzureResourceGroup(e.target.value)}
                              placeholder="Estevia-Prod-RG" required disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>Azure Container Registry (ACR)</FieldLabel>
                            <input type="text" list="acr-list" value={azureContainerRegistry}
                              onChange={e => setAzureContainerRegistry(e.target.value)}
                              placeholder="esteviacoreregistry.azurecr.io" disabled={!canEdit} />
                            {(containerRegistries?.length ?? 0) > 0 && (
                              <datalist id="acr-list">
                                {containerRegistries.map((cr: any) => <option key={cr.id} value={cr.loginServer}>{cr.name}</option>)}
                              </datalist>
                            )}
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Optional. Auto-falls back to <code>esteviacoreregistry.azurecr.io</code>.
                            </p>
                          </div>
                        </div>
                      </SectionBlock>

                      {/* Managed Environments */}
                      <SectionBlock title="Managed Environments" subtitle="Container App Managed Environments for Dev and Prod targets." accent="#ca8a04">
                        <div style={{ display: 'grid', gap: '14px' }}>
                          <div>
                            <FieldLabel>Dev Managed Environment ID</FieldLabel>
                            <input type="text" value={devManagedEnvId} onChange={e => setDevManagedEnvId(e.target.value)}
                              placeholder="/subscriptions/.../managedEnvironments/dev-env" disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>Prod Managed Environment ID</FieldLabel>
                            <input type="text" value={prodManagedEnvId} onChange={e => setProdManagedEnvId(e.target.value)}
                              placeholder="/subscriptions/.../managedEnvironments/prod-env" disabled={!canEdit} />
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={handleDiscoverAzureResources}
                              disabled={discoveringInfra}
                              className="btn-primary"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                marginTop: '6px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              {discoveringInfra ? (
                                <>
                                  <Loader size={14} className="spin-anim" />
                                  <span>Auto-discovering...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={14} />
                                  <span>Auto-Discover Infrastructure</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </SectionBlock>
                    </div>

                    {loadingMetadata && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                        ⟳ Loading Azure metadata for autocomplete suggestions…
                      </p>
                    )}

                    {settingsMsg && (
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem',
                        color: settingsMsg.type === 'success' ? 'var(--success)' : settingsMsg.type === 'warning' ? 'var(--warning)' : 'var(--error)',
                        background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                      }}>
                        {settingsMsg.text}
                      </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={!canEdit || savingSettings} style={{ width: '100%' }}>
                      {savingSettings ? 'Saving Azure Settings...' : 'Save Azure Settings'}
                    </button>
                  </form>
                )}

                {azureSubTab === 'pipelines' && (
                  <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
                      {/* Azure DevOps Pipeline */}
                      <SectionBlock title="DevOps Pipeline Config" subtitle="Org URL, project name, variable group, and service connections." accent="#ca8a04">
                        <div style={{ display: 'grid', gap: '14px' }}>
                          <div>
                            <FieldLabel>Azure DevOps Org URL</FieldLabel>
                            <input type="text" value={azureDevopsOrgUrl} onChange={e => setAzureDevopsOrgUrl(e.target.value)}
                              placeholder="https://dev.azure.com/esteviatech" required disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>Azure DevOps Project Name</FieldLabel>
                            <input type="text" value={azureDevopsProject} onChange={e => setAzureDevopsProject(e.target.value)}
                              placeholder="Estevia-Platform" required disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>Pipeline Variable Group</FieldLabel>
                            <input type="text" value={pipelineVariableGroup} onChange={e => setPipelineVariableGroup(e.target.value)}
                              placeholder="estevia-frontend-vars" required disabled={!canEdit} />
                          </div>
                        </div>
                      </SectionBlock>

                      {/* Database Hostnames */}
                      <SectionBlock title="Database Hostnames" subtitle="Configure hostname values resolved dynamically per environment." accent="#ca8a04">
                        <div style={{ display: 'grid', gap: '14px' }}>
                          <div>
                            <FieldLabel>Dev Database Host</FieldLabel>
                            <input type="text" value={devDbHost} onChange={e => setDevDbHost(e.target.value)}
                              placeholder="estevia-dev-db.mysql.database.azure.com" disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>QA Database Host</FieldLabel>
                            <input type="text" value={qaDbHost} onChange={e => setQaDbHost(e.target.value)}
                              placeholder="estevia-qa-db.mysql.database.azure.com" disabled={!canEdit} />
                          </div>
                          <div>
                            <FieldLabel>Prod Database Host</FieldLabel>
                            <input type="text" value={prodDbHost} onChange={e => setProdDbHost(e.target.value)}
                              placeholder="estevia-prod-db.mysql.database.azure.com" disabled={!canEdit} />
                          </div>
                        </div>
                      </SectionBlock>
                    </div>

                    {loadingMetadata && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                        ⟳ Loading Azure metadata for autocomplete suggestions…
                      </p>
                    )}

                    {settingsMsg && (
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem',
                        color: settingsMsg.type === 'success' ? 'var(--success)' : settingsMsg.type === 'warning' ? 'var(--warning)' : 'var(--error)',
                        background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                      }}>
                        {settingsMsg.text}
                      </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={!canEdit || savingSettings} style={{ width: '100%' }}>
                      {savingSettings ? 'Saving Azure Settings...' : 'Save Azure Settings'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── VAULT & LOGS TAB ── */}
            {activeTab === 'keyvault' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
                  <SectionBlock
                    title="Azure Key Vault Secret Mappings"
                    subtitle="Sync target secret keys directly from Azure Key Vault into pipeline variable groups."
                    accent="#ca8a04"
                  >
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                      <FieldLabel>Azure Key Vault URL</FieldLabel>
                      <form onSubmit={handleSaveSettings} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="text" value={azureKeyVaultUrl} onChange={e => setAzureKeyVaultUrl(e.target.value)}
                          placeholder="https://myvault.vault.azure.net" style={{ flex: 1, margin: 0 }} disabled={!canEdit} />
                        <button type="submit" className="btn-primary" disabled={!canEdit || savingSettings} style={{ margin: 0, padding: '0 16px', height: '38px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                          {savingSettings ? 'Saving...' : 'Save URL'}
                        </button>
                      </form>
                    </div>
                    <KeyVaultConfigurator API_BASE={API_BASE} theme={theme} canEdit={canEdit} />
                  </SectionBlock>

                  <SectionBlock
                    title="Log Analytics Workspace (Observability Logs)"
                    subtitle="Azure Monitor Log Analytics integration is dynamically resolved to query console logs with historical lookbacks."
                    accent="#ca8a04"
                  >
                    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div>
                          <FieldLabel>Dev/QA Workspace Customer ID</FieldLabel>
                          <input 
                            type="text" 
                            value={logAnalyticsWorkspaceId} 
                            onChange={e => setLogAnalyticsWorkspaceId(e.target.value)}
                            placeholder="e.g. 4d206fea-dfe9-4a16-894b-a34adf280a9c" 
                            disabled={!canEdit} 
                            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div>
                          <FieldLabel>Production Workspace Customer ID</FieldLabel>
                          <input 
                            type="text" 
                            value={prodLogAnalyticsWorkspaceId} 
                            onChange={e => setProdLogAnalyticsWorkspaceId(e.target.value)}
                            placeholder="e.g. b1c34476-04fb-42bc-92ab-690795084602" 
                            disabled={!canEdit} 
                            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem' }}
                          />
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--glass-border)',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Integration Status</span>
                          {logAnalyticsWorkspaceId || prodLogAnalyticsWorkspaceId ? (
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success-glow)' }}></span>
                              Connected & Active
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span>
                              Pending Discovery
                            </span>
                          )}
                        </div>

                        {canEdit && (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={handleDiscoverWorkspace}
                              disabled={discoveringWorkspace}
                              className="btn-primary"
                              style={{
                                height: '36px',
                                padding: '0 14px',
                                fontSize: '0.76rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                margin: 0
                              }}
                            >
                              {discoveringWorkspace ? (
                                <>
                                  <Loader size={13} className="spin-anim" />
                                  Discovering…
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={13} />
                                  Discover
                                </>
                              )}
                            </button>
                            <button
                              type="submit"
                              className="btn-primary"
                              disabled={savingSettings}
                              style={{
                                height: '36px',
                                padding: '0 14px',
                                fontSize: '0.76rem',
                                margin: 0
                              }}
                            >
                              {savingSettings ? 'Saving...' : 'Save Settings'}
                            </button>
                          </div>
                        )}
                      </div>

                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        ✓ EvaOps (CloudOps Management & Governance) integrates with multiple Log Analytics Workspaces. Applications are dynamically routed based on environment tags (**Dev/QA** vs **Production**).
                      </p>
                    </form>
                  </SectionBlock>
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(234, 179, 8, 0.04)',
                  border: '1px solid rgba(234, 179, 8, 0.1)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                }}>
                  <strong style={{ color: '#ca8a04', display: 'block', marginBottom: '4px' }}>💡 Key Vault Mapping &amp; Secrets Sync Engine</strong>
                  The Key Vault configuration integrates directly with your Azure Key Vault instances to fetch secrets, connection strings, and certificates securely at deployment time. By defining mapped secrets, the synchronization engine dynamically injects target credentials into your Azure DevOps pipeline variable groups on-demand. This pattern ensures zero raw secrets are ever hardcoded in source repositories, exposed in console output logs, or saved in plain text within database schemas, maintaining compliance with modern ISO/IEC 27001 and SOC 2 security standards.
                </div>
              </div>
            )}

            {/* ── MICROSOFT TEAMS TAB ── */}
            {activeTab === 'teams' && (
              <TeamsConfigPanel
                teamsWebhookUrl={teamsWebhookUrl}
                setTeamsWebhookUrl={setTeamsWebhookUrl}
                teamsWebhookToken={teamsWebhookToken}
                handleSaveSettings={handleSaveSettings}
                savingSettings={savingSettings}
                settingsMsg={settingsMsg}
                canEdit={canEdit}
                API_BASE={API_BASE}
              />
            )}
          </div>

          {/* Horizontal Vault & System Info Footer */}
          <div className="glass-panel" style={{
            marginTop: 'auto',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.015)',
            borderColor: 'rgba(234, 179, 8, 0.15)',
            borderRadius: '12px',
            boxShadow: 'inset 0 0 12px rgba(234,179,8,0.01)',
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={15} style={{ color: '#ca8a04' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Vault &amp; System Status:</span>
                </div>
                
                {/* Security standard */}
                <div style={{ fontSize: '0.76rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Security Standard</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                    AES-256-GCM Encrypted
                  </span>
                </div>

                {/* Access scope */}
                <div style={{ fontSize: '0.76rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Access Scope</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Role: {currentUser?.role?.toUpperCase() || 'VIEWER'}</span>
                </div>

                {/* Dynamic Decryption */}
                <div style={{ fontSize: '0.76rem', maxWidth: '220px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Decryption Scope</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', lineHeight: '1.2' }}>Processed client-side on demand.</span>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ── Teams Configuration Panel ── */
interface TeamsConfigPanelProps {
  teamsWebhookUrl: string;
  setTeamsWebhookUrl: (v: string) => void;
  teamsWebhookToken: string;
  handleSaveSettings: (e: React.FormEvent) => void;
  savingSettings: boolean;
  settingsMsg: { type: 'success' | 'error' | 'warning'; text: string } | null;
  canEdit: boolean;
  API_BASE: string;
}

const TeamsConfigPanel: React.FC<TeamsConfigPanelProps> = ({
  teamsWebhookUrl, setTeamsWebhookUrl,
  teamsWebhookToken,
  handleSaveSettings, savingSettings, settingsMsg,
  canEdit, API_BASE
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg]       = useState('');
  const [copied, setCopied]         = useState(false);

  const [settingUpWebhook, setSettingUpWebhook] = useState(false);
  const [webhookSetupMsg, setWebhookSetupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const receiverUrl = teamsWebhookToken
    ? `${window.location.origin.replace(':5173', ':5005')}/api/webhooks/azure-devops/${teamsWebhookToken}`
    : 'Save settings first to generate your unique endpoint URL.';

  const handleCopyUrl = () => {
    if (!teamsWebhookToken) return;
    navigator.clipboard.writeText(receiverUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTestConnection = async () => {
    if (!teamsWebhookUrl) {
      setTestStatus('error');
      setTestMsg('Please enter a Teams webhook URL first.');
      return;
    }
    setTestStatus('loading');
    setTestMsg('');
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE}/apps/test-teams-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ webhookUrl: teamsWebhookUrl })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus('success');
        setTestMsg('✅ Test notification delivered to Microsoft Teams successfully!');
      } else {
        setTestStatus('error');
        setTestMsg(`❌ ${data.message || 'Test failed.'}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMsg(`❌ Network error: ${err.message}`);
    }
  };

  const handleSetupServiceHook = async () => {
    if (!teamsWebhookToken) return;
    setSettingUpWebhook(true);
    setWebhookSetupMsg(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_BASE}/apps/setup-teams-service-hook`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ receiverUrl })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookSetupMsg({ type: 'success', text: `✅ ${data.message}` });
      } else {
        setWebhookSetupMsg({ type: 'error', text: `❌ ${data.message || 'Setup failed.'}` });
      }
    } catch (err: any) {
      setWebhookSetupMsg({ type: 'error', text: `❌ Network error: ${err.message}` });
    } finally {
      setSettingUpWebhook(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '0.85rem', padding: '10px 14px',
    borderRadius: '8px', border: '1px solid var(--glass-border)',
    background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)',
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <SectionBlock
          title="Microsoft Teams Webhook"
          subtitle="Configure an Incoming Webhook to receive real-time DevOps lifecycle alerts in a Teams channel."
          accent="#6264a7"
        >
          {/* Teams Webhook URL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Incoming Webhook URL
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                id="teams-webhook-url"
                type="url"
                placeholder="https://*.webhook.office.com/webhookb2/..."
                value={teamsWebhookUrl}
                onChange={e => setTeamsWebhookUrl(e.target.value)}
                disabled={!canEdit}
                style={inputStyle}
              />
              <button
                id="teams-test-connection"
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'loading' || !canEdit}
                style={{
                  padding: '10px 18px', borderRadius: '8px', whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #6264a7 0%, #464775 100%)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: testStatus === 'loading' ? 0.7 : 1
                }}
              >
                {testStatus === 'loading'
                  ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Testing…</>
                  : testStatus === 'success'
                  ? <><CheckCircle size={13} /> Connected</>
                  : 'Test Connection'}
              </button>
            </div>
            {testMsg && (
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: testStatus === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                {testMsg}
              </p>
            )}
          </div>

          {/* Notification Events info */}
          <div style={{
            padding: '12px 16px', borderRadius: '8px',
            background: 'rgba(98,100,167,0.08)', border: '1px solid rgba(98,100,167,0.2)',
            fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.7'
          }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>📬 Automated Notification Events</strong>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              <li>✅ <strong>CI/CD Builds</strong> — Azure DevOps build success &amp; failure alerts</li>
              <li>💤 <strong>Sleep Scheduler</strong> — Container scale-down / scale-up transitions</li>
              <li>🗄️ <strong>DB Migrations</strong> — Schema execution completion with backup details</li>
              <li>🔄 <strong>Environment Clones</strong> — Clone completion with source/target details</li>
              <li>🔒 <strong>Role Changes</strong> — User authorization updates with actor info</li>
            </ul>
          </div>
        </SectionBlock>

        {/* Azure DevOps Receiver Endpoint */}
        <SectionBlock
          title="Azure DevOps Webhook Receiver"
          subtitle="Paste this unique URL into your Azure DevOps Project → Service Hooks to receive build completion alerts."
          accent="#6264a7"
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Your Organization Receiver Endpoint
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                id="teams-receiver-url"
                type="text"
                readOnly
                value={receiverUrl}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.78rem', cursor: 'text', opacity: 0.85 }}
              />
              <button
                id="teams-copy-receiver-url"
                type="button"
                onClick={handleCopyUrl}
                disabled={!teamsWebhookToken}
                title="Copy to clipboard"
                style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: copied ? 'rgba(54,166,79,0.15)' : 'rgba(98,100,167,0.15)',
                  border: `1px solid ${copied ? '#36a64f55' : '#6264a755'}`,
                  color: copied ? '#36a64f' : '#6264a7',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                }}
              >
                {copied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              In Azure DevOps: <strong>Project Settings → Service Hooks → + Create Subscription → Web Hooks → Build completed</strong>
            </p>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={handleSetupServiceHook}
                disabled={settingUpWebhook || !teamsWebhookToken || !canEdit}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '36px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '6px'
                }}
              >
                {settingUpWebhook ? (
                  <>
                    <Loader size={13} className="spin-anim" />
                    Automating DevOps Service Hook Setup...
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    Setup Service Hook Automatically
                  </>
                )}
              </button>
              {webhookSetupMsg && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: webhookSetupMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  background: webhookSetupMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${webhookSetupMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
                }}>
                  {webhookSetupMsg.text}
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: '18px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(98, 100, 167, 0.04)',
            border: '1px solid rgba(98, 100, 167, 0.1)',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.45',
          }}>
            <strong style={{ color: '#6264a7', display: 'block', marginBottom: '4px' }}>💡 Service Hook Receiver Info</strong>
            The automated setup registers a "Build Completed" service hook subscription in Azure DevOps using your decrypted Azure PAT. When a pipeline finishes execution, Azure DevOps triggers a payload delivery to this secure receiver URL, which the platform processes to push status notifications directly into your Teams channel.
          </div>
        </SectionBlock>
      </div>

      {/* Save button */}
      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            id="teams-save-settings"
            type="button"
            onClick={(e) => handleSaveSettings(e as any)}
            disabled={savingSettings}
            className="btn-primary"
            style={{ padding: '12px 28px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {savingSettings ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}

      {settingsMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', fontSize: '0.84rem',
          background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${settingsMsg.type === 'success' ? 'rgba(34,197,94,0.25)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: settingsMsg.type === 'success' ? 'var(--success)' : settingsMsg.type === 'warning' ? 'var(--warning)' : 'var(--danger)',
          marginTop: '10px'
        }}>
          {settingsMsg.text}
        </div>
      )}
    </div>
  );
};
