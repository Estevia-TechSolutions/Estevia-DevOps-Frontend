import React, { useState } from 'react';
import { Database, Eye, EyeOff, GitBranch, Settings, Globe, Cloud, AlertTriangle } from 'lucide-react';

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
}

type CredTab = 'github' | 'godaddy' | 'azure';

const TABS: { id: CredTab; label: string; icon: React.ReactNode; accentVar: string }[] = [
  { id: 'github',  label: 'GitHub',  icon: <GitBranch size={15} />, accentVar: '#ca8a04' },
  { id: 'godaddy', label: 'GoDaddy', icon: <Globe size={15} />,     accentVar: '#ca8a04' },
  { id: 'azure',   label: 'Azure',   icon: <Cloud size={15} />,     accentVar: '#ca8a04' },
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
    {children}
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
}) => {
  const [activeTab, setActiveTab] = useState<CredTab>('github');

  const accent = TABS.find(t => t.id === activeTab)?.accentVar ?? 'var(--accent-teal)';

  const canEdit = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  return (
    <div className="glass-panel creds-amber" style={{
      padding: '32px', height: '100%',
      background: 'linear-gradient(150deg, rgba(234, 179, 8, 0.08) 0%, rgba(161, 120, 0, 0.12) 55%, rgba(120, 80, 0, 0.16) 100%)',
      borderColor: 'rgba(234, 179, 8, 0.18)',
      boxShadow: '0 0 40px rgba(234,179,8,0.05), inset 0 0 20px rgba(234,179,8,0.03)',
      position: 'relative', overflow: 'hidden',
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

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px',
        border: '1px solid var(--glass-border)',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const keyMap: Record<string, string> = { github: 'github', godaddy: 'godaddy', azure: 'azure_devops' };
          const configured = credentialStatus[keyMap[tab.id]];
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? tab.accentVar : 'var(--text-secondary)',
              background: isActive ? `color-mix(in srgb, ${tab.accentVar} 12%, transparent)` : 'transparent',
              boxShadow: isActive ? `0 0 0 1px ${tab.accentVar}55` : 'none',
              transition: 'all 0.2s ease',
            }}>
              {tab.icon}
              {tab.label}
              {/* credential status dot */}
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                background: configured ? 'var(--success)' : 'rgba(239,68,68,0.6)',
              }} />
            </button>
          );
        })}
      </div>

      {/* ── GITHUB TAB ── */}
      {activeTab === 'github' && (
        <div style={{ display: 'grid', gap: '20px' }}>

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
        <div style={{ display: 'grid', gap: '20px' }}>

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
        <div style={{ display: 'grid', gap: '20px' }}>

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

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gap: '20px' }}>

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
            </div>
          </form>

        </div>
      )}

    </div>
  );
};
