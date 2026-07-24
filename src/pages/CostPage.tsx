import React, { useState, Fragment, useRef, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Search, 
  TrendingDown, 
  TrendingUp,
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
  GitCompare,
  Sparkles,
  Brain,
  MessageSquare,
  Send,
  X,
  Activity,
  Network,
  CreditCard,
  PieChart,
  Calendar,
  Zap,
  Maximize2,
  FileText,
  DollarSign
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
  appliedSuggestions: any[];
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
  mode?: 'cost' | 'optimization';
  fetchCostData?: () => void;
}

export const CostPage: React.FC<CostPageProps> = ({
  costSummary,
  detailedCosts,
  costSuggestions,
  appliedSuggestions,
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
  controllingResource,
  fetchCostData,
  mode: propMode = 'optimization'
}) => {

  const mode = (costTab === 'breakdown' || costTab === 'billing') ? 'cost' : 'optimization';
  const activeTabToShow = costTab;

  const branchToEnv = (branch: string): 'dev' | 'qa' | 'prod' | null => {
    const b = branch.toLowerCase().trim();
    if (b === 'main' || b === 'master' || b === 'prod' || b === 'production' || b === 'release') return 'prod';
    if (b === 'dev' || b === 'develop' || b === 'development') return 'dev';
    if (b === 'qa' || b === 'staging' || b === 'test' || b === 'testing') return 'qa';
    return null;
  };

  const getVnetName = (item: any): string | null => {
    if (item.type === 'frontend') {
      const configuredBackendUrl = item.azureResourceDetails?.configuredBackendUrl;
      if (configuredBackendUrl) {
        let host = '';
        try {
          const urlObj = new URL(configuredBackendUrl);
          host = urlObj.hostname;
        } catch (e) {
          host = configuredBackendUrl.replace(/^https?:\/\//i, '').split('/')[0];
        }
        const allBackends = detailedCosts.filter(a => a.type === 'backend');
        const matchingBackend = allBackends.find(b => {
          const bHost = b.hostname || b.azureResourceDetails?.hostname || '';
          const bDns = b.fqdn || '';
          const hasFqdnMatch = b.fqdns ? b.fqdns.some((f: string) => f.toLowerCase().includes(host.toLowerCase())) : false;
          return (
            bHost.toLowerCase().includes(host.toLowerCase()) ||
            bDns.toLowerCase().includes(host.toLowerCase()) ||
            hasFqdnMatch ||
            host.toLowerCase().includes(b.name.toLowerCase())
          );
        });
        if (matchingBackend) {
          const backendVnet = getVnetName(matchingBackend);
          if (backendVnet) {
            return `None (Public SWA) → Talks to Backend VNet: ${backendVnet}`;
          }
        }
      }
      return 'None (Public Cloud)';
    }

    const details = item.azureResourceDetails;
    if (!details) return null;
    if (details.vnetName) return details.vnetName;
    const subnetId = details.vnetSubnetID || details.delegatedSubnetResourceId || details.agentPoolProfiles?.[0]?.vnetSubnetID;
    if (subnetId) {
      const parts = subnetId.split(/\/virtualnetworks\//i);
      const match = parts[1]?.split('/')[0];
      if (match) return match;
    }
    return null;
  };

  const hasEnvSegment = (n: string, seg: string) =>
    new RegExp(`-${seg}(-|$)`).test(n);

  const getEnvTag = (item: any): { color: string; bg: string; border: string; label: string } => {
    const ENV_COLORS: Record<string, { color: string; bg: string; border: string; label: string }> = {
      dev:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)',  label: 'DEV'  },
      qa:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  label: 'QA'   },
      prod: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)',  label: 'PROD' },
    };

    if (item.branch) {
      const fromBranch = branchToEnv(item.branch);
      if (fromBranch) return ENV_COLORS[fromBranch];
    }
    const n = item.name.toLowerCase();
    if (hasEnvSegment(n, 'dev'))  return ENV_COLORS.dev;
    if (hasEnvSegment(n, 'qa'))   return ENV_COLORS.qa;
    if (hasEnvSegment(n, 'prod')) return ENV_COLORS.prod;
    return ENV_COLORS.prod;
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activePowerDropdown, setActivePowerDropdown] = useState<string | null>(null);
  const [powerDropdownCoords, setPowerDropdownCoords] = useState<{top: number; left: number} | null>(null);

  // Power action confirmation state
  const [pendingPowerAction, setPendingPowerAction] = useState<{ name: string; action: 'start' | 'stop' | 'restart' } | null>(null);
  const [showImplemented, setShowImplemented] = useState<boolean>(false);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'AZURE' | 'EVA'>('ALL');
  const [askQuestion, setAskQuestion] = useState<string>('');
  const [evaChat, setEvaChat] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [askingEva, setAskingEva] = useState<boolean>(false);
  const [isEvaOpen, setIsEvaOpen] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEvaOpen) {
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [evaChat, isEvaOpen]);

  const simulateTypewriter = (text: string) => {
    let currentText = '';
    const words = text.split(' ');
    let index = 0;
    
    setEvaChat(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);
    
    const interval = setInterval(() => {
      if (index < words.length) {
        currentText += (index === 0 ? '' : ' ') + words[index];
        setEvaChat(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: currentText };
          return updated;
        });
        index++;
      } else {
        clearInterval(interval);
        setAskingEva(false);
      }
    }, 45);
  };

  const handleAskEva = async (questionText: string) => {
    if (!questionText.trim() || askingEva) return;
    setAskingEva(true);
    setEvaChat(prev => [...prev, { role: 'user', content: questionText }]);
    setAskQuestion('');

    try {
      const token = localStorage.getItem('devops_token');
      const response = await fetch(`${API_BASE}/apps/cost/ask-eva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: questionText, organizationId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          simulateTypewriter(data.answer);
        } else {
          setEvaChat(prev => [...prev, { role: 'assistant', content: 'Sorry, I failed to process that question. Please try again.' }]);
          setAskingEva(false);
        }
      } else {
        setEvaChat(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t communicate with the backend. Please try again.' }]);
        setAskingEva(false);
      }
    } catch (err) {
      console.error('Ask Eva error:', err);
      setEvaChat(prev => [...prev, { role: 'assistant', content: 'An unexpected error occurred. Please try again.' }]);
      setAskingEva(false);
    }
  };

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

  // Helper to format currency symbol (₹ for INR, $ for USD, € for EUR, etc.)
  const getCurrencySymbol = (currencyStr?: string) => {
    if (!currencyStr) return '₹';
    const c = String(currencyStr).toUpperCase();
    if (c === 'INR' || c === '₹') return '₹';
    if (c === 'USD' || c === '$') return '$';
    if (c === 'EUR' || c === '€') return '€';
    if (c === 'GBP' || c === '£') return '£';
    return '₹';
  };

  // Azure Cloud Infrastructure Billing & Forecast states
  const [azureBills, setAzureBills] = useState<any[]>([]);
  const [loadingAzureBills, setLoadingAzureBills] = useState<boolean>(false);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12>(3);
  const [isCumulative, setIsCumulative] = useState<boolean>(false);
  const [chartViewMode, setChartViewMode] = useState<'forecast' | 'historical'>('forecast');
  const [expandedCostChart, setExpandedCostChart] = useState<{ title: string; type: string } | null>(null);

  // Fetch Azure Infrastructure Cloud Bills
  React.useEffect(() => {
    const fetchAzureBills = async () => {
      const url = `${API_BASE}/apps/cost/azure-bills?organizationId=${organizationId}`;
      console.log(`[BillingFetch] Starting Azure Cloud Bills fetch request. URL: ${url}`);
      setLoadingAzureBills(true);
      try {
        const token = localStorage.getItem('evaops_token') || localStorage.getItem('devops_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let res = await fetch(url, { headers }).catch((err) => {
          console.error(`[BillingFetch] API request connection failed:`, err);
          return null;
        });

        if (res) {
          console.log(`[BillingFetch] Received API response. Status: ${res.status} (${res.statusText})`);
          if (res.ok) {
            const data = await res.json();
            console.log(`[BillingFetch] Successfully parsed response JSON:`, data);
            if (data.azureBills && data.azureBills.length > 0) {
              console.log(`[BillingFetch] Set ${data.azureBills.length} Azure bills to frontend state:`, data.azureBills);
              setAzureBills(data.azureBills);
              return;
            } else {
              console.warn(`[BillingFetch] Mapped 'azureBills' array is empty.`);
            }
          } else {
            console.error(`[BillingFetch] Server responded with error status.`);
          }
        }

        // Fallback Azure Cloud Bills data
        console.log(`[BillingFetch] Defaulting to empty fallback array.`);
        setAzureBills([]);
      } catch (err) {
        console.error('[BillingFetch] Unexpected error parsing Azure bills:', err);
      } finally {
        setLoadingAzureBills(false);
      }
    };
    fetchAzureBills();
  }, [API_BASE, organizationId]);

  // Compute Forecast strictly from Azure Cloud Bills baseline
  React.useEffect(() => {
    if (activeTabToShow === 'billing') {
      console.log(`[BillingForecast] Recalculating forecast. Input bills payload count: ${azureBills ? azureBills.length : 0}`);
      const baseRunRate = (azureBills && azureBills.length > 0)
        ? (azureBills.reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0) / azureBills.length)
        : (costSummary ? (costSummary.totalCost || 480) : 480);

      const monthlySavings = Math.round(baseRunRate * 0.22); // ~22% optimization savings
      console.log(`[BillingForecast] Computed Baseline Run-Rate: $${baseRunRate.toFixed(2)} | Projected Savings: $${monthlySavings.toFixed(2)}`);

      setForecastData({
        success: true,
        monthlyBaselineRunRate: Number(baseRunRate.toFixed(2)),
        monthlySavings,
        currency: 'USD',
        forecast: {
          3: { baselineTotal: Math.round(baseRunRate * 3), optimizedTotal: Math.round((baseRunRate - monthlySavings) * 3), periodSavings: Math.round(monthlySavings * 3) },
          6: { baselineTotal: Math.round(baseRunRate * 6), optimizedTotal: Math.round((baseRunRate - monthlySavings) * 6), periodSavings: Math.round(monthlySavings * 6) },
          12: { baselineTotal: Math.round(baseRunRate * 12), optimizedTotal: Math.round((baseRunRate - monthlySavings) * 12), periodSavings: Math.round(monthlySavings * 12) }
        }
      });
    }
  }, [activeTabToShow, azureBills, costSummary]);

  const isLight = theme === 'light';
  const isViewer = currentUser?.role === 'viewer';

  const nextDueInvoice = (() => {
    if (azureBills && azureBills.length > 0) {
      const latestBill = [...azureBills].sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
      if (latestBill) {
        return {
          amount: Number(latestBill.total_amount || 0),
          due_date: latestBill.due_date,
          currency: latestBill.currency || 'INR'
        };
      }
    }
    if (invoices && invoices.length > 0) {
      const pending = [...invoices]
        .filter(inv => (inv.status || '').toLowerCase() === 'pending' || (inv.status || '').toLowerCase() === 'overdue')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
      if (pending) {
        return {
          amount: Number(pending.amount || 0),
          due_date: pending.due_date,
          currency: pending.currency || 'USD'
        };
      }
    }
    return null;
  })();

  const filteredCosts = detailedCosts.filter(item => {
    // Search query
    const matchesSearch = item.name.toLowerCase().includes(costSearch.toLowerCase()) ||
                          item.type.toLowerCase().includes(costSearch.toLowerCase());
    
    // Env Filter
    if (envFilter === 'all') return matchesSearch;
    if (envFilter === 'production') {
      const tag = getEnvTag(item).label;
      return matchesSearch && tag === 'PROD';
    }
    if (envFilter === 'test') {
      const tag = getEnvTag(item).label;
      return matchesSearch && (tag === 'DEV' || tag === 'QA');
    }
    if (envFilter === 'stale') {
      const isOrphaned = !item.repositoryUrl && !item.fqdn && !item.fqdns?.length && 
        (item.type === 'frontend' || item.type === 'backend' || 
         item.name.toLowerCase().includes('test') || item.name.toLowerCase().includes('example'));
      const isStaleName = item.name.toLowerCase().includes('test') || 
                          item.name.toLowerCase().includes('stale') || 
                          item.name.toLowerCase().includes('temp') ||
                          item.name.toLowerCase().includes('sandbox') ||
                          item.name.toLowerCase().includes('demo');
      return matchesSearch && (
        item.resourceCost === 0 || 
        item.details?.toLowerCase().includes('stale') || 
        isOrphaned || 
        isStaleName
      );
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
      position: 'relative', overflow: 'visible',
    }}>
      {/* Ambient top glow */}
      <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(52,211,153,0.8), rgba(16,185,129,0.2))', borderRadius: '2px 2px 0 0' }} />

      {/* Scoped green button and layout styles */}
      <style>{`
        .opt-hover-wrapper:hover .opt-hover-card {
          visibility: visible !important;
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) !important;
          z-index: 999999 !important;
        }
        .opt-hover-wrapper:hover {
          z-index: 999999 !important;
        }
        tr:hover {
          position: relative;
          z-index: 200 !important;
        }
        .opt-hover-wrapper:hover .table-opt-hover-card {
          visibility: visible !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

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

        /* Inactive tab button styles override for clarity */
        .cost-green .tab-btn-cost:not(.active) {
          color: rgba(255, 255, 255, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          background: rgba(255, 255, 255, 0.01) !important;
          transition: all 0.2s ease !important;
        }
        .cost-green .tab-btn-cost:not(.active):hover {
          color: #ffffff !important;
          background: rgba(16, 185, 129, 0.08) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
        }
        [data-theme="light"] .cost-green .tab-btn-cost:not(.active) {
          color: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(15, 23, 42, 0.08) !important;
          background: rgba(0, 0, 0, 0.02) !important;
        }
        [data-theme="light"] .cost-green .tab-btn-cost:not(.active):hover {
          color: #059669 !important;
          background: rgba(16, 185, 129, 0.06) !important;
          border-color: rgba(16, 185, 129, 0.25) !important;
        }

        @keyframes float-pulse {
          0%, 100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.45), 0 0 15px rgba(139, 92, 246, 0.2) !important;
          }
          50% {
            transform: scale(1.05) translateY(-4px);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.6), 0 0 25px rgba(139, 92, 246, 0.4) !important;
          }
        }

        .eva-float-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)) !important;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.45), 0 0 15px rgba(139, 92, 246, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #ffffff !important;
          cursor: pointer !important;
          z-index: 10000 !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          outline: none !important;
          animation: float-pulse 3s infinite ease-in-out !important;
        }
        .eva-float-btn:hover {
          transform: scale(1.1) translateY(-2px) !important;
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.6), 0 0 25px rgba(139, 92, 246, 0.4) !important;
        }
        .eva-float-btn:active {
          transform: scale(0.95) !important;
        }

        .cost-green .source-filter-btn {
          transition: all 0.2s ease !important;
        }
        .cost-green .source-filter-btn:not(.active):hover {
          color: var(--text-primary) !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        [data-theme="light"] .cost-green .source-filter-btn:not(.active):hover {
          color: var(--text-primary) !important;
          background: rgba(0, 0, 0, 0.04) !important;
        }

        @keyframes thinking-drawer-glow {
          0%, 100% {
            box-shadow: -15px 0 35px rgba(139, 92, 246, 0.45), -30px 0 70px rgba(139, 92, 246, 0.2), inset 0 0 25px rgba(139, 92, 246, 0.15);
            border-left-color: rgba(139, 92, 246, 0.6) !important;
          }
          33% {
            box-shadow: -22px 0 45px rgba(236, 72, 153, 0.65), -44px 0 85px rgba(236, 72, 153, 0.3), inset 0 0 35px rgba(236, 72, 153, 0.25);
            border-left-color: rgba(236, 72, 153, 0.8) !important;
          }
          66% {
            box-shadow: -28px 0 55px rgba(59, 130, 246, 0.75), -56px 0 100px rgba(59, 130, 246, 0.4), inset 0 0 45px rgba(59, 130, 246, 0.35);
            border-left-color: rgba(59, 130, 246, 0.9) !important;
          }
        }
        .thinking-drawer-active {
          animation: thinking-drawer-glow 2.5s infinite ease-in-out !important;
          border-left: 2px solid rgba(139, 92, 246, 0.6) !important;
        }

        @keyframes thinking-orb-pulse {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            background: radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, rgba(59, 130, 246, 0.12) 50%, transparent 70%);
            filter: blur(40px);
          }
          33% {
            transform: scale(1.2) translate(-15px, 15px);
            background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(139, 92, 246, 0.18) 50%, transparent 70%);
            filter: blur(35px);
          }
          66% {
            transform: scale(0.85) translate(15px, -10px);
            background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%);
            filter: blur(45px);
          }
        }
        .thinking-orb-active {
          animation: thinking-orb-pulse 5s infinite alternate ease-in-out !important;
        }

        .thinking-dots-container {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 4px;
        }
        .thinking-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #c084fc;
          animation: thinking-bounce 1.4s infinite ease-in-out both;
        }
        .thinking-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .thinking-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes thinking-bounce {
          0%, 80%, 100% {
            transform: scale(0.3);
            opacity: 0.3;
          }
          40% {
            transform: scale(1.1);
            opacity: 1;
            box-shadow: 0 0 10px rgba(192, 132, 252, 0.9);
          }
        }

        .quick-consult-trigger-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .quick-consult-trigger-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.2) !important;
          background: rgba(139, 92, 246, 0.08) !important;
          color: #c084fc !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .quick-consult-trigger-btn:hover {
          background: rgba(139, 92, 246, 0.16) !important;
          color: #d8b4fe !important;
          transform: translateY(-1px);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.25);
        }
        .quick-consult-hover-card {
          position: absolute;
          bottom: 48px;
          left: 0;
          width: 320px;
          background: rgba(15, 23, 42, 0.96);
          backdrop-filter: blur(25px) saturate(120%);
          WebkitBackdropFilter: blur(25px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.15);
          display: none;
          opacity: 0;
          flex-direction: column;
          gap: 10px;
          z-index: 10002;
          transform: translateY(8px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          pointer-events: none;
        }
        [data-theme="light"] .quick-consult-hover-card {
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.15), 0 0 20px rgba(139, 92, 246, 0.08) !important;
        }
        .quick-consult-trigger-container:hover .quick-consult-hover-card {
          display: flex !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
          pointer-events: auto;
        }
        .quick-consult-item-btn {
          background: rgba(139, 92, 246, 0.03) !important;
          border: 1px solid rgba(139, 92, 246, 0.12) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 0.74rem !important;
          color: var(--text-secondary) !important;
          text-align: left !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          line-height: 1.35 !important;
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .quick-consult-item-btn:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.08) !important;
          border-color: rgba(139, 92, 246, 0.45) !important;
          color: var(--text-primary) !important;
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.12) !important;
        }
        .quick-consult-item-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
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
      {mode === 'cost' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative', zIndex: 10 }}>
          {/* Monthly Run Rate */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
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
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Monthly Run Rate
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                Sum of month-to-date costs for all tracked Azure resources within the Resource Group. Calculated dynamically from live Azure Cost Management API data or fallback pricing configurations.
              </div>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
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
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Potential Savings
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                Estimated monthly savings achievable by applying all currently outstanding recommendations (e.g. scaling down idle resources, scheduling shutdowns, connection pooling).
              </div>
            </div>
          </div>

          {/* Cost Optimization Score */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
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
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '6px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Cost Optimization Score
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 650, marginBottom: '6px' }}>
                Formula: Score = 100 - Penalty
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: '8px' }}>
                Calculated by dividing potential savings by total monthly cost to get a Savings Ratio. The penalty is the rounded percentage of this ratio, capped at 50 (guaranteeing a minimum score floor of 50).
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Penalty = Min(50, Round(Savings Ratio * 100))
              </div>
            </div>
          </div>

          {/* Next Bill Due */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
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
                      {getCurrencySymbol(nextDueInvoice.currency)}{Number(nextDueInvoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div style={{ fontSize: '0.74rem', color: 'var(--warning)', marginTop: '2px', fontWeight: 600 }}>
                      Due: {nextDueInvoice.due_date} ({nextDueInvoice.currency})
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    No pending bills
                  </span>
                )}
              </div>
            </div>
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Next Bill Due
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                The amount and due date of the next invoice registered in the system database for active custom domain names and integrations.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {/* Optimization Score */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
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
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Optimization Score</h3>
              <div style={{ height: '6px', width: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${costSummary ? costSummary.optimizationScore : 100}%`, 
                  background: (costSummary?.optimizationScore || 100) > 80 ? 'var(--success)' : (costSummary?.optimizationScore || 100) > 60 ? 'var(--warning)' : 'var(--error)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '6px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Cost Optimization Score
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 650, marginBottom: '6px' }}>
                Formula: Score = 100 - Penalty
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: '8px' }}>
                Calculated by dividing potential savings by total monthly cost to get a Savings Ratio. The penalty is the rounded percentage of this ratio, capped at 50 (guaranteeing a minimum score floor of 50).
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Penalty = Min(50, Round(Savings Ratio * 100))
              </div>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
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
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Potential Savings</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
                  ${costSummary ? costSummary.potentialSavings.toFixed(2) : '0.00'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ month</span>
              </div>
            </div>
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Potential Savings
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                Estimated monthly savings achievable by applying all currently outstanding recommendations (e.g. scaling down idle resources, scheduling shutdowns, connection pooling).
              </div>
            </div>
          </div>

          {/* Active Recommendations Card */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(245, 158, 11, 0.1)', position: 'relative', cursor: 'help' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning, #f59e0b)'
            }}>
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Recommendations</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning, #f59e0b)' }}>
                  {costSuggestions.length}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>active</span>
              </div>
            </div>
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Active Recommendations
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                Number of pending recommendations flagged by Azure Advisor and Eva AI telemetry that have not yet been remediated.
              </div>
            </div>
          </div>

          {/* Implemented Remedies Card */}
          <div className="glass-panel opt-hover-wrapper" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(16, 185, 129, 0.1)', position: 'relative', cursor: 'help' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Implemented Remedies</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
                  {appliedSuggestions.length}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>resolved</span>
              </div>
            </div>
            <div className="opt-hover-card" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              top: '105%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              width: '280px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.45',
            }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                Implemented Remedies
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                Number of recommendations that have been successfully applied to optimize the resource configuration.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Sub-tabs */}
      <div style={{ 
        background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.3)', 
        padding: '6px', 
        borderRadius: '12px', 
        display: 'inline-flex', 
        alignItems: 'center',
        gap: '6px',
        width: 'fit-content',
        border: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
      }}>
        {[
          { key: 'breakdown', label: 'Resource Cost Breakdown', Icon: PieChart },
          { key: 'billing', label: 'Azure Invoices & Billing', Icon: CreditCard },
          { key: 'recommendations', label: 'Optimization Recommendations', Icon: Zap },
          { key: 'schedules', label: 'Schedules & Budgets', Icon: Calendar }
        ].map(tab => {
          const isActive = activeTabToShow === tab.key;
          const IconComp = tab.Icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`tab-btn tab-btn-cost ${isActive ? 'active' : ''}`}
              onClick={() => setCostTab(tab.key as any)}
              style={{
                fontSize: '0.84rem',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: isActive ? 700 : 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <IconComp size={16} style={{ color: isActive ? '#fff' : (isLight ? '#64748b' : 'var(--text-secondary)') }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {activeTabToShow === 'breakdown' ? (
        /* Detailed Cost Table */
        <div className="glass-panel" style={{ padding: '32px', position: 'relative', zIndex: 1 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--error)', padding: '10px 0' }}>
              <span>❌ Error: {costError}</span>
              {fetchCostData && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fetchCostData()}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} />
                  Retry Cost Fetch
                </button>
              )}
            </div>
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
                        const isOrphaned = !item.repositoryUrl && !item.fqdn && !item.fqdns?.length && 
                          (item.type === 'frontend' || item.type === 'backend' || 
                           item.name.toLowerCase().includes('test') || item.name.toLowerCase().includes('example'));

                        const activeRec = (costSuggestions || []).find(s => 
                          s.appName?.toLowerCase() === item.name?.toLowerCase() || 
                          (s.id && (String(s.id).includes(String(item.id)) || String(s.id).includes(item.name)))
                        );
                        const appliedRec = (appliedSuggestions || []).find(s => 
                          s.appName?.toLowerCase() === item.name?.toLowerCase() || 
                          (s.id && (String(s.id).includes(String(item.id)) || String(s.id).includes(item.name)))
                        );

                        return (
                          <tr key={item.name} style={{ 
                            borderBottom: '1px solid var(--divider)',
                            background: isOrphaned 
                              ? (isLight ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.02)') 
                              : 'transparent',
                            fontSize: '0.86rem'
                          }}>
                            <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', minWidth: 0 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: 0 }}>
                                 {/* First Line: Resource Name and potentially Delete button */}
                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0 }}>
                                   <span style={{ 
                                     color: isOrphaned ? 'var(--error)' : 'inherit',
                                     whiteSpace: 'nowrap',
                                     textOverflow: 'ellipsis',
                                     overflow: 'hidden',
                                     minWidth: 0,
                                     display: 'inline-block'
                                   }}>
                                     {item.name}
                                   </span>
                                   
                                   {isOrphaned && handleDeleteApp && (item.type === 'frontend' || item.type === 'backend') && (
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

                                 {/* Second Line: Env Tag, Stale, and Optimize/Remedied pills */}
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                                    {(() => {
                                      const tag = getEnvTag(item);
                                      return (
                                        <span style={{
                                          fontSize: '0.62rem',
                                          fontWeight: 700,
                                          textTransform: 'uppercase',
                                          color: tag.color,
                                          background: tag.bg,
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          border: `1px solid ${tag.border}`
                                        }}>
                                          {tag.label}
                                        </span>
                                      );
                                    })()}
                                    {isOrphaned && (
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
                                    )}
                                    {activeRec && (
                                      <div className="opt-hover-wrapper" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Sparkles 
                                          size={11} 
                                          style={{ 
                                            color: '#fbbf24', 
                                            filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.4))'
                                          }} 
                                        />
                                        <span style={{
                                          fontSize: '0.62rem',
                                          fontWeight: 700,
                                          color: '#fbbf24',
                                          background: 'rgba(255, 191, 36, 0.08)',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          border: '1px solid rgba(255, 191, 36, 0.18)',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.03em',
                                          cursor: 'help'
                                        }}>
                                          Optimize
                                        </span>
                                        <div className="table-opt-hover-card" style={{
                                          visibility: 'hidden',
                                          opacity: 0,
                                          position: 'absolute',
                                          bottom: '130%',
                                          left: '0',
                                          background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                                          backdropFilter: 'blur(16px)',
                                          WebkitBackdropFilter: 'blur(16px)',
                                          border: '1px solid var(--glass-border)',
                                          color: 'var(--text-primary)',
                                          padding: '12px',
                                          borderRadius: '8px',
                                          fontSize: '0.74rem',
                                          width: '220px',
                                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                                          pointerEvents: 'none',
                                          zIndex: 9999,
                                          transform: 'translateY(8px)',
                                          transition: 'all 0.2s ease-in-out',
                                          whiteSpace: 'normal',
                                          textAlign: 'left',
                                          lineHeight: '1.4'
                                        }}>
                                          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                                            Optimization Recommended
                                          </div>
                                          <div style={{ color: 'var(--text-primary)', fontWeight: 650, marginBottom: '6px' }}>
                                            {activeRec.recommendation || activeRec.title}
                                          </div>
                                          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.7rem' }}>
                                            {activeRec.description}
                                          </div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Est. Savings:</span>
                                            <span style={{ color: 'var(--success)' }}>${activeRec.savings.toFixed(2)}/mo</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {appliedRec && (
                                      <div className="opt-hover-wrapper" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle2 
                                          size={11} 
                                          style={{ 
                                            color: 'var(--success)', 
                                            filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))'
                                          }} 
                                        />
                                        <span style={{
                                          fontSize: '0.62rem',
                                          fontWeight: 700,
                                          color: 'var(--success)',
                                          background: 'rgba(16, 185, 129, 0.08)',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          border: '1px solid rgba(16, 185, 129, 0.18)',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.03em',
                                          cursor: 'help'
                                        }}>
                                          Remedied
                                        </span>
                                        <div className="table-opt-hover-card" style={{
                                          visibility: 'hidden',
                                          opacity: 0,
                                          position: 'absolute',
                                          bottom: '130%',
                                          left: '0',
                                          background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                                          backdropFilter: 'blur(16px)',
                                          WebkitBackdropFilter: 'blur(16px)',
                                          border: '1px solid var(--glass-border)',
                                          color: 'var(--text-primary)',
                                          padding: '12px',
                                          borderRadius: '8px',
                                          fontSize: '0.74rem',
                                          width: '220px',
                                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                                          pointerEvents: 'none',
                                          zIndex: 9999,
                                          transform: 'translateY(8px)',
                                          transition: 'all 0.2s ease-in-out',
                                          whiteSpace: 'normal',
                                          textAlign: 'left',
                                          lineHeight: '1.4'
                                        }}>
                                          <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em' }}>
                                            Remediation Applied
                                          </div>
                                          <div style={{ color: 'var(--text-primary)', fontWeight: 650, marginBottom: '6px' }}>
                                            {appliedRec.recommendation || appliedRec.title}
                                          </div>
                                          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.7rem' }}>
                                            Optimized & active. Runtime costs are successfully reduced.
                                          </div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Monthly Savings:</span>
                                            <span style={{ color: 'var(--success)' }}>${appliedRec.savings.toFixed(2)}/mo</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                               </div>
                              {item.fqdn && (
                                 <div style={{ fontSize: '0.75rem', color: isLight ? '#7c3aed' : '#a78bfa', fontWeight: 400, marginTop: '2px' }}>
                                   {item.fqdns && item.fqdns.length > 0 ? item.fqdns.join(', ') : item.fqdn}
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
                              {getVnetName(item) && (
                                <div style={{ 
                                  fontSize: '0.72rem', 
                                  marginTop: '4px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  color: 'var(--text-secondary)',
                                  fontWeight: 400
                                }}>
                                  <Network size={12} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                  <span>VNet/VPC:</span>
                                  <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getVnetName(item)}</strong>
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
      ) : activeTabToShow === 'billing' ? (
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
            border: '1px solid var(--glass-border)',
            overflow: 'visible',
            position: 'relative',
            zIndex: 50
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                <button
                  type="button"
                  onClick={() => setExpandedCostChart({ title: chartViewMode === 'forecast' ? 'Cost Projections & Forecast' : 'Historical Azure Bills & Invoices', type: chartViewMode })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                    color: isLight ? '#475569' : 'var(--text-primary)',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Maximize2 size={13} /> Expand View
                </button>
              </div>
            </div>

            {/* View Mode & Timeframe Selector Bar */}
            {chartViewMode === 'forecast' && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                {/* View Mode Toggle */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '8px' }}>
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
                <div style={{ display: 'flex', gap: '6px', backgroundColor: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '8px' }}>
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
              </div>
            )}

            {/* Render Selected View: Historical Azure Bills or Forecast Projections */}
            {chartViewMode === 'historical' ? (
              (() => {
                const sortedAzureBills = azureBills && azureBills.length > 0
                  ? [...azureBills].sort((a, b) => {
                      const timeA = a.billing_period ? new Date(a.billing_period + '-01').getTime() : 0;
                      const timeB = b.billing_period ? new Date(b.billing_period + '-01').getTime() : 0;
                      return timeA - timeB;
                    })
                  : [];

                if (sortedAzureBills.length === 0) {
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
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>No Azure Cloud Billing Data Available</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
                        No historical Azure subscription consumption records found to render graph.
                      </p>
                    </div>
                  );
                }

                const maxAmount = Math.max(...sortedAzureBills.map(b => Number(b.total_amount || 0)), 1);
                const baseMaxHeight = 160;

                const getBillPeriodLabel = (periodStr: string) => {
                  if (!periodStr) return '';
                  const parts = periodStr.split('-');
                  if (parts.length === 2) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const d = new Date(year, month, 1);
                    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
                  }
                  return periodStr;
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
                    {/* Graph Color Legends */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.76rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLight ? '#334155' : '#cbd5e1' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#8b5cf6' }} />
                        <span>🟣 ACA Compute</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLight ? '#334155' : '#cbd5e1' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }} />
                        <span>🔵 MySQL Flexible Server</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLight ? '#334155' : '#cbd5e1' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#06b6d4' }} />
                        <span>🩵 SWA & CDN</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLight ? '#334155' : '#cbd5e1' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
                        <span>🟢 Storage & VMs</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLight ? '#334155' : '#cbd5e1' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366f1' }} />
                        <span>🟣 Network Egress</span>
                      </div>
                    </div>

                    {/* Stacked Itemized Bar Chart Container */}
                    <div style={{
                      position: 'relative',
                      paddingTop: '180px',
                      overflowX: 'auto',
                      overflowY: 'visible',
                      scrollbarWidth: 'thin'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '28px', 
                        alignItems: 'flex-end', 
                        height: '230px', 
                        padding: '20px 24px', 
                        backgroundColor: isLight ? '#f8fafc' : 'rgba(0,0,0,0.25)', 
                        borderRadius: '12px',
                        border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        overflow: 'visible'
                      }}>
                      {sortedAzureBills.map((b) => {
                        const totalVal = Number(b.total_amount || 0);
                        const acaVal = b.aca_compute_amount !== undefined && b.aca_compute_amount !== null ? Number(b.aca_compute_amount) : (totalVal * 0.38);
                        const mysqlVal = b.mysql_db_amount !== undefined && b.mysql_db_amount !== null ? Number(b.mysql_db_amount) : (totalVal * 0.30);
                        const swaVal = b.swa_cdn_amount !== undefined && b.swa_cdn_amount !== null ? Number(b.swa_cdn_amount) : (totalVal * 0.14);
                        const storageVal = b.storage_vm_amount !== undefined && b.storage_vm_amount !== null ? Number(b.storage_vm_amount) : (totalVal * 0.10);
                        const egressVal = b.network_egress_amount !== undefined && b.network_egress_amount !== null ? Number(b.network_egress_amount) : (totalVal * 0.08);

                        const totalHeightPct = Math.max(20, (totalVal / maxAmount) * baseMaxHeight);
                        const periodLabel = getBillPeriodLabel(b.billing_period);

                        const currSym = getCurrencySymbol(b.currency);
                        const currCode = (b.currency || 'INR').toUpperCase();
                        const safeTotal = totalVal || 1;

                        return (
                          <div key={b.id || b.invoice_number} className="opt-hover-wrapper" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: '105px',
                            flexShrink: 0,
                            position: 'relative'
                          }}>
                            {/* Rich Glassmorphism Tooltip Card */}
                            <div className="opt-hover-card" style={{
                              visibility: 'hidden',
                              opacity: 0,
                              position: 'absolute',
                              top: '-165px',
                              bottom: 'auto',
                              left: '50%',
                              transform: 'translateX(-50%) translateY(5px)',
                              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text-primary)',
                              padding: '16px',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              width: '260px',
                              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                              pointerEvents: 'none',
                              zIndex: 99999,
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              whiteSpace: 'normal',
                              textAlign: 'left',
                              lineHeight: '1.45',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--divider)', paddingBottom: '6px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: isLight ? '#0f172a' : '#fff' }}>
                                  Period: {b.billing_period}
                                </span>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: (b.status || '').toLowerCase() === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: (b.status || '').toLowerCase() === 'paid' ? '#10b981' : '#f59e0b' }}>
                                  {b.status || 'Paid'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b5cf6', fontWeight: 600 }}>
                                  <span>🟣 ACA Compute:</span>
                                  <span>{currSym}{acaVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6', fontWeight: 600 }}>
                                  <span>🔵 MySQL DB:</span>
                                  <span>{currSym}{mysqlVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4', fontWeight: 600 }}>
                                  <span>🩵 SWA & CDN:</span>
                                  <span>{currSym}{swaVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                                  <span>🟢 Storage & VMs:</span>
                                  <span>{currSym}{storageVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1', fontWeight: 600 }}>
                                  <span>🟣 Network Egress:</span>
                                  <span>{currSym}{egressVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.75rem', color: isLight ? '#64748b' : '#cbd5e1' }}>Total Azure Bill:</span>
                                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#10b981', fontFamily: 'monospace' }}>
                                  {currSym}{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currCode}
                                </span>
                              </div>
                            </div>

                            {/* Stacked Bar */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column-reverse',
                              width: '42px',
                              height: `${totalHeightPct}px`,
                              borderRadius: '6px 6px 0 0',
                              overflow: 'hidden',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              cursor: 'pointer',
                              position: 'relative'
                            }}>
                              <div style={{ height: `${(acaVal / safeTotal) * 100}%`, background: '#8b5cf6' }} />
                              <div style={{ height: `${(mysqlVal / safeTotal) * 100}%`, background: '#3b82f6' }} />
                              <div style={{ height: `${(swaVal / safeTotal) * 100}%`, background: '#06b6d4' }} />
                              <div style={{ height: `${(storageVal / safeTotal) * 100}%`, background: '#10b981' }} />
                              <div style={{ height: `${(egressVal / safeTotal) * 100}%`, background: '#6366f1' }} />

                              {/* Value badge on top of bar */}
                              <div style={{
                                position: 'absolute',
                                top: '-24px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                fontFamily: 'monospace',
                                color: isLight ? '#0f172a' : '#ffffff',
                                whiteSpace: 'nowrap'
                              }}>
                                {currSym}{totalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </div>
                            </div>

                            {/* Month & Ref Label */}
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)', textTransform: 'uppercase' }}>
                                {periodLabel}
                              </div>
                              <div style={{ fontSize: '0.62rem', color: isLight ? '#64748b' : 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {b.invoice_number}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>

                    {/* Azure Billing Summary Scorecard */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px', 
                      backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)', 
                      padding: '20px', 
                      borderRadius: '12px', 
                      border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          backgroundColor: 'rgba(59, 130, 246, 0.12)', 
                          color: '#3b82f6', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(59, 130, 246, 0.2)' 
                        }}>
                          Azure Infrastructure Cloud Billing Summary
                        </span>
                      </div>
                      
                      <h5 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                        Total Historical Azure Spend: <span style={{ color: '#3b82f6' }}>${sortedAzureBills.reduce((sum, b) => sum + Number(b.total_amount || 0), 0).toFixed(2)} USD</span>
                      </h5>
                      
                      <p style={{ margin: 0, fontSize: '0.82rem', color: isLight ? '#475569' : 'var(--text-secondary)', lineHeight: '1.5' }}>
                        This represents actual Azure Subscription cloud infrastructure consumption across <strong>{sortedAzureBills.length} monthly billing periods</strong> (Container Apps, MySQL Flexible Servers, Static Web Apps CDN, Storage, and Egress Bandwidth).
                      </p>
                      
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '6px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)', paddingTop: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Subscription ID</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: '#8b5cf6' }}>
                            {sortedAzureBills[0]?.azure_subscription_id || 'sub-estevia-devops-prod-01'}
                          </span>
                        </div>
                        <div style={{ borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)', paddingLeft: '24px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Average Monthly Run-Rate</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--success)' }}>
                            ${(sortedAzureBills.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) / sortedAzureBills.length).toFixed(2)} / mo
                          </span>
                        </div>
                        <div style={{ borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)', paddingLeft: '24px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Highest Monthly Bill</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            ${Math.max(...sortedAzureBills.map(b => Number(b.total_amount || 0))).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : forecastData ? (
              (() => {
                const forecastObj = forecastData.forecast[selectedMonths] || { baselineTotal: 1440, optimizedTotal: 1123, periodSavings: 317 };
                const baseline = forecastObj.baselineTotal;
                const optimized = forecastObj.optimizedTotal;
                const savings = forecastObj.periodSavings;
                
                const monthsArray = Array.from({ length: selectedMonths }, (_, i) => i + 1);
                const maxVal = isCumulative ? (forecastData.monthlyBaselineRunRate * selectedMonths) : forecastData.monthlyBaselineRunRate;
                const baseMaxHeight = 140;
                const today = new Date();

                const getMonthLabel = (m: number) => {
                  const d = new Date(today.getFullYear(), today.getMonth() + m, 1);
                  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
                    {/* Graph Legend */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #64748b 0%, #334155 100%)' }} />
                        <span style={{ fontSize: '0.74rem', color: isLight ? '#475569' : 'var(--text-secondary)', fontWeight: 500 }}>Baseline Azure Cloud Spend</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' }} />
                        <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>Optimized Net Azure Spend</span>
                      </div>
                    </div>

                    {/* Bar Chart Container */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '24px', 
                      alignItems: 'flex-end', 
                      height: '210px', 
                      padding: '16px 20px', 
                      backgroundColor: isLight ? '#f8fafc' : 'rgba(0,0,0,0.15)', 
                      borderRadius: '10px',
                      border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                      overflowX: 'auto',
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      scrollbarWidth: 'thin'
                    }}>
                      {monthsArray.map((m) => {
                        const baselineVal = isCumulative 
                          ? Math.round(forecastData.monthlyBaselineRunRate * m)
                          : Math.round(forecastData.monthlyBaselineRunRate);
                        const optimizedVal = isCumulative
                          ? Math.round((forecastData.monthlyBaselineRunRate - forecastData.monthlySavings) * m)
                          : Math.round(forecastData.monthlyBaselineRunRate - forecastData.monthlySavings);
                        const baselineHeight = Math.max(15, (baselineVal / (maxVal || 1)) * baseMaxHeight);
                        const optimizedHeight = Math.max(15, (optimizedVal / (maxVal || 1)) * baseMaxHeight);

                        return (
                          <div key={m} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: '96px',
                            flexShrink: 0
                          }}>
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
                                  position: 'relative'
                                }}>
                                  <span style={{
                                    position: 'absolute',
                                    top: '-18px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    color: isLight ? '#475569' : 'var(--text-secondary)'
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
                                  position: 'relative'
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

                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: isLight ? '#475569' : 'var(--text-secondary)',
                              textTransform: 'uppercase'
                            }}>
                              {getMonthLabel(m)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Card */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px', 
                      backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.01)', 
                      padding: '20px', 
                      borderRadius: '10px', 
                      border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)' 
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
                          Saves ${savings} USD ({( (savings / (baseline || 1)) * 100 ).toFixed(0)}% lower run-rate)
                        </span>
                      </div>
                      
                      <h5 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                        Projected Savings: <span style={{ color: '#10b981' }}>${savings} USD</span>
                      </h5>
                      
                      <p style={{ margin: 0, fontSize: '0.82rem', color: isLight ? '#475569' : 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Over the next <strong>{selectedMonths} months</strong>, executing scheduled hibernation policies on dev sandbox VMs and scaling down idle ACAs can reduce your overall cloud spending from <strong style={{ textDecoration: 'line-through' }}>${baseline}</strong> down to <strong>${optimized}</strong>.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '6px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)', paddingTop: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Monthly Baseline</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            ${forecastData.monthlyBaselineRunRate?.toFixed(2)}/mo
                          </span>
                        </div>
                        <div style={{ borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Projected Savings</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#10b981' }}>
                            -${forecastData.monthlySavings?.toFixed(2)}/mo
                          </span>
                        </div>
                        <div style={{ borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Total Period Cost (Without Savings)</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            ${Number(baseline).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)', paddingLeft: '20px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Total Period Cost (With Savings)</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#10b981' }}>
                            ${Number(optimized).toFixed(2)}
                          </span>
                        </div>
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
            <FileText size={20} style={{ color: '#3b82f6' }} /> Azure Subscription Invoices & Consumption Billing History
          </h3>
          {!azureBills || azureBills.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No Azure subscription billing records found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Billing Period & Invoice Ref</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Azure Resource Spend Breakdown</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Azure Bill</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Due Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {azureBills.map((bill) => {
                    const status = (bill.status || 'Paid').toLowerCase();
                    const badgeColor = status === 'paid' 
                      ? { color: 'var(--success)', bg: isLight ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.2)' }
                      : status === 'overdue'
                      ? { color: 'var(--error)', bg: isLight ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.2)' }
                      : { color: 'var(--warning)', bg: isLight ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)' };

                    const currSym = getCurrencySymbol(bill.currency);
                    const currCode = (bill.currency || 'INR').toUpperCase();

                    return (
                      <tr key={bill.id || bill.invoice_number} style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.86rem' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 700 }}>Period: {bill.billing_period}</div>
                              <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                                Ref: <span style={{ fontFamily: 'monospace', padding: '1px 6px', borderRadius: '4px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)' }}>#{bill.invoice_number}</span> | Sub: <span style={{ fontFamily: 'monospace' }}>{bill.azure_subscription_id || 'sub-estevia-devops-prod-01'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.7rem' }}>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontWeight: 600 }}>
                              ACA: {currSym}{Number(bill.aca_compute_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 600 }}>
                              MySQL: {currSym}{Number(bill.mysql_db_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontWeight: 600 }}>
                              SWA: {currSym}{Number(bill.swa_cdn_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                              Storage/VM: {currSym}{Number(bill.storage_vm_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                          {currSym}{Number(bill.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currCode}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{bill.issue_date}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{bill.due_date}</td>
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
                            {bill.status || 'Paid'}
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
      ) : activeTabToShow === 'schedules' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Schedules & Budgets
          </h3>
          <SleepScheduler API_BASE={API_BASE} organizationId={organizationId} theme={theme} />
        </div>
      ) : (
        /* Optimization Recommendations */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Filters and Toggle Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '10px'
          }}>
            {/* Source Filter pills */}
            <div style={{ 
              display: 'flex', 
              background: 'rgba(255,255,255,0.02)', 
              padding: '3px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)' 
            }}>
              {[
                { id: 'ALL', label: 'All Recommendations' },
                { id: 'AZURE', label: 'Azure Advisor' },
                { id: 'EVA', label: 'Eva AI' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSourceFilter(opt.id as any)}
                  className={`source-filter-btn ${sourceFilter === opt.id ? 'active' : ''}`}
                  style={{
                    border: 'none',
                    background: sourceFilter === opt.id 
                      ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                      : 'transparent',
                    color: sourceFilter === opt.id ? '#ffffff' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Implemented Toggle Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Show Implemented Remedies
              </span>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '46px',
                height: '24px'
              }}>
                <input 
                  type="checkbox" 
                  checked={showImplemented}
                  onChange={(e) => setShowImplemented(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: showImplemented ? 'var(--success)' : 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--glass-border)',
                  transition: '.3s',
                  borderRadius: '24px'
                }} />
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '16px',
                  width: '16px',
                  left: showImplemented ? '25px' : '4px',
                  bottom: '4px',
                  backgroundColor: '#ffffff',
                  transition: '.3s',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </label>
            </div>
          </div>

          {/* Recommendations List Container (Full Width) */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loadingCosts ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <RefreshCw size={36} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                <h3 style={{ margin: 0 }}>Analyzing Optimization Recommendations...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
                  Querying live telemetry and Azure Advisor parameters...
                </p>
              </div>
            ) : (() => {
              let activeList = showImplemented ? appliedSuggestions : costSuggestions;
              
              // Apply source filter
              if (sourceFilter === 'AZURE') {
                activeList = activeList.filter(s => s.source === 'Azure Advisor');
              } else if (sourceFilter === 'EVA') {
                activeList = activeList.filter(s => s.source === 'Eva AI');
              }

              if (activeList.length === 0) {
                return (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                    <h3 style={{ margin: 0 }}>
                      {showImplemented ? 'No Implemented Remedies Yet' : 'Infrastructure Fully Optimized'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0 }}>
                      {showImplemented 
                        ? 'Trigger optimizations by clicking the Remediate action button on active suggestions.'
                        : 'No active cost optimization recommendations found matching the filters.'}
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', gap: '20px' }}>
                  {activeList.map((suggestion) => {
                    const priorityVal = suggestion.priority || suggestion.impact || 'low';
                    const isHigh = priorityVal === 'high';
                    const isMedium = priorityVal === 'medium';
                    const icon = isHigh ? <AlertCircle size={14} /> : isMedium ? <AlertTriangle size={14} /> : <Settings size={14} />;
                    const priorityColor = isHigh ? 'var(--error)' : isMedium ? 'var(--warning)' : 'var(--text-secondary)';
                    const priorityBg = isHigh ? 'rgba(239, 68, 68, 0.08)' : isMedium ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.04)';
                    const titleVal = suggestion.title || suggestion.recommendation || 'Recommendation';
                    const resourceNameVal = suggestion.resourceName || suggestion.appName || 'General';
                    const isSuggestionApplied = !!suggestion.applied || showImplemented;
                    const sourceVal = suggestion.source || 'Azure Advisor';
                    const isEvaSource = sourceVal === 'Eva AI';

                    const sourceBadgeStyle = isEvaSource
                      ? { background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc' }
                      : { background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa' };

                    return (
                      <div 
                        key={suggestion.id} 
                        className="glass-panel" 
                        style={{ 
                          padding: '24px', 
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '20px',
                          height: '100%',
                          background: isEvaSource 
                            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)'
                            : 'rgba(255, 255, 255, 0.01)',
                          border: isEvaSource
                            ? '1px solid rgba(124, 58, 237, 0.18)'
                            : '1px solid var(--glass-border)',
                          borderLeft: `4px solid ${isSuggestionApplied ? 'var(--success)' : (isHigh ? 'var(--error)' : isMedium ? 'var(--warning)' : 'var(--glass-border)')}`,
                          boxShadow: isEvaSource
                            ? '0 4px 20px rgba(124, 58, 237, 0.04)'
                            : 'none',
                          transition: 'all 0.25s ease',
                          opacity: isSuggestionApplied ? 0.8 : 1
                        }}
                      >
                        {/* Card Content Top */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                          {/* Header Row: Icon on Left, Badges on Right */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: isSuggestionApplied ? 'rgba(34,197,94,0.08)' : priorityBg,
                              border: `1px solid ${isSuggestionApplied ? 'var(--success)' : priorityColor}40`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSuggestionApplied ? 'var(--success)' : priorityColor,
                              fontSize: '1.1rem',
                              flexShrink: 0
                            }}>
                              {isSuggestionApplied ? <CheckCircle2 size={16} /> : icon}
                            </div>
                            
                            {/* Badges/Pills on the Right Corner */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
                              <span style={{ 
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                                ...sourceBadgeStyle
                              }}>
                                {isEvaSource && <Sparkles size={8} />}
                                {sourceVal.toUpperCase()}
                              </span>

                              {!isSuggestionApplied && (
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  color: priorityColor,
                                  background: priorityBg,
                                  border: `1px solid ${priorityColor}30`,
                                  letterSpacing: '0.03em'
                                }}>
                                  {priorityVal.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recommendation Title on a separate line below the badges */}
                          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: '1.35', wordBreak: 'break-word' }}>
                            {titleVal}
                          </h4>

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
                            className={isSuggestionApplied ? "btn-secondary" : "btn-primary"}
                            onClick={() => {
                              if (isViewer || isSuggestionApplied) return;
                              handleApplyRemediation(suggestion.id, suggestion.type, resourceNameVal);
                            }}
                            disabled={isViewer || isSuggestionApplied || remediating === suggestion.id}
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.74rem',
                              height: '32px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: (isViewer || isSuggestionApplied) ? 'not-allowed' : 'pointer',
                              opacity: (isViewer || isSuggestionApplied) ? 0.65 : 1
                            }}
                          >
                            {remediating === suggestion.id ? (
                              <>
                                <RefreshCw size={11} className="spin-anim" />
                                Optimizing...
                              </>
                            ) : isSuggestionApplied ? (
                              <>
                                <CheckCircle2 size={11} />
                                Remedied
                              </>
                            ) : (
                              'Remediate'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* Eva AI Drawer & Float button (Global to Cost Optimization Page) */}
      {mode === 'optimization' && (
        <>
          {/* Backdrop/Overlay */}
          {isEvaOpen && (
            <div 
              onClick={() => setIsEvaOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(2, 6, 23, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 10000,
                transition: 'opacity 0.3s ease'
              }}
            />
          )}

          {/* Drawer Panel Layout */}
          <div 
            className={askingEva ? 'thinking-drawer-active' : ''}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '480px',
              maxWidth: '100vw',
              zIndex: 10001,
              transform: isEvaOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-left-color 0.3s ease',
              visibility: isEvaOpen ? 'visible' : 'hidden',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(30px) saturate(120%)',
              WebkitBackdropFilter: 'blur(30px) saturate(120%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              boxSizing: 'border-box'
            }}
          >
            {/* Floating AI Orb Effect */}
            <div 
              className={askingEva ? 'thinking-orb-active' : ''}
              style={{ 
                position: 'absolute', 
                top: '-15%', 
                right: '-15%', 
                width: '280px', 
                height: '280px', 
                borderRadius: '50%', 
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', 
                pointerEvents: 'none',
                filter: 'blur(40px)',
                zIndex: 0
              }} 
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 0 12px rgba(139, 92, 246, 0.15)',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="/evaops-logo.png" 
                    alt="Eva AI" 
                    className={askingEva ? "spin-anim" : ""} 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      objectFit: 'contain'
                    }} 
                  />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Eva AI Analyst</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <span className="premium-build-dot" style={{ width: '6px', height: '6px', background: '#22c55e', boxShadow: '0 0 6px #22c55e', margin: 0 }} />
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Engine Online</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsEvaOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Analytics Summary */}
            <div style={{ 
              background: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px', 
              padding: '16px',
              borderTop: '2px solid rgba(139, 92, 246, 0.6)',
              flexShrink: 0,
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 1
            }}>
              <div style={{ 
                fontWeight: 850, 
                color: '#c084fc', 
                marginBottom: '12px', 
                textTransform: 'uppercase', 
                fontSize: '0.68rem', 
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Activity size={12} />
                Infrastructure Diagnostics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Score</span>
                  <strong style={{ 
                    fontSize: '1rem', 
                    color: (costSummary?.optimizationScore || 100) > 85 ? 'var(--success)' : '#fbbf24',
                    textShadow: `0 0 10px ${(costSummary?.optimizationScore || 100) > 85 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`
                  }}>
                    {costSummary ? costSummary.optimizationScore : '100'}/100
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '10px' }}>
                  <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Run-Rate</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    ${costSummary ? costSummary.monthlyRunRate.toFixed(0) : '0'}/mo
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '10px' }}>
                  <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Savings</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--success)', textShadow: '0 0 10px rgba(34, 197, 94, 0.2)' }}>
                    ${costSummary ? costSummary.potentialSavings.toFixed(0) : '0'}/mo
                  </strong>
                </div>
              </div>
            </div>

            {/* Chat Log (Dynamic Height, Scrollable) */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              padding: '16px',
              background: isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.2)',
              marginBottom: '20px',
              zIndex: 1
            }}>
              {evaChat.map((msg, idx) => {
                const isEva = msg.role === 'assistant';
                return (
                  <div key={idx} style={{
                    alignSelf: isEva ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {isEva && (
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: '#c084fc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: '4px'
                      }}>
                        <Sparkles size={10} />
                        Eva AI
                      </span>
                    )}
                    <div style={{
                      background: isEva 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)' 
                        : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      border: isEva 
                        ? '1px solid var(--glass-border)' 
                        : 'none',
                      padding: '12px 16px',
                      borderRadius: isEva ? '14px 14px 14px 2px' : '16px 16px 2px 16px',
                      fontSize: '0.78rem',
                      color: isEva ? 'var(--text-primary)' : '#ffffff',
                      lineHeight: '1.45',
                      boxShadow: isEva ? 'none' : '0 4px 15px rgba(124, 58, 237, 0.25)'
                    }}>
                      {msg.content === 'Thinking...' ? (
                        <div className="thinking-dots-container">
                          <span className="thinking-dot" />
                          <span className="thinking-dot" />
                          <span className="thinking-dot" />
                        </div>
                      ) : (
                        msg.content.split('\n').map((line, lIdx) => (
                          <p key={lIdx} style={{ margin: 0, marginTop: lIdx > 0 ? '6px' : 0 }}>
                            {line.split('**').map((part, pIdx) => {
                              if (pIdx % 2 === 1) {
                                return <strong key={pIdx} style={{ color: isEva ? '#c084fc' : '#ffffff', fontWeight: 700 }}>{part}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, marginTop: 'auto' }}>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center', 
                background: isLight ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '14px',
                padding: '8px 12px',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.3)';
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                }}
              >
                {/* Quick Consultations Hover Card Trigger */}
                <div className="quick-consult-trigger-container">
                  <button
                    type="button"
                    className="quick-consult-trigger-btn"
                    title="Quick consultations"
                  >
                    <Sparkles size={16} />
                  </button>
                  <div className="quick-consult-hover-card">
                    <div style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      color: '#c084fc', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.08em', 
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Brain size={12} />
                      Quick consultations
                    </div>
                    {[
                      "How can we optimize SQL Database costs?",
                      "What is the impact of sleep scheduler rules?",
                      "Why are dev container apps scaled to zero?",
                      "How do we prune Container Registries (ACR)?",
                      "What are the savings for VM auto-shutdown?",
                      "How is the Cost Optimization Score calculated?",
                      "How many Static Web Apps (SWA) do we have?",
                      "What is our total potential savings?"
                    ].map((suggestionText) => (
                      <button
                        key={suggestionText}
                        type="button"
                        className="quick-consult-item-btn"
                        disabled={askingEva}
                        onClick={() => handleAskEva(suggestionText)}
                      >
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: '#c084fc',
                          display: 'inline-block',
                          flexShrink: 0
                        }} />
                        <span style={{ flex: 1 }}>{suggestionText}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder={askingEva ? "Eva is thinking..." : "Consult Eva AI..."}
                  value={askQuestion}
                  disabled={askingEva}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAskEva(askQuestion);
                    }
                  }}
                  style={{
                    flex: 1,
                    fontSize: '0.85rem',
                    height: '40px',
                    padding: '0 4px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAskEva(askQuestion)}
                  disabled={askingEva || !askQuestion.trim()}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    border: 'none',
                    background: (askingEva || !askQuestion.trim()) 
                      ? 'rgba(255,255,255,0.04)' 
                      : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (askingEva || !askQuestion.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (askingEva || !askQuestion.trim()) ? 0.5 : 1,
                    boxShadow: (askingEva || !askQuestion.trim()) ? 'none' : '0 2px 8px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!askingEva && askQuestion.trim()) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!askingEva && askQuestion.trim()) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
                    }
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Floating Glowing Eva Button */}
          <button
            type="button"
            className="eva-float-btn"
            onClick={() => setIsEvaOpen(true)}
            style={{
              visibility: isEvaOpen ? 'hidden' : 'visible',
              opacity: isEvaOpen ? 0 : 1,
            }}
          >
            <img src="/evaops-logo.png" alt="EvaOps" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </button>
        </>
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

      {/* Modal: Fullscreen Expanded Cost Chart View */}
      {expandedCostChart && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: isLight ? 'rgba(15, 23, 42, 0.75)' : 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '1000px',
            borderRadius: '20px',
            background: isLight ? '#ffffff' : '#0f172a',
            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={20} style={{ color: '#8b5cf6' }} /> {expandedCostChart.title}
              </h3>
              <button type="button" onClick={() => setExpandedCostChart(null)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '32px', height: '400px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {azureBills && azureBills.length > 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Category Legend */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#8b5cf6' }} /> 🟣 ACA Compute
                    </span>
                    <span style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }} /> 🔵 MySQL DB
                    </span>
                    <span style={{ color: '#06b6d4', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#06b6d4' }} /> 🩵 SWA CDN
                    </span>
                    <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} /> 🟢 Storage & VMs
                    </span>
                    <span style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366f1' }} /> 🟣 Egress Bandwidth
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', gap: '20px', alignItems: 'flex-end', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                    {azureBills.map((bill: any, idx: number) => {
                      const totalVal = Number(bill.total_amount || 0);
                      const acaVal = Number(bill.aca_compute_amount || totalVal * 0.38);
                      const mysqlVal = Number(bill.mysql_db_amount || totalVal * 0.30);
                      const swaVal = Number(bill.swa_cdn_amount || totalVal * 0.14);
                      const storageVal = Number(bill.storage_vm_amount || totalVal * 0.10);
                      const egressVal = Number(bill.network_egress_amount || totalVal * 0.08);

                      const currSym = getCurrencySymbol(bill.currency);

                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{
                            width: '100%',
                            height: `${Math.min(100, Math.max(15, (totalVal / 600) * 100))}%`,
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                          }} title={`Period: ${bill.billing_period} | Total: ${currSym}${totalVal.toLocaleString('en-IN')}`}>
                            <div style={{ height: `${(acaVal / totalVal) * 100}%`, background: '#8b5cf6' }} title={`ACA: ${currSym}${acaVal.toFixed(2)}`} />
                            <div style={{ height: `${(mysqlVal / totalVal) * 100}%`, background: '#3b82f6' }} title={`MySQL: ${currSym}${mysqlVal.toFixed(2)}`} />
                            <div style={{ height: `${(swaVal / totalVal) * 100}%`, background: '#06b6d4' }} title={`SWA: ${currSym}${swaVal.toFixed(2)}`} />
                            <div style={{ height: `${(storageVal / totalVal) * 100}%`, background: '#10b981' }} title={`Storage: ${currSym}${storageVal.toFixed(2)}`} />
                            <div style={{ height: `${(egressVal / totalVal) * 100}%`, background: '#6366f1' }} title={`Egress: ${currSym}${egressVal.toFixed(2)}`} />
                          </div>
                          <span style={{ fontSize: '0.74rem', color: isLight ? '#0f172a' : '#fff', fontWeight: 700 }}>{currSym}{totalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          <span style={{ fontSize: '0.66rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 600 }}>{bill.billing_period}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: isLight ? '#64748b' : '#94a3b8' }}>
                  Expanded High-Resolution Azure Cloud Infrastructure Analytics View
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
