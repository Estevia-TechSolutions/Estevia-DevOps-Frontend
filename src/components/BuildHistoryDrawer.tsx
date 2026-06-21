import React, { useState, useEffect } from 'react';
import { X, RefreshCw, GitBranch, User, Calendar, ExternalLink, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BuildRun {
  id: number;
  buildNumber: string;
  branch: string;
  result: string; // succeeded, failed, canceled, partiallySucceeded, inProgress
  startTime: string | null;
  finishTime: string | null;
  sourceVersion: string; // commit SHA
  requestedFor: string;
  webUrl: string;
  commitMessage?: string;
}

interface ContainerRevision {
  name: string;
  active: boolean;
  createdTime: string | null;
  trafficWeight: number;
  latestRevision: boolean;
}

interface BuildHistoryDrawerProps {
  isOpen: boolean;
  appName: string;
  pipelineId: string | number | null;
  appType: 'frontend' | 'backend' | 'vm';
  organizationId: string;
  currentUser: { role: string } | null;
  theme: 'dark' | 'light';
  API_BASE: string;
  onReDeployQueued?: (newBuildId: number) => void;
  onClose: () => void;
}

export const BuildHistoryDrawer: React.FC<BuildHistoryDrawerProps> = ({
  isOpen,
  appName,
  pipelineId,
  appType,
  organizationId,
  currentUser,
  theme,
  API_BASE,
  onReDeployQueued,
  onClose
}) => {
  const [builds, setBuilds] = useState<BuildRun[]>([]);
  const [revisions, setRevisions] = useState<ContainerRevision[]>([]);
  const [activeRevisionsMode, setActiveRevisionsMode] = useState<string>('Single');
  
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [buildsError, setBuildsError] = useState<string | null>(null);
  const [revisionsError, setRevisionsError] = useState<string | null>(null);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'redeploy' or 'revision' or null
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Confirmation state
  const [confirmTarget, setConfirmTarget] = useState<{
    type: 'redeploy' | 'revision';
    build?: BuildRun;
    revision?: ContainerRevision;
  } | null>(null);

  const userRole = currentUser?.role || 'viewer';
  const canAct = ['owner', 'admin', 'contributor'].includes(userRole);

  const fetchBuildHistory = async () => {
    if (!pipelineId) return;
    setLoadingBuilds(true);
    setBuildsError(null);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/pipeline/history?organizationId=${organizationId}&pipelineId=${pipelineId}&top=12`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBuilds(data.builds || []);
      } else {
        throw new Error(data.message || 'Failed to fetch build history.');
      }
    } catch (err: any) {
      console.error(err);
      setBuildsError(err.message || 'Error fetching build history.');
    } finally {
      setLoadingBuilds(false);
    }
  };

  const fetchContainerRevisions = async () => {
    if (appType !== 'backend') return;
    setLoadingRevisions(true);
    setRevisionsError(null);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/${appName}/revisions?organizationId=${organizationId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRevisions(data.revisions || []);
        setActiveRevisionsMode(data.activeRevisionsMode || 'Single');
      } else {
        throw new Error(data.message || 'Failed to fetch container revisions.');
      }
    } catch (err: any) {
      console.error(err);
      setRevisionsError(err.message || 'Error fetching container revisions.');
    } finally {
      setLoadingRevisions(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBuildHistory();
      fetchContainerRevisions();
      setConfirmTarget(null);
      setActionError(null);
      setActionSuccess(null);
    }
  }, [isOpen, pipelineId, appName]);

  const getStatusColor = (result: string) => {
    const r = (result || '').toLowerCase();
    if (r === 'succeeded') return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' };
    if (r === 'failed') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
    if (r === 'canceled' || r === 'cancelled' || r === 'partiallysucceeded') return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' };
    return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' }; // inProgress or running
  };

  const handleQueueReDeploy = async (build: BuildRun) => {
    setActionLoading('redeploy');
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/apps/pipeline/redeploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          organizationId,
          pipelineId,
          sourceVersion: build.sourceVersion,
          branchName: build.branch,
          buildId: build.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Re-deploy build successfully queued! New Build Run: #${data.buildNumber || data.buildId}.`);
        if (onReDeployQueued) {
          onReDeployQueued(data.buildId);
        }
        // Refresh history after a short delay
        setTimeout(fetchBuildHistory, 3000);
      } else {
        throw new Error(data.message || 'Failed to trigger re-deploy.');
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error queueing re-deploy.');
    } finally {
      setActionLoading(null);
      setConfirmTarget(null);
    }
  };

  const handleActivateRevision = async (rev: ContainerRevision) => {
    setActionLoading('revision');
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = localStorage.getItem('devops_token');
      
      // If active mode is Single, we first update to Multiple mode
      if (activeRevisionsMode === 'Single') {
        const modeRes = await fetch(`${API_BASE}/apps/${appName}/revision-mode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            organizationId,
            mode: 'Multiple'
          })
        });
        const modeData = await modeRes.json();
        if (!modeRes.ok || !modeData.success) {
          throw new Error(modeData.message || 'Failed to switch Container App revision mode to Multiple.');
        }
      }

      // Shift 100% traffic to target revision
      const trafficRes = await fetch(`${API_BASE}/apps/${appName}/traffic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          organizationId,
          traffic: [
            {
              revisionName: rev.name,
              weight: 100,
              latestRevision: rev.latestRevision
            }
          ]
        })
      });
      const trafficData = await trafficRes.json();
      if (trafficRes.ok && trafficData.success) {
        setActionSuccess(`Traffic routing updated! Revision "${rev.name}" is now active with 100% traffic.`);
        fetchContainerRevisions();
      } else {
        throw new Error(trafficData.message || 'Failed to update traffic weight.');
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error activating container revision.');
    } finally {
      setActionLoading(null);
      setConfirmTarget(null);
    }
  };

  const isProdBranch = (branchName: string) => {
    const b = (branchName || '').toLowerCase();
    return ['main', 'master', 'prod', 'production'].includes(b) || b.startsWith('release/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 999,
          animation: 'fade-in-anim 0.25s ease-out'
        }}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '540px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(45px) saturate(180%)',
          WebkitBackdropFilter: 'blur(45px) saturate(180%)',
          borderLeft: '1px solid var(--glass-border)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.015)'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {appName}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Deployment History & Rollback Controls
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
          className="glassmorphic-scroll"
        >
          {/* Action Status Alerts */}
          {actionError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--error)',
              fontSize: '0.8rem'
            }}>
              <AlertTriangle size={16} />
              {actionError}
            </div>
          )}

          {actionSuccess && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--success)',
              fontSize: '0.8rem'
            }}>
              <CheckCircle2 size={16} />
              {actionSuccess}
            </div>
          )}

          {/* Section 1: Azure DevOps Pipeline Builds */}
          {pipelineId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pipeline Build Runs
                </h4>
                <button
                  onClick={fetchBuildHistory}
                  disabled={loadingBuilds}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={12} className={loadingBuilds ? 'spin-anim' : ''} />
                  Refresh
                </button>
              </div>

              {loadingBuilds && builds.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={20} className="spin-anim" />
                </div>
              ) : buildsError ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  {buildsError}
                </div>
              ) : builds.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                  No completed builds discovered for this pipeline.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {builds.map((build) => {
                    const status = getStatusColor(build.result);
                    const isProd = isProdBranch(build.branch);
                    const canRedeployThis = canAct && (!isProd || ['owner', 'admin'].includes(userRole));

                    return (
                      <div
                        key={build.id}
                        className="glass-panel"
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.2s',
                          border: confirmTarget?.type === 'redeploy' && confirmTarget.build?.id === build.id ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--glass-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              #{build.buildNumber}
                            </span>
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              backgroundColor: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`,
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              {build.result || 'Running'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <a
                              href={build.webUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                              title="Open build in Azure DevOps"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>

                        {build.commitMessage && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', wordBreak: 'break-word' }}>
                            "{build.commitMessage}"
                          </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <GitBranch size={11} />
                              {build.branch}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Commit SHA">
                              <code style={{ fontFamily: 'monospace', fontSize: '0.72rem', background: 'rgba(255,255,255,0.04)', padding: '1px 4px', borderRadius: '3px' }}>
                                {build.sourceVersion?.substring(0, 7) || 'N/A'}
                              </code>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={11} />
                              {build.requestedFor}
                            </span>
                            {build.finishTime && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={11} />
                                {new Date(build.finishTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          {canAct && (
                            <button
                              onClick={() => setConfirmTarget({ type: 'redeploy', build })}
                              disabled={!canRedeployThis || actionLoading !== null}
                              style={{
                                background: isProd ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                border: `1px solid ${isProd ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
                                color: isProd ? '#f59e0b' : 'var(--accent-blue)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                cursor: canRedeployThis ? 'pointer' : 'not-allowed',
                                opacity: canRedeployThis ? 1 : 0.4,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              🔄 Re-deploy
                            </button>
                          )}
                        </div>

                        {/* Inline Redeploy Confirmation */}
                        {confirmTarget?.type === 'redeploy' && confirmTarget.build?.id === build.id && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'rgba(245, 158, 11, 0.04)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                {isProd ? (
                                  <span style={{ fontWeight: 700, color: '#f87171' }}>
                                    ⚠️ WARNING: This will trigger a re-deployment to the PRODUCTION branch ({build.branch}). Are you sure?
                                  </span>
                                ) : (
                                  <span>Are you sure you want to re-deploy this build run to <strong>{build.branch}</strong>? This triggers a new build run targeting commit {build.sourceVersion?.substring(0, 7)}.</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => setConfirmTarget(null)}
                                className="btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.72rem', height: '26px' }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleQueueReDeploy(build)}
                                disabled={actionLoading !== null}
                                style={{
                                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '3px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  height: '26px'
                                }}
                              >
                                {actionLoading === 'redeploy' ? 'Queueing...' : 'Confirm Re-deploy'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No pipeline registration found for this app.
            </div>
          )}

          {/* Section 2: Container Revisions (Only for Backend ACA Apps) */}
          {appType === 'backend' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ACA Container Revisions
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Mode: {activeRevisionsMode}
                  </span>
                </div>
                <button
                  onClick={fetchContainerRevisions}
                  disabled={loadingRevisions}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={12} className={loadingRevisions ? 'spin-anim' : ''} />
                  Refresh
                </button>
              </div>

              {loadingRevisions && revisions.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={20} className="spin-anim" />
                </div>
              ) : revisionsError ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  {revisionsError}
                </div>
              ) : revisions.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                  No container revisions found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {revisions.map((rev) => {
                    const isRoutingAll = rev.trafficWeight === 100;
                    
                    return (
                      <div
                        key={rev.name}
                        className="glass-panel"
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.2s',
                          border: confirmTarget?.type === 'revision' && confirmTarget.revision?.name === rev.name ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                              {rev.name}
                            </span>
                            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                              Created: {rev.createdTime ? new Date(rev.createdTime).toLocaleString() : 'N/A'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              backgroundColor: rev.active ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.03)',
                              color: rev.active ? 'var(--success)' : 'var(--text-muted)',
                              border: `1px solid ${rev.active ? 'rgba(34, 197, 94, 0.2)' : 'var(--glass-border)'}`,
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              {rev.active ? 'Active' : 'Inactive'}
                            </span>
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              backgroundColor: isRoutingAll ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                              color: isRoutingAll ? 'var(--accent-purple)' : 'var(--text-secondary)',
                              border: `1px solid ${isRoutingAll ? 'rgba(139, 92, 246, 0.2)' : 'var(--glass-border)'}`,
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              Traffic: {rev.trafficWeight}%
                            </span>
                          </div>
                        </div>

                        {canAct && !isRoutingAll && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              onClick={() => setConfirmTarget({ type: 'revision', revision: rev })}
                              disabled={actionLoading !== null}
                              style={{
                                background: 'rgba(139, 92, 246, 0.08)',
                                border: '1px solid rgba(139, 92, 246, 0.25)',
                                color: 'var(--accent-purple)',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              ⚡ Activate Revision (100% Traffic)
                            </button>
                          </div>
                        )}

                        {/* Inline Traffic Split Confirmation */}
                        {confirmTarget?.type === 'revision' && confirmTarget.revision?.name === rev.name && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: 'rgba(139, 92, 246, 0.04)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <ShieldAlert size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                {activeRevisionsMode === 'Single' ? (
                                  <span>
                                    <strong>Notice:</strong> Shifting traffic to an inactive revision requires changing the Container App active revisions mode to <strong>Multiple</strong>. This will be done automatically. Confirm rollback to this revision?
                                  </span>
                                ) : (
                                  <span>Are you sure you want to shift 100% of traffic to revision <strong>{rev.name}</strong>? This instantly rolls back the live app traffic without a rebuild.</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                onClick={() => setConfirmTarget(null)}
                                className="btn-secondary"
                                style={{ padding: '2px 6px', fontSize: '0.68rem', height: '24px' }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleActivateRevision(rev)}
                                disabled={actionLoading !== null}
                                style={{
                                  background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '2px 6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  height: '24px'
                                }}
                              >
                                {actionLoading === 'revision' ? 'Activating...' : 'Confirm Rollback'}
                              </button>
                            </div>
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
    </>
  );
};
