import React, { useState, useEffect } from 'react';
import { Database, Key, HelpCircle, RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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
  const [activeTable, setActiveTable] = useState<string | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const fetchErdSchema = async () => {
      if (!selectedDbServer || !selectedDatabase) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('devops_token');
        const res = await fetch(`${API_BASE}/database-hub/erd?serverName=${selectedDbServer.name}&dbName=${selectedDatabase.name}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
    setZoom(prev => Math.max(0.6, Math.min(1.4, prev + factor)));
  };

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

  const tablesPerCol = 3;
  const colWidth = 240;
  const hGap = 160;
  const vGap = 40;

  // Pre-calculate table coordinates to avoid overlaps and compute correct canvas size
  const tableCoords = React.useMemo(() => {
    if (!schema || !schema.tables) return [];
    
    const coords: { x: number; y: number; height: number }[] = [];
    const colHeights: number[] = []; // Stores the current accumulated y for each column index
    
    schema.tables.forEach((table, idx) => {
      const colIndex = Math.floor(idx / tablesPerCol);
      const rowIndex = idx % tablesPerCol;
      const x = colIndex * (colWidth + hGap);
      
      const height = 38 + table.columns.length * 32;
      
      if (rowIndex === 0) {
        colHeights[colIndex] = 20; // Start with 20px padding at top
      }
      
      const y = colHeights[colIndex];
      colHeights[colIndex] = y + height + vGap;
      
      coords.push({ x, y, height });
    });
    
    return coords;
  }, [schema]);

  const getTableCoords = (idx: number) => {
    return tableCoords[idx] || { x: 0, y: 0, height: 0 };
  };

  const maxX = React.useMemo(() => {
    if (!tableCoords.length) return 800;
    return Math.max(...tableCoords.map(c => c.x + colWidth)) + 50;
  }, [tableCoords]);

  const maxY = React.useMemo(() => {
    if (!tableCoords.length) return 600;
    return Math.max(...tableCoords.map(c => c.y + c.height)) + 50;
  }, [tableCoords]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      
      {/* Visual Controls Strip */}
      <div className="glass-panel" style={{
        padding: '12px 20px',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          DATABASE SCHEMA: <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{selectedDatabase?.name || 'estevia_devops'}</span>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => handleZoom(-0.1)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ZoomOut size={12} />
          </button>
          
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', width: '36px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => handleZoom(0.1)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div style={{
        flex: 1,
        minHeight: '520px',
        background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '30px',
        overflow: 'auto',
        position: 'relative'
      }}>
        
        {/* Scrollable layout wrapper that scales space for the parent scrollbars */}
        <div style={{
          width: `${maxX * zoom}px`,
          height: `${maxY * zoom}px`,
          position: 'relative'
        }}>
          {/* Zoom wrap */}
          <div style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${maxX}px`,
            height: `${maxY}px`
          }}>
            {/* SVG Connector Lines Overlay */}
            <svg 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              {schema.relations.map((rel, idx) => {
                const fromTable = schema.tables.find(t => t.name === rel.fromTable);
                const toTable = schema.tables.find(t => t.name === rel.toTable);
                const fromTableIdx = schema.tables.findIndex(t => t.name === rel.fromTable);
                const toTableIdx = schema.tables.findIndex(t => t.name === rel.toTable);
                
                if (fromTableIdx === -1 || toTableIdx === -1 || !fromTable || !toTable) return null;
                
                const fromColIdx = fromTable.columns.findIndex(c => c.name === rel.fromColumn);
                const toColIdx = toTable.columns.findIndex(c => c.name === rel.toColumn);
                
                if (fromColIdx === -1 || toColIdx === -1) return null;
                
                const coordsFrom = getTableCoords(fromTableIdx);
                const coordsTo = getTableCoords(toTableIdx);
                
                const x_A = coordsFrom.x;
                const y_A = coordsFrom.y;
                const x_B = coordsTo.x;
                const y_B = coordsTo.y;
                
                const y_from = y_A + 38 + fromColIdx * 32 + 16;
                const y_to = y_B + 38 + toColIdx * 32 + 16;
                
                let x_from = 0;
                let x_to = 0;
                
                if (x_A < x_B) {
                  x_from = x_A + 240;
                  x_to = x_B;
                } else if (x_A > x_B) {
                  x_from = x_A;
                  x_to = x_B + 240;
                } else {
                  x_from = x_A + 240;
                  x_to = x_B + 240;
                }
                
                const dx = Math.abs(x_to - x_from);
                const dy = Math.abs(y_to - y_from);
                const isSameCol = x_A === x_B;
                const controlDist = isSameCol ? Math.max(60, dy * 0.5) : Math.min(120, dx * 0.5);
                
                let cp1x = x_from;
                let cp2x = x_to;
                
                if (isSameCol) {
                  cp1x = x_from + controlDist;
                  cp2x = x_to + controlDist;
                } else {
                  cp1x = x_from + (x_to > x_from ? controlDist : -controlDist);
                  cp2x = x_to + (x_to > x_from ? -controlDist : controlDist);
                }
                
                const cp1y = y_from;
                const cp2y = y_to;
                
                const pathD = `M ${x_from} ${y_from} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x_to} ${y_to}`;
                
                const isHighlighted = activeTable && (rel.fromTable === activeTable || rel.toTable === activeTable);
                const isDimmed = activeTable && !isHighlighted;
                
                let strokeColor = '#fb7185';
                if (isHighlighted) {
                  strokeColor = '#d946ef';
                } else if (isDimmed) {
                  strokeColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)';
                } else {
                  strokeColor = isLight ? '#ec4899' : 'rgba(236,72,153,0.5)';
                }
                
                const strokeWidth = isHighlighted ? 2.5 : 1.5;
                const opacity = isHighlighted ? 0.95 : (isDimmed ? 0.1 : 0.6);
                
                return (
                  <g key={idx}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <circle cx={x_from} cy={y_from} r={3} fill={strokeColor} opacity={opacity} />
                    <circle cx={x_to} cy={y_to} r={3} fill={strokeColor} opacity={opacity} />
                  </g>
                );
              })}
            </svg>

            {schema.tables.map((table, idx) => {
              const isActive = activeTable === table.name;
              const coords = getTableCoords(idx);
              return (
                <div
                  key={table.name}
                  onMouseEnter={() => setActiveTable(table.name)}
                  onMouseLeave={() => setActiveTable(null)}
                  style={{
                    position: 'absolute',
                    left: `${coords.x}px`,
                    top: `${coords.y}px`,
                    width: '240px',
                    borderRadius: '10px',
                    background: isLight ? '#ffffff' : '#0c1322',
                    border: isActive ? '1px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                    boxShadow: isActive ? '0 8px 24px rgba(139, 92, 246, 0.15)' : 'var(--panel-shadow)',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    zIndex: 20
                  }}
                >
                  {/* Table Header */}
                  <div style={{
                    height: '38px',
                    boxSizing: 'border-box',
                    padding: '0 14px',
                    background: isActive ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Database size={14} color={isActive ? '#fff' : 'var(--accent-purple)'} />
                    <span style={{ 
                      fontSize: '0.84rem', 
                      fontWeight: 700, 
                      color: isActive ? '#fff' : 'var(--text-primary)' 
                    }}>{table.name}</span>
                  </div>

                  {/* Columns List */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {table.columns.map((col, cIdx) => {
                      const isFk = schema.relations.some(r => r.fromTable === table.name && r.fromColumn === col.name);
                      return (
                        <div
                          key={cIdx}
                          style={{
                            height: '32px',
                            boxSizing: 'border-box',
                            padding: '0 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: cIdx === table.columns.length - 1 ? 'none' : '1px solid var(--divider)',
                            fontSize: '0.74rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {col.isPrimaryKey && <Key size={10} style={{ color: '#fbbf24' }} />}
                            {isFk && !col.isPrimaryKey && <Key size={10} style={{ color: '#ec4899', transform: 'rotate(90deg)' }} />}
                            <span style={{ 
                              color: col.isPrimaryKey ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontWeight: col.isPrimaryKey ? 600 : 400
                            }}>{col.name}</span>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                            {col.type.split('(')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Schema Relations Legend */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: isLight ? '#ffffff' : '#0c1322',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.72rem',
          boxShadow: 'var(--panel-shadow)',
          zIndex: 30
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>RELATIONS LEGEND</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Key size={10} style={{ color: '#fbbf24' }} />
            <span>Primary Key (PK)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Key size={10} style={{ color: '#ec4899', transform: 'rotate(90deg)' }} />
            <span>Foreign Key (FK)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
