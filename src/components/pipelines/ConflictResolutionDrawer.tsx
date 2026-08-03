import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink, Zap, Trash2, ArrowRight } from 'lucide-react';

interface PipelineConflictItem {
  id: string;
  name: string;
  provider: 'evaops_native' | 'azure_devops' | 'github_actions';
  is_active: boolean;
  project_name: string;
  pipeline_url?: string;
  repo_url?: string;
}

interface ConflictResolutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  pipelines: PipelineConflictItem[];
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
  onResolved: () => void;
}

export const ConflictResolutionDrawer: React.FC<ConflictResolutionDrawerProps> = ({
  isOpen,
  onClose,
  appName,
  pipelines,
  API_BASE,
  token,
  theme,
  onResolved
}) => {
  const [decommissioningId, setDecommissioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const handleDecommission = async (id: string) => {
    setDecommissioningId(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/pipelines/${id}/decommission`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        onResolved();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to decommission pipeline');
      }
    } catch (e: any) {
      setError(e.message || 'Decommissioning request failed');
    } finally {
      setDecommissioningId(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '520px',
        height: '100%',
        background: isLight ? '#ffffff' : '#0f172a',
        borderLeft: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Multi-CI/CD Conflict Detector</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Resource: {appName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Amber Alert Notice */}
        <div style={{
          padding: '14px',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: '20px',
          fontSize: '0.82rem',
          color: isLight ? '#92400e' : '#fef3c7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
            <span>Multiple Active CI/CD Triggers Detected</span>
          </div>
          Code check-ins to GitHub may trigger duplicate parallel deployments across GitHub Actions, Azure DevOps, and EvaForge. We recommend decommissioning legacy triggers to ensure 100% single-engine execution.
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.8rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Pipelines List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {pipelines.map((p) => {
            const isEvaForge = p.provider === 'evaops_native';
            const isAzure = p.provider === 'azure_devops';
            const isGithub = p.provider === 'github_actions';

            return (
              <div key={p.id} style={{
                padding: '16px',
                borderRadius: '12px',
                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                border: isEvaForge ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: isEvaForge ? 'rgba(168, 85, 247, 0.15)' : isAzure ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isEvaForge ? '#a855f7' : isAzure ? '#3b82f6' : '#10b981'
                  }}>
                    {isEvaForge ? (
                      <>EvaForge Native (Suggested Primary) <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.5rem', fontWeight: 900, padding: '1px 4px', borderRadius: '3px', background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(139,92,246,0.25))', border: '1px solid rgba(168,85,247,0.6)', color: '#f3e8ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>β BETA</span></>
                    ) : isAzure ? 'Azure DevOps' : 'GitHub Actions'}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Status: {p.is_active ? '🟢 Active Deployment Trigger' : '⚪ Decommissioned'}
                </div>

                {/* Decommission Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {isGithub && (
                    <button
                      type="button"
                      disabled={decommissioningId === p.id}
                      onClick={() => handleDecommission(p.id)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={13} /> {decommissioningId === p.id ? 'Decommissioning...' : '1-Click Decommission & Disable Workflow'}
                    </button>
                  )}

                  {isAzure && (
                    <>
                      <a
                        href={p.pipeline_url || 'https://dev.azure.com/esteviatech/Estevia-Platform/_build'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ExternalLink size={13} /> Open Azure DevOps Pipeline Settings
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDecommission(p.id)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Decommissioned
                      </button>
                    </>
                  )}

                  {isEvaForge && (
                    <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Selected Primary Autonomous Engine
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
