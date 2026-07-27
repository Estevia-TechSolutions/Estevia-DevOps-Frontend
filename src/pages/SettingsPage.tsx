import React from 'react';
import { redirectToEvaPayCheckout } from '../services/evaPayService';
import { Crown, ShieldAlert, AlertTriangle, Check, ShieldCheck, Zap, CreditCard, ChevronDown, ChevronUp, AlertCircle, ArrowRight, Info, TrendingUp } from 'lucide-react';

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
  invoices?: any[];
  onPayInvoice?: (invoiceId: number) => Promise<boolean>;
  isOrgDisabled?: boolean;
  // Sub-package billing props
  billingCurrency?: string;
  setBillingCurrency?: (val: string) => void;
  subPackageDevops?: boolean;
  setSubPackageDevops?: (val: boolean) => void;
  subPackageDeveloper?: boolean;
  setSubPackageDeveloper?: (val: boolean) => void;
  subPackageSecurity?: boolean;
  setSubPackageSecurity?: (val: boolean) => void;
  subPackageObservability?: boolean;
  setSubPackageObservability?: (val: boolean) => void;
}

// ── Primary color family aligned with app design tokens ──────────────────────
const TIER_LABELS: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  growth:     { label: 'Growth',                color: '#3b82f6', bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.22)',  glow: 'rgba(59,130,246,0.18)'  },
  enterprise: { label: 'Enterprise Governance', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.22)', glow: 'rgba(139,92,246,0.18)' },
  sovereign:  { label: 'Sovereign Compliance',  color: '#14b8a6', bg: 'rgba(20,184,166,0.06)',  border: 'rgba(20,184,166,0.22)',  glow: 'rgba(20,184,166,0.18)'  },
};

