import React, { useState, Fragment } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Search, 
  TrendingDown, 
  AlertTriangle, 
  Settings, 
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Trash2
} from 'lucide-react';
import { SleepScheduler } from '../components/cost/SleepScheduler';

const getBadgeBgColor = (type: string, theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  switch (type.toLowerCase()) {
    case 'frontend':
      return isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.15)';
    case 'backend':
      return isLight ? 'rgba(13, 148, 136, 0.1)' : 'rgba(16, 185, 129, 0.15)';
    case 'database':
      return isLight ? 'rgba(124, 58, 237, 0.1)' : 'rgba(168, 85, 247, 0.15)';
    case 'vm':
      return isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.15)';
    case 'registry':
      return isLight ? 'rgba(75, 85, 99, 0.1)' : 'rgba(156, 163, 175, 0.15)';
    case 'workspace':
      return isLight ? 'rgba(124, 58, 237, 0.08)' : 'rgba(139, 92, 246, 0.15)';
    default:
      return isLight ? 'rgba(75, 85, 99, 0.08)' : 'rgba(156, 163, 175, 0.1)';
  }
};

const getBadgeTextColor = (type: string, theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  switch (type.toLowerCase()) {
    case 'frontend':
      return isLight ? '#2563eb' : '#93c5fd';
    case 'backend':
      return isLight ? '#0d9488' : '#a7f3d0';
    case 'database':
      return isLight ? '#7c3aed' : '#c084fc';
    case 'vm':
      return isLight ? '#d97706' : '#fde047';
    case 'registry':
      return isLight ? '#4b5563' : '#cbd5e1';
    case 'workspace':
      return isLight ? '#6d28d9' : '#a78bfa';
    default:
      return isLight ? '#475569' : '#94a3b8';
  }
};

const getTypePill = (type: string, theme: 'dark' | 'light') => {
  const isLight = theme === 'light';
  const t = type.toLowerCase();
  
  if (t === 'frontend') {
    return (
      <span style={{
        fontSize: '0.66rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: isLight ? '#1e40af' : '#93c5fd',
        background: isLight ? 'rgba(30, 64, 175, 0.1)' : 'rgba(59, 130, 246, 0.15)',
        padding: '2px 8px',
        borderRadius: '10px',
        border: `1px solid ${isLight ? 'rgba(30, 64, 175, 0.2)' : 'rgba(59, 130, 246, 0.25)'}`
      }}>
        SWA
      </span>
    );
  }
  
  if (t === 'backend') {
    return (
      <span style={{
        fontSize: '0.66rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: isLight ? '#065f46' : '#10b981',
        background: isLight ? 'rgba(6, 95, 70, 0.1)' : 'rgba(16, 185, 129, 0.15)',
        padding: '2px 8px',
        borderRadius: '10px',
        border: `1px solid ${isLight ? 'rgba(6, 95, 70, 0.2)' : 'rgba(16, 185, 129, 0.25)'}`
      }}>
        ACA
      </span>
    );
  }
  
  const bg = getBadgeBgColor(type, theme);
  const color = getBadgeTextColor(type, theme);
  return (
    <span style={{
      fontSize: '0.66rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: color,
      background: bg,
      padding: '2px 8px',
      borderRadius: '10px',
      border: `1px solid ${color}30`
    }}>
      {type}
    </span>
  );
};

interface CostPageProps {
  costSummary: any;
  detailedCosts: any[];
  costSuggestions: any[];
  invoices: any[];
  loadingCosts: boolean;
  costError: string | null;
  remediating: string | null;
  costTab: 'breakdown' | 'recommendations' | 'billing' | 'schedules';
  setCostTab: (val: 'breakdown' | 'recommendations' | 'billing' | 'schedules') => void;
  costSearch: string;
  setCostSearch: (val: string) => void;
  envFilter: 'all' | 'production' | 'test' | 'stale';
  setEnvFilter: (val: 'all' | 'production' | 'test' | 'stale') => void;
  handleApplyRemediation: (suggestionId: string, type: string, appName: string) => void;
  theme: 'dark' | 'light';
  deletingAppName?: string | null;
  handleDeleteApp?: (name: string, type: 'frontend' | 'backend') => void;
  currentUser?: { role: string; name?: string; email?: string } | null;
  API_BASE: string;
  organizationId: string;
}

