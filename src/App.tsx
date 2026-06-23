import { useState, useEffect, useMemo, Fragment, useRef, useCallback } from 'react';
import { 
  Settings, 
  Cpu, 
  Globe, 
  GitBranch, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Search,
  Server,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  Sun,
  Moon,
  LogOut,
  Building2,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Minus,
  TrendingDown,
  Info,
  Users,
  Terminal,
  Sliders,
  Activity,
  Download
} from 'lucide-react';
import './App.css';

// Import modular frontend components and pages
import { ConfirmationModal } from './components/ConfirmationModal';
import { SiteHeader, ControlBanner } from './components/DevOpsHeader';
import { BuildHistoryDrawer } from './components/BuildHistoryDrawer';
import { NotificationDrawer } from './components/NotificationDrawer';
import type { AppNotification } from './components/NotificationDrawer';
import { NotificationDetailModal } from './components/NotificationDetailModal';
import { SettingsPage } from './pages/SettingsPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { DatabaseCatalogPage } from './pages/DatabaseCatalogPage';
import { DashboardPage } from './pages/DashboardPage';
import { CostPage } from './pages/CostPage';
import { ProvisionWizard } from './pages/ProvisionWizard';
import { GuidePage } from './pages/GuidePage';
import { TeamPage } from './pages/TeamPage';
import type { UserRecord } from './pages/TeamPage';
import { LogDrawer } from './components/observability/LogDrawer';
import { AuditLogsTable } from './components/team/AuditLogsTable';
import { Footer } from './components/layout/Footer';

const Github = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
        color: copied ? 'var(--success)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '0.72rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s'
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) || `http://${window.location.hostname}:5005/api`;

const PREDEFINED_REPOS = [
  "Estevia-TechSolutions/protrack-frontend",
  "Estevia-TechSolutions/talenthq-frontend",
  "Estevia-TechSolutions/docai-frontend",
  "Estevia-TechSolutions/evafusion-frontend",
  "Estevia-TechSolutions/evafusion-devhub",
  "Estevia-TechSolutions/connecthub-frontend",
  "Estevia-TechSolutions/estevia-marketing-web",
  "Estevia-TechSolutions/estevia-backend-api",
  "Estevia-TechSolutions/estevia-ml-setup",
  "Estevia-TechSolutions/Peoplecraft-v1-reactfrontend"
];

interface AppResource {
  name: string;
  type: 'frontend' | 'backend' | 'vm' | 'cluster';
  location: string;
  hostname: string;
  resourceId: string;
  status: string;
  repositoryUrl: string;
  branch?: string;
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
      state: string;   // waiting | inProgress | completed
      result: string;  // succeeded | failed | canceled | skipped | null
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
        steps?: {
          id: string;
          name: string;
          displayName: string;
          state: string;
          result: string;
          startTime?: string | null;
          finishTime?: string | null;
        }[];
      }[];
    }[];
  } | null;
  branches?: { name: string; protected: boolean }[];
  isTestResource?: boolean;
  azureResourceDetails?: any;
}

interface AppGroup {
  key: string;
  label: string;          // prettified display name (e.g. "ProTrack Frontend")
  repoPath: string;       // e.g. "Estevia-TechSolutions/protrack-frontend"
  repoUrl: string;        // full github url
  type: 'frontend' | 'backend' | 'vm' | 'cluster';
  envs: AppResource[];    // sorted dev → qa → prod
  pipelineId?: string;    // from any member that has one
  pipelineName?: string;
  branches?: { name: string; protected: boolean }[];
}

