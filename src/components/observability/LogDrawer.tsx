import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, Download, Trash2, Cpu, HardDrive, Search, Clock, RefreshCw } from 'lucide-react';

type TimeRange = 'live' | '1h' | '12h' | '24h';
type LogSource = 'log-analytics' | 'mock' | 'mock-fallback' | 'azure-fallback' | string;

interface LogLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
  stream?: string;
}

interface LogDrawerProps {
  appName: string;
  onClose: () => void;
  API_BASE: string;
  theme: 'dark' | 'light';
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  live:  'Live',
  '1h':  'Last 1 Hour',
  '12h': 'Last 12 Hours',
  '24h': 'Last 24 Hours',
};

const SOURCE_BADGE: Record<string, { label: string; color: string }> = {
  'log-analytics': { label: '⚡ Azure Log Analytics', color: '#36a64f' },
  'mock':          { label: '🧪 Simulated',           color: '#6264a7' },
  'mock-fallback': { label: '⚠ Simulated (fallback)', color: '#f59e0b' },
  'azure-fallback':{ label: '⚠ Azure (fallback)',     color: '#f59e0b' },
};

export const LogDrawer: React.FC<LogDrawerProps> = ({ appName, onClose, API_BASE, theme }) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [filter, setFilter] = useState('');
  const [replica, setReplica] = useState('replica-84ba283-x1');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [logSource, setLogSource] = useState<LogSource>('mock');
  const [logInfo, setLogInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [cpu, setCpu] = useState(12);
  const [memory, setMemory] = useState(140);
  const [cpuHistory, setCpuHistory] = useState<number[]>([10, 12, 9, 14, 11, 13, 12, 10, 12]);
  const [memHistory, setMemHistory] = useState<number[]>([138, 139, 140, 138, 142, 141, 140, 139, 140]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';
  const isHistorical = timeRange !== 'live';

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch logs (works for both live initial snapshot and historical ranges)
  const fetchLogs = useCallback(async (range: TimeRange) => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/observability/${appName}/logs?timeRange=${range}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLogSource(data.source || 'mock');
        setLogInfo(data.info || data.warning || null);
      }
    } catch (err) {
      console.error('[LogDrawer] Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [appName, API_BASE, getAuthHeaders]);

  // On mount and on timeRange change: fetch logs
  useEffect(() => {
    fetchLogs(timeRange);
    // Reset playing state when switching to historical
    if (timeRange !== 'live') {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [timeRange, appName]);  // eslint-disable-line

  // Live metrics sparkline + log append interval — DISABLED in historical mode
  useEffect(() => {
    if (!isPlaying || isHistorical) return;

    const interval = setInterval(async () => {
      // Simulate live metric fluctuations
      const nextCpu = Math.max(5, Math.min(95, cpu + Math.floor(Math.random() * 7) - 3));
      const nextMem = Math.max(100, Math.min(512, memory + Math.floor(Math.random() * 5) - 2));

      setCpu(nextCpu);
      setMemory(nextMem);
      setCpuHistory(prev => [...prev.slice(1), nextCpu]);
      setMemHistory(prev => [...prev.slice(1), nextMem]);

      // Occasionally append a new live log line from the backend
      if (Math.random() > 0.5) {
        try {
          const res = await fetch(`${API_BASE}/observability/${appName}/logs?timeRange=live`, {
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            const newest = (data.logs || []).slice(-1)[0];
            if (newest) {
              setLogs(prev => {
                // Avoid duplicate timestamps
                const last = prev[prev.length - 1];
                if (last?.timestamp === newest.timestamp && last?.message === newest.message) return prev;
                return [...prev, newest];
              });
              setLogSource(data.source || 'mock');
            }
          }
        } catch {
          // Silently skip on network error
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, isHistorical, cpu, memory, appName, API_BASE, getAuthHeaders]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearConsole = () => setLogs([]);

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}_logs_${timeRange}_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(l =>
    l.message.toLowerCase().includes(filter.toLowerCase()) ||
    l.level.toLowerCase().includes(filter.toLowerCase())
  );

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':  return '#ef4444';
      case 'WARN':   return '#f59e0b';
      case 'SYSTEM': return '#8b5cf6';
      default:       return '#3b82f6';
    }
  };

  const renderSparkline = (data: number[], color: string) => {
    const width = 120; const height = 24;
    const max = Math.max(...data, 1); const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  const sourceBadge = SOURCE_BADGE[logSource] || { label: logSource, color: '#64748b' };

  const selectStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    height: '32px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-primary)',
    border: '1px solid var(--glass-border)',
    padding: '0 8px',
    cursor: 'pointer',
  };

  const iconBtnStyle: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '6px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '680px', maxWidth: '100vw',
      backgroundColor: isLight ? '#ffffff' : '#090d16',
      borderLeft: '1px solid var(--glass-border)',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      animation: 'slide-in-anim 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid var(--glass-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: isHistorical ? '#f59e0b' : 'var(--success)',
              display: 'inline-block',
              boxShadow: `0 0 8px ${isHistorical ? '#f59e0b' : 'var(--success)'}`
            }} />
            Logs &amp; Metrics: {appName}
          </h3>
          <p style={{ margin: '4px 0 0 16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block', padding: '1px 8px', borderRadius: '10px', fontSize: '0.72rem',
              background: `${sourceBadge.color}22`, color: sourceBadge.color, fontWeight: 600,
              border: `1px solid ${sourceBadge.color}44`
            }}>
              {sourceBadge.label}
            </span>
            {isHistorical ? `Historical snapshot · ${TIME_RANGE_LABELS[timeRange]}` : 'Real-time stdout streams and diagnostics console.'}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>
      </div>

      {/* Real-time Metrics — hidden in historical mode */}
      {!isHistorical && (
        <div style={{
          padding: '16px 24px', background: 'rgba(0, 0, 0, 0.15)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <Cpu size={20} style={{ color: 'var(--accent-purple)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>CPU UTILIZATION</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{cpu}%</div>
            </div>
            <div>{renderSparkline(cpuHistory, 'var(--accent-purple)')}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <HardDrive size={20} style={{ color: 'var(--accent-blue)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>MEMORY FOOTPRINT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{memory} MB</div>
            </div>
            <div>{renderSparkline(memHistory, 'var(--accent-blue)')}</div>
          </div>
        </div>
      )}

      {/* Historical info banner */}
      {isHistorical && logInfo && (
        <div style={{
          padding: '10px 24px', background: 'rgba(245,158,11,0.08)',
          borderBottom: '1px solid rgba(245,158,11,0.2)',
          fontSize: '0.78rem', color: '#f59e0b'
        }}>
          ℹ️ {logInfo}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid var(--glass-border)',
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Filter logs (e.g. error, GET)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%', fontSize: '0.8rem', height: '32px',
              padding: '0 10px 0 30px', borderRadius: '6px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Time Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
          <select
            id="log-time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            style={{ ...selectStyle, minWidth: '130px' }}
          >
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map(r => (
              <option key={r} value={r}>{TIME_RANGE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {/* Replica selector */}
        <select
          value={replica}
          onChange={(e) => setReplica(e.target.value)}
          style={selectStyle}
        >
          <option value="replica-84ba283-x1">replica-84ba283-x1 (Active)</option>
          <option value="replica-84ba283-x2">replica-84ba283-x2 (Idle)</option>
        </select>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Play/Pause only visible in Live mode */}
          {!isHistorical && (
            <button onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? 'Pause streaming' : 'Resume streaming'} style={iconBtnStyle}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ color: 'var(--success)' }} />}
            </button>
          )}

          {/* Refresh for historical */}
          {isHistorical && (
            <button
              onClick={() => fetchLogs(timeRange)}
              disabled={isLoading}
              title="Refresh logs"
              style={{ ...iconBtnStyle, opacity: isLoading ? 0.5 : 1 }}
            >
              <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}

          <button onClick={clearConsole} title="Clear console" style={iconBtnStyle}>
            <Trash2 size={14} />
          </button>

          <button onClick={downloadLogs} title="Download log history" style={iconBtnStyle}>
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Monospace Terminal Body */}
      <div style={{
        flex: 1, background: '#020617', padding: '24px', overflowY: 'auto',
        fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.5',
        display: 'flex', flexDirection: 'column', gap: '6px', color: '#f8fafc'
      }}>
        {isLoading ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
            ⏳ Querying Azure Log Analytics…
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
            {isHistorical
              ? `No log entries found for '${appName}' in the ${TIME_RANGE_LABELS[timeRange].toLowerCase()} window.`
              : 'No matching log events found.'}
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', flexShrink: 0 }}>{log.timestamp}</span>
              <span style={{
                color: getLogLevelColor(log.level),
                fontWeight: 700, width: '60px', flexShrink: 0
              }}>[{log.level}]</span>
              <span style={{
                wordBreak: 'break-all',
                color: log.level === 'ERROR' ? '#fca5a5' : (log.level === 'WARN' ? '#fde047' : '#f8fafc')
              }}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 24px', borderTop: '1px solid var(--glass-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Auto-scroll to bottom
        </label>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {filteredLogs.length} of {logs.length} entries · max 2,000
        </div>
      </div>
    </div>
  );
};
