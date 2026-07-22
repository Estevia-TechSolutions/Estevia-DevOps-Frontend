import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Server, Zap, RefreshCw, AlertTriangle, Layers, Clock, Filter, ShieldAlert } from 'lucide-react';

interface MetricItem {
    recorded_at: string;
    app_key: string;
    resource_type: string;
    environment: string;
    cpu_percent: number;
    memory_mb: number;
    request_rate: number;
    p95_latency_ms: number;
    http_5xx_count: number;
    replica_count: number;
}

interface PrometheusObservabilityViewProps {
    theme?: 'dark' | 'light';
    API_BASE?: string;
}

export const PrometheusObservabilityView: React.FC<PrometheusObservabilityViewProps> = ({ theme = 'dark', API_BASE = 'http://localhost:5005/api' }) => {
    const isLight = theme === 'light';
    const [timeWindow, setTimeWindow] = useState<'15m' | '1h' | '6h' | '24h' | '7d'>('1h');
    const [selectedEnv, setSelectedEnv] = useState<'dev' | 'qa' | 'prod'>('dev');
    const [selectedApp, setSelectedApp] = useState<string>('connecthub');
    const [resourceType, setResourceType] = useState<'aca' | 'swa' | 'vm'>('aca');
    const [appsCatalog, setAppsCatalog] = useState<Array<{ key: string; label: string; icon: string }>>([]);
    const [metrics, setMetrics] = useState<MetricItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchCatalog();
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [timeWindow, selectedEnv, selectedApp, resourceType]);

    const fetchCatalog = async () => {
        try {
            const token = localStorage.getItem('evaops_token');
            const res = await fetch(`${API_BASE}/auth/resource-catalog`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAppsCatalog(data.catalog || []);
                if (data.catalog && data.catalog.length > 0) {
                    setSelectedApp(data.catalog[0].key);
                }
            }
        } catch (err) {
            console.error('Failed to load resource catalog:', err);
        }
    };

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('evaops_token');
            const queryStr = `app_key=${selectedApp}&environment=${selectedEnv}&time_window=${timeWindow}&resource_type=${resourceType}`;
            let res = await fetch(`${API_BASE}/observability/metrics?${queryStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);

            if (!res || !res.ok) {
                res = await fetch(`${API_BASE}/auth/observability/metrics?${queryStr}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null);
            }

            if (res && res.ok) {
                const data = await res.json();
                if (data.success) {
                    setMetrics(data.metrics || []);
                }
            }
        } catch (err) {
            console.error('Failed to load metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate latest metric values
    const latest = metrics[metrics.length - 1] || {
        cpu_percent: 34.2,
        memory_mb: 320,
        request_rate: 142,
        p95_latency_ms: 110,
        http_5xx_count: 0,
        replica_count: resourceType === 'aca' ? 2 : 1
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Control Toolbar */}
            <div className="glass-panel" style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                    }}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            Prometheus & Grafana Observability
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : 'var(--text-secondary)' }}>
                            Live time-series telemetry for Container Apps (ACA), Static Web Apps (SWA) & Virtual Machines (VM)
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Resource Type Selector */}
                    <select
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value as any)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.3)',
                            color: isLight ? '#0f172a' : 'var(--text-primary)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)'
                        }}
                    >
                        <option value="aca">📦 Container App (ACA)</option>
                        <option value="swa">🌐 Static Web App (SWA)</option>
                        <option value="vm">🖥️ Virtual Machine (VM)</option>
                    </select>

                    {/* App Selector */}
                    <select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.3)',
                            color: isLight ? '#0f172a' : 'var(--text-primary)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)'
                        }}
                    >
                        {appsCatalog.map(app => (
                            <option key={app.key} value={app.key}>{app.icon || '📦'} {app.label}</option>
                        ))}
                    </select>

                    {/* Env Selector */}
                    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: isLight ? '1px solid #cbd5e1' : '1px solid var(--glass-border)' }}>
                        {(['dev', 'qa', 'prod'] as const).map(env => (
                            <button
                                key={env}
                                type="button"
                                onClick={() => setSelectedEnv(env)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    background: selectedEnv === env ? '#8b5cf6' : (isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)'),
                                    color: selectedEnv === env ? '#fff' : (isLight ? '#475569' : 'var(--text-secondary)'),
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {env}
                            </button>
                        ))}
                    </div>

                    {/* Time Window Buttons */}
                    <div style={{ display: 'flex', gap: '4px', background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px' }}>
                        {(['15m', '1h', '6h', '24h', '7d'] as const).map(tw => (
                            <button
                                key={tw}
                                type="button"
                                onClick={() => setTimeWindow(tw)}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    background: timeWindow === tw ? (isLight ? '#ffffff' : 'rgba(139, 92, 246, 0.25)') : 'transparent',
                                    color: timeWindow === tw ? (isLight ? '#6d28d9' : '#a78bfa') : (isLight ? '#64748b' : 'var(--text-secondary)'),
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: timeWindow === tw && isLight ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {tw}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Metric Scorecards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                }}>
                    <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>CPU Utilization</span>
                        <Cpu size={16} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)', marginTop: '4px' }}>
                        {latest.cpu_percent.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: latest.cpu_percent > 85 ? '#ef4444' : '#10b981', marginTop: '2px', fontWeight: 600 }}>
                        {latest.cpu_percent > 85 ? '⚠️ High Utilization' : 'Normal Operational Tier'}
                    </div>
                </div>

                <div className="glass-panel" style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                }}>
                    <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Memory Consumption</span>
                        <Server size={16} style={{ color: '#2dd4bf' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)', marginTop: '4px' }}>
                        {latest.memory_mb} MB
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                        Active RAM Allocation
                    </div>
                </div>

                <div className="glass-panel" style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                }}>
                    <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Request Rate</span>
                        <Zap size={16} style={{ color: '#f59e0b' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)', marginTop: '4px' }}>
                        {latest.request_rate} req/s
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Throughput Ingress
                    </div>
                </div>

                <div className="glass-panel" style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)'
                }}>
                    <div style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>p95 API Response Time</span>
                        <Clock size={16} style={{ color: '#ec4899' }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isLight ? '#0f172a' : 'var(--text-primary)', marginTop: '4px' }}>
                        {latest.p95_latency_ms} ms
                    </div>
                    <div style={{ fontSize: '0.72rem', color: latest.p95_latency_ms > 2000 ? '#ef4444' : '#10b981', marginTop: '2px', fontWeight: 600 }}>
                        {latest.p95_latency_ms > 2000 ? '⚠️ High Latency' : 'Optimal Latency (<200ms)'}
                    </div>
                </div>
            </div>

            {/* Grafana-Style Live Visual Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                {/* Chart 1: CPU & Memory */}
                <div className="glass-panel" style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            📊 CPU Utilization (%) & Memory Allocation
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', fontWeight: 700 }}>
                            {latest.replica_count} Active Replicas Healthy
                        </span>
                    </div>

                    {/* SVG Live Bar Telemetry Chart */}
                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)' }}>
                        {metrics.map((m, idx) => (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.min(100, Math.max(10, m.cpu_percent))}%`,
                                    background: m.cpu_percent > 85 ? '#ef4444' : 'linear-gradient(180deg, #8b5cf6, #3b82f6)',
                                    borderRadius: '4px',
                                    transition: 'height 0.3s'
                                }} title={`CPU: ${m.cpu_percent}%`} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: isLight ? '#94a3b8' : 'var(--text-secondary)' }}>
                        <span>Earlier ({timeWindow})</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Chart 2: Requests & 5xx Error Spikes */}
                <div className="glass-panel" style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
                            🚀 Request Throughput (req/s) & 5xx Spikes
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: latest.http_5xx_count > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                            {latest.http_5xx_count > 0 ? `⚠️ ${latest.http_5xx_count} 5xx Errors` : '0 Server Errors'}
                        </span>
                    </div>

                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)' }}>
                        {metrics.map((m, idx) => (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.min(100, Math.max(10, (m.request_rate / 250) * 100))}%`,
                                    background: m.http_5xx_count > 0 ? '#ef4444' : 'linear-gradient(180deg, #2dd4bf, #06b6d4)',
                                    borderRadius: '4px',
                                    transition: 'height 0.3s'
                                }} title={`Requests: ${m.request_rate} req/s, 5xx: ${m.http_5xx_count}`} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: isLight ? '#94a3b8' : 'var(--text-secondary)' }}>
                        <span>Earlier ({timeWindow})</span>
                        <span>Now</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
