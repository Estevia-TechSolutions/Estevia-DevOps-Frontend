/**
 * Utility functions for application codebase normalization and dynamic CI/CD provider signal resolution.
 */

/**
 * Normalizes an Azure resource name, pipeline project name, or app slug to its root codebase name.
 * Strips environment suffixes (-dev, -qa, -prod, -stage, -staging, -test) and
 * resource type suffixes (-swa, -aca, -app, -container, -vm, -db).
 */
export function getNormalizedCodebaseName(name: string): string {
  if (!name) return '';
  let clean = name.trim().toLowerCase();

  for (let i = 0; i < 3; i++) {
    const prev = clean;
    clean = clean.replace(/-(swa|aca|app|container|vm|db|site)$/i, '');
    clean = clean.replace(/-(dev|qa|prod|stage|staging|test)$/i, '');
    if (clean === prev) break;
  }

  return clean;
}

export type ProviderType = 'azure_devops' | 'github_actions' | 'evaops_native' | 'unconfigured';

/**
 * Dynamically detects GitHub Actions workflow signals on an application or pipeline object.
 */
export function hasGitHubActionsSignal(item: any): boolean {
  if (!item) return false;
  const pid = String(item.pipelineId || item.pipeline_id || '');
  const prov = String(item.provider || item.azureResourceDetails?.provider || '').toLowerCase();
  const ymlPath = String(item.ymlHealth?.filePath || item.health?.ymlHealth?.filePath || '').toLowerCase();
  const runUrl = String(item.pipelineRun?.webUrl || item.pipeline_url || '').toLowerCase();
  const type = String(item.type || item.app_type || item.target_type || '').toLowerCase();
  const name = String(item.name || item.project_name || '').toLowerCase();
  const repoUrl = String(item.repositoryUrl || item.repo_url || '').toLowerCase();

  return (
    pid.startsWith('github-actions:') ||
    pid.startsWith('gha-') ||
    prov.includes('github') ||
    prov.includes('actions') ||
    ymlPath.includes('.github') ||
    runUrl.includes('github.com') ||
    repoUrl.includes('github.com') ||
    // Azure Static Web Apps (SWA) connected to GitHub repositories default to GitHub Actions workflows
    ((type === 'frontend' || name.endsWith('-swa')) && (repoUrl.includes('github') || !prov.includes('eva')))
  );
}

/**
 * Dynamically detects Azure DevOps pipeline signals on an application or pipeline object.
 */
export function hasAzureDevOpsSignal(item: any): boolean {
  if (!item) return false;
  const pid = String(item.pipelineId || item.pipeline_id || '');
  const prov = String(item.provider || item.azureResourceDetails?.provider || '').toLowerCase();
  const ymlPath = String(item.ymlHealth?.filePath || item.health?.ymlHealth?.filePath || '').toLowerCase();
  const runUrl = String(item.pipelineRun?.webUrl || '').toLowerCase();

  return (
    /^\d+$/.test(pid) ||
    pid.startsWith('azdev-') ||
    pid.startsWith('azdo-') ||
    prov.includes('azure') ||
    prov.includes('devops') ||
    ymlPath.includes('azure-pipelines') ||
    runUrl.includes('dev.azure.com')
  );
}

/**
 * Dynamically resolves the active/primary CI/CD provider type for an application or pipeline run object.
 * Checks ground truth execution runs, YML health signals, repository features, and provider descriptors dynamically.
 */
export function resolveAppProvider(item: any): ProviderType {
  if (!item) return 'unconfigured';

  // 1. Check live active pipeline run web URL ground truth
  const runUrl = String(item.pipelineRun?.webUrl || '').toLowerCase();
  if (runUrl.includes('github.com')) return 'github_actions';
  if (runUrl.includes('dev.azure.com')) return 'azure_devops';

  // 2. Check YML health file path signals
  const ymlPath = String(item.ymlHealth?.filePath || item.health?.ymlHealth?.filePath || '').toLowerCase();
  if (ymlPath.includes('.github')) return 'github_actions';
  if (ymlPath.includes('azure-pipelines')) return 'azure_devops';
  if (ymlPath.includes('.evaforge')) return 'evaops_native';

  // 3. Check GitHub Actions signals (including Static Web Apps with GitHub repositories)
  if (hasGitHubActionsSignal(item)) return 'github_actions';

  // 4. Check explicit EvaForge provider signal
  const rawProv = String(item.provider || item.azureResourceDetails?.provider || '').toLowerCase();
  if (rawProv.includes('eva') || rawProv.includes('native') || rawProv.includes('evaforge')) {
    return 'evaops_native';
  }

  // 5. Check Azure DevOps signals
  if (hasAzureDevOpsSignal(item)) return 'azure_devops';

  return 'unconfigured';
}

/**
 * Dynamically detects multi-CI/CD conflicts or provider mismatches across scanned cloud resources.
 * Returns true if both GitHub Actions and Azure DevOps signals exist, or if explicitly flagged by backend.
 */
export function hasCiCdConflict(item: any): boolean {
  if (!item) return false;
  if (!!item.hasConflict || !!item.has_cicd_conflict) return true;

  const hasGha = hasGitHubActionsSignal(item);
  const hasAzdo = hasAzureDevOpsSignal(item);

  // Multi-CI/CD Conflict: Both GitHub Actions AND Azure DevOps signals exist for the same resource
  return hasGha && hasAzdo;
}

/**
 * Dynamically resolves target environment branch badges for a resource object.
 * Extracts environment tags via generic regex without hardcoding any app strings.
 */
export function getDynamicTargetBranches(resource: any): { branch: string; target: string; status: string }[] {
  if (!resource) return [];

  const pName = String(resource.project_name || resource.name || '').toLowerCase();
  const primaryBranch = String(resource.branch || 'main').toLowerCase();

  // Generic regex extraction for environment tags (-qa, -dev, -prod, _qa, _dev, _prod, -qa-swa, etc.)
  const match = pName.match(/[-_](dev|qa|prod|stage|staging|test)([-_]|$)/i);
  let resolvedBranch: string | null = null;
  if (match) {
    const env = match[1].toLowerCase();
    resolvedBranch = env === 'prod' ? 'main' : env;
  } else if (primaryBranch && primaryBranch !== 'main') {
    resolvedBranch = primaryBranch;
  }

  // If specific environment branch resolved, return single target branch entry for this environment card
  if (resolvedBranch) {
    const targetLabel = `${pName.toLowerCase()}.esteviatech.com (${resolvedBranch.toUpperCase()} Target)`;
    return [{ branch: resolvedBranch, target: targetLabel, status: 'success' }];
  }

  // If r.branches explicitly provided, use them
  if (Array.isArray(resource.branches) && resource.branches.length > 0) {
    return resource.branches;
  }

  // Multi-branch fallback for root codebase pipelines without specific environment suffix
  const supported = Array.isArray(resource.supported_branches) && resource.supported_branches.length > 0
    ? resource.supported_branches
    : ['main', 'qa', 'dev'];

  return supported.map((b: string) => ({
    branch: b,
    target: `${pName.toLowerCase()}${b === 'main' ? '' : '-' + b}.esteviatech.com (${b.toUpperCase()} Target)`,
    status: 'success'
  }));
}
