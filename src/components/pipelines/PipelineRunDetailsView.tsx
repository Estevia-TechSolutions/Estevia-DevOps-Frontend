import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, RefreshCw, Terminal, Download, Search, Copy, Check, ExternalLink, Cpu, Layers, Package, Sliders, Lock, Eye, EyeOff, GitBranch, Zap, Globe, FileText, Server } from 'lucide-react';

interface PipelineRunDetailsViewProps {
  runId: string | null;
  initialBranch?: string;
  initialProvider?: string;
  isOpen: boolean;
  onClose: () => void;
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
}

export const PipelineRunDetailsView: React.FC<PipelineRunDetailsViewProps> = ({
  runId,
  initialBranch = 'main',
  initialProvider = 'azure_devops',
  isOpen,
  onClose,
  API_BASE,
  token,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'summary' | 'artifacts' | 'variables'>('logs');
  const [activeBranch, setActiveBranch] = useState<string>(initialBranch);
  const [runDetails, setRunDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedHistoricalRunId, setSelectedHistoricalRunId] = useState<string | null>(null);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [showSecrets, setShowSecrets] = useState<boolean>(false);
  const [expandedStageId, setExpandedStageId] = useState<string | null>('stg-0');

  const isLight = theme === 'light';

  useEffect(() => {
    if (initialBranch) {
      setActiveBranch(initialBranch);
    }
  }, [initialBranch]);

  useEffect(() => {
    if (runId && isOpen) {
      setSelectedHistoricalRunId(null);
      fetchRunDetails(runId, activeBranch);
    }
  }, [runId, isOpen, activeBranch]);

  useEffect(() => {
    if (selectedHistoricalRunId && isOpen) {
      fetchRunDetails(selectedHistoricalRunId, activeBranch);
    }
  }, [selectedHistoricalRunId]);

  const fetchRunDetails = async (targetRunId: string, branchName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pipelines/runs/${targetRunId}?branch=${branchName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRunDetails(data);
        if (data.stages?.[0]?.jobs?.[0]?.id) {
          setSelectedJobId(data.stages[0].jobs[0].id);
        }
      }
    } catch (err) {
      console.warn('[PipelineRunDetailsView] Failed to fetch run details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const projectName = runDetails?.project_name || runId?.replace(/^scanned-\d+-/, '') || 'Estevia Codebase';
  const buildNumber = runDetails?.run_number ? `#${runDetails.run_number}` : '#42';
  const provider = (runDetails?.provider || initialProvider || 'azure_devops').toLowerCase();
  const cnameHost = runDetails?.cname_host || `${projectName.toLowerCase()}.esteviatech.com`;
  const resourceGroup = runDetails?.resource_group || 'Estevia-Prod-RG';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={12} /> Succeeded
          </span>
        );
      case 'running':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, background: 'rgba(139, 92, 246, 0.15)', color: '#a855f7', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <RefreshCw size={12} className="spin-anim" /> Building
          </span>
        );
      case 'failed':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <XCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} /> Queued
          </span>
        );
    }
  };

  const allJobs = runDetails?.stages?.flatMap((s: any) => s.jobs || []) || [];
  const activeJob = allJobs.find((j: any) => j.id === selectedJobId) || allJobs[0];

  const fullLogsString = activeJob?.steps?.map((step: any) => `=== Step: ${step.step_name} ===\n${step.log_output}`).join('\n\n') || 
    `[INFO] Initializing Cloud Credentials for ${projectName} on branch ${activeBranch}...\n[INFO] Target Environment Scope: ${resourceGroup} (${cnameHost})\n[SUCCESS] Pipeline execution active.`;

  const copyLogsToClipboard = () => {
    navigator.clipboard.writeText(fullLogsString);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1140px',
        height: '88vh',
        borderRadius: '20px',
        background: isLight ? '#ffffff' : '#0f172a',
        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          padding: '20px 24px',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
          background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
              <Terminal size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  {projectName}
                </h2>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'monospace' }}>
                  {buildNumber}
                </span>

                {/* Provider Badge & Direct Link */}
                {provider.includes('azure') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.14)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={11} /> Azure DevOps
                    </span>
                    {runDetails?.pipeline_url && (
                      <a
                        href={runDetails.pipeline_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={11} /> Open in Azure DevOps Pipelines
                      </a>
                    )}
                  </div>
                ) : provider.includes('github') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GitBranch size={11} /> GitHub Actions
                    </span>
                    {runDetails?.pipeline_url && (
                      <a
                        href={runDetails.pipeline_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: 'rgba(255, 255, 255, 0.12)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--glass-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={11} /> Open in GitHub Actions
                      </a>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.16)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.35)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={11} /> ⚡ EvaForge CI/CD
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Target Host: <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{cnameHost}</strong></span>
                <span>•</span>
                <span>RG: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{resourceGroup}</strong></span>
                <span>•</span>
                <span>Commit: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{runDetails?.commit_sha || 'a4bafe6'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Historical Run Selector Dropdown */}
            {runDetails?.historicalRuns && runDetails.historicalRuns.length > 0 && (
              <select
                value={selectedHistoricalRunId || runId || ''}
                onChange={(e) => setSelectedHistoricalRunId(e.target.value)}
                style={{
                  height: '34px',
                  borderRadius: '8px',
                  background: isLight ? '#ffffff' : '#1e293b',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  padding: '0 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {runDetails.historicalRuns.map((hr: any) => (
                  <option key={hr.id} value={hr.id} style={{ background: '#0f172a', color: '#ffffff' }}>
                    Run #{hr.run_number} ({hr.status}) - {hr.commit_sha} [{hr.branch || activeBranch}]
                  </option>
                ))}
              </select>
            )}

            {getStatusBadge(runDetails?.status || 'success')}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TARGET ENVIRONMENT BRANCH SELECTOR BAR */}
        <div style={{
          padding: '10px 24px',
          background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.2)',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Select Branch / Target Environment:</span>
            {[
              { branch: 'main', envLabel: 'main (Production ACA)', color: '#3b82f6' },
              { branch: 'qa', envLabel: 'qa (QA Staging ACA)', color: '#f59e0b' },
              { branch: 'dev', envLabel: 'dev (Development ACA)', color: '#a855f7' }
            ].map(b => (
              <button
                key={b.branch}
                type="button"
                onClick={() => setActiveBranch(b.branch)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: activeBranch === b.branch ? 800 : 600,
                  background: activeBranch === b.branch ? b.color : 'rgba(255,255,255,0.04)',
                  color: activeBranch === b.branch ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <GitBranch size={12} /> {b.envLabel}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Active Scope: <strong style={{ color: 'var(--accent-purple)' }}>{activeBranch.toUpperCase()} Branch Pipeline History</strong>
          </div>
        </div>

        {/* MODAL NAVIGATION TABS */}
        <div style={{
          padding: '0 24px',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: isLight ? '#ffffff' : 'rgba(0,0,0,0.1)'
        }}>
          {[
            { id: 'logs', label: 'Execution Logs', icon: <Terminal size={14} /> },
            { id: 'summary', label: 'Run Summary', icon: <Cpu size={14} /> },
            { id: 'artifacts', label: `Artifacts (${runDetails?.artifacts?.length || 3})`, icon: <Package size={14} /> },
            { id: 'variables', label: 'Environment Variables', icon: <Sliders size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--accent-purple)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontWeight: activeTab === t.id ? 800 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* MODAL BODY CONTENT */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '10px' }}>
              <RefreshCw size={24} className="spin-anim" /> Loading execution details for branch {activeBranch}...
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTION LOGS */}
              {activeTab === 'logs' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                  {/* Job Selector Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                      {allJobs.map((j: any) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => setSelectedJobId(j.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: selectedJobId === j.id ? 800 : 600,
                            background: selectedJobId === j.id ? 'var(--accent-purple)' : 'rgba(255,255,255,0.04)',
                            color: selectedJobId === j.id ? '#ffffff' : 'var(--text-secondary)',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer'
                          }}
                        >
                          {j.name}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={copyLogsToClipboard}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedLog ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      {copiedLog ? 'Copied Logs!' : 'Copy Logs'}
                    </button>
                  </div>

                  {/* Terminal Log Console */}
                  <div style={{
                    flex: 1,
                    background: '#090d16',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    padding: '16px',
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                    fontSize: '0.82rem',
                    color: '#38bdf8',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}>
                    {fullLogsString}
                  </div>
                </div>
              )}

              {/* TAB 2: RUN SUMMARY */}
              {activeTab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>Target Resource Group</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{resourceGroup}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>GoDaddy CNAME Record</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{cnameHost}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>Execution Time</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '4px' }}>{runDetails?.duration_seconds || 48} seconds</div>
                    </div>
                  </div>

                  {/* Stage Timeline */}
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Pipeline Execution Stage Breakdown ({activeBranch} branch)</h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 16px 0' }}>Step-by-step DAG execution pipeline status for cloud infrastructure, compilation, containerization, and DNS routing.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(runDetails?.stages || []).map((stage: any, idx: number) => {
                        const isExpanded = expandedStageId === (stage.id || `stg-${idx}`);
                        const stageJobs = stage.jobs || [];

                        return (
                          <div
                            key={stage.id || idx}
                            style={{
                              borderRadius: '12px',
                              background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                              border: isExpanded ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Stage Header Row */}
                            <div
                              onClick={() => setExpandedStageId(isExpanded ? null : (stage.id || `stg-${idx}`))}
                              style={{
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                background: isExpanded ? (isLight ? '#e2e8f0' : 'rgba(139, 92, 246, 0.1)') : 'transparent'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={18} style={{ color: stage.status === 'failed' ? '#ef4444' : '#10b981' }} />
                                <div>
                                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    Stage {idx + 1}: {stage.name}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {stageJobs.length} job(s) • Click to {isExpanded ? 'collapse' : 'expand'} tasks
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                                  {isExpanded ? '▲ Hide Tasks' : '▼ View Tasks'}
                                </span>
                              </div>
                            </div>

                            {/* Stage Expanded Tasks Accordion */}
                            {isExpanded && (
                              <div style={{
                                padding: '16px 18px',
                                borderTop: '1px solid var(--glass-border)',
                                background: isLight ? '#ffffff' : 'rgba(0,0,0,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                              }}>
                                {stageJobs.map((job: any, jIdx: number) => {
                                  const steps = job.steps || [];

                                  return (
                                    <div key={job.id || jIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Cpu size={14} style={{ color: 'var(--accent-purple)' }} />
                                        <span>Job: {job.name}</span>
                                      </div>

                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px' }}>
                                        {steps.map((st: any, sIdx: number) => (
                                          <div
                                            key={sIdx}
                                            style={{
                                              padding: '8px 12px',
                                              borderRadius: '8px',
                                              background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)',
                                              border: '1px solid var(--glass-border)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between'
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <CheckCircle2 size={13} style={{ color: st.status === 'failed' ? '#ef4444' : '#10b981' }} />
                                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                Task {sIdx + 1}: {st.step_name || st.name}
                                              </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                {st.duration_seconds ? `${st.duration_seconds}s` : 'Completed'}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (job.id) setSelectedJobId(job.id);
                                                  setActiveTab('logs');
                                                }}
                                                style={{
                                                  padding: '3px 8px',
                                                  borderRadius: '6px',
                                                  fontSize: '0.7rem',
                                                  fontWeight: 700,
                                                  background: 'rgba(139, 92, 246, 0.15)',
                                                  color: 'var(--accent-purple)',
                                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                                  cursor: 'pointer',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '4px'
                                                }}
                                              >
                                                <Terminal size={11} /> View Log
                                              </button>
                                            </div>
                                          </div>
                                        ))}
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
                  </div>
                </div>
              )}

              {/* TAB 3: ARTIFACTS */}
              {activeTab === 'artifacts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Compiled Build Artifacts ({activeBranch})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(runDetails?.artifacts || [
                      { name: `${projectName}-${activeBranch}-build.zip`, size: '14.2 MB', type: 'application/zip' },
                      { name: `${activeBranch}-bicep-deployment.json`, size: '2.4 KB', type: 'application/json' },
                      { name: 'cname-allocation-audit.json', size: '850 B', type: 'application/json' }
                    ]).map((art: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Package size={18} style={{ color: 'var(--accent-purple)' }} />
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{art.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Size: {art.size} • Type: {art.type}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ENVIRONMENT VARIABLES */}
              {activeTab === 'variables' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Pipeline Secret & Environment Variables ({activeBranch})</h3>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowSecrets(!showSecrets)}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showSecrets ? 'Hide Masked Tokens' : 'Show Masked Tokens'}
                    </button>
                  </div>

                  <div className="glass-panel" style={{ borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 800 }}>Variable Key</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800 }}>Value</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800 }}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(runDetails?.variables || [
                          { name: 'AZURE_SUBSCRIPTION_ID', value: '4a161497-891d-4e99-b12d-ae79f03eb900', is_secret: true },
                          { name: 'GODADDY_API_KEY', value: 'sK92m_xY1892kLqP', is_secret: true },
                          { name: 'RESOURCE_GROUP', value: resourceGroup, is_secret: false },
                          { name: 'TARGET_ENVIRONMENT', value: activeBranch === 'main' ? 'production' : activeBranch === 'qa' ? 'qa_staging' : 'development', is_secret: false }
                        ]).map((v: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.82rem' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'monospace' }}>{v.name}</td>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                              {v.is_secret && !showSecrets ? '••••••••••••••••' : v.value}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {v.is_secret ? (
                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 700 }}>SECRET</span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: 700 }}>ENV_VAR</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
