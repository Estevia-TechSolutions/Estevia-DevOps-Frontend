import React from 'react';
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
  Lock,
  Copy,
  Check,
  Download
} from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || `http://${window.location.hostname}:5005/api`;


const Github = ({ size = 12, ...props }: { size?: number; [key: string]: any }) => (
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
  branches?: { name: string; protected: boolean }[];
  isTestResource?: boolean;
}

interface AppGroup {
  key: string;
  label: string;
  repoPath: string;
  repoUrl: string;
  type: 'frontend' | 'backend' | 'vm';
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
}

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
  onBuildTransition
}) => {
  const isViewer = currentUser?.role === 'viewer';

  const [activeStageInfo, setActiveStageInfo] = React.useState<{appName: string, stageId: string} | null>(null);
  const [selectedJobForModal, setSelectedJobForModal] = React.useState<any | null>(null);
  const [expandedBuilds, setExpandedBuilds] = React.useState<Record<string, boolean>>({});
  const [selectedTaskForModal, setSelectedTaskForModal] = React.useState<any | null>(null);

  // Secondary actions dropdown state
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = React.useState<{top: number; left: number} | null>(null);
  // Power controls dropdown state
  const [activePowerDropdown, setActivePowerDropdown] = React.useState<string | null>(null);
  const [powerDropdownCoords, setPowerDropdownCoords] = React.useState<{top: number; left: number} | null>(null);

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

  const organizationId = currentUser?.organization_id || 'estevia';

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

  // Active dashboard tab state ('swa' | 'aca' | 'vm')
  const [activeDashboardTab, setActiveDashboardTab] = React.useState<'swa' | 'aca' | 'vm'>('swa');
  const [hoveredTab, setHoveredTab] = React.useState<'swa' | 'aca' | 'vm' | null>(null);
  const [hoveredEnv, setHoveredEnv] = React.useState<string | null>(null);
  // Fixed-position tooltip data for the group header "X Environments" hover
  const [groupTooltipData, setGroupTooltipData] = React.useState<{
    groupKey: string;
    accentColor: string;
    envs: any[];
    top: number;
    right: number;
  } | null>(null);

  // Live pipeline build runs overridden telemetry
  const [livePipelineRuns, setLivePipelineRuns] = React.useState<Record<number, any>>({});

  // Search and Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEnvFilter, setSelectedEnvFilter] = React.useState<'all' | 'dev' | 'qa' | 'prod'>('all');

  // Ref to hold live overrides and avoid dependency trigger loops in effect
  const livePipelineRunsRef = React.useRef(livePipelineRuns);
  React.useEffect(() => {
    livePipelineRunsRef.current = livePipelineRuns;
  }, [livePipelineRuns]);

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
                    apps.find(a => Object.values(livePipelineRunsRef.current).some((r: any) => r.id === runId));
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
    return appGroups.map(group => {
      const updatedEnvs = group.envs.map(app => {
        const runId = app.pipelineRun?.id;
        if (runId && livePipelineRuns[runId]) {
          return {
            ...app,
            pipelineRun: livePipelineRuns[runId]
          };
        }
        return app;
      });
      return {
        ...group,
        envs: updatedEnvs
      };
    });
  }, [appGroups, livePipelineRuns]);

  // Active Telemetry Polling for active builds
  React.useEffect(() => {
    // Find all builds that are active
    const activeBuilds = apps
      .map(app => {
        const runId = app.pipelineRun?.id;
        const liveRun = (runId && livePipelineRunsRef.current[runId]) || app.pipelineRun;
        return {
          appName: app.name,
          buildId: liveRun?.id,
          isActive: isBuildActive(liveRun)
        };
      })
      .filter(b => b.buildId && b.isActive);

    if (activeBuilds.length === 0) return;

    let isSubscribed = true;

    const pollTimeline = async () => {
      const token = localStorage.getItem('devops_token');
      for (const build of activeBuilds) {
        if (!isSubscribed) break;
        try {
          const res = await fetch(`${API_BASE}/apps/pipeline/timeline?organizationId=${organizationId}&buildId=${build.buildId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (data.success && data.pipelineRun) {
            setLivePipelineRuns(prev => ({
              ...prev,
              [build.buildId]: data.pipelineRun
            }));
            
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
  }, [apps, organizationId, selectedTaskForModal]);

  // ── New-Build Discovery Poller ──────────────────────────────────────────────
  // Runs every 30 s and fetches the LATEST build for every app that has a
  // pipelineId (regardless of whether the last known pipelineRun was active).
  // This detects newly triggered builds BEFORE the next full 5-min cloud scan.
  React.useEffect(() => {
    // Only run if there are apps with pipelines
    const appsWithPipelines = apps.filter(a => a.pipelineId);
    if (appsWithPipelines.length === 0) return;

    let isSubscribed = true;

    const discoverNewBuilds = async () => {
      const token = localStorage.getItem('devops_token');
      for (const app of appsWithPipelines) {
        if (!isSubscribed) break;
        try {
          // Resolve the branch for this specific app environment so we only get builds for the right branch
          const resolvedBranch = `refs/heads/${resolveBranchName(app)}`;
          const res = await fetch(
            `${API_BASE}/apps/pipeline/latest?organizationId=${organizationId}&pipelineId=${app.pipelineId}&branchName=${encodeURIComponent(resolvedBranch)}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (!res.ok) continue;
          const data = await res.json();
          if (!data.success || !data.pipelineRun) continue;

          const latestRun = data.pipelineRun;

          // Only inject into livePipelineRuns if:
          // 1. The build is active (inProgress / notStarted / queued), OR
          // 2. It's a brand-new build ID that isn't in livePipelineRuns yet
          const existingLiveId = app.pipelineRun?.id;
          const isNewBuild = latestRun.id !== existingLiveId;
          const isActive = isBuildActive(latestRun);

          if (isActive || isNewBuild) {
            setLivePipelineRuns(prev => ({
              ...prev,
              [latestRun.id]: latestRun
            }));
          }
        } catch (err) {
          // Silent - this is a background discovery, don't spam console
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
  }, [apps, organizationId]);

  // Fetch live DevOps step logs
  React.useEffect(() => {
    if (!selectedTaskForModal || !selectedTaskForModal.buildId || !selectedTaskForModal.step.logId) {
      setLogs('');
      return;
    }
    const fetchLogs = async () => {
      setLoadingLogs(true);
      setLogs('');
      try {
        const token = localStorage.getItem('devops_token');
        const { buildId, step } = selectedTaskForModal;
        const res = await fetch(`${API_BASE}/apps/pipeline/logs?organizationId=${organizationId}&buildId=${buildId}&logId=${step.logId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLogs(data.logs || 'No log data returned from Azure.');
        } else {
          setLogs(`Failed to fetch logs: ${data.message || 'Unknown error'}`);
        }
      } catch (err: any) {
        setLogs(`Error loading logs: ${err.message}`);
      } finally {
        setLoadingLogs(false);
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


  // Match environment segments only when they are at the end of the string or followed by a hyphen
  // This prevents false positives like 'evafusion-devhub-qa' matching as 'dev'.
  const hasEnvSegment = (n: string, seg: string) =>
    new RegExp(`-${seg}(-|$)`).test(n);

  const resolveBranchName = (app: AppResource) => {
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

  const isBuildActive = (run: any) => {
    if (!run || !run.state) return false;
    const s = run.state.toLowerCase();
    return s === 'inprogress' || s === 'running' || s === 'canceling' || s === 'cancelling' || s === 'notstarted' || s === 'queued';
  };

  // Auto-switch tabs and auto-expand/collapse accordions based on active builds (concurrent-safe)
  const prevActiveBuildGroupsRef = React.useRef<Record<string, boolean>>({});
  React.useEffect(() => {
    const nextActiveBuildGroups: Record<string, boolean> = {};
    const newlyStartedGroups: string[] = [];
    const newlyFinishedGroups: string[] = [];
    const prevActive = prevActiveBuildGroupsRef.current;

    localAppGroups.forEach(group => {
      const hasActive = group.envs.some(app => app.pipelineRun && isBuildActive(app.pipelineRun));
      if (hasActive) {
        nextActiveBuildGroups[group.key] = true;
        if (!prevActive[group.key]) {
          newlyStartedGroups.push(group.key);
        }
      } else {
        if (prevActive[group.key]) {
          newlyFinishedGroups.push(group.key);
        }
      }
    });

    // Save active builds status map for the next run
    prevActiveBuildGroupsRef.current = nextActiveBuildGroups;

    // 1. Handle newly started builds: auto-expand all of them and switch active tab to the first one
    if (newlyStartedGroups.length > 0) {
      const firstGroupKey = newlyStartedGroups[0];
      const firstGroup = localAppGroups.find(g => g.key === firstGroupKey);
      if (firstGroup) {
        let matchedTab: 'swa' | 'aca' | 'vm' | null = null;
        if (firstGroup.type === 'frontend') matchedTab = 'swa';
        else if (firstGroup.type === 'backend') matchedTab = 'aca';
        else if (firstGroup.type === 'vm') matchedTab = 'vm';
        
        if (matchedTab) {
          setActiveDashboardTab(matchedTab);
        }
      }

      setCollapsedScanGroups(prev => {
        const next = { ...prev };
        newlyStartedGroups.forEach(key => {
          next[key] = false; // Expand
        });
        return next;
      });
    }

    // 2. Handle newly completed builds: auto-collapse them
    if (newlyFinishedGroups.length > 0) {
      setCollapsedScanGroups(prev => {
        const next = { ...prev };
        newlyFinishedGroups.forEach(key => {
          console.log(`[Dashboard Auto Collapse] Build completed for group ${key}. Collapsing accordion...`);
          next[key] = true; // Collapse
        });
        return next;
      });
    }
  }, [localAppGroups, setActiveDashboardTab, setCollapsedScanGroups]);

  const getBadgeBgColor = (type: string) => {
    const isLight = theme === 'light';
    switch (type.toLowerCase()) {
      case 'frontend':
        return isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.15)';
      case 'backend':
        return isLight ? 'rgba(13, 148, 136, 0.1)' : 'rgba(16, 185, 129, 0.15)';
      case 'vm':
        return isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.15)';
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
      default:
        return isLight ? '#475569' : '#94a3b8';
    }
  };

  const getStageColor = (result: string | null, state: string) => {
    if (state === 'inProgress') return 'var(--accent-purple)';
    if (state === 'waiting') return 'var(--text-secondary)';
    if (result === 'succeeded') return 'var(--success)';
    if (result === 'failed') return 'var(--error)';
    if (result === 'canceled') return '#ef4444';
    if (result === 'skipped') return 'rgba(255,255,255,0.25)';
    return 'var(--text-secondary)';
  };

  const getStageIcon = (result: string | null, state: string) => {
    if (state === 'inProgress') {
      return <RefreshCw size={11} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />;
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
    dev:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)',  label: 'DEV'  },
    qa:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  label: 'QA'   },
    prod: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)',  label: 'PROD' },
  };

  const getEnvTag = (name: string): { color: string; bg: string; border: string; label: string } => {
    const n = name.toLowerCase();
    if (hasEnvSegment(n, 'dev'))  return ENV_COLORS.dev;
    if (hasEnvSegment(n, 'qa'))   return ENV_COLORS.qa;
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
        const envTag = getEnvTag(app.name).label.toLowerCase();
        const matchesEnv = selectedEnvFilter === 'all' || envTag === selectedEnvFilter;

        return matchesSearch && matchesEnv;
      });

      return {
        ...group,
        envs: filteredEnvs
      };
    }).filter(group => group.envs.length > 0);
  }, [localAppGroups, searchQuery, selectedEnvFilter]);

  const getCardStyles = (name: string, theme: 'dark' | 'light') => {
    const n = name.toLowerCase();
    const isLight = theme === 'light';
    
    if (hasEnvSegment(n, 'dev')) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(219, 234, 254, 0.95) 0%, rgba(239, 246, 255, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(96, 165, 250, 0.22) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: isLight ? 'rgba(96, 165, 250, 0.45)' : 'rgba(96, 165, 250, 0.35)',
        color: '#60a5fa'
      };
    }
    if (hasEnvSegment(n, 'qa')) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(255, 251, 235, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
        border: isLight ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.35)',
        color: '#f59e0b'
      };
    }
    if (hasEnvSegment(n, 'prod')) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.95) 0%, rgba(240, 253, 250, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: isLight ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.35)',
        color: '#34d399'
      };
    }
    const noSuffix = !n.endsWith('-dev') && !n.includes('-dev-') &&
                     !n.endsWith('-qa')  && !n.includes('-qa-')  &&
                     !n.endsWith('-prod') && !n.includes('-prod-') &&
                     !n.endsWith('-staging') && !n.endsWith('-test');
    if (noSuffix) {
      return {
        background: isLight 
          ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.95) 0%, rgba(240, 253, 250, 0.99) 100%)' 
          : 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: isLight ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.35)',
        color: '#34d399'
      };
    }
    
    return {
      background: isLight 
        ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.99) 100%)' 
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      border: isLight ? '#e2e8f0' : 'var(--glass-border)',
      color: 'var(--text-secondary)'
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
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertCircle style={{ color: 'var(--error)' }} />
          <span>{scanError}</span>
        </div>
      )}

      {(scanning || scanProgress > 0) && apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={48} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
          <div>
            <h3 style={{ margin: 0 }}>Fetching Live Subscriptions... {Math.floor(scanProgress)}%</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>Scanning Static Web Apps and Container Apps in resource group...</p>
          </div>
          <div style={{ width: '100%', maxWidth: '400px', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 10px var(--accent-purple-glow)', transition: 'width 0.15s ease-out', borderRadius: '4px' }} />
          </div>
        </div>
      ) : apps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Search size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3>No active resources discovered</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Click the "Scan Active Cloud" button above to query Azure subscription.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Glassmorphic Search & Filter Bar */}
          <div className="glass-panel" style={{
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Search Input wrapper */}
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
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

            {/* Env Filter Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)'
            }}>
              {(['all', 'dev', 'qa', 'prod'] as const).map((env) => {
                const isActive = selectedEnvFilter === env;
                // Env color styles for active filter
                const activeColor = env === 'dev' ? '#60a5fa' 
                                  : env === 'qa' ? '#f59e0b'
                                  : env === 'prod' ? '#34d399'
                                  : 'var(--accent-purple)';
                const activeBg = env === 'dev' ? 'rgba(96,165,250,0.15)'
                               : env === 'qa' ? 'rgba(245,158,11,0.15)'
                               : env === 'prod' ? 'rgba(52,211,153,0.15)'
                               : 'rgba(139,92,246,0.15)';
                const activeBorder = env === 'dev' ? 'rgba(96,165,250,0.3)'
                                  : env === 'qa' ? 'rgba(245,158,11,0.3)'
                                  : env === 'prod' ? 'rgba(52,211,153,0.3)'
                                  : 'rgba(139,92,246,0.3)';

                return (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setSelectedEnvFilter(env)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: isActive ? `1px solid ${activeBorder}` : '1px solid transparent',
                      background: isActive ? activeBg : 'transparent',
                      color: isActive ? activeColor : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {env}
                  </button>
                );
              })}
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

            const visibleCategories = allCategories.filter(c => c.groups.length > 0);
            // Default to first visible tab if activeDashboardTab not visible
            const activeTab = visibleCategories.find(c => c.key === activeDashboardTab) ? activeDashboardTab : (visibleCategories[0]?.key ?? 'swa');
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(activeCategory?.groups ?? []).map((group) => {
                    const accentColor = group.type === 'vm' ? '#f59e0b' : (group.type === 'frontend' ? 'var(--accent-purple)' : 'var(--accent-teal)');
                    const accentBg = group.type === 'vm' ? 'rgba(245,158,11,0.1)' : (group.type === 'frontend' ? 'rgba(139,92,246,0.1)' : 'rgba(20,184,166,0.1)');
                    const accentGlow = group.type === 'vm' ? '0 0 10px rgba(245,158,11,0.4)' : (group.type === 'frontend' ? '0 0 10px var(--accent-purple-glow)' : '0 0 10px var(--accent-teal-glow)');

                    const isCollapsed = collapsedScanGroups[group.key] !== false;
                    const groupHasActiveDeployment = group.envs.some(app => !!(app.pipelineRun && isBuildActive(app.pipelineRun)));

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
                  {groupHasActiveDeployment && (
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
                      const tag = getEnvTag(item.name);
                      const cardStyle = getCardStyles(item.name, theme);
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
                              {item.dnsDetails?.fqdn && (
                                <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                  <Globe size={12} style={{ opacity: 0.7, color: 'var(--accent-purple)', flexShrink: 0 }} />
                                  <span>Domain: <a 
                                    href={`https://${item.dnsDetails.fqdn}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}
                                  >
                                    {item.dnsDetails.fqdn}
                                  </a></span>
                                </div>
                              )}
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
                                {item.pipelineRun && isBuildActive(item.pipelineRun) && (
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
                                )}
                              </div>

                              {/* Pipeline Details */}
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                <Server size={12} style={{ opacity: 0.7, color: 'var(--accent-teal)', flexShrink: 0 }} />
                                <span>Pipeline: <strong style={{ color: item.pipelineName ? 'var(--success)' : '#ef4444' }}>{item.pipelineName || 'Not Set'}</strong></span>
                              </div>
                            </div>
                          </div>


                           {/* Action Buttons & Decluttered controls */}
                           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {/* Glowing status indicator dot */}
                              {(() => {
                                const statusInfo = getStatusDetails(item.status, item.type);
                                return (
                                  <div style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    padding: '3px 8px', 
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--glass-border)',
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    zIndex: 5
                                  }} title={`Status: ${statusInfo.label}`}>
                                    <span style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: statusInfo.color,
                                      boxShadow: `0 0 6px ${statusInfo.glow}`,
                                      display: 'inline-block'
                                    }} />
                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{statusInfo.label}</span>
                                  </div>
                                );
                              })()}

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
                                      disabled={isViewer}
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
                                        backgroundColor: isViewer ? 'transparent' : (bgModeState[item.name] !== 'Multiple' && item.status !== 'multiple') ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                                        color: isViewer ? 'rgba(255,255,255,0.35)' : (bgModeState[item.name] !== 'Multiple' && item.status !== 'multiple') ? '#fff' : 'var(--text-secondary)',
                                        cursor: isViewer ? 'not-allowed' : 'pointer',
                                        opacity: isViewer ? 0.35 : 1,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      Single
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isViewer}
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
                                        backgroundColor: isViewer ? 'transparent' : (bgModeState[item.name] === 'Multiple' || item.status === 'multiple') ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                                        color: isViewer ? 'rgba(255,255,255,0.35)' : (bgModeState[item.name] === 'Multiple' || item.status === 'multiple') ? '#fff' : 'var(--text-secondary)',
                                        cursor: isViewer ? 'not-allowed' : 'pointer',
                                        opacity: isViewer ? 0.35 : 1,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      Multi
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn-secondary"
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
                                      background: 'rgba(255, 255, 255, 0.04)',
                                      cursor: 'pointer'
                                    }}
                                    title="Configure Traffic Split"
                                  >
                                    <Sliders size={11} style={{ color: 'var(--accent-purple)' }} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
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
                                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    color: 'var(--accent-purple, #8b5cf6)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                  }}
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
                                      onClick={(e) => { e.stopPropagation(); openDnsModal(item); setActiveDropdown(null); setDropdownCoords(null); }}
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <Globe size={12} style={{ color: 'var(--accent-purple)' }} />
                                      <span>DNS Settings</span>
                                    </button>

                                    {item.pipelineId ? (
                                      <a 
                                        href={(() => {
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
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', color: 'var(--text-primary)', width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}
                                        onClick={() => setActiveDropdown(null)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                      >
                                        <GitBranch size={12} style={{ color: 'var(--accent-teal)' }} />
                                        <span>View CI/CD Pipeline</span>
                                      </a>
                                    ) : (
                                       <button 
                                         type="button"
                                         disabled={isViewer}
                                         onClick={(e) => { e.stopPropagation(); openPipelineModal(item, group); setActiveDropdown(null); }}
                                         style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: isViewer ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: isViewer ? 'not-allowed' : 'pointer', opacity: isViewer ? 0.35 : 1 }}
                                         onMouseEnter={(e) => { if (!isViewer) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                         onMouseLeave={(e) => { if (!isViewer) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                       >
                                         <PlusCircle size={12} style={{ color: isViewer ? 'rgba(255,255,255,0.35)' : 'var(--accent-purple)' }} />
                                         <span>Setup CI/CD</span>
                                       </button>
                                    )}

                                    {item.type === 'backend' && onShowLogs && (
                                      <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onShowLogs(item.name); setActiveDropdown(null); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                      >
                                        <Terminal size={12} style={{ color: 'var(--accent-blue)' }} />
                                        <span>View Logs</span>
                                      </button>
                                    )}

                                    {onCloneApp && (
                                      <button 
                                        type="button"
                                        disabled={isViewer}
                                        onClick={(e) => { e.stopPropagation(); onCloneApp(item); setActiveDropdown(null); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.75rem', background: 'none', border: 'none', color: isViewer ? 'rgba(255,255,255,0.35)' : 'var(--text-primary)', width: '100%', textAlign: 'left', cursor: isViewer ? 'not-allowed' : 'pointer', opacity: isViewer ? 0.35 : 1 }}
                                        onMouseEnter={(e) => { if (!isViewer) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                        onMouseLeave={(e) => { if (!isViewer) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                      >
                                        <GitBranch size={12} style={{ color: isViewer ? 'rgba(255,255,255,0.35)' : 'var(--success)' }} />
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
                        </div>

                        {/* Visual Deployment Pipeline Run Progress (moved below details & actions with a collapsible divider) */}
                        {item.pipelineRun && (() => {
                          const isExpanded = expandedBuilds[item.name] ?? isBuildActive(item.pipelineRun);
                          const isLight = theme === 'light';
                          const runStatus = isBuildActive(item.pipelineRun) ? 'BUILDING' : item.pipelineRun.result || item.pipelineRun.state;
                          const runStatusColor = getStageColor(item.pipelineRun.result, item.pipelineRun.state);
                          
                          return (
                            <div style={{ 
                              borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`, 
                              paddingTop: '12px', 
                              marginTop: '8px',
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
                                  </div>
                                  
                                  {/* Right side Actions (CI/CD Pipeline Link) */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {item.pipelineId ? (
                                      <a 
                                        href={(() => {
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
                                 disabled={isViewer}
                                 onClick={() => onDeployBranch(group.repoPath, branch.name, group.type as 'frontend' | 'backend')}
                                 style={{ 
                                   padding: '6px 12px', 
                                   fontSize: '0.75rem', 
                                   display: 'flex', 
                                   alignItems: 'center', 
                                   justifyContent: 'center', 
                                   gap: '6px',
                                   borderColor: isViewer ? 'var(--glass-border)' : unlinkedStyle.color,
                                   color: isViewer ? 'var(--text-muted)' : 'var(--text-primary)',
                                   background: isViewer ? 'rgba(255,255,255,0.01)' : (theme === 'light' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.05)'),
                                   cursor: isViewer ? 'not-allowed' : 'pointer',
                                   opacity: isViewer ? 0.6 : 1
                                 }}
                                 onMouseEnter={(e) => {
                                   if (isViewer) return;
                                   e.currentTarget.style.background = theme === 'light' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.15)';
                                   e.currentTarget.style.boxShadow = `0 0 8px ${theme === 'light' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.4)'}`;
                                 }}
                                 onMouseLeave={(e) => {
                                   if (isViewer) return;
                                   e.currentTarget.style.background = theme === 'light' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.05)';
                                   e.currentTarget.style.boxShadow = 'none';
                                 }}
                               >
                                 <PlusCircle size={12} style={{ color: isViewer ? 'var(--text-muted)' : unlinkedStyle.color }} />
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
            </>
            );
          })()}
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

              if (run) {
                if (isBuildActive(run)) {
                  timeLabel = '🔄 Building now…';
                  timeColor = '#34d399';
                  statusLabel = 'BUILDING';
                  statusColor = '#34d399';
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

              const envTag = getEnvTag(env.name);
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
                        letterSpacing: '0.03em'
                      }}>{statusLabel}</span>
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
                      {bgDrawerApp.dnsDetails?.fqdn || 'No custom domain bound yet'}
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
                              {t.name} ({t.dnsDetails?.fqdn})
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
    </div>
  );
};