function groupApps(apps: AppResource[]): AppGroup[] {
  console.log('[DevOps Frontend] groupApps input apps:', apps);
  const map = new Map<string, AppGroup>();

  // Determine sort order: dev(0) → qa(1) → prod(2) → bare-name treated as prod(2) → other(3)
  const hasEnvSuffix = (name: string) => {
    const n = name.toLowerCase();
    
    // Check for dev candidates
    const isDev = n.endsWith('-dev') || n.includes('-dev-') || 
                  n.endsWith('-development') || n.includes('-development-');
                  
    // Check for qa candidates
    const isQa = n.endsWith('-qa') || n.includes('-qa-') ||
                 n.endsWith('-test') || n.includes('-test-') ||
                 n.endsWith('-testing') || n.includes('-testing-') ||
                 n.endsWith('-staging') || n.includes('-staging-');
                 
    // Check for prod candidates
    const isProd = n.endsWith('-prod') || n.includes('-prod-') ||
                   n.endsWith('-production') || n.includes('-production-') ||
                   n.endsWith('-release') || n.includes('-release-') ||
                   n.endsWith('-main') || n.includes('-main-') ||
                   n.endsWith('-master') || n.includes('-master-');
                   
    return isDev || isQa || isProd;
  };

  const getEnvOrder = (name: string) => {
    const n = name.toLowerCase();
    
    if (n.endsWith('-dev') || n.includes('-dev-') || 
        n.endsWith('-development') || n.includes('-development-')) {
      return 0;
    }
    if (n.endsWith('-qa') || n.includes('-qa-') ||
        n.endsWith('-test') || n.includes('-test-') ||
        n.endsWith('-testing') || n.includes('-testing-') ||
        n.endsWith('-staging') || n.includes('-staging-')) {
      return 1;
    }
    if (n.endsWith('-prod') || n.includes('-prod-') ||
        n.endsWith('-production') || n.includes('-production-') ||
        n.endsWith('-release') || n.includes('-release-') ||
        n.endsWith('-main') || n.includes('-main-') ||
        n.endsWith('-master') || n.includes('-master-')) {
      return 2;
    }
    
    // Bare-name (no env suffix) = production/main deployment → sort with prod
    if (!hasEnvSuffix(name)) return 2;
    return 3;
  };

  // Build a pretty display label from an app name:
  // Strip only the trailing env suffix and -swa platform suffix (NOT estevia- or -api)
  const toLabel = (name: string): string => {
    return name
      .replace(/^estevia-estevia-/, 'estevia-') // collapse duplicate prefix
      .replace(/-swa$/, '')
      .replace(/-(dev|development|qa|test|testing|staging|prod|production|release|main|master)$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  for (const app of apps) {
    let key: string;
    let repoPath = '';
    let repoUrl = app.repositoryUrl || '';

    if (app.type === 'vm') {
      key = 'virtual-machines';
    } else if (app.repositoryUrl) {
      // Group by repo path (lowercased for stable key)
      repoPath = app.repositoryUrl
        .replace('https://github.com/', '')
        .replace(/\/$/, '')
        .toLowerCase();
      key = repoPath;
    } else {
      // No repo URL — derive key from base name, stripping env + platform suffixes
      key = app.name
        .toLowerCase()
        .replace(/^estevia-estevia-/, 'estevia-') // collapse duplicate prefix
        .replace(/^estevia-/, '')
        .replace(/-swa$/, '')
        .replace(/-(dev|development|qa|test|testing|staging|prod|production|release|main|master)$/, '');
    }

    if (!map.has(key)) {
      // Label: if we have a repo path, use the last segment prettified
      // Otherwise use the full app name with only env/swa suffixes stripped
      let label: string;
      if (app.type === 'vm') {
        label = 'Virtual Machines';
      } else if (repoPath) {
        const repoSegment = repoPath.split('/').pop() || key;
        label = repoSegment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      } else {
        label = toLabel(app.name);
      }

      map.set(key, {
        key,
        label,
        repoPath: app.repositoryUrl
          ? app.repositoryUrl.replace('https://github.com/', '').replace(/\/$/, '')
          : '',
        repoUrl,
        type: app.type,
        envs: [],
      });
    }

    const group = map.get(key)!;
    group.envs.push(app);
    if (app.pipelineId && !group.pipelineId) {
      group.pipelineId = app.pipelineId;
      group.pipelineName = app.pipelineName;
    }
    if (app.branches && app.branches.length > 0 && !group.branches) {
      group.branches = app.branches;
    }
    // If we later find a repo URL for a group that started without one, backfill it
    if (app.repositoryUrl && !group.repoUrl) {
      group.repoUrl = app.repositoryUrl;
      group.repoPath = app.repositoryUrl.replace('https://github.com/', '').replace(/\/$/, '');
      // Also upgrade the label from the repo name
      const repoSegment = group.repoPath.split('/').pop() || group.key;
      group.label = repoSegment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // Sort envs within each group: dev → qa → prod → others
  for (const g of map.values()) {
    g.envs.sort((a, b) => getEnvOrder(a.name) - getEnvOrder(b.name));
  }

  // Sort groups alphabetically by label
  const sortedGroups = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  console.log('[DevOps Frontend] groupApps sorted output:', sortedGroups);
  return sortedGroups;
}


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

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface EventLog {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'build' | 'power' | 'scan' | 'credential' | 'general' | 'audit';
  status: 'success' | 'failed' | 'info' | 'warning';
  details?: any;
  actorEmail?: string;
  target?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'provision' | 'credentials' | 'cost' | 'optimization' | 'databases' | 'guide' | 'users' | 'events'>('scan');
  const [organizationId, setOrganizationId] = useState<string>(
    new URLSearchParams(window.location.search).get('org') || 'estevia'
  );

  // Event filter state for Events Feed page
  const [selectedEventCategories, setSelectedEventCategories] = useState<string[]>(['build', 'power', 'scan', 'credential', 'audit', 'general']);
  const [selectedEventStatuses, setSelectedEventStatuses] = useState<string[]>(['success', 'failed', 'warning', 'info']);
  const [eventDateScope, setEventDateScope] = useState<'all' | '24h' | '7d' | '30d' | 'custom'>('all');
  const [eventStartDate, setEventStartDate] = useState<string>('');
  const [eventEndDate, setEventEndDate] = useState<string>('');
  const [eventSortOrder, setEventSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');
  const [eventGroupingMode, setEventGroupingMode] = useState<'date' | 'category' | 'none'>('date');
  const [expandedEventGroups, setExpandedEventGroups] = useState<Record<string, boolean>>({});

  // State for database audit logs integrated into system events feed
  const [auditLogsForEvents, setAuditLogsForEvents] = useState<any[]>([]);
  const [loadingAuditLogsForEvents, setLoadingAuditLogsForEvents] = useState<boolean>(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Real-time Toast Alerts States & Helpers
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Persistent Audit Events Stream States & Helpers
  const [events, setEvents] = useState<EventLog[]>(() => {
    const saved = localStorage.getItem('evaops_events');
    if (saved) return JSON.parse(saved);
    
    // Seed default audit events to make the feed feel active
    const defaultEvents: EventLog[] = [
      {
        id: 'ev-seed-1',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        title: 'Sleep Scheduler Auto-Stop Executed',
        message: 'Successfully powered down dev/qa VM instances to minimize off-hours compute cost.',
        type: 'power',
        status: 'success'
      },
      {
        id: 'ev-seed-2',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        title: 'Cost Optimizer Scan Completed',
        message: 'Discovered 4 optimization recommendations yielding up to $67.50/mo savings.',
        type: 'scan',
        status: 'success'
      },
      {
        id: 'ev-seed-3',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'CI/CD Webhook Triggered',
        message: 'Completed production deployment build run #104. SWA updated successfully.',
        type: 'build',
        status: 'success'
      },
      {
        id: 'ev-seed-4',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'GoDaddy API Credentials Synced',
        message: 'Connection verified. Domain binding automation is online and active.',
        type: 'credential',
        status: 'success'
      },
      {
        id: 'ev-seed-5',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'EvaOps Workspace Activated',
        message: 'Security context generated. AES-256-GCM encryption key successfully provisioned.',
        type: 'credential',
        status: 'info'
      }
    ];
    localStorage.setItem('evaops_events', JSON.stringify(defaultEvents));
    return defaultEvents;
  });

  const addEvent = useCallback((
    title: string,
    message: string,
    type: EventLog['type'],
    status: EventLog['status'] = 'info'
  ) => {
    const newEvent: EventLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      status
    };
    
    setEvents(prev => {
      const updated = [newEvent, ...prev].slice(0, 100);
      localStorage.setItem('evaops_events', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Notifications Center Drawer State & Helpers
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('evaops_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [selectedDetailNotification, setSelectedDetailNotification] = useState<AppNotification | null>(null);

  const addNotification = useCallback((
    title: string,
    message: string,
    type: AppNotification['type']
  ) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 100);
      localStorage.setItem('evaops_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('evaops_notifications');
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('evaops_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      if (prev.every(n => n.read)) return prev;
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('evaops_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      if (prev.find(n => n.id === id)?.read) return prev;
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('evaops_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleViewDetails = useCallback((category: string, notification: AppNotification) => {
    setIsNotificationOpen(false);
    setSelectedDetailNotification(notification);
    markNotificationAsRead(notification.id);
  }, [markNotificationAsRead]);

  const handleNavigateFromModal = useCallback((category: string, notification: AppNotification) => {
    setSelectedDetailNotification(null);
    if (category === 'FINOPS') {
      setActiveTab('cost');
    } else if (category === 'SECURITY') {
      setActiveTab('credentials');
    } else if (category === 'PROVISION') {
      if (notification.message.toLowerCase().includes('database') || notification.title.toLowerCase().includes('database')) {
        setActiveTab('databases');
      } else {
        setActiveTab('provision');
      }
    } else if (category === 'MONITOR') {
      setActiveTab('events');
    } else {
      setActiveTab('events');
    }
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Unified events stream (combining local state events and database audit logs)
  const unifiedEvents = useMemo(() => {
    const localEvents: EventLog[] = events;
    const mappedAuditLogs: EventLog[] = auditLogsForEvents
      .filter(log => log.actionType !== 'VIEW_AUDIT' && log.actionType !== 'VIEW_LOGS')
      .map(log => {
        let detailsObj = log.details;
        if (typeof log.details === 'string') {
          try {
            detailsObj = JSON.parse(log.details);
          } catch (e) {
            detailsObj = log.details;
          }
        }
        return {
          id: `audit-${log.id}`,
          timestamp: log.createdAt,
          title: log.actionType,
          message: `${log.actorEmail} targeted ${log.target}`,
          type: 'audit',
          status: (log.actionType.includes('FAIL') || log.actionType.includes('ERROR')) ? 'failed' : 'success',
          details: detailsObj,
          actorEmail: log.actorEmail,
          target: log.target
        };
      });
    return [...localEvents, ...mappedAuditLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [events, auditLogsForEvents]);

  const handleToggleNotifications = useCallback(() => {
    setIsNotificationOpen(prev => !prev);
  }, []);
  
  const isGuidedProvisionRef = useRef(false);
  
  // Scanned Apps State
  const [apps, setApps] = useState<AppResource[]>([]);
  const activeBuildsCount = useMemo(() => {
    return apps.filter(app => {
      if (!app.pipelineRun || !app.pipelineRun.state) return false;
      const s = app.pipelineRun.state.toLowerCase();
      return s === 'inprogress' || s === 'running' || s === 'canceling' || s === 'cancelling' || s === 'notstarted' || s === 'queued';
    }).length;
  }, [apps]);

  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Control Centre Resource Groups States
  const [controlResourceGroups, setControlResourceGroups] = useState<string[]>([]);
  const [selectedControlResourceGroup, setSelectedControlResourceGroup] = useState<string>(() => {
    return localStorage.getItem('selectedControlResourceGroup') || '';
  });
  const [primaryResourceGroup, setPrimaryResourceGroup] = useState<string>('');

  useEffect(() => {
    let interval: any = null;
    if (scanning) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev < 40) {
            return prev + Math.floor(Math.random() * 4) + 2;
          } else if (prev < 80) {
            return prev + Math.floor(Math.random() * 2) + 1;
          } else if (prev < 96) {
            return prev + 0.5;
          }
          return prev;
        });
      }, 150);
    } else {
      if (scanProgress > 0) {
        setScanProgress(100);
        const timeout = setTimeout(() => {
          setScanProgress(0);
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanning]);

  // Bind Domain Modal State
  const [selectedApp, setSelectedApp] = useState<AppResource | null>(null);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [domainInput, setDomainInput] = useState('esteviatech.com');
  const [binding, setBinding] = useState(false);
  const [bindSuccess, setBindSuccess] = useState<string | null>(null);
  const [bindError, setBindError] = useState<string | null>(null);

  // Pipeline Modal State
  const [pipelineApp, setPipelineApp] = useState<AppResource | null>(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [useCustomRepo, setUseCustomRepo] = useState(false);
  const [devopsOrgUrl, setDevopsOrgUrl] = useState('https://dev.azure.com/Estevia-TechSolutions');
  const [devopsProject, setDevopsProject] = useState('ProTrack');
  const [creatingPipeline, setCreatingPipeline] = useState(false);
  const [creatingYml, setCreatingYml] = useState(false);
  const [checkingYml, setCheckingYml] = useState(false);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [ymlMissing, setYmlMissing] = useState<{ message: string; githubRepo: string } | null>(null);
  const [ymlFound, setYmlFound] = useState<string | null>(null); // URL to the yml file on GitHub
  const [ymlCreated, setYmlCreated] = useState(false);
  const [siblingApps, setSiblingApps] = useState<AppResource[]>([]); // other env cards sharing same repo
  
  // Pipeline Modal YML Editor States
  const [pipelineBranch, setPipelineBranch] = useState('main');
  const [pipelineModalYmlContent, setPipelineModalYmlContent] = useState('');
  const [pipelineModalYmlLoading, setPipelineModalYmlLoading] = useState(false);
  const [pipelineModalYmlSource, setPipelineModalYmlSource] = useState<'github' | 'template' | null>(null);
  const [pipelineWizardStep, setPipelineWizardStep] = useState(1);

  // Provisioning Wizard State
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('eastus2');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState<string | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionStep, setProvisionStep] = useState(1);
  const [appType, setAppType] = useState<'frontend' | 'backend' | 'cluster' | 'database'>('frontend');
  const [kubernetesVersion, setKubernetesVersion] = useState('1.28.3');
  const [nodeCount, setNodeCount] = useState(1);
  const [vmSize, setVmSize] = useState('Standard_D2s_v5');
  const [subnetId, setSubnetId] = useState('');
  const [dbSkuName, setDbSkuName] = useState('Standard_B1ms');
  const [dbSkuTier, setDbSkuTier] = useState('Burstable');
  const [dbVersion, setDbVersion] = useState('8.0.21');
  const [dbAdminUsername, setDbAdminUsername] = useState('estevia');
  const [dbAdminPassword, setDbAdminPassword] = useState('Ewco26INCP');
  const [virtualNetworks, setVirtualNetworks] = useState<any[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [ymlContent, setYmlContent] = useState<string>('');
  const [ymlLoading, setYmlLoading] = useState(false);
  const [ymlError, setYmlError] = useState<string | null>(null);
  const [ymlSource, setYmlSource] = useState<'github' | 'template' | null>(null);
  const [targetPort, setTargetPort] = useState('5005');

  // Scanner Custom YML Editor States
  const [scannerYmlContent, setScannerYmlContent] = useState('');
  const [scannerYmlLoading, setScannerYmlLoading] = useState(false);
  const [scannerYmlSource, setScannerYmlSource] = useState<'github' | 'template' | null>(null);

  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<{name: string; protected: boolean}[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Repo Integrity Check state
  const [repoIntegrity, setRepoIntegrity] = useState<any | null>(null);
  const [repoIntegrityLoading, setRepoIntegrityLoading] = useState(false);
  const [pipelineRegistering, setPipelineRegistering] = useState(false);
  const [pipelineRegSuccess, setPipelineRegSuccess] = useState(false);
  const [pipelineRegError, setPipelineRegError] = useState<string | null>(null);
  const [registeredPipelineUrl, setRegisteredPipelineUrl] = useState<string>('');
  const [dnsBinding, setDnsBinding] = useState(false);
  const [dnsBindSuccess, setDnsBindSuccess] = useState(false);
  const [dnsBindError, setDnsBindError] = useState<string | null>(null);

  // Credentials State
  const [githubToken, setGithubToken] = useState('');
  const [godaddyKey, setGodaddyKey] = useState('');
  const [godaddySecret, setGodaddySecret] = useState('');
  const [devopsPat, setDevopsPat] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showGodaddyKey, setShowGodaddyKey] = useState(false);
  const [showGodaddySecret, setShowGodaddySecret] = useState(false);
  const [showDevopsPat, setShowDevopsPat] = useState(false);
  const [decryptedGithubToken, setDecryptedGithubToken] = useState('');
  const [decryptedGodaddyKey, setDecryptedGodaddyKey] = useState('');
  const [decryptedGodaddySecret, setDecryptedGodaddySecret] = useState('');
  const [decryptedDevopsPat, setDecryptedDevopsPat] = useState('');
  const [credentialStatus, setCredentialStatus] = useState<Record<string, boolean>>({});
  const [savingCredentials, setSavingCredentials] = useState<string | null>(null);
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingAppName, setDeletingAppName] = useState<string | null>(null);

  // Credentials connection health validation states
  const [testingCredential, setTestingCredential] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleValidateCredential = async (provider: 'github' | 'godaddy' | 'azure_devops') => {
    setTestingCredential(provider);
    setValidationResult(prev => {
      const copy = { ...prev };
      delete copy[provider];
      return copy;
    });
    try {
      const activeToken = token || localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/credentials/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          organizationId: organizationId,
          provider
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setValidationResult(prev => ({
          ...prev,
          [provider]: { success: true, message: data.message || 'Connection healthy!' }
        }));
        showToast('Connection Validated', `Successfully verified connection to ${provider.toUpperCase()}`, 'success');
        addEvent('Connection Health Check Passed', `Successfully verified connection to ${provider.toUpperCase()}: ${data.message || 'Connection healthy!'}`, 'credential', 'success');
      } else {
        setValidationResult(prev => ({
          ...prev,
          [provider]: { success: false, message: data.message || 'Connection test failed.' }
        }));
        showToast('Connection Validation Failed', data.message || `Failed to verify connection to ${provider.toUpperCase()}`, 'error');
        addEvent('Connection Health Check Failed', `Failed to verify connection to ${provider.toUpperCase()}: ${data.message || 'Connection test failed.'}`, 'credential', 'failed');
      }
    } catch (err: any) {
      setValidationResult(prev => ({
        ...prev,
        [provider]: { success: false, message: err.message || 'Failed to trigger connection test.' }
      }));
      showToast('Connection Check Error', err.message || `Error executing validation request for ${provider.toUpperCase()}`, 'error');
      addEvent('Connection Health Check Error', `Error executing validation request for ${provider.toUpperCase()}: ${err.message || 'Error occurred.'}`, 'credential', 'failed');
    } finally {
      setTestingCredential(null);
    }
  };

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('devops_theme') as 'dark' | 'light') || 'dark';
  });

  const [activeLogsAppName, setActiveLogsAppName] = useState<string | null>(null);

  const [cloningApp, setCloningApp] = useState<any | null>(null);
  const [cloneTargetEnv, setCloneTargetEnv] = useState<'qa' | 'prod' | 'sandbox'>('qa');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneFeedback, setCloneFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [costTab, setCostTab] = useState<'breakdown' | 'recommendations' | 'billing' | 'schedules'>('breakdown');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [costSearch, setCostSearch] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | 'production' | 'test' | 'stale'>('all');

  // Team Settings States
  const [teamUsers, setTeamUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [syncingTeam, setSyncingTeam] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [collapsedScanGroups, setCollapsedScanGroups] = useState<Record<string, boolean>>({});
  const toggleGroupScan = (key: string) => {
    setCollapsedScanGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [selectedStageForJobs, setSelectedStageForJobs] = useState<any | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any | null>(null);

  // Database Hub States
  const [dbServers, setDbServers] = useState<any[]>([]);
  const [selectedDbServer, setSelectedDbServer] = useState<any | null>(null);
  const [databases, setDatabases] = useState<any[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<any | null>(null);
  const [databaseSchema, setDatabaseSchema] = useState<any[]>([]);
  const [loadingDbServers, setLoadingDbServers] = useState(false);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [newDbName, setNewDbName] = useState('');
  const [deployingDb, setDeployingDb] = useState(false);
  const [deployDbSuccess, setDeployDbSuccess] = useState<string | null>(null);
  const [deployDbError, setDeployDbError] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [dbDetailTab, setDbDetailTab] = useState<'schema' | 'query' | 'create-table' | 'connect' | 'erd' | 'compare'>('schema');
  const [connectCodeTab, setConnectCodeTab] = useState<'cli' | 'node' | 'python' | 'php'>('cli');

  // Custom SQL Query Console States
  const [querySql, setQuerySql] = useState('');
  const [queryExecuting, setQueryExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Database search filter state
  const [dbSearchQuery, setDbSearchQuery] = useState('');

  // Ref and effect to auto-adjust Right Panel height to match Left Column height
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = useState<number>(650);

  useEffect(() => {
    if (!leftColRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setLeftColHeight(height);
        }
      }
    });
    observer.observe(leftColRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  // Table Creator Visual Form States
  const [newTableName, setNewTableName] = useState('');
  const [tableColumns, setTableColumns] = useState<any[]>([
    { name: 'id', type: 'INT', nullable: false, isPrimary: true, extra: 'AUTO_INCREMENT' },
    { name: 'name', type: 'VARCHAR(255)', nullable: false, isPrimary: false, extra: '' }
  ]);
  const [creatingTable, setCreatingTable] = useState(false);
  const [createTableError, setCreateTableError] = useState<string | null>(null);

  // Alter Table Actions States
  const [alteringTable, setAlteringTable] = useState<string | null>(null);
  const [alterNewColName, setAlterNewColName] = useState('');
  const [alterNewColType, setAlterNewColType] = useState('VARCHAR(255)');
  const [alterNewColNullable, setAlterNewColNullable] = useState(true);

  // Dynamic Organization Settings State
  const [orgName, setOrgName] = useState<string>('');
  const [azureSubscriptionId, setAzureSubscriptionId] = useState('');
  const [azureResourceGroup, setAzureResourceGroup] = useState('');
  const [defaultDnsDomain, setDefaultDnsDomain] = useState('');
  const [azureDevopsOrgUrl, setAzureDevopsOrgUrl] = useState('');
  const [azureDevopsProject, setAzureDevopsProject] = useState('');
  const [pipelineVariableGroup, setPipelineVariableGroup] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New Organization Settings State Columns
  const [azureContainerRegistry, setAzureContainerRegistry] = useState('');
  const [azureDevopsServiceConnection, setAzureDevopsServiceConnection] = useState('');
  const [dockerRegistryServiceConnection, setDockerRegistryServiceConnection] = useState('');

  // Microsoft Teams Webhook & Observability Settings
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('');
  const [teamsWebhookToken, setTeamsWebhookToken] = useState('');
  const [logAnalyticsWorkspaceId, setLogAnalyticsWorkspaceId] = useState('');
  const [azureKeyVaultUrl, setAzureKeyVaultUrl] = useState('');
  const [devDbHost, setDevDbHost] = useState('');
  const [qaDbHost, setQaDbHost] = useState('');
  const [prodDbHost, setProdDbHost] = useState('');
  const [devManagedEnvId, setDevManagedEnvId] = useState('');
  const [prodManagedEnvId, setProdManagedEnvId] = useState('');
  const [discoveringInfra, setDiscoveringInfra] = useState(false);

  // Dynamic Provisioning Metadata States
  const [locations, setLocations] = useState<any[]>([]);
  const [resourceGroups, setResourceGroups] = useState<string[]>([]);
  const [managedEnvironments, setManagedEnvironments] = useState<any[]>([]);
  const [containerRegistries, setContainerRegistries] = useState<any[]>([]);
  const [serviceConnections, setServiceConnections] = useState<{ arm: any[]; docker: any[] }>({ arm: [], docker: [] });
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Wizard Step 3 Config States
  const [selectedResourceGroup, setSelectedResourceGroup] = useState('');
  const [selectedManagedEnvironment, setSelectedManagedEnvironment] = useState('');
  const [selectedCpu, setSelectedCpu] = useState('0.25');
  const [selectedMemory, setSelectedMemory] = useState('0.5Gi');
  const [minReplicas, setMinReplicas] = useState(0);
  const [maxReplicas, setMaxReplicas] = useState(10);

  // SWA Custom Build Paths
  const [customAppLocation, setCustomAppLocation] = useState('');
  const [customApiLocation, setCustomApiLocation] = useState('');
  const [customOutputLocation, setCustomOutputLocation] = useState('');

  // Dockerfile checks
  const [dockerfileMissing, setDockerfileMissing] = useState(false);
  const [committingDockerfile, setCommittingDockerfile] = useState(false);
  const [dockerfileCheckError, setDockerfileCheckError] = useState<string | null>(null);

  const fetchProvisioningMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const res = await fetch(`${API_BASE}/apps/provisioning-metadata?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations || []);
        setResourceGroups(data.resourceGroups || []);
        setManagedEnvironments(data.managedEnvironments || []);
        setContainerRegistries(data.containerRegistries || []);
        setServiceConnections(data.serviceConnections || { arm: [], docker: [] });
        setVirtualNetworks(data.virtualNetworks || []);
        
        // Auto-select defaults if empty
        if (data.resourceGroups && data.resourceGroups.length > 0 && !selectedResourceGroup) {
          setSelectedResourceGroup(data.resourceGroups[0]);
        }
        if (data.locations && data.locations.length > 0 && !newLocation) {
          setNewLocation(data.locations[0].name);
        }
      }
    } catch (e) {
      console.error('Failed to load provisioning metadata:', e);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const checkDockerfile = async (repo: string, branch: string) => {
    try {
      const res = await fetch(`${API_BASE}/apps/check-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
      const data = await res.json();
      if (data.code === 'DOCKERFILE_MISSING') {
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to check Dockerfile:', e);
      return false;
    }
  };

  const commitDefaultDockerfile = async (repo: string, branch: string, port: string) => {
    try {
      const res = await fetch(`${API_BASE}/apps/create-dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          githubRepo: repo,
          branch,
          targetPort: parseInt(port, 10)
        })
      });
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to commit default Dockerfile:', e);
      return false;
    }
  };

  const [dockerfileChecked, setDockerfileChecked] = useState(false);
  const [dockerfileContent, setDockerfileContent] = useState('');
  const [dockerfileLoading, setDockerfileLoading] = useState(false);
  const [provisionErrorDetail, setProvisionErrorDetail] = useState<string | null>(null);

  const fetchDockerfileContent = async (repo: string, branch: string) => {
    setDockerfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/apps/get-dockerfile?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
      const data = await res.json();
      if (data.success) {
        setDockerfileContent(data.content || '');
      }
    } catch (e) {
      console.error('Failed to fetch Dockerfile content:', e);
    } finally {
      setDockerfileLoading(false);
    }
  };

  const pushDockerfileContent = async (repo: string, branch: string, content: string, commitMsg?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/apps/update-dockerfile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          githubRepo: repo,
          branch,
          content,
          commitMessage: commitMsg || 'chore: update Dockerfile [via EvaOps CloudOps Management & Governance Hub]'
        })
      });
      const data = await res.json();
      if (data.success) {
        setDockerfileContent(content); // update local state
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to push Dockerfile.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error pushing Dockerfile.' };
    }
  };

  useEffect(() => {
    if (activeTab === 'provision' || activeTab === 'credentials') {
      fetchProvisioningMetadata();
    }
    if (activeTab === 'provision') {
      if (isGuidedProvisionRef.current) {
        // Skip reset for guided provisioning from dashboard
        isGuidedProvisionRef.current = false;
      } else {
        // Reset the entire wizard to a clean initial state
        setProvisionStep(1);
        setAppType('frontend');
        setNewName('');
        setSelectedRepo('');
        setSelectedBranch('');
        setSelectedBranches([]);
        setYmlContent('');
        setTargetPort('5005');
        setDnsBinding(false);
        setDomainInput(defaultDnsDomain || 'esteviatech.com');
        setProvisionSuccess(null);
        setProvisionError(null);
        setProvisionErrorDetail(null);
        // Pipeline & DNS
        setPipelineRegSuccess(false);
        setPipelineRegError(null);
        setDnsBindSuccess(false);
        setDnsBindError(null);
        // ACA resource config
        setSelectedResourceGroup('');
        setSelectedManagedEnvironment('');
        setSelectedCpu('0.25');
        setSelectedMemory('0.5Gi');
        setMinReplicas(0);
        setMaxReplicas(10);
        // Custom build paths
        setCustomAppLocation('');
        setCustomApiLocation('');
        setCustomOutputLocation('');
        // Dockerfile state
        setDockerfileMissing(false);
        setDockerfileChecked(false);
        setDockerfileContent('');
        setCommittingDockerfile(false);
        setDockerfileCheckError(null);
      }
    }
  }, [activeTab]);

  const fetchAuditLogsForEvents = useCallback(async () => {
    setLoadingAuditLogsForEvents(true);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/audit-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogsForEvents(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs for events:', err);
    } finally {
      setLoadingAuditLogsForEvents(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchAuditLogsForEvents();
    }
  }, [activeTab, fetchAuditLogsForEvents]);

  // Confirmation Modal and sync timer states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const [syncCountdown, setSyncCountdown] = useState<number>(300);

  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem('devops_token'));
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('devops_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e: any) {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Override login state
  const [showAdminOverrideForm, setShowAdminOverrideForm] = useState(false);
  const [adminOverrideOrgId, setAdminOverrideOrgId] = useState('');
  const [adminOverridePassword, setAdminOverridePassword] = useState('');
  const [adminOverrideError, setAdminOverrideError] = useState<string | null>(null);
  const [adminOverrideLoading, setAdminOverrideLoading] = useState(false);

  // Developer Override login state
  const [showDevOverrideForm, setShowDevOverrideForm] = useState(false);
  const [devOverrideOrgId, setDevOverrideOrgId] = useState('estevia');
  const [devOverrideError, setDevOverrideError] = useState<string | null>(null);

  // Build History Drawer state
  const [buildHistoryDrawerApp, setBuildHistoryDrawerApp] = useState<AppResource | null>(null);

  const [requiresOnboarding, setRequiresOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('devops_requires_onboarding') === 'true';
  });

  // Onboarding Wizard States
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardOrgName, setOnboardOrgName] = useState('');
  const [onboardAdminEmail, setOnboardAdminEmail] = useState(user?.email || '');

  const [onboardAzureSubId, setOnboardAzureSubId] = useState('');
  const [onboardAzureTenantId, setOnboardAzureTenantId] = useState(user?.tenant_id || '');
  const [onboardAzureClientId, setOnboardAzureClientId] = useState('');
  const [onboardAzureClientSecret, setOnboardAzureClientSecret] = useState('');
  const [onboardAzureRg, setOnboardAzureRg] = useState('Estevia-Prod-RG');

  const [onboardDevopsUrl, setOnboardDevopsUrl] = useState('https://dev.azure.com/esteviatech');
  const [onboardDevopsProject, setOnboardDevopsProject] = useState('Estevia-Platform');
  const [onboardDevopsPat, setOnboardDevopsPat] = useState('');
  const [onboardGithubOwner, setOnboardGithubOwner] = useState('Estevia-TechSolutions');
  const [onboardGithubPat, setOnboardGithubPat] = useState('');

  const [onboardGodaddyKey, setOnboardGodaddyKey] = useState('');
  const [onboardGodaddySecret, setOnboardGodaddySecret] = useState('');
  const [onboardGodaddyDomain, setOnboardGodaddyDomain] = useState('esteviatech.com');

  const [onboardTesting, setOnboardTesting] = useState(false);
  const [onboardTestResult, setOnboardTestResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setOnboardAdminEmail(user.email || '');
      setOnboardAzureTenantId(user.tenant_id || '');
    }
  }, [user]);

  // Cost Management state variables
  const [costSummary, setCostSummary] = useState<any>(null);
  const [detailedCosts, setDetailedCosts] = useState<any[]>([]);
  const [costSuggestions, setCostSuggestions] = useState<any[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<any[]>([]);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);
  const [remediating, setRemediating] = useState<string | null>(null);

  // GitHub Repos Discovery State
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Scanner Driven Deployment Modal State
  const [scannerProvisionOpen, setScannerProvisionOpen] = useState(false);
  const [scannerProvisionGroup, setScannerProvisionGroup] = useState<AppGroup | null>(null);
  const [scannerProvisionEnv, setScannerProvisionEnv] = useState<'dev' | 'qa' | 'prod' | null>(null);
  const [scannerProvisionBranch, setScannerProvisionBranch] = useState('');
  const [scannerProvisionSwaName, setScannerProvisionSwaName] = useState('');
  const [scannerProvisionSubdomain, setScannerProvisionSubdomain] = useState('');
  const [scannerProvisionDomain, setScannerProvisionDomain] = useState('esteviatech.com');
  const [scannerProvisionRegion, setScannerProvisionRegion] = useState('eastus2');

  // Scanner Modal Execution Step Status
  const [scannerDeployStep, setScannerDeployStep] = useState<number>(0); // 0: Idle, 1: SWA, 2: DNS, 3: Pipeline, 4: Done, -1: Error
  const [scannerDeployError, setScannerDeployError] = useState<string | null>(null);

  // Backend Custom Deploy Modal State (Option 3 info + future design hooks)
  const [backendDeployModalOpen, setBackendDeployModalOpen] = useState(false);
  const [backendDeployGroup, setBackendDeployGroup] = useState<AppGroup | null>(null);
  const [backendDeployBranch, setBackendDeployBranch] = useState('');
  const [backendDeployEnv, setBackendDeployEnv] = useState<'dev' | 'qa' | 'prod' | null>(null);

  const openBackendDeployModal = (group: AppGroup, env: string) => {
    setBackendDeployGroup(group);
    setBackendDeployBranch(env);
    const envKey = ['dev', 'development'].includes(env.toLowerCase()) ? 'dev' 
                 : (['qa', 'testing'].includes(env.toLowerCase()) ? 'qa' 
                 : (['main', 'master', 'prod', 'production'].includes(env.toLowerCase()) ? 'prod' : 'dev'));
    setBackendDeployEnv(envKey as 'dev' | 'qa' | 'prod');
    setBackendDeployModalOpen(true);
  };

  const openScannerProvisionModal = (group: AppGroup, env: string) => {
    setScannerProvisionGroup(group);
    
    const envKey = ['dev', 'development'].includes(env.toLowerCase()) ? 'dev' 
                 : (['qa', 'testing'].includes(env.toLowerCase()) ? 'qa' 
                 : (['main', 'master', 'prod', 'production'].includes(env.toLowerCase()) ? 'prod' : 'dev'));
    setScannerProvisionEnv(envKey as 'dev' | 'qa' | 'prod');
    
    if (group.repoPath) {
      fetchBranches(group.repoPath);
    }

    setScannerProvisionBranch(env);

    const repoSegment = group.repoPath.split('/').pop() || group.key;
    const baseName = `estevia-${repoSegment}`.toLowerCase();
    
    const cleanBranchName = env.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const swaName = `${baseName}-${cleanBranchName}`;
    setScannerProvisionSwaName(swaName);

    const subdomain = envKey === 'prod' ? repoSegment : `${cleanBranchName}-${repoSegment}`;
    setScannerProvisionSubdomain(subdomain.toLowerCase());

    setScannerProvisionDomain(defaultDnsDomain || 'esteviatech.com');
    setScannerProvisionRegion('eastus2');

    setScannerDeployStep(0);
    setScannerDeployError(null);
    setScannerProvisionOpen(true);
  };

  const handleDeployBranchFromDashboard = async (repoPath: string, branchName: string, type: 'frontend' | 'backend') => {
    isGuidedProvisionRef.current = true;
    
    // Auto-detect deployment type based on branch name and repo name heuristics
    const branchLower = branchName.toLowerCase();
    const repoLower = repoPath.toLowerCase();
    let detectedType = type;
    
    if (branchLower.includes('backend') || branchLower.includes('api') || branchLower.includes('server')) {
      detectedType = 'backend';
    } else if (branchLower.includes('frontend') || branchLower.includes('web') || branchLower.includes('swa') || branchLower.includes('client')) {
      detectedType = 'frontend';
    } else if (repoLower.includes('backend') || repoLower.includes('api') || repoLower.includes('server')) {
      detectedType = 'backend';
    } else if (repoLower.includes('frontend') || repoLower.includes('web') || repoLower.includes('swa') || repoLower.includes('client')) {
      detectedType = 'frontend';
    }
    
    setAppType(detectedType);
    setSelectedRepo(repoPath);
    
    const shortName = repoPath.split('/').pop() || '';
    const cleanBranch = branchName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const suffix = detectedType === 'frontend' ? 'swa' : 'api';
    setNewName(`${shortName}-${cleanBranch}-${suffix}`.substring(0, 60));
    
    setProvisionStep(1);
    setActiveTab('provision');
    
    await fetchBranches(repoPath, branchName);
  };

  const handleScannerBranchChange = (branchName: string) => {
    setScannerProvisionBranch(branchName);

    if (!scannerProvisionGroup || !scannerProvisionEnv) return;
    const repoSegment = scannerProvisionGroup.repoPath.split('/').pop() || scannerProvisionGroup.key;
    const baseName = `estevia-${repoSegment}`.toLowerCase();
    
    // Clean branch name for SWA and Subdomain
    const cleanBranch = branchName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    // SWA name hybrid: e.g. estevia-talenthq-frontend-feature-login
    const swaName = `${baseName}-${cleanBranch}`;
    setScannerProvisionSwaName(swaName);

    // Subdomain hybrid: e.g. feature-login-talenthq
    const subdomain = `${cleanBranch}-${repoSegment}`.toLowerCase();
    setScannerProvisionSubdomain(subdomain);
  };

  const handleScannerDeploy = async () => {
    if (!scannerProvisionGroup || !scannerProvisionEnv) return;
    setScannerDeployError(null);

    const orgId = organizationId;
    const repo = scannerProvisionGroup.repoPath;
    const swaName = scannerProvisionSwaName;
    const subdomain = scannerProvisionSubdomain;
    const domain = scannerProvisionDomain;
    const region = scannerProvisionRegion;
    const branch = scannerProvisionBranch;

    try {
      // Step 1: Provision Azure SWA resource
      setScannerDeployStep(1);
      const provRes = await fetch(`${API_BASE}/apps/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          name: swaName,
          type: 'frontend',
          location: region,
          githubRepo: repo
        })
      });
      const provData = await provRes.json();
      if (!provData.success) {
        throw new Error(provData.message || 'Azure SWA provisioning failed.');
      }

      // Step 2: Bind Custom Domain DNS mapping
      setScannerDeployStep(2);
      const dnsRes = await fetch(`${API_BASE}/apps/bind-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          appName: swaName,
          subdomain: subdomain,
          domain: domain
        })
      });
      const dnsData = await dnsRes.json();
      if (!dnsData.success) {
        throw new Error(dnsData.message || 'DNS CNAME mapping failed.');
      }

      // Step 3: Register/sync DevOps pipeline variables and SWA token
      setScannerDeployStep(3);
      const pipeRes = await fetch(`${API_BASE}/apps/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          appName: swaName,
          githubRepo: repo,
          devopsOrgUrl: devopsOrgUrl || azureDevopsOrgUrl,
          devopsProject: devopsProject || azureDevopsProject,
          branch: branch
        })
      });
      const pipeData = await pipeRes.json();
      if (!pipeData.success) {
        throw new Error(pipeData.message || 'CI/CD pipeline and variable sync failed.');
      }

      setScannerDeployStep(4);
      handleScan();
    } catch (e: any) {
      console.error('[ScannerDeploy] Failed:', e);
      setScannerDeployError(e.message || 'An unexpected error occurred during deployment.');
      setScannerDeployStep(-1);
    }
  };

  // Custom authenticated fetch wrapper (shadows standard fetch)
  const authFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
    const activeToken = localStorage.getItem('devops_token');
    const headers = new Headers(options.headers || {});
    
    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }
    
    if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    const res = await window.fetch(url, {
      ...options,
      headers
    });
    
    if (res.status === 401) {
      console.warn('[authFetch] Unauthorized session. Logging out.');
      setToken(null);
      setUser(null);
      localStorage.removeItem('devops_token');
      localStorage.removeItem('devops_user');
    }
    
    return res;
  };

  const fetch = authFetch;

  // Authentication Handlers
  const handleMicrosoftLoginRedirect = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/login-url`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Could not retrieve Microsoft login URL from backend.');
      }
    } catch (err: any) {
      console.error('[auth] Failed redirecting to Microsoft:', err);
      setAuthError(err.message || 'Failed to initialize Microsoft login.');
      setAuthLoading(false);
    }
  };

  const handleMicrosoftCallback = async (code: string) => {
    setAuthLoading(true);
    setAuthError(null);
    console.log('[DevOps Auth] Starting Microsoft login exchange. API URL:', `${API_BASE}/auth/microsoft`, 'Code:', code);
    try {
      const res = await window.fetch(`${API_BASE}/auth/microsoft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      console.log('[DevOps Auth] Response status received:', res.status);
      const data = await res.json();
      console.log('[DevOps Auth] Response JSON received:', data);
      if (res.ok && data.token) {
        localStorage.setItem('devops_token', data.token);
        localStorage.setItem('devops_user', JSON.stringify(data.user));
        localStorage.setItem('devops_requires_onboarding', String(data.requiresOnboarding));
        if (data.organization && data.organization.id) {
          setOrganizationId(data.organization.id);
          setOrgName(data.organization.name || data.organization.id);
        }
        setToken(data.token);
        setUser(data.user);
        setRequiresOnboarding(data.requiresOnboarding);
      } else {
        throw new Error(data.error || data.message || 'Failed to exchange authorization code.');
      }
    } catch (err: any) {
      console.error('[auth] Microsoft callback login failed:', err);
      setAuthError(err.message || 'Failed to complete Microsoft authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBypassLogin = async () => {
    if (!devOverrideOrgId.trim()) {
      setDevOverrideError('Please enter an Organisation ID.');
      return;
    }
    setAuthLoading(true);
    setDevOverrideError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: devOverrideOrgId.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('devops_token', data.token);
        localStorage.setItem('devops_user', JSON.stringify(data.user));
        localStorage.setItem('devops_requires_onboarding', String(data.requiresOnboarding));
        if (data.organization && data.organization.id) {
          setOrganizationId(data.organization.id);
          setOrgName(data.organization.name || data.organization.id);
        }
        setToken(data.token);
        setUser(data.user);
        setRequiresOnboarding(data.requiresOnboarding);
        setShowDevOverrideForm(false);
      } else {
        throw new Error(data.error || 'Developer Override login failed.');
      }
    } catch (err: any) {
      console.error('[auth] Developer Override failed:', err);
      setDevOverrideError(err.message || 'Developer Override failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminOverride = async () => {
    if (!adminOverrideOrgId.trim() || !adminOverridePassword.trim()) {
      setAdminOverrideError('Please enter both Organisation ID and password.');
      return;
    }
    setAdminOverrideLoading(true);
    setAdminOverrideError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/admin-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: adminOverrideOrgId.trim().toLowerCase(), password: adminOverridePassword })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('devops_token', data.token);
        localStorage.setItem('devops_user', JSON.stringify(data.user));
        localStorage.setItem('devops_requires_onboarding', String(data.requiresOnboarding));
        if (data.organization && data.organization.id) {
          setOrganizationId(data.organization.id);
          setOrgName(data.organization.name || data.organization.id);
        }
        setToken(data.token);
        setUser(data.user);
        setRequiresOnboarding(data.requiresOnboarding);
        setShowAdminOverrideForm(false);
      } else {
        throw new Error(data.error || 'Admin Override authentication failed.');
      }
    } catch (err: any) {
      console.error('[auth] Admin Override failed:', err);
      setAdminOverrideError(err.message || 'Admin Override failed. Check org ID and password.');
    } finally {
      setAdminOverrideLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devops_token');
    localStorage.removeItem('devops_user');
    localStorage.removeItem('devops_requires_onboarding');
    setToken(null);
    setUser(null);
    setRequiresOnboarding(false);
    setCostSummary(null);
    setDetailedCosts([]);
    setCostSuggestions([]);
  };

  // Onboarding Wizard API Handlers
  const handleOnboardStep1 = async () => {
    if (!onboardOrgName || !onboardAdminEmail) {
      setOnboardError('Please fill out all fields.');
      return;
    }
    setOnboardSubmitting(true);
    setOnboardError(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: onboardOrgName, adminEmail: onboardAdminEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrganizationId(data.organization.id);
        setOrgName(data.organization.name);
        setOnboardStep(2);
      } else {
        throw new Error(data.message || 'Failed to configure organization.');
      }
    } catch (err: any) {
      setOnboardError(err.message || 'Error occurred while creating organization profile.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  const handleTestAzureConnection = async () => {
    if (!onboardAzureSubId || !onboardAzureClientId || !onboardAzureClientSecret) {
      setOnboardTestResult({ type: 'error', text: 'Please fill out all Azure credential fields.' });
      return;
    }
    setOnboardTesting(true);
    setOnboardTestResult(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/test/azure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: onboardAzureSubId,
          tenantId: onboardAzureTenantId,
          clientId: onboardAzureClientId,
          clientSecret: onboardAzureClientSecret
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOnboardTestResult({ type: 'success', text: data.message });
      } else {
        throw new Error(data.message || 'Azure connection test failed.');
      }
    } catch (err: any) {
      setOnboardTestResult({ type: 'error', text: err.message });
    } finally {
      setOnboardTesting(false);
    }
  };

  const handleOnboardStep2 = async () => {
    if (!onboardAzureSubId || !onboardAzureClientId || !onboardAzureClientSecret || !onboardAzureRg) {
      setOnboardError('Please fill out all Azure connection fields.');
      return;
    }
    setOnboardSubmitting(true);
    setOnboardError(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/setup-azure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: onboardAzureSubId,
          tenantId: onboardAzureTenantId,
          clientId: onboardAzureClientId,
          clientSecret: onboardAzureClientSecret,
          resourceGroup: onboardAzureRg
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOnboardStep(3);
      } else {
        throw new Error(data.message || 'Failed to save Azure configuration.');
      }
    } catch (err: any) {
      setOnboardError(err.message || 'Error occurred while saving Azure configuration.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  const handleTestCicdConnection = async () => {
    if (!onboardGithubOwner || !onboardGithubPat || !onboardDevopsUrl || !onboardDevopsProject || !onboardDevopsPat) {
      setOnboardTestResult({ type: 'error', text: 'Please fill out all GitHub and Azure DevOps fields.' });
      return;
    }
    setOnboardTesting(true);
    setOnboardTestResult(null);
    try {
      const ghRes = await window.fetch(`${API_BASE}/org/test/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          githubOwner: onboardGithubOwner,
          githubPat: onboardGithubPat
        })
      });
      const ghData = await ghRes.json();
      if (!ghRes.ok || !ghData.success) {
        throw new Error(`GitHub verification failed: ${ghData.message || 'Unauthorized'}`);
      }

      const devopsRes = await window.fetch(`${API_BASE}/org/test/devops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          devopsOrgUrl: onboardDevopsUrl,
          devopsProject: onboardDevopsProject,
          devopsPat: onboardDevopsPat
        })
      });
      const devopsData = await devopsRes.json();
      if (!devopsRes.ok || !devopsData.success) {
        throw new Error(`Azure DevOps verification failed: ${devopsData.message || 'Unauthorized'}`);
      }

      setOnboardTestResult({ type: 'success', text: '✅ Both GitHub and Azure DevOps authenticated successfully!' });
    } catch (err: any) {
      setOnboardTestResult({ type: 'error', text: err.message });
    } finally {
      setOnboardTesting(false);
    }
  };

  const handleOnboardStep3 = async () => {
    if (!onboardGithubOwner || !onboardGithubPat || !onboardDevopsUrl || !onboardDevopsProject || !onboardDevopsPat) {
      setOnboardError('Please fill out all GitHub and Azure DevOps fields.');
      return;
    }
    setOnboardSubmitting(true);
    setOnboardError(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/setup-devops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          devopsOrgUrl: onboardDevopsUrl,
          devopsProject: onboardDevopsProject,
          devopsPat: onboardDevopsPat,
          githubOwner: onboardGithubOwner,
          githubPat: onboardGithubPat
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOnboardStep(4);
      } else {
        throw new Error(data.message || 'Failed to save CI/CD configuration.');
      }
    } catch (err: any) {
      setOnboardError(err.message || 'Error occurred while saving CI/CD configuration.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  const handleTestDnsConnection = async () => {
    if (!onboardGodaddyKey || !onboardGodaddySecret || !onboardGodaddyDomain) {
      setOnboardTestResult({ type: 'error', text: 'Please fill out all GoDaddy configuration fields.' });
      return;
    }
    setOnboardTesting(true);
    setOnboardTestResult(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/test/godaddy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apiKey: onboardGodaddyKey,
          apiSecret: onboardGodaddySecret,
          defaultDomain: onboardGodaddyDomain
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOnboardTestResult({ type: 'success', text: '✅ GoDaddy domain keys validated successfully.' });
      } else {
        throw new Error(data.message || 'GoDaddy DNS test failed.');
      }
    } catch (err: any) {
      setOnboardTestResult({ type: 'error', text: err.message });
    } finally {
      setOnboardTesting(false);
    }
  };

  const handleOnboardStep4 = async () => {
    if (!onboardGodaddyKey || !onboardGodaddySecret || !onboardGodaddyDomain) {
      setOnboardError('Please fill out all GoDaddy configuration fields.');
      return;
    }
    setOnboardSubmitting(true);
    setOnboardError(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/setup-dns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apiKey: onboardGodaddyKey,
          apiSecret: onboardGodaddySecret,
          defaultDomain: onboardGodaddyDomain
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOnboardStep(5);
      } else {
        throw new Error(data.message || 'Failed to save DNS configuration.');
      }
    } catch (err: any) {
      setOnboardError(err.message || 'Error occurred while saving DNS configuration.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  const handleOnboardComplete = async () => {
    setOnboardSubmitting(true);
    setOnboardError(null);
    try {
      const res = await window.fetch(`${API_BASE}/org/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequiresOnboarding(false);
        localStorage.setItem('devops_requires_onboarding', 'false');
        fetchOrgSettings();
        fetchGithubRepos();
        handleScan();
      } else {
        throw new Error(data.message || 'Failed to finalize onboarding.');
      }
    } catch (err: any) {
      setOnboardError(err.message || 'Error completing onboarding wizard.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Cost Management handler
  const fetchCostData = async () => {
    setLoadingCosts(true);
    setCostError(null);
    try {
      const res = await fetch(`${API_BASE}/apps/cost?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success) {
        setCostSummary(data.summary);
        setDetailedCosts(data.detailedCosts || []);
        setCostSuggestions(data.suggestions || []);
        setAppliedSuggestions(data.appliedSuggestions || []);
      } else {
        throw new Error(data.message || 'Failed to retrieve cloud cost analytics.');
      }

      // Also fetch billing history invoices
      const billingRes = await fetch(`${API_BASE}/apps/billing?organizationId=${organizationId}`);
      if (billingRes.ok) {
        const billingData = await billingRes.json();
        setInvoices(billingData);
      }
    } catch (err: any) {
      console.error('[cost] Failed loading cost data:', err);
      setCostError(err.message || 'Failed loading cost metrics.');
    } finally {
      setLoadingCosts(false);
    }
  };

  const handleApplyRemediation = async (suggestionId: string, type: string, appName: string) => {
    setRemediating(suggestionId);
    try {
      const suggestion = costSuggestions.find(s => s.id === suggestionId);
      const savings = suggestion ? suggestion.savings : 0;

      const res = await fetch(`${API_BASE}/apps/cost/apply-remediation`, {
        method: 'POST',
        body: JSON.stringify({
          organizationId,
          suggestionId,
          type,
          appName,
          savings
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to apply remediation.');
      }
      
      setCostSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      if (suggestion) {
        setAppliedSuggestions(prev => [...prev, { ...suggestion, applied: true }]);
      }
      
      const typeLabel = type === 'scale_zero' ? 'Scaled to Zero'
                      : type === 'tier_demote' ? 'Demoted Tier'
                      : type === 'stop_vm' ? 'Auto-Shutdown Scheduled'
                      : 'Consolidated Registries';
      addEvent(
        'Remediation Applied',
        `Successfully applied cost optimization policy (${typeLabel}) for resource '${appName}'. Mapped savings: $${savings.toFixed(2)}/mo.`,
        'power',
        'success'
      );
      
      setCostSummary((prev: any) => {
        if (!prev) return null;
        const newScore = Math.min(100, prev.optimizationScore + (type === 'scale_zero' ? 15 : (type === 'tier_demote' || type === 'stop_vm' ? 10 : 5)));
        const newRunRate = Math.max(0, prev.monthlyRunRate - savings);
        const newSavings = Math.max(0, prev.potentialSavings - savings);
        return {
          ...prev,
          optimizationScore: newScore,
          monthlyRunRate: newRunRate,
          potentialSavings: newSavings
        };
      });

      if (type === 'tier_demote') {
        setDetailedCosts(prev => prev.map(c => {
          if (c.name === appName) {
            return { ...c, resourceCost: 0, totalCost: c.dnsCost, details: 'Static Web App Free Tier' };
          }
          return c;
        }));
      } else if (type === 'scale_zero') {
        setDetailedCosts(prev => prev.map(c => {
          if (c.name === appName) {
            return { ...c, resourceCost: 0, totalCost: c.dnsCost, details: 'Container App (Scaled to Zero - Idle)' };
          }
          return c;
        }));
      } else if (type === 'remove_cname') {
        setDetailedCosts(prev => prev.map(c => {
          if (c.name === appName) {
            return { ...c, dnsCost: 0, totalCost: c.resourceCost, fqdn: null };
          }
          return c;
        }));
      } else if (type === 'stop_vm') {
        setDetailedCosts(prev => prev.map(c => {
          if (c.name === appName) {
            const newCost = Math.max(0, c.resourceCost - savings);
            return { ...c, resourceCost: newCost, totalCost: newCost + c.dnsCost, details: 'Azure Virtual Machine (Auto-Shutdown Scheduled)' };
          }
          return c;
        }));
      }
    } catch (err: any) {
      console.error('[cost] Failed to apply optimization remediation:', err.message);
    } finally {
      setRemediating(null);
    }
  };


  const fetchTeamUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch team users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSyncTeam = async () => {
    setSyncingTeam(true);
    try {
      const res = await fetch(`${API_BASE}/auth/users/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        await fetchTeamUsers();
        return data;
      } else {
        const errData = await res.json().catch(() => null);
        console.error('Failed to sync team directory. Server responded with status:', res.status, errData);
        return null;
      }
    } catch (err) {
      console.error('Failed to sync team directory:', err);
      return null;
    } finally {
      setSyncingTeam(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        await fetchTeamUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update user role:', err);
      return false;
    }
  };

  // Check query parameter ?code=... on mount for OAuth redirect callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleMicrosoftCallback(code);
    }
  }, []);

  // Load registered credentials, configurations and scan initially (if authenticated)
  useEffect(() => {
    if (token) {
      fetchCredentialStatus();
      fetchResourceGroups();
      handleScan();
      fetchOrgSettings();
      fetchGithubRepos();
      fetchCostData();
      fetchDbServers();
      if (user?.role === 'owner' || user?.role === 'admin') {
        fetchTeamUsers();
      }
    }
  }, [organizationId, token, user?.role]);

  // Auto-scan cloud resources and refresh costs with a 5-minute countdown timer
  useEffect(() => {
    if (token) {
      setSyncCountdown(300);
      const interval = setInterval(() => {
        setSyncCountdown((prev) => {
          if (prev <= 1) {
            console.log('[DevOps Auto Refresh] Timer reached 0. Triggering auto cloud & cost scan...');
            handleScan();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [token, organizationId]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devops_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const fetchOrgSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/apps/organization-settings?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success && data.settings) {
        setOrgName(data.settings.name || data.settings.id || organizationId);
        setAzureSubscriptionId(data.settings.azure_subscription_id || '');
        setAzureResourceGroup(data.settings.azure_resource_group || '');
        
        // Update control resource groups
        setPrimaryResourceGroup(data.settings.azure_resource_group || '');
        if (!selectedControlResourceGroup && data.settings.azure_resource_group) {
          setSelectedControlResourceGroup(data.settings.azure_resource_group);
          localStorage.setItem('selectedControlResourceGroup', data.settings.azure_resource_group);
        }
        setDefaultDnsDomain(data.settings.default_dns_domain || '');
        setAzureDevopsOrgUrl(data.settings.azure_devops_org_url || '');
        setAzureDevopsProject(data.settings.azure_devops_project || '');
        setPipelineVariableGroup(data.settings.pipeline_variable_group || '');
        setGithubOwner(data.settings.github_owner || '');
        setAzureContainerRegistry(data.settings.azure_container_registry || '');
        setAzureDevopsServiceConnection(data.settings.azure_devops_service_connection || '');
        setDockerRegistryServiceConnection(data.settings.docker_registry_service_connection || '');
        setTeamsWebhookUrl(data.settings.teams_webhook_url || '');
        setTeamsWebhookToken(data.settings.teams_webhook_token || '');
        setLogAnalyticsWorkspaceId(data.settings.log_analytics_workspace_id || '');
        setAzureKeyVaultUrl(data.settings.azure_key_vault_url || '');
        setDevDbHost(data.settings.dev_db_host || '');
        setQaDbHost(data.settings.qa_db_host || '');
        setProdDbHost(data.settings.prod_db_host || '');
        setDevManagedEnvId(data.settings.dev_managed_env_id || '');
        setProdManagedEnvId(data.settings.prod_managed_env_id || '');
        
        // Auto-configure default inputs
        setDomainInput(data.settings.default_dns_domain || 'esteviatech.com');
        setDevopsOrgUrl(data.settings.azure_devops_org_url || 'https://dev.azure.com/esteviatech');
        setDevopsProject(data.settings.azure_devops_project || 'Estevia-Platform');
      }
    } catch (e) {
      console.error('Failed to load organization settings:', e);
    }
  };

  const fetchGithubRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch(`${API_BASE}/apps/github-repos?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.repos)) {
        setGithubRepos(data.repos);
      }
    } catch (e) {
      console.error('Failed to load GitHub repos:', e);
    } finally {
      setLoadingRepos(false);
    }
  };

  const getCategorizedRepos = (type?: 'frontend' | 'backend' | 'cluster' | 'database') => {
    if (!type) return { recommended: [], other: githubRepos };
    const isFrontendApp = type === 'frontend';
    const recommended: any[] = [];
    const other: any[] = [];

    githubRepos.forEach(repo => {
      const name = repo.fullName.toLowerCase();
      const isRepoBackend = name.includes('backend') || name.includes('api') || name.includes('ml-setup');
      const isRepoFrontend = name.includes('frontend') || name.includes('web') || name.includes('react') || name.includes('site') || name.includes('docs');
      
      if (isFrontendApp) {
        if (isRepoFrontend && !isRepoBackend) {
          recommended.push(repo);
        } else {
          other.push(repo);
        }
      } else {
        if (isRepoBackend || name.includes('devhub') || name.includes('sdk')) {
          recommended.push(repo);
        } else {
          other.push(repo);
        }
      }
    });

    return { recommended, other };
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);
    try {
      const res = await fetch(`${API_BASE}/apps/organization-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          azureSubscriptionId,
          azureResourceGroup,
          defaultDnsDomain,
          azureDevopsOrgUrl,
          azureDevopsProject,
          pipelineVariableGroup,
          githubOwner,
          azureContainerRegistry,
          azureDevopsServiceConnection,
          dockerRegistryServiceConnection,
          teamsWebhookUrl,
          logAnalyticsWorkspaceId,
          azureKeyVaultUrl,
          devDbHost,
          qaDbHost,
          prodDbHost,
          devManagedEnvId,
          prodManagedEnvId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg({ type: 'success', text: 'Organization settings updated successfully!' });
        fetchOrgSettings();
        fetchGithubRepos();
      } else {
        setSettingsMsg({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (e: any) {
      setSettingsMsg({ type: 'error', text: e.message || 'Error saving organization settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDiscoverAzureResources = async () => {
    setDiscoveringInfra(true);
    setSettingsMsg(null);
    try {
      const res = await fetch(`${API_BASE}/apps/discover-azure-resources?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success && data.resources) {
        const { devDbHost, qaDbHost, prodDbHost, devManagedEnvId, prodManagedEnvId } = data.resources;
        if (devDbHost) setDevDbHost(devDbHost);
        if (qaDbHost) setQaDbHost(qaDbHost);
        if (prodDbHost) setProdDbHost(prodDbHost);
        if (devManagedEnvId) setDevManagedEnvId(devManagedEnvId);
        if (prodManagedEnvId) setProdManagedEnvId(prodManagedEnvId);
        
        setSettingsMsg({ type: 'success', text: 'Infrastructure resources discovered successfully!' });
      } else {
        setSettingsMsg({ type: 'error', text: data.message || 'Auto-discovery did not find any resources. Please verify your Azure credentials and resource group.' });
      }
    } catch (e: any) {
      setSettingsMsg({ type: 'error', text: e.message || 'Error discovering Azure resources.' });
    } finally {
      setDiscoveringInfra(false);
    }
  };

  // Compute grouped apps (by shared repo / base name) whenever apps change
  const appGroups = useMemo(() => groupApps(apps), [apps]);

  const fetchCredentialStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/credentials?organizationId=${organizationId}`);
      if (res.ok) {
        const data = await res.json();
        const statusMap: Record<string, boolean> = {};
        data.forEach((cred: any) => {
          statusMap[cred.provider] = true;
        });
        setCredentialStatus(statusMap);
        
        // Prefill masked values for configured credentials
        if (statusMap.github) {
          setGithubToken(prev => prev === '' ? '••••••••••••••••••••' : prev);
        }
        if (statusMap.godaddy) {
          setGodaddyKey(prev => prev === '' ? '••••••••••••••••••••' : prev);
          setGodaddySecret(prev => prev === '' ? '••••••••••••••••••••' : prev);
        }
        if (statusMap.azure_devops) {
          setDevopsPat(prev => prev === '' ? '••••••••••••••••••••' : prev);
        }
      }
    } catch (e) {
      console.error('Failed to load credential status:', e);
    }
  };

  const fetchDbServers = async () => {
    setLoadingDbServers(true);
    try {
      const res = await fetch(`${API_BASE}/apps/db-servers?organizationId=${organizationId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDbServers(data.servers);
          if (data.servers.length > 0) {
            // Find existing selection or default to first
            setSelectedDbServer(data.servers[0]);
            fetchDatabases(data.servers[0].name);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load database servers:', e);
    } finally {
      setLoadingDbServers(false);
    }
  };

  const fetchDatabases = async (serverName: string) => {
    setLoadingDatabases(true);
    setDatabases([]);
    setSelectedDatabase(null);
    setDatabaseSchema([]);
    try {
      const res = await fetch(`${API_BASE}/apps/databases?organizationId=${organizationId}&serverName=${serverName}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDatabases(data.databases);
          if (data.databases.length > 0) {
            setSelectedDatabase(data.databases[0]);
            fetchDatabaseSchema(serverName, data.databases[0].name);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load databases:', e);
    } finally {
      setLoadingDatabases(false);
    }
  };

  const fetchDatabaseSchema = async (serverName: string, dbName: string) => {
    setLoadingSchema(true);
    setDatabaseSchema([]);
    setSchemaError(null);
    try {
      const res = await fetch(`${API_BASE}/apps/database-schema?organizationId=${organizationId}&serverName=${serverName}&dbName=${dbName}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.error) {
            setSchemaError(data.error);
          } else {
            setDatabaseSchema(data.schema || []);
            if (data.schema && data.schema.length > 0) {
              setExpandedTables({ [data.schema[0].table]: true });
            }
          }
        } else {
          setSchemaError(data.message || 'Failed to retrieve schema');
        }
      } else {
        setSchemaError(`HTTP Error: ${res.status}`);
      }
    } catch (e: any) {
      console.error('Failed to load database schema:', e);
      setSchemaError(e.message || 'Connection failed');
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleProvisionDatabase = async () => {
    if (!selectedDbServer || !newDbName.trim()) return;
    const dbName = newDbName.trim();
    
    setConfirmDialog({
      isOpen: true,
      title: 'Deploy New Database Schema',
      message: `Are you sure you want to deploy a new MySQL database schema named '${dbName}' on server '${selectedDbServer.name}'?`,
      confirmLabel: 'Deploy Database',
      cancelLabel: 'Cancel',
      type: 'info',
      onConfirm: async () => {
        setDeployingDb(true);
        setDeployDbSuccess(null);
        setDeployDbError(null);
        try {
          const res = await fetch(`${API_BASE}/apps/databases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              organizationId,
              serverName: selectedDbServer.name,
              dbName: dbName
            })
          });
          const data = await res.json();
          if (data.success) {
            setDeployDbSuccess(data.message || `Database '${dbName}' deployed successfully.`);
            setNewDbName('');
            fetchDatabases(selectedDbServer.name);
          } else {
            setDeployDbError(data.message || 'Failed to deploy database.');
          }
        } catch (e: any) {
          setDeployDbError(e.message || 'Error occurred while deploying database.');
        } finally {
          setDeployingDb(false);
        }
      }
    });
  };

  const getTableNameFromQuery = (sql: string) => {
    if (!sql) return null;
    const regex = /\bfrom\b/gi;
    let match;
    let lastFromIdx = -1;
    while ((match = regex.exec(sql)) !== null) {
      lastFromIdx = match.index;
    }
    if (lastFromIdx === -1) return null;
    const afterFrom = sql.substring(lastFromIdx + 4).trim();
    const tableMatch = afterFrom.match(/^(?:\`?([a-zA-Z0-9_-]+)\`?\.)?\`?([a-zA-Z0-9_-]+)\`?/);
    return tableMatch ? tableMatch[2] : null;
  };

  const handleExecuteQuery = async (customSql: string, reloadSchemaAfter = false) => {
    if (!selectedDbServer || !selectedDatabase || !customSql.trim()) return;
    setQueryExecuting(true);
    setQueryResult(null);
    setQueryError(null);
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}/apps/execute-query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serverName: selectedDbServer.name,
          dbName: selectedDatabase.name,
          query: customSql.trim()
        })
      });
      const data = await res.json();
      const endTime = performance.now();
      const execTimeMs = Math.round(endTime - startTime);
      if (res.ok && data.success) {
        setQueryResult({ ...data, execTimeMs });
        if (reloadSchemaAfter) {
          fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name);
        }
      } else {
        setQueryError(data.message || 'Query execution failed.');
      }
    } catch (e: any) {
      setQueryError(e.message || 'Error occurred executing query.');
    } finally {
      setQueryExecuting(false);
    }
  };

  const handleCreateTable = async () => {
    if (!selectedDbServer || !selectedDatabase || !newTableName.trim()) return;
    setCreatingTable(true);
    setCreateTableError(null);
    try {
      const columnsSql = tableColumns.map(col => {
        let sql = `\`${col.name}\` ${col.type}`;
        if (!col.nullable) sql += ' NOT NULL';
        if (col.isPrimary) sql += ' PRIMARY KEY';
        if (col.extra) sql += ` ${col.extra}`;
        return sql;
      }).join(', ');
      
      const sql = `CREATE TABLE \`${newTableName.trim()}\` (${columnsSql});`;
      
      const res = await fetch(`${API_BASE}/apps/execute-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serverName: selectedDbServer.name,
          dbName: selectedDatabase.name,
          query: sql
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewTableName('');
        setTableColumns([
          { name: 'id', type: 'INT', nullable: false, isPrimary: true, extra: 'AUTO_INCREMENT' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, isPrimary: false, extra: '' }
        ]);
        setDbDetailTab('schema');
        fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name);
      } else {
        setCreateTableError(data.message || 'Failed to create table.');
      }
    } catch (e: any) {
      setCreateTableError(e.message || 'Error occurred creating table.');
    } finally {
      setCreatingTable(false);
    }
  };

  const handleDropTable = async (tableName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'DROP Table (Destructive Action)',
      message: `Are you absolutely sure you want to DROP the table '${tableName}'? This will permanently delete all data and structure associated with this table. This action cannot be undone.`,
      confirmLabel: 'DROP TABLE',
      cancelLabel: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const sql = `DROP TABLE \`${tableName}\`;`;
          const res = await fetch(`${API_BASE}/apps/execute-query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              serverName: selectedDbServer.name,
              dbName: selectedDatabase.name,
              query: sql
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setQueryResult(null);
            fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name);
          } else {
            alert(`Failed to drop table: ${data.message || 'Unknown error'}`);
          }
        } catch (e: any) {
          alert(`Error dropping table: ${e.message}`);
        }
      }
    });
  };

  const handleAddColumn = async (tableName: string) => {
    if (!alterNewColName.trim()) return;
    const columnName = alterNewColName.trim();
    const columnType = alterNewColType;
    const nullability = alterNewColNullable ? 'NULL' : 'NOT NULL';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Alter Table (Add Attribute)',
      message: `Are you sure you want to add the attribute '${columnName}' of type '${columnType}' (${nullability}) to the table '${tableName}'?`,
      confirmLabel: 'Add Column',
      cancelLabel: 'Cancel',
      type: 'info',
      onConfirm: async () => {
        try {
          const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnType} ${nullability};`;
          const res = await fetch(`${API_BASE}/apps/execute-query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              serverName: selectedDbServer.name,
              dbName: selectedDatabase.name,
              query: sql
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setAlteringTable(null);
            setAlterNewColName('');
            fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name);
          } else {
            alert(`Failed to add column: ${data.message || 'Unknown error'}`);
          }
        } catch (e: any) {
          alert(`Error adding column: ${e.message}`);
        }
      }
    });
  };

  const handleDropColumn = async (tableName: string, columnName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Drop Column/Attribute (Destructive Action)',
      message: `Are you sure you want to drop the column '${columnName}' from the table '${tableName}'? This will permanently delete all data stored in this column.`,
      confirmLabel: 'Drop Column',
      cancelLabel: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const sql = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\`;`;
          const res = await fetch(`${API_BASE}/apps/execute-query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              serverName: selectedDbServer.name,
              dbName: selectedDatabase.name,
              query: sql
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name);
          } else {
            alert(`Failed to drop column: ${data.message || 'Unknown error'}`);
          }
        } catch (e: any) {
          alert(`Error dropping column: ${e.message}`);
        }
      }
    });
  };

  const [controllingResource, setControllingResource] = useState<string | null>(null);

  const handleResourceControl = async (name: string, action: 'start' | 'stop' | 'restart') => {
    setControllingResource(name);
    const actionLabel = action === 'start' ? 'Starting' : action === 'stop' ? 'Stopping' : 'Restarting';
    const actionFinishedLabel = action === 'start' ? 'Started' : action === 'stop' ? 'Stopped' : 'Restarted';
    showToast(`${actionLabel} VM`, `Initiated ${action} action on Virtual Machine: ${name}`, 'info');
    addEvent(`${actionLabel} VM`, `Initiated ${action} action on Virtual Machine: ${name}`, 'power', 'info');
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/${name}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, organizationId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`VM ${actionFinishedLabel}`, `Virtual Machine: ${name} was successfully ${actionFinishedLabel.toLowerCase()}`, 'success');
        addEvent(`VM ${actionFinishedLabel}`, `Virtual Machine: ${name} was successfully ${actionFinishedLabel.toLowerCase()}`, 'power', 'success');
        // Refresh scanned resources list to update statuses
        handleScan();
      } else {
        showToast(`VM Power Control Failed`, data.message || `Failed to perform ${action} action.`, 'error');
        addEvent(`VM Power Control Failed`, data.message || `Failed to perform ${action} action on ${name}.`, 'power', 'failed');
        alert(data.message || `Failed to perform ${action} action.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`VM Power Control Error`, `Network error executing power control action on ${name}.`, 'error');
      addEvent(`VM Power Control Error`, `Network error executing power control action on ${name}.`, 'power', 'failed');
      alert('Network error executing power control action.');
    } finally {
      setControllingResource(null);
    }
  };

  const handleScan = async (rg?: string) => {
    setScanning(true);
    setScanError(null);
    setSyncCountdown(300); // Reset timer on manual scan
    const activeRg = rg !== undefined ? rg : selectedControlResourceGroup;
    const scanUrl = `${API_BASE}/apps/scan?organizationId=${organizationId}${activeRg ? `&resourceGroup=${activeRg}` : ''}`;
    console.log('[DevOps Scan] [START] Initiating Cloud Scan.', { organizationId, scanUrl });
    try {
      const res = await fetch(scanUrl);
      console.log('[DevOps Scan] [HTTP STATUS]', res.status, res.statusText);
      
      const data = await res.json();
      console.log('[DevOps Scan] [RESPONSE DATA]', data);
      
      if (data.success) {
        const appsCount = data.apps ? data.apps.length : 0;
        console.log(`[DevOps Scan] [SUCCESS] Discovered ${appsCount} resources.`, data.apps);
        if (appsCount === 0) {
          console.warn('[DevOps Scan] [WARN] Scan returned 0 active resources. Check Azure subscription permissions or resource group filters.');
        }
        setApps(data.apps || []);
        addEvent('Cloud Scan Completed', `Discovered ${appsCount} resources in resource group: ${activeRg || 'All'}.`, 'scan', 'success');
        
        // Dispatch integrity notifications if present
        if (data.integrity) {
          const { github, godaddy, azure } = data.integrity;
          const details = [
            `GitHub: ${github.success ? '🟢 Healthy' : `🔴 ${github.message}`}`,
            `GoDaddy: ${godaddy.success ? '🟢 Healthy' : `🔴 ${godaddy.message}`}`,
            `Azure: ${azure.success ? '🟢 Healthy' : `🔴 ${azure.message}`}`
          ].join(' | ');

          const isOverallHealthy = github.success && godaddy.success && azure.success;
          const notifType = isOverallHealthy ? 'success' : 'warning';
          
          addNotification(
            'Environment Integrity Report',
            details,
            notifType
          );
        }

        // Auto-update cost management metrics as part of the scan flow
        console.log('[DevOps Scan] Triggering cost metrics refresh...');
        await fetchCostData();
      } else {
        console.error('[DevOps Scan] [API ERROR] Backend reported failure:', data.message || data.error);
        setScanError(data.message || 'Failed to scan Azure resources.');
        addEvent('Cloud Scan Failed', data.message || 'Failed to scan Azure resources.', 'scan', 'failed');
        addNotification('Cloud Scan Failed', data.message || 'Failed to scan Azure resources.', 'error');
      }
    } catch (e: any) {
      console.error('[DevOps Scan] [FETCH EXCEPTION] Connection/parsing error:', e);
      setScanError(e.message || 'Error connecting to the DevOps backend server.');
      addEvent('Cloud Scan Error', e.message || 'Error connecting to the DevOps backend server.', 'scan', 'failed');
      addNotification('Cloud Scan Error', e.message || 'Error connecting to the DevOps backend server.', 'error');
    } finally {
      console.log('[DevOps Scan] [END] Scan finished.');
      setScanning(false);
    }
  };

  const fetchResourceGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/apps/resource-groups?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.resourceGroups)) {
        setControlResourceGroups(data.resourceGroups);
      }
    } catch (e) {
      console.error('Failed to load resource groups:', e);
    }
  };

  const handleResourceGroupChange = (rg: string) => {
    setSelectedControlResourceGroup(rg);
    localStorage.setItem('selectedControlResourceGroup', rg);
    handleScan(rg);
  };

  const handleSaveCredential = async (provider: string, secrets: any, name: string) => {
    setSavingCredentials(provider);
    setCredMsg(null);
    try {
      const res = await fetch(`${API_BASE}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          provider,
          credentialName: name,
          secrets
        })
      });
      const data = await res.json();
      if (data.success) {
        setCredMsg({ type: 'success', text: `${provider.toUpperCase()} credentials registered successfully.` });
        showToast('Credentials Saved', `${provider.toUpperCase()} credentials successfully updated.`, 'success');
        addEvent('Credentials Updated', `${provider.toUpperCase()} credentials registered successfully.`, 'credential', 'success');
        fetchCredentialStatus();
        // Clear forms and decrypted tracking
        if (provider === 'github') {
          setGithubToken('');
          setDecryptedGithubToken('');
        }
        if (provider === 'godaddy') {
          setGodaddyKey('');
          setGodaddySecret('');
          setDecryptedGodaddyKey('');
          setDecryptedGodaddySecret('');
        }
        if (provider === 'azure_devops') {
          setDevopsPat('');
          setDecryptedDevopsPat('');
        }
      } else {
        setCredMsg({ type: 'error', text: data.message || 'Failed to save credentials.' });
        showToast('Credentials Save Failed', data.message || `Failed to save ${provider.toUpperCase()} credentials.`, 'error');
        addEvent('Credentials Update Failed', data.message || `Failed to save ${provider.toUpperCase()} credentials.`, 'credential', 'failed');
      }
    } catch (e: any) {
      setCredMsg({ type: 'error', text: e.message || 'Error saving credentials.' });
      showToast('Credentials Save Error', e.message || 'Error saving credentials.', 'error');
      addEvent('Credentials Update Error', e.message || 'Error saving credentials.', 'credential', 'failed');
    } finally {
      setSavingCredentials(null);
    }
  };

  const handleLoadSavedCredential = async (provider: string) => {
    try {
      const res = await fetch(`${API_BASE}/credentials/decrypt?organizationId=${organizationId}&provider=${provider}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.secrets) {
          if (provider === 'github') {
            setGithubToken(data.secrets.token || '');
            setDecryptedGithubToken(data.secrets.token || '');
            setShowGithubToken(true);
          } else if (provider === 'godaddy') {
            setGodaddyKey(data.secrets.apiKey || '');
            setGodaddySecret(data.secrets.apiSecret || '');
            setDecryptedGodaddyKey(data.secrets.apiKey || '');
            setDecryptedGodaddySecret(data.secrets.apiSecret || '');
            setShowGodaddyKey(true);
            setShowGodaddySecret(true);
          } else if (provider === 'azure_devops') {
            setDevopsPat(data.secrets.pat || '');
            setDecryptedDevopsPat(data.secrets.pat || '');
            setShowDevopsPat(true);
          }
        } else {
          alert(data.message || 'Failed to decrypt credentials.');
        }
      } else {
        const data = await res.json();
        alert(data.message || 'Error fetching decrypted credentials.');
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred while loading saved credentials.');
    }
  };

  const fetchBranches = async (repoFullName: string, targetBranch?: string) => {
    setLoadingBranches(true);
    setBranches([]);
    setSelectedBranch(targetBranch || '');
    setSelectedBranches(targetBranch ? [targetBranch] : []);
    try {
      const res = await fetch(`${API_BASE}/apps/github-branches?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repoFullName)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.branches)) {
        setBranches(data.branches);
        if (targetBranch && data.branches.some((b: any) => b.name === targetBranch)) {
          setSelectedBranch(targetBranch);
          setSelectedBranches([targetBranch]);
          setScannerProvisionBranch(targetBranch);
        } else if (data.branches.length > 0) {
          const names = data.branches.map((b: any) => b.name);
          const defaultBr = names.find((n: string) => ['main', 'master', 'dev', 'development'].includes(n.toLowerCase())) || names[0];
          setSelectedBranch(defaultBr || '');
          setSelectedBranches(defaultBr ? [defaultBr] : []);
          setScannerProvisionBranch(defaultBr || '');
        }
      }
    } catch (e) {
      console.error('Failed to fetch branches:', e);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchRepoIntegrity = async (repoFullName: string) => {
    setRepoIntegrityLoading(true);
    setRepoIntegrity(null);
    try {
      const res = await fetch(`${API_BASE}/apps/repo-integrity?organizationId=${organizationId}&repoFullName=${encodeURIComponent(repoFullName)}`);
      const data = await res.json();
      if (data.success) setRepoIntegrity(data);
    } catch (e) {
      console.error('[RepoIntegrity] Failed to fetch repo integrity:', e);
    } finally {
      setRepoIntegrityLoading(false);
    }
  };

  const handleRepoChange = (repoName: string) => {
    setSelectedRepo(repoName);
    setSelectedBranches([]);
    setRepoIntegrity(null);
    if (repoName) {
      fetchBranches(repoName);
      fetchRepoIntegrity(repoName);
      const shortName = repoName.split('/').pop() || '';
      if (appType === 'frontend') {
        setNewName(shortName ? `${shortName}-swa` : '');
      } else {
        setNewName(shortName ? `${shortName}-api` : '');
      }
    } else {
      setBranches([]);
      setSelectedBranch('');
      setNewName('');
    }
  };

  const handleAppTypeChange = (type: 'frontend' | 'backend' | 'cluster' | 'database') => {
    setAppType(type);
    if (selectedRepo) {
      const shortName = selectedRepo.split('/').pop() || '';
      if (type === 'frontend') {
        setNewName(shortName ? `${shortName}-swa` : '');
      } else if (type === 'backend') {
        setNewName(shortName ? `${shortName}-api` : '');
      } else if (type === 'cluster') {
        setNewName(shortName ? `${shortName}-cluster` : '');
      } else if (type === 'database') {
        setNewName(shortName ? `${shortName}-db` : '');
      }
    }
  };

  const loadYmlForStep2 = async (repo: string, primaryBranch: string, allBranches: string[]) => {
    setYmlLoading(true);
    setYmlError(null);
    setYmlContent('');
    setYmlSource(null);
    try {
      // 1. Try fetching existing azure-pipelines.yml from the primary branch
      const res = await fetch(`${API_BASE}/apps/get-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(primaryBranch)}`);
      const data = await res.json();
      
      if (data.success && data.exists) {
        setYmlContent(data.content);
        setYmlSource('github');
      } else {
        // 2. Fetch the default template populated with trigger branches list
        const branchesParam = allBranches.join(',');
        const templateRes = await fetch(`${API_BASE}/apps/default-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branches=${encodeURIComponent(branchesParam)}&appType=${appType}&customAppLocation=${encodeURIComponent(customAppLocation)}&customApiLocation=${encodeURIComponent(customApiLocation)}&customOutputLocation=${encodeURIComponent(customOutputLocation)}`);
        const templateData = await templateRes.json();
        if (templateData.success) {
          setYmlContent(templateData.content);
          setYmlSource('template');
        } else {
          throw new Error(templateData.message || 'Failed to fetch default template.');
        }
      }
    } catch (e: any) {
      console.error('Failed to load YML:', e);
      setYmlError(e.message || 'Failed to load YML build configuration.');
    } finally {
      setYmlLoading(false);
    }
  };

  const handleCommitCustomYml = async () => {
    if (!selectedRepo) return;
    setCreatingYml(true);
    setYmlError(null);
    try {
      const primary = selectedBranch || selectedBranches[0];
      const res = await fetch(`${API_BASE}/apps/create-pipeline-yml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          appName: newName || selectedRepo.split('/').pop() || 'my-app',
          githubRepo: selectedRepo,
          devopsOrgUrl: devopsOrgUrl || azureDevopsOrgUrl,
          devopsProject: devopsProject || azureDevopsProject,
          branch: primary,
          skipRegistration: true,
          customYml: ymlContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setYmlSource('github');
        alert('Pipeline YAML committed successfully to GitHub!');
      } else {
        throw new Error(data.message || 'Failed to commit custom YAML.');
      }
    } catch (e: any) {
      setYmlError(e.message || 'Error committing custom YAML to GitHub.');
    } finally {
      setCreatingYml(false);
    }
  };

  const handleMoveToStep2 = async () => {
    if (appType === 'backend') {
      setYmlLoading(true);
      const isMissing = await checkDockerfile(selectedRepo, selectedBranch || selectedBranches[0]);
      setDockerfileMissing(isMissing);
      setDockerfileChecked(true);
      setYmlLoading(false);
      if (isMissing) {
        setDockerfileContent('');
        setProvisionStep(2);
        return;
      } else {
        await fetchDockerfileContent(selectedRepo, selectedBranch || selectedBranches[0]);
      }
    } else {
      setDockerfileMissing(false);
      setDockerfileChecked(false);
    }
    setProvisionStep(2);
    loadYmlForStep2(selectedRepo, selectedBranch || selectedBranches[0], selectedBranches);
  };

  const handleStartScannerDeploy = async () => {
    setScannerDeployStep(0.5);
    setScannerYmlLoading(true);
    setScannerYmlContent('');
    try {
      const repo = scannerProvisionGroup?.repoPath || '';
      const branch = scannerProvisionBranch;
      
      const res = await fetch(`${API_BASE}/apps/get-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
      const data = await res.json();
      
      if (data.success && data.exists) {
        setScannerYmlContent(data.content);
        setScannerYmlSource('github');
      } else {
        const templateRes = await fetch(`${API_BASE}/apps/default-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branches=${encodeURIComponent(branch + ',main,qa,dev')}&appType=${scannerProvisionGroup?.type || 'frontend'}`);
        const templateData = await templateRes.json();
        if (templateData.success) {
          setScannerYmlContent(templateData.content);
          setScannerYmlSource('template');
        } else {
          throw new Error(templateData.message || 'Failed to fetch default template.');
        }
      }
    } catch (err: any) {
      console.error('Failed to load scanner YML:', err);
      setScannerYmlContent('# Error loading YML configuration. You can write your custom YML here.');
      setScannerYmlSource(null);
    } finally {
      setScannerYmlLoading(false);
    }
  };

  const handleScannerCommitAndDeploy = async () => {
    if (!scannerProvisionGroup || !scannerProvisionEnv) return;
    setScannerDeployError(null);
    setCreatingYml(true);
    try {
      const orgId = organizationId;
      const repo = scannerProvisionGroup.repoPath;
      const swaName = scannerProvisionSwaName;
      const branch = scannerProvisionBranch;

      const commitRes = await fetch(`${API_BASE}/apps/create-pipeline-yml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          appName: swaName,
          githubRepo: repo,
          devopsOrgUrl: devopsOrgUrl || azureDevopsOrgUrl,
          devopsProject: devopsProject || azureDevopsProject,
          branch: branch,
          skipRegistration: true,
          customYml: scannerYmlContent
        })
      });
      const commitData = await commitRes.json();
      if (!commitData.success) {
        throw new Error(commitData.message || 'Failed to commit custom YAML to GitHub.');
      }

      setCreatingYml(false);
      await handleScannerDeploy();
    } catch (e: any) {
      console.error('[ScannerCommitAndDeploy] Failed:', e);
      setScannerDeployError(e.message || 'An unexpected error occurred during YML commit.');
      setCreatingYml(false);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setProvisioning(true);
    setProvisionError(null);
    setProvisionErrorDetail(null);
    setProvisionSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/apps/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          name: newName,
          type: appType,
          location: newLocation,
          githubRepo: selectedRepo,
          targetPort: appType === 'backend' ? parseInt(targetPort, 10) : undefined,
          resourceGroup: selectedResourceGroup,
          managedEnvironment: selectedManagedEnvironment,
          cpu: selectedCpu,
          memory: selectedMemory,
          minReplicas: minReplicas,
          maxReplicas: maxReplicas,
          kubernetesVersion,
          nodeCount,
          vmSize,
          subnetId,
          version: dbVersion,
          skuName: dbSkuName,
          skuTier: dbSkuTier,
          adminUsername: dbAdminUsername,
          adminPassword: dbAdminPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setProvisionSuccess(`Successfully provisioned ${newName} in Azure.`);
        handleScan();
        if (appType !== 'cluster' && appType !== 'database') {
          setProvisionStep(appType === 'backend' ? 5 : 4); // Shift Step 4 SWA vs Step 5 Backend Finalize
        }
      } else {
        setProvisionError(data.message || 'Failed to provision application.');
        setProvisionErrorDetail(data.error || data.details || null);
      }
    } catch (e: any) {
      setProvisionError(e.message || 'Error connecting to backend.');
      setProvisionErrorDetail(e.stack || null);
    } finally {
      setProvisioning(false);
    }
  };

  const handleRegisterPipeline = async () => {
    setPipelineRegistering(true);
    setPipelineRegError(null);
    setPipelineRegSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/apps/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          appName: newName || selectedRepo.split('/').pop() || 'my-app',
          githubRepo: selectedRepo,
          devopsOrgUrl: devopsOrgUrl || azureDevopsOrgUrl,
          devopsProject: devopsProject || azureDevopsProject,
          branch: selectedBranch
        })
      });
      const data = await res.json();
      if (data.success) {
        setPipelineRegSuccess(true);
        setRegisteredPipelineUrl(data.pipelineUrl || '');
        handleScan();
      } else {
        setPipelineRegError(data.message || 'Failed to register DevOps Pipeline.');
      }
    } catch (e: any) {
      setPipelineRegError(e.message || 'Error connecting to DevOps API.');
    } finally {
      setPipelineRegistering(false);
    }
  };

  const handleDnsBind = async () => {
    setDnsBinding(true);
    setDnsBindError(null);
    setDnsBindSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/apps/bind-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          appName: newName,
          subdomain: newName,
          domain: domainInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setDnsBindSuccess(true);
        handleScan();
      } else {
        setDnsBindError(data.message || 'Failed to bind custom domain DNS.');
      }
    } catch (e: any) {
      setDnsBindError(e.message || 'Error connecting to DNS mapping API.');
    } finally {
      setDnsBinding(false);
    }
  };

  const formatDuration = (start?: string | null, finish?: string | null) => {
    if (!start) return 'Not started';
    const startTime = new Date(start).getTime();
    const endTime = finish ? new Date(finish).getTime() : Date.now();
    const diff = endTime - startTime;
    if (diff < 0) return '0s';
    
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  };

  const renderPipelineRunStatus = (app: AppResource) => {
    if (!app.pipelineId) {
      return (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
          <GitBranch size={13} style={{ opacity: 0.6 }} /> No pipeline registered
        </div>
      );
    }

    if (!app.pipelineRun) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <GitBranch size={13} /> Pipeline Linked (ID: {app.pipelineId})
          </span>
        </div>
      );
    }

    const { state, result, webUrl, name, stages } = app.pipelineRun;
    const isDark = theme === 'dark';

    const getStageStyle = (s: any) => {
      if (s.state === 'inProgress') {
        return {
          color: isDark ? '#fbbf24' : '#b45309',
          bg: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.08)',
          border: isDark ? 'rgba(251,191,36,0.4)' : 'rgba(251,191,36,0.25)',
          icon: <RefreshCw size={10} className="spin-anim" />
        };
      }
      if (s.state === 'completed') {
        if (s.result === 'succeeded') {
          return {
            color: isDark ? 'var(--success)' : '#15803d',
            bg: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
            border: isDark ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.25)',
            icon: <Check size={10} />
          };
        }
        if (s.result === 'failed') {
          return {
            color: isDark ? 'var(--error)' : '#b91c1c',
            bg: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            border: isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.25)',
            icon: <X size={10} />
          };
        }
        return { // canceled, skipped
          color: isDark ? '#94a3b8' : '#4b5563',
          bg: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(75,85,99,0.06)',
          border: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(75,85,99,0.15)',
          icon: <AlertTriangle size={10} />
        };
      }
      return { // waiting
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)',
        bg: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
        icon: <Minus size={10} />
      };
    };

    const isRunning = state === 'inProgress' || state === 'canceling';
    const statusColor = isRunning 
      ? '#fbbf24' 
      : result === 'succeeded' 
        ? 'var(--success)' 
        : result === 'failed' 
          ? 'var(--error)' 
          : 'var(--text-secondary)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <GitBranch size={11} style={{ color: 'var(--accent-purple)' }} />
            Run #{name}
          </span>
          <span style={{ 
            fontSize: '0.72rem', 
            color: statusColor, 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            {isRunning ? 'DEPLOYING' : result || state}
          </span>
        </div>

        {stages && stages.length > 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            flexWrap: 'wrap',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.03)',
            padding: '8px',
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`
          }}>
            {stages.map((stage: any, sIdx: number) => {
              const style = getStageStyle(stage);
              return (
                <div 
                  key={stage.id || sIdx} 
                  title={`${stage.displayName} (${stage.state}${stage.result ? ': ' + stage.result : ''}) - Click to view jobs`}
                  onClick={() => {
                    setSelectedStageForJobs(stage);
                    if (stage.jobs && stage.jobs.length > 0) {
                      setSelectedJobForDetails(stage.jobs[0]);
                    } else {
                      setSelectedJobForDetails(null);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: style.bg,
                    border: `1px solid ${style.border}`,
                    color: style.color,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {style.icon}
                  <span>{stage.displayName}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '4px' }}>
            {isRunning ? 'Initializing stages...' : 'No stage telemetry available'}
          </div>
        )}
      </div>
    );
  };

  const handleBindDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !subdomainInput) return;
    setBinding(true);
    setBindError(null);
    setBindSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/apps/bind-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          appName: selectedApp.name,
          subdomain: subdomainInput,
          domain: domainInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setBindSuccess(data.message || `Mapped CNAME DNS record and bound domain successfully!`);
        setSubdomainInput('');
        handleScan();
      } else {
        setBindError(data.message || 'Failed to bind domain.');
      }
    } catch (e: any) {
      setBindError(e.message || 'Error occurred during CNAME mapping.');
    } finally {
      setBinding(false);
    }
  };

  const handleCloneEnvironment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloningApp) return;

    setIsCloning(true);
    setCloneFeedback(null);

    const name = cloningApp.name.toLowerCase();
    let sourceEnv = 'dev';
    if (name.endsWith('-prod')) sourceEnv = 'prod';
    else if (name.endsWith('-qa')) sourceEnv = 'qa';
    else if (name.endsWith('-dev')) sourceEnv = 'dev';

    try {
      const res = await fetch(`${API_BASE}/environments/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          appName: cloningApp.name,
          sourceEnv,
          targetEnv: cloneTargetEnv
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCloneFeedback({
          type: 'success',
          text: data.message || `Successfully cloned environment to ${cloneTargetEnv}!`
        });
        handleScan();
        setTimeout(() => {
          setCloningApp(null);
          setCloneFeedback(null);
        }, 3000);
      } else {
        setCloneFeedback({
          type: 'error',
          text: data.message || 'Failed to clone environment config.'
        });
      }
    } catch (err) {
      console.error(err);
      setCloneFeedback({
        type: 'error',
        text: 'Network error occurred while requesting environment clone.'
      });
    } finally {
      setIsCloning(false);
    }
  };

  const handleCreatePipelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineApp || !githubRepo) return;
    setCreatingPipeline(true);
    setPipelineError(null);
    setPipelineSuccess(null);
    setYmlMissing(null);
    setYmlCreated(false);
    try {
      const res = await fetch(`${API_BASE}/apps/create-pipeline-yml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          appName: pipelineApp.name,
          githubRepo,
          devopsOrgUrl,
          devopsProject,
          branch: pipelineBranch,
          customYml: pipelineModalYmlContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setPipelineSuccess(`✅ azure-pipelines.yml committed and pipeline registered successfully! ID: ${data.pipelineId}`);
        setYmlCreated(true);
        setPipelineWizardStep(3);
        handleScan();
      } else {
        setPipelineError(data.message || 'Failed to register pipeline.');
      }
    } catch (e: any) {
      setPipelineError(e.message || 'Error occurred during pipeline creation.');
    } finally {
      setCreatingPipeline(false);
    }
  };

  const handleCreatePipelineYml = async () => {
    if (!pipelineApp) return;
    setCreatingYml(true);
    setPipelineError(null);
    setYmlMissing(null);
    try {
      const res = await fetch(`${API_BASE}/apps/create-pipeline-yml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId,
          appName: pipelineApp.name,
          githubRepo,
          devopsOrgUrl,
          devopsProject
        })
      });
      const data = await res.json();
      if (data.success) {
        setYmlCreated(true);
        setPipelineSuccess(`✅ azure-pipelines.yml committed to "${githubRepo}" and pipeline registered! ID: ${data.pipelineId}`);
        setGithubRepo('');
        handleScan();
      } else {
        setPipelineError(data.message || 'Failed to create YML and register pipeline.');
      }
    } catch (e: any) {
      setPipelineError(e.message || 'Error occurred while creating the YML file.');
    } finally {
      setCreatingYml(false);
    }
  };

  const handleDeleteApp = (name: string, type: 'frontend' | 'backend') => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Application',
      message: `Are you sure you want to permanently delete '${name}' (${type}) from Azure and your database? This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      cancelLabel: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setDeletingAppName(name);
        try {
          const res = await fetch(`${API_BASE}/apps/${name}?organizationId=${organizationId}&type=${type}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            setConfirmDialog({
              isOpen: true,
              title: 'Success',
              message: `Application '${name}' deleted successfully.`,
              confirmLabel: 'Dismiss',
              type: 'info',
              onConfirm: () => {}
            });
            handleScan();
            fetchCostData();
          } else {
            setConfirmDialog({
              isOpen: true,
              title: 'Deletion Failed',
              message: data.message || 'Failed to delete application.',
              confirmLabel: 'Dismiss',
              type: 'danger',
              onConfirm: () => {}
            });
          }
        } catch (e: any) {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: e.message || 'Error occurred during deletion request.',
            confirmLabel: 'Dismiss',
            type: 'danger',
            onConfirm: () => {}
          });
        } finally {
          setDeletingAppName(null);
        }
      }
    });
  };

  const openDnsModal = (app: AppResource) => {
    setSelectedApp(app);
    setBindSuccess(null);
    setBindError(null);

    if (app.dnsDetails && app.dnsDetails.subdomain) {
      setSubdomainInput(app.dnsDetails.subdomain);
      setDomainInput(app.dnsDetails.domain || defaultDnsDomain || 'esteviatech.com');
    } else {
      const name = app.name.toLowerCase();
      if (name.includes('marketing-web') || name === 'estevia-marketing-site') {
        setSubdomainInput('www');
      } else if (name.startsWith('protrack-api-')) {
        const env = name.replace('protrack-api-', '');
        if (env === 'prod') {
          setSubdomainInput('api.protrack');
        } else {
          setSubdomainInput(`api-${env}.protrack`);
        }
      } else if (name.startsWith('estevia-api-')) {
        const env = name.replace('estevia-api-', '');
        if (env === 'prod') {
          setSubdomainInput('api');
        } else {
          setSubdomainInput(`api-${env}`);
        }
      } else if (name.includes('-api-')) {
        const parts = name.split('-api-');
        const base = parts[0];
        const env = parts[1];
        if (env === 'prod') {
          setSubdomainInput(`api.${base}`);
        } else {
          setSubdomainInput(`api-${env}.${base}`);
        }
      } else {
        const parts = name.replace('estevia-', '').replace('-swa', '').split('-');
        const env = parts.pop();
        const base = parts.join('-');
        const cleanBase = base.replace('-frontend', '').replace('-backend', '').replace('-api', '');
        if (env === 'prod') {
          setSubdomainInput(cleanBase);
        } else {
          setSubdomainInput(`${env}-${cleanBase}`);
        }
      }
      setDomainInput(defaultDnsDomain || 'esteviatech.com');
    }
  };

  const checkYmlExists = async (repo: string) => {
    if (!repo) return;
    setCheckingYml(true);
    setYmlMissing(null);
    setYmlFound(null);
    try {
      const res = await fetch(`${API_BASE}/apps/check-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}`);
      const data = await res.json();
      if (data.exists === false) {
        setYmlMissing({
          message: `azure-pipelines.yml was not found in "${repo}".`,
          githubRepo: repo
        });
      } else if (data.exists === true) {
        // Build the GitHub URL to the yml file
        setYmlFound(`https://github.com/${repo}/blob/main/azure-pipelines.yml`);
      }
      // If exists === null (no token), leave both as null
    } catch (e) {
      console.warn('YML check failed silently:', e);
    } finally {
      setCheckingYml(false);
    }
  };

  const loadYmlForPipelineModal = async (repo: string, branch: string) => {
    if (!repo) return;
    setPipelineModalYmlLoading(true);
    setPipelineModalYmlContent('');
    setPipelineModalYmlSource(null);
    try {
      const res = await fetch(`${API_BASE}/apps/get-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
      const data = await res.json();
      
      if (data.success && data.exists) {
        setPipelineModalYmlContent(data.content);
        setPipelineModalYmlSource('github');
      } else {
        const templateRes = await fetch(`${API_BASE}/apps/default-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branches=${encodeURIComponent(branch + ',main,qa,dev')}&appType=${pipelineApp?.type || 'frontend'}`);
        const templateData = await templateRes.json();
        if (templateData.success) {
          setPipelineModalYmlContent(templateData.content);
          setPipelineModalYmlSource('template');
        } else {
          throw new Error(templateData.message || 'Failed to fetch default template.');
        }
      }
    } catch (e: any) {
      console.error('Failed to load pipeline modal YML:', e);
      setPipelineModalYmlContent('# Error loading YML configuration. You can write your custom YML here.');
    } finally {
      setPipelineModalYmlLoading(false);
    }
  };

  const openPipelineModal = (app: AppResource, group?: AppGroup) => {
    setPipelineApp(app);
    setPipelineSuccess(null);
    setPipelineError(null);
    setYmlMissing(null);
    setYmlFound(null);
    setYmlCreated(false);
    setPipelineWizardStep(1);

    let defaultRepo = '';
    const owner = githubOwner || 'Estevia-TechSolutions';
    const prefix = owner.toLowerCase().replace('-techsolutions', '').replace('-solutions', '').split('-')[0];

    if (group && group.repoPath) {
      defaultRepo = group.repoPath;
    } else if (app.repositoryUrl) {
      // Use the stored repo URL directly (most reliable)
      defaultRepo = app.repositoryUrl.replace('https://github.com/', '').replace(/\/$/, '');
    } else {
      const name = app.name.toLowerCase();
      if (name.includes(`${prefix}-api`)) {
        // API deployments share the backend repo
        defaultRepo = `${owner}/${prefix}-backend-api`;
      } else if (name.includes('ml-setup')) {
        defaultRepo = `${owner}/${prefix}-ml-setup`;
      } else {
        // For all other apps (peoplecraft-api, protrack-api, etc.)
        // derive a best-guess from the name — user can override in the dropdown
        const base = name
          .replace(new RegExp(`^${prefix}-`), '')
          .replace(/-swa$/, '')
          .replace(/-dev$/, '')
          .replace(/-qa$/, '')
          .replace(/-prod$/, '');
        defaultRepo = `${owner}/${base}`;
      }
    }

    setGithubRepo(defaultRepo);

    // Robust case-insensitive and base-name select matching
    let matchByName = null;
    const matchingRepo = githubRepos.find(r => r.fullName.toLowerCase() === defaultRepo.toLowerCase());
    if (matchingRepo) {
      setGithubRepo(matchingRepo.fullName);
      setUseCustomRepo(false);
    } else {
      const repoNameOnly = defaultRepo.split('/').pop()?.toLowerCase();
      matchByName = githubRepos.find(r => r.fullName.split('/').pop()?.toLowerCase() === repoNameOnly);
      if (matchByName) {
        setGithubRepo(matchByName.fullName);
        setUseCustomRepo(false);
      } else {
        setGithubRepo(defaultRepo);
        setUseCustomRepo(true);
      }
    }

    setDevopsOrgUrl(azureDevopsOrgUrl || 'https://dev.azure.com/esteviatech');
    setDevopsProject(azureDevopsProject || 'Estevia-Platform');

    // Resolve target branch based on app's actual branch, or fallback to app name suffix
    let defaultBranch = app.branch || 'main';
    if (!app.branch) {
      const nameSegments = app.name.split('-');
      if (nameSegments.length > 1) {
        const last = nameSegments[nameSegments.length - 1];
        if (['dev', 'qa', 'prod', 'main', 'master'].includes(last.toLowerCase())) {
          defaultBranch = last;
        }
      }
    }
    setPipelineBranch(defaultBranch);

    const activeRepo = matchingRepo?.fullName || matchByName?.fullName || defaultRepo;

    // Find sibling apps sharing the same GitHub repo (other env deployments)
    if (activeRepo) {
      const normalizedRepo = activeRepo.toLowerCase();
      const siblings = apps.filter(a =>
        a.name !== app.name &&
        a.repositoryUrl &&
        a.repositoryUrl.replace('https://github.com/', '').replace(/\/$/, '').toLowerCase() === normalizedRepo
      );
      setSiblingApps(siblings);
    } else {
      setSiblingApps([]);
    }

    // Proactively check if azure-pipelines.yml exists and load content
    if (activeRepo) {
      checkYmlExists(activeRepo);
      loadYmlForPipelineModal(activeRepo, defaultBranch);
    }
  };

  if (!token) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Simple top navbar for landing page */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid var(--divider)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(2, 6, 23, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="site-header-logo" style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '4px', boxShadow: 'none' }}>
              <img src="/evaops-logo.png" alt="EvaOps Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EvaOps</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            EvaOps — CloudOps Management & Governance
          </span>
        </nav>

        {/* Main Body */}
        <div style={{
          flex: 1,
          display: 'flex',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 40px',
          gap: '60px',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          
          {/* Left Column: Product pitch */}
          <div style={{ flex: 1.2, textAlign: 'left' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-purple)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}>
              🚀 Dynamic Multi-Tenant Control Plane
            </span>
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Code to Cloud. <br />
              <span className="glow-purple" style={{ 
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Zero Friction.</span>
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              EvaOps orchestrates your infrastructure as a unified CloudOps Management & Governance platform. Scan your Azure subscription, provision Static Web Apps and Container Apps, map custom domains instantly via GoDaddy, and generate automated DevOps build pipelines.
            </p>

            {/* Feature Checkmarks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { title: 'Cloud Discovery Scanning', desc: 'Auto-maps SWA and ACA environments' },
                { title: 'DNS Automation', desc: 'One-click CNAME binds via GoDaddy API' },
                { title: 'DevOps Pipelines', desc: 'Committer-driven YML setup templates' },
                { title: 'Cost Pulse Analytics', desc: 'Optimization insights & active cost tracking' }
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', 
                    backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Auth Portal */}
          <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '420px',
              padding: '40px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.25) 0%, rgba(15, 23, 42, 0.45) 100%)',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Access Portal</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Authenticate using your corporate account to deploy and track workspaces.
                </p>
              </div>

              {authError && (
                <div className="glass-panel" style={{ 
                  padding: '12px 14px', 
                  borderColor: 'var(--error)', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '20px',
                  fontSize: '0.82rem',
                  textAlign: 'left'
                }}>
                  <AlertCircle size={16} style={{ color: 'var(--error)', flexShrink: 0 }} />
                  <span style={{ color: '#fca5a5' }}>{authError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleMicrosoftLoginRedirect}
                  disabled={authLoading}
                  style={{ 
                    padding: '14px 24px', 
                    fontSize: '0.95rem', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {authLoading ? (
                    <>
                      <RefreshCw size={18} className="spin-anim" />
                      <span>Connecting to Microsoft...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                        <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                        <path d="M0 12H11V23H0V12Z" fill="#00A1F1"/>
                        <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
                      </svg>
                      <span>Sign in with Microsoft</span>
                    </>
                  )}
                </button>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '8px 0', 
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem' 
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
                  <span style={{ padding: '0 8px' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
                </div>

                {/* Developer Override — viewer only */}
                <button 
                  onClick={() => { setShowDevOverrideForm(v => !v); setDevOverrideError(null); }}
                  disabled={authLoading}
                  style={{
                    background: showDevOverrideForm ? 'rgba(100,116,139,0.08)' : 'transparent',
                    border: `1px dashed ${showDevOverrideForm ? 'rgba(100,116,139,0.4)' : 'var(--glass-border)'}`,
                    color: showDevOverrideForm ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!showDevOverrideForm) {
                      e.currentTarget.style.borderColor = 'rgba(100,116,139,0.5)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showDevOverrideForm) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Eye size={14} />
                  Developer Override <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Viewer only)</span>
                </button>

                {/* Developer Override inline form */}
                {showDevOverrideForm && (
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    animation: 'fade-in-anim 0.2s ease-out'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={12} style={{ color: 'var(--text-secondary)' }} />
                      Enter your Organisation ID for Developer Override
                    </div>
                    <input
                      type="text"
                      placeholder="Organisation ID (e.g. estevia)"
                      value={devOverrideOrgId}
                      onChange={(e) => setDevOverrideOrgId(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleBypassLogin(); }}
                      autoComplete="off"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        padding: '10px 14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(100,116,139,0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    />
                    {devOverrideError && (
                      <div style={{ fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={13} />
                        {devOverrideError}
                      </div>
                    )}
                    <button
                      onClick={handleBypassLogin}
                      disabled={authLoading}
                      style={{
                        background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.25), rgba(148, 163, 184, 0.15))',
                        border: '1px solid rgba(148, 163, 184, 0.5)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {authLoading ? (
                        <><RefreshCw size={14} className="spin-anim" /> Authenticating...</>
                      ) : (
                        <><Eye size={14} /> Authenticate as Viewer</>
                      )}
                    </button>
                  </div>
                )}

                {/* Admin Override — password protected */}
                <button 
                  onClick={() => { setShowAdminOverrideForm(v => !v); setAdminOverrideError(null); }}
                  disabled={authLoading}
                  style={{
                    background: showAdminOverrideForm ? 'rgba(234,88,12,0.08)' : 'transparent',
                    border: `1px dashed ${showAdminOverrideForm ? 'rgba(234,88,12,0.4)' : 'var(--glass-border)'}`,
                    color: showAdminOverrideForm ? '#ea580c' : 'var(--text-secondary)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!showAdminOverrideForm) {
                      e.currentTarget.style.borderColor = 'rgba(234,88,12,0.35)';
                      e.currentTarget.style.color = '#ea580c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showAdminOverrideForm) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <ShieldCheck size={14} />
                  Admin Override <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Password required)</span>
                </button>

                {/* Admin Override inline form */}
                {showAdminOverrideForm && (
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(234,88,12,0.25)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    animation: 'fade-in-anim 0.2s ease-out'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={12} style={{ color: '#ea580c' }} />
                      Enter your Organisation ID and admin override password
                    </div>
                    <input
                      type="text"
                      placeholder="Organisation ID (e.g. estevia)"
                      value={adminOverrideOrgId}
                      onChange={(e) => setAdminOverrideOrgId(e.target.value)}
                      autoComplete="off"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        padding: '10px 14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    />
                    <input
                      type="password"
                      placeholder="Admin override password"
                      value={adminOverridePassword}
                      onChange={(e) => setAdminOverridePassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAdminOverride(); }}
                      autoComplete="new-password"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        padding: '10px 14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    />
                    {adminOverrideError && (
                      <div style={{ fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={13} />
                        {adminOverrideError}
                      </div>
                    )}
                    <button
                      onClick={handleAdminOverride}
                      disabled={adminOverrideLoading}
                      style={{
                        background: 'linear-gradient(135deg, rgba(234,88,12,0.25), rgba(234,88,12,0.15))',
                        border: '1px solid rgba(234,88,12,0.5)',
                        color: '#ea580c',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: adminOverrideLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {adminOverrideLoading ? (
                        <><RefreshCw size={14} className="spin-anim" /> Authenticating...</>
                      ) : (
                        <><ShieldCheck size={14} /> Authenticate as Admin</>
                      )}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <Footer theme={theme} />
      </div>
    );
  }

  return (
    <div>
      {scanProgress > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'transparent',
          zIndex: 9999
        }}>
          <div style={{
            width: `${scanProgress}%`,
            height: '100%',
            backgroundColor: 'var(--accent-purple)',
            boxShadow: '0 0 10px var(--accent-purple-glow), 0 0 5px var(--accent-purple)',
            transition: 'width 0.15s ease-out'
          }} />
        </div>
      )}
      {/* ── Sticky Header ── */}
      <SiteHeader
        token={token}
        syncCountdown={syncCountdown}
        scanning={scanning}
        handleScan={handleScan}
        theme={theme}
        toggleTheme={toggleTheme}
        orgName={orgName}
        organizationId={organizationId}
        user={user}
        handleLogout={handleLogout}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotifications={handleToggleNotifications}
      />
      
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onClearAll={clearNotifications}
        onDeleteNotification={deleteNotification}
        onViewDetails={handleViewDetails}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
      />

      {/* ── Page Content ── */}
      <div className="page-content">

        {requiresOnboarding ? (
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            {/* Step Wizard Header */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--divider)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
                Welcome to EvaOps (CloudOps Management & Governance) Onboarding
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                Complete these 5 simple setup steps to activate your organization workspace and connect cloud operations.
              </p>
              
              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                {/* Connector line */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '40px',
                  right: '40px',
                  height: '2px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  zIndex: 0
                }}>
                  <div style={{
                    width: `${((onboardStep - 1) / 4) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-blue))',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {[
                  { num: 1, label: 'Organization' },
                  { num: 2, label: 'Azure Cloud' },
                  { num: 3, label: 'CI/CD Pipelines' },
                  { num: 4, label: 'GoDaddy DNS' },
                  { num: 5, label: 'Activation' }
                ].map((s) => {
                  const isActive = onboardStep === s.num;
                  const isCompleted = onboardStep > s.num;
                  return (
                    <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative', width: '90px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? 'var(--accent-blue)' : isActive ? 'var(--bg-secondary)' : '#1e293b',
                        border: `2px solid ${isCompleted ? 'var(--accent-blue)' : isActive ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCompleted || isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        boxShadow: isActive ? '0 0 12px var(--accent-purple-glow)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {isCompleted ? '✓' : s.num}
                      </div>
                      <span style={{ fontSize: '0.75rem', marginTop: '8px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Panel */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--divider)', position: 'relative' }}>
              
              {onboardError && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertCircle size={16} />
                  <span>{onboardError}</span>
                </div>
              )}

              {/* STEP 1: ORGANIZATION PROFILE */}
              {onboardStep === 1 && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Step 1: Set Up Organization Profile</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Define the name of your organization workspace and verify the administrator email.
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Organization Name</label>
                    <input
                      type="text"
                      value={onboardOrgName}
                      onChange={(e) => setOnboardOrgName(e.target.value)}
                      placeholder="e.g. Estevia Technologies"
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Administrator Email Address</label>
                    <input
                      type="email"
                      value={onboardAdminEmail}
                      onChange={(e) => setOnboardAdminEmail(e.target.value)}
                      placeholder="admin@yourdomain.com"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-primary"
                      onClick={handleOnboardStep1}
                      disabled={onboardSubmitting}
                      style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {onboardSubmitting ? 'Saving...' : 'Next Step'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: AZURE INTEGRATION */}
              {onboardStep === 2 && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Step 2: Connect Azure Cloud Environment</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Configure the Service Principal credential to scan subscriptions, provision Static Web Apps, and manage Container Apps.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Tenant ID</label>
                      <input
                        type="text"
                        value={onboardAzureTenantId}
                        onChange={(e) => setOnboardAzureTenantId(e.target.value)}
                        placeholder="a39c526c-..."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Subscription ID</label>
                      <input
                        type="text"
                        value={onboardAzureSubId}
                        onChange={(e) => setOnboardAzureSubId(e.target.value)}
                        placeholder="e.g. 00000000-0000-..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Client App ID (Service Principal)</label>
                      <input
                        type="text"
                        value={onboardAzureClientId}
                        onChange={(e) => setOnboardAzureClientId(e.target.value)}
                        placeholder="e.g. client-id"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Client Secret Key</label>
                      <input
                        type="password"
                        value={onboardAzureClientSecret}
                        onChange={(e) => setOnboardAzureClientSecret(e.target.value)}
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: '0.76rem', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '16px', 
                    lineHeight: '1.4', 
                    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--glass-border)' 
                  }}>
                    <span style={{ color: '#eab308', fontWeight: 600 }}>Sync Requirement:</span> To enable directory user synchronization, ensure your Azure App Registration is granted the Microsoft Graph <strong>User.Read.All</strong> Application Permission and admin consent has been granted.
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Resource Group Name</label>
                    <input
                      type="text"
                      value={onboardAzureRg}
                      onChange={(e) => setOnboardAzureRg(e.target.value)}
                      placeholder="e.g. Estevia-Prod-RG"
                    />
                  </div>

                  {onboardTestResult && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: onboardTestResult.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${onboardTestResult.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                      color: onboardTestResult.type === 'success' ? 'var(--success)' : 'var(--error)',
                      fontSize: '0.82rem',
                      marginBottom: '20px'
                    }}>
                      {onboardTestResult.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={handleTestAzureConnection}
                      disabled={onboardTesting}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {onboardTesting ? 'Testing connection...' : 'Test Connection'}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setOnboardStep(1)}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                      >
                        Back
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleOnboardStep2}
                        disabled={onboardSubmitting}
                        style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        {onboardSubmitting ? 'Saving...' : 'Next Step'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CI/CD PIPELINES (GITHUB & DEVOPS) */}
              {onboardStep === 3 && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Step 3: Connect CI/CD & Version Control</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    EvaOps (CloudOps Management & Governance) automates repository checkouts, pipeline generations, and build triggers by linking GitHub and Azure DevOps.
                  </p>

                  <div style={{ borderBottom: '1px solid var(--divider)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '12px' }}>GitHub Integration</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Owner / Org</label>
                        <input
                          type="text"
                          value={onboardGithubOwner}
                          onChange={(e) => setOnboardGithubOwner(e.target.value)}
                          placeholder="e.g. Estevia-TechSolutions"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Personal Access Token (PAT)</label>
                        <input
                          type="password"
                          value={onboardGithubPat}
                          onChange={(e) => setOnboardGithubPat(e.target.value)}
                          placeholder="ghp_••••••••••••••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '12px' }}>Azure DevOps Integration</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Organization URL</label>
                        <input
                          type="text"
                          value={onboardDevopsUrl}
                          onChange={(e) => setOnboardDevopsUrl(e.target.value)}
                          placeholder="https://dev.azure.com/org"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target DevOps Project Name</label>
                        <input
                          type="text"
                          value={onboardDevopsProject}
                          onChange={(e) => setOnboardDevopsProject(e.target.value)}
                          placeholder="e.g. Estevia-Platform"
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>DevOps Personal Access Token (PAT)</label>
                      <input
                        type="password"
                        value={onboardDevopsPat}
                        onChange={(e) => setOnboardDevopsPat(e.target.value)}
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>

                  {onboardTestResult && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: onboardTestResult.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${onboardTestResult.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                      color: onboardTestResult.type === 'success' ? 'var(--success)' : 'var(--error)',
                      fontSize: '0.82rem',
                      marginBottom: '20px'
                    }}>
                      {onboardTestResult.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={handleTestCicdConnection}
                      disabled={onboardTesting}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {onboardTesting ? 'Testing connection...' : 'Test Connections'}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setOnboardStep(2)}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                      >
                        Back
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleOnboardStep3}
                        disabled={onboardSubmitting}
                        style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        {onboardSubmitting ? 'Saving...' : 'Next Step'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CUSTOM DOMAIN & DNS (GODADDY) */}
              {onboardStep === 4 && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Step 4: Enable Custom Domain Binding (GoDaddy)</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Link GoDaddy credentials to dynamically register subdomains and assign FQDNs for newly provisioned applications.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GoDaddy API Production Key</label>
                      <input
                        type="text"
                        value={onboardGodaddyKey}
                        onChange={(e) => setOnboardGodaddyKey(e.target.value)}
                        placeholder="e.g. key-string"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GoDaddy API Secret</label>
                      <input
                        type="password"
                        value={onboardGodaddySecret}
                        onChange={(e) => setOnboardGodaddySecret(e.target.value)}
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Default Root Domain Mapped</label>
                    <input
                      type="text"
                      value={onboardGodaddyDomain}
                      onChange={(e) => setOnboardGodaddyDomain(e.target.value)}
                      placeholder="e.g. esteviatech.com"
                    />
                  </div>

                  {onboardTestResult && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: onboardTestResult.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${onboardTestResult.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                      color: onboardTestResult.type === 'success' ? 'var(--success)' : 'var(--error)',
                      fontSize: '0.82rem',
                      marginBottom: '20px'
                    }}>
                      {onboardTestResult.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={handleTestDnsConnection}
                      disabled={onboardTesting}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {onboardTesting ? 'Testing connection...' : 'Test Connection'}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setOnboardStep(3)}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                      >
                        Back
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleOnboardStep4}
                        disabled={onboardSubmitting}
                        style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        {onboardSubmitting ? 'Saving...' : 'Next Step'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & FINALIZE */}
              {onboardStep === 5 && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Step 5: Review & Finalize Integration</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Review your workspace settings. Once finalized, your credentials will be stored with AES-256 encryption.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--divider)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Organization:</span>
                      <span style={{ fontWeight: 600 }}>{onboardOrgName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--divider)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Admin Email:</span>
                      <span style={{ fontWeight: 600 }}>{onboardAdminEmail}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--divider)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Azure Resource Group:</span>
                      <span style={{ fontWeight: 600 }}>{onboardAzureRg}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--divider)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>GitHub Owner:</span>
                      <span style={{ fontWeight: 600 }}>{onboardGithubOwner}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>GoDaddy DNS Domain:</span>
                      <span style={{ fontWeight: 600 }}>{onboardGodaddyDomain}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setOnboardStep(4)}
                      style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                    >
                      Back
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleOnboardComplete}
                      disabled={onboardSubmitting}
                      style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
                    >
                      {onboardSubmitting ? 'Finalizing Setup...' : 'Activate EvaOps (CloudOps) Workspace'}
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <>
            {/* Unified DevOps Control Centre & Navigation Panel */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', position: 'relative', overflow: 'visible', border: '1px solid var(--glass-border)' }}>
              {/* Background gradient */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(210deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.005) 100%)',
                pointerEvents: 'none',
                transition: 'background 0.3s ease'
              }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Top Row: Title & Resource Group Dropdown & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <h1 style={{ 
                      margin: 0,
                      fontSize: '1.6rem', 
                      fontWeight: 800, 
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(to right, var(--text-primary) 30%, rgba(167, 139, 250, 0.95))', 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                      whiteSpace: 'nowrap'
                    }}>
                      DevOps Control Centre
                    </h1>
                  </div>

                  {/* Resource Group Dropdown Selector & Status Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                    {controlResourceGroups && controlResourceGroups.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Resource Group:</span>
                        <select
                          value={selectedControlResourceGroup}
                          onChange={(e) => handleResourceGroupChange(e.target.value)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 650,
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {controlResourceGroups.map((rg) => {
                            const isPrimary = rg === primaryResourceGroup;
                            return (
                              <option key={rg} value={rg} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                                {rg} {isPrimary ? ' (Primary)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {!scanning && scanProgress === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.12)', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Connected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--divider)', margin: '0' }} />

                {/* Bottom Row: Tab buttons grid */}
                <div className="premium-tabs-grid">
                  <button className={`premium-tab-btn ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
                    <Server size={16} />
                    <span>Cloud Scanning</span>
                    {activeBuildsCount > 0 && (
                      <span className="premium-build-dot" title={`${activeBuildsCount} build(s) in progress`} />
                    )}
                    <div className="menu-hover-card menu-hover-card-left">
                      <div className="menu-hover-card-title"><Server size={12} /> Cloud Scanning</div>
                      <div className="menu-hover-card-desc">Scan and monitor all your Azure Static Web Apps, backend APIs, and virtual machines across environments.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'provision' ? 'active' : ''}`} onClick={() => setActiveTab('provision')}>
                    <PlusCircle size={16} />
                    <span>Provision App</span>
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><PlusCircle size={12} /> Provision App</div>
                      <div className="menu-hover-card-desc">Launch new Azure Static Web Apps or backend containers with guided step-by-step provisioning wizard.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => { setActiveTab('cost'); setCostTab('breakdown'); }}>
                    <Database size={16} />
                    <span>Cost & Billing</span>
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><Database size={12} /> Cost & Billing</div>
                      <div className="menu-hover-card-desc">View a detailed Azure cost breakdown by resource group, service type, and environment for the current billing cycle.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'optimization' ? 'active' : ''}`} onClick={() => { setActiveTab('optimization'); setCostTab('recommendations'); }}>
                    <TrendingDown size={16} />
                    <span>Cost Optimization</span>
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><TrendingDown size={12} /> Cost Optimization</div>
                      <div className="menu-hover-card-desc">AI-driven recommendations to right-size resources, schedule sleep timers, and reduce monthly cloud spend.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'databases' ? 'active' : ''}`} onClick={() => setActiveTab('databases')}>
                    <Database size={16} />
                    <span>DB Hub</span>
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><Database size={12} /> DB Hub</div>
                      <div className="menu-hover-card-desc">Browse and manage your connected database catalog — schemas, tables, and connection health at a glance.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'credentials' ? 'active' : ''}`} onClick={() => setActiveTab('credentials')}>
                    <ShieldCheck size={16} />
                    <span>Credentials</span>
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><ShieldCheck size={12} /> Credentials</div>
                      <div className="menu-hover-card-desc">Securely manage API keys for GitHub, GoDaddy, and Azure DevOps. All secrets are AES-256-GCM encrypted at rest.</div>
                    </div>
                  </button>
                  {(user?.role === 'owner' || user?.role === 'admin') && (
                    <button className={`premium-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                      <Users size={16} />
                      <span>Team Settings</span>
                      <div className="menu-hover-card">
                        <div className="menu-hover-card-title"><Users size={12} /> Team Settings</div>
                        <div className="menu-hover-card-desc">Invite team members, assign roles (owner / admin / viewer), and review the full organisation audit trail.</div>
                      </div>
                    </button>
                  )}
                  <button className={`premium-tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                    <Activity size={16} />
                    <span>Events Feed</span>
                    {activeBuildsCount > 0 && (
                      <span className="premium-build-badge" title={`${activeBuildsCount} build(s) in progress`}>
                        {activeBuildsCount}
                      </span>
                    )}
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><Activity size={12} /> Events Feed</div>
                      <div className="menu-hover-card-desc">Real-time stream of build triggers, power actions, scans, and credential changes across the platform.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>
                    <Info size={16} />
                    <span>User Guide</span>
                    <div className="menu-hover-card menu-hover-card-right">
                      <div className="menu-hover-card-title"><Info size={12} /> User Guide</div>
                      <div className="menu-hover-card-desc">Step-by-step documentation, onboarding checklists, and quick-start guides for all DevOps Control Centre features.</div>
                    </div>
                  </button>
                </div>

                {/* Cloud Scan Progress Bar (placed below tabs grid when active) */}
                {(scanning || scanProgress > 0) && (
                  <div style={{ 
                    marginTop: '4px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    animation: 'fade-in-anim 0.3s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={13} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Scanning active cloud and refreshing cost metrics...</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{Math.floor(scanProgress)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 8px var(--accent-purple-glow)', transition: 'width 0.15s ease-out', borderRadius: '2px' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

      {/* Tab Contents */}
      <main style={{ paddingBottom: '80px' }}>
        
        {/* TAB 1: CLOUD RESOURCE SCANNING */}
        {activeTab === 'scan' && (
          <DashboardPage
            apps={apps}
            scanning={scanning}
            scanProgress={scanProgress}
            scanError={scanError}
            appGroups={appGroups}
            collapsedScanGroups={collapsedScanGroups}
            setCollapsedScanGroups={setCollapsedScanGroups}
            toggleGroupScan={toggleGroupScan}
            deletingAppName={deletingAppName}
            handleDeleteApp={handleDeleteApp}
            openDnsModal={openDnsModal}
            openPipelineModal={openPipelineModal}
            handleScan={handleScan}
            theme={theme}
            setSelectedStageForJobs={setSelectedStageForJobs}
            azureDevopsOrgUrl={azureDevopsOrgUrl}
            azureDevopsProject={azureDevopsProject}
            onDeployBranch={handleDeployBranchFromDashboard}
            currentUser={user}
            onShowLogs={setActiveLogsAppName}
            onShowBuildHistory={(app) => setBuildHistoryDrawerApp(app)}
            onCloneApp={setCloningApp}
            onResourceControl={handleResourceControl}
            controllingResource={controllingResource}
            onBuildTransition={(title, message, type) => {
              showToast(title, message, type);
              addEvent(title, message, 'build', type === 'success' ? 'success' : type === 'error' ? 'failed' : 'info');
              addNotification(title, message, type === 'success' ? 'success' : type === 'error' ? 'error' : 'info');
            }}
          />
        )}

        {/* TAB 2: PROVISION WEB APP WIZARD */}
        {activeTab === 'provision' && (
          <ProvisionWizard
            kubernetesVersion={kubernetesVersion}
            setKubernetesVersion={setKubernetesVersion}
            nodeCount={nodeCount}
            setNodeCount={setNodeCount}
            vmSize={vmSize}
            setVmSize={setVmSize}
            subnetId={subnetId}
            setSubnetId={setSubnetId}
            dbSkuName={dbSkuName}
            setDbSkuName={setDbSkuName}
            dbSkuTier={dbSkuTier}
            setDbSkuTier={setDbSkuTier}
            dbVersion={dbVersion}
            setDbVersion={setDbVersion}
            dbAdminUsername={dbAdminUsername}
            setDbAdminUsername={setDbAdminUsername}
            dbAdminPassword={dbAdminPassword}
            setDbAdminPassword={setDbAdminPassword}
            virtualNetworks={virtualNetworks}
            fetchBranches={fetchBranches}
            provisionStep={provisionStep}
            setProvisionStep={setProvisionStep}
            appType={appType}
            setAppType={setAppType}
            newName={newName}
            setNewName={setNewName}
            newLocation={newLocation}
            setNewLocation={setNewLocation}
            targetPort={targetPort}
            setTargetPort={setTargetPort}
            selectedRepo={selectedRepo}
            setSelectedRepo={setSelectedRepo}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            selectedBranches={selectedBranches}
            setSelectedBranches={setSelectedBranches}
            branches={branches}
            setBranches={setBranches}
            loadingBranches={loadingBranches}
            apps={apps}
            ymlLoading={ymlLoading}
            ymlError={ymlError}
            setYmlError={setYmlError}
            ymlContent={ymlContent}
            setYmlContent={setYmlContent}
            ymlSource={ymlSource}
            creatingYml={creatingYml}
            provisioning={provisioning}
            provisionSuccess={provisionSuccess}
            setProvisionSuccess={setProvisionSuccess}
            provisionError={provisionError}
            setProvisionError={setProvisionError}
            pipelineRegSuccess={pipelineRegSuccess}
            pipelineRegError={pipelineRegError}
            pipelineRegistering={pipelineRegistering}
            registeredPipelineUrl={registeredPipelineUrl}
            dnsBindSuccess={dnsBindSuccess}
            dnsBindError={dnsBindError}
            dnsBinding={dnsBinding}
            domainInput={domainInput}
            getCategorizedRepos={getCategorizedRepos}
            handleAppTypeChange={handleAppTypeChange}
            handleRepoChange={handleRepoChange}
            handleMoveToStep2={handleMoveToStep2}
            handleCommitCustomYml={handleCommitCustomYml}
            handleProvision={handleProvision}
            handleRegisterPipeline={handleRegisterPipeline}
            handleDnsBind={handleDnsBind}
            organizationId={organizationId}
            API_BASE={API_BASE}
            locations={locations}
            resourceGroups={resourceGroups}
            managedEnvironments={managedEnvironments}
            containerRegistries={containerRegistries}
            serviceConnections={serviceConnections}
            loadingMetadata={loadingMetadata}
            selectedResourceGroup={selectedResourceGroup}
            setSelectedResourceGroup={setSelectedResourceGroup}
            selectedManagedEnvironment={selectedManagedEnvironment}
            setSelectedManagedEnvironment={setSelectedManagedEnvironment}
            selectedCpu={selectedCpu}
            setSelectedCpu={setSelectedCpu}
            selectedMemory={selectedMemory}
            setSelectedMemory={setSelectedMemory}
            minReplicas={minReplicas}
            setMinReplicas={setMinReplicas}
            maxReplicas={maxReplicas}
            setMaxReplicas={setMaxReplicas}
            customAppLocation={customAppLocation}
            setCustomAppLocation={setCustomAppLocation}
            customApiLocation={customApiLocation}
            setCustomApiLocation={setCustomApiLocation}
            customOutputLocation={customOutputLocation}
            setCustomOutputLocation={setCustomOutputLocation}
            dockerfileMissing={dockerfileMissing}
            setDockerfileMissing={setDockerfileMissing}
            committingDockerfile={committingDockerfile}
            setCommittingDockerfile={setCommittingDockerfile}
            dockerfileCheckError={dockerfileCheckError}
            setDockerfileCheckError={setDockerfileCheckError}
            checkDockerfile={checkDockerfile}
            commitDefaultDockerfile={commitDefaultDockerfile}
            setPipelineRegSuccess={setPipelineRegSuccess}
            setPipelineRegError={setPipelineRegError}
            setDnsBindSuccess={setDnsBindSuccess}
            setDnsBindError={setDnsBindError}
            dockerfileChecked={dockerfileChecked}
            dockerfileContent={dockerfileContent}
            dockerfileLoading={dockerfileLoading}
            fetchDockerfileContent={fetchDockerfileContent}
            pushDockerfileContent={pushDockerfileContent}
            provisionErrorDetail={provisionErrorDetail}
            setConfirmDialog={setConfirmDialog}
            currentUser={user}
            repoIntegrity={repoIntegrity}
            repoIntegrityLoading={repoIntegrityLoading}
          />
        )}

        {/* TAB 3: CREDENTIALS MANAGEMENT */}
        {activeTab === 'credentials' && (
          <CredentialsPage
            githubToken={githubToken}
            setGithubToken={setGithubToken}
            showGithubToken={showGithubToken}
            setShowGithubToken={setShowGithubToken}
            decryptedGithubToken={decryptedGithubToken}
            credentialStatus={credentialStatus}
            savingCredentials={savingCredentials}
            credMsg={credMsg}
            handleLoadSavedCredential={handleLoadSavedCredential}
            handleSaveCredential={handleSaveCredential}
            godaddyKey={godaddyKey}
            setGodaddyKey={setGodaddyKey}
            godaddySecret={godaddySecret}
            setGodaddySecret={setGodaddySecret}
            showGodaddyKey={showGodaddyKey}
            setShowGodaddyKey={setShowGodaddyKey}
            showGodaddySecret={showGodaddySecret}
            setShowGodaddySecret={setShowGodaddySecret}
            decryptedGodaddyKey={decryptedGodaddyKey}
            decryptedGodaddySecret={decryptedGodaddySecret}
            devopsPat={devopsPat}
            setDevopsPat={setDevopsPat}
            showDevopsPat={showDevopsPat}
            setShowDevopsPat={setShowDevopsPat}
            decryptedDevopsPat={decryptedDevopsPat}
            azureSubscriptionId={azureSubscriptionId}
            setAzureSubscriptionId={setAzureSubscriptionId}
            azureResourceGroup={azureResourceGroup}
            setAzureResourceGroup={setAzureResourceGroup}
            defaultDnsDomain={defaultDnsDomain}
            setDefaultDnsDomain={setDefaultDnsDomain}
            azureDevopsOrgUrl={azureDevopsOrgUrl}
            setAzureDevopsOrgUrl={setAzureDevopsOrgUrl}
            azureDevopsProject={azureDevopsProject}
            setAzureDevopsProject={setAzureDevopsProject}
            pipelineVariableGroup={pipelineVariableGroup}
            setPipelineVariableGroup={setPipelineVariableGroup}
            githubOwner={githubOwner}
            setGithubOwner={setGithubOwner}
            azureContainerRegistry={azureContainerRegistry}
            setAzureContainerRegistry={setAzureContainerRegistry}
            azureDevopsServiceConnection={azureDevopsServiceConnection}
            setAzureDevopsServiceConnection={setAzureDevopsServiceConnection}
            dockerRegistryServiceConnection={dockerRegistryServiceConnection}
            setDockerRegistryServiceConnection={setDockerRegistryServiceConnection}
            teamsWebhookUrl={teamsWebhookUrl}
            setTeamsWebhookUrl={setTeamsWebhookUrl}
            teamsWebhookToken={teamsWebhookToken}
            logAnalyticsWorkspaceId={logAnalyticsWorkspaceId}
            setLogAnalyticsWorkspaceId={setLogAnalyticsWorkspaceId}
            savingSettings={savingSettings}
            settingsMsg={settingsMsg}
            handleSaveSettings={handleSaveSettings}
            containerRegistries={containerRegistries}
            serviceConnections={serviceConnections}
            loadingMetadata={loadingMetadata}
            currentUser={user}
            API_BASE={API_BASE}
            theme={theme}
            azureKeyVaultUrl={azureKeyVaultUrl}
            setAzureKeyVaultUrl={setAzureKeyVaultUrl}
            devDbHost={devDbHost}
            setDevDbHost={setDevDbHost}
            qaDbHost={qaDbHost}
            setQaDbHost={setQaDbHost}
            prodDbHost={prodDbHost}
            setProdDbHost={setProdDbHost}
            devManagedEnvId={devManagedEnvId}
            setDevManagedEnvId={setDevManagedEnvId}
            prodManagedEnvId={prodManagedEnvId}
            setProdManagedEnvId={setProdManagedEnvId}
            discoveringInfra={discoveringInfra}
            handleDiscoverAzureResources={handleDiscoverAzureResources}
            testingCredential={testingCredential}
            validationResult={validationResult}
            handleValidateCredential={handleValidateCredential}
          />
        )}



        {/* TAB 4: COST MANAGEMENT & OPTIMIZATION */}
        {(activeTab === 'cost' || activeTab === 'optimization') && (
          <CostPage
            costSummary={costSummary}
            detailedCosts={detailedCosts}
            costSuggestions={costSuggestions}
            appliedSuggestions={appliedSuggestions}
            invoices={invoices}
            loadingCosts={loadingCosts}
            costError={costError}
            remediating={remediating}
            costTab={costTab}
            setCostTab={setCostTab}
            costSearch={costSearch}
            setCostSearch={setCostSearch}
            envFilter={envFilter}
            setEnvFilter={setEnvFilter}
            handleApplyRemediation={handleApplyRemediation}
            theme={theme}
            deletingAppName={deletingAppName}
            handleDeleteApp={handleDeleteApp}
            currentUser={user}
            API_BASE={API_BASE}
            organizationId={organizationId}
            onResourceControl={handleResourceControl}
            controllingResource={controllingResource}
            mode={activeTab === 'cost' ? 'cost' : 'optimization'}
          />
        )}

        {/* TAB 5: DATABASE CATALOG */}
        {activeTab === 'databases' && (
          <DatabaseCatalogPage
            apps={apps}
            virtualNetworks={virtualNetworks}
            dbServers={dbServers}
            selectedDbServer={selectedDbServer}
            setSelectedDbServer={setSelectedDbServer}
            databases={databases}
            selectedDatabase={selectedDatabase}
            setSelectedDatabase={setSelectedDatabase}
            databaseSchema={databaseSchema}
            loadingDbServers={loadingDbServers}
            loadingDatabases={loadingDatabases}
            loadingSchema={loadingSchema}
            schemaError={schemaError}
            newDbName={newDbName}
            setNewDbName={setNewDbName}
            deployingDb={deployingDb}
            deployDbSuccess={deployDbSuccess}
            deployDbError={deployDbError}
            expandedTables={expandedTables}
            setExpandedTables={setExpandedTables}
            copiedText={copiedText}
            setCopiedText={setCopiedText}
            dbDetailTab={dbDetailTab}
            setDbDetailTab={setDbDetailTab}
            connectCodeTab={connectCodeTab}
            setConnectCodeTab={setConnectCodeTab}
            querySql={querySql}
            setQuerySql={setQuerySql}
            queryExecuting={queryExecuting}
            queryResult={queryResult}
            queryError={queryError}
            dbSearchQuery={dbSearchQuery}
            setDbSearchQuery={setDbSearchQuery}
            newTableName={newTableName}
            setNewTableName={setNewTableName}
            tableColumns={tableColumns}
            setTableColumns={setTableColumns}
            creatingTable={creatingTable}
            createTableError={createTableError}
            alteringTable={alteringTable}
            setAlteringTable={setAlteringTable}
            alterNewColName={alterNewColName}
            setAlterNewColName={setAlterNewColName}
            alterNewColType={alterNewColType}
            setAlterNewColType={setAlterNewColType}
            alterNewColNullable={alterNewColNullable}
            setAlterNewColNullable={setAlterNewColNullable}
            token={token}
            API_BASE={API_BASE}
            handleDeployDb={handleProvisionDatabase}
            handleDropTable={handleDropTable}
            handleDropColumn={handleDropColumn}
            handleExecuteQuery={handleExecuteQuery}
            handleCreateTable={handleCreateTable}
            handleAddColumn={handleAddColumn}
            fetchDatabases={fetchDatabases}
            fetchDatabaseSchema={fetchDatabaseSchema}
            setConfirmDialog={setConfirmDialog}
            leftColRef={leftColRef}
            leftColHeight={leftColHeight}
            currentUser={user}
            theme={theme}
          />
        )}


        {/* TAB 7: TEAM SETTINGS */}
        {activeTab === 'users' && (user?.role === 'owner' || user?.role === 'admin') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <TeamPage
              users={teamUsers}
              currentUser={user}
              loadingUsers={loadingUsers}
              syncingTeam={syncingTeam}
              handleSyncTeam={handleSyncTeam}
              handleUpdateRole={handleUpdateRole}
              theme={theme}
              API_BASE={API_BASE}
            />
          </div>
        )}

        {/* TAB 6: USER GUIDE */}
        {activeTab === 'guide' && (
          <GuidePage theme={theme} />
        )}

        {/* TAB 8: PERSISTENT EVENTS STREAM */}
        {activeTab === 'events' && (() => {
          const filteredEvents = unifiedEvents.filter(e => {
            const matchesCategory = selectedEventCategories.includes(e.type);
            const matchesStatus = selectedEventStatuses.includes(e.status);
            const query = eventSearchQuery.trim().toLowerCase();
            const matchesSearch = query === '' || 
                                  e.title.toLowerCase().includes(query) || 
                                  e.message.toLowerCase().includes(query) ||
                                  (e.actorEmail && e.actorEmail.toLowerCase().includes(query)) ||
                                  (e.target && e.target.toLowerCase().includes(query));
            
            let matchesDate = true;
            if (eventDateScope !== 'all') {
              const eventTime = new Date(e.timestamp).getTime();
              const now = Date.now();
              if (eventDateScope === '24h') {
                matchesDate = (now - eventTime) <= 24 * 60 * 60 * 1000;
              } else if (eventDateScope === '7d') {
                matchesDate = (now - eventTime) <= 7 * 24 * 60 * 60 * 1000;
              } else if (eventDateScope === '30d') {
                matchesDate = (now - eventTime) <= 30 * 24 * 60 * 60 * 1000;
              } else if (eventDateScope === 'custom') {
                if (eventStartDate) {
                  const start = new Date(eventStartDate + 'T00:00:00').getTime();
                  matchesDate = matchesDate && (eventTime >= start);
                }
                if (eventEndDate) {
                  const end = new Date(eventEndDate + 'T23:59:59.999').getTime();
                  matchesDate = matchesDate && (eventTime <= end);
                }
              }
            }
            
            return matchesCategory && matchesStatus && matchesSearch && matchesDate;
          });

          const sortedEvents = [...filteredEvents].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return eventSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
          });

          // Grouping helper functions
          const getLocalDateString = (isoString: string) => {
            try {
              const date = new Date(isoString);
              return date.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            } catch (e) {
              return 'Earlier';
            }
          };

          const getCategoryGroupName = (type: string) => {
            switch (type) {
              case 'build': return 'Build Pipelines';
              case 'power': return 'Power Controls';
              case 'scan': return 'Cloud Security Scans';
              case 'credential': return 'Credentials Check';
              case 'audit': return 'Security Audit Logs';
              default: return 'General Operations';
            }
          };

          const renderEventCard = (event: EventLog, isFlatList: boolean) => {
            const timestampText = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const getCategoryConfig = (type: string, status: string) => {
              const colors: Record<string, { border: string; text: string; bg: string }> = {
                success: { border: '#22c55e', text: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
                failed: { border: '#ef4444', text: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
                warning: { border: '#f59e0b', text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
                info: { border: '#3b82f6', text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' }
              };
              const state = colors[status] || colors.info;

              let icon = <Terminal size={12} />;
              if (type === 'build') icon = <GitBranch size={12} />;
              if (type === 'power') icon = <Sliders size={12} />;
              if (type === 'scan') icon = <Server size={12} />;
              if (type === 'credential') icon = <ShieldCheck size={12} />;
              if (type === 'audit') icon = <ShieldCheck size={12} />;

              return { state, icon };
            };

            const { state, icon } = getCategoryConfig(event.type, event.status);
            const isLatestEvent = unifiedEvents[0]?.id === event.id;
            const isCardExpanded = expandedEventId === event.id;
            const dotLeft = isFlatList ? '-31px' : '-79px';

            return (
              <div
                key={event.id}
                className="event-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: theme === 'light' ? 'rgba(0,0,0,0.005)' : 'rgba(255,255,255,0.005)',
                  border: '1px solid var(--glass-border)',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedEventId(isCardExpanded ? null : event.id)}
              >
                <div style={{
                  position: 'absolute',
                  left: dotLeft,
                  top: '25px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: state.border,
                  border: '2px solid var(--bg-primary)',
                  zIndex: 2,
                  animation: isLatestEvent ? 'pulse-node 2s infinite ease-in-out' : 'none',
                  boxShadow: isLatestEvent ? '0 0 8px ' + state.border : 'none'
                }} />

                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  backgroundColor: state.border,
                  borderRadius: '3px 0 0 3px'
                }} />

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: state.bg,
                    color: state.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(' + (state.border === '#22c55e' ? '34,197,94' : state.border === '#ef4444' ? '239,68,68' : state.border === '#f59e0b' ? '245,158,11' : '59,130,246') + ', 0.15)'
                  }}>
                    {icon}
                  </div>

                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                        {event.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {event.message}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {timestampText}
                      </span>
                      {isCardExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                  </div>
                </div>

                {isCardExpanded && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      borderTop: '1px solid var(--glass-border)',
                      paddingTop: '14px',
                      marginTop: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 750,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: event.type === 'audit' 
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))' 
                          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15))',
                        border: event.type === 'audit'
                          ? '1px solid rgba(139, 92, 246, 0.3)'
                          : '1px solid rgba(16, 185, 129, 0.3)',
                        color: event.type === 'audit' ? '#c084fc' : 'var(--accent-teal)'
                      }}>
                        {event.type === 'audit' ? 'Security Audit Trail' : 'Local System Feed'}
                      </span>
                    </div>

                    {event.type === 'audit' ? (
                      <>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid var(--glass-border)',
                          fontSize: '0.76rem'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Actor Email</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.actorEmail}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Target Entity</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{event.target}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Request Endpoint</span>
                            {(() => {
                              const method = event.details?.method || 'POST';
                              const path = event.details?.path || '/';
                              const methodColor = method === 'DELETE' ? '#ef4444' : method === 'PUT' ? '#fb923c' : method === 'GET' ? '#3b82f6' : '#10b981';
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                                  <span style={{
                                    fontSize: '0.58rem',
                                    fontWeight: 800,
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid ' + methodColor,
                                    color: methodColor
                                  }}>
                                    {method}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{path}</span>
                                </div>
                              );
                            })()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Source IP Address</span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{event.details?.ip || 'Unknown'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              <Terminal size={11} style={{ color: 'var(--accent-purple)' }} />
                              <span>Request Body Payload & Parameters</span>
                            </div>
                            <CopyButton text={JSON.stringify(event.details?.payload || event.details?.query || event.details || {}, null, 2)} />
                          </div>
                          <pre style={{
                            margin: 0,
                            background: '#020617',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--glass-border)',
                            maxHeight: '180px',
                            overflowY: 'auto'
                          }}>
                            {JSON.stringify(event.details?.payload || event.details?.query || event.details || {}, null, 2)}
                          </pre>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                          <span>Category: <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{event.type}</strong></span>
                          <span>Status: <strong style={{ color: event.status === 'success' ? 'var(--success)' : 'var(--error)' }}>{event.status}</strong></span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>System Diagnostics Context</span>
                            <CopyButton text={JSON.stringify({ eventId: event.id, timestamp: event.timestamp, title: event.title, status: event.status, message: event.message }, null, 2)} />
                          </div>
                          <pre style={{
                            margin: 0,
                            background: '#020617',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--glass-border)',
                            maxHeight: '120px',
                            overflowY: 'auto'
                          }}>
                            {JSON.stringify({
                              eventId: event.id,
                              timestamp: event.timestamp,
                              title: event.title,
                              message: event.message,
                              status: event.status
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          };

          const groupedEvents: Record<string, Record<string, EventLog[]>> = {};
          sortedEvents.forEach(e => {
            const dateKey = getLocalDateString(e.timestamp);
            const categoryKey = getCategoryGroupName(e.type);

            if (eventGroupingMode === 'date') {
              if (!groupedEvents[dateKey]) groupedEvents[dateKey] = {};
              if (!groupedEvents[dateKey][categoryKey]) groupedEvents[dateKey][categoryKey] = [];
              groupedEvents[dateKey][categoryKey].push(e);
            } else {
              if (!groupedEvents[categoryKey]) groupedEvents[categoryKey] = {};
              if (!groupedEvents[categoryKey][dateKey]) groupedEvents[categoryKey][dateKey] = [];
              groupedEvents[categoryKey][dateKey].push(e);
            }
          });

          // Sort Level 1 groups
          const sortedL1Keys = Object.keys(groupedEvents).sort((a, b) => {
            if (eventGroupingMode === 'date') {
              const getFirstTimestamp = (key: string) => {
                const cats = groupedEvents[key];
                const firstCatKey = Object.keys(cats)[0];
                return cats[firstCatKey]?.[0]?.timestamp ? new Date(cats[firstCatKey][0].timestamp).getTime() : 0;
              };
              return eventSortOrder === 'desc' 
                ? getFirstTimestamp(b) - getFirstTimestamp(a)
                : getFirstTimestamp(a) - getFirstTimestamp(b);
            } else {
              return eventSortOrder === 'desc' ? a.localeCompare(b) : b.localeCompare(a);
            }
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <style>{`
              @keyframes pulse-node {
                0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
              }
              @keyframes pulse-shimmer {
                0% { opacity: 0.35; }
                50% { opacity: 0.75; }
                100% { opacity: 0.35; }
              }
              .event-card {
                transition: all 0.22s ease-in-out !important;
              }
              .event-card:hover {
                transform: translateY(-1.5px) scale(1.002) !important;
                border-color: rgba(255, 255, 255, 0.16) !important;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
              }
              .event-accordion-header {
                transition: background 0.2s ease, border-color 0.2s ease;
              }
              .event-accordion-header:hover {
                background: rgba(255, 255, 255, 0.03) !important;
                border-color: rgba(255, 255, 255, 0.12) !important;
              }
            `}</style>
            
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '16px'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Activity size={20} style={{ color: 'var(--accent-purple)' }} />
                    System Events Feed
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Audit trail of pipeline builds, power controls, credentials connection checks, cloud scanning, and database transactions.
                  </p>
                </div>
                {unifiedEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear the entire local events history? Note: Database audit trails will not be cleared.')) {
                        setEvents([]);
                        localStorage.removeItem('evaops_events');
                        showToast('Events Feed Cleared', 'All local system event logs were successfully removed.', 'info');
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#f87171',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                      e.currentTarget.style.color = '#fca5a5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.color = '#f87171';
                    }}
                  >
                    Clear Local History
                  </button>
                )}
              </div>

              {/* Event Filters and Search Bar */}
              {(unifiedEvents.length > 0 || loadingAuditLogsForEvents) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Top Search & Controls Row */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                    {/* Search Input Container */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        placeholder="Search events by title, message, actor, or target..."
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '0.82rem',
                          height: '36px',
                          padding: '0 36px 0 34px',
                          borderRadius: '8px',
                          border: '1px solid var(--glass-border)',
                          background: 'rgba(255,255,255,0.01)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      {eventSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setEventSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Advanced Filters Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsAdvancedFiltersOpen(prev => !prev)}
                      style={{
                        height: '36px',
                        padding: '0 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: isAdvancedFiltersOpen || selectedEventCategories.length !== 6 || selectedEventStatuses.length !== 4 || eventDateScope !== 'all'
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(59, 130, 246, 0.18))'
                          : 'rgba(255,255,255,0.02)',
                        color: isAdvancedFiltersOpen || selectedEventCategories.length !== 6 || selectedEventStatuses.length !== 4 || eventDateScope !== 'all'
                          ? '#a78bfa'
                          : 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        borderColor: isAdvancedFiltersOpen || selectedEventCategories.length !== 6 || selectedEventStatuses.length !== 4 || eventDateScope !== 'all'
                          ? 'rgba(139, 92, 246, 0.4)'
                          : 'var(--glass-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(59, 130, 246, 0.22))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isAdvancedFiltersOpen || selectedEventCategories.length !== 6 || selectedEventStatuses.length !== 4 || eventDateScope !== 'all'
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(59, 130, 246, 0.18))'
                          : 'rgba(255,255,255,0.02)';
                      }}
                    >
                      <Sliders size={12} />
                      <span>Filters</span>
                      {(selectedEventCategories.length !== 6 || selectedEventStatuses.length !== 4 || eventDateScope !== 'all') && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#a78bfa',
                          boxShadow: '0 0 6px #a78bfa'
                        }} />
                      )}
                    </button>

                    {/* Group By Segmented Control */}
                    <div style={{ display: 'flex', gap: '4px', padding: '3px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--glass-border)', height: '36px', alignItems: 'center' }}>
                      {(['date', 'category', 'none'] as const).map((mode) => {
                        const isModeActive = eventGroupingMode === mode;
                        const modeLabel = mode === 'date' ? 'By Date' 
                                          : mode === 'category' ? 'By Category'
                                          : 'Flat Timeline';
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setEventGroupingMode(mode);
                              setExpandedEventGroups({});
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isModeActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'transparent',
                              color: isModeActive ? '#fff' : 'var(--text-secondary)',
                              fontWeight: isModeActive ? 600 : 500,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              boxShadow: isModeActive ? '0 2px 6px var(--accent-blue-glow)' : 'none',
                              transition: 'all 0.2s ease',
                              height: '28px'
                            }}
                          >
                            {modeLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sort Order Segmented Control */}
                    <div style={{ display: 'flex', gap: '4px', padding: '3px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--glass-border)', height: '36px', alignItems: 'center' }}>
                      {(['desc', 'asc'] as const).map((order) => {
                        const isOrderActive = eventSortOrder === order;
                        const orderLabel = order === 'desc' ? 'Newest' : 'Oldest';
                        return (
                          <button
                            key={order}
                            type="button"
                            onClick={() => setEventSortOrder(order)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isOrderActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'transparent',
                              color: isOrderActive ? '#fff' : 'var(--text-secondary)',
                              fontWeight: isOrderActive ? 600 : 500,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              boxShadow: isOrderActive ? '0 2px 6px var(--accent-blue-glow)' : 'none',
                              transition: 'all 0.2s ease',
                              height: '28px'
                            }}
                          >
                            {orderLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Collapsible Filter Panel */}
                  {isAdvancedFiltersOpen && (
                    <div style={{
                      padding: '20px',
                      background: 'rgba(0,0,0,0.15)',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <style>{`
                        @keyframes fadeIn {
                          from { opacity: 0; transform: translateY(-4px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                      `}</style>

                      {/* Row for Categories and Statuses */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {/* 1. Category Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Categories
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedEventCategories(['build', 'power', 'scan', 'credential', 'audit', 'general'])}
                                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                              >
                                Select All
                              </button>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>|</span>
                              <button
                                type="button"
                                onClick={() => setSelectedEventCategories([])}
                                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              { key: 'build', label: 'Builds', icon: <GitBranch size={10} /> },
                              { key: 'power', label: 'Power', icon: <Sliders size={10} /> },
                              { key: 'scan', label: 'Scans', icon: <Server size={10} /> },
                              { key: 'credential', label: 'Credentials', icon: <ShieldCheck size={10} /> },
                              { key: 'audit', label: 'Audit Logs', icon: <ShieldCheck size={10} /> },
                              { key: 'general', label: 'General', icon: <Terminal size={10} /> }
                            ].map((cat) => {
                              const isSelected = selectedEventCategories.includes(cat.key);
                              const matchCount = unifiedEvents.filter(e => e.type === cat.key).length;
                              return (
                                <button
                                  key={cat.key}
                                  type="button"
                                  onClick={() => {
                                    setSelectedEventCategories(prev =>
                                      prev.includes(cat.key) ? prev.filter(c => c !== cat.key) : [...prev, cat.key]
                                    );
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 10px',
                                    borderRadius: '16px',
                                    fontSize: '0.72rem',
                                    fontWeight: 550,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)',
                                    background: isSelected ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))' : 'transparent',
                                    color: isSelected ? '#c084fc' : 'var(--text-secondary)'
                                  }}
                                >
                                  {cat.icon}
                                  <span>{cat.label}</span>
                                  <span style={{ fontSize: '0.64rem', color: isSelected ? '#d8b4fe' : 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: '4px' }}>
                                    {matchCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Status Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Status / Severity
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedEventStatuses(['success', 'failed', 'warning', 'info'])}
                                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                              >
                                Select All
                              </button>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>|</span>
                              <button
                                type="button"
                                onClick={() => setSelectedEventStatuses([])}
                                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              { key: 'success', label: 'Success', color: '#22c55e' },
                              { key: 'failed', label: 'Failed', color: '#ef4444' },
                              { key: 'warning', label: 'Warning', color: '#f59e0b' },
                              { key: 'info', label: 'Info', color: '#3b82f6' }
                            ].map((status) => {
                              const isSelected = selectedEventStatuses.includes(status.key);
                              const matchCount = unifiedEvents.filter(e => e.status === status.key).length;
                              return (
                                <button
                                  key={status.key}
                                  type="button"
                                  onClick={() => {
                                    setSelectedEventStatuses(prev =>
                                      prev.includes(status.key) ? prev.filter(s => s !== status.key) : [...prev, status.key]
                                    );
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 10px',
                                    borderRadius: '16px',
                                    fontSize: '0.72rem',
                                    fontWeight: 550,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    border: isSelected ? `1px solid rgba(${status.key === 'success' ? '34,197,94' : status.key === 'failed' ? '239,68,68' : status.key === 'warning' ? '245,158,11' : '59,130,246'}, 0.4)` : '1px solid var(--glass-border)',
                                    background: isSelected ? `rgba(${status.key === 'success' ? '34,197,94' : status.key === 'failed' ? '239,68,68' : status.key === 'warning' ? '245,158,11' : '59,130,246'}, 0.08)` : 'transparent',
                                    color: isSelected ? status.color : 'var(--text-secondary)'
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }} />
                                  <span>{status.label}</span>
                                  <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: '4px' }}>
                                    {matchCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Date Range Section */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 650, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          Time Horizon
                        </span>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', padding: '3px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            {[
                              { key: 'all', label: 'All Time' },
                              { key: '24h', label: 'Last 24 Hours' },
                              { key: '7d', label: 'Last 7 Days' },
                              { key: '30d', label: 'Last 30 Days' },
                              { key: 'custom', label: 'Custom Range' }
                            ].map((scope) => {
                              const isActive = eventDateScope === scope.key;
                              return (
                                <button
                                  key={scope.key}
                                  type="button"
                                  onClick={() => setEventDateScope(scope.key as any)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: isActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'transparent',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    boxShadow: isActive ? '0 2px 6px var(--accent-blue-glow)' : 'none',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {scope.label}
                                </button>
                              );
                            })}
                          </div>

                          {eventDateScope === 'custom' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                              <input
                                type="date"
                                value={eventStartDate}
                                onChange={(e) => setEventStartDate(e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(0,0,0,0.2)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.76rem',
                                  height: '28px'
                                }}
                              />
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>to</span>
                              <input
                                type="date"
                                value={eventEndDate}
                                onChange={(e) => setEventEndDate(e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(0,0,0,0.2)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.76rem',
                                  height: '28px'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Filters Summary Banner */}
                  {(eventSearchQuery || selectedEventCategories.length !== 6 || selectedEventStatuses.length !== 4 || eventDateScope !== 'all') && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>
                          Showing <strong>{sortedEvents.length}</strong> of <strong>{unifiedEvents.length}</strong> system events matching active query:
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {eventSearchQuery && (
                            <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', fontSize: '0.68rem' }}>
                              Search: "{eventSearchQuery}"
                            </span>
                          )}
                          {selectedEventCategories.length !== 6 && (
                            <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', fontSize: '0.68rem' }}>
                              Categories ({selectedEventCategories.length} selected)
                            </span>
                          )}
                          {selectedEventStatuses.length !== 4 && (
                            <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', fontSize: '0.68rem' }}>
                              Statuses ({selectedEventStatuses.length} selected)
                            </span>
                          )}
                          {eventDateScope !== 'all' && (
                            <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', fontSize: '0.68rem' }}>
                              Timeframe: {eventDateScope === 'custom' ? 'Custom' : eventDateScope}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventCategories(['build', 'power', 'scan', 'credential', 'audit', 'general']);
                          setSelectedEventStatuses(['success', 'failed', 'warning', 'info']);
                          setEventDateScope('all');
                          setEventSearchQuery('');
                          setEventStartDate('');
                          setEventEndDate('');
                          setEventSortOrder('desc');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c084fc',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}

                  {loadingAuditLogsForEvents && unifiedEvents.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div 
                          key={`event-shimmer-${idx}`}
                          style={{
                            height: '66px',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.04)',
                            animation: 'pulse-shimmer 1.5s infinite ease-in-out'
                          }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ width: '150px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                            <div style={{ width: '320px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.02)', animation: 'pulse-shimmer 1.5s infinite ease-in-out' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    sortedEvents.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--glass-border)', borderRadius: '10px' }}>
                        <p>No events found matching the search or selected filters.</p>
                      </div>
                    ) : eventGroupingMode === 'none' ? (
                      <div style={{ position: 'relative', padding: '10px 0 20px 0' }}>
                        <div style={{
                          position: 'absolute',
                          left: '23px',
                          top: '10px',
                          bottom: '10px',
                          width: '2px',
                          background: 'linear-gradient(to bottom, var(--accent-purple), var(--accent-blue), transparent)',
                          opacity: 0.8
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '50px' }}>
                          {sortedEvents.map(event => renderEventCard(event, true))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', padding: '10px 0 20px 0' }}>
                        <div style={{
                          position: 'absolute',
                          left: '23px',
                          top: '10px',
                          bottom: '10px',
                          width: '2px',
                          background: 'linear-gradient(to bottom, var(--accent-purple), var(--accent-blue), transparent)',
                          opacity: 0.8
                        }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {sortedL1Keys.map((l1Key) => {
                            const nestedGroup = groupedEvents[l1Key] || {};
                            const isL1Expanded = expandedEventGroups[l1Key] === true;
                            const totalL1Count = Object.values(nestedGroup).reduce((acc, items) => acc + items.length, 0);

                            const sortedL2Keys = Object.keys(nestedGroup).sort((a, b) => {
                              if (eventGroupingMode === 'date') {
                                return eventSortOrder === 'desc' ? a.localeCompare(b) : b.localeCompare(a);
                              } else {
                                const timeA = nestedGroup[a]?.[0] ? new Date(nestedGroup[a][0].timestamp).getTime() : 0;
                                const timeB = nestedGroup[b]?.[0] ? new Date(nestedGroup[b][0].timestamp).getTime() : 0;
                                return eventSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                              }
                            });

                            return (
                              <div key={l1Key} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div
                                  onClick={() => setExpandedEventGroups(prev => ({ ...prev, [l1Key]: !prev[l1Key] }))}
                                  className="event-accordion-header"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 14px',
                                    marginLeft: '50px',
                                    background: 'rgba(255,255,255,0.015)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    userSelect: 'none'
                                  }}
                                >
                                  <div style={{
                                    position: 'absolute',
                                    left: '-34px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-primary)',
                                    border: '3px solid var(--accent-purple)',
                                    zIndex: 2,
                                    boxShadow: '0 0 6px var(--accent-purple-glow)'
                                  }} />

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isL1Expanded ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />}
                                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                                      {l1Key}
                                    </span>
                                    <span style={{
                                      fontSize: '0.64rem',
                                      backgroundColor: 'rgba(255,255,255,0.03)',
                                      color: 'var(--text-secondary)',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      border: '1px solid var(--glass-border)'
                                    }}>
                                      {totalL1Count}
                                    </span>
                                  </div>
                                </div>

                                {isL1Expanded && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {sortedL2Keys.map((l2Key) => {
                                      const l2Items = nestedGroup[l2Key] || [];
                                      const l2GroupKey = l1Key + '_' + l2Key;
                                      const isL2Expanded = expandedEventGroups[l2GroupKey] === true;

                                      return (
                                        <div key={l2GroupKey} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                          <div
                                            onClick={() => setExpandedEventGroups(prev => ({ ...prev, [l2GroupKey]: !prev[l2GroupKey] }))}
                                            className="event-accordion-header"
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              padding: '6px 12px',
                                              marginLeft: '74px',
                                              background: 'rgba(255,255,255,0.01)',
                                              border: '1px solid var(--glass-border)',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              position: 'relative',
                                              userSelect: 'none',
                                              fontSize: '0.74rem'
                                            }}
                                          >
                                            <div style={{
                                              position: 'absolute',
                                              left: '-57px',
                                              top: '50%',
                                              transform: 'translateY(-50%)',
                                              width: '8px',
                                              height: '8px',
                                              borderRadius: '50%',
                                              background: 'var(--bg-primary)',
                                              border: '2px solid var(--accent-blue)',
                                              zIndex: 2,
                                              boxShadow: '0 0 4px var(--accent-blue-glow)'
                                            }} />

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              {isL2Expanded ? <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-secondary)' }} />}
                                              <span style={{ fontWeight: 650, color: 'var(--text-secondary)' }}>
                                                {l2Key}
                                              </span>
                                              <span style={{
                                                fontSize: '0.66rem',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                color: 'var(--text-muted)',
                                                padding: '0.5px 4px',
                                                borderRadius: '3px',
                                                border: '1px solid var(--glass-border)'
                                              }}>
                                                {l2Items.length}
                                              </span>
                                            </div>
                                          </div>

                                          {isL2Expanded && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '98px' }}>
                                              {l2Items.map(event => renderEventCard(event, false))}
                                            </div>
                                          )}
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
                    )
                  )}
                </div>
              )}
              
              {/* General Empty State if absolutely no logs */}
              {unifiedEvents.length === 0 && !loadingAuditLogsForEvents && (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Activity size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                  <h3>No system events recorded yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Trigger active cloud scans, credentials checks, or VM power controls to populate the events feed.
                  </p>
                </div>
              )}
            </div>
          </div>
          );
        })()}

      </main>

      <Footer theme={theme} />

      {activeLogsAppName && (
        <LogDrawer
          appName={activeLogsAppName}
          onClose={() => setActiveLogsAppName(null)}
          API_BASE={API_BASE}
          theme={theme}
        />
      )}

      {buildHistoryDrawerApp && (
        <BuildHistoryDrawer
          isOpen={!!buildHistoryDrawerApp}
          appName={buildHistoryDrawerApp.name}
          pipelineId={buildHistoryDrawerApp.pipelineId || null}
          appType={buildHistoryDrawerApp.type}
          organizationId={organizationId}
          currentUser={user}
          theme={theme}
          API_BASE={API_BASE}
          onClose={() => setBuildHistoryDrawerApp(null)}
          onReDeployQueued={(newBuildId) => {
            showToast('Deployment Queued', `Successfully queued new build run #${newBuildId}`, 'success');
            handleScan();
          }}
        />
      )}
    </>
  )}

      {/* Embedded Animation CSS rules */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
        @keyframes fade-in-anim {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Confirmation Modal Overlay */}
      <ConfirmationModal
        isOpen={!!confirmDialog}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        type={confirmDialog?.type || 'info'}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onClose={() => setConfirmDialog(null)}
      />

      {/* Notification Details Modal Overlay */}
      <NotificationDetailModal
        isOpen={selectedDetailNotification !== null}
        notification={selectedDetailNotification}
        onClose={() => setSelectedDetailNotification(null)}
        onNavigate={handleNavigateFromModal}
      />

      {/* Clone Environment Modal Overlay */}
      {cloningApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--modal-shadow)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitBranch size={20} style={{ color: 'var(--success)' }} />
                Clone App Environment
              </h3>
              <button 
                onClick={() => setCloningApp(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Helper Text */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Clone the environment configurations, scale properties, and metadata of <strong style={{ color: 'var(--text-primary)' }}>{cloningApp.name}</strong> to a new environment target.
            </p>

            <form onSubmit={handleCloneEnvironment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Target Env */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Target Environment Tier
                </label>
                <select
                  value={cloneTargetEnv}
                  onChange={(e: any) => setCloneTargetEnv(e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.86rem',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    padding: '0 10px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="qa">QA (Quality Assurance)</option>
                  <option value="prod">Production</option>
                  <option value="sandbox">Sandbox / Staging</option>
                </select>
              </div>

              {/* Feedback messages */}
              {cloneFeedback && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${cloneFeedback.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                  background: cloneFeedback.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  color: cloneFeedback.type === 'success' ? 'var(--success)' : 'var(--error)',
                  fontSize: '0.78rem'
                }}>
                  {cloneFeedback.text}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setCloningApp(null)}
                  style={{ height: '36px', padding: '0 16px', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isCloning}
                  style={{ height: '36px', padding: '0 20px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isCloning && <RefreshCw size={14} className="spin-anim" />}
                  {isCloning ? 'Cloning Config...' : 'Clone Config'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DNS Binding Modal Overlay */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--modal-shadow)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} style={{ color: 'var(--accent-purple)' }} />
                Bind Custom Domain
              </h3>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Helper Text */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Add a custom subdomain CNAME mapping. This will automatically update records via GoDaddy API and link the domain to your active Azure resource.
            </p>

            <form onSubmit={handleBindDomainSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Target App */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Target Application
                </label>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.86rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}>
                  {selectedApp.name}
                </div>
              </div>

              {/* Hostname Info */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Azure App Hostname
                </label>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace'
                }}>
                  {selectedApp.hostname}
                </div>
              </div>

              {/* Subdomain Input & Domain Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Custom Domain Mapping
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dev-api"
                    value={subdomainInput}
                    onChange={(e) => setSubdomainInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>.</span>
                  <input
                    type="text"
                    required
                    placeholder="domain.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    style={{
                      flex: 1.2,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
                  Mapped FQDN: <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{subdomainInput ? `${subdomainInput}.${domainInput}` : `[subdomain].${domainInput}`}</span>
                </div>
              </div>

              {/* Alerts */}
              {bindError && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--error)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{bindError}</span>
                </div>
              )}

              {bindSuccess && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--success)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{bindSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedApp(null)}
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={binding || user?.role === 'viewer'}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    padding: '10px 24px',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px var(--accent-blue-glow)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {binding ? (
                    <>
                      <RefreshCw size={14} className="spin-anim" />
                      Binding DNS...
                    </>
                  ) : (
                    'Link Custom Domain'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pipeline Setup Modal Overlay */}
      {pipelineApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--modal-shadow)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitBranch size={20} style={{ color: 'var(--accent-purple)' }} />
                Setup CI/CD Pipeline - Step {pipelineWizardStep} of 3
              </h3>
              <button 
                onClick={() => setPipelineApp(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  style={{ 
                    flex: 1, 
                    height: '4px', 
                    borderRadius: '2px', 
                    background: pipelineWizardStep >= step 
                      ? 'linear-gradient(90deg, var(--accent-purple), var(--accent-blue))' 
                      : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }} 
                />
              ))}
            </div>

            {/* Step 1: Configure Settings */}
            {pipelineWizardStep === 1 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setPipelineWizardStep(2);
                if (githubRepo) {
                  loadYmlForPipelineModal(githubRepo, pipelineBranch);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Target Application
                  </label>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}>
                    {pipelineApp.name} ({pipelineApp.type === 'frontend' ? 'Static Web App' : 'Container App'})
                  </div>
                </div>

                {/* GitHub Repo */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    GitHub Repository
                  </label>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}>
                    {githubRepo || 'N/A'}
                  </div>
                </div>

                {/* Git Branch */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Target Branch
                  </label>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}>
                    {pipelineBranch || 'N/A'}
                  </div>
                </div>

                {/* DevOps Settings */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      DevOps Org URL
                    </label>
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '0.86rem',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {devopsOrgUrl}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      DevOps Project
                    </label>
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '0.86rem',
                      color: 'var(--text-primary)',
                      fontWeight: 500
                    }}>
                      {devopsProject}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setPipelineApp(null)}
                    style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      padding: '10px 24px',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px var(--accent-blue-glow)',
                      cursor: 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: YAML Editor */}
            {pipelineWizardStep === 2 && (
              <form onSubmit={handleCreatePipelineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    azure-pipelines.yml Configuration
                  </label>
                  {pipelineModalYmlLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
                      <RefreshCw className="spin-anim" size={24} style={{ color: 'var(--accent-purple)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading YML configuration template...</span>
                    </div>
                  ) : (
                    <>
                      <textarea
                        rows={12}
                        value={pipelineModalYmlContent}
                        onChange={(e) => setPipelineModalYmlContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                          lineHeight: '1.4',
                          outline: 'none',
                          boxSizing: 'border-box',
                          resize: 'vertical'
                        }}
                      />
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={12} style={{ color: 'var(--accent-blue)' }} />
                        <span>
                          {pipelineModalYmlSource === 'github' 
                            ? 'Loaded existing YAML file found on GitHub.' 
                            : 'Generated default YAML deployment template.'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {pipelineError && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--error)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{pipelineError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setPipelineWizardStep(1)}
                    style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPipeline || pipelineModalYmlLoading || user?.role === 'viewer'}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      padding: '10px 24px',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px var(--accent-blue-glow)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {creatingPipeline ? (
                      <>
                        <RefreshCw size={14} className="spin-anim" />
                        Creating Pipeline...
                      </>
                    ) : (
                      'Commit & Create Pipeline'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {pipelineWizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--success)',
                  fontSize: '0.86rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>CI/CD Pipeline Setup Complete!</span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    The `azure-pipelines.yml` file has been committed to branch `{pipelineBranch}` of `{githubRepo}`, and the build pipeline is fully configured in Azure DevOps.
                  </p>
                </div>

                {pipelineSuccess && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    {pipelineSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setPipelineApp(null)}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      padding: '10px 24px',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px var(--accent-blue-glow)',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Toast Alerts Stack */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const typeColors = {
            success: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
            error: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
            warning: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
            info: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' }
          };
          const colors = typeColors[toast.type] || typeColors.info;
          
          return (
            <div
              key={toast.id}
              className="glass-panel"
              style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}40`,
                borderLeft: `4px solid ${colors.border}`,
                boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 12px ${colors.glow}15`,
                pointerEvents: 'auto',
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                position: 'relative'
              }}
            >
              <div style={{ color: colors.text, display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                {toast.type === 'success' && <CheckCircle2 size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'warning' && <AlertTriangle size={18} />}
                {toast.type === 'info' && <Info size={18} />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>
                  {toast.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginTop: '-4px',
                  marginRight: '-4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      </div>
    </div>
  );
}

export default App;
