import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Target 1: Hoisted helpers insertion point
const target1 = `          const sortedEvents = [...filteredEvents].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return eventSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>`;

const replacement1 = `          const sortedEvents = [...filteredEvents].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return eventSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
          });

          // Grouping helper functions
          const getLocalDateString = (isoString: string) => {
            try {
              const date = new Date(isoString);
              return date.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            } catch (e) {
              return 'Earlier';
            }
          };

          const getCategoryGroupName = (type: string) => {
            switch (type) {
              case 'build': return 'Build Pipelines';
              case 'power': return 'Power Controls';
              case 'scan': return 'Cloud Security Scans';
              case 'credential': return 'Credentials Check';
              case 'audit': return 'Security Audit Logs';
              default: return 'General Operations';
            }
          };

          const renderEventCard = (event: EventLog, isFlatList: boolean) => {
            const timestampText = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const getCategoryConfig = (type: string, status: string) => {
              const colors: Record<string, { border: string; text: string; bg: string }> = {
                success: { border: '#22c55e', text: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
                failed: { border: '#ef4444', text: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
                warning: { border: '#f59e0b', text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
                info: { border: '#3b82f6', text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' }
              };
              const state = colors[status] || colors.info;

              let icon = <Terminal size={12} />;
              if (type === 'build') icon = <GitBranch size={12} />;
              if (type === 'power') icon = <Sliders size={12} />;
              if (type === 'scan') icon = <Server size={12} />;
              if (type === 'credential') icon = <ShieldCheck size={12} />;
              if (type === 'audit') icon = <ShieldCheck size={12} />;

              return { state, icon };
            };

            const { state, icon } = getCategoryConfig(event.type, event.status);
            const isLatestEvent = unifiedEvents[0]?.id === event.id;
            const isCardExpanded = expandedEventId === event.id;
            const dotLeft = isFlatList ? '-31px' : '-79px';

            return (
              <div
                key={event.id}
                className="event-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: theme === 'light' ? 'rgba(0,0,0,0.005)' : 'rgba(255,255,255,0.005)',
                  border: '1px solid var(--glass-border)',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedEventId(isCardExpanded ? null : event.id)}
              >
                <div style={{
                  position: 'absolute',
                  left: dotLeft,
                  top: '25px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: state.border,
                  border: '2px solid var(--bg-primary)',
                  zIndex: 2,
                  animation: isLatestEvent ? 'pulse-node 2s infinite ease-in-out' : 'none',
                  boxShadow: isLatestEvent ? '0 0 8px ' + state.border : 'none'
                }} />

                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  backgroundColor: state.border,
                  borderRadius: '3px 0 0 3px'
                }} />

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: state.bg,
                    color: state.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(' + (state.border === '#22c55e' ? '34,197,94' : state.border === '#ef4444' ? '239,68,68' : state.border === '#f59e0b' ? '245,158,11' : '59,130,246') + ', 0.15)'
                  }}>
                    {icon}
                  </div>

                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                        {event.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {event.message}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {timestampText}
                      </span>
                      {isCardExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                  </div>
                </div>

                {isCardExpanded && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      borderTop: '1px solid var(--glass-border)',
                      paddingTop: '14px',
                      marginTop: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 750,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: event.type === 'audit' 
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))' 
                          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15))',
                        border: event.type === 'audit'
                          ? '1px solid rgba(139, 92, 246, 0.3)'
                          : '1px solid rgba(16, 185, 129, 0.3)',
                        color: event.type === 'audit' ? '#c084fc' : 'var(--accent-teal)'
                      }}>
                        {event.type === 'audit' ? 'Security Audit Trail' : 'Local System Feed'}
                      </span>
                    </div>

                    {event.type === 'audit' ? (
                      <>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid var(--glass-border)',
                          fontSize: '0.76rem'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Actor Email</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.actorEmail}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Target Entity</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{event.target}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Request Endpoint</span>
                            {(() => {
                              const method = event.details?.method || 'POST';
                              const path = event.details?.path || '/';
                              const methodColor = method === 'DELETE' ? '#ef4444' : method === 'PUT' ? '#fb923c' : method === 'GET' ? '#3b82f6' : '#10b981';
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                                  <span style={{
                                    fontSize: '0.58rem',
                                    fontWeight: 800,
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid ' + methodColor,
                                    color: methodColor
                                  }}>
                                    {method}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{path}</span>
                                </div>
                              );
                            })()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 650 }}>Source IP Address</span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{event.details?.ip || 'Unknown'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              <Terminal size={11} style={{ color: 'var(--accent-purple)' }} />
                              <span>Request Body Payload & Parameters</span>
                            </div>
                            <CopyButton text={JSON.stringify(event.details?.payload || event.details?.query || event.details || {}, null, 2)} />
                          </div>
                          <pre style={{
                            margin: 0,
                            background: '#020617',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--glass-border)',
                            maxHeight: '180px',
                            overflowY: 'auto'
                          }}>
                            {JSON.stringify(event.details?.payload || event.details?.query || event.details || {}, null, 2)}
                          </pre>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                          <span>Category: <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{event.type}</strong></span>
                          <span>Status: <strong style={{ color: event.status === 'success' ? 'var(--success)' : 'var(--error)' }}>{event.status}</strong></span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>System Diagnostics Context</span>
                            <CopyButton text={JSON.stringify({ eventId: event.id, timestamp: event.timestamp, title: event.title, status: event.status, message: event.message }, null, 2)} />
                          </div>
                          <pre style={{
                            margin: 0,
                            background: '#020617',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--glass-border)',
                            maxHeight: '120px',
                            overflowY: 'auto'
                          }}>
                            {JSON.stringify({
                              eventId: event.id,
                              timestamp: event.timestamp,
                              title: event.title,
                              message: event.message,
                              status: event.status
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          };

          const groupedEvents: Record<string, Record<string, EventLog[]>> = {};
          sortedEvents.forEach(e => {
            const dateKey = getLocalDateString(e.timestamp);
            const categoryKey = getCategoryGroupName(e.type);

            if (eventGroupingMode === 'date') {
              if (!groupedEvents[dateKey]) groupedEvents[dateKey] = {};
              if (!groupedEvents[dateKey][categoryKey]) groupedEvents[dateKey][categoryKey] = [];
              groupedEvents[dateKey][categoryKey].push(e);
            } else {
              if (!groupedEvents[categoryKey]) groupedEvents[categoryKey] = {};
              if (!groupedEvents[categoryKey][dateKey]) groupedEvents[categoryKey][dateKey] = [];
              groupedEvents[categoryKey][dateKey].push(e);
            }
          });

          // Sort Level 1 groups
          const sortedL1Keys = Object.keys(groupedEvents).sort((a, b) => {
            if (eventGroupingMode === 'date') {
              const getFirstTimestamp = (key: string) => {
                const cats = groupedEvents[key];
                const firstCatKey = Object.keys(cats)[0];
                return cats[firstCatKey]?.[0]?.timestamp ? new Date(cats[firstCatKey][0].timestamp).getTime() : 0;
              };
              return eventSortOrder === 'desc' 
                ? getFirstTimestamp(b) - getFirstTimestamp(a)
                : getFirstTimestamp(a) - getFirstTimestamp(b);
            } else {
              return eventSortOrder === 'desc' ? a.localeCompare(b) : b.localeCompare(a);
            }
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>`;

fs.writeFileSync(filePath, content, 'utf-8');
console.log("TypeScript types applied successfully!");
