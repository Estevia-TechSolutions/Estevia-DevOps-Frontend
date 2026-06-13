import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  Server, 
  Globe, 
  GitBranch, 
  Terminal, 
  ArrowRight,
  Info,
  Lock,
  Key
} from 'lucide-react';

interface GuidePageProps {
  theme?: 'dark' | 'light';
}

export const GuidePage: React.FC<GuidePageProps> = () => {
  return (
    <div style={{ animation: 'fade-in-anim 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Header */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.07), rgba(59, 130, 246, 0.07))',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px var(--accent-blue-glow)',
          flexShrink: 0
        }}>
          <BookOpen size={28} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>EvaOps Platform User Guide</h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Welcome to the step-by-step documentation. Discover how to orchestrate environments, provision cloud microservices, configure DNS routing, and set up automated CI/CD pipelines in minutes.
          </p>
        </div>
      </div>

      {/* Main Core Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Hand Column: Step-by-Step Workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-purple)' }} />
            Step-by-Step Operational Workflow
          </h3>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                border: '1px solid var(--badge-border)',
                color: 'var(--accent-purple)',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Link Credentials
                  <ShieldCheck size={14} style={{ color: 'var(--warning)', opacity: 0.8 }} />
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Navigate to the <strong>Credentials</strong> tab. Add your GitHub PAT (Personal Access Token), Azure DevOps PAT, GoDaddy API Key/Secret, and Azure Subscription details. Click <strong>Save Credentials</strong>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                border: '1px solid var(--badge-border)',
                color: 'var(--accent-purple)',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Scan Active Cloud
                  <Server size={14} style={{ color: 'var(--accent-purple)', opacity: 0.8 }} />
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  On the <strong>Cloud Resource Scanning</strong> tab, click <strong>Scan Active Cloud</strong>. This crawls your Azure resources to auto-discover active Static Web Apps (SWA) and Container Apps (ACA), rendering them as environment cards.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                border: '1px solid var(--badge-border)',
                color: 'var(--accent-purple)',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Configure DNS Custom Domains
                  <Globe size={14} style={{ color: 'var(--accent-blue)', opacity: 0.8 }} />
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  On any environment card, click the <strong>DNS</strong> button. Enter your target subdomain (e.g. <code>dev-api</code>) and choose your domain name. Click <strong>Link Custom Domain</strong>. This automatically updates GoDaddy records and binds the domain in Azure.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                border: '1px solid var(--badge-border)',
                color: 'var(--accent-purple)',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                4
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Configure CI/CD Pipelines
                  <GitBranch size={14} style={{ color: 'var(--accent-teal)', opacity: 0.8 }} />
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  If a card says <em>Pipeline: Not Set</em>, click <strong>Setup CI/CD</strong>. Verify your repository settings, review and edit the generated <code>azure-pipelines.yml</code> file, and click <strong>Commit & Create Pipeline</strong>. The system will automatically build, link, and sync your secrets.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Hand Column: Capabilities and Boundaries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section: What it can do */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              Capabilities ("What it can do")
            </h3>
            
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <ArrowRight size={14} style={{ color: 'var(--accent-teal)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Auto-Discovery Crawling</strong>: Scans Azure Resource Groups dynamically to identify active Static Web Apps (SWA) and Container Apps (ACA).</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <ArrowRight size={14} style={{ color: 'var(--accent-teal)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Automated DNS Provisioning</strong>: Updates GoDaddy DNS CNAME records and configures TLS/SSL domain bindings on Azure in a single click.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <ArrowRight size={14} style={{ color: 'var(--accent-teal)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Git & DevOps Synchronizer</strong>: Automatically generates and commits <code>azure-pipelines.yml</code> configuration templates directly to target GitHub branches.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <ArrowRight size={14} style={{ color: 'var(--accent-teal)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Automated Token Injection</strong>: Retrieves Static Web App deployment secrets and syncs them automatically to Azure DevOps variable groups.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <ArrowRight size={14} style={{ color: 'var(--accent-teal)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Live Build Telemetry</strong>: Visualizes pipeline run stages, durations, and job step execution logs in real-time on your dashboard.</span>
              </div>
            </div>
          </div>

          {/* Section: What it cannot do */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
              <XCircle size={18} style={{ color: 'var(--error)' }} />
              System Boundaries ("What it cannot do")
            </h3>
            
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <XCircle size={14} style={{ color: 'var(--error)', opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Custom Repo Infrastructure (IaC)</strong>: The platform does not generate custom terraform or ARM/Bicep templates for arbitrary Azure resources.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <XCircle size={14} style={{ color: 'var(--error)', opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                <span><strong>GitHub Repo Policies</strong>: Branch protections, branch merges, pull request rules, or user access management must be configured directly on GitHub.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <XCircle size={14} style={{ color: 'var(--error)', opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Service Connection Setup</strong>: Azure DevOps service connections (e.g. ARM service principals) must be pre-configured manually in Azure DevOps project settings.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <XCircle size={14} style={{ color: 'var(--error)', opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Bypass DNS Delays</strong>: Changes to DNS CNAME records rely on GoDaddy's API and global DNS TTL propagation, which can take up to 2-10 minutes.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <XCircle size={14} style={{ color: 'var(--error)', opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Full Stdout Log Streaming</strong>: Displays high-level execution steps, names, start times, durations, and results. Does not stream full raw script console outputs.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Scope Matrix and FAQ Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Security & Credentials Scope Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
            <Lock size={18} style={{ color: 'var(--accent-purple)' }} />
            Security & Credential Scopes Matrix
          </h3>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              EvaOps interacts with third-party providers using secure token parameters. Below is the minimum scope matrix required for full integration functionality:
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Provider</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Required Token / Key</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Minimum Scopes / Roles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 500, color: 'var(--text-primary)' }}>GitHub</td>
                    <td style={{ padding: '10px 4px' }}>Personal Access Token (PAT)</td>
                    <td style={{ padding: '10px 4px' }}><code>repo</code> (Full repository access), <code>admin:repo_hook</code></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 500, color: 'var(--text-primary)' }}>Azure DevOps</td>
                    <td style={{ padding: '10px 4px' }}>Personal Access Token (PAT)</td>
                    <td style={{ padding: '10px 4px' }}><code>Build (Read & Write)</code>, <code>Variable Groups (Read, Write & Manage)</code>, <code>Service Connections (Read & Write)</code></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 500, color: 'var(--text-primary)' }}>Azure Cloud</td>
                    <td style={{ padding: '10px 4px' }}>Active Directory Service Principal</td>
                    <td style={{ padding: '10px 4px' }}><code>Contributor</code> or <code>Owner</code> on target Resource Group / Subscription</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 4px', fontWeight: 500, color: 'var(--text-primary)' }}>GoDaddy</td>
                    <td style={{ padding: '10px 4px' }}>Developer API Key & Secret</td>
                    <td style={{ padding: '10px 4px' }}><code>Production</code> credentials environment (OTE environments are not supported)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.15)'
            }}>
              <Key size={16} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong>Zero Plaintext Storage:</strong> All access tokens are encrypted in transit via TLS 1.3 and stored locally inside your browser's secure cache or backend environment storage using AES-256 encryption.
              </span>
            </div>
          </div>
        </div>

        {/* FAQ & Troubleshooting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-purple)' }} />
            Common FAQ & Troubleshooting
          </h3>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Q: Why does my DNS custom domain say "Verification Failed" in Azure?
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong>A:</strong> DNS propagation is not instantaneous. After EvaOps updates the GoDaddy records, it can take 2-5 minutes for Azure to query and verify the new CNAME mapping globally. Wait a few moments, scan again, and click bind.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '14px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Q: How are static web app deployment tokens synced?
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong>A:</strong> SWA tokens are fetched securely from Azure Resource Manager using your Azure Service Principal credentials, and injected directly into the designated Azure DevOps Variable Group. This completely automates pipeline configuration.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '14px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Q: Can I customize the azure-pipelines.yml file?
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong>A:</strong> Yes! Step 2 of the "Setup CI/CD" wizard opens an interactive editor showing the auto-generated YAML code. You can make adjustments, change triggers, or add custom stages before committing it.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '14px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Q: What if scanning does not show my newly provisioned apps?
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong>A:</strong> Make sure you have linked the correct Azure Subscription and Resource Group credentials. Newly provisioned apps can also take 30-60 seconds to populate inside Azure's resource catalog API.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Info Alert Box */}
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <Info size={20} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Need Help?</strong> If you encounter integration errors or credentials validation issues, check that your tokens are not expired. GitHub tokens need <code>repo</code> write scopes, and Azure DevOps PATs require <code>Read & Write</code> scopes for Build, Variables, and Service Connections.
        </div>
      </div>
      
    </div>
  );
};
