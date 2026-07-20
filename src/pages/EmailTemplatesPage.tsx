import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Send, Target, Zap } from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  templateName: string;
  appId: string;
  productName: string;
  category: string;
  subject: string;
  description: string;
  recipient?: string;
  trigger?: string;
  sampleData: Record<string, string>;
}

export const EmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Split View Master Detail State
  const [activeSplitTemplate, setActiveSplitTemplate] = useState<TemplateItem | null>(null);
  const [splitHtml, setSplitHtml] = useState<string>('');
  const [loadingSplitHtml, setLoadingSplitHtml] = useState<boolean>(false);

  // Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [testStatusMessage, setTestStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const getDevOpsEndpoint = (path: string) => {
    let apiBase = (import.meta.env.VITE_DEVOPS_API_URL as string) || 'http://localhost:5005';
    apiBase = apiBase.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${apiBase}/api/devops/email-templates${cleanPath}`;
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(getDevOpsEndpoint('/'));
      const data = await res.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
        if (data.templates.length > 0 && !activeSplitTemplate) {
          loadSplitPreview(data.templates[0]);
        }
      }
    } catch (err) {
      console.error('[EvaOps Console] Failed to fetch EvaOps email templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const loadSplitPreview = async (tmpl: TemplateItem) => {
    setActiveSplitTemplate(tmpl);
    setLoadingSplitHtml(true);
    setTestStatusMessage(null);
    try {
      const res = await fetch(getDevOpsEndpoint(`/${tmpl.id}/preview`));
      const data = await res.json();
      if (data.success && data.html) {
        setSplitHtml(data.html);
      }
    } catch (err) {
      console.error('[EvaOps Console] Failed to load split preview:', err);
    } finally {
      setLoadingSplitHtml(false);
    }
  };

  const handleSendTestEmail = async (targetTemplate: TemplateItem | null) => {
    if (!targetTemplate || !testEmailRecipient) return;
    setSendingTest(true);
    setTestStatusMessage(null);

    try {
      const res = await fetch(getDevOpsEndpoint('/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: targetTemplate.id,
          recipientEmail: testEmailRecipient,
          customVariables: targetTemplate.sampleData
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatusMessage({ text: `Test email sent to ${testEmailRecipient}`, type: 'success' });
      } else {
        setTestStatusMessage({ text: data.message || 'Failed to send test email', type: 'error' });
      }
    } catch (err: any) {
      setTestStatusMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setSendingTest(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.recipient && t.recipient.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.trigger && t.trigger.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box', padding: '24px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '18px 24px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px 0', fontFamily: 'Space Grotesk' }}>
              EvaOps DevOps Email Catalog & Telemetry Dispatches
            </h2>
            <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
              DevOps Admin Console directory displaying Target Recipients and Trigger Conditions for all 6 EvaOps cloud operational email alerts.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search templates, recipients, triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#090d16',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={fetchTemplates}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Pane Content Area */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          Loading EvaOps email templates...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#94a3b8', fontSize: '13px' }}>
          No EvaOps email templates found matching search query.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', minHeight: '600px' }}>
          {/* Master Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '14px',
            maxHeight: '740px',
            overflowY: 'auto'
          }}>
            {filteredTemplates.map(tmpl => {
              const isSelected = activeSplitTemplate?.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => loadSplitPreview(tmpl)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #10b981' : '1px solid #1e293b',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#090d16',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: isSelected ? '#34d399' : '#ffffff' }}>
                      {tmpl.name}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#1e293b', color: '#10b981' }}>
                      EvaOps
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Subject: <strong>{tmpl.subject}</strong>
                  </div>

                  {/* Target Recipient & Trigger Badge Strip */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#38bdf8' }}>
                      <Target size={12} />
                      <span><strong>Target Recipient:</strong> {tmpl.recipient || 'DevOps Admin'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f59e0b' }}>
                      <Zap size={12} />
                      <span><strong>Trigger:</strong> {tmpl.trigger || 'Telemetry Event'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Column: Live HTML Preview Pane */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {activeSplitTemplate ? (
              <>
                {/* Header Action Strip */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#1e293b',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>
                        {activeSplitTemplate.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Module: <strong>EvaOps DevOps Platform</strong> ({activeSplitTemplate.category})
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="email"
                        placeholder="Enter test recipient email..."
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #334155',
                          backgroundColor: '#090d16',
                          color: '#ffffff',
                          fontSize: '12px',
                          width: '210px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => handleSendTestEmail(activeSplitTemplate)}
                        disabled={sendingTest || !testEmailRecipient}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: sendingTest || !testEmailRecipient ? 'not-allowed' : 'pointer',
                          opacity: sendingTest || !testEmailRecipient ? 0.6 : 1
                        }}
                      >
                        <Send size={12} />
                        <span>{sendingTest ? 'Sending...' : 'Send Test'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Recipient & Trigger Banner Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    backgroundColor: '#090d16',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Target size={14} style={{ color: '#38bdf8', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#38bdf8', display: 'block' }}>Target Recipient</span>
                        <span style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '600' }}>{activeSplitTemplate.recipient || 'DevOps Admin'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Zap size={14} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#f59e0b', display: 'block' }}>Trigger Condition</span>
                        <span style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '600' }}>{activeSplitTemplate.trigger || 'Telemetry Event'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Message Overlay */}
                {testStatusMessage && (
                  <div style={{
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: testStatusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    borderBottom: testStatusMessage.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
                    color: testStatusMessage.type === 'success' ? '#10b981' : '#ef4444'
                  }}>
                    {testStatusMessage.text}
                  </div>
                )}

                {/* Live HTML Preview IFrame */}
                <div style={{ flex: 1, backgroundColor: '#090d16', padding: '16px' }}>
                  {loadingSplitHtml ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '13px' }}>
                      Compiling live HTML layout...
                    </div>
                  ) : (
                    <iframe
                      title="Email Preview"
                      srcDoc={splitHtml}
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '520px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#090d16'
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '13px' }}>
                Select a template from the left list to view live compiled HTML layout.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
