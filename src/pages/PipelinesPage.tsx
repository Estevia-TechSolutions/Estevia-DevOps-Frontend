import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, Plus, Zap, Cpu, Server, ExternalLink, ArrowRight, Shield, ShieldAlert, Terminal, Filter, Search, Layers, GitBranch, Sparkles, Activity, Globe, Box, Check, CheckCircle, ChevronLeft, ChevronRight, Trash2, Hammer } from 'lucide-react';
import { getNormalizedCodebaseName, resolveAppProvider, hasCiCdConflict, getDynamicTargetBranches } from '../utils/codebase';

interface PipelineRun {
  id: string;
  pipeline_id?: string;
  pipeline_name: string;
  project_name: string;
  run_number: number;
  status: 'queued' | 'running' | 'success' | 'failed' | 'canceled' | string;
  result?: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  triggered_by: string;
  duration_seconds: number;
  created_at: string;
  provider?: string;
  repo_url?: string;
  pipeline_url?: string;
  target_type?: string;
  supported_branches?: string[];
  branches?: { branch: string; target: string; status: string }[];
}


interface PipelinesPageProps {
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
  apps?: any[];
  selectedControlResourceGroup?: string;
  selectedSubscriptionId?: string;
  onOpenCreateDrawer: () => void;
  onOpenRunDetails: (runId: string, branch?: string, provider?: string) => void;
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
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

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

  // Reset pagination on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [apps, searchQuery, providerFilter, statusFilter, pageSize]);

