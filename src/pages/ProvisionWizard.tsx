import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  ExternalLink,
  Pencil,
  Check,
  GitCommit,
  X,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  GitMerge,
  Rocket,
  Cpu,
  Database,
  Server
} from 'lucide-react';
import { isFixable, applyAutoFix } from '../utils/autoFixEngine';
import { DiffViewer } from '../components/DiffViewer';

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

  const theme = localStorage.getItem('devops_theme') || 'dark';

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

interface AppResource {
  name: string;
  type: 'frontend' | 'backend' | 'vm' | 'cluster' | 'database' | 'network' | 'registry' | string;
  location: string;
  hostname: string;
  resourceId: string;
  status: string;
  repositoryUrl: string;
  repo_url?: string;
  gitUrl?: string;
  subscriptionId?: string;
  resourceGroup?: string;
  environment?: string;
  targetEnvironment?: string;
  azureResourceDetails?: {
    resourceId?: string;
    subscriptionId?: string;
    resourceGroup?: string;
    repoUrl?: string;
    repo_url?: string;
    scrapedSourceFile?: string;
    scrapedSourceContent?: string;
    managedEnvironmentId?: string;
    branch?: string;
    targetBranch?: string;
    environment?: string;
    targetEnvironment?: string;
  };
  dnsDetails?: {
    subdomain?: string;
    domain?: string;
    fqdn?: string;
    mappedAt?: string;
  };
}

interface ProvisionWizardProps {
  pipelineProvider: 'azure_devops' | 'github_actions';
  setPipelineProvider: (val: 'azure_devops' | 'github_actions') => void;
  provisionStep: number;
  setProvisionStep: (val: number) => void;
  appType: 'frontend' | 'backend' | 'cluster' | 'database';
  setAppType: (val: 'frontend' | 'backend' | 'cluster' | 'database') => void;
  newName: string;
  setNewName: (val: string) => void;
  newLocation: string;
  setNewLocation: (val: string) => void;
  targetPort: string;
  setTargetPort: (val: string) => void;
  selectedRepo: string;
  setSelectedRepo: (val: string) => void;
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedBranches: string[];
  setSelectedBranches: (val: string[]) => void;
  branches: any[];
  setBranches: (val: any[]) => void;
  loadingBranches: boolean;
  fetchBranches?: (repoFullName: string, targetBranch?: string) => Promise<void>;
  apps: AppResource[];
  ymlLoading: boolean;
  ymlError: string | null;
  setYmlError: (val: string | null) => void;
  ymlContent: string;
  ymlOriginal: string;
  setYmlContent: (val: string) => void;
  ymlSource: 'github' | 'template' | null;
  creatingYml: boolean;
  provisioning: boolean;
  provisionSuccess: string | null;
  setProvisionSuccess: (val: string | null) => void;
  provisionError: string | null;
  setProvisionError: (val: string | null) => void;
  pipelineRegSuccess: boolean;
  setPipelineRegSuccess: (val: boolean) => void;
  pipelineRegError: string | null;
  setPipelineRegError: (val: string | null) => void;
  pipelineRegistering: boolean;
  registeredPipelineUrl: string;
  dnsBindSuccess: boolean;
  setDnsBindSuccess: (val: boolean) => void;
  dnsBindError: string | null;
  setDnsBindError: (val: string | null) => void;
  dnsBinding: boolean;
  domainInput: string;
  getCategorizedRepos: (appType?: 'frontend' | 'backend' | 'cluster' | 'database') => { recommended: any[]; other: any[] };
  handleAppTypeChange: (type: 'frontend' | 'backend' | 'cluster' | 'database') => void;
  handleRepoChange: (repoName: string) => void;
  handleMoveToStep2: () => void;
  handleCommitCustomYml: () => void;
  handleProvision: (e: React.FormEvent) => void;
  handleRegisterPipeline: () => void;
  handleDnsBind: () => void;
  organizationId: string;
  API_BASE: string;

  // New AKS and Database provisioning states passed from App.tsx
  kubernetesVersion: string;
  setKubernetesVersion: (val: string) => void;
  nodeCount: number;
  setNodeCount: (val: number) => void;
  vmSize: string;
  setVmSize: (val: string) => void;
  subnetId: string;
  setSubnetId: (val: string) => void;
  dbSkuName: string;
  setDbSkuName: (val: string) => void;
  dbSkuTier: string;
  setDbSkuTier: (val: string) => void;
  dbVersion: string;
  setDbVersion: (val: string) => void;
  dbAdminUsername: string;
  setDbAdminUsername: (val: string) => void;
  dbAdminPassword: string;
  setDbAdminPassword: (val: string) => void;
  virtualNetworks: any[];

  // Metadata dropdown state variables
  locations: any[];
  resourceGroups: string[];
  managedEnvironments: any[];
  containerRegistries: any[];
  serviceConnections: { arm: any[]; docker: any[] };
  loadingMetadata: boolean;

  // New Step 3 config states passed from App.tsx
  selectedResourceGroup: string;
  setSelectedResourceGroup: (val: string) => void;
  selectedManagedEnvironment: string;
  setSelectedManagedEnvironment: (val: string) => void;
  selectedCpu: string;
  setSelectedCpu: (val: string) => void;
  selectedMemory: string;
  setSelectedMemory: (val: string) => void;
  minReplicas: number;
  setMinReplicas: (val: number) => void;
  maxReplicas: number;
  setMaxReplicas: (val: number) => void;

  // SWA build paths
  customAppLocation: string;
  setCustomAppLocation: (val: string) => void;
  customApiLocation: string;
  setCustomApiLocation: (val: string) => void;
  customOutputLocation: string;
  setCustomOutputLocation: (val: string) => void;
  
  // Dockerfile checks
  dockerfileMissing: boolean;
  setDockerfileMissing: (val: boolean) => void;
  committingDockerfile: boolean;
  setCommittingDockerfile: (val: boolean) => void;
  dockerfileCheckError: string | null;
  setDockerfileCheckError: (val: string | null) => void;
  checkDockerfile: (repo: string, branch: string) => Promise<boolean>;
  commitDefaultDockerfile: (repo: string, branch: string, port: string) => Promise<boolean>;
  dockerfileChecked: boolean;
  dockerfileContent: string;
  dockerfileLoading: boolean;
  fetchDockerfileContent: (repo: string, branch: string) => Promise<void>;
  pushDockerfileContent: (repo: string, branch: string, content: string, commitMsg?: string) => Promise<{ success: boolean; message: string }>;
  provisionErrorDetail: string | null;
  setConfirmDialog: (val: any) => void;
  currentUser?: any;
  repoIntegrity: any | null;
  repoIntegrityLoading: boolean;
  provisionYmlValidation?: any;
  provisionYmlValidating?: boolean;
  selectedProvisionSubscriptionId: string;
  setSelectedProvisionSubscriptionId: (val: string) => void;
  subscriptionsList: any[];
}

/* ── Dockerfile Editor Step Sub-Component ── */
export interface DockerfileEditorStepProps {
  selectedRepo: string;
  selectedBranch: string;
  dockerfileLoading: boolean;
  dockerfileContent: string;
  fetchDockerfileContent: (repo: string, branch: string) => Promise<void>;
  pushDockerfileContent: (repo: string, branch: string, content: string, commitMsg?: string) => Promise<{ success: boolean; message: string }>;
  onBack: () => void;
  onNext: () => void;
  isViewer?: boolean;
  API_BASE: string;
}

