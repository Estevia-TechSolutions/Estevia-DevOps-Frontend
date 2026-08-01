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
  Download,
  Crown,
  Lock,
  Cloud,
  Mail,
  Smartphone,
  Zap
} from 'lucide-react';
import './App.css';

// Import modular frontend components and pages
import { ConfirmationModal } from './components/ConfirmationModal';
import { SiteHeader, ControlBanner } from './components/DevOpsHeader';
import { BuildHistoryDrawer } from './components/BuildHistoryDrawer';
import { EsteviaLoginBadge } from './components/shared/EsteviaLoginBadge';
import { PWAUpdateManager } from './components/shared/PWAUpdateManager';
import { EmailTemplatesPage } from './pages/EmailTemplatesPage';
import { AppStartLoader } from './components/shared/AppStartLoader';
import { PipelinesPage } from './pages/PipelinesPage';
import { PipelineCreatorDrawer } from './components/pipelines/PipelineCreatorDrawer';
import { PipelineRunDetailsView } from './components/pipelines/PipelineRunDetailsView';

// Dynamic environment branding suffix
const getEnvSuffix = (): string => {
  const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  if (host.includes('dev-') || host.includes('-dev') || host.startsWith('dev.')) {
    return ' (Dev)';
  }
  if (host.includes('qa-') || host.includes('-qa') || host.startsWith('qa.')) {
    return ' (QA)';
  }
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('local.')) {
    return ' (Local)';
  }

  const env = (import.meta.env.VITE_APP_ENV || '').toLowerCase();
  if (env === 'local') return ' (Local)';
  if (env === 'dev' || env === 'development') return ' (Dev)';
  if (env === 'qa') return ' (QA)';
  return ''; // Production
};

// Formats issuer to guarantee environment name suffix (stripping legacy suffix first)
const formatIssuerWithEnv = (issuerName: string, defaultFallback: string): string => {
  const baseName = issuerName || defaultFallback;
  const cleanedName = baseName.replace(/\s*\((dev|qa|local|production)\)/i, '').trim();
  const suffix = getEnvSuffix();
  return `${cleanedName}${suffix}`;
};

