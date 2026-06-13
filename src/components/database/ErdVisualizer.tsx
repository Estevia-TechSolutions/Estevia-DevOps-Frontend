import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Database, Key, RefreshCw, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  nullable: boolean;
  defaultValue: string | null;
}

interface Table {
  name: string;
  columns: Column[];
}

interface Relation {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

interface ErdSchema {
  tables: Table[];
  relations: Relation[];
}

interface ErdVisualizerProps {
  API_BASE: string;
  theme: 'dark' | 'light';
  selectedDbServer: any;
  selectedDatabase: any;
}

export const ErdVisualizer: React.FC<ErdVisualizerProps> = ({ API_BASE, theme, selectedDbServer, selectedDatabase }) => {
  const [schema, setSchema] = useState<ErdSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [modalZoom, setModalZoom] = useState(1);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isLight = theme === 'light';

  // Close modal on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsExpanded(false); };
    if (isExpanded) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExpanded]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isExpanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isExpanded]);

  useEffect(() => {
    const fetchErdSchema = async () => {
      if (!selectedDbServer || !selectedDatabase) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('devops_token');
        const res = await fetch(`${API_BASE}/database-hub/erd?serverName=${selectedDbServer.name}&dbName=${selectedDatabase.name}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSchema(data.erd);
        }
      } catch (err) {
        console.error('Failed to fetch ERD schema:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchErdSchema();
  }, [API_BASE, selectedDbServer, selectedDatabase]);

  const handleZoom = (factor: number) => {
    setZoom(prev => Math.max(0.4, Math.min(1.8, Math.round((prev + factor) * 10) / 10)));
  };

  const handleModalZoom = (factor: number) => {
    setModalZoom(prev => Math.max(0.3, Math.min(2.5, Math.round((prev + factor) * 10) / 10)));
  };

  const tablesPerCol = 3;
  const colWidth = 240;
  const hGap = 160;
  const vGap = 40;

  const tableCoords = React.useMemo(() => {
    if (!schema || !schema.tables) return [];
    const coords: { x: number; y: number; height: number }[] = [];
    const colHeights: number[] = [];
    schema.tables.forEach((table, idx) => {
      const colIndex = Math.floor(idx / tablesPerCol);
      const rowIndex = idx % tablesPerCol;
      const x = colIndex * (colWidth + hGap);
      const height = 38 + table.columns.length * 32;
      if (rowIndex === 0) colHeights[colIndex] = 20;
      const y = colHeights[colIndex];
      colHeights[colIndex] = y + height + vGap;
      coords.push({ x, y, height });
    });
    return coords;
  }, [schema]);

  const getTableCoords = (idx: number) => tableCoords[idx] || { x: 0, y: 0, height: 0 };

  const maxX = React.useMemo(() => {
    if (!tableCoords.length) return 800;
    return Math.max(...tableCoords.map(c => c.x + colWidth)) + 50;
  }, [tableCoords]);

  const maxY = React.useMemo(() => {
    if (!tableCoords.length) return 600;
    return Math.max(...tableCoords.map(c => c.y + c.height)) + 50;
  }, [tableCoords]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '20px 0' }}>
        <RefreshCw size={18} className="spin-anim" />
        <span>Generating Entity-Relationship Schema Model...</span>
      </div>
    );
  }

  if (!schema) {
    return <div style={{ color: 'var(--text-secondary)' }}>No database schema models found.</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Shared diagram content renderer (used in both inline view & modal)
  // ─────────────────────────────────────────────────────────────────────────────
  const DiagramContent = () => (
    <>
      {/* SVG relation lines */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        {schema!.relations.map((rel, idx) => {
          const fromTable = schema!.tables.find(t => t.name === rel.fromTable);
          const toTable   = schema!.tables.find(t => t.name === rel.toTable);
          const fromTableIdx = schema!.tables.findIndex(t => t.name === rel.fromTable);
          const toTableIdx   = schema!.tables.findIndex(t => t.name === rel.toTable);
          if (fromTableIdx === -1 || toTableIdx === -1 || !fromTable || !toTable) return null;
          const fromColIdx = fromTable.columns.findIndex(c => c.name === rel.fromColumn);
          const toColIdx   = toTable.columns.findIndex(c => c.name === rel.toColumn);
          if (fromColIdx === -1 || toColIdx === -1) return null;

          const cF = getTableCoords(fromTableIdx);
          const cT = getTableCoords(toTableIdx);
          const y_from = cF.y + 38 + fromColIdx * 32 + 16;
          const y_to   = cT.y + 38 + toColIdx   * 32 + 16;

          let x_from = 0, x_to = 0;
          if      (cF.x < cT.x) { x_from = cF.x + 240; x_to = cT.x; }
          else if (cF.x > cT.x) { x_from = cF.x;        x_to = cT.x + 240; }
          else                   { x_from = cF.x + 240;  x_to = cT.x + 240; }

          const isSameCol   = cF.x === cT.x;
          const dx          = Math.abs(x_to - x_from);
          const dy          = Math.abs(y_to - y_from);
          const controlDist = isSameCol ? Math.max(60, dy * 0.5) : Math.min(120, dx * 0.5);
          let cp1x = x_from, cp2x = x_to;
          if (isSameCol) {
            cp1x = x_from + controlDist; cp2x = x_to + controlDist;
          } else {
            cp1x = x_from + (x_to > x_from ? controlDist : -controlDist);
            cp2x = x_to   + (x_to > x_from ? -controlDist : controlDist);
          }
          const pathD = `M ${x_from} ${y_from} C ${cp1x} ${y_from}, ${cp2x} ${y_to}, ${x_to} ${y_to}`;

          const isHighlighted = activeTable && (rel.fromTable === activeTable || rel.toTable === activeTable);
          const isDimmed      = activeTable && !isHighlighted;
          const strokeColor   = isHighlighted ? '#d946ef' : isDimmed
            ? (isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)')
            : (isLight ? '#ec4899' : 'rgba(236,72,153,0.5)');
          const strokeWidth   = isHighlighted ? 2.5 : 1.5;
          const opacity       = isHighlighted ? 0.95 : isDimmed ? 0.1 : 0.6;

          return (
            <g key={idx}>
              <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} opacity={opacity} style={{ transition: 'all 0.2s ease' }} />
              <circle cx={x_from} cy={y_from} r={3} fill={strokeColor} opacity={opacity} />
              <circle cx={x_to}   cy={y_to}   r={3} fill={strokeColor} opacity={opacity} />
            </g>
          );
        })}
      </svg>

      {/* Table cards */}
      {schema!.tables.map((table, idx) => {
        const isActive = activeTable === table.name;
        const coords   = getTableCoords(idx);
        return (
          <div
            key={table.name}
            onMouseEnter={() => setActiveTable(table.name)}
            onMouseLeave={() => setActiveTable(null)}
            style={{
              position: 'absolute', left: `${coords.x}px`, top: `${coords.y}px`, width: '240px',
              borderRadius: '10px',
              background: isLight ? '#ffffff' : '#0c1322',
              border: isActive ? '1px solid var(--accent-purple)' : '1px solid var(--glass-border)',
              boxShadow: isActive ? '0 8px 24px rgba(139,92,246,0.15)' : 'var(--panel-shadow)',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              zIndex: 20
            }}
          >
            {/* Table header */}
            <div style={{ height: '38px', boxSizing: 'border-box', padding: '0 14px', background: isActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={14} color={isActive ? '#fff' : 'var(--accent-purple)'} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isActive ? '#fff' : 'var(--text-primary)' }}>{table.name}</span>
            </div>
            {/* Columns */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {table.columns.map((col, cIdx) => {
                const isFk = schema!.relations.some(r => r.fromTable === table.name && r.fromColumn === col.name);
                return (
                  <div key={cIdx} style={{ height: '32px', boxSizing: 'border-box', padding: '0 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: cIdx === table.columns.length - 1 ? 'none' : '1px solid var(--divider)', fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {col.isPrimaryKey && <Key size={10} style={{ color: '#fbbf24' }} />}
                      {isFk && !col.isPrimaryKey && <Key size={10} style={{ color: '#ec4899', transform: 'rotate(90deg)' }} />}
                      <span style={{ color: col.isPrimaryKey ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: col.isPrimaryKey ? 600 : 400 }}>{col.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'monospace' }}>{col.type.split('(')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Legend (shared)
  // ─────────────────────────────────────────────────────────────────────────────
  const Legend = ({ fixed = false }: { fixed?: boolean }) => (
    <div style={{
      position: fixed ? 'fixed' : 'absolute',
      bottom: fixed ? '28px' : '20px',
      right:  fixed ? '28px' : '20px',
      padding: '12px 16px', borderRadius: '10px',
      background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(12,19,34,0.97)',
      border: '1px solid var(--glass-border)',
      backdropFilter: fixed ? 'blur(12px)' : 'none',
      display: 'flex', flexDirection: 'column', gap: '8px',
      fontSize: '0.72rem', boxShadow: fixed ? '0 8px 32px rgba(0,0,0,0.5)' : 'var(--panel-shadow)',
      zIndex: fixed ? 10001 : 30
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Legend</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
        <Key size={10} style={{ color: '#fbbf24' }} /><span>Primary Key</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
        <Key size={10} style={{ color: '#ec4899', transform: 'rotate(90deg)' }} /><span>Foreign Key</span>
      </div>
      {fixed && (
        <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--divider)', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
          Press <kbd style={{ padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--glass-border)', fontFamily: 'monospace', fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)' }}>Esc</kbd> to close
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '600px', width: '100%' }}>

      {/* ── Controls strip ── */}
      <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          DATABASE SCHEMA: <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{selectedDatabase?.name || 'estevia_devops'}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => handleZoom(-0.1)} title="Zoom Out" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZoomOut size={12} />
          </button>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', width: '36px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => handleZoom(0.1)} title="Zoom In" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZoomIn size={12} />
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)', margin: '0 4px' }} />
          <button
            onClick={() => { setModalZoom(1); setIsExpanded(true); }}
            title="Open fullscreen view"
            style={{ height: '28px', padding: '0 14px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.45)', background: 'rgba(139,92,246,0.12)', color: 'var(--accent-purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 600 }}
          >
            <Maximize size={12} />
            Expand View
          </button>
        </div>
      </div>

      {/* ── Inline diagram area ── */}
      <div style={{ flex: 1, minHeight: '460px', height: '500px', background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '30px', overflow: 'auto', position: 'relative' }}>
        <div style={{ width: `${maxX * zoom}px`, height: `${maxY * zoom}px`, position: 'relative' }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.15s ease-out', position: 'absolute', top: 0, left: 0, width: `${maxX}px`, height: `${maxY}px` }}>
            <DiagramContent />
          </div>
        </div>
        <Legend />
      </div>

      {/* ── Fullscreen Modal (portal) ── */}
      {isExpanded && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsExpanded(false); }}
        >
          {/* ── Modal header ── */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '62px', background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(10,16,30,0.99)', borderBottom: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            {/* Left: title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>ERD Visualizer — Fullscreen</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{selectedDatabase?.name}</span>
                  &nbsp;·&nbsp;{schema.tables.length} tables&nbsp;·&nbsp;{schema.relations.length} relations
                </div>
              </div>
            </div>

            {/* Right: zoom + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => handleModalZoom(-0.1)} title="Zoom Out" style={{ width: '34px', height: '34px', borderRadius: '7px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ZoomOut size={14} />
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', width: '46px', textAlign: 'center', fontWeight: 600 }}>{Math.round(modalZoom * 100)}%</span>
              <button onClick={() => handleModalZoom(0.1)} title="Zoom In" style={{ width: '34px', height: '34px', borderRadius: '7px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ZoomIn size={14} />
              </button>
              <button onClick={() => setModalZoom(1)} title="Reset to 100%" style={{ height: '34px', padding: '0 12px', borderRadius: '7px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.73rem', fontWeight: 500 }}>
                Reset
              </button>

              <div style={{ width: '1px', height: '26px', background: 'var(--glass-border)', margin: '0 8px' }} />

              {/* ✕ Close button */}
              <button
                onClick={() => setIsExpanded(false)}
                title="Close fullscreen (Esc)"
                style={{
                  height: '36px', padding: '0 18px', borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.4)',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#f87171', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  fontSize: '0.82rem', fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.24)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              >
                <X size={15} />
                Close
              </button>
            </div>
          </div>

          {/* ── Scrollable canvas ── */}
          <div style={{ flex: 1, overflow: 'auto', padding: '48px', position: 'relative' }}>
            <div style={{ width: `${maxX * modalZoom}px`, height: `${maxY * modalZoom}px`, position: 'relative' }}>
              <div style={{ transform: `scale(${modalZoom})`, transformOrigin: 'top left', transition: 'transform 0.15s ease-out', position: 'absolute', top: 0, left: 0, width: `${maxX}px`, height: `${maxY}px` }}>
                <DiagramContent />
              </div>
            </div>
          </div>

          <Legend fixed />
        </div>,
        document.body
      )}

    </div>
  );
};
