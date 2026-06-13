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
  X
} from 'lucide-react';

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
}

interface ProvisionWizardProps {
  provisionStep: number;
  setProvisionStep: (val: number) => void;
  appType: 'frontend' | 'backend';
  setAppType: (val: 'frontend' | 'backend') => void;
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
  apps: AppResource[];
  ymlLoading: boolean;
  ymlError: string | null;
  setYmlError: (val: string | null) => void;
  ymlContent: string;
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
  getCategorizedRepos: (appType?: 'frontend' | 'backend') => { recommended: any[]; other: any[] };
  handleAppTypeChange: (type: 'frontend' | 'backend') => void;
  handleRepoChange: (repoName: string) => void;
  handleMoveToStep2: () => void;
  handleCommitCustomYml: () => void;
  handleProvision: (e: React.FormEvent) => void;
  handleRegisterPipeline: () => void;
  handleDnsBind: () => void;
  organizationId: string;
  API_BASE: string;

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
}

/* ── Dockerfile Editor Step Sub-Component ── */
interface DockerfileEditorStepProps {
  selectedRepo: string;
  selectedBranch: string;
  dockerfileLoading: boolean;
  dockerfileContent: string;
  fetchDockerfileContent: (repo: string, branch: string) => Promise<void>;
  pushDockerfileContent: (repo: string, branch: string, content: string, commitMsg?: string) => Promise<{ success: boolean; message: string }>;
  onBack: () => void;
  onNext: () => void;
  isViewer?: boolean;
}

const DockerfileEditorStep: React.FC<DockerfileEditorStepProps> = ({
  selectedRepo, selectedBranch, dockerfileLoading, dockerfileContent,
  fetchDockerfileContent, pushDockerfileContent, onBack, onNext, isViewer,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [commitMsg, setCommitMsg] = useState('chore: update Dockerfile [via EvaOps DevOps Hub]');
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
            disabled={pushing || !editedContent.trim()}
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
          disabled={dockerfileLoading || !dockerfileContent || editMode}
          onClick={onNext}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Configure Azure Resources <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const ProvisionWizard: React.FC<ProvisionWizardProps> = ({
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
  apps,
  ymlLoading,
  ymlError,
  setYmlError,
  ymlContent,
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
  currentUser
}) => {
  const isViewer = currentUser?.role === 'viewer';

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
                disabled={isViewer || !selectedRepo || selectedBranches.length === 0 || loadingBranches}
                onClick={() => handleMoveToStep2()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: (isViewer || !selectedRepo || selectedBranches.length === 0 || loadingBranches) ? 'not-allowed' : 'pointer' }}
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
                    disabled={isViewer || creatingYml}
                    style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: (isViewer || creatingYml) ? 'not-allowed' : 'pointer' }}
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
                disabled={ymlLoading || creatingYml || !ymlContent || (appType === 'backend' && dockerfileMissing)}
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
          />
        )}

        {/* STEP 3: AZURE SWA / ACA PROVISIONING */}
        {provisionStep === 4 && (
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
                
                {/* Dynamic Resource Group Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Azure Target Resource Group</label>
                  {loadingMetadata ? (
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setProvisionStep(appType === 'backend' ? 3 : 2)}
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
        {provisionStep === 5 && (
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
                    disabled={isViewer || pipelineRegistering}
                    style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: (isViewer || pipelineRegistering) ? 'not-allowed' : 'pointer' }}
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
