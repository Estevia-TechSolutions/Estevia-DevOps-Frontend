import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  Server, 
  Globe, 
  GitBranch, 
  Info, 
  Lock, 
  Key, 
  ChevronDown, 
  ChevronUp,
  Layout,
  Cpu,
  ArrowRight,
  Terminal,
  FileCode
} from 'lucide-react';

interface GuidePageProps {
  theme?: 'dark' | 'light';
}

type TabType = 'getting-started' | 'capabilities' | 'security' | 'entra-manual' | 'faq';

export const GuidePage: React.FC<GuidePageProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<TabType>('getting-started');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const navItems = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen, desc: 'Operational workflow checklist' },
    { id: 'capabilities', label: 'System Boundaries', icon: Cpu, desc: 'Capabilities & exclusions' },
    { id: 'security', label: 'Security & Scopes', icon: Lock, desc: 'Token permission matrix' },
    { id: 'entra-manual', label: 'Manual Entra ID Setup', icon: Key, desc: 'Manual App Registration guide' },
    { id: 'faq', label: 'FAQs & Troubleshooting', icon: HelpCircle, desc: 'Common queries & issues' }
  ];

  const faqData = [
    {
      question: 'Why does my DNS custom domain say "Verification Failed" in Azure?',
      answer: 'DNS propagation is not instantaneous. After EvaOps updates the GoDaddy records, it can take 2-5 minutes for Azure to query and verify the new CNAME mapping globally. Wait a few moments, scan again, and click the Link custom domain button.'
    },
    {
      question: 'How are static web app deployment tokens synced?',
      answer: 'SWA tokens are fetched securely from Azure Resource Manager using your Azure Service Principal credentials, and injected directly into the designated Azure DevOps Variable Group. This completely automates pipeline configuration.'
    },
    {
      question: 'Can I customize the azure-pipelines.yml file?',
      answer: 'Yes! Step 2 of the "Setup CI/CD" wizard opens an interactive editor showing the auto-generated YAML code. You can make adjustments, change triggers, or add custom stages before committing it.'
    },
    {
      question: 'What if scanning does not show my newly provisioned apps?',
      answer: 'Make sure you have linked the correct Azure Subscription and Resource Group credentials. Newly provisioned apps can also take 30-60 seconds to populate inside Azure\'s resource catalog API.'
    }
  ];

  return (
    <div style={{ animation: 'fade-in-anim 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Header */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px var(--accent-blue-glow)',
          flexShrink: 0
        }}>
          <BookOpen size={28} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: '280px', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            EvaOps Platform User Guide
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Welcome to the operational hub. Navigate the sub-tabs below to discover operational workflows, scope boundaries, token permissions, and manual setup guides.
          </p>
        </div>
      </div>

      {/* Interactive Documentation Panel */}
      <div style={{ display: 'flex', gap: '28px', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Left Side: Sub-navigation sidebar */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as TabType)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid var(--badge-border)' : '1px solid transparent',
                  background: isActive ? 'var(--badge-bg)' : 'rgba(255, 255, 255, 0.015)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none'
                }}
                className={`tab-btn-doc-sub ${isActive ? 'active-sub' : ''}`}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                    : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.25s ease',
                  flexShrink: 0
                }}>
                  <IconComponent size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.88rem', 
                    fontWeight: 600, 
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 0.25s ease'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ 
                    fontSize: '0.74rem', 
                    color: 'var(--text-muted)', 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px'
                  }}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Active tab view window */}
        <div className="glass-panel" style={{ 
          flex: 1, 
          minWidth: '320px', 
          padding: '32px', 
          borderRadius: '16px',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          minHeight: '480px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          
          {/* TAB CONTENT: GETTING STARTED */}
          {activeSubTab === 'getting-started' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Step-by-Step Operational Workflow
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Follow this chronological roadmap to configure your DevOps environment integrations.
                </p>
              </div>

              {/* Connected Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--badge-bg)',
                      border: '2px solid var(--accent-purple)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 0 10px var(--accent-purple-glow)'
                    }}>
                      1
                    </div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--divider)', minHeight: '40px', margin: '4px 0' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Link Credentials
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        background: 'rgba(245, 158, 11, 0.1)', 
                        color: 'var(--warning)', 
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        fontWeight: 500
                      }}>Required Setup</span>
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Navigate to the <strong>Credentials</strong> tab. Link your GitHub PAT (with <code>repo</code> write scope), Azure DevOps PAT (with variable group scopes), GoDaddy API Key & Secret, and Azure Active Directory (Entra ID) Service Principal details (Client ID, Client Secret, Tenant ID, and Subscription ID). Save to validate and lock encryption.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--badge-bg)',
                      border: '2px solid var(--accent-blue)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 0 10px var(--accent-blue-glow)'
                    }}>
                      2
                    </div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--divider)', minHeight: '40px', margin: '4px 0' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Scan Active Cloud Resources
                      <Server size={14} style={{ color: 'var(--accent-purple)', opacity: 0.8 }} />
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Go to the <strong>Cloud Resource Scanning</strong> dashboard and click <strong>Scan Active Cloud</strong>. This triggers a query across your Azure Resource Group to discover active Static Web Apps (SWA) and Container Apps (ACA), fetching their active build statuses and DNS bindings dynamically.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--badge-bg)',
                      border: '2px solid var(--accent-teal)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 0 10px var(--accent-teal-glow)'
                    }}>
                      3
                    </div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--divider)', minHeight: '40px', margin: '4px 0' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Configure DNS Custom Domains
                      <Globe size={14} style={{ color: 'var(--accent-blue)', opacity: 0.8 }} />
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      On any scanned resource card, click <strong>DNS</strong>. Enter a target subdomain, choose your GoDaddy domain, and click <strong>Link Custom Domain</strong>. The platform automatically configures GoDaddy DNS CNAME records and binds the domain securely on Azure with automated HTTPS certificates.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--badge-bg)',
                      border: '2px solid var(--success)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)'
                    }}>
                      4
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Set Up CI/CD Pipelines
                      <GitBranch size={14} style={{ color: 'var(--accent-teal)', opacity: 0.8 }} />
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Click <strong>Setup CI/CD</strong> on any environment card. Verify repository settings, customize the YAML code inside the interactive editor, and click <strong>Commit & Create Pipeline</strong>. The system commits the config to your repo and registers the pipeline in Azure DevOps.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB CONTENT: CAPABILITIES */}
          {activeSubTab === 'capabilities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Platform Scope & Exclusions
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Understand what features the platform automates and what boundaries are excluded.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                
                {/* Capabilities Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    Capabilities ("What it does")
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      {
                        category: 'Infrastructure & Provisioning',
                        items: [
                          { title: 'Auto-Discovery Crawling', text: 'Queries Azure APIs to find all active Static Web Apps and Container Apps.' },
                          { title: 'Automated DNS Provisioning', text: 'Updates GoDaddy DNS records and completes domain SSL verification.' },
                          { title: 'Git Pipeline Seeding', text: 'Generates and commits custom azure-pipelines.yml configurations directly to GitHub.' },
                          { title: 'Secret Sync Automation', text: 'Pulls deployment tokens from Azure and configures Azure DevOps variable groups.' }
                        ]
                      },
                      {
                        category: 'Observability & Operations',
                        items: [
                          { title: 'Build Telemetry Dashboard', text: 'Tracks pipeline run stages, durations, and results in real time.' },
                          { title: 'Live Log Tailing & Metrics', text: 'Tails Container App system logs and displays real-time CPU/Memory sparkline charts.' }
                        ]
                      },
                      {
                        category: 'Cost Optimization',
                        items: [
                          { title: 'Cost Sleep Scheduler', text: 'Scales container app replicas down to 0 during off-work hours to optimize subscription costs.' }
                        ]
                      },
                      {
                        category: 'Database Hub',
                        items: [
                          { title: 'DB Schema Compare & Wizard', text: 'Analyzes differences between MySQL structures and executes migration scripts via a step-by-step wizard.' },
                          { title: 'ERD Database Visualizer', text: 'Queries schema relationships to draw dynamic visual Entity-Relationship diagrams.' }
                        ]
                      },
                      {
                        category: 'Security & Governance',
                        items: [
                          { title: 'Key Vault Secrets Mapping', text: 'Syncs Azure Key Vault configurations directly to Azure DevOps Variable Groups.' },
                          { title: 'Enterprise Audit Trail Logs', text: 'Maintains tamper-proof activity logs tracking SQL queries, domain bindings, and pipeline creation.' }
                        ]
                      }
                    ].map((group, gIdx) => (
                      <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ 
                          fontSize: '0.74rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          color: 'var(--accent-teal)', 
                          letterSpacing: '0.04em',
                          borderLeft: '2px solid var(--accent-teal)',
                          paddingLeft: '6px',
                          marginTop: gIdx > 0 ? '8px' : '4px',
                          marginBottom: '2px'
                        }}>
                          {group.category}
                        </div>
                        {group.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', lineHeight: '1.4', paddingLeft: '4px' }}>
                            <ArrowRight size={14} style={{ color: 'var(--accent-teal)', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong>: {item.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boundaries Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
                    <XCircle size={18} style={{ color: 'var(--error)' }} />
                    System Boundaries ("What it cannot do")
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { title: 'Core Infrastructure Creation', text: 'Does NOT create Resource Groups, Virtual Networks (VNets/VPCs), VPNs, or VPN Gateways. These must exist beforehand.' },
                      { title: 'Custom IaC Generation', text: 'Does NOT generate general terraform or ARM/Bicep templates for arbitrary resources.' },
                      { title: 'GitHub Repo Policies', text: 'PR rules, branch protection, or GitHub user access must be configured on GitHub directly.' },
                      { title: 'Service Connection Setup', text: 'ARM Service Principals must be pre-configured inside Azure DevOps project settings.' },
                      { title: 'Bypass DNS Propagation', text: 'Subject to GoDaddy API and global DNS TTL delays, which can take 2-10 minutes.' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', lineHeight: '1.4' }}>
                        <XCircle size={14} style={{ color: 'var(--error)', opacity: 0.8, marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong>: {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB CONTENT: SECURITY */}
          {activeSubTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Security & Token Permission Matrix
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  EvaOps interacts with external APIs using encrypted parameter storage. Ensure your tokens have these minimum scopes.
                </p>
              </div>

              {/* Scopes Table */}
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--divider)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>Provider</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>Token / Key Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>Required Minimum Scopes / Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { provider: 'GitHub', token: 'Personal Access Token (PAT)', scopes: ['repo (Full repository control)', 'admin:repo_hook'] },
                      { provider: 'Azure DevOps', token: 'Personal Access Token (PAT)', scopes: ['Build (Read & Write)', 'Variable Groups (Read/Write/Manage)', 'Service Connections (Read & Write)'] },
                      { provider: 'Azure Cloud', token: 'Entra Active Directory Service Principal', scopes: ['Contributor or Owner assigned to target Resource Group / Subscription'] },
                      { provider: 'GoDaddy', token: 'Developer API Key & Secret', scopes: ['Production access environment (OTE sandbox is not supported)'] }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ 
                        borderBottom: idx === 3 ? 'none' : '1px solid var(--divider)', 
                        transition: 'background 0.2s',
                        cursor: 'default'
                      }} className="table-row-hover">
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.provider}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.token}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {row.scopes.map((scope, sidx) => (
                              <code key={sidx} style={{ 
                                background: 'rgba(255, 255, 255, 0.04)', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                color: 'var(--accent-purple)',
                                fontSize: '0.74rem',
                                width: 'fit-content'
                              }}>{scope}</code>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Encryption Info Box */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.15)'
              }}>
                <Key size={18} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Secure Local Encryption:</strong> All credentials and keys are encrypted in transit using TLS 1.3 and stored inside a protected database storage using AES-256-GCM. We enforce zero plaintext logging for all cloud interaction logs.
                </span>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ENTRA MANUAL */}
          {activeSubTab === 'entra-manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Manual Microsoft Entra ID Integration
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Step-by-step setup to register EvaOps as an App Integration in your Azure tenant manually.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem', lineHeight: '1.6' }}>
                {[
                  { title: 'Open App Registrations', text: 'Sign in to the Azure Portal, search for Microsoft Entra ID, and click App registrations on the left navigation bar.' },
                  { title: 'Register New App', text: 'Select New registration. Name the application (e.g., evaops-integration-sp), choose Single Tenant, leave Redirect URI blank, and click Register.' },
                  { title: 'Record Identifiers', text: 'Copy the Application (client) ID and Directory (tenant) ID displayed in the overview panel. You will need these for the credentials tab.' },
                  { title: 'Generate Client Secret', text: 'Go to Certificates & secrets on the left menu, select New client secret, add a description, select expiry, and copy the secret Value immediately.' },
                  { title: 'Add Directory Reader Permission', text: 'Go to API permissions, click Add a permission, select Microsoft Graph, choose Application permissions, search for User.Read.All, select it, and click Add permissions.' },
                  { title: 'Grant Admin Consent', text: 'Click Grant admin consent for [Your Tenant] next to the add button, and select Yes to authorize the directory sync scope.' },
                  { title: 'Assign Azure Subscription Role', text: 'Navigate to your Subscription or Resource Group, open Access Control (IAM), click Add role assignment, choose Contributor, select Member, search for your Service Principal name, and click Review + Assign.' }
                ].map((step, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '14px', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--badge-bg)',
                      border: '1px solid var(--badge-border)',
                      color: 'var(--accent-purple)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>{step.title}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{step.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: FAQ */}
          {activeSubTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Common FAQs & Troubleshooting
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Click on any question below to expand the answer and review solutions for common sync and DNS issues.
                </p>
              </div>

              {/* Accordion FAQ Component */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqData.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        background: isOpen ? 'rgba(255,255,255,0.015)' : 'transparent',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <button 
                        onClick={() => toggleFaq(idx)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          padding: '18px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{faq.question}</span>
                        {isOpen 
                          ? <ChevronUp size={16} style={{ color: 'var(--accent-purple)', transition: 'transform 0.2s' }} /> 
                          : <ChevronDown size={16} style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s' }} />
                        }
                      </button>
                      
                      <div style={{
                        maxHeight: isOpen ? '300px' : '0px',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s cubic-bezier(0, 1, 0, 1), padding 0.3s ease',
                        padding: isOpen ? '0 20px 20px 20px' : '0 20px',
                        opacity: isOpen ? 1 : 0
                      }}>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.82rem', 
                          color: 'var(--text-secondary)', 
                          lineHeight: '1.6' 
                        }}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Need Help CTA Box */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                alignItems: 'flex-start',
                marginTop: '12px'
              }}>
                <Info size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Encountering verification issues?</strong> Double check that your API keys are not expired. GitHub PATs require <code>repo</code> write, and Azure DevOps PATs require <code>Build</code> and <code>Variable Group</code> scopes.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
      
    </div>
  );
};
