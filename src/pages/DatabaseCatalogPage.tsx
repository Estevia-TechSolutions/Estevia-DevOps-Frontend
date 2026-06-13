import React from 'react';
import { 
  Server, 
  RefreshCw, 
  Search, 
  PlusCircle, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Play, 
  Check, 
  Copy, 
  Plus, 
  Minus, 
  Database,
  Building2
} from 'lucide-react';
import { ErdVisualizer } from '../components/database/ErdVisualizer';
import { CompareMigrateWizard } from '../components/database/CompareMigrateWizard';

interface DatabaseCatalogPageProps {
  dbServers: any[];
  selectedDbServer: any | null;
  setSelectedDbServer: (val: any | null) => void;
  databases: any[];
  selectedDatabase: any | null;
  setSelectedDatabase: (val: any | null) => void;
  databaseSchema: any[];
  loadingDbServers: boolean;
  loadingDatabases: boolean;
  loadingSchema: boolean;
  schemaError: string | null;
  newDbName: string;
  setNewDbName: (val: string) => void;
  deployingDb: boolean;
  deployDbSuccess: string | null;
  deployDbError: string | null;
  expandedTables: Record<string, boolean>;
  setExpandedTables: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  copiedText: string | null;
  setCopiedText: (val: string | null) => void;
  dbDetailTab: 'schema' | 'query' | 'create-table' | 'connect' | 'erd' | 'compare';
  setDbDetailTab: (val: 'schema' | 'query' | 'create-table' | 'connect' | 'erd' | 'compare') => void;
  connectCodeTab: 'cli' | 'node' | 'python' | 'php';
  setConnectCodeTab: (val: 'cli' | 'node' | 'python' | 'php') => void;
  querySql: string;
  setQuerySql: (val: string) => void;
  queryExecuting: boolean;
  queryResult: any | null;
  queryError: string | null;
  dbSearchQuery: string;
  setDbSearchQuery: (val: string) => void;
  newTableName: string;
  setNewTableName: (val: string) => void;
  tableColumns: any[];
  setTableColumns: React.Dispatch<React.SetStateAction<any[]>>;
  creatingTable: boolean;
  createTableError: string | null;
  alteringTable: string | null;
  setAlteringTable: (val: string | null) => void;
  alterNewColName: string;
  setAlterNewColName: (val: string) => void;
  alterNewColType: string;
  setAlterNewColType: (val: string) => void;
  alterNewColNullable: boolean;
  setAlterNewColNullable: (val: boolean) => void;
  token: string | null;
  API_BASE: string;
  currentUser?: { role: string; name?: string; email?: string } | null;
  theme: 'dark' | 'light';

  // Handlers
  handleDeployDb: (e: React.FormEvent) => void;
  handleDropTable: (tableName: string) => void;
  handleDropColumn: (tableName: string, columnName: string) => void;
  handleExecuteQuery: (customSql: string, reloadSchemaAfter?: boolean) => void;
  handleCreateTable: (e: React.FormEvent) => void;
  handleAddColumn: (tableName: string) => void;
  fetchDatabases: (serverName: string) => void;
  fetchDatabaseSchema: (serverName: string, dbName: string) => void;
  setConfirmDialog: (dialog: any) => void;
  leftColRef: React.RefObject<HTMLDivElement | null>;
  leftColHeight: number;
}

