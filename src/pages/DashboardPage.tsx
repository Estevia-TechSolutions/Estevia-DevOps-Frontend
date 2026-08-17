import React from 'react';
import { ConflictResolutionDrawer } from '../components/pipelines/ConflictResolutionDrawer';
import {
  RefreshCw,
  Search,
  AlertCircle,
  ExternalLink,
  GitBranch,
  Globe,
  Trash2,
  PlusCircle,
  Server,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building2,
  Cpu,
  X,
  Terminal,
  Settings,
  Play,
  Square,
  Sliders,
  MoreVertical,
  GitCompare,
  Shield,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Download,
  Clock,
  Network,
  FileText,
  Info,
  Activity,
  ChevronsDown,
  ChevronsUp,
  XCircle,
  ShieldAlert,
  Layers,
  Zap
} from 'lucide-react';
import EvaForgeIcon from '../components/icons/EvaForgeIcon';
import { resolveBranchName, hasEnvSegment, branchToEnv } from '../App';
import { resolveAppProvider, hasCiCdConflict } from '../utils/codebase';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || (['evaops.esteviatech.com', 'evaops-crm.esteviatech.com'].includes(window.location.hostname) ? 'https://api-evaops.esteviatech.com/api' : `http://${window.location.hostname}:5005/api`);


