export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  originalLineNum?: number;
  newLineNum?: number;
}

/**
 * Computes line-by-line diff between original and current content using LCS algorithm.
 */
export function computeLineDiff(original: string, current: string): DiffLine[] {
  // Normalize line endings and split
  const origLines = original.replace(/\r\n/g, '\n').split('\n');
  const currLines = current.replace(/\r\n/g, '\n').split('\n');
  
  const n = origLines.length;
  const m = currLines.length;
  
  // DP table for LCS length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origLines[i - 1] === currLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diff: DiffLine[] = [];
  let i = n, j = m;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === currLines[j - 1]) {
      diff.unshift({
        type: 'unchanged',
        content: origLines[i - 1],
        originalLineNum: i,
        newLineNum: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        content: currLines[j - 1],
        newLineNum: j
      });
      j--;
    } else {
      diff.unshift({
        type: 'removed',
        content: origLines[i - 1],
        originalLineNum: i
      });
      i--;
    }
  }
  
  return diff;
}
