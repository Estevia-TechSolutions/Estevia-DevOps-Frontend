import React from 'react';
import { 
  RefreshCw, 
  Search, 
  AlertCircle, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Trash2, 
  PlusCircle, 
  Server, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Building2,
  Cpu,
  X
} from 'lucide-react';

const Github = ({ size = 12, ...props }: { size?: number; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface AppResource {
  name: string;
  type: 'frontend' | 'backend';
  location: string;
  hostname: string;
  resourceId: string;
  status: string;
  repositoryUrl: string;
  dnsDetails?: {
    subdomain?: string;
    domain?: string;
    fqdn?: string;
    mappedAt?: string;
  };
  pipelineId?: string;
  pipelineName?: string;
  pipelineRun?: {
    id: number;
    name: string;
    state: string;
    result: string;
    webUrl: string;
    startTime?: string | null;
    finishTime?: string | null;
    stages?: {
      id: string;
      name: string;
      displayName: string;
      state: string;
      result: string;
      startTime?: string | null;
      finishTime?: string | null;
      jobs?: {
        id: string;
        name: string;
        displayName: string;
        state: string;
        result: string;
        startTime?: string | null;
        finishTime?: string | null;
        steps?: {
          id: string;
          name: string;
          displayName: string;
          state: string;
          result: string;
          startTime?: string | null;
          finishTime?: string | null;
        }[];
      }[];
    }[];
  } | null;
  branches?: { name: string; protected: boolean }[];
  isTestResource?: boolean;
}

interface AppGroup {
  key: string;
  label: string;
  repoPath: string;
  repoUrl: string;
  type: 'frontend' | 'backend';
  envs: AppResource[];
  pipelineId?: string;
  pipelineName?: string;
  branches?: { name: string; protected: boolean }[];
}

interface DashboardPageProps {
  apps: AppResource[];
  scanning: boolean;
  scanProgress: number;
  scanError: string | null;
  appGroups: AppGroup[];
  collapsedScanGroups: Record<string, boolean>;
  toggleGroupScan: (key: string) => void;
  deletingAppName: string | null;
  handleDeleteApp: (name: string, type: 'frontend' | 'backend') => void;
  openDnsModal: (app: AppResource) => void;
  openPipelineModal: (app: AppResource, group?: AppGroup) => void;
  handleScan: () => void;
  theme: 'dark' | 'light';
  setSelectedStageForJobs: (stage: any) => void;
  azureDevopsOrgUrl?: string;
  azureDevopsProject?: string;
  onDeployBranch: (repoPath: string, branchName: string, type: 'frontend' | 'backend') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  apps,
  scanning,
  scanProgress,
  scanError,
  appGroups,
  collapsedScanGroups,
  toggleGroupScan,
  deletingAppName,
  handleDeleteApp,
  openDnsModal,
  openPipelineModal,
  handleScan,
  theme,
  setSelectedStageForJobs,
  azureDevopsOrgUrl,
  azureDevopsProject,
  onDeployBranch
}) => {

  const [activeStageInfo, setActiveStageInfo] = React.useState<{appName: string, stageId: string} | null>(null);
  const [selectedJobForModal, setSelectedJobForModal] = React.useState<any | null>(null);

  const resolveBranchName = (app: AppResource) => {
    const n = app.name.toLowerCase();
    let targetSimpleName = 'main';
    if (n.includes('-dev') || n.endsWith('-dev') || n.includes('-dev-')) targetSimpleName = 'dev';
    else if (n.includes('-qa') || n.endsWith('-qa') || n.includes('-qa-')) targetSimpleName = 'qa';
    else if (n.includes('-prod') || n.endsWith('-prod') || n.includes('-prod-')) targetSimpleName = 'main';
    
    const match = (app.branches || []).find(b => {
      const bName = b.name.toLowerCase();
      return bName === targetSimpleName || 
             (targetSimpleName === 'main' && bName === 'master') ||
             (targetSimpleName === 'dev' && bName === 'development');
    });
    return match ? match.name : targetSimpleName;
  };

  const isBuildActive = (run: any) => {
    if (!run || !run.state) return false;
    const s = run.state.toLowerCase();
    return s === 'inprogress' || s === 'running' || s === 'canceling' || s === 'cancelling' || s === 'notstarted' || s === 'queued';
  };

  const getBadgeBgColor = (type: string) => {
    const isLight = theme === 'light';
    switch (type.toLowerCase()) {
      case 'frontend':
        return isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.15)';
      case 'backend':
        return isLight ? 'rgba(13, 148, 136, 0.1)' : 'rgba(16, 185, 129, 0.15)';
      default:
        return isLight ? 'rgba(75, 85, 99, 0.08)' : 'rgba(156, 163, 175, 0.1)';
    }
  };

  const getBadgeTextColor = (type: string) => {
    const isLight = theme === 'light';
    switch (type.toLowerCase()) {
      case 'frontend':
        return isLight ? '#2563eb' : '#93c5fd';
      case 'backend':
        return isLight ? '#0d9488' : '#a7f3d0';
      default:
        return isLight ? '#475569' : '#94a3b8';
    }
  };

  const getStageColor = (result: string | null, state: string) => {
    if (state === 'inProgress') return 'var(--accent-purple)';
    if (state === 'waiting') return 'var(--text-secondary)';
    if (result === 'succeeded') return 'var(--success)';
    if (result === 'failed') return 'var(--error)';
    if (result === 'canceled') return '#ef4444';
    if (result === 'skipped') return 'rgba(255,255,255,0.25)';
    return 'var(--text-secondary)';
  };

  const getStageIcon = (result: string | null, state: string) => {
    if (state === 'inProgress') {
      return <RefreshCw size={11} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />;
    }
    if (result === 'succeeded') {
      return <CheckCircle2 size={11} style={{ color: 'var(--success)' }} />;
    }
    if (result === 'failed') {
      return <AlertCircle size={11} style={{ color: 'var(--error)' }} />;
    }
    return <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }} />;
  };

  const ENV_COLORS: Record<string, { color: string; bg: string; border: string; label: string }> = {
    dev:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)',  label: 'DEV'  },
    qa:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  label: 'QA'   },
    prod: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)',  label: 'PROD' },
  };

  const getEnvTag = (name: string): { color: string; bg: string; border: string; label: string } => {
    const n = name.toLowerCase();
    if (n.includes('-dev')) return ENV_COLORS.dev;
    if (n.includes('-qa'))  return ENV_COLORS.qa;
    if (n.includes('-prod')) return ENV_COLORS.prod;
    const noSuffix = !n.endsWith('-dev') && !n.includes('-dev-') &&
                     !n.endsWith('-qa')  && !n.includes('-qa-')  &&
                     !n.endsWith('-prod') && !n.includes('-prod-') &&
                     !n.endsWith('-staging') && !n.endsWith('-test');
    if (noSuffix) return ENV_COLORS.prod;
    return { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'var(--glass-border)', label: 'ENV' };
  };

  const getCardStyles = (name: string, theme: 'dark' | 'light') => {
    const n = name.toLowerCase();
    const isLight = theme === 'light';
    
    if (n.includes('-dev')) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(219, 234, 254, 0.95) 0%, rgba(239, 246, 255, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(96, 165, 250, 0.22) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: isLight ? 'rgba(96, 165, 250, 0.45)' : 'rgba(96, 165, 250, 0.35)',
        color: '#60a5fa'
      };
    }
    if (n.includes('-qa')) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(255, 251, 235, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
        border: isLight ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.35)',
        color: '#f59e0b'
      };
    }
    if (n.includes('-prod')) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.95) 0%, rgba(240, 253, 250, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: isLight ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.35)',
        color: '#34d399'
      };
    }
    const noSuffix = !n.endsWith('-dev') && !n.includes('-dev-') &&
                     !n.endsWith('-qa')  && !n.includes('-qa-')  &&
                     !n.endsWith('-prod') && !n.includes('-prod-') &&
                     !n.endsWith('-staging') && !n.endsWith('-test');
    if (noSuffix) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.95) 0%, rgba(240, 253, 250, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: isLight ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.35)',
        color: '#34d399'
      };
    }
    
    return {
      background: isLight 
        ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.99) 100%)' 
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      border: isLight ? '#e2e8f0' : 'var(--glass-border)',
      color: 'var(--text-secondary)'
    };
  };

  const getUnlinkedCardStyles = (theme: 'dark' | 'light') => {
    const isLight = theme === 'light';
    return {
      background: isLight 
        ? 'linear-gradient(135deg, rgba(254, 226, 226, 0.95) 0%, rgba(254, 242, 242, 0.99) 100%)' 
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.05) 100%)',
      border: isLight ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.35)',
      color: isLight ? '#dc2626' : '#ef4444'
    };
  };

  return (
    <div>
      {scanError && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertCircle style={{ color: 'var(--error)' }} />
          <span>{scanError}</span>
        </div>
      )}

      {(scanning || scanProgress > 0) && apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={48} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
          <div>
            <h3 style={{ margin: 0 }}>Fetching Live Subscriptions... {Math.floor(scanProgress)}%</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>Scanning Static Web Apps and Container Apps in resource group...</p>
          </div>
          <div style={{ width: '100%', maxWidth: '400px', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 10px var(--accent-purple-glow)', transition: 'width 0.15s ease-out', borderRadius: '4px' }} />
          </div>
        </div>
      ) : apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Search size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3>No active resources discovered</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Click the "Scan Active Cloud" button above to query Azure subscription.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {appGroups.map((group) => {
            const accentColor = group.type === 'frontend' ? 'var(--accent-purple)' : 'var(--accent-teal)';
            const accentBg = group.type === 'frontend' ? 'rgba(139,92,246,0.1)' : 'rgba(20,184,166,0.1)';
            const accentGlow = group.type === 'frontend' ? '0 0 10px var(--accent-purple-glow)' : '0 0 10px var(--accent-teal-glow)';

            const isCollapsed = collapsedScanGroups[group.key] !== false;
            const groupHasActiveDeployment = group.envs.some(app => !!(app.pipelineRun && isBuildActive(app.pipelineRun)));

            return (
              <div key={group.key} className="glass-panel" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
                {/* Left accent strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: accentColor, boxShadow: accentGlow }} />

                {/* Group Header */}
                <div 
                  onClick={() => toggleGroupScan(group.key)}
                  style={{ 
                    padding: '20px 24px 14px 28px', 
                    borderBottom: isCollapsed ? 'none' : '1px solid var(--glass-border)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      backgroundColor: accentBg, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}>
                      {group.type === 'frontend' ? <Globe size={16} style={{ color: 'var(--accent-purple)' }} /> : <Cpu size={16} style={{ color: 'var(--accent-teal)' }} />}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        {group.label}
                        <span style={{ 
                          fontSize: '0.62rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.04em',
                          backgroundColor: getBadgeBgColor(group.type),
                          color: getBadgeTextColor(group.type),
                          padding: '2px 8px',
                          borderRadius: '10px',
                          border: '1px solid ' + (group.type === 'frontend' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)')
                        }}>
                          {group.type === 'frontend' ? 'SWA' : 'ACA'}
                        </span>
                      </h3>
                      {group.repoPath && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <GitBranch size={12} />
                          {group.repoPath}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {groupHasActiveDeployment && (
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 700,
                        color: 'var(--accent-purple)', 
                        background: 'rgba(139, 92, 246, 0.12)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        boxShadow: '0 0 8px rgba(139, 92, 246, 0.2)'
                      }}>
                        <RefreshCw size={10} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                        BUILD IN PROGRESS
                      </span>
                    )}

                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {group.envs.length} {group.envs.length === 1 ? 'Environment' : 'Environments'}
                    </span>
                    
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.8, marginRight: '6px' }}>
                      {isCollapsed ? 'Click to expand group' : 'Click to Collapse group'}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => toggleGroupScan(group.key)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Group Environments List */}
                {!isCollapsed && (
                  <div style={{ padding: '8px 16px 20px 28px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.03)' }}>
                    {group.envs.map((item) => {
                      const tag = getEnvTag(item.name);
                      const cardStyle = getCardStyles(item.name, theme);
                      const isOrphaned = item.status?.toLowerCase() === 'stale' || item.status?.toLowerCase() === 'orphaned';
                      
                      return (
                        <div 
                          key={item.name} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            padding: '12px 18px', 
                            borderRadius: '10px', 
                            border: `1px solid ${cardStyle.border}`, 
                            borderLeft: `4px solid ${cardStyle.color}`,
                            background: cardStyle.background,
                            transition: 'all 0.25s ease',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                            {/* Env Tag */}
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: tag.color,
                              background: tag.bg,
                              border: `1px solid ${tag.border}`,
                              width: '46px',
                              height: '22px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              letterSpacing: '0.04em',
                              flexShrink: 0
                            }}>
                              {tag.label}
                            </span>

                            {/* Name & Domain Details */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item.type === 'frontend' ? (
                                  <Globe size={12} style={{ color: 'var(--accent-purple)', opacity: 0.8, flexShrink: 0 }} />
                                ) : (
                                  <Cpu size={12} style={{ color: 'var(--accent-teal)', opacity: 0.8, flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                                {item.isTestResource && (
                                  <span style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: '#94a3b8',
                                    background: 'rgba(148, 163, 184, 0.12)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(148, 163, 184, 0.2)'
                                  }}>
                                    Dev / Test
                                  </span>
                                )}
                                {isOrphaned && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      color: 'var(--error)',
                                      background: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                      Stale / Not In Use
                                    </span>
                                    {(item.type === 'frontend' || item.type === 'backend') && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteApp(item.name, item.type);
                                        }}
                                        disabled={deletingAppName === item.name}
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.15)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          color: 'var(--error)',
                                          borderRadius: '4px',
                                          padding: '2px 8px',
                                          fontSize: '0.65rem',
                                          cursor: 'pointer',
                                          fontWeight: 600,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        {deletingAppName === item.name ? (
                                          <RefreshCw size={10} className="spin-anim" />
                                        ) : (
                                          <Trash2 size={10} />
                                        )}
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              {item.dnsDetails?.fqdn && (
                                <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                  <Globe size={12} style={{ opacity: 0.7, color: 'var(--accent-purple)', flexShrink: 0 }} />
                                  <span>Domain: <a 
                                    href={`https://${item.dnsDetails.fqdn}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}
                                  >
                                    {item.dnsDetails.fqdn}
                                  </a></span>
                                </div>
                              )}
                              {item.repositoryUrl && (
                                <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                  <Github size={12} style={{ opacity: 0.7, color: 'var(--accent-blue)', flexShrink: 0 }} />
                                  <span>GitHub: <a 
                                    href={item.repositoryUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}
                                  >
                                    {item.repositoryUrl.replace('https://github.com/', '')}
                                  </a></span>
                                </div>
                              )}

                              {/* Branch Details */}
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                <GitBranch size={12} style={{ opacity: 0.7, color: 'var(--accent-purple)', flexShrink: 0 }} />
                                <span>Branch: <strong style={{ color: 'var(--text-primary)' }}>{resolveBranchName(item)}</strong></span>
                                {item.pipelineRun && isBuildActive(item.pipelineRun) && (
                                  <span style={{ 
                                    marginLeft: '8px', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    color: 'var(--accent-purple)', 
                                    fontWeight: 600,
                                    fontSize: '0.68rem',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                  }}>
                                    <RefreshCw size={10} className="spin-anim" />
                                    Build in progress...
                                  </span>
                                )}
                              </div>

                              {/* Pipeline Details */}
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                <Server size={12} style={{ opacity: 0.7, color: 'var(--accent-teal)', flexShrink: 0 }} />
                                <span>Pipeline: <strong style={{ color: item.pipelineName ? 'var(--success)' : '#ef4444' }}>{item.pipelineName || 'Not Set'}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Visual Deployment Pipeline Run Progress */}
                          {item.pipelineRun && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BUILD RUN: #{item.pipelineRun.name || item.pipelineRun.id}</span>
                                <span style={{ 
                                  fontSize: '0.64rem', 
                                  fontWeight: 700, 
                                  textTransform: 'uppercase', 
                                  color: getStageColor(item.pipelineRun.result, item.pipelineRun.state) 
                                }}>
                                  {isBuildActive(item.pipelineRun) ? 'BUILDING' : item.pipelineRun.result || item.pipelineRun.state}
                                </span>
                              </div>
                              
                              {/* Visual Pipeline Stages */}
                              {item.pipelineRun.stages && item.pipelineRun.stages.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                  {item.pipelineRun.stages.map((stage) => {
                                    const stageColor = getStageColor(stage.result, stage.state);
                                    const isSelected = activeStageInfo?.appName === item.name && activeStageInfo?.stageId === stage.id;
                                    return (
                                      <div
                                        key={stage.id}
                                        onClick={() => {
                                          if (isSelected) {
                                            setActiveStageInfo(null);
                                          } else {
                                            setActiveStageInfo({ appName: item.name, stageId: stage.id });
                                          }
                                          setSelectedStageForJobs(stage);
                                        }}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                          border: `1px solid ${isSelected ? 'var(--accent-purple)' : (stage.state === 'inProgress' ? stageColor : 'var(--glass-border)')}`,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          cursor: 'pointer',
                                          fontSize: '0.7rem',
                                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                          transition: 'all 0.2s ease',
                                          flex: '1 1 auto',
                                          justifyContent: 'center'
                                        }}
                                        title={`${stage.displayName}: ${stage.result || stage.state}`}
                                      >
                                        {getStageIcon(stage.result, stage.state)}
                                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{stage.displayName || stage.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Selected Stage Jobs list */}
                              {activeStageInfo?.appName === item.name && (() => {
                                const activeStage = item.pipelineRun.stages?.find(s => s.id === activeStageInfo.stageId);
                                if (!activeStage || !activeStage.jobs || activeStage.jobs.length === 0) return null;
                                return (
                                  <div style={{
                                    marginTop: '8px',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(0,0,0,0.15)',
                                    borderLeft: '2px solid var(--accent-purple)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    animation: 'fade-in-anim 0.2s ease-out'
                                  }}>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      Jobs in "{activeStage.displayName || activeStage.name}"
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {activeStage.jobs.map(job => (
                                        <div 
                                          key={job.id} 
                                          onClick={() => setSelectedJobForModal(job)}
                                          style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            fontSize: '0.7rem',
                                            padding: '4px 6px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                            userSelect: 'none',
                                            backgroundColor: 'transparent'
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                                            {getStageIcon(job.result, job.state)}
                                            <span>{job.displayName || job.name}</span>
                                          </div>
                                          <span style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 600,
                                            color: getStageColor(job.result, job.state)
                                          }}>
                                            {job.state === 'inProgress' ? 'RUNNING' : job.result || job.state}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {item.hostname && (
                              <a 
                                href={item.dnsDetails?.fqdn ? `https://${item.dnsDetails.fqdn}` : `https://${item.hostname}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn-secondary" 
                                style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none' }}
                              >
                                <Globe size={12} />
                                Browse
                              </a>
                            )}
                            <button 
                              className="btn-secondary" 
                              onClick={() => openDnsModal(item)}
                              style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                              <ExternalLink size={12} />
                              DNS
                            </button>
                            
                            {item.pipelineId ? (
                              <a 
                                href={(() => {
                                  if (item.pipelineRun?.webUrl) {
                                    try {
                                      const url = new URL(item.pipelineRun.webUrl);
                                      const parts = url.pathname.split('/');
                                      const buildIndex = parts.indexOf('_build');
                                      if (buildIndex !== -1) {
                                        const basePath = parts.slice(0, buildIndex + 1).join('/');
                                        return `${url.origin}${basePath}?definitionId=${item.pipelineId}`;
                                      }
                                    } catch (e) {
                                      console.warn('Failed to parse webUrl:', e);
                                    }
                                  }
                                  const baseOrg = (azureDevopsOrgUrl || 'https://dev.azure.com/esteviatech').replace(/\/$/, '');
                                  const baseProj = azureDevopsProject || 'Estevia-Platform';
                                  return `${baseOrg}/${baseProj}/_build?definitionId=${item.pipelineId}`;
                                })()}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none' }}
                              >
                                <GitBranch size={12} />
                                CI/CD
                              </a>
                            ) : (
                              <button 
                                className="btn-secondary" 
                                onClick={() => openPipelineModal(item, group)}
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '0.75rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  gap: '4px', 
                                  borderColor: 'var(--accent-purple)',
                                  color: 'var(--text-primary)',
                                  background: 'rgba(139, 92, 246, 0.04)',
                                  transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)';
                                  e.currentTarget.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.04)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <PlusCircle size={12} style={{ color: 'var(--accent-purple)' }} />
                                Setup CI/CD
                              </button>
                            )}

                            {!isOrphaned && (
                              <button 
                                className="btn-secondary" 
                                onClick={() => handleDeleteApp(item.name, item.type)}
                                disabled={deletingAppName === item.name} 
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '0.75rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  color: 'var(--error)', 
                                  borderColor: 'rgba(239,68,68,0.2)', 
                                  backgroundColor: 'rgba(239,68,68,0.03)' 
                                }}
                              >
                                {deletingAppName === item.name ? <RefreshCw size={12} className="spin-anim" /> : <Trash2 size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(() => {
                      const deployedBranchNames = group.envs.map(app => resolveBranchName(app).toLowerCase());
                      const undeployedBranches = (group.branches || []).filter(branch => {
                        return !deployedBranchNames.includes(branch.name.toLowerCase());
                      });

                      if (undeployedBranches.length === 0) return null;

                      const unlinkedStyle = getUnlinkedCardStyles(theme);

                      return undeployedBranches.map((branch) => {
                        return (
                          <div 
                            key={branch.name} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '12px 18px', 
                              borderRadius: '10px', 
                              border: `1px dashed ${unlinkedStyle.border}`, 
                              borderLeft: `4px solid ${unlinkedStyle.color}`,
                              background: unlinkedStyle.background,
                              transition: 'all 0.25s ease',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                              {/* Git Icon / Branch details */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <GitBranch size={16} style={{ color: unlinkedStyle.color, opacity: 0.9 }} />
                                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {branch.name}
                                </span>
                              </div>
                              
                              {/* UNLINKED badge */}
                              <span style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: unlinkedStyle.color,
                                background: theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.15)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: `1px dashed ${unlinkedStyle.border}`,
                                letterSpacing: '0.04em'
                              }}>
                                UNLINKED
                              </span>
                            </div>

                             {/* Provision Branch Button */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                className="btn-secondary" 
                                onClick={() => onDeployBranch(group.repoPath, branch.name, group.type)}
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '0.75rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  gap: '6px',
                                  borderColor: unlinkedStyle.color,
                                  color: 'var(--text-primary)',
                                  background: theme === 'light' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.15)';
                                  e.currentTarget.style.boxShadow = `0 0 8px ${theme === 'light' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.4)'}`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = theme === 'light' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.05)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <PlusCircle size={12} style={{ color: unlinkedStyle.color }} />
                                Provision Branch
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Job Steps Modal Overlay */}
      {selectedJobForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--modal-shadow)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <GitBranch size={18} style={{ color: 'var(--accent-purple)' }} />
                Job Steps: {selectedJobForModal.displayName || selectedJobForModal.name}
              </h3>
              <button 
                onClick={() => setSelectedJobForModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {!selectedJobForModal.steps || selectedJobForModal.steps.length === 0 ? (
                <div style={{
                  padding: '24px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertCircle size={28} style={{ color: 'var(--error)' }} />
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Step Telemetry Sync Available</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      Azure DevOps timeline steps have not been cached yet for this run. Please close this modal and click the <strong>"Scan Active Cloud"</strong> button to fetch the latest live execution logs and timeline records.
                    </p>
                  </div>
                </div>
              ) : (
                selectedJobForModal.steps.map((step: any, idx: number) => {
                  const stepColor = getStageColor(step.result, step.state);
                  return (
                    <div 
                      key={step.id || idx} 
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getStageIcon(step.result, step.state)}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {step.displayName || step.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: stepColor
                        }}>
                          {step.state === 'inProgress' ? 'RUNNING' : step.result || step.state}
                        </span>
                        {step.startTime && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            {(() => {
                              const start = new Date(step.startTime).getTime();
                              const end = step.finishTime ? new Date(step.finishTime).getTime() : Date.now();
                              const dur = Math.max(0, Math.floor((end - start) / 1000));
                              return `${dur}s`;
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedJobForModal(null)}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
