import React from 'react';
import { Crown, ShieldAlert, AlertTriangle, Check, ShieldCheck, Zap } from 'lucide-react';

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
  // License props
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

const TIER_LABELS: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  growth:     { label: 'Growth',     color: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.2)',  glow: 'rgba(96,165,250,0.1)'  },
  enterprise: { label: 'Enterprise', color: '#c084fc', bg: 'rgba(192,132,252,0.06)', border: 'rgba(192,132,252,0.2)', glow: 'rgba(192,132,252,0.1)' },
  sovereign:  { label: 'Sovereign',  color: '#fbbf24', bg: 'rgba(251,191,36,0.06)',   border: 'rgba(251,191,36,0.2)',   glow: 'rgba(251,191,36,0.1)'   },
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  savingSettings,
  settingsMsg,
  handleSaveSettings,
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
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  const activeTier = pendingLicenseTier ?? licenseTier;
  const currentTierInfo = TIER_LABELS[licenseTier] ?? TIER_LABELS.growth;

  const tiers = [
    {
      id: 'growth',
      name: 'Growth',
      price: '$600',
      period: '/mo',
      color: '#60a5fa',
      features: [
        'Max 5 Active Environments',
        '3 Core Compliance Rules',
        'Manual Vulnerability Remediation',
        'Standard Email Support',
      ],
      desc: 'Perfect for fast-growing startup teams.'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Governance',
      price: '$1,800',
      period: '/mo',
      color: '#c084fc',
      features: [
        'Max 25 Active Environments',
        'All 9 Compliance Rules',
        'Autonomous Self-Healing Remediation',
        'Custom Rule Severities',
        '24/7 Slack & Email Support',
      ],
      desc: 'Complete control and automated compliance for enterprises.'
    },
    {
      id: 'sovereign',
      name: 'Sovereign Compliance',
      price: 'Custom',
      period: '',
      color: '#fbbf24',
      features: [
        'Unlimited Environments',
        'Unlimited + Custom Rules',
        'Autonomous Self-Healing Remediation',
        'On-Prem / Private Azure Tenant Deployments',
        'Dedicated Solutions Architect support',
      ],
      desc: 'Highly regulated institutional sectors requiring strict isolation.'
    }
  ];

  const handleCardSelect = (tierId: string) => {
    if (!isOwnerOrAdmin) return;
    if (setPendingLicenseTier) {
      setPendingLicenseTier(tierId !== licenseTier ? tierId : null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '10px 0' }}>

      {/* ── Compliance Debt Banner ── */}
      {downgradeComplianceDebt && (
        <div style={{
          padding: '16px 20px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
          animation: 'fade-in-anim 0.3s ease-out'
        }}>
          <ShieldAlert size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem', marginBottom: '4px' }}>
              ⚠️ Compliance Debt Active — Excess Resources Frozen
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your workspace was downgraded. Environments exceeding the new subscription tier limits have been <strong>frozen</strong> in EvaOps.
              They remain intact in Azure. To unfreeze them, decommission excess environments from the <strong>Cloud Scanning</strong> page or upgrade your subscription tier below.
            </div>
          </div>
        </div>
      )}

      {/* ── Over-Seat-Limit Banner ── */}
      {overSeatLimitWarning && (
        <div style={{
          padding: '16px 20px', borderRadius: '12px',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
          animation: 'fade-in-anim 0.3s ease-out'
        }}>
          <AlertTriangle size={20} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.92rem', marginBottom: '4px' }}>
              ⚠️ Write-Access Seat Limit Exceeded
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              You currently have <strong>{currentWriteUsers}</strong> active write-role users (Owner, Admin, Contributor) while your configured limit is set to <strong>{operatorSeatsLimit}</strong>.
              No new operator/write roles can be added until your user count drops below the limit. Viewers are unaffected.
            </div>
          </div>
        </div>
      )}

      {/* ── Status Messages ── */}
      {settingsMsg && (
        <div style={{
          padding: '14px 18px', borderRadius: '10px',
          background: settingsMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${settingsMsg.type === 'success' ? 'rgba(34,197,94,0.25)' : settingsMsg.type === 'warning' ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: 'var(--text-primary)', fontSize: '0.88rem',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          {settingsMsg.text}
        </div>
      )}

      {/* ── Subscription & Licensing Configuration Card ── */}
      <div className="glass-panel" style={{ padding: '36px', border: '1px solid var(--glass-border)', borderRadius: '16px', background: 'var(--panel-bg)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              <Crown size={22} style={{ color: '#fbbf24' }} />
              Subscription &amp; Licensing Settings
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '6px 0 0 0' }}>
              Select your organization tier, customize seat limits, and review compliance capacities.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Current Tier:</span>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
              background: currentTierInfo.bg, color: currentTierInfo.color, border: `1px solid ${currentTierInfo.border}`,
              boxShadow: `0 0 10px ${currentTierInfo.glow}`
            }}>
              {currentTierInfo.label}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveSettings}>
          {/* TIER SELECTION CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '36px'
          }}>
            {tiers.map((tier) => {
              const isCurrent = tier.id === licenseTier;
              const isSelected = tier.id === activeTier;
              const hasBorderColor = isSelected ? tier.color : 'var(--glass-border)';
              
              return (
                <div
                  key={tier.id}
                  onClick={() => handleCardSelect(tier.id)}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: `2px solid ${hasBorderColor}`,
                    background: isSelected ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.005)',
                    cursor: isOwnerOrAdmin ? 'pointer' : 'default',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isSelected ? `0 0 20px ${isSelected ? TIER_LABELS[tier.id].glow : 'transparent'}` : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (isOwnerOrAdmin && !isSelected) {
                      e.currentTarget.style.borderColor = tier.color;
                      e.currentTarget.style.boxShadow = `0 4px 15px ${TIER_LABELS[tier.id].glow}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isOwnerOrAdmin && !isSelected) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Selected/Active Badges */}
                  {isCurrent && (
                    <span style={{
                      position: 'absolute', top: '12px', right: '12px',
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                      background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)'
                    }}>
                      Active
                    </span>
                  )}
                  {!isCurrent && isSelected && (
                    <span style={{
                      position: 'absolute', top: '12px', right: '12px',
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                      background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)'
                    }}>
                      Pending Save
                    </span>
                  )}

                  {/* Tier Title */}
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                    {tier.name}
                  </h3>
                  
                  <p style={{ margin: '0 0 20px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', minHeight: '34px' }}>
                    {tier.desc}
                  </p>

                  {/* Pricing Display */}
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: tier.color }}>{tier.price}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>{tier.period}</span>
                  </div>

                  {/* Feature Lists */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <Check size={13} style={{ color: tier.color, flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SEAT AND CONFIG CONTROLS SECTION */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Utilization Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--accent-teal)' }} />
                    Active Seat Allocation
                  </span>
                  <span style={{ color: currentWriteUsers >= operatorSeatsLimit ? '#f87171' : 'var(--text-primary)' }}>
                    {currentWriteUsers} / {operatorSeatsLimit} in use
                  </span>
                </div>
                
                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px', transition: 'width 0.5s ease-out',
                    width: `${Math.min(100, (currentWriteUsers / operatorSeatsLimit) * 100)}%`,
                    background: currentWriteUsers >= operatorSeatsLimit
                      ? 'linear-gradient(90deg, #ef4444, #f87171)'
                      : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    boxShadow: currentWriteUsers >= operatorSeatsLimit
                      ? '0 0 10px rgba(239,68,68,0.2)'
                      : '0 0 10px rgba(99,102,241,0.2)'
                  }} />
                </div>
                
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Owners, Admins, and Contributors consume 1 operator seat limit. Viewers are free.
                </div>
              </div>

              {/* Limit Input Box */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                  <Zap size={14} style={{ color: '#fbbf24' }} /> Configure Seat Limit
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    disabled={!isOwnerOrAdmin}
                    value={operatorSeatsLimit}
                    onChange={e => setOperatorSeatsLimit?.(parseInt(e.target.value, 10) || 1)}
                    style={{
                      padding: '10px 14px', borderRadius: '8px',
                      background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '0.88rem', width: '120px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Limit configuration changes apply to active billing cycles immediately.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Action Area */}
          {isOwnerOrAdmin ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              {pendingLicenseTier && pendingLicenseTier !== licenseTier && (
                <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 500 }}>
                  ⚠️ Save changes to apply subscription transition
                </span>
              )}
              <button
                type="submit"
                className="btn-primary"
                disabled={savingSettings || (pendingLicenseTier === null && operatorSeatsLimit === (currentOrgSeatLimit() ?? 10))}
                style={{ padding: '10px 32px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700 }}
              >
                {savingSettings ? 'Applying License Settings...' : 'Save Configuration'}
              </button>
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '16px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)',
              fontSize: '0.84rem', color: 'var(--text-secondary)'
            }}>
              Only **Organization Owners** and **Administrators** can change subscription levels or seat limits.
            </div>
          )}
        </form>
      </div>

      {/* ── Downgrade Confirmation Modal ── */}
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

  // Helper local function to fetch initial seat limit
  function currentOrgSeatLimit(): number {
    return operatorSeatsLimit;
  }
};
