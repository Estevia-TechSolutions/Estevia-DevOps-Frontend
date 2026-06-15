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
  Trash2,
  Play,
  Square,
  Lock,
  GitCompare
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
  onResourceControl?: (name: string, action: 'start' | 'stop' | 'restart') => void;
  controllingResource?: string | null;
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
  organizationId,
  onResourceControl,
  controllingResource
}) => {

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activePowerDropdown, setActivePowerDropdown] = useState<string | null>(null);
  const [powerDropdownCoords, setPowerDropdownCoords] = useState<{top: number; left: number} | null>(null);

  // Power action confirmation state
  const [pendingPowerAction, setPendingPowerAction] = useState<{ name: string; action: 'start' | 'stop' | 'restart' } | null>(null);

  // Close dropdown on window scroll to prevent drifting
  React.useEffect(() => {
    const handleScroll = () => {
      setActivePowerDropdown(null);
      setPowerDropdownCoords(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Billing predictive forecast states
  const [forecastData, setForecastData] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12>(3);
  const [isCumulative, setIsCumulative] = useState<boolean>(false);
  const [chartViewMode, setChartViewMode] = useState<'forecast' | 'historical'>('forecast');

  React.useEffect(() => {
    if (costTab === 'billing') {
      const fetchForecast = async () => {
        setLoadingForecast(true);
        try {
          const token = localStorage.getItem('devops_token');
          const res = await fetch(`${API_BASE}/apps/billing/forecast?organizationId=${organizationId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setForecastData(data);
          }
        } catch (err) {
          console.error('Failed to fetch forecast:', err);
        } finally {
          setLoadingForecast(false);
        }
      };
      fetchForecast();
    }
  }, [costTab, API_BASE, organizationId]);

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
        @keyframes play-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 1px rgba(16, 185, 129, 0.4));
            opacity: 0.9;
          }
          50% {
            transform: scale(1.22);
            filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.95));
            opacity: 1;
          }
        }
        .play-pulse-anim {
          animation: play-pulse 2s infinite ease-in-out;
        }

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
                    ${Number(nextDueInvoice.amount).toFixed(2)}
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
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Operations</th>
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
                        <td style={{ padding: '14px 16px' }}></td>
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
                            <td style={{ padding: '14px 16px' }}>
                              {['frontend', 'backend', 'vm'].includes(item.type?.toLowerCase()) ? (
                                (() => {
                                  const isCritical = item.name.toLowerCase().includes('evaops') || 
                                                     item.name.toLowerCase().includes('devops-backend') || 
                                                     item.name.toLowerCase().includes('devops-frontend');
                                  const isControlling = controllingResource === item.name;
                                  const s = (item.status || '').toLowerCase();
                                  const isStarted = s === 'running' || s === 'deployed' || s === 'active';
                                  const isStopped = s === 'stopped' || s === 'sleep' || s === 'offline';

                                  return (() => {
                                    const isOpen = activePowerDropdown === item.name;
                                    const isDisabled = isViewer || isControlling;

                                    // Derive button appearance from runtime state
                                    let btnBg = 'rgba(255,255,255,0.02)';
                                    let btnColor = 'var(--text-secondary)';
                                    let btnBorder = 'var(--glass-border, rgba(255,255,255,0.08))';
                                    let btnText = 'Unknown';
                                    let btnIcon = <Square size={10} />;

                                    if (isControlling) {
                                      btnBg = 'rgba(59,130,246,0.08)'; btnColor = '#3b82f6';
                                      btnBorder = 'rgba(59,130,246,0.2)'; btnText = 'Updating…';
                                      btnIcon = <RefreshCw size={10} className="spin-anim" />;
                                    } else if (isStarted) {
                                      btnBg = 'rgba(16,185,129,0.08)'; btnColor = '#10b981';
                                      btnBorder = 'rgba(16,185,129,0.2)'; btnText = 'Running';
                                      btnIcon = <Play size={10} fill="#10b981" className="play-pulse-anim" />;
                                    } else if (isStopped) {
                                      btnBg = 'rgba(239,68,68,0.08)'; btnColor = '#ef4444';
                                      btnBorder = 'rgba(239,68,68,0.2)'; btnText = 'Stopped';
                                      btnIcon = <Square size={10} fill="#ef4444" />;
                                    }

                                    // Per-action disabled flags
                                    const startDis  = isViewer || isControlling || isStarted  || isCritical;
                                    const restartDis = isViewer || isControlling || isStopped  || isCritical;
                                    const stopDis   = isViewer || isControlling || isStopped  || isCritical;

                                    return (
                                      <div style={{ position: 'relative' }}>
                                        {/* Trigger button */}
                                        <button
                                          type="button"
                                          disabled={isDisabled}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isOpen) {
                                              setActivePowerDropdown(null);
                                              setPowerDropdownCoords(null);
                                            } else {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              setPowerDropdownCoords({ top: rect.bottom + 6, left: rect.right - 130 });
                                              setActivePowerDropdown(item.name);
                                            }
                                          }}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '8px',
                                            backgroundColor: isViewer ? (theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)') : btnBg,
                                            color: isViewer ? (theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)') : btnColor,
                                            border: isViewer ? '1px dashed var(--glass-border)' : `1px solid ${btnBorder}`,
                                            fontSize: '0.72rem', fontWeight: 700,
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            opacity: isViewer ? 0.35 : 1
                                          }}
                                        >
                                          {btnIcon}
                                          <span>{btnText}</span>
                                          <ChevronDown size={12} style={{ opacity: isDisabled ? 0.35 : 0.7 }} />
                                        </button>

                                        {/* Dropdown menu */}
                                        {isOpen && powerDropdownCoords && (() => {
                                          const disabledColor = theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.25)';
                                          const hoverBgColor = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
                                          return (
                                            <>
                                              {/* Backdrop to close on outside click */}
                                              <div
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActivePowerDropdown(null);
                                                  setPowerDropdownCoords(null);
                                                }}
                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998, cursor: 'default' }}
                                              />
                                              <div style={{
                                                position: 'fixed',
                                                top: powerDropdownCoords.top,
                                                left: Math.max(8, powerDropdownCoords.left),
                                                backgroundColor: 'var(--bg-secondary, #0f172a)',
                                                border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                                                borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                                zIndex: 9999, minWidth: '130px',
                                                display: 'flex', flexDirection: 'column',
                                                padding: '4px 0', overflow: 'hidden'
                                              }}>
                                                {/* Start */}
                                                <button
                                                  type="button"
                                                  disabled={startDis}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPendingPowerAction({ name: item.name, action: 'start' });
                                                    setActivePowerDropdown(null);
                                                    setPowerDropdownCoords(null);
                                                  }}
                                                  onMouseEnter={(e) => { if (!startDis) e.currentTarget.style.backgroundColor = hoverBgColor; }}
                                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                  style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '8px 14px', fontSize: '0.75rem',
                                                    background: 'none', border: 'none', width: '100%', textAlign: 'left',
                                                    color: startDis ? disabledColor : 'var(--text-primary)',
                                                    cursor: startDis ? 'not-allowed' : 'pointer',
                                                    opacity: startDis ? 0.35 : 1
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Play size={12} style={{ color: startDis ? disabledColor : '#10b981' }}
                                                      fill={startDis ? 'none' : '#10b981'} />
                                                    <span>Start</span>
                                                  </div>
                                                  {isCritical && <Lock size={10} style={{ color: '#ef4444' }} />}
                                                </button>

                                                {/* Restart */}
                                                <button
                                                  type="button"
                                                  disabled={restartDis}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPendingPowerAction({ name: item.name, action: 'restart' });
                                                    setActivePowerDropdown(null);
                                                    setPowerDropdownCoords(null);
                                                  }}
                                                  onMouseEnter={(e) => { if (!restartDis) e.currentTarget.style.backgroundColor = hoverBgColor; }}
                                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                  style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '8px 14px', fontSize: '0.75rem',
                                                    background: 'none', border: 'none', width: '100%', textAlign: 'left',
                                                    color: restartDis ? disabledColor : 'var(--text-primary)',
                                                    cursor: restartDis ? 'not-allowed' : 'pointer',
                                                    opacity: restartDis ? 0.35 : 1
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <RefreshCw size={12} style={{ color: restartDis ? disabledColor : '#3b82f6' }} />
                                                    <span>Restart</span>
                                                  </div>
                                                  {isCritical && <Lock size={10} style={{ color: '#ef4444' }} />}
                                                </button>

                                                {/* Stop */}
                                                <button
                                                  type="button"
                                                  disabled={stopDis}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPendingPowerAction({ name: item.name, action: 'stop' });
                                                    setActivePowerDropdown(null);
                                                    setPowerDropdownCoords(null);
                                                  }}
                                                  onMouseEnter={(e) => { if (!stopDis) e.currentTarget.style.backgroundColor = hoverBgColor; }}
                                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                  style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '8px 14px', fontSize: '0.75rem',
                                                    background: 'none', border: 'none', width: '100%', textAlign: 'left',
                                                    color: stopDis ? disabledColor : 'var(--text-primary)',
                                                    cursor: stopDis ? 'not-allowed' : 'pointer',
                                                    opacity: stopDis ? 0.35 : 1
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Square size={12} style={{ color: stopDis ? disabledColor : '#ef4444' }}
                                                      fill={stopDis ? 'none' : '#ef4444'} />
                                                    <span>Stop</span>
                                                  </div>
                                                  {isCritical && <Lock size={10} style={{ color: '#ef4444' }} />}
                                                </button>
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    );
                                  })()
                                })()
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>N/A</span>
                              )}
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
          {/* Predictive Forecast Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            marginBottom: '32px', 
            padding: '24px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(255,255,255,0.01)', 
            border: '1px solid var(--glass-border)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {chartViewMode === 'forecast' ? 'Cost Projections & Forecast' : 'Historical Cost History'}
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {chartViewMode === 'forecast' 
                    ? 'Compare your baseline projection with potential savings after applying cost optimization policies.'
                    : 'Trace your actual cloud invoices over past periods using live billing data.'}
                </p>
              </div>
              
              {/* Controls Container */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* Forecast vs Historical Toggle */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setChartViewMode('forecast')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartViewMode === 'forecast' ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                      color: chartViewMode === 'forecast' ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Forecast View
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartViewMode('historical')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartViewMode === 'historical' ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                      color: chartViewMode === 'historical' ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Historical View
                  </button>
                </div>

                {chartViewMode === 'forecast' && (
                  <>
                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setIsCumulative(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: !isCumulative ? '#10b981' : 'transparent',
                          color: !isCumulative ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        Month-on-Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCumulative(true)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isCumulative ? '#10b981' : 'transparent',
                          color: isCumulative ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        Cumulative
                      </button>
                    </div>

                    {/* Timeframe Selector */}
                    <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '8px' }}>
                      {([3, 6, 12] as const).map(months => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setSelectedMonths(months)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: selectedMonths === months ? '#10b981' : 'transparent',
                            color: selectedMonths === months ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          {months} Months
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {chartViewMode === 'historical' ? (
              (() => {
                const sortedInvoices = invoices && invoices.length > 0
                  ? [...invoices].sort((a, b) => {
                      const timeA = a.due_date ? new Date(a.due_date).getTime() : 0;
                      const timeB = b.due_date ? new Date(b.due_date).getTime() : 0;
                      return timeA - timeB;
                    })
                  : [];

                if (sortedInvoices.length === 0) {
                  return (
                    <div className="glass-panel" style={{ 
                      padding: '40px', 
                      textAlign: 'center', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '12px',
                      borderColor: 'rgba(217, 119, 6, 0.2)',
                      backgroundColor: 'rgba(217, 119, 6, 0.04)',
                      borderRadius: '8px'
                    }}>
                      <AlertCircle size={36} style={{ color: 'var(--warning, #f59e0b)' }} />
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>No Live Billing Data Available</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
                        No historical invoice records found to render graph.
                      </p>
                    </div>
                  );
                }

                const maxAmount = Math.max(...sortedInvoices.map(inv => Number(inv.amount)), 1);
                const baseMaxHeight = 140;

                const getInvoiceMonthLabel = (dateStr: string) => {
                  if (!dateStr) return '';
                  const parts = dateStr.split('-');
                  if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // 0-indexed
                    const day = parseInt(parts[2], 10);
                    const d = new Date(year, month, day);
                    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
                  }
                  const d = new Date(dateStr);
                  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
                    {/* Graph Legend */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, var(--accent-purple, #8b5cf6) 0%, #6d28d9 100%)' }} />
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Invoice Spend</span>
                      </div>
                    </div>

                    {/* Custom CSS Bar Chart Container */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '24px', 
                      alignItems: 'flex-end', 
                      height: '210px', 
                      padding: '16px 20px', 
                      backgroundColor: 'rgba(0,0,0,0.15)', 
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      overflowX: 'auto',
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                    }}>
                      {sortedInvoices.map((inv) => {
                        const amountVal = Number(inv.amount);
                        const barHeight = Math.max(15, (amountVal / maxAmount) * baseMaxHeight);
                        const issueMonthLabel = getInvoiceMonthLabel(inv.issue_date);

                        return (
                          <div key={inv.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: '100px',
                            flexShrink: 0
                          }}>
                            {/* Bar Container */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                              height: `${baseMaxHeight + 25}px`,
                              position: 'relative',
                              paddingBottom: '2px'
                            }}>
                              {/* Invoice Single Bar */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                  width: '38px',
                                  height: `${barHeight}px`,
                                  background: 'linear-gradient(180deg, var(--accent-purple, #8b5cf6) 0%, #6d28d9 100%)',
                                  borderRadius: '4px 4px 0 0',
                                  boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)',
                                  position: 'relative',
                                  transition: 'height 0.3s ease-out'
                                }}>
                                  {/* Value Label above the bar */}
                                  <div style={{
                                    position: 'absolute',
                                    top: '-28px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    color: 'var(--text-primary)',
                                    textAlign: 'center',
                                    lineHeight: 1.1
                                  }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.58rem', fontWeight: 500 }}>
                                      {inv.invoice_number}
                                    </div>
                                    <div>
                                      ${amountVal.toFixed(0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Month Label */}
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {issueMonthLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Details / Text Summary (rendered below the graph) */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      padding: '20px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--glass-border)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          backgroundColor: 'rgba(139, 92, 246, 0.12)', 
                          color: 'var(--accent-purple, #8b5cf6)', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(139, 92, 246, 0.2)' 
                        }}>
                          Historical Invoices Summary
                        </span>
                      </div>
                      
                      <h5 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Total Invoiced Spend: <span style={{ color: 'var(--accent-purple, #8b5cf6)' }}>${sortedInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0).toFixed(2)} USD</span>
                      </h5>
                      
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        This details the total sum of all invoices fetched from your live billing logs. A total of <strong>{sortedInvoices.length} invoices</strong> have been recorded in this subscription, including paid, pending, and overdue balances.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Paid Invoices</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--success)' }}>
                            ${sortedInvoices.filter(inv => inv.status.toLowerCase() === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Pending / Overdue</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--warning)' }}>
                            ${sortedInvoices.filter(inv => inv.status.toLowerCase() !== 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Average Invoice</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                            ${(sortedInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0) / sortedInvoices.length).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : loadingForecast ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0' }}>
                <RefreshCw size={16} className="spin-anim" style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calculating projection...</span>
              </div>
            ) : forecastData ? (
              (() => {
                const forecast = forecastData.forecast[selectedMonths];
                const baseline = forecast.baseline;
                const optimized = forecast.optimized;
                const savings = forecast.savings;
                
                const monthsArray = Array.from({ length: selectedMonths }, (_, i) => i + 1);
                const maxVal = isCumulative ? (forecastData.monthlyBaselineRunRate * selectedMonths) : forecastData.monthlyBaselineRunRate;
                const baseMaxHeight = 140; // max height of baseline bar
                const today = new Date();

                const getMonthLabel = (m: number) => {
                  const d = new Date(today.getFullYear(), today.getMonth() + m, 1);
                  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
                    {/* Graph Legend */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #64748b 0%, #334155 100%)' }} />
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Baseline Run-Rate</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' }} />
                        <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 500 }}>Optimized Spend</span>
                      </div>
                    </div>

                    {/* Custom CSS Bar Chart Container */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '24px', 
                      alignItems: 'flex-end', 
                      height: '210px', 
                      padding: '16px 20px', 
                      backgroundColor: 'rgba(0,0,0,0.15)', 
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      overflowX: 'auto',
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                    }}>
                      {monthsArray.map((m) => {
                        const baselineVal = isCumulative 
                          ? Math.round(forecastData.monthlyBaselineRunRate * m)
                          : Math.round(forecastData.monthlyBaselineRunRate);
                        const optimizedVal = isCumulative
                          ? Math.round((forecastData.monthlyBaselineRunRate - forecastData.monthlySavings) * m)
                          : Math.round(forecastData.monthlyBaselineRunRate - forecastData.monthlySavings);
                        const baselineHeight = Math.max(15, (baselineVal / maxVal) * baseMaxHeight);
                        const optimizedHeight = Math.max(15, (optimizedVal / maxVal) * baseMaxHeight);

                        return (
                          <div key={m} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: '96px',
                            flexShrink: 0
                          }}>
                            {/* Bars Container */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              gap: '8px',
                              height: `${baseMaxHeight + 25}px`,
                              position: 'relative',
                              paddingBottom: '2px'
                            }}>
                              {/* Baseline Bar */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                  width: '34px',
                                  height: `${baselineHeight}px`,
                                  background: 'linear-gradient(180deg, #64748b 0%, #334155 100%)',
                                  borderRadius: '4px 4px 0 0',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                  position: 'relative',
                                  transition: 'height 0.3s ease-out'
                                }}>
                                  <span style={{
                                    position: 'absolute',
                                    top: '-18px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    color: 'var(--text-secondary)'
                                  }}>
                                    ${baselineVal}
                                  </span>
                                </div>
                              </div>

                              {/* Optimized Bar */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                  width: '34px',
                                  height: `${optimizedHeight}px`,
                                  background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
                                  borderRadius: '4px 4px 0 0',
                                  boxShadow: '0 4px 10px rgba(16,185,129,0.2)',
                                  position: 'relative',
                                  transition: 'height 0.3s ease-out'
                                }}>
                                  <span style={{
                                    position: 'absolute',
                                    top: '-18px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    color: '#10b981'
                                  }}>
                                    ${optimizedVal}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Month Label */}
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {getMonthLabel(m)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Details / Text Summary (rendered below the graph) */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      padding: '20px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--glass-border)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                          color: '#10b981', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(16,185,129,0.2)' 
                        }}>
                          Saves ${savings} USD ({( (savings / baseline) * 100 ).toFixed(0)}% lower run-rate)
                        </span>
                      </div>
                      
                      <h5 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Projected Savings: <span style={{ color: '#10b981' }}>${savings} USD</span>
                      </h5>
                      
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Over the next <strong>{selectedMonths} months</strong>, executing scheduled hibernation policies on dev sandbox VMs and scaling down idle ACAs can reduce your overall cloud spending from <strong style={{ textDecoration: 'line-through' }}>${baseline}</strong> down to <strong>${optimized}</strong>.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Monthly Baseline</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                            ${forecastData.monthlyBaselineRunRate.toFixed(2)}/mo
                          </span>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Projected Savings</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#10b981' }}>
                            -${forecastData.monthlySavings.toFixed(2)}/mo
                          </span>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Total Period Cost (Without Savings)</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                            ${Number(baseline).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Total Period Cost (With Savings)</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#10b981' }}>
                            ${Number(optimized).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Methodology Footnote */}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', marginTop: '8px', fontStyle: 'italic', borderTop: '1px dashed var(--glass-border)', paddingTop: '8px' }}>
                        * Note: Projections are computed cumulatively based on your historical invoice average (Baseline Run-Rate) compared against estimated savings from scheduled sandbox VM hibernations and container app replica scaling policies.
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Could not load cost forecast projections.</span>
            )}
          </div>

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
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>${Number(inv.amount).toFixed(2)}</td>
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
      {/* Power Control Confirmation Modal */}
      {pendingPowerAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '24px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--modal-shadow)',
            position: 'relative',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Confirm Action
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Are you sure you want to <strong style={{ color: pendingPowerAction.action === 'stop' ? 'var(--error)' : 'var(--success)' }}>{pendingPowerAction.action.toUpperCase()}</strong> the resource <strong>{pendingPowerAction.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn-secondary"
                onClick={() => setPendingPowerAction(null)}
                style={{ padding: '8px 20px', fontSize: '0.82rem', flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (onResourceControl && pendingPowerAction) {
                    onResourceControl(pendingPowerAction.name, pendingPowerAction.action);
                  }
                  setPendingPowerAction(null);
                }}
                style={{
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  flex: 1,
                  background: pendingPowerAction.action === 'stop' 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: pendingPowerAction.action === 'stop' ? '1px solid #dc2626' : '1px solid #059669'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
