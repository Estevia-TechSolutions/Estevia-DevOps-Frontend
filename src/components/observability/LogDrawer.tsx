import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Download, Trash2, ShieldAlert, Cpu, HardDrive, Search } from 'lucide-react';

interface LogLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
}

interface LogDrawerProps {
  appName: string;
  onClose: () => void;
  API_BASE: string;
  theme: 'dark' | 'light';
}

export const LogDrawer: React.FC<LogDrawerProps> = ({ appName, onClose, API_BASE, theme }) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [filter, setFilter] = useState('');
  const [replica, setReplica] = useState('replica-84ba283-x1');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cpu, setCpu] = useState(12);
  const [memory, setMemory] = useState(140);
  const [cpuHistory, setCpuHistory] = useState<number[]>([10, 12, 9, 14, 11, 13, 12, 10, 12]);
  const [memHistory, setMemHistory] = useState<number[]>([138, 139, 140, 138, 142, 141, 140, 139, 140]);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  // Fetch initial logs and metrics
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/observability/${appName}/logs`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchLogs();
  }, [appName, API_BASE]);

  // Live metrics and log simulation updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(async () => {
      // Simulate live metric fluctuations
      const nextCpu = Math.max(5, Math.min(95, cpu + Math.floor(Math.random() * 7) - 3));
      const nextMem = Math.max(100, Math.min(512, memory + Math.floor(Math.random() * 5) - 2));

      setCpu(nextCpu);
      setMemory(nextMem);
      setCpuHistory(prev => [...prev.slice(1), nextCpu]);
      setMemHistory(prev => [...prev.slice(1), nextMem]);

      // Add a simulated live log line occasionally
      if (Math.random() > 0.4) {
        const levels: ('INFO' | 'WARN' | 'ERROR')[] = ['INFO', 'INFO', 'WARN', 'INFO'];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        const messages = {
          INFO: [
            `GET /api/apps/scan - 200 OK (32ms)`,
            `POST /api/credentials - Updated Git secrets`,
            `Handshake succeeded with Azure DevOps API`,
            `Container App health check passed successfully`
          ],
          WARN: [
            `Database connection latency spiked: 98ms`,
            `Azure container registry connection throttled`,
            `High request load detected on ingress replica`
          ],
          ERROR: [
            `Connection pool timeout: failed to acquire connection in 10000ms`,
            `Azure DevOps pipeline run execution #42 failed`,
            `GoDaddy DNS record update rejected: unauthorized credentials`
          ]
        };

        const list = messages[randomLevel];
        const randomMsg = list[Math.floor(Math.random() * list.length)];

        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: randomLevel,
            message: randomMsg
          }
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, cpu, memory]);

  // Handle auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearConsole = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}_logs_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(l => 
    l.message.toLowerCase().includes(filter.toLowerCase()) || 
    l.level.toLowerCase().includes(filter.toLowerCase())
  );

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#ef4444'; // red
      case 'WARN': return '#f59e0b'; // amber
      case 'SYSTEM': return '#8b5cf6'; // purple
      default: return '#3b82f6'; // blue (INFO)
    }
  };

  // Sparkline chart rendering
  const renderSparkline = (data: number[], color: string) => {
    const width = 120;
    const height = 24;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '640px',
      maxWidth: '100vw',
      backgroundColor: isLight ? '#ffffff' : '#090d16',
      borderLeft: '1px solid var(--glass-border)',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-in-anim 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block', boxShadow: '0 0 8px var(--success)' }} />
            Logs & Metrics: {appName}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Real-time stdout streams and diagnostics console.
          </p>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Real-time Metrics Header Strip */}
      <div style={{
        padding: '16px 24px',
        background: 'rgba(0, 0, 0, 0.15)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* CPU metric */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <Cpu size={20} style={{ color: 'var(--accent-purple)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>CPU UTILIZATION</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{cpu}%</div>
          </div>
          <div>{renderSparkline(cpuHistory, 'var(--accent-purple)')}</div>
        </div>

        {/* Memory metric */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <HardDrive size={20} style={{ color: 'var(--accent-blue)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>MEMORY FOOTPRINT</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{memory} MB</div>
          </div>
          <div>{renderSparkline(memHistory, 'var(--accent-blue)')}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Filter logs (e.g. error, GET)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              fontSize: '0.8rem',
              height: '32px',
              padding: '0 10px 0 30px',
              borderRadius: '6px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Replica selector */}
        <select
          value={replica}
          onChange={(e) => setReplica(e.target.value)}
          style={{
            fontSize: '0.8rem',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.02)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            padding: '0 8px',
            cursor: 'pointer'
          }}
        >
          <option value="replica-84ba283-x1">replica-84ba283-x1 (Active)</option>
          <option value="replica-84ba283-x2">replica-84ba283-x2 (Idle)</option>
        </select>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause streaming' : 'Resume streaming'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ color: 'var(--success)' }} />}
          </button>

          <button
            onClick={clearConsole}
            title="Clear console"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={downloadLogs}
            title="Download log history"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Monospace Terminal Body */}
      <div style={{
        flex: 1,
        background: '#020617',
        padding: '24px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        lineHeight: '1.5',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        color: '#f8fafc'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
            No matching log events found.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', flexShrink: 0 }}>{log.timestamp}</span>
              <span style={{ 
                color: getLogLevelColor(log.level), 
                fontWeight: 700, 
                width: '60px', 
                flexShrink: 0 
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

      {/* Footer Settings */}
      <div style={{
        padding: '14px 24px',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
          Showing {filteredLogs.length} of {logs.length} entries
        </div>
      </div>
    </div>
  );
};
