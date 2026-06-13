import React, { useState } from 'react';
import { Users, RefreshCw, UserCheck, Shield, Award, Eye } from 'lucide-react';

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
  handleSyncTeam: () => void;
  handleUpdateRole: (userId: string, newRole: string) => Promise<boolean>;
  theme: 'dark' | 'light';
}

export const TeamPage: React.FC<TeamPageProps> = ({
  users,
  currentUser,
  loadingUsers,
  syncingTeam,
  handleSyncTeam,
  handleUpdateRole,
  theme
}) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isLight = theme === 'light';
  const canManageRoles = currentUser?.role === 'owner' || currentUser?.role === 'admin';

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

        {canManageRoles && (
          <button 
            type="button" 
            className="btn-primary" 
            disabled={syncingTeam}
            onClick={handleSyncTeam}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 16px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={syncingTeam ? 'spin-anim' : ''} />
            {syncingTeam ? 'Syncing Team...' : 'Sync with Azure AD'}
          </button>
        )}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
