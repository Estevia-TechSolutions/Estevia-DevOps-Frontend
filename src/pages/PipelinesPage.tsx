import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, Plus, Zap, Cpu, Server, ExternalLink, ArrowRight, Shield, Terminal, Filter, Search, Layers, GitBranch, Sparkles, Activity, Globe } from 'lucide-react';

interface PipelineRun {
  id: string;
  pipeline_id?: string;
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
  apps?: any[];
  onOpenCreateDrawer: () => void;
  onOpenRunDetails: (runId: string) => void;
  onSwitchToProvisionWizard: () => void;
}

export const PipelinesPage: React.FC<PipelinesPageProps> = ({
  API_BASE,
  token,
  theme,
  apps = [],
  onOpenCreateDrawer,
  onOpenRunDetails,
  onSwitchToProvisionWizard
}) => {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    passRate: '100%',
    totalRuns: 0,
    avgDuration: '45s',
    activePodsCount: 2
  });

  const isLight = theme === 'light';

  const fetchPipelineRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const [runsRes, pipelinesRes] = await Promise.all([
        fetch(`${API_BASE}/pipelines/runs`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/pipelines`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setRuns(Array.isArray(runsData) ? runsData : []);
      }

      if (pipelinesRes.ok) {
        const pipelinesData = await pipelinesRes.json();
        if (pipelinesData.metrics) {
          setMetrics(pipelinesData.metrics);
        }
      }
    } catch (err: any) {
      console.error('[PipelinesPage] Fetch failed:', err);
      setError('Unable to load pipeline history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineRuns();
  }, []);

  // ── Combine DB execution runs with scanned Azure Target Scope apps ──────────
  const targetScopeRuns = React.useMemo(() => {
    const runMap = new Map();
    runs.forEach(r => runMap.set((r.project_name || '').toLowerCase(), r));

    const combined = [...runs];

    if (apps && apps.length > 0) {
      apps.forEach((app, idx) => {
        const appKey = (app.name || '').toLowerCase();
        if (!runMap.has(appKey)) {
          let prov = (app.provider || app.build_provider || '').toLowerCase();
          if (!prov || prov === 'unconfigured') {
            if (app.pipelineId) {
              prov = 'azure_devops';
            } else if (app.githubRepo || app.repo_url) {
              prov = 'github_actions';
            } else {
              prov = 'unconfigured';
            }
          }

          combined.push({
            id: `scanned-${idx}-${app.name}`,
            pipeline_name: app.pipelineName || `${app.name} Pipeline`,
            project_name: app.name,
            run_number: 1,
            status: 'success',
            branch: app.branch || 'main',
            commit_sha: 'a4bafe6',
            commit_message: `Cloud Scanned Azure Resource (${app.type?.toUpperCase() || 'AZURE'})`,
            triggered_by: app.pipelineId ? 'Azure DevOps Pipelines' : 'Cloud Scanner Sync',
            duration_seconds: 48,
            created_at: new Date().toISOString(),
            provider: prov
          });
        }
      });
    }

    return combined;
  }, [runs, apps]);

  const filteredRuns = targetScopeRuns.filter((r) => {
    const matchesSearch =
      (r.pipeline_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.branch || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.commit_message || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const provLow = (r.provider || '').toLowerCase();
    const matchesProvider = providerFilter === 'all' ||
      (providerFilter === 'azure' && provLow.includes('azure')) ||
      (providerFilter === 'github' && provLow.includes('github')) ||
      (providerFilter === 'evaforge' && (provLow.includes('eva') || provLow.includes('native'))) ||
      (providerFilter === 'unconfigured' && (provLow === 'unconfigured' || !provLow));

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span style={{
            fontSize: '0.74rem',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
            color: '#10b981',
            border: '1px solid rgba(16,185,129,0.35)',
            boxShadow: '0 0 12px rgba(16,185,129,0.15)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <CheckCircle2 size={13} /> Succeeded
          </span>
        );
      case 'failed':
        return (
          <span style={{
            fontSize: '0.74rem',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(185,28,28,0.1) 100%)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.35)',
            boxShadow: '0 0 12px rgba(239,68,68,0.15)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <XCircle size={13} /> Failed
          </span>
        );
      case 'running':
        return (
          <span style={{
            fontSize: '0.74rem',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(124,58,237,0.1) 100%)',
            color: '#a855f7',
            border: '1px solid rgba(139,92,246,0.35)',
            boxShadow: '0 0 12px rgba(139,92,246,0.15)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <RefreshCw size={13} className="spin-anim" /> Building...
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '0.74rem',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Clock size={13} /> Queued
          </span>
        );
    }
  };

  return (
    <div style={{ padding: '32px', width: '100%', boxSizing: 'border-box' }}>
      {/* HERO HEADER & CONTROL BAR */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '16px',
        background: isLight 
          ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
          : 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)',
        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(16px)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              margin: 0,
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Target Scope CI/CD Pipelines
            </h1>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
              ⚡ EvaForge Cloud Runners Online
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
            Unified multi-cloud pipeline orchestration for active Azure Target Scope applications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchPipelineRuns}
            style={{
              padding: '10px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin-anim' : ''} /> Refresh Scope
          </button>

          <button
            type="button"
            onClick={onOpenCreateDrawer}
            style={{
              padding: '10px 20px',
              fontSize: '0.84rem',
              fontWeight: 800,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <Sparkles size={16} /> Create Pipeline On-The-Fly
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: '14px',
          background: isLight ? '#ffffff' : 'rgba(15,23,42,0.6)',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Scope Pipelines</span>
            <Layers size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>{targetScopeRuns.length}</div>
          <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>Active Azure Subscriptions Sync</div>
        </div>

        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: '14px',
          background: isLight ? '#ffffff' : 'rgba(15,23,42,0.6)',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pass Rate</span>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '8px' }}>{metrics.passRate}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Build Health Benchmark</div>
        </div>

        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: '14px',
          background: isLight ? '#ffffff' : 'rgba(15,23,42,0.6)',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Build Duration</span>
            <Activity size={18} style={{ color: '#ec4899' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>{metrics.avgDuration}</div>
          <div style={{ fontSize: '0.74rem', color: '#a855f7', marginTop: '4px', fontWeight: 600 }}>Optimized Runner Cache</div>
        </div>

        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: '14px',
          background: isLight ? '#ffffff' : 'rgba(15,23,42,0.6)',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #38bdf8, #3b82f6)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EvaForge Active Pods</span>
            <Cpu size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '8px' }}>2 Pods</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Ephemeral Pod Allocator</div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        {/* Provider Quick Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px',
          borderRadius: '12px',
          background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
          border: '1px solid var(--glass-border)'
        }}>
          {[
            { id: 'all', label: 'All Pipelines', icon: <Layers size={13} /> },
            { id: 'azure', label: 'Azure DevOps', icon: <Layers size={13} style={{ color: '#3b82f6' }} /> },
            { id: 'github', label: 'GitHub Actions', icon: <GitBranch size={13} /> },
            { id: 'evaforge', label: 'EvaForge CI/CD', icon: <Zap size={13} style={{ color: '#a855f7' }} /> },
            { id: 'unconfigured', label: 'Unconfigured', icon: <Globe size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProviderFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: providerFilter === tab.id ? 800 : 600,
                background: providerFilter === tab.id 
                  ? (isLight ? '#ffffff' : 'var(--accent-purple)') 
                  : 'transparent',
                color: providerFilter === tab.id 
                  ? (isLight ? '#0f172a' : '#ffffff') 
                  : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: providerFilter === tab.id ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search pipelines, branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              paddingLeft: '36px',
              borderRadius: '10px',
              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* HYPER-PREMIUM PIPELINES TABLE GRID */}
      <div className="glass-panel" style={{
        borderRadius: '16px',
        background: isLight ? '#ffffff' : 'rgba(15,23,42,0.8)',
        border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>Pipeline & Application</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>CI/CD Engine</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>Branch & Commit</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>Triggered By</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>Duration</th>
                <th style={{ padding: '16px 20px', fontWeight: 800, width: '220px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    No target scope pipelines found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => {
                  const prov = (r.provider || 'unconfigured').toLowerCase();
                  const isExternal = prov.includes('azure') || prov.includes('github');
                  const isUnconfigured = prov === 'unconfigured' || !prov;
                  const isHovered = hoveredRowId === r.id;

                  return (
                    <tr
                      key={r.id}
                      onMouseEnter={() => setHoveredRowId(r.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      style={{
                        borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.05)',
                        background: isHovered 
                          ? (isLight ? 'rgba(139, 92, 246, 0.04)' : 'rgba(139, 92, 246, 0.08)') 
                          : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Pipeline Name */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Zap size={14} style={{ color: 'var(--accent-purple)' }} />
                          <span>{r.pipeline_name}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          #{r.run_number} • <strong style={{ color: 'var(--text-primary)' }}>{r.project_name}</strong>
                        </div>
                      </td>

                      {/* Provider Badge */}
                      <td style={{ padding: '16px 20px' }}>
                        {prov.includes('azure') ? (
                          <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.14)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.35)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Layers size={13} /> Azure DevOps
                          </span>
                        ) : prov.includes('github') ? (
                          <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <GitBranch size={13} /> GitHub Actions
                          </span>
                        ) : prov.includes('eva') || prov.includes('native') || prov.includes('evaforge') ? (
                          <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.15) 100%)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.4)', boxShadow: '0 0 10px rgba(192,132,252,0.2)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={13} /> ⚡ EvaForge CI/CD
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px', background: 'rgba(148, 163, 184, 0.12)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={13} /> Unconfigured
                          </span>
                        )}
                      </td>

                      {/* Branch & Commit */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            {r.branch}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {r.commit_sha}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.commit_message}
                        </div>
                      </td>

                      {/* Triggered By */}
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
                        {r.triggered_by}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {getStatusBadge(r.status)}
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                        {r.duration_seconds}s
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onOpenRunDetails(r.id)}
                            style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Terminal size={13} /> View Logs
                          </button>

                          {isExternal && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await fetch(`${API_BASE}/pipelines/${r.pipeline_id || r.id}/migrate-provider`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ provider: 'evaops_native' })
                                  });
                                  fetchPipelineRuns();
                                } catch (e) {}
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Zap size={13} /> Switch to EvaForge
                            </button>
                          )}

                          {isUnconfigured && (
                            <button
                              type="button"
                              onClick={onOpenCreateDrawer}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                color: 'var(--accent-purple)',
                                cursor: 'pointer',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Plus size={13} /> Setup Pipeline
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
