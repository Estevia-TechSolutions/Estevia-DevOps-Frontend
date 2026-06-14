import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
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
  ChevronDown,
  ChevronRight,
  X,
  Minus,
  TrendingDown,
  Info,
  Users,
  Terminal
} from 'lucide-react';
import './App.css';

// Import modular frontend components and pages
import { ConfirmationModal } from './components/ConfirmationModal';
import { SiteHeader, ControlBanner } from './components/DevOpsHeader';
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
  type: 'frontend' | 'backend' | 'vm';
  location: string;
  hostname: string;
  resourceId: string;
  status: string;
  repositoryUrl: string;
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
}

interface AppGroup {
  key: string;
  label: string;          // prettified display name (e.g. "ProTrack Frontend")
  repoPath: string;       // e.g. "Estevia-TechSolutions/protrack-frontend"
  repoUrl: string;        // full github url
  type: 'frontend' | 'backend' | 'vm';
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
    return n.endsWith('-dev') || n.includes('-dev-') ||
           n.endsWith('-qa')  || n.includes('-qa-')  ||
           n.endsWith('-prod') || n.includes('-prod-') ||
           n.endsWith('-main') || n.endsWith('-staging') || n.endsWith('-test');
  };

  const getEnvOrder = (name: string) => {
    const n = name.toLowerCase();
    if (n.endsWith('-dev') || n.includes('-dev-')) return 0;
    if (n.endsWith('-qa')  || n.includes('-qa-'))  return 1;
    if (n.endsWith('-prod') || n.includes('-prod-')) return 2;
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
      .replace(/-dev$/, '')
      .replace(/-qa$/, '')
      .replace(/-prod$/, '')
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
        .replace(/-dev$/, '')
        .replace(/-qa$/, '')
        .replace(/-prod$/, '');
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

function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'provision' | 'credentials' | 'cost' | 'databases' | 'guide' | 'users'>('scan');
  const [organizationId, setOrganizationId] = useState<string>(
    new URLSearchParams(window.location.search).get('org') || 'estevia'
  );
  
  const isGuidedProvisionRef = useRef(false);
  
  // Scanned Apps State
  const [apps, setApps] = useState<AppResource[]>([]);
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
  const [appType, setAppType] = useState<'frontend' | 'backend'>('frontend');
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
          commitMessage: commitMsg || 'chore: update Dockerfile [via EvaOps DevOps Hub]'
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

  const [syncCountdown, setSyncCountdown] = useState<number>(60);

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
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await window.fetch(`${API_BASE}/auth/bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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
      } else {
        throw new Error(data.error || 'Developer Bypass login failed.');
      }
    } catch (err: any) {
      console.error('[auth] Developer Bypass failed:', err);
      setAuthError(err.message || 'Developer Bypass failed.');
    } finally {
      setAuthLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCostSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      const suggestion = costSuggestions.find(s => s.id === suggestionId);
      const savings = suggestion ? suggestion.savings : 0;
      
      setCostSummary((prev: any) => {
        if (!prev) return null;
        const newScore = Math.min(100, prev.optimizationScore + 10);
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
      const res = await fetch(`${API_BASE}/auth/users`);
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
        method: 'POST'
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
          'Content-Type': 'application/json'
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

  // Auto-scan cloud resources and refresh costs with a 1-minute countdown timer
  useEffect(() => {
    if (token) {
      setSyncCountdown(60);
      const interval = setInterval(() => {
        setSyncCountdown((prev) => {
          if (prev <= 1) {
            console.log('[DevOps Auto Refresh] Timer reached 0. Triggering auto cloud & cost scan...');
            handleScan();
            return 60;
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

  const getCategorizedRepos = (type?: 'frontend' | 'backend') => {
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
          logAnalyticsWorkspaceId
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
        // Refresh scanned resources list to update statuses
        handleScan();
      } else {
        alert(data.message || `Failed to perform ${action} action.`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Network error executing power control action.');
    } finally {
      setControllingResource(null);
    }
  };

  const handleScan = async (rg?: string) => {
    setScanning(true);
    setScanError(null);
    setSyncCountdown(60); // Reset timer on manual scan
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
        
        // Auto-update cost management metrics as part of the scan flow
        console.log('[DevOps Scan] Triggering cost metrics refresh...');
        await fetchCostData();
      } else {
        console.error('[DevOps Scan] [API ERROR] Backend reported failure:', data.message || data.error);
        setScanError(data.message || 'Failed to scan Azure resources.');
      }
    } catch (e: any) {
      console.error('[DevOps Scan] [FETCH EXCEPTION] Connection/parsing error:', e);
      setScanError(e.message || 'Error connecting to the DevOps backend server.');
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
      }
    } catch (e: any) {
      setCredMsg({ type: 'error', text: e.message || 'Error saving credentials.' });
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

  const handleRepoChange = (repoName: string) => {
    setSelectedRepo(repoName);
    setSelectedBranches([]);
    if (repoName) {
      fetchBranches(repoName);
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

  const handleAppTypeChange = (type: 'frontend' | 'backend') => {
    setAppType(type);
    if (selectedRepo) {
      const shortName = selectedRepo.split('/').pop() || '';
      if (type === 'frontend') {
        setNewName(shortName ? `${shortName}-swa` : '');
      } else {
        setNewName(shortName ? `${shortName}-api` : '');
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
          maxReplicas: maxReplicas
        })
      });
      const data = await res.json();
      if (data.success) {
        setProvisionSuccess(`Successfully provisioned ${newName} in Azure.`);
        handleScan();
        setProvisionStep(appType === 'backend' ? 5 : 4); // Shift Step 4 SWA vs Step 5 Backend Finalize
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

    // Resolve target branch based on app name suffix
    const nameSegments = app.name.split('-');
    let defaultBranch = 'main';
    if (nameSegments.length > 1) {
      const last = nameSegments[nameSegments.length - 1];
      if (['dev', 'qa', 'prod', 'main', 'master'].includes(last.toLowerCase())) {
        defaultBranch = last;
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
            <div className="site-header-logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <Cpu size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EvaOps</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            EvaOps Neural Ecosystem
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
              EvaOps orchestrates your infrastructure. Scan your Azure subscription, provision Static Web Apps and Container Apps, map custom domains instantly via GoDaddy, and generate automated DevOps build pipelines.
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

                <button 
                  onClick={handleBypassLogin}
                  disabled={authLoading}
                  style={{
                    background: 'transparent',
                    border: '1px dashed var(--glass-border)',
                    color: 'var(--text-secondary)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-purple)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Developer Bypass (Local Testing)
                </button>
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
      />

      {/* ── Page Content ── */}
      <div className="page-content">

        {requiresOnboarding ? (
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            {/* Step Wizard Header */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--divider)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
                Welcome to EvaOps Onboarding
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
                    EvaOps automates repository checkouts, pipeline generations, and build triggers by linking GitHub and Azure DevOps.
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
                      {onboardSubmitting ? 'Finalizing Setup...' : 'Activate EvaOps Workspace'}
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <ControlBanner
              scanning={scanning}
              scanProgress={scanProgress}
              hasApps={apps.length > 0}
              resourceGroups={controlResourceGroups}
              selectedResourceGroup={selectedControlResourceGroup}
              onResourceGroupChange={handleResourceGroupChange}
              primaryResourceGroup={primaryResourceGroup}
            />

        {/* Tabs */}
        <div className="tabs-container">
        <button className={`tab-btn tab-btn-scan ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
          <Server size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Cloud Resource Scanning
          <span className="tab-tooltip">Scan active Azure subscriptions for app services, container resources, and cost metrics.</span>
        </button>
        <button className={`tab-btn tab-btn-provision ${activeTab === 'provision' ? 'active' : ''}`} onClick={() => setActiveTab('provision')}>
          <PlusCircle size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Provision Web App
          <span className="tab-tooltip">Create and provision new Azure Static Web Apps automatically.</span>
        </button>
        <button className={`tab-btn tab-btn-cost ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}>
          <Database size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Cost Management
          <span className="tab-tooltip">Monitor infrastructure cost trends, resource footprints, and budget insights.</span>
        </button>
        <button className={`tab-btn tab-btn-databases ${activeTab === 'databases' ? 'active' : ''}`} onClick={() => setActiveTab('databases')}>
          <Database size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Database Hub
          <span className="tab-tooltip">Manage databases, query schemas, and perform secure backups.</span>
        </button>
        <button className={`tab-btn tab-btn-credentials ${activeTab === 'credentials' ? 'active' : ''}`} onClick={() => setActiveTab('credentials')}>
          <ShieldCheck size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Credentials
          <span className="tab-tooltip">Manage API keys, access tokens, and organization infrastructure settings.</span>
        </button>
        {(user?.role === 'owner' || user?.role === 'admin') && (
          <button className={`tab-btn tab-btn-users ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Team Settings
            <span className="tab-tooltip">Manage organization directory users, sync from Azure Active Directory, and adjust roles.</span>
          </button>
        )}
        <button className={`tab-btn tab-btn-guide ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>
          <Info size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          User Guide
          <span className="tab-tooltip">Step-by-step user instructions, capability scope, and system boundaries.</span>
        </button>

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
            onCloneApp={setCloningApp}
            onResourceControl={handleResourceControl}
            controllingResource={controllingResource}
          />
        )}

        {/* TAB 2: PROVISION WEB APP WIZARD */}
        {activeTab === 'provision' && (
          <ProvisionWizard
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
          />
        )}



        {/* TAB 4: COST MANAGEMENT */}
        {activeTab === 'cost' && (
          <CostPage
            costSummary={costSummary}
            detailedCosts={detailedCosts}
            costSuggestions={costSuggestions}
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
          />
        )}

        {/* TAB 5: DATABASE CATALOG */}
        {activeTab === 'databases' && (
          <DatabaseCatalogPage
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
            />
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 600 }}>
                <Terminal style={{ color: 'var(--accent-purple)' }} />
                Enterprise Security Audit Trail
              </h3>
              <AuditLogsTable API_BASE={API_BASE} theme={theme} />
            </div>
          </div>
        )}

        {/* TAB 6: USER GUIDE */}
        {activeTab === 'guide' && (
          <GuidePage theme={theme} />
        )}

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      GitHub Repository
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomRepo(!useCustomRepo)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {useCustomRepo ? 'Select from list' : 'Enter manually'}
                    </button>
                  </div>
                  {useCustomRepo ? (
                    <input
                      type="text"
                      required
                      placeholder="owner/repository-name"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <select
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        outline: 'none'
                      }}
                    >
                      <option value="">-- Select GitHub Repository --</option>
                      {githubRepos.map(repo => (
                        <option key={repo.id} value={repo.fullName}>{repo.fullName}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Git Branch */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Target Branch
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. main"
                    value={pipelineBranch}
                    onChange={(e) => setPipelineBranch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* DevOps Settings */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      DevOps Org URL
                    </label>
                    <input
                      type="text"
                      required
                      value={devopsOrgUrl}
                      onChange={(e) => setDevopsOrgUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      DevOps Project
                    </label>
                    <input
                      type="text"
                      required
                      value={devopsProject}
                      onChange={(e) => setDevopsProject(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
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

      </div>
    </div>
  );
}

export default App;