export const DockerfileEditorStep: React.FC<DockerfileEditorStepProps> = ({
  selectedRepo, selectedBranch, dockerfileLoading, dockerfileContent,
  fetchDockerfileContent, pushDockerfileContent, onBack, onNext, isViewer,
  API_BASE
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [commitMsg, setCommitMsg] = useState('chore: update Dockerfile [via EvaOps DevOps Hub]');
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local validation states
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'diff'>('editor');

  useEffect(() => {
    if (!editMode) setViewMode('editor');
  }, [editMode]);

  useEffect(() => {
    const contentToValidate = editMode ? editedContent : dockerfileContent;
    if (!contentToValidate || !contentToValidate.trim()) {
      setValidationResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const token = localStorage.getItem('devops_token');
        const res = await fetch(`${API_BASE}/apps/validate-dockerfile`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ content: contentToValidate })
        });
        const data = await res.json();
        setValidationResult(data);
      } catch (e) {
        setValidationResult(null);
      } finally {
        setIsValidating(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [editedContent, dockerfileContent, editMode, API_BASE]);

  const handleEditToggle = () => {
    if (!editMode) setEditedContent(dockerfileContent);
    setEditMode(v => !v);
    setPushResult(null);
  };

  const handlePush = async () => {
    setPushing(true);
    setPushResult(null);
    const result = await pushDockerfileContent(selectedRepo, selectedBranch, editedContent, commitMsg);
    setPushResult({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) setEditMode(false);
    setPushing(false);
  };

  const handleRefresh = () => {
    setPushResult(null);
    fetchDockerfileContent(selectedRepo, selectedBranch);
  };

  const displayContent = editMode ? editedContent : dockerfileContent;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <GitCommit style={{ color: 'var(--accent-purple)' }} />
          Verify &amp; Edit Dockerfile
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Refresh button */}
          <button type="button" onClick={handleRefresh} disabled={dockerfileLoading || pushing}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <RefreshCw size={13} className={dockerfileLoading ? 'spin-anim' : ''} /> Refresh
          </button>
          {/* Edit / Cancel toggle */}
          {dockerfileContent && (
            <button type="button" onClick={handleEditToggle} disabled={isViewer || pushing}
              style={{ 
                background: editMode ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', 
                border: `1px solid ${editMode ? 'var(--error)' : 'var(--glass-border)'}`, 
                color: isViewer ? 'var(--text-muted)' : (editMode ? 'var(--error)' : 'var(--accent-purple)'), 
                borderRadius: '8px', 
                padding: '6px 14px', 
                cursor: isViewer ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.82rem', 
                fontWeight: 500,
                opacity: isViewer ? 0.6 : 1
              }}
            >
              {editMode ? <><X size={13} /> Cancel</> : <><Pencil size={13} /> Edit</>}
            </button>
          )}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Dockerfile in <strong>{selectedRepo}</strong> on branch <strong>{selectedBranch}</strong>.
        {editMode && <span style={{ color: 'var(--accent-purple)', marginLeft: '8px', fontWeight: 500 }}>✏ Edit mode active — changes will be pushed to GitHub.</span>}
      </p>

      {/* Push result banner */}
      {pushResult && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px',
          color: pushResult.type === 'success' ? 'var(--success)' : 'var(--error)',
          background: pushResult.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${pushResult.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
        }}>
          {pushResult.type === 'success' ? <Check size={15} /> : <X size={15} />}
          {pushResult.text}
        </div>
      )}

      {/* Dockerfile content area */}
      <div style={{ marginBottom: '16px' }}>
        {dockerfileLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'rgba(0,0,0,0.1)' }}>
            <RefreshCw size={22} className="spin-anim" style={{ color: 'var(--accent-purple)', marginRight: '10px' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading Dockerfile from GitHub...</span>
          </div>
        ) : !dockerfileContent ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'rgba(0,0,0,0.1)', color: 'var(--text-secondary)', gap: '10px' }}>
            <AlertTriangle size={28} style={{ color: 'var(--error)', opacity: 0.7 }} />
            <span>No Dockerfile could be loaded from GitHub.</span>
          </div>
        ) : editMode ? (
          <>
            {editedContent !== dockerfileContent && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  style={{
                    background: viewMode === 'editor' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    border: `1px solid ${viewMode === 'editor' ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                    color: viewMode === 'editor' ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                  onClick={() => setViewMode('diff')}
                  style={{
                    background: viewMode === 'diff' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    border: `1px solid ${viewMode === 'diff' ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                    color: viewMode === 'diff' ? 'var(--text-primary)' : 'var(--text-secondary)',
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

            {viewMode === 'diff' ? (
              <div style={{ marginBottom: '20px' }}>
                <DiffViewer original={dockerfileContent} current={editedContent} theme={localStorage.getItem('devops_theme') || 'dark'} />
              </div>
            ) : (
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%', minHeight: '360px', padding: '16px', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.35)', border: '1px solid var(--accent-purple)',
                  color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem',
                  lineHeight: '1.5', resize: 'vertical', boxSizing: 'border-box',
                  outline: 'none', caretColor: 'var(--accent-purple)',
                }}
              />
            )}
          </>
        ) : (
          <pre style={{
            margin: 0, padding: '16px', borderRadius: '10px',
            background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem',
            overflowX: 'auto', lineHeight: '1.5', maxHeight: '360px', overflowY: 'auto',
          }}>
            {displayContent}
          </pre>
        )}
      </div>

      {/* Dockerfile validation panel */}
      <div style={{ marginBottom: '16px' }}>
        {renderValidationPanel(
          validationResult,
          isValidating,
          editMode ? editedContent : dockerfileContent,
          (val) => {
            if (!editMode) setEditMode(true);
            setEditedContent(val);
          },
          'dockerfile'
        )}
      </div>

      {/* Commit message + Push button (only in edit mode) */}
      {editMode && (
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Commit Message</label>
          <input
            type="text"
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            placeholder="chore: update Dockerfile"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <button type="button" className="btn-primary" onClick={handlePush}
            disabled={pushing || !editedContent.trim() || (validationResult?.errors && validationResult.errors.length > 0)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {pushing
              ? <><RefreshCw size={14} className="spin-anim" /> Pushing to GitHub...</>
              : <><GitCommit size={14} /> Push to GitHub</>}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
        <button type="button" className="btn-secondary" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn-primary"
          disabled={dockerfileLoading || !dockerfileContent || editMode || (validationResult?.errors && validationResult.errors.length > 0)}
          onClick={onNext}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Configure Azure Resources <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Step1Content — GitHub Source Selection with Repo Integrity
   ───────────────────────────────────────────────────────────── */
interface Step1ContentProps {
  pipelineProvider: 'azure_devops' | 'github_actions';
  setPipelineProvider: (val: 'azure_devops' | 'github_actions') => void;
  appType: 'frontend' | 'backend' | 'cluster' | 'database';
  handleAppTypeChange: (type: 'frontend' | 'backend' | 'cluster' | 'database') => void;
  selectedRepo: string;
  handleRepoChange: (repo: string) => void;
  getCategorizedRepos: (type?: 'frontend' | 'backend' | 'cluster' | 'database') => { recommended: any[]; other: any[] };
  selectedBranches: string[];
  setSelectedBranches: (val: string[]) => void;
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  branches: { name: string; protected: boolean }[];
  setBranches: (val: any[]) => void;
  loadingBranches: boolean;
  fetchBranches?: (repo: string) => Promise<void>;
  apps: AppResource[];
  repoIntegrity: any | null;
  repoIntegrityLoading: boolean;
  handleMoveToStep2: () => void;
  isViewer: boolean;
  subscriptionsList: any[];
  selectedProvisionSubscriptionId?: string;
}

const CONFIDENCE_LABEL: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
const CONFIDENCE_COLOR: Record<string, string> = { high: 'var(--success)', medium: 'var(--warning)', low: 'var(--text-muted)' };
const TYPE_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  backend:  { bg: 'var(--type-backend-bg)', border: 'var(--type-backend-border)', text: 'var(--type-backend-text)' },
  frontend: { bg: 'var(--type-frontend-bg)', border: 'var(--type-frontend-border)', text: 'var(--type-frontend-text)' },
  mixed:    { bg: 'var(--type-mixed-bg)', border: 'var(--type-mixed-border)', text: 'var(--type-mixed-text)' },
  unknown:  { bg: 'var(--type-unknown-bg)', border: 'var(--type-unknown-border)', text: 'var(--type-unknown-text)' },
};
const TYPE_LABEL: Record<string, string> = { backend: 'BACKEND', frontend: 'FRONTEND', mixed: 'MIXED', unknown: 'UNKNOWN' };
const TYPE_ICON: Record<string, React.ReactNode> = {
  backend:  <GitMerge size={12} />,
  frontend: <Globe size={12} />,
  mixed:    <AlertOctagon size={12} />,
  unknown:  <HelpCircle size={12} />,
};

const Step1Content: React.FC<Step1ContentProps> = ({
  pipelineProvider, setPipelineProvider,
  appType, handleAppTypeChange, selectedRepo, handleRepoChange, getCategorizedRepos,
  selectedBranches, setSelectedBranches, selectedBranch, setSelectedBranch,
  branches, setBranches, loadingBranches, fetchBranches, apps,
  repoIntegrity, repoIntegrityLoading, handleMoveToStep2, isViewer, subscriptionsList,
  selectedProvisionSubscriptionId
}) => {
  const [activeTab, setActiveTab] = React.useState<'configure' | 'integrity'>('configure');
  const [mixedOverride, setMixedOverride] = React.useState(false);

  // Reset tab and override when repo changes
  React.useEffect(() => {
    setActiveTab('configure');
    setMixedOverride(false);
  }, [selectedRepo]);

  // Integrity check for the currently selected primary deploy branch
  const primaryBranch = selectedBranch || selectedBranches[0] || null;
  const branchIntegrity = repoIntegrity?.branches?.find((b: any) => b.name === primaryBranch) ?? null;

  // The primary/default branch returned by GitHub's repository details
  const githubDefaultBranch = repoIntegrity?.defaultBranch || 'main';

  const detectedType: string = branchIntegrity?.detectedType ?? 'unknown';
  const confidence: string = branchIntegrity?.confidence ?? 'low';

  // Block if detected type contradicts selected app type, with sufficient confidence
  const isHardBlock =
    confidence !== 'low' &&
    ((detectedType === 'backend' && appType === 'frontend') ||
     (detectedType === 'frontend' && appType === 'backend'));

  const isMixedWarn = detectedType === 'mixed' && confidence !== 'low';

  // Determine the correct type hint for hard-block guidance
  const correctType = detectedType === 'backend' ? 'Backend ACA Container' : 'Frontend SWA';

  const canProceed = !isViewer && (
    ((appType === 'frontend' || appType === 'backend') && selectedRepo && selectedBranches.length > 0 && !loadingBranches && !isHardBlock && (!isMixedWarn || mixedOverride)) ||
    (appType === 'cluster' || appType === 'database')
  );

  // Count integrity issues for badge
  const integrityIssueCount = repoIntegrity?.issues?.length ?? 0;

  return (
    <div>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <GitBranch style={{ color: 'var(--accent-purple)' }} />
        Select GitHub Repository &amp; Branches
      </h3>

      {/* ── Tab strip ── */}
      {selectedRepo && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0' }}>
          {[
            { id: 'configure', label: 'Configure Deployment', icon: <Settings size={13} /> },
            {
              id: 'integrity',
              label: 'Repo Integrity',
              icon: repoIntegrityLoading
                ? <RefreshCw size={13} className="spin-anim" />
                : integrityIssueCount > 0
                  ? <AlertOctagon size={13} />
                  : <CheckCircle size={13} />,
              badge: integrityIssueCount > 0 ? integrityIssueCount : null,
            }
          ].map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '0.84rem', fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--accent-purple)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-purple)' : '2px solid transparent',
                marginBottom: '-1px', transition: 'all 0.2s ease',
              }}>
              {tab.icon}
              {tab.label}
              {(tab as any).badge != null && (
                <span style={{ background: 'var(--error)', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {(tab as any).badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════
          CONFIGURE DEPLOYMENT TAB
          ══════════════════════════════════════════ */}
      {activeTab === 'configure' && (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
            Choose the application type. For web applications, select the GitHub source repository. For managed cloud infrastructure, proceed directly to resource setup.
          </p>

          {/* App Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Application Type</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', width: '100%' }}>
              {(['frontend', 'backend', 'cluster', 'database'] as const).map(t => (
                <button key={t} type="button"
                  className={appType === t ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => handleAppTypeChange(t)}
                  style={{
                    flex: 1, 
                    padding: '10px 4px', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    // Amber highlight when this is the correct type for a hard-blocked branch
                    outline: isHardBlock && detectedType === t ? '2px solid var(--warning)' : 'none',
                    outlineOffset: '2px',
                  }}>
                  {t === 'frontend' && <Globe size={14} />}
                  {t === 'backend' && <Cpu size={14} />}
                  {t === 'cluster' && <Server size={14} />}
                  {t === 'database' && <Database size={14} />}
                  {t === 'frontend' ? 'Frontend SWA' : t === 'backend' ? 'Backend ACA' : t === 'cluster' ? 'AKS Cluster' : 'MySQL Database'}
                </button>
              ))}
            </div>
          </div>

          {(appType === 'frontend' || appType === 'backend') ? (
            <>
              {/* CI/CD Provider Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>CI/CD Pipeline Provider</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button"
                    className={pipelineProvider === 'azure_devops' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setPipelineProvider('azure_devops')}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                    Azure DevOps Pipelines
                  </button>
                  <button type="button"
                    className={pipelineProvider === 'github_actions' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setPipelineProvider('github_actions')}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                    GitHub Actions
                  </button>
                </div>
              </div>

              {/* Repository Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>GitHub Repository</label>
                <select value={selectedRepo} onChange={e => handleRepoChange(e.target.value)}
                  style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>-- Choose Repository --</option>
                  {(() => {
                    const { recommended, other } = getCategorizedRepos(appType);
                    return (<>
                      {recommended.length > 0 && (
                        <optgroup label="Recommended Repositories" style={{ background: 'var(--bg-secondary)' }}>
                          {recommended.map(r => <option key={r.id} value={r.fullName} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{r.fullName}</option>)}
                        </optgroup>
                      )}
                      {other.length > 0 && (
                        <optgroup label="Other Repositories" style={{ background: 'var(--bg-secondary)' }}>
                          {other.map(r => <option key={r.id} value={r.fullName} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{r.fullName}</option>)}
                        </optgroup>
                      )}
                    </>);
                  })()}
                </select>
              </div>

          {/* Branches */}
          {selectedRepo && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Target Branches (triggers in YML)</label>
                <button type="button" onClick={() => fetchBranches && fetchBranches(selectedRepo)} disabled={loadingBranches}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={12} className={loadingBranches ? 'spin-anim' : ''} /> Refresh
                </button>
              </div>
              {loadingBranches ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <RefreshCw size={14} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading repository branches...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', padding: '8px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)', width: '100%', boxSizing: 'border-box' }}>
                  {branches.map(b => {
                    const isChecked = selectedBranches.includes(b.name);
                    return (
                      <label key={b.name} className={`branch-checkbox-item ${isChecked ? 'selected' : ''}`}>
                        <input type="checkbox" checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) setSelectedBranches([...selectedBranches, b.name]);
                            else setSelectedBranches(selectedBranches.filter(x => x !== b.name));
                          }}
                          style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px', cursor: 'pointer' }} />
                        <span style={{ minWidth: 0, wordBreak: 'break-all', whiteSpace: 'normal', lineHeight: '1.4' }}>
                          {b.name}{b.protected ? ' 🔒' : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedBranches.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Primary Deploy Branch</label>
                  <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                    style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                    {selectedBranches.map(bn => <option key={bn} value={bn} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{bn}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.04)', marginBottom: '24px', borderRadius: '10px' }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            ℹ️ <strong>Infrastructure Deployment:</strong> AKS Clusters and MySQL Database Servers are managed cloud infrastructures. No GitHub repository integration is required to provision these resources. You can proceed directly to the Azure Resource Configuration.
          </p>
        </div>
      )}

          {/* ── Hard block: type mismatch ── */}
          {isHardBlock && primaryBranch && (
            <div style={{ padding: '16px 18px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--error)', background: 'var(--error-bg)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertOctagon size={20} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--error)', marginBottom: '6px', fontSize: '0.92rem' }}>
                    Type Mismatch — Cannot Proceed
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div>🔍 <strong style={{ color: 'var(--text-primary)' }}>Detected:</strong> Branch <code style={{ background: 'var(--divider)', padding: '1px 5px', borderRadius: '4px' }}>{primaryBranch}</code> is a <strong>{TYPE_LABEL[detectedType]}</strong> repository
                      {branchIntegrity?.signals?.backendFiles?.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> ({branchIntegrity.signals.backendFiles.slice(0,3).join(', ')})</span>}
                      {branchIntegrity?.signals?.frontendFiles?.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> ({branchIntegrity.signals.frontendFiles.slice(0,3).join(', ')})</span>}
                    </div>
                    <div style={{ marginTop: '4px' }}>🎯 <strong style={{ color: 'var(--text-primary)' }}>Selected:</strong> {appType === 'frontend' ? 'Frontend SWA' : 'Backend ACA Container'}</div>
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--glass-border)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--warning)' }}>
                      ✦ Switch App Type to <strong>{correctType}</strong> above, or choose a different branch / repository.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Mixed code override ── */}
          {isMixedWarn && !isHardBlock && primaryBranch && (
            <div style={{ padding: '14px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--warning)', background: 'var(--warning-bg)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1, fontSize: '0.86rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '6px' }}>Mixed Code Detected</div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    Branch <code style={{ background: 'var(--divider)', padding: '1px 5px', borderRadius: '4px' }}>{primaryBranch}</code> contains both frontend and backend signals. Deploying the wrong type may cause a broken deployment.
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    <input type="checkbox" checked={mixedOverride} onChange={e => setMixedOverride(e.target.checked)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--warning)' }} />
                    I understand this branch contains mixed code — proceed anyway
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Repository deployment warning ── */}
          {(() => {
            if (!selectedRepo) return null;

            const activeSelectedBranches = selectedBranches && selectedBranches.length > 0 
              ? selectedBranches 
              : (selectedBranch ? [selectedBranch] : []);

            // Requirement 1: If no branch selection is done, do NOT show the warning message
            if (activeSelectedBranches.length === 0) {
              return null;
            }

            const normalize = (str?: string) => (str || '').toLowerCase().replace(/\.git$/, '').split('/').filter(Boolean).pop() || '';
            const repoSlug = normalize(selectedRepo);

            // Requirement 2: Validate main/master branch against prod environment and dev/qa against dev/qa
            const matchingApp = apps.find(a => {
              const url1 = normalize(a.repositoryUrl);
              const url2 = normalize((a as any).repo_url);
              const url3 = normalize((a as any).gitUrl);
              const url4 = normalize(a.azureResourceDetails?.repoUrl || a.azureResourceDetails?.repo_url);
              const matchesRepo = repoSlug && (url1 === repoSlug || url2 === repoSlug || url3 === repoSlug || url4 === repoSlug);
              if (!matchesRepo) return false;

              const appBranch = ((a as any).branch || (a as any).gitBranch || a.azureResourceDetails?.branch || a.azureResourceDetails?.targetBranch || 'main').replace('refs/heads/', '').toLowerCase();
              const appEnv = (a.environment || a.azureResourceDetails?.environment || '').toLowerCase();

              return activeSelectedBranches.some(selBranch => {
                const cleanSel = selBranch.replace('refs/heads/', '').toLowerCase();
                if (cleanSel === 'main' || cleanSel === 'master' || cleanSel === 'prod') {
                  return appBranch === 'main' || appBranch === 'master' || appBranch === 'prod' || appEnv === 'prod' || appEnv === 'production';
                }
                if (cleanSel === 'dev' || cleanSel === 'development') {
                  return appBranch === 'dev' || appBranch === 'development' || appEnv === 'dev' || appEnv === 'development';
                }
                if (cleanSel === 'qa') {
                  return appBranch === 'qa' || appEnv === 'qa';
                }
                return appBranch === cleanSel;
              });
            });

            if (!matchingApp) return null;

            const appBranch = (matchingApp as any).branch || (matchingApp as any).gitBranch || matchingApp.azureResourceDetails?.branch || matchingApp.azureResourceDetails?.targetBranch || 'main';
            const appBranchClean = appBranch.replace('refs/heads/', '').toLowerCase();
            const targetBranchDisplay = activeSelectedBranches.find(b => {
              const c = b.replace('refs/heads/', '').toLowerCase();
              return c === appBranchClean || ((c === 'main' || c === 'master' || c === 'prod') && (appBranchClean === 'main' || appBranchClean === 'master' || appBranchClean === 'prod'));
            }) || activeSelectedBranches[0] || 'main';

            const resId = matchingApp.resourceId || matchingApp.azureResourceDetails?.resourceId || '';
            const subIdMatch = resId.match(/\/subscriptions\/([^\/]+)/i);
            const rgMatch = resId.match(/\/resourceGroups\/([^\/]+)/i);
            const subId = subIdMatch ? subIdMatch[1] : (matchingApp.subscriptionId || matchingApp.azureResourceDetails?.subscriptionId || '');
            const rgName = rgMatch ? rgMatch[1] : (matchingApp.resourceGroup || matchingApp.azureResourceDetails?.resourceGroup || 'Target Resource Group');

            const matchingSub = subscriptionsList.find(s => s.id.toLowerCase() === subId.toLowerCase());
            const subName = matchingSub ? matchingSub.displayName : (subId || 'Selected Subscription');

            const isSameScope = selectedProvisionSubscriptionId && subId && selectedProvisionSubscriptionId.toLowerCase() === subId.toLowerCase();

            return (
              <div className="glass-panel" style={{ padding: '14px 16px', borderColor: isSameScope ? 'var(--warning)' : '#3b82f6', backgroundColor: isSameScope ? 'var(--warning-bg)' : 'rgba(59, 130, 246, 0.08)', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangle size={16} style={{ color: isSameScope ? 'var(--warning)' : '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.87rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  <strong style={{ color: isSameScope ? 'var(--warning)' : '#60a5fa' }}>
                    {isSameScope ? `Already Deployed (branch: ${targetBranchDisplay}) in Selected Scope:` : `Already Deployed (branch: ${targetBranchDisplay}) in Another Scope:`}
                  </strong>{' '}
                  Branch <code style={{ background: 'var(--divider)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.82rem' }}>{targetBranchDisplay}</code> of repository <strong>{selectedRepo}</strong> is currently deployed in subscription <strong>{subName}</strong>, resource group <strong>{rgName}</strong> (application: <strong>{matchingApp.name}</strong>). {isSameScope ? 'Deploying again in the same scope creates a duplicate.' : 'Provisioning here will create a separate target environment instance.'}
                </div>
              </div>
            );
          })()}

          {/* Next button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="button" className="btn-primary"
              disabled={!canProceed}
              onClick={handleMoveToStep2}
              title={isHardBlock ? 'Resolve the type mismatch above before proceeding' : isMixedWarn && !mixedOverride ? 'Acknowledge the mixed code warning to proceed' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: canProceed ? 1 : 0.5, cursor: canProceed ? 'pointer' : 'not-allowed' }}>
              {appType === 'cluster' || appType === 'database' ? 'Configure Infrastructure' : 'Verify Pipeline YAML'} <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          REPO INTEGRITY TAB
          ══════════════════════════════════════════ */}
      {activeTab === 'integrity' && (
        <div>
          {!selectedRepo ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.9rem' }}>
              Select a repository first to run an integrity check.
            </div>
          ) : repoIntegrityLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '48px 0', color: 'var(--text-secondary)' }}>
              <RefreshCw size={20} className="spin-anim" style={{ color: 'var(--accent-purple)' }} />
              Analysing repository branches...
            </div>
          ) : !repoIntegrity ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.9rem' }}>
              Could not load integrity report. Check your GitHub credentials.
            </div>
          ) : (
            <>
              {/* Issues summary */}
              {repoIntegrity.issues?.length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--warning)', background: 'var(--warning-bg)' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <AlertTriangle size={15} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--warning)' }}>{repoIntegrity.issues.length} issue{repoIntegrity.issues.length > 1 ? 's' : ''} found</span>
                  </div>
                  {repoIntegrity.issues.map((issue: string, i: number) => (
                    <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginLeft: '23px' }}>• {issue}</div>
                  ))}
                </div>
              )}
              {repoIntegrity.issues?.length === 0 && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--success)', background: 'var(--success-badge-bg)', fontSize: '0.87rem', color: 'var(--success)' }}>
                  <CheckCircle size={15} /> All branches look clean — no integrity issues detected.
                </div>
              )}

              {/* Per-branch cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {repoIntegrity.branches?.map((branch: any) => {
                  const tc = TYPE_COLOR[branch.detectedType] ?? TYPE_COLOR.unknown;
                  const isCurrentPrimary = branch.name === githubDefaultBranch;
                  return (
                    <div key={branch.name} style={{
                      padding: '14px 16px', borderRadius: '10px',
                      border: `1px solid ${isCurrentPrimary ? 'var(--accent-purple)' : tc.border}`,
                      background: isCurrentPrimary ? 'var(--primary-branch-bg)' : tc.bg,
                      position: 'relative'
                    }}>
                      {isCurrentPrimary && (
                        <span style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Primary Branch
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {branch.name}{branch.protected ? ' 🔒' : ''}
                        </span>
                        {/* Type badge */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text, letterSpacing: '0.04em' }}>
                          {TYPE_ICON[branch.detectedType]} {TYPE_LABEL[branch.detectedType]}
                        </span>
                        {/* Confidence */}
                        <span style={{ fontSize: '0.75rem', color: CONFIDENCE_COLOR[branch.confidence] }}>
                          ● {CONFIDENCE_LABEL[branch.confidence]} confidence
                        </span>
                      </div>

                      {/* Key files */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                        {branch.signals?.backendFiles?.slice(0, 4).map((f: string) => (
                          <span key={f} style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', background: 'var(--type-backend-bg)', border: '1px solid var(--type-backend-border)', color: 'var(--type-backend-text)', fontFamily: 'monospace' }}>{f}</span>
                        ))}
                        {branch.signals?.frontendFiles?.slice(0, 4).map((f: string) => (
                          <span key={f} style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', background: 'var(--type-frontend-bg)', border: '1px solid var(--type-frontend-border)', color: 'var(--type-frontend-text)', fontFamily: 'monospace' }}>{f}</span>
                        ))}
                        {branch.signals?.hasCiYml && (
                          <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', background: 'var(--success-badge-bg)', border: '1px solid var(--success-badge-border)', color: 'var(--success)', fontFamily: 'monospace' }}>azure-pipelines.yml</span>
                        )}
                      </div>

                      {/* Deployed state */}
                      {branch.deployedAs ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Rocket size={12} style={{ color: 'var(--success)' }} />
                          Deployed as <strong style={{ color: 'var(--text-primary)' }}>{branch.deployedAs.name}</strong>
                          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--success-badge-bg)', border: '1px solid var(--success-badge-border)', color: 'var(--success)', fontWeight: 600 }}>
                            {branch.deployedAs.type.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <HelpCircle size={12} /> Not yet deployed
                          {branch.name !== primaryBranch && (
                            <button type="button" onClick={() => {
                              setSelectedBranch(branch.name);
                              if (!selectedBranches.includes(branch.name)) setSelectedBranches([...selectedBranches, branch.name]);
                              setActiveTab('configure');
                            }} style={{ marginLeft: '6px', background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', fontSize: '0.76rem', padding: 0, textDecoration: 'underline' }}>
                              Use for deployment
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const ProvisionWizard: React.FC<ProvisionWizardProps> = ({
  pipelineProvider,
  setPipelineProvider,
  provisionStep,
  setProvisionStep,
  appType,
  setAppType,
  newName,
  setNewName,
  newLocation,
  setNewLocation,
  targetPort,
  setTargetPort,
  selectedRepo,
  setSelectedRepo,
  selectedBranch,
  setSelectedBranch,
  selectedBranches,
  setSelectedBranches,
  branches,
  setBranches,
  loadingBranches,
  fetchBranches,
  apps,
  ymlLoading,
  ymlError,
  setYmlError,
  ymlContent,
  ymlOriginal,
  setYmlContent,
  ymlSource,
  creatingYml,
  provisioning,
  provisionSuccess,
  setProvisionSuccess,
  provisionError,
  setProvisionError,
  pipelineRegSuccess,
  setPipelineRegSuccess,
  pipelineRegError,
  setPipelineRegError,
  pipelineRegistering,
  registeredPipelineUrl,
  dnsBindSuccess,
  setDnsBindSuccess,
  dnsBindError,
  setDnsBindError,
  dnsBinding,
  domainInput,
  getCategorizedRepos,
  handleAppTypeChange,
  handleRepoChange,
  handleMoveToStep2,
  handleCommitCustomYml,
  handleProvision,
  handleRegisterPipeline,
  handleDnsBind,
  organizationId,
  API_BASE,

  // Metadata dropdowns
  locations,
  resourceGroups,
  managedEnvironments,
  containerRegistries,
  serviceConnections,
  loadingMetadata,

  // Step 3 new configs
  selectedResourceGroup,
  setSelectedResourceGroup,
  selectedManagedEnvironment,
  setSelectedManagedEnvironment,
  selectedCpu,
  setSelectedCpu,
  selectedMemory,
  setSelectedMemory,
  minReplicas,
  setMinReplicas,
  maxReplicas,
  setMaxReplicas,

  // AKS / Database provisioning configs passed from App.tsx
  kubernetesVersion,
  setKubernetesVersion,
  nodeCount,
  setNodeCount,
  vmSize,
  setVmSize,
  subnetId,
  setSubnetId,
  dbSkuName,
  setDbSkuName,
  dbSkuTier,
  setDbSkuTier,
  dbVersion,
  setDbVersion,
  dbAdminUsername,
  setDbAdminUsername,
  dbAdminPassword,
  setDbAdminPassword,
  virtualNetworks,

  // Custom paths
  customAppLocation,
  setCustomAppLocation,
  customApiLocation,
  setCustomApiLocation,
  customOutputLocation,
  setCustomOutputLocation,

  // Dockerfile checks
  dockerfileMissing,
  setDockerfileMissing,
  committingDockerfile,
  setCommittingDockerfile,
  dockerfileCheckError,
  setDockerfileCheckError,
  checkDockerfile,
  commitDefaultDockerfile,
  dockerfileChecked,
  dockerfileContent,
  dockerfileLoading,
  fetchDockerfileContent,
  pushDockerfileContent,
  provisionErrorDetail,
  setConfirmDialog,
  currentUser,
  repoIntegrity,
  repoIntegrityLoading,
  provisionYmlValidation,
  provisionYmlValidating,
  selectedProvisionSubscriptionId,
  setSelectedProvisionSubscriptionId,
  subscriptionsList
}) => {
  const isViewer = currentUser?.role === 'viewer';
  const [ymlViewMode, setYmlViewMode] = useState<'editor' | 'diff'>('editor');
  const [isNewRg, setIsNewRg] = useState(false);

  const handleCommitDefaultDockerfileClick = async () => {
    setCommittingDockerfile(true);
    setDockerfileCheckError(null);
    try {
      const success = await commitDefaultDockerfile(selectedRepo, selectedBranch, targetPort);
      if (success) {
        // Re-check Dockerfile status
        const missing = await checkDockerfile(selectedRepo, selectedBranch);
        setDockerfileMissing(missing);
        // Refresh YML template loader
        handleMoveToStep2();
      } else {
        setDockerfileCheckError('Failed to commit default Dockerfile to repository.');
      }
    } catch (e: any) {
      setDockerfileCheckError(e.message || 'Error occurred while committing default Dockerfile.');
    } finally {
      setCommittingDockerfile(false);
    }
  };

  const handleCustomPathsChange = () => {
    // Re-trigger load YML with custom parameters
    handleMoveToStep2();
  };

  // Filter managed environments to only show those that match selected location/region
  const filteredManagedEnvironments = managedEnvironments.filter(env => 
    !env.location || env.location.toLowerCase().replace(/ /g, '') === newLocation.toLowerCase().replace(/ /g, '')
  );

  return (
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
        boxSizing: 'border-box',
        background: 'linear-gradient(160deg, rgba(139, 92, 246, 0.12) 0%, rgba(109, 40, 217, 0.18) 60%, rgba(88, 28, 135, 0.22) 100%)',
        borderColor: 'rgba(168, 85, 247, 0.20)',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.06), inset 0 0 20px rgba(139, 92, 246, 0.04)',
      }}>
        {(() => {
          const steps = [
            { stepNum: 1, label: 'GitHub Source Connection', sublabel: 'Select repository, triggers, and deployment target branch' }
          ];
          if (appType === 'frontend' || appType === 'backend') {
            steps.push({ stepNum: 2, label: 'Verify Build Pipeline YML', sublabel: 'Review, modify, and commit azure-pipelines.yml configuration file' });
          }
          steps.push({ 
            stepNum: 4, 
            label: appType === 'backend' 
              ? 'Provision Azure ACA' 
              : appType === 'cluster'
              ? 'Provision AKS Cluster'
              : appType === 'database'
              ? 'Provision MySQL Server'
              : 'Provision Azure SWA', 
            sublabel: appType === 'cluster'
              ? 'Configure Kubernetes settings, node counts, VM size, and subnet injections'
              : appType === 'database'
              ? 'Configure MySQL database version, pricing tiers, and subnet delegation'
              : 'Create managed container environments or static site hosts in the cloud' 
          });
          if (appType === 'frontend' || appType === 'backend') {
            steps.push({ stepNum: 5, label: 'Bindings & Launch Sequence', sublabel: 'Register Azure DevOps build pipelines and bind GoDaddy subdomains' });
          }
          return steps.map((s, idx) => {
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
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
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
                <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: idx < steps.length - 1 ? '26px' : '0' }}>
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
        })})()}

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
      <div className="glass-panel" style={{ padding: '36px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.08) 0%, rgba(109, 40, 217, 0.12) 50%, transparent 100%)',
        borderColor: 'rgba(168, 85, 247, 0.15)',
      }}>
        
        {/* Decorative top gradient border */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent-purple), rgba(168,85,247,0.3), var(--accent-teal))' }} />
        {/* Ambient purple glow top-right */}
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Read-Only mode alert banner */}
        {isViewer && (
          <div className="glass-panel" style={{
            padding: '16px 20px',
            borderColor: 'var(--warning)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: 'var(--text-primary)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '8px',
            fontSize: '0.86rem'
          }}>
            <AlertTriangle style={{ color: 'var(--warning)', flexShrink: 0 }} size={18} />
            <span>
              <strong>Read-Only Mode:</strong> Resource provisioning, git commits, and cloud deployment actions are disabled for the Viewer role.
            </span>
          </div>
        )}

        {/* STEP 1: GITHUB SOURCE SELECTION */}
        {provisionStep === 1 && (
          <Step1Content
            pipelineProvider={pipelineProvider}
            setPipelineProvider={setPipelineProvider}
            appType={appType}
            handleAppTypeChange={handleAppTypeChange}
            selectedRepo={selectedRepo}
            handleRepoChange={handleRepoChange}
            getCategorizedRepos={getCategorizedRepos}
            selectedBranches={selectedBranches}
            setSelectedBranches={setSelectedBranches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            branches={branches}
            setBranches={setBranches}
            loadingBranches={loadingBranches}
            fetchBranches={fetchBranches}
            apps={apps}
            repoIntegrity={repoIntegrity}
            repoIntegrityLoading={repoIntegrityLoading}
            handleMoveToStep2={handleMoveToStep2}
            isViewer={isViewer}
            subscriptionsList={subscriptionsList}
            selectedProvisionSubscriptionId={selectedProvisionSubscriptionId}
          />
        )}

        {/* STEP 2: PIPELINE YAML CONFIGURATION */}
        {provisionStep === 2 && (
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Settings style={{ color: 'var(--accent-purple)' }} />
              Verify & Customize Build Pipeline YML
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Configure the <code>{pipelineProvider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'}</code> file to be committed to branch <strong>{selectedBranch}</strong>. This YML defines trigger branches and handles automated builds.
            </p>

            {/* Missing Dockerfile Warning Block */}
            {appType === 'backend' && dockerfileMissing && (
              <div className="glass-panel" style={{ padding: '20px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--text-primary)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <AlertTriangle style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} size={20} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>Dockerfile Missing from Target Repository</h4>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Azure Container Apps require a Dockerfile at the root of the branch <strong>{selectedBranch}</strong> to compile and package your application container. We can commit a standard multi-stage production Node.js Dockerfile automatically to resolve this.
                    </p>
                    {dockerfileCheckError && (
                      <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '10px' }}>
                        ❌ {dockerfileCheckError}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleCommitDefaultDockerfileClick}
                      disabled={isViewer || committingDockerfile}
                      style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: (isViewer || committingDockerfile) ? 'not-allowed' : 'pointer' }}
                    >
                      {committingDockerfile ? (
                        <><RefreshCw size={12} className="spin-anim" /> Committing Dockerfile...</>
                      ) : (
                        'Commit Default Node.js Dockerfile'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success Dockerfile Found Block */}
            {appType === 'backend' && dockerfileChecked && !dockerfileMissing && (
              <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.08)', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.9rem' }}>Dockerfile detected successfully at the root of the branch <strong>{selectedBranch}</strong>.</span>
              </div>
            )}

            {/* Custom SWA Paths configuration */}
            {appType === 'frontend' && (
              <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 600 }}>Custom Build & App Directories</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>App Location</label>
                    <input 
                      type="text" 
                      value={customAppLocation} 
                      onChange={(e) => setCustomAppLocation(e.target.value)} 
                      placeholder="e.g. /"
                      style={{ fontSize: '0.8rem', height: '28px', padding: '4px 8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Api Location</label>
                    <input 
                      type="text" 
                      value={customApiLocation} 
                      onChange={(e) => setCustomApiLocation(e.target.value)} 
                      placeholder="e.g. /api"
                      style={{ fontSize: '0.8rem', height: '28px', padding: '4px 8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Output/Build Directory</label>
                    <input 
                      type="text" 
                      value={customOutputLocation} 
                      onChange={(e) => setCustomOutputLocation(e.target.value)} 
                      placeholder="e.g. dist"
                      style={{ fontSize: '0.8rem', height: '28px', padding: '4px 8px' }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCustomPathsChange}
                  style={{ marginTop: '12px', padding: '4px 10px', fontSize: '0.74rem', height: '26px' }}
                >
                  Regenerate YML Template
                </button>
              </div>
            )}

            {ymlLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <RefreshCw size={36} className="spin-anim" style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Loading {pipelineProvider === 'github_actions' ? '.github/workflows/deploy.yml' : 'azure-pipelines.yml'} configuration...</p>
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
                    disabled={isViewer || creatingYml || (provisionYmlValidation?.errors && provisionYmlValidation.errors.length > 0)}
                    style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: (isViewer || creatingYml || (provisionYmlValidation?.errors && provisionYmlValidation.errors.length > 0)) ? 'not-allowed' : 'pointer' }}
                  >
                    {creatingYml ? (
                      <><RefreshCw size={12} className="spin-anim" /> Committing...</>
                    ) : (
                      'Commit YML to GitHub'
                    )}
                  </button>
                </div>

                {ymlContent !== ymlOriginal && (
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
                  <div style={{ marginBottom: '20px' }}>
                    <DiffViewer original={ymlOriginal} current={ymlContent} theme={localStorage.getItem('devops_theme') || 'dark'} />
                  </div>
                ) : (
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
                )}

                {/* YAML Validation Panel */}
                <div style={{ marginBottom: '20px' }}>
                  {renderValidationPanel(
                    provisionYmlValidation,
                    !!provisionYmlValidating,
                    ymlContent,
                    setYmlContent,
                    pipelineProvider
                  )}
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
                disabled={ymlLoading || creatingYml || !ymlContent || (appType === 'backend' && dockerfileMissing) || (provisionYmlValidation?.errors && provisionYmlValidation.errors.length > 0)}
                onClick={() => {
                  if (appType === 'backend') {
                    setProvisionStep(3);
                  } else {
                    setProvisionStep(4);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {appType === 'backend' ? 'Verify Dockerfile' : 'Azure Resource Setup'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DOCKERFILE VERIFICATION + EDITOR (ACA Backend Only) */}
        {provisionStep === 3 && appType === 'backend' && (
          <DockerfileEditorStep
            selectedRepo={selectedRepo}
            selectedBranch={selectedBranch}
            dockerfileLoading={dockerfileLoading}
            dockerfileContent={dockerfileContent}
            fetchDockerfileContent={fetchDockerfileContent}
            pushDockerfileContent={pushDockerfileContent}
            onBack={() => setProvisionStep(2)}
            onNext={() => setProvisionStep(4)}
            isViewer={isViewer}
            API_BASE={API_BASE}
          />
        )}

        {/* STEP 3: AZURE SWA / ACA PROVISIONING */}
        {provisionStep === 4 && (
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <PlusCircle style={{ color: 'var(--accent-purple)' }} />
              {appType === 'backend' 
                ? 'Provision Azure Container App' 
                : appType === 'cluster'
                ? 'Provision AKS Managed Cluster'
                : appType === 'database'
                ? 'Provision MySQL Flexible Server'
                : 'Provision Azure SWA Resource'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
              {appType === 'backend' 
                ? 'Create a secure, managed container app on Azure to host your backend services. It runs in the regional container environment.' 
                : appType === 'cluster'
                ? 'Deploy a production-ready Azure Kubernetes Service (AKS) cluster mapped into your virtual network topology.'
                : appType === 'database'
                ? 'Deploy an enterprise-grade Azure Database for MySQL Flexible Server with native VNet subnet delegation.'
                : 'Create a high-availability Static Web App container in Azure. Azure will host the frontend bundle and supply a default hostname.'}
            </p>

            {provisionSuccess && (
              <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                {provisionSuccess}
              </div>
            )}

            {provisionError && (
              <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{provisionError}</span>
                  {provisionErrorDetail && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Provisioning Error Details',
                          message: provisionErrorDetail,
                          confirmLabel: 'Close',
                          type: 'danger',
                          onConfirm: () => {}
                        });
                      }}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', height: '26px' }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleProvision}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {appType === 'backend' 
                      ? 'Container App Name' 
                      : appType === 'cluster'
                      ? 'AKS Cluster Name'
                      : appType === 'database'
                      ? 'MySQL Server Name'
                      : 'Static Web App Name'}
                  </label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder={
                      appType === 'backend' 
                        ? 'estevia-brand-api' 
                        : appType === 'cluster'
                        ? 'estevia-prod-aks'
                        : appType === 'database'
                        ? 'estevia-prod-mysql'
                        : 'estevia-brand-site-swa'
                    } 
                    required 
                    disabled={provisioning}
                  />
                </div>

                {appType === 'backend' && (
                  <div>
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
                
                {/* Subscription Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Azure Subscription</label>
                  <select
                    value={selectedProvisionSubscriptionId}
                    onChange={(e) => setSelectedProvisionSubscriptionId(e.target.value)}
                    disabled={provisioning}
                    required
                  >
                    <option value="">-- Select Subscription --</option>
                    {subscriptionsList.map(sub => (
                      <option key={sub.id} value={sub.id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                        {sub.displayName} ({sub.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Resource Group Selection */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Azure Target Resource Group</label>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isNewRg}
                        onChange={(e) => {
                          setIsNewRg(e.target.checked);
                          setSelectedResourceGroup('');
                        }}
                        style={{ width: '13px', height: '13px', margin: 0, cursor: 'pointer' }}
                      />
                      Create new Resource Group
                    </label>
                  </div>
                  
                  {isNewRg ? (
                    <input
                      type="text"
                      value={selectedResourceGroup}
                      onChange={(e) => setSelectedResourceGroup(e.target.value)}
                      placeholder="Enter new Resource Group name"
                      required
                      disabled={provisioning}
                    />
                  ) : loadingMetadata ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading Resource Groups...</div>
                  ) : resourceGroups.length === 0 ? (
                    <input
                      type="text"
                      value={selectedResourceGroup}
                      onChange={(e) => setSelectedResourceGroup(e.target.value)}
                      placeholder="e.g. Estevia-Prod-RG"
                      required
                      disabled={provisioning}
                    />
                  ) : (
                    <select
                      value={selectedResourceGroup}
                      onChange={(e) => setSelectedResourceGroup(e.target.value)}
                      disabled={provisioning}
                      required
                    >
                      <option value="">-- Select Resource Group --</option>
                      {resourceGroups.map(rg => (
                        <option key={rg} value={rg} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>{rg}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Dynamic Location/Region Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Azure Region Location</label>
                  {loadingMetadata ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading locations...</div>
                  ) : locations.length === 0 ? (
                    <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} disabled={provisioning}>
                      <option value="eastus2">East US 2 (Recommended)</option>
                      <option value="centralus">Central US</option>
                      <option value="westus2">West US 2</option>
                    </select>
                  ) : (
                    <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} disabled={provisioning}>
                      {locations.map(loc => (
                        <option key={loc.name} value={loc.name} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>{loc.displayName}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* New Container App specifics */}
                {appType === 'backend' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Managed VPC Environment</label>
                      {loadingMetadata ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading environments...</div>
                      ) : filteredManagedEnvironments.length === 0 ? (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          backgroundColor: 'rgba(255,255,255,0.02)', 
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4'
                        }}>
                          ℹ No existing environments found in <strong>{newLocation}</strong>. A new VPC managed environment will be provisioned automatically.
                        </div>
                      ) : (
                        <select
                          value={selectedManagedEnvironment}
                          onChange={(e) => setSelectedManagedEnvironment(e.target.value)}
                          disabled={provisioning}
                        >
                          <option value="">-- Create New (or choose matching env) --</option>
                          {filteredManagedEnvironments.map(env => (
                            <option key={env.id} value={env.id} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
                              {env.name} ({env.vnetName || 'Isolated subnet'})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Scale and Sizing configurations */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Compute Core Allocations (CPU)</label>
                        <select
                          value={selectedCpu}
                          onChange={(e) => setSelectedCpu(e.target.value)}
                          disabled={provisioning}
                        >
                          <option value="0.25" style={{ background: 'var(--bg-secondary)' }}>0.25 Cores (Default)</option>
                          <option value="0.5" style={{ background: 'var(--bg-secondary)' }}>0.5 Cores</option>
                          <option value="1.0" style={{ background: 'var(--bg-secondary)' }}>1.0 Cores</option>
                          <option value="2.0" style={{ background: 'var(--bg-secondary)' }}>2.0 Cores</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Memory Allocations</label>
                        <select
                          value={selectedMemory}
                          onChange={(e) => setSelectedMemory(e.target.value)}
                          disabled={provisioning}
                        >
                          <option value="0.5Gi" style={{ background: 'var(--bg-secondary)' }}>0.5 Gi (Default)</option>
                          <option value="1.0Gi" style={{ background: 'var(--bg-secondary)' }}>1.0 Gi</option>
                          <option value="2.0Gi" style={{ background: 'var(--bg-secondary)' }}>2.0 Gi</option>
                          <option value="4.0Gi" style={{ background: 'var(--bg-secondary)' }}>4.0 Gi</option>
                        </select>
                      </div>
                    </div>

                    {/* Min/Max scaling limits */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Min Replica Scale Limit</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={minReplicas}
                          onChange={(e) => setMinReplicas(parseInt(e.target.value || '0', 10))}
                          disabled={provisioning}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Max Replica Scale Limit</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={maxReplicas}
                          onChange={(e) => setMaxReplicas(parseInt(e.target.value || '10', 10))}
                          disabled={provisioning}
                        />
                      </div>
                    </div>
                  </>
                )}

                {appType === 'cluster' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Kubernetes Version</label>
                        <select value={kubernetesVersion} onChange={e => setKubernetesVersion(e.target.value)} disabled={provisioning}>
                          <option value="1.28.3" style={{ background: 'var(--bg-secondary)' }}>1.28.3 (Default)</option>
                          <option value="1.27.3" style={{ background: 'var(--bg-secondary)' }}>1.27.3</option>
                          <option value="1.29.2" style={{ background: 'var(--bg-secondary)' }}>1.29.2</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>System Node Count</label>
                        <input type="number" min="1" max="100" value={nodeCount} onChange={e => setNodeCount(parseInt(e.target.value || '1', 10))} disabled={provisioning} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>VM Size Tiers</label>
                      <select value={vmSize} onChange={e => setVmSize(e.target.value)} disabled={provisioning}>
                        <option value="Standard_D2s_v5" style={{ background: 'var(--bg-secondary)' }}>Standard_D2s_v5 (2 vCPU, 8 GB RAM - Default)</option>
                        <option value="Standard_B2s" style={{ background: 'var(--bg-secondary)' }}>Standard_B2s (2 vCPU, 4 GB RAM - Burstable Dev/QA)</option>
                        <option value="Standard_D4s_v5" style={{ background: 'var(--bg-secondary)' }}>Standard_D4s_v5 (4 vCPU, 16 GB RAM - Production Scale)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Virtual Network Subnet Injection</label>
                      <select value={subnetId} onChange={e => setSubnetId(e.target.value)} disabled={provisioning}>
                        <option value="" style={{ background: 'var(--bg-secondary)' }}>-- None (Deploy on Public Managed VNet) --</option>
                        {virtualNetworks.map(vn => (
                          <optgroup key={vn.id} label={`${vn.name} (${vn.location})`} style={{ background: 'var(--bg-secondary)' }}>
                            {vn.subnets.map((sub: any) => (
                              <option key={sub.id} value={sub.id} style={{ background: 'var(--bg-secondary)' }}>
                                {sub.name} ({sub.addressPrefix})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {appType === 'database' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>MySQL Engine Version</label>
                        <select value={dbVersion} onChange={e => setDbVersion(e.target.value)} disabled={provisioning}>
                          <option value="8.0.21" style={{ background: 'var(--bg-secondary)' }}>8.0.21 (Default)</option>
                          <option value="5.7" style={{ background: 'var(--bg-secondary)' }}>5.7 (Legacy)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>SKU Tier</label>
                        <select value={dbSkuTier} onChange={e => {
                          setDbSkuTier(e.target.value);
                          setDbSkuName(e.target.value === 'Burstable' ? 'Standard_B1ms' : 'Standard_D2ads_v5');
                        }} disabled={provisioning}>
                          <option value="Burstable" style={{ background: 'var(--bg-secondary)' }}>Burstable (Cheapest - Dev/QA)</option>
                          <option value="GeneralPurpose" style={{ background: 'var(--bg-secondary)' }}>General Purpose (Production Scale)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pricing SKU Size</label>
                      <select value={dbSkuName} onChange={e => setDbSkuName(e.target.value)} disabled={provisioning}>
                        {dbSkuTier === 'Burstable' ? (
                          <>
                            <option value="Standard_B1ms" style={{ background: 'var(--bg-secondary)' }}>Standard_B1ms (1 vCPU, 2 GB RAM - $15/mo)</option>
                            <option value="Standard_B2s" style={{ background: 'var(--bg-secondary)' }}>Standard_B2s (2 vCPU, 4 GB RAM - $30/mo)</option>
                          </>
                        ) : (
                          <>
                            <option value="Standard_D2ads_v5" style={{ background: 'var(--bg-secondary)' }}>Standard_D2ads_v5 (2 vCPU, 8 GB RAM - $118/mo)</option>
                            <option value="Standard_D4ads_v5" style={{ background: 'var(--bg-secondary)' }}>Standard_D4ads_v5 (4 vCPU, 16 GB RAM - $236/mo)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Private Subnet Delegation (VNet Integration)</label>
                      <select value={subnetId} onChange={e => setSubnetId(e.target.value)} disabled={provisioning}>
                        <option value="" style={{ background: 'var(--bg-secondary)' }}>-- None (Public Endpoint Access) --</option>
                        {virtualNetworks.map(vn => (
                          <optgroup key={vn.id} label={`${vn.name} (${vn.location})`} style={{ background: 'var(--bg-secondary)' }}>
                            {vn.subnets.map((sub: any) => {
                              const isDelegated = sub.delegations?.some((d: any) => d.serviceName === 'Microsoft.DBforMySQL/flexibleServers' || d.properties?.serviceName === 'Microsoft.DBforMySQL/flexibleServers');
                              return (
                                <option key={sub.id} value={sub.id} style={{ background: 'var(--bg-secondary)' }}>
                                  {sub.name} ({sub.addressPrefix}) {isDelegated ? '✓ Delegated' : '(Will Auto-Delegate)'}
                                </option>
                              );
                            })}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Admin Username</label>
                        <input type="text" value={dbAdminUsername} onChange={e => setDbAdminUsername(e.target.value)} required disabled={provisioning} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Admin Password</label>
                        <input type="password" value={dbAdminPassword} onChange={e => setDbAdminPassword(e.target.value)} required disabled={provisioning} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setProvisionStep(appType === 'backend' ? 3 : (appType === 'cluster' || appType === 'database') ? 1 : 2)}
                  disabled={provisioning}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isViewer || provisioning || !newName}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: (isViewer || provisioning || !newName) ? 'not-allowed' : 'pointer' }}
                >
                  {provisioning ? (
                    <>
                      <RefreshCw size={14} className="spin-anim" /> Allocating {appType === 'backend' ? 'Container App' : appType === 'cluster' ? 'AKS Cluster' : appType === 'database' ? 'MySQL Database' : 'SWA'} (10-20s)...
                    </>
                  ) : (
                    <>
                      Deploy {appType === 'backend' ? 'Container App' : appType === 'cluster' ? 'AKS Cluster' : appType === 'database' ? 'MySQL Database' : 'SWA'} Resource <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: BINDINGS & CI/CD PIPELINE */}
        {provisionStep === 5 && (
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck style={{ color: 'var(--accent-teal)' }} />
              Finalize DNS Bindings & CI/CD Pipelines
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
              The Azure resource is active! Now connect it to your {pipelineProvider === 'github_actions' ? 'GitHub Actions integration' : 'Azure DevOps pipeline'} for CI/CD automation and link your GoDaddy custom subdomain.
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
                      {pipelineProvider === 'github_actions' ? 'Registers the GitHub Actions integration' : 'Creates the build configuration on Azure DevOps'} linked to branch <strong>{selectedBranch}</strong>.
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
                    disabled={isViewer || pipelineRegistering}
                    style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: (isViewer || pipelineRegistering) ? 'not-allowed' : 'pointer' }}
                  >
                    {pipelineRegistering ? (
                      <>
                        <RefreshCw size={12} className="spin-anim" /> Registering...
                      </>
                    ) : (
                      pipelineProvider === 'github_actions' ? 'Register GitHub Actions' : 'Create Pipeline in DevOps'
                    )}
                  </button>
                ) : (
                  registeredPipelineUrl && (
                    <a href={registeredPipelineUrl} target="_blank" rel="noreferrer" className="btn-secondary"
                       style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                      {pipelineProvider === 'github_actions' ? 'Open GitHub Actions' : 'Open Build Pipeline'} <ExternalLink size={12} />
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
                    disabled={isViewer || dnsBinding}
                    style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: (isViewer || dnsBinding) ? 'not-allowed' : 'pointer' }}
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
                  setYmlError(null);
                  setDockerfileMissing(false);
                }}
              >
                Provision Another App
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => {
                  // Navigate back to scan list
                  // We handle tab navigation at App level, so we rely on parent callback
                  window.location.reload(); // Quick reset/refresh
                }}
              >
                Go to Scanning Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
