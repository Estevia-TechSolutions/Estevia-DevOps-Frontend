import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, RefreshCw, Key, Layers } from 'lucide-react';

interface KeyVaultMapping {
  id: number;
  secret_name: string;
  mapped_to_variable_group: string;
  active: boolean;
}

interface KeyVaultConfiguratorProps {
  API_BASE: string;
  theme: 'dark' | 'light';
  canEdit: boolean;
}

export const KeyVaultConfigurator: React.FC<KeyVaultConfiguratorProps> = ({ API_BASE, theme, canEdit }) => {
  const [mappings, setMappings] = useState<KeyVaultMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [secretName, setSecretName] = useState('');
  const [mappedToVariableGroup, setMappedToVariableGroup] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/keyvault/mappings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMappings(data.mappings || []);
      }
    } catch (err) {
      console.error('Failed to fetch Key Vault mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [API_BASE]);

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretName || !mappedToVariableGroup) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/keyvault/map`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          secretName,
          mappedToVariableGroup
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: data.message });
        setSecretName('');
        setMappedToVariableGroup('');
        fetchMappings();
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to map Key Vault secret.' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Network request failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMapping = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;
    setFeedback(null);

    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/keyvault/mappings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Mapping deleted successfully.' });
        fetchMappings();
      } else {
        const data = await res.json();
        setFeedback({ type: 'error', text: data.message || 'Failed to delete mapping.' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Network request failed.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {feedback && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: feedback.type === 'success' ? 'var(--success)' : 'var(--error)',
          background: feedback.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--success)' : 'var(--error)'}`
        }}>
          {feedback.text}
        </div>
      )}

      {/* Form block */}
      {canEdit && (
        <form onSubmit={handleAddMapping} style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.01)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              KEY VAULT SECRET NAME
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="e.g. DB-PASSWORD-SECRET"
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                style={{ paddingLeft: '32px', width: '100%', height: '36px', fontSize: '0.82rem' }}
                required
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              PIPELINE VARIABLE GROUP
            </label>
            <div style={{ position: 'relative' }}>
              <Layers size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="e.g. estevia-frontend-vars"
                value={mappedToVariableGroup}
                onChange={(e) => setMappedToVariableGroup(e.target.value)}
                style={{ paddingLeft: '32px', width: '100%', height: '36px', fontSize: '0.82rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
            style={{
              height: '36px',
              padding: '0 16px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {isSaving ? <RefreshCw size={14} className="spin-anim" /> : <Plus size={14} />}
            Map Secret
          </button>
        </form>
      )}

      {/* List block */}
      {loading && mappings.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
          <RefreshCw size={14} className="spin-anim" />
          <span>Loading mapped Key Vault secrets...</span>
        </div>
      ) : mappings.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', padding: '10px 0', fontStyle: 'italic' }}>
          No secrets mapped to pipeline variable groups.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)', background: 'rgba(255,255,255,0.015)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Secret Name</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Pipeline Variable Group</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                {canEdit && <th style={{ padding: '10px 12px', fontWeight: 600, width: '60px', textAlign: 'center' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.secret_name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{m.mapped_to_variable_group}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      color: 'var(--success)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      {m.active ? 'Sync Active' : 'Inactive'}
                    </span>
                  </td>
                  {canEdit && (
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteMapping(m.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: 'var(--error)',
                          borderRadius: '4px',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete Mapping"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
