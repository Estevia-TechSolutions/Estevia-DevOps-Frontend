import React, { useState } from 'react';
import { Database, Eye, EyeOff, GitBranch, Settings, Globe, Cloud, AlertTriangle, MessageSquare, Copy, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { KeyVaultConfigurator } from '../components/credentials/KeyVaultConfigurator';

interface CredentialsPageProps {
  currentUser?: { role: string; name?: string; email?: string } | null;
  // Credentials
  githubToken: string;
  setGithubToken: (val: string) => void;
  showGithubToken: boolean;
  setShowGithubToken: (val: boolean) => void;
  decryptedGithubToken: string;
  credentialStatus: Record<string, boolean>;
  savingCredentials: string | null;
  credMsg: { type: 'success' | 'error'; text: string } | null;
  handleLoadSavedCredential: (type: 'github' | 'godaddy' | 'azure_devops') => void;
  handleSaveCredential: (type: string, data: any, label: string) => void;

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
  savingSettings: boolean;
  settingsMsg: { type: 'success' | 'error'; text: string } | null;
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
}

type CredTab = 'github' | 'godaddy' | 'azure' | 'keyvault' | 'teams';

const TABS: { id: CredTab; label: string; icon: React.ReactNode; accentVar: string }[] = [
  { id: 'github',   label: 'GitHub',       icon: <GitBranch size={15} />,    accentVar: '#ca8a04' },
  { id: 'godaddy',  label: 'GoDaddy',      icon: <Globe size={15} />,        accentVar: '#ca8a04' },
  { id: 'azure',    label: 'Azure',        icon: <Cloud size={15} />,        accentVar: '#ca8a04' },
  { id: 'keyvault', label: 'Vault & Logs', icon: <Database size={15} />,     accentVar: '#ca8a04' },
  { id: 'teams',    label: 'MS Teams',     icon: <MessageSquare size={15} />, accentVar: '#6264a7' },
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
  azureDevopsServiceConnection, setAzureDevopsServiceConnection,
  dockerRegistryServiceConnection, setDockerRegistryServiceConnection,
  savingSettings, settingsMsg, handleSaveSettings,
  containerRegistries, serviceConnections, loadingMetadata,
  currentUser,
  API_BASE,
  theme,
  teamsWebhookUrl, setTeamsWebhookUrl,
  teamsWebhookToken,
  logAnalyticsWorkspaceId, setLogAnalyticsWorkspaceId,
}) => {
  const [activeTab, setActiveTab] = useState<CredTab>('github');
  const [discoveringWorkspace, setDiscoveringWorkspace] = useState(false);

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
        setLogAnalyticsWorkspaceId(data.workspaceId);
        alert('Successfully discovered and linked Log Analytics Workspace ID: ' + data.workspaceId);
      } else {
        alert('Discovery failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error during workspace discovery: ' + err.message);
    } finally {
      setDiscoveringWorkspace(false);
    }
  };

  const accent = TABS.find(t => t.id === activeTab)?.accentVar ?? 'var(--accent-teal)';

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
        
        {/* Left Column - Vertical Navigation & Vault Summary */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
          {/* Vertical Tab Bar */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '6px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '6px',
            border: '1px solid var(--glass-border)',
          }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const keyMap: Record<string, string> = { github: 'github', godaddy: 'godaddy', azure: 'azure_devops' };
              const configured = tab.id === 'keyvault' ? true : credentialStatus[keyMap[tab.id]];
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px',
                  padding: '11px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: isActive ? 600 : 400,
                  color: isActive ? tab.accentVar : 'var(--text-secondary)',
                  background: isActive ? `color-mix(in srgb, ${tab.accentVar} 12%, transparent)` : 'transparent',
                  boxShadow: isActive ? `0 0 0 1px ${tab.accentVar}55` : 'none',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: isActive ? tab.accentVar : 'var(--text-muted)' }}>
                    {tab.icon}
                  </span>
                  <span style={{ flex: 1 }}>{tab.label}</span>
                  {/* credential status dot */}
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                    background: configured ? 'var(--success)' : 'rgba(239,68,68,0.6)',
                  }} />
                </button>
              );
            })}
          </div>

          {/* Vault & System Info */}
          <div className="glass-panel" style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.01)',
            borderColor: 'rgba(234, 179, 8, 0.15)',
            borderRadius: '12px',
            fontSize: '0.8rem',
            boxShadow: 'inset 0 0 12px rgba(234,179,8,0.01)',
          }}>
            <h5 style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#ca8a04', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14} />
              Vault &amp; System Info
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Security Standard</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                  AES-256-GCM Encrypted
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Access Scope</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Role: {currentUser?.role?.toUpperCase() || 'VIEWER'}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Dynamic Decryption</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.45', fontSize: '0.76rem' }}>
                  Restricted by RBAC settings. Decryption keys are loaded on demand and never cached.
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Integration Health</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { name: 'GitHub', ok: credentialStatus.github },
                    { name: 'GoDaddy', ok: credentialStatus.godaddy },
                    { name: 'Azure DevOps', ok: credentialStatus.azure_devops },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: item.ok ? 'var(--success)' : '#f59e0b',
                        background: item.ok ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}>
                        {item.ok ? 'Configured' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tab Contents */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '8px' }}>
          
          {/* ── GITHUB TAB ── */}
          {activeTab === 'github' && (
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
                  <button className="btn-primary" style={{ width: '100%' }}
                    onClick={() => handleSaveCredential('github', { token: githubToken }, 'GitHub Platform Token')}
                    disabled={!canEdit || savingCredentials === 'github' || !githubToken || githubToken === '••••••••••••••••••••' || (!!decryptedGithubToken && githubToken === decryptedGithubToken)}
                  >
                    {savingCredentials === 'github' ? 'Saving...' : 'Save'}
                  </button>
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
                        color: settingsMsg.type === 'success' ? 'var(--success)' : 'var(--error)',
                        background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
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
          )}

          {/* ── GODADDY TAB ── */}
          {activeTab === 'godaddy' && (
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
                <button className="btn-primary" style={{ width: '100%' }}
                  onClick={() => handleSaveCredential('godaddy', { apiKey: godaddyKey, apiSecret: godaddySecret }, 'GoDaddy Domain API Keys')}
                  disabled={!canEdit || savingCredentials === 'godaddy' || !godaddyKey || !godaddySecret || godaddyKey === '••••••••••••••••••••' || godaddySecret === '••••••••••••••••••••' || (!!decryptedGodaddyKey && godaddyKey === decryptedGodaddyKey && godaddySecret === decryptedGodaddySecret)}
                >
                  {savingCredentials === 'godaddy' ? 'Saving GoDaddy API Keys...' : 'Save GoDaddy Keys'}
                </button>
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
                        color: settingsMsg.type === 'success' ? 'var(--success)' : 'var(--error)',
                        background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
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
          )}

          {/* ── AZURE TAB ── */}
          {activeTab === 'azure' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <button className="btn-primary" style={{ width: '100%' }}
                      onClick={() => handleSaveCredential('azure_devops', { pat: devopsPat }, 'Azure DevOps Pipeline PAT')}
                      disabled={!canEdit || savingCredentials === 'azure_devops' || !devopsPat || devopsPat === '••••••••••••••••••••' || (!!decryptedDevopsPat && devopsPat === decryptedDevopsPat)}
                    >
                      {savingCredentials === 'azure_devops' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </SectionBlock>
              </div>

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
                      </div>
                    </div>
                  </SectionBlock>

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
                      <div>
                        <FieldLabel>Azure RM Service Connection</FieldLabel>
                        <input type="text" list="arm-sc-list" value={azureDevopsServiceConnection}
                          onChange={e => setAzureDevopsServiceConnection(e.target.value)}
                          placeholder="protrack-azure-sc" disabled={!canEdit} />
                        {(serviceConnections?.arm?.length ?? 0) > 0 && (
                          <datalist id="arm-sc-list">
                            {serviceConnections.arm.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </datalist>
                        )}
                      </div>
                      <div>
                        <FieldLabel>Docker Registry Service Connection</FieldLabel>
                        <input type="text" list="docker-sc-list" value={dockerRegistryServiceConnection}
                          onChange={e => setDockerRegistryServiceConnection(e.target.value)}
                          placeholder="estevia-acr-sc" disabled={!canEdit} />
                        {(serviceConnections?.docker?.length ?? 0) > 0 && (
                          <datalist id="docker-sc-list">
                            {serviceConnections.docker.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </datalist>
                        )}
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
                    color: settingsMsg.type === 'success' ? 'var(--success)' : 'var(--error)',
                    background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  }}>
                    {settingsMsg.text}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={!canEdit || savingSettings} style={{ width: '100%' }}>
                  {savingSettings ? 'Saving Azure Settings...' : 'Save Azure Settings'}
                </button>
              </form>
            </div>
          )}

          {/* ── VAULT & LOGS TAB ── */}
          {activeTab === 'keyvault' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
              <SectionBlock
                title="Azure Key Vault Secret Mappings"
                subtitle="Sync target secret keys directly from Azure Key Vault into pipeline variable groups."
                accent="#ca8a04"
              >
                <KeyVaultConfigurator API_BASE={API_BASE} theme={theme} canEdit={canEdit} />
              </SectionBlock>

              <SectionBlock
                title="Log Analytics Workspace (Observability Logs)"
                subtitle="Azure Monitor Log Analytics integration is dynamically resolved to query console logs with historical lookbacks."
                accent="#ca8a04"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      {logAnalyticsWorkspaceId ? (
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success-glow)' }}></span>
                          Auto-Discovered & Active
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span>
                          Pending Discovery
                        </span>
                      )}
                    </div>

                    {logAnalyticsWorkspaceId && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', minWidth: '220px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Workspace Customer ID</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{logAnalyticsWorkspaceId}</span>
                      </div>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={handleDiscoverWorkspace}
                        disabled={discoveringWorkspace}
                        className="btn-primary"
                        style={{
                          height: '32px',
                          padding: '0 16px',
                          fontSize: '0.78rem',
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
                            {logAnalyticsWorkspaceId ? 'Force Sync' : 'Discover Now'}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {logAnalyticsWorkspaceId ? (
                      <>
                        ✓ EvaOps successfully scanned the Azure Container Apps environment in Resource Group <strong>{azureResourceGroup || 'Estevia-Prod-RG'}</strong> and auto-linked this workspace. Console logs are queryable via KQL in the Container Logs drawer.
                      </>
                    ) : (
                      <>
                        ⚠️ No workspace discovered yet. Ensure your subscription credentials and Resource Group are configured under the <strong>Azure</strong> tab. Once valid, EvaOps will auto-discover the linked workspace.
                      </>
                    )}
                  </p>
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ── MICROSOFT TEAMS TAB ── */}
          {activeTab === 'teams' && (
            <TeamsConfigPanel
              teamsWebhookUrl={teamsWebhookUrl}
              setTeamsWebhookUrl={setTeamsWebhookUrl}
              teamsWebhookToken={teamsWebhookToken}
              logAnalyticsWorkspaceId={logAnalyticsWorkspaceId}
              setLogAnalyticsWorkspaceId={setLogAnalyticsWorkspaceId}
              handleSaveSettings={handleSaveSettings}
              savingSettings={savingSettings}
              settingsMsg={settingsMsg}
              canEdit={canEdit}
              API_BASE={API_BASE}
            />
          )}

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
  logAnalyticsWorkspaceId: string;
  setLogAnalyticsWorkspaceId: (v: string) => void;
  handleSaveSettings: (e: React.FormEvent) => void;
  savingSettings: boolean;
  settingsMsg: { type: 'success' | 'error'; text: string } | null;
  canEdit: boolean;
  API_BASE: string;
}

const TeamsConfigPanel: React.FC<TeamsConfigPanelProps> = ({
  teamsWebhookUrl, setTeamsWebhookUrl,
  teamsWebhookToken,
  logAnalyticsWorkspaceId, setLogAnalyticsWorkspaceId,
  handleSaveSettings, savingSettings, settingsMsg,
  canEdit, API_BASE
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg]       = useState('');
  const [copied, setCopied]         = useState(false);

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
          background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${settingsMsg.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: settingsMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          marginTop: '10px'
        }}>
          {settingsMsg.text}
        </div>
      )}
    </div>
  );
};
