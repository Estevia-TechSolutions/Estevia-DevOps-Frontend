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
  TrendingDown
} from 'lucide-react';
import './App.css';

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
  type: 'frontend' | 'backend';
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
      }[];
    }[];
  } | null;
  branches?: { name: string; protected: boolean }[];
}

interface AppGroup {
  key: string;
  label: string;          // prettified display name (e.g. "ProTrack Frontend")
  repoPath: string;       // e.g. "Estevia-TechSolutions/protrack-frontend"
  repoUrl: string;        // full github url
  type: 'frontend' | 'backend';
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

    if (app.repositoryUrl) {
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
      if (repoPath) {
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
  const [activeTab, setActiveTab] = useState<'scan' | 'provision' | 'credentials' | 'cost' | 'databases'>('scan');
  const [organizationId, setOrganizationId] = useState<string>(
    new URLSearchParams(window.location.search).get('org') || 'estevia'
  );
  
  // Scanned Apps State
  const [apps, setApps] = useState<AppResource[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

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

  const [costTab, setCostTab] = useState<'breakdown' | 'recommendations'>('breakdown');
  const [costSearch, setCostSearch] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | 'production' | 'test' | 'stale'>('all');
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
  const [dbDetailTab, setDbDetailTab] = useState<'schema' | 'query' | 'create-table' | 'connect'>('schema');
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
      handleScan();
      fetchOrgSettings();
      fetchGithubRepos();
      fetchCostData();
      fetchDbServers();
    }
  }, [organizationId, token]);

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
        setDefaultDnsDomain(data.settings.default_dns_domain || '');
        setAzureDevopsOrgUrl(data.settings.azure_devops_org_url || '');
        setAzureDevopsProject(data.settings.azure_devops_project || '');
        setPipelineVariableGroup(data.settings.pipeline_variable_group || '');
        setGithubOwner(data.settings.github_owner || '');
        
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
          githubOwner
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
          dbName: newDbName.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setDeployDbSuccess(data.message || `Database '${newDbName}' deployed successfully.`);
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
      if (res.ok && data.success) {
        setQueryResult(data);
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
    const confirmed = window.confirm(`Are you absolutely sure you want to DROP the table '${tableName}'? This will permanently delete all data in it!`);
    if (!confirmed) return;
    
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
        // Clear schema selections or details tab query outputs if open
        setQueryResult(null);
        fetchDatabaseSchema(selectedDbServer.name, selectedDatabase.name);
      } else {
        alert(`Failed to drop table: ${data.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      alert(`Error dropping table: ${e.message}`);
    }
  };

  const handleAddColumn = async (tableName: string) => {
    if (!alterNewColName.trim()) return;
    try {
      const nullability = alterNewColNullable ? 'NULL' : 'NOT NULL';
      const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${alterNewColName.trim()}\` ${alterNewColType} ${nullability};`;
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
  };

  const handleDropColumn = async (tableName: string, columnName: string) => {
    const confirmed = window.confirm(`Are you sure you want to drop column '${columnName}' from table '${tableName}'?`);
    if (!confirmed) return;
    
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
  };

  const handleScan = async () => {
    setScanning(true);
    setScanError(null);
    const scanUrl = `${API_BASE}/apps/scan?organizationId=${organizationId}`;
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

  const fetchBranches = async (repoFullName: string) => {
    setLoadingBranches(true);
    setBranches([]);
    setSelectedBranch('');
    setSelectedBranches([]);
    try {
      const res = await fetch(`${API_BASE}/apps/github-branches?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repoFullName)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.branches)) {
        setBranches(data.branches);
        if (data.branches.length > 0) {
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
        const templateRes = await fetch(`${API_BASE}/apps/default-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(repo)}&branches=${encodeURIComponent(branchesParam)}&appType=${appType}`);
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

  const handleMoveToStep2 = () => {
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
          targetPort: appType === 'backend' ? parseInt(targetPort, 10) : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setProvisionSuccess(`Successfully provisioned ${newName} in Azure.`);
        handleScan();
        setProvisionStep(4);
      } else {
        setProvisionError(data.message || 'Failed to provision application.');
      }
    } catch (e: any) {
      setProvisionError(e.message || 'Error connecting to backend.');
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

  const handleDeleteApp = async (name: string, type: 'frontend' | 'backend') => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete '${name}' (${type}) from Azure and your database? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingAppName(name);
    try {
      const res = await fetch(`${API_BASE}/apps/${name}?organizationId=${organizationId}&type=${type}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(`Application '${name}' deleted successfully.`);
        handleScan();
        fetchCostData();
      } else {
        alert(data.message || 'Failed to delete application.');
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred during deletion request.');
    } finally {
      setDeletingAppName(null);
    }
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
        <div style={{
          padding: '24px',
          borderTop: '1px solid var(--divider)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          background: 'rgba(2, 6, 23, 0.2)'
        }}>
          Powered by EvaOps. Security, isolation, and orchestration configured natively.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Sticky Header ── */}
      <header className="site-header">
        <div className="site-header-inner">

          {/* Brand */}
          <div className="site-header-brand">
            <div className="site-header-logo">
              <Cpu size={18} color="#fff" />
            </div>
            <div>
              <div className="site-header-title">EvaOps</div>
              <div className="site-header-subtitle">Cloud Control Centre</div>
            </div>
          </div>

          <div className="site-header-divider" />

          {/* Organisation badge */}
          <div className="site-header-org">
            <Building2 size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
            <span className="site-header-org-label">Org</span>
            <span className="site-header-org-name">
              {orgName || organizationId}
            </span>
            <span className="site-header-org-dot" />
          </div>

          {/* Right-side actions */}
          <div className="site-header-actions">

            {/* Scan button */}
            <button
              className="btn-primary"
              onClick={handleScan}
              disabled={scanning}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', fontSize: '0.82rem', height: '36px' }}
            >
              <RefreshCw size={14} className={scanning ? 'spin-anim' : ''} />
              {scanning ? 'Scanning…' : 'Scan Cloud'}
            </button>

            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark'
                ? <Sun size={16} />
                : <Moon size={16} />}
            </button>

            {/* User chip */}
            {user && (
              <div className="user-chip">
                <div className="user-chip-info">
                  <span className="user-chip-name">{user.name}</span>
                  <span className="user-chip-role">{user.role === 'admin' ? 'Admin' : 'Developer'}</span>
                </div>
                <div className="user-chip-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
            )}

            {/* Sign out */}
            <button className="btn-signout" onClick={handleLogout}>
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </header>

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
            <div className="page-hero">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Automated Environment Scanning · SWA Provisioning · GoDaddy DNS · Azure DevOps CI/CD
          </p>
        </div>

        {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
          <Server size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Cloud Resource Scanning
        </button>
        <button className={`tab-btn ${activeTab === 'provision' ? 'active' : ''}`} onClick={() => setActiveTab('provision')}>
          <PlusCircle size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Provision Web App
        </button>
        <button className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}>
          <Database size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Cost Management
        </button>
        <button className={`tab-btn ${activeTab === 'databases' ? 'active' : ''}`} onClick={() => setActiveTab('databases')}>
          <Database size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Database Hub
        </button>
        <button className={`tab-btn ${activeTab === 'credentials' ? 'active' : ''}`} onClick={() => setActiveTab('credentials')}>
          <ShieldCheck size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Decryption Secrets & Credentials
        </button>
      </div>

      {/* Tab Contents */}
      <main>
        
        {/* TAB 1: CLOUD RESOURCE SCANNING */}
        {activeTab === 'scan' && (
          <div>
            {scanError && (
              <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <AlertCircle style={{ color: 'var(--error)' }} />
                <span>{scanError}</span>
              </div>
            )}

            {scanning && apps.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                <RefreshCw size={48} className="spin-anim" style={{ color: 'var(--accent-purple)', marginBottom: '16px' }} />
                <h3>Fetching Live Subscriptions...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Scanning Static Web Apps and Container Apps in resource group Estevia-Prod-RG...</p>
              </div>
            ) : apps.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                <Search size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                <h3>No active resources discovered</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Click the "Scan Active Cloud" button above to query Azure subscription.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {appGroups.map((group) => {
                  const isMultiEnv = group.envs.length > 1;
                  const accentColor = group.type === 'frontend' ? 'var(--accent-purple)' : 'var(--accent-teal)';
                  const accentBg = group.type === 'frontend' ? 'rgba(139,92,246,0.1)' : 'rgba(20,184,166,0.1)';
                  const accentGlow = group.type === 'frontend' ? '0 0 10px var(--accent-purple-glow)' : '0 0 10px var(--accent-teal-glow)';

                  const ENV_COLORS: Record<string, { color: string; bg: string; border: string; label: string }> = {
                    dev:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)',  label: 'DEV'  },
                    qa:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  label: 'QA'   },
                    prod: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)',  label: 'PROD' },
                  };

                  const getEnvTag = (name: string): { color: string; bg: string; border: string; label: string } => {
                    const n = name.toLowerCase();
                    if (n.includes('-dev')) return ENV_COLORS.dev;
                    if (n.includes('-qa'))  return ENV_COLORS.qa;
                    if (n.includes('-prod')) return ENV_COLORS.prod;
                    const noSuffix = !n.endsWith('-dev') && !n.includes('-dev-') &&
                                     !n.endsWith('-qa')  && !n.includes('-qa-')  &&
                                     !n.endsWith('-prod') && !n.includes('-prod-') &&
                                     !n.endsWith('-staging') && !n.endsWith('-test');
                    if (noSuffix) return ENV_COLORS.prod;
                    return { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'var(--glass-border)', label: 'ENV' };
                  };

                  const isCollapsed = collapsedScanGroups[group.key] !== false;

                  return (
                    <div key={group.key} className="glass-panel" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
                      {/* Left accent strip */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: accentColor, boxShadow: accentGlow }} />

                      {/* Group Header */}
                      <div 
                        onClick={() => toggleGroupScan(group.key)}
                        style={{ 
                          padding: '20px 24px 14px 28px', 
                          borderBottom: isCollapsed ? 'none' : '1px solid var(--glass-border)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          flexWrap: 'wrap', 
                          gap: '10px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroupScan(group.key);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                              borderRadius: '4px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                          </button>
                          
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, backgroundColor: accentBg, padding: '3px 8px', borderRadius: '4px' }}>{group.type}</span>
                              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{group.label}</h3>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                {group.envs.length} active environments
                              </span>
                            </div>
                            {group.repoPath && (
                              <a 
                                href={group.repoUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                title={group.repoPath}
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                              >
                                <GitBranch size={11} /> {group.repoPath} <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          {group.pipelineId ? (
                            <span style={{ fontSize: '0.8rem', color: accentColor, backgroundColor: accentBg, padding: '5px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${accentColor}44` }}>
                              <GitBranch size={13} /> {group.pipelineName || `Pipeline #${group.pipelineId}`}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>ℹ️ No pipeline registered</span>
                          )}
                          <button className="btn-secondary" onClick={() => openPipelineModal(group.envs[0], group)}
                            style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <GitBranch size={13} /> CI/CD
                          </button>
                        </div>
                      </div>

                      {/* Collapsible content body */}
                      {!isCollapsed && (() => {
                        const displayBranches = group.branches && group.branches.length > 0
                          ? [...group.branches].sort((a, b) => {
                              const getBranchOrder = (name: string) => {
                                const n = name.toLowerCase();
                                if (n === 'dev' || n === 'development') return 0;
                                if (n === 'qa' || n === 'testing') return 1;
                                if (n === 'main' || n === 'master' || n === 'prod' || n === 'production') return 2;
                                return 3;
                              };
                              const orderA = getBranchOrder(a.name);
                              const orderB = getBranchOrder(b.name);
                              if (orderA !== orderB) return orderA - orderB;
                              return a.name.localeCompare(b.name);
                            }).map(b => b.name)
                          : ['dev', 'qa', 'prod'];

                        const isDark = theme === 'dark';

                        return (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                            gap: '16px',
                            padding: '20px',
                            backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                            borderTop: '1px solid var(--glass-border)'
                          }}>
                            {displayBranches.map((branchName, idx) => {
                              const app = group.envs.find(e => {
                                const nameLower = e.name.toLowerCase();
                                const bLower = branchName.toLowerCase();
                                if (nameLower.endsWith(`-${bLower}`) || nameLower.includes(`-${bLower}-`)) return true;
                                if (['main', 'master', 'prod', 'production'].includes(bLower)) {
                                  if (nameLower.endsWith('-prod') || nameLower.includes('-prod-') || nameLower.endsWith('-main') || nameLower.includes('-main-')) return true;
                                  const hasNoEnvSuffix = !nameLower.endsWith('-dev') && !nameLower.includes('-dev-') && !nameLower.endsWith('-qa')  && !nameLower.includes('-qa-')  && !nameLower.endsWith('-prod') && !nameLower.includes('-prod-') && !nameLower.endsWith('-staging') && !nameLower.endsWith('-test');
                                  if (hasNoEnvSuffix) return true;
                                }
                                return false;
                              });

                              const getEnvMeta = (bName: string) => {
                                const n = bName.toLowerCase();
                                if (n === 'dev' || n === 'development') return { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.3)', label: 'DEV' };
                                if (n === 'qa' || n === 'testing') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', label: 'QA' };
                                if (['main', 'master', 'prod', 'production'].includes(n)) return { color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.3)', label: 'PROD' };
                                return { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'var(--glass-border)', label: bName.toUpperCase() };
                              };
                              const envTag = getEnvMeta(branchName);

                              if (!app) {
                                const canDeploy = !!group.repoPath;
                                return (
                                  <div key={branchName} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', minHeight: '180px', border: `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'}`, backgroundColor: 'transparent', borderRadius: '12px', boxSizing: 'border-box' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: envTag.color, backgroundColor: envTag.bg, border: `1px solid ${envTag.border}`, padding: '2px 8px', borderRadius: '10px' }}>{envTag.label}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={12} style={{ opacity: 0.6 }} /> Not Deployed</span>
                                    {canDeploy && (
                                      <button className="btn-secondary" onClick={() => group.type === 'backend' ? openBackendDeployModal(group, branchName) : openScannerProvisionModal(group, branchName)} style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', borderStyle: 'dashed' }}>
                                        <PlusCircle size={12} /> Deploy Branch
                                      </button>
                                    )}
                                  </div>
                                );
                              }

                              const isDeploying = !!(app.pipelineRun && (app.pipelineRun.state === 'inProgress' || app.pipelineRun.state === 'canceling'));
                              const accentBarColor = isDeploying ? '#fbbf24' : envTag.color;
                              const getStatusMeta = (statusStr: string) => {
                                const s = (statusStr || '').toLowerCase();
                                if (s.includes('ready') || s.includes('running') || s.includes('succeeded') || s.includes('active')) return { color: 'var(--success)', icon: <CheckCircle2 size={12} />, label: statusStr || 'Ready' };
                                if (s.includes('fail') || s.includes('error') || s.includes('stop') || s.includes('degrad')) return { color: 'var(--error)', icon: <AlertCircle size={12} />, label: statusStr || 'Error' };
                                if (s.includes('pend') || s.includes('updat') || s.includes('deploy') || s.includes('progress')) return { color: '#fbbf24', icon: <RefreshCw size={12} className="spin-anim" />, label: statusStr || 'Pending' };
                                return { color: 'var(--text-secondary)', icon: <AlertCircle size={12} />, label: statusStr || 'Unknown' };
                              };
                              const statusMeta = getStatusMeta(isDeploying ? 'deploying' : app.status);

                              return (
                                <div key={app.name} className="glass-panel" style={{ 
                                  padding: '20px', 
                                  position: 'relative', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '12px', 
                                  borderRadius: '12px', 
                                  border: isDeploying ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid var(--glass-border)', 
                                  boxShadow: isDeploying ? '0 0 15px rgba(251, 191, 36, 0.15)' : 'none',
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15,23,42,0.01)', 
                                  boxSizing: 'border-box', 
                                  overflow: 'hidden' 
                                }}>
                                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: accentBarColor }} />
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: envTag.color, backgroundColor: envTag.bg, border: `1px solid ${envTag.border}`, padding: '2px 8px', borderRadius: '10px' }}>{envTag.label}</span>
                                      {app.pipelineRun?.webUrl && <a href={app.pipelineRun.webUrl} target="_blank" rel="noreferrer" title="View Pipeline Run Details" style={{ color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', fontSize: '0.7rem', gap: '2px' }}><ExternalLink size={10} style={{ flexShrink: 0 }} /> View Details</a>}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: statusMeta.color, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>{statusMeta.icon} {isDeploying ? 'DEPLOYING...' : statusMeta.label}</span>
                                  </div>
                                  {isDeploying && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 12px',
                                      backgroundColor: 'rgba(251, 191, 36, 0.08)',
                                      border: '1px solid rgba(251, 191, 36, 0.3)',
                                      borderRadius: '8px',
                                      color: '#fbbf24',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      animation: 'pulse-anim 1.5s infinite alternate',
                                      boxShadow: '0 2px 6px rgba(251, 191, 36, 0.05)'
                                    }}>
                                      <RefreshCw size={12} className="spin-anim" />
                                      <span>Active deployment in progress...</span>
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource Name</span>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }} title={app.name}>{app.name}</div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {app.hostname ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ExternalLink size={11} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                        <a href={`https://${app.hostname}`} target="_blank" rel="noreferrer" title={app.hostname} style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.hostname}</a>
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><ExternalLink size={11} style={{ opacity: 0.5 }} /><span>No endpoint configured</span></div>
                                    )}
                                    {app.dnsDetails?.fqdn ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Globe size={11} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                        <a href={`https://${app.dnsDetails.fqdn}`} target="_blank" rel="noreferrer" title={app.dnsDetails.fqdn} style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.dnsDetails.fqdn}</a>
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', fontStyle: 'italic' }}><Globe size={11} style={{ color: 'var(--warning)' }} /><span>No custom domain bound</span></div>
                                    )}
                                  </div>
                                  <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}`, paddingTop: '8px' }}>{renderPipelineRunStatus(app)}</div>
                                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}` }}>
                                    <button className="btn-secondary" onClick={() => openDnsModal(app)} style={{ flex: 1, padding: '6px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Globe size={12} /> DNS Map</button>
                                    <button className="btn-secondary" onClick={() => handleDeleteApp(app.name, app.type)} disabled={deletingAppName === app.name} style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.03)' }}>{deletingAppName === app.name ? <RefreshCw size={12} className="spin-anim" /> : <Trash2 size={12} />}</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}

            {/* SCANNER PROVISIONING MODAL */}
            {scannerProvisionOpen && scannerProvisionGroup && scannerProvisionEnv && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '20px' }}>
                <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '560px', position: 'relative' }}>
                  
                  {/* Close button */}
                  {(scannerDeployStep <= 0 || scannerDeployStep === 0.5 || scannerDeployStep === 4) && (
                    <button 
                      onClick={() => setScannerProvisionOpen(false)} 
                      style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}
                    >
                      ✕
                    </button>
                  )}

                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <PlusCircle size={24} style={{ color: 'var(--accent-purple)' }} />
                    Deploy {scannerProvisionEnv.toUpperCase()} Environment
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Provision Static Web App resource, bind GoDaddy DNS custom domain, and sync CI/CD credentials.
                  </p>

                  {/* Deployment Step Tracker */}
                  {(scannerDeployStep >= 1 || scannerDeployStep === -1) && (
                    <div style={{ marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', fontWeight: 600 }}>Deployment Progress</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                          {scannerDeployStep === 1 ? (
                            <RefreshCw size={16} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                          ) : scannerDeployStep > 1 ? (
                            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                          ) : scannerDeployStep === -1 ? (
                            <AlertCircle size={16} style={{ color: 'var(--error)' }} />
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-secondary)', opacity: 0.4 }} />
                          )}
                          <span style={{ color: scannerDeployStep === 1 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: scannerDeployStep === 1 ? 600 : 400 }}>
                            1. Provision Azure Static Web App resource
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                          {scannerDeployStep === 2 ? (
                            <RefreshCw size={16} className="spin-anim" style={{ color: 'var(--accent-teal)' }} />
                          ) : scannerDeployStep > 2 ? (
                            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                          ) : scannerDeployStep === -1 ? (
                            <AlertCircle size={16} style={{ color: 'var(--error)' }} />
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-secondary)', opacity: 0.4 }} />
                          )}
                          <span style={{ color: scannerDeployStep === 2 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: scannerDeployStep === 2 ? 600 : 400 }}>
                            2. Bind GoDaddy Custom Domain DNS CNAME
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                          {scannerDeployStep === 3 ? (
                            <RefreshCw size={16} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                          ) : scannerDeployStep > 3 ? (
                            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                          ) : scannerDeployStep === -1 ? (
                            <AlertCircle size={16} style={{ color: 'var(--error)' }} />
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-secondary)', opacity: 0.4 }} />
                          )}
                          <span style={{ color: scannerDeployStep === 3 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: scannerDeployStep === 3 ? 600 : 400 }}>
                            3. Link DevOps CI/CD pipeline & update variables group
                          </span>
                        </div>

                      </div>

                      {/* Success / Error Messages */}
                      {scannerDeployStep === 4 && (
                        <div style={{ marginTop: '20px', padding: '12px 16px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.88rem' }}>
                          🎉 Environment <strong>{scannerProvisionEnv.toUpperCase()}</strong> has been successfully provisioned and linked to CI/CD pipeline.
                        </div>
                      )}

                      {scannerDeployError && (
                        <div style={{ marginTop: '20px', padding: '12px 16px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle size={16} style={{ flexShrink: 0 }} />
                          <span>{scannerDeployError}</span>
                        </div>
                      )}
                    </div>
                  )}

                   {/* Form (only shown when idle) */}
                  {scannerDeployStep === 0 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleStartScannerDeploy(); }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Repository</label>
                          <input type="text" value={scannerProvisionGroup.repoPath} disabled style={{ opacity: 0.7 }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Environment Target</label>
                          <input type="text" value={scannerProvisionEnv.toUpperCase()} disabled style={{ opacity: 0.7 }} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Source Repository Branch</label>
                        {loadingBranches ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)', padding: '10px 0' }}>
                            <RefreshCw size={14} className="spin-anim" /> Loading branches from GitHub...
                          </div>
                        ) : (
                          <select 
                            value={scannerProvisionBranch} 
                            onChange={(e) => handleScannerBranchChange(e.target.value)}
                            style={{ background: 'var(--glass-input-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px', width: '100%' }}
                          >
                            {branches.length > 0 ? (
                              branches.map(b => (
                                <option key={b.name} value={b.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                  {b.name} {b.protected ? '(protected)' : ''}
                                </option>
                              ))
                            ) : (
                              <option value={scannerProvisionBranch} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                {scannerProvisionBranch}
                              </option>
                            )}
                          </select>
                        )}
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure SWA Resource Name</label>
                        <input 
                          type="text" 
                          value={scannerProvisionSwaName} 
                          onChange={(e) => setScannerProvisionSwaName(e.target.value)} 
                          placeholder="e.g. estevia-app-qa" 
                          required 
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Subdomain Binding</label>
                          <input 
                            type="text" 
                            value={scannerProvisionSubdomain} 
                            onChange={(e) => setScannerProvisionSubdomain(e.target.value)} 
                            placeholder="e.g. qa-app" 
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GoDaddy Zone Domain</label>
                          <input 
                            type="text" 
                            value={scannerProvisionDomain} 
                            onChange={(e) => setScannerProvisionDomain(e.target.value)} 
                            placeholder="e.g. esteviatech.com" 
                            required 
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Region</label>
                          <select 
                            value={scannerProvisionRegion} 
                            onChange={(e) => setScannerProvisionRegion(e.target.value)}
                            style={{ background: 'var(--glass-input-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px', width: '100%' }}
                          >
                            <option value="eastus2" style={{ background: '#1c1924', color: '#fff' }}>East US 2</option>
                            <option value="westus2" style={{ background: '#1c1924', color: '#fff' }}>West US 2</option>
                            <option value="centralus" style={{ background: '#1c1924', color: '#fff' }}>Central US</option>
                            <option value="westeurope" style={{ background: '#1c1924', color: '#fff' }}>West Europe</option>
                            <option value="southeastasia" style={{ background: '#1c1924', color: '#fff' }}>Southeast Asia</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <span>ℹ️ Shared pipeline variables will be updated in group <strong>{pipelineVariableGroup || 'devops-frontend-vars'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={() => setScannerProvisionOpen(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary"
                        >
                          Verify Pipeline YAML
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 0.5: SCANNER YML EDITOR */}
                  {scannerDeployStep === 0.5 && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Verify & Customize Pipeline YML</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '12px' }}>
                        We will commit the custom <code>azure-pipelines.yml</code> file to branch <strong>{scannerProvisionBranch}</strong> before resource provisioning.
                      </p>
                      
                      {scannerYmlLoading ? (
                        <div style={{ padding: '20px 0', textAlign: 'center' }}>
                          <RefreshCw size={24} className="spin-anim" style={{ color: 'var(--accent-purple)', marginBottom: '8px' }} />
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Loading YML build configuration...</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Status: {scannerYmlSource === 'github' ? (
                                <strong style={{ color: 'var(--success)' }}>✓ Loaded existing YML from GitHub</strong>
                              ) : (
                                <strong style={{ color: 'var(--accent-purple)' }}>ℹ Custom pipeline template generated</strong>
                              )}
                            </span>
                          </div>

                          <div className="glass-panel" style={{ padding: '12px', backgroundColor: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '8px', marginBottom: '16px' }}>
                            <textarea
                              value={scannerYmlContent}
                              onChange={(e) => setScannerYmlContent(e.target.value)}
                              rows={12}
                              style={{
                                width: '100%',
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: '0.82rem',
                                color: '#e2e8f0',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                resize: 'vertical',
                                lineHeight: '1.5'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {scannerDeployError && (
                        <div style={{ marginBottom: '16px', padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: '6px', color: 'var(--error)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle size={14} style={{ flexShrink: 0 }} />
                          <span>{scannerDeployError}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={() => setScannerDeployStep(0)}
                          disabled={creatingYml}
                        >
                          Back
                        </button>
                        <button 
                          type="button" 
                          className="btn-primary"
                          onClick={handleScannerCommitAndDeploy}
                          disabled={scannerYmlLoading || creatingYml || !scannerYmlContent}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {creatingYml ? (
                            <>
                              <RefreshCw size={12} className="spin-anim" /> Committing & Deploying...
                            </>
                          ) : (
                            <>
                              Commit & Deploy <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions footer when done or error */}
                  {(scannerDeployStep === 4 || scannerDeployStep === -1) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                      <button 
                        className="btn-primary" 
                        onClick={() => setScannerProvisionOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* DOMAIN BIND MODAL */}
            {selectedApp && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '500px', margin: '20px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Globe size={24} style={{ color: 'var(--accent-teal)' }} />
                    Map GoDaddy Domain CNAME
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                    This binds a custom subdomain record on GoDaddy pointing directly to {selectedApp.type === 'frontend' ? 'SWA' : 'Container App'} <strong>{selectedApp.name}</strong>.
                  </p>

                  {bindSuccess && (
                    <div className="glass-panel" style={{ padding: '12px', borderColor: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                      {bindSuccess}
                    </div>
                  )}

                  {bindError && (
                    <div className="glass-panel" style={{ padding: '12px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                      {bindError}
                    </div>
                  )}

                  <form onSubmit={handleBindDomainSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Subdomain (e.g. dev-protrack)</label>
                      <input 
                        type="text" 
                        value={subdomainInput} 
                        onChange={(e) => setSubdomainInput(e.target.value)} 
                        placeholder="dev-app-name" 
                        required 
                      />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>GoDaddy Zone Domain</label>
                      <input 
                        type="text" 
                        value={domainInput} 
                        onChange={(e) => setDomainInput(e.target.value)} 
                        placeholder="esteviatech.com" 
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => setSelectedApp(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={binding}
                      >
                        {binding ? 'Updating DNS...' : 'Apply DNS Mapping'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}            {/* PIPELINE MODAL */}
            {pipelineApp && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '20px' }}>
                <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '560px' }}>
                  
                  {/* Dynamic Wizard Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      <GitBranch size={24} style={{ color: 'var(--accent-purple)' }} />
                      {pipelineWizardStep === 1 && 'Setup DevOps Pipeline'}
                      {pipelineWizardStep === 2 && 'Review Build YML'}
                      {pipelineWizardStep === 3 && 'Pipeline Setup Completed'}
                    </h3>
                    <button onClick={() => setPipelineApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1, padding: '2px 6px' }}>✕</button>
                  </div>

                  {/* Stepper Progress Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: pipelineWizardStep >= 1 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                        color: '#fff', fontSize: '0.8rem', fontWeight: 600
                      }}>1</span>
                      <span style={{ fontSize: '0.82rem', color: pipelineWizardStep >= 1 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pipelineWizardStep === 1 ? 600 : 400 }}>Configure</span>
                    </div>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)', margin: '0 12px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: pipelineWizardStep >= 2 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                        color: '#fff', fontSize: '0.8rem', fontWeight: 600
                      }}>2</span>
                      <span style={{ fontSize: '0.82rem', color: pipelineWizardStep >= 2 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pipelineWizardStep === 2 ? 600 : 400 }}>Review YML</span>
                    </div>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)', margin: '0 12px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: pipelineWizardStep >= 3 ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                        color: '#fff', fontSize: '0.8rem', fontWeight: 600
                      }}>3</span>
                      <span style={{ fontSize: '0.82rem', color: pipelineWizardStep >= 3 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pipelineWizardStep === 3 ? 600 : 400 }}>Done</span>
                    </div>
                  </div>

                  <form onSubmit={handleCreatePipelineSubmit}>
                    
                    {/* STEP 1: CONFIGURATION FORM */}
                    {pipelineWizardStep === 1 && (
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
                          Configure settings to link <strong style={{ color: 'var(--text-primary)' }}>{pipelineApp.name}</strong> to Azure DevOps.
                        </p>

                        {/* MULTI-ENV SIBLING PANEL */}
                        {siblingApps.length > 0 && (
                          <div style={{
                            backgroundColor: 'rgba(20, 184, 166, 0.07)',
                            border: '1px solid rgba(20, 184, 166, 0.3)',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                              <span style={{ fontSize: '1rem' }}>🔗</span>
                              <strong style={{ color: 'var(--accent-teal)', fontSize: '0.9rem' }}>Multi-Environment Deployment</strong>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '10px', lineHeight: 1.5 }}>
                              This repo also serves <strong>{siblingApps.length}</strong> other environment{siblingApps.length > 1 ? 's' : ''}. One pipeline handles all branches — registering it here will cover all of them automatically.
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                                backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', color: 'var(--accent-purple)'
                              }}>
                                📍 {pipelineApp.name} {pipelineApp.pipelineId ? '✓' : ''}
                              </span>
                              {siblingApps.map(sib => (
                                <span key={sib.name} style={{
                                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 500,
                                  backgroundColor: sib.pipelineId ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${sib.pipelineId ? 'rgba(34,197,94,0.3)' : 'var(--glass-border)'}`,
                                  color: sib.pipelineId ? 'var(--success)' : 'var(--text-secondary)'
                                }}>
                                  {sib.name} {sib.pipelineId ? '✓' : '○'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ACTIVE PIPELINE BADGE */}
                        {pipelineApp.pipelineId && (
                          <div style={{
                            backgroundColor: 'rgba(168, 85, 247, 0.08)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            color: 'var(--text-primary)',
                            marginBottom: '14px',
                            fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}>
                            <CheckCircle2 size={15} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                            <span><strong>Active Pipeline:</strong> {pipelineApp.pipelineName || 'Linked'} (ID: {pipelineApp.pipelineId})</span>
                          </div>
                        )}

                        {pipelineError && (
                          <div className="glass-panel" style={{ padding: '12px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)', marginBottom: '14px', fontSize: '0.9rem' }}>
                            {pipelineError}
                          </div>
                        )}

                        {/* GitHub Repo Selector */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Repository</label>
                          {!useCustomRepo ? (
                            <div>
                              <select
                                value={githubRepo}
                                onChange={(e) => {
                                  if (e.target.value === 'custom') {
                                    setUseCustomRepo(true);
                                    setGithubRepo('');
                                  } else {
                                    setGithubRepo(e.target.value);
                                    checkYmlExists(e.target.value);
                                    loadYmlForPipelineModal(e.target.value, pipelineBranch);
                                  }
                                }}
                                required
                              >
                                <option value="" disabled>Select a repository...</option>
                                {(() => {
                                  const { recommended, other } = getCategorizedRepos(pipelineApp?.type);
                                  return (
                                    <>
                                      {recommended.length > 0 && (
                                        <optgroup label="Recommended Repositories">
                                          {recommended.map(repo => (
                                            <option key={repo.fullName} value={repo.fullName}>{repo.fullName}</option>
                                          ))}
                                        </optgroup>
                                      )}
                                      {other.length > 0 && (
                                        <optgroup label="Other Repositories">
                                          {other.map(repo => (
                                            <option key={repo.fullName} value={repo.fullName}>{repo.fullName}</option>
                                          ))}
                                        </optgroup>
                                      )}
                                    </>
                                  );
                                })()}
                                <option value="custom">✍️ Enter Custom Repository...</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="text"
                                value={githubRepo}
                                onChange={(e) => setGithubRepo(e.target.value)}
                                onBlur={(e) => { 
                                  if (e.target.value) {
                                    checkYmlExists(e.target.value); 
                                    loadYmlForPipelineModal(e.target.value, pipelineBranch);
                                  }
                                }}
                                placeholder="Owner/Repository (e.g. Estevia-TechSolutions/my-app)"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setUseCustomRepo(false);
                                  setGithubRepo(githubRepos[0]?.fullName || '');
                                  if (githubRepos[0]?.fullName) {
                                    checkYmlExists(githubRepos[0].fullName);
                                    loadYmlForPipelineModal(githubRepos[0].fullName, pipelineBranch);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-blue)',
                                  fontSize: '0.8rem',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                  marginTop: '6px',
                                  padding: 0
                                }}
                              >
                                Select from predefined list
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Branch Input */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Branch (triggers in YML)</label>
                          <input
                            type="text"
                            value={pipelineBranch}
                            onChange={(e) => {
                              setPipelineBranch(e.target.value);
                              if (githubRepo) {
                                loadYmlForPipelineModal(githubRepo, e.target.value);
                              }
                            }}
                            placeholder="e.g. main or dev"
                            required
                          />
                        </div>

                        {/* DevOps Settings */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Organization URL</label>
                          <input
                            type="text"
                            value={devopsOrgUrl}
                            onChange={(e) => setDevopsOrgUrl(e.target.value)}
                            placeholder="https://dev.azure.com/esteviatech"
                            required
                          />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Project Name</label>
                          <input
                            type="text"
                            value={devopsProject}
                            onChange={(e) => setDevopsProject(e.target.value)}
                            placeholder="Estevia-Platform"
                            required
                          />
                        </div>

                        {/* Step 1 Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setPipelineApp(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              if (!githubRepo) {
                                setPipelineError('Please select or specify a GitHub repository.');
                                return;
                              }
                              setPipelineError(null);
                              checkYmlExists(githubRepo);
                              loadYmlForPipelineModal(githubRepo, pipelineBranch);
                              setPipelineWizardStep(2);
                            }}
                          >
                            Next: Review YML
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: REVIEW & EDIT PIPELINE YAML */}
                    {pipelineWizardStep === 2 && (
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
                          Verify and edit the build configuration in <code>azure-pipelines.yml</code> before registering the pipeline.
                        </p>

                        {pipelineError && (
                          <div className="glass-panel" style={{ padding: '12px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)', marginBottom: '14px', fontSize: '0.9rem' }}>
                            {pipelineError}
                          </div>
                        )}

                        {ymlFound && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '10px 14px', backgroundColor: 'rgba(34, 197, 94, 0.07)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}>
                            <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Pipeline definition found:{' '}
                              <a
                                href={ymlFound}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--success)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              >
                                azure-pipelines.yml
                                <ExternalLink size={11} />
                              </a>
                            </span>
                          </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Edit YAML File Content</label>
                          {pipelineModalYmlLoading ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                              <RefreshCw size={20} className="spin-anim" style={{ color: 'var(--accent-purple)', marginBottom: '6px' }} />
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Loading YML build configuration...</p>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Source: {pipelineModalYmlSource === 'github' ? (
                                    <strong style={{ color: 'var(--success)' }}>✓ Loaded from GitHub</strong>
                                  ) : (
                                    <strong style={{ color: 'var(--accent-purple)' }}>ℹ Custom template generated</strong>
                                  )}
                                </span>
                              </div>
                              <div className="glass-panel" style={{ padding: '10px', backgroundColor: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                                <textarea
                                  value={pipelineModalYmlContent}
                                  onChange={(e) => setPipelineModalYmlContent(e.target.value)}
                                  rows={12}
                                  style={{
                                    width: '100%',
                                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                    fontSize: '0.78rem',
                                    color: '#e2e8f0',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    resize: 'vertical',
                                    lineHeight: '1.4'
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Step 2 Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setPipelineWizardStep(1)}
                            disabled={creatingPipeline}
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={creatingPipeline || pipelineModalYmlLoading || !pipelineModalYmlContent}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            {creatingPipeline ? (
                              <>
                                <RefreshCw size={12} className="spin-anim" /> Committing & Registering...
                              </>
                            ) : (
                              'Commit YML & Register Pipeline'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: DONE / SUCCESS SUMMARY */}
                    {pipelineWizardStep === 3 && (
                      <div>
                        {pipelineSuccess && (
                          <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.08)', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                              {pipelineSuccess}
                            </div>
                          </div>
                        )}

                        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Configuration Summary</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>GitHub Repository:</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{githubRepo}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Target Branch:</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{pipelineBranch}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>DevOps Organization:</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{devopsOrgUrl}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>DevOps Project:</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{devopsProject}</strong>
                            </div>
                          </div>
                        </div>

                        {siblingApps.length > 0 && (
                          <div style={{
                            backgroundColor: 'rgba(20, 184, 166, 0.04)',
                            border: '1px solid rgba(20, 184, 166, 0.15)',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '20px',
                            fontSize: '0.82rem'
                          }}>
                            <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>ℹ️ Multi-Environment Sync:</span> Sibling app environments sharing this repository will automatically deploy when trigger branches are matched.
                          </div>
                        )}

                        {/* Step 3 Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              setPipelineApp(null);
                              setPipelineSuccess(null);
                              setPipelineError(null);
                            }}
                          >
                            Finish & Close
                          </button>
                        </div>
                      </div>
                    )}

                  </form>
                </div>
              </div>
            )}

            {/* BACKEND DEPLOYMENT INFO MODAL */}
            {backendDeployModalOpen && backendDeployGroup && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '20px' }}>
                <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '560px', position: 'relative' }}>
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setBackendDeployModalOpen(false)} 
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}
                  >
                    ✕
                  </button>

                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <PlusCircle size={24} style={{ color: 'var(--accent-purple)' }} />
                    Deploy Backend Container
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Deployment instructions and design options for the backend container environment.
                  </p>

                  <div style={{ marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '12px' }}>
                      Automated Azure Container App (ACA) provisioning from custom branch templates is not supported in the current version of the DevOps hub.
                    </p>
                    <p style={{ marginBottom: '12px' }}>
                      To deploy the <strong>{backendDeployBranch}</strong> branch of the repository <strong>{backendDeployGroup.repoPath}</strong>:
                    </p>
                    <ol style={{ paddingLeft: '20px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>
                        <strong>Create / Update Pipeline:</strong> Register or update the Azure DevOps build pipeline targeting the branch <code>{backendDeployBranch}</code>.
                      </li>
                      <li>
                        <strong>Trigger build run:</strong> Triggering a pipeline run will build the Docker container image, push it to Azure Container Registry (ACR), and deploy/update the revision on Azure Container Apps.
                      </li>
                    </ol>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setBackendDeployModalOpen(false)}
                    >
                      Close
                    </button>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={() => {
                        setBackendDeployModalOpen(false);
                        // Open the pipeline modal prefilled with details
                        const appMock: AppResource = {
                          name: `${backendDeployGroup.key}-${backendDeployBranch}`,
                          type: 'backend',
                          location: 'eastus2',
                          hostname: '',
                          resourceId: '',
                          status: 'Not Deployed',
                          repositoryUrl: backendDeployGroup.repoUrl,
                          pipelineId: backendDeployGroup.pipelineId,
                          pipelineName: backendDeployGroup.pipelineName
                        };
                        openPipelineModal(appMock, backendDeployGroup);
                      }}
                    >
                      Configure Pipeline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PIPELINE JOBS MASTER-DETAIL MODAL */}
            {selectedStageForJobs && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '20px' }}>
                <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '750px', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                  
                  {/* Close button */}
                  <button 
                    onClick={() => {
                      setSelectedStageForJobs(null);
                      setSelectedJobForDetails(null);
                    }} 
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}
                  >
                    ✕
                  </button>

                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    <GitBranch style={{ color: 'var(--accent-purple)' }} />
                    {selectedStageForJobs.displayName} Pipeline Jobs
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
                    Select a job from the list to view its execution details, execution duration, and timeline events.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                    
                    {/* Left Panel: Jobs List */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px', 
                      overflowY: 'auto',
                      paddingRight: '8px',
                      borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`
                    }}>
                      {!selectedStageForJobs.jobs || selectedStageForJobs.jobs.length === 0 ? (
                        <div style={{ padding: '20px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.88rem' }}>
                          No jobs registered for this stage.
                        </div>
                      ) : (
                        selectedStageForJobs.jobs.map((job: any) => {
                          const isSelected = selectedJobForDetails?.id === job.id;
                          const isDark = theme === 'dark';
                          
                          // Determine status color
                          let statusColor = 'var(--text-secondary)';
                          let statusBg = 'rgba(255,255,255,0.03)';
                          let statusBorder = 'rgba(255,255,255,0.08)';
                          let icon = <Minus size={12} />;

                          if (job.state === 'inProgress') {
                            statusColor = isDark ? '#fbbf24' : '#b45309';
                            statusBg = isDark ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.06)';
                            statusBorder = isDark ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.2)';
                            icon = <RefreshCw size={12} className="spin-anim" />;
                          } else if (job.state === 'completed') {
                            if (job.result === 'succeeded') {
                              statusColor = isDark ? 'var(--success)' : '#15803d';
                              statusBg = isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)';
                              statusBorder = isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)';
                              icon = <Check size={12} />;
                            } else if (job.result === 'failed') {
                              statusColor = isDark ? 'var(--error)' : '#b91c1c';
                              statusBg = isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)';
                              statusBorder = isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)';
                              icon = <X size={12} />;
                            } else {
                              statusColor = isDark ? '#94a3b8' : '#4b5563';
                              statusBg = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(75,85,99,0.05)';
                              statusBorder = isDark ? 'rgba(148,163,184,0.2)' : 'rgba(75,85,99,0.12)';
                              icon = <AlertTriangle size={12} />;
                            }
                          }

                          return (
                            <div
                              key={job.id}
                              onClick={() => setSelectedJobForDetails(job)}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: isSelected 
                                  ? '1px solid var(--accent-purple)' 
                                  : `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}`,
                                backgroundColor: isSelected
                                  ? 'rgba(168, 85, 247, 0.08)'
                                  : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(15,23,42,0.01)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: statusBg,
                                border: `1px solid ${statusBorder}`,
                                color: statusColor,
                                flexShrink: 0
                              }}>
                                {icon}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                                <span style={{ 
                                  fontSize: '0.85rem', 
                                  fontWeight: isSelected ? 600 : 500,
                                  color: 'var(--text-primary)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  textAlign: 'left'
                                }}>
                                  {job.displayName}
                                </span>
                                <span style={{ 
                                  fontSize: '0.72rem', 
                                  color: 'var(--text-secondary)',
                                  marginTop: '2px',
                                  textAlign: 'left',
                                  textTransform: 'capitalize'
                                }}>
                                  {job.state === 'completed' ? job.result : job.state}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Right Panel: Selected Job Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
                      {!selectedJobForDetails ? (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          height: '100%', 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          gap: '12px'
                        }}>
                          <Cpu size={32} style={{ opacity: 0.4 }} />
                          <span>Select a job to view run history and execution telemetry.</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                          <div>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 600, 
                              color: 'var(--accent-purple)', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.05em' 
                            }}>
                              Job Execution Details
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '4px', color: 'var(--text-primary)' }}>
                              {selectedJobForDetails.displayName}
                            </h4>
                          </div>

                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '16px',
                            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(15,23,42,0.01)',
                            padding: '16px',
                            borderRadius: '8px',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}`
                          }}>
                            <div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Status State</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                {selectedJobForDetails.state}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Result Status</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px', color: selectedJobForDetails.result === 'succeeded' ? 'var(--success)' : selectedJobForDetails.result === 'failed' ? 'var(--error)' : 'var(--text-primary)', textTransform: 'capitalize' }}>
                                {selectedJobForDetails.result || 'Active'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Start Time</div>
                              <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--text-primary)' }}>
                                {selectedJobForDetails.startTime ? new Date(selectedJobForDetails.startTime).toLocaleString() : 'Not started'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Finish Time</div>
                              <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--text-primary)' }}>
                                {selectedJobForDetails.finishTime ? new Date(selectedJobForDetails.finishTime).toLocaleString() : 'Active'}
                              </div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Execution Duration</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px', color: 'var(--text-primary)' }}>
                                {formatDuration(selectedJobForDetails.startTime, selectedJobForDetails.finishTime)}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            Pipeline jobs run in secure corporate runners. You can view full execution logs, container images, build artifacts, and diagnostics logs directly inside Azure DevOps.
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={() => {
                            setSelectedStageForJobs(null);
                            setSelectedJobForDetails(null);
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PROVISION WEB APP WIZARD */}
        {activeTab === 'provision' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '280px 1fr', 
            gap: '30px', 
            maxWidth: '1200px', 
            margin: '0 auto',
            alignItems: 'stretch'
          }}>
            
            {/* Left Column: Multi-step Vertical Stepper */}
            <div className="glass-panel" style={{ 
              padding: '36px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0px',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              {[
                { stepNum: 1, label: 'GitHub Source Connection', sublabel: 'Select repository, triggers, and deployment target branch' },
                { stepNum: 2, label: 'Verify Build Pipeline YML', sublabel: 'Review, modify, and commit azure-pipelines.yml configuration file' },
                { stepNum: 3, label: appType === 'backend' ? 'Provision Azure ACA' : 'Provision Azure SWA', sublabel: 'Create managed container environments or static site hosts in the cloud' },
                { stepNum: 4, label: 'Bindings & Launch Sequence', sublabel: 'Register Azure DevOps build pipelines and bind GoDaddy subdomains' }
              ].map((s) => {
                const isActive = provisionStep === s.stepNum;
                const isCompleted = provisionStep > s.stepNum;
                return (
                  <div key={s.stepNum} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    opacity: isActive || isCompleted ? 1 : 0.5,
                    transition: 'opacity 0.3s ease'
                  }}>
                    {/* Stepper column line and circle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
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
                        {isCompleted ? '✓' : s.stepNum}
                      </div>
                      {s.stepNum < 4 && (
                        <div style={{ 
                          width: '2px', 
                          height: '38px',
                          background: isCompleted 
                            ? 'var(--accent-blue)' 
                            : isActive 
                              ? 'linear-gradient(180deg, var(--accent-purple), rgba(255,255,255,0.06))' 
                              : 'rgba(255,255,255,0.06)', 
                          margin: '4px 0' 
                        }} />
                      )}
                    </div>
                    
                    {/* Label & Sublabel */}
                    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: s.stepNum < 4 ? '26px' : '0' }}>
                      <span style={{ 
                        fontSize: '0.88rem', 
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        fontWeight: isActive ? 600 : 400,
                        lineHeight: '1.4'
                      }}>
                        {s.label}
                      </span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        lineHeight: '1.4'
                      }}>
                        {s.sublabel}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Informative text at the bottom of the sidebar */}
              <div style={{ 
                marginTop: 'auto', 
                paddingTop: '24px', 
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--text-secondary)', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Security & Compliance
                </span>
                <p style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.4', 
                  margin: 0 
                }}>
                  All credentials and tokens are encrypted with AES-256-GCM keys. Generated build pipelines strictly conform to corporate DevOps security standards and automatically run dependency vulnerability checks.
                </p>
                <div style={{ 
                  marginTop: '4px',
                  fontSize: '0.72rem', 
                  color: 'var(--accent-purple)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: 500
                }}>
                  <ShieldCheck size={12} /> Encrypted Credentials Active
                </div>
              </div>
            </div>

            {/* Right Column: Active Step Content */}
            <div className="glass-panel" style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}>
              
              {/* Decorative top gradient border */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-teal))' }} />

              {/* STEP 1: GITHUB SOURCE SELECTION */}
              {provisionStep === 1 && (
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <GitBranch style={{ color: 'var(--accent-purple)' }} />
                    Select GitHub Repository & Branches
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                    Choose the repository, target branches triggers, and the primary deploy branch. You can deploy frontends to Azure Static Web Apps or backends to Azure Container Apps.
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Application Type</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className={appType === 'frontend' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => handleAppTypeChange('frontend')}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}
                      >
                        Frontend SWA
                      </button>
                      <button
                        type="button"
                        className={appType === 'backend' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => handleAppTypeChange('backend')}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}
                      >
                        Backend ACA Container
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>GitHub Repository</label>
                    <select 
                      value={selectedRepo} 
                      onChange={(e) => handleRepoChange(e.target.value)}
                      style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    >
                      <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>-- Choose Repository --</option>
                      {(() => {
                        const { recommended, other } = getCategorizedRepos(appType);
                        return (
                          <>
                            {recommended.length > 0 && (
                              <optgroup label="Recommended Repositories" style={{ background: 'var(--bg-secondary)' }}>
                                {recommended.map(repo => (
                                  <option key={repo.id} value={repo.fullName} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{repo.fullName}</option>
                                ))}
                              </optgroup>
                            )}
                            {other.length > 0 && (
                              <optgroup label="Other Repositories" style={{ background: 'var(--bg-secondary)' }}>
                                {other.map(repo => (
                                  <option key={repo.id} value={repo.fullName} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{repo.fullName}</option>
                                ))}
                              </optgroup>
                            )}
                          </>
                        );
                      })()}
                    </select>
                  </div>

                  {selectedRepo && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Target Branches (triggers in YML)</label>
                      {loadingBranches ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                          <RefreshCw size={14} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading repository branches...</span>
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: '6px', 
                          maxHeight: '200px', 
                          overflowY: 'auto', 
                          overflowX: 'hidden',
                          padding: '8px', 
                          background: 'var(--input-bg)', 
                          borderRadius: '8px', 
                          border: '1px solid var(--glass-border)',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          {branches.map((b) => {
                            const isChecked = selectedBranches.includes(b.name);
                            return (
                              <label 
                                key={b.name} 
                                className={`branch-checkbox-item ${isChecked ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBranches([...selectedBranches, b.name]);
                                    } else {
                                      setSelectedBranches(selectedBranches.filter(x => x !== b.name));
                                    }
                                  }}
                                  style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px', cursor: 'pointer' }}
                                />
                                <span style={{ 
                                  minWidth: 0, 
                                  wordBreak: 'break-all', 
                                  whiteSpace: 'normal',
                                  lineHeight: '1.4' 
                                }}>
                                  {b.name}{b.protected ? ' 🔒' : ''}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      
                      {selectedBranches.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Primary Deploy Branch (Initial target)</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                          >
                            {selectedBranches.map(bName => (
                              <option key={bName} value={bName} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{bName}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DUPLICATE DEPLOYMENT WARNING */}
                  {(() => {
                    const isRepoDeployed = selectedRepo && apps.some(a => a.repositoryUrl && a.repositoryUrl.toLowerCase().includes(selectedRepo.toLowerCase()));
                    const matchingApp = isRepoDeployed ? apps.find(a => a.repositoryUrl && a.repositoryUrl.toLowerCase().includes(selectedRepo.toLowerCase())) : null;
                    if (matchingApp) {
                      return (
                        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--warning)', backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <AlertTriangle style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} size={18} />
                          <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                            <strong style={{ color: 'var(--warning)' }}>Already Deployed Warning:</strong> This repository is already associated with {matchingApp.type} <strong style={{ color: 'var(--text-primary)' }}>{matchingApp.name}</strong>. Deploying again will configure a duplicate instance.
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      disabled={!selectedRepo || selectedBranches.length === 0 || loadingBranches}
                      onClick={() => handleMoveToStep2()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Verify Pipeline YAML <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PIPELINE YAML CONFIGURATION */}
              {provisionStep === 2 && (
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Settings style={{ color: 'var(--accent-purple)' }} />
                    Verify & Customize Build Pipeline YML
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
                    Configure the `azure-pipelines.yml` file to be committed to branch <strong>{selectedBranch}</strong>. This YML defines trigger branches and handles automated builds.
                  </p>

                  {ymlLoading ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <RefreshCw size={36} className="spin-anim" style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>Loading azure-pipelines.yml configuration...</p>
                    </div>
                  ) : (
                    <div>
                      {ymlError && (
                        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                          {ymlError}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Status: {ymlSource === 'github' ? (
                            <strong style={{ color: 'var(--success)' }}>✓ Loaded existing YML from GitHub branch</strong>
                          ) : (
                            <strong style={{ color: 'var(--accent-purple)' }}>ℹ Custom pipeline template generated</strong>
                          )}
                        </span>
                        
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleCommitCustomYml}
                          disabled={creatingYml}
                          style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          {creatingYml ? (
                            <><RefreshCw size={12} className="spin-anim" /> Committing...</>
                          ) : (
                            'Commit YML to GitHub'
                          )}
                        </button>
                      </div>

                      <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '8px', marginBottom: '20px' }}>
                        <textarea
                          value={ymlContent}
                          onChange={(e) => setYmlContent(e.target.value)}
                          rows={14}
                          style={{
                            width: '100%',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            resize: 'vertical',
                            lineHeight: '1.5'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setProvisionStep(1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn-primary" 
                      disabled={ymlLoading || creatingYml || !ymlContent}
                      onClick={() => setProvisionStep(3)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Azure Resource Setup <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: AZURE SWA / ACA PROVISIONING */}
              {provisionStep === 3 && (
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <PlusCircle style={{ color: 'var(--accent-purple)' }} />
                    {appType === 'backend' ? 'Provision Azure Container App' : 'Provision Azure SWA Resource'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                    {appType === 'backend' 
                      ? 'Create a secure, managed container app on Azure to host your backend services. It runs in the regional container environment.' 
                      : 'Create a high-availability Static Web App container in Azure. Azure will host the frontend bundle and supply a default hostname.'}
                  </p>

                  {provisionSuccess && (
                    <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                      {provisionSuccess}
                    </div>
                  )}

                  {provisionError && (
                    <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                      {provisionError}
                    </div>
                  )}

                  <form onSubmit={handleProvision}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {appType === 'backend' ? 'Container App Name' : 'Static Web App Name'}
                      </label>
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder={appType === 'backend' ? 'estevia-brand-api' : 'estevia-brand-site-swa'} 
                        required 
                        disabled={provisioning}
                      />
                    </div>

                    {appType === 'backend' && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Target Ingress Port</label>
                        <input 
                          type="number" 
                          value={targetPort} 
                          onChange={(e) => setTargetPort(e.target.value)} 
                          placeholder="5005" 
                          required 
                          disabled={provisioning}
                        />
                      </div>
                    )}
                    
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Azure Region Location</label>
                      <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} disabled={provisioning}>
                        <option value="eastus2">East US 2 (Recommended)</option>
                        <option value="centralus">Central US</option>
                        <option value="westus2">West US 2</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => setProvisionStep(2)}
                        disabled={provisioning}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={provisioning || !newName}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {provisioning ? (
                          <>
                            <RefreshCw size={14} className="spin-anim" /> Allocating {appType === 'backend' ? 'Container App' : 'SWA'} (10-20s)...
                          </>
                        ) : (
                          <>
                            Deploy {appType === 'backend' ? 'Container App' : 'SWA'} Resource <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: BINDINGS & CI/CD PIPELINE */}
              {provisionStep === 4 && (
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <ShieldCheck style={{ color: 'var(--accent-teal)' }} />
                    Finalize DNS Bindings & CI/CD Pipelines
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                    The Azure resource is active! Now connect it to your Azure DevOps pipeline for CI/CD automation and link your GoDaddy custom subdomain.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                    
                    {/* Pipeline Registration Card */}
                    <div className="glass-panel" style={{ padding: '20px', border: pipelineRegSuccess ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--glass-border)', backgroundColor: pipelineRegSuccess ? 'rgba(34,197,94,0.02)' : 'transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
                            <GitBranch size={16} style={{ color: 'var(--accent-purple)' }} />
                            1. Register CI/CD Build Pipeline
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                            Creates the build configuration on Azure DevOps linked to branch <strong>{selectedBranch}</strong>.
                          </p>
                        </div>
                        {pipelineRegSuccess && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.2)' }}>
                            Registered ✓
                          </span>
                        )}
                      </div>

                      {pipelineRegError && (
                        <div style={{ color: 'var(--error)', fontSize: '0.82rem', marginBottom: '12px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          {pipelineRegError}
                        </div>
                      )}

                      {!pipelineRegSuccess ? (
                        <button 
                          className="btn-primary" 
                          onClick={handleRegisterPipeline}
                          disabled={pipelineRegistering}
                          style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {pipelineRegistering ? (
                            <>
                              <RefreshCw size={12} className="spin-anim" /> Registering...
                            </>
                          ) : (
                            'Create Pipeline in DevOps'
                          )}
                        </button>
                      ) : (
                        registeredPipelineUrl && (
                          <a href={registeredPipelineUrl} target="_blank" rel="noreferrer" className="btn-secondary"
                             style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                            Open Build Pipeline <ExternalLink size={12} />
                          </a>
                        )
                      )}
                    </div>

                    {/* DNS Domain Binding Card */}
                    <div className="glass-panel" style={{ padding: '20px', border: dnsBindSuccess ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--glass-border)', backgroundColor: dnsBindSuccess ? 'rgba(34,197,94,0.02)' : 'transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
                            <Globe size={16} style={{ color: 'var(--accent-teal)' }} />
                            2. Configure GoDaddy Custom DNS Bindings
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                            Binds FQDN subdomain <strong>{newName}.{domainInput}</strong> on GoDaddy zone file.
                          </p>
                        </div>
                        {dnsBindSuccess && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.2)' }}>
                            Active ✓
                          </span>
                        )}
                      </div>

                      {dnsBindError && (
                        <div style={{ color: 'var(--error)', fontSize: '0.82rem', marginBottom: '12px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          {dnsBindError}
                        </div>
                      )}

                      {!dnsBindSuccess ? (
                        <button 
                          className="btn-primary" 
                          onClick={handleDnsBind}
                          disabled={dnsBinding}
                          style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {dnsBinding ? (
                            <>
                              <RefreshCw size={12} className="spin-anim" /> Mapping DNS...
                            </>
                          ) : (
                            'Bind Domain & Map DNS'
                          )}
                        </button>
                      ) : (
                        <a href={`https://${newName}.${domainInput}`} target="_blank" rel="noreferrer" className="btn-secondary"
                           style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                          Launch Custom Domain <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                  </div>

                  {/* SUMMARY SECTION ONCE LAUNCHED */}
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        // Reset all wizard states
                        setSelectedRepo('');
                        setSelectedBranch('');
                        setBranches([]);
                        setNewName('');
                        setProvisionStep(1);
                        setProvisionSuccess(null);
                        setProvisionError(null);
                        setPipelineRegSuccess(false);
                        setPipelineRegError(null);
                        setDnsBindSuccess(false);
                        setDnsBindError(null);
                        setYmlFound(null);
                        setYmlMissing(null);
                        setYmlCreated(false);
                      }}
                    >
                      Provision Another App
                    </button>
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={() => {
                        setActiveTab('scan');
                        handleScan();
                      }}
                    >
                      Go to Scanning Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: CREDENTIALS MANAGEMENT */}
        {activeTab === 'credentials' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
            
            {/* Combined Integration Keys & Registry Status */}
            <div>
              <div className="glass-panel" style={{ padding: '32px', height: '100%' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Database style={{ color: 'var(--accent-teal)' }} />
                  Database Credentials & Integration Keys
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  Manage decrypted API keys and integration tokens retrieved dynamically from the database via <strong>AES-256-GCM</strong>.
                </p>

                {credMsg && (
                  <div className="glass-panel" style={{ 
                    padding: '12px', 
                    borderColor: credMsg.type === 'success' ? 'var(--success)' : 'var(--error)', 
                    backgroundColor: credMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--text-primary)', 
                    marginBottom: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {credMsg.text}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '24px' }}>
                  
                  {/* GitHub Config */}
                  <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-purple)' }}>GitHub Personal Access Token</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Powers pipeline templates commits & repo scanner.</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {credentialStatus.github && (
                          <button
                            type="button"
                            onClick={() => {
                              if (githubToken !== '' && showGithubToken) {
                                setGithubToken('••••••••••••••••••••');
                                setShowGithubToken(false);
                              } else {
                                handleLoadSavedCredential('github');
                              }
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--accent-purple)',
                              fontSize: '0.75rem',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {githubToken !== '' && showGithubToken ? (
                              <>
                                <EyeOff size={12} />
                                Hide Saved
                              </>
                            ) : (
                              <>
                                <Eye size={12} />
                                Reveal Saved
                              </>
                            )}
                          </button>
                        )}
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: credentialStatus.github ? 'var(--success)' : 'var(--error)', 
                          background: credentialStatus.github ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 500
                        }}>
                          {credentialStatus.github ? 'ACTIVE (ENCRYPTED)' : 'NOT CONFIGURED'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                          type={showGithubToken ? "text" : "password"} 
                          value={githubToken} 
                          onChange={(e) => setGithubToken(e.target.value)} 
                          placeholder="ghp_...................................." 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowGithubToken(!showGithubToken)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                        >
                          {showGithubToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button 
                        className="btn-primary" 
                        onClick={() => handleSaveCredential('github', { token: githubToken }, 'GitHub Platform Token')}
                        disabled={savingCredentials === 'github' || !githubToken || githubToken === '••••••••••••••••••••' || (!!decryptedGithubToken && githubToken === decryptedGithubToken)}
                      >
                        {savingCredentials === 'github' ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>

                  {/* GoDaddy Config */}
                  <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-teal)' }}>GoDaddy API Credentials</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Powers automatic DNS record binding.</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {credentialStatus.godaddy && (
                          <button
                            type="button"
                            onClick={() => {
                              if ((godaddyKey !== '' || godaddySecret !== '') && showGodaddyKey) {
                                setGodaddyKey('••••••••••••••••••••');
                                setGodaddySecret('••••••••••••••••••••');
                                setShowGodaddyKey(false);
                                setShowGodaddySecret(false);
                              } else {
                                handleLoadSavedCredential('godaddy');
                              }
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--accent-teal)',
                              fontSize: '0.75rem',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {(godaddyKey !== '' || godaddySecret !== '') && showGodaddyKey ? (
                              <>
                                <EyeOff size={12} />
                                Hide Saved
                              </>
                            ) : (
                              <>
                                <Eye size={12} />
                                Reveal Saved
                              </>
                            )}
                          </button>
                        )}
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: credentialStatus.godaddy ? 'var(--success)' : 'var(--error)', 
                          background: credentialStatus.godaddy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 500
                        }}>
                          {credentialStatus.godaddy ? 'ACTIVE (ENCRYPTED)' : 'NOT CONFIGURED'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showGodaddyKey ? "text" : "password"} 
                          value={godaddyKey} 
                          onChange={(e) => setGodaddyKey(e.target.value)} 
                          placeholder="GoDaddy API Key" 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowGodaddyKey(!showGodaddyKey)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                        >
                          {showGodaddyKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showGodaddySecret ? "text" : "password"} 
                          value={godaddySecret} 
                          onChange={(e) => setGodaddySecret(e.target.value)} 
                          placeholder="GoDaddy API Secret" 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowGodaddySecret(!showGodaddySecret)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                        >
                          {showGodaddySecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleSaveCredential('godaddy', { apiKey: godaddyKey, apiSecret: godaddySecret }, 'GoDaddy Domain API Keys')}
                      disabled={savingCredentials === 'godaddy' || !godaddyKey || !godaddySecret || godaddyKey === '••••••••••••••••••••' || godaddySecret === '••••••••••••••••••••' || (!!decryptedGodaddyKey && godaddyKey === decryptedGodaddyKey && godaddySecret === decryptedGodaddySecret)}
                      style={{ width: '100%' }}
                    >
                      {savingCredentials === 'godaddy' ? 'Saving GoDaddy API Keys...' : 'Save GoDaddy Keys'}
                    </button>
                  </div>

                  {/* Azure DevOps Config */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-blue)' }}>Azure DevOps PAT</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Registers pipelines & triggers builds.</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {credentialStatus.azure_devops && (
                          <button
                            type="button"
                            onClick={() => {
                              if (devopsPat !== '' && showDevopsPat) {
                                setDevopsPat('••••••••••••••••••••');
                                setShowDevopsPat(false);
                              } else {
                                handleLoadSavedCredential('azure_devops');
                              }
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--accent-blue)',
                              fontSize: '0.75rem',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {devopsPat !== '' && showDevopsPat ? (
                              <>
                                <EyeOff size={12} />
                                Hide Saved
                              </>
                            ) : (
                              <>
                                <Eye size={12} />
                                Reveal Saved
                              </>
                            )}
                          </button>
                        )}
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: credentialStatus.azure_devops ? 'var(--success)' : 'var(--error)', 
                          background: credentialStatus.azure_devops ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 500
                        }}>
                          {credentialStatus.azure_devops ? 'ACTIVE (ENCRYPTED)' : 'NOT CONFIGURED'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                          type={showDevopsPat ? "text" : "password"} 
                          value={devopsPat} 
                          onChange={(e) => setDevopsPat(e.target.value)} 
                          placeholder="Azure DevOps PAT (Pipeline Scope)" 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowDevopsPat(!showDevopsPat)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                        >
                          {showDevopsPat ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button 
                        className="btn-primary" 
                        onClick={() => handleSaveCredential('azure_devops', { pat: devopsPat }, 'Azure DevOps Pipeline PAT')}
                        disabled={savingCredentials === 'azure_devops' || !devopsPat || devopsPat === '••••••••••••••••••••' || (!!decryptedDevopsPat && devopsPat === decryptedDevopsPat)}
                      >
                        {savingCredentials === 'azure_devops' ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Organization Settings Panel */}
            <div>
              <div className="glass-panel" style={{ padding: '32px', height: '100%' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Settings style={{ color: 'var(--accent-teal)' }} />
                  Organization Settings
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Infrastructure config, DNS domain, DevOps settings, and GitHub owner mapping.
                </p>

                {settingsMsg && (
                  <div className="glass-panel" style={{ 
                    padding: '12px', 
                    borderColor: settingsMsg.type === 'success' ? 'var(--success)' : 'var(--error)', 
                    backgroundColor: settingsMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--text-primary)', 
                    marginBottom: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {settingsMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveSettings}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Subscription ID</label>
                      <input 
                        type="text" 
                        value={azureSubscriptionId} 
                        onChange={(e) => setAzureSubscriptionId(e.target.value)} 
                        placeholder="a812e8e3-34f9-4773-82ee-6398869533b0"
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Target Resource Group</label>
                      <input 
                        type="text" 
                        value={azureResourceGroup} 
                        onChange={(e) => setAzureResourceGroup(e.target.value)} 
                        placeholder="Estevia-Prod-RG"
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Default DNS Domain</label>
                      <input 
                        type="text" 
                        value={defaultDnsDomain} 
                        onChange={(e) => setDefaultDnsDomain(e.target.value)} 
                        placeholder="esteviatech.com"
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Org URL</label>
                      <input 
                        type="text" 
                        value={azureDevopsOrgUrl} 
                        onChange={(e) => setAzureDevopsOrgUrl(e.target.value)} 
                        placeholder="https://dev.azure.com/esteviatech"
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Project Name</label>
                      <input 
                        type="text" 
                        value={azureDevopsProject} 
                        onChange={(e) => setAzureDevopsProject(e.target.value)} 
                        placeholder="Estevia-Platform"
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Pipeline Variable Group</label>
                      <input 
                        type="text" 
                        value={pipelineVariableGroup} 
                        onChange={(e) => setPipelineVariableGroup(e.target.value)} 
                        placeholder="estevia-frontend-vars"
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Owner/Org</label>
                      <input 
                        type="text" 
                        value={githubOwner} 
                        onChange={(e) => setGithubOwner(e.target.value)} 
                        placeholder="Estevia-TechSolutions"
                        required 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={savingSettings}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      {savingSettings ? 'Saving Settings...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: COST MANAGEMENT */}
        {activeTab === 'cost' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)'
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

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
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

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6'
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
                className={`tab-btn ${costTab === 'breakdown' ? 'active' : ''}`} 
                onClick={() => setCostTab('breakdown')}
                style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}
              >
                Resource Cost Breakdown
              </button>
              <button 
                type="button"
                className={`tab-btn ${costTab === 'recommendations' ? 'active' : ''}`} 
                onClick={() => setCostTab('recommendations')}
                style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}
              >
                Optimization Recommendations ({costSuggestions.length})
              </button>
            </div>

            {/* Sub-tab content */}
            {costTab === 'breakdown' ? (
              /* Detailed Cost Table */
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Resource Cost Breakdown
                </h3>

                {loadingCosts ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <RefreshCw size={24} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                    <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Analyzing resource group costs...</p>
                  </div>
                ) : costError ? (
                  <p style={{ color: 'var(--error)' }}>{costError}</p>
                ) : (
                  <div>
                    {/* Filters Controls */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', width: '100%' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                          type="text" 
                          placeholder="Search resources by name, FQDN or details..." 
                          value={costSearch} 
                          onChange={(e) => setCostSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 16px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      </div>

                      <select 
                        value={envFilter} 
                        onChange={(e) => setEnvFilter(e.target.value as any)}
                        style={{
                          width: '220px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid var(--glass-border)',
                          background: theme === 'dark' ? '#1e293b' : '#ffffff',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="all">All Resources</option>
                        <option value="production">Production Resources</option>
                        <option value="test">Dev / Test Resources</option>
                        <option value="stale">Stale / Unused Resources</option>
                      </select>
                    </div>

                    {(() => {
                      const isDark = theme === 'dark';
                      const filtered = detailedCosts.filter(item => {
                        const matchesSearch = item.name.toLowerCase().includes(costSearch.toLowerCase()) || 
                                              (item.fqdn && item.fqdn.toLowerCase().includes(costSearch.toLowerCase())) ||
                                              (item.details && item.details.toLowerCase().includes(costSearch.toLowerCase()));
                        
                        const isOrphaned = !item.repositoryUrl && !item.fqdn && 
                          (item.type === 'frontend' || item.type === 'backend' || 
                           item.name.toLowerCase().includes('test') || item.name.toLowerCase().includes('example'));

                        if (envFilter === 'production') {
                          return matchesSearch && !item.isTestResource;
                        } else if (envFilter === 'test') {
                          return matchesSearch && item.isTestResource;
                        } else if (envFilter === 'stale') {
                          return matchesSearch && isOrphaned;
                        }
                        return matchesSearch;
                      });

                      // Group by type
                      const groups: { [key: string]: typeof filtered } = {};
                      filtered.forEach(item => {
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

                      if (filtered.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            <p>No resources match the selected filters.</p>
                          </div>
                        );
                      }

                      return (
                        <div style={{ overflowX: 'auto' }}>
                          <style>{`
                            .cost-row {
                              transition: background-color 0.15s ease-in-out;
                            }
                            .cost-row:hover {
                              background-color: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)'} !important;
                            }
                            .cost-group-header {
                              transition: background-color 0.15s ease-in-out;
                            }
                            .cost-group-header:hover {
                              background-color: ${isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(15, 23, 42, 0.035)'} !important;
                            }
                          `}</style>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}` }}>
                                <th style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</th>
                                <th style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                                <th style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Config / Details</th>
                                <th style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Compute</th>
                                <th style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>DNS</th>
                                <th style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderedKeys.map(typeKey => {
                                const items = groups[typeKey];
                                const groupCost = items.reduce((sum, item) => sum + item.totalCost, 0);
                                const isCostExpanded = expandedGroups[typeKey] === true;

                                return (
                                  <Fragment key={typeKey}>
                                    {/* Group Header Row */}
                                    <tr 
                                      className="cost-group-header"
                                      onClick={() => {
                                        setExpandedGroups(prev => ({
                                          ...prev,
                                          [typeKey]: !prev[typeKey]
                                        }));
                                      }}
                                      style={{ 
                                        background: isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(15, 23, 42, 0.015)', 
                                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                      }}
                                    >
                                      <td colSpan={5} style={{ padding: '14px 12px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          {isCostExpanded ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />}
                                          <span>{getTypeLabel(typeKey)} ({items.length})</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                        ${groupCost.toFixed(2)}
                                      </td>
                                    </tr>

                                    {/* Group Rows (only if expanded) */}
                                    {isCostExpanded && items.map((item) => {
                                      const isOrphaned = !item.repositoryUrl && !item.fqdn && 
                                        (item.type === 'frontend' || item.type === 'backend' || 
                                         item.name.toLowerCase().includes('test') || item.name.toLowerCase().includes('example'));

                                      return (
                                        <tr key={item.id} className="cost-row" style={{ 
                                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}`,
                                          background: isOrphaned ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                                        }}>
                                          <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                              {/* Dynamic Resource Type Icon */}
                                              {(() => {
                                                switch(item.type) {
                                                  case 'frontend': return <Globe size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />;
                                                  case 'backend': return <Server size={14} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />;
                                                  case 'database': return <Database size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />;
                                                  case 'vm': return <Cpu size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />;
                                                  case 'registry': return <Server size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />;
                                                  case 'workspace': return <Eye size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />;
                                                  case 'disk': return <Database size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />;
                                                  case 'network': return <Globe size={14} style={{ color: '#f43f5e', flexShrink: 0 }} />;
                                                  default: return <Settings size={14} style={{ color: 'var(--text-secondary)', opacity: 0.7, flexShrink: 0 }} />;
                                                }
                                              })()}
                                              <span style={{ color: isOrphaned ? 'var(--error)' : 'inherit' }}>{item.name}</span>
                                              {item.isTestResource && (
                                                <span style={{
                                                  fontSize: '0.62rem',
                                                  fontWeight: 700,
                                                  textTransform: 'uppercase',
                                                  color: '#94a3b8',
                                                  background: 'rgba(148, 163, 184, 0.12)',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                  border: '1px solid rgba(148, 163, 184, 0.2)'
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
                                                    background: 'rgba(239, 68, 68, 0.12)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                                  }}>
                                                    Stale / Not In Use
                                                  </span>
                                                  {(item.type === 'frontend' || item.type === 'backend') && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteApp(item.name, item.type);
                                                      }}
                                                      disabled={deletingAppName === item.name}
                                                      style={{
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: 'var(--error)',
                                                        borderRadius: '4px',
                                                        padding: '2px 8px',
                                                        fontSize: '0.65rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
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
                                              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 400, marginTop: '2px', paddingLeft: '22px' }}>
                                                {item.fqdn}
                                              </div>
                                            )}
                                            {item.repositoryUrl && (
                                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 400, paddingLeft: '22px' }}>
                                                <a 
                                                  href={item.repositoryUrl} 
                                                  target="_blank" 
                                                  rel="noreferrer" 
                                                  style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                  <Github size={12} />
                                                  {item.repositoryUrl.replace('https://github.com/', '')}
                                                </a>
                                              </div>
                                            )}
                                          </td>
                                          <td style={{ padding: '16px 12px' }}>
                                            <span style={{ 
                                              display: 'inline-block',
                                              padding: '2px 8px', 
                                              borderRadius: '4px', 
                                              fontSize: '0.75rem', 
                                              fontWeight: 500,
                                              textTransform: 'capitalize',
                                              background: getBadgeBgColor(item.type, theme),
                                              color: getBadgeTextColor(item.type, theme)
                                            }}>
                                              {item.type}
                                            </span>
                                          </td>
                                          <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {item.details}
                                          </td>
                                          <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 500 }}>
                                            ${item.resourceCost.toFixed(2)}
                                          </td>
                                          <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                            ${item.dnsCost.toFixed(2)}
                                          </td>
                                          <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            ${item.totalCost.toFixed(2)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              /* Cost Optimization Recommendations */
              <div className="glass-panel" style={{ padding: '36px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingDown style={{ color: 'var(--accent-teal)' }} />
                  Cost Optimization Recommendations
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {costSuggestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={42} style={{ color: 'var(--success)', marginBottom: '16px' }} />
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Excellent Configuration!</p>
                      <p style={{ fontSize: '0.88rem', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0' }}>All deployment environments are optimized for minimum idle costs.</p>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                      gap: '24px' 
                    }}>
                      {costSuggestions.map((suggestion) => {
                        const isHigh = suggestion.impact === 'high';
                        const isMedium = suggestion.impact === 'medium';
                        const color = isHigh ? 'var(--error)' : isMedium ? 'var(--warning)' : 'var(--accent-blue)';
                        const bg = isHigh ? 'rgba(239, 68, 68, 0.08)' : isMedium ? 'rgba(245, 158, 11, 0.08)' : 'rgba(96, 165, 250, 0.08)';
                        const border = isHigh ? 'rgba(239, 68, 68, 0.25)' : isMedium ? 'rgba(245, 158, 11, 0.25)' : 'rgba(96, 165, 250, 0.25)';
                        const icon = isHigh ? <AlertCircle size={14} /> : isMedium ? <AlertTriangle size={14} /> : <Settings size={14} />;

                        return (
                          <div 
                            key={suggestion.id} 
                            className="glass-panel" 
                            style={{ 
                              padding: '24px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'space-between',
                              borderLeft: `4px solid ${color}`,
                              background: 'rgba(255,255,255,0.01)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: 700, 
                                  textTransform: 'uppercase', 
                                  color: color,
                                  background: bg,
                                  border: `1px solid ${border}`,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  letterSpacing: '0.04em'
                                }}>
                                  {icon} {suggestion.impact} Impact
                                </span>
                                <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem' }}>
                                  Save ${suggestion.savings.toFixed(2)}/mo
                                </span>
                              </div>
                              
                              <h4 style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: '8px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                {suggestion.recommendation}
                              </h4>
                              
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                                {suggestion.description}
                              </p>
                            </div>

                            <button 
                              onClick={() => handleApplyRemediation(suggestion.id, suggestion.type, suggestion.appName)}
                              disabled={remediating === suggestion.id}
                              className="btn-primary"
                              style={{ 
                                width: '100%', 
                                padding: '10px 16px', 
                                fontSize: '0.85rem', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: 'transparent',
                                border: `1px solid ${color}`,
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (remediating !== suggestion.id) {
                                  e.currentTarget.style.background = color;
                                  e.currentTarget.style.borderColor = color;
                                  e.currentTarget.style.boxShadow = `0 0 10px ${color}80`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (remediating !== suggestion.id) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.borderColor = color;
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              {remediating === suggestion.id ? (
                                <>
                                  <RefreshCw size={14} className="spin-anim" />
                                  <span>Applying...</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown size={14} />
                                  <span>Apply Recommendation</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'databases' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'stretch', marginTop: '20px' }}>
            {/* Left Column: Servers & Databases */}
            <div ref={leftColRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Server Selection Card */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Server size={18} style={{ color: 'var(--accent-purple)' }} />
                  Database Server
                </h3>
                
                {loadingDbServers ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={16} className="spin-anim" />
                    <span style={{ fontSize: '0.85rem' }}>Listing database servers...</span>
                  </div>
                ) : dbServers.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '12px 0' }}>
                    No MySQL Flexible Servers found in resource group.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <select
                      value={selectedDbServer?.name || ''}
                      onChange={(e) => {
                        const s = dbServers.find(srv => srv.name === e.target.value);
                        if (s) {
                          setSelectedDbServer(s);
                          fetchDatabases(s.name);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    >
                      {dbServers.map(srv => (
                        <option key={srv.name} value={srv.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{srv.name}</option>
                      ))}
                    </select>

                    {selectedDbServer && (
                      <div style={{ 
                        marginTop: '4px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success-glow)' }}></span>
                            {selectedDbServer.state}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Version:</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>MySQL {selectedDbServer.version}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Region:</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedDbServer.location}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tier / Size:</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedDbServer.tier} ({selectedDbServer.sku})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--divider)', paddingTop: '6px', marginTop: '2px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Endpoint Host:</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.72rem' }}>{selectedDbServer.host}</span>
                        </div>
                        {selectedDbServer.privateNetwork && (
                          <div style={{
                            marginTop: '4px',
                            padding: '8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            color: 'var(--accent-orange)',
                            fontSize: '0.72rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                              <AlertTriangle size={12} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                              Private Link Network
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                              Local access requires an active corporate VPN connection.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Databases List Card */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Database size={18} style={{ color: 'var(--accent-blue)' }} />
                  Schemas / Databases
                </h3>

                {/* Schema Search Filter */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search schemas..."
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {loadingDatabases ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={16} className="spin-anim" />
                    <span style={{ fontSize: '0.85rem' }}>Loading schemas...</span>
                  </div>
                ) : databases.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No databases deployed yet.
                    </div>
                    {selectedDbServer?.privateNetwork && (
                      <div style={{
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px dashed rgba(239, 68, 68, 0.25)',
                        fontSize: '0.76rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--error)' }}>
                          <AlertCircle size={14} />
                          Network Unreachable
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                          Unable to retrieve schema catalog. Server is isolated on a private VNet endpoint. Check your Azure VPN.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto', paddingRight: '4px' }}>
                    {databases
                      .filter(db => db.name.toLowerCase().includes(dbSearchQuery.toLowerCase()))
                      .map(db => {
                        const isSelected = selectedDatabase?.name === db.name;
                        return (
                          <div
                            key={db.name}
                            onClick={() => {
                              setSelectedDatabase(db);
                              if (selectedDbServer) {
                                fetchDatabaseSchema(selectedDbServer.name, db.name);
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--accent-blue)' : 'var(--input-bg)',
                              border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                              color: isSelected ? '#ffffff' : 'var(--text-primary)',
                              fontSize: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: isSelected ? 600 : 500 }}>
                              <Database size={14} />
                              {db.name}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                              {db.charset}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Provision Database Sub-form */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                    Deploy New Database
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      value={newDbName}
                      onChange={(e) => setNewDbName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="database_name"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      className="btn-primary"
                      onClick={handleProvisionDatabase}
                      disabled={deployingDb || !newDbName.trim() || !selectedDbServer}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {deployingDb ? (
                        <>
                          <RefreshCw size={14} className="spin-anim" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <PlusCircle size={14} />
                          Deploy Database
                        </>
                      )}
                    </button>
                  </div>
                  
                  {deployDbSuccess && (
                    <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', fontSize: '0.78rem' }}>
                      {deployDbSuccess}
                    </div>
                  )}

                  {deployDbError && (
                    <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', fontSize: '0.78rem' }}>
                      {deployDbError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Database details & schema */}
            <div className="glass-panel" style={{ padding: '24px', height: `${Math.max(650, leftColHeight)}px`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selectedDatabase ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '60px' }}>
                  <Database size={48} style={{ color: 'var(--glass-border)', marginBottom: '16px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>No Database Selected</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px', textAlign: 'center', maxWidth: '380px' }}>
                    Select an existing database schema from the left panel or deploy a new one to begin exploring.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header Detail Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {selectedDatabase.name}
                        </h2>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                          Active Schema
                        </span>
                        {selectedDbServer?.privateNetwork && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-orange)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={10} /> Private VNet Endpoint
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Deployed on: <code style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{selectedDbServer?.host}</code>
                      </p>
                    </div>

                    {/* Sub-tab Selection */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '4px', borderRadius: '8px' }}>
                      {[
                        { id: 'schema', label: 'Schema Catalog' },
                        { id: 'query', label: 'SQL Query Console' },
                        { id: 'create-table', label: 'Visual Table Builder' },
                        { id: 'connect', label: 'Connection settings' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setDbDetailTab(tab.id as any)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: dbDetailTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                            boxShadow: dbDetailTab === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                            color: dbDetailTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schema Explorer Tab */}
                  {dbDetailTab === 'schema' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedDbServer?.privateNetwork && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.15)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <AlertTriangle size={18} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                          <div style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                            <strong>Private Link Resource:</strong> Connection to <code>{selectedDbServer.host}</code> is restricted. Local visual inspection and schema updates require connecting to the corporate Azure VPN.
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Tables in database ({databaseSchema.length})
                        </h4>
                        <button 
                          onClick={() => {
                            setNewTableName('');
                            setDbDetailTab('create-table');
                          }}
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--accent-teal)',
                            background: 'rgba(20, 184, 166, 0.1)',
                            border: '1px solid rgba(20, 184, 166, 0.2)',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <PlusCircle size={12} /> Add Table
                        </button>
                      </div>

                      {loadingSchema ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <RefreshCw size={20} className="spin-anim" />
                          <span>Retrieving schema catalog...</span>
                        </div>
                      ) : schemaError ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', border: '1px dashed var(--error)', borderRadius: '8px', padding: '40px', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                          <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: '12px' }} />
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Database Connection Failed</p>
                          <p style={{ fontSize: '0.8rem', marginTop: '6px', textAlign: 'center', maxWidth: '380px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {schemaError}
                          </p>
                          <p style={{ fontSize: '0.75rem', marginTop: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Please verify that you are connected to the Azure VPN or that target network security group rules allow connection to this database server.
                          </p>
                        </div>
                      ) : databaseSchema.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--glass-border)', borderRadius: '8px', padding: '40px' }}>
                          <Database size={32} style={{ color: 'var(--glass-border)', marginBottom: '12px' }} />
                          <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>Empty Database</p>
                          <p style={{ fontSize: '0.78rem', marginTop: '4px', textAlign: 'center', maxWidth: '300px' }}>No tables have been created inside this schema yet.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {databaseSchema.map((tbl) => {
                            const isExpanded = !!expandedTables[tbl.table];
                            const isAltering = alteringTable === tbl.table;
                            return (
                              <div
                                key={tbl.table}
                                style={{
                                  borderRadius: '8px',
                                  border: `1px solid ${isExpanded ? 'var(--glass-border)' : 'var(--divider)'}`,
                                  background: isExpanded ? 'var(--bg-primary)' : 'transparent',
                                  overflow: 'hidden',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {/* Table Row Header */}
                                <div
                                  style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    backgroundColor: isExpanded ? 'var(--bg-secondary)' : 'transparent'
                                  }}
                                  onClick={() => setExpandedTables(prev => ({ ...prev, [tbl.table]: !prev[tbl.table] }))}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.88rem', color: isExpanded ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    <Database size={14} style={{ color: 'var(--text-secondary)' }} />
                                    {tbl.table}
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                      ({tbl.columns.length} columns)
                                    </span>
                                  </div>

                                  {/* Table Level Actions (Drop & Query) */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => {
                                        setQuerySql(`SELECT * FROM \`${tbl.table}\` LIMIT 10;`);
                                        setDbDetailTab('query');
                                        handleExecuteQuery(`SELECT * FROM \`${tbl.table}\` LIMIT 10;`);
                                      }}
                                      style={{
                                        fontSize: '0.72rem',
                                        color: 'var(--text-primary)',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '4px',
                                        padding: '3px 8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      View Data
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAlteringTable(isAltering ? null : tbl.table);
                                        setAlterNewColName('');
                                      }}
                                      style={{
                                        fontSize: '0.72rem',
                                        color: 'var(--accent-blue)',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '4px',
                                        padding: '3px 8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {isAltering ? 'Cancel' : 'Alter'}
                                    </button>
                                    <button
                                      onClick={() => handleDropTable(tbl.table)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: 'var(--error)',
                                        borderRadius: '4px',
                                        padding: '3px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Drop Table"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* Columns Details Grid */}
                                {isExpanded && (
                                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--divider)' }}>
                                    
                                    {/* Visual Alter Panel: Add Column inline */}
                                    {isAltering && (
                                      <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--bg-primary)',
                                        border: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                      }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Add Column:</span>
                                        <input
                                          type="text"
                                          placeholder="column_name"
                                          value={alterNewColName}
                                          onChange={(e) => setAlterNewColName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                          style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.75rem',
                                            outline: 'none',
                                            width: '120px'
                                          }}
                                        />
                                        <select
                                          value={alterNewColType}
                                          onChange={(e) => setAlterNewColType(e.target.value)}
                                          style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.75rem',
                                            outline: 'none'
                                          }}
                                        >
                                          <option value="INT">INT</option>
                                          <option value="VARCHAR(50)">VARCHAR(50)</option>
                                          <option value="VARCHAR(255)">VARCHAR(255)</option>
                                          <option value="TEXT">TEXT</option>
                                          <option value="TIMESTAMP">TIMESTAMP</option>
                                          <option value="BOOLEAN">BOOLEAN</option>
                                          <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                                        </select>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                          <input
                                            type="checkbox"
                                            checked={alterNewColNullable}
                                            onChange={(e) => setAlterNewColNullable(e.target.checked)}
                                          />
                                          Nullable
                                        </label>
                                        <button
                                          onClick={() => handleAddColumn(tbl.table)}
                                          disabled={!alterNewColName.trim()}
                                          style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            background: 'var(--accent-teal)',
                                            color: '#ffffff',
                                            border: 'none',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Add
                                        </button>
                                      </div>
                                    )}

                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '0.8rem', textAlign: 'left' }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                                          <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Field</th>
                                          <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Type</th>
                                          <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Null</th>
                                          <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Key</th>
                                          <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Extra</th>
                                          <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {tbl.columns.map((col: any) => (
                                          <tr key={col.name} style={{ borderBottom: '1px solid var(--divider)' }}>
                                            <td style={{ padding: '8px', fontWeight: col.key === 'PRI' ? 600 : 400, color: col.key === 'PRI' ? 'var(--warning)' : 'var(--text-primary)' }}>
                                              {col.name}
                                            </td>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{col.type}</td>
                                            <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{col.nullable}</td>
                                            <td style={{ padding: '8px' }}>
                                              {col.key === 'PRI' && (
                                                <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--warning)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                                  PK
                                                </span>
                                              )}
                                              {col.key === 'UNI' && (
                                                <span style={{ fontSize: '0.65rem', background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', color: 'var(--accent-blue)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                                  UK
                                                </span>
                                              )}
                                              {col.key === 'MUL' && (
                                                <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: 'var(--accent-purple)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                                  FK
                                                </span>
                                              )}
                                            </td>
                                            <td style={{ padding: '8px', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{col.extra}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                              <button
                                                onClick={() => handleDropColumn(tbl.table, col.name)}
                                                style={{
                                                  background: 'none',
                                                  border: 'none',
                                                  color: 'var(--text-secondary)',
                                                  cursor: 'pointer',
                                                  padding: '2px 4px',
                                                  borderRadius: '4px'
                                                }}
                                                title="Drop Column"
                                              >
                                                <X size={12} />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SQL Query Console Tab */}
                  {dbDetailTab === 'query' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedDbServer?.privateNetwork && (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.15)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <AlertTriangle size={18} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                          <div style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                            <strong>Private Network Resource:</strong> Query execution requests require routing to the private virtual network. Please connect your Azure VPN to submit queries.
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Execute Custom SQL Query
                        </span>
                        
                        {/* Quick Query Templates */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setQuerySql('SHOW TABLES;')}
                            style={{ fontSize: '0.72rem', background: 'var(--input-bg)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            List Tables
                          </button>
                          {databaseSchema.length > 0 && (
                            <button
                              onClick={() => setQuerySql(`SELECT * FROM \`${databaseSchema[0].table}\` LIMIT 10;`)}
                              style={{ fontSize: '0.72rem', background: 'var(--input-bg)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Select Sample
                            </button>
                          )}
                        </div>
                      </div>

                      {/* SQL Code Input */}
                      <div style={{ position: 'relative' }}>
                        <textarea
                          value={querySql}
                          onChange={(e) => setQuerySql(e.target.value)}
                          placeholder="-- Write SQL here e.g. SELECT * FROM users;\nSELECT * FROM organizations;"
                          style={{
                            width: '100%',
                            height: '120px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontFamily: 'Courier New, Courier, monospace',
                            fontSize: '0.85rem',
                            outline: 'none',
                            resize: 'vertical',
                            lineHeight: '1.4'
                          }}
                        />
                      </div>

                      {/* Query Buttons */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn-primary"
                          onClick={() => handleExecuteQuery(querySql)}
                          disabled={queryExecuting || !querySql.trim()}
                          style={{
                            padding: '8px 20px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {queryExecuting ? (
                            <>
                              <RefreshCw size={14} className="spin-anim" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Run Query
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setQuerySql('');
                            setQueryResult(null);
                            setQueryError(null);
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          Clear
                        </button>
                      </div>

                      {/* Error Alert Box */}
                      {queryError && (
                        <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                            <AlertCircle size={14} /> Database Query Error:
                          </div>
                          {queryError}
                        </div>
                      )}

                      {/* Results Box */}
                      {queryResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '220px', marginTop: '10px' }}>
                          {queryResult.type === 'dml' ? (
                            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', fontSize: '0.82rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                                <Check size={14} /> Query Executed Successfully!
                              </div>
                              <p style={{ margin: 0, fontSize: '0.78rem' }}>{queryResult.message}</p>
                              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                <span>Rows Affected: {queryResult.affectedRows}</span>
                                {queryResult.insertId && <span>Inserted ID: {queryResult.insertId}</span>}
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <span>Query returned <strong>{queryResult.rows.length}</strong> rows.</span>
                              </div>

                              <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--input-bg)' }}>
                                <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '300px' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                                      <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                                          {/* Actions Header if delete is possible */}
                                          {(() => {
                                            const tableName = getTableNameFromQuery(querySql);
                                            return tableName ? (
                                              <th style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600, width: '50px' }}>Action</th>
                                            ) : null;
                                          })()}

                                          {queryResult.fields.map((field: string) => (
                                            <th key={field} style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{field}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {queryResult.rows.map((row: any, idx: number) => {
                                          return (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--divider)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                              {/* Action Cell (Delete Row) */}
                                              {(() => {
                                                const tableName = getTableNameFromQuery(querySql);
                                                if (!tableName) return null;
                                                
                                                const tblSchema = databaseSchema.find(t => t.table === tableName);
                                                const pkCol = tblSchema?.columns.find((c: any) => c.key === 'PRI')?.name;

                                                return (
                                                  <td style={{ padding: '8px 12px' }}>
                                                    <button
                                                      onClick={async () => {
                                                        let confirmed = false;
                                                        let deleteSql = '';
                                                        
                                                        if (pkCol) {
                                                          const pkVal = row[pkCol];
                                                          confirmed = window.confirm(`Are you sure you want to delete this row where ${pkCol} = '${pkVal}'?`);
                                                          if (!confirmed) return;
                                                          deleteSql = `DELETE FROM \`${tableName}\` WHERE \`${pkCol}\` = ${typeof pkVal === 'number' ? pkVal : `'${String(pkVal).replace(/'/g, "\\'")}'`};`;
                                                        } else {
                                                          confirmed = window.confirm(`This table has no primary key. Are you sure you want to delete this row by matching all column values?`);
                                                          if (!confirmed) return;
                                                          
                                                          const conditions = queryResult.fields.map((field: string) => {
                                                            const val = row[field];
                                                            if (val === null) {
                                                              return `\`${field}\` IS NULL`;
                                                            } else if (typeof val === 'number') {
                                                              return `\`${field}\` = ${val}`;
                                                            } else {
                                                              return `\`${field}\` = '${String(val).replace(/'/g, "\\'")}'`;
                                                            }
                                                          });
                                                          deleteSql = `DELETE FROM \`${tableName}\` WHERE ${conditions.join(' AND ')} LIMIT 1;`;
                                                        }
                                                        
                                                        try {
                                                          const deleteRes = await fetch(`${API_BASE}/apps/execute-query`, {
                                                            method: 'POST',
                                                            headers: {
                                                              'Content-Type': 'application/json',
                                                              'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({
                                                              serverName: selectedDbServer.name,
                                                              dbName: selectedDatabase.name,
                                                              query: deleteSql
                                                            })
                                                          });
                                                          const deleteData = await deleteRes.json();
                                                          if (deleteRes.ok && deleteData.success) {
                                                            // Re-execute SELECT
                                                            handleExecuteQuery(querySql);
                                                          } else {
                                                            alert(`Failed to delete row: ${deleteData.message || 'Unknown error'}`);
                                                           }
                                                         } catch (e: any) {
                                                          alert(`Error deleting row: ${e.message}`);
                                                        }
                                                      }}
                                                      style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        padding: '2px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                      }}
                                                      title={pkCol ? `Delete Row by Primary Key (${pkCol})` : 'Delete Row (No PK, matches all columns)'}
                                                    >
                                                      <Trash2 size={12} style={{ color: 'var(--error)' }} />
                                                    </button>
                                                  </td>
                                                );
                                              })()}

                                            {queryResult.fields.map((field: string) => {
                                              const val = row[field];
                                              let displayVal = '';
                                              if (val === null) {
                                                displayVal = 'NULL';
                                              } else if (typeof val === 'object') {
                                                displayVal = JSON.stringify(val);
                                              } else {
                                                displayVal = String(val);
                                              }
                                              return (
                                                <td key={field} style={{ padding: '8px 12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '300px', color: val === null ? 'var(--text-secondary)' : 'var(--text-primary)', fontStyle: val === null ? 'italic' : 'normal' }}>
                                                  {displayVal}
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visual Table Builder Tab */}
                  {dbDetailTab === 'create-table' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedDbServer?.privateNetwork && (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.15)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <AlertTriangle size={18} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                          <div style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                            <strong>Private Network Resource:</strong> Structural catalog updates require routing to the private virtual network. Please connect your Azure VPN to create tables.
                          </div>
                        </div>
                      )}
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Create Table Schema
                      </span>

                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Table Name</label>
                          <input
                            type="text"
                            placeholder="table_name"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--glass-border)',
                              background: 'rgba(255, 255, 255, 0.03)',
                              color: 'var(--text-primary)',
                              fontSize: '0.82rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      {/* Columns visual rows list */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Columns Definition</span>
                          <button
                            onClick={() => {
                              setTableColumns([...tableColumns, { name: '', type: 'VARCHAR(255)', nullable: true, isPrimary: false, extra: '' }]);
                            }}
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--accent-blue)',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              cursor: 'pointer'
                            }}
                          >
                            + Add Column
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {tableColumns.map((col, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                              <input
                                type="text"
                                placeholder="col_name"
                                value={col.name}
                                onChange={(e) => {
                                  const updated = [...tableColumns];
                                  updated[idx].name = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                  setTableColumns(updated);
                                }}
                                style={{
                                  flex: 1.5,
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(0,0,0,0.15)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.78rem',
                                  outline: 'none'
                                }}
                              />
                              <select
                                value={col.type}
                                onChange={(e) => {
                                  const updated = [...tableColumns];
                                  updated[idx].type = e.target.value;
                                  setTableColumns(updated);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(0,0,0,0.15)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.78rem',
                                  outline: 'none'
                                }}
                              >
                                <option value="INT">INT</option>
                                <option value="VARCHAR(50)">VARCHAR(50)</option>
                                <option value="VARCHAR(255)">VARCHAR(255)</option>
                                <option value="TEXT">TEXT</option>
                                <option value="TIMESTAMP">TIMESTAMP</option>
                                <option value="BOOLEAN">BOOLEAN</option>
                                <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                              </select>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={col.nullable}
                                  onChange={(e) => {
                                    const updated = [...tableColumns];
                                    updated[idx].nullable = e.target.checked;
                                    setTableColumns(updated);
                                  }}
                                />
                                Null
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={col.isPrimary}
                                  onChange={(e) => {
                                    const updated = [...tableColumns];
                                    updated[idx].isPrimary = e.target.checked;
                                    if (e.target.checked) {
                                      updated[idx].nullable = false;
                                    }
                                    setTableColumns(updated);
                                  }}
                                />
                                PK
                              </label>
                              <select
                                value={col.extra || ''}
                                onChange={(e) => {
                                  const updated = [...tableColumns];
                                  updated[idx].extra = e.target.value;
                                  setTableColumns(updated);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(0,0,0,0.15)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.75rem',
                                  outline: 'none'
                                }}
                              >
                                <option value="">(extra)</option>
                                <option value="AUTO_INCREMENT">AUTO_INCREMENT</option>
                                <option value="DEFAULT CURRENT_TIMESTAMP">CURRENT_TIMESTAMP</option>
                                <option value="DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP">ON UPDATE TS</option>
                              </select>
                              
                              <button
                                onClick={() => {
                                  const updated = tableColumns.filter((_, i) => i !== idx);
                                  setTableColumns(updated);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {createTableError && (
                        <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', fontSize: '0.78rem' }}>
                          {createTableError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                          className="btn-primary"
                          onClick={handleCreateTable}
                          disabled={creatingTable || !newTableName.trim() || tableColumns.some(c => !c.name.trim())}
                          style={{
                            padding: '8px 20px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {creatingTable ? (
                            <>
                              <RefreshCw size={14} className="spin-anim" />
                              Creating Table...
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Create Table
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setNewTableName('');
                            setTableColumns([
                              { name: 'id', type: 'INT', nullable: false, isPrimary: true, extra: 'AUTO_INCREMENT' },
                              { name: 'name', type: 'VARCHAR(255)', nullable: false, isPrimary: false, extra: '' }
                            ]);
                            setDbDetailTab('schema');
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connection Settings Tab */}
                  {dbDetailTab === 'connect' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }}>
                      {/* Connection Params Box */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Host Address</span>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                            {selectedDbServer?.host}
                          </p>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Port</span>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                            3306
                          </p>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Default Database</span>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-blue)', marginTop: '4px', fontFamily: 'monospace' }}>
                            {selectedDatabase.name}
                          </p>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Admin Username</span>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                            {selectedDbServer?.administratorLogin || 'estevia'}
                          </p>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Password</span>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                            {selectedDbServer?.password || 'Ewco26INCP'}
                          </p>
                        </div>
                      </div>

                      {/* Code Snippets Block */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Connection Code Snippets
                          </h4>
                          
                          {copiedText && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <Check size={12} /> Copied to clipboard!
                            </span>
                          )}
                        </div>

                        {/* Snippets Code Tab Selector */}
                        <div style={{ display: 'flex', gap: '1px', background: 'var(--glass-border)', padding: '1px', borderRadius: '6px', marginBottom: '8px', width: 'fit-content' }}>
                          {(['cli', 'node', 'python', 'php'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setConnectCodeTab(tab)}
                              style={{
                                padding: '6px 14px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: connectCodeTab === tab ? 'var(--accent-purple)' : 'rgba(0,0,0,0.2)',
                                color: '#ffffff',
                                borderTopLeftRadius: tab === 'cli' ? '5px' : '0',
                                borderBottomLeftRadius: tab === 'cli' ? '5px' : '0',
                                borderTopRightRadius: tab === 'php' ? '5px' : '0',
                                borderBottomRightRadius: tab === 'php' ? '5px' : '0',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {tab === 'cli' ? 'MySQL CLI' : tab === 'node' ? 'Node.js' : tab === 'python' ? 'Python' : 'PHP PDO'}
                            </button>
                          ))}
                        </div>

                        {/* Code Block Container */}
                        {(() => {
                          const adminUser = selectedDbServer?.administratorLogin || 'estevia';
                          const adminPass = selectedDbServer?.password || 'Ewco26INCP';
                          let code = '';
                          if (connectCodeTab === 'cli') {
                            code = `mysql -h ${selectedDbServer?.host || 'localhost'} -u ${adminUser} -p -D ${selectedDatabase.name}`;
                          } else if (connectCodeTab === 'node') {
                            code = `const mysql = require('mysql2/promise');\n\nasync function connect() {\n  const connection = await mysql.createConnection({\n    host: '${selectedDbServer?.host || 'localhost'}',\n    port: 3306,\n    user: '${adminUser}',\n    password: '${adminPass}',\n    database: '${selectedDatabase.name}',\n    ssl: {\n      rejectUnauthorized: false\n    }\n  });\n  console.log('Successfully connected to MySQL database.');\n}`;
                          } else if (connectCodeTab === 'python') {
                            code = `import pymysql\n\nconnection = pymysql.connect(\n    host='${selectedDbServer?.host || 'localhost'}',\n    port=3306,\n    user='${adminUser}',\n    password='${adminPass}',\n    database='${selectedDatabase.name}',\n    ssl={'ssl': {}}\n)\ntry:\n    with connection.cursor() as cursor:\n        print("Successfully connected to MySQL database.")\nfinally:\n    connection.close()`;
                          } else {
                            code = `<?php\ntry {\n    $dsn = "mysql:host=${selectedDbServer?.host || 'localhost'};dbname=${selectedDatabase.name};port=3306";\n    $pdo = new PDO($dsn, "${adminUser}", "${adminPass}", [\n        PDO::MYSQL_ATTR_SSL_CA => true\n    ]);\n    echo "Successfully connected to MySQL database.";\n} catch (PDOException $e) {\n    echo "Connection failed: " . $e->getMessage();\n}`;
                          }

                          return (
                            <div style={{ position: 'relative', flex: 1 }}>
                              <pre 
                                onClick={() => {
                                  navigator.clipboard.writeText(code);
                                  setCopiedText(connectCodeTab);
                                  setTimeout(() => setCopiedText(null), 2000);
                                }}
                                style={{
                                  margin: 0,
                                  padding: '16px',
                                  borderRadius: '8px',
                                  background: 'rgba(0,0,0,0.25)',
                                  border: '1px solid var(--glass-border)',
                                  color: 'var(--text-primary)',
                                  fontFamily: 'monospace',
                                  fontSize: '0.8rem',
                                  overflowX: 'auto',
                                  cursor: 'pointer',
                                  userSelect: 'all',
                                  lineHeight: '1.45',
                                  maxHeight: '260px'
                                }}
                              >
                                {code}
                              </pre>
                              <div style={{ position: 'absolute', right: '8px', top: '8px', fontSize: '0.62rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', pointerEvents: 'none' }}>
                                Click to Copy
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </main>
    </>
  )}

      {/* Embedded Spin Animation CSS rule */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
      `}</style>

      </div>
    </div>
  );
}

export default App;