export const DatabaseCatalogPage: React.FC<DatabaseCatalogPageProps> = ({
  dbServers,
  selectedDbServer,
  setSelectedDbServer,
  databases,
  selectedDatabase,
  setSelectedDatabase,
  databaseSchema,
  loadingDbServers,
  loadingDatabases,
  loadingSchema,
  schemaError,
  newDbName,
  setNewDbName,
  deployingDb,
  deployDbSuccess,
  deployDbError,
  expandedTables,
  setExpandedTables,
  copiedText,
  setCopiedText,
  dbDetailTab,
  setDbDetailTab,
  connectCodeTab,
  setConnectCodeTab,
  querySql,
  setQuerySql,
  queryExecuting,
  queryResult,
  queryError,
  dbSearchQuery,
  setDbSearchQuery,
  newTableName,
  setNewTableName,
  tableColumns,
  setTableColumns,
  creatingTable,
  createTableError,
  alteringTable,
  setAlteringTable,
  alterNewColName,
  setAlterNewColName,
  alterNewColType,
  setAlterNewColType,
  alterNewColNullable,
  setAlterNewColNullable,
  token,
  API_BASE,
  handleDeployDb,
  handleDropTable,
  handleDropColumn,
  handleExecuteQuery,
  handleCreateTable,
  handleAddColumn,
  fetchDatabases,
  fetchDatabaseSchema,
  setConfirmDialog,
  leftColRef,
  leftColHeight,
  currentUser,
  theme
}) => {

  const isViewer = currentUser?.role === 'viewer';

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const getTableNameFromQuery = (sql: string) => {
    if (!sql) return null;
    const regex = /\bfrom\b/gi;
    let match;
    let lastFromIdx = -1;
    while ((match = regex.exec(sql)) !== null) {
      lastFromIdx = match.index;
    }
    if (lastFromIdx === -1) return null;
    const afterFrom = sql.substring(lastFromIdx + 4).trim();
    const tableMatch = afterFrom.match(/^(?:\`?([a-zA-Z0-9_-]+)\`?\.)?\`?([a-zA-Z0-9_-]+)\`?/);
    return tableMatch ? tableMatch[2] : null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter tables by search query
  const filteredSchema = databaseSchema.filter(tbl => 
    tbl.table.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    tbl.columns.some((c: any) => c.name.toLowerCase().includes(dbSearchQuery.toLowerCase()))
  );

  return (
    <div className="glass-panel db-red" style={{
      padding: '32px',
      background: 'linear-gradient(150deg, rgba(244, 63, 94, 0.05) 0%, rgba(225, 29, 72, 0.07) 50%, rgba(159, 18, 57, 0.1) 100%)',
      borderColor: 'rgba(244, 63, 94, 0.15)',
      boxShadow: '0 0 40px rgba(244, 63, 94, 0.04), inset 0 0 20px rgba(244, 63, 94, 0.02)',
      position: 'relative', overflow: 'hidden',
      marginTop: '20px',
    }}>
      {/* Ambient top glow */}
      <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.5), rgba(251, 113, 133, 0.8), rgba(244, 63, 94, 0.2))', borderRadius: '2px 2px 0 0' }} />

      {/* Scoped red button theme */}
      <style>{`
        .db-red .btn-primary {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%) !important;
          border-color: rgba(225, 29, 72, 0.55) !important;
          color: #ffe4e6 !important;
          box-shadow: 0 2px 12px rgba(225, 29, 72, 0.35) !important;
        }
        .db-red .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%) !important;
          box-shadow: 0 4px 20px rgba(225, 29, 72, 0.5) !important;
          transform: translateY(-1px);
        }
        .db-red .btn-primary:disabled {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%) !important;
          border-color: rgba(225, 29, 72, 0.55) !important;
          color: #ffe4e6 !important;
          opacity: 0.45 !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }

        /* Light mode column values overrides to black / var(--text-primary) */
        [data-theme="light"] .schema-col-type,
        [data-theme="light"] .schema-col-null,
        [data-theme="light"] .schema-col-key,
        [data-theme="light"] .schema-col-default,
        [data-theme="light"] .schema-col-extra,
        [data-theme="light"] .schema-col-name {
          color: var(--text-primary) !important;
        }

        /* Light mode action button style override */
        [data-theme="light"] .schema-col-action button {
          color: var(--text-primary) !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
          background-color: rgba(0, 0, 0, 0.04) !important;
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'stretch' }}>
      {/* Left Column: Servers & Databases */}
      <div ref={leftColRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Server Selection Card */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(244, 63, 94, 0.1)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Server size={18} style={{ color: '#fb7185' }} />
            Database Server
          </h3>
          
          {loadingDbServers ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', color: 'var(--text-secondary)' }}>
              <RefreshCw size={16} className="spin-anim" />
              <span style={{ fontSize: '0.85rem' }}>Listing database servers...</span>
            </div>
          ) : dbServers.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '12px 0' }}>
              No MySQL Flexible Servers found in resource group.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select
                value={selectedDbServer?.name || ''}
                onChange={(e) => {
                  const s = dbServers.find(srv => srv.name === e.target.value);
                  if (s) {
                    setSelectedDbServer(s);
                    fetchDatabases(s.name);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              >
                {dbServers.map(srv => (
                  <option key={srv.name} value={srv.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{srv.name}</option>
                ))}
              </select>

              {selectedDbServer && (
                <div style={{ 
                  marginTop: '4px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success-glow)' }}></span>
                      {selectedDbServer.state}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Version:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>MySQL {selectedDbServer.version}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Region:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedDbServer.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tier / Size:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedDbServer.tier} ({selectedDbServer.sku})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--divider)', paddingTop: '6px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Endpoint Host:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.72rem' }}>{selectedDbServer.host}</span>
                  </div>
                  {selectedDbServer.privateNetwork && (
                    <div style={{
                      marginTop: '4px',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      color: 'var(--accent-orange)',
                      fontWeight: 500,
                      fontSize: '0.72rem',
                      lineHeight: '1.4'
                    }}>
                      ⚠️ Private access configured natively inside managed virtual network.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database List Card */}
        {selectedDbServer && (
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(244, 63, 94, 0.1)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Database size={18} style={{ color: '#fb7185' }} />
              Databases
            </h3>

            {loadingDatabases ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', color: 'var(--text-secondary)' }}>
                <RefreshCw size={16} className="spin-anim" />
                <span style={{ fontSize: '0.85rem' }}>Listing schemas...</span>
              </div>
            ) : databases.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '12px 0' }}>
                No active schemas provisioned on this server.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '250px', paddingRight: '4px', flex: 1 }}>
                {databases.map(dbName => {
                  const isSelected = selectedDatabase?.name === dbName.name;
                  return (
                    <button
                      key={dbName.name}
                      onClick={() => {
                        setSelectedDatabase(dbName);
                        fetchDatabaseSchema(selectedDbServer.name, dbName.name);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isSelected ? 'rgba(251, 113, 133, 0.3)' : 'var(--glass-border)'),
                        background: isSelected ? 'linear-gradient(135deg, rgba(251, 113, 133, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%)' : 'rgba(255, 255, 255, 0.02)',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={14} style={{ color: isSelected ? '#fb7185' : 'var(--text-secondary)', opacity: isSelected ? 1 : 0.7 }} />
                        {dbName.name}
                      </span>
                      {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fb7185' }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Create Schema */}
            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '16px', marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Create New Schema</h4>
              {deployDbSuccess && <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '8px' }}>{deployDbSuccess}</div>}
              {deployDbError && <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginBottom: '8px' }}>{deployDbError}</div>}
              <form onSubmit={handleDeployDb} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="db_name"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    height: '32px'
                  }}
                  required
                  disabled={isViewer}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isViewer || deployingDb || !newDbName}
                  style={{ padding: '0 12px', fontSize: '0.8rem', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {deployingDb ? <RefreshCw size={12} className="spin-anim" /> : <PlusCircle size={12} />}
                  Create
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Database Schema Detail or Workspace */}
      <div style={{ minHeight: '650px', height: `${Math.max(leftColHeight, 650)}px`, display: 'flex', flexDirection: 'column' }}>
        {!selectedDatabase ? (
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(244, 63, 94, 0.1)' }}>
            <Database size={48} style={{ color: '#fb7185', opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>No Database Selected</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px', maxWidth: '380px' }}>
              Select a database server and schema from the left column to query tables, inspect models, create visual schemas, or execute custom raw SQL.
            </p>
          </div>
        ) : (
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(244, 63, 94, 0.1)' }}>
            {/* Header / Tabs stacked vertically */}
            <div style={{ 
              borderBottom: '1px solid rgba(239, 68, 68, 0.35)', 
              display: 'flex', 
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.85) 0%, rgba(69, 10, 10, 0.95) 60%, rgba(24, 24, 27, 0.98) 100%)',
              boxShadow: 'inset 0 -1px 0 rgba(239, 68, 68, 0.2), 0 2px 16px rgba(127, 29, 29, 0.3)',
              borderRadius: '12px 12px 0 0',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* subtle ambient glow */}
              <div style={{ position: 'absolute', top: '-30px', right: '60px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              
              {/* Row 1: DB Info */}
              <div style={{ 
                padding: '20px 24px 14px 24px', 
                position: 'relative',
                zIndex: 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{selectedDatabase.name}</span>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(220, 38, 38, 0.25)', border: '1px solid rgba(220, 38, 38, 0.45)', color: '#fca5a5', fontWeight: 600 }}>Schema Catalog</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginTop: '4px', position: 'relative' }}>
                  Server: <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>{selectedDbServer?.name}</span>
                </div>
              </div>

              {/* Row 2: Sub tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '2px', 
                padding: '0 24px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}>
                {([
                  { id: 'schema',       label: 'Tables & Schema'     },
                  { id: 'query',        label: 'SQL Console'          },
                  { id: 'create-table', label: '+ New Table'          },
                  { id: 'connect',      label: 'Connection Snippets'  },
                  { id: 'erd',          label: 'ERD Visualizer'       },
                  { id: 'compare',      label: 'Compare & Migrate'    },
                ] as const).map(tab => {
                  const active = dbDetailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDbDetailTab(tab.id)}
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.82rem',
                        fontWeight: active ? 700 : 500,
                        border: 'none',
                        background: active
                          ? 'rgba(239, 68, 68, 0.22)'
                          : 'rgba(255, 255, 255, 0.06)',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        color: active ? '#fff' : 'rgba(255, 255, 255, 0.82)',
                        cursor: 'pointer',
                        borderBottom: active ? '2.5px solid #ef4444' : '2.5px solid transparent',
                        textShadow: active ? '0 0 12px rgba(239,68,68,0.7)' : 'none',
                        letterSpacing: active ? '0.01em' : 'normal',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable tab contents */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '100%', minWidth: 0 }}>
              {dbDetailTab === 'schema' && (
                <div>
                  {/* Search Bar for Schema */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', opacity: 0.7 }} />
                      <input
                        type="text"
                        placeholder="Search tables, columns, types..."
                        value={dbSearchQuery}
                        onChange={(e) => setDbSearchQuery(e.target.value)}
                        style={{ paddingLeft: '34px', fontSize: '0.82rem', height: '36px' }}
                      />
                    </div>
                  </div>

                  {loadingSchema ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '20px' }}>
                      <RefreshCw size={20} className="spin-anim" />
                      <span>Loading table structural metadata...</span>
                    </div>
                  ) : schemaError ? (
                    <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      ❌ {schemaError}
                    </div>
                  ) : filteredSchema.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                      No tables found matching "{dbSearchQuery}".
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {filteredSchema.map(tbl => {
                        const isExpanded = !!expandedTables[tbl.table];
                        const isAltering = alteringTable === tbl.table;
                        return (
                          <div 
                            key={tbl.table} 
                            style={{ 
                              border: isExpanded ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--glass-border)', 
                              borderRadius: '8px', 
                              backgroundColor: isExpanded ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.2)',
                              boxShadow: isExpanded ? '0 4px 20px rgba(244, 63, 94, 0.08)' : 'none',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {/* Table Header Row */}
                            <div 
                              onClick={() => toggleTableExpand(tbl.table)}
                              style={{ 
                                padding: '14px 18px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                cursor: 'pointer',
                                background: isExpanded 
                                  ? 'linear-gradient(90deg, rgba(225, 29, 72, 0.16) 0%, rgba(159, 18, 57, 0.05) 100%)' 
                                  : 'transparent',
                                borderBottom: isExpanded ? '1px solid rgba(244, 63, 94, 0.25)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {isExpanded ? <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />}
                                <Database size={16} style={{ color: '#fb7185' }} />
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tbl.table}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.8 }}>({tbl.columns.length} columns)</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, marginLeft: '8px' }}>
                                  {isExpanded ? 'Click to Collapse group' : 'Click to expand group'}
                                </span>
                              </div>

                              {/* Table Level Actions (Drop & Query) */}
                              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setQuerySql(`SELECT * FROM \`${tbl.table}\` LIMIT 50;`);
                                    setDbDetailTab('query');
                                    handleExecuteQuery(`SELECT * FROM \`${tbl.table}\` LIMIT 50;`);
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', height: '26px' }}
                                >
                                  Query Table
                                </button>
                                <button
                                  onClick={() => setAlteringTable(isAltering ? null : tbl.table)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', height: '26px', border: isAltering ? '1px solid #fb7185' : '1px solid var(--glass-border)' }}
                                  disabled={isViewer}
                                >
                                  {isAltering ? 'Close Design' : 'Add Column'}
                                </button>
                                <button
                                  onClick={() => handleDropTable(tbl.table)}
                                  style={{
                                    border: 'none',
                                    background: isViewer ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--error)',
                                    borderRadius: '6px',
                                    width: '26px',
                                    height: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: isViewer ? 'not-allowed' : 'pointer',
                                    opacity: isViewer ? 0.4 : 1
                                  }}
                                  disabled={isViewer}
                                  title={isViewer ? "Drop Table (Viewer is read-only)" : "Drop Table"}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* visual alter column form */}
                            {isAltering && (
                              <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.03)', borderBottom: '1px solid var(--divider)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Attribute/Column Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. status"
                                    value={alterNewColName}
                                    onChange={(e) => setAlterNewColName(e.target.value)}
                                    style={{ fontSize: '0.78rem', height: '28px', padding: '4px 8px' }}
                                    disabled={isViewer}
                                  />
                                </div>
                                <div style={{ width: '150px' }}>
                                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>DataType</label>
                                  <select
                                    value={alterNewColType}
                                    onChange={(e) => setAlterNewColType(e.target.value)}
                                    style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.78rem', height: '28px', outline: 'none' }}
                                    disabled={isViewer}
                                  >
                                    <option value="INT" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>INT (Number)</option>
                                    <option value="VARCHAR(255)" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>VARCHAR(255) (Text)</option>
                                    <option value="TEXT" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>TEXT (Long Text)</option>
                                    <option value="BOOLEAN" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>BOOLEAN (True/False)</option>
                                    <option value="DATETIME" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>DATETIME</option>
                                    <option value="DECIMAL(10,2)" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>DECIMAL(10,2) (Currency)</option>
                                  </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '28px' }}>
                                  <input
                                    type="checkbox"
                                    id={`nullable-${tbl.table}`}
                                    checked={alterNewColNullable}
                                    onChange={(e) => setAlterNewColNullable(e.target.checked)}
                                    style={{ width: '14px', height: '14px', margin: 0 }}
                                    disabled={isViewer}
                                  />
                                  <label htmlFor={`nullable-${tbl.table}`} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: isViewer ? 'not-allowed' : 'pointer' }}>Nullable</label>
                                </div>
                                <button
                                  onClick={() => handleAddColumn(tbl.table)}
                                  className="btn-primary"
                                  style={{ padding: '0 12px', fontSize: '0.74rem', height: '28px' }}
                                  disabled={isViewer || !alterNewColName.trim()}
                                >
                                  Add Attribute
                                </button>
                              </div>
                            )}

                            {/* Table Schema Columns Grid */}
                            {isExpanded && (
                              <div style={{ padding: '8px 0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-primary)' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.8rem', fontWeight: 600 }}>
                                      <th style={{ padding: '10px 20px', color: 'var(--text-primary)' }}>Column Name</th>
                                      <th style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Type</th>
                                      <th style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Null</th>
                                      <th style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Key</th>
                                      <th style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Default</th>
                                      <th style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Extra</th>
                                      <th style={{ padding: '10px 20px', color: 'var(--text-primary)', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tbl.columns.map((col: any) => {
                                      const isPk = col.key === 'PRI';
                                      return (
                                        <tr key={col.name} className="schema-row" style={{ borderBottom: '1px solid var(--divider)', fontSize: '0.82rem' }}>
                                          <td className="schema-col-name" style={{ padding: '10px 20px', fontWeight: isPk ? 700 : 500, color: isPk ? '#fda4af' : 'var(--text-primary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              {col.name}
                                              {isPk && <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px', background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.4)', color: '#fda4af' }}>PK</span>}
                                            </div>
                                          </td>
                                          <td className="schema-col-type" style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#cbd5e1' }}>{col.type}</td>
                                          <td className="schema-col-null" style={{ padding: '10px 12px', color: col.nullable === 'YES' ? 'var(--success)' : '#cbd5e1' }}>{col.nullable}</td>
                                          <td className="schema-col-key" style={{ padding: '10px 12px', color: '#fda4af', fontWeight: 600 }}>{col.key || '-'}</td>
                                          <td className="schema-col-default" style={{ padding: '10px 12px', color: '#cbd5e1' }}>{col.default === null ? 'NULL' : col.default}</td>
                                          <td className="schema-col-extra" style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#cbd5e1' }}>{col.extra || '-'}</td>
                                          <td className="schema-col-action" style={{ padding: '10px 20px', textAlign: 'right' }}>
                                            {!isPk && (
                                              <button
                                                onClick={() => handleDropColumn(tbl.table, col.name)}
                                                className="btn-secondary"
                                                style={{
                                                  padding: '2px 6px',
                                                  fontSize: '0.7rem',
                                                  borderColor: 'rgba(239, 68, 68, 0.2)',
                                                  color: 'var(--error)',
                                                  backgroundColor: 'rgba(239, 68, 68, 0.02)',
                                                  cursor: isViewer ? 'not-allowed' : 'pointer',
                                                  opacity: isViewer ? 0.4 : 1
                                                }}
                                                disabled={isViewer}
                                                title={isViewer ? "Drop Column (Viewer is read-only)" : "Drop Column"}
                                              >
                                                Drop
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {dbDetailTab === 'query' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', maxWidth: '100%', minWidth: 0 }}>
                  {/* Console SQL editor */}
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SQL Query Console</span>
                        {isViewer && (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#f59e0b',
                            background: 'rgba(245, 158, 11, 0.12)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}>
                            ⚠️ Read-only console
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setQuerySql('')}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.74rem', height: '26px' }}
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleExecuteQuery(querySql)}
                          className="btn-primary"
                          disabled={isViewer || queryExecuting || !querySql.trim()}
                          style={{ padding: '4px 12px', fontSize: '0.74rem', height: '26px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {queryExecuting ? <RefreshCw size={12} className="spin-anim" /> : <Play size={12} />}
                          Execute (Ctrl+Enter)
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={querySql}
                      onChange={(e) => setQuerySql(e.target.value)}
                      placeholder="SELECT * FROM `users` WHERE `active` = 1 ORDER BY `id` DESC LIMIT 100;"
                      wrap="off"
                      style={{
                        width: '100%',
                        height: '120px',
                        padding: '16px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        outline: 'none',
                        overflowX: 'auto',
                        whiteSpace: 'pre'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleExecuteQuery(querySql);
                        }
                      }}
                    />
                  </div>

                  {/* Errors / Success alerts */}
                  {queryError && (
                    <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      ❌ Query Error: {queryError}
                    </div>
                  )}

                  {/* Results Grid */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '220px', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {queryResult ? `Result Payload (${queryResult.rows.length} rows in ${queryResult.execTimeMs}ms)` : 'Query Output Grid'}
                      </span>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: queryResult ? 0 : '24px' }}>
                      {!queryResult ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                          <Play size={24} style={{ opacity: 0.3 }} />
                          <span>Console is idle. Type a query above and execute.</span>
                        </div>
                      ) : queryResult.rows.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', padding: '24px', fontSize: '0.82rem' }}>
                          Query executed successfully. Empty set returned (0 rows affected).
                        </div>
                      ) : (
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', color: 'var(--text-primary)' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid var(--divider)', fontSize: '0.8rem', position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1, fontWeight: 600 }}>
                                <th style={{ padding: '10px 12px', width: '50px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Actions</th>
                                {queryResult.fields.map((field: string) => (
                                  <th key={field} style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{field}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.rows.map((row: any, idx: number) => {
                                return (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--divider)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                    {/* Action Cell (Delete Row) */}
                                    {(() => {
                                      const tableName = getTableNameFromQuery(querySql);
                                      if (!tableName) return <td style={{ padding: '8px 12px' }}>-</td>;
                                      
                                      const tblSchema = databaseSchema.find(t => t.table === tableName);
                                      const pkCol = tblSchema?.columns.find((c: any) => c.key === 'PRI')?.name;

                                      return (
                                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                          <button
                                            onClick={async () => {
                                              if (isViewer) return;
                                              let deleteSql = '';
                                              let confirmMsg = '';
                                              if (pkCol) {
                                                const pkVal = row[pkCol];
                                                confirmMsg = `Are you sure you want to delete this row where ${pkCol} = '${pkVal}'?`;
                                                deleteSql = `DELETE FROM \`${tableName}\` WHERE \`${pkCol}\` = ${typeof pkVal === 'number' ? pkVal : `'${String(pkVal).replace(/'/g, "\\'")}'`};`;
                                              } else {
                                                confirmMsg = `This table has no primary key. Are you sure you want to delete this row by matching all column values?`;
                                                const conditions = queryResult.fields.map((field: string) => {
                                                  const val = row[field];
                                                  if (val === null) {
                                                    return `\`${field}\` IS NULL`;
                                                  } else if (typeof val === 'number') {
                                                    return `\`${field}\` = ${val}`;
                                                  } else {
                                                    return `\`${field}\` = '${String(val).replace(/'/g, "\\'")}'`;
                                                  }
                                                });
                                                deleteSql = `DELETE FROM \`${tableName}\` WHERE ${conditions.join(' AND ')} LIMIT 1;`;
                                              }

                                              setConfirmDialog({
                                                isOpen: true,
                                                title: 'Delete Database Row (Destructive Action)',
                                                message: confirmMsg,
                                                confirmLabel: 'Delete Row',
                                                cancelLabel: 'Cancel',
                                                type: 'danger',
                                                onConfirm: async () => {
                                                  try {
                                                    const deleteRes = await fetch(`${API_BASE}/apps/execute-query`, {
                                                      method: 'POST',
                                                      headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}`
                                                      },
                                                      body: JSON.stringify({
                                                        serverName: selectedDbServer.name,
                                                        dbName: selectedDatabase.name,
                                                        query: deleteSql
                                                      })
                                                    });
                                                    const deleteData = await deleteRes.json();
                                                    if (deleteRes.ok && deleteData.success) {
                                                      // Re-execute SELECT
                                                      handleExecuteQuery(querySql);
                                                    } else {
                                                      alert(`Failed to delete row: ${deleteData.message || 'Unknown error'}`);
                                                    }
                                                  } catch (e: any) {
                                                    alert(`Error deleting row: ${e.message}`);
                                                  }
                                                }
                                              });
                                            }}
                                            style={{
                                              border: 'none',
                                              background: 'none',
                                              cursor: isViewer ? 'not-allowed' : 'pointer',
                                              padding: 0,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              opacity: isViewer ? 0.4 : 1
                                            }}
                                            disabled={isViewer}
                                            title={isViewer ? "Delete Row (Viewer is read-only)" : "Delete Row"}
                                          >
                                            <Trash2 size={12} style={{ color: 'var(--error)' }} />
                                          </button>
                                        </td>
                                      );
                                    })()}
                                    
                                    {queryResult.fields.map((field: string) => {
                                      const val = row[field];
                                      return (
                                        <td key={field} style={{ padding: '10px 12px', fontSize: '0.82rem', fontFamily: 'monospace', color: val === null ? '#64748b' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                          {val === null ? 'NULL' : String(val)}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {dbDetailTab === 'create-table' && (
                <div style={{ maxWidth: '640px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Create Database Table visually</h3>
                  {createTableError && <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>❌ {createTableError}</div>}
                  
                  <form onSubmit={handleCreateTable}>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Table Name</label>
                        <input
                          type="text"
                          placeholder="e.g. products"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          required
                          style={{ height: '34px' }}
                          disabled={isViewer}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Column Attributes Schema</label>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {tableColumns.map((col, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder="name"
                                value={col.name}
                                onChange={(e) => {
                                  const updated = [...tableColumns];
                                  updated[idx].name = e.target.value;
                                  setTableColumns(updated);
                                }}
                                required
                                style={{ flex: 1, height: '30px', fontSize: '0.78rem', padding: '4px 8px' }}
                                disabled={isViewer || col.isPrimary}
                              />
                              <select
                                value={col.type}
                                onChange={(e) => {
                                  const updated = [...tableColumns];
                                  updated[idx].type = e.target.value;
                                  setTableColumns(updated);
                                }}
                                style={{ width: '130px', height: '30px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
                                disabled={isViewer || col.isPrimary}
                              >
                                <option value="INT" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>INT</option>
                                <option value="VARCHAR(255)" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>VARCHAR(255)</option>
                                <option value="TEXT" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>TEXT</option>
                                <option value="BOOLEAN" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>BOOLEAN</option>
                                <option value="DATETIME" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>DATETIME</option>
                              </select>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="checkbox"
                                  id={`nullable-col-${idx}`}
                                  checked={col.nullable}
                                  onChange={(e) => {
                                    const updated = [...tableColumns];
                                    updated[idx].nullable = e.target.checked;
                                    setTableColumns(updated);
                                  }}
                                  style={{ width: '14px', height: '14px', margin: 0 }}
                                  disabled={isViewer || col.isPrimary}
                                />
                                <label htmlFor={`nullable-col-${idx}`} style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', cursor: (isViewer || col.isPrimary) ? 'not-allowed' : 'pointer' }}>Null</label>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTableColumns(prev => prev.filter((_, cIdx) => cIdx !== idx));
                                }}
                                style={{
                                  border: 'none',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: 'var(--error)',
                                  borderRadius: '6px',
                                  width: '30px',
                                  height: '30px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: (isViewer || col.isPrimary) ? 'not-allowed' : 'pointer',
                                  opacity: (isViewer || col.isPrimary) ? 0.4 : 1
                                }}
                                disabled={isViewer || col.isPrimary}
                              >
                                <Minus size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTableColumns(prev => [...prev, { name: '', type: 'VARCHAR(255)', nullable: true, isPrimary: false, extra: '' }]);
                          }}
                          className="btn-secondary"
                          style={{ marginTop: '10px', height: '28px', fontSize: '0.74rem', padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          disabled={isViewer}
                        >
                          <Plus size={12} /> Add Attribute
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isViewer || creatingTable || !newTableName.trim()}
                        style={{ height: '36px', marginTop: '8px' }}
                      >
                        {creatingTable ? 'Creating visual table schema...' : 'Create Table'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {dbDetailTab === 'connect' && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Natively-Isolated Connection Snippets</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '18px', lineHeight: '1.5' }}>
                    Because the database uses target virtual networks natively, code connections must run inside the virtual network or use security groups. Copy connection setups below:
                  </p>

                  <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--divider)', marginBottom: '16px' }}>
                    {['cli', 'node', 'python', 'php'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setConnectCodeTab(tab as any)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          border: 'none',
                          background: connectCodeTab === tab ? 'var(--bg-primary)' : 'transparent',
                          borderTopLeftRadius: '6px',
                          borderTopRightRadius: '6px',
                          color: connectCodeTab === tab ? '#fb7185' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          borderBottom: connectCodeTab === tab ? '2px solid #fb7185' : 'none'
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', border: '1px solid var(--glass-border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', padding: '16px' }}>
                    <button
                      onClick={() => {
                        const code = connectCodeTab === 'cli'
                          ? `mysql -h ${selectedDbServer.host} -u estevia_db_user -p --ssl-mode=REQUIRED ${selectedDatabase.name}`
                          : connectCodeTab === 'node'
                          ? `const mysql = require('mysql2/promise');\n\nconst pool = mysql.createPool({\n  host: '${selectedDbServer.host}',\n  user: 'estevia_db_user',\n  password: process.env.DB_PASSWORD,\n  database: '${selectedDatabase.name}',\n  ssl: {\n    rejectUnauthorized: true\n  }\n});`
                          : connectCodeTab === 'python'
                          ? `import pymysql\n\nconn = pymysql.connect(\n    host='${selectedDbServer.host}',\n    user='estevia_db_user',\n    password=db_password,\n    database='${selectedDatabase.name}',\n    ssl={'ca': '/path/to/DigiCertGlobalRootG2.crt.pem'}\n)`
                          : `<?php\n$conn = mysqli_init();\nmysqli_ssl_set($conn, NULL, NULL, "/path/to/DigiCertGlobalRootG2.crt.pem", NULL, NULL);\nmysqli_real_connect($conn, '${selectedDbServer.host}', 'estevia_db_user', $password, '${selectedDatabase.name}', 3306, NULL, MYSQLI_CLIENT_SSL);`;
                        copyToClipboard(code);
                      }}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedText ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                      {copiedText ? 'Copied!' : 'Copy'}
                    </button>

                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-primary)', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {connectCodeTab === 'cli' && (
                        <code>mysql -h {selectedDbServer.host} -u estevia_db_user -p --ssl-mode=REQUIRED {selectedDatabase.name}</code>
                      )}
                      {connectCodeTab === 'node' && (
                        <code>{`const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '${selectedDbServer.host}',
  user: 'estevia_db_user',
  password: process.env.DB_PASSWORD,
  database: '${selectedDatabase.name}',
  ssl: {
    rejectUnauthorized: true
  }
});`}</code>
                      )}
                      {connectCodeTab === 'python' && (
                        <code>{`import pymysql

conn = pymysql.connect(
    host='${selectedDbServer.host}',
    user='estevia_db_user',
    password=db_password,
    database='${selectedDatabase.name}',
    ssl={'ca': '/path/to/DigiCertGlobalRootG2.crt.pem'}
)`}</code>
                      )}
                      {connectCodeTab === 'php' && (
                        <code>{`<?php
$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, "/path/to/DigiCertGlobalRootG2.crt.pem", NULL, NULL);
mysqli_real_connect($conn, '${selectedDbServer.host}', 'estevia_db_user', $password, '${selectedDatabase.name}', 3306, NULL, MYSQLI_CLIENT_SSL);`}</code>
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {dbDetailTab === 'erd' && (
                <ErdVisualizer 
                  API_BASE={API_BASE} 
                  theme={theme} 
                  selectedDbServer={selectedDbServer}
                  selectedDatabase={selectedDatabase}
                />
              )}

              {dbDetailTab === 'compare' && (
                <CompareMigrateWizard 
                  API_BASE={API_BASE} 
                  theme={theme} 
                  selectedDbServer={selectedDbServer}
                  selectedDatabase={selectedDatabase}
                  databases={databases}
                  dbServers={dbServers}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
