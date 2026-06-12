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
  Cpu
} from 'lucide-react';

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
  azureDevopsProject
}) => {

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
            const groupHasActiveDeployment = group.envs.some(app => !!(app.pipelineRun && (app.pipelineRun.state === 'inProgress' || app.pipelineRun.state === 'canceling')));

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
                            border: '1px solid var(--glass-border)', 
                            backgroundColor: 'rgba(255,255,255,0.015)',
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
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 400, marginTop: '2px', paddingLeft: '22px' }}>
                                  {item.dnsDetails.fqdn}
                                </div>
                              )}
                              {item.repositoryUrl && (
                                <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 400, paddingLeft: '22px' }}>
                                  <a 
                                    href={item.repositoryUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    {item.repositoryUrl.replace('https://github.com/', '')}
                                  </a>
                                </div>
                              )}

                              {/* Branch Details */}
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 400, paddingLeft: '22px', color: 'var(--text-secondary)' }}>
                                <GitBranch size={12} style={{ opacity: 0.7 }} />
                                <span>Branch: <strong style={{ color: 'var(--text-primary)' }}>{resolveBranchName(item)}</strong></span>
                                {item.pipelineRun && (item.pipelineRun.state === 'inProgress' || item.pipelineRun.state === 'canceling') && (
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
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 400, paddingLeft: '22px', color: 'var(--text-secondary)' }}>
                                <Server size={12} style={{ opacity: 0.7 }} />
                                <span>Pipeline: </span>
                                {item.pipelineName ? (
                                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{item.pipelineName}</span>
                                ) : (
                                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Not Set</span>
                                )}
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
                                  {item.pipelineRun.state === 'inProgress' ? 'BUILDING' : item.pipelineRun.result || item.pipelineRun.state}
                                </span>
                              </div>
                              
                              {/* Visual Pipeline Stages */}
                              {item.pipelineRun.stages && item.pipelineRun.stages.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                  {item.pipelineRun.stages.map((stage) => {
                                    const stageColor = getStageColor(stage.result, stage.state);
                                    return (
                                      <div
                                        key={stage.id}
                                        onClick={() => setSelectedStageForJobs(stage)}
                                        style={{
                                          flex: 1,
                                          height: '14px',
                                          borderRadius: '3px',
                                          backgroundColor: stage.state === 'inProgress' ? 'transparent' : stageColor,
                                          border: stage.state === 'inProgress' ? `1px solid ${stageColor}` : 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          position: 'relative'
                                        }}
                                        title={`${stage.displayName}: ${stage.result || stage.state}`}
                                      >
                                        {getStageIcon(stage.result, stage.state)}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
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
                                disabled
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '0.75rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  gap: '4px', 
                                  opacity: 0.5, 
                                  cursor: 'not-allowed'
                                }}
                              >
                                <GitBranch size={12} />
                                CI/CD
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
