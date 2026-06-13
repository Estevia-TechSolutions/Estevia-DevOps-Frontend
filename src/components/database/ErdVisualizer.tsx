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
}

export const ErdVisualizer: React.FC<ErdVisualizerProps> = ({ API_BASE, theme }) => {
  const [schema, setSchema] = useState<ErdSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeTable, setActiveTable] = useState<string | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const fetchErdSchema = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/database-hub/erd`);
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
  }, [API_BASE]);

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
          DATABASE SCHEMA: <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>estevia_devops</span>
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
        minHeight: '480px',
        background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '30px',
        overflow: 'auto',
        position: 'relative'
      }}>
        
        {/* Zoom wrap */}
        <div style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease-out',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          {schema.tables.map((table) => {
            const isActive = activeTable === table.name;
            return (
              <div
                key={table.name}
                onMouseEnter={() => setActiveTable(table.name)}
                onMouseLeave={() => setActiveTable(null)}
                style={{
                  width: '240px',
                  borderRadius: '10px',
                  background: isLight ? '#ffffff' : '#0c1322',
                  border: isActive ? '1px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                  boxShadow: isActive ? '0 8px 24px rgba(139, 92, 246, 0.15)' : 'var(--panel-shadow)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {/* Table Header */}
                <div style={{
                  padding: '10px 14px',
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
                  {table.columns.map((col, idx) => {
                    const isFk = schema.relations.some(r => r.fromTable === table.name && r.fromColumn === col.name);
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: idx === table.columns.length - 1 ? 'none' : '1px solid var(--divider)',
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
          boxShadow: 'var(--panel-shadow)'
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
