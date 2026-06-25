import React, { useState } from 'react';
import { Settings, Crown, Users, ShieldAlert, AlertTriangle, ChevronDown } from 'lucide-react';

interface SettingsPageProps {
  azureSubscriptionId: string;
  setAzureSubscriptionId: (val: string) => void;
  azureResourceGroup: string;
  setAzureResourceGroup: (val: string) => void;
  defaultDnsDomain: string;
  setDefaultDnsDomain: (val: string) => void;
  azureDevopsOrgUrl: string;
  setAzureDevopsOrgUrl: (val: string) => void;
  azureDevopsProject: string;
  setAzureDevopsProject: (val: string) => void;
  pipelineVariableGroup: string;
  setPipelineVariableGroup: (val: string) => void;
  githubOwner: string;
  setGithubOwner: (val: string) => void;
  azureContainerRegistry: string;
  setAzureContainerRegistry: (val: string) => void;
  azureDevopsServiceConnection: string;
  setAzureDevopsServiceConnection: (val: string) => void;
  dockerRegistryServiceConnection: string;
  setDockerRegistryServiceConnection: (val: string) => void;
  savingSettings: boolean;
  settingsMsg: { type: 'success' | 'error' | 'warning'; text: string } | null;
  handleSaveSettings: (e: React.FormEvent) => void;
  containerRegistries: any[];
  serviceConnections: { arm: any[]; docker: any[] };
  loadingMetadata: boolean;
  // License props (passed from App.tsx)
  licenseTier?: string;
  operatorSeatsLimit?: number;
  currentWriteUsers?: number;
  overSeatLimitWarning?: boolean;
  downgradeComplianceDebt?: any;
  downgradeImpactData?: any;
  showDowngradeModal?: boolean;
  setShowDowngradeModal?: (val: boolean) => void;
  downgradeConfirmInput?: string;
  setDowngradeConfirmInput?: (val: string) => void;
  pendingLicenseTier?: string | null;
  setPendingLicenseTier?: (val: string | null) => void;
  setOperatorSeatsLimit?: (val: number) => void;
  userRole?: string;
  organizationId?: string;
}