const Github = ({ size = 12, ...props }: { size?: number;[key: string]: any }) => (
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

interface AppResource {
  name: string;
  type: 'frontend' | 'backend' | 'vm' | 'cluster' | 'database' | 'network' | 'registry' | string;
  location: string;
  hostname: string;
  resourceId: string;
  status: string;
  repositoryUrl: string;
  license_frozen?: number;
  dnsDetails?: {
    subdomain?: string;
    domain?: string;
    fqdn?: string;
    fqdns?: string[];
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
      state: string;
      result: string;
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
  branch?: string;
  branches?: { name: string; protected: boolean }[];
  isTestResource?: boolean;
  azureResourceDetails?: any;
  hasConflict?: boolean;
  provider?: string;
}

interface AppGroup {
  key: string;
  label: string;
  repoPath: string;
  repoUrl: string;
  type: 'frontend' | 'backend' | 'vm' | 'cluster' | 'database' | 'network' | 'registry' | string;
  envs: AppResource[];
  pipelineId?: string;
  pipelineName?: string;
  branches?: { name: string; protected: boolean }[];
}

interface DashboardPageProps {
  apps: AppResource[];
  scanning: boolean;
  scanProgress: number;
  scanError: string | null;
  appGroups: AppGroup[];
  collapsedScanGroups: Record<string, boolean>;
  setCollapsedScanGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  toggleGroupScan: (key: string) => void;
  deletingAppName: string | null;
  handleDeleteApp: (name: string, type: 'frontend' | 'backend') => void;
  openDnsModal: (app: AppResource) => void;
  openPipelineModal: (app: AppResource, group?: AppGroup) => void;
  openDockerfileEditor: (app: AppResource, group?: AppGroup) => void;
  ymlHealthMap?: Record<string, any>;
  ymlHealthLoading?: Record<string, boolean>;
  handleScan: () => void;
  theme: 'dark' | 'light';
  setSelectedStageForJobs: (stage: any) => void;
  azureDevopsOrgUrl?: string;
  azureDevopsProject?: string;
  onDeployBranch: (repoPath: string, branchName: string, type: 'frontend' | 'backend') => void;
  currentUser?: any;
  onShowLogs?: (appName: string) => void;
  onCloneApp?: (app: AppResource) => void;
  onResourceControl?: (name: string, action: 'start' | 'stop' | 'restart') => void;
  controllingResource?: string | null;
  onBuildTransition?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onShowBuildHistory?: (app: AppResource) => void;
  refreshHealthForRepo?: (repo: string) => void;
  livePipelineRuns: Record<number | string, any>;
  setLivePipelineRuns: React.Dispatch<React.SetStateAction<Record<number | string, any>>>;
  licenseTier?: string;
  activeSubTab?: 'resources' | 'compliance';
  selectedSubscriptionId?: string;
  selectedControlResourceGroup?: string;
}

const isBuildActive = (run: any) => {
  if (!run || !run.state) return false;
  const s = run.state.toLowerCase();
  return s === 'inprogress' || s === 'running' || s === 'canceling' || s === 'cancelling' || s === 'notstarted' || s === 'queued' || s === 'waiting';
};

const getHealthErrorDetail = (message: string): { reason: string; fix: string } => {
  const msg = (message || '').toLowerCase();
  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('expired') || msg.includes('credentials') || msg.includes('token')) {
    return {
      reason: 'GitHub integration token is unauthorized or expired.',
      fix: 'Go to the "Credentials" settings tab and update/save a valid GitHub Personal Access Token (PAT) with repo scopes.'
    };
  }
  if (msg.includes('404') || msg.includes('not found') || msg.includes('repo')) {
    return {
      reason: 'GitHub repository or branch not found.',
      fix: 'Verify the repository path (Owner/Repo) and branch name under your application settings.'
    };
  }
  if (msg.includes('timeout') || msg.includes('abort') || msg.includes('limit')) {
    return {
      reason: 'Health scan request timed out or was rate-limited.',
      fix: 'Wait a moment and click the red retry spin icon to try scanning again.'
    };
  }
  return {
    reason: message || 'An unexpected scan failure occurred.',
    fix: 'Verify the remote service is healthy or retry the scan.'
  };
};

const COMPLIANT_REASONS: Record<string, string> = {
  tagging: "All active subscription resources are properly tagged with Environment, Owner, and CostCenter.",
  residency: "All resources reside within approved US-only sovereign regional boundaries.",
  tls: "All checked MySQL database instances enforce secure transport (SSL/TLS v1.2+).",
  'network-security': "All checked VM network interfaces block public inbound SSH (port 22) and RDP (port 3389) access.",
  'https-only': "All checked Container App ingress configurations enforce HTTPS and disable insecure HTTP connections.",
  containment: "All branch deployments match their expected network boundary (no staging-to-prod network leakage).",
  'registry-auth': "All active container apps pull images from trusted, authenticated registries.",
  'secrets-expiry': "All mapped credentials/secrets have safe expiration windows (not expiring in the next 30 days).",
  'shadow-it': "No unregistered or orphaned resources found running in the subscription."
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  apps,
  scanning,
  scanProgress,
  scanError,
  appGroups,
  collapsedScanGroups,
  setCollapsedScanGroups,
  toggleGroupScan,
  deletingAppName,
  handleDeleteApp,
  openDnsModal,
  openPipelineModal,
  openDockerfileEditor,
  ymlHealthMap = {},
  ymlHealthLoading = {},
  handleScan,
  theme,
  setSelectedStageForJobs,
  azureDevopsOrgUrl,
  azureDevopsProject,
  onDeployBranch,
  currentUser,
  onShowLogs,
  onCloneApp,
  onResourceControl,
  controllingResource,
  onBuildTransition,
  onShowBuildHistory,
  refreshHealthForRepo,
  livePipelineRuns,
  setLivePipelineRuns,
  licenseTier = 'growth',
  activeSubTab: propActiveSubTab = 'resources',
  selectedSubscriptionId,
  selectedControlResourceGroup
}) => {
  const isViewer = currentUser?.role === 'viewer';
  const organizationId = currentUser?.organization_id || 'estevia';
  const [activeSubTab, setActiveSubTab] = React.useState<'resources' | 'compliance'>(propActiveSubTab);

  React.useEffect(() => {
    if (propActiveSubTab) {
      setActiveSubTab(propActiveSubTab);
    }
  }, [propActiveSubTab]);

  const [prioritizingBuildId, setPrioritizingBuildId] = React.useState<number | string | null>(null);

  const handlePrioritizeBuild = async (pipelineId: number | string | undefined, buildId: number | string | undefined) => {
    if (!pipelineId || !buildId) return;
    setPrioritizingBuildId(buildId);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/pipeline/prioritize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          organizationId,
          pipelineId,
          buildId
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onBuildTransition) {
          onBuildTransition(
            'Build Prioritized',
            data.message || `Build run #${buildId} queue priority set to High successfully.`,
            'success'
          );
        } else {
          alert(data.message || 'Build prioritized successfully!');
        }
        handleScan();
      } else {
        alert(data.message || 'Failed to prioritize build.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error prioritizing build: ' + (err.message || err));
    } finally {
      setPrioritizingBuildId(null);
    }
  };

  const [cancelingOlderForPipeline, setCancelingOlderForPipeline] = React.useState<number | string | null>(null);

  const handleCancelOlderBuilds = async (pipelineId: number | string | undefined, branchName?: string) => {
    if (!pipelineId) return;
    setCancelingOlderForPipeline(pipelineId);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/pipeline/cancel-older`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ organizationId, pipelineId, branch: branchName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onBuildTransition) {
          onBuildTransition(
            'Older Builds Cancelled',
            data.message || 'Older pipeline builds cancelled. Only the latest run continues.',
            'success'
          );
        } else {
          alert(data.message || 'Older builds cancelled successfully!');
        }
        handleScan();
      } else {
        alert(data.message || 'Failed to cancel older builds.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error cancelling older builds: ' + (err.message || err));
    } finally {
      setCancelingOlderForPipeline(null);
    }
  };

  // ── License-tier enforcement helpers ───────────────────────────────
  const GROWTH_ALLOWED_RULES = new Set(['tagging', 'tls', 'network-security']);
  const isRuleLockedByTier = (ruleId: string) =>
    licenseTier === 'growth' && !GROWTH_ALLOWED_RULES.has(ruleId);
  const tierLimits: Record<string, number> = { growth: 5, enterprise: 25, sovereign: Infinity };
  const licenseLimit = tierLimits[licenseTier] || 5;
  const isEnvLimitReached = apps.length >= licenseLimit;
  // ──────────────────────────────────────────────────────────────

  const getScanProgressMessage = (progress: number) => {
    if (progress < 40) return "Querying Azure resource groups...";
    if (progress < 75) return "Discovering Container Apps & Static Web Apps...";
    if (progress < 90) return "Syncing databases, virtual machines, and GoDaddy DNS...";
    if (progress < 96) return "Fetching pipeline build runs from GitHub and Azure DevOps...";
    return "Waiting for cloud providers to respond... (Almost finished)";
  };

  const [viewScrapedConfig, setViewScrapedConfig] = React.useState<{ fileName: string; fileContent: string; appName: string; searchedFiles?: string[] } | null>(null);
  const [expandedWarnings, setExpandedWarnings] = React.useState<Record<string, boolean>>({});
  const [expandedYamlDetails, setExpandedYamlDetails] = React.useState<Record<string, boolean>>({});
  const [expandedDockerDetails, setExpandedDockerDetails] = React.useState<Record<string, boolean>>({});
  // Multi-CI/CD Conflict Drawer state
  const [conflictDrawerApp, setConflictDrawerApp] = React.useState<AppResource | null>(null);
  const [conflictPipelines, setConflictPipelines] = React.useState<any[]>([]);
  const [loadingConflictPipelines, setLoadingConflictPipelines] = React.useState(false);

  React.useEffect(() => {
    if (!conflictDrawerApp) {
      setConflictPipelines([]);
      return;
    }
    const fetchConflictPipelines = async () => {
      setLoadingConflictPipelines(true);
      try {
        const token = localStorage.getItem('devops_token');
        const res = await fetch(`${API_BASE}/pipelines?appName=${encodeURIComponent(conflictDrawerApp.name)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const pipes = (data.pipelines || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            provider: p.provider,
            is_active: !!p.is_active,
            project_name: p.project_name,
            pipeline_url: p.pipeline_url || null,
            repo_url: conflictDrawerApp.repositoryUrl
          }));
          setConflictPipelines(pipes.length > 0 ? pipes : [
            {
              id: conflictDrawerApp.pipelineId || conflictDrawerApp.name,
              name: conflictDrawerApp.pipelineName || `${conflictDrawerApp.name} CI/CD Pipeline`,
              provider: (conflictDrawerApp as any).provider || 'azure_devops',
              is_active: true,
              project_name: conflictDrawerApp.name,
              repo_url: conflictDrawerApp.repositoryUrl
            }
          ]);
        }
      } catch (e) {
        console.warn('[DashboardPage] Failed to fetch conflict pipelines:', e);
      } finally {
        setLoadingConflictPipelines(false);
      }
    };
    fetchConflictPipelines();
  }, [conflictDrawerApp]);

  const [viewingFileDrawer, setViewingFileDrawer] = React.useState<{
    appName: string;
    fileName: string;
    filePath: string;
    fileContent: string;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [copiedFileCode, setCopiedFileCode] = React.useState<boolean>(false);

  const handleCopyFileCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedFileCode(true);
    setTimeout(() => setCopiedFileCode(false), 2000);
  };

  const handleOpenFileDrawer = async (
    appName: string,
    fileName: string,
    filePath: string,
    fileType: 'yaml' | 'dockerfile',
    repoUrl: string,
    branchName: string,
    pipelineProvider?: string
  ) => {
    const cleanRepo = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
    const targetBranch = branchName || 'main';

    setViewingFileDrawer({
      appName,
      fileName,
      filePath,
      fileContent: '',
      loading: true,
      error: null
    });

    try {
      const token = localStorage.getItem('devops_token');
      let url = '';
      if (fileType === 'yaml') {
        const providerParam = pipelineProvider ? `&pipelineProvider=${pipelineProvider}` : '';
        url = `${API_BASE}/apps/get-yml?organizationId=${organizationId}&githubRepo=${encodeURIComponent(cleanRepo)}&branch=${encodeURIComponent(targetBranch)}&filePath=${encodeURIComponent(filePath)}${providerParam}`;
      } else {
        url = `${API_BASE}/apps/get-dockerfile?organizationId=${organizationId}&githubRepo=${encodeURIComponent(cleanRepo)}&branch=${encodeURIComponent(targetBranch)}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.exists) {
        setViewingFileDrawer(prev => {
          if (!prev || prev.appName !== appName || prev.fileName !== fileName) return prev;
          return {
            ...prev,
            fileContent: data.content,
            loading: false,
            error: null
          };
        });
      } else {
        throw new Error(data.message || `File ${fileName} was not found or could not be retrieved from repository.`);
      }
    } catch (err: any) {
      console.error(`Failed to fetch ${fileName} content:`, err);
      setViewingFileDrawer(prev => {
        if (!prev || prev.appName !== appName || prev.fileName !== fileName) return prev;
        return {
          ...prev,
          loading: false,
          error: err.message || `An error occurred while retrieving ${fileName}.`
        };
      });
    }
  };

  // Compliance state
  const [complianceData, setComplianceData] = React.useState<any | null>(null);
  const [loadingCompliance, setLoadingCompliance] = React.useState<boolean>(false);
  const [remediatingId, setRemediatingId] = React.useState<string | null>(null);
  const [compliancePage, setCompliancePage] = React.useState(1);
  const [complianceFilterRule, setComplianceFilterRule] = React.useState<string>('all');
  const [complianceFilterRemed, setComplianceFilterRemed] = React.useState<string>('all');
  const [complianceSearchQuery, setComplianceSearchQuery] = React.useState<string>('');
  const [selectedViolationIds, setSelectedViolationIds] = React.useState<string[]>([]);
  const [batchRemediating, setBatchRemediating] = React.useState<boolean>(false);
  const [hoveredErrorTooltipData, setHoveredErrorTooltipData] = React.useState<{
    groupKey: string;
    errorMessage: string;
    top: number;
    left: number;
  } | null>(null);

  // Policy Settings States
  const [disabledRules, setDisabledRules] = React.useState<string[]>([]);
  const [ruleSeverities, setRuleSeverities] = React.useState<Record<string, string>>({});
  const [expandedRuleViolations, setExpandedRuleViolations] = React.useState<Record<string, boolean>>({});
  const settingsLoadedRef = React.useRef(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/compliance/settings?organizationId=${organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDisabledRules(data.disabledRules || []);
        setRuleSeverities(data.ruleSeverities || {});
      }
    } catch (err) {
      console.error('Failed to fetch compliance settings:', err);
      try {
        const savedRules = localStorage.getItem('evaops_disabled_rules');
        const savedSeverities = localStorage.getItem('evaops_rule_severities');
        if (savedRules) setDisabledRules(JSON.parse(savedRules));
        if (savedSeverities) setRuleSeverities(JSON.parse(savedSeverities));
      } catch (e) { }
    } finally {
      settingsLoadedRef.current = true;
    }
  };

  const saveSettings = async (rules: string[], severities: Record<string, string>) => {
    localStorage.setItem('evaops_disabled_rules', JSON.stringify(rules));
    localStorage.setItem('evaops_rule_severities', JSON.stringify(severities));

    try {
      const token = localStorage.getItem('devops_token');
      await fetch(`${API_BASE}/apps/compliance/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId,
          disabledRules: rules,
          ruleSeverities: severities
        })
      });
    } catch (err) {
      console.error('Failed to save compliance settings to database:', err);
    }
  };

  React.useEffect(() => {
    if (organizationId) {
      fetchSettings();
    }
  }, [organizationId]);

  React.useEffect(() => {
    if (settingsLoadedRef.current) {
      saveSettings(disabledRules, ruleSeverities);
    }
  }, [disabledRules, ruleSeverities]);

  const [policyConfigExpanded, setPolicyConfigExpanded] = React.useState<boolean>(false);

  const fetchCompliance = async () => {
    setLoadingCompliance(true);
    try {
      const token = localStorage.getItem('devops_token');
      const params = new URLSearchParams();
      params.append('organizationId', organizationId);
      if (selectedSubscriptionId) params.append('subscriptionId', selectedSubscriptionId);
      if (selectedControlResourceGroup) params.append('resourceGroup', selectedControlResourceGroup);
      
      const res = await fetch(`${API_BASE}/apps/compliance?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplianceData(data);
      }
    } catch (err) {
      console.error('Failed to fetch compliance status:', err);
    } finally {
      setLoadingCompliance(false);
    }
  };

  React.useEffect(() => {
    if (activeSubTab === 'compliance' && organizationId) {
      fetchCompliance();
    }
  }, [activeSubTab, disabledRules, ruleSeverities, organizationId, selectedSubscriptionId, selectedControlResourceGroup]);

  const handleRemediate = async (violation: any) => {
    setRemediatingId(violation.suggestionId);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/compliance/remediate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId,
          resourceName: violation.resourceName,
          ruleId: violation.ruleId,
          remediationType: violation.remediationType,
          suggestionId: violation.suggestionId
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onBuildTransition) {
          onBuildTransition(
            'Remediation Applied',
            `Successfully remediated ${violation.ruleName} for resource ${violation.resourceName}.`,
            'success'
          );
        }
        fetchCompliance();
        handleScan();
      } else {
        alert(data.message || 'Remediation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error applying compliance remediation.');
    } finally {
      setRemediatingId(null);
    }
  };

  const handleBatchRemediate = async () => {
    if (selectedViolationIds.length === 0) return;

    const violationsToRemediate = (complianceData?.violations || []).filter(
      (v: any) => selectedViolationIds.includes(v.suggestionId) && v.remediable
    );

    if (violationsToRemediate.length === 0) {
      alert('No remediable violations selected.');
      return;
    }

    setBatchRemediating(true);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/compliance/remediate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId,
          violations: violationsToRemediate.map((v: any) => ({
            resourceName: v.resourceName,
            ruleId: v.ruleId,
            remediationType: v.remediationType,
            suggestionId: v.suggestionId
          }))
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onBuildTransition) {
          onBuildTransition(
            'Batch Remediation Applied',
            `Successfully remediated ${violationsToRemediate.length} compliance violation(s).`,
            'success'
          );
        }
        setSelectedViolationIds([]);
        fetchCompliance();
        handleScan();
      } else {
        alert(data.message || 'Batch remediation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error applying batch compliance remediation.');
    } finally {
      setBatchRemediating(false);
    }
  };

  const [activeStageInfo, setActiveStageInfo] = React.useState<{ appName: string, stageId: string } | null>(null);
  const [selectedJobForModal, setSelectedJobForModal] = React.useState<any | null>(null);
  const [expandedBuilds, setExpandedBuilds] = React.useState<Record<string, boolean>>({});
  const [selectedTaskForModal, setSelectedTaskForModal] = React.useState<any | null>(null);

  // Secondary actions dropdown state
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = React.useState<{ top: number; left: number } | null>(null);
  // Power controls dropdown state
  const [activePowerDropdown, setActivePowerDropdown] = React.useState<string | null>(null);
  const [powerDropdownCoords, setPowerDropdownCoords] = React.useState<{ top: number; left: number } | null>(null);

  // Blue-Green Drawer state
  const [bgDrawerApp, setBgDrawerApp] = React.useState<AppResource | null>(null);
  const [revisions, setRevisions] = React.useState<any[]>([]);
  const [revisionMode, setRevisionMode] = React.useState<'Single' | 'Multiple'>('Single');
  const [loadingRevisions, setLoadingRevisions] = React.useState<boolean>(false);
  const [savingTraffic, setSavingTraffic] = React.useState<boolean>(false);

  // SWA DNS Swap state
  const [dnsSwapTargetAppName, setDnsSwapTargetAppName] = React.useState<string>('');
  const [swappingDns, setSwappingDns] = React.useState<boolean>(false);

  // Local BG mode cache to avoid blank toggle state
  const [bgModeState, setBgModeState] = React.useState<Record<string, 'Single' | 'Multiple'>>({});

  // Power control confirmation state
  const [pendingPowerAction, setPendingPowerAction] = React.useState<{ name: string; action: 'start' | 'stop' | 'restart' } | null>(null);

  // Live DevOps pipeline task logs state
  const [logs, setLogs] = React.useState<string>('');
  const [loadingLogs, setLoadingLogs] = React.useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = React.useState<boolean>(false);
  const handleCopyLogs = () => {
    if (!logs) return;
    navigator.clipboard.writeText(logs);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleDownloadLogs = () => {
    if (!logs) return;
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const taskName = (selectedTaskForModal?.step?.displayName || selectedTaskForModal?.step?.name || 'task')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_+|_+$)/g, '');
    const buildId = selectedTaskForModal?.buildId ? `_build_${selectedTaskForModal.buildId}` : '';
    link.download = `evaops${buildId}_${taskName}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Close dropdowns on scroll to prevent drifting
  React.useEffect(() => {
    const handleScroll = () => {
      setActiveDropdown(null);
      setDropdownCoords(null);
      setActivePowerDropdown(null);
      setPowerDropdownCoords(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Active dashboard tab state ('swa' | 'aca' | 'vm' | 'cluster')
  const [activeDashboardTab, setActiveDashboardTab] = React.useState<'swa' | 'aca' | 'vm' | 'cluster'>('swa');
  const [hoveredTab, setHoveredTab] = React.useState<'swa' | 'aca' | 'vm' | 'cluster' | null>(null);
  const [hoveredEnv, setHoveredEnv] = React.useState<string | null>(null);
  // Fixed-position tooltip data for the group header "X Environments" hover
  const [groupTooltipData, setGroupTooltipData] = React.useState<{
    groupKey: string;
    accentColor: string;
    envs: any[];
    top: number;
    right: number;
  } | null>(null);

  // Tracks which pipelineIds have finished their initial latest-build fetch
  const [loadedPipelines, setLoadedPipelines] = React.useState<Record<string, boolean>>({});

  // Search and Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEnvFilter, setSelectedEnvFilter] = React.useState<'all' | 'dev' | 'qa' | 'prod'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'running' | 'stopped'>('all');
  const [healthFilter, setHealthFilter] = React.useState<'all' | 'healthy' | 'issues'>('all');

  // Collapse All / Expand All helper
  const allGroupsCollapsed = React.useMemo(() => {
    // If every group has not been expanded (i.e. isCollapsed is true for all groups)
    return appGroups.every(g => collapsedScanGroups[g.key] !== false);
  }, [collapsedScanGroups, appGroups]);

  const toggleCollapseAll = React.useCallback(() => {
    const newMap: Record<string, boolean> = {};
    if (allGroupsCollapsed) {
      // Expand all groups (set collapse state to false)
      for (const g of appGroups) newMap[g.key] = false;
    } else {
      // Collapse all groups (set collapse state to true)
      for (const g of appGroups) newMap[g.key] = true;
    }
    setCollapsedScanGroups(newMap);
  }, [allGroupsCollapsed, appGroups, setCollapsedScanGroups]);

  // Ref to hold live overrides and avoid dependency trigger loops in effect
  const livePipelineRunsRef = React.useRef(livePipelineRuns);
  React.useEffect(() => {
    livePipelineRunsRef.current = livePipelineRuns;
  }, [livePipelineRuns]);

  const appsRef = React.useRef(apps);
  React.useEffect(() => {
    appsRef.current = apps;
  }, [apps]);

  const pipelineIdsString = React.useMemo(() => {
    return JSON.stringify(apps.map(a => a.pipelineId || '').sort());
  }, [apps]);

  // Monitor livePipelineRuns for transitions (build finished/failed)
  const prevPipelineRunsRef = React.useRef<Record<number, any>>({});
  React.useEffect(() => {
    const prevRuns = prevPipelineRunsRef.current;
    Object.keys(livePipelineRuns).forEach(key => {
      const runId = Number(key);
      const currentRun = livePipelineRuns[runId];
      const previousRun = prevRuns[runId];

      if (previousRun && isBuildActive(previousRun) && !isBuildActive(currentRun)) {
        const result = (currentRun.result || 'unknown').toLowerCase();
        const isSuccess = result === 'succeeded' || result === 'partiallysucceeded';
        const stateText = isSuccess ? 'Success' : 'Failed';
        const type = isSuccess ? 'success' : 'error';

        // Find the app name associated with this build ID
        const app = apps.find(a => a.pipelineRun?.id === runId) ||
          apps.find(a => a.pipelineId && livePipelineRunsRef.current[`pid-${a.pipelineId}-${resolveBranchName(a)}`]?.id === runId);
        const appName = app ? app.name : `Build #${currentRun.name}`;

        if (onBuildTransition) {
          onBuildTransition(
            `Build ${stateText}`,
            `Build run #${currentRun.name} for ${appName} has ${isSuccess ? 'completed successfully' : `failed with status: ${result}`}.`,
            type
          );
        }
      }
    });

    // Update ref for next render
    prevPipelineRunsRef.current = { ...livePipelineRuns };
  }, [livePipelineRuns, apps, onBuildTransition]);

  // Map appGroups to override pipelineRun statuses with live data
  const localAppGroups = React.useMemo(() => {
    const computedGroups = appGroups.map(group => {
      const updatedEnvs = group.envs.map(app => {
        const runId = app.pipelineRun?.id;
        const pidKey = app.pipelineId ? `pid-${app.pipelineId}-${resolveBranchName(app)}` : null;
        const liveRun =
          (pidKey && livePipelineRuns[pidKey]) ||
          (runId && livePipelineRuns[runId]) ||
          null;

        if (liveRun) {
          return {
            ...app,
            pipelineRun: liveRun
          };
        }
        return app;
      });
      return {
        ...group,
        envs: updatedEnvs
      };
    });
    console.log('🔍 [FRONTEND DIAGNOSTICS - DashboardPage] effectiveAppGroups output:', computedGroups);
    return computedGroups;
  }, [appGroups, livePipelineRuns]);

  // Memoized string of active build IDs to optimize active telemetry poller dependency
  const activeBuildIdsString = React.useMemo(() => {
    const ids = apps
      .map(app => {
        const runId = app.pipelineRun?.id;
        const pidKey = app.pipelineId ? `pid-${app.pipelineId}-${resolveBranchName(app)}` : null;
        const liveRun =
          (pidKey && livePipelineRuns[pidKey]) ||
          (runId && livePipelineRuns[runId]) ||
          app.pipelineRun;
        return {
          buildId: liveRun?.id,
          isActive: isBuildActive(liveRun)
        };
      })
      .filter(b => b.buildId && b.isActive)
      .map(b => b.buildId)
      .sort();
    return JSON.stringify(ids);
  }, [apps, livePipelineRuns]);

  // Active Telemetry Polling for active builds
  React.useEffect(() => {
    // Find all builds that are active
    const activeBuilds = appsRef.current
      .map(app => {
        const runId = app.pipelineRun?.id;
        // Primary lookup: by known runId from scan; secondary: by pipelineId (set by discovery poller)
        const pidKey = app.pipelineId ? `pid-${app.pipelineId}-${resolveBranchName(app)}` : null;
        const liveRun =
          (pidKey && livePipelineRunsRef.current[pidKey]) ||
          (runId && livePipelineRunsRef.current[runId]) ||
          app.pipelineRun;
        return {
          appName: app.name,
          buildId: liveRun?.id,
          pipelineId: app.pipelineId,
          isActive: isBuildActive(liveRun)
        };
      })
      .filter(b => b.buildId && b.isActive);

    console.log('[DevOps Poller] Evaluated active builds list:', activeBuilds);

    if (activeBuilds.length === 0) return;

    let isSubscribed = true;

    const pollTimeline = async () => {
      const token = localStorage.getItem('devops_token');
      for (const build of activeBuilds) {
        if (!isSubscribed) break;
        try {
          console.log(`[DevOps Poller] Polling timeline for build ${build.buildId} (${build.appName})...`);
          const res = await fetch(`${API_BASE}/apps/pipeline/timeline?organizationId=${organizationId}&buildId=${build.buildId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!res.ok) {
            console.error(`[DevOps Poller] Timeline API request failed for build ${build.buildId} with status ${res.status}`);
            continue;
          }
          const data = await res.json();
          console.log(`[DevOps Poller] Timeline API response for build ${build.buildId}:`, data);
          if (data.success && data.pipelineRun) {
            const previousRun = livePipelineRunsRef.current[build.buildId];
            const updatedRun = {
              ...previousRun,
              ...data.pipelineRun,
              activeRunCount: previousRun?.activeRunCount ?? data.pipelineRun.activeRunCount,
              queuePosition: previousRun?.queuePosition ?? data.pipelineRun.queuePosition
            };
            const updates: Record<string, any> = { [build.buildId]: updatedRun };
            const targetApp = appsRef.current.find(a => a.name === build.appName);
            const branchSuffix = targetApp ? `-${resolveBranchName(targetApp)}` : '';
            if (build.pipelineId) updates[`pid-${build.pipelineId}${branchSuffix}`] = updatedRun;
            setLivePipelineRuns(prev => ({ ...prev, ...updates }));

            // If the task modal is open for a task under this build, update selectedTaskForModal!
            if (selectedTaskForModal && selectedTaskForModal.buildId === build.buildId) {
              setSelectedTaskForModal((prevModal: any) => {
                if (!prevModal) return null;
                let updatedStep = prevModal.step;
                let found = false;
                for (const stage of data.pipelineRun.stages) {
                  for (const job of stage.jobs) {
                    for (const step of job.steps) {
                      if (step.id === prevModal.step.id) {
                        updatedStep = step;
                        found = true;
                        break;
                      }
                    }
                    if (found) break;
                  }
                  if (found) break;
                }
                return {
                  ...prevModal,
                  step: updatedStep
                };
              });
            }
          }
        } catch (err) {
          console.error(`Failed to poll timeline for build ${build.buildId}:`, err);
        }
      }
    };

    const intervalId = setInterval(pollTimeline, 5000);
    pollTimeline();

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [activeBuildIdsString, organizationId, selectedTaskForModal]);

  // ── New-Build Discovery Poller ──────────────────────────────────────────────
  // Runs every 30 s and fetches the LATEST build for every app that has a
  // pipelineId (regardless of whether the last known pipelineRun was active).
  // This detects newly triggered builds BEFORE the next full 5-min cloud scan.
  React.useEffect(() => {
    // Only run if there are apps with pipelines
    const appsWithPipelines = appsRef.current.filter(a => a.pipelineId);
    if (appsWithPipelines.length === 0) return;

    // Reset loadedPipelines for the new set of apps
    setLoadedPipelines({});

    let isSubscribed = true;

    const discoverNewBuilds = async () => {
      const token = localStorage.getItem('devops_token');
      // Always fetch latest apps array from ref to ensure fresh branch configuration
      const currentApps = appsRef.current.filter(a => a.pipelineId);
      for (const app of currentApps) {
        if (!isSubscribed) break;
        const pipelineId = app.pipelineId;
        if (!pipelineId) continue;

        try {
          // Resolve the branch for this specific app environment so we only get builds for the right branch
          const resolvedBranch = `refs/heads/${resolveBranchName(app)}`;
          console.log(`[DevOps Diagnostics] App: ${app.name} | Repo: ${app.repositoryUrl} | PipelineID: ${app.pipelineId} | PipelineName: ${app.pipelineName} | Branch: ${resolvedBranch}`);
          const res = await fetch(
            `${API_BASE}/apps/pipeline/latest?organizationId=${organizationId}&pipelineId=${pipelineId}&branchName=${encodeURIComponent(resolvedBranch)}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (!res.ok) {
            console.error(`[DevOps Discovery] Latest build API failed for app ${app.name}: status ${res.status}`);
            setLoadedPipelines(prev => ({ ...prev, [pipelineId]: true }));
            continue;
          }
          const data = await res.json();
          console.log(`[DevOps Discovery] Latest build response for app ${app.name}:`, data);

          setLoadedPipelines(prev => ({ ...prev, [pipelineId]: true }));

          if (!data.success || !data.pipelineRun) {
            console.log(`[DevOps Discovery] No success or no pipelineRun returned for ${app.name}`);
            continue;
          }

          const latestRun = data.pipelineRun;

          // Check existing live run via primary (scan runId) or secondary (pid key) index
          const branchName = resolveBranchName(app);
          const pidKey = `pid-${pipelineId}-${branchName}`;
          const existingLiveId =
            app.pipelineRun?.id ||
            livePipelineRunsRef.current[pidKey]?.id;
          const isNewBuild = latestRun.id !== existingLiveId;
          const isActive = isBuildActive(latestRun);

          console.log(`[DevOps Discovery] app: ${app.name} | latestRunId: ${latestRun.id} | existingLiveId: ${existingLiveId} | isNew: ${isNewBuild} | isActive: ${isActive}`);

          if (isActive || isNewBuild) {
            console.log(`[DevOps Discovery] Updating livePipelineRuns for app ${app.name} with build ${latestRun.id} (state: ${latestRun.state})`);
            setLivePipelineRuns(prev => ({
              ...prev,
              [latestRun.id]: latestRun,
              // Also index by pipelineId + branch so localAppGroups can find this even when
              // the scan-level pipelineRun is null (no runId to match on)
              [`pid-${pipelineId}-${branchName}`]: latestRun
            }));
          }
        } catch (err) {
          console.error(`[DevOps Discovery] Error checking latest build for ${app.name}:`, err);
          setLoadedPipelines(prev => ({ ...prev, [pipelineId]: true }));
        }
      }
    };

    // Stagger first call by 5 s so it doesn't collide with the initial timeline poll
    const initialTimer = setTimeout(() => {
      if (isSubscribed) discoverNewBuilds();
    }, 5000);

    const intervalId = setInterval(discoverNewBuilds, 30000);

    return () => {
      isSubscribed = false;
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [pipelineIdsString, organizationId]);

  const prevTaskRef = React.useRef<{ id: string; buildId: string; logId: number; state: string } | null>(null);

  // Fetch live DevOps step logs
  React.useEffect(() => {
    if (!selectedTaskForModal || !selectedTaskForModal.buildId || !selectedTaskForModal.step.logId) {
      setLogs('');
      prevTaskRef.current = null;
      return;
    }

    const { buildId, step } = selectedTaskForModal;
    const isSameTask = prevTaskRef.current &&
      prevTaskRef.current.id === step.id &&
      prevTaskRef.current.buildId === buildId;

    // If it's a completed task and we already successfully fetched it, don't refetch
    if (isSameTask && prevTaskRef.current?.state === 'completed') {
      return;
    }

    const fetchLogs = async () => {
      // Only show loader and clear logs if switching to a DIFFERENT task
      if (!isSameTask) {
        setLoadingLogs(true);
        setLogs('');
      }

      try {
        const token = localStorage.getItem('devops_token');
        const res = await fetch(`${API_BASE}/apps/pipeline/logs?organizationId=${organizationId}&buildId=${buildId}&logId=${step.logId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLogs(data.logs || 'No log data returned from Azure.');
          // Update the ref only after a successful fetch
          prevTaskRef.current = { id: step.id, buildId, logId: step.logId, state: step.state };
        } else {
          if (!isSameTask) {
            setLogs(`Failed to fetch logs: ${data.message || 'Unknown error'}`);
          }
        }
      } catch (err: any) {
        if (!isSameTask) {
          setLogs(`Error loading logs: ${err.message}`);
        }
      } finally {
        if (!isSameTask) {
          setLoadingLogs(false);
        }
      }
    };
    fetchLogs();
  }, [selectedTaskForModal, organizationId]);

  const fetchRevisions = async (app: AppResource) => {
    setLoadingRevisions(true);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/${app.name}/revisions?organizationId=${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRevisions(data.revisions || []);
        setRevisionMode(data.activeRevisionsMode || 'Single');
        setBgModeState(prev => ({ ...prev, [app.name]: data.activeRevisionsMode }));
      } else {
        console.error('Failed to fetch revisions:', data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleToggleRevisionMode = async (appName: string, newMode: 'Single' | 'Multiple') => {
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/${appName}/revision-mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mode: newMode, organizationId })
      });
      const data = await res.json();
      if (res.ok) {
        setBgModeState(prev => ({ ...prev, [appName]: newMode }));
        if (bgDrawerApp?.name === appName) {
          setRevisionMode(newMode);
          fetchRevisions(bgDrawerApp);
        }
      } else {
        alert(data.message || 'Failed to update revision mode.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating revision mode.');
    }
  };

  const handleSaveTrafficSplit = async () => {
    if (!bgDrawerApp) return;

    const total = revisions.reduce((sum, rev) => sum + (parseInt(rev.trafficWeight) || 0), 0);
    if (total !== 100) {
      alert(`Total traffic split weight must equal 100%. Current sum: ${total}%`);
      return;
    }

    setSavingTraffic(true);
    try {
      const token = localStorage.getItem('devops_token');
      const trafficData = revisions.map(r => ({
        revisionName: r.name,
        weight: parseInt(r.trafficWeight) || 0,
        latestRevision: !!r.latestRevision
      }));

      const res = await fetch(`${API_BASE}/apps/${bgDrawerApp.name}/traffic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ traffic: trafficData, organizationId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Traffic split saved successfully!');
        fetchRevisions(bgDrawerApp);
      } else {
        alert(data.message || 'Failed to update traffic split.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving traffic split.');
    } finally {
      setSavingTraffic(false);
    }
  };

  const handleDnsSwap = async () => {
    if (!bgDrawerApp || !dnsSwapTargetAppName) return;
    setSwappingDns(true);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/dns-swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          app1Name: bgDrawerApp.name,
          app2Name: dnsSwapTargetAppName,
          organizationId
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'DNS swap completed successfully!');
        setBgDrawerApp(null);
        handleScan();
      } else {
        alert(data.message || 'Failed to execute DNS swap.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error executing DNS CNAME swap.');
    } finally {
      setSwappingDns(false);
    }
  };

    const getStatusDetails = (status: string | undefined, type: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'running' || s === 'deployed') {
      return { label: s === 'running' ? 'Running' : 'Online', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
    }
    if (s === 'stopped' || s === 'sleep' || s === 'offline') {
      return { label: s === 'stopped' ? 'Stopped' : 'Sleeping', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
    }
    return { label: status || 'Unknown', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)' };
  };

  const getConfiguredBackendUrl = (app: any): string | null => {
    // 1. Direct configuration or environment variable inspection
    let url = 
      app?.azureResourceDetails?.configuredBackendUrl ||
      app?.azure_resource_details?.configuredBackendUrl ||
      app?.configuredBackendUrl ||
      app?.azureResourceDetails?.backendUrl ||
      app?.env_vars?.VITE_API_URL ||
      app?.envVars?.VITE_API_URL ||
      app?.env_vars?.REACT_APP_API_URL ||
      app?.envVars?.REACT_APP_API_URL;

    if (url) return url;

    // 2. Dynamic Token & Environment Peer Ingress Resolution (Zero Hardcoding)
    if (!app || !app.name) return null;
    const appTokens = app.name.toLowerCase()
      .replace(/^(ca|swa|api|app|func|rg|frontend|backend)-/i, '')
      .replace(/-(dev|qa|prod|production|staging|test|swa|frontend|backend)$/g, '')
      .split(/[-_\s]+/)
      .filter((t: string) => t.length > 1);

    if (appTokens.length === 0) return null;

    const appEnv = getEnvTag(app).label.toLowerCase();

    const matchingBackend = apps.find((b: any) => {
      if (b.type !== 'backend') return false;
      const bName = b.name.toLowerCase();
      const bEnv = getEnvTag(b).label.toLowerCase();

      const envMatches = (
        appEnv === bEnv ||
        (appEnv.includes('dev') && bEnv.includes('dev')) ||
        (appEnv.includes('qa') && bEnv.includes('qa')) ||
        (appEnv.includes('prod') && bEnv.includes('prod'))
      );
      if (!envMatches) return false;

      return appTokens.some((token: string) => bName.includes(token));
    });

    if (matchingBackend) {
      const host = matchingBackend.hostname || matchingBackend.azureResourceDetails?.hostname || matchingBackend.dnsDetails?.fqdn || '';
      if (host) {
        return host.startsWith('http') ? host : `https://${host}`;
      }
    }

    return null;
  };

  const getVnetName = (app: AppResource): string | null => {
    if (app.type === 'frontend') {
      const configuredBackendUrl = getConfiguredBackendUrl(app);
      if (configuredBackendUrl) {
        let host = '';
        try {
          const urlObj = new URL(configuredBackendUrl);
          host = urlObj.hostname;
        } catch (e) {
          host = configuredBackendUrl.replace(/^https?:\/\//i, '').split('/')[0];
        }
        const allBackends = apps.filter(a => a.type === 'backend');
        const matchingBackend = allBackends.find(b => {
          const bHost = b.hostname || b.azureResourceDetails?.hostname || '';
          const bDns = b.dnsDetails?.fqdn || '';
          return (
            bHost.toLowerCase().includes(host.toLowerCase()) ||
            bDns.toLowerCase().includes(host.toLowerCase()) ||
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

    const details = app.azureResourceDetails;
    if (!details) return null;
    if (details.vnetSubnetID) {
      const parts = details.vnetSubnetID.split('/virtualNetworks/');
      if (parts.length > 1) return parts[1].split('/')[0];
    }
    if (details.delegatedSubnetResourceId) {
      const parts = details.delegatedSubnetResourceId.split('/virtualNetworks/');
      if (parts.length > 1) return parts[1].split('/')[0];
    }
    if (details.agentPoolProfiles?.[0]?.vnetSubnetID) {
      const parts = details.agentPoolProfiles[0].vnetSubnetID.split('/virtualNetworks/');
      if (parts.length > 1) return parts[1].split('/')[0];
    }
    return null;
  };

  const checkNetworkWarnings = (
    item: AppResource,
    group: AppGroup
  ): { status: 'verified' | 'warning' | 'unverified' | 'critical' | 'info'; message: string; detail: string; sourceFile?: string; sourceContent?: string; sourceAppName?: string; scrapedSearchedFiles?: string[] } | null => {
    const themeEnv = getEnvTag(item).label; // 'DEV' | 'QA' | 'PROD'
    const itemVnet = getVnetName(item);

    // Dynamic Branch/VNet Mismatch Check (Two-way validation)
    const activeBranch = resolveBranchName(item);
    if (activeBranch && itemVnet) {
      const branchLower = activeBranch.toLowerCase();
      const vnetLower = itemVnet.toLowerCase();

      // Heuristics for branch environment
      let branchEnv: 'prod' | 'non-prod' | null = null;
      if (
        branchLower === 'main' ||
        branchLower === 'master' ||
        branchLower === 'prod' ||
        branchLower === 'production' ||
        branchLower === 'release' ||
        branchLower.startsWith('release/')
      ) {
        branchEnv = 'prod';
      } else if (
        branchLower === 'dev' ||
        branchLower === 'develop' ||
        branchLower === 'development' ||
        branchLower === 'qa' ||
        branchLower === 'staging' ||
        branchLower === 'test' ||
        branchLower === 'testing' ||
        branchLower.startsWith('dev/') ||
        branchLower.startsWith('qa/') ||
        branchLower.startsWith('feature/') ||
        branchLower.startsWith('bugfix/') ||
        branchLower.startsWith('hotfix/')
      ) {
        branchEnv = 'non-prod';
      }

      // VNet heuristics
      let vnetEnv: 'prod' | 'non-prod' | null = null;
      if (vnetLower.includes('prod') || vnetLower.includes('production')) {
        vnetEnv = 'prod';
      } else if (
        vnetLower.includes('dev') ||
        vnetLower.includes('qa') ||
        vnetLower.includes('test') ||
        vnetLower.includes('staging')
      ) {
        vnetEnv = 'non-prod';
      }

      if (branchEnv && vnetEnv && branchEnv !== vnetEnv) {
        return {
          status: 'warning',
          message: 'Branch Mismatch',
          detail: `Branch/Network Mismatch Warning: Active branch '${activeBranch}' (${branchEnv === 'prod' ? 'Production' : 'Non-Production'}) is deployed to network '${itemVnet}' (${vnetEnv === 'prod' ? 'Production' : 'Non-Production'}). This configuration is high-risk.`,
          sourceFile: item.azureResourceDetails?.scrapedSourceFile,
          sourceContent: item.azureResourceDetails?.scrapedSourceContent,
          sourceAppName: item.name
        };
      }
    }

    // 1. SWA (frontend) Warning Check
    if (item.type === 'frontend') {
      const configuredBackendUrl = getConfiguredBackendUrl(item);
      console.log(`[VNet Debug] SWA: ${item.name} | Configured Backend URL: ${configuredBackendUrl}`);
      if (!configuredBackendUrl) {
        const filesList = item.azureResourceDetails?.scrapedSearchedFiles?.length
          ? item.azureResourceDetails.scrapedSearchedFiles.join(', ')
          : 'standard environment & pipeline files';
        return {
          status: 'info',
          message: 'Static SWA Only',
          detail: `This frontend application has no configured backend URL. It may be a static marketing or documentation website.`,
          sourceFile: item.azureResourceDetails?.scrapedSourceFile,
          sourceContent: item.azureResourceDetails?.scrapedSourceContent,
          sourceAppName: item.name,
          scrapedSearchedFiles: item.azureResourceDetails?.scrapedSearchedFiles
        };
      }

      // Extract host from configuredBackendUrl
      let host = '';
      try {
        const urlObj = new URL(configuredBackendUrl);
        host = urlObj.hostname;
      } catch (e) {
        // Fallback for simple domain strings
        host = configuredBackendUrl.replace(/^https?:\/\//i, '').split('/')[0];
      }

      // Try to find a matching backend in the workspace
      const allBackends = apps.filter(a => a.type === 'backend');
      const matchingBackend = allBackends.find(b => {
        const bHost = b.hostname || b.azureResourceDetails?.hostname || '';
        const bDns = b.dnsDetails?.fqdn || '';
        
        // 1. Exact match of hostnames/domains
        if (bHost.toLowerCase() === host.toLowerCase() || bDns.toLowerCase() === host.toLowerCase()) {
          return true;
        }

        // 2. Exact match of custom DNS aliases if present
        if (b.dnsDetails?.fqdns) {
          const fqdnsArray = Array.isArray(b.dnsDetails.fqdns)
            ? b.dnsDetails.fqdns
            : typeof b.dnsDetails.fqdns === 'string'
              ? [b.dnsDetails.fqdns]
              : [];
          if (fqdnsArray.some(f => f.toLowerCase() === host.toLowerCase())) {
            return true;
          }
        }

        // 3. Match by name prefix and environment tag (excluding loose global substrings)
        const cleanFrontName = item.name.toLowerCase()
          .replace(/-swa$/, '')
          .replace(/-frontend$/, '')
          .replace(/-dev$/, '')
          .replace(/-qa$/, '')
          .replace(/-prod$/, '');

        const cleanBackName = b.name.toLowerCase()
          .replace(/-backend$/, '')
          .replace(/-dev$/, '')
          .replace(/-qa$/, '')
          .replace(/-prod$/, '');

        const frontEnv = getEnvTag(item).label;
        const backEnv = getEnvTag(b).label;

        if ((cleanFrontName.includes(cleanBackName) || cleanBackName.includes(cleanFrontName)) && frontEnv === backEnv) {
          return true;
        }

        return false;
      });

      if (matchingBackend) {
        const backendEnv = getEnvTag(matchingBackend).label;
        if (themeEnv !== backendEnv) {
          return {
            status: 'warning',
            message: 'Mismatched',
            detail: `Network Mismatch: SWA is running as ${themeEnv} but is configured to connect to backend '${matchingBackend.name}' which is in ${backendEnv}.`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        } else {
          // Check backend's own database connection network status recursively
          const backendValidation = checkNetworkWarnings(matchingBackend, group);
          if (backendValidation && backendValidation.status !== 'verified') {
            return {
              status: backendValidation.status,
              message: backendValidation.status === 'warning' ? 'Backend Warning' : backendValidation.status === 'info' ? 'Backend Info' : 'Backend Critical',
              detail: `Network Warning: SWA is connected to backend '${matchingBackend.name}', but this backend has a database connection issue: ${backendValidation.detail}`,
              sourceFile: backendValidation.sourceFile || matchingBackend.azureResourceDetails?.scrapedSourceFile,
              sourceContent: backendValidation.sourceContent || matchingBackend.azureResourceDetails?.scrapedSourceContent,
              sourceAppName: backendValidation.sourceAppName || matchingBackend.name
            };
          }

          return {
            status: 'verified',
            message: 'Verified',
            detail: `Network connection verified: SWA is connected to matching backend '${matchingBackend.name}' (${backendEnv}).`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        }
      } else {
        // Mismatch check by string matching
        const isDevUrl = host.includes('dev') || host.includes('localhost') || host.includes('127.0.0.1');
        const isQaUrl = host.includes('qa') || host.includes('staging') || host.includes('test');
        const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

        let urlEnv: 'DEV' | 'QA' | 'PROD' = 'PROD';
        if (isDevUrl) urlEnv = 'DEV';
        else if (isQaUrl) urlEnv = 'QA';

        if (isLocalhost) {
          // Since this SWA is deployed to Azure, pointing to localhost is a configuration error!
          return {
            status: 'warning',
            message: 'Localhost Binding',
            detail: `Network Warning: SWA is deployed in the cloud but is configured to connect to loopback target '${host}'. Connect to a cloud backend instead.`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        }

        if (themeEnv !== urlEnv) {
          return {
            status: 'warning',
            message: 'Mismatched',
            detail: `Network Mismatch: SWA is running as ${themeEnv} but is configured to connect to '${host}' (${urlEnv}).`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        } else {
          return {
            status: 'verified',
            message: 'Verified',
            detail: `Network connection verified: SWA is connected to '${host}' (${urlEnv}).`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        }
      }
    }

    // 2. ACA (backend) Warning Check
    if (item.type === 'backend') {
      const configuredDbHost = item.azureResourceDetails?.configuredDbHost;
      console.log(`[VNet Debug] Backend: ${item.name} | Resolved VNet: ${itemVnet} | Configured DB Host: ${configuredDbHost}`);
      if (!configuredDbHost) {
        const filesList = item.azureResourceDetails?.scrapedSearchedFiles?.length
          ? item.azureResourceDetails.scrapedSearchedFiles.join(', ')
          : 'standard environment & pipeline files';
        return {
          status: 'critical',
          message: 'Critical',
          detail: `Could not validate database network: DB_HOST details were not found in the backend codebase (attempted to read: ${filesList}).`,
          sourceFile: item.azureResourceDetails?.scrapedSourceFile,
          sourceContent: item.azureResourceDetails?.scrapedSourceContent,
          sourceAppName: item.name,
          scrapedSearchedFiles: item.azureResourceDetails?.scrapedSearchedFiles
        };
      }

      if (!itemVnet) {
        return {
          status: 'verified',
          message: 'Verified',
          detail: `Managed Azure Container Environment (${item.azureResourceDetails?.managedEnvironmentId ? item.azureResourceDetails.managedEnvironmentId.split('/').pop() : 'Standard ACA Ingress'}): Outbound TLS connection to database active.`,
          sourceFile: item.azureResourceDetails?.scrapedSourceFile,
          sourceContent: item.azureResourceDetails?.scrapedSourceContent,
          sourceAppName: item.name
        };
      }

      // Try to find matching database in workspace
      const databases = apps.filter(a => a.type === 'database');
      const matchingDb = databases.find(dbApp => {
        const dbHost = dbApp.hostname || dbApp.azureResourceDetails?.fullyQualifiedDomainName || '';
        return (
          dbHost.toLowerCase().includes(configuredDbHost.toLowerCase()) ||
          configuredDbHost.toLowerCase().includes(dbApp.name.toLowerCase())
        );
      });

      if (matchingDb) {
        const dbDetails = matchingDb.azureResourceDetails;
        const dbSubnetId = dbDetails?.delegatedSubnetResourceId || '';
        const dbVnetName = dbSubnetId.split(/\/virtualnetworks\//i)[1]?.split('/')[0];

        // Resolve subnet resource IDs for dynamic peering checks
        const itemSubnetId = item.azureResourceDetails?.vnetSubnetID || item.azureResourceDetails?.delegatedSubnetResourceId || item.azureResourceDetails?.agentPoolProfiles?.[0]?.vnetSubnetID || '';
        const itemVnetId = itemSubnetId ? itemSubnetId.toLowerCase().split('/subnets/')[0] : '';
        const dbVnetId = dbSubnetId ? dbSubnetId.toLowerCase().split('/subnets/')[0] : '';

        console.log(`[VNet Debug] Backend: ${item.name} | DB: ${matchingDb.name} | Resolved DB VNet: ${dbVnetName} | Item VNet: ${itemVnet}`);

        let connected = false;
        if (itemVnetId && dbVnetId && itemVnetId === dbVnetId) {
          connected = true;
        } else if (itemVnetId && dbVnetId) {
          // Look up network peerings dynamically from the apps list
          const dbVnetResource = apps.find(a => a.type === 'network' && a.resourceId?.toLowerCase() === dbVnetId);
          const isPeered = dbVnetResource?.azureResourceDetails?.peerings?.some((p: any) =>
            p.remoteVirtualNetworkId?.toLowerCase() === itemVnetId && p.peeringState?.toLowerCase() === 'connected'
          );
          if (isPeered) {
            connected = true;
          } else {
            // Check reciprocal peering from compute VNet resource
            const compVnetResource = apps.find(a => a.type === 'network' && a.resourceId?.toLowerCase() === itemVnetId);
            const isReciprocalPeered = compVnetResource?.azureResourceDetails?.peerings?.some((p: any) =>
              p.remoteVirtualNetworkId?.toLowerCase() === dbVnetId && p.peeringState?.toLowerCase() === 'connected'
            );
            if (isReciprocalPeered) {
              connected = true;
            }
          }
        }

        // Fallback to name-based rules if dynamic check didn't resolve connected to true
        if (!connected && dbVnetName) {
          const isDevVnet = itemVnet.toLowerCase() === 'estevia-dev-vnet' || itemVnet.toLowerCase().includes('dev');
          const isQaVnet = itemVnet.toLowerCase() === 'estevia-qa-vnet' || itemVnet.toLowerCase().includes('qa');
          const isProdVnet = itemVnet.toLowerCase() === 'estevia-prod-vnet' || itemVnet.toLowerCase().includes('prod');
          const isDbV2Vnet = dbVnetName.toLowerCase() === 'estevia-prod-db-v2-vnet' || dbVnetName.toLowerCase().includes('db-v2') || dbVnetName.toLowerCase().includes('db');

          if (itemVnet.toLowerCase() === dbVnetName.toLowerCase()) {
            connected = true;
          } else if (isDbV2Vnet && (isDevVnet || isQaVnet || isProdVnet)) {
            connected = true;
          }
        }

        if (!connected) {
          return {
            status: 'warning',
            message: 'Unpeered',
            detail: `VNet Connection Warning: Backend '${item.name}' (${themeEnv}) is in ${itemVnet} but is configured to connect to database '${matchingDb.name}' in ${dbVnetName}. Without active VNet peering between these networks, database connections will fail.`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        } else {
          return {
            status: 'verified',
            message: 'Peered DB',
            detail: `Peered database connection verified: connected to database '${matchingDb.name}' (${dbVnetName}) over peered virtual network.`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        }
      } else {
        // Check by string matching if we can't find matching DB resource
        const isDevDb = configuredDbHost.includes('dev') || configuredDbHost.includes('local');
        const isQaDb = configuredDbHost.includes('qa') || configuredDbHost.includes('staging') || configuredDbHost.includes('test');

        let dbEnv: 'DEV' | 'QA' | 'PROD' = 'PROD';
        if (isDevDb) dbEnv = 'DEV';
        else if (isQaDb) dbEnv = 'QA';

        // Estevia network peering rules: dev VNet peered to prod-db-v2. prod VNet peered to prod-db-v2. dev VNet not peered to prod VNet.
        const isDevVnet = itemVnet.toLowerCase() === 'estevia-dev-vnet' || itemVnet.toLowerCase().includes('dev');
        const isQaVnet = itemVnet.toLowerCase() === 'estevia-qa-vnet' || itemVnet.toLowerCase().includes('qa');
        const isProdVnet = itemVnet.toLowerCase() === 'estevia-prod-vnet' || itemVnet.toLowerCase().includes('prod');

        let peered = false;
        if (dbEnv === 'PROD') {
          peered = true; // prod db is in prod-db-v2 which is peered to dev, qa, and prod
        } else if (dbEnv === 'DEV' && isDevVnet) {
          peered = true;
        } else if (dbEnv === 'QA' && (isDevVnet || isQaVnet)) {
          peered = true; // qa and dev share or are peered
        }

        if (!peered) {
          return {
            status: 'warning',
            message: 'Unpeered',
            detail: `VNet Connection Warning: Backend '${item.name}' (${themeEnv}) is in ${itemVnet} but is configured to connect to database '${configuredDbHost}' (${dbEnv}). Without VNet peering, connection will fail.`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        } else {
          return {
            status: 'verified',
            message: 'Peered DB',
            detail: `Database connection verified: '${configuredDbHost}' (${dbEnv}) is accessible from ${itemVnet}.`,
            sourceFile: item.azureResourceDetails?.scrapedSourceFile,
            sourceContent: item.azureResourceDetails?.scrapedSourceContent,
            sourceAppName: item.name
          };
        }
      }
    }

    return null;
  };




  // Track active build groups — used for detection only; auto-expand and auto-tab-switch are intentionally disabled.
  // Users prefer to stay on their current tab without interruption when a build starts.
  const prevActiveBuildGroupsRef = React.useRef<Record<string, boolean>>({});
  React.useEffect(() => {
    const nextActiveBuildGroups: Record<string, boolean> = {};
    const newlyFinishedGroups: string[] = [];
    const prevActive = prevActiveBuildGroupsRef.current;

    localAppGroups.forEach(group => {
      const hasActive = group.envs.some(app => app.pipelineRun && isBuildActive(app.pipelineRun));
      if (hasActive) {
        nextActiveBuildGroups[group.key] = true;
      } else {
        if (prevActive[group.key]) {
          newlyFinishedGroups.push(group.key);
        }
      }
    });

    // Save active builds status map for the next run
    prevActiveBuildGroupsRef.current = nextActiveBuildGroups;

    // Handle newly completed builds: keep expanded for recent build visibility
    if (newlyFinishedGroups.length > 0) {
      newlyFinishedGroups.forEach(key => {
        console.log(`[Dashboard] Build completed for group ${key}. Keeping expanded for recent build visibility.`);
      });
    }
  }, [localAppGroups]);

  // Auto-expand individual builds when they become active, and keep them expanded (do not close on complete)
  React.useEffect(() => {
    const activeBuildApps: string[] = [];
    localAppGroups.forEach(group => {
      group.envs.forEach(app => {
        if (app.pipelineRun && isBuildActive(app.pipelineRun)) {
          activeBuildApps.push(app.name);
        }
      });
    });

    if (activeBuildApps.length > 0) {
      setExpandedBuilds(prev => {
        const next = { ...prev };
        let updated = false;
        activeBuildApps.forEach(name => {
          if (next[name] !== true) {
            next[name] = true;
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }
  }, [localAppGroups]);

  const getBadgeBgColor = (type: string) => {
    const isLight = theme === 'light';
    switch (type.toLowerCase()) {
      case 'frontend':
        return isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.15)';
      case 'backend':
        return isLight ? 'rgba(13, 148, 136, 0.1)' : 'rgba(16, 185, 129, 0.15)';
      case 'vm':
        return isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.15)';
      case 'cluster':
        return isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)';
      default:
        return isLight ? 'rgba(75, 85, 99, 0.08)' : 'rgba(156, 163, 175, 0.1)';
    }
  };

  const getBadgeTextColor = (type: string) => {
    const isLight = theme === 'light';
    switch (type.toLowerCase()) {
      case 'frontend':
        return isLight ? '#2563eb' : '#93c5fd';
      case 'backend':
        return isLight ? '#0d9488' : '#a7f3d0';
      case 'vm':
        return isLight ? '#d97706' : '#fde047';
      case 'cluster':
        return isLight ? '#2563eb' : '#93c5fd';
      default:
        return isLight ? '#475569' : '#94a3b8';
    }
  };

  const getStageColor = (result: string | null, state: string) => {
    const s = (state || '').toLowerCase();
    if (s === 'inprogress' || s === 'running') return 'var(--accent-purple)';
    if (s === 'waiting' || s === 'queued' || s === 'notstarted') return '#f59e0b';
    if (result === 'succeeded') return 'var(--success)';
    if (result === 'failed') return 'var(--error)';
    if (result === 'canceled') return '#ef4444';
    if (result === 'skipped') return 'rgba(255,255,255,0.25)';
    return 'var(--text-secondary)';
  };

  const getStageIcon = (result: string | null, state: string) => {
    const s = (state || '').toLowerCase();
    if (s === 'inprogress' || s === 'running') {
      return <RefreshCw size={11} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />;
    }
    if (s === 'waiting' || s === 'queued' || s === 'notstarted') {
      return <Clock size={11} style={{ color: '#f59e0b' }} />;
    }
    if (result === 'succeeded') {
      return <CheckCircle2 size={11} style={{ color: 'var(--success)' }} />;
    }
    if (result === 'failed') {
      return <AlertCircle size={11} style={{ color: 'var(--error)' }} />;
    }
    return <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }} />;
  };

  const ENV_COLORS: Record<string, { color: string; bg: string; border: string; label: string }> = {
    dev: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.3)', label: 'DEV' },
    qa: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', label: 'QA' },
    prod: { color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.3)', label: 'PROD' },
  };

  const getEnvTag = (app: AppResource): { color: string; bg: string; border: string; label: string } => {
    // Branch takes priority — if an app has a known branch, use it instead of the ACA name
    if (app.branch) {
      const fromBranch = branchToEnv(app.branch);
      if (fromBranch) return ENV_COLORS[fromBranch];
    }
    // Fallback: derive env from ACA resource name suffix
    const n = app.name.toLowerCase();
    if (hasEnvSegment(n, 'dev')) return ENV_COLORS.dev;
    if (hasEnvSegment(n, 'qa')) return ENV_COLORS.qa;
    if (hasEnvSegment(n, 'prod')) return ENV_COLORS.prod;
    // No recognised env suffix → treat as production
    return ENV_COLORS.prod;
  };

  // Map appGroups to override pipelineRun statuses with live data and filter them
  const filteredAppGroups = React.useMemo(() => {
    return localAppGroups.map(group => {
      const filteredEnvs = group.envs.filter(app => {
        // Search filter: matches app name, repo path, group label or repo url
        const matchesSearch = searchQuery.trim() === '' ||
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (group.label && group.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (group.repoPath && group.repoPath.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (app.repositoryUrl && app.repositoryUrl.toLowerCase().includes(searchQuery.toLowerCase()));

        // Environment filter: DEV, QA, PROD
        const envTag = getEnvTag(app).label.toLowerCase();
        const matchesEnv = selectedEnvFilter === 'all' || envTag === selectedEnvFilter;

        // Status filter: running / stopped
        const appStatus = (app.status || '').toLowerCase();
        const isRunning = appStatus === 'running' || appStatus === 'deployed' || appStatus === 'succeeded';
        const isStopped = appStatus === 'stopped' || appStatus === 'sleep' || appStatus === 'deprovisioned';
        const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'running' && isRunning) ||
          (statusFilter === 'stopped' && isStopped);

        return matchesSearch && matchesEnv && matchesStatus;
      });

      return {
        ...group,
        envs: filteredEnvs
      };
    }).filter(group => {
      if (group.envs.length === 0) return false;

      // Health filter: applied at group level using ymlHealthMap and network checks
      if (healthFilter !== 'all') {
        const health = ymlHealthMap?.[group.key];

        // 1. Resolve network issues (present on any active env of this group)
        let hasNetworkIssues = false;
        for (const app of group.envs) {
          const validation = checkNetworkWarnings(app, group);
          if (validation && (validation.status === 'critical' || validation.status === 'unverified' || validation.status === 'warning')) {
            hasNetworkIssues = true;
            break;
          }
        }

        // 2. Resolve scan pending or scan error states
        if (!health) {
          // No health scan data yet -> cannot be confirmed healthy or confirmed having issues
          return false;
        }

        if (health.error) {
          // A failed scan is considered an issue
          if (healthFilter === 'healthy') return false;
          if (healthFilter === 'issues') return true;
          return false;
        }

        // 3. Resolve YAML and Dockerfile health states
        const yml = health.ymlHealth;
        const docker = health.dockerfileHealth;

        const isYmlHealthy = yml && (group.type === 'frontend' && !yml.exists ? true : (yml.exists && yml.valid && yml.warningCount === 0));
        const isDockerHealthy = group.type !== 'backend' || !docker || !docker.exists || (docker.valid && docker.warningCount === 0);

        const isHealthy = isYmlHealthy && isDockerHealthy && !hasNetworkIssues;

        const hasYmlIssues = yml && yml.exists && (!yml.valid || yml.warningCount > 0);
        const hasDockerIssues = docker && docker.exists && (!docker.valid || docker.warningCount > 0);
        const hasIssues = hasYmlIssues || hasDockerIssues || hasNetworkIssues;

        if (healthFilter === 'healthy' && !isHealthy) return false;
        if (healthFilter === 'issues' && !hasIssues) return false;
      }

      return true;
    });
  }, [localAppGroups, searchQuery, selectedEnvFilter, statusFilter, healthFilter, ymlHealthMap]);

  const getCardStyles = (app: AppResource, theme: 'dark' | 'light') => {
    const isLight = theme === 'light';

    // Resolve effective env — branch wins over ACA name
    let effectiveEnv: 'dev' | 'qa' | 'prod' | null = null;
    if (app.branch) effectiveEnv = branchToEnv(app.branch);
    if (!effectiveEnv) {
      const n = app.name.toLowerCase();
      if (hasEnvSegment(n, 'dev')) effectiveEnv = 'dev';
      else if (hasEnvSegment(n, 'qa')) effectiveEnv = 'qa';
      else if (hasEnvSegment(n, 'prod')) effectiveEnv = 'prod';
      else effectiveEnv = 'prod'; // bare name → treat as prod
    }

    if (effectiveEnv === 'dev') {
      return {
        background: isLight
          ? 'linear-gradient(135deg, rgba(219, 234, 254, 0.95) 0%, rgba(239, 246, 255, 0.99) 100%)'
          : 'linear-gradient(135deg, rgba(96, 165, 250, 0.22) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: isLight ? 'rgba(96, 165, 250, 0.45)' : 'rgba(96, 165, 250, 0.35)',
        color: '#60a5fa'
      };
    }
    if (effectiveEnv === 'qa') {
      return {
        background: isLight
          ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(255, 251, 235, 0.99) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
        border: isLight ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.35)',
        color: '#f59e0b'
      };
    }
    // prod (default)
    return {
      background: isLight
        ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.95) 0%, rgba(240, 253, 250, 0.99) 100%)'
        : 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
      border: isLight ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.35)',
      color: '#34d399'
    };
  };

  const getUnlinkedCardStyles = (theme: 'dark' | 'light') => {
    const isLight = theme === 'light';
    return {
      background: isLight
        ? 'linear-gradient(135deg, rgba(254, 226, 226, 0.95) 0%, rgba(254, 242, 242, 0.99) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.05) 100%)',
      border: isLight ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.35)',
      color: isLight ? '#dc2626' : '#ef4444'
    };
  };

  return (
    <div>
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
      `}</style>
      {scanError && (
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle style={{ color: 'var(--error)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-primary)' }}>{scanError}</span>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleScan()}
            disabled={scanning}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: scanning ? 'not-allowed' : 'pointer',
              opacity: scanning ? 0.6 : 1,
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: 'var(--text-primary)',
              flexShrink: 0
            }}
          >
            <RefreshCw size={12} className={scanning ? "spin-anim" : ""} />
            Retry Scan
          </button>
        </div>
      )}

      {(scanning || scanProgress > 0) && apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={48} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
          <div>
            <h3 style={{ margin: 0 }}>Fetching Live Subscriptions... {Math.floor(scanProgress)}%</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>{getScanProgressMessage(scanProgress)}</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', width: '100%', maxWidth: '400px', marginTop: '8px' }}>
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
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  title={`${stage.label}: ${Math.round(segmentProgress)}%`}
                >
                  <div style={{
                    width: `${segmentProgress}%`,
                    height: '100%',
                    backgroundColor: segmentProgress > 0 ? 'var(--accent-purple)' : 'transparent',
                    boxShadow: segmentProgress > 0 ? '0 0 10px var(--accent-purple-glow)' : 'none',
                    transition: 'width 0.15s ease-out'
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      ) : apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Search size={48} style={{ color: 'var(--text-secondary)' }} />
          <div>
            <h3 style={{ margin: 0 }}>No active resources discovered</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>Click the "Scan Active Cloud" button below to query Azure subscription.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleScan()}
            disabled={scanning}
            style={{
              marginTop: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: scanning ? 'not-allowed' : 'pointer',
              opacity: scanning ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} className={scanning ? "spin-anim" : ""} />
            Scan Active Cloud
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Cloud Scanning Sub-Tabs */}

          {activeSubTab === 'resources' ? (
            <>
              {/* Glassmorphic Search & Filter Bar */}
              <div className="glass-panel" style={{
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Search Input wrapper */}
                <div style={{ position: 'relative', display: 'flex' }}>
                  <Search size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="text"
                    placeholder="Search by name, repository, or key..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '44px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      height: '42px',
                      width: '100%'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* ───────────────────── Single Toolbar ───────────────────── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    width: '100%',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    paddingBottom: '2px'
                  }}
                >
                  {/* ================= ENV ================= */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Env
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background:
                          theme === 'light'
                            ? 'rgba(0,0,0,0.04)'
                            : 'rgba(255,255,255,0.03)',
                        padding: '3px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      {(['all', 'dev', 'qa', 'prod'] as const).map((env) => {
                        const isActive = selectedEnvFilter === env;

                        const activeColor =
                          env === 'dev'
                            ? '#60a5fa'
                            : env === 'qa'
                              ? '#f59e0b'
                              : env === 'prod'
                                ? '#34d399'
                                : 'var(--accent-purple)';

                        const activeBg =
                          env === 'dev'
                            ? 'rgba(96,165,250,0.15)'
                            : env === 'qa'
                              ? 'rgba(245,158,11,0.15)'
                              : env === 'prod'
                                ? 'rgba(52,211,153,0.15)'
                                : 'rgba(139,92,246,0.15)';

                        const activeBorder =
                          env === 'dev'
                            ? 'rgba(96,165,250,0.3)'
                            : env === 'qa'
                              ? 'rgba(245,158,11,0.3)'
                              : env === 'prod'
                                ? 'rgba(52,211,153,0.3)'
                                : 'rgba(139,92,246,0.3)';

                        return (
                          <button
                            key={env}
                            type="button"
                            onClick={() => setSelectedEnvFilter(env)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: isActive
                                ? `1px solid ${activeBorder}`
                                : '1px solid transparent',
                              background: isActive ? activeBg : 'transparent',
                              color: isActive ? activeColor : 'var(--text-secondary)',
                              fontWeight: isActive ? 700 : 500,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            {env}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      width: '1px',
                      height: '20px',
                      background: 'var(--glass-border)',
                      flexShrink: 0
                    }}
                  />

                  {/* ================= STATUS ================= */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Status
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        background:
                          theme === 'light'
                            ? 'rgba(0,0,0,0.04)'
                            : 'rgba(255,255,255,0.03)',
                        padding: '3px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      {([
                        {
                          key: 'all',
                          label: 'All',
                          icon: null,
                          color: 'var(--accent-purple)',
                          bg: 'rgba(139,92,246,0.15)',
                          border: 'rgba(139,92,246,0.3)'
                        },
                        {
                          key: 'running',
                          label: 'Running',
                          icon: (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#34d399'
                              }}
                            />
                          ),
                          color: '#34d399',
                          bg: 'rgba(52,211,153,0.15)',
                          border: 'rgba(52,211,153,0.3)'
                        },
                        {
                          key: 'stopped',
                          label: 'Stopped',
                          icon: (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#f87171'
                              }}
                            />
                          ),
                          color: '#f87171',
                          bg: 'rgba(248,113,113,0.15)',
                          border: 'rgba(248,113,113,0.3)'
                        }
                      ] as const).map(({ key, label, icon, color, bg, border }) => {
                        const isActive = statusFilter === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setStatusFilter(key)}
                            style={{
                              padding: '5px 12px',
                              height: '28px',
                              borderRadius: '6px',
                              border: isActive
                                ? `1px solid ${border}`
                                : '1px solid transparent',
                              background: isActive ? bg : 'transparent',
                              color: isActive ? color : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.72rem',
                              fontWeight: isActive ? 700 : 500,
                              cursor: 'pointer'
                            }}
                          >
                            {icon}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      width: '1px',
                      height: '20px',
                      background: 'var(--glass-border)',
                      flexShrink: 0
                    }}
                  />

                  {/* ================= HEALTH ================= */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Health
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        background:
                          theme === 'light'
                            ? 'rgba(0,0,0,0.04)'
                            : 'rgba(255,255,255,0.03)',
                        padding: '3px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                          {([
                            { key: 'all', label: 'All', icon: null, color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
                            { key: 'healthy', label: 'Healthy', icon: <CheckCircle2 size={11} />, color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)' },
                            { key: 'issues', label: 'Issues', icon: <AlertTriangle size={11} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' }
                          ] as const).map(({ key, label, icon, color, bg, border }) => {
                            const isActive = healthFilter === key;
                            return (
                              <button key={key} type="button" onClick={() => setHealthFilter(key)} style={{
                                padding: '5px 12px',
                                height: '28px',
                                borderRadius: '6px',
                                border: isActive ? `1px solid ${border}` : '1px solid transparent',
                                background: isActive ? bg : 'transparent',
                                color: isActive ? color : 'var(--text-secondary)',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.72rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
                              >
                                {icon}{label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Push buttons to right */}
                  <div style={{ flex: 1 }} />

                  {/* Clear Filters */}
                  {(statusFilter !== 'all' || healthFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setHealthFilter('all');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(248,113,113,0.3)',
                        background: 'rgba(248,113,113,0.08)',
                        color: '#f87171',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <X size={11} />
                      Clear Filters
                    </button>
                  )}

                  {/* Collapse All */}
                  <button
                    type="button"
                    onClick={toggleCollapseAll}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      height: '30px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: allGroupsCollapsed
                        ? theme === 'light'
                          ? 'rgba(139,92,246,0.08)'
                          : 'rgba(139,92,246,0.12)'
                        : theme === 'light'
                          ? 'rgba(0,0,0,0.04)'
                          : 'rgba(255,255,255,0.04)',
                      color: allGroupsCollapsed
                        ? 'var(--accent-purple)'
                        : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {allGroupsCollapsed ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
                    {allGroupsCollapsed ? 'Expand All' : 'Collapse All'}
                  </button>
                </div>

              </div>

              {(() => {
                if (filteredAppGroups.length === 0) {
                  return (
                    <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', marginTop: '10px' }}>
                      <Search size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                      <h3>No resources match your filters</h3>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Try refining your search query or changing the environment tag filter.
                      </p>
                    </div>
                  );
                }

                const swaGroups = filteredAppGroups.filter(g => g.type === 'frontend');
                const acaGroups = filteredAppGroups.filter(g => g.type === 'backend');
                const vmGroups = filteredAppGroups.filter(g => g.type === 'vm');
                // YAML tab: all groups that have yaml health data (swa + aca)
                const yamlGroups = filteredAppGroups.filter(g => g.type === 'frontend' || g.type === 'backend');
                // Docker tab: backend (ACA) groups only — Dockerfiles belong to container apps
                const dockerGroups = filteredAppGroups.filter(g => g.type === 'backend');

                const allCategories = [
                  {
                    key: 'swa' as const,
                    label: 'Static Web Apps',
                    shortLabel: 'SWA',
                    description: 'Azure Static Web Apps — host frontend SPAs and static sites with global CDN, SSL, and custom domains.',
                    groups: swaGroups,
                    icon: <Globe size={16} />,
                    color: 'var(--accent-purple)',
                    colorRaw: '#8b5cf6',
                    bg: 'rgba(139,92,246,0.12)',
                    glow: 'rgba(139,92,246,0.4)'
                  },
                  {
                    key: 'aca' as const,
                    label: 'Container Apps',
                    shortLabel: 'ACA',
                    description: 'Azure Container Apps — serverless containers with automatic scaling, zero-downtime blue/green deployments, and traffic splitting.',
                    groups: acaGroups,
                    icon: <Cpu size={16} />,
                    color: 'var(--accent-teal)',
                    colorRaw: '#14b8a6',
                    bg: 'rgba(20,184,166,0.12)',
                    glow: 'rgba(20,184,166,0.4)'
                  },
                  {
                    key: 'vm' as const,
                    label: 'Virtual Machines',
                    shortLabel: 'VM',
                    description: 'Azure Virtual Machines — full IaaS compute instances with SSH access, custom OS, and on-demand start/stop power controls.',
                    groups: vmGroups,
                    icon: <Server size={16} />,
                    color: '#f59e0b',
                    colorRaw: '#f59e0b',
                    bg: 'rgba(245,158,11,0.12)',
                    glow: 'rgba(245,158,11,0.4)'
                  }
                ];

                const visibleCategories = allCategories;
                // Default to activeDashboardTab or swa if not found
                const activeTab = visibleCategories.find(c => c.key === activeDashboardTab) ? activeDashboardTab : 'swa';
                const activeCategory = visibleCategories.find(c => c.key === activeTab);

                return (
                  <>
                    {/* ── Tab Navigation Bar ── */}
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      padding: '6px',
                      marginBottom: '20px',
                      background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                      borderRadius: '14px',
                      border: '1px solid var(--glass-border)',
                      position: 'relative'
                    }}>
                      {visibleCategories.map(cat => {
                        const isActive = cat.key === activeTab;
                        const catHasActiveBuild = cat.groups.some(g => g.envs.some(e => e.pipelineRun && isBuildActive(e.pipelineRun)));
                        const runningCount = cat.groups.reduce((sum, g) => sum + g.envs.filter(e => (e.status || '').toLowerCase() === 'running' || (e.status || '').toLowerCase() === 'deployed').length, 0);
                        const stoppedCount = cat.groups.reduce((sum, g) => sum + g.envs.filter(e => (e.status || '').toLowerCase() === 'stopped' || (e.status || '').toLowerCase() === 'sleep').length, 0);
                        const totalEnvs = cat.groups.reduce((sum, g) => sum + g.envs.length, 0);

                        return (
                          <div
                            key={cat.key}
                            style={{ position: 'relative', flex: 1 }}
                            onMouseEnter={() => setHoveredTab(cat.key)}
                            onMouseLeave={() => setHoveredTab(null)}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveDashboardTab(cat.key)}
                              style={{
                                width: '100%',
                                padding: '10px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                borderRadius: '10px',
                                border: isActive ? `1px solid ${cat.color}50` : '1px solid transparent',
                                background: isActive
                                  ? (theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.07)')
                                  : 'transparent',
                                boxShadow: isActive ? `0 2px 12px ${cat.glow}30, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: isActive ? cat.color : 'var(--text-secondary)',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.84rem',
                                letterSpacing: '0.01em',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                              }}
                            >
                              {/* Tab icon */}
                              <span style={{ opacity: isActive ? 1 : 0.65 }}>{cat.icon}</span>

                              {/* Tab label */}
                              <span>{cat.shortLabel}</span>

                              {/* Resources count badge */}
                              <span style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                backgroundColor: isActive ? cat.bg : 'rgba(148,163,184,0.15)',
                                color: isActive ? cat.color : 'var(--text-secondary)',
                                padding: '1px 7px',
                                borderRadius: '10px',
                                border: isActive ? `1px solid ${cat.colorRaw}30` : '1px solid transparent',
                                transition: 'all 0.2s ease'
                              }}>
                                {cat.groups.length}
                              </span>

                              {/* Pulsing build-in-progress indicator */}
                              {catHasActiveBuild && (
                                <span style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  backgroundColor: '#10b981',
                                  boxShadow: '0 0 6px rgba(16,185,129,0.8)',
                                  display: 'inline-block',
                                  flexShrink: 0
                                }} className="play-pulse-anim" title="Active build in progress" />
                              )}
                            </button>

                            {/* Hover Tooltip */}
                            {hoveredTab === cat.key && (
                              <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 9000,
                                background: '#090d16',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                minWidth: '220px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                                pointerEvents: 'none',
                                color: '#e2e8f0'
                              }}>
                                {/* Arrow */}
                                <div style={{
                                  position: 'absolute',
                                  top: '-5px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: '10px',
                                  height: '10px',
                                  background: '#090d16',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  borderBottom: 'none',
                                  borderRight: 'none',
                                  rotate: '45deg'
                                }} />
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: cat.color, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {cat.icon} {cat.label} ({cat.shortLabel})
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '8px' }}>
                                  {cat.description}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 600, color: '#34d399' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }} />
                                    {runningCount} Running
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 600, color: '#f87171' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f87171', display: 'inline-block' }} />
                                    {stoppedCount} Stopped
                                  </div>
                                  {totalEnvs - runningCount - stoppedCount > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8', display: 'inline-block' }} />
                                      {totalEnvs - runningCount - stoppedCount} Other
                                    </div>
                                  )}
                                </div>
                                {catHasActiveBuild && (
                                  <div style={{ marginTop: '6px', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.66rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} className="play-pulse-anim" />
                                    Active build in progress
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Active Tab Description Banner ── */}
                    {activeCategory && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        marginBottom: '16px',
                        borderRadius: '10px',
                        background: activeCategory.bg,
                        border: `1px solid ${activeCategory.colorRaw}25`,
                        fontSize: '0.74rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}>
                        <span style={{ color: activeCategory.color, flexShrink: 0 }}>{activeCategory.icon}</span>
                        <span><strong style={{ color: activeCategory.color }}>{activeCategory.label} ({activeCategory.shortLabel}):</strong> {activeCategory.description}</span>
                      </div>
                    )}
                    {/* ── Active Tab Groups ── */}
                    {activeCategory && activeCategory.groups.length === 0 ? (
                      <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                        <Globe size={48} style={{ color: activeCategory.color, opacity: 0.6 }} />
                        <div>
                          <h3 style={{ margin: 0 }}>No {activeCategory.label} Discovered</h3>
                          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0, maxWidth: '450px', lineHeight: 1.5 }}>
                            No active {activeCategory.label.toLowerCase()} resources were found under the selected resource group and filters.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {(activeCategory?.groups ?? []).map((group) => {
                        const accentColor = group.type === 'vm' ? '#f59e0b' : (group.type === 'frontend' ? 'var(--accent-purple)' : 'var(--accent-teal)');
                        const accentBg = group.type === 'vm' ? 'rgba(245,158,11,0.1)' : (group.type === 'frontend' ? 'rgba(139,92,246,0.1)' : 'rgba(20,184,166,0.1)');
                        const accentGlow = group.type === 'vm' ? '0 0 10px rgba(245,158,11,0.4)' : (group.type === 'frontend' ? '0 0 10px var(--accent-purple-glow)' : '0 0 10px var(--accent-teal-glow)');

                        const isCollapsed = collapsedScanGroups[group.key] !== false;
                        const activeRuns = group.envs.filter(app => app.pipelineRun && isBuildActive(app.pipelineRun));
                        const hasInProgress = activeRuns.some(app => {
                          const s = (app.pipelineRun?.state || '').toLowerCase();
                          return s !== 'notstarted' && s !== 'queued' && s !== 'waiting';
                        });
                        const hasQueued = activeRuns.some(app => {
                          const s = (app.pipelineRun?.state || '').toLowerCase();
                          return s === 'notstarted' || s === 'queued' || s === 'waiting';
                        });
                        const groupHasActiveDeployment = activeRuns.length > 0;
                        const hasFailedBuild = group.envs.some(app => app.pipelineRun?.result === 'failed');

                        const health = ymlHealthMap?.[group.key];
                        const isLoading = ymlHealthLoading?.[group.key];
                        const firstEnv = group.envs?.[0];

                        const handleFixYml = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (firstEnv) openPipelineModal(firstEnv, group);
                        };

                        const handleFixDockerfile = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (firstEnv) openDockerfileEditor(firstEnv, group);
                        };

                        // ── Standard SWA / ACA / VM card accordion ──────────────────────────────
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: accentBg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                                }}>
                                  {group.type === 'frontend' ? (
                                    <Globe size={16} style={{ color: 'var(--accent-purple)' }} />
                                  ) : group.type === 'vm' ? (
                                    <Server size={16} style={{ color: '#f59e0b' }} />
                                  ) : (
                                    <Cpu size={16} style={{ color: 'var(--accent-teal)' }} />
                                  )}
                                </div>
                                <div>
                                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                    {group.label}
                                    <span style={{
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      backgroundColor: getBadgeBgColor(group.type),
                                      color: getBadgeTextColor(group.type),
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      border: '1px solid ' + (group.type === 'frontend' ? 'rgba(59, 130, 246, 0.2)' : group.type === 'vm' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)')
                                    }}>
                                      {group.type === 'frontend' ? 'SWA' : group.type === 'vm' ? 'VM' : 'ACA'}
                                    </span>
                                  </h3>
                                  {group.repoPath && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <GitBranch size={12} />
                                      {group.repoPath}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {hasInProgress && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: 'var(--accent-purple)',
                                    background: 'rgba(139, 92, 246, 0.12)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.2)'
                                  }}>
                                    <RefreshCw size={10} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                                    BUILD IN PROGRESS
                                  </span>
                                )}
                                {!hasInProgress && hasQueued && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#f59e0b',
                                    background: 'rgba(245, 158, 11, 0.12)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.2)'
                                  }}>
                                    <Clock size={10} style={{ color: '#f59e0b' }} />
                                    BUILD QUEUED
                                  </span>
                                )}

                                {isCollapsed && hasFailedBuild && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: 'var(--error)',
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.2)'
                                  }}>
                                    <AlertCircle size={10} style={{ color: 'var(--error)' }} />
                                    LAST BUILD FAILED
                                  </span>
                                )}

                                {/* Health check loading spinner */}
                                {isLoading && (
                                  <span style={{
                                    background: theme === 'light' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(96, 165, 250, 0.12)',
                                    border: theme === 'light' ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(96, 165, 250, 0.35)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: '0.74rem',
                                    color: theme === 'light' ? '#2563eb' : '#60a5fa',
                                    fontWeight: 600,
                                    boxShadow: theme === 'light' ? '0 1px 3px rgba(59, 130, 246, 0.05)' : '0 0 8px rgba(96, 165, 250, 0.25)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                  }}>
                                    <RefreshCw size={10} className="spin-anim" style={{ marginRight: '6px', color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                                    Checking health...
                                  </span>
                                )}

                                {/* Default Pending Badge */}
                                {!isLoading && !health && group.repoPath && group.type !== 'vm' && (
                                  <span
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      border: '1px solid var(--glass-border)',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.74rem',
                                      color: 'var(--text-secondary)',
                                      fontWeight: 600,
                                      cursor: 'default'
                                    }}
                                  >
                                    <Clock size={11} style={{ color: 'var(--text-secondary)' }} />
                                    <span>Health scan pending</span>
                                  </span>
                                )}

                                {/* Healthy Badge */}
                                {!isLoading && health && (
                                  health.ymlHealth &&
                                  (group.type === 'frontend' && !health.ymlHealth.exists ? true : (health.ymlHealth.exists && health.ymlHealth.valid && health.ymlHealth.warningCount === 0)) &&
                                  (group.type !== 'backend' || !health.dockerfileHealth || !health.dockerfileHealth.exists || (health.dockerfileHealth.valid && health.dockerfileHealth.warningCount === 0))
                                ) && (
                                    <span
                                      style={{
                                        background: theme === 'light' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(52, 211, 153, 0.12)',
                                        border: theme === 'light' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(52, 211, 153, 0.3)',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '0.74rem',
                                        color: theme === 'light' ? '#059669' : '#34d399',
                                        fontWeight: 600,
                                        boxShadow: theme === 'light' ? '0 1px 3px rgba(16, 185, 129, 0.05)' : '0 0 8px rgba(52, 211, 153, 0.25)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'default'
                                      }}
                                      onMouseOver={(ev) => {
                                        ev.currentTarget.style.transform = 'scale(1.03)';
                                        ev.currentTarget.style.boxShadow = theme === 'light' ? '0 2px 6px rgba(16, 185, 129, 0.1)' : '0 0 12px rgba(52, 211, 153, 0.4)';
                                      }}
                                      onMouseOut={(ev) => {
                                        ev.currentTarget.style.transform = 'scale(1)';
                                        ev.currentTarget.style.boxShadow = theme === 'light' ? '0 1px 3px rgba(16, 185, 129, 0.05)' : '0 0 8px rgba(52, 211, 153, 0.25)';
                                      }}
                                    >
                                      <ShieldCheck size={11} style={{ color: theme === 'light' ? '#059669' : '#34d399' }} />
                                      <span>Healthy</span>
                                    </span >
                                  )}

                                {/* Network Issues Badge */}
                                {(() => {
                                  if (isLoading) return null;
                                  let hasCritical = false;
                                  let hasWarning = false;
                                  let hasInfo = false;

                                  for (const app of group.envs) {
                                    const validation = checkNetworkWarnings(app, group);
                                    if (validation) {
                                      if (validation.status === 'critical' || validation.status === 'unverified') hasCritical = true;
                                      else if (validation.status === 'warning') hasWarning = true;
                                      else if (validation.status === 'info') hasInfo = true;
                                    }
                                  }

                                  if (hasCritical) {
                                    return (
                                      <span
                                        style={{
                                          background: theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                          border: theme === 'light' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                          padding: '3px 8px',
                                          borderRadius: '12px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontSize: '0.74rem',
                                          color: theme === 'light' ? '#b91c1c' : '#f87171',
                                          boxShadow: theme === 'light' ? '0 1px 3px rgba(239, 68, 68, 0.05)' : '0 0 8px rgba(239, 68, 68, 0.2)',
                                          transition: 'all 0.2s ease',
                                          cursor: 'default'
                                        }}
                                        onMouseOver={(ev) => {
                                          ev.currentTarget.style.transform = 'scale(1.03)';
                                        }}
                                        onMouseOut={(ev) => {
                                          ev.currentTarget.style.transform = 'scale(1)';
                                        }}
                                      >
                                        <AlertCircle size={11} style={{ color: theme === 'light' ? '#b91c1c' : '#f87171' }} />
                                        <span>Critical Network Issue</span>
                                      </span>
                                    );
                                  }
                                  if (hasWarning) {
                                    return (
                                      <span
                                        style={{
                                          background: theme === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                                          border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(245, 158, 11, 0.3)',
                                          padding: '3px 8px',
                                          borderRadius: '12px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontSize: '0.74rem',
                                          color: theme === 'light' ? '#b45309' : '#fbbf24',
                                          boxShadow: theme === 'light' ? '0 1px 3px rgba(245, 158, 11, 0.05)' : '0 0 8px rgba(245, 158, 11, 0.2)',
                                          transition: 'all 0.2s ease',
                                          cursor: 'default'
                                        }}
                                        onMouseOver={(ev) => {
                                          ev.currentTarget.style.transform = 'scale(1.03)';
                                        }}
                                        onMouseOut={(ev) => {
                                          ev.currentTarget.style.transform = 'scale(1)';
                                        }}
                                      >
                                        <AlertTriangle size={11} style={{ color: theme === 'light' ? '#b45309' : '#fbbf24' }} />
                                        <span>Network Warning</span>
                                      </span>
                                    );
                                  }
                                  if (hasInfo) {
                                    return (
                                      <span
                                        style={{
                                          background: theme === 'light' ? 'rgba(14, 165, 233, 0.08)' : 'rgba(14, 165, 233, 0.12)',
                                          border: theme === 'light' ? '1px solid rgba(14, 165, 233, 0.25)' : '1px solid rgba(14, 165, 233, 0.3)',
                                          padding: '3px 8px',
                                          borderRadius: '12px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontSize: '0.74rem',
                                          color: theme === 'light' ? '#0369a1' : '#38bdf8',
                                          boxShadow: theme === 'light' ? '0 1px 3px rgba(14, 165, 233, 0.05)' : '0 0 8px rgba(14, 165, 233, 0.2)',
                                          transition: 'all 0.2s ease',
                                          cursor: 'default'
                                        }}
                                        onMouseOver={(ev) => {
                                          ev.currentTarget.style.transform = 'scale(1.03)';
                                        }}
                                        onMouseOut={(ev) => {
                                          ev.currentTarget.style.transform = 'scale(1)';
                                        }}
                                      >
                                        <Info size={11} style={{ color: theme === 'light' ? '#0369a1' : '#38bdf8' }} />
                                        <span>Network Info</span>
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Scan Error Badge */}
                                {!isLoading && health?.error && (
                                  <span
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredErrorTooltipData({
                                        groupKey: group.key,
                                        errorMessage: health.message || 'Check failed',
                                        top: rect.top - 8,
                                        left: rect.left + rect.width / 2
                                      });
                                    }}
                                    onMouseLeave={() => setHoveredErrorTooltipData(null)}
                                    style={{
                                      position: 'relative',
                                      background: theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                      border: theme === 'light' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.74rem',
                                      color: theme === 'light' ? '#dc2626' : '#f87171',
                                      fontWeight: 600,
                                      boxShadow: theme === 'light' ? '0 1px 3px rgba(239, 68, 68, 0.05)' : '0 0 8px rgba(239, 68, 68, 0.2)',
                                      transition: 'all 0.2s ease',
                                      cursor: 'default'
                                    }}
                                    onMouseOver={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1.03)';
                                    }}
                                    onMouseOut={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    <AlertCircle size={11} />
                                    <span>Cannot check</span>
                                    {refreshHealthForRepo && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          refreshHealthForRepo(firstEnv?.repositoryUrl || group.repoUrl || '');
                                        }}
                                        style={{
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          border: '1px solid var(--glass-border)',
                                          color: theme === 'light' ? '#dc2626' : '#f87171',
                                          borderRadius: '4px',
                                          padding: '1px 6px',
                                          fontSize: '0.65rem',
                                          cursor: 'pointer',
                                          marginLeft: '8px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(ev) => {
                                          ev.stopPropagation();
                                          ev.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                        }}
                                        onMouseOut={(ev) => {
                                          ev.stopPropagation();
                                          ev.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        }}
                                      >
                                        <RefreshCw size={10} />
                                        Retry
                                      </button>
                                    )}
                                  </span>
                                )}

                                {/* YAML Issues Badge */}
                                {!isLoading && health?.ymlHealth && health.ymlHealth.exists && !health.ymlHealth.valid && (
                                  <span
                                    style={{
                                      background: theme === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                      border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.74rem',
                                      color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                      boxShadow: theme === 'light' ? '0 1px 3px rgba(220, 38, 38, 0.05)' : '0 0 8px rgba(239, 68, 68, 0.2)',
                                      transition: 'all 0.2s ease',
                                      cursor: 'default'
                                    }}
                                    onMouseOver={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1.03)';
                                    }}
                                    onMouseOut={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    <AlertCircle size={11} />
                                    <span>YAML Issues</span>
                                    {!isViewer && (
                                      <button
                                        onClick={handleFixYml}
                                        style={{
                                          background: theme === 'light' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                                          border: 'none',
                                          borderRadius: '4px',
                                          color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          padding: '1px 5px',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          transition: 'all 0.15s ease'
                                        }}
                                        onMouseOver={(ev) => {
                                          ev.stopPropagation();
                                          ev.currentTarget.style.background = theme === 'light' ? 'rgba(220, 38, 38, 0.25)' : 'rgba(239, 68, 68, 0.35)';
                                        }}
                                        onMouseOut={(ev) => {
                                          ev.stopPropagation();
                                          ev.currentTarget.style.background = theme === 'light' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.2)';
                                        }}
                                      >
                                        Fix →
                                      </button>
                                    )}
                                  </span>
                                )}

                                {/* Dockerfile Error Badge */}
                                {!isLoading && health?.dockerfileHealth && health.dockerfileHealth.exists && !health.dockerfileHealth.valid && (
                                  <span
                                    style={{
                                      background: theme === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                      border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.74rem',
                                      color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                      boxShadow: theme === 'light' ? '0 1px 3px rgba(220, 38, 38, 0.05)' : '0 0 8px rgba(239, 68, 68, 0.2)',
                                      transition: 'all 0.2s ease',
                                      cursor: 'default'
                                    }}
                                    onMouseOver={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1.03)';
                                    }}
                                    onMouseOut={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    <AlertCircle size={11} />
                                    <span>Dockerfile Error</span>
                                    {!isViewer && (
                                      <button
                                        onClick={handleFixDockerfile}
                                        style={{
                                          background: theme === 'light' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                                          border: 'none',
                                          borderRadius: '4px',
                                          color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          padding: '1px 5px',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          transition: 'all 0.15s ease'
                                        }}
                                        onMouseOver={(ev) => {
                                          ev.stopPropagation();
                                          ev.currentTarget.style.background = theme === 'light' ? 'rgba(220, 38, 38, 0.25)' : 'rgba(239, 68, 68, 0.35)';
                                        }}
                                        onMouseOut={(ev) => {
                                          ev.stopPropagation();
                                          ev.currentTarget.style.background = theme === 'light' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.2)';
                                        }}
                                      >
                                        Fix →
                                      </button>
                                    )}
                                  </span>
                                )}

                                {/* YAML Warnings Pill */}
                                {!isLoading && health?.ymlHealth && health.ymlHealth.exists && health.ymlHealth.valid && health.ymlHealth.warningCount > 0 && (
                                  <span
                                    style={{
                                      background: theme === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                                      border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(245, 158, 11, 0.3)',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.74rem',
                                      color: theme === 'light' ? '#b45309' : '#fbbf24',
                                      fontWeight: 600,
                                      boxShadow: theme === 'light' ? '0 1px 3px rgba(245, 158, 11, 0.05)' : '0 0 8px rgba(245, 158, 11, 0.2)',
                                      transition: 'all 0.2s ease',
                                      cursor: 'default'
                                    }}
                                    onMouseOver={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1.03)';
                                      ev.currentTarget.style.boxShadow = theme === 'light' ? '0 2px 6px rgba(245, 158, 11, 0.1)' : '0 0 12px rgba(245, 158, 11, 0.35)';
                                    }}
                                    onMouseOut={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1)';
                                      ev.currentTarget.style.boxShadow = theme === 'light' ? '0 1px 3px rgba(245, 158, 11, 0.05)' : '0 0 8px rgba(245, 158, 11, 0.2)';
                                    }}
                                  >
                                    <AlertCircle size={11} />
                                    <span>{health.ymlHealth.warningCount} YAML Warning{health.ymlHealth.warningCount > 1 ? 's' : ''}</span>
                                  </span>
                                )}

                                {/* Dockerfile Warnings Pill */}
                                {!isLoading && health?.dockerfileHealth && health.dockerfileHealth.exists && health.dockerfileHealth.valid && health.dockerfileHealth.warningCount > 0 && (
                                  <span
                                    style={{
                                      background: theme === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                                      border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(245, 158, 11, 0.3)',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.74rem',
                                      color: theme === 'light' ? '#b45309' : '#fbbf24',
                                      fontWeight: 600,
                                      boxShadow: theme === 'light' ? '0 1px 3px rgba(245, 158, 11, 0.05)' : '0 0 8px rgba(245, 158, 11, 0.2)',
                                      transition: 'all 0.2s ease',
                                      cursor: 'default'
                                    }}
                                    onMouseOver={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1.03)';
                                      ev.currentTarget.style.boxShadow = theme === 'light' ? '0 2px 6px rgba(245, 158, 11, 0.1)' : '0 0 12px rgba(245, 158, 11, 0.35)';
                                    }}
                                    onMouseOut={(ev) => {
                                      ev.currentTarget.style.transform = 'scale(1)';
                                      ev.currentTarget.style.boxShadow = theme === 'light' ? '0 1px 3px rgba(245, 158, 11, 0.05)' : '0 0 8px rgba(245, 158, 11, 0.2)';
                                    }}
                                  >
                                    <AlertCircle size={11} />
                                    <span>{health.dockerfileHealth.warningCount} Dockerfile Warning{health.dockerfileHealth.warningCount > 1 ? 's' : ''}</span>
                                  </span>
                                )}

                                {/* Environments count — hover opens a fixed-position portal tooltip */}
                                <span
                                  style={{
                                    fontSize: '0.76rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500,
                                    cursor: 'default',
                                    textDecoration: 'underline dotted',
                                    textUnderlineOffset: '3px'
                                  }}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setGroupTooltipData({
                                      groupKey: group.key,
                                      accentColor,
                                      envs: group.envs,
                                      top: rect.top - 8,  // will render above
                                      right: window.innerWidth - rect.right
                                    });
                                  }}
                                  onMouseLeave={() => setGroupTooltipData(null)}
                                >
                                  {group.envs.length} {group.envs.length === 1 ? 'Environment' : 'Environments'}
                                </span>

                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.8, marginRight: '6px' }}>
                                  {isCollapsed ? 'Click to expand group' : 'Click to Collapse group'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => toggleGroupScan(group.key)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '6px',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                </button>
                              </div>
                            </div>

                            {/* Group Environments List */}
                            {!isCollapsed && (
                              <div style={{ padding: '8px 16px 20px 28px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.03)' }}>
                                {group.envs.map((item) => {
                                  const tag = getEnvTag(item);
                                  const cardStyle = getCardStyles(item, theme);
                                  const isOrphaned = item.status?.toLowerCase() === 'stale' || item.status?.toLowerCase() === 'orphaned';

                                  return (
                                    <div
                                      key={item.name}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                        padding: '20px 18px 16px 18px',
                                        borderRadius: '10px',
                                        border: `1px solid ${cardStyle.border}`,
                                        borderLeft: `4px solid ${cardStyle.color}`,
                                        background: cardStyle.background,
                                        transition: 'all 0.25s ease',
                                        gap: '12px',
                                        position: 'relative'
                                      }}
                                    >
                                      {/* Block 1: Basic Info Block */}
                                      <div style={{
                                        background: theme === 'light' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        position: 'relative'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                                            {/* Env Tag */}
                                            <span style={{
                                              fontSize: '0.68rem',
                                              fontWeight: 700,
                                              color: tag.color,
                                              background: tag.bg,
                                              border: `1px solid ${tag.border}`,
                                              width: '46px',
                                              height: '22px',
                                              borderRadius: '4px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              letterSpacing: '0.04em',
                                              flexShrink: 0
                                            }}>
                                              {tag.label}
                                            </span>

                                            {/* Name & Domain Details */}
                                            <div>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {item.type === 'frontend' ? (
                                                  <Globe size={12} style={{ color: 'var(--accent-purple)', opacity: 0.8, flexShrink: 0 }} />
                                                ) : item.type === 'vm' ? (
                                                  <Server size={12} style={{ color: '#f59e0b', opacity: 0.8, flexShrink: 0 }} />
                                                ) : (
                                                  <Cpu size={12} style={{ color: 'var(--accent-teal)', opacity: 0.8, flexShrink: 0 }} />
                                                )}
                                                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>

                                                {item.license_frozen === 1 && (
                                                  <span style={{
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    color: '#ef4444',
                                                    background: 'rgba(239, 68, 68, 0.12)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center'
                                                  }} title="Environment frozen. Decommission or upgrade to manage.">
                                                    🔒 FROZEN
                                                  </span>
                                                )}

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

                                                {/* Multi-CI/CD Conflict Badge */}
                                                {hasCiCdConflict(item) && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setConflictDrawerApp(item); }}
                                                    style={{
                                                      fontSize: '0.62rem',
                                                      fontWeight: 700,
                                                      color: '#f59e0b',
                                                      background: 'rgba(245, 158, 11, 0.15)',
                                                      padding: '2px 7px',
                                                      borderRadius: '4px',
                                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      cursor: 'pointer'
                                                    }}
                                                    title="Multiple active CI/CD pipelines detected for this codebase - click to resolve"
                                                  >
                                                    <ShieldAlert size={10} /> Multi-CI/CD Conflict
                                                  </button>
                                                )}

                                                {/* Provider Badge */}
                                                {(() => {
                                                  const prov = resolveAppProvider(item);
                                                  if (prov === 'azure_devops') {
                                                    return (
                                                      <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.14)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.35)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <Layers size={10} /> Azure DevOps
                                                      </span>
                                                    );
                                                  }
                                                  if (prov === 'github_actions') {
                                                    return (
                                                      <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.14)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <GitBranch size={10} /> GitHub Actions
                                                      </span>
                                                    );
                                                  }
                                                  if (prov === 'evaops_native') {
                                                    return (
                                                      <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '4px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.15) 100%)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.4)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <EvaForgeIcon size={10} /> EvaForge
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.5rem', fontWeight: 900, padding: '1px 5px', borderRadius: '3px', background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(139,92,246,0.25))', border: '1px solid rgba(168,85,247,0.6)', color: '#9333ea', letterSpacing: '0.08em', textTransform: 'uppercase' }}>BETA</span>
                                                      </span>
                                                    );
                                                  }
                                                  return (
                                                    <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.12)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                      <Globe size={10} /> Unconfigured
                                                    </span>
                                                  );
                                                })()}
                                                {isOrphaned && (
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                      fontSize: '0.62rem',
                                                      fontWeight: 700,
                                                      textTransform: 'uppercase',
                                                      color: 'var(--error)',
                                                      background: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
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
                                                          handleDeleteApp(item.name, item.type as 'frontend' | 'backend');
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
                                              {item.dnsDetails?.fqdn && (() => {
                                                const fqdns = Array.isArray(item.dnsDetails.fqdns)
                                                  ? item.dnsDetails.fqdns
                                                  : (typeof item.dnsDetails.fqdns === 'string' && item.dnsDetails.fqdns
                                                    ? [item.dnsDetails.fqdns]
                                                    : [item.dnsDetails.fqdn]);
                                                return (
                                                  <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                                    <Globe size={12} style={{ opacity: 0.7, color: 'var(--accent-purple)', flexShrink: 0 }} />
                                                    <span>Domains: </span>
                                                    {fqdns.map((fqdn: string, idx: number) => (
                                                      <span key={fqdn}>
                                                        <a
                                                          href={`https://${fqdn}`}
                                                          target="_blank"
                                                          rel="noreferrer"
                                                          style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}
                                                        >
                                                          {fqdn}
                                                        </a>
                                                        {idx < fqdns.length - 1 && ', '}
                                                      </span>
                                                    ))}
                                                  </div>
                                                );
                                              })()}
                                              {item.repositoryUrl && (
                                                <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                                  <Github size={12} style={{ opacity: 0.7, color: 'var(--accent-blue)', flexShrink: 0 }} />
                                                  <span>GitHub: <a
                                                    href={item.repositoryUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}
                                                  >
                                                    {item.repositoryUrl.replace('https://github.com/', '')}
                                                  </a></span>
                                                </div>
                                              )}

                                              {/* Branch Details */}
                                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                                <GitBranch size={12} style={{ opacity: 0.7, color: 'var(--accent-purple)', flexShrink: 0 }} />
                                                <span>Branch: <strong style={{ color: 'var(--text-primary)' }}>{resolveBranchName(item)}</strong></span>
                                                {item.pipelineRun && isBuildActive(item.pipelineRun) && (() => {
                                                  const isQueued = ['notstarted', 'queued', 'waiting'].includes((item.pipelineRun.state || '').toLowerCase());
                                                  if (isQueued) {
                                                    return (
                                                      <>
                                                        <span style={{
                                                          marginLeft: '8px',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '4px',
                                                          color: '#f59e0b',
                                                          fontWeight: 600,
                                                          fontSize: '0.68rem',
                                                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                          padding: '1px 6px',
                                                          borderRadius: '4px',
                                                          border: '1px solid rgba(245, 158, 11, 0.2)'
                                                        }}>
                                                          <Clock size={10} />
                                                          Build queued...
                                                        </span>
                                                        {item.pipelineRun.queuePosition != null && (
                                                          <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px',
                                                            color: '#f59e0b',
                                                            fontWeight: 800,
                                                            fontSize: '0.64rem',
                                                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                                            padding: '1px 7px',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                                            letterSpacing: '0.02em'
                                                          }}>
                                                            Queue #{item.pipelineRun.queuePosition}
                                                          </span>
                                                        )}
                                                        {!isViewer && item.pipelineId && item.pipelineRun && (
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handlePrioritizeBuild(item.pipelineId, item.pipelineRun.id);
                                                            }}
                                                            disabled={prioritizingBuildId === item.pipelineRun.id}
                                                            style={{
                                                              marginLeft: '6px',
                                                              display: 'inline-flex',
                                                              alignItems: 'center',
                                                              gap: '2px',
                                                              color: '#fbbf24',
                                                              backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                                              border: '1px solid rgba(245, 158, 11, 0.25)',
                                                              padding: '1px 6px',
                                                              borderRadius: '4px',
                                                              fontSize: '0.66rem',
                                                              fontWeight: 700,
                                                              cursor: 'pointer',
                                                              transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.08)'; }}
                                                          >
                                                            ⚡ Prioritize
                                                          </button>
                                                        )}
                                                      </>
                                                    );
                                                  }
                                                  return (
                                                    <span style={{
                                                      marginLeft: '8px',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      color: 'var(--accent-purple)',
                                                      fontWeight: 600,
                                                      fontSize: '0.68rem',
                                                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                      padding: '1px 6px',
                                                      borderRadius: '4px',
                                                      border: '1px solid rgba(139, 92, 246, 0.2)'
                                                    }}>
                                                      <RefreshCw size={10} className="spin-anim" />
                                                      Build in progress...
                                                    </span>
                                                  );
                                                })()}
                                                {item.pipelineId && !item.pipelineRun && !loadedPipelines[item.pipelineId] && (
                                                  <span style={{
                                                    marginLeft: '8px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    color: 'var(--accent-purple)',
                                                    fontWeight: 500,
                                                    fontSize: '0.68rem'
                                                  }}>
                                                    <RefreshCw size={10} className="spin-anim" />
                                                    loading status...
                                                  </span>
                                                )}
                                              </div>

                                              {/* Pipeline Details */}
                                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                                <Server size={12} style={{ opacity: 0.7, color: 'var(--accent-teal)', flexShrink: 0 }} />
                                                <span>Pipeline: <strong style={{ color: 'var(--success)' }}>
                                                  {(() => {
                                                    const prov = resolveAppProvider(item);
                                                    if (prov === 'github_actions') return `GitHub Actions (${item.name})`;
                                                    if (prov === 'evaops_native') return `⚡ EvaForge Engine (${item.name})`;
                                                    return item.pipelineName || `Azure DevOps (${item.name})`;
                                                  })()}
                                                </strong></span>
                                                {item.pipelineId && onShowBuildHistory && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onShowBuildHistory(item); }}
                                                    style={{
                                                      background: 'none',
                                                      color: 'var(--text-secondary)',
                                                      cursor: 'pointer',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      padding: '2px 6px',
                                                      borderRadius: '4px',
                                                      fontSize: '0.66rem',
                                                      border: '1px solid var(--glass-border)',
                                                      marginLeft: '8px',
                                                      transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
                                                    title="View build history & revisions"
                                                  >
                                                    <Clock size={10} />
                                                    <span>History</span>
                                                  </button>
                                                )}
                                                {hasCiCdConflict(item) && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setConflictDrawerApp(item); }}
                                                    title="Multi-CI/CD Conflict Detected — Click to resolve"
                                                    style={{
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '4px',
                                                      marginLeft: '8px',
                                                      padding: '2px 7px',
                                                      borderRadius: '6px',
                                                      fontSize: '0.66rem',
                                                      fontWeight: 700,
                                                      background: 'rgba(245, 158, 11, 0.15)',
                                                      color: '#f59e0b',
                                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                                      cursor: 'pointer',
                                                      animation: 'pulse 2s infinite'
                                                    }}
                                                  >
                                                    <ShieldAlert size={10} />
                                                    <span>Multi-CI/CD Conflict</span>
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {(() => {
                                            const statusInfo = getStatusDetails(item.status, item.type);
                                            const isLight = theme === 'light';

                                            let pillBg = '#1e293b';
                                            let pillBorder = '#334155';
                                            let pillText = '#94a3b8';

                                            if (statusInfo.color === '#10b981') {
                                              pillBg = isLight ? '#d1fae5' : '#064e3b';
                                              pillBorder = isLight ? '#10b981' : '#059669';
                                              pillText = isLight ? '#065f46' : '#a7f3d0';
                                            } else if (statusInfo.color === '#ef4444') {
                                              pillBg = isLight ? '#fee2e2' : '#7f1d1d';
                                              pillBorder = isLight ? '#ef4444' : '#dc2626';
                                              pillText = isLight ? '#991b1b' : '#fca5a5';
                                            } else {
                                              pillBg = isLight ? '#fef3c7' : '#78350f';
                                              pillBorder = isLight ? '#f59e0b' : '#d97706';
                                              pillText = isLight ? '#78350f' : '#fde68a';
                                            }

                                            return (
                                              <div style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '16px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                backgroundColor: pillBg,
                                                border: `1px solid ${pillBorder}`,
                                                zIndex: 10
                                              }} title={`Status: ${statusInfo.label}`}>
                                                <span style={{
                                                  width: '6px',
                                                  height: '6px',
                                                  borderRadius: '50%',
                                                  backgroundColor: statusInfo.color,
                                                  boxShadow: `0 0 6px ${statusInfo.color}`,
                                                  display: 'inline-block'
                                                }} />
                                                <span style={{
                                                  fontSize: '0.68rem',
                                                  color: pillText,
                                                  fontWeight: 700,
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.05em'
                                                }}>{statusInfo.label}</span>
                                              </div>
                                            );
                                          })()}
                                        </div> {/* End Header Row */}

                                        {/* Action Buttons & Decluttered controls (Restructured into Upper Section) */}
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>

                                          {/* Primary Browse Link (Only SWAs/ACAs with hostnames) */}
                                          {item.hostname && item.type !== 'vm' && (
                                            <a
                                              href={item.dnsDetails?.fqdn ? `https://${item.dnsDetails.fqdn}` : `https://${item.hostname}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="btn-secondary"
                                              style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none' }}
                                            >
                                              <Globe size={12} />
                                              Browse
                                            </a>
                                          )}

                                          {/* Blue-Green routing switch for ACA & CNAME swap config for SWA */}
                                          {item.type !== 'vm' && (
                                            item.type === 'backend' ? (
                                              <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                padding: '3px 6px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--glass-border)'
                                              }}>
                                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', padding: '0 4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>B/G Mode:</span>
                                                <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '6px', padding: '2px' }}>
                                                  <button
                                                    type="button"
                                                    disabled={isViewer || item.license_frozen === 1}
                                                    onClick={async (e) => {
                                                      e.stopPropagation();
                                                      await handleToggleRevisionMode(item.name, 'Single');
                                                    }}
                                                    style={{
                                                      padding: '4px 10px',
                                                      fontSize: '0.66rem',
                                                      fontWeight: 700,
                                                      borderRadius: '4px',
                                                      border: 'none',
                                                      backgroundColor: (isViewer || item.license_frozen === 1) ? 'transparent' : (bgModeState[item.name] !== 'Multiple' && item.status !== 'multiple') ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                                                      color: (isViewer || item.license_frozen === 1) ? 'rgba(255,255,255,0.35)' : (bgModeState[item.name] !== 'Multiple' && item.status !== 'multiple') ? '#fff' : 'var(--text-secondary)',
                                                      cursor: (isViewer || item.license_frozen === 1) ? 'not-allowed' : 'pointer',
                                                      opacity: (isViewer || item.license_frozen === 1) ? 0.35 : 1,
                                                      transition: 'all 0.2s ease'
                                                    }}
                                                    title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                  >
                                                    Single
                                                  </button>
                                                  <button
                                                    type="button"
                                                    disabled={isViewer || item.license_frozen === 1}
                                                    onClick={async (e) => {
                                                      e.stopPropagation();
                                                      await handleToggleRevisionMode(item.name, 'Multiple');
                                                      setBgDrawerApp(item);
                                                      fetchRevisions(item);
                                                    }}
                                                    style={{
                                                      padding: '4px 10px',
                                                      fontSize: '0.66rem',
                                                      fontWeight: 700,
                                                      borderRadius: '4px',
                                                      border: 'none',
                                                      backgroundColor: (isViewer || item.license_frozen === 1) ? 'transparent' : (bgModeState[item.name] === 'Multiple' || item.status === 'multiple') ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                                                      color: (isViewer || item.license_frozen === 1) ? 'rgba(255,255,255,0.35)' : (bgModeState[item.name] === 'Multiple' || item.status === 'multiple') ? '#fff' : 'var(--text-secondary)',
                                                      cursor: (isViewer || item.license_frozen === 1) ? 'not-allowed' : 'pointer',
                                                      opacity: (isViewer || item.license_frozen === 1) ? 0.35 : 1,
                                                      transition: 'all 0.2s ease'
                                                    }}
                                                    title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                  >
                                                    Multi
                                                  </button>
                                                </div>
                                                <button
                                                  type="button"
                                                  className="btn-secondary"
                                                  disabled={item.license_frozen === 1}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBgDrawerApp(item);
                                                    fetchRevisions(item);
                                                  }}
                                                  style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '6px',
                                                    padding: 0,
                                                    border: 'none',
                                                    background: item.license_frozen === 1 ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.04)',
                                                    cursor: item.license_frozen === 1 ? 'not-allowed' : 'pointer',
                                                    opacity: item.license_frozen === 1 ? 0.35 : 1
                                                  }}
                                                  title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : "Configure Traffic Split"}
                                                >
                                                  <Sliders size={11} style={{ color: item.license_frozen === 1 ? 'rgba(255,255,255,0.25)' : 'var(--accent-purple)' }} />
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                disabled={item.license_frozen === 1}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setBgDrawerApp(item);
                                                  fetchRevisions(item);
                                                }}
                                                style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '6px',
                                                  padding: '5px 12px',
                                                  fontSize: '0.7rem',
                                                  borderRadius: '8px',
                                                  fontWeight: 700,
                                                  backgroundColor: item.license_frozen === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(139, 92, 246, 0.08)',
                                                  border: item.license_frozen === 1 ? '1px dashed var(--glass-border)' : '1px solid rgba(139, 92, 246, 0.2)',
                                                  color: item.license_frozen === 1 ? 'var(--text-muted)' : 'var(--accent-purple, #8b5cf6)',
                                                  transition: 'all 0.2s ease',
                                                  cursor: item.license_frozen === 1 ? 'not-allowed' : 'pointer',
                                                  opacity: item.license_frozen === 1 ? 0.35 : 1
                                                }}
                                                title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : "Configure B/G Swap"}
                                              >
                                                <GitCompare size={12} />
                                                Configure B/G Swap
                                              </button>
                                            )
                                          )}

                                          {/* Power Controls — Status Dropdown */}
                                          {(() => {
                                            const isCritical = item.name.toLowerCase().includes('evaops') ||
                                              item.name.toLowerCase().includes('devops-backend') ||
                                              item.name.toLowerCase().includes('devops-frontend');
                                            const isControlling = controllingResource === item.name;
                                            const s = (item.status || '').toLowerCase();
                                            const isStarted = s === 'running' || s === 'deployed';
                                            const isStopped = s === 'stopped' || s === 'sleep' || s === 'offline';
                                            const isOpen = activePowerDropdown === item.name;
                                            const isDisabled = isViewer || isControlling || item.license_frozen === 1;

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
                                            const startDis = isViewer || isControlling || isStarted || isCritical || item.license_frozen === 1;
                                            const restartDis = isViewer || isControlling || isStopped || isCritical || item.license_frozen === 1;
                                            const stopDis = isViewer || isControlling || isStopped || isCritical || item.license_frozen === 1;

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
                                                    backgroundColor: (isViewer || item.license_frozen === 1) ? (theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)') : btnBg,
                                                    color: (isViewer || item.license_frozen === 1) ? (theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)') : btnColor,
                                                    border: (isViewer || item.license_frozen === 1) ? '1px dashed var(--glass-border)' : `1px solid ${btnBorder}`,
                                                    fontSize: '0.72rem', fontWeight: 700,
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    opacity: (isViewer || item.license_frozen === 1) ? 0.35 : 1
                                                  }}
                                                  title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
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
                                          })()}

                                          {/* Decluttered Actions Dropdown Menu */}
                                          <div style={{ position: 'relative' }}>
                                            <button
                                              type="button"
                                              className="btn-secondary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (activeDropdown === item.name) {
                                                  setActiveDropdown(null);
                                                  setDropdownCoords(null);
                                                } else {
                                                  const rect = e.currentTarget.getBoundingClientRect();
                                                  setDropdownCoords({ top: rect.bottom + 6, left: rect.right - 170 });
                                                  setActiveDropdown(item.name);
                                                }
                                              }}
                                              style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                                              title="Operations & Actions"
                                            >
                                              <MoreVertical size={14} />
                                            </button>

                                            {activeDropdown === item.name && dropdownCoords && (
                                              <>
                                                <div
                                                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setDropdownCoords(null); }}
                                                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998, cursor: 'default' }}
                                                />
                                                <div style={{
                                                  position: 'fixed',
                                                  top: dropdownCoords.top,
                                                  left: Math.max(8, dropdownCoords.left),
                                                  backgroundColor: 'var(--bg-secondary, #0f172a)',
                                                  border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                                                  borderRadius: '8px',
                                                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                                  zIndex: 9999,
                                                  minWidth: '170px',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  padding: '4px 0',
                                                  overflow: 'hidden'
                                                }}>
                                                  <button
                                                    type="button"
                                                    disabled={item.license_frozen === 1}
                                                    onClick={(e) => { e.stopPropagation(); openDnsModal(item); setActiveDropdown(null); setDropdownCoords(null); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: item.license_frozen === 1 ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: item.license_frozen === 1 ? 'not-allowed' : 'pointer', opacity: item.license_frozen === 1 ? 0.35 : 1 }}
                                                    title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                    onMouseEnter={(e) => { if (item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                                    onMouseLeave={(e) => { if (item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                  >
                                                    <Globe size={12} style={{ color: item.license_frozen === 1 ? 'rgba(255,255,255,0.25)' : 'var(--accent-purple)' }} />
                                                    <span>DNS Settings</span>
                                                  </button>

                                                  {(item.pipelineId || (item as any).provider || item.repositoryUrl) ? (
                                                    <a
                                                      href={item.license_frozen === 1 ? undefined : (() => {
                                                        const pid = String(item.pipelineId || '');
                                                        if (pid.startsWith('github-actions:')) {
                                                          const repoPath = pid.split(':').slice(1).join(':');
                                                          if (item.pipelineRun?.webUrl) {
                                                            return item.pipelineRun.webUrl;
                                                          }
                                                          return `https://github.com/${repoPath}/actions`;
                                                        }
                                                        if (item.pipelineRun?.webUrl) {
                                                          try {
                                                            const url = new URL(item.pipelineRun.webUrl);
                                                            const parts = url.pathname.split('/');
                                                            const buildIndex = parts.indexOf('_build');
                                                            if (buildIndex !== -1) {
                                                              const basePath = parts.slice(0, buildIndex + 1).join('/');
                                                              return `${url.origin}${basePath}?definitionId=${item.pipelineId}`;
                                                            }
                                                          } catch (e) {
                                                            console.warn('Failed to parse webUrl:', e);
                                                          }
                                                        }
                                                        const baseOrg = (azureDevopsOrgUrl || 'https://dev.azure.com/esteviatech').replace(/\/$/, '');
                                                        const baseProj = azureDevopsProject || 'Estevia-Platform';
                                                        return `${baseOrg}/${baseProj}/_build?definitionId=${item.pipelineId}`;
                                                      })()}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', color: item.license_frozen === 1 ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textDecoration: 'none', boxSizing: 'border-box', pointerEvents: item.license_frozen === 1 ? 'none' : 'auto', opacity: item.license_frozen === 1 ? 0.35 : 1 }}
                                                      title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                      onClick={() => setActiveDropdown(null)}
                                                      onMouseEnter={(e) => { if (item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                                      onMouseLeave={(e) => { if (item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                      <GitBranch size={12} style={{ color: item.license_frozen === 1 ? 'rgba(255,255,255,0.25)' : 'var(--accent-teal)' }} />
                                                      <span>View CI/CD Pipeline</span>
                                                    </a>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      disabled={isViewer || item.license_frozen === 1}
                                                      onClick={(e) => { e.stopPropagation(); openPipelineModal(item, group); setActiveDropdown(null); }}
                                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: (isViewer || item.license_frozen === 1) ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: (isViewer || item.license_frozen === 1) ? 'not-allowed' : 'pointer', opacity: (isViewer || item.license_frozen === 1) ? 0.35 : 1 }}
                                                      title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                      onMouseEnter={(e) => { if (!isViewer && item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                                      onMouseLeave={(e) => { if (!isViewer && item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                      <PlusCircle size={12} style={{ color: (isViewer || item.license_frozen === 1) ? 'rgba(255,255,255,0.25)' : 'var(--accent-purple)' }} />
                                                      <span>Setup CI/CD</span>
                                                    </button>
                                                  )}

                                                  {item.type === 'backend' && onShowLogs && (
                                                    <button
                                                      type="button"
                                                      disabled={item.license_frozen === 1}
                                                      onClick={(e) => { e.stopPropagation(); onShowLogs(item.name); setActiveDropdown(null); }}
                                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: item.license_frozen === 1 ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: item.license_frozen === 1 ? 'not-allowed' : 'pointer', opacity: item.license_frozen === 1 ? 0.35 : 1 }}
                                                      title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                      onMouseEnter={(e) => { if (item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                                                      onMouseLeave={(e) => { if (item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'transparent' }}
                                                    >
                                                      <Terminal size={12} style={{ color: item.license_frozen === 1 ? 'rgba(255,255,255,0.25)' : 'var(--accent-blue)' }} />
                                                      <span>View Logs</span>
                                                    </button>
                                                  )}

                                                  {onCloneApp && (
                                                    <button
                                                      type="button"
                                                      disabled={isViewer || item.license_frozen === 1}
                                                      onClick={(e) => { e.stopPropagation(); onCloneApp(item); setActiveDropdown(null); }}
                                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: (isViewer || item.license_frozen === 1) ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: (isViewer || item.license_frozen === 1) ? 'not-allowed' : 'pointer', opacity: (isViewer || item.license_frozen === 1) ? 0.35 : 1 }}
                                                      title={item.license_frozen === 1 ? "Environment frozen. Decommission or upgrade to manage." : undefined}
                                                      onMouseEnter={(e) => { if (!isViewer && item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                                      onMouseLeave={(e) => { if (!isViewer && item.license_frozen !== 1) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                      <GitBranch size={12} style={{ color: (isViewer || item.license_frozen === 1) ? 'rgba(255,255,255,0.25)' : 'var(--success)' }} />
                                                      <span>Clone App</span>
                                                    </button>
                                                  )}

                                                  {item.type !== 'vm' && <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '4px 0' }} />}

                                                  {!isOrphaned && item.type !== 'vm' && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => { e.stopPropagation(); handleDeleteApp(item.name, item.type as 'frontend' | 'backend'); setActiveDropdown(null); }}
                                                      disabled={isViewer || deletingAppName === item.name}
                                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: (isViewer || deletingAppName === item.name) ? 'rgba(255,255,255,0.35)' : 'var(--error)', width: '100%', textAlign: 'left', cursor: (isViewer || deletingAppName === item.name) ? 'not-allowed' : 'pointer', opacity: (isViewer || deletingAppName === item.name) ? 0.35 : 1 }}
                                                      onMouseEnter={(e) => { if (!isViewer && deletingAppName !== item.name) e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                                                      onMouseLeave={(e) => { if (!isViewer && deletingAppName !== item.name) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    >
                                                      <Trash2 size={12} style={{ color: (isViewer || deletingAppName === item.name) ? 'rgba(255,255,255,0.35)' : 'var(--error)' }} />
                                                      <span>Delete app</span>
                                                    </button>
                                                  )}
                                                </div>
                                              </>
                                            )}
                                          </div>

                                        </div>
                                      </div> {/* End Block 1 */}

                                      {/* Block 2: Security & Code Sanity Block */}
                                      {item.type !== 'vm' && (
                                        <div style={{
                                          background: theme === 'light'
                                            ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.04) 0%, rgba(20, 184, 166, 0.01) 100%)'
                                            : 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(20, 184, 166, 0.01) 100%)',
                                          border: theme === 'light' ? '1px solid rgba(20, 184, 166, 0.18)' : '1px solid rgba(20, 184, 166, 0.15)',
                                          borderRadius: '12px',
                                          padding: '16px',
                                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '12px',
                                          width: '100%',
                                          boxSizing: 'border-box'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <ShieldCheck size={14} style={{ color: 'var(--accent-teal)' }} />
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                              Security & Code Sanity scan
                                            </span>
                                          </div>

                                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>

                                            {/* VNet and Network Connectivity Card (Premium Glassmorphic Layout) */}
                                            {(() => {
                                              const validation = checkNetworkWarnings(item, group);
                                              if (!validation) return null;
                                              const pillIcon = validation.status === 'verified'
                                                ? <ShieldCheck size={11} />
                                                : validation.status === 'warning'
                                                  ? <AlertTriangle size={11} />
                                                  : validation.status === 'info'
                                                    ? <Info size={11} />
                                                    : <AlertCircle size={11} />;
                                              const pillStyles = validation.status === 'verified'
                                                ? { background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981' }
                                                : validation.status === 'warning'
                                                  ? { background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#fbbf24' }
                                                  : validation.status === 'info'
                                                    ? { background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', color: '#38bdf8' }
                                                    : { background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)', color: '#ef4444' };

                                              return (
                                                <div style={{
                                                  flex: 2,
                                                  minWidth: '320px',
                                                  padding: '8px 12px',
                                                  borderRadius: '10px',
                                                  background: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                                                  border: '1px solid var(--glass-border)',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '6px',
                                                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                                                  backdropFilter: 'blur(8px)',
                                                  WebkitBackdropFilter: 'blur(8px)'
                                                }}>
                                                  {/* VNet Name Row */}
                                                  <div style={{
                                                    fontSize: '0.72rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '8px',
                                                    fontWeight: 400,
                                                    color: 'var(--text-secondary)'
                                                  }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                      <Network size={11} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                                      <span>VNet / VPC:</span>
                                                    </div>
                                                    <strong style={{
                                                      color: 'var(--text-primary)',
                                                      background: 'rgba(255, 255, 255, 0.06)',
                                                      padding: '2px 6px',
                                                      borderRadius: '4px',
                                                      fontSize: '0.68rem',
                                                      fontWeight: 600,
                                                      border: '1px solid rgba(255, 255, 255, 0.05)'
                                                    }}>
                                                      {getVnetName(item) || 'None (Public Cloud)'}
                                                    </strong>
                                                  </div>

                                                  {/* Network Connection Status Row */}
                                                  <div style={{
                                                    fontSize: '0.72rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '8px',
                                                    fontWeight: 400,
                                                    color: 'var(--text-secondary)',
                                                    marginTop: '2px'
                                                  }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                      <ShieldCheck size={11} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                                      <span>Network Status:</span>
                                                    </div>
                                                    <span style={{
                                                      ...pillStyles,
                                                      padding: '2px 8px',
                                                      borderRadius: '10px',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '5px',
                                                      fontSize: '0.68rem',
                                                      fontWeight: 600,
                                                      whiteSpace: 'nowrap'
                                                    }}>
                                                      {pillIcon}
                                                      <span>{validation.message}</span>
                                                    </span>
                                                  </div>

                                                  {(() => {
                                                    const isLt = theme === 'light';
                                                    const isWarn = validation.status === 'warning';
                                                    const isVerified = validation.status === 'verified';

                                                    // Only show expander if there's details or if verified and has a sourceFile
                                                    if (isVerified && !validation.sourceFile) return null;

                                                    const toggleColor = isVerified
                                                      ? (isLt ? '#059669' : '#a7f3d0')
                                                      : isWarn
                                                        ? (isLt ? '#dc2626' : '#fca5a5')
                                                        : (isLt ? '#4b5563' : '#cbd5e1');
                                                    return (
                                                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', alignItems: 'center', gap: '6px' }}>
                                                        {isVerified && (
                                                          <span style={{ fontSize: '0.62rem', color: isLt ? '#059669' : '#34d399', opacity: 0.85, fontWeight: 500 }}>
                                                            via {validation.sourceFile}
                                                          </span>
                                                        )}
                                                        <button
                                                          onClick={() => setExpandedWarnings(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                                                          style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            padding: '2px 0px',
                                                            fontSize: '0.62rem',
                                                            color: toggleColor,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '3px',
                                                            textDecoration: 'underline',
                                                            fontWeight: 500,
                                                            transition: 'opacity 0.2s'
                                                          }}
                                                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                                                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                          <span>{expandedWarnings[item.name] ? 'Hide Verification Details' : 'View Verification Details ➔'}</span>
                                                        </button>
                                                      </div>
                                                    );
                                                  })()}

                                                  {expandedWarnings[item.name] && (() => {
                                                    const isLt = theme === 'light';
                                                    const isWarn = validation.status === 'warning';
                                                    const isVerified = validation.status === 'verified';
                                                    // Theme-aware colors
                                                    const bannerBg = isVerified
                                                      ? (isLt
                                                        ? 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(16,185,129,0.03) 100%)'
                                                        : 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)')
                                                      : isWarn
                                                        ? (isLt
                                                          ? 'linear-gradient(135deg, rgba(220,38,38,0.07) 0%, rgba(220,38,38,0.03) 100%)'
                                                          : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)')
                                                        : (isLt
                                                          ? 'linear-gradient(135deg, rgba(100,116,139,0.07) 0%, rgba(100,116,139,0.03) 100%)'
                                                          : 'linear-gradient(135deg, rgba(148,163,184,0.08) 0%, rgba(148,163,184,0.03) 100%)');

                                                    const bannerBorderLeft = isVerified
                                                      ? (isLt ? '3px solid #059669' : '3px solid #34d399')
                                                      : isWarn
                                                        ? (isLt ? '3px solid #dc2626' : '3px solid #f87171')
                                                        : (isLt ? '3px solid #64748b' : '3px solid #94a3b8');
                                                    const bannerEdge = isLt
                                                      ? '1px solid rgba(0,0,0,0.06)'
                                                      : '1px solid rgba(255,255,255,0.02)';
                                                    const bannerText = isVerified
                                                      ? (isLt ? '#065f46' : '#a7f3d0')
                                                      : isWarn
                                                        ? (isLt ? '#991b1b' : '#fca5a5')
                                                        : (isLt ? '#374151' : '#cbd5e1');
                                                    const headerColor = isVerified
                                                      ? (isLt ? '#047857' : '#34d399')
                                                      : isWarn
                                                        ? (isLt ? '#b91c1c' : '#f87171')
                                                        : (isLt ? '#4b5563' : '#94a3b8');
                                                    const btnBg = isLt ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)';
                                                    const btnBgHover = isLt ? 'rgba(0,0,0,0.13)' : 'rgba(255,255,255,0.15)';
                                                    const btnBorder = isLt ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.15)';
                                                    const hasSearchedFiles = validation.scrapedSearchedFiles && validation.scrapedSearchedFiles.length > 0;
                                                    return (
                                                      <div style={{
                                                        fontSize: '0.66rem',
                                                        marginTop: '6px',
                                                        padding: '8px 10px',
                                                        borderRadius: '6px',
                                                        background: bannerBg,
                                                        borderLeft: bannerBorderLeft,
                                                        borderTop: bannerEdge,
                                                        borderRight: bannerEdge,
                                                        borderBottom: bannerEdge,
                                                        color: bannerText,
                                                        lineHeight: 1.45,
                                                        boxShadow: isLt ? '0 2px 8px rgba(0,0,0,0.06)' : '0 4px 12px rgba(0,0,0,0.15)',
                                                        letterSpacing: '0.015em'
                                                      }}>
                                                        {/* Header row: label + "View Scraped Config" button */}
                                                        <div style={{
                                                          fontWeight: 700,
                                                          marginBottom: '3px',
                                                          color: headerColor,
                                                          textTransform: 'uppercase',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'space-between',
                                                          gap: '4px',
                                                          flexWrap: 'wrap'
                                                        }}>
                                                          <span>{isVerified ? '✅ Network Resolution:' : '⚠️ Network Resolution:'}</span>
                                                          {(validation.sourceFile || validation.scrapedSearchedFiles) && (
                                                            <button
                                                              onClick={() => setViewScrapedConfig({
                                                                fileName: validation.sourceFile || 'unknown file',
                                                                fileContent: validation.sourceContent || 'no content',
                                                                appName: validation.sourceAppName || item.name,
                                                                searchedFiles: validation.scrapedSearchedFiles
                                                              })}
                                                              onMouseEnter={(e) => e.currentTarget.style.background = btnBgHover}
                                                              onMouseLeave={(e) => e.currentTarget.style.background = btnBg}
                                                              style={{
                                                                background: btnBg,
                                                                border: btnBorder,
                                                                color: bannerText,
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.6rem',
                                                                fontWeight: 700,
                                                                transition: 'all 0.15s ease'
                                                              }}
                                                            >
                                                              View Scraped Config
                                                            </button>
                                                          )}
                                                        </div>
                                                        {/* Error/Warning Detail text */}
                                                        <div style={{ fontWeight: 500 }}>
                                                          {validation.detail}
                                                        </div>
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              );
                                            })()}

                                            {/* YAML Health Details Card */}
                                            {((item.type === 'frontend' || item.type === 'backend') && health && health.ymlHealth) && (
                                              <div
                                                style={{
                                                  flex: 1,
                                                  minWidth: '180px',
                                                  padding: '8px 12px',
                                                  borderRadius: '10px',
                                                  background: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                                                  border: '1px solid var(--glass-border)',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '4px',
                                                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                                                  backdropFilter: 'blur(8px)',
                                                  WebkitBackdropFilter: 'blur(8px)',
                                                  fontSize: '0.72rem',
                                                  cursor: 'pointer',
                                                  transition: 'all 0.2s ease',
                                                  userSelect: 'none'
                                                }}
                                                onClick={() => setExpandedYamlDetails(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                                                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                    <Terminal size={11} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                                    <span>YAML validation:</span>
                                                  </div>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {!health.ymlHealth.exists ? (
                                                      <span style={{
                                                        background: theme === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                                        border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 600
                                                      }}>
                                                        <AlertCircle size={11} />
                                                        <span>Not Found</span>
                                                      </span>
                                                    ) : health.ymlHealth.valid ? (
                                                      health.ymlHealth.warningCount > 0 ? (
                                                        <span style={{
                                                          background: theme === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                                                          border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(245, 158, 11, 0.3)',
                                                          color: theme === 'light' ? '#b45309' : '#fbbf24',
                                                          padding: '2px 8px',
                                                          borderRadius: '10px',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '5px',
                                                          fontSize: '0.68rem',
                                                          fontWeight: 600,
                                                          whiteSpace: 'nowrap'
                                                        }}>
                                                          <AlertCircle size={11} />
                                                          <span>{health.ymlHealth.warningCount} warning{health.ymlHealth.warningCount > 1 ? 's' : ''}</span>
                                                          {!isViewer && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => { e.stopPropagation(); openPipelineModal(item, group); }}
                                                              style={{ background: 'none', border: 'none', color: theme === 'light' ? '#b45309' : '#fbbf24', textDecoration: 'underline', padding: 0, marginLeft: '6px', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 700 }}
                                                            >
                                                              Fix
                                                            </button>
                                                          )}
                                                        </span>
                                                      ) : (
                                                        <span style={{
                                                          background: theme === 'light' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(52, 211, 153, 0.12)',
                                                          border: theme === 'light' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(52, 211, 153, 0.3)',
                                                          color: theme === 'light' ? '#059669' : '#34d399',
                                                          padding: '2px 8px',
                                                          borderRadius: '10px',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '5px',
                                                          fontSize: '0.68rem',
                                                          fontWeight: 600
                                                        }}>
                                                          <ShieldCheck size={11} />
                                                          <span>Valid</span>
                                                        </span>
                                                      )
                                                    ) : (
                                                      <span style={{
                                                        background: theme === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                                        border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 600
                                                      }}>
                                                        <AlertCircle size={11} />
                                                        <span>{health.ymlHealth.errors?.length || 0} error{health.ymlHealth.errors?.length > 1 ? 's' : ''}</span>
                                                        {!isViewer && (
                                                          <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); openPipelineModal(item, group); }}
                                                            style={{ background: 'none', border: 'none', color: theme === 'light' ? '#b91c1c' : '#ef4444', textDecoration: 'underline', padding: 0, marginLeft: '6px', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 700 }}
                                                          >
                                                            Fix
                                                          </button>
                                                        )}
                                                      </span>
                                                    )}
                                                    <ChevronDown
                                                      size={12}
                                                      style={{
                                                        color: 'var(--text-secondary)',
                                                        transform: expandedYamlDetails[item.name] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s ease',
                                                        marginLeft: '2px'
                                                      }}
                                                    />
                                                  </div>
                                                </div>

                                                {expandedYamlDetails[item.name] && (
                                                  <div style={{
                                                    marginTop: '8px',
                                                    paddingTop: '8px',
                                                    borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    fontSize: '0.68rem',
                                                    color: 'var(--text-secondary)'
                                                  }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span>File Name:</span>
                                                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                        {health.ymlHealth.filePath ? (health.ymlHealth.filePath.split('/').pop() || 'Unknown') : 'Unknown'}
                                                      </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span>Full Path:</span>
                                                      <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', opacity: 0.8 }}>
                                                        {health.ymlHealth.filePath || 'Unknown'}
                                                      </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span>Validation Status:</span>
                                                      <span style={{
                                                        color: !health.ymlHealth.exists
                                                          ? (theme === 'light' ? '#b91c1c' : '#ef4444')
                                                          : !health.ymlHealth.valid
                                                            ? (theme === 'light' ? '#b91c1c' : '#ef4444')
                                                            : health.ymlHealth.warningCount > 0
                                                              ? (theme === 'light' ? '#b45309' : '#fbbf24')
                                                              : (theme === 'light' ? '#059669' : '#34d399'),
                                                        fontWeight: 700
                                                      }}>
                                                        {!health.ymlHealth.exists
                                                          ? 'Not Found'
                                                          : !health.ymlHealth.valid
                                                            ? 'Failed'
                                                            : health.ymlHealth.warningCount > 0
                                                              ? 'Passed with Warnings'
                                                              : 'Passed'}
                                                      </span>
                                                    </div>
                                                    {health.ymlHealth.errors && health.ymlHealth.errors.length > 0 && (
                                                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--error)' }}>Errors:</span>
                                                        {health.ymlHealth.errors.map((err: any, idx: number) => (
                                                          <div key={idx} style={{
                                                            background: theme === 'light' ? 'rgba(220, 38, 38, 0.04)' : 'rgba(239, 68, 68, 0.06)',
                                                            borderLeft: '2px solid var(--error)',
                                                            padding: '4px 6px',
                                                            borderRadius: '2px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.62rem'
                                                          }}>
                                                            {err.message || err}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                    {health.ymlHealth.warnings && health.ymlHealth.warnings.length > 0 && (
                                                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontWeight: 600, color: theme === 'light' ? '#b45309' : '#fbbf24' }}>Warnings:</span>
                                                        {health.ymlHealth.warnings.map((warn: any, idx: number) => (
                                                          <div key={idx} style={{
                                                            background: theme === 'light' ? 'rgba(245, 158, 11, 0.04)' : 'rgba(245, 158, 11, 0.06)',
                                                            borderLeft: `2px solid ${theme === 'light' ? '#b45309' : '#fbbf24'}`,
                                                            padding: '4px 6px',
                                                            borderRadius: '2px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.62rem'
                                                          }}>
                                                            {warn.message || warn}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}

                                                    {health.ymlHealth.exists && (
                                                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}`, paddingTop: '6px' }}>
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            const isGitHubAction = health.ymlHealth.filePath ? health.ymlHealth.filePath.includes('.github') : (item.pipelineId && String(item.pipelineId).startsWith('github-actions:'));
                                                            const provider = isGitHubAction ? 'github_actions' : 'azure_devops';
                                                            handleOpenFileDrawer(
                                                              item.name,
                                                              health.ymlHealth.filePath ? (health.ymlHealth.filePath.split('/').pop() || 'deploy.yml') : (isGitHubAction ? 'deploy.yml' : 'azure-pipelines.yml'),
                                                              health.ymlHealth.filePath || (isGitHubAction ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'),
                                                              'yaml',
                                                              item.repositoryUrl || group?.repoPath || '',
                                                              item.branch || 'main',
                                                              provider
                                                            );
                                                          }}
                                                          style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--accent-teal)',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                          }}
                                                        >
                                                          <span>View File ➔</span>
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Dockerfile Health Details Card */}
                                            {(item.type === 'backend' && health && health.dockerfileHealth) && (
                                              <div
                                                style={{
                                                  flex: 1,
                                                  minWidth: '180px',
                                                  padding: '8px 12px',
                                                  borderRadius: '10px',
                                                  background: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                                                  border: '1px solid var(--glass-border)',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '4px',
                                                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                                                  backdropFilter: 'blur(8px)',
                                                  WebkitBackdropFilter: 'blur(8px)',
                                                  fontSize: '0.72rem',
                                                  cursor: 'pointer',
                                                  transition: 'all 0.2s ease',
                                                  userSelect: 'none'
                                                }}
                                                onClick={() => setExpandedDockerDetails(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                                                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                    <Terminal size={11} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                                    <span>Dockerfile validation:</span>
                                                  </div>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {!health.dockerfileHealth.exists ? (
                                                      <span style={{
                                                        background: theme === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                                        border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 600
                                                      }}>
                                                        <AlertCircle size={11} />
                                                        <span>Not Found</span>
                                                      </span>
                                                    ) : health.dockerfileHealth.valid ? (
                                                      health.dockerfileHealth.warningCount > 0 ? (
                                                        <span style={{
                                                          background: theme === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                                                          border: theme === 'light' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(245, 158, 11, 0.3)',
                                                          color: theme === 'light' ? '#b45309' : '#fbbf24',
                                                          padding: '2px 8px',
                                                          borderRadius: '10px',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '5px',
                                                          fontSize: '0.68rem',
                                                          fontWeight: 600,
                                                          whiteSpace: 'nowrap'
                                                        }}>
                                                          <AlertCircle size={11} />
                                                          <span>{health.dockerfileHealth.warningCount} warning{health.dockerfileHealth.warningCount > 1 ? 's' : ''}</span>
                                                          {!isViewer && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => { e.stopPropagation(); openDockerfileEditor(item, group); }}
                                                              style={{ background: 'none', border: 'none', color: theme === 'light' ? '#b45309' : '#fbbf24', textDecoration: 'underline', padding: 0, marginLeft: '6px', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 700 }}
                                                            >
                                                              Fix
                                                            </button>
                                                          )}
                                                        </span>
                                                      ) : (
                                                        <span style={{
                                                          background: theme === 'light' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(52, 211, 153, 0.12)',
                                                          border: theme === 'light' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(52, 211, 153, 0.3)',
                                                          color: theme === 'light' ? '#059669' : '#34d399',
                                                          padding: '2px 8px',
                                                          borderRadius: '10px',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '5px',
                                                          fontSize: '0.68rem',
                                                          fontWeight: 600
                                                        }}>
                                                          <ShieldCheck size={11} />
                                                          <span>Valid</span>
                                                        </span>
                                                      )
                                                    ) : (
                                                      <span style={{
                                                        background: theme === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.12)',
                                                        border: theme === 'light' ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: theme === 'light' ? '#b91c1c' : '#ef4444',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 600
                                                      }}>
                                                        <AlertCircle size={11} />
                                                        <span>{health.dockerfileHealth.errors?.length || 0} error{health.dockerfileHealth.errors?.length > 1 ? 's' : ''}</span>
                                                        {!isViewer && (
                                                          <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); openDockerfileEditor(item, group); }}
                                                            style={{ background: 'none', border: 'none', color: theme === 'light' ? '#b91c1c' : '#ef4444', textDecoration: 'underline', padding: 0, marginLeft: '6px', fontSize: '0.66rem', cursor: 'pointer', fontWeight: 700 }}
                                                          >
                                                            Fix
                                                          </button>
                                                        )}
                                                      </span>
                                                    )}
                                                    <ChevronDown
                                                      size={12}
                                                      style={{
                                                        color: 'var(--text-secondary)',
                                                        transform: expandedDockerDetails[item.name] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s ease',
                                                        marginLeft: '2px'
                                                      }}
                                                    />
                                                  </div>
                                                </div>

                                                {expandedDockerDetails[item.name] && (
                                                  <div style={{
                                                    marginTop: '8px',
                                                    paddingTop: '8px',
                                                    borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    fontSize: '0.68rem',
                                                    color: 'var(--text-secondary)'
                                                  }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span>File Name:</span>
                                                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Dockerfile</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span>Full Path:</span>
                                                      <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', opacity: 0.8 }}>Dockerfile</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span>Validation Status:</span>
                                                      <span style={{
                                                        color: !health.dockerfileHealth.exists
                                                          ? (theme === 'light' ? '#b91c1c' : '#ef4444')
                                                          : !health.dockerfileHealth.valid
                                                            ? (theme === 'light' ? '#b91c1c' : '#ef4444')
                                                            : health.dockerfileHealth.warningCount > 0
                                                              ? (theme === 'light' ? '#b45309' : '#fbbf24')
                                                              : (theme === 'light' ? '#059669' : '#34d399'),
                                                        fontWeight: 700
                                                      }}>
                                                        {!health.dockerfileHealth.exists
                                                          ? 'Not Found'
                                                          : !health.dockerfileHealth.valid
                                                            ? 'Failed'
                                                            : health.dockerfileHealth.warningCount > 0
                                                              ? 'Passed with Warnings'
                                                              : 'Passed'}
                                                      </span>
                                                    </div>
                                                    {health.dockerfileHealth.errors && health.dockerfileHealth.errors.length > 0 && (
                                                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--error)' }}>Errors:</span>
                                                        {health.dockerfileHealth.errors.map((err: any, idx: number) => (
                                                          <div key={idx} style={{
                                                            background: theme === 'light' ? 'rgba(220, 38, 38, 0.04)' : 'rgba(239, 68, 68, 0.06)',
                                                            borderLeft: '2px solid var(--error)',
                                                            padding: '4px 6px',
                                                            borderRadius: '2px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.62rem'
                                                          }}>
                                                            {err.message || err}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                    {health.dockerfileHealth.warnings && health.dockerfileHealth.warnings.length > 0 && (
                                                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontWeight: 600, color: theme === 'light' ? '#b45309' : '#fbbf24' }}>Warnings:</span>
                                                        {health.dockerfileHealth.warnings.map((warn: any, idx: number) => (
                                                          <div key={idx} style={{
                                                            background: theme === 'light' ? 'rgba(245, 158, 11, 0.04)' : 'rgba(245, 158, 11, 0.06)',
                                                            borderLeft: `2px solid ${theme === 'light' ? '#b45309' : '#fbbf24'}`,
                                                            padding: '4px 6px',
                                                            borderRadius: '2px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.62rem'
                                                          }}>
                                                            {warn.message || warn}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}

                                                    {health.dockerfileHealth.exists && (
                                                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}`, paddingTop: '6px' }}>
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenFileDrawer(
                                                              item.name,
                                                              'Dockerfile',
                                                              'Dockerfile',
                                                              'dockerfile',
                                                              item.repositoryUrl || group?.repoPath || '',
                                                              item.branch || 'main'
                                                            );
                                                          }}
                                                          style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--accent-teal)',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                          }}
                                                        >
                                                          <span>View File ➔</span>
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                          </div>
                                        </div>
                                      )} {/* End Block 2 */}

                                      {/* Block 3: Continuous Integration Telemetry Block */}
                                      {(item.pipelineId || resolveAppProvider(item) === 'github_actions') && (item.pipelineRun || !loadedPipelines[item.pipelineId || item.name] || resolveAppProvider(item) === 'github_actions') && (

                                        <div style={{
                                          background: theme === 'light'
                                            ? 'rgba(15, 23, 42, 0.02)'
                                            : 'rgba(15, 23, 42, 0.15)',
                                          border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid rgba(15, 23, 42, 0.25)',
                                          borderRadius: '12px',
                                          padding: '16px',
                                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '10px',
                                          width: '100%',
                                          boxSizing: 'border-box'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <Activity size={14} style={{ color: 'var(--accent-purple)' }} />
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                              Continuous Integration Telemetry
                                            </span>
                                          </div>

                                          {(() => {
                                            const isLight = theme === 'light';
                                            const isGitHub = resolveAppProvider(item) === 'github_actions';

                                            if (!item.pipelineRun) {
                                              // GitHub Actions apps don't have pipelineRun (Azure DevOps-specific)
                                              // Show a GitHub Actions status card with link to view runs
                                              if (isGitHub) {
                                                const repoUrl = item.repositoryUrl || `https://github.com/Estevia-TechSolutions/${item.name}`;
                                                const actionsUrl = `${repoUrl}/actions`;
                                                return (
                                                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                                                    <div style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'space-between',
                                                      gap: '8px',
                                                      padding: '12px 14px',
                                                      borderRadius: '8px',
                                                      background: isLight ? 'rgba(34,197,94,0.04)' : 'rgba(34,197,94,0.06)',
                                                      border: `1px solid ${isLight ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)'}`,
                                                    }}>
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <GitBranch size={13} style={{ color: '#22c55e' }} />
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                          GitHub Actions
                                                        </span>
                                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                                          — managed externally via workflow YML
                                                        </span>
                                                      </div>
                                                      <a
                                                        href={actionsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          gap: '4px',
                                                          fontSize: '0.68rem',
                                                          fontWeight: 600,
                                                          color: '#22c55e',
                                                          textDecoration: 'none',
                                                          padding: '3px 8px',
                                                          borderRadius: '5px',
                                                          border: '1px solid rgba(34,197,94,0.25)',
                                                          background: 'rgba(34,197,94,0.08)',
                                                          whiteSpace: 'nowrap'
                                                        }}
                                                      >
                                                        <ExternalLink size={10} />
                                                        View Runs
                                                      </a>
                                                    </div>
                                                  </div>
                                                );
                                              }
                                              return (
                                                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                                                  <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px 14px',
                                                    borderRadius: '8px',
                                                    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)',
                                                    border: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`,
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 500
                                                  }}>
                                                    <RefreshCw size={12} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                                                    <span>Loading build information...</span>
                                                  </div>
                                                </div>
                                              );
                                            }


                                            const isExpanded = expandedBuilds[item.name] ?? isBuildActive(item.pipelineRun);
                                            const runState = (item.pipelineRun?.state || '').toLowerCase();
                                            const runStatus = isBuildActive(item.pipelineRun)
                                              ? (runState === 'notstarted' || runState === 'queued' || runState === 'waiting' ? 'QUEUED' : 'BUILDING')
                                              : item.pipelineRun.result || item.pipelineRun.state;
                                            const runStatusColor = getStageColor(item.pipelineRun.result, item.pipelineRun.state);

                                            return (
                                              <div style={{
                                                width: '100%',
                                                boxSizing: 'border-box'
                                              }}>
                                                <div style={{
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '6px',
                                                  width: '100%',
                                                  borderRadius: '8px',
                                                  background: isLight
                                                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(243, 244, 246, 0.75) 100%)'
                                                    : 'linear-gradient(180deg, rgba(30, 41, 59, 0.2) 0%, rgba(15, 23, 42, 0.35) 100%)',
                                                  border: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`,
                                                  boxSizing: 'border-box',
                                                  overflow: 'hidden'
                                                }}>
                                                  {/* Collapsible Header */}
                                                  <div
                                                    onClick={() => setExpandedBuilds(prev => ({ ...prev, [item.name]: !isExpanded }))}
                                                    style={{
                                                      display: 'flex',
                                                      justifyContent: 'space-between',
                                                      alignItems: 'center',
                                                      padding: '10px 14px',
                                                      cursor: 'pointer',
                                                      userSelect: 'none',
                                                      background: isExpanded
                                                        ? (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)')
                                                        : 'transparent',
                                                      transition: 'background-color 0.2s ease',
                                                      borderBottom: isExpanded ? `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}` : 'none'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isExpanded ? (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)') : 'transparent'}
                                                  >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                      <ChevronRight
                                                        size={14}
                                                        style={{
                                                          color: 'var(--text-secondary)',
                                                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                          transition: 'transform 0.2s ease'
                                                        }}
                                                      />
                                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                                        BUILD RUN: #{item.pipelineRun.name || item.pipelineRun.id}
                                                      </span>
                                                      {item.pipelineRun.startTime && (
                                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                          ({new Date(item.pipelineRun.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                                                        </span>
                                                      )}
                                                      {onShowBuildHistory && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            onShowBuildHistory(item);
                                                          }}
                                                          style={{
                                                            background: 'rgba(255,255,255,0.03)',
                                                            border: '1px solid var(--glass-border)',
                                                            borderRadius: '4px',
                                                            color: 'var(--text-secondary)',
                                                            fontSize: '0.64rem',
                                                            padding: '2px 6px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            marginLeft: '6px'
                                                          }}
                                                          onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = 'var(--text-primary)';
                                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                                          }}
                                                          onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                                                          }}
                                                          title="View build history & revisions"
                                                        >
                                                          <Clock size={11} />
                                                          <span>History</span>
                                                        </button>
                                                      )}
                                                      <span style={{
                                                        fontSize: '0.64rem',
                                                        fontWeight: 800,
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                                                        color: runStatusColor,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                      }}>
                                                        {getStageIcon(item.pipelineRun.result, item.pipelineRun.state)}
                                                        {runStatus}
                                                      </span>
                                                      {runStatus === 'QUEUED' && !isViewer && item.pipelineId && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrioritizeBuild(item.pipelineId, item.pipelineRun.id);
                                                          }}
                                                          disabled={prioritizingBuildId === item.pipelineRun.id}
                                                          style={{
                                                            background: 'rgba(245, 158, 11, 0.08)',
                                                            border: '1px solid rgba(245, 158, 11, 0.25)',
                                                            color: '#f59e0b',
                                                            borderRadius: '4px',
                                                            fontSize: '0.64rem',
                                                            padding: '2px 8px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            marginLeft: '6px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                          }}
                                                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)'; }}
                                                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.08)'; }}
                                                        >
                                                          ⚡ Prioritize
                                                        </button>
                                                      )}
                                                      {runStatus === 'QUEUED' && item.pipelineRun.queuePosition != null && (
                                                        <span style={{
                                                          fontSize: '0.62rem',
                                                          fontWeight: 800,
                                                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                                          color: '#f59e0b',
                                                          border: '1px solid rgba(245, 158, 11, 0.3)',
                                                          padding: '1px 7px',
                                                          borderRadius: '4px',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '3px',
                                                          marginLeft: '4px',
                                                          letterSpacing: '0.02em'
                                                        }}>
                                                          Queue #{item.pipelineRun.queuePosition}
                                                        </span>
                                                      )}
                                                      {item.pipelineRun.result === 'failed' && (
                                                        <span style={{
                                                          fontSize: '0.68rem',
                                                          color: 'var(--error)',
                                                          fontWeight: 600,
                                                          marginLeft: '8px'
                                                        }}>
                                                          (Last build failed)
                                                        </span>
                                                      )}
                                                    </div>

                                                    {/* Right side Actions (CI/CD Pipeline Link + Cancel Previous) */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                      {/* Cancel Previous Builds — shown when build is active and user is not viewer */}
                                                      {!isViewer && item.pipelineId && item.pipelineRun && isBuildActive(item.pipelineRun) && item.pipelineRun.activeRunCount > 1 && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCancelOlderBuilds(item.pipelineId, `refs/heads/${resolveBranchName(item)}`);
                                                          }}
                                                          disabled={cancelingOlderForPipeline === item.pipelineId}
                                                          title="Cancel all older builds for this branch, keeping only the latest"
                                                          style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700,
                                                            color: cancelingOlderForPipeline === item.pipelineId ? '#f59e0b' : '#ef4444',
                                                            backgroundColor: isLight ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.1)',
                                                            border: `1px solid ${isLight ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.3)'}`,
                                                            cursor: cancelingOlderForPipeline === item.pipelineId ? 'not-allowed' : 'pointer',
                                                            opacity: cancelingOlderForPipeline === item.pipelineId ? 0.7 : 1,
                                                            transition: 'all 0.2s',
                                                            whiteSpace: 'nowrap'
                                                          }}
                                                          onMouseEnter={(e) => { if (cancelingOlderForPipeline !== item.pipelineId) e.currentTarget.style.backgroundColor = isLight ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.2)'; }}
                                                          onMouseLeave={(e) => { if (cancelingOlderForPipeline !== item.pipelineId) e.currentTarget.style.backgroundColor = isLight ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.1)'; }}
                                                        >
                                                          {cancelingOlderForPipeline === item.pipelineId ? (
                                                            <>
                                                              <RefreshCw size={10} className="spin-anim" />
                                                              <span>Cancelling...</span>
                                                            </>
                                                          ) : (
                                                            <>
                                                              <XCircle size={10} />
                                                              <span>Cancel Previous Builds</span>
                                                            </>
                                                          )}
                                                        </button>
                                                      )}
                                                      {item.pipelineId ? (
                                                        <a
                                                          href={(() => {
                                                            const pid = String(item.pipelineId || '');
                                                            if (pid.startsWith('github-actions:')) {
                                                              const repoPath = pid.split(':').slice(1).join(':');
                                                              if (item.pipelineRun?.webUrl) {
                                                                return item.pipelineRun.webUrl;
                                                              }
                                                              return `https://github.com/${repoPath}/actions`;
                                                            }
                                                            if (item.pipelineRun?.webUrl) {
                                                              try {
                                                                const url = new URL(item.pipelineRun.webUrl);
                                                                const parts = url.pathname.split('/');
                                                                const buildIndex = parts.indexOf('_build');
                                                                if (buildIndex !== -1) {
                                                                  const basePath = parts.slice(0, buildIndex + 1).join('/');
                                                                  return `${url.origin}${basePath}?definitionId=${item.pipelineId}`;
                                                                }
                                                              } catch (e) {
                                                                console.warn('Failed to parse webUrl:', e);
                                                              }
                                                            }
                                                            const baseOrg = (azureDevopsOrgUrl || 'https://dev.azure.com/esteviatech').replace(/\/$/, '');
                                                            const baseProj = azureDevopsProject || 'Estevia-Platform';
                                                            return `${baseOrg}/${baseProj}/_build?definitionId=${item.pipelineId}`;
                                                          })()}
                                                          target="_blank"
                                                          rel="noreferrer"
                                                          style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 600,
                                                            color: 'var(--text-primary)',
                                                            backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                                                            border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'var(--glass-border)'}`,
                                                            textDecoration: 'none',
                                                            boxSizing: 'border-box'
                                                          }}
                                                          onClick={(e) => e.stopPropagation()}
                                                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}
                                                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}
                                                        >
                                                          <GitBranch size={10} style={{ color: 'var(--accent-teal)' }} />
                                                          <span>View CI/CD Pipeline</span>
                                                        </a>
                                                      ) : (
                                                        <button
                                                          type="button"
                                                          disabled={isViewer}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            openPipelineModal(item, group);
                                                          }}
                                                          style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 600,
                                                            background: 'none',
                                                            color: isViewer ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)',
                                                            backgroundColor: isViewer ? 'transparent' : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'),
                                                            border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'var(--glass-border)'}`,
                                                            textAlign: 'left',
                                                            cursor: isViewer ? 'not-allowed' : 'pointer',
                                                            opacity: isViewer ? 0.35 : 1
                                                          }}
                                                          onMouseEnter={(e) => { if (!isViewer) e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'; }}
                                                          onMouseLeave={(e) => { if (!isViewer) e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'; }}
                                                        >
                                                          <PlusCircle size={10} style={{ color: isViewer ? 'rgba(255,255,255,0.35)' : 'var(--accent-purple)' }} />
                                                          <span>Setup CI/CD</span>
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Collapsible Content */}
                                                  {isExpanded && (
                                                    <div style={{
                                                      padding: '12px 14px',
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      gap: '12px'
                                                    }}>
                                                      {item.pipelineRun.result === 'failed' && (
                                                        <div style={{
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          gap: '8px',
                                                          padding: '10px 12px',
                                                          borderRadius: '6px',
                                                          backgroundColor: isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.15)',
                                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                                          color: isLight ? '#b91c1c' : '#f87171',
                                                          fontSize: '0.72rem',
                                                          fontWeight: 600
                                                        }}>
                                                          <AlertCircle size={14} style={{ color: isLight ? '#b91c1c' : '#f87171', flexShrink: 0 }} />
                                                          <span>Build failed for the last build. Please check step logs below.</span>
                                                        </div>
                                                      )}
                                                      {!item.pipelineRun.stages || item.pipelineRun.stages.length === 0 ? (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '6px 0' }}>
                                                          No stages defined for this run.
                                                        </div>
                                                      ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                          {item.pipelineRun.stages.map((stage: any) => {
                                                            const stageColor = getStageColor(stage.result, stage.state);
                                                            const stageStatus = stage.state === 'inProgress' ? 'RUNNING' : stage.result || stage.state;

                                                            return (
                                                              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                {/* Stage Row */}
                                                                <div style={{
                                                                  display: 'flex',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  fontSize: '0.74rem',
                                                                  fontWeight: 600,
                                                                  color: 'var(--text-primary)',
                                                                  padding: '4px 6px',
                                                                  borderRadius: '4px',
                                                                  backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
                                                                }}>
                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    {getStageIcon(stage.result, stage.state)}
                                                                    <span>{stage.displayName || stage.name}</span>
                                                                  </div>
                                                                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: stageColor }}>
                                                                    {stageStatus.toUpperCase()}
                                                                  </span>
                                                                </div>

                                                                {/* Jobs list under this Stage */}
                                                                {stage.jobs && stage.jobs.length > 0 && (
                                                                  <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '6px',
                                                                    paddingLeft: '16px',
                                                                    borderLeft: `1px dashed ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                                                                  }}>
                                                                    {stage.jobs.map((job: any) => {
                                                                      const jobColor = getStageColor(job.result, job.state);
                                                                      const jobStatus = job.state === 'inProgress' ? 'RUNNING' : job.result || job.state;

                                                                      return (
                                                                        <div key={job.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                          {/* Job Row */}
                                                                          <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            fontSize: '0.7rem',
                                                                            color: 'var(--text-secondary)',
                                                                            padding: '3px 6px',
                                                                            borderRadius: '4px'
                                                                          }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                              {getStageIcon(job.result, job.state)}
                                                                              <span style={{ fontWeight: 500 }}>{job.displayName || job.name}</span>
                                                                            </div>
                                                                            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: jobColor }}>
                                                                              {jobStatus.toUpperCase()}
                                                                            </span>
                                                                          </div>

                                                                          {/* Job Tasks (Steps) under this Job */}
                                                                          {job.steps && job.steps.length > 0 && (
                                                                            <div style={{
                                                                              display: 'flex',
                                                                              flexDirection: 'column',
                                                                              gap: '3px',
                                                                              paddingLeft: '14px',
                                                                              borderLeft: `1px dotted ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`
                                                                            }}>
                                                                              {job.steps.map((step: any, idx: number) => {
                                                                                const stepColor = getStageColor(step.result, step.state);
                                                                                const stepStatus = step.state === 'inProgress' ? 'RUNNING' : step.result || step.state;

                                                                                // Compute step duration helper
                                                                                const getStepDuration = () => {
                                                                                  if (!step.startTime) return null;
                                                                                  const start = new Date(step.startTime).getTime();
                                                                                  const end = step.finishTime ? new Date(step.finishTime).getTime() : Date.now();
                                                                                  const dur = Math.max(0, Math.floor((end - start) / 1000));
                                                                                  return `${dur}s`;
                                                                                };
                                                                                const dur = getStepDuration();

                                                                                return (
                                                                                  <div
                                                                                    key={step.id || idx}
                                                                                    onClick={() => setSelectedTaskForModal({
                                                                                      step,
                                                                                      jobName: job.displayName || job.name,
                                                                                      stageName: stage.displayName || stage.name,
                                                                                      buildId: item.pipelineRun?.id
                                                                                    })}
                                                                                    style={{
                                                                                      display: 'flex',
                                                                                      alignItems: 'center',
                                                                                      justifyContent: 'space-between',
                                                                                      padding: '3px 6px',
                                                                                      borderRadius: '4px',
                                                                                      cursor: 'pointer',
                                                                                      userSelect: 'none',
                                                                                      fontSize: '0.68rem',
                                                                                      transition: 'all 0.15s ease',
                                                                                      backgroundColor: 'transparent'
                                                                                    }}
                                                                                    onMouseEnter={(e) => {
                                                                                      e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
                                                                                      e.currentTarget.style.color = 'var(--text-primary)';
                                                                                    }}
                                                                                    onMouseLeave={(e) => {
                                                                                      e.currentTarget.style.backgroundColor = 'transparent';
                                                                                      e.currentTarget.style.color = 'var(--text-secondary)';
                                                                                    }}
                                                                                  >
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                      {getStageIcon(step.result, step.state)}
                                                                                      <span style={{ color: 'var(--text-secondary)' }}>{step.displayName || step.name}</span>
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: stepColor }}>
                                                                                        {stepStatus.toUpperCase()}
                                                                                      </span>
                                                                                      {dur && (
                                                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'monospace' }}>
                                                                                          ({dur})
                                                                                        </span>
                                                                                      )}
                                                                                    </div>
                                                                                  </div>
                                                                                );
                                                                              })}
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
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      )} {/* End Block 3 */}
                                    </div>
                                  );
                                })}
                                {(() => {
                                  const deployedBranchNames = group.envs.map(app => resolveBranchName(app).toLowerCase());
                                  const undeployedBranches = (group.branches || []).filter(branch => {
                                    return !deployedBranchNames.includes(branch.name.toLowerCase());
                                  });

                                  if (undeployedBranches.length === 0) return null;

                                  const unlinkedStyle = getUnlinkedCardStyles(theme);

                                  return undeployedBranches.map((branch) => {
                                    return (
                                      <div
                                        key={branch.name}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '12px 18px',
                                          borderRadius: '10px',
                                          border: `1px dashed ${unlinkedStyle.border}`,
                                          borderLeft: `4px solid ${unlinkedStyle.color}`,
                                          background: unlinkedStyle.background,
                                          transition: 'all 0.25s ease',
                                          flexWrap: 'wrap',
                                          gap: '12px'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                                          {/* Git Icon / Branch details */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <GitBranch size={16} style={{ color: unlinkedStyle.color, opacity: 0.9 }} />
                                            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                              {branch.name}
                                            </span>
                                          </div>

                                          {/* UNLINKED badge */}
                                          <span style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: unlinkedStyle.color,
                                            background: theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.15)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            border: `1px dashed ${unlinkedStyle.border}`,
                                            letterSpacing: '0.04em'
                                          }}>
                                            UNLINKED
                                          </span>
                                        </div>

                                        {/* Provision Branch Button */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                          <button
                                            className="btn-secondary"
                                            disabled={isViewer || isEnvLimitReached}
                                            onClick={() => onDeployBranch(group.repoPath, branch.name, group.type as 'frontend' | 'backend')}
                                            style={{
                                              padding: '6px 12px',
                                              fontSize: '0.75rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '6px',
                                              borderColor: (isViewer || isEnvLimitReached) ? 'var(--glass-border)' : unlinkedStyle.color,
                                              color: (isViewer || isEnvLimitReached) ? 'var(--text-muted)' : 'var(--text-primary)',
                                              background: (isViewer || isEnvLimitReached) ? 'rgba(255,255,255,0.01)' : (theme === 'light' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.05)'),
                                              cursor: (isViewer || isEnvLimitReached) ? 'not-allowed' : 'pointer',
                                              opacity: (isViewer || isEnvLimitReached) ? 0.6 : 1
                                            }}
                                            title={isEnvLimitReached ? `Environment cap (${licenseLimit}) reached for your ${licenseTier.toUpperCase()} tier. Upgrade subscription to provision more.` : undefined}
                                            onMouseEnter={(e) => {
                                              if (isViewer || isEnvLimitReached) return;
                                              e.currentTarget.style.background = theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.15)';
                                              e.currentTarget.style.boxShadow = `0 0 8px ${theme === 'light' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.4)'}`;
                                            }}
                                            onMouseLeave={(e) => {
                                              if (isViewer || isEnvLimitReached) return;
                                              e.currentTarget.style.background = theme === 'light' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.05)';
                                              e.currentTarget.style.boxShadow = 'none';
                                            }}
                                          >
                                            <PlusCircle size={12} style={{ color: (isViewer || isEnvLimitReached) ? 'var(--text-muted)' : unlinkedStyle.color }} />
                                            Provision Branch
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingCompliance && !complianceData ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                  <RefreshCw size={36} className="spin-anim" style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} />
                  <h3>Evaluating compliance rules...</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Scanning resource tags, region residency, and secure transport layers.</p>
                </div>
              ) : (
                <>
                  {/* Export and Policy Settings Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPolicyConfigExpanded(!policyConfigExpanded)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.82rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sliders size={14} />
                        <span>{policyConfigExpanded ? 'Hide Policy Settings' : 'Configure Policy Rules'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        if (!complianceData) return;
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(complianceData, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `evaops-governance-audit-${organizationId}-${new Date().toISOString().split('T')[0]}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderColor: 'var(--accent-teal)',
                        color: 'var(--accent-teal)',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} />
                      <span>Export Audit Report</span>
                    </button>
                  </div>

                  {/* Collapsible Policy Configuration Panel */}
                  {policyConfigExpanded && (
                    <div className="glass-panel" style={{
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Governance Policy Rules Manager</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Customize active compliance rules and adjust severity thresholds for your organization.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setDisabledRules([]);
                            setRuleSeverities({});
                          }}
                          style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px' }}
                        >
                          Reset Defaults
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '12px'
                      }}>
                        {[
                          { id: 'tagging', name: 'Required Resource Tagging', desc: 'Enforces presence of enterprise tagging standards (Environment, Owner, CostCenter).' },
                          { id: 'residency', name: 'Data Region Residency Lock', desc: 'Verifies all hosted assets reside within approved sovereign geo boundaries (US-only).' },
                          { id: 'tls', name: 'MySQL SSL/TLS Enforcement', desc: 'Checks if databases enforce secure transport (SSL/TLS v1.2+) settings.' },
                          { id: 'network-security', name: 'VM Inbound Port Security', desc: 'Flags public SSH/RDP ports open directly to the internet.' },
                          { id: 'https-only', name: 'HTTPS-Only Ingress Enforcement', desc: 'Ensures container apps disable insecure HTTP ingress.' },
                          { id: 'containment', name: 'Branch-to-Network Isolation', desc: 'Prevents development branches from deploying to production network resources.' },
                          { id: 'registry-auth', name: 'Container Registry Security', desc: 'Ensures container images are pulled only from verified registries.' },
                          { id: 'secrets-expiry', name: 'Key Vault Secrets Expiry Check', desc: 'Monitors Key Vault credentials and alerts before they expire.' },
                          { id: 'shadow-it', name: 'Orphaned Resource Scan (Shadow IT)', desc: 'Identifies untracked resources running in Azure not listed in the DevOps catalog.' }
                        ].map(r => {
                          const isLocked = isRuleLockedByTier(r.id);
                          const isEnabled = !isLocked && !disabledRules.includes(r.id);
                          const severity = ruleSeverities[r.id] || (r.id === 'tls' || r.id === 'network-security' ? 'critical' : r.id === 'tagging' ? 'low' : r.id === 'https-only' || r.id === 'registry-auth' ? 'medium' : 'high');

                          return (
                            <div key={r.id}
                              title={isLocked ? "Requires Enterprise or Sovereign subscription" : undefined}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '8px',
                                opacity: isLocked ? 0.5 : 1
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', cursor: isLocked ? 'not-allowed' : 'pointer', margin: 0, userSelect: 'none' }}>
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    disabled={isLocked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setDisabledRules(prev => prev.filter(x => x !== r.id));
                                      } else {
                                        setDisabledRules(prev => [...prev, r.id]);
                                      }
                                    }}
                                    style={{ accentColor: 'var(--accent-purple)', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                                  />
                                  <span>{r.name}</span>
                                  {isLocked && (
                                    <span style={{
                                      fontSize: '0.62rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      color: '#EF4444',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      marginLeft: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      fontWeight: 600
                                    }}>
                                      🔒 Enterprise
                                    </span>
                                  )}
                                </label>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', minHeight: '32px' }}>{r.desc}</p>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Severity Level:</span>
                                <select
                                  value={severity}
                                  disabled={isLocked || !isEnabled}
                                  onChange={(e) => {
                                    setRuleSeverities(prev => ({ ...prev, [r.id]: e.target.value }));
                                  }}
                                  style={{
                                    padding: '3px 6px',
                                    fontSize: '0.72rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-primary)',
                                    color: (isEnabled && !isLocked) ? 'var(--text-primary)' : 'var(--text-muted)',
                                    outline: 'none',
                                    cursor: (isEnabled && !isLocked) ? 'pointer' : 'not-allowed'
                                  }}
                                >
                                  <option value="critical">Critical</option>
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Compliance Overview Dashboard */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                    {/* Score Widget */}
                    <div className="glass-panel" style={{
                      padding: '24px',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.08) 100%)',
                      borderColor: 'rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px'
                    }}>
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.03) 70%)',
                        border: '4px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: '0 0 20px rgba(139,92,246,0.1)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          inset: '-4px',
                          borderRadius: '50%',
                          border: '4px solid transparent',
                          borderTopColor: 'var(--accent-purple)',
                          borderRightColor: complianceData && complianceData.complianceScore >= 50 ? 'var(--accent-purple)' : 'transparent',
                          borderBottomColor: complianceData && complianceData.complianceScore >= 75 ? 'var(--accent-purple)' : 'transparent',
                          transform: 'rotate(-45deg)',
                          zIndex: 1
                        }} />
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', zIndex: 2 }}>
                          {complianceData ? `${complianceData.complianceScore}%` : '--'}
                        </span>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Azure Governance Score</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', marginBottom: 0 }}>
                          Your corporate environment is {complianceData ? complianceData.complianceScore : 0}% compliant with Azure resource governance controls.
                        </p>
                      </div>
                    </div>

                    {/* Violations Summary */}
                    <div className="glass-panel" style={{
                      padding: '24px',
                      background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05) 0%, rgba(225, 29, 72, 0.08) 100%)',
                      borderColor: 'rgba(244, 63, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--error)',
                        fontSize: '1.5rem',
                        fontWeight: 800
                      }}>
                        {complianceData ? complianceData.violations.length : 0}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Active Rule Violations</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', marginBottom: 0 }}>
                          Non-compliant issues identified requiring immediate tag updates, SSL setting switches, or regional relocation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Evaluated Rules Listing */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Evaluated Governance Rules</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '16px'
                    }}>
                      {complianceData && complianceData.rules.map((rule: any) => {
                        const ruleViolations = complianceData?.violations?.filter((v: any) => v.ruleId === rule.id) || [];
                        const violationCount = ruleViolations.length;

                        return (
                          <div key={rule.id} style={{
                            padding: '18px',
                            borderRadius: '10px',
                            border: '1px solid var(--glass-border)',
                            backgroundColor: 'rgba(255,255,255,0.015)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                            minHeight: '140px'
                          }}>
                            <div>
                              {/* Header Row: Name & Compliant badge */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', width: '100%', minHeight: '36px' }}>
                                <div style={{ fontWeight: 650, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', lineHeight: '1.3', minHeight: '36px' }}>
                                  <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: rule.status === 'passed' ? 'var(--success)' : rule.status === 'disabled' ? 'var(--text-muted)' : 'var(--error)',
                                    flexShrink: 0
                                  }} />
                                  <span>{rule.name}</span>
                                </div>

                                {rule.status === 'passed' ? (
                                  <span style={{
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: '#10b981',
                                    backgroundColor: 'rgba(16,185,129,0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(16,185,129,0.2)',
                                    flexShrink: 0
                                  }}>
                                    Compliant
                                  </span>
                                ) : rule.status === 'disabled' ? (
                                  <span style={{
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--glass-border)',
                                    flexShrink: 0
                                  }}>
                                    Disabled
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setComplianceFilterRule(rule.id);
                                      setCompliancePage(1);
                                      const element = document.getElementById('governance-violations-panel');
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                    className="interactive-violation-badge"
                                    style={{
                                      cursor: 'pointer',
                                      fontSize: '0.64rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      color: '#ef4444',
                                      backgroundColor: 'rgba(239,68,68,0.15)',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(239,68,68,0.35)',
                                      flexShrink: 0,
                                      outline: 'none',
                                      transition: 'all 0.2s ease',
                                      display: 'inline-flex',
                                      alignItems: 'center'
                                    }}
                                    title="Click to filter violations list below for this rule"
                                  >
                                    Non-Compliant ({violationCount} {violationCount === 1 ? 'Issue' : 'Issues'})
                                  </button>
                                )}
                              </div>

                              {/* Description & Detail Subsections */}
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '8px', lineHeight: '1.45', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '210px' }}>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', minHeight: '54px' }}>{rule.description}</div>

                                {rule.rootCause && (
                                  <div style={{ fontSize: '0.72rem', borderLeft: '2px solid rgba(245, 158, 11, 0.35)', paddingLeft: '8px', color: 'rgba(245, 158, 11, 0.75)', lineHeight: '1.4', minHeight: '44px' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Root Cause:</strong> {rule.rootCause}
                                  </div>
                                )}

                                {rule.whyImportant && (
                                  <div style={{ fontSize: '0.72rem', borderLeft: '2px solid rgba(16, 185, 129, 0.35)', paddingLeft: '8px', color: 'rgba(16, 185, 129, 0.75)', lineHeight: '1.4', minHeight: '44px' }}>
                                    <strong style={{ color: '#10b981' }}>ROI / Benefit:</strong> {rule.whyImportant}
                                  </div>
                                )}

                                {rule.impactOfFix && (
                                  <div style={{ fontSize: '0.72rem', borderLeft: '2px solid rgba(59, 130, 246, 0.35)', paddingLeft: '8px', color: 'rgba(59, 130, 246, 0.75)', lineHeight: '1.4', minHeight: '44px' }}>
                                    <strong style={{ color: '#60a5fa' }}>Impact of Fix:</strong> {rule.impactOfFix}
                                  </div>
                                )}
                              </div>

                              {/* Policy Status & Analysis Subsection */}
                              <div style={{
                                marginTop: '10px',
                                borderRadius: '8px',
                                background: rule.status === 'passed'
                                  ? 'rgba(16, 185, 129, 0.04)'
                                  : rule.status === 'disabled'
                                    ? 'rgba(255, 255, 255, 0.02)'
                                    : 'rgba(239, 68, 68, 0.04)',
                                border: `1px solid ${rule.status === 'passed'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : rule.status === 'disabled'
                                    ? 'var(--glass-border)'
                                    : 'rgba(239, 68, 68, 0.15)'
                                  }`,
                                overflow: 'hidden',
                                fontSize: '0.72rem',
                                lineHeight: '1.45'
                              }}>
                                {/* Unified Status Row */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  color: rule.status === 'passed'
                                    ? 'rgba(16, 185, 129, 0.85)'
                                    : rule.status === 'disabled'
                                      ? 'var(--text-muted)'
                                      : '#f87171',
                                  fontWeight: 600,
                                  cursor: rule.status === 'failed' && ruleViolations.length > 0 ? 'pointer' : 'default',
                                  userSelect: 'none'
                                }}
                                  onClick={() => {
                                    if (rule.status === 'failed' && ruleViolations.length > 0) {
                                      setExpandedRuleViolations(prev => ({
                                        ...prev,
                                        [rule.id]: !prev[rule.id]
                                      }));
                                    }
                                  }}>
                                  {rule.status === 'passed' ? (
                                    <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                                  ) : rule.status === 'disabled' ? (
                                    <HelpCircle size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                  ) : (
                                    <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                                  )}
                                  <span style={{ flex: 1 }}>
                                    {rule.status === 'passed'
                                      ? 'Rule Compliant'
                                      : rule.status === 'disabled'
                                        ? 'Evaluation Deactivated'
                                        : `Violations Detected (${violationCount})`}
                                  </span>
                                  {rule.status === 'failed' && ruleViolations.length > 0 && (
                                    expandedRuleViolations[rule.id] ? (
                                      <ChevronDown size={12} style={{ color: '#f87171', flexShrink: 0 }} />
                                    ) : (
                                      <ChevronRight size={12} style={{ color: '#f87171', flexShrink: 0 }} />
                                    )
                                  )}
                                </div>

                                {/* Content block */}
                                {rule.status === 'passed' && (
                                  <div style={{ padding: '0 10px 8px 10px', color: 'rgba(16, 185, 129, 0.8)' }}>
                                    {COMPLIANT_REASONS[rule.id] || 'All evaluated resources satisfy this governance rule.'}
                                  </div>
                                )}

                                {rule.status === 'disabled' && (
                                  <div style={{ padding: '0 10px 8px 10px', color: 'var(--text-muted)' }}>
                                    Governance check is deactivated in configuration settings.
                                  </div>
                                )}

                                {rule.status === 'failed' && ruleViolations.length > 0 && (
                                  <div style={{
                                    maxHeight: expandedRuleViolations[rule.id] ? '200px' : '0',
                                    opacity: expandedRuleViolations[rule.id] ? 1 : 0,
                                    overflowY: 'auto',
                                    transition: 'all 0.25s ease-in-out',
                                    padding: expandedRuleViolations[rule.id] ? '4px 10px 10px 10px' : '0px 10px',
                                    background: 'rgba(239, 68, 68, 0.015)',
                                    borderTop: expandedRuleViolations[rule.id] ? '1px solid rgba(239, 68, 68, 0.08)' : 'none'
                                  }}>
                                    <ul style={{ margin: 0, paddingLeft: '14px', listStyleType: 'disc', color: '#fca5a5' }}>
                                      {ruleViolations.map((v: any, vIdx: number) => (
                                        <li key={vIdx} style={{ marginBottom: '3px' }}>
                                          <strong style={{ color: 'var(--text-primary)' }}>{v.resourceName}</strong>: {v.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Badges footer */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {/* Severity Badge */}
                              <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: rule.severity === 'critical' ? '#ef4444' : rule.severity === 'high' ? '#f59e0b' : rule.severity === 'medium' ? '#3b82f6' : '#94a3b8',
                                backgroundColor: rule.severity === 'critical' ? 'rgba(239,68,68,0.1)' : rule.severity === 'high' ? 'rgba(245,158,11,0.1)' : rule.severity === 'medium' ? 'rgba(59,130,246,0.1)' : 'rgba(148,163,184,0.1)',
                                border: `1px solid ${rule.severity === 'critical' ? 'rgba(239,68,68,0.2)' : rule.severity === 'high' ? 'rgba(245,158,11,0.2)' : rule.severity === 'medium' ? 'rgba(59,130,246,0.2)' : 'rgba(148,163,184,0.2)'}`,
                                padding: '1px 5px',
                                borderRadius: '4px'
                              }}>
                                {rule.severity}
                              </span>

                              {/* Regulatory Standards */}
                              {rule.standards && rule.standards.map((std: string) => (
                                <span key={std} style={{
                                  fontSize: '0.6rem',
                                  fontWeight: 600,
                                  color: 'var(--accent-teal)',
                                  backgroundColor: 'rgba(20,184,166,0.1)',
                                  border: '1px solid rgba(20,184,166,0.2)',
                                  padding: '1px 5px',
                                  borderRadius: '4px'
                                }}>
                                  {std}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Violations Details & Remediation */}
                  <div id="governance-violations-panel" className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      marginBottom: '20px',
                      borderBottom: '1px solid var(--glass-border)',
                      paddingBottom: '18px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Identified Governance Violations</h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Review resource configurations against corporate compliance policies and execute remediations.
                          </p>
                        </div>
                      </div>

                      {/* Search & Filters Row */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                        {/* Search Input Container */}
                        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '180px' }}>
                          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input
                            type="text"
                            placeholder="Search resource..."
                            value={complianceSearchQuery}
                            onChange={(e) => {
                              setComplianceSearchQuery(e.target.value);
                              setCompliancePage(1);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px 8px 34px',
                              fontSize: '0.82rem',
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--accent-purple)';
                              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--glass-border)';
                              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)';
                            }}
                          />
                        </div>

                        {/* Rules Select Container */}
                        <div style={{ flex: '1 1 180px', minWidth: '140px' }}>
                          <select
                            value={complianceFilterRule}
                            onChange={(e) => {
                              setComplianceFilterRule(e.target.value);
                              setCompliancePage(1);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--accent-purple)';
                              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--glass-border)';
                              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)';
                            }}
                          >
                            <option value="all" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Rules</option>
                            <option value="tagging" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Required Tagging</option>
                            <option value="residency" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Region Residency</option>
                            <option value="tls" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>SSL/TLS Security</option>
                            <option value="network-security" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>VM Port Security</option>
                            <option value="https-only" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>HTTPS-Only Ingress</option>
                            <option value="containment" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Branch Isolation</option>
                            <option value="registry-auth" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Registry Security</option>
                            <option value="secrets-expiry" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Secret Expiry</option>
                            <option value="shadow-it" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Shadow IT Scan</option>
                          </select>
                        </div>

                        {/* Actions Select Container */}
                        <div style={{ flex: '1 1 180px', minWidth: '140px' }}>
                          <select
                            value={complianceFilterRemed}
                            onChange={(e) => {
                              setComplianceFilterRemed(e.target.value);
                              setCompliancePage(1);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--accent-purple)';
                              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--glass-border)';
                              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)';
                            }}
                          >
                            <option value="all" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Actions</option>
                            <option value="remediable" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>1-Click Remediate</option>
                            <option value="manual" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Manual Action</option>
                          </select>
                        </div>

                        {(complianceSearchQuery || complianceFilterRule !== 'all' || complianceFilterRemed !== 'all') && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setComplianceSearchQuery('');
                              setComplianceFilterRule('all');
                              setComplianceFilterRemed('all');
                              setCompliancePage(1);
                            }}
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.82rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: 'var(--error)',
                              background: 'rgba(239, 68, 68, 0.05)',
                              transition: 'all 0.25s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                            }}
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </div>

                    {complianceData && complianceData.violations.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--success)' }}>
                        <CheckCircle2 size={36} style={{ marginBottom: '8px' }} />
                        <h4 style={{ margin: 0 }}>All assets compliant!</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>No active violations found against rules policy.</p>
                      </div>
                    ) : (() => {
                      const allViolations = complianceData?.violations || [];

                      // Apply Filters
                      const filteredViolations = allViolations.filter((v: any) => {
                        const matchesSearch = !complianceSearchQuery ? true : (
                          v.resourceName?.toLowerCase().includes(complianceSearchQuery.toLowerCase()) ||
                          v.resourceType?.toLowerCase().includes(complianceSearchQuery.toLowerCase()) ||
                          v.ruleName?.toLowerCase().includes(complianceSearchQuery.toLowerCase()) ||
                          v.message?.toLowerCase().includes(complianceSearchQuery.toLowerCase())
                        );
                        const matchesRule = complianceFilterRule === 'all' || v.ruleId === complianceFilterRule;
                        const matchesRemed = complianceFilterRemed === 'all' ||
                          (complianceFilterRemed === 'remediable' && v.remediable) ||
                          (complianceFilterRemed === 'manual' && !v.remediable);
                        return matchesSearch && matchesRule && matchesRemed;
                      });

                      const totalViolations = filteredViolations.length;
                      const compliancePageSize = 10; // Paginate with 10 items per page
                      const totalPages = Math.ceil(totalViolations / compliancePageSize) || 1;
                      const currentPage = Math.min(compliancePage, totalPages);
                      const startIndex = (currentPage - 1) * compliancePageSize;
                      const paginatedViolations = filteredViolations.slice(startIndex, startIndex + compliancePageSize);

                      const remediableFiltered = filteredViolations.filter((v: any) => v.remediable);
                      const paginatedRemediable = paginatedViolations.filter((v: any) => v.remediable);
                      const isAllPageSelected = paginatedRemediable.length > 0 && paginatedRemediable.every((v: any) => selectedViolationIds.includes(v.suggestionId));

                      const handleSelectAll = () => {
                        if (isAllPageSelected) {
                          // deselect paginated items
                          const toRemove = paginatedRemediable.map((v: any) => v.suggestionId);
                          setSelectedViolationIds(prev => prev.filter(id => !toRemove.includes(id)));
                        } else {
                          // select all paginated items
                          const toAdd = paginatedRemediable.map((v: any) => v.suggestionId);
                          setSelectedViolationIds(prev => Array.from(new Set([...prev, ...toAdd])));
                        }
                      };

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                          {/* Batch Actions Bar */}
                          {remediableFiltered.length > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 18px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(139, 92, 246, 0.05)',
                              border: '1px solid rgba(139, 92, 246, 0.15)',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={isAllPageSelected}
                                  onChange={handleSelectAll}
                                  style={{ width: '15px', height: '15px', accentColor: 'var(--accent-purple)' }}
                                  id="select-all-remediable"
                                />
                                <span>Select All Remediable on Page</span>
                              </label>

                              {selectedViolationIds.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <strong>{selectedViolationIds.length}</strong> rule violation(s) selected
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={isViewer || batchRemediating}
                                    onClick={handleBatchRemediate}
                                    style={{
                                      padding: '6px 16px',
                                      fontSize: '0.74rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      background: 'var(--accent-purple)',
                                      borderColor: 'var(--accent-purple-glow)'
                                    }}
                                    id="batch-remediate-btn"
                                  >
                                    {batchRemediating ? (
                                      <RefreshCw size={12} className="spin-anim" />
                                    ) : (
                                      <ShieldCheck size={12} />
                                    )}
                                    <span>Remediate Selected ({selectedViolationIds.length})</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {filteredViolations.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              <Search size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                              <h4 style={{ margin: 0 }}>No violations match filters</h4>
                              <p style={{ fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>Try clearing search or filters to see all violations.</p>
                            </div>
                          ) : (
                            /* Cards Grid: 4 columns in a row layout */
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                              gap: '16px'
                            }}>
                              {paginatedViolations.map((v: any, index: number) => {
                                const isSelected = selectedViolationIds.includes(v.suggestionId);
                                return (
                                  <div
                                    key={startIndex + index}
                                    style={{
                                      padding: '16px',
                                      borderRadius: '12px',
                                      border: `1px solid ${isSelected ? 'rgba(139,92,246,0.35)' : 'rgba(239,68,68,0.18)'}`,
                                      background: isSelected
                                        ? 'linear-gradient(145deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.04) 100%)'
                                        : 'rgba(239,68,68,0.02)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      minHeight: '220px',
                                      boxShadow: isSelected ? '0 0 16px rgba(139,92,246,0.1)' : 'none',
                                      transition: 'all 0.25s ease'
                                    }}
                                  >
                                    <div>
                                      {/* Header Row: Checkbox, Rule Tag, Resource Name */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, width: '100%' }}>
                                          <span style={{
                                            fontSize: '0.58rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: v.remediable ? 'var(--accent-purple)' : '#f59e0b',
                                            backgroundColor: v.remediable ? 'rgba(139,92,246,0.1)' : 'rgba(245,158,11,0.1)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            border: `1px solid ${v.remediable ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                            alignSelf: 'flex-start'
                                          }}>
                                            {v.ruleName}
                                          </span>

                                          {/* Severity and Standards */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                                            <span style={{
                                              fontSize: '0.52rem',
                                              fontWeight: 800,
                                              textTransform: 'uppercase',
                                              color: v.severity === 'critical' ? '#ef4444' : v.severity === 'high' ? '#f59e0b' : v.severity === 'medium' ? '#3b82f6' : '#94a3b8',
                                              backgroundColor: v.severity === 'critical' ? 'rgba(239,68,68,0.12)' : v.severity === 'high' ? 'rgba(245,158,11,0.12)' : v.severity === 'medium' ? 'rgba(59,130,246,0.12)' : 'rgba(148,163,184,0.12)',
                                              border: `1px solid ${v.severity === 'critical' ? 'rgba(239,68,68,0.25)' : v.severity === 'high' ? 'rgba(245,158,11,0.25)' : v.severity === 'medium' ? 'rgba(59,130,246,0.25)' : 'rgba(148,163,184,0.25)'}`,
                                              padding: '1px 4px',
                                              borderRadius: '3px'
                                            }}>
                                              {v.severity}
                                            </span>
                                            {v.standards && v.standards.map((std: string) => (
                                              <span key={std} style={{
                                                fontSize: '0.52rem',
                                                fontWeight: 650,
                                                color: 'var(--accent-teal)',
                                                backgroundColor: 'rgba(20,184,166,0.08)',
                                                border: '1px solid rgba(20,184,166,0.15)',
                                                padding: '1px 4px',
                                                borderRadius: '3px'
                                              }}>
                                                {std.split(' ')[0]}
                                              </span>
                                            ))}
                                          </div>

                                          <strong style={{
                                            color: 'var(--text-primary)',
                                            fontSize: '0.86rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            marginTop: '6px'
                                          }}>
                                            {v.resourceName}
                                          </strong>
                                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                                            {v.resourceType.split('/').pop() || v.resourceType}
                                          </span>
                                        </div>

                                        {v.remediable && (
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isViewer}
                                            onChange={() => {
                                              if (isSelected) {
                                                setSelectedViolationIds(prev => prev.filter(id => id !== v.suggestionId));
                                              } else {
                                                setSelectedViolationIds(prev => [...prev, v.suggestionId]);
                                              }
                                            }}
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              cursor: isViewer ? 'not-allowed' : 'pointer',
                                              accentColor: 'var(--accent-purple)',
                                              flexShrink: 0
                                            }}
                                          />
                                        )}
                                      </div>

                                      {/* Violation Message */}
                                      <p style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.78rem',
                                        lineHeight: '1.4',
                                        margin: '0 0 16px 0'
                                      }}>
                                        {v.message}
                                      </p>
                                    </div>

                                    {/* Action Row */}
                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {v.remediable ? (
                                        <button
                                          type="button"
                                          className="btn-primary"
                                          disabled={isViewer || remediatingId === v.suggestionId}
                                          onClick={() => handleRemediate(v)}
                                          style={{
                                            width: '100%',
                                            padding: '6px 12px',
                                            fontSize: '0.72rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                          }}
                                        >
                                          {remediatingId === v.suggestionId ? (
                                            <RefreshCw size={10} className="spin-anim" />
                                          ) : (
                                            <Shield size={10} />
                                          )}
                                          <span>1-Click Remediate</span>
                                        </button>
                                      ) : (
                                        <div style={{
                                          width: '100%',
                                          padding: '6px 12px',
                                          fontSize: '0.72rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '6px',
                                          borderRadius: '6px',
                                          backgroundColor: 'rgba(255,255,255,0.02)',
                                          border: '1px solid var(--glass-border)',
                                          color: 'var(--text-secondary)',
                                          cursor: 'not-allowed',
                                          userSelect: 'none'
                                        }}>
                                          <AlertCircle size={10} style={{ color: '#f59e0b' }} />
                                          <span>Manual Action Required</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Pagination controls */}
                          {totalPages > 1 && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '1px solid var(--glass-border)'
                            }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                disabled={currentPage === 1}
                                onClick={() => setCompliancePage(p => Math.max(1, p - 1))}
                                style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                              >
                                Previous
                              </button>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Page <strong>{currentPage}</strong> of {totalPages} ({totalViolations} violations)
                              </span>
                              <button
                                type="button"
                                className="btn-secondary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCompliancePage(p => Math.min(totalPages, p + 1))}
                                style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* SOC 2 Compliance Audit Trail terminal logs block */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <Terminal size={18} style={{ color: 'var(--accent-purple)' }} />
                        <span>SOC 2 Compliance & Governance Audit Trail</span>
                      </h3>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}>
                        Live Audit Stream Online
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: '#05070c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px',
                      fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
                      fontSize: '0.78rem',
                      lineHeight: '1.6',
                      color: '#a7f3d0',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
                    }}>
                      {complianceData && complianceData.auditLogs && complianceData.auditLogs.length > 0 ? (
                        complianceData.auditLogs.map((log: any) => {
                          const dateStr = new Date(log.created_at).toLocaleString();
                          return (
                            <div key={log.id} style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(16, 185, 129, 0.1)', paddingBottom: '6px' }}>
                              <span style={{ color: 'rgba(16, 185, 129, 0.6)', marginRight: '8px' }}>[{dateStr}]</span>
                              <span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>actor: {log.actor_email}</span>
                              <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold', marginRight: '8px' }}>[{log.action_type}]</span>
                              <span style={{ color: '#e2e8f0' }}>Target: {log.target} | {log.details}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                          No compliance events logged in current evaluation window.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      {/* ── Group Header "X Environments" Fixed-Position Tooltip Portal ── */}
      {groupTooltipData && (() => {
        const { accentColor: ttAccent, envs, top, right } = groupTooltipData;
        return (
          <div
            style={{
              position: 'fixed',
              top: `${top}px`,
              right: `${right}px`,
              zIndex: 99999,
              transform: 'translateY(-100%)',
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px 16px',
              minWidth: '260px',
              maxWidth: '340px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              pointerEvents: 'none',
              color: '#e2e8f0'
            }}
          >
            {/* Arrow pointing down */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '20px',
              width: '12px',
              height: '12px',
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'rotate(45deg)'
            }} />
            {/* Header */}
            <div style={{
              fontSize: '0.65rem', fontWeight: 800, color: ttAccent,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>Last Build Times</span>
              <span style={{ color: '#94a3b8', opacity: 0.5 }}>·</span>
              <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 500 }}>{envs.length} env{envs.length !== 1 ? 's' : ''}</span>
            </div>
            {/* Rows */}
            {envs.map((env: any, idx: number) => {
              const run = env.pipelineRun;
              const finishTime = run?.finishTime;
              let timeLabel = 'Never built';
              let timeColor = 'rgba(148,163,184,0.6)';
              let statusLabel = '';
              let statusColor = '#94a3b8';

              if (env.pipelineId && !run && !loadedPipelines[env.pipelineId]) {
                timeLabel = 'Loading...';
                timeColor = 'rgba(148,163,184,0.7)';
                statusLabel = 'LOADING';
                statusColor = 'var(--accent-purple)';
              } else if (run) {
                if (isBuildActive(run)) {
                  const s = (run.state || '').toLowerCase();
                  const isQueued = s === 'notstarted' || s === 'queued' || s === 'waiting';
                  timeLabel = isQueued ? '⏳ Queued in pipeline…' : '🔄 Building now…';
                  timeColor = isQueued ? '#fbbf24' : '#34d399';
                  statusLabel = isQueued ? 'QUEUED' : 'BUILDING';
                  statusColor = isQueued ? '#fbbf24' : '#34d399';
                } else {
                  if (finishTime) {
                    try {
                      const d = new Date(finishTime);
                      const diffMs = Date.now() - d.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHrs = Math.floor(diffMins / 60);
                      const diffDays = Math.floor(diffHrs / 24);
                      if (diffMins < 1) timeLabel = 'Just now';
                      else if (diffMins < 60) timeLabel = `${diffMins}m ago`;
                      else if (diffHrs < 24) timeLabel = `${diffHrs}h ${diffMins % 60}m ago`;
                      else timeLabel = `${diffDays}d ago (${d.toLocaleDateString()})`;
                      timeColor = '#cbd5e1';
                    } catch { timeLabel = finishTime; }
                  }

                  const res = (run.result || '').toLowerCase();
                  if (res === 'succeeded') {
                    statusLabel = 'SUCCESS';
                    statusColor = '#34d399';
                  } else if (res === 'failed') {
                    statusLabel = 'FAILED';
                    statusColor = '#f87171';
                  } else if (res === 'canceled' || res === 'cancelled') {
                    statusLabel = 'CANCELED';
                    statusColor = '#94a3b8';
                  } else if (res === 'partiallysucceeded') {
                    statusLabel = 'PARTIAL';
                    statusColor = '#f59e0b';
                  } else {
                    statusLabel = (run.result || run.state || 'UNKNOWN').toUpperCase();
                    statusColor = '#94a3b8';
                  }
                }
              }

              const envTag = getEnvTag(env);
              return (
                <div key={env.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '10px', padding: '6px 0',
                  borderBottom: idx < envs.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700,
                      color: envTag.color, background: envTag.bg,
                      border: `1px solid ${envTag.border}`,
                      padding: '1px 5px', borderRadius: '4px', flexShrink: 0
                    }}>{envTag.label}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 500,
                      color: '#f8fafc',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{env.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {statusLabel && (
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        color: statusColor,
                        backgroundColor: `${statusColor}15`,
                        border: `1px solid ${statusColor}30`,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        letterSpacing: '0.03em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {statusLabel === 'LOADING' && <RefreshCw size={8} className="spin-anim" />}
                        {statusLabel === 'BUILDING' && <RefreshCw size={8} className="spin-anim" style={{ color: statusColor }} />}
                        {statusLabel === 'QUEUED' && <Clock size={8} style={{ color: statusColor }} />}
                        {statusLabel}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      color: timeColor, whiteSpace: 'nowrap'
                    }}>{timeLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Group Header Error Fixed-Position Tooltip Portal ── */}
      {hoveredErrorTooltipData && (() => {
        const { errorMessage, top, left } = hoveredErrorTooltipData;
        const errorDetail = getHealthErrorDetail(errorMessage);
        return (
          <div
            style={{
              position: 'fixed',
              top: `${top}px`,
              left: `${left}px`,
              zIndex: 2147483647,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'rgba(9, 13, 22, 0.95)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.72rem',
              fontWeight: 500,
              whiteSpace: 'normal',
              width: 'max-content',
              maxWidth: '300px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
              pointerEvents: 'none',
              lineHeight: '1.4',
              textAlign: 'left',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '3px' }}>Scan Error Detail:</div>
            <div style={{ wordBreak: 'break-word', color: '#fca5a5', marginBottom: '8px', fontSize: '0.70rem', opacity: 0.95 }}>{errorMessage || 'Check failed'}</div>

            <div style={{ borderTop: '1px solid rgba(239, 68, 68, 0.15)', paddingTop: '6px' }}>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>Reason:</div>
              <div style={{ color: '#f87171', fontSize: '0.68rem', marginBottom: '6px' }}>{errorDetail.reason}</div>

              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>Recommended Fix:</div>
              <div style={{ color: '#a7f3d0', fontSize: '0.68rem' }}>{errorDetail.fix}</div>
            </div>
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderStyle: 'solid',
              borderWidth: '6px 6px 0 6px',
              borderColor: '#090d16 transparent transparent transparent'
            }} />
            {/* Inner red border arrow */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-1px)',
              width: '0',
              height: '0',
              borderStyle: 'solid',
              borderWidth: '6px 6px 0 6px',
              borderColor: 'rgba(239, 68, 68, 0.3) transparent transparent transparent',
              zIndex: -1
            }} />
          </div>
        );
      })()}

      {/* Job Steps Modal Overlay */}
      {selectedJobForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10000,
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <GitBranch size={18} style={{ color: 'var(--accent-purple)' }} />
                Job Steps: {selectedJobForModal.displayName || selectedJobForModal.name}
              </h3>
              <button
                onClick={() => setSelectedJobForModal(null)}
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

            {/* Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {!selectedJobForModal.steps || selectedJobForModal.steps.length === 0 ? (
                <div style={{
                  padding: '24px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertCircle size={28} style={{ color: 'var(--error)' }} />
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Step Telemetry Sync Available</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      Azure DevOps timeline steps have not been cached yet for this run. Please close this modal and click the <strong>"Scan Active Cloud"</strong> button to fetch the latest live execution logs and timeline records.
                    </p>
                  </div>
                </div>
              ) : (
                selectedJobForModal.steps.map((step: any, idx: number) => {
                  const stepColor = getStageColor(step.result, step.state);
                  return (
                    <div
                      key={step.id || idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getStageIcon(step.result, step.state)}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {step.displayName || step.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: stepColor
                        }}>
                          {step.state === 'inProgress' ? 'RUNNING' : step.result || step.state}
                        </span>
                        {step.startTime && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            {(() => {
                              const start = new Date(step.startTime).getTime();
                              const end = step.finishTime ? new Date(step.finishTime).getTime() : Date.now();
                              const dur = Math.max(0, Math.floor((end - start) / 1000));
                              return `${dur}s`;
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedJobForModal(null)}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Task Details Modal Overlay */}
      {selectedTaskForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '700px',
            width: '100%',
            padding: '24px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--modal-shadow)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-purple)' }} />
                Task Details
              </h3>
              <button
                onClick={() => setSelectedTaskForModal(null)}
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

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Task Name</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedTaskForModal.step.displayName || selectedTaskForModal.step.name}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Stage</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {selectedTaskForModal.stageName}
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Job</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {selectedTaskForModal.jobName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Status</span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: getStageColor(selectedTaskForModal.step.result, selectedTaskForModal.step.state),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getStageIcon(selectedTaskForModal.step.result, selectedTaskForModal.step.state)}
                    {(selectedTaskForModal.step.state === 'inProgress' ? 'RUNNING' : selectedTaskForModal.step.result || selectedTaskForModal.step.state || 'UNKNOWN').toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Duration</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {(() => {
                      if (!selectedTaskForModal.step.startTime) return 'N/A';
                      const start = new Date(selectedTaskForModal.step.startTime).getTime();
                      const end = selectedTaskForModal.step.finishTime ? new Date(selectedTaskForModal.step.finishTime).getTime() : Date.now();
                      const totalSecs = Math.max(0, Math.floor((end - start) / 1000));
                      if (totalSecs < 60) return `${totalSecs}s`;
                      const mins = Math.floor(totalSecs / 60);
                      const secs = totalSecs % 60;
                      return `${mins}m ${secs}s`;
                    })()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Started:</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {selectedTaskForModal.step.startTime ? new Date(selectedTaskForModal.step.startTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Finished:</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {selectedTaskForModal.step.finishTime ? new Date(selectedTaskForModal.step.finishTime).toLocaleString() : (selectedTaskForModal.step.startTime ? 'Running...' : 'N/A')}
                  </span>
                </div>
              </div>

              {/* Console logs terminal UI */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '12px',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Console Log Output</span>
                  {logs && !loadingLogs && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleCopyLogs}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: copiedLogs ? '#34d399' : 'var(--text-secondary)',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                      >
                        {copiedLogs ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedLogs ? 'Copied!' : 'Copy Logs'}</span>
                      </button>
                      <button
                        onClick={handleDownloadLogs}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <Download size={11} />
                        <span>Download Logs</span>
                      </button>
                    </div>
                  )}
                </div>
                <div style={{
                  backgroundColor: '#020617',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  padding: '12px',
                  height: '240px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.74rem',
                  lineHeight: '1.4',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left'
                }}>
                  {loadingLogs ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%', color: 'var(--text-secondary)' }}>
                      <RefreshCw size={14} className="spin-anim" />
                      <span>Loading live logs from Azure DevOps...</span>
                    </div>
                  ) : selectedTaskForModal.step.logId ? (
                    logs || 'Console log is empty.'
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>
                      No live logs available. This task may have been skipped, is pending, or did not register execution logs.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedTaskForModal(null)}
                style={{ padding: '6px 16px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Blue-Green Routing & DNS Swap Drawer ─── */}
      {bgDrawerApp && (
        <>
          <div className="drawer-backdrop" onClick={() => setBgDrawerApp(null)} />
          <div className="drawer-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCompare size={18} style={{ color: 'var(--accent-purple)' }} />
                  Blue/Green Routing
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Resource: <strong>{bgDrawerApp.name}</strong> ({bgDrawerApp.type === 'frontend' ? 'Static Web App' : 'Container App'})
                </span>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setBgDrawerApp(null)}
                style={{ padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {loadingRevisions ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                <RefreshCw size={24} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Loading configuration details...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ACA Revision Routing Split (Container App only) */}
                {bgDrawerApp.type === 'backend' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>Traffic Routing Mode</h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Single Mode directs 100% traffic to the latest active revision. Multiple Mode allows custom percentage splits.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className={revisionMode === 'Single' ? 'btn-primary' : 'btn-secondary'}
                        disabled={isViewer}
                        onClick={() => handleToggleRevisionMode(bgDrawerApp.name, 'Single')}
                        style={{ flex: 1, padding: '8px', fontSize: '0.78rem', opacity: isViewer ? 0.35 : 1, cursor: isViewer ? 'not-allowed' : 'pointer' }}
                      >
                        Single Revision
                      </button>
                      <button
                        className={revisionMode === 'Multiple' ? 'btn-primary' : 'btn-secondary'}
                        disabled={isViewer}
                        onClick={() => handleToggleRevisionMode(bgDrawerApp.name, 'Multiple')}
                        style={{ flex: 1, padding: '8px', fontSize: '0.78rem', opacity: isViewer ? 0.35 : 1, cursor: isViewer ? 'not-allowed' : 'pointer' }}
                      >
                        Multiple Revisions (B/G)
                      </button>
                    </div>

                    {revisionMode === 'Multiple' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>Active Revisions Split</h4>

                        {revisions.length === 0 ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No revisions found. Deploy a new revision first.</span>
                        ) : (
                          revisions.map((rev, idx) => (
                            <div key={rev.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                                  {rev.name}
                                  {rev.latestRevision && <span style={{ marginLeft: '6px', fontSize: '0.62rem', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>Latest</span>}
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{rev.trafficWeight}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={rev.trafficWeight}
                                disabled={isViewer}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updated = [...revisions];
                                  updated[idx].trafficWeight = val;
                                  setRevisions(updated);
                                }}
                                style={{ flex: 1, accentColor: 'var(--accent-purple)', height: '4px', opacity: isViewer ? 0.35 : 1, cursor: isViewer ? 'not-allowed' : 'pointer' }}
                              />
                            </div>
                          ))
                        )}

                        {revisions.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Weight Sum:</span>
                            {(() => {
                              const sum = revisions.reduce((s, r) => s + (parseInt(r.trafficWeight) || 0), 0);
                              return (
                                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: sum === 100 ? 'var(--success)' : 'var(--error)' }}>
                                  {sum}% (Must be 100%)
                                </span>
                              );
                            })()}
                          </div>
                        )}

                        <button
                          className="btn-primary"
                          disabled={savingTraffic || isViewer || revisions.reduce((s, r) => s + (parseInt(r.trafficWeight) || 0), 0) !== 100}
                          onClick={handleSaveTrafficSplit}
                          style={{
                            marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: isViewer ? 0.35 : 1,
                            cursor: isViewer ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {savingTraffic ? <RefreshCw size={14} className="spin-anim" /> : <Sliders size={14} />}
                          <span>Save Traffic Splits</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* SWA / ACA CNAME Domain Swapping */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: bgDrawerApp.type === 'backend' ? '1px solid var(--glass-border)' : 'none', paddingTop: bgDrawerApp.type === 'backend' ? '24px' : '0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>DNS CNAME Swapping</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Swap active domains CNAME targets on GoDaddy. This instantly redirects custom DNS URLs between staging and production instances.
                    </p>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Current Domain Mapping:</span>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--accent-purple)' }}>
                      {(Array.isArray(bgDrawerApp.dnsDetails?.fqdns) && bgDrawerApp.dnsDetails.fqdns.length > 0) ? bgDrawerApp.dnsDetails.fqdns.join(', ') : (typeof bgDrawerApp.dnsDetails?.fqdns === 'string' ? bgDrawerApp.dnsDetails.fqdns : (bgDrawerApp.dnsDetails?.fqdn || 'No custom domain bound yet'))}
                    </strong>
                  </div>

                  {(() => {
                    const targets = apps.filter(a => a.type === bgDrawerApp.type && a.name !== bgDrawerApp.name && a.dnsDetails?.subdomain);
                    if (targets.length === 0) {
                      return (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No other {bgDrawerApp.type === 'frontend' ? 'SWA' : 'ACA'} resources with mapped custom subdomains found to swap DNS with.
                        </span>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Swap Target Resource:</label>
                        <select
                          value={dnsSwapTargetAppName}
                          disabled={isViewer}
                          onChange={(e) => setDnsSwapTargetAppName(e.target.value)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            fontSize: '0.8rem',
                            opacity: isViewer ? 0.35 : 1,
                            cursor: isViewer ? 'not-allowed' : 'default'
                          }}
                        >
                          <option value="">-- Choose target app --</option>
                          {targets.map(t => (
                            <option key={t.name} value={t.name}>
                              {t.name} ({(Array.isArray(t.dnsDetails?.fqdns) && t.dnsDetails.fqdns.length > 0) ? t.dnsDetails.fqdns.join(', ') : (typeof t.dnsDetails?.fqdns === 'string' ? t.dnsDetails.fqdns : t.dnsDetails?.fqdn)})
                            </option>
                          ))}
                        </select>

                        <button
                          className="btn-primary"
                          disabled={!dnsSwapTargetAppName || swappingDns || isViewer}
                          onClick={handleDnsSwap}
                          style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: isViewer ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                            opacity: isViewer ? 0.35 : 1,
                            cursor: isViewer ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {swappingDns ? <RefreshCw size={14} className="spin-anim" /> : <GitCompare size={14} />}
                          <span>Execute DNS Swap</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
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
      {/* ─── Scraped Config Code Viewer Drawer ─── */}
      {viewScrapedConfig && (
        <>
          <div className="drawer-backdrop" onClick={() => setViewScrapedConfig(null)} />
          <div className="drawer-container" style={{ width: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--divider)', paddingBottom: '16px', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Scraped Codebase Config</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Resource: <strong>{viewScrapedConfig.appName}</strong></span>
              </div>
              <button
                onClick={() => setViewScrapedConfig(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                <span style={{ fontWeight: 600 }}>Source File:</span>
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', color: 'var(--accent-teal)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {viewScrapedConfig.fileName}
                </code>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {viewScrapedConfig.fileContent ? (
                  <>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', flexShrink: 0 }}>File Content:</div>
                    <pre style={{
                      flex: 1,
                      background: '#090d16',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '16px',
                      color: '#e2e8f0',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      overflow: 'auto',
                      whiteSpace: 'pre',
                      lineHeight: 1.5,
                      margin: 0
                    }}>
                      {viewScrapedConfig.fileContent}
                    </pre>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f87171', marginBottom: '8px', flexShrink: 0 }}>
                      ⚠️ No configuration variables resolved
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.45, flexShrink: 0 }}>
                      The scanner checked the files listed below in the repository but did not find any matching environment configurations or variable definitions:
                    </div>
                    <div style={{
                      flex: 1,
                      background: '#090d16',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      overflow: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      margin: 0
                    }}>
                      {Array.isArray(viewScrapedConfig.searchedFiles) && viewScrapedConfig.searchedFiles.length > 0 ? (
                        viewScrapedConfig.searchedFiles.map((file, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.74rem',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <span style={{ fontSize: '0.8rem', opacity: 0.65 }}>🔍</span>
                            <span>{file}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                          No files were queried.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Valid Pipeline & Dockerfile Viewer Drawer ─── */}
      {viewingFileDrawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setViewingFileDrawer(null)} />
          <div className="drawer-container" style={{ width: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--divider)', paddingBottom: '16px', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {viewingFileDrawer.fileName.toLowerCase() === 'dockerfile' ? 'Dockerfile Configuration' : 'Pipeline Workflow Configuration'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Resource: <strong>{viewingFileDrawer.appName}</strong></span>
              </div>
              <button
                onClick={() => setViewingFileDrawer(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>File Path:</span>
                  <code style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', color: 'var(--accent-teal)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>
                    {viewingFileDrawer.filePath}
                  </code>
                </div>
                {!viewingFileDrawer.loading && !viewingFileDrawer.error && viewingFileDrawer.fileContent && (
                  <button
                    onClick={() => handleCopyFileCode(viewingFileDrawer.fileContent)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    <span>{copiedFileCode ? 'Copied! ✓' : 'Copy Code'}</span>
                  </button>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {viewingFileDrawer.loading ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <RefreshCw className="spin-anim" size={24} style={{ color: 'var(--accent-teal)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Loading configuration from GitHub...</span>
                  </div>
                ) : viewingFileDrawer.error ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    background: 'rgba(239, 68, 68, 0.04)',
                    borderRadius: '8px'
                  }}>
                    <AlertCircle size={24} style={{ color: 'var(--error)' }} />
                    <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600 }}>Error loading file</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{viewingFileDrawer.error}</span>
                  </div>
                ) : (
                  <pre style={{
                    flex: 1,
                    background: '#090d16',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    whiteSpace: 'pre',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {viewingFileDrawer.fileContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Multi-CI/CD Conflict Resolution Drawer */}
      {conflictDrawerApp && (
        <ConflictResolutionDrawer
          isOpen={!!conflictDrawerApp}
          onClose={() => setConflictDrawerApp(null)}
          appName={conflictDrawerApp.name}
          pipelines={loadingConflictPipelines ? [] : conflictPipelines}
          API_BASE={API_BASE}
          token={localStorage.getItem('devops_token') || ''}
          theme={theme}
          onResolved={() => {
            setConflictDrawerApp(null);
            handleScan();
          }}
        />
      )}
    </div>
  );
};

// Test trigger: live build detection poll test 2