  const handleDeleteEvaForgePipeline = async (pipelineId: string, name: string) => {
    const cleanId = pipelineId.replace(/^scanned-/, '');
    if (window.confirm(`Are you sure you want to delete EvaForge pipeline '${name}'? This action cannot be undone.`)) {
      try {
        const res = await fetch(`${API_BASE}/pipelines/${cleanId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          fetchPipelineRuns();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to delete pipeline');
        }
      } catch (e) {
        console.error('Delete pipeline failed:', e);
      }
    }
  };

  // ── Combine DB execution runs with scanned Azure Target Scope apps ──────────
  const targetScopeRuns = React.useMemo(() => {
    if (!runs || runs.length === 0) {
      if (!apps || apps.length === 0) return [];
      return apps.filter(a => a.type !== 'database' && !(a.name || '').toLowerCase().endsWith('-db')).map(app => {
        // Use the provider already resolved by the backend scan — never guess by resource type
        const prov = (app as any).provider
          || ((app.pipelineId && String(app.pipelineId).startsWith('github-actions:')) ? 'github_actions'
            : (app.pipelineId && /^\d+$/.test(String(app.pipelineId))) ? 'azure_devops'
              : 'unconfigured');

        const repoUrl = (app as any).repositoryUrl || `https://github.com/Estevia-TechSolutions/${app.name}`;
        const pipelineUrl = prov === 'github_actions'
          ? `${repoUrl}/actions`
          : prov === 'evaops_native'
            ? `${repoUrl}/blob/main/.evaforge/config.yml`
            : `https://dev.azure.com/esteviatech/Estevia-Platform/_build/results?buildId=${(app as any).run_number || 1}&view=results`;

        return {
          id: `scanned-${app.name}`,
          pipeline_name: app.pipelineName || `${app.name} Pipeline`,
          project_name: app.name,
          run_number: Number((app as any).run_number || (app as any).buildNumber) || 1,
          status: 'success',
          branch: app.branch || 'main',
          commit_sha: 'a4bafe6',
          commit_message: `Deploy ${app.name} to target multi-branch environment`,
          triggered_by: prov === 'azure_devops' ? 'Azure Pipelines Bot' : prov === 'evaops_native' ? 'EvaForge Engine' : 'GitHub Actions Bot',
          duration_seconds: 48,
          created_at: new Date().toISOString(),
          provider: prov,
          pipeline_url: pipelineUrl,
          repo_url: repoUrl,
          supported_branches: Array.isArray((app as any).supported_branches) && (app as any).supported_branches.length > 0
            ? (app as any).supported_branches
            : ['main'],
          branches: (Array.isArray((app as any).supported_branches) && (app as any).supported_branches.length > 0
            ? (app as any).supported_branches
            : ['main']).map((b: string) => ({
              branch: b,
              target: `${app.name.toLowerCase()}${b === 'main' ? '' : '-' + b}.esteviatech.com (${b.toUpperCase()} Target)`,
              status: 'success'
            }))
        };
      });
    }

    const activeAppNames = (apps && apps.length > 0) ? new Set(apps.map(a => (a.name || '').toLowerCase())) : null;

    // Filter runs to exclude databases and match active Target Scope Resource Group apps
    const scopedRuns = runs.filter(r => {
      if (r.target_type === 'database' || (r.project_name || '').toLowerCase().endsWith('-db')) return false;
      if (!activeAppNames) return true;
      const pNameLow = (r.project_name || '').toLowerCase();
      if (activeAppNames.has(pNameLow)) return true;
      return Array.from(activeAppNames).some(appSlug =>
        appSlug === pNameLow || appSlug.includes(pNameLow) || pNameLow.includes(appSlug)
      );
    });

    // Group & deduplicate runs by exact project_name so each deployed environment app has ONE card in the grid
    const uniqueMap = new Map<string, PipelineRun>();
    scopedRuns.forEach(r => {
      const key = (r.project_name || '').toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { ...r });
      } else {
        const existing = uniqueMap.get(key)!;
        if (hasCiCdConflict(r)) {
          (existing as any).has_cicd_conflict = true;
        }
        if ((!existing.provider || existing.provider === 'unconfigured') && r.provider && r.provider !== 'unconfigured') {
          existing.provider = r.provider;
          existing.pipeline_name = r.pipeline_name;
          existing.pipeline_url = r.pipeline_url;
        }
      }
    });

    return Array.from(uniqueMap.values());
  }, [runs, apps]);

  const filteredRuns = targetScopeRuns.filter((r) => {
    const matchesSearch =
      (r.pipeline_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.branch || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.commit_message || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const effectiveProv = resolveAppProvider(r);
    const isConflict = hasCiCdConflict(r);

    const matchesProvider = providerFilter === 'all' ||
      (providerFilter === 'azure' && effectiveProv === 'azure_devops') ||
      (providerFilter === 'github' && effectiveProv === 'github_actions') ||
      (providerFilter === 'evaforge' && effectiveProv === 'evaops_native') ||
      (providerFilter === 'unconfigured' && effectiveProv === 'unconfigured');

    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Calculate paginated slices
  const totalPages = Math.ceil(filteredRuns.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRuns.length);
  const paginatedRuns = filteredRuns.slice(startIndex, startIndex + pageSize);

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
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
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
              Target Scope Codebase & Pipeline Grid
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
              ⚡ Multi-Branch CI/CD Sync Active
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
            Unified repository pipeline cards showing target branch environments (main, qa, dev) and build history.
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
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Codebase Pipelines</span>
            <Layers size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>{targetScopeRuns.length}</div>
          <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>Active Multi-Branch Pipelines</div>
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
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Environments</span>
            <Cpu size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '8px' }}>3 Envs</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>main (Prod), qa (QA), dev (Dev)</div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
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
            { id: 'all', label: 'All Pipelines', icon: <Layers size={13} />, tooltip: 'Show all CI/CD pipelines scanned in target scope' },
            { id: 'azure', label: 'Azure DevOps', icon: <Layers size={13} style={{ color: '#3b82f6' }} />, tooltip: 'Filter by active Azure DevOps Pipelines' },
            { id: 'github', label: 'GitHub Actions', icon: <GitBranch size={13} style={{ color: '#22c55e' }} />, tooltip: 'Filter by active GitHub Actions workflows' },
            { id: 'evaforge', label: 'EvaForge CI/CD', icon: <Hammer size={13} style={{ color: '#a855f7' }} />, tooltip: 'Filter by native custom EvaForge Pipelines (Beta)' },
            { id: 'unconfigured', label: 'Unconfigured', icon: <Globe size={13} />, tooltip: 'Show resources without CI/CD configuration' }
          ].map(tab => (
            <div
              key={tab.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredTabId(tab.id)}
              onMouseLeave={() => setHoveredTabId(null)}
            >
              <button
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
                {tab.id === 'evaforge' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.52rem', fontWeight: 900, padding: '1px 6px', borderRadius: '4px', background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(139,92,246,0.22))', border: '1px solid rgba(168,85,247,0.55)', color: '#9333ea', letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: '0 0 8px rgba(168,85,247,0.3)', marginLeft: '2px' }}>BETA</span>
                )}
              </button>
              {hoveredTabId === tab.id && (
                <div style={{
                  position: 'absolute',
                  bottom: '135%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                  pointerEvents: 'none',
                  zIndex: 200,
                  transition: 'all 0.15s ease'
                }}>
                  {tab.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search repository pipelines..."
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

      {/* MULTI-ROW PIPELINE CARD GRID (3 COLUMNS) */}
      {filteredRuns.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <Box size={36} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Target Scope Pipelines Found</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Try adjusting your search query or provider filter tabs.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
            marginBottom: '28px'
          }}>
            {paginatedRuns.map((r) => {
              const effectiveProv = resolveAppProvider(r);
              const isConflictCard = hasCiCdConflict(r);
              const isAzure = effectiveProv === 'azure_devops';
              const isGithub = effectiveProv === 'github_actions';
              const isEvaForge = effectiveProv === 'evaops_native';
              const isUnconfigured = effectiveProv === 'unconfigured';
              const isHovered = hoveredCardId === r.id;

              const branchesList = getDynamicTargetBranches(r);

              return (() => {
                // ── Provider accent colour ──────────────────────────────
                const accentColor = isAzure ? '#3b82f6'
                  : isGithub ? '#22c55e'
                    : isEvaForge ? '#a855f7'
                      : '#64748b';

                const accentGradient = isAzure
                  ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                  : isGithub
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : isEvaForge
                      ? 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                      : 'linear-gradient(90deg, #64748b, #94a3b8)';

                // ── Build status pill ────────────────────────────────────
                const rawResult = String((r as any).result || r.status || '').toLowerCase();
                const rawStatus = String(r.status || '').toLowerCase();

                let statusPill: { label: string; color: string; bg: string; border: string; pulse?: boolean } | null = null;
                if (rawResult === 'succeeded' || rawResult === 'success') {
                  statusPill = { label: '✓ Succeeded', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' };
                } else if (rawResult === 'failed') {
                  statusPill = { label: '✕ Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' };
                } else if (rawStatus === 'running' || rawStatus === 'inprogress' || rawResult === 'inprogress') {
                  statusPill = { label: '↻ Building', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', pulse: true };
                } else if (rawStatus === 'queued' || rawResult === 'notstarted') {
                  statusPill = { label: '⏳ Queued', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', pulse: true };
                } else if (rawResult === 'canceled' || rawResult === 'cancelled') {
                  statusPill = { label: '⊘ Canceled', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
                } else if (rawResult === 'never_run' || rawStatus === 'never_run') {
                  statusPill = { label: 'Ø Never Run', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
                }

                // ── Provider icon ────────────────────────────────────────
                const providerIcon = isAzure ? <Layers size={14} style={{ color: accentColor }} />
                  : isGithub ? <GitBranch size={14} style={{ color: accentColor }} />
                    : isEvaForge ? <Hammer size={14} style={{ color: accentColor }} />
                      : <Globe size={14} style={{ color: accentColor }} />;

                const providerLabel = isAzure ? 'Azure DevOps'
                  : isGithub ? 'GitHub Actions'
                    : isEvaForge ? 'EvaForge'
                      : 'Unconfigured';

                // ── Commit short SHA ─────────────────────────────────────
                const shortSha = r.commit_sha ? String(r.commit_sha).slice(0, 7) : null;

                return (
                  <div
                    key={r.id}
                    onMouseEnter={() => setHoveredCardId(r.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="glass-panel"
                    style={{
                      borderRadius: '14px',
                      background: isLight
                        ? '#ffffff'
                        : 'linear-gradient(160deg, rgba(15,23,42,0.9) 0%, rgba(22,32,52,0.75) 100%)',
                      border: isHovered
                        ? `1px solid ${accentColor}55`
                        : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.07)'),
                      boxShadow: isHovered
                        ? `0 8px 28px ${accentColor}22`
                        : '0 4px 16px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.18s ease',
                      transform: isHovered ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    {/* ── ACCENT BAR ─────────────────────────────────── */}
                    <div style={{ height: '3px', background: accentGradient, flexShrink: 0 }} />

                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>

                      {/* ── ZONE 1: HEADER ──────────────────────────── */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        {/* Left: icon + name + sub-label */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                            {providerIcon}
                            <span style={{
                              fontSize: '0.95rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {r.project_name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {effectiveProv === 'github_actions' && r.pipeline_name?.includes('Azure DevOps')
                                ? `GitHub Actions (${r.project_name})`
                                : (r.pipeline_name || `Pipeline · ${r.project_name}`)
                              }
                            </span>
                          </div>
                        </div>

                        {/* Right: status pill */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                          {statusPill && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '20px',
                              background: statusPill.bg,
                              color: statusPill.color,
                              border: `1px solid ${statusPill.border}`,
                              animation: statusPill.pulse ? 'pulse 1.8s infinite' : 'none',
                              whiteSpace: 'nowrap'
                            }}>
                              {statusPill.label}
                            </span>
                          )}
                          {(r as any).has_cicd_conflict && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '5px',
                              background: 'rgba(245,158,11,0.12)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245,158,11,0.3)',
                            }} title="Multiple active CI/CD pipelines detected">
                              <ShieldAlert size={10} /> Conflict
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── LIVE BUILD BANNER (only when actively running) ── */}
                      {(r.status === 'running' || (r as any).in_progress_run) && (
                        <div style={{
                          padding: '7px 11px',
                          borderRadius: '8px',
                          background: 'rgba(59,130,246,0.08)',
                          border: '1px solid rgba(59,130,246,0.25)',
                          borderLeft: '3px solid #3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          animation: 'pulse 1.8s infinite'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.74rem', fontWeight: 700, color: '#3b82f6' }}>
                            <RefreshCw size={12} className="spin-anim" />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {isEvaForge ? <Hammer size={11} /> : isAzure ? <Layers size={11} /> : <GitBranch size={11} />}
                              {isEvaForge ? 'EvaForge' : isAzure ? 'Azure DevOps' : 'GitHub'} Build #{r.run_number} in Progress
                            </span>
                            {isEvaForge && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.52rem', fontWeight: 900, padding: '1px 6px', borderRadius: '4px', background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(139,92,246,0.22))', border: '1px solid rgba(168,85,247,0.55)', color: '#9333ea', letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: '0 0 8px rgba(168,85,247,0.3)' }}>BETA</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenRunDetails(r.id, r.branch || 'main', r.provider)}
                            style={{ padding: '3px 9px', fontSize: '0.68rem', fontWeight: 700, borderRadius: '5px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}
                          >
                            Live Terminal
                          </button>
                        </div>
                      )}

                      {/* ── ZONE 2: BRANCH ROW(S) ───────────────────── */}
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                          Target Environment
                        </div>
                        {branchesList.length === 1 ? (
                          // Single branch — full-width clean row
                          <div
                            onClick={() => onOpenRunDetails(r.id, branchesList[0].branch, r.provider)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.04)',
                              border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLDivElement).style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.07)';
                              (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}55`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLDivElement).style.background = isLight ? '#f8fafc' : 'rgba(255,255,255,0.04)';
                              (e.currentTarget as HTMLDivElement).style.borderColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                background: branchesList[0].branch === 'main' ? 'rgba(59,130,246,0.15)'
                                  : branchesList[0].branch === 'qa' ? 'rgba(245,158,11,0.15)'
                                    : 'rgba(139,92,246,0.15)',
                                color: branchesList[0].branch === 'main' ? '#60a5fa'
                                  : branchesList[0].branch === 'qa' ? '#fbbf24'
                                    : '#c084fc',
                              }}>
                                ⎇ {branchesList[0].branch}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-line' }}>
                                {branchesList[0].target}
                              </span>
                            </div>
                            <ArrowRight size={13} style={{ color: accentColor, opacity: 0.7, flexShrink: 0 }} />
                          </div>
                        ) : (
                          // Multi-branch — compact stacked list
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {branchesList.map((b, bIdx) => (
                              <div
                                key={bIdx}
                                onClick={() => onOpenRunDetails(r.id, b.branch, r.provider)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '6px 10px',
                                  borderRadius: '7px',
                                  background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.07)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                  <span style={{
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.68rem',
                                    fontFamily: 'monospace',
                                    fontWeight: 800,
                                    background: b.branch === 'main' ? 'rgba(59,130,246,0.15)'
                                      : b.branch === 'qa' ? 'rgba(245,158,11,0.15)'
                                        : 'rgba(139,92,246,0.15)',
                                    color: b.branch === 'main' ? '#60a5fa'
                                      : b.branch === 'qa' ? '#fbbf24'
                                        : '#c084fc',
                                  }}>
                                    ⎇ {b.branch}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-line' }}>
                                    {b.target}
                                  </span>
                                </div>
                                <CheckCircle2 size={11} style={{ color: '#22c55e', flexShrink: 0 }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── ZONE 3: COMMIT STRIP ──────────────────────── */}
                      {(r.commit_message || shortSha) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '7px',
                          background: isLight ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.025)',
                          border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                            <GitBranch size={11} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                            <span style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1
                            }}>
                              {r.commit_message || 'No commit message'}
                            </span>
                          </div>
                          {shortSha && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: 'var(--text-secondary)',
                              background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              flexShrink: 0
                            }}>
                              #{shortSha}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── ZONE 4: FOOTER ──────────────────────────────── */}
                    <div style={{
                      padding: '10px 18px',
                      borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      background: isLight ? 'rgba(248,250,252,0.7)' : 'rgba(0,0,0,0.15)'
                    }}>
                      {/* Left actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {(() => {
                          const hasNeverRun = !r.run_number || r.run_number <= 0 || String(r.id).startsWith('unconfigured-') || String(r.status).toLowerCase() === 'never_run';
                          return (
                            <button
                              type="button"
                              disabled={hasNeverRun}
                              onClick={() => onOpenRunDetails(r.id, 'main', r.provider)}
                              title={hasNeverRun ? "No history runs available yet" : "View Branch History"}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '5px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                borderRadius: '6px',
                                background: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
                                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-primary)',
                                cursor: hasNeverRun ? 'not-allowed' : 'pointer',
                                opacity: hasNeverRun ? 0.4 : 1,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Terminal size={12} /> History
                            </button>
                          );
                        })()}

                        {isAzure && (
                          <a
                            href={r.pipeline_url || `https://dev.azure.com/esteviatech/Estevia-Platform/_build/results?buildId=${r.run_number}&view=results`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Azure DevOps"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px',
                              background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                              border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <ExternalLink size={11} /> Azure DevOps
                          </a>
                        )}

                        {isGithub && (
                          <a
                            href={r.repo_url ? `${r.repo_url.replace(/\/$/, '')}/actions` : `https://github.com/Estevia-TechSolutions/${r.project_name}/actions`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in GitHub Actions"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px',
                              background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                              border: '1px solid rgba(34,197,94,0.2)', textDecoration: 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <ExternalLink size={11} /> GitHub Actions
                          </a>
                        )}

                        {isEvaForge && (
                          <button
                            type="button"
                            onClick={() => handleDeleteEvaForgePipeline(r.id, r.project_name)}
                            title="Delete EvaForge Pipeline"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px',
                              background: 'rgba(239,68,68,0.1)', color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        )}

                        {isUnconfigured && (
                          <button
                            type="button"
                            onClick={onOpenCreateDrawer}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 12px', fontSize: '0.72rem', fontWeight: 800, borderRadius: '6px',
                              background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)',
                              border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Plus size={11} /> Setup Pipeline
                          </button>
                        )}
                      </div>

                      {/* Right: Run number pill */}
                      {r.run_number && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '20px',
                          background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)',
                          border: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.08)',
                          flexShrink: 0
                        }}>
                          Run #{r.run_number}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })();
            })}
          </div>

          {/* GLASSMORPHIC PAGINATION CONTROL BAR */}
          <div className="glass-panel" style={{
            padding: '14px 24px',
            borderRadius: '14px',
            background: isLight ? '#ffffff' : 'rgba(15,23,42,0.8)',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{startIndex + 1} - {endIndex}</strong> of <strong style={{ color: 'var(--accent-purple)' }}>{filteredRuns.length}</strong> Pipelines
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Items per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{
                    height: '32px',
                    borderRadius: '8px',
                    background: isLight ? '#f8fafc' : '#1e293b',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    padding: '0 8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                    color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', padding: '0 8px' }}>
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: currentPage >= totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                    color: currentPage >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: currentPage >= totalPages ? 0.5 : 1
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