const PRICING_DETAILS: Record<string, { baseUSD: number; seatUSD: number }> = {
  growth:     { baseUSD: 1000, seatUSD: 40  },
  enterprise: { baseUSD: 2000, seatUSD: 90  },
  sovereign:  { baseUSD: 4000, seatUSD: 30  },
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
  invoices = [],
  onPayInvoice,
  isOrgDisabled = false,
  billingCurrency = 'USD',
  setBillingCurrency,
  subPackageDevops = false,
  setSubPackageDevops,
  subPackageDeveloper = false,
  setSubPackageDeveloper,
  subPackageSecurity = false,
  setSubPackageSecurity,
  subPackageObservability = false,
  setSubPackageObservability,
}) => {
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

  // Sub-tab navigation and simulated payment states
  const [activeSubTab, setActiveSubTab] = React.useState<'licensing' | 'billing' | 'forecast'>('licensing');
  const [payingInvoiceId, setPayingInvoiceId] = React.useState<number | null>(null);
  const [payError, setPayError] = React.useState<string | null>(null);

  // Exchange rate state
  const [usdToInrRate, setUsdToInrRate] = React.useState<number>(94.43);

  React.useEffect(() => {
    let active = true;
    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && typeof data.rates.INR === 'number') {
            if (active) setUsdToInrRate(data.rates.INR);
          }
        }
      } catch (_) {}
    };
    fetchRate();
    return () => { active = false; };
  }, []);

  // Expanded tier accordion state — current tier auto-expanded
  const [expandedTier, setExpandedTier] = React.useState<string | null>(licenseTier);

  // Save confirmation prompt state
  const [showSaveConfirmPrompt, setShowSaveConfirmPrompt] = React.useState(false);

  // Local draft states
  const [draftTier, setDraftTier] = React.useState<string | null>(pendingLicenseTier ?? null);
  const [draftSeats, setDraftSeats] = React.useState<number>(operatorSeatsLimit);
  const [draftCurrency, setDraftCurrency] = React.useState<string>(billingCurrency);
  const [draftDevops, setDraftDevops] = React.useState<boolean>(subPackageDevops);
  const [draftDeveloper, setDraftDeveloper] = React.useState<boolean>(subPackageDeveloper);
  const [draftSecurity, setDraftSecurity] = React.useState<boolean>(subPackageSecurity);
  const [draftObservability, setDraftObservability] = React.useState<boolean>(subPackageObservability);

  // Sync draft states to props only when canonical props update (e.g. after a successful save)
  React.useEffect(() => {
    setDraftTier(pendingLicenseTier ?? null);
    setDraftSeats(operatorSeatsLimit);
    setDraftCurrency(billingCurrency);
    setDraftDevops(subPackageDevops);
    setDraftDeveloper(subPackageDeveloper);
    setDraftSecurity(subPackageSecurity);
    setDraftObservability(subPackageObservability);
  }, [licenseTier, operatorSeatsLimit, billingCurrency, subPackageDevops, subPackageDeveloper, subPackageSecurity, subPackageObservability]);

  const activeTier = draftTier ?? licenseTier;
  const currentTierInfo = TIER_LABELS[licenseTier] ?? TIER_LABELS.growth;
  const activeTierInfo = TIER_LABELS[activeTier] ?? TIER_LABELS.growth;
  const activePricing = PRICING_DETAILS[activeTier] ?? PRICING_DETAILS.growth;

  const [expandedBreakdown, setExpandedBreakdown] = React.useState<Record<string, boolean>>({});

  interface BreakdownLine { label: string; value: string; bold?: boolean; dim?: boolean; }
  const getInvoiceBreakdown = (inv: any): BreakdownLine[] => {
    const lines: BreakdownLine[] = [];
    const amount = parseFloat(inv.amount || '0');
    const currency = inv.currency || 'USD';
    const isINR = currency === 'INR';
    const type = (inv.invoice_type || '').toLowerCase();
    
    const formatValue = (usdVal: number, inrVal: number, suffix = '') => {
      const usdStr = `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
      const inrStr = `₹${Math.round(inrVal).toLocaleString()}${suffix}`;
      return isINR ? `${inrStr} (≈ ${usdStr})` : `${usdStr} (≈ ${inrStr})`;
    };

    if (type === 'devops_package') {
      lines.push(
        { label: 'Item Type', value: '🚀 DevOps Sub-Package Fee' },
        { label: 'Base Subscription Price', value: formatValue(150, 12500, ' / month') },
        { label: 'Total Billed', value: formatValue(isINR ? amount / 83.3333 : amount, isINR ? amount : amount * 83.3333), bold: true }
      );
    } else if (type === 'developer_package') {
      lines.push(
        { label: 'Item Type', value: '💻 Developer Sub-Package Fee' },
        { label: 'Base Subscription Price', value: formatValue(99, 8250, ' / month') },
        { label: 'Total Billed', value: formatValue(isINR ? amount / 83.3333 : amount, isINR ? amount : amount * 83.3333), bold: true }
      );
    } else if (type === 'security_package') {
      lines.push(
        { label: 'Item Type', value: '🛡️ Security Sub-Package Fee' },
        { label: 'Base Subscription Price', value: formatValue(120, 10000, ' / month') },
        { label: 'Total Billed', value: formatValue(isINR ? amount / 83.3333 : amount, isINR ? amount : amount * 83.3333), bold: true }
      );
    } else {
      const baseRateUSD = licenseTier === 'growth' ? 1000 : licenseTier === 'enterprise' ? 2000 : 4000;
      const baseRateINR = licenseTier === 'growth' ? 83333 : licenseTier === 'enterprise' ? 166666 : 333333;
      const baseRate = isINR ? baseRateINR : baseRateUSD;

      const seatPriceUSD = licenseTier === 'growth' ? 40 : licenseTier === 'enterprise' ? 90 : 30;
      const seatPriceINR = licenseTier === 'growth' ? 3333 : licenseTier === 'enterprise' ? 7500 : 2500;
      const seatPrice = isINR ? seatPriceINR : seatPriceUSD;

      const billedSeats = Math.max(0, Math.round((amount - baseRate) / seatPrice));
      const seatTotalUSD = billedSeats * seatPriceUSD;
      const seatTotalINR = billedSeats * seatPriceINR;

      lines.push(
        { label: 'Item Type', value: '🏢 Platform Seat & License Fee' },
        { label: 'Base Platform Rate', value: formatValue(baseRateUSD, baseRateINR, ' / month') },
        { label: 'Seat Allocation', value: `${billedSeats} active seat${billedSeats !== 1 ? 's' : ''}` },
        { label: 'Rate Per Seat', value: formatValue(seatPriceUSD, seatPriceINR, ' / seat') },
        { label: 'Total Seat Surcharge', value: formatValue(seatTotalUSD, seatTotalINR) },
        { label: 'Total Amount Due', value: formatValue(isINR ? amount / 83.3333 : amount, isINR ? amount : amount * 83.3333), bold: true }
      );
    }
    return lines;
  };

  const hasTierChange = draftTier !== null && draftTier !== licenseTier;
  const hasSeatsChange = draftSeats !== operatorSeatsLimit;
  const hasCurrencyChange = draftCurrency !== billingCurrency;
  const hasDevopsChange = draftDevops !== subPackageDevops;
  const hasDevChange = draftDeveloper !== subPackageDeveloper;
  const hasSecChange = draftSecurity !== subPackageSecurity;
  const hasObsChange = draftObservability !== subPackageObservability;
  const hasAnyChange = hasTierChange || hasSeatsChange || hasCurrencyChange || hasDevopsChange || hasDevChange || hasSecChange || hasObsChange;

  // Downgrade detection (needed to decide whether to show confirm prompt vs downgrade modal)
  const tierRank: Record<string, number> = { growth: 1, enterprise: 2, sovereign: 3 };
  const isDowngrade = draftTier !== null && (tierRank[draftTier] ?? 0) < (tierRank[licenseTier] ?? 0);

  const handleReviewChanges = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Propagate all local draft states to parent props first so API payload is correct
    setPendingLicenseTier?.(draftTier);
    setOperatorSeatsLimit?.(draftSeats);
    setBillingCurrency?.(draftCurrency);
    setSubPackageDevops?.(draftDevops);
    setSubPackageDeveloper?.(draftDeveloper);
    setSubPackageSecurity?.(draftSecurity);
    setSubPackageObservability?.(draftObservability);
    
    if (isDowngrade) {
      // Let the existing downgrade modal handle it
      handleSaveSettings(e as any);
    } else {
      setShowSaveConfirmPrompt(true);
    }
  };

  const handleConfirmApply = (e: React.MouseEvent) => {
    setShowSaveConfirmPrompt(false);
    handleSaveSettings(e as any);
  };

  const handleCancelConfirm = () => {
    setShowSaveConfirmPrompt(false);
    // Rollback parent states to original props
    setPendingLicenseTier?.(null);
    setOperatorSeatsLimit?.(operatorSeatsLimit);
    setBillingCurrency?.(billingCurrency);
    setSubPackageDevops?.(subPackageDevops);
    setSubPackageDeveloper?.(subPackageDeveloper);
    setSubPackageSecurity?.(subPackageSecurity);
    setSubPackageObservability?.(subPackageObservability);
  };

  const handleCancelDowngrade = () => {
    setShowDowngradeModal?.(false);
    setDowngradeConfirmInput?.('');
    // Rollback parent states to original props
    setPendingLicenseTier?.(null);
    setOperatorSeatsLimit?.(operatorSeatsLimit);
    setBillingCurrency?.(billingCurrency);
    setSubPackageDevops?.(subPackageDevops);
    setSubPackageDeveloper?.(subPackageDeveloper);
    setSubPackageSecurity?.(subPackageSecurity);
  };

  const tiers = [
    {
      id: 'growth',
      name: 'Growth',
      price: '$1,000',
      priceINR: `₹${Math.round(1000 * usdToInrRate).toLocaleString()}`,
      period: '/mo',
      color: '#3b82f6',
      features: [
        'Max 5 Active Environments',
        '3 Core Compliance Rules',
        'Manual Vulnerability Remediation',
        'Standard Email Support',
      ],
      desc: 'Perfect for fast-growing startup teams.',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Governance',
      price: '$2,000',
      priceINR: `₹${Math.round(2000 * usdToInrRate).toLocaleString()}`,
      period: '/mo',
      color: '#8b5cf6',
      features: [
        'Max 25 Active Environments',
        'All 9 Compliance Rules',
        'Autonomous Self-Healing Remediation',
        'Custom Rule Severities',
        '24/7 Slack & Email Support',
      ],
      desc: 'Complete control and automated compliance for enterprises.',
    },
    {
      id: 'sovereign',
      name: 'Sovereign Compliance',
      price: '$4,000',
      priceINR: `₹${Math.round(4000 * usdToInrRate).toLocaleString()}`,
      period: '/mo',
      color: '#14b8a6',
      features: [
        'Unlimited Environments',
        'Unlimited + Custom Rules',
        'Autonomous Self-Healing Remediation',
        'On-Prem / Private Azure Tenant Deployments',
        'Dedicated Solutions Architect support',
      ],
      desc: 'Highly regulated institutional sectors requiring strict isolation.',
    },
  ];

  const handleCardClick = (tierId: string) => {
    if (!isOwnerOrAdmin || isOrgDisabled) return;
    // Expand AND select
    setExpandedTier(tierId);
    setDraftTier(tierId !== licenseTier ? tierId : null);
    setShowSaveConfirmPrompt(false);
  };

  const handleToggleExpand = (e: React.MouseEvent, tierId: string) => {
    e.stopPropagation();
    setExpandedTier(prev => prev === tierId ? null : tierId);
  };

  // Projected cost
  const devopsPriceUSD = draftDevops ? 150 : 0;
  const developerPriceUSD = draftDeveloper ? 99 : 0;
  const securityPriceUSD = draftSecurity ? 120 : 0;
  const observabilityPriceUSD = draftObservability ? 149 : 0;

  const devopsPriceINR = draftDevops ? 12500 : 0;
  const developerPriceINR = draftDeveloper ? 8250 : 0;
  const securityPriceINR = draftSecurity ? 10000 : 0;
  const observabilityPriceINR = draftObservability ? 12000 : 0;

  const projectedUSD = activePricing.baseUSD + activePricing.seatUSD * currentWriteUsers + devopsPriceUSD + developerPriceUSD + securityPriceUSD + observabilityPriceUSD;
  const projectedINR = Math.round((activePricing.baseUSD + activePricing.seatUSD * currentWriteUsers) * usdToInrRate) + devopsPriceINR + developerPriceINR + securityPriceINR + observabilityPriceINR;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>

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
              They remain intact in Azure. To unfreeze them, decommission excess environments or upgrade your tier below.
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
              You currently have <strong>{currentWriteUsers}</strong> active write-role users while your configured limit is <strong>{operatorSeatsLimit}</strong>.
              No new operator/write roles can be added until your user count drops below the limit.
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

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>

        {/* ── LEFT PANEL (crisp at-a-glance) ── */}
        <div className="glass-panel" style={{
          width: '280px',
          flexShrink: 0,
          padding: '28px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: 'linear-gradient(160deg, rgba(251,191,36,0.10) 0%, rgba(202,138,4,0.14) 55%, rgba(133,77,14,0.18) 100%)',
          borderColor: 'rgba(251,191,36,0.20)',
          boxShadow: '0 0 28px rgba(251,191,36,0.06), inset 0 0 20px rgba(251,191,36,0.03)',
        }}>
          {/* Crown Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Licensing Control
            </span>
          </div>

          {/* Current Tier Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Active Tier
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
              background: currentTierInfo.bg, color: currentTierInfo.color,
              border: `1px solid ${currentTierInfo.border}`,
              boxShadow: `0 0 12px ${currentTierInfo.glow}`,
              alignSelf: 'flex-start',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentTierInfo.color, display: 'inline-block' }} />
              {currentTierInfo.label}
            </span>
            {pendingLicenseTier && pendingLicenseTier !== licenseTier && (
              <span style={{ fontSize: '0.72rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight size={11} />
                Pending: {TIER_LABELS[pendingLicenseTier]?.label}
              </span>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(251,191,36,0.15)' }} />

          {/* Projected Monthly Cost */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Projected Monthly Cost
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                <span>Base ({activeTierInfo.label})</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${activePricing.baseUSD.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                <span>{currentWriteUsers} active seat{currentWriteUsers !== 1 ? 's' : ''} × ${activePricing.seatUSD}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${(activePricing.seatUSD * currentWriteUsers).toLocaleString()}</span>
              </div>
              {draftDevops && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <span>🚀 DevOps Sub-Package</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+$150</span>
                </div>
              )}
              {draftDeveloper && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <span>💻 Developer Sub-Package</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+$99</span>
                </div>
              )}
              {draftSecurity && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <span>🛡️ Security Sub-Package</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+$120</span>
                </div>
              )}
              {draftObservability && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <span>📊 Observability Sub-Package</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+$149</span>
                </div>
              )}
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '2px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-primary)' }}>Total /mo</span>
                <span style={{ color: activeTierInfo.color }}>${projectedUSD.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                ≈ ₹{projectedINR.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(251,191,36,0.15)' }} />

          {/* Seat & Access Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Seat &amp; Access Info
            </span>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.45'
            }}>
              <span>• <strong>Operator seats</strong> represent users with active write/admin roles.</span>
              <span style={{ display: 'inline-block', marginTop: '4px' }}>• <strong>Viewer seats</strong> (read-only) are completely unlimited and free.</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(251,191,36,0.15)' }} />

          {/* Tier Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Tier Specifications
            </span>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {activeTier === 'growth' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> 5 Environments max</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> 3 Compliance rules</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Manual remediation</div>
                </>
              )}
              {activeTier === 'enterprise' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> 25 Environments max</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> 9 Compliance rules</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Auto-healing remediation</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Custom rule severities</div>
                </>
              )}
              {activeTier === 'sovereign' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Unlimited environments</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Custom rules supported</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Air-gapped / Private deploy</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: activeTierInfo.color }} /> Dedicated Architect Support</div>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(251,191,36,0.15)' }} />

          {/* Live Exchange Rate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Exchange Rate
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
              1 USD = {usdToInrRate.toFixed(2)} INR
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Live via er-api.com · fallback 94.43</span>
          </div>

          {/* Footer role note */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(251,191,36,0.12)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Only <strong style={{ color: 'var(--text-secondary)' }}>Owners</strong> &amp; <strong style={{ color: 'var(--text-secondary)' }}>Admins</strong> can change subscription levels or seat limits.
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                <Crown size={20} style={{ color: '#fbbf24' }} />
                Licensing &amp; Subscription Control
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '5px 0 0 0' }}>
                Select your organisation tier, configure seat limits, and review compliance capacities.
              </p>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1px', gap: '8px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('licensing')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeSubTab === 'licensing' ? 'var(--accent-purple)' : 'transparent'}`,
                color: activeSubTab === 'licensing' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeSubTab === 'licensing' ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Crown size={15} style={{ color: activeSubTab === 'licensing' ? 'var(--accent-purple)' : 'var(--text-muted)' }} />
              Subscription &amp; Licensing
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('billing')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeSubTab === 'billing' ? 'var(--accent-purple)' : 'transparent'}`,
                color: activeSubTab === 'billing' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeSubTab === 'billing' ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CreditCard size={15} style={{ color: activeSubTab === 'billing' ? 'var(--accent-purple)' : 'var(--text-muted)' }} />
              Billing &amp; Invoices
              {invoices.some((inv: any) => inv.status === 'Pending') && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  lineHeight: 1,
                  marginLeft: '4px'
                }}>
                  {invoices.filter((inv: any) => inv.status === 'Pending').length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('forecast')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeSubTab === 'forecast' ? 'var(--accent-purple)' : 'transparent'}`,
                color: activeSubTab === 'forecast' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeSubTab === 'forecast' ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <TrendingUp size={15} style={{ color: activeSubTab === 'forecast' ? 'var(--accent-purple)' : 'var(--text-muted)' }} />
              Forecast Projections
            </button>
          </div>

          {activeSubTab === 'licensing' && (
            <form onSubmit={handleSaveSettings}>

            {/* ── TIER SELECTION CARDS (Accordion) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {tiers.map((tier) => {
                const isCurrent = tier.id === licenseTier;
                const isSelected = tier.id === activeTier;
                const isExpanded = expandedTier === tier.id;
                const tierInfo = TIER_LABELS[tier.id];

                return (
                  <div
                    key={tier.id}
                    onClick={() => handleCardClick(tier.id)}
                    style={{
                      borderRadius: '14px',
                      border: `2px solid ${isSelected ? tier.color : 'var(--glass-border)'}`,
                      background: isSelected
                        ? `linear-gradient(145deg, ${tierInfo.bg} 0%, rgba(255,255,255,0.01) 100%)`
                        : 'rgba(255,255,255,0.005)',
                      cursor: (isOwnerOrAdmin && !isOrgDisabled) ? 'pointer' : 'default',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isSelected ? `0 0 22px ${tierInfo.glow}` : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (isOwnerOrAdmin && !isOrgDisabled && !isSelected) {
                        e.currentTarget.style.borderColor = tier.color;
                        e.currentTarget.style.boxShadow = `0 4px 16px ${tierInfo.glow}`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isOwnerOrAdmin && !isOrgDisabled && !isSelected) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Colour bar accent on top */}
                    <div style={{ height: '3px', background: `linear-gradient(90deg, ${tier.color}, transparent)`, borderRadius: '14px 14px 0 0' }} />

                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                      {/* Badges */}
                      <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '5px' }}>
                        {isCurrent && (
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                            background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)'
                          }}>Active</span>
                        )}
                        {!isCurrent && isSelected && (
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                            background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)'
                          }}>Pending Save</span>
                        )}
                      </div>

                      {/* Tier name */}
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 750, color: isSelected ? tier.color : 'var(--text-primary)', paddingRight: '70px' }}>
                        {tier.name}
                      </h3>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {tier.desc}
                      </p>

                      {/* Pricing */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: tier.color, lineHeight: 1 }}>{tier.price}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{tier.period}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CreditCard size={11} style={{ color: tier.color }} />
                          <span>≈ {tier.priceINR}{tier.period}</span>
                        </div>
                      </div>

                      {/* Accordion feature list */}
                      <div style={{
                        overflow: 'hidden',
                        maxHeight: isExpanded ? '300px' : '0px',
                        transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        <div style={{ borderTop: `1px solid ${isSelected ? tierInfo.border : 'var(--glass-border)'}`, paddingTop: '12px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {tier.features.map((feat, fIdx) => (
                              <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                <Check size={12} style={{ color: tier.color, flexShrink: 0, marginTop: '2px' }} />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleExpand(e, tier.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.72rem', color: isSelected ? tier.color : 'var(--text-secondary)',
                          fontWeight: 600, padding: '6px 0 0 0',
                          transition: 'color 0.2s',
                          marginTop: 'auto',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = tier.color)}
                        onMouseLeave={e => (e.currentTarget.style.color = isSelected ? tier.color : 'var(--text-secondary)')}
                      >
                        {isExpanded
                          ? <><ChevronUp size={13} /> Collapse</>
                          : <><ChevronDown size={13} /> See Details</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── SEAT & CURRENCY CONFIGURATION ── */}
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '22px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', alignItems: 'center' }}>

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
                        : 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                      boxShadow: currentWriteUsers >= operatorSeatsLimit
                        ? '0 0 10px rgba(239,68,68,0.2)'
                        : '0 0 10px rgba(99,102,241,0.2)',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Owners, Admins, and Contributors consume 1 seat. Viewers are free.
                  </div>
                </div>

                {/* Seat Limit Input */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                    <Zap size={14} style={{ color: '#fbbf24' }} />
                    Configure Seat Limit
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      disabled={!isOwnerOrAdmin || isOrgDisabled}
                      value={draftSeats}
                      onChange={e => {
                        setDraftSeats(parseInt(e.target.value, 10) || 1);
                        setShowSaveConfirmPrompt(false);
                      }}
                      style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)', fontSize: '0.88rem', width: '110px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Changes apply to your active billing cycle.
                    </span>
                  </div>
                </div>

                {/* Preferred Currency Selector */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                    <CreditCard size={14} style={{ color: 'var(--accent-purple)' }} />
                    Preferred Billing Currency
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      disabled={!isOwnerOrAdmin || isOrgDisabled}
                      value={draftCurrency}
                      onChange={e => {
                        setDraftCurrency(e.target.value);
                        setShowSaveConfirmPrompt(false);
                      }}
                      style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)', fontSize: '0.88rem', width: '120px',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Currency for sub-package invoices.
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── SUB-PACKAGES CONFIGURATION ── */}
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '22px',
              marginBottom: '24px',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                <Crown size={18} style={{ color: 'var(--accent-purple)' }} />
                DevOps Sub-Packages & Features
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Enable or disable feature categories for your organization. Activating a package adds it to your active billing cycle immediately.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* DevOps Package Card */}
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1.5px solid ${draftDevops ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                  background: draftDevops ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.005)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>🚀 DevOps Package</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                          background: draftDevops ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                          color: draftDevops ? '#4ade80' : 'var(--text-secondary)',
                          border: draftDevops ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-border)'
                        }}>
                          {draftDevops ? 'Subscribed' : 'Inactive'}
                        </span>
                        <input 
                          type="checkbox"
                          checked={draftDevops}
                          disabled={!isOwnerOrAdmin || isOrgDisabled}
                          onChange={(e) => {
                            setDraftDevops(e.target.checked);
                            setShowSaveConfirmPrompt(false);
                          }}
                          style={{ width: '16px', height: '16px', cursor: (isOwnerOrAdmin && !isOrgDisabled) ? 'pointer' : 'default' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          {billingCurrency === 'INR' ? '₹12,500' : '$150.00'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>/ month</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {billingCurrency === 'INR' ? '≈ $150.00 / month' : '≈ ₹12,500 / month'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {[
                        'Provision SWA and Container Apps',
                        'Run, Prioritize, and Redeploy pipelines',
                        'Setup Custom Domains and Teams Hooks'
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Developer Package Card */}
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1.5px solid ${draftDeveloper ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                  background: draftDeveloper ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.005)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>💻 Developer Package</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                          background: draftDeveloper ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                          color: draftDeveloper ? '#4ade80' : 'var(--text-secondary)',
                          border: draftDeveloper ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-border)'
                        }}>
                          {draftDeveloper ? 'Subscribed' : 'Inactive'}
                        </span>
                        <input 
                          type="checkbox"
                          checked={draftDeveloper}
                          disabled={!isOwnerOrAdmin || isOrgDisabled}
                          onChange={(e) => {
                            setDraftDeveloper(e.target.checked);
                            setShowSaveConfirmPrompt(false);
                          }}
                          style={{ width: '16px', height: '16px', cursor: (isOwnerOrAdmin && !isOrgDisabled) ? 'pointer' : 'default' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          {billingCurrency === 'INR' ? '₹8,250' : '$99.00'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>/ month</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {billingCurrency === 'INR' ? '≈ $99.00 / month' : '≈ ₹8,250 / month'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {[
                        'Register Database Servers & Instances',
                        'Execute SQL Queries in DB Catalog explorer',
                        'Edit and Validate Dockerfiles & YMLs'
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security Package Card */}
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1.5px solid ${draftSecurity ? 'var(--accent-teal)' : 'var(--glass-border)'}`,
                  background: draftSecurity ? 'rgba(20,184,166,0.04)' : 'rgba(255,255,255,0.005)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>🛡️ Security Package</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                          background: draftSecurity ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                          color: draftSecurity ? '#4ade80' : 'var(--text-secondary)',
                          border: draftSecurity ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-border)'
                        }}>
                          {draftSecurity ? 'Subscribed' : 'Inactive'}
                        </span>
                        <input 
                          type="checkbox"
                          checked={draftSecurity}
                          disabled={!isOwnerOrAdmin || isOrgDisabled}
                          onChange={(e) => {
                            setDraftSecurity(e.target.checked);
                            setShowSaveConfirmPrompt(false);
                          }}
                          style={{ width: '16px', height: '16px', cursor: (isOwnerOrAdmin && !isOrgDisabled) ? 'pointer' : 'default' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          {billingCurrency === 'INR' ? '₹10,000' : '$120.00'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>/ month</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {billingCurrency === 'INR' ? '≈ $120.00 / month' : '≈ ₹10,000 / month'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {[
                        'Run Azure Policy Compliance scans',
                        'Configure security auto-remediations',
                        'Query Eva AI for cost optimization suggestions'
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Observability & AI Package Card */}
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1.5px solid ${draftObservability ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                  background: draftObservability ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.005)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>📊 Observability & AI Package</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                          background: draftObservability ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                          color: draftObservability ? '#4ade80' : 'var(--text-secondary)',
                          border: draftObservability ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--glass-border)'
                        }}>
                          {draftObservability ? 'Subscribed' : 'Inactive'}
                        </span>
                        <input 
                          type="checkbox"
                          checked={draftObservability}
                          disabled={!isOwnerOrAdmin || isOrgDisabled}
                          onChange={(e) => {
                            setDraftObservability(e.target.checked);
                            setShowSaveConfirmPrompt(false);
                          }}
                          style={{ width: '16px', height: '16px', cursor: (isOwnerOrAdmin && !isOrgDisabled) ? 'pointer' : 'default' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          {billingCurrency === 'INR' ? '₹12,000' : '$149.00'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>/ month</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {billingCurrency === 'INR' ? '≈ $149.00 / month' : '≈ ₹12,000 / month'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {[
                        '24/7 Prometheus Metrics & Telemetry History',
                        'Automated Incident Detection & Email Alerts',
                        'Eva AI Cost & Remediation Assistant'
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SAVE CONFIRMATION PROMPT (slide-up inline panel) ── */}
            {isOwnerOrAdmin && showSaveConfirmPrompt && (
              <div style={{
                borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.25)',
                borderLeft: '3px solid var(--accent-purple)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
                padding: '20px 22px',
                marginBottom: '16px',
                boxShadow: '0 4px 20px rgba(99,102,241,0.12)',
                animation: 'fade-in-anim 0.2s ease-out',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AlertCircle size={16} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Confirm Changes</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                  Review the changes below before applying.
                </p>

                {/* Diff rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {hasTierChange && draftTier && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                        💳 Subscription Tier
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                          borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem', color: 'var(--text-secondary)'
                        }}>
                          {TIER_LABELS[licenseTier]?.label ?? licenseTier}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span style={{
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
                          borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem',
                          color: 'var(--accent-purple)', fontWeight: 700,
                        }}>
                          {TIER_LABELS[draftTier]?.label ?? draftTier}
                        </span>
                      </div>
                    </div>
                  )}

                  {hasSeatsChange && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                        🪑 Operator Seat Limit
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                          borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem', color: 'var(--text-secondary)'
                        }}>
                          {operatorSeatsLimit} seats
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span style={{
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
                          borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem',
                          color: 'var(--accent-purple)', fontWeight: 700,
                        }}>
                          {draftSeats} seats
                        </span>
                      </div>
                    </div>
                  )}

                  {hasCurrencyChange && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                        💵 Billing Currency
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                          borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem', color: 'var(--text-secondary)'
                        }}>
                          {billingCurrency}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span style={{
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
                          borderRadius: '6px', padding: '3px 10px', fontSize: '0.8rem',
                          color: 'var(--accent-purple)', fontWeight: 700,
                        }}>
                          {draftCurrency}
                        </span>
                      </div>
                    </div>
                  )}

                  {hasDevopsChange && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                        🚀 DevOps Package
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {subPackageDevops ? 'Subscribed' : 'Inactive'}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                          {draftDevops ? 'Subscribed (Invoice Issued)' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}

                  {hasDevChange && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                        💻 Developer Package
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {subPackageDeveloper ? 'Subscribed' : 'Inactive'}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                          {draftDeveloper ? 'Subscribed (Invoice Issued)' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}

                  {hasSecChange && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                        🛡️ Security Package
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {subPackageSecurity ? 'Subscribed' : 'Inactive'}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                          {draftSecurity ? 'Subscribed (Invoice Issued)' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <Info size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Changes apply immediately to your active billing cycle.
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelConfirm}
                    style={{ padding: '9px 20px', fontSize: '0.84rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={handleConfirmApply}
                    style={{
                      padding: '9px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '0.84rem',
                      background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                      border: 'none', color: '#fff',
                      boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
                      cursor: savingSettings ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: savingSettings ? 0.7 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!savingSettings) {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(99,102,241,0.3)';
                    }}
                  >
                    {savingSettings ? 'Applying...' : 'Apply Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── ACTION BAR ── */}
            {isOwnerOrAdmin ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '18px' }}>
                {draftTier && draftTier !== licenseTier && !showSaveConfirmPrompt && (
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 500 }}>
                    ⚠️ Save changes to apply subscription transition
                  </span>
                )}
                {showSaveConfirmPrompt ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                    ↑ Review your changes above
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingSettings || !hasAnyChange || isOrgDisabled}
                    onClick={handleReviewChanges}
                    style={{ padding: '10px 32px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700 }}
                  >
                    {savingSettings ? 'Applying License Settings...' : hasAnyChange ? 'Review Changes' : 'No Changes'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '16px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.015)', border: '1px solid var(--glass-border)',
                fontSize: '0.84rem', color: 'var(--text-secondary)'
              }}>
                Only <strong>Organisation Owners</strong> and <strong>Administrators</strong> can change subscription levels or seat limits.
              </div>
            )}

          </form>
          )}

          {activeSubTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fade-in-anim 0.2s ease-out' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* Invoices list */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--divider)' }}>
                          <th style={{ padding: '14px 18px' }}>Invoice Number</th>
                          <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Billing Type</th>
                          <th style={{ padding: '14px 18px' }}>Amount</th>
                          <th style={{ padding: '14px 18px' }}>Due Date</th>
                          <th style={{ padding: '14px 18px' }}>Status</th>
                          <th style={{ padding: '14px 18px', width: '100px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No invoices generated for your organization.
                            </td>
                          </tr>
                        ) : (
                          invoices.map((inv: any) => (
                            <React.Fragment key={inv.id}>
                              <tr style={{ borderBottom: expandedBreakdown[inv.id] ? 'none' : '1px solid var(--divider)' }}>
                                <td style={{ padding: '14px 18px', fontWeight: 600 }}>{inv.invoice_number}</td>
                                <td style={{ padding: '14px 18px' }}>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                    background: inv.invoice_type === 'devops_package' ? 'rgba(59,130,246,0.08)'
                                              : inv.invoice_type === 'developer_package' ? 'rgba(139,92,246,0.08)'
                                              : inv.invoice_type === 'security_package' ? 'rgba(20,184,166,0.08)'
                                              : 'rgba(251,191,36,0.08)',
                                    color: inv.invoice_type === 'devops_package' ? '#60a5fa'
                                         : inv.invoice_type === 'developer_package' ? '#c084fc'
                                         : inv.invoice_type === 'security_package' ? '#2dd4bf'
                                         : '#fbbf24',
                                    border: inv.invoice_type === 'devops_package' ? '1px solid rgba(59,130,246,0.2)'
                                          : inv.invoice_type === 'developer_package' ? '1px solid rgba(139,92,246,0.2)'
                                          : inv.invoice_type === 'security_package' ? '1px solid rgba(20,184,166,0.2)'
                                          : '1px solid rgba(251,191,36,0.2)'
                                  }}>
                                    {inv.invoice_type === 'devops_package' ? '🚀 DevOps'
                                     : inv.invoice_type === 'developer_package' ? '💻 Developer'
                                     : inv.invoice_type === 'security_package' ? '🛡️ Security'
                                     : '🏢 Platform'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 18px', position: 'relative' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                      {inv.currency === 'INR' 
                                        ? `₹${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : `$${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      }
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      {inv.currency === 'INR'
                                        ? `≈ $${(parseFloat(inv.amount) / 83.3333).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : `≈ ₹${Math.round(parseFloat(inv.amount) * 83.3333).toLocaleString(undefined, { minimumFractionDigits: 0 })}`
                                      }
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    title="Show calculation breakdown"
                                    onClick={(e) => {
                                      setExpandedBreakdown(prev => ({
                                        ...prev,
                                        [inv.id]: !prev[inv.id]
                                      }));
                                    }}
                                    style={{
                                      background: expandedBreakdown[inv.id] ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.08)',
                                      border: `1.5px solid ${expandedBreakdown[inv.id] ? 'rgba(99,102,241,0.35)' : 'rgba(245,158,11,0.4)'}`,
                                      borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                                      color: expandedBreakdown[inv.id] ? '#818cf8' : '#f59e0b',
                                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                                      fontSize: '0.68rem', fontWeight: 800, transition: 'all 0.15s',
                                      marginTop: '4px', outline: 'none'
                                    }}
                                  >
                                    <Info size={11} />
                                    <span>Breakdown</span>
                                    {expandedBreakdown[inv.id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                  </button>
                                </td>
                                <td style={{ padding: '14px 18px' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                                <td style={{ padding: '14px 18px' }}>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    background: inv.status === 'Paid' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                                    color: inv.status === 'Paid' ? 'var(--success)' : 'var(--warning)',
                                    border: inv.status === 'Paid' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)'
                                  }}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 18px' }}>
                                  {inv.status === 'Pending' ? (
                                    <button
                                      type="button"
                                      onClick={() => redirectToEvaPayCheckout({
                                        app_id: 'EvaOps',
                                        amount: parseFloat(inv.amount || '0'),
                                        currency: inv.currency || 'INR',
                                        return_url: `${window.location.origin}/?tab=settings`
                                      })}
                                      style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                        color: '#ffffff',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                                      }}
                                    >
                                      <CreditCard size={13} /> Pay via EvaPay
                                    </button>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                                      Settled
                                    </span>
                                  )}
                                </td>
                              </tr>
                              {expandedBreakdown[inv.id] && (() => {
                                const lines = getInvoiceBreakdown(inv);
                                return (
                                  <tr style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid var(--divider)' }}>
                                    <td colSpan={6} style={{ padding: '4px 18px 16px 18px' }}>
                                      <div style={{
                                        background: 'var(--bg-secondary)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1.5px solid var(--glass-border)',
                                        borderRadius: '10px',
                                        boxShadow: 'var(--modal-shadow)',
                                        padding: '12px',
                                        textAlign: 'left'
                                      }}>
                                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid var(--divider)', paddingBottom: '4px' }}>
                                          Calculation Breakup
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {lines.map((line, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                              <span style={{ fontSize: '0.74rem', color: line.dim ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                                                {line.label}
                                              </span>
                                              <span style={{ fontSize: '0.74rem', color: line.bold ? 'var(--accent-purple)' : 'var(--text-primary)', fontWeight: line.bold ? 800 : 600, whiteSpace: 'nowrap' }}>
                                                {line.value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })()}
                            </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {payingInvoiceId && (
                  <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                  }}>
                    <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid var(--glass-border)', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.99) 100%)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)', animation: 'fade-in-anim 0.25s ease-out' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={15} style={{ color: 'var(--accent-purple)' }} />
                        SaaS Checkout Simulator
                      </h4>

                      {payError && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid var(--error)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          color: '#fca5a5',
                          fontSize: '0.8rem',
                          marginBottom: '16px'
                        }}>
                          {payError}
                        </div>
                      )}

                      <div style={{
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '14px',
                        marginBottom: '18px',
                        fontSize: '0.82rem'
                      }}>
                        <div style={{ color: 'var(--text-secondary)' }}>Outstanding Balance</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>
                          {(() => {
                            const inv = invoices.find((i: any) => i.id === payingInvoiceId);
                            if (!inv) return '—';
                            const amt = parseFloat(inv.amount || '0');
                            return inv.currency === 'INR'
                              ? `₹${amt.toLocaleString()} (≈ $${(amt / 83.3333).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                              : `$${amt.toLocaleString()} (≈ ₹${Math.round(amt * 83.3333).toLocaleString()})`;
                          })()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Reference: {invoices.find((i: any) => i.id === payingInvoiceId)?.invoice_number}
                        </div>
                      </div>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!payingInvoiceId || !onPayInvoice) return;
                        setPayError(null);
                        try {
                          const success = await onPayInvoice(payingInvoiceId);
                          if (success) {
                            setPayingInvoiceId(null);
                          } else {
                            setPayError('Failed to process simulated payment.');
                          }
                        } catch (err: any) {
                          setPayError(err.message || 'Payment simulation failed.');
                        }
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Cardholder Name</label>
                          <input type="text" placeholder="John Doe" required style={{ width: '100%', padding: '9px 12px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Card Number</label>
                          <input type="text" placeholder="4242 4242 4242 4242" required style={{ width: '100%', padding: '9px 12px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Expiry</label>
                            <input type="text" placeholder="MM/YY" required style={{ width: '100%', padding: '9px 12px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>CVC</label>
                            <input type="text" placeholder="123" required style={{ width: '100%', padding: '9px 12px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setPayingInvoiceId(null)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid var(--glass-border)',
                              background: 'var(--glass-bg)',
                              color: 'var(--text-primary)',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{
                              flex: 1.5,
                              padding: '10px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Clear Balance
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {activeSubTab === 'forecast' && (() => {
            const basePriceUSD = licenseTier === 'growth' ? 1000 : licenseTier === 'enterprise' ? 2000 : 4000;
            const basePriceINR = licenseTier === 'growth' ? 83333 : licenseTier === 'enterprise' ? 166666 : 333333;
            
            const seatPriceUSD = licenseTier === 'growth' ? 40 : licenseTier === 'enterprise' ? 90 : 30;
            const seatPriceINR = licenseTier === 'growth' ? 3333 : licenseTier === 'enterprise' ? 7500 : 2500;
            
            const devopsPriceUSD = subPackageDevops ? 150 : 0;
            const devopsPriceINR = subPackageDevops ? 12500 : 0;
            
            const developerPriceUSD = subPackageDeveloper ? 99 : 0;
            const developerPriceINR = subPackageDeveloper ? 8250 : 0;
            
            const securityPriceUSD = subPackageSecurity ? 120 : 0;
            const securityPriceINR = subPackageSecurity ? 10000 : 0;
            
            const observabilityPriceUSD = subPackageObservability ? 149 : 0;
            const observabilityPriceINR = subPackageObservability ? 12000 : 0;
            
            const totalUSD = basePriceUSD + (currentWriteUsers * seatPriceUSD) + devopsPriceUSD + developerPriceUSD + securityPriceUSD + observabilityPriceUSD;
            const totalINR = basePriceINR + (currentWriteUsers * seatPriceINR) + devopsPriceINR + developerPriceINR + securityPriceINR + observabilityPriceINR;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fade-in-anim 0.2s ease-out' }}>
                
                {/* Projected summary card */}
                <div className="glass-panel" style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', color: '#10b981' }}>
                        Month-End Spend Forecast
                      </span>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span>${totalUSD.toLocaleString()} USD</span>
                        <span style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          (≈ ₹{totalINR.toLocaleString('en-IN')})
                        </span>
                      </h2>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)'
                  }}>
                    Estevia Platform Billing Cycle: Monthly
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '10px', marginBottom: '16px' }}>
                    Consolidated Projections Breakdown
                  </h3>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ color: 'var(--text-secondary)', borderBottom: '1.5px solid var(--glass-border)' }}>
                          <th style={{ padding: '10px 14px' }}>Line Item</th>
                          <th style={{ padding: '10px 14px' }}>Quantity</th>
                          <th style={{ padding: '10px 14px' }}>Rate (USD)</th>
                          <th style={{ padding: '10px 14px' }}>Rate (INR equivalent)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total (USD)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>Base Platform Fee ({licenseTier.toUpperCase()})</td>
                          <td style={{ padding: '12px 14px' }}>1 organization</td>
                          <td style={{ padding: '12px 14px' }}>${basePriceUSD.toLocaleString()}/mo</td>
                          <td style={{ padding: '12px 14px' }}>₹{basePriceINR.toLocaleString('en-IN')}/mo</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>${basePriceUSD.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹{basePriceINR.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>Operator Seats Allocation</td>
                          <td style={{ padding: '12px 14px' }}>{currentWriteUsers} active seat{currentWriteUsers !== 1 ? 's' : ''}</td>
                          <td style={{ padding: '12px 14px' }}>${seatPriceUSD.toLocaleString()}/seat/mo</td>
                          <td style={{ padding: '12px 14px' }}>₹{seatPriceINR.toLocaleString('en-IN')}/seat/mo</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>${(currentWriteUsers * seatPriceUSD).toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹{(currentWriteUsers * seatPriceINR).toLocaleString('en-IN')}</td>
                        </tr>
                        
                        {subPackageDevops && (
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>🚀 DevOps Sub-Package</td>
                            <td style={{ padding: '12px 14px' }}>Active</td>
                            <td style={{ padding: '12px 14px' }}>$150/mo</td>
                            <td style={{ padding: '12px 14px' }}>₹12,500/mo</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>$150</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹12,500</td>
                          </tr>
                        )}
                        {subPackageDeveloper && (
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>💻 Developer Sub-Package</td>
                            <td style={{ padding: '12px 14px' }}>Active</td>
                            <td style={{ padding: '12px 14px' }}>$99/mo</td>
                            <td style={{ padding: '12px 14px' }}>₹8,250/mo</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>$99</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹8,250</td>
                          </tr>
                        )}
                        {subPackageSecurity && (
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>🛡️ Security Sub-Package</td>
                            <td style={{ padding: '12px 14px' }}>Active</td>
                            <td style={{ padding: '12px 14px' }}>$120/mo</td>
                            <td style={{ padding: '12px 14px' }}>₹10,000/mo</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>$120</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹10,000</td>
                          </tr>
                        )}
                        {subPackageObservability && (
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>📊 Observability & AI Sub-Package</td>
                            <td style={{ padding: '12px 14px' }}>Active</td>
                            <td style={{ padding: '12px 14px' }}>$149/mo</td>
                            <td style={{ padding: '12px 14px' }}>₹12,000/mo</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>$149</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹12,000</td>
                          </tr>
                        )}

                        <tr style={{ borderTop: '2px solid var(--glass-border)' }}>
                          <td colSpan={4} style={{ padding: '16px 14px', fontWeight: 800, fontSize: '0.9rem' }}>Projected Monthly Total</td>
                          <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 900, color: 'var(--accent-purple)', fontSize: '0.94rem' }}>
                            ${totalUSD.toLocaleString()}
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 900, color: 'var(--accent-purple)', fontSize: '0.94rem' }}>
                            ₹{totalINR.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3-6-12 Month Projections cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    { label: '3-Month Projected Spend', multiplier: 3 },
                    { label: '6-Month Projected Spend', multiplier: 6 },
                    { label: '12-Month Projected Spend', multiplier: 12 }
                  ].map((proj, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{proj.label}</span>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ${(totalUSD * proj.multiplier).toLocaleString()} USD
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ≈ ₹{(totalINR * proj.multiplier).toLocaleString('en-IN')} INR
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Savings and recommendations box */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  background: 'rgba(251, 191, 36, 0.04)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <Info size={16} style={{ color: '#fbbf24', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', display: 'block', marginBottom: '4px' }}>
                      Eva AI Advisor Cost Optimization Forecast
                    </span>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      We project that applying VM scale policies and database size corrections could reduce your platform expenditure by up to 15% (estimated monthly savings of ${Math.round(totalUSD * 0.15)} USD / ≈ ₹{Math.round(totalINR * 0.15).toLocaleString('en-IN')} INR). Go to the <strong>Optimization Recommendations</strong> tab to check VM scaling details.
                    </p>
                  </div>
                </div>

              </div>
            )})()}
          <div style={{ height: '2px' }} />
        </div>
      </div>

      {/* ── Downgrade Confirmation Modal ── (unchanged) */}
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
                onClick={handleCancelDowngrade}
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
                  border: '1px solid rgba(239,68,68,0.4)', color: '#fff',
                  cursor: downgradeConfirmInput === organizationId ? 'pointer' : 'not-allowed',
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

  // Helper local function
  function currentOrgSeatLimit(): number {
    return operatorSeatsLimit;
  }
};
