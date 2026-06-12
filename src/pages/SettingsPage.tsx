import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsPageProps {
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

export const SettingsPage: React.FC<SettingsPageProps> = ({
  azureSubscriptionId,
  setAzureSubscriptionId,
  azureResourceGroup,
  setAzureResourceGroup,
  defaultDnsDomain,
  setDefaultDnsDomain,
  azureDevopsOrgUrl,
  setAzureDevopsOrgUrl,
  azureDevopsProject,
  setAzureDevopsProject,
  pipelineVariableGroup,
  setPipelineVariableGroup,
  githubOwner,
  setGithubOwner,
  azureContainerRegistry,
  setAzureContainerRegistry,
  azureDevopsServiceConnection,
  setAzureDevopsServiceConnection,
  dockerRegistryServiceConnection,
  setDockerRegistryServiceConnection,
  savingSettings,
  settingsMsg,
  handleSaveSettings,
  containerRegistries,
  serviceConnections,
  loadingMetadata
}) => {
  return (
    <div className="glass-panel" style={{ padding: '32px', height: '100%' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Settings style={{ color: 'var(--accent-teal)' }} />
        Organization Settings
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
        Infrastructure config, DNS domain, DevOps settings, Container Registry, and GitHub owner mapping.
      </p>

      {settingsMsg && (
        <div className="glass-panel" style={{ 
          padding: '12px', 
          borderColor: settingsMsg.type === 'success' ? 'var(--success)' : 'var(--error)', 
          backgroundColor: settingsMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: 'var(--text-primary)', 
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          {settingsMsg.text}
        </div>
      )}

      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Subscription ID</label>
            <input 
              type="text" 
              value={azureSubscriptionId} 
              onChange={(e) => setAzureSubscriptionId(e.target.value)} 
              placeholder="a812e8e3-34f9-4773-82ee-6398869533b0"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Target Resource Group</label>
            <input 
              type="text" 
              value={azureResourceGroup} 
              onChange={(e) => setAzureResourceGroup(e.target.value)} 
              placeholder="Estevia-Prod-RG"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Default DNS Domain</label>
            <input 
              type="text" 
              value={defaultDnsDomain} 
              onChange={(e) => setDefaultDnsDomain(e.target.value)} 
              placeholder="esteviatech.com"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Org URL</label>
            <input 
              type="text" 
              value={azureDevopsOrgUrl} 
              onChange={(e) => setAzureDevopsOrgUrl(e.target.value)} 
              placeholder="https://dev.azure.com/esteviatech"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Project Name</label>
            <input 
              type="text" 
              value={azureDevopsProject} 
              onChange={(e) => setAzureDevopsProject(e.target.value)} 
              placeholder="Estevia-Platform"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Pipeline Variable Group</label>
            <input 
              type="text" 
              value={pipelineVariableGroup} 
              onChange={(e) => setPipelineVariableGroup(e.target.value)} 
              placeholder="estevia-frontend-vars"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Owner/Org</label>
            <input 
              type="text" 
              value={githubOwner} 
              onChange={(e) => setGithubOwner(e.target.value)} 
              placeholder="Estevia-TechSolutions"
              required 
            />
          </div>

          {/* New Container settings */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Container Registry (ACR)</label>
            <input 
              type="text" 
              list="acr-list"
              value={azureContainerRegistry} 
              onChange={(e) => setAzureContainerRegistry(e.target.value)} 
              placeholder="esteviacoreregistry.azurecr.io"
            />
            {containerRegistries.length > 0 && (
              <datalist id="acr-list">
                {containerRegistries.map((cr: any) => (
                  <option key={cr.id} value={cr.loginServer}>{cr.name}</option>
                ))}
              </datalist>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps RM Service Connection</label>
            <input 
              type="text" 
              list="arm-sc-list"
              value={azureDevopsServiceConnection} 
              onChange={(e) => setAzureDevopsServiceConnection(e.target.value)} 
              placeholder="protrack-azure-sc"
            />
            {serviceConnections.arm && serviceConnections.arm.length > 0 && (
              <datalist id="arm-sc-list">
                {serviceConnections.arm.map((conn: any) => (
                  <option key={conn.id} value={conn.name}>{conn.name}</option>
                ))}
              </datalist>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Docker Registry Service Connection</label>
            <input 
              type="text" 
              list="docker-sc-list"
              value={dockerRegistryServiceConnection} 
              onChange={(e) => setDockerRegistryServiceConnection(e.target.value)} 
              placeholder="estevia-acr-sc"
            />
            {serviceConnections.docker && serviceConnections.docker.length > 0 && (
              <datalist id="docker-sc-list">
                {serviceConnections.docker.map((conn: any) => (
                  <option key={conn.id} value={conn.name}>{conn.name}</option>
                ))}
              </datalist>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={savingSettings}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {savingSettings ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
