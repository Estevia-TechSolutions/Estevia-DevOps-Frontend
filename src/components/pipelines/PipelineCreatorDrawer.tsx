import React, { useState, useEffect } from 'react';
import { X, Play, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

export interface AppResource {
  id?: string;
  name: string;
  type: 'frontend' | 'backend' | 'cluster' | 'database';
  provider?: 'evaops_native' | 'azure_devops' | 'github_actions';
  githubRepo?: string;
  repo_url?: string;
  customDomain?: string;
  resourceGroup?: string;
  location?: string;
  status?: string;
}

interface PipelineCreatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  API_BASE: string;
  token: string;
  theme: 'dark' | 'light';
  apps?: any[];
  onPipelineCreated: () => void;
}

export const PipelineCreatorDrawer: React.FC<PipelineCreatorDrawerProps> = ({
  isOpen,
  onClose,
  API_BASE,
  token,
  theme,
  apps = [],
  onPipelineCreated
}) => {
  // Available Organization Repositories (Fallback list if apps array is empty)
  const defaultOrgRepos = [
    { repo: 'Estevia-TechSolutions/Estevia-Corporate-Marketing-Web', name: 'Estevia Corporate Marketing Web', type: 'frontend' },
    { repo: 'Estevia-TechSolutions/DocuAI-Frontend', name: 'DocuAI Frontend Portal', type: 'frontend' },
    { repo: 'Estevia-TechSolutions/DocuAI-Processor-API', name: 'DocuAI Processor API Service', type: 'backend' },
    { repo: 'Estevia-TechSolutions/ConnectHub-Core', name: 'ConnectHub Integration Core API', type: 'backend' },
    { repo: 'Estevia-TechSolutions/PeopleCraft-HR', name: 'PeopleCraft Enterprise HR Service', type: 'backend' },
    { repo: 'Estevia-TechSolutions/Estevia-Database-Cluster', name: 'Estevia Production Database', type: 'database' }
  ];

  // Derive repo options from scanned apps or default org repos
  const repoOptions = apps.length > 0
    ? apps.map(a => ({
        repo: a.githubRepo || a.repo_url || `Estevia-TechSolutions/${a.name}`,
        name: a.name,
        type: a.type,
        resourceGroup: a.resourceGroup,
        location: a.location
      }))
    : defaultOrgRepos;

  const [selectedRepoPath, setSelectedRepoPath] = useState<string>(repoOptions[0]?.repo || '');
  const [projectName, setProjectName] = useState<string>(repoOptions[0]?.name || 'DocuAI Processor API');
  const [name, setName] = useState<string>(`${repoOptions[0]?.name || 'DocuAI'} CI/CD Pipeline`);
  const [branch, setBranch] = useState<string>('main');
  const [availableBranches] = useState<string[]>(['main', 'dev', 'qa']);
  const [targetType, setTargetType] = useState<'static_web_app' | 'container_app' | 'database'>('static_web_app');
  const [autoProvisionInfra, setAutoProvisionInfra] = useState<boolean>(true);
  const [iacTemplateType, setIacTemplateType] = useState<'bicep' | 'terraform'>('bicep');
  const [template, setTemplate] = useState<'node_swa' | 'python_aca' | 'docker' | 'mysql'>('node_swa');
  const [autoPickedNotice, setAutoPickedNotice] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isLight = theme === 'light';

  // ── Auto-Pick Step 2 Target Resource & Workflow Template based on Repo Selection ──────────
  const handleRepoSelect = (repoPath: string) => {
    setSelectedRepoPath(repoPath);
    const found = repoOptions.find(r => r.repo === repoPath);

    if (found) {
      const cleanName = found.name;
      setProjectName(cleanName);
      setName(`${cleanName} CI/CD Pipeline`);

      const repoType = found.type?.toLowerCase() || '';
      const nameLow = cleanName.toLowerCase();

      if (repoType === 'frontend' || nameLow.includes('web') || nameLow.includes('frontend') || nameLow.includes('swa') || nameLow.includes('react')) {
        setTargetType('static_web_app');
        setTemplate('node_swa');
        setAutoPickedNotice('Auto-picked Azure Static Web App (SWA) for Frontend project');
      } else if (repoType === 'backend' || nameLow.includes('api') || nameLow.includes('backend') || nameLow.includes('service') || nameLow.includes('aca')) {
        setTargetType('container_app');
        setTemplate('python_aca');
        setAutoPickedNotice('Auto-picked Azure Container App (ACA) for Backend API project');
      } else if (repoType === 'database' || nameLow.includes('db') || nameLow.includes('sql') || nameLow.includes('database')) {
        setTargetType('database');
        setTemplate('mysql');
        setAutoPickedNotice('Auto-picked Azure Database for MySQL Flexible Server');
      } else {
        setTargetType('container_app');
        setTemplate('docker');
        setAutoPickedNotice('Auto-picked Docker Container Application');
      }
    }
  };

  useEffect(() => {
    if (repoOptions.length > 0 && selectedRepoPath) {
      handleRepoSelect(selectedRepoPath);
    }
  }, [isOpen]);

  // ── Dynamic YAML Preview Generator matching Step 2 ──────────────────────────
  const generateYamlPreview = () => {
    let stagesYaml = '';

    if (autoProvisionInfra) {
      stagesYaml += `  - stage: infra_provision
    jobs:
      - job: azure_${iacTemplateType}_deploy
        runs-on: evaops-cloud-runner
        steps:
          - name: Provision Azure Infrastructure via ${iacTemplateType.toUpperCase()}
            run: |
              az group create --name Estevia-Prod-RG --location eastus
              az deployment group create --resource-group Estevia-Prod-RG --template-file infra/main.${iacTemplateType === 'bicep' ? 'bicep' : 'tf'}\n\n`;
    }

    if (template === 'node_swa' || targetType === 'static_web_app') {
      stagesYaml += `  - stage: build_frontend
    jobs:
      - job: compile_react_bundle
        runs-on: evaops-cloud-runner
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: '20'
          - run: npm ci && npm run build

  - stage: deploy_swa
    needs: [build_frontend]
    jobs:
      - job: deploy_to_azure_swa
        runs-on: evaops-cloud-runner
        steps:
          - uses: evaops/azure-swa-deploy@v1
            with:
              app_name: '${projectName}'
              app_location: '/'
              output_location: 'dist'`;
    } else if (template === 'python_aca') {
      stagesYaml += `  - stage: build_backend_api
    jobs:
      - job: test_fastapi_app
        runs-on: evaops-cloud-runner
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-python@v5
            with:
              python-version: '3.11'
          - run: pip install -r requirements.txt && pytest

  - stage: deploy_container_app
    needs: [build_backend_api]
    jobs:
      - job: deploy_to_azure_aca
        runs-on: evaops-cloud-runner
        steps:
          - uses: evaops/azure-aca-deploy@v1
            with:
              container_app_name: '${projectName}'
              target_port: 8000`;
    } else if (template === 'mysql' || targetType === 'database') {
      stagesYaml += `  - stage: validate_db_ddl
    jobs:
      - job: lint_sql_migrations
        runs-on: evaops-cloud-runner
        steps:
          - uses: actions/checkout@v4
          - run: sqlfluff lint migrations/

  - stage: deploy_database_schema
    needs: [validate_db_ddl]
    jobs:
      - job: apply_mysql_migrations
        runs-on: evaops-cloud-runner
        steps:
          - uses: evaops/azure-db-deploy@v1
            with:
              db_name: '${projectName}'
              auto_initialization: true`;
    } else {
      const cleanProj = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
      stagesYaml += `  - stage: build_docker_image
    jobs:
      - job: container_build_and_push
        runs-on: evaops-cloud-runner
        steps:
          - uses: actions/checkout@v4
          - run: docker build -t estevia.azurecr.io/${cleanProj}:\${{ github.sha }} .
          - run: docker push estevia.azurecr.io/${cleanProj}:\${{ github.sha }}

  - stage: deploy_container
    needs: [build_docker_image]
    jobs:
      - job: deploy_to_aca
        runs-on: evaops-cloud-runner
        steps:
          - uses: evaops/azure-aca-deploy@v1
            with:
              image: estevia.azurecr.io/${cleanProj}:\${{ github.sha }}`;
    }

    return `name: ${name}
on:
  push:
    branches: [${branch}]

stages:
${stagesYaml}`;
  };

  if (!isOpen) return null;

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
          repoUrl: selectedRepoPath,
          branch,
          targetType,
          autoProvisionInfra,
          iacTemplateType,
          yamlConfig: generateYamlPreview()
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
              Select a Git repository to auto-detect architecture, generate IaC Bicep templates, and provision pipeline runs.
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

          {/* STEP 1: DYNAMIC GITHUB REPOSITORY SELECTOR */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Step 1: Select Git Repository & Branch</span>
              <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '6px', textTransform: 'none', fontWeight: 600 }}>
                {repoOptions.length} Repositories Discovered
              </span>
            </div>

            {/* DYNAMIC REPOSITORY SELECTOR DROPDOWN */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700 }}>
                GitHub Repository <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedRepoPath}
                onChange={(e) => handleRepoSelect(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  background: isLight ? '#ffffff' : '#1e293b',
                  border: '1px solid var(--accent-purple)',
                  color: 'var(--text-primary)',
                  padding: '0 12px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {repoOptions.map((r, idx) => (
                  <option key={idx} value={r.repo} style={{ background: '#0f172a', color: '#ffffff' }}>
                    🐙 {r.repo} ({r.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Project Title</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{ width: '100%', height: '34px', borderRadius: '6px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Target Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{ width: '100%', height: '34px', borderRadius: '6px', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0 10px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  {availableBranches.map(b => (
                    <option key={b} value={b} style={{ background: '#0f172a', color: '#ffffff' }}>
                      🌿 {b}
                    </option>
                  ))}
                </select>
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

          {/* STEP 2: AUTO-PICKED WORKFLOW TEMPLATE & TARGET RESOURCE */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Step 2: Target Resource & Workflow Template</span>
              {autoPickedNotice && (
                <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', fontWeight: 600 }}>
                  <CheckCircle2 size={12} /> {autoPickedNotice}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Template 1: Static Web App */}
              <div
                onClick={() => { setTemplate('node_swa'); setTargetType('static_web_app'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: template === 'node_swa' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                  border: template === 'node_swa' ? '2px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                  position: 'relative'
                }}
              >
                {template === 'node_swa' && (
                  <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--accent-purple)', color: '#fff', fontWeight: 700 }}>
                    AUTO-PICKED
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>⚡ Node.js / React SWA</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Azure Static Web Apps zero-token deployment</div>
              </div>

              {/* Template 2: Container App */}
              <div
                onClick={() => { setTemplate('python_aca'); setTargetType('container_app'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: template === 'python_aca' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                  border: template === 'python_aca' ? '2px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                  position: 'relative'
                }}
              >
                {template === 'python_aca' && (
                  <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--accent-purple)', color: '#fff', fontWeight: 700 }}>
                    AUTO-PICKED
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>🐍 Python FastAPI ACA</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Azure Container Apps serverless API</div>
              </div>

              {/* Template 3: Generic Docker */}
              <div
                onClick={() => { setTemplate('docker'); setTargetType('container_app'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: template === 'docker' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                  border: template === 'docker' ? '2px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                  position: 'relative'
                }}
              >
                {template === 'docker' && (
                  <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--accent-purple)', color: '#fff', fontWeight: 700 }}>
                    AUTO-PICKED
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>🐳 Docker Container</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Generic Container build & ACR push</div>
              </div>
            </div>
          </div>

          {/* STEP 3: DYNAMIC WORKFLOW PREVIEW (MATCHING STEP 2 EXACTLY) */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Step 3: Dynamic Workflow Preview (.evaops/pipeline.yml)
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
              {generateYamlPreview()}
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
