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
    let apiBase = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_DEVOPS_API_URL as string) || 'http://localhost:5001';
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
      {/* Search & Filter Header Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--bg-card, var(--bg-secondary, #ffffff))',
        border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))',
        borderRadius: '12px',
        padding: '18px 24px',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', margin: '0 0 4px 0', fontFamily: 'Space Grotesk' }}>
              EvaOps Infrastructure & Pipeline Email Catalog
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #475569)' }}>
              Master directory showing target recipients and trigger conditions for EvaOps DevOps transactional templates.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)' }} />
              <input
                type="text"
                placeholder="Search templates, recipients, triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(148, 163, 184, 0.3))',
                  backgroundColor: 'var(--bg-input, var(--bg-primary, #ffffff))',
                  color: 'var(--text-primary, #0f172a)',
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
                border: '1px solid var(--border-color, rgba(148, 163, 184, 0.3))',
                backgroundColor: 'var(--bg-card, var(--bg-secondary, #f8fafc))',
                color: 'var(--text-primary, #0f172a)',
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
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary, #64748b)', fontSize: '13px' }}>
          Loading email templates catalog...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-card, var(--bg-secondary, #ffffff))', border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))', borderRadius: '12px', color: 'var(--text-secondary, #64748b)', fontSize: '13px' }}>
          No email templates found matching filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', minHeight: '600px' }}>
          {/* Master Column: Scrollable Template List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: 'var(--bg-card, var(--bg-secondary, #ffffff))',
            border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))',
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
                    border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card, var(--bg-secondary, #ffffff))',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: isSelected ? '#10b981' : 'var(--text-primary, #0f172a)' }}>
                      {tmpl.name}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '10px', backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      EvaOps
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Subject: <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{tmpl.subject}</strong>
                  </div>

                  {/* Target Recipient & Trigger Badge Strip */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-blue, #0284c7)' }}>
                      <Target size={12} />
                      <span><strong>Target Recipient:</strong> {tmpl.recipient || 'DevOps Admin'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-amber, #d97706)' }}>
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
            backgroundColor: 'var(--bg-card, var(--bg-secondary, #ffffff))',
            border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {activeSplitTemplate ? (
              <>
                {/* Header Action Strip */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-card, var(--bg-secondary, #f8fafc))',
                  borderBottom: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary, #0f172a)', margin: '0 0 2px 0' }}>
                        {activeSplitTemplate.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)' }}>
                        Module: <strong>{activeSplitTemplate.productName || 'EvaOps'}</strong> ({activeSplitTemplate.category})
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
                          border: '1px solid var(--border-color, rgba(148, 163, 184, 0.3))',
                          backgroundColor: 'var(--bg-input, var(--bg-primary, #ffffff))',
                          color: 'var(--text-primary, #0f172a)',
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
                    backgroundColor: 'var(--bg-card, var(--bg-tertiary, #f1f5f9))',
                    border: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
                    borderRadius: '8px',
                    padding: '10px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Target size={14} style={{ color: 'var(--accent-blue, #0284c7)', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-blue, #0284c7)', display: 'block' }}>Target Recipient</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-primary, #0f172a)', fontWeight: '600' }}>{activeSplitTemplate.recipient || 'DevOps Admin'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Zap size={14} style={{ color: 'var(--accent-amber, #d97706)', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-amber, #d97706)', display: 'block' }}>Trigger Condition</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-primary, #0f172a)', fontWeight: '600' }}>{activeSplitTemplate.trigger || 'Telemetry Event'}</span>
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
                <div style={{ flex: 1, backgroundColor: 'var(--bg-card, #ffffff)', padding: '16px' }}>
                  {loadingSplitHtml ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary, #64748b)', fontSize: '13px' }}>
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
                        backgroundColor: '#ffffff'
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary, #64748b)', fontSize: '13px' }}>
                Select a template from the left list to view live compiled HTML layout.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
