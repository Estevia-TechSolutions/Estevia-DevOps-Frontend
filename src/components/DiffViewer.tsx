import React from 'react';
import { computeLineDiff } from '../utils/diffHelper';

interface DiffViewerProps {
  original: string;
  current: string;
  theme?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, current, theme = 'dark' }) => {
  const diffLines = computeLineDiff(original, current);

  const isLight = theme === 'light';

  const addedBg = isLight ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.1)';
  const addedText = isLight ? '#047857' : '#34d399';
  
  const removedBg = isLight ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.1)';
  const removedText = isLight ? '#b91c1c' : '#f87171';

  const unchangedText = isLight ? '#334155' : '#e2e8f0';
  const lineNumColor = isLight ? '#94a3b8' : '#475569';
  const borderCol = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '0.8rem',
      lineHeight: '1.6',
      background: isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.4)',
      border: `1px solid ${borderCol}`,
      borderRadius: '10px',
      overflowX: 'auto',
      maxHeight: '380px',
      overflowY: 'auto',
      padding: '12px 0'
    }}>
      {diffLines.length === 0 ? (
        <div style={{ padding: '16px', color: unchangedText, textAlign: 'center', opacity: 0.6 }}>
          No changes to display
        </div>
      ) : (
        diffLines.map((line, idx) => {
          let bg = 'transparent';
          let color = unchangedText;
          let prefix = ' ';
          
          if (line.type === 'added') {
            bg = addedBg;
            color = addedText;
            prefix = '+';
          } else if (line.type === 'removed') {
            bg = removedBg;
            color = removedText;
            prefix = '-';
          }

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                background: bg,
                color: color,
                padding: '1px 16px',
                whiteSpace: 'pre',
                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace'
              }}
            >
              {/* Line Numbers Column */}
              <div style={{
                width: '64px',
                display: 'flex',
                userSelect: 'none',
                color: lineNumColor,
                marginRight: '16px',
                fontSize: '0.72rem',
                borderRight: `1px solid ${borderCol}`,
                paddingRight: '8px',
                opacity: 0.7
              }}>
                <span style={{ width: '26px', textAlign: 'right', display: 'inline-block' }}>
                  {line.originalLineNum || ''}
                </span>
                <span style={{ width: '12px', textAlign: 'center', display: 'inline-block', opacity: 0.3 }}>|</span>
                <span style={{ width: '26px', textAlign: 'left', display: 'inline-block' }}>
                  {line.newLineNum || ''}
                </span>
              </div>
              
              {/* Prefix column (+ or -) */}
              <span style={{ marginRight: '8px', userSelect: 'none', fontWeight: 600, width: '12px', display: 'inline-block' }}>
                {prefix}
              </span>
              
              {/* Code column */}
              <span>{line.content || ' '}</span>
            </div>
          );
        })
      )}
    </div>
  );
};
