import React, { useState } from 'react';
import { X, Play, Zap, Check, Plus, Code, Layers, Server, Shield, RefreshCw } from 'lucide-react';

interface PipelineCreatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
  onPipelineCreated: () => void;
}

export const PipelineCreatorDrawer: React.FC<PipelineCreatorDrawerProps> = ({
  isOpen,
  onClose,
  API_BASE,
  token,
  theme,
  onPipelineCreated
}) => {
  const [projectName, setProjectName] = useState('DocuAI-Processor-API');
  const [name, setName] = useState('DocuAI CI/CD Pipeline');
  const [repoUrl, setRepoUrl] = useState('https://github.com/Estevia-TechSolutions/DocuAI-Processor');
  const [branch, setBranch] = useState('main');
  const [targetType, setTargetType] = useState<'static_web_app' | 'container_app' | 'database'>('static_web_app');
  const [autoProvisionInfra, setAutoProvisionInfra] = useState<boolean>(true);
  const [iacTemplateType, setIacTemplateType] = useState<'bicep' | 'terraform'>('bicep');
  const [template, setTemplate] = useState<'node_swa' | 'python_aca' | 'docker'>('node_swa');
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;
  const isLight = theme === 'light';

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/pipelines/create-on-the-fly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectName,
          name,
          repoUrl,
          branch,
          targetType,
          autoProvisionInfra,
          iacTemplateType
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create pipeline on-the-fly');
      }

      onPipelineCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating pipeline');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '680px',
        maxWidth: '100%',
        height: '100%',
        background: isLight ? '#ffffff' : '#0f172a',
        borderLeft: isLight ? '1px solid #e2e8f0' : '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '-12px 0 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Create New CI/CD Pipeline On-The-Fly</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Define, customize, and execute a new build workflow directly on EvaOps Cloud Runners.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          {/* STEP 1: PROJECT & REPO BINDING */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Step 1: Bind Repository & Target Resource
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{ width: '100%', height: '34px', borderRadius: '6px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Pipeline Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', height: '34px', borderRadius: '6px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Git Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  style={{ width: '100%', height: '34px', borderRadius: '6px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Target Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{ width: '100%', height: '34px', borderRadius: '6px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* AUTO-PROVISION INFRASTRUCTURE TOGGLE */}
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="autoInfra"
                  checked={autoProvisionInfra}
                  onChange={(e) => setAutoProvisionInfra(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="autoInfra" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Auto-Provision Target Azure Infrastructure if not existing
                </label>
              </div>

              {autoProvisionInfra && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIacTemplateType('bicep')}
                    style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: iacTemplateType === 'bicep' ? 'var(--accent-purple)' : 'transparent', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                  >
                    Bicep
                  </button>
                  <button
                    type="button"
                    onClick={() => setIacTemplateType('terraform')}
                    style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: iacTemplateType === 'terraform' ? 'var(--accent-purple)' : 'transparent', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                  >
                    Terraform
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: STARTER TEMPLATES */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Step 2: Select Starter Workflow Template
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Template 1 */}
              <div
                onClick={() => { setTemplate('node_swa'); setTargetType('static_web_app'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: template === 'node_swa' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: template === 'node_swa' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>⚡ Node.js / React SWA</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Azure Static Web Apps zero-token deployment</div>
              </div>

              {/* Template 2 */}
              <div
                onClick={() => { setTemplate('python_aca'); setTargetType('container_app'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: template === 'python_aca' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: template === 'python_aca' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>🐍 Python FastAPI ACA</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Azure Container Apps serverless API</div>
              </div>

              {/* Template 3 */}
              <div
                onClick={() => { setTemplate('docker'); setTargetType('container_app'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: template === 'docker' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: template === 'docker' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>🐳 Docker Container</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Generic Container build & ACR push</div>
              </div>
            </div>
          </div>

          {/* STEP 3: WORKFLOW PREVIEW */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Step 3: Workflow Preview (.evaops/pipeline.yml)
            </div>

            <pre style={{
              background: '#090d16',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.76rem',
              color: '#38bdf8',
              fontFamily: 'monospace',
              overflowX: 'auto',
              maxHeight: '180px',
              margin: 0
            }}>
{`name: ${name}
on:
  push:
    branches: [${branch}]

stages:
${autoProvisionInfra ? `  - stage: infra_provision
    jobs:
      - job: azure_${iacTemplateType}_deploy
        steps:
          - run: az deployment group create --resource-group Estevia-Prod-RG --template-file infra/main.bicep
` : ''}  - stage: build_app
    jobs:
      - job: compile_and_test
        steps:
          - uses: actions/checkout@v4
          - run: npm ci && npm run build

  - stage: deploy_app
    needs: [build_app]
    jobs:
      - job: deploy_to_azure
        steps:
          - uses: evaops/${targetType === 'static_web_app' ? 'azure-swa-deploy' : 'azure-aca-deploy'}@v1`}
            </pre>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)'
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating}
            style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {creating ? <RefreshCw size={14} className="spin-anim" /> : <Play size={14} />}
            <span>Commit & Trigger Pipeline Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
