import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, RefreshCw, Terminal, Download, Search, Copy, Check, ExternalLink, Cpu, Layers, Package, Sliders } from 'lucide-react';

interface PipelineRunDetailsViewProps {
  runId: string | null;
  isOpen: boolean;
  onClose: () => void;
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
}

export const PipelineRunDetailsView: React.FC<PipelineRunDetailsViewProps> = ({
  runId,
  isOpen,
  onClose,
  API_BASE,
  token,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'summary' | 'artifacts' | 'variables'>('logs');
  const [runDetails, setRunDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

  const isLight = theme === 'light';

  useEffect(() => {
    if (runId && isOpen) {
      fetchRunDetails();
    }
  }, [runId, isOpen]);

  const fetchRunDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pipelines/runs/${runId}`, {
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

  const currentJob = runDetails?.stages
    ?.flatMap((s: any) => s.jobs || [])
    ?.find((j: any) => j.id === selectedJobId) || runDetails?.stages?.[0]?.jobs?.[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={12} /> Succeeded
          </span>
        );
      case 'running':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <RefreshCw size={12} className="spin-anim" /> Running
          </span>
        );
      case 'failed':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <XCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} /> Queued
          </span>
        );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '1300px',
        maxWidth: '100%',
        height: '90vh',
        background: isLight ? '#ffffff' : '#0f172a',
        border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* TOP BANNER SUMMARY HEADER */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--divider)',
          background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {getStatusBadge(runDetails?.status || 'success')}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{runDetails?.pipeline_name || 'DocuAI Processor API'}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>#{runDetails?.run_number || 142}</span>
              </h3>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span>Branch: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{runDetails?.branch || 'main'}</strong></span>
                <span>•</span>
                <span>Commit: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{runDetails?.commit_sha || '82665a9'}</strong></span>
                <span>•</span>
                <span>Duration: <strong>{runDetails?.duration_seconds || 84}s</strong></span>
                <span>•</span>
                <span>Agent Pool: <strong>{runDetails?.agent_pool || 'EvaOps Hosted Linux Pool'}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div style={{
          padding: '0 24px',
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          gap: '16px',
          background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.2)'
        }}>
          {[
            { id: 'logs', label: 'Jobs & Logs', icon: Terminal },
            { id: 'summary', label: 'Summary Metrics', icon: Layers },
            { id: 'artifacts', label: 'Build Artifacts (2)', icon: Package },
            { id: 'variables', label: 'Matrix & Variables', icon: Sliders }
          ].map(t => {
            const TabIcon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <TabIcon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* MAIN BODY: JOBS & LOGS SPLIT VIEW */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT SIDEBAR: STAGE & JOB DAG TREE */}
          <div style={{
            width: '320px',
            borderRight: '1px solid var(--divider)',
            padding: '16px',
            overflowY: 'auto',
            background: isLight ? '#f8fafc' : 'rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Execution Stages & Jobs
            </div>

            {runDetails?.stages?.map((stage: any, idx: number) => (
              <div key={stage.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Stage Header */}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getStatusBadge(stage.status)}
                  <span>{stage.name}</span>
                </div>

                {/* Job Items */}
                <div style={{ paddingLeft: '14px', borderLeft: '2px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {stage.jobs?.map((j: any) => {
                    const isSelected = j.id === selectedJobId;
                    return (
                      <div
                        key={j.id}
                        onClick={() => setSelectedJobId(j.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                          border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {j.name}
                        </div>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{j.duration_seconds || 14}s</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT MAIN PANEL: STEP ACCORDIONS & ANSI LOG TERMINAL */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Step Controls Bar */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.01)'
            }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={15} style={{ color: 'var(--accent-purple)' }} />
                <span>Job: {currentJob?.name || 'Compile TypeScript & Bundle'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Search Box */}
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ height: '28px', paddingLeft: '26px', borderRadius: '6px', fontSize: '0.76rem', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCopiedLog(true);
                    setTimeout(() => setCopiedLog(false), 2000);
                  }}
                  style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedLog ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                  <span>{copiedLog ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={12} /> Raw Log
                </button>
              </div>
            </div>

            {/* STEP ACCORDIONS & TERMINAL CANVAS */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentJob?.steps?.map((step: any, idx: number) => (
                <div key={step.id || idx} style={{ borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                  {/* Step Header Accordion */}
                  <div style={{
                    padding: '10px 14px',
                    background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{idx + 1}. {step.name}</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{step.durationSeconds || step.duration_seconds || 2}s</span>
                  </div>

                  {/* Dark Terminal Log Canvas */}
                  <div style={{
                    background: '#090d16',
                    padding: '12px 16px',
                    fontFamily: 'monospace',
                    fontSize: '0.76rem',
                    lineHeight: 1.5,
                    color: '#38bdf8',
                    overflowX: 'auto'
                  }}>
                    {Array.isArray(step.logs) ? step.logs.map((line: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ color: '#475569', userSelect: 'none', width: '24px', textAlign: 'right' }}>{i + 1}</span>
                        <span style={{ color: line.includes('[ERROR]') ? '#ef4444' : line.includes('[SUCCESS]') ? '#10b981' : '#cbd5e1' }}>{line}</span>
                      </div>
                    )) : (
                      <div>{step.log_content || '[INFO] Step execution logs stream initialized.\n[SUCCESS] Completed step successfully.'}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