const TIER_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  growth:     { label: 'Growth',     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.25)'   },
  enterprise: { label: 'Enterprise', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)' },
  sovereign:  { label: 'Sovereign',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  azureSubscriptionId, setAzureSubscriptionId,
  azureResourceGroup, setAzureResourceGroup,
  defaultDnsDomain, setDefaultDnsDomain,
  azureDevopsOrgUrl, setAzureDevopsOrgUrl,
  azureDevopsProject, setAzureDevopsProject,
  pipelineVariableGroup, setPipelineVariableGroup,
  githubOwner, setGithubOwner,
  azureContainerRegistry, setAzureContainerRegistry,
  azureDevopsServiceConnection, setAzureDevopsServiceConnection,
  dockerRegistryServiceConnection, setDockerRegistryServiceConnection,
  savingSettings, settingsMsg, handleSaveSettings,
  containerRegistries, serviceConnections, loadingMetadata,
  licenseTier = 'growth',
  operatorSeatsLimit = 10,
  currentWriteUsers = 0,
  overSeatLimitWarning = false,
  downgradeComplianceDebt,
  downgradeImpactData,
  showDowngradeModal = false,
  setShowDowngradeModal,
  downgradeConfirmInput = '',
  setDowngradeConfirmInput,
  pendingLicenseTier,
  setPendingLicenseTier,
  setOperatorSeatsLimit,
  userRole,
  organizationId,
}) => {
  const isOwner = userRole === 'owner';
  const tierInfo = TIER_LABELS[licenseTier] ?? TIER_LABELS.growth;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Compliance Debt Banner ─────────────────────────────────────────── */}
      {downgradeComplianceDebt && (
        <div style={{
          padding: '16px 20px', borderRadius: '10px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <ShieldAlert size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.9rem', marginBottom: '4px' }}>
              ⚠️ Compliance Debt — Environments Frozen
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your subscription was recently downgraded. Environments exceeding the new tier limit have been <strong>frozen</strong> in EvaOps (they are NOT deleted from Azure).
              Decommission excess environments from the <strong>Dashboard</strong>, or upgrade your tier to re-activate them.
            </div>
          </div>
        </div>
      )}

      {/* ── Over-Seat-Limit Banner ─────────────────────────────────────────── */}
      {overSeatLimitWarning && (
        <div style={{
          padding: '14px 18px', borderRadius: '10px',
          background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: '#fbbf24' }}>Seat Limit Active:</strong> You have {currentWriteUsers} write-role users but set the limit to {operatorSeatsLimit}.
            No new Operator users can be added until the count drops below {operatorSeatsLimit}. Existing users are <strong>not</strong> affected.
          </div>
        </div>
      )}

      {/* ── Status & Feedback Message ──────────────────────────────────────── */}
      {settingsMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${settingsMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: 'var(--text-primary)', fontSize: '0.88rem',
        }}>
          {settingsMsg.text}
        </div>
      )}

      {/* ── Subscription & Licensing Card ─────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--glass-border)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1rem', fontWeight: 700 }}>
          <Crown size={16} style={{ color: '#fbbf24' }} /> Subscription &amp; Licensing
        </h4>

        {/* Current tier badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{
            padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
            background: tierInfo.bg, color: tierInfo.color, border: `1px solid ${tierInfo.border}`,
          }}>
            {tierInfo.label} Tier
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {operatorSeatsLimit} Operator seat{operatorSeatsLimit !== 1 ? 's' : ''} allocated &nbsp;·&nbsp;
            {currentWriteUsers} in use
          </span>
        </div>

        {/* Seat usage bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Operator Seats</span>
            <span style={{ color: currentWriteUsers >= operatorSeatsLimit ? '#f87171' : '#4ade80' }}>
              {currentWriteUsers} / {operatorSeatsLimit}
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px', transition: 'width 0.4s',
              width: `${Math.min(100, (currentWriteUsers / operatorSeatsLimit) * 100)}%`,
              background: currentWriteUsers >= operatorSeatsLimit
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }} />
          </div>
        </div>

        {isOwner ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Tier selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Subscription Tier
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={pendingLicenseTier ?? licenseTier}
                  onChange={e => setPendingLicenseTier?.(e.target.value !== licenseTier ? e.target.value : null)}
                  style={{
                    width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', appearance: 'none',
                    background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontSize: '0.88rem', cursor: 'pointer',
                  }}
                >
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="sovereign">Sovereign</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
              </div>
              {pendingLicenseTier && pendingLicenseTier !== licenseTier && (
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#fbbf24' }}>
                  ⚠️ Tier change pending — click Save to confirm
                </div>
              )}
            </div>

            {/* Seat limit */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Operator Seat Limit
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={operatorSeatsLimit}
                onChange={e => setOperatorSeatsLimit?.(parseInt(e.target.value, 10) || 1)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontSize: '0.88rem',
                }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Viewers do not consume a seat.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Only the <strong>Organization Owner</strong> can change subscription tier or seat limits.
          </div>
        )}
      </div>

      {/* ── Infrastructure & Integration Settings ─────────────────────────── */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--glass-border)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1rem', fontWeight: 700 }}>
          <Settings size={16} style={{ color: 'var(--accent-teal)' }} /> Infrastructure &amp; Integration Settings
        </h4>

        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Subscription ID</label>
              <input type="text" value={azureSubscriptionId} onChange={e => setAzureSubscriptionId(e.target.value)} placeholder="a812e8e3-34f9-4773-82ee-6398869533b0" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Target Resource Group</label>
              <input type="text" value={azureResourceGroup} onChange={e => setAzureResourceGroup(e.target.value)} placeholder="Estevia-Prod-RG" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Default DNS Domain</label>
              <input type="text" value={defaultDnsDomain} onChange={e => setDefaultDnsDomain(e.target.value)} placeholder="esteviatech.com" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Org URL</label>
              <input type="text" value={azureDevopsOrgUrl} onChange={e => setAzureDevopsOrgUrl(e.target.value)} placeholder="https://dev.azure.com/esteviatech" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps Project Name</label>
              <input type="text" value={azureDevopsProject} onChange={e => setAzureDevopsProject(e.target.value)} placeholder="Estevia-Platform" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Pipeline Variable Group</label>
              <input type="text" value={pipelineVariableGroup} onChange={e => setPipelineVariableGroup(e.target.value)} placeholder="estevia-frontend-vars" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Owner / Org</label>
              <input type="text" value={githubOwner} onChange={e => setGithubOwner(e.target.value)} placeholder="Estevia-TechSolutions" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure Container Registry (ACR)</label>
              <input type="text" list="acr-list" value={azureContainerRegistry} onChange={e => setAzureContainerRegistry(e.target.value)} placeholder="esteviacoreregistry.azurecr.io" />
              {containerRegistries.length > 0 && (
                <datalist id="acr-list">
                  {containerRegistries.map((cr: any) => <option key={cr.id} value={cr.loginServer}>{cr.name}</option>)}
                </datalist>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Azure DevOps RM Service Connection</label>
              <input type="text" list="arm-sc-list" value={azureDevopsServiceConnection} onChange={e => setAzureDevopsServiceConnection(e.target.value)} placeholder="protrack-azure-sc" />
              {serviceConnections.arm?.length > 0 && (
                <datalist id="arm-sc-list">
                  {serviceConnections.arm.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </datalist>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Docker Registry Service Connection</label>
              <input type="text" list="docker-sc-list" value={dockerRegistryServiceConnection} onChange={e => setDockerRegistryServiceConnection(e.target.value)} placeholder="estevia-acr-sc" />
              {serviceConnections.docker?.length > 0 && (
                <datalist id="docker-sc-list">
                  {serviceConnections.docker.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </datalist>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={savingSettings} style={{ width: '100%', marginTop: '8px' }}>
              {savingSettings ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Downgrade Confirmation Modal ───────────────────────────────────── */}
      {showDowngradeModal && downgradeImpactData && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px', width: '100%', padding: '36px',
            border: '1px solid rgba(239,68,68,0.35)', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(15,23,42,0.98) 100%)',
          }}>
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>
                Subscription Downgrade Confirmation
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Downgrading from <strong>{TIER_LABELS[downgradeImpactData.currentTier]?.label}</strong> to{' '}
                <strong>{TIER_LABELS[downgradeImpactData.targetTier]?.label}</strong> is a <strong>destructive action</strong>.
              </p>
            </div>

            {/* Impact summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {/* Environments */}
              <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>🧊 Environments to be Frozen</div>
                {downgradeImpactData.impact.environments.excess > 0 ? (
                  <>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      You have <strong>{downgradeImpactData.impact.environments.current}</strong> active environments.
                      The <strong>{TIER_LABELS[downgradeImpactData.targetTier]?.label}</strong> tier allows <strong>{downgradeImpactData.impact.environments.cap}</strong>.
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontStyle: 'italic' }}>
                      These will be frozen (NOT deleted): {downgradeImpactData.impact.environments.frozenAppNames.join(', ')}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.83rem', color: '#4ade80' }}>✓ No environments will be frozen.</div>
                )}
              </div>

              {/* Rules */}
              {downgradeImpactData.impact.rules.willBeLocked.length > 0 && (
                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>🔒 Compliance Rules to be Locked</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {downgradeImpactData.impact.rules.willBeLocked.join(', ')}
                  </div>
                </div>
              )}

              {/* Consequence */}
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ℹ️ Frozen environments <strong>remain in Azure</strong> — no data is lost.
                You can re-activate them by upgrading your tier or removing excess environments.
              </div>
            </div>

            {/* Type-to-confirm */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#f87171', marginBottom: '8px', fontWeight: 600 }}>
                Type your Organisation ID to confirm: <code style={{ background: 'rgba(239,68,68,0.12)', padding: '2px 6px', borderRadius: '4px' }}>{organizationId}</code>
              </label>
              <input
                type="text"
                value={downgradeConfirmInput}
                onChange={e => setDowngradeConfirmInput?.(e.target.value)}
                placeholder={organizationId}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--input-bg)', border: `1px solid ${downgradeConfirmInput === organizationId ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.3)'}`,
                  color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => { setShowDowngradeModal?.(false); setDowngradeConfirmInput?.(''); }}
                className="btn-secondary"
                style={{ flex: 1, padding: '11px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={downgradeConfirmInput !== organizationId || savingSettings}
                onClick={e => handleSaveSettings(e as any)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem',
                  background: downgradeConfirmInput === organizationId ? 'rgba(239,68,68,0.8)' : 'rgba(100,100,100,0.3)',
                  border: '1px solid rgba(239,68,68,0.4)', color: '#fff', cursor: downgradeConfirmInput === organizationId ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {savingSettings ? 'Downgrading...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
