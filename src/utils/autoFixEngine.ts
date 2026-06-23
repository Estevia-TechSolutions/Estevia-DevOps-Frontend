/**
 * Client-side Auto-Fix Engine for YAML & Dockerfile rules.
 * Applies intelligent regex and string manipulations to fix validation issues.
 */

const FIXABLE_RULES = new Set([
  'AZ_MISSING_TRIGGER',
  'GH_MISSING_ON_TRIGGER',
  'GH_JOB_NO_RUNS_ON',
  'GH_MISSING_CHECKOUT',
  'AZ_CONTAINERAPP_CONTAINER_NAME',
  'AZ_DOCKER_MISSING_REGISTRY',
  'DOCKER_NO_EXPOSE',
  'DOCKER_ROOT_USER',
  'DOCKER_LATEST_TAG',
  'DOCKER_COPY_DOT_DOT'
]);

export function isFixable(ruleId: string): boolean {
  return FIXABLE_RULES.has(ruleId);
}

export function applyAutoFix(
  content: string,
  ruleId: string,
  message: string,
  line?: number
): string {
  if (!isFixable(ruleId)) {
    return content;
  }

  let lines = content.split('\n');

  switch (ruleId) {
    case 'AZ_MISSING_TRIGGER':
      // Prepend trigger block at the top
      return `trigger:\n  - main\n\n${content}`;

    case 'GH_MISSING_ON_TRIGGER':
      // Prepend workflow on: block at the top
      return `on:\n  push:\n    branches: [ "main" ]\n  pull_request:\n    branches: [ "main" ]\n\n${content}`;

    case 'GH_JOB_NO_RUNS_ON': {
      const match = message.match(/Job '([^']+)'/);
      if (match) {
        const jobName = match[1];
        let jobIdx = -1;
        let jobIndent = 0;
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(/^(\s*)([a-zA-Z0-9_-]+):\s*$/);
          if (m && m[2] === jobName) {
            jobIdx = i;
            jobIndent = m[1].length;
            break;
          }
        }
        if (jobIdx !== -1) {
          const indentSpaces = ' '.repeat(jobIndent + 2);
          lines.splice(jobIdx + 1, 0, `${indentSpaces}runs-on: ubuntu-latest`);
          return lines.join('\n');
        }
      }
      break;
    }

    case 'GH_MISSING_CHECKOUT': {
      const match = message.match(/Job '([^']+)'/);
      if (match) {
        const jobName = match[1];
        let jobIdx = -1;
        let jobIndent = 0;
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(/^(\s*)([a-zA-Z0-9_-]+):\s*$/);
          if (m && m[2] === jobName) {
            jobIdx = i;
            jobIndent = m[1].length;
            break;
          }
        }
        if (jobIdx !== -1) {
          let stepsIdx = -1;
          let stepsIndent = 0;
          for (let i = jobIdx + 1; i < lines.length; i++) {
            const lineText = lines[i];
            const mIndent = lineText.match(/^(\s*)\S/);
            if (mIndent) {
              const indent = mIndent[1].length;
              if (indent <= jobIndent && lineText.trim() !== '') {
                break; // reached next job block
              }
              if (lineText.trim().startsWith('steps:')) {
                stepsIdx = i;
                stepsIndent = indent;
                break;
              }
            }
          }
          if (stepsIdx !== -1) {
            const stepSpaces = ' '.repeat(stepsIndent + 2);
            lines.splice(stepsIdx + 1, 0, `${stepSpaces}- uses: actions/checkout@v4`);
          } else {
            const stepSpaces = ' '.repeat(jobIndent + 2);
            lines.splice(jobIdx + 1, 0, `${stepSpaces}steps:\n${stepSpaces}  - uses: actions/checkout@v4`);
          }
          return lines.join('\n');
        }
      }
      break;
    }

    case 'AZ_CONTAINERAPP_CONTAINER_NAME': {
      if (line && line > 0) {
        const idx = line - 1;
        if (lines[idx]) {
          const lText = lines[idx];
          if (lText.trim().endsWith('\\')) {
            const lastSlash = lText.lastIndexOf('\\');
            lines[idx] = lText.slice(0, lastSlash) + '--container-name web-container \\';
          } else {
            lines[idx] = lText + ' --container-name web-container';
          }
          return lines.join('\n');
        }
      }
      break;
    }

    case 'AZ_DOCKER_MISSING_REGISTRY': {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().includes('task: Docker@2')) {
          const taskIndent = lines[i].match(/^\s*/)?.[0].length || 0;
          let inputsIdx = -1;
          let inputsIndent = 0;
          for (let j = i + 1; j < lines.length; j++) {
            const lineText = lines[j];
            const mIndent = lineText.match(/^(\s*)\S/);
            if (mIndent) {
              const indent = mIndent[1].length;
              if (indent <= taskIndent && lineText.trim() !== '') {
                break; // reached next step/task
              }
              if (lineText.trim().startsWith('inputs:')) {
                inputsIdx = j;
                inputsIndent = indent;
                break;
              }
            }
          }
          if (inputsIdx !== -1) {
            const inputIndentSpaces = ' '.repeat(inputsIndent + 2);
            lines.splice(inputsIdx + 1, 0, `${inputIndentSpaces}containerRegistry: 'acr-service-connection'`);
          } else {
            const inputIndentSpaces = ' '.repeat(taskIndent + 2);
            lines.splice(i + 1, 0, `${inputIndentSpaces}inputs:\n${inputIndentSpaces}  containerRegistry: 'acr-service-connection'`);
          }
          return lines.join('\n');
        }
      }
      break;
    }

    case 'DOCKER_NO_EXPOSE':
      return `${content.trim()}\n\nEXPOSE 8080\n`;

    case 'DOCKER_ROOT_USER': {
      let cmdIdx = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i].trim().toUpperCase();
        if (l.startsWith('CMD ') || l.startsWith('ENTRYPOINT ')) {
          cmdIdx = i;
          break;
        }
      }
      if (cmdIdx !== -1) {
        lines.splice(cmdIdx, 0, 'USER 10001');
        return lines.join('\n');
      } else {
        return `${content.trim()}\n\nUSER 10001\n`;
      }
    }

    case 'DOCKER_LATEST_TAG': {
      return content.replace(/^FROM\s+([a-zA-Z0-9_\-\./]+):latest/mi, (match, baseImage) => {
        let pin = 'alpine';
        const lower = baseImage.toLowerCase();
        if (lower.includes('node')) pin = '20-alpine';
        else if (lower.includes('python')) pin = '3.11-alpine';
        else if (lower.includes('ubuntu')) pin = '22.04';
        else if (lower.includes('alpine')) pin = '3.19';
        else if (lower.includes('nginx')) pin = 'alpine';
        return `FROM ${baseImage}:${pin}`;
      });
    }

    case 'DOCKER_COPY_DOT_DOT': {
      let copyIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim().toUpperCase();
        if (l === 'COPY . .' || l.match(/^COPY\s+\.\s+\./)) {
          copyIdx = i;
          break;
        }
      }
      if (copyIdx !== -1) {
        lines.splice(copyIdx, 0, '# dockerignore: ensure node_modules and build artifacts are excluded');
        return lines.join('\n');
      }
      break;
    }

    default:
      break;
  }

  return content;
}
