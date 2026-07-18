import React, { useState } from 'react';
import { Users, RefreshCw, UserCheck, Shield, Award, Eye, X, Check, Terminal, ShieldAlert, ShieldX, KeyRound } from 'lucide-react';
import { UserAuditLogDrawer } from '../components/team/UserAuditLogDrawer';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer' | 'member';
  created_at: string;
  mfa_enabled?: number | boolean;
}

interface TeamPageProps {
  users: UserRecord[];
  currentUser: any;
  loadingUsers: boolean;
  syncingTeam: boolean;
  handleSyncTeam: () => Promise<any>;
  handleUpdateRole: (userId: string, newRole: string) => Promise<boolean>;
  theme: 'dark' | 'light';
  API_BASE: string;
  operatorSeatsLimit: number;
  // MFA related props
  manualMfaRequired: boolean;
  ssoMfaRequired: boolean;
  handleUpdateMfaSettings: (manualMfa: boolean, ssoMfa: boolean) => Promise<boolean>;
  handleResetMfa: (userId: string) => Promise<boolean>;
  handleResetOrgMfa: () => Promise<boolean>;
  token: string;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  users,
  currentUser,
  loadingUsers,
  syncingTeam,
  handleSyncTeam,
  handleUpdateRole,
  theme,
  API_BASE,
  operatorSeatsLimit,
  manualMfaRequired,
  ssoMfaRequired,
  handleUpdateMfaSettings,
  handleResetMfa,
  handleResetOrgMfa,
  token
}) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [activeLogUser, setActiveLogUser] = useState<{ email: string; name: string } | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);

  const [savingMfaSettings, setSavingMfaSettings] = useState<boolean>(false);
  const [showPersonalMfaModal, setShowPersonalMfaModal] = useState<boolean>(false);
  const [mfaSecret, setMfaSecret] = useState<string>('');
  const [mfaOtpauthUrl, setMfaOtpauthUrl] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaRegisterLoading, setMfaRegisterLoading] = useState<boolean>(false);
  const [mfaRegisterError, setMfaRegisterError] = useState<string | null>(null);
  const [resettingMfaUserId, setResettingMfaUserId] = useState<string | null>(null);
  const [mfaLockoutWarning, setMfaLockoutWarning] = useState<string | null>(null);
  const [showSsoOffModal, setShowSsoOffModal] = useState<boolean>(false);
  const [resettingOrgMfa, setResettingOrgMfa] = useState<boolean>(false);

  const activeUserInList = users.find(u => u.id === currentUser?.id);
  const isMfaEnabledForSelf = !!(
    Number(activeUserInList?.mfa_enabled) === 1 ||
    activeUserInList?.mfa_enabled === true ||
    Number(currentUser?.mfa_enabled) === 1 ||
    currentUser?.mfa_enabled === true
  );

  const handleToggleMfa = async (policyType: 'manual' | 'sso', currentVal: boolean) => {
    // Lockout protection: Admin cannot enforce organization-wide MFA if they haven't registered their own yet!
    if (!isMfaEnabledForSelf && !currentVal) {
      setMfaLockoutWarning("You must configure and verify your own Multi-Factor Authentication (MFA) before enforcing MFA policies for the organization.");
      return;
    }

    // Turning SSO MFA OFF → show confirmation modal (will bulk-reset all users)
    if (policyType === 'sso' && currentVal === true) {
      setShowSsoOffModal(true);
      return;
    }

    setSavingMfaSettings(true);
    let newManual = manualMfaRequired;
    let newSso = ssoMfaRequired;
    if (policyType === 'manual') newManual = !currentVal;
    else if (policyType === 'sso') newSso = !currentVal;

    const success = await handleUpdateMfaSettings(newManual, newSso);
    setSavingMfaSettings(false);
    if (success) {
      setUpdateMsg({ type: 'success', text: 'Security policies updated successfully.' });
      setTimeout(() => setUpdateMsg(null), 3000);
    } else {
      setUpdateMsg({ type: 'error', text: 'Failed to update organization security policies.' });
      setTimeout(() => setUpdateMsg(null), 3000);
    }
  };

  const handleStartPersonalMfaSetup = async () => {
    setMfaRegisterLoading(true);
    setMfaRegisterError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/setup-authenticated`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMfaSecret(data.secret);
        setMfaOtpauthUrl(data.otpauthUrl);
        setShowPersonalMfaModal(true);
      } else {
        const errData = await res.json().catch(() => null);
        setMfaRegisterError(errData?.error || 'Failed to initiate MFA setup.');
      }
    } catch (err) {
      console.error(err);
      setMfaRegisterError('Network error starting MFA setup.');
    } finally {
      setMfaRegisterLoading(false);
    }
  };

  const handleVerifyPersonalMfa = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      setMfaRegisterError('Please enter a valid 6-digit code.');
      return;
    }
    setMfaRegisterLoading(true);
    setMfaRegisterError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/verify-authenticated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ secret: mfaSecret, code: mfaCode })
      });
      if (res.ok) {
        setShowPersonalMfaModal(false);
        setMfaCode('');
        setUpdateMsg({ type: 'success', text: 'Authenticator app linked successfully. MFA is now active on your account.' });
        setTimeout(() => setUpdateMsg(null), 4000);
        // Auto-enable SSO MFA for the organization now that admin has their own MFA active
        await handleUpdateMfaSettings(manualMfaRequired, true);
        // Refresh directory list to capture updated status
        await handleSyncTeam();
      } else {
        const errData = await res.json().catch(() => null);
        setMfaRegisterError(errData?.error || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setMfaRegisterError('Network error verifying code.');
    } finally {
      setMfaRegisterLoading(false);
    }
  };

  const isLight = theme === 'light';
  const canManageRoles = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const roleBreakdown = React.useMemo(() => {
    const counts = {
      total: users.length,
      owner: 0,
      admin: 0,
      contributor: 0,
      viewer: 0
    };
    users.forEach(u => {
      const normalizedRole = u.role?.toLowerCase() === 'member' ? 'contributor' : (u.role?.toLowerCase() || 'viewer');
      if (normalizedRole === 'owner') counts.owner++;
      else if (normalizedRole === 'admin') counts.admin++;
      else if (normalizedRole === 'contributor') counts.contributor++;
      else counts.viewer++;
    });
    return counts;
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    if (!selectedRoleFilter) return users;
    return users.filter(u => {
      const normalizedRole = u.role?.toLowerCase() === 'member' ? 'contributor' : (u.role?.toLowerCase() || 'viewer');
      return normalizedRole === selectedRoleFilter.toLowerCase();
    });
  }, [users, selectedRoleFilter]);

  const writeUsers = users.filter(u => ['owner', 'admin', 'contributor', 'member'].includes(u.role?.toLowerCase()));
  const currentSeatsUsed = writeUsers.length;
  const isLimitReached = currentSeatsUsed >= (operatorSeatsLimit || 10);

  const onSyncClick = async () => {
    setUpdateMsg(null);
    const result = await handleSyncTeam();
    if (result) {
      const { added, updated, removed } = result;
      setUpdateMsg({
        type: 'success',
        text: `Directory sync completed successfully. Added: ${added ?? 0}, Updated: ${updated ?? 0}, Removed: ${removed ?? 0}.`
      });
      setTimeout(() => setUpdateMsg(null), 6000);
    } else {
      setUpdateMsg({
        type: 'error',
        text: 'Failed to sync team directory from Azure AD.'
      });
    }
  };

  const onRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (newRole === currentRole) return;
    
    // Prevent admin from trying to modify owner role (which the backend will block anyway)
    if (currentRole === 'owner' && currentUser?.role !== 'owner') {
      setUpdateMsg({ type: 'error', text: 'Access Denied: Only Owners can modify another Owner\'s role.' });
      return;
    }
    
    setUpdatingUserId(userId);
    setUpdateMsg(null);
    
    const success = await handleUpdateRole(userId, newRole);
    setUpdatingUserId(null);
    
    if (success) {
      setUpdateMsg({ type: 'success', text: `Successfully updated user role to ${newRole}.` });
      setTimeout(() => setUpdateMsg(null), 3000);
    } else {
      setUpdateMsg({ type: 'error', text: 'Failed to update user role. You may not have sufficient permissions.' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return <Award size={14} style={{ color: '#ec4899' }} />;
      case 'admin':
        return <Shield size={14} style={{ color: 'var(--accent-teal)' }} />;
      case 'contributor':
      case 'member':
        return <UserCheck size={14} style={{ color: 'var(--accent-blue)' }} />;
      default:
        return <Eye size={14} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'owner') {
      return {
        color: '#ec4899',
        background: isLight ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.15)',
        border: '1px solid rgba(236, 72, 153, 0.25)'
      };
    }
    if (r === 'admin') {
      return {
        color: 'var(--accent-teal)',
        background: isLight ? 'rgba(13, 148, 136, 0.1)' : 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(13, 148, 136, 0.2)'
      };
    }
    if (r === 'contributor' || r === 'member') {
      return {
        color: 'var(--accent-blue)',
        background: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(37, 99, 235, 0.2)'
      };
    }
    return {
      color: 'var(--text-secondary)',
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid var(--glass-border)'
    };
  };

  const groupedMatrix = [
    {
      category: 'Monitoring & Analytics',
      rows: [
        { cap: 'View dashboard, logs, costing & bill metrics', owner: true, admin: true, contributor: true, viewer: true },
        { cap: 'Scan active cloud resources', owner: true, admin: true, contributor: true, viewer: true },
        { cap: 'Live tail Container App logs & sparkline metrics', owner: true, admin: true, contributor: true, viewer: true }
      ]
    },
    {
      category: 'Resource Management & Provisioning',
      rows: [
        { cap: 'Provision apps & microservice resources', owner: true, admin: true, contributor: true, viewer: false },
        { cap: 'Link custom domain DNS mappings', owner: true, admin: true, contributor: true, viewer: false },
        { cap: 'Register CI/CD build pipelines', owner: true, admin: true, contributor: true, viewer: false },
        { cap: 'Execute raw SQL & manage DB schemas', owner: true, admin: true, contributor: true, viewer: false },
        { cap: 'Run database compare & schema migrations wizard', owner: true, admin: true, contributor: true, viewer: false }
      ]
    },
    {
      category: 'Governance & Security Administration',
      rows: [
        { cap: 'Sync directory users from Azure AD', owner: true, admin: true, contributor: false, viewer: false },
        { cap: 'Change user roles in EvaOps (CloudOps Management & Governance) platform', owner: true, admin: true, contributor: false, viewer: false },
        { cap: 'Save/Update integration credentials', owner: true, admin: true, contributor: false, viewer: false },
        { cap: 'Manage Cost Sleep Scheduler rules', owner: true, admin: true, contributor: false, viewer: false },
        { cap: 'Map Key Vault secrets to Variable Groups', owner: true, admin: true, contributor: false, viewer: false },
        { cap: 'View enterprise security audit trails', owner: true, admin: true, contributor: false, viewer: false },
        { cap: 'View decrypted secrets & configure org settings', owner: true, admin: true, contributor: false, viewer: false }
      ]
    }
  ];

  const renderCheckCell = (allowed: boolean) => {
    return allowed ? (
      <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} /></span>
    ) : (
      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} style={{ opacity: 0.7 }} /></span>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Users style={{ color: 'var(--accent-purple)' }} />
            Team Settings & Role Management
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '6px 0 0 0' }}>
            Sync team members from Microsoft Entra ID (Azure AD) and assign access control privileges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setShowMatrixModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontSize: '0.82rem' }}
          >
            <Shield size={14} style={{ color: 'var(--accent-teal)' }} />
            Role Access Matrix
          </button>

          {canManageRoles && (
            <button 
              type="button" 
              className="btn-primary" 
              disabled={syncingTeam || isLimitReached}
              onClick={onSyncClick}
              title={isLimitReached ? "Operator seats limit reached. Upgrade license or remove users to sync new members." : ""}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                height: '36px', 
                padding: '0 16px', 
                fontSize: '0.82rem',
                opacity: isLimitReached ? 0.5 : 1,
                cursor: isLimitReached ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={14} className={syncingTeam ? 'spin-anim' : ''} />
              {syncingTeam ? 'Syncing Team...' : 'Sync with Azure AD'}
            </button>
          )}
        </div>
      </div>

      {updateMsg && (
        <div className="glass-panel" style={{ 
          padding: '12px 16px', 
          borderColor: updateMsg.type === 'success' ? 'var(--success)' : 'var(--error)', 
          backgroundColor: updateMsg.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          color: 'var(--text-primary)', 
          marginBottom: '20px',
          fontSize: '0.86rem',
          borderRadius: '8px'
        }}>
          {updateMsg.text}
        </div>
      )}

      {/* Operator Seat Limit Progress Alert */}
      {(() => {
        const writeUsers = users.filter(u => ['owner', 'admin', 'contributor', 'member'].includes(u.role?.toLowerCase()));
        const currentSeatsUsed = writeUsers.length;
        const limit = operatorSeatsLimit || 10;
        const percent = Math.min(100, (currentSeatsUsed / limit) * 100);
        const isNearLimit = percent >= 80;
        
        return (
          <div className="glass-panel" style={{
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: '32px',
            flexWrap: 'wrap',
            background: isLight 
              ? 'rgba(139, 92, 246, 0.03)' 
              : 'rgba(139, 92, 246, 0.05)',
            border: isNearLimit 
              ? '1px solid rgba(239, 68, 68, 0.3)' 
              : '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '12px'
          }}>
            {/* Column 1: Utilization details */}
            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: isNearLimit ? '#ef4444' : '#10b981',
                    boxShadow: `0 0 8px ${isNearLimit ? '#ef4444' : '#10b981'}`
                  }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Operator Seats Limit: {currentSeatsUsed} / {limit} Seats Allocated
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Owner, Admin, and Contributor roles consume operator seats. Viewers do not consume any seats and are completely free.
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percent}%`, 
                    background: isNearLimit 
                      ? 'linear-gradient(to right, #f97316, #ef4444)' 
                      : 'linear-gradient(to right, #8b5cf6, #d946ef)', 
                    borderRadius: '3px' 
                  }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {Math.round(percent)}% Utilized
                </span>
              </div>
            </div>

            {/* Column 2: Role breakdown & interactive filter */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Filter User Directory by Role:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {/* Total */}
                <div 
                  onClick={() => setSelectedRoleFilter(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedRoleFilter === null ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRoleFilter === null ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)',
                    color: selectedRoleFilter === null ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: selectedRoleFilter === null ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Users size={12} />
                  <span>All Users</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>({roleBreakdown.total})</span>
                </div>
                
                {/* Owner */}
                <div 
                  onClick={() => setSelectedRoleFilter('owner')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedRoleFilter === 'owner' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRoleFilter === 'owner' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--glass-border)',
                    color: selectedRoleFilter === 'owner' ? '#ec4899' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: selectedRoleFilter === 'owner' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Award size={12} style={{ color: '#ec4899' }} />
                  <span>Owners</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>({roleBreakdown.owner})</span>
                </div>

                {/* Admin */}
                <div 
                  onClick={() => setSelectedRoleFilter('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedRoleFilter === 'admin' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRoleFilter === 'admin' ? '1px solid rgba(13, 148, 136, 0.4)' : '1px solid var(--glass-border)',
                    color: selectedRoleFilter === 'admin' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: selectedRoleFilter === 'admin' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Shield size={12} style={{ color: 'var(--accent-teal)' }} />
                  <span>Admins</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>({roleBreakdown.admin})</span>
                </div>

                {/* Contributor */}
                <div 
                  onClick={() => setSelectedRoleFilter('contributor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedRoleFilter === 'contributor' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRoleFilter === 'contributor' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--glass-border)',
                    color: selectedRoleFilter === 'contributor' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: selectedRoleFilter === 'contributor' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <UserCheck size={12} style={{ color: 'var(--accent-blue)' }} />
                  <span>Contributors</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>({roleBreakdown.contributor})</span>
                </div>

                {/* Viewer */}
                <div 
                  onClick={() => setSelectedRoleFilter('viewer')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedRoleFilter === 'viewer' ? 'rgba(229, 225, 224, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRoleFilter === 'viewer' ? '1px solid rgba(229, 225, 224, 0.3)' : '1px solid var(--glass-border)',
                    color: selectedRoleFilter === 'viewer' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: selectedRoleFilter === 'viewer' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Eye size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>Viewers</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>({roleBreakdown.viewer})</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Security Policies Panel — restricted to Admins & Owners */}
      {canManageRoles && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Card 1: Org policies */}
          <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '12px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <ShieldAlert size={16} style={{ color: 'var(--accent-teal)' }} />
              Organization MFA Policies
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Enforce Multi-Factor Authentication requirements across authentication pathways.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>Microsoft SSO Logins</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Require 2FA codes for Entra ID logins</div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                  <input
                    type="checkbox"
                    checked={ssoMfaRequired}
                    disabled={savingMfaSettings}
                    onChange={() => handleToggleMfa('sso', ssoMfaRequired)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: ssoMfaRequired ? 'var(--accent-teal)' : '#cbd5e1',
                    borderRadius: '34px', transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '14px', width: '14px', left: ssoMfaRequired ? '18px' : '3px', bottom: '3px',
                      backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin Override Logins</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Require 2FA codes for admin override passwords</div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                  <input
                    type="checkbox"
                    checked={manualMfaRequired}
                    disabled={savingMfaSettings}
                    onChange={() => handleToggleMfa('manual', manualMfaRequired)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: manualMfaRequired ? 'var(--accent-teal)' : '#cbd5e1',
                    borderRadius: '34px', transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '14px', width: '14px', left: manualMfaRequired ? '18px' : '3px', bottom: '3px',
                      backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Personal admin configuration */}
          <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <KeyRound size={16} style={{ color: 'var(--accent-purple)' }} />
                Personal Authenticator Setup
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Secure your admin account using any time-based one-time password (TOTP) authenticator application.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: isMfaEnabledForSelf ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', color: 'var(--text-primary)', marginBottom: '16px' }}>
                {isMfaEnabledForSelf ? (
                  <>
                    <Shield size={18} style={{ color: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Personal MFA Active</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Personal MFA Inactive (Action Required)</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              className={isMfaEnabledForSelf ? "btn-secondary" : "btn-primary"}
              onClick={handleStartPersonalMfaSetup}
              disabled={mfaRegisterLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '36px', fontSize: '0.82rem'
              }}
            >
              {mfaRegisterLoading ? <RefreshCw size={14} className="spin-anim" /> : <KeyRound size={14} />}
              {isMfaEnabledForSelf ? 'Re-link Authenticator Device' : 'Configure Authenticator App'}
            </button>
          </div>
        </div>
      )}

      {loadingUsers ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '20px 0' }}>
          <RefreshCw size={20} className="spin-anim" />
          <span>Loading organization users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No users found matching the selected role.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Current Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>MFA</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role Assignment</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const badgeStyle = getRoleBadgeStyle(u.role);
                const isTargetOwner = u.role === 'owner';
                // Admins cannot change owner roles. Nobody can change their own role.
                const isSelectDisabled = updatingUserId === u.id || isSelf || !canManageRoles || (isTargetOwner && currentUser?.role !== 'owner');

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{u.name}</span>
                        {isSelf && (
                          <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        ...badgeStyle
                      }}>
                        {getRoleIcon(u.role)}
                        {u.role ? (u.role === 'member' ? 'contributor' : u.role) : 'viewer'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.mfa_enabled ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.78rem', fontWeight: 600 }}>
                          <Shield size={14} style={{ fill: 'rgba(16, 185, 129, 0.2)' }} /> Active
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          <ShieldAlert size={14} style={{ color: '#ea580c' }} /> Disabled
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          value={u.role || 'viewer'}
                          disabled={isSelectDisabled}
                          onChange={(e) => onRoleChange(u.id, u.role, e.target.value)}
                          style={{
                            fontSize: '0.8rem',
                            height: '32px',
                            borderRadius: '6px',
                            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            padding: '0 8px',
                            width: '140px',
                            cursor: isSelectDisabled ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                          <option value="contributor">Contributor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        {updatingUserId === u.id && (
                          <RefreshCw size={12} className="spin-anim" style={{ color: 'var(--text-secondary)' }} />
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setActiveLogUser({ email: u.email, name: u.name })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            height: '32px',
                            padding: '0 12px',
                            fontSize: '0.76rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Terminal size={12} style={{ color: 'var(--accent-purple)' }} />
                          Logs
                        </button>
                        
                        {canManageRoles && u.mfa_enabled ? (
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={resettingMfaUserId === u.id}
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to reset Multi-Factor Authentication for ${u.name}? They will be forced to re-register on their next login.`)) {
                                setResettingMfaUserId(u.id);
                                const success = await handleResetMfa(u.id);
                                setResettingMfaUserId(null);
                                if (success) {
                                  setUpdateMsg({ type: 'success', text: `MFA reset successfully for ${u.name}.` });
                                  setTimeout(() => setUpdateMsg(null), 3000);
                                } else {
                                  setUpdateMsg({ type: 'error', text: `Failed to reset MFA for ${u.name}.` });
                                  setTimeout(() => setUpdateMsg(null), 3000);
                                }
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              height: '32px',
                              padding: '0 12px',
                              fontSize: '0.76rem',
                              cursor: resettingMfaUserId === u.id ? 'not-allowed' : 'pointer',
                              color: '#ef4444',
                              borderColor: 'rgba(239, 68, 68, 0.2)',
                              background: 'rgba(239, 68, 68, 0.04)'
                            }}
                          >
                            {resettingMfaUserId === u.id ? <RefreshCw size={12} className="spin-anim" /> : <ShieldX size={12} />}
                            Reset MFA
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Capabilities Matrix Popup Modal */}
      {showMatrixModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fade-in-anim 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            width: '680px',
            maxWidth: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--modal-shadow)',
            borderRadius: '16px'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} style={{ color: 'var(--accent-purple)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  EvaOps — CloudOps Management & Governance Role Access Matrix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Each user role inside EvaOps (CloudOps Management & Governance) has restricted functional permissions mapping to backend API authorization rules:
              </p>

              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.015)', borderBottom: '1px solid var(--divider)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>Capability / Action</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', width: '70px' }}>Owner</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', width: '70px' }}>Admin</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', width: '70px' }}>Contrib</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', width: '70px' }}>Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMatrix.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        <tr style={{ background: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--divider)' }}>
                          <td colSpan={5} style={{ padding: '8px 12px', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            {group.category}
                          </td>
                        </tr>
                        {group.rows.map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: '1px solid var(--divider)' }}>
                            <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500, paddingLeft: '20px' }}>{row.cap}</td>
                            <td style={{ padding: '10px 12px' }}>{renderCheckCell(row.owner)}</td>
                            <td style={{ padding: '10px 12px' }}>{renderCheckCell(row.admin)}</td>
                            <td style={{ padding: '10px 12px' }}>{renderCheckCell(row.contributor)}</td>
                            <td style={{ padding: '10px 12px' }}>{renderCheckCell(row.viewer)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--divider)',
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'rgba(0, 0, 0, 0.08)'
            }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowMatrixModal(false)}
                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal MFA Setup Modal */}
      {showPersonalMfaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '450px',
            maxWidth: '100%',
            display: 'flex', flexDirection: 'column',
            borderRadius: '16px',
            boxShadow: 'var(--modal-shadow)',
            padding: '24px',
            background: 'var(--bg-card, rgba(8,12,22,0.9))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                <KeyRound style={{ color: 'var(--accent-purple)' }} />
                Setup Authenticator App
              </h3>
              <button
                onClick={() => { setShowPersonalMfaModal(false); setMfaCode(''); setMfaRegisterError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {mfaRegisterError && (
              <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', marginBottom: '14px' }}>
                {mfaRegisterError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
              <p style={{ margin: 0 }}>
                1. Scan the QR code below using your authenticator app (Google Authenticator, Microsoft Authenticator, Duo, etc.):
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', background: '#ffffff', borderRadius: '12px', width: '200px', height: '200px', margin: '0 auto' }}>
                {mfaOtpauthUrl ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaOtpauthUrl)}`}
                    alt="MFA QR Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333' }}>Generating QR...</div>
                )}
              </div>

              {/* App Account Preview Card */}
              {mfaOtpauthUrl && (() => {
                try {
                  const parsed = new URL(mfaOtpauthUrl);
                  const pathname = decodeURIComponent(parsed.pathname.replace(/^\/\/?totp\//, ''));
                  const issuer = parsed.searchParams.get('issuer') || 'Estevia DevOps';
                  const account = pathname.includes(':') ? pathname.split(':').slice(1).join(':') : pathname;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📱 This will appear in your app as:
                      </span>
                      <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '1.2rem' }}>📱</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issuer}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account}</div>
                        </div>
                        <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1rem', fontFamily: 'monospace' }}>••• •••</div>
                      </div>
                    </div>
                  );
                } catch { return null; }
              })()}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Or enter this secret key manually:</span>
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.84rem', letterSpacing: '0.05em', color: 'var(--accent-teal)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                  {mfaSecret}
                </code>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>2. Enter the 6-digit code shown in your app:</span>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                    borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center',
                    fontSize: '1.25rem', padding: '8px', letterSpacing: '0.2em', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setShowPersonalMfaModal(false); setMfaCode(''); setMfaRegisterError(null); }}
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={mfaRegisterLoading || mfaCode.length !== 6}
                onClick={handleVerifyPersonalMfa}
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                {mfaRegisterLoading ? <RefreshCw size={14} className="spin-anim" /> : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MFA Lockout Warning Modal */}
      {mfaLockoutWarning && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '440px',
            maxWidth: '100%',
            display: 'flex', flexDirection: 'column',
            borderRadius: '16px',
            boxShadow: 'var(--modal-shadow)',
            padding: '24px',
            background: 'var(--bg-card, rgba(8,12,22,0.9))',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ef4444', flexShrink: 0
              }}>
                <ShieldAlert size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Lockout Protection</h3>
                <span style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', color: '#ef4444', letterSpacing: '0.1em' }}>Security Override Prevented</span>
              </div>
            </div>

            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {mfaLockoutWarning}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setMfaLockoutWarning(null)}
                style={{
                  padding: '8px 24px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SSO MFA Disable & Bulk-Reset Confirmation Modal ── */}
      {showSsoOffModal && (() => {
        const mfaEnabledCount = users.filter(u => Number(u.mfa_enabled) === 1 || u.mfa_enabled === true).length;
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.80)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              width: '480px', maxWidth: '100%',
              background: 'rgba(8, 10, 20, 0.92)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '20px',
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.12), 0 24px 64px rgba(0,0,0,0.5)',
              padding: '28px',
              display: 'flex', flexDirection: 'column', gap: '20px',
              animation: 'scaleIn 0.2s ease'
            }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>⚠️</div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Disable SSO MFA & Reset All Users?
                  </h3>
                  <span style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', color: '#ef4444', letterSpacing: '0.1em' }}>
                    Destructive · Org-Wide Action
                  </span>
                </div>
              </div>

              {/* Body */}
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                <p style={{ margin: '0 0 12px' }}>This will immediately:</p>
                <ul style={{ margin: '0 0 14px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Turn <strong style={{ color: 'var(--text-primary)' }}>off</strong> MFA enforcement for all <strong style={{ color: 'var(--text-primary)' }}>Microsoft SSO</strong> logins</li>
                  <li>Permanently wipe authenticator credentials for <strong style={{ color: '#ef4444' }}>{mfaEnabledCount} user{mfaEnabledCount !== 1 ? 's' : ''}</strong> in your organization</li>
                  <li>Require all affected users to <strong style={{ color: 'var(--text-primary)' }}>re-enroll</strong> in MFA on their next login</li>
                </ul>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.07)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px', padding: '10px 14px',
                  fontSize: '0.76rem', color: '#f87171'
                }}>
                  🔒 This action is scoped to your organization only and <strong>cannot be undone</strong>.
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={resettingOrgMfa}
                  onClick={() => setShowSsoOffModal(false)}
                  style={{ padding: '10px 22px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resettingOrgMfa}
                  onClick={async () => {
                    setResettingOrgMfa(true);
                    const [policyOk, resetOk] = await Promise.all([
                      handleUpdateMfaSettings(manualMfaRequired, false),
                      handleResetOrgMfa()
                    ]);
                    setResettingOrgMfa(false);
                    setShowSsoOffModal(false);
                    if (policyOk && resetOk) {
                      setUpdateMsg({ type: 'success', text: `SSO MFA disabled and ${mfaEnabledCount} user MFA credential${mfaEnabledCount !== 1 ? 's' : ''} reset successfully.` });
                    } else {
                      setUpdateMsg({ type: 'error', text: 'Partial failure — some changes may not have applied. Please refresh.' });
                    }
                    setTimeout(() => setUpdateMsg(null), 5000);
                  }}
                  style={{
                    padding: '10px 22px', fontSize: '0.84rem', fontWeight: 700,
                    background: resettingOrgMfa ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    color: '#fff', border: 'none', borderRadius: '10px', cursor: resettingOrgMfa ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
                  }}
                >
                  {resettingOrgMfa
                    ? <><RefreshCw size={14} className="spin-anim" /> Resetting...</>
                    : <>Yes, Disable & Reset All</>
                  }
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {activeLogUser && (
        <UserAuditLogDrawer
          userEmail={activeLogUser.email}
          userName={activeLogUser.name}
          onClose={() => setActiveLogUser(null)}
          API_BASE={API_BASE}
          theme={theme}
        />
      )}
    </div>
  );
};

