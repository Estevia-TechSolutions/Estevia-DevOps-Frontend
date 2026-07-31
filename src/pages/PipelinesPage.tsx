import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, Plus, Zap, Cpu, Server, ExternalLink, ArrowRight, Shield, Terminal, Filter, Search } from 'lucide-react';

interface PipelineRun {
  id: string;
  pipeline_name: string;
  project_name: string;
  run_number: number;
  status: 'queued' | 'running' | 'success' | 'failed' | 'canceled';
  branch: string;
  commit_sha: string;
  commit_message: string;
  triggered_by: string;
  duration_seconds: number;
  created_at: string;
  provider?: string;
}

interface PipelinesPageProps {
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
  onOpenCreateDrawer: () => void;
  onOpenRunDetails: (runId: string) => void;
  onSwitchToProvisionWizard: () => void;
}

export const PipelinesPage: React.FC<PipelinesPageProps> = ({
  API_BASE,
  token,
  theme,
  onOpenCreateDrawer,
  onOpenRunDetails,
  onSwitchToProvisionWizard
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipelines' | 'provision'>('pipelines');
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isLight = theme === 'light';

  useEffect(() => {
    fetchPipelineRuns();
  }, []);

  const fetchPipelineRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pipelines/runs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      } else {
        // Fallback sample pipeline runs for demonstration
        setRuns([
          {
            id: 'run-142',
            pipeline_name: 'DocuAI Processor API',
            project_name: 'DocuAI-Processor',
            run_number: 142,
            status: 'success',
            branch: 'main',
            commit_sha: '82665a9',
            commit_message: 'feat(team): add last_login_at timestamp tracking',
            triggered_by: 'gmenon@esteviatech.com',
            duration_seconds: 84,
            created_at: new Date().toISOString()
          },
          {
            id: 'run-141',
            pipeline_name: 'Estevia Marketing Web',
            project_name: 'Estevia-Corporate-Web',
            run_number: 141,
            status: 'running',
            branch: 'dev',
            commit_sha: '0ef0046',
            commit_message: 'style(team): style Not logged yet fallback badge',
            triggered_by: 'aSharma@esteviatech.com',
            duration_seconds: 42,
            created_at: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: 'run-140',
            pipeline_name: 'ConnectHub Integration Platform',
            project_name: 'ConnectHub-Core',
            run_number: 140,
            status: 'failed',
            branch: 'qa',
            commit_sha: '3c152e1',
            commit_message: 'fix(api): correct CORS origins header',
            triggered_by: 'dev-bot@esteviatech.com',
            duration_seconds: 28,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'run-139',
            pipeline_name: 'PeopleCraft Enterprise HR Core',
            project_name: 'PeopleCraft-HR',
            run_number: 139,
            status: 'success',
            branch: 'main',
            commit_sha: '09429f4',
            commit_message: 'refactor(db): optimize MySQL index query',
            triggered_by: 'gmenon@esteviatech.com',
            duration_seconds: 124,
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.warn('[PipelinesPage] Failed to fetch pipeline runs, using sample dataset.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRuns = runs.filter(r => {
    const matchesSearch = r.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.commit_sha.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={12} /> Success
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header Title & Segmented Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={22} style={{ color: 'var(--accent-purple)' }} />
            <span>Provision & CI/CD Pipelines</span>
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Execute, monitor, and configure serverless CI/CD build pipelines with auto-scaling ephemeral cloud runners.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenCreateDrawer}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}
        >
          <Plus size={16} />
          <span>Create New Pipeline</span>
        </button>
      </div>

      {/* Internal Sub-Navigation Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px',
        borderRadius: '10px',
        background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        marginBottom: '24px',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('pipelines')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: activeSubTab === 'pipelines' ? 'var(--accent-purple)' : 'transparent',
            color: activeSubTab === 'pipelines' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} /> CI/CD Pipelines & Build History
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('provision');
            onSwitchToProvisionWizard();
          }}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: activeSubTab === 'provision' ? 'var(--accent-purple)' : 'transparent',
            color: activeSubTab === 'provision' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={14} /> Provision Infrastructure (Wizard)
        </button>
      </div>

      {/* METRICS SUMMARY GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Pass Rate %
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>98.4%</span>
            <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 6px', borderRadius: '6px' }}>+2.1%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Total Executions (30D)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            1,248 Runs
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Avg Build Duration
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>1m 12s</span>
            <span style={{ fontSize: '0.72rem', color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '2px 6px', borderRadius: '6px' }}>-14s faster</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Active Runner Pods
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} />
            <span>4 Pods</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR & RUNS TABLE */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search pipelines, branch, or commit SHA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                paddingLeft: '34px',
                borderRadius: '8px',
                background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['all', 'success', 'running', 'failed'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: statusFilter === st ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  color: statusFilter === st ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  border: statusFilter === st ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchPipelineRuns}
              style={{ padding: '6px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "spin-anim" : ""} />
            </button>
          </div>
        </div>

        {/* RUNS TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Run / Pipeline</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Branch & Commit</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Triggered By</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Duration</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Recorded At</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                    No pipeline execution runs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.84rem' }}>
                    {/* Pipeline Name */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.pipeline_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>#{r.run_number} • {r.project_name}</div>
                    </td>

                    {/* Branch & Commit */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.branch}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {r.commit_sha}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.commit_message}
                      </div>
                    </td>

                    {/* Triggered By */}
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                      {r.triggered_by}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px' }}>
                      {getStatusBadge(r.status)}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.duration_seconds}s
                    </td>

                    {/* Recorded At */}
                    <td style={{ padding: '14px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: '14px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onOpenRunDetails(r.id)}
                        style={{ padding: '4px 10px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Terminal size={12} /> View Logs
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