export const CostPage: React.FC<CostPageProps> = ({
  costSummary,
  detailedCosts,
  costSuggestions,
  invoices,
  loadingCosts,
  costError,
  remediating,
  costTab,
  setCostTab,
  costSearch,
  setCostSearch,
  envFilter,
  setEnvFilter,
  handleApplyRemediation,
  theme,
  deletingAppName,
  handleDeleteApp,
  currentUser,
  API_BASE,
  organizationId
}) => {

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isLight = theme === 'light';
  const isViewer = currentUser?.role === 'viewer';

  const nextDueInvoice = invoices && invoices.length > 0
    ? [...invoices]
        .filter(inv => inv.status.toLowerCase() === 'pending' || inv.status.toLowerCase() === 'overdue')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
    : null;

  const filteredCosts = detailedCosts.filter(item => {
    // Search query
    const matchesSearch = item.name.toLowerCase().includes(costSearch.toLowerCase()) ||
                          item.type.toLowerCase().includes(costSearch.toLowerCase());
    
    // Env Filter
    if (envFilter === 'all') return matchesSearch;
    if (envFilter === 'production') {
      const isProd = item.name.toLowerCase().includes('prod') || 
                     (!item.name.toLowerCase().includes('dev') && !item.name.toLowerCase().includes('qa'));
      return matchesSearch && isProd;
    }
    if (envFilter === 'test') {
      const isTest = item.name.toLowerCase().includes('dev') || item.name.toLowerCase().includes('qa');
      return matchesSearch && isTest;
    }
    if (envFilter === 'stale') {
      return matchesSearch && (item.resourceCost === 0 || item.details?.toLowerCase().includes('stale'));
    }
    return matchesSearch;
  });

  // Group by type
  const groups: Record<string, typeof detailedCosts> = {};
  filteredCosts.forEach(item => {
    const typeKey = item.type || 'other';
    if (!groups[typeKey]) {
      groups[typeKey] = [];
    }
    groups[typeKey].push(item);
  });

  // Order keys
  const order = ['frontend', 'backend', 'database', 'vm', 'registry', 'workspace', 'disk', 'network', 'other'];
  const orderedKeys = Object.keys(groups).sort((a, b) => {
    let indexA = order.indexOf(a);
    let indexB = order.indexOf(b);
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    return indexA - indexB;
  });

  const getTypeLabel = (t: string) => {
    switch(t) {
      case 'frontend': return 'Frontend Web Apps (SWA)';
      case 'backend': return 'Backend Services (ACA)';
      case 'database': return 'Database Flexible Servers';
      case 'vm': return 'Virtual Machines';
      case 'registry': return 'Container Registries';
      case 'workspace': return 'Log Analytics Workspaces';
      case 'disk': return 'Managed Disks';
      case 'network': return 'Networking';
      default: return 'Other Resources';
    }
  };

  return (
    <div className="glass-panel cost-green" style={{
      padding: '32px',
      background: 'linear-gradient(150deg, rgba(16, 185, 129, 0.04) 0%, rgba(5, 150, 105, 0.08) 50%, rgba(6, 95, 70, 0.12) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.18)',
      boxShadow: '0 0 40px rgba(16,185,129,0.04), inset 0 0 20px rgba(16,185,129,0.02)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient top glow */}
      <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(52,211,153,0.8), rgba(16,185,129,0.2))', borderRadius: '2px 2px 0 0' }} />

      {/* Scoped green button and layout styles */}
      <style>{`
        .cost-green .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          border-color: #047857 !important;
          color: #ffffff !important;
          box-shadow: 0 2px 12px rgba(16, 185, 129, 0.25) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }
        .cost-green .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4) !important;
          transform: translateY(-1px);
        }
        .cost-green .btn-primary:disabled {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          border-color: #059669 !important;
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 0.45 !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }

        /* Light mode override for cost-green */
        [data-theme="light"] .cost-green {
          background: linear-gradient(150deg, rgba(209, 250, 229, 0.25) 0%, rgba(167, 243, 208, 0.15) 50%, rgba(110, 231, 183, 0.08) 100%) !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.06) !important;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {isViewer && (
        <div className="glass-panel" style={{
          padding: '14px 18px',
          borderColor: 'rgba(217, 119, 6, 0.4)',
          backgroundColor: 'rgba(217, 119, 6, 0.12)',
          color: '#f59e0b',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderRadius: '8px',
          fontWeight: 500,
        }}>
          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>Read-Only Mode: Stale resource deletion and optimization remediations are disabled for the Viewer role.</span>
        </div>
      )}
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <Database size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Monthly Run Rate</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ${costSummary ? costSummary.monthlyRunRate.toFixed(2) : '0.00'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ month</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Potential Savings</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
                ${costSummary ? costSummary.potentialSavings.toFixed(2) : '0.00'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ month</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {costSummary ? costSummary.optimizationScore : '100'}
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Cost Optimization Score</h3>
            <div style={{ height: '6px', width: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${costSummary ? costSummary.optimizationScore : 100}%`, 
                background: (costSummary?.optimizationScore || 100) > 80 ? 'var(--success)' : (costSummary?.optimizationScore || 100) > 60 ? 'var(--warning)' : 'var(--error)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Next Due Bill Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Next Bill Due</h3>
            <div style={{ marginTop: '4px' }}>
              {nextDueInvoice ? (
                <>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${nextDueInvoice.amount.toFixed(2)}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: 'var(--warning)', marginTop: '2px', fontWeight: 600 }}>
                    Due: {nextDueInvoice.due_date}
                  </div>
                </>
              ) : (
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No pending bills
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Sub-tabs */}
      <div className="tabs-container" style={{ 
        marginBottom: '10px', 
        marginTop: '10px', 
        background: 'rgba(255, 255, 255, 0.02)', 
        padding: '6px', 
        borderRadius: '12px', 
        display: 'inline-flex', 
        width: 'auto',
        border: '1px solid var(--glass-border)'
      }}>
        <button 
          type="button"
          className={`tab-btn tab-btn-cost ${costTab === 'breakdown' ? 'active' : ''}`} 
          onClick={() => setCostTab('breakdown')}
          style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}
        >
          Resource Cost Breakdown
        </button>
        <button 
          type="button"
          className={`tab-btn tab-btn-cost ${costTab === 'recommendations' ? 'active' : ''}`} 
          onClick={() => setCostTab('recommendations')}
          style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}
        >
          Optimization Recommendations ({costSuggestions.length})
        </button>
        <button 
          type="button"
          className={`tab-btn tab-btn-cost ${costTab === 'billing' ? 'active' : ''}`} 
          onClick={() => setCostTab('billing')}
          style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}
        >
          Billing & Invoices History
        </button>
        <button 
          type="button"
          className={`tab-btn tab-btn-cost ${costTab === 'schedules' ? 'active' : ''}`} 
          onClick={() => setCostTab('schedules')}
          style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}
        >
          Schedules & Budgets
        </button>
      </div>

      {/* Sub-tab content */}
      {costTab === 'breakdown' ? (
        /* Detailed Cost Table */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Resource Cost Breakdown
          </h3>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', opacity: 0.7 }} />
              <input 
                type="text" 
                placeholder="Filter by resource name..." 
                value={costSearch}
                onChange={(e) => setCostSearch(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '0.82rem', height: '36px' }}
              />
            </div>
            
            <div className="btn-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              {[
                { id: 'all', label: 'All Resources' },
                { id: 'production', label: 'Prod Envs' },
                { id: 'test', label: 'Dev / QA' },
                { id: 'stale', label: 'Idle / Stale' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEnvFilter(opt.id as any)}
                  style={{
                    border: 'none',
                    background: envFilter === opt.id ? 'var(--success)' : 'transparent',
                    color: envFilter === opt.id ? '#ffffff' : 'var(--text-secondary)',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loadingCosts ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <RefreshCw size={20} className="spin-anim" />
              <span>Loading subscription costs...</span>
            </div>
          ) : costError ? (
            <div style={{ color: 'var(--error)' }}>❌ Error: {costError}</div>
          ) : filteredCosts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No resources match current filter criteria.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Resource Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Compute Cost</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>DNS Cost</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Cost</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sizing & Config Details</th>
                </tr>
              </thead>
              <tbody>
                {orderedKeys.map(typeKey => {
                  const items = groups[typeKey];
                  const groupCost = items.reduce((sum, item) => sum + item.totalCost, 0);
                  const isExpanded = !!expandedGroups[typeKey];

                  return (
                    <Fragment key={typeKey}>
                      {/* Group Header Row */}
                      <tr 
                        onClick={() => {
                          setExpandedGroups(prev => ({
                            ...prev,
                            [typeKey]: !prev[typeKey]
                          }));
                        }}
                        style={{ 
                          background: isLight 
                            ? 'rgba(16, 185, 129, 0.08)' 
                            : 'rgba(16, 185, 129, 0.15)', 
                          borderBottom: '1px solid var(--divider)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <td colSpan={4} style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.85rem', color: isLight ? '#065f46' : '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />}
                            <span>{getTypeLabel(typeKey)} ({items.length})</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                          ${groupCost.toFixed(2)}/mo
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {isExpanded ? 'Click to Collapse group' : 'Click to expand group'}
                        </td>
                      </tr>

                      {/* Group Rows (only if expanded) */}
                      {isExpanded && items.map((item) => {
                        const isOrphaned = !item.repositoryUrl && !item.fqdn && 
                          (item.type === 'frontend' || item.type === 'backend' || 
                           item.name.toLowerCase().includes('test') || item.name.toLowerCase().includes('example'));

                        return (
                          <tr key={item.name} style={{ 
                            borderBottom: '1px solid var(--divider)',
                            background: isOrphaned 
                              ? (isLight ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.02)') 
                              : 'transparent',
                            fontSize: '0.86rem'
                          }}>
                            <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ color: isOrphaned ? 'var(--error)' : 'inherit' }}>{item.name}</span>
                                {item.isTestResource && (
                                  <span style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: isLight ? '#475569' : '#94a3b8',
                                    background: isLight ? 'rgba(71, 85, 105, 0.08)' : 'rgba(148, 163, 184, 0.12)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: `1px solid ${isLight ? 'rgba(71, 85, 105, 0.15)' : 'rgba(148, 163, 184, 0.2)'}`
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
                                      background: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                      Stale / Not In Use
                                    </span>
                                    {handleDeleteApp && (item.type === 'frontend' || item.type === 'backend') && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          if (isViewer) return;
                                          e.stopPropagation();
                                          handleDeleteApp(item.name, item.type);
                                        }}
                                        disabled={isViewer || deletingAppName === item.name}
                                        style={{
                                          background: isViewer ? 'rgba(255,255,255,0.01)' : 'rgba(239, 68, 68, 0.15)',
                                          border: isViewer ? '1px solid var(--glass-border)' : '1px solid rgba(239, 68, 68, 0.3)',
                                          color: isViewer ? 'var(--text-muted)' : 'var(--error)',
                                          borderRadius: '4px',
                                          padding: '2px 8px',
                                          fontSize: '0.65rem',
                                          cursor: isViewer ? 'not-allowed' : 'pointer',
                                          fontWeight: 600,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          opacity: isViewer ? 0.6 : 1
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
                              {item.fqdn && (
                                <div style={{ fontSize: '0.75rem', color: isLight ? '#7c3aed' : '#a78bfa', fontWeight: 400, marginTop: '2px' }}>
                                  {item.fqdn}
                                </div>
                              )}
                              {item.repositoryUrl && (
                                <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 400 }}>
                                  <a 
                                    href={item.repositoryUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: isLight ? '#2563eb' : '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <GitBranch size={12} />
                                    {item.repositoryUrl.replace('https://github.com/', '')}
                                  </a>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {getTypePill(item.type, theme)}
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>${item.resourceCost.toFixed(2)}/mo</td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>${item.dnsCost.toFixed(2)}/mo</td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>${item.totalCost.toFixed(2)}/mo</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                fontSize: '0.74rem',
                                color: 'var(--text-secondary)',
                                background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--glass-border)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                display: 'inline-block',
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)'
                              }}>
                                {item.details || 'Production Tier'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : costTab === 'billing' ? (
        /* Billing & Invoices Table */
        <div className="glass-panel" style={{ padding: '32px', background: 'rgba(255, 255, 255, 0.01)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Billing & Invoices History
          </h3>
          {!invoices || invoices.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No invoice records found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Invoice Number</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Due Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const status = inv.status.toLowerCase();
                    const badgeColor = status === 'paid' 
                      ? { color: 'var(--success)', bg: isLight ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.2)' }
                      : status === 'overdue'
                      ? { color: 'var(--error)', bg: isLight ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.2)' }
                      : { color: 'var(--warning)', bg: isLight ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)' };

                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.86rem' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoice_number}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>${inv.amount.toFixed(2)}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{inv.issue_date}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{inv.due_date}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{inv.payment_date || '—'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            color: badgeColor.color,
                            backgroundColor: badgeColor.bg,
                            border: `1px solid ${badgeColor.border}`
                          }}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : costTab === 'schedules' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Schedules & Budgets
          </h3>
          <SleepScheduler API_BASE={API_BASE} organizationId={organizationId} theme={theme} />
        </div>
      ) : (
        /* Optimization Recommendations */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {costSuggestions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
              <h3 style={{ margin: 0 }}>Infrastructure Fully Optimized</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>All Azure resources are correctly provisioned, idle components are scaled, and DNS bindings are active.</p>
            </div>
          ) : (
            costSuggestions.map((suggestion) => {
              const priorityVal = suggestion.priority || suggestion.impact || 'low';
              const isHigh = priorityVal === 'high';
              const isMedium = priorityVal === 'medium';
              const icon = isHigh ? <AlertCircle size={14} /> : isMedium ? <AlertTriangle size={14} /> : <Settings size={14} />;
              const priorityColor = isHigh ? 'var(--error)' : isMedium ? 'var(--warning)' : 'var(--text-secondary)';
              const priorityBg = isHigh ? 'rgba(239, 68, 68, 0.08)' : isMedium ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.04)';
              const titleVal = suggestion.title || suggestion.recommendation || 'Recommendation';
              const resourceNameVal = suggestion.resourceName || suggestion.appName || 'General';
              
              return (
                <div 
                  key={suggestion.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '24px', 
                    borderLeft: `4px solid ${isHigh ? 'var(--error)' : isMedium ? 'var(--warning)' : 'var(--glass-border)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* Card Content Top */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    {/* Header: Icon & Title info */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: priorityBg,
                        border: `1px solid ${priorityColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: priorityColor,
                        flexShrink: 0
                      }}>
                        <TrendingDown size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: '1.3' }}>{titleVal}</h4>
                        <div>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: 700, 
                            color: priorityColor, 
                            background: priorityBg,
                            padding: '1px 6px',
                            borderRadius: '8px',
                            border: `1px solid ${priorityColor}30`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {icon}
                            {priorityVal.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', flex: 1 }}>{suggestion.description}</p>
                    
                    {/* Target resource */}
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--success)', fontWeight: 500 }}>
                      Resource: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{resourceNameVal}</strong>
                    </p>
                  </div>

                  {/* Card Footer: Savings info & Remediation Action */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingTop: '16px', 
                    borderTop: '1px solid var(--divider)' 
                  }}>
                    <div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Savings</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>${suggestion.savings.toFixed(2)}/mo</div>
                    </div>
                    
                    <button
                      className="btn-primary"
                      onClick={() => {
                        if (isViewer) return;
                        handleApplyRemediation(suggestion.id, suggestion.type, resourceNameVal);
                      }}
                      disabled={isViewer || remediating === suggestion.id}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.74rem',
                        height: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: isViewer ? 'not-allowed' : 'pointer',
                        opacity: isViewer ? 0.6 : 1
                      }}
                    >
                      {remediating === suggestion.id ? (
                        <>
                          <RefreshCw size={11} className="spin-anim" />
                          Optimizing...
                        </>
                      ) : (
                        'Remediate'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      </div>
    </div>
  );
};
