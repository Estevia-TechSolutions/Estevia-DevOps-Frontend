import React, { useState, useMemo } from 'react';
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
  FileCode,
  MessageSquare,
  Bell,
  Search,
  Database,
  Activity,
  PlusCircle,
  Compass
} from 'lucide-react';

interface GuidePageProps {
  theme?: 'dark' | 'light';
}

type TabType = 'getting-started' | 'capabilities' | 'branch-matching' | 'security' | 'entra-manual' | 'azure-devops-cicd' | 'github-actions-cicd' | 'validation-sanity' | 'faq' | 'roadmap' | 'eva-ai';

export const GuidePage: React.FC<GuidePageProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<TabType>('getting-started');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [scopeQuery, setScopeQuery] = useState('');
  const [activeScopeCategory, setActiveScopeCategory] = useState<'all' | 'provisioning' | 'observability' | 'operations' | 'database' | 'security' | 'notifications_cost'>('all');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scopeData = useMemo(() => {
    return [
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: true,
        title: 'AKS Cluster Auto-Discovery & Scan',
        text: 'Discovers active Azure Kubernetes Service (AKS) clusters inside resource groups. Validates node pools, system namespaces, ingress configuration, and bootstrap states.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: true,
        title: 'Auto-Discovery Crawling',
        text: 'Queries Azure APIs to find all active Static Web Apps and Container Apps.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: true,
        title: 'Automated DNS Provisioning',
        text: 'Updates GoDaddy DNS records and completes domain SSL verification.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: true,
        title: 'Git Pipeline Seeding',
        text: 'Generates and commits custom azure-pipelines.yml or GitHub Actions deploy.yml configurations directly to GitHub.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: true,
        title: 'Secret Sync Automation',
        text: 'Pulls deployment tokens from Azure and configures Azure DevOps variable groups.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: false,
        title: 'Base Infrastructure',
        text: 'Does NOT create Resource Groups, Virtual Networks (VNets), VPNs, or VPN Gateways. These must exist beforehand.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: false,
        title: 'Custom IaC Templates',
        text: 'Does NOT generate general Terraform or ARM/Bicep templates for resources outside SWAs/Container Apps.'
      },
      {
        category: 'provisioning',
        categoryLabel: 'Provisioning',
        isCapability: false,
        title: 'MySQL Server Hosting',
        text: 'Does NOT provision MySQL Flexible Server instances. An active database host must already exist.'
      },

      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'Build Telemetry Dashboard',
        text: 'Tracks pipeline run stages, durations, and results in real time with a collapsible visualizer.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'Live Log Tailing & Metrics',
        text: 'Tails Container App console logs in real time and streams actual CPU/Memory metrics polled directly from Azure Monitor.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'Active Telemetry Polling',
        text: 'Background polling updates active builds and stage status tree dynamically every 5 seconds.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'Interactive Log Proxy',
        text: 'Streams raw console logs from Azure DevOps pipelines directly into a terminal overlay.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'System Events Stream',
        text: 'Tracks and displays a dynamic log of recent operations, migration histories, and system status logs.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'Monospace Log Downloads',
        text: 'Allows downloading of raw, monospaced application and pipeline logs directly from the UI drawer.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: true,
        title: 'Multi-Workspace Log Analytics Segregation',
        text: 'Separates and routes queries dynamically for Dev/QA and Production resources into their respective Log Analytics Workspace Customer IDs based on app tags.'
      },
      {
        category: 'observability',
        categoryLabel: 'Observability & Telemetry',
        isCapability: false,
        title: 'Log Storage & Retention',
        text: 'Does NOT configure Log Analytics diagnostic settings. These must be pre-set in Azure Portal for ACA log routing.'
      },

      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'Search & Tag Filter Bar',
        text: 'Allows real-time searching and filtering of apps and resources by tags, status, type, and name.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'Floating Notification Toasts',
        text: 'Streams real-time toast alerts for background tasks, operation statuses, and webhook integrations.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'Blue-Green Revision Control',
        text: 'Provides visual traffic splitting controls across revisions of active Container Apps.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'VM Power Controls',
        text: 'Directly initiates start, stop, and restart controls on target cloud VMs with safety confirmation alerts.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'Glassmorphic Power Confirmations',
        text: 'Prompts users with confirmation modals before starting, stopping, or restarting resources.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'Categorized Resource Grouping',
        text: 'Groups Azure resources by SWA, ACA, and VM with collapse/expand accordions and count badges.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: true,
        title: 'Granular Network Severity Badges',
        text: 'Maps app network checks into separate statuses: Verified (Green), Critical/Unresolved (Red), Mismatch (Amber), and Info/Static SWA (Blue) depending on severity.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: false,
        title: 'Webhook Delivery Guarantees',
        text: 'Teams MessageCards are best-effort HTTP POSTs. No retry queue or dead-letter mechanism is implemented.'
      },
      {
        category: 'operations',
        categoryLabel: 'Operations & Control',
        isCapability: false,
        title: 'DNS Propagation',
        text: 'Subject to GoDaddy API and global DNS TTL replication delays, typically 2–10 minutes.'
      },

      {
        category: 'database',
        categoryLabel: 'Database Hub',
        isCapability: true,
        title: 'DB Schema Compare & Wizard',
        text: 'Analyzes differences between MySQL structures and executes migration scripts via a step-by-step wizard.'
      },
      {
        category: 'database',
        categoryLabel: 'Database Hub',
        isCapability: true,
        title: 'ERD Database Visualizer',
        text: 'Queries schema relationships to draw dynamic visual Entity-Relationship diagrams.'
      },
      {
        category: 'database',
        categoryLabel: 'Database Hub',
        isCapability: false,
        title: 'Non-MySQL Databases',
        text: 'The Database Hub exclusively supports MySQL. PostgreSQL, MSSQL, Cosmos DB, and other engines are not supported.'
      },
      {
        category: 'database',
        categoryLabel: 'Database Hub',
        isCapability: false,
        title: 'Data Migrations',
        text: 'Executes DDL schema SQL only. DML operations (row inserts, updates, deletes) must be run outside the platform.'
      },

      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: true,
        title: 'Key Vault Secrets Mapping',
        text: 'Syncs Azure Key Vault configurations directly to Azure DevOps Variable Groups.'
      },
      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: true,
        title: 'Enterprise Audit Trail Logs',
        text: 'Maintains tamper-proof activity logs tracking SQL queries, domain bindings, and pipeline creation.'
      },
      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: true,
        title: 'Outbound Credentials Connection Check',
        text: 'Validates outbound API endpoints and credentials connectivity on GitHub, Azure DevOps, and GoDaddy in real time.'
      },
      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: true,
        title: 'Azure Credentials Auto-Save Vaulting',
        text: 'Auto-discovers and immediately encrypts and saves Azure Service Principal or Managed Identity settings from the host environment to the secure integrations database.'
      },
      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: false,
        title: 'Directory User Creation',
        text: 'Does NOT write users to Microsoft Entra ID. It only syncs existing directory members and assigns platform roles.'
      },
      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: false,
        title: 'Repository Policies',
        text: 'PR merge rules, branch protection, and GitHub team permissions must be configured directly on GitHub.'
      },
      {
        category: 'security',
        categoryLabel: 'Security & Governance',
        isCapability: false,
        title: 'Azure Service Connections',
        text: 'ARM and Docker registry service connections must be pre-registered in Azure DevOps Project Settings.'
      },

      {
        category: 'notifications_cost',
        categoryLabel: 'Notifications & Cost',
        isCapability: true,
        title: 'Cost Sleep Scheduler',
        text: 'Scales container app replicas down to 0 during off-work hours to optimize subscription costs.'
      },
      {
        category: 'notifications_cost',
        categoryLabel: 'Notifications & Cost',
        isCapability: true,
        title: 'Lifecycle Event Alerts',
        text: 'Delivers real-time Microsoft Teams MessageCard notifications for CI/CD builds, sleep scheduler transitions, DB migrations, environment clones, and role changes.'
      },
      {
        category: 'notifications_cost',
        categoryLabel: 'Notifications & Cost',
        isCapability: true,
        title: 'Azure DevOps Webhook Receiver',
        text: 'A unique per-org endpoint receives Azure DevOps Service Hook payloads and routes formatted alerts to Teams channels.'
      },
      {
        category: 'notifications_cost',
        categoryLabel: 'Notifications & Cost',
        isCapability: true,
        title: 'Historical Log Lookbacks',
        text: 'Queries Azure Log Analytics in real time for ACA console logs with selectable time ranges: Live (5m), 1h, 12h, 24h.'
      },
      {
        category: 'notifications_cost',
        categoryLabel: 'Notifications & Cost',
        isCapability: false,
        title: 'Horizontal Auto-scaling Rules',
        text: 'Does NOT configure Azure auto-scale rules or KEDA trigger definitions. Sleep Scheduler only adjusts replica floor/ceiling.'
      },
      {
        category: 'notifications_cost',
        categoryLabel: 'Notifications & Cost',
        isCapability: false,
        title: 'Cost Forecasting',
        text: 'Budget alerts and cost anomaly detection are advisory only and sourced from Azure Cost Management APIs — no enforcement.'
      }
    ];
  }, []);

  const filteredScope = useMemo(() => {
    return scopeData.filter(item => {
      const matchesCategory = activeScopeCategory === 'all' || item.category === activeScopeCategory;
      const matchesQuery = !scopeQuery || 
        item.title.toLowerCase().includes(scopeQuery.toLowerCase()) || 
        item.text.toLowerCase().includes(scopeQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [scopeData, activeScopeCategory, scopeQuery]);

  const filteredCapabilities = useMemo(() => filteredScope.filter(item => item.isCapability), [filteredScope]);
  const filteredBoundaries = useMemo(() => filteredScope.filter(item => !item.isCapability), [filteredScope]);

  const navItems = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen, desc: 'Operational workflow checklist' },
    { id: 'capabilities', label: 'System Boundaries', icon: Cpu, desc: 'Capabilities & exclusions' },
    { id: 'branch-matching', label: 'Branch Naming Rules', icon: GitBranch, desc: 'Environment matching priorities' },
    { id: 'security', label: 'Security & Scopes', icon: Lock, desc: 'Token permission matrix' },
    { id: 'entra-manual', label: 'Manual Entra ID Setup', icon: Key, desc: 'Manual App Registration guide' },
    { id: 'azure-devops-cicd', label: 'Azure DevOps CI/CD', icon: Globe, desc: 'Azure Pipelines setup & guide' },
    { id: 'github-actions-cicd', label: 'GitHub Actions CI/CD', icon: GitBranch, desc: 'GitHub workflow setup & guide' },
    { id: 'validation-sanity', label: 'Validation & Sanity', icon: ShieldCheck, desc: 'Network, YAML & Docker checks' },
    { id: 'eva-ai', label: 'Eva AI & Analyst', icon: MessageSquare, desc: 'CloudOps virtual assistant guides' },
    { id: 'faq', label: 'FAQs & Troubleshooting', icon: HelpCircle, desc: 'Common queries & issues' },
    { id: 'roadmap', label: 'Platform Roadmap', icon: Compass, desc: 'AWS & Azure future features' }
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
      question: 'Can I customize the CI/CD pipeline configuration file (azure-pipelines.yml or deploy.yml)?',
      answer: 'Yes! Step 2 of the "Setup CI/CD" wizard supports both Azure DevOps Pipelines and GitHub Actions. It opens an interactive editor showing the auto-generated YAML code. You can make adjustments, change triggers, or add custom stages/jobs before committing it directly to your repository.'
    },
    {
      question: 'What if scanning does not show my newly provisioned apps?',
      answer: 'Make sure you have linked the correct Azure Subscription and Resource Group credentials. Newly provisioned apps can also take 30-60 seconds to populate inside Azure\'s resource catalog API.'
    },
    {
      question: 'How do I view live logs for my pipeline build task steps?',
      answer: 'Click the terminal icon on any active build task/step to open a slide-out drawer containing a live-updating console log viewer. The system proxies raw console lines from the Azure DevOps agent directly to the UI.'
    },
    {
      question: 'Why does the platform prompt me before starting, stopping, or restarting resources?',
      answer: 'To prevent accidental downtime in your environments, EvaOps uses glassmorphic confirmation dialogs. You must explicitly confirm power transitions (Start, Stop, Restart) before the action is dispatched to Azure Resource Manager.'
    },
    {
      question: 'How does the live build run updating system work?',
      answer: 'An active telemetry polling worker runs in the background. If there are active pipeline runs, it queries their status every 5 seconds, updating the timeline tree and log viewer in real time without needing a full Cloud Resource Scan.'
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
            EvaOps — CloudOps Management & Governance User Guide
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
                      Navigate to the <strong>Credentials</strong> tab. Link your GitHub PAT (with <code>repo</code> write scope), Azure DevOps PAT (with variable group scopes), GoDaddy API Key & Secret, and Azure Active Directory (Entra ID) Service Principal details. For Azure, you can simply click **Discover** to automatically extract, encrypt, and save your credentials directly from the host environment to the secure integrations database.
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
              {/* Header with Search */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Platform Scope & Exclusions
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Verify automated features and out-of-scope system boundaries.
                  </p>
                </div>
                {/* Clean Search Input */}
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search capabilities & exclusions..."
                    value={scopeQuery}
                    onChange={(e) => setScopeQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      backgroundColor: 'rgba(15, 23, 42, 0.2)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Clean Segmented Category Pill Toggles — icon-only, expand label on hover/active */}
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                  { id: 'all', label: 'All Scopes', icon: Cpu },
                  { id: 'provisioning', label: 'Provisioning', icon: PlusCircle },
                  { id: 'observability', label: 'Observability & Telemetry', icon: Server },
                  { id: 'operations', label: 'Operations & Control', icon: Activity },
                  { id: 'database', label: 'Database Hub', icon: Database },
                  { id: 'security', label: 'Security & Governance', icon: ShieldCheck },
                  { id: 'notifications_cost', label: 'Notifications & Cost', icon: Bell }
                ].map(cat => {
                  const CatIcon = cat.icon;
                  const isActive = activeScopeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveScopeCategory(cat.id as any)}
                      className={`scope-pill ${isActive ? 'active' : ''}`}
                      title={cat.label}
                    >
                      <CatIcon size={13} />
                      <span className="scope-pill-label">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Side-by-Side Scope Content */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Capabilities Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                    Automated Capabilities ({filteredCapabilities.length})
                  </h4>
                  {filteredCapabilities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredCapabilities.map((item, idx) => (
                        <div key={idx} className="scope-card" style={{ borderLeft: '3px solid var(--success)' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem', display: 'block', marginBottom: '4px' }}>
                              {item.title}
                            </strong>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', display: 'block' }}>
                              {item.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', borderRadius: '12px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No matching capabilities found.
                    </div>
                  )}
                </div>

                {/* Boundaries Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={16} style={{ color: 'var(--error)' }} />
                    Out-of-Scope Exclusions ({filteredBoundaries.length})
                  </h4>
                  {filteredBoundaries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredBoundaries.map((item, idx) => (
                        <div key={idx} className="scope-card" style={{ borderLeft: '3px solid var(--error)' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem', display: 'block', marginBottom: '4px' }}>
                              {item.title}
                            </strong>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', display: 'block' }}>
                              {item.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', borderRadius: '12px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No matching exclusions found.
                    </div>
                  )}
                </div>

              </div>

              {/* Teams Setup Info Banner */}
              <div style={{
                display: 'flex', gap: '14px', padding: '18px 20px', borderRadius: '12px',
                background: 'rgba(98,100,167,0.05)', border: '1px solid rgba(98,100,167,0.15)',
                alignItems: 'flex-start', marginTop: '12px'
              }}>
                <MessageSquare size={18} style={{ color: '#6264a7', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px', fontSize: '0.86rem' }}>Setting up Microsoft Teams Notifications</strong>
                  <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    <li>In Microsoft Teams, open the target channel → <strong>⋯ More options → Connectors → Incoming Webhook → Configure</strong>. Copy the generated webhook URL.</li>
                    <li>In EvaOps, go to <strong>Credentials → MS Teams</strong>. Paste the webhook URL and click <strong>Test Connection</strong> to verify delivery.</li>
                    <li>Click <strong>Save Settings</strong>. EvaOps auto-generates a unique per-org <strong>Azure DevOps Receiver Endpoint URL</strong>.</li>
                    <li>In Azure DevOps, go to <strong>Project Settings → Service Hooks → + Create Subscription → Web Hooks → Build completed</strong>. Paste the receiver URL and save.</li>
                    <li>For historical ACA logs, navigate to <strong>Azure Portal → Log Analytics Workspaces → Overview → Workspace ID</strong>. Paste it in the <strong>Log Analytics Workspace</strong> field and save.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: BRANCH MATCHING */}
          {activeSubTab === 'branch-matching' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Dynamic Branch Resolution Rules
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Understand how EvaOps dynamically scans, matches, and resolves repository branch names across environments.
                </p>
              </div>

              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                EvaOps automatically matches repository branches to environment pipelines. The system queries GitHub APIs to fetch all available branches, then resolves the target branch using a priority-based matching candidate list.
              </p>

              {/* Candidates Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                {[
                  {
                    env: 'Development',
                    icon: Cpu,
                    color: 'var(--accent-purple)',
                    candidates: ['dev', 'development', 'dev-main', 'dev-master'],
                    desc: 'Suffixes: -dev, -development'
                  },
                  {
                    env: 'QA & Staging',
                    icon: Server,
                    color: 'var(--accent-teal)',
                    candidates: ['qa', 'test', 'testing', 'staging'],
                    desc: 'Suffixes: -qa, -test, -testing, -staging'
                  },
                  {
                    env: 'Production',
                    icon: ShieldCheck,
                    color: 'var(--success)',
                    candidates: ['main', 'master', 'prod', 'production', 'release'],
                    desc: 'Suffixes: -prod, -production, -release, -main, -master, or bare name'
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div className="glass-panel" key={idx} style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border)',
                      background: 'rgba(255, 255, 255, 0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `rgba(255, 255, 255, 0.03)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.color
                        }}>
                          <Icon size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--text-primary)' }}>{item.env}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.candidates.map((cand, cidx) => (
                          <code key={cidx} style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--glass-border)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.76rem'
                          }}>
                            {cand}
                          </code>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Behavior highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.15)'
                }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem', display: 'block', marginBottom: '4px' }}>
                      Exact Casing Preservation (Git Ref Safety)
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Git reference paths (e.g. <code>refs/heads/...</code>) are case-sensitive. While our candidate matching is case-insensitive (e.g. matching <code>PROD</code> or <code>prod</code>), the resolved branch name preserves the exact casing from the remote Git repository. This avoids checkout errors on case-sensitive build agents.
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.04)',
                  border: '1px solid rgba(59, 130, 246, 0.15)'
                }}>
                  <Info size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem', display: 'block', marginBottom: '4px' }}>
                      Smart Fallback Logic
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      If none of the candidate branches are found in the remote repository, the system falls back to the repository's designated default branch (e.g. <code>main</code> or <code>master</code>). If no default branch is reported, it falls back to the first candidate of that environment category (e.g. <code>dev</code> for dev, <code>qa</code> for QA/Staging, and <code>main</code> for production).
                    </span>
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
                      {
                        provider: 'GitHub',
                        token: 'Personal Access Token (PAT)',
                        scopes: ['repo (Full repository control)', 'admin:repo_hook'],
                        howToGet: "GitHub Settings → Developer Settings → Personal Access Tokens (Classic) → Generate New Token. Select 'repo' and 'admin:repo_hook' scopes."
                      },
                      {
                        provider: 'Azure DevOps',
                        token: 'Personal Access Token (PAT)',
                        scopes: ['Build (Read & Write)', 'Variable Groups (Read/Write/Manage)', 'Service Connections (Read & Write)'],
                        howToGet: "User Settings (Avatar menu) → Personal Access Tokens → New Token. Select 'Build', 'Variable Groups', and 'Service Connections' scopes."
                      },
                      {
                        provider: 'Azure Cloud',
                        token: 'Entra Active Directory Service Principal',
                        scopes: ['Contributor or Owner assigned to target Resource Group / Subscription', 'Managed Identity (Master Org Fallback)'],
                        howToGet: "Azure Portal → Entra ID → App Registrations → New Registration. Generate Client Secret under 'Certificates & secrets', and assign the App ID the 'Contributor' role in target resource groups under IAM. Note: For the master organization, the platform automatically falls back to utilizing the server's Managed Identity (DefaultAzureCredential) if no custom SP is configured."
                      },
                      {
                        provider: 'GoDaddy',
                        token: 'Developer API Key & Secret',
                        scopes: ['Production access environment (OTE sandbox is not supported)'],
                        howToGet: "GoDaddy Developer Portal (developer.godaddy.com) → API Keys → Create New API Key. Choose 'Production' environment."
                      }
                    ].map((row, idx) => (
                      <tr key={idx} style={{
                        borderBottom: idx === 3 ? 'none' : '1px solid var(--divider)',
                        transition: 'background 0.2s',
                        cursor: 'default'
                      }} className="table-row-hover">
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', verticalAlign: 'top' }}>{row.provider}</td>
                        <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                          <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{row.token}</div>
                          {row.howToGet && (
                            <div style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                              marginTop: '6px',
                              lineHeight: '1.4',
                              maxWidth: '350px'
                            }}>
                              <span style={{ fontWeight: 650, color: 'var(--text-secondary)' }}>How to get:</span> {row.howToGet}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
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

          {/* TAB CONTENT: AZURE DEVOPS CI/CD */}
          {activeSubTab === 'azure-devops-cicd' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Azure DevOps CI/CD Integration Guide
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Learn how to configure, automate, and monitor your Azure Pipelines CI/CD workflows inside EvaOps.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} style={{ color: 'var(--accent-purple)' }} />
                    Automated YAML Configuration (azure-pipelines.yml)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    The Setup CI/CD Pipeline wizard generates a multi-stage YAML pipeline file tailor-made to your target application type (Static Web App or Container App) and target environment (dev, qa, prod, etc.). It registers a project variable group containing Azure service connections, environment specific variables, and deployment credentials to execute automated deployments on code changes.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Integration Steps
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    <li>Select <strong>Azure DevOps</strong> in the Pipeline Provider toggle when running the Setup CI/CD modal wizard.</li>
                    <li>Verify the default Azure DevOps Organization and Project parameters loaded from database configurations.</li>
                    <li>Verify or edit the auto-generated YAML deployment configuration file inside the interactive code editor.</li>
                    <li>Click <strong>Commit & Create Pipeline</strong>. The system will commit `azure-pipelines.yml` to your repository, register the pipeline endpoint in Azure DevOps, and establish variables sync.</li>
                  </ol>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Variable Group Syncing
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    When a pipeline is setup, EvaOps automatically compiles required deployment secrets and parameters (like container registry credentials or SWA deployment tokens) and syncs them directly into an Azure DevOps variable group named <code>evaops-secrets-[appname]</code>, keeping credentials out of source code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GITHUB ACTIONS CI/CD */}
          {activeSubTab === 'github-actions-cicd' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  GitHub Actions CI/CD Integration Guide
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Configure GitHub Actions workflows to automate and deploy your applications directly from GitHub repository triggers.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitBranch size={16} style={{ color: 'var(--accent-teal)' }} />
                    Automated Workflow Configuration (.github/workflows/deploy.yml)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    The Setup CI/CD Pipeline wizard generates a `.github/workflows/deploy.yml` deployment script for the target branch of your GitHub repository. It automates container build operations, leverages GitHub runner tasks to compile assets, and triggers Azure CLI commands to deploy directly to Azure Container Apps or Azure Static Web Apps.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Integration Steps
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    <li>Select <strong>GitHub Actions</strong> in the Pipeline Provider toggle inside the Setup CI/CD modal wizard.</li>
                    <li>Verify the branch mapping and the target repository paths before proceeding.</li>
                    <li>Review or edit the auto-generated GitHub Actions YAML deployment workflow template in the interactive code editor.</li>
                    <li>Click <strong>Commit & Create Pipeline</strong>. The system will commit `.github/workflows/deploy.yml` to your repository, register the pipeline reference, and authorize ECR/ACR access permissions.</li>
                  </ol>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Registry Authentication & Access Rights
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    For Azure Container Apps (ACA), deployment requires write and push permissions to ECR/ACR. During the setup process, EvaOps automatically configures registry access controls so that the workflow runner can log in and push Docker images securely using the organization credentials.
                  </p>
                </div>
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

          {activeSubTab === 'eva-ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Eva AI &amp; Eva Analyst Integration Guide
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Detailed operational guide on how the Eva AI and Eva Analyst engines analyze, query, and govern cloud infrastructure.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* How the chat works */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} />
                    Interactive Chat Assistant (Eva Analyst)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    The Eva AI Analyst panel queries dynamic resource metadata (e.g. active application status, configuration parameters, and telemetry metrics) to construct high-context prompts for a central secure LLM endpoint. It evaluates this information against operational standard policies and prints optimized scaling recommendations directly.
                  </p>
                </div>

                {/* Live Data ingestion details */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Server size={16} />
                    Live Cloud Ingestion &amp; Diagnostics
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Eva AI runs cost diagnostics using Month-to-Date usage data retrieved from the <strong>Azure Cost Management APIs</strong>. Telemetry rules continuously analyze resource patterns:
                  </p>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <li><strong>VM Optimization:</strong> Recommends downscaling to B-series classes if standard virtual machine CPU usage averages less than 5% over 14 days (saving up to 50%).</li>
                    <li><strong>Container Replica Schedules:</strong> Audits ingress logs and recommends scaling replica floors to zero during developer off-peak hours when request rates drop to zero.</li>
                    <li><strong>Database Pooling:</strong> Identifies query/connection load spikes on MySQL Flexible databases and automatically recommends proxy connection pooling.</li>
                  </ul>
                </div>

                {/* Local Classifier details */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} />
                    Fail-Safe Local Inference Rules
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    If connection timeouts or network disruptions disconnect the platform from the central LLM engine, a local rule-based parser handles incoming queries. This heuristic engine parses key structural terms (e.g., <em>vm</em>, <em>database</em>, <em>replica</em>) and matches them against active local database resources to immediately generate precise, high-fidelity saving recommendations.
                  </p>
                </div>

                {/* Actionable Remedies details */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    Remediation &amp; Audit Governance
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    When a user clicks **Remediate** on an active suggestion:
                  </p>
                  <ol style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <li>The frontend calls mutating controller actions in the backend node.js API.</li>
                    <li>The backend triggers automated scaling updates, VM schedule rules, or tier demotions on Azure Resource Manager.</li>
                    <li>All actions are tracked securely in the **Enterprise Audit Trail** with distinct action types (`APPLY_REMEDIATION`, `RESOURCE_POWER_CONTROL`) and user identifiers for unified compliance.</li>
                  </ol>
                </div>

              </div>
            </div>
          )}

          {activeSubTab === 'validation-sanity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  System Validation &amp; Sanity Audits
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  EvaOps runs automated, multi-tiered sanity validation routines across your codebase and cloud resource metadata to guarantee deployment integrity.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Network Connectivity Validation */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} />
                    Network Connectivity &amp; DB Binding Validation
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Ensures your web frontend applications can talk to their respective backend API endpoints, and your backend containers have authorized, private database paths.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '4px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>SWA-to-Backend Resolution</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                        Scans repository env files (e.g. <code>.env.production</code>, <code>.env.deployment</code>) for backend URLs. If repo scanning fails, it queries the Azure ARM Static Web App settings for keys like <code>VITE_API_URL</code> or <code>REACT_APP_API_URL</code>.
                      </span>
                    </div>
                    
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>ACA-to-Database Resolution</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                        Checks the codebase and ARM container definitions for <code>DB_HOST</code>. If DB_HOST maps to an ACA secret reference, it queries the Azure Container Apps <code>listSecrets</code> API to decrypt the reference, validating subnet connectivity and virtual network integration.
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      Network Validation Severity Levels:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.74rem', alignItems: 'flex-start' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600, minWidth: '70px' }}>[Critical]</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Deployment is misconfigured or broken. Triggers if <code>DB_HOST</code> environment variables cannot be located in the backend code, or if compute resources have no resolved virtual networks.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.74rem', alignItems: 'flex-start' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 600, minWidth: '70px' }}>[Warning]</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Environment configuration mismatch or network isolation warning. Triggers if a static SWA connects to a backend running in a different environment tag, or if virtual networks are not peered.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.74rem', alignItems: 'flex-start' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600, minWidth: '70px' }}>[Info]</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Informational connection notes. Triggers when static web apps (such as marketing, documentation, or landing pages) purposefully run without any backend API bindings configured.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Pipeline YAML Validation */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#f97316', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitBranch size={16} />
                    Pipeline Configuration &amp; Syntax Checker
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Automatically analyzes pipeline definition files to discover missing parameters or syntax errors before trigger execution.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '4px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Azure Pipelines (YAML)</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                        Validates the existence and structural components of <code>azure-pipelines.yml</code>. Checks for required stages, trigger patterns, system variables, variable groups references, and correct service connection bindings.
                      </span>
                    </div>
                    
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>GitHub Actions (YAML)</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                        Analyzes <code>.github/workflows/deploy.yml</code> syntax, identifying missing target environments, invalid permissions blocks, outdated action dependency versions, and incorrect Azure login action secrets setup.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Dockerfile Sanity Validation */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={16} />
                    Dockerfile Security &amp; Optimization Audits
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Inspects your Docker configurations to identify potential vulnerabilities, build bloat, and port configuration issues.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '4px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Multi-Stage Optimization</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                        Verifies that build tools are separated from the final runtime image layer. Scans for multi-stage builders to minimize container sizes, speeding up deployment times and reducing attack surfaces.
                      </span>
                    </div>
                    
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Security &amp; Port Controls</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                        Audits for security warnings (e.g. running containers as root users). Inspects <code>EXPOSE</code> instructions to verify that target port mapping matches the Container App ingress profile.
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeSubTab === 'roadmap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  EvaOps Unified Cloud Platform Roadmap
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  A detailed view of the upcoming AWS orchestration release cycle and Azure enterprise feature expansions.
                </p>
              </div>

              {/* 2-Column comparison structure */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Column 1: AWS Orchestration Ecosystem */}
                <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(234, 179, 8, 0.08)',
                    border: '1px solid rgba(234, 179, 8, 0.15)',
                    color: '#ca8a04',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    <Compass size={18} />
                    <span>AWS Integration Releases (Q3 / Q4 2026)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* S3 / CloudFront */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        S3 &amp; CloudFront Static Web Hosting
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Automated provisioning of private/public Amazon S3 buckets configured for static website hosting, synced with CloudFront CDN edge caching and ACM certificate generation.
                      </p>
                    </div>

                    {/* AWS Amplify */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        AWS Amplify Hosting
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Native deployment of single-page apps (SPA) and server-side rendered (Next.js/Nuxt SSR) sites with zero-touch preview environments linked directly to GitHub commits.
                      </p>
                    </div>

                    {/* AWS EC2 */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Docker-Based EC2 &amp; Auto-Scaling VM Groups
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Provisioning EC2 VM instances pre-installed with Docker Compose. Supports Launch Templates, Target Groups, Application Load Balancers (ALB), and metrics-based scaling rules.
                      </p>
                    </div>

                    {/* AWS ECS & Fargate */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Amazon ECS &amp; serverless Fargate
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Task Definition orchestration, cluster management, and serverless container app updates. Offers parity with Azure Container Apps provisioning models.
                      </p>
                    </div>

                    {/* Amazon RDS */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Amazon RDS (MySQL / PostgreSQL)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Managed database engines, Multi-AZ high-availability architectures, automated snapshot schedules, and RDS Proxy caching setup.
                      </p>
                    </div>

                    {/* Route 53 & KMS */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Route 53 DNS &amp; KMS Secrets Sync
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Programmatic Route 53 DNS record mapping and SSL validation. Secrets Manager and SSM Parameter Store sync to Azure DevOps variable groups.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Column 2: Azure Feature Expansion */}
                <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    color: 'var(--accent-blue)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    <Cpu size={18} />
                    <span>Azure Enterprise Roadmap (Q1 / Q2 2027)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    


                    {/* Azure APIM */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Azure API Management (APIM)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Publishing API endpoints, mapping custom backend domains, enforcing API policies (rate limiting, auth check), and syncing developer portal specs.
                      </p>
                    </div>

                    {/* Cost Auto-Scale rules */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Cost Auto-Scale Policy Builder
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Configure dynamic scaling profiles to stop VMs or scale ACA replica counts to zero during developer off-peak hours automatically.
                      </p>
                    </div>

                    {/* Multi-Tenant AD */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Multi-Tenant Entra ID support
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Linking and scanning subscriptions belonging to different Entra ID (Azure AD) tenants, switching directories securely inside a single workspace.
                      </p>
                    </div>

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
