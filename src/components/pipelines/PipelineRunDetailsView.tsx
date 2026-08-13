import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, RefreshCw, Terminal, Download, Search, Copy, Check, ExternalLink, Cpu, Layers, Package, Sliders, Lock, Eye, EyeOff, GitBranch, Zap, Globe, FileText, Server, History, ChevronDown } from 'lucide-react';
import EvaForgeIcon from '../icons/EvaForgeIcon';

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
  const [activeTab, setActiveTab] = useState<'logs' | 'summary' | 'artifacts' | 'variables'>('summary');
  const [activeBranch, setActiveBranch] = useState<string>(initialBranch);
  const [runDetails, setRunDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedHistoricalRunId, setSelectedHistoricalRunId] = useState<string | null>(null);
  const [stableHistoricalRuns, setStableHistoricalRuns] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [showSecrets, setShowSecrets] = useState<boolean>(false);
  const [expandedStageId, setExpandedStageId] = useState<string | null>('stg-0');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const isLight = theme === 'light';

  useEffect(() => {
    if (initialBranch) {
      setActiveBranch(initialBranch);
    }
  }, [initialBranch]);

  useEffect(() => {
    if (runId && isOpen) {
      setRunDetails(null);
      setSelectedHistoricalRunId(null);
      setStableHistoricalRuns([]);
      fetchRunDetails(runId, activeBranch, false);
    }
  }, [runId, isOpen, activeBranch]);

  useEffect(() => {
    if (selectedHistoricalRunId && isOpen) {
      fetchRunDetails(selectedHistoricalRunId, activeBranch, true);
    }
  }, [selectedHistoricalRunId]);

  const fetchRunDetails = async (targetRunId: string, branchName: string, isHistoricalSwitch = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pipelines/runs/${targetRunId}?branch=${branchName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRunDetails(data);
        // Only capture the history list on the initial pipeline open — never overwrite
        // when the user switches to a different historical run (that would replace the
        // list with the selected run's own history, causing the cascade mismatch bug).
        if (!isHistoricalSwitch && data.historicalRuns?.length > 0) {
          setStableHistoricalRuns(data.historicalRuns);
        }
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

  // Use the stable list (captured on initial load only) so it never shifts when switching runs
  const selectedHistoricalRun = stableHistoricalRuns.find(
    (hr: any) => hr.id === (selectedHistoricalRunId || runId)
  ) || stableHistoricalRuns[0];

  const projectName = runDetails?.project_name || (runId && !runId.startsWith('run-') ? runId.replace(/^scanned-\d+-/, '') : null) || 'Estevia-App';
  // After any fetch, runDetails.run_number is always the correct value for the displayed run
  const buildNumber = runDetails?.run_number
    ? `#${runDetails.run_number}`
    : selectedHistoricalRun?.run_number
      ? `#${selectedHistoricalRun.run_number}`
      : '#--';
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

  // ─── Log-line type classifier ───────────────────────────────────────────────
  type LogBlock =
    | { type: 'section'; text: string }
    | { type: 'group'; title: string; lines: string[]; key: string }
    | { type: 'warning'; text: string }
    | { type: 'error'; text: string }
    | { type: 'command'; text: string }
    | { type: 'plain'; text: string }
    | { type: 'spacer' };

  /** Strip residual ISO timestamp prefix (e.g. "2026-07-30T07:46:28.986Z ") */
  const stripTs = (line: string) => line.replace(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s*/, '');

  /** Parse a flat log string into typed blocks, collapsing ##[group]…##[endgroup] */
  const parseLogIntoBlocks = (raw: string): LogBlock[] => {
    const lines = raw.split('\n');
    const blocks: LogBlock[] = [];
    let groupBuf: string[] | null = null;
    let groupTitle = '';
    let groupIdx = 0;

    for (const rawLine of lines) {
      const line = stripTs(rawLine);
      if (line.startsWith('##[group]')) {
        groupTitle = line.replace('##[group]', '').trim();
        groupBuf = [];
        continue;
      }
      if (line.startsWith('##[endgroup]')) {
        if (groupBuf !== null) {
          blocks.push({ type: 'group', title: groupTitle, lines: groupBuf, key: `grp-${groupIdx++}` });
          groupBuf = null;
        }
        continue;
      }
      if (groupBuf !== null) {
        groupBuf.push(line);
        continue;
      }
      if (line.startsWith('##[section]')) {
        blocks.push({ type: 'section', text: line.replace('##[section]', '').trim() });
      } else if (line.startsWith('##[warning]')) {
        blocks.push({ type: 'warning', text: line.replace('##[warning]', '').trim() });
      } else if (line.startsWith('##[error]')) {
        blocks.push({ type: 'error', text: line.replace('##[error]', '').trim() });
      } else if (line.startsWith('##[command]')) {
        blocks.push({ type: 'command', text: line.replace('##[command]', '').trim() });
      } else if (line.trim() === '') {
        blocks.push({ type: 'spacer' });
      } else {
        blocks.push({ type: 'plain', text: line });
      }
    }
    // flush unclosed group
    if (groupBuf !== null && groupBuf.length > 0) {
      blocks.push({ type: 'group', title: groupTitle, lines: groupBuf, key: `grp-${groupIdx++}` });
    }
    return blocks;
  };

  /** Render a single parsed block as a JSX element */
  const renderBlock = (block: LogBlock, idx: number, stepIdx: number): React.ReactNode => {
    if (block.type === 'spacer') return <div key={idx} style={{ height: '6px' }} />;

    if (block.type === 'section') {
      return (
        <div key={idx} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          margin: '10px 0 4px 0',
          paddingBottom: '4px',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)'
        }}>
          <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>▶ {block.text}</span>
        </div>
      );
    }

    if (block.type === 'warning') {
      return (
        <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '2px 0' }}>
          <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0, fontSize: '0.76rem' }}>⚠</span>
          <span style={{ color: '#fbbf24', fontSize: '0.8rem', lineHeight: '1.5' }}>{block.text}</span>
        </div>
      );
    }

    if (block.type === 'error') {
      return (
        <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '2px 0' }}>
          <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0, fontSize: '0.76rem' }}>✕</span>
          <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.8rem', lineHeight: '1.5' }}>{block.text}</span>
        </div>
      );
    }

    if (block.type === 'command') {
      return (
        <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '2px 0' }}>
          <span style={{ color: '#22d3ee', fontWeight: 700, flexShrink: 0, fontSize: '0.76rem' }}>$</span>
          <span style={{ color: '#67e8f9', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.5', wordBreak: 'break-all' }}>{block.text}</span>
        </div>
      );
    }

    if (block.type === 'group') {
      const groupKey = `${stepIdx}-${block.key}`;
      const isOpen = expandedGroups.has(groupKey);
      return (
        <div key={idx} style={{ margin: '4px 0', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => {
              setExpandedGroups(prev => {
                const next = new Set(prev);
                isOpen ? next.delete(groupKey) : next.add(groupKey);
                return next;
              });
            }}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: 'none',
              padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', textAlign: 'left'
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '0.7rem', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
            <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600 }}>{block.title}</span>
          </button>
          {isOpen && (
            <div style={{ padding: '6px 12px 8px 20px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {block.lines.map((l, li) => (
                <span key={li} style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{l || '\u00a0'}</span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // plain
    return (
      <div key={idx} style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all', padding: '1px 0' }}>
        {block.text || '\u00a0'}
      </div>
    );
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
              color: 'var(--accent-purple)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Terminal size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Row 1: Title + Build ID + Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {projectName}
                </h2>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--accent-purple)',
                  fontFamily: 'monospace',
                  background: 'rgba(139, 92, 246, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(139, 92, 246, 0.18)'
                }}>
                  {buildNumber}
                </span>
                {getStatusBadge(runDetails?.status || 'success')}
              </div>

              {/* Row 2: Provider badge + External console link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {provider.includes('azure') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={11} /> Azure DevOps
                    </span>
                    {runDetails?.pipeline_url && (
                      <a
                        href={runDetails.pipeline_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#3b82f6',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          opacity: 0.85,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                      >
                        <ExternalLink size={12} /> Open console
                      </a>
                    )}
                  </div>
                ) : provider.includes('github') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GitBranch size={11} /> GitHub Actions
                    </span>
                    {runDetails?.pipeline_url && (
                      <a
                        href={runDetails.pipeline_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          opacity: 0.8,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                      >
                        <ExternalLink size={12} /> Open console
                      </a>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <EvaForgeIcon size={11} /> EvaForge CI/CD
                    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.5rem', fontWeight: 900, padding: '1px 5px', borderRadius: '3px', background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(139,92,246,0.15))', border: '1px solid rgba(168,85,247,0.4)', color: '#9333ea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>BETA</span>
                  </span>
                )}
              </div>

              {/* Row 3: Meta details */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Host: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{cnameHost}</strong></span>
                <span style={{ color: 'var(--glass-border)' }}>|</span>
                <span>RG: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{resourceGroup}</strong></span>
                <span style={{ color: 'var(--glass-border)' }}>|</span>
                <span>Commit: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{runDetails?.commit_sha || 'a4bafe6'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Rich Custom Selector Dropdown for Build History */}
            {stableHistoricalRuns.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    background: isLight ? '#ffffff' : 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                >
                  <History size={14} />
                  <span>Build History</span>
                  <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>

                {isDropdownOpen && (
                  <div className="glass-panel dropdown-fade-in" style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '320px',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    borderRadius: '12px',
                    background: isLight ? '#ffffff' : 'rgba(15,23,42,0.95)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    padding: '8px 0'
                  }}>
                    <div style={{
                      padding: '6px 12px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
                      marginBottom: '6px'
                    }}>
                      Select Pipeline Build Run
                    </div>
                    {stableHistoricalRuns.map((hr: any) => {
                      const isSelected = (selectedHistoricalRunId || runId) === hr.id;
                      const dateStr = hr.created_at ? new Date(hr.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown Date';

                      return (
                        <button
                          key={hr.id}
                          type="button"
                          onClick={() => {
                            setSelectedHistoricalRunId(hr.id);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            width: '95%',
                            margin: '2px 2.5%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isSelected ? 'rgba(168, 85, 247, 0.15)' : isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: hr.status === 'success' ? '#10b981' : hr.status === 'failed' ? '#ef4444' : '#f59e0b'
                            }} />
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                                Build #{hr.run_number}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                                {hr.branch} • {hr.commit_sha ? `[${hr.commit_sha.slice(0, 7)}]` : '[a4bafe]'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            {dateStr}
                          </span>
                        </button>
                      );
                    })}
                    <div style={{
                      padding: '10px 10px 4px',
                      marginTop: '6px',
                      borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
                      textAlign: 'center'
                    }}>
                      <a
                        href={runDetails?.pipeline_url || `https://dev.azure.com/esteviatech/Estevia-Platform/_build`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--accent-purple)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={12} />
                        For full history & build artifacts beyond the last 10 runs, view in {runDetails?.provider === 'github_actions' ? 'GitHub Actions' : 'Azure DevOps'} &rarr;
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

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
            {(() => {
              const supportedBranches: string[] = runDetails?.supported_branches || (runDetails?.branches?.map((b: any) => b.branch)) || ['main'];
              return [
                { branch: 'main', envLabel: 'main (Production ACA)', color: '#3b82f6' },
                { branch: 'qa', envLabel: 'qa (QA Staging ACA)', color: '#f59e0b' },
                { branch: 'dev', envLabel: 'dev (Development ACA)', color: '#a855f7' }
              ].map(b => {
                const isSupported = supportedBranches.includes(b.branch);
                return (
                  <button
                    key={b.branch}
                    type="button"
                    disabled={!isSupported}
                    onClick={() => isSupported && setActiveBranch(b.branch)}
                    title={isSupported ? `Switch to ${b.branch} branch history` : `Branch '${b.branch}' is not configured for this pipeline`}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: activeBranch === b.branch ? 800 : 600,
                      background: !isSupported ? 'rgba(255,255,255,0.02)' : activeBranch === b.branch ? b.color : 'rgba(255,255,255,0.04)',
                      color: !isSupported ? 'rgba(255,255,255,0.3)' : activeBranch === b.branch ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--glass-border)',
                      cursor: !isSupported ? 'not-allowed' : 'pointer',
                      opacity: !isSupported ? 0.45 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <GitBranch size={12} /> {b.envLabel} {!isSupported && <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>(Not Configured)</span>}
                  </button>
                );
              });
            })()}
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
            { id: 'summary', label: 'Run Summary', icon: <Cpu size={14} /> },
            { id: 'logs', label: 'Execution Logs', icon: <Terminal size={14} /> },
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


                  {/* Structured Log Console */}
                  <div style={{
                    flex: 1,
                    background: '#090d16',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    overflowY: 'auto',
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                  }}>
                    {/* Terminal top bar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px',
                      borderBottom: '1px solid #1e293b',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: '#475569', fontFamily: 'sans-serif' }}>
                        {provider.includes('github') ? 'GitHub Actions' : 'Azure DevOps'} — Execution Log
                      </span>
                      {activeJob?.steps?.length > 0 && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#475569', fontFamily: 'sans-serif' }}>
                          {activeJob.steps.length} step{activeJob.steps.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Per-step cards */}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeJob?.steps?.length > 0 ? (
                        activeJob.steps.map((step: any, si: number) => {
                          const isStepOpen = expandedSteps.has(si);
                          const blocks = parseLogIntoBlocks(step.log_output || '');
                          const stepStatus: string = step.status || 'unknown';
                          const statusColour = stepStatus === 'success' ? '#10b981'
                            : stepStatus === 'failed' ? '#ef4444'
                            : stepStatus === 'skipped' ? '#64748b'
                            : '#a855f7';
                          const statusIcon = stepStatus === 'success' ? '✔'
                            : stepStatus === 'failed' ? '✕'
                            : stepStatus === 'skipped' ? '—'
                            : '…';

                          return (
                            <div key={si} style={{
                              borderRadius: '8px',
                              border: `1px solid ${isStepOpen ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                              overflow: 'hidden',
                              transition: 'border-color 0.15s ease'
                            }}>
                              {/* Step header */}
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedSteps(prev => {
                                    const next = new Set(prev);
                                    isStepOpen ? next.delete(si) : next.add(si);
                                    return next;
                                  });
                                }}
                                style={{
                                  width: '100%',
                                  background: isStepOpen ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.02)',
                                  border: 'none',
                                  padding: '9px 14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.15s ease'
                                }}
                              >
                                <span style={{
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: `${statusColour}22`,
                                  border: `1px solid ${statusColour}55`,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  color: statusColour, fontSize: '0.62rem', fontWeight: 800, flexShrink: 0
                                }}>{statusIcon}</span>
                                <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>
                                  {step.step_name || `Step ${si + 1}`}
                                </span>
                                <span style={{
                                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                                  color: statusColour, fontFamily: 'sans-serif', letterSpacing: '0.04em'
                                }}>{stepStatus}</span>
                                <span style={{
                                  color: '#475569', fontSize: '0.72rem',
                                  transform: isStepOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                  transition: 'transform 0.2s ease', display: 'inline-block'
                                }}>▼</span>
                              </button>

                              {/* Step log body */}
                              {isStepOpen && (
                                <div style={{
                                  padding: '10px 14px 14px 14px',
                                  borderTop: '1px solid rgba(255,255,255,0.05)',
                                  display: 'flex', flexDirection: 'column', gap: '0'
                                }}>
                                  {blocks.length > 0
                                    ? blocks.map((block, bi) => renderBlock(block, bi, si))
                                    : <span style={{ color: '#475569', fontSize: '0.78rem' }}>No log output for this step.</span>
                                  }
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#475569', fontSize: '0.82rem', fontFamily: 'sans-serif' }}>
                          No log data available for this job.
                        </div>
                      )}
                    </div>
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
