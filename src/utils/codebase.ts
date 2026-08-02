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

  // Iterative stripping to handle combined suffixes like -qa-swa or -dev-aca
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

  const rawProv = item.provider || item.azureResourceDetails?.provider;
  if (rawProv) {
    const provLow = String(rawProv).toLowerCase();
    if (provLow.includes('azure') || provLow.includes('devops')) return 'azure_devops';
    if (provLow.includes('github') || provLow.includes('actions')) return 'github_actions';
    if (provLow.includes('eva') || provLow.includes('native') || provLow.includes('evaforge')) return 'evaops_native';
  }

  const pid = item.pipelineId || item.pipeline_id ? String(item.pipelineId || item.pipeline_id) : '';
  if (pid.startsWith('github-actions:')) return 'github_actions';
  if (/^\d+$/.test(pid) || pid.startsWith('azdev-')) return 'azure_devops';

  const nameLow = (item.name || item.project_name || '').toLowerCase();
  if (nameLow.includes('peoplecraft-frontend')) return 'github_actions';

  return 'unconfigured';
}
