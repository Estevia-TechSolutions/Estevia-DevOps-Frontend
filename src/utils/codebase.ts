/**
 * Utility functions for application codebase normalization and CI/CD provider resolution.
 */

/**
 * Normalizes an Azure resource name, pipeline project name, or app slug to its root codebase name.
 * Strips environment suffixes (-dev, -qa, -prod, -stage, -staging, -test) and
 * resource type suffixes (-swa, -aca, -app, -container, -vm, -db).
 *
 * Example:
 * - "peoplecraft-frontend-qa-swa" -> "peoplecraft-frontend"
 * - "peoplecraft-frontend"        -> "peoplecraft-frontend"
 * - "api-peoplecraft-dev"          -> "api-peoplecraft"
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
 * Resolves the primary CI/CD provider type for an app or pipeline object.
 */
export function resolveAppProvider(item: any): ProviderType {
  if (!item) return 'unconfigured';

  const nameLow = (item.name || item.project_name || '').toLowerCase();
  
  // Rule: peoplecraft-frontend frontends natively execute GitHub Actions workflows
  if (nameLow.includes('peoplecraft-frontend')) {
    return 'github_actions';
  }

  const rawProv = item.provider || item.azureResourceDetails?.provider;
  if (rawProv) {
    const provLow = String(rawProv).toLowerCase();
    if (provLow.includes('github') || provLow.includes('actions')) return 'github_actions';
    if (provLow.includes('eva') || provLow.includes('native') || provLow.includes('evaforge')) return 'evaops_native';
    if (provLow.includes('azure') || provLow.includes('devops')) return 'azure_devops';
  }

  const pid = item.pipelineId || item.pipeline_id ? String(item.pipelineId || item.pipeline_id) : '';
  if (pid.startsWith('github-actions:')) return 'github_actions';
  if (/^\d+$/.test(pid) || pid.startsWith('azdev-')) return 'azure_devops';

  return 'unconfigured';
}

/**
 * Detects whether an application has a multi-CI/CD conflict or provider mismatch.
 */
export function hasCiCdConflict(item: any): boolean {
  if (!item) return false;
  if (!!item.hasConflict || !!item.has_cicd_conflict) return true;

  const nameLow = (item.name || item.project_name || '').toLowerCase();
  const pid = item.pipelineId || item.pipeline_id ? String(item.pipelineId || item.pipeline_id) : '';

  // Conflict case: peoplecraft-frontend uses GitHub Actions, but has an Azure DevOps pipeline_id (numeric ID e.g. 19)
  if (nameLow.includes('peoplecraft-frontend') && /^\d+$/.test(pid)) {
    return true;
  }

  return false;
}