// 📱 Authenticator App Account Preview Card (Combined Unified Card)
function AuthenticatorPreviewCard({ issuer, account }: { issuer: string; account: string }) {
  const displayIssuer = formatIssuerWithEnv(issuer, 'EvaOps');
  return (
    <div style={{
      background: 'var(--bg-slate)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes preview-svg-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Top Combined Header Strip — EvaOps Purple Theme */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'rgba(124,58,237,0.10)',
        borderBottom: '1px solid rgba(124,58,237,0.2)',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#7c3aed', flexShrink: 0
        }}>
          <ShieldCheck size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Two-Factor Authentication
          </div>
          <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#a78bfa', marginTop: '1px' }}>
            Open your authenticator app & find this entry:
          </div>
        </div>
      </div>

      {/* Card Body — Account Details */}
      <div style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Lock Icon Box — DevOps purple gradient */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(109,40,217,0.12) 100%)',
          border: '1px solid rgba(124,58,237,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(124,58,237,0.15)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="12" rx="2" stroke="#7c3aed" strokeWidth="2" fill="rgba(124,58,237,0.15)" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1.5" fill="#7c3aed" />
          </svg>
        </div>

        {/* Text stack */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{
            fontWeight: 800, color: 'var(--text-primary, #0f172a)',
            fontSize: '0.85rem', letterSpacing: '-0.01em', lineHeight: 1.25,
            wordBreak: 'break-word',
          }}>
            {displayIssuer}
          </div>
          <div style={{
            color: 'var(--text-secondary, #64748b)', fontSize: '0.73rem',
            fontWeight: 500, lineHeight: 1.25,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {account || 'user@esteviatech.com'}
          </div>
        </div>

        {/* Arc timer panel */}
        <div style={{
          background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '10px', padding: '6px 9px', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 28 28" style={{
            animation: 'preview-svg-spin 10s linear infinite',
            transformOrigin: 'center'
          }}>
            <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="2.5" />
            <circle cx="14" cy="14" r="11" fill="none" stroke="#7c3aed" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray="51.84 69.12"
              transform="rotate(-90 14 14)" />
          </svg>
          <div style={{
            color: '#a78bfa', fontWeight: 800, fontSize: '0.75rem',
            letterSpacing: '0.06em', fontFamily: 'monospace', lineHeight: 1,
          }}>
            ••• •••
          </div>
        </div>
      </div>
    </div>
  );
}
import { NotificationDrawer } from './components/NotificationDrawer';
import type { AppNotification } from './components/NotificationDrawer';
import { NotificationDetailModal } from './components/NotificationDetailModal';
import { SettingsPage } from './pages/SettingsPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { DatabaseCatalogPage } from './pages/DatabaseCatalogPage';
import { DashboardPage } from './pages/DashboardPage';
import { CostPage } from './pages/CostPage';
import { ProvisionWizard, DockerfileEditorStep } from './pages/ProvisionWizard';
import { GuidePage } from './pages/GuidePage';
import { TeamPage } from './pages/TeamPage';
import type { UserRecord } from './pages/TeamPage';
import { LogDrawer } from './components/observability/LogDrawer';
import { PrometheusObservabilityView } from './components/observability/PrometheusObservabilityView';
import { IncidentsAlertsView } from './components/observability/IncidentsAlertsView';
import { AuditLogsTable } from './components/team/AuditLogsTable';
import { isFixable, applyAutoFix } from './utils/autoFixEngine';
import { runWithConcurrency } from './utils/concurrency';
import { DiffViewer } from './components/DiffViewer';
import { Footer } from './components/layout/Footer';
import { CrmPortal } from './pages/CrmPortal';

const Github = ({ size = 24, ...props }: { size?: number;[key: string]: any }) => (
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

const _hostname = window.location.hostname;
const _apiBaseFromEnv = import.meta.env.VITE_API_BASE as string | undefined;
// When on production or CRM subdomain, always point to HTTPS backend
const API_BASE = _apiBaseFromEnv
  || (['evaops.esteviatech.com', 'evaops-crm.esteviatech.com'].includes(_hostname)
    ? 'https://api-evaops.esteviatech.com/api'
    : `http://${_hostname}:5005/api`);

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
  type: 'frontend' | 'backend' | 'vm' | 'cluster' | 'database' | 'network' | 'registry' | string;
  location: string;
  hostname: string;
  resourceId: string;
  status: string;
  repositoryUrl: string;
  license_frozen?: number;
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

export const hasEnvSegment = (n: string, seg: string) =>
  new RegExp(`-${seg}(-|$)`).test(n);

export const branchToEnv = (branch: string): 'dev' | 'qa' | 'prod' | null => {
  const b = branch.toLowerCase().trim();
  if (b === 'main' || b === 'master' || b === 'prod' || b === 'production' || b === 'release') return 'prod';
  if (b === 'dev' || b === 'develop' || b === 'development') return 'dev';
  if (b === 'qa' || b === 'staging' || b === 'test' || b === 'testing') return 'qa';
  return null;
};

export const resolveBranchName = (app: AppResource) => {
  if (app.branch) {
    const fromBranch = branchToEnv(app.branch);
    if (fromBranch) {
      const candidates = {
        dev: ['dev', 'development', 'dev-main', 'dev-master'],
        qa: ['qa', 'test', 'testing', 'staging'],
        prod: ['main', 'master', 'prod', 'production', 'release']
      };
      const candidateList = candidates[fromBranch];
      const availableBranches = app.branches || [];
      const matched = availableBranches.find(b => candidateList.includes(b.name.toLowerCase()));
      return matched?.name || app.branch;
    }
  }

  const n = app.name.toLowerCase();

  let envType: 'dev' | 'qa' | 'prod' = 'prod';
  if (hasEnvSegment(n, 'dev') || hasEnvSegment(n, 'development')) envType = 'dev';
  else if (hasEnvSegment(n, 'qa') || hasEnvSegment(n, 'staging') || hasEnvSegment(n, 'test') || hasEnvSegment(n, 'testing')) envType = 'qa';

  const candidates = {
    dev: ['dev', 'development', 'dev-main', 'dev-master'],
    qa: ['qa', 'test', 'testing', 'staging'],
    prod: ['main', 'master', 'prod', 'production', 'release']
  };

  const candidateList = candidates[envType];
  const availableBranches = app.branches || [];

  const matchedCandidate = candidateList.find((cand: string) =>
    availableBranches.some(b => b.name.toLowerCase() === cand)
  );

  if (matchedCandidate) {
    return availableBranches.find(b => b.name.toLowerCase() === matchedCandidate)!.name;
  }

  const defaultBranch = availableBranches.find(b => (b as any).default || (b as any).isDefault || b.protected);
  return defaultBranch ? defaultBranch.name : candidateList[0];
};

interface AppGroup {
  key: string;
  label: string;          // prettified display name (e.g. "ProTrack Frontend")
  repoPath: string;       // e.g. "Estevia-TechSolutions/protrack-frontend"
  repoUrl: string;        // full github url
  type: 'frontend' | 'backend' | 'vm' | 'cluster' | 'database' | 'network' | 'registry' | string;
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
      // Group by canonical repo path (lowercased for stable key, stripping optional org prefix from repo segment)
      const rawPath = app.repositoryUrl
        .replace('https://github.com/', '')
        .replace(/\/$/, '')
        .toLowerCase();
      const parts = rawPath.split('/');
      const org = parts[0] || '';
      const orgPrefix = org.replace('-techsolutions', '').replace('-solutions', '').split('-')[0];
      const repo = (parts[1] || '').replace(new RegExp(`^${orgPrefix}-`), '');
      key = `${org}/${repo}`;
      repoPath = rawPath;
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
  // Authentication states (moved to top for lexical scoping / shadow resolution)
  const [token, setToken] = useState<string | null>(localStorage.getItem('devops_token'));
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('devops_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e: any) {
      return null;
    }
  });
  const [pageBootLoading, setPageBootLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [ssoLoadingProvider, setSsoLoadingProvider] = useState<'microsoft' | 'google' | null>(null);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageBootLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
      console.warn('[authFetch] Unauthorized session. Logging out and clearing all session data.');
      ['devops_token', 'devops_user', 'devops_requires_onboarding', 'devops_organization_id',
        'devops_organization_name', 'evaops_events', 'evaops_notifications',
        'selectedControlResourceGroup', 'token', 'authToken', 'jwt', 'organizationId']
        .forEach(key => localStorage.removeItem(key));
      setToken(null);
      setUser(null);
    }

    return res;
  };

  const fetch = authFetch;

  const [activeTab, setActiveTab] = useState<'scan' | 'provision' | 'credentials' | 'cost' | 'optimization' | 'databases' | 'guide' | 'users' | 'events' | 'emails' | 'settings'>('scan');
  const [scanSubTab, setScanSubTab] = useState<'discovery' | 'compliance' | 'observability' | 'incidents'>('discovery');
  const [userMenuPermissions, setUserMenuPermissions] = useState<Record<string, boolean>>({});
  const [organizationId, setOrganizationId] = useState<string>(() => {
    return localStorage.getItem('devops_organization_id') || new URLSearchParams(window.location.search).get('org') || 'estevia';
  });

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

  // Multi-Mode MFA state variables
  const [mfaActiveMode, setMfaActiveMode] = useState<'totp' | 'email' | 'backup'>('totp');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [backupCodesList, setBackupCodesList] = useState<string[] | null>(null);

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
  const scanningRef = useRef(false);
  const buildsScanningRef = useRef(false);

  // Scanned Apps State
  const [apps, setApps] = useState<AppResource[]>([]);
  const [livePipelineRuns, setLivePipelineRuns] = useState<Record<number | string, any>>({});
  const activeBuildsCount = useMemo(() => {
    return apps.filter(app => {
      const runId = app.pipelineRun?.id;
      const pidKey = app.pipelineId ? `pid-${app.pipelineId}-${resolveBranchName(app)}` : null;
      const liveRun =
        (pidKey && livePipelineRuns[pidKey]) ||
        (runId && livePipelineRuns[runId]) ||
        app.pipelineRun;
      if (!liveRun || !liveRun.state) return false;
      const s = liveRun.state.toLowerCase();
      return s === 'inprogress' || s === 'running' || s === 'canceling' || s === 'cancelling' || s === 'notstarted' || s === 'queued';
    }).length;
  }, [apps, livePipelineRuns]);

  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  const getScanProgressMessage = (progress: number) => {
    if (progress < 40) return "Querying Azure resource groups...";
    if (progress < 75) return "Discovering Container Apps & Static Web Apps...";
    if (progress < 90) return "Syncing databases, virtual machines, and GoDaddy DNS...";
    if (progress < 96) return "Fetching pipeline build runs from GitHub and Azure DevOps...";
    return "Waiting for cloud providers to respond... (Almost finished)";
  };

  // Control Centre Resource Groups States
  const [controlResourceGroups, setControlResourceGroups] = useState<string[]>([]);
  const [selectedControlResourceGroup, setSelectedControlResourceGroup] = useState<string>(() => {
    return localStorage.getItem('selectedControlResourceGroup') || '';
  });
  const [primaryResourceGroup, setPrimaryResourceGroup] = useState<string>('');
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>(() => {
    return localStorage.getItem('selectedControlSubscriptionId') || '';
  });
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState<boolean>(false);
  const scopeDropdownRef = useRef<HTMLDivElement>(null);

  const currentSub = useMemo(() => {
    if (!selectedSubscriptionId) return null;
    return subscriptionsList.find(sub => (sub.id || '').toLowerCase() === selectedSubscriptionId.toLowerCase());
  }, [subscriptionsList, selectedSubscriptionId]);

  const isCurrentSubscriptionInactive = useMemo(() => {
    if (!currentSub) return false;
    const statusLow = (currentSub.status || currentSub.state || '').toLowerCase();
    const isExplicitRestricted = currentSub.isRestricted === true || currentSub.is_restricted === true || currentSub.restricted === true;
    return isExplicitRestricted || statusLow === 'restricted' || statusLow === 'disabled' || statusLow === 'inactive' || statusLow === 'read-only' || statusLow === 'warned' || statusLow === 'pastdue';
  }, [currentSub]);

  const renderInactiveSubscriptionWarning = () => {
    if (!isCurrentSubscriptionInactive) return null;
    const subName = currentSub?.displayName || selectedSubscriptionId;
    const status = currentSub?.status || 'restricted';

    return (
      <div className="glass-panel" style={{
        margin: '0 0 20px 0',
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.06) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 4px 30px rgba(239, 68, 68, 0.12)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          flexShrink: 0
        }}>
          <AlertTriangle size={20} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#ef4444', fontSize: '0.88rem', fontWeight: 700 }}>
            ⛔ Restricted Azure Subscription Selected
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
            The subscription <strong style={{ color: '#ef4444' }}>{subName}</strong> is currently flagged as <strong style={{ color: '#ef4444', textTransform: 'uppercase' }}>{status}</strong>. Cloud Scan, Cost Management, and Resource Provisioning are read-only or restricted.
          </p>
        </div>
      </div>
    );
  };

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
  const [domainInput, setDomainInput] = useState(import.meta.env.VITE_DEFAULT_DOMAIN || '');
  const [binding, setBinding] = useState(false);
  const [bindSuccess, setBindSuccess] = useState<string | null>(null);
  const [bindError, setBindError] = useState<string | null>(null);

  // Pipeline Modal & Drawer States
  const [showPipelineCreatorDrawer, setShowPipelineCreatorDrawer] = useState<boolean>(false);
  const [selectedRunIdForDetails, setSelectedRunIdForDetails] = useState<string | null>(null);
  const [selectedRunBranchForDetails, setSelectedRunBranchForDetails] = useState<string>('main');
  const [selectedRunProviderForDetails, setSelectedRunProviderForDetails] = useState<string>('azure_devops');
  const [showRunDetailsView, setShowRunDetailsView] = useState<boolean>(false);
  const [provisionViewMode, setProvisionViewMode] = useState<'pipelines' | 'wizard'>('pipelines');

  const [pipelineApp, setPipelineApp] = useState<AppResource | null>(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [pipelineProvider, setPipelineProvider] = useState<'evaops_native' | 'azure_devops' | 'github_actions'>('evaops_native');
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
  const [pipelineModalYmlOriginal, setPipelineModalYmlOriginal] = useState('');
  const [pipelineModalYmlLoading, setPipelineModalYmlLoading] = useState(false);
  const [pipelineModalYmlSource, setPipelineModalYmlSource] = useState<'github' | 'template' | null>(null);
  const [ymlViewMode, setYmlViewMode] = useState<'editor' | 'diff'>('editor');
  const [pipelineWizardStep, setPipelineWizardStep] = useState(1);
  const [pipelineYmlValidation, setPipelineYmlValidation] = useState<any>(null);
  const [pipelineYmlValidating, setPipelineYmlValidating] = useState(false);

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
  const [dbAdminUsername, setDbAdminUsername] = useState('admin');
  const [dbAdminPassword, setDbAdminPassword] = useState('');
  const [virtualNetworks, setVirtualNetworks] = useState<any[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [ymlContent, setYmlContent] = useState<string>('');
  const [ymlOriginal, setYmlOriginal] = useState<string>('');
  const [ymlLoading, setYmlLoading] = useState(false);
  const [ymlError, setYmlError] = useState<string | null>(null);
  const [ymlSource, setYmlSource] = useState<'github' | 'template' | null>(null);
  const [targetPort, setTargetPort] = useState('5005');
  const [provisionYmlValidation, setProvisionYmlValidation] = useState<any>(null);
  const [provisionYmlValidating, setProvisionYmlValidating] = useState(false);

  // Scanner Custom YML Editor States
  const [scannerYmlContent, setScannerYmlContent] = useState('');
  const [scannerYmlLoading, setScannerYmlLoading] = useState(false);
  const [scannerYmlSource, setScannerYmlSource] = useState<'github' | 'template' | null>(null);
  const [scannerYmlValidation, setScannerYmlValidation] = useState<any>(null);
  const [scannerYmlValidating, setScannerYmlValidating] = useState(false);

  // Cloud Scanning YAML Health Map (keyed by group.key)
  const [ymlHealthMap, setYmlHealthMap] = useState<Record<string, any>>({});
  const [ymlHealthLoading, setYmlHealthLoading] = useState<Record<string, boolean>>({});
  const [dockerfileEditApp, setDockerfileEditApp] = useState<AppResource | null>(null);

  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<{ name: string; protected: boolean }[]>([]);
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
  const [azureClientId, setAzureClientId] = useState('');
  const [azureClientSecret, setAzureClientSecret] = useState('');
  const [azureTenantId, setAzureTenantId] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showGodaddyKey, setShowGodaddyKey] = useState(false);
  const [showGodaddySecret, setShowGodaddySecret] = useState(false);
  const [showDevopsPat, setShowDevopsPat] = useState(false);
  const [showAzureClientId, setShowAzureClientId] = useState(false);
  const [showAzureClientSecret, setShowAzureClientSecret] = useState(false);
  const [showAzureTenantId, setShowAzureTenantId] = useState(false);
  const [decryptedGithubToken, setDecryptedGithubToken] = useState('');
  const [decryptedGodaddyKey, setDecryptedGodaddyKey] = useState('');
  const [decryptedGodaddySecret, setDecryptedGodaddySecret] = useState('');
  const [decryptedDevopsPat, setDecryptedDevopsPat] = useState('');
  const [decryptedAzureClientId, setDecryptedAzureClientId] = useState('');
  const [decryptedAzureClientSecret, setDecryptedAzureClientSecret] = useState('');
  const [decryptedAzureTenantId, setDecryptedAzureTenantId] = useState('');
  const [credentialStatus, setCredentialStatus] = useState<Record<string, boolean>>({});
  const [savingCredentials, setSavingCredentials] = useState<string | null>(null);
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingAppName, setDeletingAppName] = useState<string | null>(null);

  // Credentials connection health validation states
  const [testingCredential, setTestingCredential] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleValidateCredential = async (provider: 'github' | 'godaddy' | 'azure_devops' | 'azure') => {
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
    const saved = localStorage.getItem('theme') || localStorage.getItem('devops_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
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
    // isCollapsed = value !== false (undefined → true, false → false, true → true)
    // So to toggle: we flip the isCollapsed result → set to !(current !== false)
    setCollapsedScanGroups(prev => ({ ...prev, [key]: !(prev[key] !== false) }));
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
  const [orgName, setOrgName] = useState<string>(() => {
    return localStorage.getItem('devops_organization_name') || '';
  });
  const [azureSubscriptionId, setAzureSubscriptionId] = useState('');
  const [azureResourceGroup, setAzureResourceGroup] = useState('');
  const [defaultDnsDomain, setDefaultDnsDomain] = useState('');
  const [azureDevopsOrgUrl, setAzureDevopsOrgUrl] = useState('');
  const [azureDevopsProject, setAzureDevopsProject] = useState('');
  const [pipelineVariableGroup, setPipelineVariableGroup] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  // New Organization Settings State Columns
  const [azureContainerRegistry, setAzureContainerRegistry] = useState('');
  const [azureDevopsServiceConnection, setAzureDevopsServiceConnection] = useState('');
  const [dockerRegistryServiceConnection, setDockerRegistryServiceConnection] = useState('');

  // Microsoft Teams Webhook & Observability Settings
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('');
  const [teamsWebhookToken, setTeamsWebhookToken] = useState('');
  const [logAnalyticsWorkspaceId, setLogAnalyticsWorkspaceId] = useState('');
  const [prodLogAnalyticsWorkspaceId, setProdLogAnalyticsWorkspaceId] = useState('');
  const [azureKeyVaultUrl, setAzureKeyVaultUrl] = useState('');
  const [devDbHost, setDevDbHost] = useState('');
  const [qaDbHost, setQaDbHost] = useState('');
  const [prodDbHost, setProdDbHost] = useState('');
  const [devManagedEnvId, setDevManagedEnvId] = useState('');
  const [prodManagedEnvId, setProdManagedEnvId] = useState('');
  const [discoveringInfra, setDiscoveringInfra] = useState(false);

  // MFA States
  const [manualMfaRequired, setManualMfaRequired] = useState<boolean>(false);
  const [ssoMfaRequired, setSsoMfaRequired] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<'login' | 'mfa-setup' | 'mfa-verify'>('login');
  const [mfaTempToken, setMfaTempToken] = useState<string>('');
  const [mfaSecret, setMfaSecret] = useState<string>('');
  const [mfaOtpauthUrl, setMfaOtpauthUrl] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaRegIssuer, setMfaRegIssuer] = useState<string>('');
  const [mfaRegName, setMfaRegName] = useState<string>('');
  // MFA wizard step (1 = get app, 2 = scan QR, 3 = verify)
  const [mfaSetupStep, setMfaSetupStep] = useState<1 | 2 | 3>(1);

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

  const [selectedProvisionSubscriptionId, setSelectedProvisionSubscriptionId] = useState(() => {
    return localStorage.getItem('selectedProvisionSubscriptionId') || localStorage.getItem('selectedControlSubscriptionId') || '';
  });

  useEffect(() => {
    if (selectedSubscriptionId) {
      setSelectedProvisionSubscriptionId(selectedSubscriptionId);
      localStorage.setItem('selectedProvisionSubscriptionId', selectedSubscriptionId);
      fetchProvisioningMetadata(selectedSubscriptionId);
    }
  }, [selectedSubscriptionId]);

  useEffect(() => {
    if (selectedControlResourceGroup) {
      setSelectedResourceGroup(selectedControlResourceGroup);
    }
  }, [selectedControlResourceGroup]);

  const fetchProvisioningMetadata = async (subId?: string) => {
    setLoadingMetadata(true);
    try {
      const activeSubId = subId || selectedProvisionSubscriptionId || selectedSubscriptionId;
      const res = await fetch(`${API_BASE}/apps/provisioning-metadata?organizationId=${organizationId}&subscriptionId=${activeSubId}`);
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
  const [dockerfileValidation, setDockerfileValidation] = useState<any>(null);
  const [dockerfileValidating, setDockerfileValidating] = useState(false);
  const [provisionErrorDetail, setProvisionErrorDetail] = useState<string | null>(null);

  // ─── Shared YAML + Dockerfile validator helper ───────────────────────────
  const validateYmlContent = useCallback(async (content: string, provider: string, setResult: (r: any) => void, setLoading: (b: boolean) => void) => {
    if (!content || !content.trim()) { setResult(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/apps/validate-yml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ymlContent: content, pipelineProvider: provider })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) { setResult(null); }
    finally { setLoading(false); }
  }, []);

  const validateDockerfileContent = useCallback(async (content: string, setResult: (r: any) => void, setLoading: (b: boolean) => void) => {
    if (!content || !content.trim()) { setResult(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/apps/validate-dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) { setResult(null); }
    finally { setLoading(false); }
  }, []);

  // Shared inline validation panel renderer with high contrast and intelligent Auto-Fix
  const renderValidationPanel = (
    result: any,
    isValidating: boolean,
    content?: string,
    onContentChange?: (val: string) => void,
    provider?: string
  ) => {
    if (isValidating) return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--accent-purple)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Validating...
      </div>
    );
    if (!result) return null;
    if (result.error || result.message === 'Validation failed.' || result.success === false) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.76rem', color: '#ef4444', fontWeight: 600 }}>
          <span>❌</span> Error: {result.error || result.message || 'Validation service error'}
        </div>
      );
    }
    const hasErrors = result.errors && result.errors.length > 0;
    const hasWarnings = result.warnings && result.warnings.length > 0;
    if (!hasErrors && !hasWarnings) return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>
        <span>✅</span> Looks good — no issues found
      </div>
    );

    const errorColor = theme === 'light' ? '#b91c1c' : '#f87171';
    const errorBg = theme === 'light' ? 'rgba(185, 28, 28, 0.03)' : 'rgba(239, 68, 68, 0.04)';
    const errorBorder = theme === 'light' ? 'rgba(185, 28, 28, 0.18)' : 'rgba(239, 68, 68, 0.25)';
    const errorHeaderBg = theme === 'light' ? 'rgba(185, 28, 28, 0.06)' : 'rgba(239, 68, 68, 0.08)';

    const warningColor = theme === 'light' ? '#b45309' : '#fbbf24';
    const warningBg = theme === 'light' ? 'rgba(180, 83, 9, 0.03)' : 'rgba(245, 158, 11, 0.04)';
    const warningBorder = theme === 'light' ? 'rgba(180, 83, 9, 0.18)' : 'rgba(245, 158, 11, 0.25)';
    const warningHeaderBg = theme === 'light' ? 'rgba(180, 83, 9, 0.06)' : 'rgba(245, 158, 11, 0.08)';

    const cardBorder = hasErrors ? errorBorder : warningBorder;
    const cardBg = hasErrors ? errorBg : warningBg;
    const headerBg = hasErrors ? errorHeaderBg : warningHeaderBg;
    const textColor = hasErrors ? errorColor : warningColor;
    const shadow = theme === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' : '0 4px 12px rgba(0,0,0,0.15)';

    return (
      <div style={{
        borderRadius: '8px',
        border: `1px solid ${cardBorder}`,
        borderLeft: `4px solid ${textColor}`,
        background: cardBg,
        boxShadow: shadow,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out'
      }}>
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${cardBorder}`, background: headerBg }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: textColor }}>
            {hasErrors ? `❌ ${result.errors.length} error${result.errors.length > 1 ? 's' : ''}` : ''}
            {hasErrors && hasWarnings ? ' · ' : ''}
            {hasWarnings ? `⚠ ${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}` : ''}
          </span>
        </div>
        <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {(result.errors || []).map((e: any, i: number) => {
            const isRuleFixable = isFixable(e.ruleId) && content && onContentChange;
            return (
              <div key={`err-${i}`} style={{ padding: '8px 12px', fontSize: '0.73rem', color: errorColor, display: 'flex', gap: '8px', alignItems: 'center', borderBottom: i === (result.errors.length - 1) && !hasWarnings ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ flexShrink: 0, fontWeight: 700 }}>❌</span>
                <div style={{ flex: 1 }}><span style={{ opacity: 0.65, fontSize: '0.66rem', fontWeight: 600 }}>{e.ruleId}{e.line ? ` · line ${e.line}` : ''} &nbsp;</span>{e.message}</div>
                {isRuleFixable && (
                  <button
                    type="button"
                    onClick={() => {
                      const fixed = applyAutoFix(content!, e.ruleId, e.message, e.line);
                      onContentChange!(fixed);
                    }}
                    style={{
                      marginLeft: '8px',
                      flexShrink: 0,
                      background: theme === 'light' ? 'rgba(185, 28, 28, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${theme === 'light' ? 'rgba(185, 28, 28, 0.25)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: errorColor,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(ev) => {
                      ev.currentTarget.style.transform = 'scale(1.03)';
                      ev.currentTarget.style.background = theme === 'light' ? 'rgba(185, 28, 28, 0.12)' : 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseOut={(ev) => {
                      ev.currentTarget.style.transform = 'scale(1)';
                      ev.currentTarget.style.background = theme === 'light' ? 'rgba(185, 28, 28, 0.08)' : 'rgba(239, 68, 68, 0.12)';
                    }}
                  >
                    🪄 Auto Fix
                  </button>
                )}
              </div>
            );
          })}
          {(result.warnings || []).map((w: any, i: number) => {
            const isRuleFixable = isFixable(w.ruleId) && content && onContentChange;
            return (
              <div key={`warn-${i}`} style={{ padding: '8px 12px', fontSize: '0.73rem', color: warningColor, display: 'flex', gap: '8px', alignItems: 'center', borderBottom: i === (result.warnings.length - 1) ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ flexShrink: 0, fontWeight: 700 }}>⚠</span>
                <div style={{ flex: 1 }}><span style={{ opacity: 0.65, fontSize: '0.66rem', fontWeight: 600 }}>{w.ruleId}{w.line ? ` · line ${w.line}` : ''} &nbsp;</span>{w.message}</div>
                {isRuleFixable && (
                  <button
                    type="button"
                    onClick={() => {
                      const fixed = applyAutoFix(content!, w.ruleId, w.message, w.line);
                      onContentChange!(fixed);
                    }}
                    style={{
                      marginLeft: '8px',
                      flexShrink: 0,
                      background: theme === 'light' ? 'rgba(180, 83, 9, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                      border: `1px solid ${theme === 'light' ? 'rgba(180, 83, 9, 0.25)' : 'rgba(245, 158, 11, 0.3)'}`,
                      color: warningColor,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(ev) => {
                      ev.currentTarget.style.transform = 'scale(1.03)';
                      ev.currentTarget.style.background = theme === 'light' ? 'rgba(180, 83, 9, 0.12)' : 'rgba(245, 158, 11, 0.2)';
                    }}
                    onMouseOut={(ev) => {
                      ev.currentTarget.style.transform = 'scale(1)';
                      ev.currentTarget.style.background = theme === 'light' ? 'rgba(180, 83, 9, 0.08)' : 'rgba(245, 158, 11, 0.12)';
                    }}
                  >
                    🪄 Auto Fix
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
        refreshHealthForRepo(repo);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to push Dockerfile.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error pushing Dockerfile.' };
    }
  };

  // ─── Debounced validation effects ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ymlContent) validateYmlContent(ymlContent, pipelineProvider, setProvisionYmlValidation, setProvisionYmlValidating);
    }, 600);
    return () => clearTimeout(timer);
  }, [ymlContent, pipelineProvider]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scannerYmlContent) validateYmlContent(scannerYmlContent, pipelineProvider, setScannerYmlValidation, setScannerYmlValidating);
    }, 600);
    return () => clearTimeout(timer);
  }, [scannerYmlContent, pipelineProvider]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pipelineModalYmlContent) validateYmlContent(pipelineModalYmlContent, pipelineProvider, setPipelineYmlValidation, setPipelineYmlValidating);
    }, 600);
    return () => clearTimeout(timer);
  }, [pipelineModalYmlContent, pipelineProvider]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dockerfileContent) validateDockerfileContent(dockerfileContent, setDockerfileValidation, setDockerfileValidating);
    }, 600);
    return () => clearTimeout(timer);
  }, [dockerfileContent]);

  // ─── Cloud Scanning YAML/Dockerfile Health Checks ─────────────────────────
  const fetchYmlHealthForGroups = useCallback(async (groups: any[]) => {
    // Filter groups first to only process valid repositories
    const validGroups = groups.filter(group => group.repoPath && group.type !== 'vm' && group.type !== 'network');
    if (validGroups.length === 0) return;

    // Set all valid groups to loading state
    validGroups.forEach(group => {
      setYmlHealthLoading(prev => ({ ...prev, [group.key]: true }));
    });

    const startTime = Date.now();

    await runWithConcurrency(
      validGroups,
      async (group, currentIndex) => {
        const branch = group.envs?.[0]?.branch || group.branches?.[0]?.name || 'main';
        const isBackend = group.type === 'backend';

        let timeoutId: any = null;
        try {
          // Stagger requests slightly to avoid hitting GitHub rate limits
          const expectedStartTime = startTime + currentIndex * 400;
          const delay = expectedStartTime - Date.now();
          if (delay > 0) {
            await new Promise(r => setTimeout(r, delay));
          }

          // Add AbortController to enforce a 60-second request timeout limit (starting after the stagger timer completes)
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 60000);

          const res = await fetch(
            `${API_BASE}/apps/yml-health?organizationId=${organizationId}` +
            `&githubRepo=${encodeURIComponent(group.repoPath)}` +
            `&branch=${encodeURIComponent(branch)}` +
            `&pipelineProvider=${pipelineProvider || 'azure_devops'}` +
            `&checkDockerfile=${isBackend}`,
            {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
              signal: controller.signal
            }
          );
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          let data: any;
          try {
            data = await res.json();
          } catch (jsonErr) {
            data = { success: false, message: `Server error (${res.status})` };
          }

          if (res.ok && data && data.success) {
            setYmlHealthMap(prev => ({ ...prev, [group.key]: data }));
          } else {
            setYmlHealthMap(prev => ({
              ...prev,
              [group.key]: { success: false, error: true, message: (data && data.message) || 'Failed to check health' }
            }));
          }
        } catch (e: any) {
          console.error(`Failed to fetch health check for group ${group.key}:`, e);
          const errorMsg = e.name === 'AbortError' ? 'Scan timed out' : (e.message || 'Connection failed');
          setYmlHealthMap(prev => ({
            ...prev,
            [group.key]: { success: false, error: true, message: errorMsg }
          }));
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          setYmlHealthLoading(prev => ({ ...prev, [group.key]: false }));
        }
      },
      2 // Limit concurrency to 2 to keep 4 browser connection slots open for other operations
    );
  }, [organizationId, pipelineProvider]);

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
        setDomainInput(defaultDnsDomain || import.meta.env.VITE_DEFAULT_DOMAIN || '');
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
        setDockerfileValidation(null);
        setProvisionYmlValidation(null);
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

  const [syncCountdown, setSyncCountdown] = useState<number>(1800);

  // Authentication wrapper and states moved to the top of App component for lexical scope resolution

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

  // ── License Enforcement States ────────────────────────────────────────────
  const [licenseTier, setLicenseTier] = useState<string>('growth');
  const [operatorSeatsLimit, setOperatorSeatsLimit] = useState<number>(10);
  const [currentWriteUsers, setCurrentWriteUsers] = useState<number>(0);
  const [downgradeComplianceDebt, setDowngradeComplianceDebt] = useState<object | null>(null);
  const [overSeatLimitWarning, setOverSeatLimitWarning] = useState<boolean>(false);
  const [downgradeImpactData, setDowngradeImpactData] = useState<any>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState<boolean>(false);
  const [downgradeConfirmInput, setDowngradeConfirmInput] = useState<string>('');
  const [pendingLicenseTier, setPendingLicenseTier] = useState<string | null>(null);
  // ── Credential Gate States ─────────────────────────────────────────────────
  const [requiresCredentialSetup, setRequiresCredentialSetup] = useState<boolean>(false);
  const [missingCredentials, setMissingCredentials] = useState<{
    azure: boolean; github: boolean; azureDevops: boolean; godaddy: boolean;
  }>({ azure: false, github: false, azureDevops: false, godaddy: false });
  const [credentialAlerts, setCredentialAlerts] = useState<any[]>([]);
  const [credentialsList, setCredentialsList] = useState<any[]>([]);
  // ── CRM Portal & Suspension Gate States ────────────────────────────────────
  const [showCrm, setShowCrm] = useState(() => window.location.hash === '#crm' || window.location.hostname === 'evaops-crm.esteviatech.com');
  const [isOrgDisabled, setIsOrgDisabled] = useState(false);
  const [isOrgRestricted, setIsOrgRestricted] = useState(false);
  const [isOrgGrace, setIsOrgGrace] = useState(false);
  const [maxOverdueDays, setMaxOverdueDays] = useState(0);
  const [billingCurrency, setBillingCurrency] = useState('USD');
  const [subPackageDevops, setSubPackageDevops] = useState(false);
  const [subPackageDeveloper, setSubPackageDeveloper] = useState(false);
  const [subPackageSecurity, setSubPackageSecurity] = useState(false);
  const [subPackageObservability, setSubPackageObservability] = useState(false);
  const [upgradePackageModal, setUpgradePackageModal] = useState<string | null>(null);
  // ── End License / Credential Gate States ──────────────────────────────────

  const checkCredentialGateStatus = async (authTokenToCheck?: string) => {
    if (window.location.hostname === 'evaops-crm.esteviatech.com') return;
    const activeToken = authTokenToCheck || token || localStorage.getItem('devops_token');
    if (!activeToken) return;
    try {
      const statusRes = await window.fetch(`${API_BASE}/org/status`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.isOrgDisabled !== undefined) {
          setIsOrgDisabled(statusData.isOrgDisabled);
        } else if (statusData.is_disabled !== undefined) {
          setIsOrgDisabled(statusData.is_disabled);
        }
        if (statusData.isOrgRestricted !== undefined) {
          setIsOrgRestricted(statusData.isOrgRestricted);
        }
        if (statusData.isOrgGrace !== undefined) {
          setIsOrgGrace(statusData.isOrgGrace);
        }
        if (statusData.maxOverdueDays !== undefined) {
          setMaxOverdueDays(statusData.maxOverdueDays);
        }
        if (statusData.credentialAlerts) {
          setCredentialAlerts(statusData.credentialAlerts);
        }
        if (statusData.credentialGate) {
          if (statusData.credentialGate.isComplete) {
            setRequiresCredentialSetup(false);
          } else if (statusData.onboardingComplete) {
            setRequiresCredentialSetup(true);
            setMissingCredentials(statusData.credentialGate.missing);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to check credential gate status:', err);
    }
  };

  // ── CRM Hash Routing ───────────────────────────────────────────────────────
  useEffect(() => {
    const checkHash = () => {
      setShowCrm(window.location.hash === '#crm' || window.location.hostname === 'evaops-crm.esteviatech.com');
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // ── Intercept Bypass URL Parameters (Cross-Domain Impersonation) ───────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bypassToken = params.get('bypassToken');
    if (bypassToken) {
      const bypassUser = params.get('bypassUser');
      const requiresOnboardingParam = params.get('requiresOnboarding');
      const orgId = params.get('orgId');
      const orgNameParam = params.get('orgName');

      localStorage.setItem('devops_token', bypassToken);
      setToken(bypassToken);

      if (bypassUser) {
        localStorage.setItem('devops_user', bypassUser);
        try {
          setUser(JSON.parse(bypassUser));
        } catch (e) { }
      }
      if (requiresOnboardingParam) {
        localStorage.setItem('devops_requires_onboarding', requiresOnboardingParam);
        setRequiresOnboarding(requiresOnboardingParam === 'true');
      }
      if (orgId) {
        localStorage.setItem('devops_organization_id', orgId);
        setOrganizationId(orgId);
      }
      if (orgNameParam) {
        localStorage.setItem('devops_organization_name', orgNameParam);
        setOrgName(orgNameParam);
      }

      // Clear query parameters for clean URL
      const newUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      if (orgId) {
        checkCredentialGateStatus(bypassToken);
      }
    }
  }, []);

  // ── Force settings tab when org is disabled (Allow admin tabs) ─────────────
  useEffect(() => {
    if (isOrgDisabled && !['settings', 'users', 'credentials', 'licensing', 'guide'].includes(activeTab)) {
      setActiveTab('settings');
    }
  }, [isOrgDisabled, activeTab]);

  // ── Pay invoice handler (client-side) ──────────────────────────────────────
  const handlePayInvoice = async (invoiceId: number): Promise<boolean> => {
    // 1. Optimistic UI Update: Mark invoice as SETTLED / PAID in local state instantly (0ms delay)
    setInvoices((prevInvoices: any[]) =>
      prevInvoices.map((inv: any) =>
        Number(inv.id) === Number(invoiceId)
          ? { ...inv, status: 'PAID', is_settled: true, paid_at: new Date().toISOString() }
          : inv
      )
    );
    setIsOrgDisabled(false);

    try {
      const res = await window.fetch(`${API_BASE}/org/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.is_disabled !== undefined) {
          setIsOrgDisabled(data.is_disabled);
        }
        // Async background sync
        checkCredentialGateStatus();
        fetchCostData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to pay invoice:', err);
      return false;
    }
  };


  // Onboarding Wizard States
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardOrgName, setOnboardOrgName] = useState('');
  const [onboardAdminEmail, setOnboardAdminEmail] = useState(user?.email || '');
  const [onboardBillingCurrency, setOnboardBillingCurrency] = useState('USD');
  const [onboardDevopsSub, setOnboardDevopsSub] = useState(false);
  const [onboardDevSub, setOnboardDevSub] = useState(false);
  const [onboardSecSub, setOnboardSecSub] = useState(false);

  const [onboardAzureSubId, setOnboardAzureSubId] = useState('');
  const [onboardAzureTenantId, setOnboardAzureTenantId] = useState(user?.tenant_id || '');
  const [onboardAzureClientId, setOnboardAzureClientId] = useState('');
  const [onboardAzureClientSecret, setOnboardAzureClientSecret] = useState('');
  const [onboardAzureRg, setOnboardAzureRg] = useState('');

  const [onboardDevopsUrl, setOnboardDevopsUrl] = useState('https://dev.azure.com/');
  const [onboardDevopsProject, setOnboardDevopsProject] = useState('');
  const [onboardDevopsPat, setOnboardDevopsPat] = useState('');
  const [onboardGithubOwner, setOnboardGithubOwner] = useState('');
  const [onboardGithubPat, setOnboardGithubPat] = useState('');

  const [onboardGodaddyKey, setOnboardGodaddyKey] = useState('');
  const [onboardGodaddySecret, setOnboardGodaddySecret] = useState('');
  const [onboardGodaddyDomain, setOnboardGodaddyDomain] = useState(import.meta.env.VITE_DEFAULT_DOMAIN || '');

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
  const [scannerProvisionDomain, setScannerProvisionDomain] = useState(import.meta.env.VITE_DEFAULT_DOMAIN || '');
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

    setScannerProvisionDomain(defaultDnsDomain || import.meta.env.VITE_DEFAULT_DOMAIN || '');
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
      handleScan(undefined, true);
      setTimeout(() => handleScan(undefined, true), 4000);
    } catch (e: any) {
      console.error('[ScannerDeploy] Failed:', e);
      setScannerDeployError(e.message || 'An unexpected error occurred during deployment.');
      setScannerDeployStep(-1);
    }
  };



  // Authentication Handlers
  const handleMicrosoftLoginRedirect = async () => {
    setSsoLoadingProvider('microsoft');
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/login-url`);
      const data = await res.json();
      if (data.url) {
        setTimeout(() => {
          window.location.href = data.url;
        }, 1500);
      } else {
        throw new Error('Could not retrieve Microsoft login URL from backend.');
      }
    } catch (err: any) {
      console.error('[auth] Failed redirecting to Microsoft:', err);
      setAuthError(err.message || 'Failed to initialize Microsoft login.');
      setAuthLoading(false);
      setSsoLoadingProvider(null);
    }
  };

  const handleVerifyMfaSetupCode = async (code: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken, secret: mfaSecret, code })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        completeSuccessfulLogin(data);
      } else {
        setAuthError(data.error || 'Invalid 6-digit verification code.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error verifying code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleValidateMfaCode = async (code: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/mfa/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken, code })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        completeSuccessfulLogin(data);
      } else {
        setAuthError(data.error || 'Invalid 6-digit verification code.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error validating code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestMfaReset = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/mfa/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'MFA reset request sent successfully. Please check your email.');
        setAuthStep('login');
      } else {
        setAuthError(data.error || 'Failed to request MFA reset.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error requesting MFA reset.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLoginRedirect = () => {
    setSsoLoadingProvider('google');
    setAuthLoading(true);
    setAuthError(null);
    window.location.href = `${API_BASE}/auth/google`;
  };

  const completeSuccessfulLogin = async (data: any) => {
    localStorage.setItem('devops_token', data.token);
    localStorage.setItem('devops_user', JSON.stringify(data.user));
    localStorage.setItem('devops_requires_onboarding', String(data.requiresOnboarding));
    if (data.organization && data.organization.id) {
      localStorage.setItem('devops_organization_id', data.organization.id);
      localStorage.setItem('devops_organization_name', data.organization.name || data.organization.id);
      setOrganizationId(data.organization.id);
      setOrgName(data.organization.name || data.organization.id);
    }
    setToken(data.token);
    setUser(data.user);
    setRequiresOnboarding(data.requiresOnboarding);
    setAuthStep('login'); // Reset auth step back
    setMfaTempToken('');
    setMfaSecret('');
    setMfaOtpauthUrl('');
    if (data.organization?.id) {
      await checkCredentialGateStatus(data.token);
    }
  };

  const handleInitiateMfaSetup = async (tempToken: string) => {
    setMfaSetupStep(1);
    try {
      const res = await window.fetch(`${API_BASE}/auth/mfa/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken })
      });
      const data = await res.json();
      if (res.ok) {
        setMfaSecret(data.secret);
        setMfaOtpauthUrl(data.otpauthUrl);
      } else {
        setAuthError(data.error || 'Failed to initialize MFA setup.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error initializing MFA setup.');
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
      if (res.ok) {
        if (data.code === 'MFA_SETUP_REQUIRED') {
          setMfaTempToken(data.tempToken);
          setAuthStep('mfa-setup');
          handleInitiateMfaSetup(data.tempToken);
          return;
        }
        if (data.code === 'MFA_REQUIRED') {
          setMfaTempToken(data.tempToken);
          setMfaRegName(data.mfa_registered_name || '');
          setMfaRegIssuer(data.mfa_registered_issuer || '');
          setAuthStep('mfa-verify');
          return;
        }
        if (data.token) {
          await completeSuccessfulLogin(data);
        } else {
          throw new Error('Invalid authentication response.');
        }
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
      if (res.ok) {
        if (data.code === 'MFA_SETUP_REQUIRED') {
          setMfaTempToken(data.tempToken);
          setAuthStep('mfa-setup');
          handleInitiateMfaSetup(data.tempToken);
          return;
        }
        if (data.code === 'MFA_REQUIRED') {
          setMfaTempToken(data.tempToken);
          setMfaRegName(data.mfa_registered_name || '');
          setMfaRegIssuer(data.mfa_registered_issuer || '');
          setAuthStep('mfa-verify');
          return;
        }
        if (data.token) {
          await completeSuccessfulLogin(data);
          setShowDevOverrideForm(false);
        } else {
          throw new Error('Invalid authentication response.');
        }
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
      if (res.ok) {
        if (data.code === 'MFA_SETUP_REQUIRED') {
          setMfaTempToken(data.tempToken);
          setAuthStep('mfa-setup');
          handleInitiateMfaSetup(data.tempToken);
          return;
        }
        if (data.code === 'MFA_REQUIRED') {
          setMfaTempToken(data.tempToken);
          setMfaRegName(data.mfa_registered_name || '');
          setMfaRegIssuer(data.mfa_registered_issuer || '');
          setAuthStep('mfa-verify');
          return;
        }
        if (data.token) {
          await completeSuccessfulLogin(data);
          setShowAdminOverrideForm(false);
        } else {
          throw new Error('Invalid authentication response.');
        }
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
    // Clear all session, user, org, notification, and resource-selection data.
    // We preserve 'devops_theme' as it is a UI preference, not session data.
    const SESSION_KEYS = [
      'devops_token',
      'devops_user',
      'devops_requires_onboarding',
      'devops_organization_id',
      'devops_organization_name',
      'evaops_events',
      'evaops_notifications',
      'selectedControlResourceGroup',
      // Legacy / alternate token key names used by some components
      'token',
      'authToken',
      'jwt',
      'organizationId',
    ];
    SESSION_KEYS.forEach(key => localStorage.removeItem(key));

    // Reset React state
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
        body: JSON.stringify({
          name: onboardOrgName,
          adminEmail: onboardAdminEmail,
          billingCurrency: onboardBillingCurrency,
          subPackageDevops: onboardDevopsSub,
          subPackageDeveloper: onboardDevSub,
          subPackageSecurity: onboardSecSub
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrganizationId(data.organization.id);
        setOrgName(data.organization.name);
        if (data.token) {
          localStorage.setItem('devops_token', data.token);
          setToken(data.token);
        }
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

        // Wait for settings to load first so handleScan has the correct resource group!
        const settings = await fetchOrgSettings();
        fetchGithubRepos();

        // Reset scanning refs and scanning state just in case it got stuck during onboarding
        scanningRef.current = false;
        buildsScanningRef.current = false;
        setScanning(false);

        const targetRg = settings?.azure_resource_group || undefined;
        handleScan(targetRg);
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
  const fetchCostData = async (subId?: string, rg?: string) => {
    setLoadingCosts(true);
    setCostError(null);
    let billingTimeoutId: any = null;
    try {
      const activeSub = subId || selectedSubscriptionId;
      const activeRg = rg || selectedControlResourceGroup;
      const res = await fetch(`${API_BASE}/apps/cost?organizationId=${organizationId}&subscriptionId=${activeSub}&resourceGroup=${activeRg}`);

      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { success: false, message: `Server error (${res.status})` };
      }

      if (res.ok && data && data.success) {
        setCostSummary(data.summary);
        setDetailedCosts(data.detailedCosts || []);
        setCostSuggestions(data.suggestions || []);
        setAppliedSuggestions(data.appliedSuggestions || []);
      } else {
        throw new Error((data && data.message) || 'Failed to retrieve cloud cost analytics.');
      }

      // Also fetch billing history invoices
      const billingController = new AbortController();
      billingTimeoutId = setTimeout(() => billingController.abort(), 10000); // 10-second timeout
      const billingRes = await fetch(`${API_BASE}/apps/billing?organizationId=${organizationId}`, {
        signal: billingController.signal
      });
      if (billingTimeoutId) {
        clearTimeout(billingTimeoutId);
        billingTimeoutId = null;
      }
      if (billingRes.ok) {
        const billingData = await billingRes.json();
        setInvoices(billingData);
      }
    } catch (err: any) {
      console.error('[cost] Failed loading cost data:', err);
      const errorMsg = err.name === 'AbortError' ? 'Cost query timed out' : (err.message || 'Failed loading cost metrics.');
      setCostError(errorMsg);
    } finally {
      if (billingTimeoutId) {
        clearTimeout(billingTimeoutId);
      }
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

  const handleUpdateMfaSettings = async (manualMfa: boolean, ssoMfa: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/mfa-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ manualMfaRequired: manualMfa, ssoMfaRequired: ssoMfa })
      });
      if (res.ok) {
        setManualMfaRequired(manualMfa);
        setSsoMfaRequired(ssoMfa);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update MFA settings:', err);
      return false;
    }
  };

  const handleResetMfa = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/reset-mfa`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchTeamUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to reset MFA:', err);
      return false;
    }
  };

  const handleResetOrgMfa = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/users/reset-mfa-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchTeamUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to reset org MFA:', err);
      return false;
    }
  };

  // Check query parameter ?code=... or ?mfa_reset_token=... on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const resetToken = urlParams.get('mfa_reset_token');

    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleMicrosoftCallback(code);
    } else if (resetToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const confirmReset = async () => {
        setAuthLoading(true);
        setAuthError(null);
        try {
          const res = await window.fetch(`${API_BASE}/auth/mfa/reset-confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken })
          });
          const data = await res.json();
          if (res.ok) {
            alert(data.message || 'MFA reset successfully. You can now log in.');
          } else {
            setAuthError(data.error || 'Invalid or expired reset link.');
          }
        } catch (err: any) {
          setAuthError(err.message || 'Failed to reset MFA.');
        } finally {
          setAuthLoading(false);
        }
      };
      confirmReset();
    }
  }, []);

  // Load registered credentials, configurations and scan initially (if authenticated)
  useEffect(() => {
    if (token) {
      fetchCredentialStatus();
      fetchResourceGroups();
      checkCredentialGateStatus();

      // Load cached apps first, then run a live scan in the background
      const loadCachedAndScan = async () => {
        // Trigger the live cloud scan immediately so the loader shows up instantly on reload/login
        if (!requiresOnboarding) {
          handleScan();
        }

        // Fetch and load cached apps in the background to show instant UI if the live scan is still querying
        try {
          const cachedRes = await fetch(`${API_BASE}/apps/scan?organizationId=${organizationId}&cached=true`);
          const cachedData = await cachedRes.json();
          if (cachedData.success && cachedData.apps && cachedData.apps.length > 0) {
            console.log('[DevOps] Instantly loaded cached resources:', cachedData.apps.length);
            console.log('[DevOps Debug Logs] Cached Apps List JSON String:\n', JSON.stringify(cachedData.apps, null, 2));
            setApps((currentApps) => {
              // Only load cached apps if the live scan hasn't already returned fresh results
              if (currentApps.length === 0) {
                return cachedData.apps;
              }
              return currentApps;
            });
          }
        } catch (e) {
          console.warn('[DevOps] Failed to load cached apps:', e);
        }
      };
      loadCachedAndScan();

      fetchOrgSettings();
      fetchGithubRepos();
      setTimeout(() => {
        fetchCostData();
      }, 2500);
      fetchDbServers();
      if (user?.role === 'owner' || user?.role === 'admin') {
        fetchTeamUsers();
      }
    }
  }, [organizationId, token, user?.role, requiresOnboarding]);

  // Refetch database servers and cost data whenever target scope changes
  useEffect(() => {
    if (token && selectedSubscriptionId && selectedControlResourceGroup) {
      fetchCostData(selectedSubscriptionId, selectedControlResourceGroup);
      fetchDbServers(selectedSubscriptionId, selectedControlResourceGroup);
    }
  }, [selectedSubscriptionId, selectedControlResourceGroup, token]);

  // Handle click outside to close target scope dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target as Node)) {
        setIsScopeDropdownOpen(false);
      }
    };
    if (isScopeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isScopeDropdownOpen]);

  // Auto-scan cloud resources and refresh costs with a 30-minute countdown timer
  useEffect(() => {
    if (token) {
      if (scanning) {
        return;
      }
      const interval = setInterval(() => {
        setSyncCountdown((prev) => {
          if (prev <= 1) {
            console.log('[DevOps Auto Refresh] Timer reached 0. Triggering auto cloud & cost scan...');
            handleScan(undefined, true);
            return 1800;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [token, organizationId, scanning]);

  // Polling for active pipeline runs/builds status updates
  useEffect(() => {
    if (token) {
      const intervalTime = activeBuildsCount > 0 ? 7000 : 20000;
      console.log(`[DevOps Polling] Active builds: ${activeBuildsCount}. Starting status polling every ${intervalTime / 1000}s...`);
      const interval = setInterval(() => {
        handleScan(undefined, true, true);
      }, intervalTime);
      return () => {
        console.log('[DevOps Polling] Clearing build status polling.');
        clearInterval(interval);
      };
    }
  }, [activeBuildsCount, token]);

  // Polling cached scan data during active scan to update UI incrementally
  useEffect(() => {
    let interval: any = null;
    if (scanning && token) {
      console.log('[DevOps Incremental Polling] Scan is active. Polling cached resources every 3s...');
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/apps/scan?organizationId=${organizationId}&cached=true`);
          const data = await res.json();
          if (data.success && data.apps && data.apps.length > 0) {
            console.log('[DevOps Incremental Polling] Received progressive app updates:', data.apps.length);
            console.log('[DevOps Debug Logs] Progressive Polled Apps List JSON String:\n', JSON.stringify(data.apps, null, 2));
            setApps(data.apps);
          }
        } catch (e) {
          console.warn('[DevOps Incremental Polling] Error fetching progressive updates:', e);
        }
      }, 3000);
    }
    return () => {
      if (interval) {
        console.log('[DevOps Incremental Polling] Stopping progressive updates polling.');
        clearInterval(interval);
      }
    };
  }, [scanning, token, organizationId]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    localStorage.setItem('devops_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => {
      const nextTheme = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      localStorage.setItem('devops_theme', nextTheme);
      if (token) {
        fetch(`${API_BASE}/auth/theme`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: nextTheme })
        }).catch(() => { });
      }
      return nextTheme;
    });
  };

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
        setProdLogAnalyticsWorkspaceId(data.settings.prod_log_analytics_workspace_id || '');
        setAzureKeyVaultUrl(data.settings.azure_key_vault_url || '');
        setDevDbHost(data.settings.dev_db_host || '');
        setQaDbHost(data.settings.qa_db_host || '');
        setProdDbHost(data.settings.prod_db_host || '');
        setDevManagedEnvId(data.settings.dev_managed_env_id || '');
        setProdManagedEnvId(data.settings.prod_managed_env_id || '');

        // ── License fields ────────────────────────────────────────────────
        if (data.settings.license_tier) setLicenseTier(data.settings.license_tier);
        if (data.settings.operator_seats_limit != null) setOperatorSeatsLimit(data.settings.operator_seats_limit);
        if (data.settings.currentWriteUsers != null) setCurrentWriteUsers(data.settings.currentWriteUsers);
        if (data.settings.downgrade_pending) setDowngradeComplianceDebt({ pending: true });
        if (data.settings.billing_currency) setBillingCurrency(data.settings.billing_currency);
        setSubPackageDevops(data.settings.sub_package_devops === 1 || data.settings.sub_package_devops === true);
        setSubPackageDeveloper(data.settings.sub_package_developer === 1 || data.settings.sub_package_developer === true);
        setSubPackageSecurity(data.settings.sub_package_security === 1 || data.settings.sub_package_security === true);
        setSubPackageObservability(data.settings.sub_package_observability === 1 || data.settings.sub_package_observability === true);
        setManualMfaRequired(data.settings.manual_mfa_required === 1 || data.settings.manual_mfa_required === true);
        setSsoMfaRequired(data.settings.sso_mfa_required === 1 || data.settings.sso_mfa_required === true);
        // ─────────────────────────────────────────────────────────────────

        // Auto-configure default inputs
        setDomainInput(data.settings.default_dns_domain || import.meta.env.VITE_DEFAULT_DOMAIN || '');
        setDevopsOrgUrl(data.settings.azure_devops_org_url || import.meta.env.VITE_AZURE_DEVOPS_ORG_URL || '');
        setDevopsProject(data.settings.azure_devops_project || '');
        return data.settings;
      }
    } catch (e) {
      console.error('Failed to load organization settings:', e);
    }
    return null;
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
      // ── Downgrade detection: show impact modal before saving ───────────
      const tierRank: Record<string, number> = { growth: 1, enterprise: 2, sovereign: 3 };
      const isDowngrade = pendingLicenseTier !== null &&
        (tierRank[pendingLicenseTier] ?? 0) < (tierRank[licenseTier] ?? 0);

      if (isDowngrade && !showDowngradeModal) {
        // First click: fetch impact and show modal — don't save yet
        try {
          const impactRes = await fetch(
            `${API_BASE}/apps/downgrade-impact?targetTier=${pendingLicenseTier}&organizationId=${organizationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const impactData = await impactRes.json();
          setDowngradeImpactData(impactData);
        } catch (_) { }
        setShowDowngradeModal(true);
        setSavingSettings(false);
        return;
      }
      // ─────────────────────────────────────────────────────────────────

      const res = await fetch(`${API_BASE}/apps/organization-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
          prodLogAnalyticsWorkspaceId,
          azureKeyVaultUrl,
          devDbHost,
          qaDbHost,
          prodDbHost,
          devManagedEnvId,
          prodManagedEnvId,
          // License fields
          licenseTier: pendingLicenseTier ?? licenseTier,
          operatorSeatsLimit,
          downgradeConfirmToken: isDowngrade ? downgradeConfirmInput : undefined,
          // Sub-package fields
          billingCurrency,
          subPackageDevops,
          subPackageDeveloper,
          subPackageSecurity,
          subPackageObservability
        })
      });
      const data = await res.json();

      // ── Handle 207 Over-Seat-Limit response ───────────────────────────
      if (res.status === 207 && data.overSeatLimit) {
        setOverSeatLimitWarning(true);
        setCurrentWriteUsers(data.currentWriteUsers ?? currentWriteUsers);
        setSettingsMsg({ type: 'warning', text: data.message });
        fetchOrgSettings();
        setSavingSettings(false);
        return;
      }
      // ─────────────────────────────────────────────────────────────────

      if (data.success) {
        // ── Handle downgrade + compliance debt ────────────────────────
        if (data.downgraded && data.complianceDebt) {
          setDowngradeComplianceDebt(data.complianceDebt);
          if (pendingLicenseTier) setLicenseTier(pendingLicenseTier);
        }
        setPendingLicenseTier(null);
        setShowDowngradeModal(false);
        setDowngradeConfirmInput('');
        setOverSeatLimitWarning(false);
        // ─────────────────────────────────────────────────────────────

        setSettingsMsg({ type: 'success', text: 'Organization settings updated successfully!' });
        fetchOrgSettings();
        fetchGithubRepos();

        // ── Re-evaluate credential gate on every save ─────────────────
        if (token) {
          await checkCredentialGateStatus();
        }
        // ─────────────────────────────────────────────────────────────
      } else {
        setSettingsMsg({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (e: any) {
      setSettingsMsg({ type: 'error', text: e.message || 'Error saving organization settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradePackageModal) return;
    try {
      const fieldName = upgradePackageModal === 'DevOps' ? 'subPackageDevops'
        : upgradePackageModal === 'Developer' ? 'subPackageDeveloper'
          : 'subPackageSecurity';
      const payload = {
        organizationId: organizationId,
        [fieldName]: true
      };

      const res = await window.fetch(`${API_BASE}/apps/organization-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (upgradePackageModal === 'DevOps') {
          setSubPackageDevops(true);
          setActiveTab('provision');
        } else if (upgradePackageModal === 'Developer') {
          setSubPackageDeveloper(true);
          setActiveTab('databases');
        } else if (upgradePackageModal === 'Security') {
          setSubPackageSecurity(true);
          setActiveTab('cost');
        }
        setUpgradePackageModal(null);
        fetchOrgSettings();
        fetchCostData();
      } else {
        alert(data.message || 'Upgrade failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during upgrade.');
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

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Filter by resourceGroup matching selectedControlResourceGroup (case insensitive)
      if (selectedControlResourceGroup) {
        const resId = app.resourceId || '';
        const rgMatch = resId.match(/\/resourceGroups\/([^\/]+)/i);
        const rg = rgMatch ? rgMatch[1] : '';
        if (rg.toLowerCase() !== selectedControlResourceGroup.toLowerCase()) {
          return false;
        }
      }
      // Filter by subscriptionId matching selectedSubscriptionId (case-insensitive extract from resourceId)
      if (selectedSubscriptionId) {
        const resId = app.resourceId || '';
        const subIdMatch = resId.match(/\/subscriptions\/([^\/]+)/i);
        if (!subIdMatch || subIdMatch[1].toLowerCase() !== selectedSubscriptionId.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [apps, selectedControlResourceGroup, selectedSubscriptionId]);

  // Compute grouped apps (by shared repo / base name) whenever apps change
  const appGroups = useMemo(() => groupApps(filteredApps), [filteredApps]);

  const refreshHealthForRepo = useCallback((repo: string) => {
    if (!repo) return;
    const repoLower = repo.toLowerCase().replace('https://github.com/', '').replace(/\/$/, '');
    const group = appGroups.find(g => g.repoPath && g.repoPath.toLowerCase() === repoLower);
    if (group) {
      fetchYmlHealthForGroups([group]);
    }
  }, [appGroups, fetchYmlHealthForGroups]);

  const fetchCredentialStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/credentials?organizationId=${organizationId}`);
      if (res.ok) {
        const data = await res.json();
        setCredentialsList(data);
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
        if (statusMap.azure) {
          handleLoadSavedCredential('azure');
        }
      }
    } catch (e) {
      console.error('Failed to load credential status:', e);
    }
  };

  const fetchDbServers = async (subId?: string, rg?: string) => {
    setLoadingDbServers(true);
    try {
      const activeSub = subId || selectedSubscriptionId;
      const activeRg = rg || selectedControlResourceGroup;
      const res = await fetch(`${API_BASE}/apps/db-servers?organizationId=${organizationId}&subscriptionId=${activeSub}&resourceGroup=${activeRg}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDbServers(data.servers);
          if (data.servers.length > 0) {
            // Find existing selection or default to first
            setSelectedDbServer(data.servers[0]);
            fetchDatabases(data.servers[0].name, data.servers[0].host);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load database servers:', e);
    } finally {
      setLoadingDbServers(false);
    }
  };

  const fetchDatabases = async (serverName: string, host?: string) => {
    setLoadingDatabases(true);
    setDatabases([]);
    setSelectedDatabase(null);
    setDatabaseSchema([]);
    try {
      const activeSub = selectedSubscriptionId;
      const activeRg = selectedControlResourceGroup;
      let url = `${API_BASE}/apps/databases?organizationId=${organizationId}&serverName=${serverName}&subscriptionId=${activeSub}&resourceGroup=${activeRg}`;
      if (host) {
        url += `&host=${encodeURIComponent(host)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDatabases(data.databases);
          if (data.databases.length > 0) {
            setSelectedDatabase(data.databases[0]);
            fetchDatabaseSchema(serverName, data.databases[0].name, host);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load databases:', e);
    } finally {
      setLoadingDatabases(false);
    }
  };

  const fetchDatabaseSchema = async (serverName: string, dbName: string, host?: string) => {
    setLoadingSchema(true);
    setDatabaseSchema([]);
    setSchemaError(null);
    try {
      const activeSub = selectedSubscriptionId;
      const activeRg = selectedControlResourceGroup;
      let url = `${API_BASE}/apps/database-schema?organizationId=${organizationId}&serverName=${serverName}&dbName=${dbName}&subscriptionId=${activeSub}&resourceGroup=${activeRg}`;
      if (host) {
        url += `&host=${encodeURIComponent(host)}`;
      }
      const res = await fetch(url);
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
              dbName: dbName,
              host: selectedDbServer.host,
              subscriptionId: selectedSubscriptionId,
              resourceGroup: selectedControlResourceGroup
            })
          });
          const data = await res.json();
          if (data.success) {
            setDeployDbSuccess(data.message || `Database '${dbName}' deployed successfully.`);
            setNewDbName('');
            fetchDatabases(selectedDbServer.name, selectedDbServer.host);
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
          query: customSql.trim(),
          host: selectedDbServer.host
        })
      });
      const data = await res.json();
      const endTime = performance.now();
      const execTimeMs = Math.round(endTime - startTime);
      if (res.ok && data.success) {
        setQueryResult({ ...data, execTimeMs });
        if (reloadSchemaAfter) {
          fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name, selectedDbServer.host);
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
          query: sql,
          host: selectedDbServer.host
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
        fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name, selectedDbServer.host);
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
              query: sql,
              host: selectedDbServer.host
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setQueryResult(null);
            fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name, selectedDbServer.host);
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
              query: sql,
              host: selectedDbServer.host
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setAlteringTable(null);
            setAlterNewColName('');
            fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name, selectedDbServer.host);
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
              query: sql,
              host: selectedDbServer.host
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name, selectedDbServer.host);
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

  const handleScan = async (rg?: string, skipHealthChecks = false, buildsOnly = false, subId?: string) => {
    if (buildsOnly) {
      if (buildsScanningRef.current) {
        console.log('[DevOps Scan] Background builds status polling already in progress, skipping.');
        return;
      }
      buildsScanningRef.current = true;
    } else {
      if (scanningRef.current) {
        console.log('[DevOps Scan] Scan already in progress, skipping duplicate scan request.');
        return;
      }
      scanningRef.current = true;
      setScanning(true);
      setScanError(null);
    }
    const activeRg = rg !== undefined ? rg : selectedControlResourceGroup;
    const activeSub = subId !== undefined ? subId : selectedSubscriptionId;
    const scanUrl = `${API_BASE}/apps/scan?organizationId=${organizationId}${activeRg ? `&resourceGroup=${activeRg}` : ''}${activeSub ? `&subscriptionId=${activeSub}` : ''}${buildsOnly ? '&buildsOnly=true' : ''}`;
    console.log('[DevOps Scan] [START] Initiating Cloud Scan.', { organizationId, scanUrl, buildsOnly });
    try {
      const res = await fetch(scanUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      console.log('[DevOps Scan] [HTTP STATUS]', res.status, res.statusText);

      const data = await res.json();
      console.log('[DevOps Scan] [RESPONSE DATA]', data);

      if (data.success) {
        const appsCount = data.apps ? data.apps.length : 0;
        console.log(`[DevOps Scan] [SUCCESS] Discovered ${appsCount} resources.`, data.apps);
        console.log('[DevOps Debug Logs] Fresh Scan Apps List JSON String:\n', JSON.stringify(data.apps, null, 2));

        if (data.apps && Array.isArray(data.apps)) {
          const pcApps = data.apps.filter((a: any) => a.name?.toLowerCase().includes('peoplecraft') || a.repositoryUrl?.toLowerCase().includes('peoplecraft'));
          console.log('🔍 [FRONTEND DIAGNOSTICS] PeopleCraft Scanned Apps Array:', pcApps);

          const evaApps = data.apps.filter((a: any) => a.name?.toLowerCase().includes('evaops') || a.repositoryUrl?.toLowerCase().includes('evaops'));
          console.log('🔍 [FRONTEND DIAGNOSTICS] EvaOps Scanned Apps Array:', evaApps);
        }

        if (appsCount === 0 && !buildsOnly) {
          console.warn(`[DevOps Scan] [WARN] Scan returned 0 active resources. Organization: "${organizationId}" | Selected SubID: "${activeSub || 'All'}" | Selected ResourceGroup: "${activeRg || 'All'}" | Scan URL: "${scanUrl}". Check Azure subscription permissions or resource group filters.`);
        }
        setApps(data.apps || []);
        const newlyGrouped = groupApps(data.apps || []);
        if (!skipHealthChecks && !buildsOnly) {
          // Stagger the health checks by 1.5 seconds to allow cost query to dispatch first, avoiding browser socket contention
          setTimeout(() => {
            fetchYmlHealthForGroups(newlyGrouped);
          }, 1500);
        }
        if (!buildsOnly) {
          addEvent('Cloud Scan Completed', `Discovered ${appsCount} resources in resource group: ${activeRg || 'All'}.`, 'scan', 'success');
        }

        // Dispatch integrity notifications if present (only for full scans)
        if (data.integrity && !buildsOnly) {
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

        // Auto-update cost management metrics as part of the scan flow (only for full scans)
        if (!buildsOnly) {
          console.log('[DevOps Scan] Triggering cost metrics refresh...');
          fetchCostData(activeSub, activeRg);
        }
      } else {
        console.error('[DevOps Scan] [API ERROR] Backend reported failure:', data.message || data.error);
        if (!buildsOnly) {
          setScanError(data.message || 'Failed to scan Azure resources.');
          addEvent('Cloud Scan Failed', data.message || 'Failed to scan Azure resources.', 'scan', 'failed');
          addNotification('Cloud Scan Failed', data.message || 'Failed to scan Azure resources.', 'error');
        }
      }
    } catch (e: any) {
      console.error('[DevOps Scan] [FETCH EXCEPTION] Connection/parsing error:', e);
      if (!buildsOnly) {
        setScanError(e.message || 'Error connecting to the DevOps backend server.');
        addEvent('Cloud Scan Error', e.message || 'Error connecting to the DevOps backend server.', 'scan', 'failed');
        addNotification('Cloud Scan Error', e.message || 'Error connecting to the DevOps backend server.', 'error');
      }
    } finally {
      console.log('[DevOps Scan] [END] Scan finished.');
      if (buildsOnly) {
        buildsScanningRef.current = false;
      } else {
        setScanning(false);
        scanningRef.current = false;
        setSyncCountdown(1800); // Start 30 min duration from when manual/auto scan completes
      }
    }
  };

  const fetchResourceGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/apps/resource-groups?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.subscriptions)) {
          setSubscriptionsList(data.subscriptions);

          let initialSubId = localStorage.getItem('selectedControlSubscriptionId') || '';
          if (!initialSubId && data.subscriptions.length > 0) {
            const activeSub = data.subscriptions.find((sub: any) => sub.status === 'active') || data.subscriptions[0];
            initialSubId = activeSub.id;
          }
          setSelectedSubscriptionId(initialSubId);
          localStorage.setItem('selectedControlSubscriptionId', initialSubId);

          const matchedSub = data.subscriptions.find((sub: any) => sub.id === initialSubId);
          const rgs = matchedSub ? matchedSub.resourceGroups || [] : [];
          setControlResourceGroups(rgs);

          let initialRg = localStorage.getItem('selectedControlResourceGroup') || '';
          if (!initialRg || !rgs.includes(initialRg)) {
            initialRg = rgs.length > 0 ? rgs[0] : '';
          }
          setSelectedControlResourceGroup(initialRg);
          localStorage.setItem('selectedControlResourceGroup', initialRg);
        } else if (Array.isArray(data.resourceGroups)) {
          setControlResourceGroups(data.resourceGroups);
        }
      }
    } catch (e) {
      console.error('Failed to load resource groups:', e);
    }
  };

  const handleSubscriptionChange = (subId: string) => {
    setSelectedSubscriptionId(subId);
    localStorage.setItem('selectedControlSubscriptionId', subId);

    const matchedSub = subscriptionsList.find(sub => sub.id === subId);
    const rgs = matchedSub ? matchedSub.resourceGroups || [] : [];
    setControlResourceGroups(rgs);

    const initialRg = rgs.length > 0 ? rgs[0] : '';
    setSelectedControlResourceGroup(initialRg);
    localStorage.setItem('selectedControlResourceGroup', initialRg);

    handleScan(initialRg, false, false, subId);
  };

  const handleResourceGroupChange = (rg: string) => {
    setSelectedControlResourceGroup(rg);
    localStorage.setItem('selectedControlResourceGroup', rg);
    handleScan(rg, false, false, selectedSubscriptionId);
  };

  const handleSaveCredential = async (provider: string, secrets: any, name: string, expiresAt?: string) => {
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
          secrets,
          expiresAt
        })
      });
      const data = await res.json();
      if (data.success) {
        setCredMsg({ type: 'success', text: `${provider.toUpperCase()} credentials registered successfully.` });
        showToast('Credentials Saved', `${provider.toUpperCase()} credentials successfully updated.`, 'success');
        addEvent('Credentials Updated', `${provider.toUpperCase()} credentials registered successfully.`, 'credential', 'success');
        // Clear forms and decrypted tracking before refreshing status
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
        if (provider === 'azure') {
          setAzureClientId('');
          setAzureClientSecret('');
          setAzureTenantId('');
          setDecryptedAzureClientId('');
          setDecryptedAzureClientSecret('');
          setDecryptedAzureTenantId('');
        }
        await fetchCredentialStatus();
        await checkCredentialGateStatus();
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
          } else if (provider === 'azure') {
            setAzureClientId(data.secrets.clientId || '');
            setAzureClientSecret(data.secrets.clientSecret || '');
            setAzureTenantId(data.secrets.tenantId || '');
            setDecryptedAzureClientId(data.secrets.clientId || '');
            setDecryptedAzureClientSecret(data.secrets.clientSecret || '');
            setDecryptedAzureTenantId(data.secrets.tenantId || '');
            setShowAzureClientId(true);
            setShowAzureClientSecret(true);
            setShowAzureTenantId(true);
          }
        } else {
          showToast('Load Credentials Failed', data.message || 'Failed to decrypt credentials.', 'error');
        }
      } else {
        const data = await res.json();
        showToast('Load Credentials Error', data.message || 'Error fetching decrypted credentials.', 'error');
      }
    } catch (e: any) {
      showToast('Load Credentials Error', e.message || 'Error occurred while loading saved credentials.', 'error');
    }
  };

  const handleDiscoverAzureEnvCredentials = async () => {
    try {
      const res = await fetch(`${API_BASE}/credentials/discover-env?organizationId=${organizationId}`);
      const data = await res.json();
      if (res.ok && data.success && data.secrets) {
        setAzureClientId(data.secrets.clientId || '');
        setAzureClientSecret(data.secrets.clientSecret || '');
        setAzureTenantId(data.secrets.tenantId || '');
        setDecryptedAzureClientId(data.secrets.clientId || '');
        setDecryptedAzureClientSecret(data.secrets.clientSecret || '');
        setDecryptedAzureTenantId(data.secrets.tenantId || '');
        setShowAzureClientId(true);
        setShowAzureClientSecret(true);
        setShowAzureTenantId(true);
        // Optimistically mark Azure as configured so UI reflects immediately
        setCredentialStatus(prev => ({ ...prev, azure: true }));
        await fetchCredentialStatus();
        await checkCredentialGateStatus();
        showToast('Credentials Discovered', 'Azure Service Principal credentials auto-discovered from server environment successfully!', 'success');
      } else {
        showToast('Discovery Failed', data.message || 'No Azure Service Principal environment variables found on server.', 'error');
      }
    } catch (e: any) {
      showToast('Discovery Error', e.message || 'Error occurred while discovering server credentials.', 'error');
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
    setYmlOriginal('');
    setYmlSource(null);
    try {
      // 1. Try fetching existing configuration file from the primary branch
      const res = await fetch(`${API_BASE}/apps/get-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(primaryBranch)}&pipelineProvider=${pipelineProvider}`);
      const data = await res.json();

      if (data.success && data.exists) {
        setYmlContent(data.content);
        setYmlOriginal(data.content);
        setYmlSource('github');
      } else {
        // 2. Fetch the default template populated with trigger branches list
        const branchesParam = allBranches.join(',');
        const templateRes = await fetch(`${API_BASE}/apps/default-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branches=${encodeURIComponent(branchesParam)}&appType=${appType}&customAppLocation=${encodeURIComponent(customAppLocation)}&customApiLocation=${encodeURIComponent(customApiLocation)}&customOutputLocation=${encodeURIComponent(customOutputLocation)}&pipelineProvider=${pipelineProvider}`);
        const templateData = await templateRes.json();
        if (templateData.success) {
          setYmlContent(templateData.content);
          setYmlOriginal(templateData.content);
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
          customYml: ymlContent,
          pipelineProvider: pipelineProvider
        })
      });
      const data = await res.json();
      if (data.success) {
        setYmlSource('github');
        setYmlOriginal(ymlContent);
        alert('Pipeline YAML committed successfully to GitHub!');
        refreshHealthForRepo(selectedRepo);
      } else {
        throw new Error(data.message || 'Failed to commit custom YAML.');
      }
    } catch (e: any) {
      setYmlError(e.message || 'Error committing custom YAML to GitHub.');
    } finally {
      setCreatingYml(false);
    }
  };

  const openDockerfileEditor = async (app: AppResource, group?: AppGroup) => {
    setDockerfileEditApp(app);
    setDockerfileContent('');
    setDockerfileValidation(null);
    const repo = app.repositoryUrl?.replace('https://github.com/', '').replace(/\/$/, '') || group?.repoPath || '';
    const branch = app.branch || 'main';
    await fetchDockerfileContent(repo, branch);
  };

  const handleMoveToStep2 = async () => {
    if (appType === 'cluster' || appType === 'database') {
      setProvisionStep(4);
      return;
    }

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
      refreshHealthForRepo(repo);

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
          subscriptionId: selectedProvisionSubscriptionId || selectedSubscriptionId,
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
        handleScan(undefined, true);
        setTimeout(() => handleScan(undefined, true), 4000);
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
          branch: selectedBranch,
          pipelineProvider: pipelineProvider
        })
      });
      const data = await res.json();
      if (data.success) {
        setPipelineRegSuccess(true);
        setRegisteredPipelineUrl(data.pipelineUrl || '');
        handleScan(undefined, true);
        setTimeout(() => handleScan(undefined, true), 4000);
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
          customYml: pipelineModalYmlContent,
          pipelineProvider
        })
      });
      const data = await res.json();
      if (data.success) {
        setPipelineSuccess(`✅ ${pipelineProvider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'} committed and pipeline registered successfully! ID: ${data.pipelineId}`);
        setPipelineModalYmlOriginal(pipelineModalYmlContent);
        setYmlCreated(true);
        setPipelineWizardStep(3);
        refreshHealthForRepo(githubRepo || pipelineApp.repositoryUrl || '');
        handleScan(undefined, true);
        setTimeout(() => handleScan(undefined, true), 4000);
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
          devopsProject,
          pipelineProvider
        })
      });
      const data = await res.json();
      if (data.success) {
        setYmlCreated(true);
        setPipelineSuccess(`✅ ${pipelineProvider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'} committed to "${githubRepo}" and pipeline registered! ID: ${data.pipelineId}`);
        const repoToRefresh = githubRepo;
        setGithubRepo('');
        refreshHealthForRepo(repoToRefresh);
        handleScan(undefined, true);
        setTimeout(() => handleScan(undefined, true), 4000);
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
              onConfirm: () => { }
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
              onConfirm: () => { }
            });
          }
        } catch (e: any) {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: e.message || 'Error occurred during deletion request.',
            confirmLabel: 'Dismiss',
            type: 'danger',
            onConfirm: () => { }
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
      setDomainInput(app.dnsDetails.domain || defaultDnsDomain || import.meta.env.VITE_DEFAULT_DOMAIN || '');
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
      setDomainInput(defaultDnsDomain || import.meta.env.VITE_DEFAULT_DOMAIN || '');
    }
  };

  const checkYmlExists = async (repo: string, provider: 'evaops_native' | 'azure_devops' | 'github_actions' = pipelineProvider) => {
    if (!repo) return;
    setCheckingYml(true);
    setYmlMissing(null);
    setYmlFound(null);
    try {
      const res = await fetch(`${API_BASE}/apps/check-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&pipelineProvider=${provider}`);
      const data = await res.json();
      if (data.exists === false) {
        setYmlMissing({
          message: `${provider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'} was not found in "${repo}".`,
          githubRepo: repo
        });
      } else if (data.exists === true) {
        // Build the GitHub URL to the yml file
        setYmlFound(`https://github.com/${repo}/blob/main/${provider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'}`);
      }
      // If exists === null (no token), leave both as null
    } catch (e) {
      console.warn('YML check failed silently:', e);
    } finally {
      setCheckingYml(false);
    }
  };

  const loadYmlForPipelineModal = async (repo: string, branch: string, provider: 'evaops_native' | 'azure_devops' | 'github_actions' = pipelineProvider) => {
    if (!repo) return;
    setPipelineModalYmlLoading(true);
    setPipelineModalYmlContent('');
    setPipelineModalYmlOriginal('');
    setPipelineModalYmlSource(null);
    try {
      const res = await fetch(`${API_BASE}/apps/get-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}&pipelineProvider=${provider}`);
      const data = await res.json();

      if (data.success && data.exists) {
        setPipelineModalYmlContent(data.content);
        setPipelineModalYmlOriginal(data.content);
        setPipelineModalYmlSource('github');
      } else {
        const templateRes = await fetch(`${API_BASE}/apps/default-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branches=${encodeURIComponent(branch + ',main,qa,dev')}&appType=${pipelineApp?.type || 'frontend'}&pipelineProvider=${provider}`);
        const templateData = await templateRes.json();
        if (templateData.success) {
          setPipelineModalYmlContent(templateData.content);
          setPipelineModalYmlOriginal(templateData.content);
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
    if (!subPackageDevops) {
      setUpgradePackageModal('DevOps');
      return;
    }
    setPipelineApp(app);
    setPipelineSuccess(null);
    setPipelineError(null);
    setYmlMissing(null);
    setYmlFound(null);
    setYmlCreated(false);
    setPipelineWizardStep(1);
    setYmlViewMode('editor');

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

    setDevopsOrgUrl(azureDevopsOrgUrl || import.meta.env.VITE_AZURE_DEVOPS_ORG_URL || '');
    setDevopsProject(azureDevopsProject || '');
    const initialProvider = app.pipelineId && String(app.pipelineId).startsWith('github-actions:') ? 'github_actions' : 'azure_devops';
    setPipelineProvider(initialProvider);

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
      checkYmlExists(activeRepo, initialProvider);
      loadYmlForPipelineModal(activeRepo, defaultBranch, initialProvider);
    }
  };

  if (showCrm) {
    return (
      <CrmPortal
        API_BASE={API_BASE}
        theme={theme}
        onBackToApp={() => { setShowCrm(false); window.location.hash = ''; }}
      />
    );
  }

  const [emailLoading, setEmailLoading] = useState(false);

  const handleSendEmailOtp = async () => {
    if (!mfaTempToken) return;
    setAuthError(null);
    setEmailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mfa/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken })
      });
      const data = await res.json();
      if (data.success) setEmailOtpSent(true);
      else setAuthError(data.error || 'Failed to dispatch email passcode.');
    } catch (e: any) {
      setAuthError(e.message || 'Failed to dispatch email passcode.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpCode || !mfaTempToken) return;
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mfa/validate-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken, otp: emailOtpCode })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('devops_token', data.token);
      } else {
        setAuthError(data.error || 'Invalid email passcode.');
      }
    } catch (e) { } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (!backupCode || !mfaTempToken) return;
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mfa/validate-recovery-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: mfaTempToken, code: backupCode })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('devops_token', data.token);
      } else {
        setAuthError(data.error || 'Invalid backup recovery code.');
      }
    } catch (e) { } finally {
      setAuthLoading(false);
    }
  };

  if (!token) {
    if (pageBootLoading || authLoading || ssoLoadingProvider) {
      const loaderMsg = authStep !== 'login'
        ? "Authenticating via EVA Authenticator Neural Shield..."
        : "Auditing Azure Cloud Containers & CI/CD Pipelines...";
      return <AppStartLoader message={loaderMsg} />;
    }
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-deep, #070a12)',
        padding: '24px',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        fontFamily: "'Inter', sans-serif"
      }}>
        <style>{`
          @keyframes scanLine {
            0% { top: -5%; opacity: 0; }
            10% { opacity: 0.95; }
            90% { opacity: 0.95; }
            100% { top: 105%; opacity: 0; }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.25; transform: scale(1); }
            50% { opacity: 0.50; transform: scale(1.12); }
          }
          @keyframes podPulse {
            0%, 100% { opacity: 0.35; filter: drop-shadow(0 0 3px #a78bfa); }
            50% { opacity: 0.9; filter: drop-shadow(0 0 10px #7c3aed); }
          }
          @keyframes stageCardBlink {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes pipelineFlow {
            0% { stroke-dashoffset: 40; }
            100% { stroke-dashoffset: 0; }
          }
          .sec-scan-line-purple {
            position: absolute;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent 10%, #a78bfa 50%, transparent 90%);
            box-shadow: 0 0 25px #a78bfa, 0 0 50px rgba(124, 58, 237, 0.7);
            animation: scanLine 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            pointer-events: none;
            z-index: 10;
          }
        `}</style>
        {/* Main outer card */}
        <div style={{
          width: '960px',
          height: authStep !== 'login' ? '740px' : '640px',
          display: 'flex',
          background: 'var(--bg-card, rgba(8,12,22,0.6))',
          borderRadius: '24px',
          border: '1px solid var(--border-shell, rgba(255, 255, 255, 0.08))',
          boxShadow: 'var(--shadow-lg, 0 30px 80px rgba(0,0,0,0.5))',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Left panel: Product pitch (Brand panel) */}
          <div style={{
            flex: '1.05',
            background: 'var(--left-panel-bg, linear-gradient(165deg, #040207 0%, #0f051c 50%, #040207 100%))',
            padding: '44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-slate, rgba(255, 255, 255, 0.08))',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            {/* Luminous Purple Laser Sweeper */}
            <div className="sec-scan-line-purple" />

            {/* High-Impact Ambient Mesh Glows */}
            <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '380px', height: '380px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.22)', filter: 'blur(95px)', pointerEvents: 'none', animation: 'pulseGlow 8s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(109, 40, 217, 0.16)', filter: 'blur(95px)', pointerEvents: 'none', animation: 'pulseGlow 8s ease-in-out infinite 4s' }} />

            {/* CI/CD Pipeline Flow & Kubernetes Pod Grid (DevOps-native animation) */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.50
            }}>
              <svg width="100%" height="100%" viewBox="0 0 420 640" fill="none" preserveAspectRatio="xMidYMid slice">

                {/* ── CI/CD Pipeline Row ──────────────────────── */}
                {/* Connector lines with pipelineFlow animation */}
                <line x1="60" y1="160" x2="120" y2="160" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeDasharray="6 4" style={{ animation: 'pipelineFlow 1.5s linear infinite' }} />
                <line x1="180" y1="160" x2="240" y2="160" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" strokeDasharray="6 4" style={{ animation: 'pipelineFlow 1.5s linear infinite 0.4s' }} />
                <line x1="300" y1="160" x2="360" y2="160" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeDasharray="6 4" style={{ animation: 'pipelineFlow 1.5s linear infinite 0.8s' }} />

                {/* Stage nodes: CODE */}
                <circle cx="40" cy="160" r="18" fill="rgba(124,58,237,0.15)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5" style={{ animation: 'stageCardBlink 2.4s ease-in-out infinite' }} />
                <text x="40" y="164" textAnchor="middle" fontSize="7" fill="#c084fc" fontFamily="monospace" fontWeight="700">CODE</text>

                {/* Stage nodes: BUILD */}
                <circle cx="150" cy="160" r="18" fill="rgba(59,130,246,0.15)" stroke="rgba(96,165,250,0.6)" strokeWidth="1.5" style={{ animation: 'stageCardBlink 2.4s ease-in-out infinite 0.6s' }} />
                <text x="150" y="164" textAnchor="middle" fontSize="7" fill="#60a5fa" fontFamily="monospace" fontWeight="700">BUILD</text>

                {/* Stage nodes: TEST */}
                <circle cx="260" cy="160" r="18" fill="rgba(16,185,129,0.15)" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" style={{ animation: 'stageCardBlink 2.4s ease-in-out infinite 1.2s' }} />
                <text x="260" y="164" textAnchor="middle" fontSize="7" fill="#34d399" fontFamily="monospace" fontWeight="700">TEST</text>

                {/* Stage nodes: DEPLOY */}
                <circle cx="375" cy="160" r="18" fill="rgba(245,158,11,0.15)" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5" style={{ animation: 'stageCardBlink 2.4s ease-in-out infinite 1.8s' }} />
                <text x="375" y="164" textAnchor="middle" fontSize="7" fill="#fbbf24" fontFamily="monospace" fontWeight="700">DEPLOY</text>

                {/* Branch lines from BUILD stage */}
                <line x1="150" y1="178" x2="150" y2="230" stroke="rgba(96,165,250,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="150" y1="230" x2="100" y2="270" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="150" y1="230" x2="210" y2="270" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="3 3" />

                {/* ── Kubernetes Pod Hexagonal Grid ───────────── */}
                {/* Row 1: 3 pods */}
                <polygon points="80,310 97,320 97,340 80,350 63,340 63,320" fill="rgba(124,58,237,0.12)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" style={{ animation: 'podPulse 3s ease-in-out infinite' }} />
                <text x="80" y="334" textAnchor="middle" fontSize="6" fill="#a78bfa" fontFamily="monospace">pod</text>

                <polygon points="165,310 182,320 182,340 165,350 148,340 148,320" fill="rgba(59,130,246,0.12)" stroke="rgba(96,165,250,0.55)" strokeWidth="1.2" style={{ animation: 'podPulse 3s ease-in-out infinite 0.5s' }} />
                <text x="165" y="334" textAnchor="middle" fontSize="6" fill="#60a5fa" fontFamily="monospace">pod</text>

                <polygon points="250,310 267,320 267,340 250,350 233,340 233,320" fill="rgba(16,185,129,0.12)" stroke="rgba(52,211,153,0.55)" strokeWidth="1.2" style={{ animation: 'podPulse 3s ease-in-out infinite 1s' }} />
                <text x="250" y="334" textAnchor="middle" fontSize="6" fill="#34d399" fontFamily="monospace">pod</text>

                <polygon points="335,310 352,320 352,340 335,350 318,340 318,320" fill="rgba(245,158,11,0.12)" stroke="rgba(251,191,36,0.5)" strokeWidth="1.2" style={{ animation: 'podPulse 3s ease-in-out infinite 1.5s' }} />
                <text x="335" y="334" textAnchor="middle" fontSize="6" fill="#fbbf24" fontFamily="monospace">pod</text>

                {/* Row 2: 2 staggered pods */}
                <polygon points="122,370 139,380 139,400 122,410 105,400 105,380" fill="rgba(139,92,246,0.12)" stroke="rgba(196,181,253,0.5)" strokeWidth="1.2" style={{ animation: 'podPulse 3s ease-in-out infinite 2s' }} />
                <text x="122" y="394" textAnchor="middle" fontSize="6" fill="#c4b5fd" fontFamily="monospace">pod</text>

                <polygon points="207,370 224,380 224,400 207,410 190,400 190,380" fill="rgba(6,182,212,0.12)" stroke="rgba(34,211,238,0.5)" strokeWidth="1.2" style={{ animation: 'podPulse 3s ease-in-out infinite 2.5s' }} />
                <text x="207" y="394" textAnchor="middle" fontSize="6" fill="#22d3ee" fontFamily="monospace">pod</text>

                {/* Ingress label */}
                <text x="210" y="450" textAnchor="middle" fontSize="8" fill="rgba(167,139,250,0.5)" fontFamily="monospace" letterSpacing="2">INGRESS</text>
                <line x1="150" y1="455" x2="270" y2="455" stroke="rgba(167,139,250,0.2)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Namespace boundary box */}
                <rect x="45" y="295" width="325" height="130" rx="8" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="57" y="308" fontSize="7" fill="rgba(167,139,250,0.45)" fontFamily="monospace">namespace: evaops-prod</text>
              </svg>
            </div>

            {/* App logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#0c0c1e',
                border: '1.5px solid rgba(124, 58, 237, 0.4)',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {authStep !== 'login' ? (
                  <ShieldCheck size={24} style={{ color: '#a78bfa' }} />
                ) : (
                  <img src="/evaops-logo.png" alt="EvaOps Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0
                }}>
                  {authStep !== 'login' ? 'EvaOps Authenticator' : 'EvaOps'}
                </h2>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {authStep !== 'login' ? 'CloudOps Security Gateway' : 'CloudOps Management'}
                </span>
              </div>
            </div>

            {/* Capability / Security Checklist */}
            <div style={{ position: 'relative', zIndex: 2, margin: '40px 0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '16px' }}>
                {authStep !== 'login' ? 'Zero-Trust Security Safeguards' : 'Platform Capabilities'}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(authStep !== 'login' ? [
                  { title: 'Zero-Trust Infrastructure', desc: 'Verifying deployment authority & security policies', icon: ShieldCheck },
                  { title: 'Federated Cloud Gateway', desc: 'Authenticated via enterprise DevOps identity', icon: Lock },
                  { title: 'Multi-Factor Challenge', desc: 'Confirming session ownership with authenticator', icon: Smartphone },
                  { title: 'Dynamic Session Handshake', desc: 'Issuing short-lived ephemeral STS access tokens', icon: Zap }
                ] : [
                  { title: 'Cloud Discovery Scanning', desc: 'Auto-maps SWA and ACA environments', icon: Cloud },
                  { title: 'DNS Automation', desc: 'One-click CNAME binds via GoDaddy API', icon: Globe },
                  { title: 'DevOps Pipelines', desc: 'Committer-driven YML setup templates', icon: Terminal },
                  { title: 'Cost Pulse Analytics', desc: 'Optimization insights & active cost tracking', icon: TrendingDown }
                ]).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0
                    }}>
                      <f.icon size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{f.title}</h4>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo Badge placement */}
            <EsteviaLoginBadge appName="EvaOps" category="Cloud Operations" accentColor="#7c3aed" isInnovationCenter={true} />
          </div>

          {/* Right panel: Authentications */}
          <div style={{
            flex: '1.25',
            padding: '32px 52px',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card, rgba(8,12,22,0.6))',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            <div style={{ maxWidth: '410px', width: '100%', margin: 'auto', padding: '16px 0' }}>
              <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', margin: 0 }}>Access Portal</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>Authenticate using your corporate account to deploy and track workspaces.</p>
                </div>
                {/* Standardized Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                    background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#e2e8f0',
                    outline: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: theme === 'dark' ? '#94a3b8' : '#475569', transition: 'all 0.2s', flexShrink: 0, marginLeft: '12px'
                  }}
                  onMouseEnter={(e) => {
                    const isDark = theme === 'dark';
                    e.currentTarget.style.background = isDark ? "rgba(11,229,142,0.08)" : "rgba(11,229,142,0.06)";
                    e.currentTarget.style.outlineColor = "rgba(11,229,142,0.35)";
                    e.currentTarget.style.color = "#0BE58E";
                  }}
                  onMouseLeave={(e) => {
                    const isDark = theme === 'dark';
                    e.currentTarget.style.background = isDark ? "rgba(15,23,42,0.8)" : "#e2e8f0";
                    e.currentTarget.style.outlineColor = isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1";
                    e.currentTarget.style.color = isDark ? "#94a3b8" : "#475569";
                  }}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>

              {authError && (
                <div style={{
                  padding: '12px 16px', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px',
                  color: '#ef4444', fontSize: '0.85rem', lineHeight: 1.4,
                  marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px'
                }}>
                  <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <div>{authError}</div>
                </div>
              )}

              {authStep === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={handleMicrosoftLoginRedirect}
                    disabled={authLoading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      width: '100%', padding: '13px 10px', borderRadius: '12px',
                      background: 'var(--sso-btn-bg)', border: '1px solid var(--sso-btn-border)',
                      color: 'var(--sso-btn-color)', fontSize: '0.84rem', fontWeight: 700,
                      cursor: authLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', opacity: authLoading ? 0.7 : 1,
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => { if (!authLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}
                  >
                    {ssoLoadingProvider === 'microsoft' ? (
                      <RefreshCw size={18} className="spin-anim" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0H11V11H0V0Z" fill="#F25022" />
                        <path d="M12 0H23V11H12V0Z" fill="#7FBA00" />
                        <path d="M0 12H11V23H0V12Z" fill="#00A1F1" />
                        <path d="M12 12H23V23H12V12Z" fill="#FFB900" />
                      </svg>
                    )}
                    <span>{ssoLoadingProvider === 'microsoft' ? 'Connecting...' : 'Microsoft 365'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-slate)' }}></div>
                    <span style={{ padding: '0 8px', fontWeight: 500 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-slate)' }}></div>
                  </div>

                  {/* Developer Override button */}
                  <button
                    onClick={() => { setShowDevOverrideForm(v => !v); setDevOverrideError(null); }}
                    disabled={authLoading}
                    style={{
                      background: showDevOverrideForm ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                      border: `1px dashed ${showDevOverrideForm ? 'rgba(124, 58, 237, 0.4)' : 'var(--border-slate)'}`,
                      color: 'var(--text-secondary)', padding: '10px 20px',
                      borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer',
                      fontWeight: 500, transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                    onMouseEnter={(e) => { if (!showDevOverrideForm) e.currentTarget.style.color = '#7c3aed'; }}
                    onMouseLeave={(e) => { if (!showDevOverrideForm) e.currentTarget.style.color = ''; }}
                  >
                    <Eye size={14} />
                    Developer Override <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Viewer only)</span>
                  </button>

                  {showDevOverrideForm && (
                    <div style={{
                      background: 'var(--bg-slate)', border: '1px solid var(--border-slate)',
                      borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={12} style={{ color: '#7c3aed' }} />
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
                          background: 'var(--bg-card)', border: '1px solid var(--border-slate)',
                          borderRadius: '8px', color: 'var(--text-primary)',
                          fontSize: '0.86rem', padding: '10px 14px', outline: 'none'
                        }}
                      />
                      {devOverrideError && (
                        <div style={{ fontSize: '0.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={13} />
                          {devOverrideError}
                        </div>
                      )}
                      <button
                        onClick={handleBypassLogin}
                        disabled={authLoading}
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', border: 'none',
                          color: '#ffffff', borderRadius: '8px', padding: '10px 16px', fontSize: '0.86rem',
                          fontWeight: 600, cursor: authLoading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {authLoading ? <RefreshCw size={14} className="spin-anim" /> : <Eye size={14} />}
                        <span>Authenticate as Viewer</span>
                      </button>
                    </div>
                  )}

                  {/* Admin Override button */}
                  <button
                    onClick={() => { setShowAdminOverrideForm(v => !v); setAdminOverrideError(null); }}
                    disabled={authLoading}
                    style={{
                      background: showAdminOverrideForm ? 'rgba(234,88,12,0.08)' : 'transparent',
                      border: `1px dashed ${showAdminOverrideForm ? 'rgba(234,88,12,0.4)' : 'var(--border-slate)'}`,
                      color: '#ea580c', padding: '10px 20px',
                      borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer',
                      fontWeight: 500, transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <ShieldCheck size={14} />
                    Admin Override <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Password required)</span>
                  </button>

                  {showAdminOverrideForm && (
                    <div style={{
                      background: 'var(--bg-slate)', border: '1px solid var(--border-slate)',
                      borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
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
                          background: 'var(--bg-card)', border: '1px solid var(--border-slate)',
                          borderRadius: '8px', color: 'var(--text-primary)',
                          fontSize: '0.86rem', padding: '10px 14px', outline: 'none'
                        }}
                      />
                      <input
                        type="password"
                        placeholder="Admin override password"
                        value={adminOverridePassword}
                        onChange={(e) => setAdminOverridePassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdminOverride(); }}
                        autoComplete="new-password"
                        style={{
                          background: 'var(--bg-card)', border: '1px solid var(--border-slate)',
                          borderRadius: '8px', color: 'var(--text-primary)',
                          fontSize: '0.86rem', padding: '10px 14px', outline: 'none'
                        }}
                      />
                      {adminOverrideError && (
                        <div style={{ fontSize: '0.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={13} />
                          {adminOverrideError}
                        </div>
                      )}
                      <button
                        onClick={handleAdminOverride}
                        disabled={adminOverrideLoading}
                        style={{
                          background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)', border: 'none',
                          color: '#ffffff', borderRadius: '8px', padding: '10px 16px', fontSize: '0.86rem',
                          fontWeight: 600, cursor: adminOverrideLoading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {adminOverrideLoading ? <RefreshCw size={14} className="spin-anim" /> : <ShieldCheck size={14} />}
                        <span>Authenticate as Admin</span>
                      </button>
                    </div>
                  )}

                  {/* Onboarding steps collapsible */}
                  <div style={{ borderTop: '1px solid var(--border-slate)', paddingTop: '16px', textAlign: 'left' }}>
                    <button
                      onClick={() => setShowOnboardingGuide(v => !v)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0',
                        width: '100%', justifyContent: 'center'
                      }}
                    >
                      <Info size={14} style={{ color: '#7c3aed' }} />
                      <span>New to EvaOps? Onboarding Steps</span>
                      {showOnboardingGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showOnboardingGuide && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { step: '1', title: 'Sign in with Microsoft', desc: 'Authenticate with your work/school Azure account.' },
                          { step: '2', title: 'Grant Entra ID Consent', desc: 'Accept permissions to register EvaOps in your tenant.' },
                          { step: '3', title: 'Register Organization', desc: 'Provide organization name and domain details.' },
                          { step: '4', title: 'Unlock Credentials', desc: 'Configure Azure details & DevOps PAT to finish onboarding.' }
                        ].map((s, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              backgroundColor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)',
                              color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginTop: '2px'
                            }}>
                              {s.step}
                            </div>
                            <div>
                              <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{s.title}</h5>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '1px 0 0 0', lineHeight: 1.3 }}>{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {authStep === 'mfa-setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

                  {/* ── Wizard Step Progress Bar ── */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {[1, 2, 3].map((step, idx) => {
                        const labels = ['Get App', 'Scan QR', 'Verify'];
                        const isActive = mfaSetupStep === step;
                        const isDone = mfaSetupStep > step;
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < 2 ? '1' : undefined }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
                              <div style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: isDone ? 'var(--accent-teal)' : isActive ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.05)',
                                border: isDone || isActive ? '2px solid var(--accent-teal)' : '2px solid var(--glass-border)',
                                color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                                fontWeight: 800, fontSize: '0.76rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isActive ? '0 0 0 4px rgba(16,185,129,0.15)' : 'none',
                                transition: 'all 0.3s ease'
                              }}>
                                {isDone ? '✓' : step}
                              </div>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isActive ? 'var(--accent-teal)' : isDone ? 'var(--accent-teal)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {labels[idx]}
                              </span>
                            </div>
                            {idx < 2 && (
                              <div style={{ flex: 1, height: '2px', background: mfaSetupStep > step ? 'var(--accent-teal)' : 'var(--glass-border)', margin: '0 6px', marginBottom: '16px', transition: 'background 0.3s ease' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Step 1: Get Authenticator App ── */}
                  {mfaSetupStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.5rem' }}>📲</div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Install an Authenticator App</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>You need a TOTP authenticator app to generate secure login codes.</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          { name: 'Google Authenticator', platforms: 'iOS · Android', ios: 'https://apps.apple.com/app/google-authenticator/id388497605', android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2', color: '#4285F4', icon: '🔵' },
                          { name: 'Microsoft Authenticator', platforms: 'iOS · Android', ios: 'https://apps.apple.com/app/microsoft-authenticator/id983156458', android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator', color: '#0078D4', icon: '🛡️' },
                          { name: 'Authy', platforms: 'iOS · Android', ios: 'https://apps.apple.com/app/twilio-authy/id494168017', android: 'https://play.google.com/store/apps/details?id=com.authy.authy', color: '#E21D38', icon: '🔴' },
                          { name: 'Aegis Authenticator', platforms: 'Android only', ios: null, android: 'https://play.google.com/store/apps/details?id=com.beemdevelopment.aegis', color: '#f5a623', icon: '🟡' }
                        ].map(app => (
                          <div key={app.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <span style={{ fontSize: '1rem' }}>{app.icon}</span>
                              <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{app.name}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{app.platforms}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {app.ios && <a href={app.ios} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6rem', fontWeight: 700, color: app.color, textDecoration: 'none', padding: '2px 7px', borderRadius: '99px', background: `${app.color}18`, border: `1px solid ${app.color}30` }}>📱 iOS</a>}
                              {app.android && <a href={app.android} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6rem', fontWeight: 700, color: app.color, textDecoration: 'none', padding: '2px 7px', borderRadius: '99px', background: `${app.color}18`, border: `1px solid ${app.color}30` }}>🤖 Android</a>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        ✅ Any <strong style={{ color: 'var(--text-primary)' }}>RFC 6238 TOTP</strong> app works — including Apple Passwords and 1Password.
                      </div>

                      <button className="btn-primary" onClick={() => setMfaSetupStep(2)} style={{ padding: '11px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        I have an App — Next: Scan QR →
                      </button>
                      <button className="btn-secondary" onClick={() => { setAuthStep('login'); setMfaCode(''); }} style={{ padding: '9px', fontSize: '0.8rem' }}>Cancel</button>
                    </div>
                  )}

                  {/* ── Step 2: Scan QR Code ── */}
                  {mfaSetupStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Scan the QR Code</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Open your authenticator app and scan the code below</p>
                      </div>

                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', display: 'inline-block', border: '1px solid #ddd', boxShadow: '0 4px 18px rgba(0,0,0,0.12)' }}>
                          {mfaOtpauthUrl ? (
                            <>
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mfaOtpauthUrl)}`} alt="MFA QR Code" style={{ display: 'block', width: '180px', height: '180px' }} />
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '4px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #ddd' }}>
                                <img src="/evaops-logo.png" alt="DevOps Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', display: 'block' }} />
                              </div>
                            </>
                          ) : (
                            <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '0.8rem' }}><RefreshCw size={20} className="spin-anim" /></div>
                          )}
                        </div>
                      </div>

                      {/* App Account Preview Card */}
                      {mfaOtpauthUrl && (() => {
                        try {
                          const parsed = new URL(mfaOtpauthUrl);
                          const pathname = decodeURIComponent(parsed.pathname.replace(/^\/\/?totp\//, ''));
                          const issuer = parsed.searchParams.get('issuer') || '';
                          const displayIssuer = formatIssuerWithEnv(issuer, 'EvaOps');
                          const account = pathname.includes(':') ? pathname.split(':').slice(1).join(':') : pathname;
                          return (
                            <div style={{ width: '100%' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>
                                📱 This will appear in your app as:
                              </span>
                              <AuthenticatorPreviewCard issuer={displayIssuer} account={account} />
                            </div>
                          );
                        } catch { return null; }
                      })()}

                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)', borderRadius: '8px', padding: '10px 14px' }}>
                        <p style={{ margin: '0 0 5px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Can't scan? Enter this key manually:</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ flex: 1, fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-teal)', letterSpacing: '1.5px', wordBreak: 'break-all' }}>{mfaSecret}</code>
                          <button type="button" onClick={() => navigator.clipboard.writeText(mfaSecret)} style={{ padding: '5px 9px', borderRadius: '7px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>📋 Copy</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button className="btn-secondary" onClick={() => setMfaSetupStep(1)} style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}>← Back</button>
                        <button className="btn-primary" onClick={() => setMfaSetupStep(3)} style={{ flex: 2, padding: '10px', fontSize: '0.84rem' }}>I've scanned it — Next: Verify →</button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Verify Code ── */}
                  {mfaSetupStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.5rem' }}>🔐</div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Enter Verification Code</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Open your authenticator app and enter the 6-digit code shown for <strong>Estevia</strong>.</p>
                      </div>

                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000 000"
                        value={mfaCode}
                        autoFocus
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                          borderRadius: '10px', color: 'var(--text-primary)', textAlign: 'center',
                          fontSize: '1.6rem', padding: '12px', letterSpacing: '0.25em', outline: 'none',
                          fontWeight: 700, fontVariantNumeric: 'tabular-nums'
                        }}
                      />
                      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-8px' }}>Code refreshes every 30 seconds</p>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-secondary" onClick={() => setMfaSetupStep(2)} style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}>← Back</button>
                        <button
                          className="btn-primary"
                          disabled={authLoading || mfaCode.length !== 6}
                          onClick={() => handleVerifyMfaSetupCode(mfaCode)}
                          style={{ flex: 2, padding: '11px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
                        >
                          {authLoading && <RefreshCw size={14} className="spin-anim" />}
                          ✓ Verify & Activate MFA
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {authStep === 'mfa-verify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '8px 0 12px 0' }}>
                  {/* Premium Dual-Theme Multi-Mode MFA Selector Pills */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    padding: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}>
                    {[
                      { key: 'totp', label: 'TOTP', icon: '📱' },
                      { key: 'email', label: 'Email', icon: '✉️', action: () => { if (!emailOtpSent) handleSendEmailOtp(); } },
                      { key: 'backup', label: 'Backup', icon: '🔑' }
                    ].map(tab => {
                      const isActive = mfaActiveMode === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => {
                            setMfaActiveMode(tab.key as any);
                            if (tab.action) tab.action();
                          }}
                          style={{
                            padding: '9px 4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            borderRadius: '10px',
                            border: isActive ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
                            background: isActive
                              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                              : 'transparent',
                            color: isActive ? '#ffffff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            boxShadow: isActive ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {mfaActiveMode === 'email' ? 'Email Security Passcode' : mfaActiveMode === 'backup' ? 'Emergency Backup Recovery Code' : 'MFA Verification'}
                  </h4>

                  {/* ✉️ EMAIL OTP MODE */}
                  {mfaActiveMode === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '4px', boxSizing: 'border-box' }}
                      />
                      <button type="button" onClick={handleVerifyEmailOtp} disabled={authLoading} className="btn-primary" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {authLoading ? <RefreshCw size={15} className="spin-anim" /> : null}
                        <span>{authLoading ? 'Verifying Email Passcode...' : 'Verify Email Passcode'}</span>
                      </button>
                      <button type="button" onClick={handleSendEmailOtp} disabled={emailLoading} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: emailLoading ? 'not-allowed' : 'pointer', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {emailLoading && <RefreshCw size={13} className="spin-anim" />}
                        <span>{emailLoading ? 'Sending Passcode...' : 'Resend Email Passcode'}</span>
                      </button>
                    </div>
                  )}

                  {/* 🔑 BACKUP RECOVERY CODE MODE */}
                  {mfaActiveMode === 'backup' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="XXXX-XXXX"
                        maxLength={9}
                        value={backupCode}
                        onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px', boxSizing: 'border-box' }}
                      />
                      <button type="button" onClick={handleVerifyBackupCode} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                        Validate Emergency Recovery Code
                      </button>
                      {backupCodesList && (
                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: 'rgba(124,58,237,0.1)', padding: '8px', borderRadius: '8px' }}>
                          {backupCodesList.map((c, i) => <code key={i} style={{ fontSize: '10px', color: '#c084fc' }}>{c}</code>)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!mfaTempToken) return;
                          try {
                            const res = await fetch(`${API_BASE}/mfa/generate-recovery-codes`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tempToken: mfaTempToken })
                            });
                            const data = await res.json();
                            if (data.backupCodes) setBackupCodesList(data.backupCodes);
                          } catch (e) { }
                        }}
                        style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Generate 8 Emergency Backup Recovery Keys
                      </button>
                    </div>
                  )}

                  {/* 📱 TOTP DEFAULT MODE */}
                  {mfaActiveMode === 'totp' && (
                    <>
                      {/* App Account Preview Card */}
                      {(mfaRegIssuer || mfaRegName) && (
                        <div style={{ marginBottom: '14px' }}>
                          <AuthenticatorPreviewCard issuer={mfaRegIssuer} account={mfaRegName} />
                        </div>
                      )}

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Please enter the 6-digit verification code from your authenticator app:</p>

                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        style={{
                          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                          borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center',
                          fontSize: '1.5rem', padding: '10px', letterSpacing: '0.2em', outline: 'none'
                        }}
                      />

                      <button
                        className="btn-primary"
                        disabled={authLoading || mfaCode.length !== 6}
                        onClick={() => handleValidateMfaCode(mfaCode)}
                        style={{ width: '100%', padding: '12px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
                      >
                        {authLoading && <RefreshCw size={14} className="spin-anim" />}
                        Verify Identity
                      </button>
                    </>
                  )}

                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                      onClick={handleRequestMfaReset}
                      disabled={authLoading}
                      style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Lost Authenticator App? Request MFA Reset
                    </button>
                  </div>

                  <button
                    className="btn-secondary"
                    onClick={() => { setAuthStep('login'); setMfaCode(''); }}
                    style={{ width: '100%', padding: '10px', fontSize: '0.84rem', marginTop: '8px' }}
                  >
                    Back to Access Portal
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  const tabLoadingMap: Record<string, boolean> = {
    scan: scanning,
    provision: loadingRepos || loadingBranches || loadingMetadata,
    cost: loadingCosts,
    optimization: loadingCosts,
    databases: loadingDbServers || loadingDatabases || loadingSchema,
    users: loadingUsers,
    events: loadingAuditLogsForEvents,
  };

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
        onOpenEmailTemplates={() => setActiveTab('emails')}
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

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Administrator Email Address</label>
                    <input
                      type="email"
                      value={onboardAdminEmail}
                      onChange={(e) => setOnboardAdminEmail(e.target.value)}
                      placeholder="admin@yourdomain.com"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Billing Currency</label>
                    <select
                      value={onboardBillingCurrency}
                      onChange={(e) => setOnboardBillingCurrency(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="USD">USD ($) — International Pricing</option>
                      <option value="INR">INR (₹) — India Regional Pricing</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600 }}>Choose Initial Packages</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {/* DevOps Package Card */}
                      <div
                        onClick={() => setOnboardDevopsSub(!onboardDevopsSub)}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: `1px solid ${onboardDevopsSub ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                          background: onboardDevopsSub ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.005)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>🚀 DevOps Package</span>
                          <input type="checkbox" checked={onboardDevopsSub} readOnly style={{ cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {onboardBillingCurrency === 'USD' ? '$150.00 / mo' : '₹12,500 / mo'}
                        </span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                          SWA/ACA Provisioning, Pipelines, Domains
                        </span>
                      </div>

                      {/* Developer Package Card */}
                      <div
                        onClick={() => setOnboardDevSub(!onboardDevSub)}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: `1px solid ${onboardDevSub ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                          background: onboardDevSub ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.005)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>💻 Developer Package</span>
                          <input type="checkbox" checked={onboardDevSub} readOnly style={{ cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {onboardBillingCurrency === 'USD' ? '$99.00 / mo' : '₹8,250 / mo'}
                        </span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                          Databases, SQL Exec, Git Explorer, YML Templates
                        </span>
                      </div>

                      {/* Security Package Card */}
                      <div
                        onClick={() => setOnboardSecSub(!onboardSecSub)}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: `1px solid ${onboardSecSub ? 'var(--accent-teal)' : 'var(--glass-border)'}`,
                          background: onboardSecSub ? 'rgba(20,184,166,0.06)' : 'rgba(255,255,255,0.005)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>🛡️ Security Package</span>
                          <input type="checkbox" checked={onboardSecSub} readOnly style={{ cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {onboardBillingCurrency === 'USD' ? '$120.00 / mo' : '₹10,000 / mo'}
                        </span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                          Compliance Scanner, Remediation, Eva AI Costs
                        </span>
                      </div>
                    </div>
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
        ) : (requiresCredentialSetup && activeTab !== 'credentials') ? (
          /* ── Credential Gate Screen ─────────────────────────────────────── */
          <div style={{ maxWidth: '680px', margin: '60px auto', padding: '0 20px' }}>
            <div className="glass-panel" style={{
              padding: '40px',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(15,23,42,0.95) 100%)',
              boxShadow: '0 0 40px rgba(239,68,68,0.08)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px',
                  background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                }}>🔐</div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Action Required — Incomplete Integration Setup
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your workspace is missing critical credentials needed to operate EvaOps.
                  Set up the missing integrations below to unlock full platform access.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {([
                  { key: 'azure', label: 'Azure Service Principal', icon: '☁️' },
                  { key: 'github', label: 'GitHub Platform Token', icon: '🐙' },
                  { key: 'azureDevops', label: 'Azure DevOps PAT', icon: '🔧' },
                  { key: 'godaddy', label: 'GoDaddy Domain API Keys', icon: '🌐' },
                ] as const).map(({ key, label, icon }) => {
                  const isMissing = missingCredentials[key];
                  const canSetup = user?.role === 'owner' || user?.role === 'admin';
                  return (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: '10px',
                      background: isMissing ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
                      border: `1px solid ${isMissing ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{icon}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                          background: isMissing ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                          color: isMissing ? '#f87171' : '#4ade80',
                          border: `1px solid ${isMissing ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                        }}>
                          {isMissing ? '● Missing' : '✓ Connected'}
                        </span>
                        {isMissing && canSetup && (
                          <button
                            onClick={() => setActiveTab('credentials' as any)}
                            style={{
                              fontSize: '0.78rem', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
                              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                              color: '#a5b4fc', cursor: 'pointer',
                            }}
                          >Set up →</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(user?.role === 'owner' || user?.role === 'admin') ? (
                <button
                  onClick={() => setActiveTab('credentials' as any)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: '10px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  🔑  Go to Settings → Credentials
                </button>
              ) : (
                <div style={{
                  padding: '14px 18px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
                  fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6
                }}>
                  ℹ️  Contact your <strong>Owner</strong> or <strong>Admin</strong> to complete the credential setup.
                </div>
              )}
            </div>
          </div>
          /* ── End Credential Gate Screen ─────────────────────────────────── */
        ) : (
          <>
            {/* Unified DevOps Control Centre & Navigation Panel */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', position: 'relative', zIndex: isScopeDropdownOpen ? 999990 : 'auto', overflow: 'visible', border: '1px solid var(--glass-border)' }}>
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

              <div style={{ position: 'relative', zIndex: isScopeDropdownOpen ? 999995 : 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Top Row: Title & Resource Group Dropdown & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: isScopeDropdownOpen ? 999998 : 'auto' }}>
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
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', whiteSpace: 'normal', lineHeight: '1.4' }}>
                      Manage multi-tenant cloud infrastructure, dynamic database catalogs, environment deployments, and cost optimization scopes dynamically linked to Azure.
                    </p>
                  </div>

                  {/* Subscription & Resource Group Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', whiteSpace: 'nowrap', position: 'relative', zIndex: isScopeDropdownOpen ? 999999 : 'auto' }}>
                    {subscriptionsList && subscriptionsList.length > 0 && (() => {
                      const isLight = theme === 'light';
                      const triggerBg = isLight
                        ? (isScopeDropdownOpen ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.03)')
                        : (isScopeDropdownOpen ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.4)');
                      const triggerBorder = isLight
                        ? '1px solid rgba(0, 0, 0, 0.08)'
                        : '1px solid rgba(255, 255, 255, 0.08)';
                      const triggerShadow = isLight && isScopeDropdownOpen
                        ? '0 0 12px rgba(124, 58, 237, 0.15)'
                        : (!isLight && isScopeDropdownOpen)
                          ? '0 0 12px rgba(139, 92, 246, 0.15)'
                          : 'none';
                      const panelBg = isLight ? '#ffffff' : '#0f172a';
                      const panelBorder = isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.16)';
                      const panelShadow = isLight
                        ? '0 20px 25px -5px rgba(0,0,0,0.12), 0 10px 10px -5px rgba(0,0,0,0.06)'
                        : '0 20px 25px -5px rgba(0,0,0,0.8), 0 10px 10px -5px rgba(0,0,0,0.6)';
                      const subHeaderBg = isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.01)';
                      const subHeaderBorder = isLight ? '1px solid rgba(0, 0, 0, 0.04)' : '1px solid rgba(255, 255, 255, 0.03)';

                      return (
                        <div ref={scopeDropdownRef} style={{ position: 'relative', zIndex: isScopeDropdownOpen ? 1000000 : 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', whiteSpace: 'nowrap', width: '100%', minWidth: '280px', maxWidth: '440px' }}>
                          <style>{`
                            .scope-dropdown-item {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              padding: 9px 18px 9px 24px;
                              color: var(--text-secondary);
                              font-size: 0.8rem;
                              font-weight: 500;
                              cursor: pointer;
                              transition: all 0.15s ease;
                              background: transparent;
                            }
                            .scope-dropdown-item:hover {
                              background: ${isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'};
                              color: var(--text-primary);
                            }
                            .scope-dropdown-item.selected {
                              background: ${isLight ? 'rgba(124, 58, 237, 0.08)' : 'rgba(139, 92, 246, 0.12)'};
                              color: var(--primary);
                              font-weight: 600;
                            }
                            .scope-dropdown-scrollbar::-webkit-scrollbar {
                              width: 5px;
                            }
                            .scope-dropdown-scrollbar::-webkit-scrollbar-track {
                              background: transparent;
                            }
                            .scope-dropdown-scrollbar::-webkit-scrollbar-thumb {
                              background: ${isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)'};
                              border-radius: 4px;
                            }
                            .scope-dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
                              background: ${isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)'};
                            }
                          `}</style>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Target Scope:</span>
                            {!scanning && scanProgress === 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.12)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Connected</span>
                              </div>
                            )}
                          </div>

                          {/* Selector Trigger Button */}
                          <div
                            onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              border: isCurrentSubscriptionInactive ? '1px solid rgba(239, 68, 68, 0.4)' : triggerBorder,
                              backgroundColor: isCurrentSubscriptionInactive ? (isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.14)') : triggerBg,
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              userSelect: 'none',
                              width: '100%',
                              justifyContent: 'space-between',
                              boxShadow: isCurrentSubscriptionInactive ? '0 0 12px rgba(239, 68, 68, 0.15)' : triggerShadow
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left', overflow: 'hidden' }}>
                              {(() => {
                                const isGuid = (str: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test((str || '').trim());
                                const rawSubName = currentSub ? (currentSub.displayName || currentSub.name || currentSub.subscriptionName || currentSub.id) : selectedSubscriptionId;
                                const isRawId = isGuid(rawSubName) || (currentSub && (!currentSub.displayName || currentSub.displayName === currentSub.id));
                                return (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                    <span style={{
                                      fontSize: '0.66rem',
                                      fontWeight: 700,
                                      color: isCurrentSubscriptionInactive ? '#ef4444' : (isRawId ? '#f59e0b' : (isLight ? 'rgba(0, 0, 0, 0.45)' : '#94a3b8')),
                                      fontFamily: isRawId ? 'monospace' : 'inherit',
                                      textTransform: isRawId ? 'none' : 'uppercase',
                                      letterSpacing: '0.04em',
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {rawSubName}
                                    </span>
                                    {isRawId && (
                                      <span style={{
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        padding: '1px 4px',
                                        borderRadius: '4px',
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        border: '1px solid rgba(245, 158, 11, 0.4)',
                                        color: '#f59e0b',
                                        flexShrink: 0
                                      }}>
                                        ID ONLY
                                      </span>
                                    )}
                                    {isCurrentSubscriptionInactive && (
                                      <span style={{
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        padding: '1px 4px',
                                        borderRadius: '4px',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        color: '#ef4444',
                                        flexShrink: 0
                                      }}>
                                        RESTRICTED
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                              <div style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}>
                                {selectedControlResourceGroup}
                              </div>
                            </div>
                            <ChevronDown
                              size={14}
                              style={{
                                color: isCurrentSubscriptionInactive ? '#ef4444' : 'var(--text-secondary)',
                                transition: 'transform 0.2s ease',
                                transform: isScopeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                flexShrink: 0
                              }}
                            />
                          </div>

                          {/* Custom Dropdown Panel */}
                          {isScopeDropdownOpen && (
                            <div
                              className="scope-dropdown-scrollbar"
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                minWidth: '340px',
                                width: 'max-content',
                                maxWidth: '480px',
                                maxHeight: '350px',
                                overflowY: 'auto',
                                zIndex: 999999,
                                borderRadius: '12px',
                                border: panelBorder,
                                backgroundColor: panelBg,
                                backdropFilter: 'blur(20px)',
                                boxShadow: panelShadow,
                                padding: '10px 0',
                                animation: 'fade-in-anim 0.15s ease-out'
                              }}
                            >
                              {subscriptionsList.map((sub) => {
                                const isGuid = (str: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test((str || '').trim());
                                const hasDisplayName = sub.displayName && sub.displayName !== sub.id && !isGuid(sub.displayName);
                                const hasName = sub.name && sub.name !== sub.id && !isGuid(sub.name);
                                const subName = hasDisplayName ? sub.displayName : (hasName ? sub.name : (sub.subscriptionName || sub.id));
                                const isRawId = !hasDisplayName && !hasName;
                                const statusLow = (sub.status || sub.state || '').toLowerCase();
                                const isExplicitRestricted = sub.isRestricted === true || sub.is_restricted === true || sub.restricted === true;
                                const isRestricted = isExplicitRestricted || statusLow === 'restricted' || statusLow === 'disabled' || statusLow === 'inactive' || statusLow === 'read-only' || statusLow === 'warned' || statusLow === 'pastdue';
                                const isActive = !isRestricted && (statusLow === 'active' || statusLow === 'enabled' || statusLow === 'ready' || statusLow === '');
                                const statusColor = isActive ? '#10b981' : isRestricted ? '#ef4444' : '#64748b';
                                const statusText = isRestricted ? (sub.status || sub.state || 'restricted') : (sub.status || sub.state || 'active');

                                const headerTopBorder = isRestricted
                                  ? '1px solid rgba(239, 68, 68, 0.35)'
                                  : isActive
                                    ? '1px solid rgba(16, 185, 129, 0.35)'
                                    : subHeaderBorder;

                                const headerBottomBorder = isRestricted
                                  ? '1px solid rgba(239, 68, 68, 0.35)'
                                  : isActive
                                    ? '1px solid rgba(16, 185, 129, 0.35)'
                                    : subHeaderBorder;

                                const headerBgColor = isRestricted
                                  ? (isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.14)')
                                  : isActive
                                    ? (isLight ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.1)')
                                    : subHeaderBg;

                                return (
                                  <div key={sub.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                    {/* Subscription Header */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 16px',
                                      backgroundColor: headerBgColor,
                                      borderTop: headerTopBorder,
                                      borderBottom: headerBottomBorder,
                                      marginTop: '6px'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '260px', overflow: 'hidden' }}>
                                        <span style={{
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          color: isRestricted ? '#ef4444' : (isActive ? '#10b981' : (isRawId ? '#f59e0b' : (isLight ? 'rgba(0, 0, 0, 0.55)' : '#94a3b8'))),
                                          fontFamily: isRawId ? 'monospace' : 'inherit',
                                          textTransform: isRawId ? 'none' : 'uppercase',
                                          letterSpacing: '0.04em',
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {subName}
                                        </span>
                                        {isRawId && (
                                          <span style={{
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            padding: '1px 4px',
                                            borderRadius: '4px',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            border: '1px solid rgba(245, 158, 11, 0.4)',
                                            color: '#f59e0b',
                                            flexShrink: 0
                                          }}>
                                            ID ONLY
                                          </span>
                                        )}
                                      </div>

                                      {/* Status Badge */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{
                                          width: '6px',
                                          height: '6px',
                                          borderRadius: '50%',
                                          backgroundColor: statusColor,
                                          boxShadow: `0 0 6px ${statusColor}`
                                        }} />
                                        <span style={{
                                          fontSize: '0.68rem',
                                          color: isRestricted ? '#ef4444' : (isActive ? '#10b981' : (isLight ? 'rgba(0, 0, 0, 0.45)' : '#64748b')),
                                          textTransform: 'capitalize',
                                          fontWeight: (isRestricted || isActive) ? 700 : 600
                                        }}>
                                          {isRestricted ? '⛔ restricted' : statusText}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Resource Groups */}
                                    {(sub.resourceGroups || []).map((rg: string) => {
                                      const isSelected = selectedSubscriptionId === sub.id && selectedControlResourceGroup === rg;
                                      return (
                                        <div
                                          key={`${sub.id}/${rg}`}
                                          className={`scope-dropdown-item ${isSelected ? 'selected' : ''}`}
                                          onClick={() => {
                                            setSelectedSubscriptionId(sub.id);
                                            localStorage.setItem('selectedControlSubscriptionId', sub.id);

                                            const matchedSub = subscriptionsList.find(s => s.id === sub.id);
                                            const rgs = matchedSub ? matchedSub.resourceGroups || [] : [];
                                            setControlResourceGroups(rgs);

                                            setSelectedControlResourceGroup(rg);
                                            localStorage.setItem('selectedControlResourceGroup', rg);

                                            setIsScopeDropdownOpen(false);
                                            handleScan(rg, false, false, sub.id);
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Database size={13} style={{ opacity: isSelected ? 1 : 0.4, color: isSelected ? (isLight ? '#7c3aed' : '#a78bfa') : 'inherit' }} />
                                            <span>{rg}</span>
                                          </div>
                                          {rg === primaryResourceGroup && (
                                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)', color: isLight ? 'rgba(0,0,0,0.45)' : '#64748b', fontWeight: 600 }}>
                                              Primary
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--divider)', margin: '0' }} />

                {/* ── Restriction Banners (Grace, Restricted, Suspended) ── */}
                {isOrgDisabled && (
                  <div style={{
                    margin: '8px 0 12px 0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.08) 100%)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    boxShadow: '0 0 20px rgba(239,68,68,0.06), inset 0 0 20px rgba(239,68,68,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fade-in-anim 0.3s ease-out'
                  }}>
                    <AlertTriangle size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.84rem', color: '#fca5a5', lineHeight: 1.5 }}>
                      <strong style={{ color: '#f87171' }}>Account Suspended:</strong> Access is limited to Billing &amp; Licensing due to outstanding invoices overdue by more than 45 days. Please clear your balance in <strong>Licensing</strong> to restore full service.
                    </div>
                  </div>
                )}

                {isOrgRestricted && (
                  <div style={{
                    margin: '8px 0 12px 0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(239,68,68,0.06) 100%)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    boxShadow: '0 0 20px rgba(245,158,11,0.08), inset 0 0 20px rgba(245,158,11,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fade-in-anim 0.3s ease-out'
                  }}>
                    <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <strong style={{ color: '#f59e0b' }}>Write Operations Restricted:</strong> Your account is restricted because an invoice is overdue by <strong>{maxOverdueDays} days</strong> (grace period expired). Full access block will trigger after 45 days. Please settle your balance in <strong>Licensing</strong>.
                    </div>
                  </div>
                )}

                {isOrgGrace && (
                  <div style={{
                    margin: '8px 0 12px 0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    boxShadow: '0 0 20px rgba(245,158,11,0.06), inset 0 0 20px rgba(245,158,11,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fade-in-anim 0.3s ease-out'
                  }}>
                    <Info size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <strong style={{ color: '#f59e0b' }}>Billing Grace Period:</strong> You have an unpaid invoice overdue by <strong>{maxOverdueDays} days</strong>. Access is currently active, but write operations will be restricted after 30 days. Please clear your balance in <strong>Licensing</strong>.
                    </div>
                  </div>
                )}

                {/* ── Key Expiration Warning Banner ── */}
                {credentialAlerts && credentialAlerts.length > 0 && (
                  <div style={{
                    margin: '8px 0 12px 0',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    background: credentialAlerts.some(a => a.isExpired)
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.06) 100%)'
                      : 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(202,138,4,0.06) 100%)',
                    border: credentialAlerts.some(a => a.isExpired)
                      ? '1px solid rgba(239,68,68,0.3)'
                      : '1px solid rgba(245,158,11,0.3)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    animation: 'fade-in-anim 0.3s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <AlertTriangle size={18} style={{
                        color: credentialAlerts.some(a => a.isExpired) ? '#ef4444' : '#f59e0b',
                        flexShrink: 0
                      }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <style>{`
                          .alert-pill {
                            position: relative;
                            transition: all 0.2s ease;
                          }
                          .alert-pill:hover {
                            transform: translateY(-1px);
                          }
                          .alert-pill-tooltip {
                            visibility: hidden;
                            opacity: 0;
                            position: absolute;
                            bottom: 130%;
                            left: 50%;
                            transform: translateX(-50%);
                            background: rgba(15, 23, 42, 0.95);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            color: #f8fafc;
                            padding: 8px 12px;
                            border-radius: 8px;
                            font-size: 0.74rem;
                            white-space: nowrap;
                            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
                            z-index: 100;
                            transition: opacity 0.2s, visibility 0.2s;
                            pointer-events: none;
                            font-weight: 500;
                          }
                          .alert-pill:hover .alert-pill-tooltip {
                            visibility: visible;
                            opacity: 1;
                          }
                          .alert-pill-tooltip::after {
                            content: "";
                            position: absolute;
                            top: 100%;
                            left: 50%;
                            margin-left: -5px;
                            border-width: 5px;
                            border-style: solid;
                            border-color: rgba(15, 23, 42, 0.95) transparent transparent transparent;
                          }
                        `}</style>
                        {credentialAlerts.map((alert, idx) => {
                          const providerLabel = alert.provider === 'github' ? 'GitHub Platform Token'
                            : alert.provider === 'azure_devops' ? 'Azure DevOps PAT'
                              : alert.provider === 'azure' ? 'Azure Service Principal'
                                : alert.provider.toUpperCase();
                          const providerLabelShort = alert.provider === 'github' ? 'GitHub PAT'
                            : alert.provider === 'azure_devops' ? 'Azure DevOps'
                              : alert.provider === 'azure' ? 'Azure Principal'
                                : alert.provider.toUpperCase();

                          const pillBg = alert.isExpired
                            ? 'rgba(239,68,68,0.12)'
                            : 'rgba(245,158,11,0.12)';
                          const pillBorder = alert.isExpired
                            ? '1px solid rgba(239,68,68,0.3)'
                            : '1px solid rgba(245,158,11,0.3)';
                          const pillColor = alert.isExpired
                            ? '#ef4444'
                            : (theme === 'light' ? '#b45309' : '#fbbf24');

                          return (
                            <div
                              key={idx}
                              className="alert-pill"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                background: pillBg,
                                border: pillBorder,
                                color: pillColor,
                                cursor: 'help'
                              }}
                            >
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: alert.isExpired ? '#ef4444' : '#fbbf24'
                              }} />
                              <span>{providerLabelShort}: {alert.isExpired ? 'Expired' : `${alert.daysRemaining}d`}</span>

                              <div className="alert-pill-tooltip">
                                {alert.isExpired
                                  ? `Your ${providerLabel} has EXPIRED. Critical integrations are inactive.`
                                  : `Your ${providerLabel} will expire in ${alert.daysRemaining} days (on ${new Date(alert.expiresAt).toLocaleDateString()}).`
                                }
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {(user?.role === 'owner' || user?.role === 'admin') && (
                      <button
                        onClick={() => setActiveTab('credentials')}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-primary)',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--divider)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; }}
                      >
                        Manage Credentials
                      </button>
                    )}
                  </div>
                )}

                {/* Bottom Row: Tab buttons grid */}
                <div className="premium-tabs-grid">
                  <button
                    className={`premium-tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
                    onClick={() => {
                      if (!subPackageDevops) {
                        setUpgradePackageModal('DevOps');
                      } else {
                        setActiveTab('scan');
                        setScanSubTab('discovery');
                      }
                    }}
                    disabled={requiresCredentialSetup || isOrgDisabled}
                  >
                    <Server size={16} />
                    <span>Cloud Scanning</span>
                    {!subPackageDevops && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                        boxSizing: 'border-box'
                      }}>
                        <Lock size={9} />
                      </div>
                    )}
                    {tabLoadingMap.scan && (
                      <span className="tab-loading-spin" title="Scanning cloud..." />
                    )}
                    {activeBuildsCount > 0 && (
                      <span className="tab-build-spin" title={`${activeBuildsCount} build(s) in progress`} />
                    )}
                    <div className="menu-hover-card menu-hover-card-left">
                      <div className="menu-hover-card-title"><Server size={12} /> Cloud Scanning {!subPackageDevops && '🔒'}</div>
                      <div className="menu-hover-card-desc">Scan and monitor all your Azure Static Web Apps, backend APIs, and virtual machines across environments.</div>
                    </div>
                  </button>
                  <button
                    className={`premium-tab-btn ${activeTab === 'provision' ? 'active' : ''}`}
                    onClick={() => {
                      if (!subPackageDevops) {
                        setUpgradePackageModal('DevOps');
                      } else {
                        setActiveTab('provision');
                      }
                    }}
                    disabled={requiresCredentialSetup || isOrgDisabled}
                  >
                    <GitBranch size={16} />
                    <span>Provision & Pipelines</span>
                    {!subPackageDevops && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                        boxSizing: 'border-box'
                      }}>
                        <Lock size={9} />
                      </div>
                    )}
                    {tabLoadingMap.provision && (
                      <span className="tab-loading-spin" title="Loading..." />
                    )}
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><GitBranch size={12} /> Provision & Pipelines {!subPackageDevops && '🔒'}</div>
                      <div className="menu-hover-card-desc">Provision Azure Static Web Apps, backend containers, and execute serverless CI/CD build pipelines.</div>
                    </div>
                  </button>
                  <button
                    className={`premium-tab-btn ${activeTab === 'cost' ? 'active' : ''}`}
                    onClick={() => {
                      if (!subPackageSecurity) {
                        setUpgradePackageModal('Security');
                      } else {
                        setActiveTab('cost');
                        setCostTab('breakdown');
                      }
                    }}
                    disabled={requiresCredentialSetup || isOrgDisabled}
                  >
                    <TrendingDown size={16} />
                    <span>Cost Management</span>
                    {!subPackageSecurity && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                        boxSizing: 'border-box'
                      }}>
                        <Lock size={9} />
                      </div>
                    )}
                    {(tabLoadingMap.cost || tabLoadingMap.optimization) && (
                      <span className="tab-loading-spin" title="Loading costs..." />
                    )}
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><TrendingDown size={12} /> Cost Management {!subPackageSecurity && '🔒'}</div>
                      <div className="menu-hover-card-desc">View a detailed Azure cost breakdown, billing invoices, and AI-driven recommendations to right-size resources, configure schedules, and optimize cloud spend.</div>
                    </div>
                  </button>
                  <button
                    className={`premium-tab-btn ${activeTab === 'databases' ? 'active' : ''}`}
                    onClick={() => {
                      if (!subPackageDeveloper) {
                        setUpgradePackageModal('Developer');
                      } else {
                        setActiveTab('databases');
                      }
                    }}
                    disabled={requiresCredentialSetup || isOrgDisabled}
                  >
                    <Database size={16} />
                    <span>DB Hub</span>
                    {!subPackageDeveloper && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                        boxSizing: 'border-box'
                      }}>
                        <Lock size={9} />
                      </div>
                    )}
                    {tabLoadingMap.databases && (
                      <span className="tab-loading-spin" title="Loading databases..." />
                    )}
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><Database size={12} /> DB Hub {!subPackageDeveloper && '🔒'}</div>
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
                    <button className={`premium-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} disabled={requiresCredentialSetup}>
                      <Users size={16} />
                      <span>Team Settings</span>
                      {tabLoadingMap.users && (
                        <span className="tab-loading-spin" title="Loading users..." />
                      )}
                      <div className="menu-hover-card">
                        <div className="menu-hover-card-title"><Users size={12} /> Team Settings</div>
                        <div className="menu-hover-card-desc">Invite team members, assign roles (owner / admin / viewer), and review the full organisation audit trail.</div>
                      </div>
                    </button>
                  )}
                  {(user?.role === 'owner' || user?.role === 'admin') && (
                    <button className={`premium-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} disabled={requiresCredentialSetup}>
                      <Settings size={16} />
                      <span>Licensing</span>
                      <div className="menu-hover-card">
                        <div className="menu-hover-card-title"><Settings size={12} /> Licensing</div>
                        <div className="menu-hover-card-desc">Manage subscription tiers, operator seat limits, and compliance downgrade controls for your organisation.</div>
                      </div>
                    </button>
                  )}

                  <button
                    className={`premium-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => {
                      if (!subPackageDevops) {
                        setUpgradePackageModal('DevOps');
                      } else {
                        setActiveTab('events');
                      }
                    }}
                    disabled={requiresCredentialSetup || isOrgDisabled}
                  >
                    <Activity size={16} />
                    <span>Events Feed</span>
                    {!subPackageDevops && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                        boxSizing: 'border-box'
                      }}>
                        <Lock size={9} />
                      </div>
                    )}
                    {tabLoadingMap.events && (
                      <span className="tab-loading-spin" title="Loading events..." />
                    )}
                    {activeBuildsCount > 0 && (
                      <span className="premium-build-badge" title={`${activeBuildsCount} build(s) in progress`}>
                        {activeBuildsCount}
                      </span>
                    )}
                    <div className="menu-hover-card">
                      <div className="menu-hover-card-title"><Activity size={12} /> Events Feed {!subPackageDevops && '🔒'}</div>
                      <div className="menu-hover-card-desc">Real-time stream of build triggers, power actions, scans, and credential changes across the platform.</div>
                    </div>
                  </button>
                  <button className={`premium-tab-btn ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')} disabled={requiresCredentialSetup}>
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
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{getScanProgressMessage(scanProgress)}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{Math.floor(scanProgress)}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                      {[
                        { limit: 40, label: 'Resources' },
                        { limit: 75, label: 'Apps' },
                        { limit: 90, label: 'DB & DNS' },
                        { limit: 96, label: 'Builds' },
                        { limit: 100, label: 'Syncing' }
                      ].map((stage, idx, arr) => {
                        const prevLimit = idx === 0 ? 0 : arr[idx - 1].limit;
                        const range = stage.limit - prevLimit;
                        const segmentProgress = Math.min(100, Math.max(0, ((scanProgress - prevLimit) / range) * 100));
                        return (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              borderRadius: '2px',
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                            title={`${stage.label}: ${Math.round(segmentProgress)}%`}
                          >
                            <div style={{
                              width: `${segmentProgress}%`,
                              height: '100%',
                              backgroundColor: segmentProgress > 0 ? 'var(--accent-purple)' : 'transparent',
                              boxShadow: segmentProgress > 0 ? '0 0 8px var(--accent-purple-glow)' : 'none',
                              transition: 'width 0.15s ease-out'
                            }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Contents */}
            <main style={{ paddingBottom: '80px', position: 'relative' }}>

              {/* Full-Page Translucent Glassmorphism Overlay when Target Scope is Restricted (Operational Tabs Only) */}
              {(isOrgDisabled || isCurrentSubscriptionInactive) && !['settings', 'users', 'credentials', 'licensing', 'guide'].includes(activeTab) && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  minHeight: '600px',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '60px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  background: theme === 'light'
                    ? 'rgba(255, 255, 255, 0.88)'
                    : 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  border: theme === 'light'
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: theme === 'light'
                    ? '0 20px 50px rgba(0, 0, 0, 0.08)'
                    : '0 25px 60px rgba(0, 0, 0, 0.6)',
                  animation: 'fade-in-anim 0.25s ease-out'
                }}>
                  <div style={{
                    maxWidth: '540px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '40px 32px',
                    borderRadius: '20px',
                    background: theme === 'light'
                      ? 'rgba(255, 255, 255, 0.96)'
                      : 'rgba(30, 41, 59, 0.92)',
                    border: theme === 'light'
                      ? '1px solid rgba(0, 0, 0, 0.08)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: theme === 'light'
                      ? '0 20px 40px rgba(0, 0, 0, 0.1)'
                      : '0 25px 50px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: theme === 'light'
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.25) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      boxShadow: theme === 'light'
                        ? '0 8px 24px rgba(239, 68, 68, 0.15)'
                        : '0 0 30px rgba(239, 68, 68, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Lock size={32} style={{ color: '#ef4444' }} />
                    </div>

                    <div>
                      <h2 style={{
                        margin: '0 0 10px 0',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: theme === 'light' ? '#ef4444' : '#ef4444'
                      }}>
                        Target Scope Restricted
                      </h2>
                      <p style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        color: theme === 'light' ? '#475569' : '#94a3b8'
                      }}>
                        Subscription <strong>{currentSub?.displayName || selectedSubscriptionId}</strong> ({selectedControlResourceGroup || 'Selected RG'}) is in <strong>{currentSub?.status || 'restricted'}</strong> status. Cloud resource scanning, database catalogs, provisioning, and cost operations are locked for this scope.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsScopeDropdownOpen(true)}
                        style={{
                          padding: '11px 22px',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Server size={16} /> Switch Target Scope
                      </button>
                      {(user?.role === 'owner' || user?.role === 'admin') && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setActiveTab('settings')}
                          style={{
                            padding: '11px 22px',
                            borderRadius: '10px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          View Licensing & Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: CLOUD RESOURCE SCANNING */}
              {activeTab === 'scan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {renderInactiveSubscriptionWarning()}
                  {/* Cloud Scanning Sub-Menu Tab Bar (Pill Container) */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px',
                    borderRadius: '12px',
                    background: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
                    width: 'fit-content'
                  }}>
                    {[
                      { key: 'discovery', label: 'Resource Discovery', icon: <Globe size={15} /> },
                      { key: 'compliance', label: 'Governance & Compliance', icon: <ShieldCheck size={15} /> },
                      { key: 'observability', label: 'EvaPulse Live Observability', icon: <Activity size={15} /> },
                      { key: 'incidents', label: 'Incidents & Alerts', icon: <AlertTriangle size={15} /> }
                    ].map(tab => {
                      const isActive = scanSubTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          className={`tab-btn tab-btn-cost ${isActive ? 'active' : ''}`}
                          onClick={() => setScanSubTab(tab.key as any)}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            fontWeight: isActive ? 700 : 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: isActive ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'transparent',
                            color: isActive ? '#ffffff' : (theme === 'light' ? '#475569' : 'var(--text-secondary)'),
                            boxShadow: isActive ? '0 2px 12px rgba(139, 92, 246, 0.35)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-Tab Content Switcher */}
                  {scanSubTab === 'discovery' && (
                    <DashboardPage
                      apps={apps as any}
                      scanning={scanning}
                      scanProgress={scanProgress}
                      scanError={scanError}
                      appGroups={appGroups as any}
                      collapsedScanGroups={collapsedScanGroups}
                      setCollapsedScanGroups={setCollapsedScanGroups}
                      toggleGroupScan={toggleGroupScan}
                      deletingAppName={deletingAppName}
                      handleDeleteApp={handleDeleteApp}
                      openDnsModal={openDnsModal}
                      openPipelineModal={openPipelineModal}
                      openDockerfileEditor={openDockerfileEditor}
                      ymlHealthMap={ymlHealthMap}
                      ymlHealthLoading={ymlHealthLoading}
                      handleScan={handleScan}
                      refreshHealthForRepo={refreshHealthForRepo}
                      theme={theme}
                      setSelectedStageForJobs={setSelectedStageForJobs}
                      azureDevopsOrgUrl={azureDevopsOrgUrl}
                      azureDevopsProject={azureDevopsProject}
                      onDeployBranch={handleDeployBranchFromDashboard}
                      currentUser={user}
                      onShowLogs={setActiveLogsAppName}
                      onShowBuildHistory={(app) => setBuildHistoryDrawerApp(app)}
                      livePipelineRuns={livePipelineRuns}
                      setLivePipelineRuns={setLivePipelineRuns}
                      onCloneApp={setCloningApp}
                      onResourceControl={handleResourceControl}
                      controllingResource={controllingResource}
                      onBuildTransition={(title, message, type) => {
                        showToast(title, message, type);
                        addEvent(title, message, 'build', type === 'success' ? 'success' : type === 'error' ? 'failed' : 'info');
                        addNotification(title, message, type === 'success' ? 'success' : type === 'error' ? 'error' : 'info');
                      }}
                      selectedSubscriptionId={selectedSubscriptionId}
                      selectedControlResourceGroup={selectedControlResourceGroup}
                    />
                  )}

                  {scanSubTab === 'compliance' && (
                    <DashboardPage
                      activeSubTab="compliance"
                      apps={apps as any}
                      scanning={scanning}
                      scanProgress={scanProgress}
                      scanError={scanError}
                      appGroups={appGroups as any}
                      collapsedScanGroups={collapsedScanGroups}
                      setCollapsedScanGroups={setCollapsedScanGroups}
                      toggleGroupScan={toggleGroupScan}
                      deletingAppName={deletingAppName}
                      handleDeleteApp={handleDeleteApp}
                      openDnsModal={openDnsModal}
                      openPipelineModal={openPipelineModal}
                      openDockerfileEditor={openDockerfileEditor}
                      ymlHealthMap={ymlHealthMap}
                      ymlHealthLoading={ymlHealthLoading}
                      handleScan={handleScan}
                      refreshHealthForRepo={refreshHealthForRepo}
                      theme={theme}
                      setSelectedStageForJobs={setSelectedStageForJobs}
                      azureDevopsOrgUrl={azureDevopsOrgUrl}
                      azureDevopsProject={azureDevopsProject}
                      onDeployBranch={handleDeployBranchFromDashboard}
                      currentUser={user}
                      onShowLogs={setActiveLogsAppName}
                      onShowBuildHistory={(app) => setBuildHistoryDrawerApp(app)}
                      livePipelineRuns={livePipelineRuns}
                      setLivePipelineRuns={setLivePipelineRuns}
                      onCloneApp={setCloningApp}
                      onResourceControl={handleResourceControl}
                      controllingResource={controllingResource}
                      onBuildTransition={(title, message, type) => {
                        showToast(title, message, type);
                        addEvent(title, message, 'build', type === 'success' ? 'success' : type === 'error' ? 'failed' : 'info');
                        addNotification(title, message, type === 'success' ? 'success' : type === 'error' ? 'error' : 'info');
                      }}
                      selectedSubscriptionId={selectedSubscriptionId}
                      selectedControlResourceGroup={selectedControlResourceGroup}
                    />
                  )}

                  {scanSubTab === 'observability' && (
                    <PrometheusObservabilityView
                      API_BASE={API_BASE}
                      theme={theme}
                      isPackageActive={subPackageObservability}
                      onNavigateSettings={() => setActiveTab('settings')}
                      selectedSubscriptionId={selectedSubscriptionId}
                      selectedControlResourceGroup={selectedControlResourceGroup}
                    />
                  )}

                  {scanSubTab === 'incidents' && (
                    <IncidentsAlertsView
                      API_BASE={API_BASE}
                      theme={theme}
                      isPackageActive={subPackageObservability}
                      onNavigateSettings={() => setActiveTab('settings')}
                      selectedSubscriptionId={selectedSubscriptionId}
                      selectedControlResourceGroup={selectedControlResourceGroup}
                    />
                  )}
                </div>
              )}

              {/* TAB 2: PROVISION & CI/CD PIPELINES */}
              {activeTab === 'provision' && (
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                  {/* PERMANENT TOP SUB-NAVIGATION CONTROL BAR */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px',
                    borderRadius: '10px',
                    background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    marginBottom: '24px',
                    width: 'fit-content'
                  }}>
                    <button
                      type="button"
                      onClick={() => setProvisionViewMode('wizard')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        background: provisionViewMode === 'wizard' ? 'var(--accent-purple)' : 'transparent',
                        color: provisionViewMode === 'wizard' ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <PlusCircle size={14} /> ➕ Provision Infrastructure (Wizard)
                    </button>

                    <button
                      type="button"
                      onClick={() => setProvisionViewMode('pipelines')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        background: provisionViewMode === 'pipelines' ? 'var(--accent-purple)' : 'transparent',
                        color: provisionViewMode === 'pipelines' ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Zap size={14} /> ⚡ Target Scope CI/CD Pipelines Grid
                    </button>
                  </div>

                  {provisionViewMode === 'pipelines' ? (
                    <PipelinesPage
                      API_BASE={API_BASE}
                      token={user?.token || ''}
                      theme={theme}
                      apps={apps}
                      onOpenCreateDrawer={() => setShowPipelineCreatorDrawer(true)}
                      onOpenRunDetails={(runId, branch = 'main', provider = 'azure_devops') => {
                        setSelectedRunIdForDetails(runId);
                        setSelectedRunBranchForDetails(branch);
                        setSelectedRunProviderForDetails(provider);
                        setShowRunDetailsView(true);
                      }}
                      onSwitchToProvisionWizard={() => setProvisionViewMode('wizard')}
                    />
                  ) : (
                    <ProvisionWizard
                      pipelineProvider={pipelineProvider}
                      setPipelineProvider={setPipelineProvider}
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
                      apps={apps as any}
                      selectedProvisionSubscriptionId={selectedProvisionSubscriptionId}
                      setSelectedProvisionSubscriptionId={(subId: string) => {
                        setSelectedProvisionSubscriptionId(subId);
                        localStorage.setItem('selectedProvisionSubscriptionId', subId);
                        fetchProvisioningMetadata(subId);
                      }}
                      subscriptionsList={subscriptionsList}
                      ymlLoading={ymlLoading}
                      ymlError={ymlError}
                      setYmlError={setYmlError}
                      ymlContent={ymlContent}
                      ymlOriginal={ymlOriginal}
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
                      provisionYmlValidation={provisionYmlValidation}
                      provisionYmlValidating={provisionYmlValidating}
                    />
                  )}
                </div>
              )}

              {/* TAB 3: CREDENTIALS MANAGEMENT */}
              {activeTab === 'credentials' && (
                <CredentialsPage
                  credentialsList={credentialsList}
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
                  azureClientId={azureClientId}
                  setAzureClientId={setAzureClientId}
                  azureClientSecret={azureClientSecret}
                  setAzureClientSecret={setAzureClientSecret}
                  azureTenantId={azureTenantId}
                  setAzureTenantId={setAzureTenantId}
                  showAzureClientId={showAzureClientId}
                  setShowAzureClientId={setShowAzureClientId}
                  showAzureClientSecret={showAzureClientSecret}
                  setShowAzureClientSecret={setShowAzureClientSecret}
                  showAzureTenantId={showAzureTenantId}
                  setShowAzureTenantId={setShowAzureTenantId}
                  decryptedAzureClientId={decryptedAzureClientId}
                  decryptedAzureClientSecret={decryptedAzureClientSecret}
                  decryptedAzureTenantId={decryptedAzureTenantId}
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
                  prodLogAnalyticsWorkspaceId={prodLogAnalyticsWorkspaceId}
                  setProdLogAnalyticsWorkspaceId={setProdLogAnalyticsWorkspaceId}
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
                  showToast={showToast}
                  handleDiscoverAzureEnvCredentials={handleDiscoverAzureEnvCredentials}
                />
              )}



              {/* TAB 4: COST MANAGEMENT & OPTIMIZATION */}
              {activeTab === 'cost' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {renderInactiveSubscriptionWarning()}
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
                    fetchCostData={fetchCostData}
                    mode={(costTab === 'breakdown' || costTab === 'billing') ? 'cost' : 'optimization'}
                    selectedSubscriptionId={selectedSubscriptionId}
                    selectedControlResourceGroup={selectedControlResourceGroup}
                  />
                </div>
              )}

              {/* TAB 5: DATABASE CATALOG */}
              {activeTab === 'databases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {renderInactiveSubscriptionWarning()}
                  <DatabaseCatalogPage
                    apps={filteredApps}
                    virtualNetworks={virtualNetworks}
                    dbServers={dbServers}
                    selectedControlResourceGroup={selectedControlResourceGroup}
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
                    isSubscriptionInactive={isCurrentSubscriptionInactive}
                  />
                </div>
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
                    operatorSeatsLimit={operatorSeatsLimit}
                    manualMfaRequired={manualMfaRequired}
                    ssoMfaRequired={ssoMfaRequired}
                    handleUpdateMfaSettings={handleUpdateMfaSettings}
                    handleResetMfa={handleResetMfa}
                    handleResetOrgMfa={handleResetOrgMfa}
                    token={token}
                    apps={filteredApps}
                    appGroups={appGroups}
                  />
                </div>
              )}

              {/* TAB 9: ORGANIZATION SETTINGS */}
              {activeTab === 'settings' && (user?.role === 'owner' || user?.role === 'admin') && (
                <SettingsPage
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
                  savingSettings={savingSettings}
                  settingsMsg={settingsMsg}
                  handleSaveSettings={handleSaveSettings}
                  containerRegistries={containerRegistries}
                  serviceConnections={serviceConnections}
                  loadingMetadata={loadingMetadata}
                  licenseTier={licenseTier}
                  operatorSeatsLimit={operatorSeatsLimit}
                  currentWriteUsers={currentWriteUsers}
                  overSeatLimitWarning={overSeatLimitWarning}
                  downgradeComplianceDebt={downgradeComplianceDebt}
                  downgradeImpactData={downgradeImpactData}
                  showDowngradeModal={showDowngradeModal}
                  setShowDowngradeModal={setShowDowngradeModal}
                  downgradeConfirmInput={downgradeConfirmInput}
                  setDowngradeConfirmInput={setDowngradeConfirmInput}
                  pendingLicenseTier={pendingLicenseTier}
                  setPendingLicenseTier={setPendingLicenseTier}
                  setOperatorSeatsLimit={setOperatorSeatsLimit}
                  userRole={user?.role}
                  organizationId={organizationId}
                  isOrgDisabled={isOrgDisabled}
                  billingCurrency={billingCurrency}
                  setBillingCurrency={setBillingCurrency}
                  subPackageDevops={subPackageDevops}
                  setSubPackageDevops={setSubPackageDevops}
                  subPackageDeveloper={subPackageDeveloper}
                  setSubPackageDeveloper={setSubPackageDeveloper}
                  subPackageSecurity={subPackageSecurity}
                  setSubPackageSecurity={setSubPackageSecurity}
                  subPackageObservability={subPackageObservability}
                  setSubPackageObservability={setSubPackageObservability}
                  invoices={invoices}
                  onPayInvoice={handlePayInvoice}
                />
              )}

              {/* TAB 6: USER GUIDE */}
              {activeTab === 'guide' && (
                <GuidePage theme={theme} />
              )}

              {activeTab === 'emails' && (
                <EmailTemplatesPage />
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
                appType={buildHistoryDrawerApp.type as any}
                organizationId={organizationId}
                currentUser={user}
                theme={theme}
                API_BASE={API_BASE}
                branchName={resolveBranchName(buildHistoryDrawerApp)}
                onClose={() => setBuildHistoryDrawerApp(null)}
                onReDeployQueued={(newBuildId) => {
                  showToast('Deployment Queued', `Successfully queued new build run #${newBuildId}`, 'success');
                  handleScan(undefined, true);
                  setTimeout(() => handleScan(undefined, true), 4000);
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
          onConfirm={confirmDialog?.onConfirm || (() => { })}
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
                    loadYmlForPipelineModal(githubRepo, pipelineBranch, pipelineProvider);
                  }
                }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Pipeline Provider
                    </label>
                    <div style={{
                      display: 'flex',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPipelineProvider('azure_devops');
                          if (githubRepo) {
                            checkYmlExists(githubRepo, 'azure_devops');
                            loadYmlForPipelineModal(githubRepo, pipelineBranch, 'azure_devops');
                          }
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: pipelineProvider === 'azure_devops' ? 'var(--accent-purple)' : 'transparent',
                          color: pipelineProvider === 'azure_devops' ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <Globe size={16} />
                        Azure DevOps
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPipelineProvider('github_actions');
                          if (githubRepo) {
                            checkYmlExists(githubRepo, 'github_actions');
                            loadYmlForPipelineModal(githubRepo, pipelineBranch, 'github_actions');
                          }
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: pipelineProvider === 'github_actions' ? 'var(--accent-purple)' : 'transparent',
                          color: pipelineProvider === 'github_actions' ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <GitBranch size={16} />
                        GitHub Actions
                      </button>
                    </div>
                  </div>

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
                  {pipelineProvider === 'azure_devops' && (
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
                  )}

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
                      {pipelineProvider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'} Configuration
                    </label>
                    {pipelineModalYmlLoading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
                        <RefreshCw className="spin-anim" size={24} style={{ color: 'var(--accent-purple)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading YML configuration template...</span>
                      </div>
                    ) : (
                      <>
                        {pipelineModalYmlContent !== pipelineModalYmlOriginal && (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setYmlViewMode('editor')}
                              style={{
                                background: ymlViewMode === 'editor' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                                border: `1px solid ${ymlViewMode === 'editor' ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                                color: ymlViewMode === 'editor' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              📝 Editor
                            </button>
                            <button
                              type="button"
                              onClick={() => setYmlViewMode('diff')}
                              style={{
                                background: ymlViewMode === 'diff' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                                border: `1px solid ${ymlViewMode === 'diff' ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                                color: ymlViewMode === 'diff' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              🔍 View Changes
                            </button>
                          </div>
                        )}

                        {ymlViewMode === 'diff' ? (
                          <DiffViewer original={pipelineModalYmlOriginal} current={pipelineModalYmlContent} theme={theme} />
                        ) : (
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
                        )}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Info size={12} style={{ color: 'var(--accent-blue)' }} />
                          <span>
                            {pipelineModalYmlSource === 'github'
                              ? 'Loaded existing YAML file found on GitHub.'
                              : 'Generated default YAML deployment template.'}
                          </span>
                        </div>

                        {/* YAML Validation Panel */}
                        <div style={{ marginTop: '12px' }}>
                          {renderValidationPanel(
                            pipelineYmlValidation,
                            pipelineYmlValidating,
                            pipelineModalYmlContent,
                            setPipelineModalYmlContent,
                            pipelineProvider
                          )}
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
                      disabled={creatingPipeline || pipelineModalYmlLoading || user?.role === 'viewer' || (pipelineYmlValidation?.errors && pipelineYmlValidation.errors.length > 0)}
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
                      The `{pipelineProvider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'}` file has been committed to branch `{pipelineBranch}` of `{githubRepo}`, and the build pipeline is fully configured in {pipelineProvider === 'github_actions' ? 'GitHub Actions' : 'Azure DevOps'}.
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

        {/* Dockerfile Edit Modal Overlay */}
        {dockerfileEditApp && (
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
              maxWidth: '650px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--modal-shadow)',
              position: 'relative'
            }}>
              <button
                onClick={() => setDockerfileEditApp(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
              <div style={{ padding: '4px' }}>
                <DockerfileEditorStep
                  selectedRepo={dockerfileEditApp.repositoryUrl?.replace('https://github.com/', '').replace(/\/$/, '') || ''}
                  selectedBranch={dockerfileEditApp.branch || 'main'}
                  dockerfileLoading={dockerfileLoading}
                  dockerfileContent={dockerfileContent}
                  fetchDockerfileContent={fetchDockerfileContent}
                  pushDockerfileContent={pushDockerfileContent}
                  onBack={() => setDockerfileEditApp(null)}
                  onNext={() => {
                    setDockerfileEditApp(null);
                    showToast('Success', 'Dockerfile changes have been pushed and verified successfully.', 'success');
                    const group = appGroups.find(g => g.repoPath && dockerfileEditApp.repositoryUrl?.toLowerCase().includes(g.repoPath.toLowerCase()));
                    if (group) fetchYmlHealthForGroups([group]);
                  }}
                  isViewer={user?.role === 'viewer'}
                  API_BASE={API_BASE}
                />
              </div>
            </div>
          </div>
        )}

        {/* Premium Upgrade Modal Overlay */}
        {upgradePackageModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fade-in-anim 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '480px',
              width: '100%',
              padding: '30px',
              border: '1.5px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
              borderRadius: '16px',
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
            }}>
              <button
                onClick={() => setUpgradePackageModal(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <X size={16} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
                }}>
                  <Crown size={26} style={{ color: 'var(--accent-purple)' }} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Activate {upgradePackageModal} Package
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Unlock premium capabilities for your team. You will be billed instantly upon activation.
                </p>
              </div>

              {/* Package Features List */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px' }}>
                  Included Features
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upgradePackageModal === 'DevOps' && [
                    'Provision SWA and Container Apps',
                    'Run, Prioritize, and Redeploy pipelines',
                    'Setup Custom Domains and Teams Hooks',
                    'Trigger App Delete and Power Controls'
                  ].map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Check size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                  {upgradePackageModal === 'Developer' && [
                    'Register Database Servers',
                    'Provision PostgreSQL/MySQL DBs',
                    'Execute SQL Queries in DB Catalog explorer',
                    'Edit and Validate Dockerfiles & YMLs'
                  ].map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Check size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                  {upgradePackageModal === 'Security' && [
                    'Run Azure Policy Compliance scans',
                    'Configure scanner security rules',
                    'Auto-remediate resource violations',
                    'Query Eva AI for cost optimization suggestions'
                  ].map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Check size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing details */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '28px'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                  {upgradePackageModal === 'DevOps' ? (billingCurrency === 'INR' ? '₹12,500' : '$150.00')
                    : upgradePackageModal === 'Developer' ? (billingCurrency === 'INR' ? '₹8,250' : '$99.00')
                      : (billingCurrency === 'INR' ? '₹10,000' : '$120.00')}
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  / month ({billingCurrency === 'INR' ? 'INR' : 'USD'})
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setUpgradePackageModal(null)}
                  style={{ flex: 1, padding: '12px', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Upgrade
                </button>
              </div>
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
        {/* EvaForge CI/CD Modals */}
        <PipelineCreatorDrawer
          isOpen={showPipelineCreatorDrawer}
          onClose={() => setShowPipelineCreatorDrawer(false)}
          API_BASE={API_BASE}
          token={user?.token || ''}
          theme={theme}
          apps={apps}
          onPipelineCreated={() => {
            setShowPipelineCreatorDrawer(false);
          }}
        />

        <PipelineRunDetailsView
          runId={selectedRunIdForDetails}
          initialBranch={selectedRunBranchForDetails}
          initialProvider={selectedRunProviderForDetails}
          isOpen={showRunDetailsView}
          onClose={() => setShowRunDetailsView(false)}
          API_BASE={API_BASE}
          token={user?.token || ''}
          theme={theme}
        />

        <PWAUpdateManager />
      </div>
    </div>
  );
}

export default App;
