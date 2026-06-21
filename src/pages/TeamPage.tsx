import React, { useState } from 'react';
import { Users, RefreshCw, UserCheck, Shield, Award, Eye, X, Check, Terminal } from 'lucide-react';
import { UserAuditLogDrawer } from '../components/team/UserAuditLogDrawer';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer' | 'member';
  created_at: string;
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
}

export const TeamPage: React.FC<TeamPageProps> = ({
  users,
  currentUser,
  loadingUsers,
  syncingTeam,
  handleSyncTeam,
  handleUpdateRole,
  theme,
  API_BASE
}) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [activeLogUser, setActiveLogUser] = useState<{ email: string; name: string } | null>(null);

  const isLight = theme === 'light';
  const canManageRoles = currentUser?.role === 'owner' || currentUser?.role === 'admin';

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
        { cap: 'View decrypted secrets & configure org settings', owner: true, admin: false, contributor: false, viewer: false }
      ]
    }
  ];

  const renderCheckCell = (allowed: boolean) => {
    return allowed ? (
      <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} /></span>
    ) : (
      <span style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</span>
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
              disabled={syncingTeam}
              onClick={onSyncClick}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontSize: '0.82rem' }}
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

      {loadingUsers ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '20px 0' }}>
          <RefreshCw size={20} className="spin-anim" />
          <span>Loading organization users...</span>
        </div>
      ) : users.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No users found in organization.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Current Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role Assignment</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '120px' }}>Audit Logs</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
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
                        View Logs
                      </button>
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

